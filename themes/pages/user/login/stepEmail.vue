<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">请输入{{email}}收到的验证码</div>
    <el-form :model="form" :rules="rules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
      <el-form-item label="" prop="emailCode">
        <el-input v-model="form.emailCode" type="emailCode" placeholder="密码" />
      </el-form-item>
      <el-form-item>
        <el-button class="custom-button" native-type="submit">{{ submitText }}</el-button>
      </el-form-item>
    </el-form>
    <div class="href-text" @click="navigateToLogin">使用其它方式<span style="color: #5686E1">登录</span></div>
  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO3.png';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";
const { userApi, systemApi } = useServer();
const formRef: any = ref(null);
let timer: NodeJS.Timeout | null = null;
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const firstLogin = ref(route.query.firstLogin || 0);
const validateKey = ref(route.query.validateKey);
const email = ref(route.query.email || '');
const submitText = ref('确认（60S）');
const countdown = ref(60);


// 开始倒计时
const startCountdown = () => {
  countdown.value = 60;
  submitText.value = `确认（${countdown.value}S）`;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
      submitText.value = `确认（${countdown.value}S）`;
    } else {
      clearInterval(timer!);
      timer = null;
      submitText.value = '再次发送（0S）';
    }
  }, 1000);
};


// 表单数据
const form = ref({
  emailCode: '',
});

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    if (countdown.value == 0) {
      sendEamil();
      return;
    }
    let res = await userApi.loginValidateEmail({
      validateKey: validateKey.value,
      emailCode: form.value.emailCode,
    }, {});
    if (res.code === 200) {
      const userStore = UseUserStore();
      userStore.setTokenState(res.data);
      let result = await userStore.fetchUserInfo();
      if(result){
        if(firstLogin.value == 1) {
          window.location.href = '/user/info'
        }else{
          window.location.href = '/assets-account'
        }
      }
    } else {
      ElMessage.error(res.message || '登录失败'); // 错误提示
    }
  }
}

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendRegEmail({email: email}, {});
  if (res.code === 200) {
    ElMessage.success('email发送成功');
    startCountdown();
  } else {
    ElMessage.error(res.message);
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
  padding: 0 10px;
}
.logo {
  width: 179px;
  height: 57px;
  margin-top: 170px;
}
.regTips {
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 28px;
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
