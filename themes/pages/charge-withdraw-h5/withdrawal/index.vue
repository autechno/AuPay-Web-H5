<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="false"   />
    <div class="tips">至</div>
    <div class="sub-page">
      <div class="search-wrap">
        <input v-model="addressText"  class="custom-input" />
        <div class="select-address" @click="resetBtn"><el-image :src="shape" />编辑</div>
      </div>
      <div class="input-amount-wrap">
        <input :class="{ 'error-input': isAmountError }"  class="input-wrap" placeholder="请转入金额" type="number" v-model="form.amount" @input="validateInputAmount" />
      </div>
      <div class="row-title">${{formatCurrency(form.totalBalanceUsdt)}}</div>
      <div class="row-text">可提现: {{formatCurrency(form.balance)}}</div>
      <div class="row-text" v-if="cost.amount">手续费：<span>{{ formatCurrency(cost.amount) }}</span> </div>
    </div>
    <el-button @click="dialogCheckVisible = true" class="custom-button" :class="{ 'disabled-button': !form.amount || isAmountError}" :disabled="!form.amount || isAmountError" >确认</el-button>
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
import GoBack from "@/composables/GoBack.vue";
import {getHeader} from "@/utils/storageUtils";
import shape from '@@/public/images/Shape.svg'
import {ElMessage} from "element-plus";
import { formatCurrency, } from "@/utils/formatUtils";
import { useRoute, useRouter } from 'vue-router';
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import {setHeadersAuth} from "@/utils/funcUtil";
const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const isAmountError = ref(false);
const addressText = ref('');
const dialogCheckVisible = ref(false);
const cost = ref({
  content: '',
  amount: '',
});

const resetBtn = () => {
  router.push({ path: '/charge-withdraw-old/withdrawal/selected', query: { currencyId: form.value.id } });
}
// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.permissionStatus){
    dialogCheckVisible.value = false;
    handleSubmit();
  }
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
    cost.value.amount = res.data.fee;
    cost.value.content = parseFloat(form.value.balance) - res.data.fee;
    if (value > cost.value.content) {
      isAmountError.value = true;
    } else {
      isAmountError.value = false;
    }
  }
};

// 提交转账
const handleSubmit = async () => {
  try{
      setHeadersAuth(headers,form);
      let res = await assetsApi.getWithdrawApply(form.value, headers);
      if (res.code == 200) {
        ElMessage.success('提现成功');
        // 延迟500毫秒
        setTimeout(() => {
          router.push({ path: '/charge-withdraw-old/withdrawal/list' });
        }, 500);
      } else {
        ElMessage.error(res.message);
      }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

const form = ref({
  amount: '',
  totalBalanceUsdt: '',
  balance: '',
  permissionStatus: ''
})

// 获取数据
const fetchData = async (currencyId: number) => {
  try {
    let res = await assetsApi.getAccountAssetsById({ assetsId:  currencyId }, headers);
    if (res.code == 200) {
      form.value = res.data;
      form.value.amount = '';
      form.value.permissionStatus = false;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  addressText.value = route.query.address;
  fetchData(route.query.currencyId);
});
</script>

<style lang="less" scoped>
.error-input {
  color: red!important;
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
.sub-page{
  padding-top:10px;
  padding-bottom: 20px;
  position: relative;
}
.search-wrap{
  margin-bottom: 20px;
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
