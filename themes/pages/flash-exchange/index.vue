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
                  @input="syncInputAmountTo(false)"
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
          <el-button @click="swapCurrencies" :disabled="loading" :loading="loading">交换</el-button>
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
          </div>
        </div>
      </div>
      <div style="text-align: right;">
        <div>当前兑换汇率：{{ rateExchange.content }}</div>
        <div v-if="cost.amount">费用：{{ cost.content }}</div>
      </div>
    </div>
    <el-button @click="dialogCheckVisible = true" type="primary" >确认兑换</el-button>
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
const currencyMergedData = ref([]);
const  dialogCheckVisible = ref(false);
const  rateExchange = ref({
  content: '',
  rate: 1,
});
const cost = ref({
  content: '',
  amount: 0,
});

const loading = ref(false); // Add loading state


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

// 更新父组件的 form 数据
const updateForm = async (newForm: Object) => {
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
      ElMessage.success("闪兑成功，")
    }
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
  cost.value = { amount: 0, content: '' };
  const selectedCurrencyData = formType === 'form'
      ? currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyId)
      : currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyToId);
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
const fastRateFee = async (inputAmountTo: number, inputAmount: number, maxInputAmount: number, rate: number) => {
  try {
    const [curRes, maxRes] = await Promise.all([
      assetsApi.getFastRateFee({
        currencyId: form.value.selectedCurrencyToId, currencyChain: form.value.selectedChainTo, amount: inputAmountTo,
      }, headers),
      assetsApi.getFastRateFee({
        currencyId: form.value.selectedCurrencyToId, currencyChain: form.value.selectedChainTo, amount: maxInputAmount,
      }, headers)
    ]);
    let fee = 0;
    if(curRes.code == 200 && maxRes.code == 200) {
      let curAmount = (inputAmountTo + curRes.data.fee).toFixed(8);
      let maxAmount = (maxInputAmount - maxRes.data.fee).toFixed(8);
      if(curAmount > maxAmount){
        curAmount = maxAmount;
        fee = maxRes.data.fee;
      }else{
        fee = curRes.data.fee;
      }
      form.value.inputAmountTo = curAmount;
      cost.value.content = fee + ' ' + form.value.selectedCurrencyTo
      cost.value.amount = fee;
      console.log(curAmount)
      console.log(cost.value)
      console.log(form.value)
      form.value.inputAmount = (inputAmountTo * rate).toFixed(8);
      loading.value = false;
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
    loading.value = false;
  }
};

// 输入框同步输出金额
const syncInputAmount = () => {
  const rate = parseFloat(rateExchange.value.rate);
  const inputAmount = parseFloat(form.value.inputAmount);
  if (!isNaN(inputAmount) && !isNaN(rate)) {
    // 保留 8 位小数
    form.value.inputAmountTo = (inputAmount / rate).toFixed(8);
  } else {
    form.value.inputAmountTo = '';
  }
};
// 输出框同步输入金额
const syncInputAmountTo = (isFlag: boolean) => {
  const rate = parseFloat(rateExchange.value.rate);
  let inputAmountTo = parseFloat(form.value.inputAmountTo);
  let inputAmount = parseFloat(form.value.inputAmount);
  if(isFlag){
    inputAmountTo = parseFloat(form.value.inputAmount);
    inputAmount = parseFloat(form.value.inputAmountTo);
  }
  const maxInputAmount = form.value.bigNumCost;
  if (!isNaN(inputAmountTo) && !isNaN(rate)) {
    fastRateFee(inputAmountTo, inputAmount, maxInputAmount, rate);
  }else{
    form.value.inputAmount = '';
    loading.value = false;
  }
};
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  fetchData();
});

// 交换货币和链
const swapCurrencies = async () => {
  loading.value = true;
  const selectedCurrencyId = form.value.selectedCurrencyId;
  const selectedCurrency = form.value.selectedCurrency;
  const selectedChain = form.value.selectedChain;
  const selectedCurrencyChain = form.value.selectedCurrencyChain;
  // 重新计算金额
  form.value.selectedCurrencyId = form.value.selectedCurrencyToId;
  form.value.selectedCurrency = form.value.selectedCurrencyTo;
  form.value.selectedChain = form.value.selectedChainTo;
  form.value.selectedCurrencyChain = form.value.selectedCurrencyChainTo;

  form.value.selectedCurrencyToId = selectedCurrencyId;
  form.value.selectedCurrencyTo = selectedCurrency;
  form.value.selectedChainTo = selectedChain;
  form.value.selectedCurrencyChainTo = selectedCurrencyChain;

  await fetchRateExchange();
  setTimeout(() => {
    syncInputAmountTo(true);
  }, 200);
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
