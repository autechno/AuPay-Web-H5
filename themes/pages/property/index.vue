<template>
  <el-tabs v-model="activeTab" class="demo-tabs" @tab-click="handleClick">
    <el-tab-pane
        v-for="(currency, index) in currencies"
        :key="index"
        :label="currency.name"
    >
    </el-tab-pane>
  </el-tabs>
  <el-row v-for="(item, index) in assets" :key="index" class="asset-item">
    <el-col :span="12">{{ item.name }}</el-col>
    <el-col :span="12" style="text-align: right;">{{ item.amount }}</el-col>
  </el-row>
  <div style="text-align: right; margin-top: 20px; font-weight: bold;">
    总资产：{{ totalAssets }}
  </div>
  <el-table :data="orders" style="width: 100%">
    <el-table-column prop="index" label="序号" width="60" />
    <el-table-column prop="orderId" label="订单ID" sortable />
    <el-table-column prop="orderType" label="订单类型" />
    <el-table-column prop="initTime" label="发起时间" sortable />
    <el-table-column prop="completionTime" label="完成时间 (成功&失败)" sortable />
    <el-table-column prop="tokenName" label="代币名称" sortable />
    <el-table-column prop="tokenProtocol" label="代币协议" sortable />
    <el-table-column prop="amount" label="数量" sortable />
    <el-table-column prop="transactionStatus" label="交易状态" />
    <el-table-column label="操作" width="100">
      <template #default="scope">
        <a href="">查看详情</a>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { TabsPaneContext } from 'element-plus'
const activeTab = ref('0')
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
// Dynamic data for balance summary
const currencies = ref([
  { name: '余额总揽'}, { name: 'OZC' }, { name: 'TOTO'}, { name: 'ETH'},  { name: 'BTC'},
]);

const assets = ref([
  { name: 'OZC', amount: '1,000,000.00' },
  { name: 'TOTO', amount: '1,000,000.00' },
  { name: 'ETH', amount: '1,200,000.00' },
  { name: 'BTC', amount: '1,200,000.00' },
]);

// Calculate total assets
const totalAssets = assets.value.reduce((total, item) => {
  return total + parseFloat(item.amount.replace(/,/g, ''));
}, 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

const orders = ref([
  {
    index: 1,
    orderId: 'ORD123456',
    orderType: '买入',
    initTime: '2023-01-01 10:00:00',
    completionTime: '2023-01-01 10:05:00',
    tokenName: 'ETH',
    tokenProtocol: 'ERC20',
    amount: '0.5',
    transactionStatus: '成功',
  },
  {
    index: 2,
    orderId: 'ORD123457',
    orderType: '卖出',
    initTime: '2023-01-02 11:00:00',
    completionTime: '2023-01-02 11:10:00',
    tokenName: 'BTC',
    tokenProtocol: 'BTC',
    amount: '0.1',
    transactionStatus: '失败',
  }
]);

</script>

<style>
  .demo-tabs > .el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
  }
  .asset-item {
    width: 80%;
    margin-bottom: 10px;
  }
</style>