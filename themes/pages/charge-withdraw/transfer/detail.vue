<template>
  <div class="page">
     <div><img :src="account.accountLogo" class="avatar" /></div>
     <div>{{account.sign}}</div>
     <div>收款码： {{form.qr}}</div>
    <div>{{account.accountNo}}</div>
    <div class="container">
      <el-row :gutter="20" >
        <el-col :span="18">
          <div>{{ form.currencyTitle }} {{form.currencyChainName}}</div>
          <div > {{ form.amount }} {{ form.currencyName }}</div>
        </el-col>
      </el-row>
      <el-input type="textarea" rows="2" v-model="form.remark" />
    </div>
    <el-button type="primary" @click="handleSubmit"> 确认 </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
import { ElMessage } from "element-plus";
import { getCurrencyInfo } from "@/utils/formatUtils";

const route = useRoute();
const headers = getHeader();
const { userApi } = useServer();

const form = ref({
  qr: '',
  currencyId: '',
  currencyName: '',
  currencyTitle: '',
  currencyChainId: '',
  currencyChainName: '',
  amount: '',
  remark: '',
});

const account = ref({
  accountNo: '',
  accountLogo: '',
  sign: ''
});

// 获取初始化信息
const fetchData = async () => {
  // 从路由参数中获取并设置表单数据
  try {
    const res = await userApi.getCheckTransferCode({ qrCode: form.value.qr }, headers);
    if (res.code === 200) {
      account.value = res.data;
      if(!res.data.accountLogo ){
        account.value.accountLogo = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
      }
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 提交
const handleSubmit = async () => {
  try {

  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  form.value.qr = route.query.qr;
  if(route.query.qr == ''){
    // TODO 跳转404页
  }
  form.value.currencyId = route.query.currencyId;
  form.value.currencyName = getCurrencyInfo(route.query.currencyId)?.name;
  form.value.currencyTitle = getCurrencyInfo(route.query.currencyId)?.title;
  form.value.currencyChainId = route.query.currencyChainId;
  form.value.currencyChainName = getCoinInfo(route.query.currencyChainId)?.name;
  form.value.amount = route.query.amount;
  form.value.remark = route.query.remark;

  fetchData();
});

</script>

<style scoped>
.page {
  padding: 20px;
}
.avatar {
  width: 128px;
  height: 128px;
  display: block;
  border-radius: 128px;
}
</style>
