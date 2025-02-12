<template>
  <div class="address-index">
    <GoBack title="地址库" />
    <div class="title-wrap">新增地址</div>
    <el-form :model="form" :rules="rules" class="custom-input" ref="formRef" @submit.prevent="handleSubmit">
      <el-form-item prop="name" >
        <el-input v-model="form.name"  placeholder="请输入数量"  />
      </el-form-item>
      <el-form-item prop="currencyChain" >
        <el-select
            id="currency-select"
            v-model="form.currencyChain"
            placeholder="请选择链">
          <el-option v-for="item in currencyChainList" :key="item.chainId" :label="item.chainSymbol" :value="item.chainId" />
        </el-select>
      </el-form-item>
      <el-form-item prop="address" >
        <el-input v-model="form.address" placeholder="请输入地址"  />
      </el-form-item>
      <el-form-item label="是否加入白名单" prop="white">
        <el-radio-group v-model="form.white">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item  >
        <el-input v-model="form.remark" placeholder="请输入描述"  />
      </el-form-item>
      <el-button class="custom-button custom-button-pos" native-type="submit">保存地址</el-button>
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
import {goBackDelay, setHeadersAuth} from "@/utils/funcUtil";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const headers = getHeader();
const { userApi, systemApi } = useServer();
const dialogCheckVisible = ref(false);
const currencyChainList = ref([]);
const formRef = ref(null);
const activeStepId = ref(1)
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
    activeStepId.value = 2;
    dialogCheckVisible.value = false;
    handleSubmit();
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      if(activeStepId.value == 1){
        dialogCheckVisible.value = true;
        return ;
      }
      setHeadersAuth(headers, headerForm);
      const res = await userApi.getFrequentlyEdit(form.value,  headers);
      if (res.code === 200) {
        showSuccessMessage(res.code,'创建地址成功');
        if(!config.value.id){
          goBackDelay(router, 'list')
        }else{
          if(config.value.type == 'withdrawal'){
            router.push({path:'/charge-withdraw-h5/withdrawal/selected', query: {assetsId: config.value.id, address: encodeURIComponent(form.value.address)} });
          }
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
  activeStepId.value = 1;
  if(route.query.id){
    config.value.id = route.query.id;
    config.value.type = route.query.type;
  }
  fetchData();
});
</script>

<style scoped>
.address-index {
  padding-top: 28px;
  .title-wrap{
    line-height: 24px;
    height: 24px;
    margin: 18px 0 ;
    color: #0D0D0D;
    font-size: 16px;
  }
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
