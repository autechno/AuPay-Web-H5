<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">注册auPayID</div>
      <el-form :model="form" :rules="formRules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
        <el-form-item prop="email" >
          <el-input v-model="form.email" disabled placeholder="请输入邮箱"  />
        </el-form-item>
        <el-form-item label="" prop="emailCode">
          <el-input v-model="form.emailCode" placeholder="邮箱验证码" />
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input v-model="form.password" type="password" placeholder="设置登录密码" />
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入登录密码" />
        </el-form-item>
        <el-form-item>
          <el-button class="custom-button" native-type="submit">{{ submitText }}</el-button>
        </el-form-item>
      </el-form>
      <div class="href-text" @click="navigateToLogin">使用其它方式<span style="color: #5686E1">直接登录</span></div>
  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO3.png';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";
import { useRouter, useRoute } from "vue-router";
const { userApi, systemApi } = useServer();
const formRef: any = ref(null);
let timer: NodeJS.Timeout | null = null;
const router = useRouter();
const route = useRoute();

const email = ref(route.query.email || '');
const submitText = ref('确认（60S）');
const countdown = ref(60);

// 自定义验证器：确认密码
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
  email: email.value,
  password: '',
  assetsPassword: '',
  confirmPassword: '',
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
    let res = await userApi.register(form.value, {});
    if (res.code === 200) {
      const userStore = UseUserStore();
      userStore.setTokenState(res.data);
      router.push('/user/register/stepBind');
    } else {
      ElMessage.error(res.message || '注册失败');
    }
  }
}

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendRegEmail({email: form.value.email}, {});
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
  router.push('/user/login'); // 跳转到 /user/login
};

onMounted(() => {
  startCountdown();
});

</script>

<style scoped>
*{
  font-size: 14px;
}
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
  width: 104px;
  height: 25px;
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

.href-text{

  text-align: center;
}

</style>
