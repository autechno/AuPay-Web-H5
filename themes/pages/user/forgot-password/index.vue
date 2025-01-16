<template>
  <div class="login-container">
    <div class="container">
      <h2>{{title}}</h2>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <div v-if="activeStepId == 1">
          <el-form-item label="" prop="email">
            <el-input v-model="form.email" placeholder="请输入邮箱" />
          </el-form-item>
          <div class="links">
            <a href="javascript: void(0);" @click="sendEamil">点击获取邮箱验证码</a>
          </div>
          <el-form-item label="" prop="emailCode">
            <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" />
          </el-form-item>
        </div>
        <el-form-item v-if="activeStepId == 2" label="身份验证器APP验证码" prop="googleCode">
          <el-input v-model="form.googleCode" placeholder="请输入6位验证码" />
        </el-form-item>
        <div v-if="activeStepId == 3">
          <el-form-item label="" prop="password">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" type="password" placeholder="请输入确认密码" />
          </el-form-item>
        </div>
        <div class="social-login">
          <el-button type="primary" class="social-btn" native-type="submit">{{ btnName }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import {useRouter, useRoute} from 'vue-router';
import { getHeader } from '@/utils/storageUtils';
const headers = getHeader();
const { userApi, systemApi } = useServer();
const route = useRoute();
const activeStepId = ref(route.query.stepId || 1);
const title = ref('忘记密码');

// 表单引用
const btnName = ref('确定');
const formRef: any = ref(null);
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
const rules = {
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { min: 6, message: '确认密码长度至少为6位', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
};

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendResetEmail({email: form.value.email}, {});
  if (res.code === 200) {
    form.value.validateKey = res.data;
    ElMessage.success('email发送成功');
  } else {
    ElMessage.error(res.message);
  }
}
/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
      if (activeStepId.value == 1) {
        let res = await systemApi.sendResetValidateEmail(form.value, {});
        if (res.code === 200) {
          form.value.emailCodeToken = res.data.emailCodeToken;
          if(res.data.bindGoogleAuth){
            title.value = 'google 验证器';
            activeStepId.value = 2;
          }else{
            title.value = '设置新密码';
            activeStepId.value = 3;
          }
        } else {
          ElMessage.error(res.message );
        }
      }else if(activeStepId.value == 2) {
        let res = await systemApi.sendResetValidateGoogle(form.value, {});
        if (res.code === 200) {
          form.value.googleCodeToken = res.data;
          activeStepId.value = 3;
        } else {
          ElMessage.error(res.message);
        }
      }else if(activeStepId.value == 3) {
        let res = await userApi.passwrodResetSet(form.value, headers);
        if (res.code === 200) {
          window.location.href = '/user/login';
        } else {
          ElMessage.error(res.message);
        }
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};


</script>

<style scoped>
.login-container {
  width: 340px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  flex-direction: column;
  margin: auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
}

.links {
  font-size: 12px;
  text-align: right;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.social-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
}

.links a {
  cursor: pointer;
  color: #4285f4;
  text-decoration: underline;
}

.links a:disabled {
  color: gray;
  pointer-events: none; /* 禁用时不允许点击 */
}
</style>
