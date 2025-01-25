<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">登录您的auPayID</div>
    <el-form :model="form" :rules="rules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
      <el-form-item prop="email" >
        <el-input v-model="form.email" placeholder="请输入邮箱"  />
      </el-form-item>
      <el-form-item label="" prop="password">
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>
      <div class="href-text" >
        <a href="/user/register">注册新账号</a>
        <a href="/user/forgot-password">忘记密码?</a>
      </div>
      <el-form-item>
        <el-button class="custom-button" native-type="submit">账户密码登录</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="20" class="icon-container">
      <el-col :span="8">
        <div class="icon-wrapper" @click="googleBind">
          <img class="icon" :src="google" width="36" />
          <span>Google<br />账户登录</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="icon-wrapper">
          <img class="icon" :src="apple" width="36" />
          <span>Apple<br />账户登录</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="icon-wrapper">
          <img class="icon" :src="telegram" width="36" />
          <span>Telegram<br />账户登录</span>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO3.png';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";
const { userApi  } = useServer();
const formRef: any = ref(null);
import { useRouter, useRoute } from "vue-router";
import google from '@@/public/images/Google.svg';
import apple from '@@/public/images/apple.svg';
import telegram from '@@/public/images/telegram.svg';
const router = useRouter();
const route = useRoute();
const userStore = UseUserStore();
const { public: { API_HOST } } = useRuntimeConfig();
const firstLogin = ref(route.query.firstLogin || 0);
// 表单数据
const form = ref({
  email: '',
  password: '',
});

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    let res = await userApi.login({
      password: form.value.password,
      username: form.value.email,
    }, {});
    if (res.code === 200) {
      ElMessage.success('email发送成功');
      let str = '?validateKey='+ res.data + '&email=' + form.value.email
      if(firstLogin.value == 1){
        str = str + '&firstLogin=1'
      }
      setTimeout(() => {
        router.push('/user/login/stepEmail' + str);
      }, 300);
    } else {
      ElMessage.error(res.message || '登录失败');
    }
  }
}

/**
 * Google 绑定
 */
const googleBind = async () => {
  window.location.href = API_HOST + '/oz-client-auth/oauth2/authorize/google?action=login'
}
// 初始化Google 登录
onMounted(async ()=>{
  let action = route.query.action || '';
  let token = route.query.token || '';
  if(action && token){
    userStore.setTokenState(token);
    let result = await userStore.fetchUserInfo();
    if(result){
      if(userStore.userInfo.country == '' || userStore.userInfo.nickname == '') {
        window.location.href = '/user/info'
      }else{
        window.location.href = '/assets-account'
      }
    }
  }
})

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
.icon-container{
  padding: 0 8% ;
  margin: 160px auto;
  text-align: center;
  color: #999999;
  font-size: 12px;
}
.icon-wrapper {
  display: flex;
  flex-direction: column; /* Stack items vertically */
  align-items: center; /* Center items horizontally */
}
.icon {
  margin-bottom: 8px; /* Space between image and text */
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
  display: flex;
  justify-content: space-between;
  margin: 10px 0 15px 0;
  font-size: 12px;
}
.href-text a{
  color: #657087;
  text-decoration: none;
}

</style>
