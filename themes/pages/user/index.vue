
<template>
  <div class="page">
    <h1>账户信息</h1>
    <div style="padding-bottom: 20px;">账户：{{ baseInfo.email }}</div>
    <div>登录密码： <span><a href="javascript:;" @click="setPassBtn(3)">设置登录密码</a></span></div>
    <div>资金密码： <span><a href="javascript:;" @click="setPassBtn(2)">设置资金密码</a></span></div>
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
      <el-form :model="form" :rules="formRules" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item label="" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
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
        <el-form :model="googleForm" :rules="formRules" ref="formRef" label-position="top" style="margin-top: 20px;">
          <el-form-item label="" prop="googleCode">
            <el-input v-model="googleForm.googleCode" placeholder="请输入Google验证码" />
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="bingGoogleAuth(2)">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">

import {ref, onMounted} from 'vue';
import {Check, Close} from "@element-plus/icons-vue";
import { getHeader } from "@/utils/storageUtils";
import { setHeadersAuth, copyText } from "@/utils/funcUtil";
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
const headers = getHeader();
const { systemApi, userApi } = useServer();
const formRef: any = ref(null);
const dialogCheckVisible = ref(false);
const permissionId = ref(3);
const isPassDialogVisible = ref(false);
const userStore = UseUserStore();
const isGoogleDialogVisible = ref(false);
import CheckPermissionDialog from '@/composables/CheckPermissionDialog.vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();


/**
 * 基础数据
 */
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  optToken: '',
  googleToken: '',
  emailCodeToken: '',
  passwordToken: '',
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
    bingGoogleAuth(1);
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
    setHeadersAuth(headers, form);
    let validateRes = await systemApi.resetGoogleAuth({optToken: form.value.optToken}, headers);
    if (validateRes.code === 200) {
      await userStore.fetchUserInfo();
        ElMessage.success('解绑成功')
        window.location.reload();
    } else {
      ElMessage.error(validateRes.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}
const checkGoogleAuth = (type: number, id: number) => {
  form.value.paramType = type;
  permissionId.value = id;
  dialogCheckVisible.value = true;
}
// 绑定Google
const bingGoogleAuth = async (type: number) => {
  try {
    setHeadersAuth(headers, form);
    let res = await systemApi.bindGoogleAuth({
      googleSecret: googleForm.value.googleSecret,
      googleCode: googleForm.value.googleCode,
      optToken: form.value.optToken,
      type: type,
    }, headers);
    if (res.code === 200) {
      if(type == 1){
        googleForm.value.googleSecret = res.data.googleSecret;
        googleForm.value.qrCode = res.data.qr;
        isGoogleDialogVisible.value = true;
      }else{
        await userStore.fetchUserInfo();
        ElMessage.success('绑定成功')
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
      setHeadersAuth(headers, form);
        let res;
        let params = {
          newPassword: form.value.password,
          optToken: form.value.optToken,
        };
        if(permissionId.value == 3){
          res = await userApi.updatePassword(params, headers);
        }else{
          res = await userApi.updateAssetsPassword(params, headers);
        }
        if (res.code === 200) {
          setTimeout(() => {
            if(permissionId.value == 3){
              logout();
            }else{
              window.location.reload();
            }
          }, 300);
          ElMessage.success("密码重置成功");
        } else {
          ElMessage.error(res.message);
        }
      }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 处理下拉菜单命令
const logout = async () => {
  let res = await userApi.logout({}, headers);
  if (res.code === 200) {
    const userStore = UseUserStore();
    userStore.clearUserState()
    router.push("/user/login");
  }
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
