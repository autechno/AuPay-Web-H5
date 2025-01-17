<template>
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item label="货币" prop="currencyId">
        <el-select
            style="margin-bottom: 20px;"
            id="currency-select"
            v-model="form.currencyId"
            placeholder="请选择货币"
            @change="handleCurrencyChain">
          <el-option
              v-for="currency in currencyList"
              :key="currency.currencyId"
              :label="currency.currencyName"
              :value="currency.currencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="货币链" prop="currencyChainId" >
        <el-select
            v-model="form.currencyChainId"
            placeholder="请选择货币链">
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChainId"
              :label="chain.currencyChainName"
              :value="chain.currencyChainId"
          />
        </el-select>
      </el-form-item>

      <el-form-item  label="提现地址" prop="toAddress">
        <el-select
            v-model="form.toAddress"
            placeholder="请选择地址">
          <el-option
              v-for="address in addressList"
              :key="address.name"
              :label="address.name"
              :value="address.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数量" prop="amount">
        <el-input
            v-model.number="form.amount"
            @input="validateInputAmount"
        ></el-input>
      </el-form-item>

      <div class="tips-wrap" v-if="props.isFlag">
        <div>可转账数量：{{ transferableAmount }} {{ form.currencyName }}</div>
        <div>费用：{{ fee }} {{ form.currencyName }}</div>
        <div>实际转账数量：{{ actualTransferAmount }} {{ form.currencyName }}</div>
      </div>
      <el-form-item label="收款备注" prop="remark">
        <el-input v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleSubmit">下一步</el-button>
    </span>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
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

// 表单验证规则
const rules = {
  currencyId: [
    { required: true, message: '货币不能为空', trigger: 'blur' },
  ],
  currencyChainId: [
    { required: true, message: '货币链不能为空', trigger: 'blur' },
  ],
  toAddress: [
    { required: true, message: '地址不能为空', trigger: 'blur' },
  ],
  inputAmount: [
    { required: true, message: '数量不能为空', trigger: 'blur' },
  ],
};

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
  let res = await assetsApi.getWithdrawRateFee({
    currencyId: props.form.currencyId,
    currencyChain: props.form.currencyChainId,
    amount: props.form.amount
  }, headers);
  if (res.code === 200) {
    fee.value = res.data.fee;
    actualTransferAmount.value = props.form.amount + res.data.fee;
  }
  if (props.form.amount > transferableAmount.value) {
    props.form.amount = transferableAmount.value; // 将输入金额限制为实际转账数量
    ElMessage.warning('转入金额不能大于实际转账数量');
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    props.form.withdrawalStatus = true;
    emit('update:form', { ...props.form }); // 更新父组件的 form 数据
  } else {
    ElMessage.error('表单验证失败');
  }
};

const emit = defineEmits(['update:form', 'close']);

// 获取资产数据
const initialData = async () => {
  try {
    // 账户查询
    let resAssets = await assetsApi.accountAssets({}, headers);
    if (resAssets.code === 200) {
      let dataList = resAssets.data;
      const currencyMap = new Map();
      dataList.forEach(item => {
        if (!currencyMap.has(item.currencyId)) {
          currencyMap.set(item.currencyId, {
            currencyId: item.currencyId,
            currencyName: getCurrencyInfo(item.currencyId)?.name,
            chains: [],
            walletAddress: item.walletAddress,
          });
        }
        currencyMap.get(item.currencyId).chains.push({
          currencyChainId: item.currencyChain,
          currencyChainName: getCoinInfo(item.currencyChain)?.name,
          walletAddress: item.walletAddress,
          balance: item.balance,
          totalBalanceUsdt: item.totalBalanceUsdt,
        });
      });
      currencyList.value = Array.from(currencyMap.values());
    } else {
      ElMessage.error(resAssets.message || '查询失败');
    }

    // 常用地址查询
    const resAddress = await userApi.getFrequentlyList({}, headers);
    if (resAddress.code === 200) {
      addressList.value = resAddress.data;
    } else {
      ElMessage.error(resAddress.message || '查询失败');
    }

  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  initialData();
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
