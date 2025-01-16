
<template>
  <div class="page">
    <h1>账户信息</h1>
    <div style="padding-bottom: 20px;">账户：{{ form.email }}</div>
    <div>登录密码： <span><a href="javascript:;" @click="handleValidate(3)">设置登录密码</a></span></div>
    <div>交易密码： <span><a href="javascript:;" @click="handleValidate(2)">设置交易密码</a></span></div>
    <h1>三方授权</h1>
    <div class="content">
      <div class="status-item" v-for="item in statusList" :key="item.key">
        <span>{{ item.name }}</span>
        <el-icon :size="20" v-if="item.key">
          <component :is="item.status ? Check : Close" />
        </el-icon>
        <span v-if="item.status"><a href="javascript:;">解绑</a></span>
        <span v-else><a href="javascript:;">绑定</a></span>
      </div>
    </div>
    <h1>验证器</h1>
    <div class="content">
      <div class="status-item" >
        <span>Google Authenticator </span>
        <span v-if="form.bindGoogleAuth"><a href="javascript:;">重新绑定</a> | <a href="javascript:;">删除</a></span>
        <span v-else><a href="javascript:;">绑定</a></span>
      </div>
    </div>

    <!-- 创建密码验证对话框 -->
    <el-dialog :title="title" v-model="dialogCheckVisible">
      <el-form :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleCheck">
        <el-form-item  label="邮箱" >
          <el-input :value="form.email" disabled />
        </el-form-item>
        <el-form-item  v-if="activeStepId == 1" label="邮箱验证码" prop="emailCode">
          <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" />
        </el-form-item>
        <el-form-item v-if="activeStepId == 2" label="身份验证器APP验证码" prop="googleCode" >
          <el-input v-model="form.googleCode" placeholder="请输入6位验证码" />
        </el-form-item>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCheckVisible = false">取 消</el-button>
        <el-button type="primary" native-type="submit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>

    <el-dialog title="设置密码" v-model="dialogVisible">
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item label="" prop="newPassword">
          <el-input v-model="form.newPassword" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请输入确认密码" />
        </el-form-item>
        <div class="social-login">
          <el-button type="primary" class="social-btn" native-type="submit">确认</el-button>
        </div>
      </el-form>
    </el-dialog>

  </div>
</template>
<script setup lang="ts">

import {ref, onMounted} from 'vue';
import {Check, Close} from "@element-plus/icons-vue";
import { getHeader } from "@/utils/storageUtils";
import {ElForm} from "element-plus";
const headers = getHeader();
const { systemApi, userApi } = useServer();
const activeStepId = ref(1);
const formRef: any = ref(null);
const title = ref("邮箱验证码")
const form = ref({
  bindGoogleAuth: false,
  bindEmail: false,
  email: '',
  emailCode: '',
  googleCode: '',
  newPassword: '',
  confirmPassword: '',
  optToken: '',
  googleToken: '',
  emailCodeToken: '',
  validateKey: '',
  type: 1
})

const dialogCheckVisible = ref(false);
const dialogVisible = ref(false);
/**
 * 自定义验证器：确认密码
 */
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.value.newPassword) {
    callback(new Error('确认密码与密码不一致'));
  } else {
    callback();
  }
};

// 表单验证规则
const rules = {
  newPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { min: 6, message: '确认密码长度至少为6位', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
  emailCodeToken: [
    { required: true, message: '邮箱验证码不能为空', trigger: 'blur' },
  ],
};
const statusList = ref([
  { name: '绑定Google登录', key: 'bindGoogleLogin', status: false },
  { name: 'Apple验证', key: 'bindAppleLogin', status: false },
  { name: 'Telegram验证', key: 'bindFacebookLogin', status: false },
]);

const handleValidate = async (type: number) =>{
  let permissionRes = await systemApi.assetsFlashPermission({permissionId: type}, headers);
  if(permissionRes.code == 200) {
    form.value.type = type;
    form.value.optToken = permissionRes.data.optToken;
    let verifyMethods = permissionRes.data.verifyMethods;
    form.value.bindGoogleAuth = verifyMethods.includes("GOOGLEAUTHENICATOR");
    form.value.bindEmail = verifyMethods.includes("EMAIL");
    // 判断如果密码不验证，直接跳到google验证吗
    if(form.value.bindEmail){
      let sendRes = await systemApi.sendUpdateEmail({ email: form.value.email, optToken: form.value.optToken},  headers);
      if (sendRes.code === 200) {
        dialogCheckVisible.value = true;
        ElMessage.success('email已发送到' + form.value.email +"邮箱");
      }
    }else{
      activeStepId.value == 2
    }
  }else {
    ElMessage.error(permissionRes.message);
  }
}

// 验证密码
const handleCheck = async () => {
  try {
    if(activeStepId.value == 1){
      let validateRes = await systemApi.sendValidateEmail({ emailCode: form.value.emailCode, optToken: form.value.optToken}, headers);
      if (validateRes.code === 200) {
        form.value.emailCodeToken = validateRes.data;
        if(form.value.bindGoogleAuth){
          title.value = 'google 验证器';
          activeStepId.value = 2;
        }else{
          processFunc();
        }
      } else {
        ElMessage.error(validateRes.message);
      }
    }else if(activeStepId.value == 2) {
      let googleRes = await systemApi.verifyValidateGoogle({
        googleCode: form.value.googleCode,
        optToken: form.value.optToken
      }, headers);
      if (googleRes.code == 200) {
        form.value.googleToken = googleRes.data;
        processFunc();
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
        headers['Email-Token'] = form.value.emailCodeToken;
        if(form.value.googleToken != ''){
          headers['Google-Auth-Token'] = form.value.googleToken;
        }
        let res;
        if(form.value.type == 3){
          res = await userApi.updatePassword(form.value, headers);
        }else{
          res = await userApi.updateAssetsPassword(form.value, headers);
        }
        if (res.code === 200) {
          window.location.reload();
          ElMessage.success("密码重置成功");
        } else {
          ElMessage.error(res.message);
        }
      }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 执行
const processFunc = async() =>{
  dialogCheckVisible.value = false;
  activeStepId.value = 1
  dialogVisible.value = true;
  form.value.emailCode = ''
  form.value.googleCode = ''
}

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  const userInfo = userStore.userInfo;
  form.value.email = userInfo.email;
  form.value.bindGoogleAuth = userInfo.bindGoogleAuth;
  statusList.value.forEach(statusItem => {
    statusItem.status = userInfo[statusItem.key];
  });
});
</script>
<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.status-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
</style>
