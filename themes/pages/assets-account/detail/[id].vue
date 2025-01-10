<template>
  <div>
    <h4>基本信息</h4>
    <el-table class="table table-striped">
      <tr>
        <td>订单ID: </td><td>{{assets.tradeNo}}</td>
      </tr>
      <tr>
        <td>订单类型: </td><td>{{getTransactionTypeName(assets.tradeType)}}</td>
      </tr>
      <tr>
        <td>发起人: </td><td>{{assets.toAccountName}}</td>
      </tr>
      <tr>
        <td>当前状态: </td><td>{{getStatusName(assets.status)}}</td>
      </tr>
      <tr>
        <td>发起时间: </td><td>{{formatDate(assets.finishTime)}}</td>
      </tr>
    </el-table>
    <h4>交易进度</h4>
    <el-table class="table table-striped">
      <tr>
        <td>进度条:</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 67%;">67%</div>
          </div>
        </td>
      </tr>
      <tr>
        <td>节点确认数: </td><td>{{assets.tradeNo}}</td>
      </tr>
      <tr>
        <td>区块链确认数: </td><td>{{assets.tradeNo}}</td>
      </tr>
      <tr>
        <td>区块链ID: </td><td>{{assets.tradeNo}}</td>
      </tr>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {getHeader} from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer()
const assets = ref({})
const recordId = ref(0)
import { formatCurrency, getCurrencyInfo, getCoinInfo, formatDate, getStatusName, getTransactionTypeName, getCurrencyByCode, getLanguageByCode } from "@/utils/formatUtils";

const fetchData = async () => {
  try {
    const res = await assetsApi.accountAssetsDetail({recordId: recordId.value}, headers);
    if (res.code === 200) {
      assets.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

// 初始化数据
onMounted(() => {
  recordId.value = parseInt(route.params.id);
  fetchData();
})
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 20px;
  background-color: #3b82f6; /* Blue color */
  text-align: center;
  line-height: 20px; /* Center text vertically */
  color: white;
  font-weight: bold;
}
</style>