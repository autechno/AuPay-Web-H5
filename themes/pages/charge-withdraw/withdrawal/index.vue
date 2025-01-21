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
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
import WithdrawalForm from '@/composables/WithdrawalForm.vue';
import CheckPermissionDialog from '@/composables/CheckPermissionDialog.vue';
import { setHeadersAuth } from "@/utils/funcUtil";
import {ElMessage} from "element-plus";
const activeIndex = ref('2');
const dialogCheckVisible = ref(false);
const { assetsApi, userApi } = useServer();

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
const updateForm = async (newForm: Object) => {
  try{
    form.value = newForm;
    if(form.value.withdrawalStatus && form.value.permissionStatus) {
      setHeadersAuth(headers,form);
      let params = form.value;
      params['currencyChain'] = params.currencyChainId;
      let res = await assetsApi.getWithdrawApply(params, headers);
      if (res.code == 200) {
        ElMessage.success('提现成功');
        window.location.reload();
      } else {
        ElMessage.error(res.message);
      }
    }else if(form.value.withdrawalStatus && !form.value.permissionStatus) {
      console.log(form.value)
      console.log(form.value)
      dialogCheckVisible.value = true;
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
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
