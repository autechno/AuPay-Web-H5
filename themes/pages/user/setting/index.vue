<template>
  <div class="container">
    <!-- 对应的 Select 表单 -->
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px" class="mt-6">
      <!-- 货币单位 -->
      <el-form-item  label="货币单位" prop="currencyUnit">
        <el-select v-model="form.currencyUnit" placeholder="请选择货币单位">
          <el-option v-for="item in currencyOptions" :key="item.code" :label="item.mame" :value="item.code" />
        </el-select>
      </el-form-item>

      <!-- 隐藏余额 -->
      <el-form-item label="隐藏余额" prop="showHide">
        <el-select v-model="form.showHide" placeholder="请选择是否隐藏余额">
          <el-option v-for="item in hideBalanceOptions" :key="item.code" :label="item.title" :value="item.code" />
        </el-select>
      </el-form-item>

      <!-- 语言选择 -->
      <el-form-item  label="语言选择" prop="systemLanguage">
        <el-select v-model="form.systemLanguage" placeholder="请选择语言">
          <el-option v-for="item in languageOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import {getHeader} from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
import { getDataList } from "@/utils/formatUtils";
const headers = getHeader();
const { userApi } = useServer();
const currencyOptions = ref(getDataList('currency'));
const languageOptions = ref(getDataList('language'));
const hideBalanceOptions = ref(getDataList('hideBalance'));

// 当前激活的 Tab
const formRef = ref(null);

// 表单数据
const form = ref({
  id: '',
  currencyUnit: '',
  showHide: '',
  systemLanguage: '',
});

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
      let res = await userApi.setUserSystemConfig(form.value, headers);
      if(res.code == 200) {
        const userStore = UseUserStore();
        const result = await userStore.fetchUserInfo();
        if(result){
          ElMessage.success('设置成功！');
        }
      }
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
};

// 获取初始化信息
const fetchData = async () => {
  try {
    const res = await userApi.getUserSystemConfig({}, headers);
    if (res.code === 200) {
      form.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
});

</script>

<style scoped>
.mt-6 {
  margin-top: 1.5rem;
}
</style>
