
<template>
  <div class="page">
    <GoBack  />
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
        <span v-if="item.status" @click="checkBindAuth('unBindGoogleLogin', 16)">解绑</span>
        <span v-else @click="checkBindAuth('bindGoogleLogin', 15)">绑定</span>
      </div>
    </div>
    <h1>验证器</h1>
    <div class="content">
      <div class="status-item" >
        <span>Google Authenticator </span>
        <span v-if="baseInfo.bindGoogleAuth"><a href="javascript:;" @click="checkBindAuth('bindGoogle', 13)">重新绑定</a> | <a  href="javascript:;" @click="checkBindAuth('delGoogle', 14)">删除</a></span>
        <span v-else><a href="javascript:;" @click="checkBindAuth('bindGoogle', 13)">绑定</a></span>
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
    <el-dialog class="custom-dialog"  v-model="isPassDialogVisible" :show-close="false" :close-on-click-modal="false">
      <div class="custom-dialog-wrap"> 设置密码 </div>
      <el-form :model="form" :rules="formRules" ref="formRef" class="custom-input" @submit.prevent="handleSubmit">
        <!-- 使用 PasswordStrength 组件 -->
        <PasswordStrength :password="form.password" :isVisible="passwordLevelVisible" />
        <el-form-item label="" prop="password">
          <el-input v-model="form.password"  @focus="passwordLevelVisible = true" @blur="passwordLevelVisible = false" placeholder="请输入密码" :type="passwordVisible ? 'text' : 'password'"  />
          <i @click.stop="passwordVisible = !passwordVisible" :class="passwordVisible ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
        <el-form-item label="" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" placeholder="请输入确认密码" :type="passwordVisible2 ? 'text' : 'password'"  />
          <i @click.stop="passwordVisible2 = !passwordVisible2" :class="passwordVisible2 ? 'icon-eye' : 'icon-eye-no'"></i>
        </el-form-item>
        <div class="btn-wrap">
          <button class="custom-button"  native-type="submit">确认</button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 设置Google密码对话框 -->
    <el-dialog class="custom-dialog"  v-model="isGoogleDialogVisible" :show-close="false" :close-on-click-modal="false">
      <div class="custom-dialog-wrap"> 设置Google验证码 </div>
      <div class="tips-wrap">一旦遗失本方不负责找回，请截图保存 二维码或字符可以在任意设备恢复您的谷歌验证器</div>
      <div class="google-wrap">
        <el-image :src="googleForm.qrCode" style="width: 250px; height: 250px;" />
        <div class="text-wrap" @click="copyText(googleForm.googleSecret)">{{formatAddressString(googleForm.googleSecret, 10, 15)}} <el-image :src="copy" /></div>
        <div class="text-wrap" style="color:#999999;">如您无法扫描二维码，请在APP中手动输入这串</div>
        <el-form :model="googleForm" :rules="rules" ref="formRef" class="custom-input">
          <el-form-item prop="googleCode">
            <el-input v-model="googleForm.googleCode" placeholder="请输入Google验证码" />
          </el-form-item>
        </el-form>
      </div>
      <div style="margin-top: 35px;">
        <button class="custom-button" @click="bingGoogleAuth(2)">确认</button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">

import {ref, onMounted} from 'vue';
import {Check, Close} from "@element-plus/icons-vue";
import { getHeader } from "@/utils/storageUtils";
import { setHeadersAuth, copyText } from "@/utils/funcUtil";
import CheckPermissionDialog from '@/composables/CheckPermissionDialog.vue';
import { useRouter, useRoute } from 'vue-router';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import GoBack from "@/composables/GoPageBack.vue";
import PasswordStrength from "@/composables/PasswordStrength.vue";
import copy from "~~/public/images/copy2.svg";
const headers = getHeader();
const { systemApi, userApi } = useServer();
const formRef: any = ref(null);
const dialogCheckVisible = ref(false);
const permissionId = ref(3);
const isPassDialogVisible = ref(false);
const isGoogleDialogVisible = ref(false);
const router = useRouter();
const route = useRoute();
const { public: { API_HOST } } = useRuntimeConfig();
const tmpForm = ref('')
const passwordVisible = ref(false);
const passwordVisible2 = ref(false);
const passwordLevelVisible = ref(false);

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

// 绑定登录
const bindLogin = async (key: string) => {
  if(key == 'bindGoogleLogin'){
    window.location.href = API_HOST + '/oz-client-auth/oauth2/authorize/google?action=bind'
  }
}


// 解除绑定
const unBindLogin = async (key: string) => {
  let res;
  if(key == 'bindGoogleLogin'){
    setHeadersAuth(headers, form);
    res = await  userApi.getUnbindGoogle({optToken: form.value.optToken, providerType: 'google'}, headers);
  }
  if(res.code == 200) {
    const userStore = UseUserStore();
    userStore.userInfo[key] = false;
    fetchData();
    ElMessage.success('解绑成功')
  }else{
    ElMessage.error(res.message);
  }
}

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.paramType === 'password') {
    form.value.password = '';
    form.value.confirmPassword = '';
    isPassDialogVisible.value = true;
  }else if(form.value.paramType === 'delGoogle'){
    deleteGoogleAuth();
  }else if(form.value.paramType === 'unBindGoogleLogin'){
    unBindLogin('bindGoogleLogin');
  }else if(form.value.paramType === 'bindGoogleLogin'){
    localStorage.setItem('bindGoogleLogin', JSON.stringify(form.value));
    bindLogin('bindGoogleLogin');
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
    const userStore = UseUserStore();
    setHeadersAuth(headers, form);
    let validateRes = await systemApi.resetGoogleAuth({optToken: form.value.optToken}, headers);
    if (validateRes.code === 200) {
      // 设置google 绑定器
      userStore.userInfo.bindGoogleAuth = false;
      baseInfo.value.bindGoogleAuth = false;
      ElMessage.success('解绑成功')
    } else {
      ElMessage.error(validateRes.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}
const checkBindAuth = (type: number, id: number) => {
  form.value.paramType = type;
  permissionId.value = id;
  dialogCheckVisible.value = true;
}
// 绑定Google
const bingGoogleAuth = async (type: number) => {
  try {
    const userStore = UseUserStore();
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
        isGoogleDialogVisible.value = false;
        // 设置google 绑定器
        userStore.userInfo.bindGoogleAuth = true;
        baseInfo.value.bindGoogleAuth = true;
        ElMessage.success('绑定成功')
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
  try {
    const valid = await formRef.value.validate();
    if (valid) {
      const userStore = UseUserStore();
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
          isPassDialogVisible.value = false;
          setTimeout(() => {
            if(permissionId.value == 3){
              logout();
            }else{
              // 设置资金密码状态
              userStore.userInfo.setAssetsPassword = true;
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

// 获取数据
const fetchData = async () => {
  try {
    const userInfo = UseUserStore().userInfo;
    baseInfo.value.email = userInfo.email;
    baseInfo.value.bindGoogleAuth = userInfo.bindGoogleAuth;
    form.value.email = userInfo.email;
    statusList.value.forEach(item => {
      if (item.key && userInfo[item.key] !== undefined) {
        item.status = userInfo[item.key];
      }
    });
  } catch (error) {
    ElMessage.error('获取用户信息失败');
  }
};

// 初始化数据
onMounted(async () => {
  let providerType = route.query.providerType || '';
  let providerId = route.query.providerId || '';
  if(providerType && providerId){
    const headers = getHeader();
    let res;
    if(providerType == 'google'){
      tmpForm.value = JSON.parse(localStorage.getItem('bindGoogleLogin'));
      setHeadersAuth(headers, tmpForm);
      res = await userApi.setBindGoogle({providerType: 'google', providerId: providerId, optToken: tmpForm.value.optToken}, headers);
      if(res.code == 200 && res.data) {
        const userStore = UseUserStore();
        userStore.userInfo.bindGoogleLogin = true;
        // window.location.href = '/user';
      }else{
        ElMessage.error(res.message);
      }
    }
  }
  await fetchData();
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
.btn-wrap{
  margin-top: 35px;
}
.custom-input{
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
</style>
