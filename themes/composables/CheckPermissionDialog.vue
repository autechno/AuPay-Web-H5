<template>
  <el-dialog :title="title" v-model="props.isDialogVisible">
    <el-form :model="checkForm" :rules="rules" ref="formRef"  @submit.prevent="handleSubmit">
      <el-form-item  v-if="activeStepId == 1" label="设置支付密码" prop="assetsPasswordCode">
        <el-input v-model="checkForm.assetsPasswordCode" type="password" placeholder="设置支付密码" />
      </el-form-item>
      <div v-if="activeStepId == 2">
        <el-form-item  label="邮箱" >
          <el-input :value="props.form.email" disabled />
        </el-form-item>
        <el-form-item  label="邮箱验证码" prop="emailCode">
          <el-input v-model="checkForm.emailCode" placeholder="请输入邮箱验证码" />
        </el-form-item>
      </div>
      <el-form-item v-if="activeStepId == 3" label="身份验证器APP验证码" prop="googleCode" >
        <el-input v-model="checkForm.googleCode" type="password" placeholder="请输入6位验证码" />
      </el-form-item>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button type="primary" native-type="submit">确 定</el-button>
      </span>
    </el-form>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, defineProps, onMounted, watch } from 'vue';
import { ElForm, ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
const activeStepId = ref(0);
const title = ref('验证资金密码');
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
  assetsPasswordCode: '',
  googleCode: '',
})
// 表单验证规则
const rules = {
  assetsPasswordCode: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  emailCode: [
    { required: true, message: '邮箱验证码不能为空', trigger: 'blur' },
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
};

const emit = defineEmits(['update:form', 'close']);
// 取消操作
const cancel = () => {
  emit('close');
};

const formRef = ref(null);
const { systemApi } = useServer();

const handleSubmit = async () => {
  try {
    if(activeStepId.value == 1) {
      let passRes = await systemApi.verifyAssetsPassword({ assetsPassword: checkForm.value.assetsPasswordCode, optToken: checkForm.value.optToken}, headers);
      if (passRes.code == 200) {
        props.form.passwordToken = passRes.data;
        if (checkForm.value.bindEmail) {
          activeStepId.value = 2;
          sendEmail();
        }else if(!checkForm.value.bindEmail && checkForm.value.bindGoogleAuth){
          activeStepId.value = 3;
          title.value = 'google 验证码';
        }
      }else{
        ElMessage.error(passRes.message);
      }
      return;
    }
    if (activeStepId.value == 2){
      let sendValidateEmailRes = await systemApi.sendValidateEmail({ emailCode: props.form.email, optToken: checkForm.value.optToken}, headers);
      if (sendValidateEmailRes.code === 200) {
        props.form.emailCodeToken = sendValidateEmailRes.data;
        if (checkForm.value.bindGoogleAuth) {
          title.value = 'google 验证器';
          activeStepId.value = 3;
        } else {
          processMethod();
        }
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
    console.log(props.form);
    let res = await systemApi.checkPermission({permissionId: props.permissionId}, headers);
    if (res.code === 200) {
      checkForm.value.optToken = res.data.optToken;
      let verifyMethods = res.data.verifyMethods;
      checkForm.value.bindAssetsPassword = verifyMethods.includes("ASSETSPASSWORD");
      checkForm.value.bindGoogleAuth = verifyMethods.includes("GOOGLEAUTHENICATOR");
      checkForm.value.bindEmail = verifyMethods.includes("EMAIL");
      if(checkForm.value.bindAssetsPassword){
        activeStepId.value = 1;
      }
      if(!checkForm.value.bindAssetsPassword && checkForm.value.bindEmail){
        activeStepId.value = 2;
        title.value = '邮箱验证码';
        sendEmail();
      }
      if(!checkForm.value.bindAssetsPassword && !checkForm.value.bindEmail && checkForm.value.bindGoogleAuth){
        activeStepId.value = 3;
        title.value = 'google 验证码';
      }
    } else {
      ElMessage.error(res.message || '查询失败');
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

<style scoped>
/* 添加您的样式 */
</style>
