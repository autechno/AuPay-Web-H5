<template>
  <div class="page">
    <h4>基本信息</h4>
    <table class="table table-striped">
      <tr>
        <td>订单ID: </td><td>{{assets.tradeNo}}</td>
      </tr>
      <tr>
        <td>订单类型: </td><td>{{getTransactionTypeName(assets.tradeType)}}</td>
      </tr>
      <tr>
        <td>发起人: </td><td>{{assets.fromAccountName}}</td>
      </tr>
      <tr>
        <td>当前状态: </td><td>{{getStatusText(assets.status, 'ACCOUNT')}}</td>
      </tr>
      <tr>
        <td>发起时间: </td><td>{{formatDate(assets.finishTime)}}</td>
      </tr>
    </table>
    <h4>交易进度</h4>
    <table class="table">
      <tr>
        <td>进度条:</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 67%;">67%</div>
          </div>
        </td>
      </tr>
      <tr>
        <td>节点确认数: </td><td>空</td>
      </tr>
      <tr>
        <td>区块链确认数: </td><td>空</td>
      </tr>
      <tr>
        <td>区块链ID: </td><td>{{assets.txHash}}</td>
      </tr>
    </table>
    <h4>概览</h4>
    <table class="table">
      <tr>
        <td>用户头像:</td><td><img :src="assets.fromLogo" /></td>
      </tr>
      <tr>
        <td>用户昵称: </td><td>{{assets.fromNikeName}}</td>
      </tr>
      <tr>
        <td>用户账户: </td><td>{{assets.fromAccountName}}</td>
      </tr>
      <tr>
        <td>交易地址: </td><td>{{assets.fromWalletAddress}}</td>
      </tr>
    </table>
    <table class="table">
      <tr>
        <td>交易类型:</td><td>{{assets.tradeType}}</td>
      </tr>
      <tr>
        <td>数量: </td><td>{{assets.fromAmount}}</td>
      </tr>
      <tr>
        <td>代币名称: </td><td>{{assets.fromCurrencyId}}</td>
      </tr>
      <tr>
        <td>链: </td><td>{{assets.fromCurrencyChain	}}</td>
      </tr>
      <tr>
        <td>字符“至”: </td><td>空</td>
      </tr>
    </table>
    <table class="table">
      <tr>
        <td>用户头像:</td><td><img :src="assets.toLogo" /></td>
      </tr>
      <tr>
        <td>用户昵称: </td><td>{{assets.toNikeName}}</td>
      </tr>
      <tr>
        <td>用户账户: </td><td>{{assets.toAccountName}}</td>
      </tr>
      <tr>
        <td>交易地址: </td><td>{{assets.toWalletAddress}}</td>
      </tr>
    </table>

    <table class="table">
      <tr>
        <td>用户头像:</td><td><img :src="assets.toLogo" /></td>
      </tr>
      <tr>
        <td>用户昵称: </td><td>{{assets.toNikeName}}</td>
      </tr>
      <tr>
        <td>用户账户: </td><td>{{assets.toAccountName}}</td>
      </tr>
      <tr>
        <td>交易地址: </td><td>{{assets.toWalletAddress}}</td>
      </tr>
    </table>
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
import {formatDate, getStatusText, getTransactionTypeName} from "@/utils/formatUtils";

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
  recordId.value = parseInt(route.query.id);
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
