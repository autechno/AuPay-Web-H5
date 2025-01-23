<template>
  <div class="page">
    <img class="logo" :src="logo" alt="logo" />
    <div class="regTips">登录您的auPayID</div>
    <el-form :model="form" :rules="rules" ref="formRef" class="input_box"  @submit.prevent="handleSubmit">
      <el-form-item prop="email" >
        <el-input v-model="form.email" placeholder="邮箱"  />
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

  </div>
</template>

<script setup lang="ts">
import logo from '@@/public/images/LOGO3.png';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref} from "vue";
const { userApi  } = useServer();
const formRef: any = ref(null);
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
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

</script>

<style scoped>
*{
  font-size: 14px;
}
.page {
  position: relative;
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
}
.href-text a{
  color: #657087;
  text-decoration: none;
}

</style>
