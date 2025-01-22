<template>
  <div class="page">
    <div class="payment-container">
      <el-form :model="form" ref="formRef" :rules="rules" @submit.prevent="handleSubmit">
        <el-form-item label="auPayId" prop="transferQR">
          <el-input v-model="form.transferQR" placeholder="请输入auPayId" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">确认</el-button>
        </el-form-item>
      </el-form>
      <el-button @click="scanQRCode" style="margin-left: 10px;">
        扫描二维码
      </el-button>
      <TransferForm
          :form="form"
          :isDialogVisible="isDialogVisible"
          @update:form="updateForm"
          :isFlag="true"
          @close="isDialogVisible = false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElForm, ElMessage } from "element-plus";
import TransferForm from '@/composables/TransferPayForm.vue';
const isDialogVisible = ref(false);
const formRef = ref(null);

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.generateQR) {
    window.location.href = form.value.generateQR
  }
};
const form = ref({
  transferQR: '',
  generateQR: '',
  currencyId: null,
  currencyChainId: null,
  amount: '',
  remark: '',
});

// 表单验证规则
const rules = {
  transferQR: [
    { required: true, message: 'AuPayId 不能为空', trigger: 'blur' }
  ]
};

// 确认按钮的处理函数
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
      isDialogVisible.value = true;
      // 处理提交逻辑
      console.log(`确认支付，AuPayId: ${form.value.transferQR}`);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 扫描二维码的处理函数
const scanQRCode = () => {
  console.log('扫描二维码');
};
</script>

<style scoped>
.payment-container {
  padding: 20px;
}
</style>
