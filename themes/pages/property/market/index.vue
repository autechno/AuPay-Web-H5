<template>
    <div class="tabs-container tabs">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="全部" name="all">
        </el-tab-pane>
        <el-tab-pane label="关注" name="favorites">
        </el-tab-pane>
      </el-tabs>
      <div class="right-select">
        <el-select v-model="selectedCurrency" placeholder="全部币种">
          <el-option
              v-for="currency in currencies"
              :key="currency.value"
              :label="currency.label"
              :value="currency.value"
          />
        </el-select>
      </div>
    </div>
    <el-table :data="filteredData" style="width: 100%">
      <el-table-column prop="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="currency" sortable label="币种" width="120">
        <template #default="scope">
          <span>{{ scope.row.currency }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="marketCap" sortable label="市值" width="120" />
      <el-table-column prop="volume" sortable label="24h量" width="120" />
      <el-table-column prop="amount" sortable label="24h额" width="120" />
      <el-table-column prop="price" sortable label="价格" width="120" />
      <el-table-column prop="change" sortable label="涨跌" width="120" />
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button @click="addToFavorites(scope.row)">关注</el-button>
        </template>
      </el-table-column>
    </el-table>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const activeTab = ref('all');
const selectedCurrency = ref('');

const currencies = ref([
  { label: '全部币种', value: 'all' },
  { label: 'Bitcoin', value: 'btc' },
  { label: 'Ethereum', value: 'eth' },
  { label: 'Ripple', value: 'xrp' },
]);

const marketData = ref([
  {
    index: 1,
    currency: 'Bitcoin',
    marketCap: '800B',
    volume: '30B',
    amount: '500K',
    price: '40,000',
    change: '2%',
  },
  {
    index: 2,
    currency: 'Ethereum',
    marketCap: '300B',
    volume: '15B',
    amount: '250K',
    price: '3,000',
    change: '1.5%',
  }
]);

// Filter data based on the selected currency (if needed)
const filteredData = computed(() => {
  if (selectedCurrency.value === 'all' || !selectedCurrency.value) {
    return marketData.value;
  }
  return marketData.value.filter(item => item.currency === selectedCurrency.value);
});

// Function to handle adding to favorites (placeholder logic)
const addToFavorites = (item) => {
  console.log('Added to favorites:', item);
};
</script>

<style scoped>
.right-select {
  width: 200px;
}
.tabs {
  flex-grow: 1;
}

</style>