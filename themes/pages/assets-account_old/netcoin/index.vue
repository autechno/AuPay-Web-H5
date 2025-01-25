<template>
  <div>
    <div class="button-group">
      <el-button type="primary" @click="openDialog('transfer', 1)">转账</el-button>
      <el-button type="primary" @click="openDialog('recharge', 2)">充值</el-button>
      <el-button type="primary" @click="openDialog('withdraw', 3)">提现</el-button>
    </div>

    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500"
    >
      <div v-if="step === 1">
        <el-select v-model="selectedProtocol" placeholder="请选择链">
          <el-option
              v-for="protocol in protocols"
              :key="protocol.value"
              :label="protocol.label"
              :value="protocol.value"
          />
        </el-select>
        <div class="dialog-footer">
          <el-button @click="nextStep">下一步</el-button>
        </div>
      </div>
      <div v-else-if="step === 2">
        <div v-if="action === 'recharge'">
          <p>二维码:</p>
          <img :src="qrCodeSrc" alt="QR Code" />
          <p @click="copyText(url)" class="copyable-text"> {{ url }} </p>
        </div>
        <div v-else>
          <p>成功</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import { copyText } from "@/utils/funcUtil";
const dialogTitle = ref("充值");
const protocols = ref([
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Binance Smart Chain', value: 'bsc' },
  { label: 'Polygon', value: 'polygon' },
]);

const dialogVisible = ref(false);
const selectedProtocol = ref('');
const step = ref(1);
const action = ref('');
const url = ref('https://example.com/qr-code-link');
const qrCodeSrc = ref('https://via.placeholder.com/150');

const openDialog = (selectedAction: string, type: number) => {
  action.value = selectedAction;
  dialogVisible.value = true;
  step.value = 1;
};

const nextStep = () => {
  if (!selectedProtocol.value) {
    ElNotification({
      title: '警告',
      message: '请选择链',
      type: 'warning',
    });
    return;
  }
  step.value = 2;
};

</script>

<style scoped>
.copyable-text {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  margin-bottom: 5px;
}
.right-column {
  display: flex;
  justify-content: flex-end;
}
.right-content {
  text-align: right;
}
.list-wrap {
  background: #dcdcdc;
  margin-bottom: 20px;
}
.left-width {
  width: 100%;
}
.button-group {
  text-align: right;
}
.dialog-footer {
  margin-top: 20px;
}
</style>
