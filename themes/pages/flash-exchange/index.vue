<template>
  <div class="exchange-container exchange-container-wrap">
    <p>闪兑</p>
    <div class="exchange-wrapper">
      <div class="exchange-container">
        <div class="select-container">
          <el-select
              style="margin-bottom: 20px;"
              id="currency-select"
              v-model="form.selectedCurrency"
              placeholder="请选择货币"
              @change="updateCurrencyChains('form')">
            <el-option
                v-for="currency in currencyMergedData"
                :key="currency.currencyId"
                :label="currency.currency[0].name"
                :value="currency.currencyId"
            />
          </el-select>
          <el-select
              id="chain-select"
              style="margin-bottom: 20px;"
              v-model="form.selectedChain"
              placeholder="请选择链">
            <el-option
                v-for="chain in form.selectedCurrencyChains"
                :key="chain.id"
                :label="chain.name"
                :value="chain.id"
            />
          </el-select>
          <!-- 输入框部分 -->
          <div class="input-container">
            <el-input
                v-model="form.inputAmount"
                placeholder="请输入金额"
                type="number"
                @input="syncInputAmount"
            />
            <span style="padding-left: 20px;">{{ selectedCurrencyNameForm }}</span>
          </div>
          <!-- 显示余额 -->
          <div class="balance-display">
            <span>可兑换余额: {{ selectedCurrencyBalanceForm }}</span>
          </div>
        </div>
      </div>
      <div class="button-container">
        <el-button @click="swapCurrencies">交换</el-button>
      </div>
      <div class="exchange-container">
        <div class="select-container">
          <el-select
              style="margin-bottom: 20px;"
              id="currency-select-to"
              v-model="form.selectedCurrencyTo"
              placeholder="请选择货币"
              @change="updateCurrencyChains('to')">
            <el-option
                v-for="currency in currencyMergedData"
                :key="currency.currencyId"
                :label="currency.currency[0].name"
                :value="currency.currencyId"
            />
          </el-select>
          <el-select
              id="chain-select-to"
              style="margin-bottom: 20px;"
              v-model="form.selectedChainTo"
              placeholder="请选择链">
            <el-option
                v-for="chain in form.selectedCurrencyChainsTo"
                :key="chain.id"
                :label="chain.name"
                :value="chain.id"
            />
          </el-select>
          <!-- 输入框部分 -->
          <div class="input-container">
            <el-input
                v-model="form.inputAmountTo"
                placeholder="请输入金额"
                type="number"
                @input="syncInputAmountTo"
            />
            <span style="padding-left: 20px;">{{ selectedCurrencyNameTo }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-button @click="dialogVisible = true" type="primary" >确认兑换</el-button>
  <!-- 创建工单对话框 -->
  <el-dialog title="兑换验证" v-model="dialogVisible">
    <el-form :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleSubmit">
      <el-form-item  v-if="activeStepId == 1" label="设置支付密码" prop="paymentPassword">
        <el-input v-model="form.paymentPassword" placeholder="设置支付密码" />
      </el-form-item>
      <el-form-item v-if="activeStepId == 2" label="身份验证器APP验证码" prop="googleCode" >
        <el-input v-model="form.googleCode" placeholder="请输入6位验证码" />
      </el-form-item>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" native-type="submit">确 定</el-button>
      </span>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import {ElForm, ElMessage} from "element-plus";
const headers = getHeader();
const { assetsApi, systemApi } = useServer();
const currencyMergedData = ref([]); // 合并后的货币数据

// 表单验证规则
const rules = {
  paymentPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
};
const  dialogVisible = ref(false);
const  activeStepId = ref(1);
// 状态合并到一个对象中
const form = ref({
  selectedCurrency: null,
  selectedChain: null,
  selectedCurrencyChains: [],
  inputAmount: '',
  selectedCurrencyTo: null,
  selectedChainTo: null,
  selectedCurrencyChainsTo: [],
  inputAmountTo: '',
  googleCode: '',
  paymentPassword: '',
  passwordToken: '',
  googleToken: '',
  optToken: '',
});
// 计算属性，获取左部分选中货币的名称
const selectedCurrencyNameForm = computed(() => {
  const selectedData = currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrency);
  return selectedData ? selectedData.currency[0].name : '';
});
// 计算属性，获取左部分选中货币的余额
const selectedCurrencyBalanceForm = computed(() => {
  const selectedData = currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrency);
  return selectedData ? selectedData.balance : 0;
});
// 计算属性，获取右部分选中货币的名称
const selectedCurrencyNameTo = computed(() => {
  const selectedData = currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyTo);
  return selectedData ? selectedData.currency[0].name : '';
});
// 获取数据的函数
const fetchData = async () => {
  try {
    const [rateResponse, assetsResponse] = await Promise.all([
      systemApi.getRate({ currency: 'CNY' }, headers),
      assetsApi.accountAssets({}, headers)
    ]);
    if (assetsResponse.code === 200) {
      const mergedData = new Map();
      const dataList = assetsResponse.data;
      if (dataList?.length) {
        dataList.forEach(item => {
          const { currencyId, currencyChain, balance, totalBalanceUsdt } = item;
          // 检查是否已存在该货币数据
          if (!mergedData.has(currencyId)) {
            mergedData.set(currencyId, {
              balance,
              totalBalanceUsdt,
              currencyId,
              currencyChain: [{ id: currencyChain, name: getCoinInfo(currencyChain)?.name }],
              currency: [{ id: currencyId, name: getCurrencyInfo(currencyId)?.name }],
            });
          } else {
            const existingData = mergedData.get(currencyId);
            if (!existingData.currencyChain.some(chain => chain.id === currencyChain)) {
              existingData.currencyChain.push({ id: currencyChain, name: getCoinInfo(currencyChain)?.name });
            }
            existingData.balance += balance;
            existingData.totalBalanceUsdt += totalBalanceUsdt;
          }
        });
        currencyMergedData.value = Array.from(mergedData.values());
        // 如果有可用的货币，自动选择第一个
        if (currencyMergedData.value.length > 0) {
          form.value.selectedCurrency = currencyMergedData.value[0].currencyId;
          updateCurrencyChains('form');
          form.value.selectedCurrencyTo = currencyMergedData.value[0].currencyId;
          updateCurrencyChains('to');
        }
      }
    } else {
      ElMessage.error(assetsResponse.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 更新链数据的函数
const updateCurrencyChains = (formType) => {
  const selectedCurrencyData = formType === 'form'
      ? currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrency)
      : currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyTo);

  if (formType === 'form') {
    form.value.selectedCurrencyChains = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChain = form.value.selectedCurrencyChains.length > 0 ? form.value.selectedCurrencyChains[0].id : null;
  } else {
    form.value.selectedCurrencyChainsTo = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChainTo = form.value.selectedCurrencyChainsTo.length > 0 ? form.value.selectedCurrencyChainsTo[0].id : null;
  }
};
// 输入框同步金额的函数
const syncInputAmount = () => {
  form.value.inputAmountTo = form.value.inputAmount;
};
const syncInputAmountTo = () => {
  form.value.inputAmount = form.value.inputAmountTo;
};
// 初始化数据
onMounted(() => {
  fetchData();
});
const swapCurrencies = () => {
  // 交换货币和链的逻辑
  const tempCurrency = form.value.selectedCurrency;
  const tempChain = form.value.selectedChain;
  form.value.selectedCurrency = form.value.selectedCurrencyTo;
  form.value.selectedChain = form.value.selectedChainTo;
  form.value.selectedCurrencyTo = tempCurrency;
  form.value.selectedChainTo = tempChain;
  const tempAmount = form.value.inputAmount;
  form.value.inputAmount = form.value.inputAmountTo;
  form.value.inputAmountTo = tempAmount;
};
// 提交
const handleSubmit = async () => {
  console.log(form.value);
  try {
    if(activeStepId.value == 1){
      let flashRes = await systemApi.assetsFlashPermission({permissionId: 6}, headers);
      if(flashRes.code == 200) {
         form.value.optToken = flashRes.data.optToken;
         let passRes = await systemApi.verifyAssetsPassword({
            assetsPassword: form.value.paymentPassword,
            optToken: flashRes.data.optToken
          }, headers);
         if(passRes.code == 200) {
           activeStepId.value = 2;
          form.value.passwordToken = passRes.data;
         }
      }
    }else{
      let googleRes = await systemApi.verifyAssetsGoogle({
        googleCode: form.value.googleCode,
        optToken: form.value.optToken
      }, headers);
      if(googleRes.code == 200) {
        headers['Assets-Password-Token'] = form.value.passwordToken;
        let falshRes = await assetsApi.fastSwapApply({
          optToken: form.value.optToken,
          outCurrencyId: form.value.selectedCurrencyTo,
          outChain: form.value.selectedChainTo,
          inCurrencyId: form.value.selectedCurrency,
          inChain: form.value.selectedChain,
          transOutAmount: form.value.inputAmountTo,
          transInAmount: form.value.inputAmount,
        }, headers);
        if(falshRes.code == 200) {
          ElMessage.success("闪兑成功，")
          dialogVisible.value = false;
        }
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {

  }


}


</script>

<style scoped>
.exchange-wrapper {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.exchange-container-wrap{
  width: 800px !important;;
  height:300px !important;
  margin-bottom: 20px !important;
}
.exchange-container {
  height: 180px;
  width: 340px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 30px;
  margin: 0 10px; /* 添加左右间距 */
}
.button-container {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.select-container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}
.input-container {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.balance-display {
  text-align: right;
  padding-top: 5px;
}
</style>