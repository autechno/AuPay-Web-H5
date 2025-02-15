<template>
  <div class="page">
     <div><img :src="account.accountLogo" class="avatar" /></div>
     <div>{{account.sign}}</div>
     <div>收款码： {{form.qr}}</div>
    <div>{{account.accountNo}}</div>
    <div class="container">
      <el-row :gutter="20" style="background: #dcdcdc; padding:20px;">
        <el-col :span="18">
          <div>{{ currencyAccount.currencyTitle }} {{currencyAccount.currencyChainName}}</div>
        </el-col>
      </el-row>
      <el-form-item style="padding-bottom: 50px; padding-top: 10px;">
        <el-input placeholder="请输入备注信息" v-model="form.remark" />
      </el-form-item>
      <div style="text-align: center; display: flex; align-items: center;">
        <el-input v-model="form.amount" @input="validateInputAmount" style="width: 100px; margin-right: 10px;" placeholder="请输入转账金额"></el-input>
        <span>{{ currencyAccount.currencyName }}</span>
      </div>
      <div>{{ formatCurrency(currencyAccount.rateCurrency) }}{{currency.sign}}</div>

      <div style="padding-top: 50px;">可转账数量：{{ currencyAccount.balance}} {{ currencyAccount.currencyName }}</div>
      <div>转账费用：{{ currencyAccount.fee }} {{ currencyAccount.currencyName }}</div>
    </div>
    <el-button type="primary" @click="handleSubmit"> 确认 </el-button>
  </div>
  <!-- 密码验证对话框 -->
  <CheckPermissionDialog
      :form="checkForm"
      @update:form="updateForm"
      :permissionId="8"
      :isDialogVisible="dialogCheckVisible"
      @close="dialogCheckVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
import {ElMessage} from "element-plus";
import {formatCurrency, getDataInfo} from "~/utils/configUtils";
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import {setHeadersAuth} from "@/utils/funcUtil";

const route = useRoute();
const headers = getHeader();
const dialogCheckVisible = ref(false);
const { userApi, assetsApi, systemApi } = useServer();
const currency = ref({
  code: 'USD',
  sign: '$',
  rate: 1,
});

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  checkForm.value = newForm;
  if(checkForm.value.permissionStatus){
    processPay();
  }
};

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
const form = ref({
  qr: '',
  currencyId: '',
  currencyChain: '',
  amount: '',
  remark: '',
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
  accountNo: '',
  accountId: '',
  accountLogo: '',
  accountType: '',
  sign: '',
});
const currencyAccount = ref({
  currencyTitle: '',
  currencyChainName: '',
  currencyName: '',
  balance: '',
  fee: '',
  rateCurrency: '',
});

// 转账成功
const  processPay = async () =>{
  let params = {
    accountId: account.value.accountId,
    accountType: account.value.accountType,
    qrcode: form.value.qr,
    currencyId: form.value.currencyId,
    currencyChain: form.value.currencyChain,
    transferAmount: form.value.amount,
    remark: form.value.remark,
    optToken: checkForm.value.optToken
  }
  setHeadersAuth(headers, checkForm);
  let res = await assetsApi.transferApply(params, headers);
  if(res.code == 200) {
    ElMessage.success('转账成功');
    setTimeout(()=>{
      window.location.href = '/charge-withdraw/transfer';
    },800)
  }else{
    throw new Error(res.message);
  }
}

// 获取数据的函数
const initializeData = async () => {
  try {
    const [assetsRes, checkTransferRes, rateRes] = await Promise.all([
      assetsApi.accountAssets({}, headers),
      userApi.getCheckTransferCode({ qrCode: form.value.qr }, headers),
      assetsApi.getRateCoin2currency({ coinId: form.value.currencyId, currency: currency.value.code, }, headers),
    ]);
    // 处理资产数据
    if (assetsRes.code == 200) {
      assetsRes.data.forEach(item => {
        if (item.currencyId == form.value.currencyId && item.currencyChain == form.value.currencyChain) {
          const currencyInfo = getDataInfo(item.currencyId, 'currencyChains');
          currencyAccount.value.currencyName = currencyInfo?.name;
          currencyAccount.value.currencyTitle = currencyInfo?.title;
          currencyAccount.value.currencyChainName = getDataInfo(item.currencyChain, 'chains')?.name;
          currencyAccount.value.balance = item.balance;
          validateInputAmount();
          console.log("-item start-");
          console.log(item);
          console.log("-item end-");
        }
      });
    } else {
      ElMessage.error(assetsRes.message || '查询失败');
    }
    // 处理初始化信息
    if (checkTransferRes.code == 200) {
      account.value = checkTransferRes.data;
      if (!account.value.accountLogo) {
        account.value.accountLogo = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
      }
    } else {
      ElMessage.error(checkTransferRes.message || '查询失败');
    }
    // 处理汇率信息
    if (rateRes.code == 200) {
      currency.value.rate = rateRes.data;
    } else {
      ElMessage.error(rateRes.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 提交
const handleSubmit = async () => {
  try {
    // 验证必填字段
    if (!form.value.qr) {
      throw new Error('转账ID不能为空');
    }else if (!account.value.accountId) {
      throw new Error('转账的账户信息不完整');
    }else if (!form.value.currencyId || !form.value.currencyChain) {
      throw new Error('转账货币信息不完整');
    } else if(!form.value.amount) {
      throw new Error('转账金额不能为空');
    }
    dialogCheckVisible.value = true;
  } catch (error) {
    ElMessage.error(error.message);
  } finally {
  }
};

// 验证输入金额
const validateInputAmount = async () => {
  let res = await assetsApi.getWithdrawRateFee({
    currencyId: form.value.currencyId,
    currencyChain: form.value.currencyChain,
    amount: form.value.amount
  }, headers);
  if (res.code === 200) {
    currencyAccount.value.fee = res.data.fee;
  }
  if (form.value.amount > currencyAccount.value.balance) {
    ElMessage.warning('转入金额不能大于实际转账数量');
  }
  currencyAccount.value.rateCurrency = form.value.amount * currency.value.rate;
};


// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  currency.value.code = userStore.userInfo.currencyUnit;
  currency.value.sign = getDataInfo(currency.value.code, 'currency')?.sign;
  form.value.qr = route.query.qr;
  form.value.currencyId = route.query.currencyId;
  form.value.currencyChain = route.query.currencyChain;
  form.value.amount = route.query.amount;
  console.log('-form start-')
  console.log(form.value)
  console.log('-form end-')
  initializeData()
});

</script>

<style scoped>
.page {
  padding: 20px;
}
.avatar {
  width: 128px;
  height: 128px;
  display: block;
  border-radius: 128px;
}
</style>
