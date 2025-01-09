<template>
  <div class="tabs-container">
    <el-tabs v-model="activeStepId" type="card" @tab-click="handleClick" class="tabs">
      <el-tab-pane
          v-for="(item, index) in currencyTabs"
          :key="item.currencyId"
          :name="item.currencyId"
          :label="item.name"
      >
      </el-tab-pane>
    </el-tabs>
    <div class="button-group">
      <el-button type="primary" :icon="View">隐藏</el-button>
      <el-button type="primary" :icon="TrendCharts" @click="goToMarken">行情</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits, defineProps } from 'vue';
import type { TabsPaneContext } from "element-plus";
import { TrendCharts, View } from "@element-plus/icons-vue";
import { useRouter } from 'vue-router';

defineProps({
  currencyTabs: {
    type: Array,
    required: true,
  }
});

const activeStepId = ref('0');
const emit = defineEmits(['currency-changed']);
const router = useRouter();
const handleClick = (tab: TabsPaneContext) => {
  const currencyId = tab.props.name;
  emit('currency-changed', currencyId);
};

const goToMarken = () => {
  window.location.href="/assets-account/market";
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