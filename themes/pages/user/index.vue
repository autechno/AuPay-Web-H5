
<template>
  <div class="page">
    <h1>账户信息</h1>
    <div style="padding-bottom: 20px;">账户：{{ baseInfo.email }}</div>
    <div>登录密码： <span><a href="javascript:;" @click="setPassBtn(3)">设置登录密码</a></span></div>
    <div>交易密码： <span><a href="javascript:;" @click="setPassBtn(2)">设置交易密码</a></span></div>
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
        <span v-if="baseInfo.bindGoogleAuth"><a href="javascript:;" @click="checkGoogleAuth('bindGoogle', 13)">重新绑定</a> | <a  href="javascript:;" @click="checkGoogleAuth('delGoogle', 14)">删除</a></span>
        <span v-else><a href="javascript:;" @click="checkGoogleAuth('bindGoogle', 13)">绑定</a></span>
      </div>
    </div>
    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="permissionId"
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
    <!-- 设置密码对话框 -->
    <el-dialog title="设置密码" v-model="isPassDialogVisible">
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
    <!-- 设置Google密码对话框 -->
    <el-dialog v-model="isGoogleDialogVisible" title="设置Google验证码">
      <div style="text-align: center;">
        <img :src="googleForm.qrCode" alt="Google QR Code" style="width: 150px; height: 150px;" />
        <div>{{googleForm.googleSecret}}</div>
        <el-button size="small" @click="copyText(googleForm.googleSecret)">复制</el-button>
        <el-form :model="googleForm" :rules="rules" ref="formRef" label-position="top" style="margin-top: 20px;">
          <el-form-item label="" prop="googleCode">
            <el-input v-model="googleForm.googleCode" placeholder="请输入Google验证码" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="resetGoogleAuth(2)">确认</el-button>
      </span>
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
const formRef: any = ref(null);
const dialogCheckVisible = ref(false);
const permissionId = ref(3);
const isPassDialogVisible = ref(false);
const userStore = UseUserStore();
const isGoogleDialogVisible = ref(false);
import CheckPermissionDialog from '@/composables/CheckPermissionDialog.vue';

/**
 * 基础数据
 */
const form = ref({
  email: '',
  newPassword: '',
  confirmPassword: '',
  optToken: '',
  googleToken: '',
  emailCodeToken: '',
  type: 1,
  paramType: 'password',
})
const baseInfo = ref({
  bindGoogleAuth: false,
  email: '',
})
const googleForm = ref({
  googleCode: '',
  googleSecret: '',
  qrCode: '',
  type: 1,
});

/**
 * 表单验证规则
 * 自定义验证器：确认密码
 */
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== form.value.newPassword) {
    callback(new Error('确认密码与密码不一致'));
  } else {
    callback();
  }
};
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
  ]
};
const statusList = ref([
  { name: '绑定Google登录', key: 'bindGoogleLogin', status: false },
  { name: 'Apple验证', key: 'bindAppleLogin', status: false },
  { name: 'Telegram验证', key: 'bindFacebookLogin', status: false },
]);

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.paramType === 'password') {
    isPassDialogVisible.value = true;
  }else if(form.value.paramType === 'delGoogle'){
    deleteGoogleAuth();
  }else{
    resetGoogleAuth(1);
  }
};

// 设置密码
const setPassBtn = async (type: number) =>{
  form.value.paramType = 'password';
  permissionId.value = type;
  dialogCheckVisible.value = true;
}
// 删除绑定
const deleteGoogleAuth = async () => {
  try {
      let validateRes = await systemApi.resetGoogleAuth({}, headers);
      if (validateRes.code === 200) {
        await userStore.fetchUserInfo();
          ElMessage.error('解绑成功')
          window.location.reload();
      } else {
        ElMessage.error(validateRes.message);
      }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}
const checkGoogleAuth = (type, id) => {
  form.value.paramType = type;
  permissionId.value = id;
  dialogCheckVisible.value = true;
}
// 绑定Google
const resetGoogleAuth = async (type: number) => {
  try {
    googleForm.value.type = type;
    let res = await systemApi.bindGoogleAuth(googleForm.value, headers);
    if (res.code === 200) {
      if(type == 1){
        googleForm.value.googleSecret = res.data.googleSecret;
        googleForm.value.qrCode = res.data.qr;
        isGoogleDialogVisible.value = true;
      }else{
        await userStore.fetchUserInfo();
        ElMessage.error('绑定成功')
        window.location.reload();
      }
    } else {
      ElMessage.error(res.message);
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

// 复制方法
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '成功',
      message: '链接已复制到剪贴板!',
      type: 'success',
      duration: 2000,
    });
  }).catch(err => {
    console.error('复制文本时出错: ', err);
  });
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  const userInfo = userStore.userInfo;
  baseInfo.value.email = userInfo.email;
  form.value.email = userInfo.email;
  baseInfo.value.bindGoogleAuth = userInfo.bindGoogleAuth;
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
