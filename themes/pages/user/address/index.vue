<template>
  <div class="container">
    <!-- 创建按钮 -->
    <el-button type="primary" @click="opearItemBtn({}, 0);">创建</el-button>
    <el-button type="success" @click="openSearchDialog">搜索</el-button>

    <!-- 消息表格 -->
    <el-table :data="recordList" style="width: 100%">
      <el-table-column label="序号" width="60">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="代币种类" label="代币种类" >
        <template #default="scope">
          {{ getCurrencyInfo(scope.row.currencyId).title }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" > </el-table-column>
      <el-table-column prop="address" label="地址"> </el-table-column>
      <el-table-column prop="remark" label="描述"> </el-table-column>
      <el-table-column label="白名单">
        <template #default="scope">
          {{scope.row.white ?'是':'否' }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button @click="opearItemBtn(scope.row, 2)" type="text">
            {{ scope.row.white ? '关闭白名单' : '开启白名单' }}
          </el-button>
          <el-button @click="opearItemBtn(scope.row, 1)" type="text">编辑</el-button>
          <el-button @click="opearItemBtn(scope.row, 3)" type="text" >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 创建密码验证对话框 -->
    <el-dialog title="兑换验证" v-model="dialogCheckVisible">
      <el-form :model="form" :rules="rules" ref="formRef"  @submit.prevent="handleCheck">
        <el-form-item  v-if="activeStepId == 1" label="设置支付密码" prop="assetsPassword">
          <el-input v-model="form.assetsPassword" type="password" placeholder="设置支付密码" />
        </el-form-item>
        <el-form-item v-if="activeStepId == 2" label="身份验证器APP验证码" prop="googleCode" >
          <el-input v-model="form.googleCode" type="password" placeholder="请输入6位验证码" />
        </el-form-item>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogCheckVisible = false">取 消</el-button>
        <el-button type="primary" native-type="submit">确 定</el-button>
      </span>
      </el-form>
    </el-dialog>
    <!-- 创建地址对话框 -->
    <el-dialog :title="title" v-model="dialogVisible">
      <el-form :model="form" ref="formRef">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="代币种类" prop="currencyId" :rules="[{ required: true, message: '请选择代币种类', trigger: 'change' }]">
          <el-select v-model="form.currencyId">
            <el-option v-for="item in currencyOptions" :key="item.code" :label="item.title" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="代币协议" prop="currencyChain" :rules="[{ required: true, message: '请选择代币协议', trigger: 'change' }]">
          <el-select v-model="form.currencyChain">
            <el-option v-for="item in chainOptions" :key="item.code" :label="item.title" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否白名单" prop="white">
          <el-radio-group v-model="form.white">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.remark" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 搜索对话框 -->
    <el-dialog title="搜索" v-model="searchDialogVisible">
      <el-form :model="query" ref="searchFormRef">
        <el-form-item label="白名单" prop="white">
          <el-select v-model="query.white" placeholder="白名单">
            <el-option v-for="item in statusOptions" :key="item.code" :label="item.title" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="代币种类" prop="currencyId">
          <el-select v-model="query.currencyId" placeholder="请选择代币种类">
            <el-option v-for="item in currencyOptions" :key="item.code" :label="item.title" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="代币协议" prop="currencyChain">
          <el-select v-model="query.currencyChain" placeholder="请选择代币协议">
            <el-option v-for="item in chainOptions" :key="item.code" :label="item.title" :value="item.code" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="searchDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSearch">搜 索</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {ElForm, ElMessage} from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import {getDataList, getCurrencyInfo} from "@/utils/formatUtils";
// 打开搜索对话框
const openSearchDialog = () => {
  searchDialogVisible.value = true;
};

// 处理搜索
const handleSearch = async () => {
  searchDialogVisible.value = false;
  fetchData();
};
const headers = getHeader();
const { userApi, systemApi } = useServer();
// 初始化数据
const initialFormValues = {
  id: '',
  name: '',
  white: false,
  currencyId: '',
  currencyChain: '',
  address: '',
  remark: '',
  optToken: '',
  assetsPassword: '',
  passwordToken: '',
  googleToken: '',
  googleCode: '',
};
// 表单查询字段数据
const query = ref({
  white: '',
  currencyId: '',
  currencyChain: '',
});
// 表单数据
const form = ref({ ...initialFormValues });
// 表单验证规则
const rules = {
  assetsPassword: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  googleCode: [
    { required: true, message: 'google验证码不能为空', trigger: 'blur' },
  ],
};
// 数据
const recordList = ref([]);
const formRef = ref(null);
const dialogVisible = ref(false);
const dialogCheckVisible = ref(false);
const searchDialogVisible = ref(false);
const bindGoogleAuth = ref(false);
const currencyOptions = ref(getDataList('cryptocurrencies'));
const statusOptions = ref(getDataList('searchStatus'));
const chainOptions = ref(getDataList('coin'));
const activeStepId = ref(1);
const title = ref('创建地址');
const opearType = ref(1);

// 验证密码
const handleCheck = async () => {
  try {
    if(activeStepId.value == 1){
      let flashRes = await systemApi.checkPermission({permissionId: 11}, headers);
      if(flashRes.code == 200) {
        form.value.optToken = flashRes.data.optToken;
        let passRes = await systemApi.verifyAssetsPassword({
          assetsPassword: form.value.assetsPassword,
          optToken: flashRes.data.optToken
        }, headers);
        if(passRes.code == 200) {
          form.value.passwordToken = passRes.data;
          if(bindGoogleAuth.value){
            activeStepId.value = 2;
          }else{
            processFunc();
          }
        }
      }
    }else{
      let googleRes = await systemApi.verifyValidateGoogle({
        googleCode: form.value.googleCode,
        optToken: form.value.optToken
      }, headers);
      if(googleRes.code == 200) {
        form.value.googleToken = googleRes.data;
        processFunc();
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

// 执行
const processFunc = async() =>{
  dialogCheckVisible.value = false;
  activeStepId.value = 1
  if(opearType.value == 2){
    toggleWhitelist();
  }else if(opearType.value == 3){
    deleteItem();
    console.log(3)
  }else if(opearType.value == 0 || opearType.value == 1){
    dialogVisible.value = true;
  }
}

// 编辑地址按钮
const opearItemBtn = (obj: any, type: number) => {
  opearType.value = type;
  if(type == 0){
    title.value = '创建地址';
    form.value.id = '';
  } else if(type == 1){
    title.value = '编辑地址';
    form.value = obj;
  }else if(type == 2 || type == 3){
    form.value.id = obj.id;
  }
  dialogCheckVisible.value = true;
};

// 编辑地址
const editAddress = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        headers['Assets-Password-Token'] = form.value.passwordToken;
        if(form.value.googleToken != '' && bindGoogleAuth.value){
          headers['Google-Auth-Token'] = form.value.googleToken;
        }
        const response = await userApi.getFrequentlyEdit(form.value,  headers);
        if (response.code === 200) {
          ElMessage.success(title.value + '成功');
          dialogVisible.value = false;
          fetchData();
        } else {
          ElMessage.error(response.message || '创建失败');
        }
      } catch (error) {
        ElMessage.error('请求失败，请重试');
      }
    } else {
      ElMessage.error('表单验证失败，请检查输入');
    }
  });
};

// 删除地址
const deleteItem = async () => {
  const confirm = await ElMessageBox.confirm('确认删除该项吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });
  if (confirm) {
    // 调用 API 删除项
    try {
      headers['Assets-Password-Token'] = form.value.passwordToken;
      if(form.value.googleToken != ''){
        headers['Google-Auth-Token'] = form.value.googleToken;
      }
      const response = await userApi.getFrequentlyDelete(form.value, headers);
      if (response.code === 200) {
        ElMessage.success('删除成功');
        dialogCheckVisible.value = false;
        fetchData(); // 刷新数据
      } else {
        ElMessage.error(response.message || '删除失败');
      }
    } catch (error) {
      ElMessage.error('请求失败，请重试');
    }
  }
};

// 获取初始化信息
const fetchData = async () => {
  try {
    form.value = { ...initialFormValues };
    const res = await userApi.getFrequentlyList(query.value, headers);
    if (res.code === 200) {
      recordList.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 切换白名单
const toggleWhitelist = async () => {
  try {
    headers['Assets-Password-Token'] = form.value.passwordToken;
    if(form.value.googleToken != ''){
      headers['Google-Auth-Token'] = form.value.googleToken;
    }
    const response = await userApi.getFrequentlyToggle(form.value, headers);
    if (response.code === 200) {
      ElMessage.success('状态更新成功');
      dialogCheckVisible.value = false;
      fetchData(); // 刷新数据
    } else {
      ElMessage.error(response.message || '状态更新失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  bindGoogleAuth.value = userStore.userInfo.bindGoogleAuth;
  fetchData();
});

</script>

<style scoped>
.button-group {
  margin: 20px 0;
}
</style>
