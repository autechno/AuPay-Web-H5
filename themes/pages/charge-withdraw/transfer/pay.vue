<template>
  <div class="payment-container">
    <el-form :model="form" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item label="" prop="username">
        <el-input v-model="form.transferQR" placeholder="请输入 AuPayId"/>
      </el-form-item>
      <el-button type="primary" native-type="submit">确认</el-button>
    </el-form>
    <el-button  @click="scanQRCode" style="margin-left: 10px;">
      扫描二维码
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {ElForm, ElMessage} from "element-plus";

const form = ref({
  transferQR: '',
  generateQR: '',
  currencyId: null,
  currencyChainId: null,
  inputAmount: '',
  remark: '',
});
// 确认按钮的处理函数
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 扫描二维码的处理函数
const scanQRCode = () => {
  // 处理扫描二维码逻辑
  console.log('扫描二维码');
};
</script>

<style scoped>
.payment-container {
  padding: 20px;
}
</style>
