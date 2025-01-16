<template>
  <div class="page">
    <div class="qc-wrap">
      <QCcode :value="form.generateQR" :size="300" />
      <div>auPayID:{{ form.transferQR }} <el-button type="primary" size="small" @click="copyText(form.transferQR)">复制</el-button></div>
      <div><el-button @click="isDialogVisible = true">编辑</el-button></div>
      <div><el-button @click="cleanQR">清空</el-button></div>
      <div><el-button>下载</el-button></div>
      <div><el-button>分享</el-button></div>
    </div>

    <!-- 转账弹窗 -->
    <el-dialog title="转账" v-model="isDialogVisible" width="500">
      <el-form :model="form" ref="formRef">
        <el-select
            style="margin-bottom: 20px;"
            id="currency-select"
            v-model="form.currencyId"
            placeholder="请选择货币"
            @change="handleCurrencyChain">
          <el-option
              v-for="currency in currencyList"
              :key="currency.currencyId"
              :label="currency.currencyName"
              :value="currency.currencyId"
          />
        </el-select>
        <el-select
            id="chain-select"
            style="margin-bottom: 20px;"
            v-model="form.currencyChainId"
            placeholder="请选择链" >
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChainId"
              :label="chain.currencyChainName"
              :value="chain.currencyChainId"
          />
        </el-select>
        <el-form-item label="数量" prop="inputAmount" :rules="[{ required: true, message: '请输入数量', trigger: 'blur' }, { type: 'number', min: 1, message: '数量不能小于 1', trigger: 'blur' }]">
          <el-input v-model.number="form.inputAmount"></el-input>
        </el-form-item>
        <el-form-item label="收款备注" prop="remark">
          <el-input v-model="form.remark"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {ElForm, ElMessage, ElNotification} from "element-plus";
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
const { userApi, assetsApi } = useServer();
import QCcode from "@/composables/QCcode.vue";
const formRef = ref(null);
const isDialogVisible = ref(false);
const currencyList = ref([]);
const currencyChainList = ref([]);
// 表单数据
const form = ref({
  transferQR: '23232323',
  generateQR: '23232323',
  currencyId: null,
  currencyChainId: null,
  inputAmount: '',
  remark: '',
});

// 获取数据的函数
const assetsData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code === 200) {
      let dataList = res.data;
      const currencyMap = new Map();
      dataList.forEach(item => {
        if (!currencyMap.has(item.currencyId)) {
          currencyMap.set(item.currencyId, {
            currencyId: item.currencyId,
            currencyName: getCurrencyInfo(item.currencyId)?.name,
            chains: [],
            walletAddress: item.walletAddress,
          });
        }
        currencyMap.get(item.currencyId).chains.push({
          currencyChainId: item.currencyChain,
          currencyChainName: getCoinInfo(item.currencyChain)?.name,
          walletAddress: item.walletAddress,
        });
      });
      currencyList.value = Array.from(currencyMap.values());
      // 查询参数
      const { currencyId, currencyChainId } = getQueryParams();
      if (currencyId) {
        form.value.currencyId = currencyId;
        handleCurrencyChain();
        if (currencyChainId) {
          form.value.currencyChainId = currencyChainId;
        }
      }else{
        form.value.currencyId = currencyList.value[0]?.currencyId;
        form.value.currencyChainId = currencyList.value[0]?.chains[0]?.currencyChainId;
        currencyChainList.value = currencyList.value[0]?.chains || [];
      }
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 复制方法
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '成功',
      message: '链接已复制到剪贴板!',
      type: 'success',
      duration: 2000,
    });
  }).catch(err => {
    console.error('复制文本时出错: ', err);
  });
};

// 更新链选择
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === form.value.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    form.value.currencyChainId = currentCurrency.chains[0]?.currencyChainId;
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  try {
    if (valid) {
      let transferQR = form.value.transferQR;
      form.value.generateQR = `?qr=${form.value.transferQR}&currencyId=${form.value.currencyId}&currencyChainId=${form.value.currencyChainId}&inputAmount=${form.value.inputAmount}&remark=${form.value.remark}`;
      isDialogVisible.value = false;
      console.log(form.value);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 提交转账
const cleanQR = () => {
  form.value.generateQR = form.value.transferQR;
  form.value.currencyId = '';
  form.value.currencyChainId = '';
  form.value.inputAmount = '';
  form.value.remark = '';
};

// 获取 URL 查询参数
const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    currencyId: urlParams.get('currencyId'),
    currencyChainId: urlParams.get('currencyChainId'),
  };
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  form.value.transferQR = userStore.userInfo.transferQR;
  form.value.generateQR = userStore.userInfo.transferQR;
  assetsData();
});
</script>

<style scoped>
.qc-wrap {
  margin: 0 auto;
  width: 500px;
  background: #f1f1f1;
  height: 500px;
}
</style>
