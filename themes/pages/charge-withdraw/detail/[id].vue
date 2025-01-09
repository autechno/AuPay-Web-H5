<template>
  <div class="exchange-container">
    <h2>交易记录</h2>
    <el-table :data="transactions" style="width: 100%">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="orderId" label="订单ID" sortable></el-table-column>
      <el-table-column prop="orderType" label="订单类型" sortable></el-table-column>
      <el-table-column prop="initTime" label="发起时间" sortable></el-table-column>
      <el-table-column prop="completeTime" label="完成时间" sortable></el-table-column>
      <el-table-column prop="tokenName" label="代币名称" sortable></el-table-column>
      <el-table-column prop="tokenProtocol" label="代币协议" sortable></el-table-column>
      <el-table-column prop="amount" label="数量" sortable></el-table-column>
      <el-table-column prop="status" label="交易状态"></el-table-column>
      <el-table-column prop="action" label="操作" width="120">
        <template #default="scope">
          <el-button @click="viewDetails(scope.row)" type="text">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const transactions = ref([
  {
    orderId: '123456',
    orderType: '充值',
    initTime: '2024/09/09 21:30:47',
    completeTime: '2024/09/09 22:00:00',
    tokenName: 'OZC',
    tokenProtocol: 'ERC-20',
    amount: '1,000.00',
    status: '交易中'
  },
  {
    orderId: '123457',
    orderType: '提现',
    initTime: '2024/09/10 10:15:30',
    completeTime: '2024/09/10 10:45:00',
    tokenName: 'USDT',
    tokenProtocol: 'ERC-20',
    amount: '500.00',
    status: '交易成功'
  }
]);

const viewDetails = (row) => {
  console.log('查看详情:', row);
  // 这里可以添加查看详情的逻辑，例如打开一个对话框
};
</script>

<style scoped>
.exchange-container {
  padding: 20px;
}
</style>