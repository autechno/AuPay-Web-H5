<template>
  <div class="page">
    <GoBack  />
    <div class="content">
      <div class="exchange-container" style="height: 126px;">
        <div class="title">兑出</div>
        <div class="currency">
          <input  v-model="form.inputAmountTo" :class="{ 'error-input': isAmountError }" placeholder="请输入金额" type="number" @input="syncInputAmountTo()" />
        </div>
        <el-row class="flash-btn">
          <el-col :span="8"><span @click="percentage(0.5)">50%</span></el-col>
          <el-col :span="8"><span @click="percentage(1)">100%</span></el-col>
        </el-row>
        <div class="balance-display">
          <span>余额: {{ form.bigNumCost }}</span>
        </div>
        <div class="box-wrap" @click="exchange('to')">
          <div class="img"><el-image :src="sol" /></div>
          <div class="text-wrap">{{ form.selectedCurrencyTo }}</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
      <div class="button" @click="swapCurrencies" ><el-image :src="fx" /></div>
      <div class="exchange-container" style="height: 90px; margin-top:12px;">
        <div class="title">兑入</div>
        <div class="currency">
          <input v-model="form.inputAmount"  placeholder="请输入金额" type="number" @input="syncInputAmount"
          />
        </div>
        <div class="box-wrap" @click="exchange('form')">
          <div class="img"><el-image :src="sol" /></div>
          <div class="text-wrap">{{ form.selectedCurrency }}</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
    </div>
    <div class="tips">
      <span>当前兑换汇率：</span><span>{{ rateExchange.content }}</span>
    </div>
    <div class="tips" v-if="cost.amount">
      <span>费用：</span>
      <span>{{ cost.content }}</span>
    </div>
    <el-button  @click="submitExchange" class="custom-button custom-button-pos" :class="{ 'disabled-button': isAmountError}" :disabled="!form.inputAmountTo || isAmountError || isAmountSame">确认</el-button>
    <el-drawer class="custom-title" v-model="drawerSearch"
               :title="dialogTitle"
               :show-close="false"
               direction="btt"
               size="85%">
      <div class="sub-page">
        <div class="search-wrap">
          <el-icon class="arrow" size="26"><Search /></el-icon>
          <input v-model="searchText" placeholder="搜索" class="custom-input" />
        </div>
        <div class="chain-wrap">
          <div class="text-wrap">选择网络</div>
          <div class="list-chain-wrap">
            <el-row style="display: flex; justify-content: space-between">
              <el-col :span="22" style="display: flex">
                <div class="item"
                     v-for="item in currencyChainList"
                     :key="item.id"
                     :class="{ cur: selectedChain === item.id }"
                     @click="selectChain(item.id)">
                  <el-image class="img" :src="btc" />
                </div>
              </el-col>
              <el-col :span="2">
                <div class="btn" :class="{ cur: isAllSelected }" @click="selectAll">全部</div>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="table-list" v-for="currency in currencyList" :key="currency.id">
          <div class="item" @click="updateCurrencyChain(currency)">
            <div class="left-column"><div class="currency-wrap"><el-image :src="sol" /></div></div>
            <div class="right-column">
              <div class="currency">{{currency.balance}}</div>
              <p class="row"><span class="title">{{currency.currencyName}}</span></p>
              <p class="row"><span class="text">{{currency.currencyChainName}}</span></p>
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
import GoBack from "@/composables/GoPageBack.vue";
import {ArrowDownBold,  Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import btc from '@@/public/images/btc.svg'
import sol from '@@/public/images/sol.svg'
import {ElMessage} from "element-plus";
import {showCatchErrorMessage} from "~/utils/messageUtils";
const headers = getHeader();
const { assetsApi } = useServer();

// 整合数据列表
const currencyList = ref([]);
const originalCurrencyList = ref([]);
const currencyChainList = ref([]);
const dialogCheckVisible = ref(false);
const selectedChain = ref(null);
const isAllSelected = ref(true);
const isAmountError = ref(false);
const isAmountSame = ref(false);
const maxAmountFee = ref(0);

// 搜索
const selectAll = () => {
  isAllSelected.value = true;
  selectedChain.value = null;
  resetCurrencyList();
};
const selectChain = (id: number) => {
  selectedChain.value = id;
  isAllSelected.value = false;
  resetCurrencyList();
};

const submitExchange = () => {
  if(!form.value.inputAmountTo || !form.value.inputAmount) {
    showErrorMessage(0, '请输入金额!');
    return;
  }
  dialogCheckVisible.value = true
}
const rateExchange = ref({
  content: '',
  rate: 1,
});
const cost = ref({
  content: '',
  amount: 0,
});
const drawerSearch = ref(false);
const searchText = ref('');
const dialogTitle = ref('');
const dialogType = ref('');
const exchange = (type: string) => {
  dialogType.value = type;
  if(type == 'to'){
    dialogTitle.value = '兑出';
  }else{
    dialogTitle.value = '兑入';
  }
  selectAll();
  drawerSearch.value = true;
}

const loading = ref(false);

// 状态合并到一个对象中
const form = ref({
  selectedCurrencyId: null,
  selectedCurrency: null,
  selectedChain: null,
  selectedChainName: null,
  inputAmount: '',
  bigNumCost: 0,

  selectedCurrencyToId: null,
  selectedCurrencyTo: null,
  selectedChainTo: null,
  selectedChainNameTo: null,
  inputAmountTo: '',

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
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }else{
        ElMessage.error(res.message)
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 重置 currencyList
const resetCurrencyList = () => {
  currencyList.value = originalCurrencyList.value.filter(currency => {
    // 检查是否匹配 selectedChain
    const isMatch = selectedChain.value === null || currency.currencyChain === selectedChain.value;
    // 检查是否模糊匹配搜索文本
    const isSearchMatch = currency.currencyName.toLowerCase().includes(searchText.value.toLowerCase());
    const isZeroMatch = currency.currencyChain === 0 && selectedChain.value === 0;
    return (isMatch || isZeroMatch) && isSearchMatch;
  });
};
// 同一货币协议不能兑换
const checkAmountSame = () => {
  isAmountSame.value = (
      form.value.selectedCurrencyId === form.value.selectedCurrencyToId &&
      form.value.selectedChain === form.value.selectedChainTo
  ) ? true : false;
};

// 获取数据
const fetchData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code == 200) {
      let currencyData = new Array();
      let chainData = new Array();
      const dataList = res.data;
      dataList.forEach(item => {
        const {id, currencyId, currencyChain, balance, totalBalanceUsdt } = item;
        // 检查是否已存在该货币数据
        currencyData.push({
            id,
            balance,
            totalBalanceUsdt,
            currencyId,
            currencyName: getDataInfo(currencyId, 'currencyChains')?.name,
            currencyChain: currencyChain,
            currencyChainName: getDataInfo(currencyChain, 'chains')?.name,
          });
        // 添加链信息，避免重复
        const chainInfo = { id: currencyChain, name: getDataInfo(currencyChain, 'chains')?.name };
        if (!chainData.some(chain => chain.id === chainInfo.id)) {
          chainData.push(chainInfo);
        }
      });

      currencyList.value = currencyData;
      originalCurrencyList.value = currencyData;
      currencyChainList.value = chainData;
      // // 如果有可用的货币，自动选择第一个
      if (currencyList.value.length > 0) {
        dialogType.value = 'form'
        updateCurrencyChain(currencyList.value[0]);
        dialogType.value = 'to'
        updateCurrencyChain(currencyList.value[0]);
      }
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage();
  }
};

// 更新链数据的函数
const updateCurrencyChain = (currencyData: any) => {
  // 切换清空金额内容
  form.value.inputAmountTo = '';
  form.value.inputAmount = '';
  cost.value = { amount: 0, content: '' };

  if(dialogType.value === 'form'){
    form.value.selectedCurrencyId = currencyData.currencyId;
    form.value.selectedCurrency = currencyData.currencyName;
    form.value.selectedChain = currencyData.currencyChain
    form.value.selectedChainName = currencyData.currencyChainName
  }else{
    form.value.selectedCurrencyToId= currencyData.currencyId;
    form.value.selectedCurrencyTo = currencyData.currencyName;
    form.value.selectedChainTo = currencyData.currencyChain;
    form.value.selectedChainNameTo = currencyData.currencyChainName;
    form.value.bigNumCost = currencyData.balance;
  }
  if(form.value.selectedCurrencyId && form.value.selectedCurrencyToId){
    fetchRateExchange();
    checkAmountSame();
  }
  drawerSearch.value = false;
};

// 获取汇率数据
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

//计算加手续费
const calculateAndFetchFee = async (inputAmount: number,  type: number) => {
  try {
    let rate = rateExchange.value.rate;
    if (type === 1) {
      form.value.inputAmountTo = inputAmount;
      form.value.inputAmount = form.value.inputAmountTo * rate;
    } else {
      form.value.inputAmount = inputAmount;
      form.value.inputAmountTo = form.value.inputAmount / rate;
    }
    let getFee = await getAmountFee(inputAmount, false);
    console.log(getFee);
    if(getFee){
      isAmountError.value = true;
    }else{
      isAmountError.value = false;
      checkAmountSame();
    }
  } catch (error) {
    showCatchErrorMessage();
  } finally {
  }
};

// 交换货币和链
const swapCurrencies = async () => {
  const selectedCurrencyId = form.value.selectedCurrencyId;
  const selectedCurrency = form.value.selectedCurrency;
  const selectedChain = form.value.selectedChain;
  const selectedChainName = form.value.selectedChainName;

  form.value.selectedCurrencyId = form.value.selectedCurrencyToId;
  form.value.selectedCurrency = form.value.selectedCurrencyTo;
  form.value.selectedChain = form.value.selectedChainTo;
  form.value.selectedChainName = form.value.selectedChainNameTo;
  form.value.selectedCurrencyToId = selectedCurrencyId;
  form.value.selectedCurrencyTo = selectedCurrency;
  form.value.selectedChainTo = selectedChain;
  form.value.selectedChainNameTo = selectedChainName;
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

//手续费查询
const getAmountFee = async (inputAmount: number, isMaxFee: boolean) => {
  const res = await assetsApi.getFastRateFee({ currencyId: form.value.selectedCurrencyToId, currencyChain: form.value.selectedChainTo, amount: inputAmount }, headers);
  if (res.code === 200) {
    const fee = res.data.fee;
    if(isMaxFee){
      maxAmountFee.value = fee;
    }else{
      cost.value.content = `${fee} ${form.value.selectedCurrencyTo}`;
      cost.value.amount = fee;
      let maxAmount = form.value.inputAmountTo + fee;
      if (maxAmount > form.value.bigNumCost) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    showErrorMessage(res.code, res.message);
  }
}

// 百分比方式
const percentage = async (number: number) => {
  let inputAmount = form.value.bigNumCost;
  if (number == 1) {
    await getAmountFee(inputAmount, true);
    inputAmount = inputAmount - maxAmountFee.value;
  }else{
    inputAmount = inputAmount * number;
  }
  form.value.inputAmountTo = inputAmount;
  syncInputAmountTo();
}


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

// 监听
watch(searchText, () => {
  resetCurrencyList();
});

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
.error-input {
  color: red!important;
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
  .balance-display{
    width: 46%;
    line-height: 24px;
    height: 24px;
    overflow: hidden;
    color: #333333;
    font-size: 12px;
    position: absolute;
    top: 80px;
    right: 10px;
    text-align: right;
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

.sub-page{

}
.chain-wrap{
  height: 50px;
  padding: 20px 0 ;
  .text-wrap{
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color: #666666;
  }
  .list-chain-wrap {
    .cur{
      border-color: #5686E1 !important;
    }
    width: 100%;
    height: 30px;
    margin-top: 5px;
    .item{
      height: 28px;
      width: 28px;
      margin-right: 10px;
      border: #C8DCE8 solid 1px;
      border-radius: 8px;
      background: #ffffff;
      text-align: center;
      .img{
        margin-top: 4px;
        width: 18px;
        height: 18px;
      }
    }
    .btn{
      font-size: 12px;
      text-align: center;
      height: 28px;
      line-height: 28px;
      width: 33px;
      border-radius: 8px;
      background: #ffffff;
      border: #C8DCE8 solid 1px;
    }
  }
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
  margin-top: 5px;
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
    .el-image{
      height: 100%;
      height: 100%;
    }
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
      font-size: 12px;
      color: #6E6E6E;
    }
  }
}

</style>
