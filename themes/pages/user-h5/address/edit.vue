<template>
  <div class="page">
    <GoBack title="地址库" />
    <div class="title-wrap">修改地址</div>
    <el-form :model="form" :rules="rules" class="custom-input" ref="formRef" @submit.prevent="checkDuplicate">
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
      <div class="footer-wrap">
        <el-button class="custom-button-down-default" @click="deleteAddress">删除</el-button>
        <el-button class="custom-button-down" native-type="submit">保存</el-button>
      </div>
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
import {ElForm, ElMessage} from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
import GoBack from "@/composables/GoPageBack.vue";
import CheckPermissionDialog from "~/composables/CheckPermissionDialog.vue";
import {goBackDelay, setHeadersAuth} from "@/utils/funcUtil";
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { userApi, systemApi } = useServer();
const dialogCheckVisible = ref(false);
const currencyChainList = ref([]);
const formRef = ref(null);
const activeStepId = ref(1);
const type = ref(1);
// 原用户地址
let originalAddress = '';
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
// 验证地址是否存在
const checkDuplicate = async () => {
  type.value = 1;
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      if(originalAddress == form.value.address){
        dialogCheckVisible.value = true;
      }else{
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
      }
    } catch (error) {
      showCatchErrorMessage();
    }
  } else {
    showValidationErrorMessage();
  }
}


// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  headerForm.value = newForm;
  if(headerForm.value.permissionStatus){
    dialogCheckVisible.value = false;
    activeStepId.value = 2;
    if(type.value == 1){
      handleSubmit();
    }else{
      deleteAddress();
    }
  }
};

// 删除地址
const deleteAddress = async () => {
    type.value = 2;
    try {
      if(activeStepId.value == 1){
        dialogCheckVisible.value = true;
        return ;
      }
      const headers = getHeader();
      setHeadersAuth(headers, form);
      const res = await userApi.getFrequentlyDelete(form.value, headers);
      if (res.code === 200) {
        showSuccessMessage(res.code,'删除地址成功');
        goBackDelay(router)
      } else {
        showErrorMessage(res.code, res.message)
      }
    } catch (error) {
      showCatchErrorMessage()
    }
};

// 提交地址
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    try {
      const headers = getHeader();
      setHeadersAuth(headers, headerForm);
      const res = await userApi.getFrequentlyEdit(form.value,  headers);
      if (res.code === 200) {
        showSuccessMessage(res.code,'修改地址成功');
        goBackDelay(router)
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
const fetchData = async (id: number) => {
  try {
    const headers = getHeader();
    const [addressRes, chainsRes] = await Promise.all([
      userApi.getFrequentlyList({}, headers),
      systemApi.getChainsList(query, headers)
    ]);
    if (addressRes.code === 200) {
      form.value = addressRes.data.find(item => item.id == id);
      originalAddress = form.value.address;
    } else {
      showErrorMessage(addressRes.code, addressRes.message);
    }
    // 处理链列表查询结果
    if (chainsRes.code === 200) {
      currencyChainList.value = chainsRes.data;
    } else {
      showErrorMessage(chainsRes.code, chainsRes.message);
    }
  } catch (error) {
    showCatchErrorMessage();
  }
};

// 初始化数据
onMounted(() => {
  activeStepId.value = 1;
  if(route.query.id){
    fetchData(route.query.id);
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
  .el-button {
    flex: 1;
    margin-left: 30px;
  }
  .el-button:last-child {
    margin-right: 30px;
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
