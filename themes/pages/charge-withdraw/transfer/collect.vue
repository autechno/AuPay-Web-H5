<template>
  <div class="page">
    <div class="qc-wrap">
      <QCcode :value="form.generateQR" :size="300" />
      <div>
        auPayID:{{ form.transferQR }}
        <el-button type="primary" size="small" @click="copyText(form.transferQR)">复制</el-button>
      </div>
      <div><el-button @click="isDialogVisible = true">编辑</el-button></div>
      <div><el-button @click="cleanQR">清空</el-button></div>
      <div><el-button>下载</el-button></div>
      <div><el-button>分享</el-button></div>
    </div>
    <TransferForm
        :form="form"
        :isDialogVisible="isDialogVisible"
        @update:form="updateForm"
        :isFlag="false"
        @close="isDialogVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TransferForm from '@/composables/TransferPayForm.vue';
import QCcode from "@/composables/QCcode.vue";

const form = ref({
  transferQR: '',
  generateQR: '',
  currencyId: null,
  currencyChainId: null,
  amount: '',
  remark: '',
});
const isDialogVisible = ref(false);
// 更新父组件的 form 数据
const updateForm = (newForm) => {
  form.value = newForm;
};

// 清空表单
const cleanQR = () => {
  form.value.generateQR = form.value.transferQR;
  form.value.currencyId = '';
  form.value.currencyChainId = '';
  form.value.amount = '';
  form.value.remark = '';
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  form.value.transferQR = userStore.userInfo.transferQR;
  form.value.generateQR = userStore.userInfo.transferQR;
});
</script>

<style scoped>
.qc-wrap {
  margin: 0 auto;
  width: 500px;
  background: #f1f1f1;
  height: 500px;
}
</style>
