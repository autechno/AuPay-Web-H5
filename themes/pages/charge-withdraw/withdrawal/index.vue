<template>
  <div class="page">
    <el-tabs v-model="activeIndex" @tab-click="handleTabClick">
      <el-tab-pane label="充值" /> <el-tab-pane label="转账" /> <el-tab-pane label="提现"  />
    </el-tabs>
    <div style="width: 500px; margin: 0 auto">
      <WithdrawalForm
          :form="form"
          @update:form="updateForm"
          :isFlag="true"
      />
    </div>
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId = 4
        :isDialogVisible="isDialogVisible"
        @close="isDialogVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getHeader } from "@/utils/storageUtils";
import WithdrawalForm from '@/composables/WithdrawalForm.vue';
import CheckPermissionDialog from '@/composables/CheckPermissionDialog.vue';
import {ElMessage} from "element-plus";
const activeIndex = ref('2');
const isDialogVisible = ref(false);
const { assetsApi } = useServer();

const form = ref({
  currencyId: null,
  currencyChainId: null,
  amount: '',
  remark: '',
  toAddress: '',
  googleToken: '',
  passwordToken: '',
  withdrawalStatus: false,
  permissionStatus: false
});

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  const headers = getHeader();
  if(form.value.withdrawalStatus && form.value.permissionStatus) {
    headers['Assets-Password-Token'] = form.value.passwordToken;
    if(form.value.googleToken != ''){
      headers['Google-Auth-Token'] = form.value.googleToken;
    }
    let res = assetsApi.getWithdrawApply(newForm, headers);
    if (res.code === 200) {
      ElMessage.success('提现成功');
      window.location.reload();
    } else {
      ElMessage.error(res.message || '提现失败请与管理员联系');
    }
  }else if(form.value.withdrawalStatus && !form.value.permissionStatus) {
    isDialogVisible.value = true;
  }
};

// 处理外部选项卡点击事件
const handleTabClick = (tab: any) => {
  if(tab.index == '1'){
    window.location.href="/charge-withdraw/transfer";
  }else if(tab.index == '0'){
    window.location.href="/charge-withdraw/recharge";
  }
};


</script>

<style scoped>
</style>
