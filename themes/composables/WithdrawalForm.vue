<template>
  <div class="sub-page">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="币种" prop="currencyId">
        <el-select
            style="margin-bottom: 20px;"
            id="currency-select"
            v-model="form.currencyId"
            placeholder="请选择币种"
            @change="handleCurrencyChain">
          <el-option
              v-for="currency in currencyList"
              :key="currency.currencyId"
              :label="currency.currencyName"
              :value="currency.currencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="链" prop="currencyChainId" >
        <el-select
            v-model="form.currencyChainId"
            placeholder="请选择链">
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChainId"
              :label="chain.currencyChainName"
              :value="chain.currencyChainId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提现地址" prop="toAddress">
        <el-input
            v-model="form.toAddress"
            placeholder="请选择地址"
            readonly
            @click="dialogVisible = true"
        />
      </el-form-item>
      <el-form-item label="数量" prop="amount">
        <el-input
            v-model="form.amount"
            @input="validateInputAmount"
        ></el-input>
      </el-form-item>
      <div class="tips-wrap" v-if="props.isFlag">
        <div>可提现数量：{{ transferableAmount }} {{ form.currencyName }}</div>
        <div>费用：{{ fee }} {{ form.currencyName }}</div>
        <div>实际提现数量：{{ actualTransferAmount }} {{ form.currencyName }}</div>
      </div>
      <el-form-item label="收款备注" prop="remark">
        <el-input v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit">下一步</el-button>
    </span>
    <el-dialog title="选择地址" v-model="dialogVisible" style="width: 30%;">
      <el-table :data="addressList" style="width: 100%" @row-click="selectAddress">
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="链">
          <template #default="{ row }">
            {{ getDataInfo(row.currencyChain, 'chains')?.name }}
          </template>
        </el-table-column>
        <el-table-column label="地址" prop="address"></el-table-column>
        <el-table-column label="备注" prop="remark"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { getDataInfo } from "@/utils/formatUtils";
import { rules } from "@/utils/validationRules";
const headers = getHeader();
const dialogVisible = ref(false);
const { assetsApi, userApi } = useServer();

const currencyList = ref([]);
const currencyChainList = ref([]);
const addressList = ref([]);
const formRef = ref(null);
const transferableAmount = ref(0);
const fee = ref(0);
const actualTransferAmount = ref(0);
const props = defineProps({
  form: Object,
  isFlag: Boolean,
});

// 选择地址
const selectAddress = (item) => {
  props.form.toAddress = item.address;
  dialogVisible.value = false;
}

// 选择链
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === props.form.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    props.form.currencyChainId = currentCurrency.chains[0]?.currencyChainId;
    transferableAmount.value = currentCurrency.chains[0]?.balance;
  }
};

// 验证输入金额
const validateInputAmount = async () => {

  // 去非数字
  const value = props.form.amount;
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  props.form.amount = parseInt(sanitizedValue);
  // 将处理后的值赋回
  let res = await assetsApi.getWithdrawRateFee({
    currencyId: props.form.currencyId,
    currencyChain: props.form.currencyChainId,
    amount: props.form.amount
  }, headers);
  if (res.code === 200) {
    fee.value = res.data.fee;
    actualTransferAmount.value = props.form.amount + res.data.fee;
  }
  if (props.form.amount > actualTransferAmount.value) {
    props.form.amount = actualTransferAmount.value;
    ElMessage.warning('转入金额不能大于实际提现数量');
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    props.form.currencyChain = props.form.currencyChainId;
    props.form.withdrawalStatus = true;
    emit('update:form', { ...props.form });
  } else {
    ElMessage.error('表单验证失败');
  }
};

const emit = defineEmits(['update:form', 'close']);

// 获取资产数据
const fetchData = async () => {
  try {
    const [assetsRes, addressRes] = await Promise.all([
      assetsApi.accountAssets({}, headers),
      userApi.getFrequentlyList({}, headers)
    ])
    // 账户查询
    if (assetsRes.code === 200) {
      let dataList = assetsRes.data;
      const currencyMap = new Map();
      dataList.forEach(item => {
        if (!currencyMap.has(item.currencyId)) {
          currencyMap.set(item.currencyId, {
            currencyId: item.currencyId,
            currencyName: getDataInfo(item.currencyId, 'currencyChains')?.name,
            chains: [],
            walletAddress: item.walletAddress,
          });
        }
        currencyMap.get(item.currencyId).chains.push({
          currencyChainId: item.currencyChain,
          currencyChainName: getDataInfo(item.currencyChain, 'chains')?.name,
          walletAddress: item.walletAddress,
          balance: item.balance,
          totalBalanceUsdt: item.totalBalanceUsdt,
        });
      });
      currencyList.value = Array.from(currencyMap.values());
    } else {
      ElMessage.error(assetsRes.message);
    }

    // 常用地址查询
    if (addressRes.code === 200) {
      addressList.value = addressRes.data.filter(item => !item.lock);
    } else {
      ElMessage.error(addressRes.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
.tips-wrap {
  padding: 20px;
}
</style>
