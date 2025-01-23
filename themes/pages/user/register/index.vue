<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">注册auPayID</div>
    <el-form :model="form" :rules="rules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
      <el-form-item prop="email" >
        <el-input v-model="form.email" placeholder="请输入邮箱"  />
      </el-form-item>
      <el-form-item class="agreement">
        <el-checkbox v-model="isAgreement">我同意</el-checkbox><span style="color:#5686E1; font-weight: normal">《auPay用户协议》</span>
      </el-form-item>
      <el-form-item>
        <el-button class="custom-button" native-type="submit">注册</el-button>
      </el-form-item>
    </el-form>
    <div class="href-text" @click="navigateToLogin">已有账户<span style="color: #5686E1">直接登录</span></div>
    <el-row :gutter="20" class="icon-container">
      <el-col :span="8"><img class="icon" :src="google" width="36" /></el-col>
      <el-col :span="8"><img class="icon" :src="apple" width="36" /></el-col>
      <el-col :span="8"><img class="icon" :src="telegram" width="36" /></el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import logo from '@@/public/images/LOGO3.png';
import google from '@@/public/images/Google.png';
import apple from '@@/public/images/apple.png';
import telegram from '@@/public/images/telegram.png';
import { rules } from "@/utils/validationRules";
import { ElForm } from "element-plus";
import { useRouter } from "vue-router";
const router = useRouter();
const {  systemApi } = useServer();
const formRef: any = ref(null);
const isAgreement = ref(false);

// 表单数据
const form = ref({
  email: '',
});

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
      if (!isAgreement.value) {
        ElMessage.error('请先同意auPay用户协议');
        return;
      }
      let res = await systemApi.sendRegEmail({email: form.value.email}, {});
      if (res.code === 200) {
        ElMessage.success('email发送成功');
        setTimeout(() => {
          router.push('/user/register/stepReg?email='+ form.value.email);
          }, 300);
      } else {
        ElMessage.error(res.message);
      }
    }
}


/**
 * 导航到登录页面
 */
const navigateToLogin = () => {
  router.push('/user/login');
};

</script>

<style scoped>
*{
  font-size: 14px;
}
.page {
  height: 100vh;
  position: relative;
  padding: 32px;
}
.logo {
  width: 179px;
  height: 57px;
  margin-top: 170px;
}
.regTips {
  height: 25px;
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 28px;
}
.agreement{
  font-weight: normal;
  font-size: 12px !important;
  position: relative;
  top: -10px;
}
.input_box{
  :deep .el-input{
    width: 100%;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep .el-input__wrapper {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep .checkbox__label{
    color: #dcdcdc !important;
  }
  :deep .el-form-item__error{
    padding-left: 14px;
  }
  :deep .el-checkbox__label{
    font-weight: normal !important;
  }
}
.icon-container{
  padding: 0 50px ;
  margin: 160px auto;
  text-align: center;
}
.custom-button{
  background: #5686E1;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  line-height: 22.5px;
  height: 56px;
  color: #fff;
  border: 0;
  border-radius: 16px;
}
.href-text{
  text-align: center;
}

</style>
