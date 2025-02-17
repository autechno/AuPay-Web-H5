<template>
  <div class="page">
    <GoBack title="地址库" />
    <div class="title-wrap">新增地址</div>
    <el-form :model="form" :rules="rules" class="custom-input" ref="formRef" @submit.prevent="checkDuplicate">
      <el-form-item prop="name" >
        <el-input v-model="form.name"  placeholder="地址名称"  />
      </el-form-item>
      <el-form-item prop="currencyChain" >
        <el-select
            id="currency-select"
            v-model="form.currencyChain"
            placeholder="选择网络">
          <el-option v-for="item in currencyChainList" :key="item.chainId" :label="item.chainSymbol" :value="item.chainId" />
        </el-select>
      </el-form-item>
      <el-form-item prop="address" >
        <el-input v-model="form.address" placeholder="地址"  />
      </el-form-item>
      <div class="password-level-wrap"><p class="text">此地址即将被设置为<span class="strong">“白名单”</span>，为确保您的资金安全，白名单地址将被<span class="strong">锁定24小时</span> （白名单地址为您默认的“安全地址”进行提现操作无安全验证，请谨慎设置您的白名单 ）</p> <div class="triangle-arrow"></div>
      </div>
      <el-form-item label="是否加入白名单" prop="white">
        <el-radio-group v-model="form.white">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item  >
        <el-input v-model="form.remark" placeholder="描述"  />
      </el-form-item>
      <button class="custom-button custom-button-pos" native-type="submit">保存地址</button>
    </el-form>
    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="11"
        :isDialogVisible="dialogCheckVisible"
        @close="dialogCheckVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {ElForm} from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
import GoBack from "@/composables/GoPageBack.vue";
import CheckPermissionDialog from "@/composables/CheckPermissionDialog.vue";
import {goBackDelay, jumpPage, setHeadersAuth} from "@/utils/funcUtil";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { userApi, systemApi } = useServer();
const dialogCheckVisible = ref(false);
const currencyChainList = ref([]);
const formRef = ref(null);
const config = ref({
  type: '',
  id: ''
})
// 初始化数据
const form = ref({
  id: '',
  name: '',
  white: true,
  currencyChain: '',
  address: '',
  remark: '',
});
// 表单数据
const headerForm = ref({
  optToken: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  googleCode: '',
  permissionStatus: false
});
// 表单查询字段数据
const query = ref({
  white: '',
  currencyChain: '',
});

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  headerForm.value = newForm;
  if(headerForm.value.permissionStatus){
    dialogCheckVisible.value = false;
    handleSubmit();
  }
};
// 验证地址是否存在
const checkDuplicate = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      const headers = getHeader();
      const res = await userApi.checkAddressDuplicate({address: form.value.address},  headers);
      if (res.code == 200) {
         if(res.data == 0){
           dialogCheckVisible.value = true;
         }else{
           showErrorMessage(0, '用户地址已存在');
         }
      } else {
        showErrorMessage(res.code, res.message);
      }
    } catch (error) {
      showCatchErrorMessage();
    }
  } else {
    showValidationErrorMessage();
  }
}

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      const headers = getHeader();
      setHeadersAuth(headers, headerForm);
      const res = await userApi.getFrequentlyEdit(form.value,  headers);
      if (res.code === 200) {
        showSuccessMessage(res.code,'创建地址成功');
        if(!config.value.id && !route.query.type){
          goBackDelay(router, 'list')
        }else{
          goBackDelay(router);
        }
      } else {
        showErrorMessage(res.code, res.message)
      }
    } catch (error) {
      showCatchErrorMessage()
    }
  } else {
    showValidationErrorMessage();
  }
};

// 获取资产数据
const fetchData = async () => {
  try {
    const headers = getHeader();
    const res = await systemApi.getChainsList(query, headers);
    if (res.code === 200) {
      currencyChainList.value = res.data;
    }else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showValidationErrorMessage();
  }
};

// 初始化数据
onMounted(() => {
  if(route.query.id || route.query.type){
    config.value.id = route.query.id;
    config.value.type = route.query.type;
  }
  fetchData();
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

.custom-input{
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
