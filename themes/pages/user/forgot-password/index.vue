<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">{{tips}}</div>
    <el-form :model="form" :rules="formRules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
      <div v-if="activeStepId == 1">
        <el-form-item prop="email" >
          <el-input v-model="form.email" placeholder="请输入邮箱"  />
        </el-form-item>
        <el-form-item label="" v-if="flag" prop="emailCode" style="position: relative;">
          <el-input v-model="form.emailCode" placeholder="邮箱验证码" />
          <div class="emailCode" @click="resetBtn">{{ emailText }}</div>
        </el-form-item>
      </div>
      <el-form-item v-if="activeStepId == 2" prop="googleCode">
        <el-input v-model="form.googleCode" placeholder="请输入6位验证码" />
      </el-form-item>
      <div v-if="activeStepId == 3">
        <el-form-item prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" :type="passwordVisible ? 'text' : 'password'" />
          <i @click.stop="passwordVisible = !passwordVisible" :class="passwordVisible ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="请输入确认密码" :type="passwordVisible2 ? 'text' : 'password'" />
          <i @click.stop="passwordVisible2 = !passwordVisible2" :class="passwordVisible2 ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
      </div>
      <el-form-item>
        <button class="custom-button" native-type="submit">确定</button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import logo from '@@/public/images/LOGO.svg';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import {getHeader} from "@/utils/storageUtils";
const { userApi, systemApi } = useServer();
const formRef: any = ref(null);
let timer: NodeJS.Timeout | null = null;
const activeStepId = ref(1);
const flag = ref(false);
const headers = getHeader();
const emailText = ref('发送验证');
const tips = ref('找回密码');
const countdown = ref(0);
const passwordVisible = ref(false);
const passwordVisible2 = ref(false);

// 在次发送email验证码
const resetBtn = () =>{
  if (countdown.value == 0) {
    sendEamil();
    return;
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  emailText.value = `${countdown.value}S`;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
      emailText.value = `${countdown.value}S`;
    } else {
      clearInterval(timer!);
      timer = null;
      emailText.value = '发送验证';
    }
  }, 1000);
};

/**
 * 表单验证规则
 * 自定义验证器：确认密码
 */
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.value.password) {
    callback(new Error('确认密码与密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const formRules = {
  ...rules,
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { min: 8, message: '确认密码长度至少为8位', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
};


// 表单数据
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  validateKey: '',
  emailCode: '',
  emailCodeToken: '',
  googleCode: '',
  googleCodeToken: ''
});

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    if(activeStepId.value == 1) {
      if(form.value.emailCode){
        let res = await systemApi.sendResetValidateEmail(form.value, {});
        if (res.code === 200) {
          form.value.emailCodeToken = res.data.emailCodeToken;
          if(res.data.bindGoogleAuth){
            tips.value = 'Google App验证码';
            activeStepId.value = 2;
          }else{
            tips.value = '设置新密码';
            activeStepId.value = 3;
          }
          clearInterval(timer!);
          timer = null;
        } else {
          ElMessage.error(res.message );
        }
      }else{
        sendEamil();
      }
    }else if(activeStepId.value == 2) {
      let res = await systemApi.sendResetValidateGoogle(form.value, {});
      if (res.code === 200) {
        form.value.googleCodeToken = res.data;
        tips.value = '设置新密码';
        activeStepId.value = 3;
      } else {
        ElMessage.error(res.message);
      }
    }else {
      let res = await userApi.passwrodResetSet(form.value, {});
      if (res.code === 200) {
        ElMessage.success('重置密码成功，请重新登录');
        setTimeout(() => {
          window.location.href = '/user/login';
        }, 500);
      } else {
        ElMessage.error(res.message);
      }
    }
  }
}

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendResetEmail({email: form.value.email}, {});
  if (res.code === 200) {
    form.value.validateKey = res.data;
    ElMessage.success('email发送成功');
    flag.value = true;
    startCountdown();
  } else {
    ElMessage.error(res.message);
  }
}


</script>

<style scoped>
*{
  font-size: 14px;
}
.page {
  position: relative;
  padding: 0 30px;
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

.input_box{
  :deep(.el-input){
    width: 100%;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  .emailCode{
    height: 28px;
    padding: 5px 20px;
    color: #5686E1;
    position: absolute;
    right: 5px;
    top: 8px;
  }
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.checkbox__label){
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error){
    padding-left: 14px;
  }
  :deep(.el-checkbox__label){
    font-weight: normal !important;
  }
}
.icon-container{
  padding: 0 50px ;
  margin: 160px auto;
  text-align: center;
}
.href-text{
  text-align: center;
}

</style>
