<template>
  <div class="exchange-container exchange-container-wrap">
    <p>闪兑</p>
    <div class="exchange-wrapper">
      <div class="exchange-container">
        <div class="select-container">
          <el-select
              style="margin-bottom: 20px;"
              id="currency-select"
              v-model="form.selectedCurrencyId"
              placeholder="请选择货币"
              @change="updateCurrencyChain('form')">
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
                v-for="chain in form.selectedCurrencyChain"
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
            <span style="padding-left: 20px;">{{ form.selectedCurrency }}</span>
          </div>
          <!-- 显示余额 -->
          <div class="balance-display">
            <span>可兑换余额: {{ form.bigNumCost }}</span>
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
              v-model="form.selectedCurrencyToId"
              placeholder="请选择货币"
              @change="updateCurrencyChain('to')">
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
                v-for="chain in form.selectedCurrencyChainTo"
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
            <span style="padding-left: 20px;">{{ form.selectedCurrencyTo }}</span>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align: right;">
      <div>当前兑换汇率：{{ rateExchange.content }}</div>
      <div v-if="cost">费用：{{ cost }}</div>
    </div>
  </div>
  <el-button @click="handleValidate" type="primary" >确认兑换</el-button>
  <!-- 创建对话框 -->
  <el-dialog title="兑换验证" v-model="dialogVisible">
    <el-form :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleSubmit">
      <el-form-item  v-if="activeStepId == 1" label="设置支付密码" prop="assetsPassword">
        <el-input v-model="form.assetsPassword" type="password" placeholder="设置支付密码" />
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
  <List></List>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import {ElForm, ElMessage} from "element-plus";
import List from './detail/list.vue'
const headers = getHeader();
const { assetsApi, systemApi } = useServer();
// 处理整合数据列表
const currencyMergedData = ref([]);
const  dialogVisible = ref(false);
const  activeStepId = ref(1);
const  bindGoogleAuth = ref(false);
const  rateExchange = ref({
  content: '',
  rate: 1,
});
const cost = ref('');

// 状态合并到一个对象中
const form = ref({
  selectedCurrencyId: null,
  selectedCurrency: null,
  selectedChain: null,
  selectedCurrencyChain: [],
  inputAmount: '',
  bigNumCost: 0,

  selectedCurrencyToId: null,
  selectedCurrencyTo: null,
  selectedChainTo: null,
  selectedCurrencyChainTo: [],
  inputAmountTo: '',
  bigNumCostTo: 0,

  bindGoogleAuth: false,
  bindPassword: false,
  googleCode: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  optToken: '',
});
// 表单验证规则
const rules = {
  assetsPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
};

// 获取数据的函数
const fetchData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code === 200) {
      const mergedData = new Map();
      const dataList = res.data;
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
          form.value.selectedCurrencyId = currencyMergedData.value[0].currencyId;
          updateCurrencyChain('form');
          form.value.selectedCurrencyToId = currencyMergedData.value[0].currencyId;
          updateCurrencyChain('to');
        }
      }
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 更新链数据的函数
const updateCurrencyChain = (formType: string) => {
  // 切换清空金额内容
  form.value.inputAmountTo = '';
  form.value.inputAmount = '';
  cost.value = '';
  const selectedCurrencyData = formType === 'form'
      ? currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyId)
      : currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyToId);
  if (formType === 'form') {
    form.value.selectedCurrency = selectedCurrencyData.currency[0].name;
    form.value.bigNumCost= currencyMergedData.value[0].balance;
    form.value.selectedCurrencyChain = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChain = form.value.selectedCurrencyChain.length > 0 ? form.value.selectedCurrencyChain[0].id : null;
  } else {
    form.value.selectedCurrencyTo = selectedCurrencyData.currency[0].name;
    form.value.selectedCurrencyChainTo = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChainTo = form.value.selectedCurrencyChainTo.length > 0 ? form.value.selectedCurrencyChainTo[0].id : null;
  }
  if(form.value.selectedCurrencyId && form.value.selectedCurrencyToId){
    fetchRateExchange();
  }
};

// 获取数据的函数
const fetchRateExchange = async () => {
  try {
    // 按 ID 匹配并找到名称
    let res = await assetsApi.getRateCoin2Coin({ sourceCurrencyId: form.value.selectedCurrencyId, targetCurrencyId: form.value.selectedCurrencyToId}, headers);
    if(res.code == 200) {
      rateExchange.value.content = '1 ' + form.value.selectedCurrency + ' ≈ ' + res.data + ' ' +form.value.selectedCurrencyTo;
      rateExchange.value.rate = res.data
    }else{
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 获取数据的函数
const fastRateFee = async () => {
  try {
    let res = await assetsApi.getFastRateFee({
      currencyId: form.value.selectedCurrencyId,
      currencyChain: form.value.selectedChain,
      amount: form.value.inputAmount,
    }, headers);
    if(res.code == 200) {
      cost.value = res.data.fee + ' ' + form.value.selectedCurrency
    }else{
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 输入框同步输出金额
const syncInputAmount = () => {
  const rate = parseFloat(rateExchange.value.rate);
  const inputAmount = parseFloat(form.value.inputAmount);
  const maxInputAmount = form.value.bigNumCost;
  if (!isNaN(inputAmount) && !isNaN(rate)) {
    // 限制输入金额不超过最大值
    if (inputAmount > maxInputAmount) {
      form.value.inputAmount = maxInputAmount; // 超过最大值则设置为最大值
    }
    // 保留 8 位小数
    form.value.inputAmountTo = (inputAmount * rate).toFixed(8);
  } else {
    form.value.inputAmountTo = ''; // 如果无效输入则清空
  }
  fastRateFee();
};
// 输出框同步输入金额
const syncInputAmountTo = () => {
  const rate = parseFloat(rateExchange.value.rate);
  const inputAmountTo = parseFloat(form.value.inputAmountTo);
  if (!isNaN(inputAmountTo) && !isNaN(rate)) {
    form.value.inputAmount = (inputAmountTo / rate).toFixed(8);
  } else {
    form.value.inputAmount = '';
  }
};
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  bindGoogleAuth.value = userStore.userInfo.bindGoogleAuth;
  fetchData();
});

// 交换货币和链
const swapCurrencies = () => {
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

// 对象权限获取
const handleValidate = async () =>{
  // 验证
  let permissionRes = await systemApi.assetsFlashPermission({permissionId: 6}, headers);
  if(permissionRes.code == 200) {
    form.value.optToken = permissionRes.data.optToken;
    let verifyMethods = permissionRes.data.verifyMethods;
    form.value.bindGoogleAuth = verifyMethods.includes("GOOGLEAUTHENICATOR");
    form.value.bindPassword = verifyMethods.includes("ASSETSPASSWORD");
    // 判断如果密码不验证，直接跳到google验证吗
    if(!form.value.bindPassword){
      activeStepId.value = 2
    }
    dialogVisible.value = true;
  }
}

// 提交
const handleSubmit = async () => {
  try {
     if(activeStepId.value == 1){
      let flashRes = await systemApi.assetsFlashPermission({permissionId: 6}, headers);
      if(flashRes.code == 200) {
         form.value.optToken = flashRes.data.optToken;
         let passRes = await systemApi.verifyAssetsPassword({
            assetsPassword: form.value.assetsPassword,
            optToken: flashRes.data.optToken
          }, headers);
         if(passRes.code == 200) {
           form.value.passwordToken = passRes.data;
           if(bindGoogleAuth.value){
             activeStepId.value = 2;
           }else{
             processFunc();
           }
         }
      }
    }else if(activeStepId.value == 2){
      let googleRes = await systemApi.verifyValidateGoogle({
        googleCode: form.value.googleCode,
        optToken: form.value.optToken
      }, headers);
      if(googleRes.code == 200) {
        form.value.googleToken = googleRes.data;
        processFunc();
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}
// 执行
const processFunc = async() =>{
  headers['Assets-Password-Token'] = form.value.passwordToken;
  if(form.value.googleToken != '' && bindGoogleAuth.value){
    headers['Google-Auth-Token'] = form.value.googleToken;
  }
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

</script>

<style scoped>
.exchange-wrapper {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}
.exchange-container-wrap{
  width: 800px !important;;
  height:350px !important;
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
