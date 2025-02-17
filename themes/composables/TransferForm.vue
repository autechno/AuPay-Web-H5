<template>
    <el-form :model="form" :rules="rules" class="input_box" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item prop="currencyId">
        <el-select
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
      <el-form-item prop="currencyChain">
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
      <el-form-item prop="amount" >
        <el-input v-model="form.amount" type="number" placeholder="请输入数量"  />
      </el-form-item>
      <el-form-item prop="remark">
        <el-input placeholder="收款备注" v-model="form.remark"></el-input>
      </el-form-item>
      <button class="custom-button custom-button-pos" native-type="submit">完成</button>
    </el-form>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import {ElForm, ElMessage} from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { getDataInfo } from "~/utils/configUtils";
import { rules } from "@/utils/validationRules";
const headers = getHeader();
const { assetsApi } = useServer();

const currencyList = ref([]);
const currencyOriginList = ref([]);
const currencyChainList = ref([]);
const formRef = ref(null);

const props = defineProps({
  form: Object,
});

// 选择链
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === props.form.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    props.form.currencyChain = currentCurrency.chains[0]?.currencyChain;
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    const currentCurrency = currencyOriginList.value.find(currency =>
        currency.currencyId === props.form.currencyId && currency.currencyChain === props.form.currencyChain
    );
    const encodedRemark = encodeURIComponent(props.form.remark);
    props.form.generateQR = `/charge-withdraw-h5/transfer?qr=${props.form.transferQR}&assetsId=${currentCurrency.id}&amount=${props.form.amount}&remark=${encodedRemark}&isCollect=1`;
    emit('update:form', { ...props.form });
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
      currencyOriginList.value = dataList;
      if(currencyList.value){
        let currencyId = currencyList.value[0].currencyId;
        props.form.currencyId = currencyId;
        handleCurrencyChain(currencyId);
      }
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

.input_box{
  :deep(.el-input){
    width: 100%;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep(.el-select__wrapper) {
    height: 56px;
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.checkbox__label){
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error){
    padding-left: 14px;
  }
  :deep(.el-checkbox__label){
    font-weight: normal !important;
  }
}
</style>
