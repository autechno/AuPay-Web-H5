<template>
  <div class="page">
    <GoPageBack go-back-to="/user-h5/manage/" />
    <div class="table-list">
      <div class="title-wrap">账号信息</div>
      <div class="text-wrap"><span class="title">账号</span><span>{{form.email}}</span></div>
      <div class="text-wrap" @click="jumpPage('password', {name: '登录密码', permissionId: 3})"><span class="title">登录密码</span><span><i class="setting">设置</i><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap" @click="jumpPage('password', {name: '交易密码', permissionId: 2})"><span class="title">交易密码</span><span><i class="setting">设置</i><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">第三方授权</div>
      <div class="text-wrap">
        <span class="title">Google登录</span>
        <span v-if="bindAccount.googleLogin" @click="checkBindAuth('unBindGoogleLogin', 16)"><i class="setting">解绑</i><el-icon><ArrowRightBold /></el-icon></span>
        <span v-else @click="checkBindAuth('bindGoogleLogin', 15)">未绑定<el-icon><ArrowRightBold /></el-icon></span>
      </div>
      <div class="text-wrap"><span class="title">Apple登录</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">Apple登录</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">验证器</div>
      <div class="text-wrap">
        <span class="title">Google验证器</span>
        <span v-if="bindAccount.googleAuth" @click="checkBindAuth('delGoogle', 14)"><i class="setting">解绑</i><el-icon><ArrowRightBold /></el-icon></span>
        <span v-else @click="checkBindAuth('bindGoogle', 13)">未绑定<el-icon><ArrowRightBold /></el-icon></span>
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
    <!-- 设置Google密码对话框 -->
    <el-dialog class="custom-dialog"  v-model="googleDialogVisible" :show-close="false" :close-on-click-modal="false">
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

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import {ArrowRightBold} from "@element-plus/icons-vue";
import GoPageBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import CheckPermissionDialog from "~/composables/CheckPermissionDialog.vue";
import {copyText, refreshCurrentPage, setHeadersAuth} from "~/utils/funcUtil";
import copy from "@@/public/images/copy2.svg";
import {rules} from "~/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";

const router = useRouter();
const route = useRoute();
const permissionId = ref(13);
const dialogCheckVisible = ref(false);
const googleDialogVisible = ref(false);
const { public: { API_HOST } } = useRuntimeConfig();
const { userApi, systemApi } = useServer();
const jsonForm = ref('')
const bindAccount = ref({
  googleAuth: false,
  googleLogin: false,
})
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  paramType: ''
})
// 表单数据
const headerForm = ref({
  optToken: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  googleCode: '',
  permissionStatus: false
});
// Google验证器Form
const googleForm = ref({
  googleCode: '',
  googleSecret: '',
  qrCode: '',
  type: 1,
});

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  headerForm.value = newForm;
  if(form.value.paramType === 'delGoogle'){
    deleteGoogleAuth();
  }else if(form.value.paramType === 'unBindGoogleLogin'){
    unBindLogin('bindGoogleLogin');
  }else if(form.value.paramType === 'bindGoogleLogin'){
    localStorage.setItem('bindGoogleLogin', JSON.stringify(headerForm.value));
    bindLogin('bindGoogleLogin');
  }else{
    bingGoogleAuth(1);
  }
};

// 绑定登录
const bindLogin = async (key: string) => {
  if(key == 'bindGoogleLogin'){
    window.location.href = API_HOST + '/oz-client-auth/oauth2/authorize/google?action=bind'
  }
}

// 解除登录绑定
const unBindLogin = async (key: string) => {
  try {
    let res;
    if(key == 'bindGoogleLogin'){
      setHeadersAuth(headers, form);
      res = await  userApi.getUnbindGoogle({optToken: headerForm.value.optToken, providerType: 'google'}, headers);
    }
    if (res.code === 200) {
      googleDialogVisible.value = false;
      showSuccessMessage(0, '解绑成功');
      refreshCurrentPage();
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage()
  } finally {
  }
}


// 删除绑定
const deleteGoogleAuth = async () => {
  try {
    setHeadersAuth(headers, headerForm);
    let res = await systemApi.resetGoogleAuth({optToken: headerForm.value.optToken}, headers);
    if (res.code === 200) {
      googleDialogVisible.value = false;
      showSuccessMessage(0, '解绑成功');
      refreshCurrentPage();
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage()
  } finally {
  }
}

// 绑定Google验证器
const bingGoogleAuth = async (type: number) => {
  try {
    setHeadersAuth(headers, headerForm);
    let res = await systemApi.bindGoogleAuth({
      googleSecret: googleForm.value.googleSecret,
      googleCode: googleForm.value.googleCode,
      optToken: headerForm.value.optToken,
      type: type,
    }, headers);
    if (res.code === 200) {
      if(type == 1){
        googleForm.value.googleSecret = res.data.googleSecret;
        googleForm.value.qrCode = res.data.qr;
        googleDialogVisible.value = true;
      }else{
        googleDialogVisible.value = false;
        showSuccessMessage(0, '绑定成功');
        refreshCurrentPage();
      }
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage()
  } finally {
  }
}

// 跳转URL
const jumpPage= (url: string, query: any) => {
  router.push({ path: url, query: query });
}

const checkBindAuth = (type: string, id: number) => {
  form.value.paramType = type;
  permissionId.value = id;
  dialogCheckVisible.value = true;
}

// 初始化
const fetchData = async () => {
  try {
    const userStore = UseUserStore();
    form.value.email =  userStore.userInfo.email;
    const result = await userStore.fetchUserInfo();
    if(result){
      bindAccount.value.googleAuth = userStore.userInfo.bindGoogleAuth
      bindAccount.value.googleLogin = userStore.userInfo.bindGoogleLogin
    }
  } catch (error) {
    showCatchErrorMessage()
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
      jsonForm.value = JSON.parse(localStorage.getItem('bindGoogleLogin'));
      setHeadersAuth(headers, jsonForm);
      res = await userApi.setBindGoogle({providerType: 'google', providerId: providerId, optToken: jsonForm.value.optToken}, headers);
      if(res.code == 200 && res.data) {
        goBackDelay(router, '/user-h5/manage/account', 10);
      }else{
        showErrorMessage(res.code, res.message);
      }
    }
  }
  await fetchData();
})

</script>
<style scoped>
.page {
}

.table-list{
  div{
    display: flex;
    justify-content: space-between;
    height: 38px;
    line-height: 38px;
    margin: 15px 0;
  }
  .title-wrap{
    font-size: 16px;
    color: #333333;
    font-weight: 500;

  }
  .text-wrap{
    padding-left: 9px;
    color: #666666;
    font-weight: normal;
    font-size: 16px;
    .title{
      font-weight: 600;
      font-size: 16px;
    }
    .setting{
      color: #5686E1;
      font-style: normal;
    }
    .el-icon{
      margin-left: 5px;
      position: relative;
      top: 2px;
    }
  }
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
