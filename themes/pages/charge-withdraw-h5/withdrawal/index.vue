<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="false"   />
    <div class="tips">至</div>
    <div class="withdrawal-page">
      <div class="search-wrap">
        <input v-model="remarkText" disabled class="custom-input" />
        <div class="select-address" @click="resetBtn"><el-image :src="shape" />编辑</div>
      </div>
      <div class="input-amount-wrap">
        <input :class="{ 'error-input': isAmountError }"  class="input-wrap" placeholder="请转入金额" type="number" v-model="form.amount" @input="validateInputAmount" />
      </div>
      <div class="row-title">
        ${{formatCurrency(form.totalBalanceUsdt)}}
      </div>
      <div class="row-text">
        <span>可提现: {{formatCurrency(form.balance)}}</span>
        <el-button @click="setAmount">全部余额</el-button>
      </div>
      <div class="row-text" v-if="form.fee">手续费：<span>{{ formatCurrency(form.fee) }}</span> </div>
    </div>
    <el-button @click="dialogCheckVisible = true" class="custom-button custom-button-pos" :class="{ 'disabled-button': !form.amount || isAmountError}" :disabled="!form.amount || isAmountError" >确认</el-button>
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId = 4
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import {getHeader} from "@/utils/storageUtils";
import shape from '@@/public/images/Shape.svg'
import {ElMessage} from "element-plus";
import { formatCurrency, } from "~/utils/configUtils";
import { useRoute, useRouter } from 'vue-router';
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import {goBackDelay, setHeadersAuth} from "@/utils/funcUtil";
const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const isAmountError = ref(false);
const maxFee = ref(0);
const remarkText = ref('');
const dialogCheckVisible = ref(false);

const form = ref({
  amount: '',
  fee: '',
  totalBalanceUsdt: '',
  balance: '',
  permissionStatus: ''
})
const resetBtn = () => {
  router.push({ path: 'selected', query: { assetsId: form.value.id } });
}
// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.permissionStatus){
    dialogCheckVisible.value = false;
    handleSubmit();
  }
};

// 设置最大金额
const setAmount = async () => {
  form.value.amount = parseFloat(form.value.balance) - maxFee.value;
  form.value.fee = maxFee.value;
};

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
  }else{
    showErrorMessage(res.code, res.message)
  }
};

// 提交转账
const handleSubmit = async () => {
  try{
      setHeadersAuth(headers,form);
      form.value['toAddress'] = remarkText.value;
      let res = await assetsApi.getWithdrawApply(form.value, headers);
      if (res.code == 200) {
        showSuccessMessage(0, '提现成功')
        goBackDelay(router, 'list');
      } else {
        showErrorMessage(res.code, res.message)
      }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 获取数据
const fetchData = async (assetsId: number) => {
  try {
    let assetsRes = await assetsApi.getAccountAssetsById({ assetsId:  assetsId }, headers);
    if (assetsRes.code == 200) {
      form.value = assetsRes.data;
      form.value.amount = '';
      form.value.fee = '';
      form.value.permissionStatus = false;
      // 计算最大手续费
      let feeRes = await assetsApi.getWithdrawRateFee({
        currencyId: assetsRes.data.currencyId,
        currencyChain: assetsRes.data.currencyChain,
        amount: assetsRes.data.balance
      }, headers);
      if (feeRes.code == 200) {
        maxFee.value = feeRes.data.fee;
      }else{
        showErrorMessage(feeRes.code, feeRes.message)
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
  if(route.query.address){
    remarkText.value = decodeURIComponent(route.query.address);
  }
  fetchData(route.query.assetsId);
});
</script>

<style lang="less" scoped>
.error-input {
  color: red!important;
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

*{
  margin: 0;
  padding: 0;
}
.tips{
  height: 22px;
  color: #0D0D0D;
  margin-top: 15px;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.withdrawal-page{
  position: relative;
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
}
.search-wrap{
  margin-bottom: 20px;
  margin-top: 10px;
  height: 40px;
  padding: 5px 15px;
  background: #ffffff;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .custom-input::placeholder {
    color: #E3E3E3;
    font-size: 16px;
  }
  .select-address{
    font-size: 14px;
    line-height: 30px;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 75px;
    height: 30px;
    color: #333333;
    border-radius: 8px;
    background: #EAF3FA;
    text-align: center;
    .el-image{
      position: relative;
      top: 2px;
      width: 14px;
      height: 14px;
    }
  }
  .custom-input{
    width: calc(100vw - 150px);
    border: 1px #ffffff solid;
    height: 30px;
    color: #353955;
    line-height: 32px;
    margin-top: 4px;
    font-size: 16px;
    overflow: hidden;
  }
}
</style>
