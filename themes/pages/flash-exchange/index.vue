<template>
  <div class="page">
    <div class="exchange-container exchange-container-wrap">
      <p>闪兑</p>
      <div class="exchange-wrapper">
        <div class="exchange-container">
          <div class="select-container">
            <el-select
                style="margin-bottom: 20px;"
                id="currency-select-to"
                v-model="form.selectedCurrencyToId"
                placeholder="请选择货币"
                @change="updateCurrencyChain('to')">
              <el-option
                  v-for="currency in currencyList"
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
                  :class="{ 'error-input': isAmountError }"
                  v-model="form.inputAmountTo"
                  placeholder="请输入金额"
                  type="number"
                  @input="syncInputAmountTo()"
              />
              <span style="padding-left: 20px;">{{ form.selectedCurrencyTo }}</span>
            </div>
            <!-- 显示余额 -->
            <div class="balance-display">
              <span>可兑换余额: {{ form.bigNumCost }}</span>
            </div>
          </div>
        </div>
        <div class="button-container">
          <el-button @click="swapCurrencies" >交换</el-button>
        </div>
        <div class="exchange-container">
          <div class="select-container">
            <el-select
                style="margin-bottom: 20px;"
                id="currency-select"
                v-model="form.selectedCurrencyId"
                placeholder="请选择货币"
                @change="updateCurrencyChain('form')">
              <el-option
                  v-for="currency in currencyList"
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
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div>当前兑换汇率：{{ rateExchange.content }}</div>
        <div v-if="cost.amount">费用：{{ cost.content }}</div>
      </div>
    </div>
    <el-button @click="dialogCheckVisible = true" type="primary" :class="{ 'disabled-button': isAmountError}" :disabled="!form.inputAmountTo || isAmountError || isAmountSame">确认兑换</el-button>
    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="6"
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
    <List></List>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import { ElMessage} from "element-plus";
import List from './detail/list.vue'
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
const headers = getHeader();
const { assetsApi } = useServer();
// 处理整合数据列表
const currencyList = ref([]);
const dialogCheckVisible = ref(false);
const isAmountError = ref(false);
const isAmountSame = ref(false);
const rateExchange = ref({
  content: '',
  rate: 1,
});
const cost = ref({
  content: '',
  amount: 0,
});

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

  bindPassword: false,
  googleCode: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  optToken: '',
});
// 同一货币协议不能兑换
const checkAmountSame = () => {
  isAmountSame.value = (
      form.value.selectedCurrencyId === form.value.selectedCurrencyToId &&
      form.value.selectedChain === form.value.selectedChainTo
  ) ? true : false;
};
// 更新父组件的 form 数据
const updateForm = async (newForm: Object) => {
  try {
    form.value = newForm;
    dialogCheckVisible.value = false;
    if(form.value.permissionStatus){
      setHeadersAuth(headers, form);
      let res = await assetsApi.fastSwapApply({
        optToken: form.value.optToken,
        outCurrencyId: form.value.selectedCurrencyToId,
        outChain: form.value.selectedChainTo,
        inCurrencyId: form.value.selectedCurrencyId,
        inChain: form.value.selectedChain,
        transOutAmount: form.value.inputAmountTo,
        transInAmount: form.value.inputAmount,
      }, headers);
      if(res.code == 200) {
        ElMessage.success("闪兑成功")
      }else{
        ElMessage.error(res.message)
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
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
              currencyChain: [{ id: currencyChain, name: getDataInfo(currencyChain, 'chains')?.name }],
              currency: [{ id: currencyId, name: getDataInfo(currencyId, 'currencyChains')?.name,}],
            });
          } else {
            const existingData = mergedData.get(currencyId);
            if (!existingData.currencyChain.some(chain => chain.id === currencyChain)) {
              existingData.currencyChain.push({ id: currencyChain, name: getDataInfo(currencyChain, 'chains')?.name });
            }
            existingData.balance += balance;
            existingData.totalBalanceUsdt += totalBalanceUsdt;
          }
        });
        currencyList.value = Array.from(mergedData.values());
        if (currencyList.value.length > 0) {
          form.value.selectedCurrencyId = currencyList.value[0].currencyId;
          updateCurrencyChain('form');
          form.value.selectedCurrencyToId = currencyList.value[0].currencyId;
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
  cost.value = { amount: 0, content: '' };
  const selectedCurrencyData = formType === 'form'
      ? currencyList.value.find(currency => currency.currencyId === form.value.selectedCurrencyId)
      : currencyList.value.find(currency => currency.currencyId === form.value.selectedCurrencyToId);
  if (formType === 'form') {
    form.value.selectedCurrency = selectedCurrencyData.currency[0].name;
    form.value.selectedCurrencyChain = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChain = form.value.selectedCurrencyChain.length > 0 ? form.value.selectedCurrencyChain[0].id : null;
  } else {
    form.value.selectedCurrencyTo = selectedCurrencyData.currency[0].name;
    form.value.selectedCurrencyChainTo = selectedCurrencyData ? selectedCurrencyData.currencyChain : [];
    form.value.selectedChainTo = form.value.selectedCurrencyChainTo.length > 0 ? form.value.selectedCurrencyChainTo[0].id : null;
    form.value.bigNumCost = selectedCurrencyData.balance
  }
  if(form.value.selectedCurrencyId && form.value.selectedCurrencyToId){
    fetchRateExchange();
    checkAmountSame();
  }
};

// 获取数据的函数
const fetchRateExchange = async () => {
  try {
    // 按 ID 匹配并找到名称
    let res = await assetsApi.getRateCoin2Coin({ sourceCurrencyId: form.value.selectedCurrencyToId, targetCurrencyId: form.value.selectedCurrencyId}, headers);
    if(res.code == 200) {
      rateExchange.value.content = '1 ' + form.value.selectedCurrencyTo + ' ≈ ' + res.data + ' ' +form.value.selectedCurrency;
      rateExchange.value.rate = res.data
    }else{
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 手续费
const calculateAndFetchFee = async (inputAmount: number, type: number) => {
  try {
    let rate = rateExchange.value.rate;
    if (type === 1) {
      form.value.inputAmountTo = inputAmount;
      form.value.inputAmount = form.value.inputAmountTo / rate;
    } else {
      form.value.inputAmount = inputAmount;
      form.value.inputAmountTo = form.value.inputAmountTo * rate;
    }
    const feeRes = await assetsApi.getFastRateFee({ currencyId: form.value.selectedCurrencyToId, currencyChain: form.value.selectedChainTo, amount: inputAmount }, headers);
    if (feeRes.code === 200) {
      const fee = feeRes.data.fee;
      cost.value.content = `${fee} ${form.value.selectedCurrencyTo}`;
      cost.value.amount = fee;
      let maxAmount = form.value.inputAmountTo + fee;
      if (maxAmount > form.value.bigNumCost) {
        isAmountError.value = true;
      } else {
        isAmountError.value = false;
        checkAmountSame();
      }
    } else {
      ElMessage.error(feeRes.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  } finally {
  }
};

// 输入框同步输出金额
const syncInputAmount = () => {
  const inputAmount = parseFloat(form.value.inputAmount);
  if (!isNaN(inputAmount)) {
    calculateAndFetchFee(inputAmount, 2)
  } else {
    form.value.inputAmountTo = '';
  }
};

// 输出框同步输入金额
const syncInputAmountTo = () => {
  let inputAmount = parseFloat(form.value.inputAmountTo);
  if (!isNaN(inputAmount)) {
    calculateAndFetchFee(inputAmount, 1)
  }else{
    form.value.inputAmount = '';
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
});

// 交换货币和链
const swapCurrencies = async () => {
  const selectedCurrencyId = form.value.selectedCurrencyId;
  const selectedCurrency = form.value.selectedCurrency;
  const selectedChain = form.value.selectedChain;
  const selectedCurrencyChain = form.value.selectedCurrencyChain;
  form.value.selectedCurrencyId = form.value.selectedCurrencyToId;
  form.value.selectedCurrency = form.value.selectedCurrencyTo;
  form.value.selectedChain = form.value.selectedChainTo;
  form.value.selectedCurrencyChain = form.value.selectedCurrencyChainTo;
  form.value.selectedCurrencyToId = selectedCurrencyId;
  form.value.selectedCurrencyTo = selectedCurrency;
  form.value.selectedChainTo = selectedChain;
  form.value.selectedCurrencyChainTo = selectedCurrencyChain;
  form.value.inputAmount = '';
  form.value.inputAmountTo = '';
  cost.value = {
    content: '',
    amount: 0,
  };
  // 重新计算汇率
  const  selectedCurrencyData = currencyList.value.find(currency => currency.currencyId === form.value.selectedCurrencyToId)
  form.value.bigNumCost = selectedCurrencyData.balance
  fetchRateExchange();
};


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
