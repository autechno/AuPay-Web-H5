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
        <button class="custom-button" native-type="submit">账户密码登录</button>
      </el-form-item>
    </el-form>
    <el-row :gutter="20" class="icon-container">
      <el-col :span="8">
        <div class="icon-wrapper" @click="googleBind">
          <img class="icon" :src="google" width="36" />
          <span>Google</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="icon-wrapper">
          <img class="icon" :src="apple" width="36" />
          <span>Apple</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="icon-wrapper">
          <img class="icon" :src="telegram" width="36" />
          <span>Telegram</span>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO.svg';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";

import { useRouter, useRoute } from "vue-router";
import google from '@@/public/images/Google.svg';
import apple from '@@/public/images/apple.svg';
import telegram from '@@/public/images/telegram.svg';
import {getHeader} from "@/utils/storageUtils";

const { userApi  } = useServer();
const formRef: any = ref(null);
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
    const result = await userStore.fetchUserInfo();
    if(result){
        window.location.href = '/assets-account-h5'
    }
  }
})

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
  padding: 0 8% ;
  margin: 160px auto;
  text-align: center;
  color: #999999;
  font-size: 12px;
}
.icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.icon {
  margin-bottom: 8px;
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
