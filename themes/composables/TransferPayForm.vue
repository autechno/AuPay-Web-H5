<template>
  <el-dialog title="转账" v-model="props.isDialogVisible" width="500">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item
          label="币种"
          prop="currencyId"
          :rules="[{ required: true, message: '货币不能为空', trigger: 'blur' }]">
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
      <el-form-item
          label="链"
          prop="currencyChain"
          :rules="[{ required: true, message: '货币链不能为空', trigger: 'blur' }]">
        <el-select
            id="chain-select"
            v-model="form.currencyChain"
            placeholder="请选择链">
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChain"
              :label="chain.currencyChainName"
              :value="chain.currencyChain"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="amount" :rules="[{ required: true, message: '数量不能为空', trigger: 'blur' }]">
        <el-input
            v-model="form.amount"
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
      <el-button @click="emit('close')">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { getDataInfo } from "~/utils/configUtils";
const headers = getHeader();
const { assetsApi } = useServer();

const currencyList = ref([]);
const currencyChainList = ref([]);
const formRef = ref(null);
const transferableAmount = ref(0);
const fee = ref(0);
const actualTransferAmount = ref(0);


const props = defineProps({
  form: Object,
  isFlag: Boolean,
  isDialogVisible: Boolean,
});

// 表单验证规则
const rules = {
  currencyId: [
    { required: true, message: '货币不能为空', trigger: 'blur' },
  ],
  currencyChain: [
    { required: true, message: '货币链不能为空', trigger: 'blur' },
  ],
  amount: [
    { required: true, message: '数量不能为空', trigger: 'blur' },
  ],
};

// 选择链
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === props.form.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    props.form.currencyChain = currentCurrency.chains[0]?.currencyChain;
    transferableAmount.value = currentCurrency.chains[0]?.balance;
  }
};

// 验证输入金额
const validateInputAmount = async () => {
  // 去非数字
  const value = props.form.amount;
  const sanitizedValue = value.replace(/[^0-9.]/g, '');
  props.form.amount = sanitizedValue;
  if(!sanitizedValue){
    return;
  }
  let res = await assetsApi.getTransferRateFee({
    currencyId: props.form.currencyId,
    currencyChain: props.form.currencyChain,
    amount: props.form.amount
  }, headers);
  if (res.code === 200) {
    fee.value = res.data.fee;
    actualTransferAmount.value = parseFloat(props.form.amount) + res.data.fee;
  }
  if (props.form.amount > actualTransferAmount.value) {
    props.form.amount = actualTransferAmount.value; // 将输入金额限制为实际转账数量
    ElMessage.warning('转入金额不能大于实际转账数量');
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    props.form.generateQR = `/charge-withdraw/transfer/detail?qr=${props.form.transferQR}&currencyId=${props.form.currencyId}&currencyChain=${props.form.currencyChain}&amount=${props.form.amount}&remark=${props.form.remark}`;
    props.isDialogVisible = false;
    emit('update:form', { ...props.form }); // 更新父组件的 form 数据
    emit('close');
  } else {
    ElMessage.error('表单验证失败');
  }
};

const emit = defineEmits(['update:form', 'close']);

// 获取资产数据
const assetsData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code === 200) {
      let dataList = res.data;
      const currencyMap = new Map();
      dataList.forEach(item => {
        if (!currencyMap.has(item.currencyId)) {
          currencyMap.set(item.currencyId, {
            currencyId: item.currencyId,
            currencyName: getDataInfo(item.currencyId, 'currencyChains')?.name,
            chains: [],
          });
        }
        currencyMap.get(item.currencyId).chains.push({
          currencyChain: item.currencyChain,
          currencyChainName: getDataInfo(item.currencyChain, 'chains')?.name,
          balance: item.balance,
          totalBalanceUsdt: item.totalBalanceUsdt,
        });
      });
      currencyList.value = Array.from(currencyMap.values());
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  assetsData();
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
