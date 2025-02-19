<template>
  <div class="page">
    <GoBack :title="title" />
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
        <button class="custom-button custom-button-pos"  native-type="submit">确认</button>
    </el-form>
    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="permissionId"
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {ElForm, ElMessage} from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
import GoBack from "@/composables/GoPageBack.vue";
import CheckPermissionDialog from "~/composables/CheckPermissionDialog.vue";
import {goBackDelay, setHeadersAuth} from "@/utils/funcUtil";
import { useRoute, useRouter } from 'vue-router';
import PasswordStrength from "~/composables/PasswordStrength.vue";

const router = useRouter();
const route = useRoute();
const { userApi, systemApi } = useServer();
const passwordVisible = ref(false);
const passwordVisible2 = ref(false);
const dialogCheckVisible = ref(false);
const passwordLevelVisible = ref(false);
const formRef = ref(null);
const title = ref('设置密码');
const permissionId = ref(0);

// 初始化数据
const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
})

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  headerForm.value = newForm;
  if(headerForm.value.permissionStatus){
    dialogCheckVisible.value = false;
    editPassword();
  }
};

// 表单数据
const headerForm = ref({
  optToken: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  googleCode: '',
  permissionStatus: false
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

const editPassword = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      const headers = getHeader();
      setHeadersAuth(headers, headerForm);
      let res;
      let params = {
        newPassword: form.value.password,
        optToken: headerForm.value.optToken,
      };
      if(permissionId.value == 3){
        res = await userApi.updatePassword(params, headers);
      }else{
        res = await userApi.updateAssetsPassword(params, headers);
      }
      if(res.code == 200){
        showSuccessMessage(res.code,'修改密码成功');
        goBackDelay(router);
      }else{
        showErrorMessage(res.code, res.message);
      }
    } catch (error) {
      showCatchErrorMessage()
    }
  } else {
    showValidationErrorMessage();
  }
}

const handleSubmit = async () => {
    const valid = await formRef.value.validate();
    if (valid) {
      try {
          dialogCheckVisible.value = true;
      } catch (error) {
        showCatchErrorMessage();
      }
    } else {
      showValidationErrorMessage();
    }
}

// 初始化数据
onMounted(() => {
  const userInfo = UseUserStore().userInfo;
  form.value.email = userInfo.email;
  if(route.query.permissionId){
    permissionId.value = route.query.permissionId;
  }
  if(route.query.name){
    title.value = route.query.name;
  }
});
</script>

<style scoped>
.title-wrap{
  line-height: 24px;
  height: 24px;
  margin: 18px 0 ;
  color: #0D0D0D;
  font-size: 16px;
}
.footer-wrap {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #ffffff;
  height: 100px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  align-items: center;
  button {
    flex: 1;
    margin-left: 30px;
  }
  button:last-child {
    margin-right: 30px;
  }
}
.custom-input{
  margin-top: 70px;
  :deep(.el-input){
    width: 100%;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep(.el-select__wrapper) {
    height: 56px;
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
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
  :deep(.el-radio){
    margin-right: 15px;
  }
  :deep(.el-radio__label){
    padding-left: 5px;
  }
  :deep(.el-form-item__label){
    color: #0D0D0D !important;
  }
  :deep(.el-radio__label){
    color: #0D0D0D !important;
  }
}
</style>
