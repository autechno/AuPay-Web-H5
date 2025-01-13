<template>
  <div class="login-container">
    <h2>登录</h2>
    <div v-if="activeStepId == 1">
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item label="" prop="username">
          <el-input v-model="form.username" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <div style="height: 30px;">
          <div class="links" >
            <a class="left-link" href="/user/forgot-password">忘记密码?</a>
            <a class="right-link" href="/user/register">注册新账号</a>
          </div>
        </div>
        <div class="social-login">
          <el-button type="primary" class="social-btn" native-type="submit">账户密码登录</el-button>
        </div>
      </el-form>
      <div class="social-login" style="margin-top: 30px;">
        <el-button type="primary" >Google账户登录</el-button>
      </div>
    </div>
    <div v-if="activeStepId == 2">
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item label="" prop="username">
          <el-input v-model="form.username" disabled placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="" prop="code" >
          <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" />
        </el-form-item>
        <div class="social-login">
          <el-button type="primary" class="social-btn" native-type="submit">登录</el-button>
        </div>
      </el-form>
      <div class="social-login" style="margin-top: 30px;">
        <el-button type="primary" >Google账户登录</el-button>
      </div>
    </div>
  </div>
  <!-- 真人验证弹窗 -->
  <el-dialog
      title="真人验证"
      v-model="dialogVisible"
      width="300px"
      height="500px"
  >
    <div>
      <p>请拖动滑块进行验证</p>
      <el-slider v-model="sliderValue" :min="0" :max="100" @change="handleSliderChange" />
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
      </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import {useRouter, useRoute} from 'vue-router';
import { getHeader } from '@/utils/storageUtils';
const headers = getHeader();
const { userApi } = useServer();
const route = useRoute();
const router = useRouter();
const activeStepId = ref(route.query.stepId || 1);

// 表单引用
const formRef: any = ref(null);
const dialogVisible = ref(false);
const sliderValue = ref(0);

// 表单数据
const form = ref({
  username: 'yoney.zhang@autech.one',
  password: 'cook1234',
  validateKey: '',
  emailCode: '',
});

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  const userStore = UseUserStore();
  const baseStore = UseBaseStore();
  try {
    if (valid) {
        if (activeStepId.value == 1) {
            let res = await userApi.login(form.value, {});
            if (res.code === 200) {
              activeStepId.value = 2;
              form.value.validateKey = res.data
              ElMessage.success('邮箱验证码已发送到您邮箱');
              console.log(form.value)
            } else {
              ElMessage.error(res.message || '登录失败'); // 错误提示
            }
        } else {
          let res = await userApi.loginValidateEmail(form.value, {});
          if (res.code === 200) {
            userStore.setTokenState(res.data);
            dialogVisible.value = true;
          } else {
            ElMessage.error(res.message || '登录失败'); // 错误提示
          }
        }
    } else {
      console.error('输入无效');
      return false;
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

const handleSliderChange = (value) => {
  if (value === 100) {
    ElMessage.success('验证成功！');
    setTimeout(() => {
      window.location.href = '/user/info'
    }, 500); // 1秒后跳转
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
  display: flex;
  justify-content: space-between; /* 左右两边对齐 */
  margin: 0 0 30px 0;
}

.left-link, .right-link {
  text-decoration: none;
  font-size: 12px;
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

.social-btn:hover {
  background-color: #357ae8;
}
</style>