<template>
  <div class="page">
    <GoBack />
    <div class="sub-page">
      <div class="title-box-wrap">
        <div class="title-wrap">付款至</div>
        <div class="title-item">
          <el-icon><el-image :src="account.accountLogo ? account.accountLogo : head" /></el-icon>
          <div class="column">
            <div class="title">{{account.accountName?account.accountName:account.qr}}</div>
            <div class="text" v-if="account.sign">{{account.sign}}</div>
            <div class="remark" v-if="account.remark">留言：{{account.remark}}</div>
          </div>
        </div>
      </div>
      <div class="search-wrap">
        <input v-model="form.remark" placeholder="备注" class="custom-input" />
      </div>
      <div class="input-amount-wrap">
        <input :class="{ 'error-input': isAmountError }" :disabled="isCollectAmount" class="input-wrap" placeholder="请转入金额" type="number" v-model="form.amount" @input="validateInputAmount" />
      </div>
      <div class="row-title">{{currency.sign}}{{formatCurrency(form.totalBalanceUsdt)}}</div>
      <div class="row-text">
        <span>可转账: {{formatCurrency(form.balance)}} {{ form.currencyName }}</span>
        <el-button @click="setAmount">全部</el-button>
      </div>
      <div class="row-text" v-if="form.fee">手续费：<span>{{ formatCurrency(form.fee) }} {{ form.currencyName }}</span> </div>

      <el-button @click="dialogCheckVisible = true" class="custom-button custom-button-pos" :class="{ 'disabled-button': !form.amount || isAmountError}" :disabled="!form.amount || isAmountError" >确认</el-button>
      <CheckPermissionDialog
          :form="form"
          @update:form="updateForm"
          :permissionId = 4
          :isDialogVisible="dialogCheckVisible"
          @close="dialogCheckVisible = false"
      />
      <el-dialog class="custom-dialog" :show-close="false" v-model="dialogSuccessInfo" @close="">
        <div class="dialog-body">
          <div class="title-wrap"><span>付款</span> <span style="font-size: 20px;font-weight: bold">{{form.currencyName}}</span></div>
          <div class="title-wrap" style="line-height: 54px;height: 54px;"><span style="font-size: 20px; font-weight: bold">{{formatCurrency(form.amount)}}</span></div>
          <div class="title-wrap">至</div>
          <div class="title-item">
            <el-icon style="width: 22px; height: 22px;"><el-image :src="account.accountLogo ? account.accountLogo : head" /></el-icon>
            <div class="column">
              <div class="title">{{account.accountName?account.accountName:account.qr}}</div>
              <div class="text" v-if="account.sign">{{account.sign}}</div>
              <div class="remark" v-if="account.remark">留言：{{account.remark}}</div>
            </div>
          </div>
          <div class="button-container">
            <el-button class="custom-button-sm" @click="submitPay" style="width: 190px;">确认付款</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import head from '@@/public/images/head.svg';
import {formatCurrency, getDataInfo} from "~/utils/configUtils";
import {getHeader} from "@/utils/storageUtils";
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import {showCatchErrorMessage} from "~/utils/messageUtils";

const headers = getHeader();
const router = useRouter();
const route = useRoute();
const { assetsApi, userApi } = useServer();
const isAmountError = ref(false);
const dialogCheckVisible = ref(false);
const dialogSuccessInfo = ref(false);
const remark = ref('');
const amount = ref('');
const isCollectAmount = ref(false);
const maxFee = ref(0);

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  checkForm.value = newForm;
  if(checkForm.value.permissionStatus){
    dialogSuccessInfo.value = true;
  }else{
  }
};
const form = ref({
  currencyId: '',
  currencyTitle: '',
  currencyName: '',
  currencyChain: '',
  currencyChainName: '',
  totalBalanceUsdt: '',
  balance: '',
  amount: '',
  fee: '',
  remark: '',
  qr: '',
  rateCurrency: '',
});
const currency = ref({
  code: 'USD',
  sign: '$',
  rate: 1,
});
const checkForm = ref({
  assetsPassword: '',
  googleCode: '',
  passwordToken: '',
  googleToken: '',
  optToken: '',
  bindGoogleAuth: false,
  bindAssetsPassword: false,
  permissionStatus: false,
})
const account = ref({
  accountLogo: '',
  accountId: '',
  accountType: '',
  accountName: '',
  accountNo: '',
  sign: '',
  remark: '',
  qr: ''
})
// 验证输入金额
const validateInputAmount = async () => {
  const value = form.value.amount;
  if(!value){
    return;
  }
  // 将处理后的值赋回
  let res = await assetsApi.getWithdrawRateFee({
    currencyId: form.value.currencyId,
    currencyChain: form.value.currencyChain,
    amount: value
  }, headers);
  if (res.code === 200) {
    form.value.fee = res.data.fee;
    let maxAmount = parseFloat(form.value.balance) - res.data.fee;
    if (value > maxAmount) {
      isAmountError.value = true;
    } else {
      isAmountError.value = false;
    }
  }
};
// 转账
const submitPay = async () =>{
  try {
    let params = {
      accountId: account.value.accountId,
      accountType: account.value.accountType,
      qrcode: account.value.qr,
      currencyId: form.value.currencyId,
      currencyChain: form.value.currencyChain,
      transferAmount: form.value.amount,
      remark: form.value.remark,
      optToken: checkForm.value.optToken
    }
    setHeadersAuth(headers, checkForm);
    let res = await assetsApi.transferApply(params, headers);
    if(res.code == 200) {
      let remarkStr = remark.value?encodeURIComponent(remark.value):'';
      let qrStr = encodeURIComponent(account.value.qr);
      router.push({ path: 'successed', query: { qr: qrStr, remark: remarkStr, tradeNo:  res.data} });
    }else{
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
}
// 设置最大金额
const setAmount = async () => {
  if(isCollectAmount) return;
  form.value.amount = parseFloat(form.value.balance) - maxFee.value;
  form.value.fee = maxFee.value;
};

// 获取数据
const fetchData = async (assetsId: number, transferQR: string) => {
  try {
    // 资产数据
    let assetsRes = await assetsApi.getAccountAssetsById({assetsId: assetsId}, headers);
    if (assetsRes.code == 200) {
      const currencyInfo = getDataInfo(assetsRes.data.currencyId, 'currencyChains');
      form.value.currencyId = assetsRes.data.currencyId;
      form.value.currencyName = currencyInfo?.name;
      form.value.currencyTitle = currencyInfo?.title;
      form.value.currencyChainName = getDataInfo(assetsRes.data.currencyChain, 'chains')?.name;
      form.value.currencyChain = assetsRes.data.currencyChain;
      form.value.totalBalanceUsdt = assetsRes.data.totalBalanceUsdt;
      form.value.balance = assetsRes.data.balance;
      if(amount.value){
        form.value.amount = amount.value;
      }
      //请求汇率及用户二维码
      const [checkTransferRes, rateRes, feeRes] = await Promise.all([
        userApi.getCheckTransferCode({qrCode: transferQR}, headers),
        assetsApi.getRateCoin2currency({coinId: assetsRes.data.currencyId, currency: currency.value.code,}, headers),
        await assetsApi.getWithdrawRateFee({
          currencyId: assetsRes.data.currencyId,
          currencyChain: assetsRes.data.currencyChain,
          amount: assetsRes.data.balance
        }, headers)
      ]);
      // 处理初始化信息
      if (checkTransferRes.code == 200) {
        account.value = checkTransferRes.data;
        account.value.qr = transferQR;
        account.value.remark = remark.value;
      } else {
        showErrorMessage(checkTransferRes.code, checkTransferRes.message)
      }
      // 处理最大手续费
      if (feeRes.code == 200) {
        maxFee.value = feeRes.data.fee;
      }else{
        showErrorMessage(feeRes.code, feeRes.message)
      }
      // 处理汇率信息
      if (rateRes.code == 200) {
        currency.value.rate = rateRes.data;
        form.value.totalBalanceUsdt = form.value.balance * currency.value.rate;
      } else {
        showErrorMessage(rateRes.code, rateRes.message)
      }
    } else {
      showErrorMessage(assetsRes.code, assetsRes.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};
// 初始化数据
onMounted(() => {
  if(route.query.remark){
    remark.value = decodeURIComponent(route.query.remark);
  }
  if(route.query.amount && route.query.isCollect && route.query.isCollect == 1 ){
    isCollectAmount.value = true;
    amount.value = route.query.amount;
  }
  if(route.query.qr){
    let qr = decodeURIComponent(route.query.qr);
    fetchData(route.query.assetsId, qr);
  }

});
</script>
<style lang="less" scoped>
.error-input {
  color: red!important;
}
*{
  margin: 0;
  padding: 0;
}
.input-amount-wrap{
  height: 49px;
  margin-top: 49px;
  .input-wrap{
    border: 0 !important;
    text-align: center;
    height: 49px;
    line-height: 49px;
    width: 100%;
    font-size: 36px;
    color: #0D0D0D;
  }
  .input-wrap::placeholder{
    font-size: 28px;
  }
}
.row-title{
  height: 25px;
  line-height: 25px;
  font-size: 16px;
  color: #0D0D0D;
  margin-top: 28px;
  margin-bottom: 80px;
  text-align: center;
}
.row-text{
  line-height: 40px;
  color: #333333;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  .el-button{
    background: #EAF3FA;
    font-size: 16px;
    color: #333333;
    height: 40px;
    border-radius: 8px;
    line-height: 40px;
    font-weight: normal;
    border: 0;
    padding: 0 15px;
  }
}
.title-box-wrap {
  position: relative;
  .title-wrap{
    padding-top: 6px;
    color: #0D0D0D;
    line-height: 24px;
    font-size: 14px;
  }
  padding-bottom: 20px;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.search-wrap{
  background: #ffffff;
  height: 40px;
  padding-right: 10px;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  margin-bottom: 20px;
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
    width: 95%;
    margin-left: 10px;
  }
}
.table-title{
  font-size: 16px;
  color: #333333;
}
.title-item{
  margin-top: 16px;
  padding-bottom: 25px;
  display: flex;
  .title{
    line-height: 20px;
    color: #333333;
    height: 22px;
  }
  .text{
    line-height: 16px;
    color: #999999;
    font-size: 12px;
    height: 16px;
    overflow: hidden;
  }
  .el-icon{
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
    height: 46px;
    width: 46px;
  }
  .remark{
    font-size: 12px;
    color: #333333;
    height: 16px;
    line-height: 16px;
    margin-top: 10px;
  }
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
.dialog-body{
  .title-wrap{
    color: #333333;
    font-size: 14px;
    height: 22px;
    line-height: 22px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
