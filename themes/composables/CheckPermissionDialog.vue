<template>
  <el-dialog class="custom-dialog" v-model="isSelfDialogVisible" :show-close="false" @close="cancel">
     <div class="custom-dialog-wrap"> {{title}}</div>
    <el-form :model="checkForm" class="customer-input" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item  v-if="activeStepId == 1" prop="checkAssetsPassword">
        <el-input v-model="checkForm.checkAssetsPassword" type="password" placeholder="请转入资金密码" />
      </el-form-item>
      <div v-if="activeStepId == 2">
        <el-form-item >
          <el-input :value="props.form.email" disabled />
        </el-form-item>
        <el-form-item  prop="emailCode">
          <el-input v-model="checkForm.emailCode" placeholder="请输入邮箱验证码" />
        </el-form-item>
      </div>
      <el-form-item v-if="activeStepId == 3"  prop="googleCode" >
        <el-input v-model="checkForm.googleCode" type="password" placeholder="请输入google验证码" />
      </el-form-item>
      <div class="button-container" style="margin-top: 94px;">
        <el-button class="custom-button-sm"  style="width: 190px;" native-type="submit">确 定</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, defineProps, onMounted, watch } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
const headers = getHeader();
const activeStepId = ref(0);
const title = ref('资金密码');
const isSelfDialogVisible = ref(false);
const props = defineProps({
  isDialogVisible: Boolean,
  form: Object,
  permissionId: Number,
});

const checkForm = ref({
  bindGoogleAuth: false,
  bindAssetsPassword: false,
  bindEmail: false,
  optToken: false,
  emailCode: '',
  checkAssetsPassword: '',
  googleCode: '',
})

const emit = defineEmits(['update:form', 'close']);
// 取消操作
const cancel = () => {
  checkForm.value.emailCode = '';
  checkForm.value.checkAssetsPassword = '';
  checkForm.value.googleCode = '';
  isSelfDialogVisible.value = false;
  emit('close');
};

const formRef = ref(null);
const { systemApi } = useServer();

const handleSubmit = async () => {
  try {
    if(activeStepId.value == 1) {
      let passRes = await systemApi.verifyAssetsPassword({ assetsPassword: checkForm.value.checkAssetsPassword, optToken: checkForm.value.optToken}, headers);
      if (passRes.code == 200) {
        props.form.passwordToken = passRes.data;
        if (checkForm.value.bindEmail) {
          activeStepId.value = 2;
          sendEmail();
        }else if(!checkForm.value.bindEmail && checkForm.value.bindGoogleAuth){
          activeStepId.value = 3;
          title.value = 'google 验证码';
        }else{
          processMethod();
        }
      }else{
        ElMessage.error(passRes.message);
      }
      return;
    }
    if (activeStepId.value == 2){
      let sendValidateEmailRes = await systemApi.sendValidateEmail({ emailCode: checkForm.value.emailCode, optToken: checkForm.value.optToken}, headers);
      if (sendValidateEmailRes.code === 200) {
        props.form.emailCodeToken = sendValidateEmailRes.data;
        if (checkForm.value.bindGoogleAuth) {
          title.value = 'google 验证器';
          activeStepId.value = 3;
        } else {
          processMethod();
        }
      }else{
        ElMessage.error(sendValidateEmailRes.message);
      }
      return;
    }
    if (activeStepId.value == 3){
      let googleRes = await systemApi.verifyValidateGoogle({ googleCode: checkForm.value.googleCode, optToken: checkForm.value.optToken}, headers);
      if (googleRes.code === 200) {
        props.form.googleToken = googleRes.data;
        processMethod();
      }else{
        ElMessage.error(googleRes.message);
      }
    }
  } catch (error) {
    console.log(error);
    ElMessage.error('请求失败，请重试')
  } finally {
  }
};

// 发送邮箱验证码
const sendEmail = async () => {
  title.value = '邮箱验证码';
  let sendEmailRes = await systemApi.sendEmail({ email: props.form.email, optToken: checkForm.value.optToken},  headers);
  if (sendEmailRes.code === 200) {
    ElMessage.success('email已发送到' + props.form.email +"邮箱");
  }else{
    ElMessage.error(sendEmailRes.message);
  }
}
const processMethod = async () => {
  props.form.permissionStatus = true;
  props.form.optToken = checkForm.value.optToken;
  isSelfDialogVisible.value = false;
  // 更新父组件的 form 数据
  console.log("-props.form-")
  console.log(props.form)
  console.log("-props.form-")
  emit('update:form', { ...props.form });
  emit('close');
}

// 获取初始化信息
const fetchData = async () => {
  try {
    const userStore = UseUserStore();
    const userInfo = userStore.userInfo;
    let params = {permissionId: props.permissionId};
    // if(props.permissionId == 4){
    //   params['data'] = { toAddress: props.form.toAddress }
    // }
    let res = await systemApi.checkPermission(params, headers);
    if (res.code === 200) {
      checkForm.value.optToken = res.data.optToken;
      let verifyMethods = res.data.verifyMethods;
      checkForm.value.bindAssetsPassword = verifyMethods.includes("ASSETSPASSWORD");
      checkForm.value.bindGoogleAuth = verifyMethods.includes("GOOGLEAUTHENICATOR");
      checkForm.value.bindEmail = verifyMethods.includes("EMAIL");

      if(checkForm.value.bindAssetsPassword){
        if(!userInfo.setAssetsPassword){
          ElMessage.error('您暂未设置资金密码!');
          setTimeout(() => {
            window.location.href = '/user';
          }, 500);
          return;
        }
        title.value = '资金密码';
        activeStepId.value = 1;
      } else if(!checkForm.value.bindAssetsPassword && checkForm.value.bindEmail){
        activeStepId.value = 2;
        title.value = '邮箱验证码';
        sendEmail();
      }else if(!checkForm.value.bindAssetsPassword && !checkForm.value.bindEmail && checkForm.value.bindGoogleAuth){
        activeStepId.value = 3;
        title.value = 'google验证码';
      }else{
        processMethod();
        return;
      }
      isSelfDialogVisible.value = true;
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 监听 isDialogVisible 的变化
watch(() => props.isDialogVisible, (newVal) => {
  if (newVal) {
    fetchData();
  }
});

</script>

<style lang="less" scoped>
.custom-dialog-wrap {
  color: #0D0D0D;
  font-size: 18px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  margin-top: 9px;
  margin-bottom: 28px;
}

.customer-input {
  padding: 0 10%;
  :deep(.el-input) {
    width: 100%;
    height: 46px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.checkbox__label) {
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error) {
    padding-left: 14px;
  }
  :deep(.el-checkbox__label) {
    font-weight: normal !important;
  }
}

</style>
