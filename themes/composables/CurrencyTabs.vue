<template>
  <div class="tabs-container">
    <el-tabs v-model="activeIndex" type="card" @tab-click="handleClick" class="tabs">
      <el-tab-pane
          v-for="(currency, index) in currencies"
          :key="index"
          :label="currency.name"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="button-group">
      <el-button type="primary" :icon="View">隐藏</el-button>
      <el-button type="primary" :icon="TrendCharts"  @click="goToMarket">行情</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps } from 'vue';
import { View, TrendCharts } from '@element-plus/icons-vue';
import type { TabsPaneContext } from 'element-plus';
import { useRouter } from 'vue-router';

const props = defineProps({
  initialKey: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const activeIndex = ref(props.initialKey);

const goToMarket = () => {
  router.push('/property/market');
};

// Dynamic data for balance summary
const currencies = ref([
  { index: 0, name: '余额总揽' },
  { index: 1, name: 'OZC' },
  { index: 2, name: 'TOTO' },
  { index: 3, name: 'ETH' },
  { index: 4, name: 'BTC' },
]);

const handleClick = (tab: TabsPaneContext) => {
  const key = tab.index;
  if (key == '0') {
    // router.push(`/property`);
    window.location.href = '/property'
  }else{
    // router.push(`/property/netcoin/${key}`);
    window.location.href = '/property/netcoin/' + key
  }
};
</script>

<style scoped>
.tabs-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tabs {
  flex-grow: 1;
}
.button-group {
  display: flex;
  gap: 10px;
}
</style>