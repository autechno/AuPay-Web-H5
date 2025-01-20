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
      <el-table-column label="链" >
        <template #default="scope">
          {{ getCoinInfo(scope.row.currencyId).title }}
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
    <!-- 密码验证对话框 -->
    <CheckPermissionDialog
        :form="form"
        @update:form="updateForm"
        :permissionId="11"
        :isDialogVisible="dialogCheckVisible"
        @close="handleCheckPermissionClose"
    />
    <!-- 创建地址对话框 -->
    <el-dialog :title="title" v-model="dialogVisible">
      <el-form :model="form" ref="formRef">
        <el-form-item label="名称" prop="name" :rules="[{ required: true, message: '请输入名称', trigger: 'blur' }]">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="链" prop="currencyChain" :rules="[{ required: true, message: '请选择链', trigger: 'change' }]">
          <el-select v-model="form.currencyChain" placeholder="请选择链">
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
          <el-input v-model="form.address" :rules="[{ required: true, message: '请输入地址', trigger: 'change' }]"/>
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
        <el-form-item label="链" prop="currencyChain">
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
import { setHeadersAuth } from "@/utils/funcUtil";
import {getDataList, getCurrencyInfo, getCoinInfo} from "@/utils/formatUtils";
import CheckPermissionDialog from "~/composables/CheckPermissionDialog.vue";
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
const { userApi } = useServer();
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
  permissionStatus: false
};
// 表单查询字段数据
const query = ref({
  white: '',
  currencyId: '',
  currencyChain: '',
});
// 表单数据
const form = ref({ ...initialFormValues });

// 更新父组件的 form 数据
const updateForm = (newForm: Object) => {
  form.value = newForm;
  if(form.value.permissionStatus){
    dialogCheckVisible.value = false;
    activeStepId.value = 1
    if(opearType.value == 2){
      toggleWhitelist();
    }else if(opearType.value == 3){
      deleteItem();
    }else if(opearType.value == 0 || opearType.value == 1){
      dialogVisible.value = true;
    }
  }
};

// 数据
const recordList = ref([]);
const formRef = ref(null);
const dialogVisible = ref(false);
const dialogCheckVisible = ref(false);
const searchDialogVisible = ref(false);
const bindGoogleAuth = ref(false);
const statusOptions = ref(getDataList('searchStatus'));
const chainOptions = ref(getDataList('coin'));
const activeStepId = ref(1);
const title = ref('创建地址');
const opearType = ref(0);

// 关闭按钮
const handleCheckPermissionClose = () => {
  dialogCheckVisible.value = false;
};

// 编辑地址按钮
const opearItemBtn = (obj: any, type: number) => {
  opearType.value = type;
  if (type === 0) {
    title.value = '创建地址';
    form.value.id = '';
    form.value.name = '';
    form.value.currencyId = '';
    form.value.currencyChain = '';
    form.value.address = '';
    form.value.remark = '';
  } else if (type === 1) {
    title.value = '编辑地址';
    form.value = { ...obj };
  } else if (type === 2 || type === 3) {
    form.value.id = obj.id;
  }
  dialogCheckVisible.value = true;
};

// 编辑地址
const editAddress = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        setHeadersAuth(headers, form);
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
      setHeadersAuth(headers, form);
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
    setHeadersAuth(headers, form);
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
