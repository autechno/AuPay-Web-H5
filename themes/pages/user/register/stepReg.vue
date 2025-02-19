<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">注册auPayID</div>
      <el-form :model="form" :rules="formRules" ref="formRef" class="custom-input"  @submit.prevent="handleSubmit">
        <el-form-item prop="email" >
          <el-input v-model="form.email" disabled placeholder="请输入邮箱"  />
        </el-form-item>
        <el-form-item label="" prop="emailCode" style="position: relative">
          <el-input v-model="form.emailCode" placeholder="邮箱验证码" />
          <div class="emailCode" @click="resetBtn">{{ emailText }}</div>
        </el-form-item>
        <!-- 使用 PasswordStrength 组件 -->
        <PasswordStrength :password="form.password" :isVisible="passwordLevelVisible" />
        <el-form-item label="" prop="password">
          <el-input v-model="form.password"  @focus="passwordLevelVisible = true" @blur="passwordLevelVisible = false" placeholder="设置登录密码" :type="passwordVisible ? 'text' : 'password'" />
          <i @click.stop="passwordVisible = !passwordVisible" :class="passwordVisible ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="再次输入登录密码" :type="passwordVisible2 ? 'text' : 'password'" />
          <i @click.stop="passwordVisible2 = !passwordVisible2" :class="passwordVisible2 ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
        <el-form-item>
          <button class="custom-button" native-type="submit">确认</button>
        </el-form-item>
      </el-form>
      <div class="href-text" @click="navigateToLogin">使用其它方式<span style="color: #5686E1">直接登录</span></div>
  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO.svg';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";
import { useRouter, useRoute } from "vue-router";
import PasswordStrength from '@/composables//PasswordStrength.vue'; // 引入新组件

const { userApi, systemApi } = useServer();
const formRef: any = ref(null);
let timer: NodeJS.Timeout | null = null;
const router = useRouter();
const route = useRoute();
const passwordVisible = ref(false);
const passwordVisible2 = ref(false);
const passwordLevelVisible = ref(false);
const email = ref(route.query.email || '');
const emailText = ref('发送验证');
const countdown = ref(60);

// 表单数据
const form = ref({
  email: email.value,
  password: '',
  assetsPassword: '',
  confirmPassword: '',
  emailCode: '',
});

// 自定义验证器：确认密码
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.value.password) {
    callback(new Error('确认密码与密码不一致'));
  } else {
    callback();
  }
};
const formRules = {
  ...rules,
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { min: 8, message: '确认密码长度至少为8位', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
};

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
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    let res = await userApi.register(form.value, {});
    if (res.code === 200) {
      const userStore = UseUserStore();
      userStore.setTokenState(res.data);
      router.push('/user/register/stepBind');

    } else {
      showErrorMessage(res.code, res.message)
    }
  }
}

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendRegEmail({email: form.value.email}, {});
  if (res.code === 200) {
    showSuccessMessage(0, 'email发送成功');
    startCountdown();
  } else {
    showErrorMessage(res.code, res.message);
  }
}

/**
 * 导航到登录页面
 */
const navigateToLogin = () => {
  router.push('/user/login');
};

onMounted(() => {
  startCountdown();
});

</script>

<style scoped>
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
  width: 104px;
  height: 25px;
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 28px;
}

.custom-input{
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

.href-text{
  text-align: center;
}

</style>
