<template>
  <div class="login-container">
    <div class="container" v-if=" activeStepId == 1">
      <h2>注册</h2>
      <el-form :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleSubmit">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <div class="link-wrap link-wrap-text">
          <a href="javascript: void(0);" @click="sendEamil">点击获取邮箱验证码</a>
        </div>
        <el-form-item label="" prop="emailCode">
          <el-input v-model="form.emailCode" placeholder="请输入邮箱验证码" />
        </el-form-item>
        <el-form-item label="" prop="password">
          <el-input v-model="form.password" type="password" placeholder="设置登录密码" />
        </el-form-item>
        <el-form-item class="link-wrap link-wrap-text">
          <el-checkbox v-model="isAgreement">我已阅读并同意用户协议</el-checkbox>
        </el-form-item>
        <el-form-item label="" prop="code">
          <el-button type="primary" native-type="submit">注册</el-button>
        </el-form-item>
      </el-form>
      <div class="social-login" style="margin-top: 30px;">
        <el-button type="primary" @click="bindGoogleAuth">Google账户注册</el-button>
<!--        <el-button type="info">Apple账户注册</el-button>-->
<!--        <el-button type="info">Telegram账户注册</el-button>-->
      </div>
    </div>

    <div class="container" v-if="activeStepId > 1">
      <h2>支付密码</h2>
      <div style="text-align: center; padding: 20px;">{{form.email}} 注册成功</div>
      <div class="register-status">
        <div class="status-item" v-for="item in statusList" :key="item.key">
          <span>{{ item.name }}:</span>
          <el-icon :size="20" v-if="item.key">
            <component :is="item.status ? Check : Close" />
          </el-icon>
        </div>
      </div>
      <el-form v-if="activeStepId == 2" :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleSubmit">
        <el-form-item  prop="paymentPassword">
          <el-input v-model="form.paymentPassword" placeholder="设置支付密码" />
        </el-form-item>
        <el-form-item  class="social-login">
            <el-button  type="primary" native-type="submit">保存</el-button>
        </el-form-item>
      </el-form>
      <div class="social-login" >
        <el-button v-if="activeStepId == 3" type="primary" @click="confirmGoogleAuth(1)">绑定Google验证器</el-button>
        <el-button v-if="activeStepId == 4" type="primary">Google账户绑定</el-button>
      </div>
      <div class="link-wrap" v-if="activeStepId < 5">
        <a href="javascript:void(0);" @click="nextTick">暂不设置下一步</a>
      </div>
    </div>
  </div>

  <!-- Google 验证码弹出窗口 -->
  <el-dialog v-model="isDialogVisible" title="设置Google验证码">
    <div style="text-align: center;">
      <img :src="googleForm.qrCode" alt="Google QR Code" style="width: 150px; height: 150px;" />
      <el-form :model="googleForm" label-position="top" style="margin-top: 20px;">
        <el-form-item label="" prop="googleCode">
          <el-input v-model="googleForm.googleCode" placeholder="请输入Google验证码" />
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirmGoogleAuth(2)">确认</el-button>
      </span>
  </el-dialog>

</template>

<script setup lang="ts">
import { ref, onMounted} from 'vue';
import {ElForm, ElMessage} from 'element-plus';
import { getHeader } from '@/utils/storageUtils';
import { useRoute } from 'vue-router';
import { Check, Close } from '@element-plus/icons-vue';
const route = useRoute();
const activeStepId = ref(route.query.stepId || 1);
const headers = getHeader();
const { userApi, systemApi } = useServer();

// 表单引用
const formRef: any = ref(null);
const routeStr = ref("/user/register");
const isAgreement = ref(false);

// 表单数据
const form = ref({
  email: '',
  password: '',
  paymentPassword: '',
  emailCode: '',
});

// Google 验证码相关数据
const isDialogVisible = ref(false);
const googleForm = ref({
  googleCode: '',
  googleSecret: '',
  qrCode: '',
  type: 1,
});

/**
 * 发送EMAIL
 */
const sendEamil = async () => {
  let res = await systemApi.sendRegEmail({email: form.value.email}, {});
  if (res.code === 200) {
    ElMessage.success('email发送成功');
  } else {
    ElMessage.error(res.message);
  }
}

const bindGoogleAuth = () => {}

/**
 * 提交绑定Google地址
 */
const confirmGoogleAuth = async (type: number) => {
  googleForm.value.type = type;
  let res = await systemApi.bindGoogleAuth(googleForm.value, headers);
  if (res.code === 200) {
    if( type == 1){
      googleForm.value.googleSecret = res.data.googleSecret;
      googleForm.value.qrCode = res.data.qr;
      isDialogVisible.value = true
    }else{
      setUserInfo(4);
    }
  } else {
    ElMessage.error(res.message);
  }
}

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
  paymentPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '验证码不能为空', trigger: 'blur' },
  ],
};

const handleSubmit = async () => {
  if (activeStepId.value == 1 && !isAgreement.value) {
    ElMessage.error('请先同意用户协议');
    return;
  }
  const valid = await formRef.value.validate();
    if (valid) {
      if (activeStepId.value == 1) {
        let res = await userApi.register(form.value, {});
        if (res.code === 200) {
          const userStore = UseUserStore();
          userStore.setTokenState(res.data);
          window.location.href = routeStr.value + '?stepId=2';
        } else {
          ElMessage.error(res.message || '注册失败');
        }
      }else if(activeStepId.value == 2) {
        // 设置资产密码
       let resSetPass = await userApi.setAssetsPassword({ assetsPassword: form.value.paymentPassword }, headers);
        // 处理设置资产密码的结果
        if (resSetPass.code === 200) {
          setUserInfo(3);
        } else {
          ElMessage.error(resSetPass.message || '设置支付密码失败');
        }
      }
    }
}

onMounted(() => {
  const userStore = UseUserStore();
  if(activeStepId.value > 2 ) {
    let userInfo  = userStore.userInfo
    for (let i in statusList.value){
      let key = statusList.value[i].key;
      if( userInfo[key]){
        statusList.value[i].status = userInfo[key];
      }
    }
  }
});
/**
 * 设置userInfo
 * @param stepId
 */
const setUserInfo = async(stepId: number) => {
  let resUser = await userApi.getUserInfo({}, headers);
  if (resUser.code === 200) {
    const userStore = UseUserStore();
    userStore.setUserInfo(resUser.data);
    window.location.href = `${routeStr.value}?stepId=` + stepId;
  }
}

/**
 * 跳过当前页设置
 * @param stepId
 */
const nextTick = () => {
  // 将当前步数加1
  const nextStepId = parseInt(activeStepId.value) + 1;
  if(nextStepId > 4 ){
    window.location.href = `/user/login`;
  }else{
    window.location.href = `${routeStr.value}?stepId=${nextStepId}`;
  }
};

// 状态数据
const statusList = ref([
  { name: '注册', key: 'isLogin', status: true },
  { name: '支付密码', key: 'setAssetsPassword', status: false },
  { name: '绑定Google验证器', key: 'bindGoogleAuth', status: false },
  { name: '三方验证绑定', key: '', status: false },
  { name: 'Google验证', key: 'bindGoogleLogin', status: false },
  { name: 'Apple验证', key: 'bindAppleLogin', status: false },
  { name: 'Telegram验证', key: 'bindFacebookLogin', status: false },
]);

const bindGoogleCheck =  () => {

}

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
.link-wrap-text{
  position: relative; top: -15px;
}
.link-wrap{
  text-align:right;
  font-size: 12px;
}
.social-login {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.el-form-item__content button{
  width: 100%;
}
.social-login .el-button+.el-button{
  margin-left: 0 !important;
}
.status-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
}
</style>
