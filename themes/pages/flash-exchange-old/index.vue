<template>
  <div class="page">
    <GoBack :showRightButton="false" />
    <div class="content">
      <div class="exchange-container" style="height: 126px;">
        <div class="title">兑出</div>
        <div class="currency">
          <input  v-model="form.inputAmountTo" placeholder="请输入金额" type="number" @input="syncInputAmountTo(false)" />
        </div>
        <el-row class="flash-btn">
          <el-col :span="8"><span>50%</span></el-col>
          <el-col :span="8"><span>100%</span></el-col>
        </el-row>
        <div class="box-wrap" @click="exchange(1)">
          <div class="img"></div>
          <div class="text-wrap">{{ form.selectedCurrencyTo }}</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
      <div class="button"><el-image :src="fx" /></div>
      <div class="exchange-container" style="height: 90px; margin-top:12px;">
        <div class="title">兑入</div>
        <div class="currency">
          <input v-model="form.inputAmount"  placeholder="请输入金额" type="number" @input="syncInputAmount"
          />
        </div>
        <div class="box-wrap" @click="exchange(2)">
          <div class="img"></div>
          <div class="text-wrap">{{ form.selectedCurrency }}</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
    </div>
    <div class="tips">
      <span>前兑换汇率：</span><span>{{ rateExchange.content }}</span>
    </div>
    <div class="tips" v-if="cost.amount">
      <span>费用：</span>
      <span>{{ cost.content }}</span>
    </div>
    <el-button class="custom-button" native-type="submit">确认</el-button>
    <el-drawer class="custom-title" v-model="drawerSearch"
               :title="title"
               :show-close="false"
               direction="btt"
               size="85%">
      <div class="sub-page">
        <div class="search-wrap">
          <el-icon class="arrow" size="26"><Search /></el-icon>
          <input v-model="searchText" placeholder="搜索" class="custom-input" />
        </div>
        <div class="table-list">
          <div class="item" >
            <div class="left-column"> <div class="currency-wrap"></div> </div>
            <div class="right-column">
              <div class="currency">0.00</div>
              <p class="row"><span class="title">ETC</span></p>
              <p class="row"><span class="text">Ethereum</span></p>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="6"
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import fx from '@@/public/images/fx.svg';
import GoBack from "@/composables/GoBack.vue";
import {ArrowDownBold,  Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";

const headers = getHeader();
const { assetsApi } = useServer();

// 整合数据列表
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
const drawerSearch = ref(false);
const searchText = ref('');
const title = ref('兑出');
const dialogSource = ref({
  1: {name: '兑出', id: 1},
  2: {name: '兑入', id: 2},
});
const exchange = (type: number) => {
  title.value = dialogSource.value[type].name
  drawerSearch.value = true;
}

const loading = ref(false);

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
  permissionStatus: false,
});

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

// 获取数据
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
      console.log(rateExchange.value);
    }else{
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 手续费
const fastRateFee = async (inputAmountTo: number, inputAmount: number, maxInputAmount: number, rate: number, isFlag: boolean) => {
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
        // fee = maxRes.data.fee;
      }
      fee = curRes.data.fee;
      if(inputAmountTo < curAmount){
        form.value.inputAmountTo = inputAmountTo;
      }else{
        // form.value.inputAmountTo = curAmount;
      }
      cost.value.content = fee + ' ' + form.value.selectedCurrencyTo
      cost.value.amount = fee;
      form.value.inputAmount = (form.value.inputAmountTo * rate).toFixed(8);
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

  // 重新计算汇率
  const  selectedCurrencyData = currencyMergedData.value.find(currency => currency.currencyId === form.value.selectedCurrencyToId)
  form.value.bigNumCost = selectedCurrencyData.balance
  fetchRateExchange();
  // 延迟200毫秒
  setTimeout(() => {
    syncInputAmountTo(true);
  }, 500);
};

// 输出框同步输入金额
const syncInputAmountTo = (isFlag: boolean) => {
  const rate = rateExchange.value.rate;
  let inputAmountTo = parseFloat(form.value.inputAmountTo);
  if(isFlag){
    inputAmountTo = parseFloat(form.value.inputAmount);
  }
  const maxInputAmount = form.value.bigNumCost;
  if (!isNaN(inputAmountTo) && !isNaN(rate)) {
    fastRateFee(inputAmountTo, 0, maxInputAmount, rate, isFlag);
  }else{
    form.value.inputAmount = '';
    loading.value = false;
  }
};
// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
*{
  margin:0;
  padding: 0;
}
.page{
  position: relative;
  margin-top: 10px;
  height: calc(100vh - 28px);
}

.content{
  margin-top:25px;
  padding-bottom: 20px;
  position: relative;
  .button{
    z-index: 5;
    position: absolute;
    top: 118px;
    left: 50%;
    transform: translate(-50%);
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #ffffff;
    border: 3px #C8DCE8 solid;
    text-align: center;
    .el-image{
      width: 16px;
      display: inline-block;
      padding-top: 10px;
    }
  }
}

.exchange-container {
  border-radius: 16px;
  background: #ffffff;
  border: 3px #C8DCE8 solid;
  padding-left: 16px;
  position: relative;
  .title {
    font-size: 14px;
    margin-top: 16px;
  }
  .flash-btn{
    margin-top: 15px;
    width: 42%;
    span{
      display: block;
      width: 46px;
      height: 24px;
      font-size: 12px;
      border-radius: 12px;
      line-height: 24px;
      text-align: center;
      color: #333333;
      background: #EAF3FA;
    }
  }
  .currency{
    height: 22px;
    overflow: hidden;
    margin-top: 9px;
    input{
      border: none;
      font-weight: bold;
      font-size: 20px;
      line-height: 22px;
    }
    input::placeholder{
      font-size: 16px;
      font-weight: normal;
    }
  }
  .box-wrap{
    font-size: 14px;
    width: 110px;
    height: 34px;
    line-height: 34px;
    border-radius: 8px;
    color: #0D0D0D;
    background: #F4F4F4;
    position: absolute;
    top: 35px;
    right: 10px;
    display: flex;
    align-items: center;
    overflow: hidden;
    .img {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: #D8D8D8 2px solid;
      margin: 5px;
      flex-shrink: 0;
    }
    .text-wrap {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon {
      width: 22px;
      flex-shrink: 0;
    }
  }
}

.tips{
  line-height: 30px;
  margin-top: 5px;
  width: 100%;
  color: #666666;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
}

.custom-button{
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translate(-50%);
}

.sub-page{

}
.search-wrap{
  height: 40px;
  padding-right: 10px;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .arrow{
    height: 23px;
    width: 28px;
    margin-top: 8px;
    margin-left: 10px;
    margin-right:5px;
    color: #E3E3E3;
  }
  .custom-input::placeholder {
    color: #E3E3E3;
  }
  .custom-input{
    border: 1px #ffffff solid;
    height: 30px;
    line-height: 32px;
    margin-top: 4px;
    font-size: 18px;
    overflow: hidden;
    width: 100%;
  }
}
/deep/ .el-drawer {
  --el-drawer-padding-primary: 15px 20px 0 20px;
}
/deep/ .el-drawer__header{
  margin-bottom: 0;
  position: relative;
}
/deep/ .el-drawer__body{
  position: relative;
  top: -5px;
}
/deep/ .el-drawer__title {
  color: #0D0D0D;
  font-size: 16px;
}

.table-list{
  position: relative;
  margin-top: 40px;
  .item{
    display: flex;
    height: 52px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f1f1;
    overflow: hidden;
  }
}
.left-column {
  width: 48px;
  height: 48px;
  .currency-wrap{
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
    border-radius: 50%;
  }
}
.right-column {
  padding-left: 10px;
  flex: 1;
  padding-top: 5px;
  justify-content: flex-start;
  flex-direction: column;
  position: relative;
  .currency{
    height: 100%;
    line-height: 48px;
    color: #666666;
    text-align: right;
    position: absolute;
    right: 0;
    top:0;
  }
  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
    .text {
      color: #6E6E6E;
    }
  }
}

</style>
