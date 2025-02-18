<template>
  <div class="page">
    <div class="logo-wrap">
      <img :src="vector"  />
    </div>
    <div class="regTips">您已注册成功</div>
    <div style="padding: 10px;">接下来需要您花费几分钟设定以下辅助选项，您也可以暂时跳过，在使用中随时完善</div>
    <div class="register-status">
      <div class="status-item" v-for="item in statusList" :key="item.key">
        <span :class="!item.key?'title':''">{{ item.name }}</span>
        <el-icon v-if="item.key" :class="!item.status?'error':''">
          <component :is="item.status ? Select : CloseBold"  />
        </el-icon>
      </div>
    </div>

    <el-form :model="form" :rules="rules" ref="formRef" class="custom-input" @submit.prevent="handleSubmit">
      <el-form-item v-if="activeStepId == 1"  prop="assetsPassword">
        <el-input v-model="form.assetsPassword" placeholder="设置资金密码" :type="passwordVisible ? 'text' : 'password'" />
        <i @click.stop="passwordVisible = !passwordVisible" :class="passwordVisible ? 'icon-eye' : 'icon-eye-no'"></i>
      </el-form-item>
      <div v-else class="mt-30"></div>
      <div v-if="activeStepId == 3" @click="googleBind">
        <el-button :class="['custom-button mb-20', { 'display': bindGoogleLogin }]">Google账户绑定</el-button>
      </div>
      <el-form-item>
        <button class="custom-button" native-type="submit">{{ submitText }}</button>
      </el-form-item>
    </el-form>

    <div class="next-text" v-if="activeStepId != 3" @click="nextTick">“暂不设置”下一步</div>
    <!-- Google 验证码弹出窗口 -->
    <el-dialog class="custom-dialog" v-model="isDialogVisible" title="设置Google验证码" width="90%">
      <div class="custom-dialog-wrap">关联验证器</div>
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
      <div class="btn-wrap">
          <button class="custom-button" @click="confirmGoogleAuth(2)">确认</button>
        </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import vector from '@@/public/images/Vector3.png';
import { rules } from "@/utils/validationRules";
import {ElForm, ElMessage} from "element-plus";
import { ref, onMounted} from "vue";
import { useRouter, useRoute } from "vue-router";
import {getHeader} from "@/utils/storageUtils";
import {Select, CloseBold} from "@element-plus/icons-vue";
import copy from '@@/public/images/copy2.svg';


const { userApi, systemApi } = useServer();
const { public: { API_HOST } } = useRuntimeConfig();
const formRef: any = ref(null);
const bindGoogleLogin = ref(true);
const route = useRoute();
const submitText = ref('确定')
const activeStepId = ref(route.query.stepId || 1);
const userStore = UseUserStore();
const passwordVisible = ref(false);
const isDialogVisible = ref(false);
const googleForm = ref({
  googleCode: '',
  googleSecret: '',
  qrCode: '',
  type: 1,
});

// 状态数据
const statusList = ref([
  { name: '注册', key: 'isLogin', status: true },
  { name: '资金密码', key: 'setAssetsPassword', status: false },
  { name: '绑定Google验证器', key: 'bindGoogleAuth', status: false },
  { name: '三方登录绑定', key: '', status: false },
  { name: 'Google account', key: 'bindGoogleLogin', status: false },
  { name: 'Apple ID', key: 'bindAppleLogin', status: false },
  { name: 'Telegram', key: 'bindFacebookLogin', status: false },
]);

// 表单数据
const form = ref({
  assetsPassword: '',
  emailCode: '',
});

/**
 * 表单提交
 */
const handleSubmit = async () => {
  const headers = getHeader();
  const valid = await formRef.value.validate();
  if (valid) {
    if(activeStepId.value === 1) {
      // 设置资产密码
      let resSetPass = await userApi.setAssetsPassword({ assetsPassword: form.value.assetsPassword }, headers);
      if (resSetPass.code === 200) {
        nextTick();
      } else {
        ElMessage.error(resSetPass.message || '设置资金密码失败');
      }
    } else if(activeStepId.value === 2) {
       confirmGoogleAuth(1);
    }else {
        window.location.href = '/user/login?firstLogin=1';
    }
  }
}
// 绑定当下一页
const nextTick = async () => {
  activeStepId.value = parseInt(activeStepId.value) + 1;
  if( activeStepId.value == 2){
    submitText.value = '绑定Google验证器';
  }else if(activeStepId.value == 3){
    submitText.value = '确认完成';
  }
  updateStatus();
}

// 更新显示按钮状态
const updateStatus = async () => {
  const headers = getHeader();
  let res = await userApi.getUserInfo({}, headers);
  statusList.value.forEach(item => {
    if (item.key && res.data[item.key] !== undefined) {
      if(item.key == 'bindGoogleLogin'){
        bindGoogleLogin.value = res.data[item.key];
      }
      item.status = res.data[item.key];
    }
  });
}

// 绑定第三方登录
const googleBind = async () => {
  if(bindGoogleLogin.value){ return; }
  window.location.href = API_HOST + '/oz-client-auth/oauth2/authorize/google?action=bind'
}

/**
 * 提交绑定Google地址
 */
const confirmGoogleAuth = async (type: number) => {
  const headers = getHeader();
  googleForm.value.type = type;
  if( type == 1){
    let res = await systemApi.bindGoogleAuth(googleForm.value, headers);
    if (res.code === 200) {
      googleForm.value.googleSecret = res.data.googleSecret;
      googleForm.value.qrCode = res.data.qr;
      isDialogVisible.value = true
    }
  }else{
    let res = await systemApi.bindGoogleFirstAuth(googleForm.value, headers);
    if (res.code === 200) {
      isDialogVisible.value = false
      nextTick();
    }
  }
}

// 初始化
onMounted(async () => {
  if(activeStepId.value == 1) {
    let action = route.query.action || '';
    let token = route.query.token || '';
    if (action && token) {
      userStore.setTokenState(token);
      let result = await userStore.fetchUserInfo();
      if(result){
        if(!userStore.userInfo.propsModifyVO.showInitSet){
          window.location.href = '/assets-account-h5'
        }else{
          updateStatus();
        }
      }
    }
  }
  if(activeStepId.value == 3){
    submitText.value = '确认完成';
    updateStatus();
  }
});

</script>

<style scoped>
*{
  font-size: 14px;
}

.page {
  background: url('@@/public/images/star3.png') 45% 14% no-repeat;
  background-size: 52%;
  position: relative;
  padding-left: 30px;
  padding-right: 30px;

  .logo-wrap {
    width: 100px;
    height: 100px;
    margin: 100px auto 18px auto;
    background: #5686E1;
    border-radius: 45px;
    display: flex;
    justify-content: center;
    align-items: center;
    img{
      width: 36px;
    }
  }
  .register-status{
    color: #657087;
    margin-top: 20px;
    padding-bottom: 10px;
  }
  .regTips {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    text-align: center;
  }
  .next-text{
    text-align: center;
    color: #657087
  }
}
.btn-wrap{
  margin-top: 35px;
}
.mb-20{
  margin-bottom: 20px;
}
.mt-30{
  margin-top: 32px;
}
.status-item{
  position: relative;
  height: 38px;
  line-height: 38px;
  width: 100%;
  border-radius: 8px;
  display: flex;
  .title{
    color: #333333;
    font-weight: bold;
  }
  .el-icon{
    width: 20px;
    height: 20px;
    position: absolute;
    font-weight: bold;
    right: 0px;
    top:7px;
    background: #5686E1;
    border-radius: 8px;
    color: #ffffff;
  }
  .error{
    background: #FDC92E;
  }
}

.custom-input{
  margin-top: 10px;
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
