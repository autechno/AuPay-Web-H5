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
      <el-button type="primary" :icon="View" @click="setConfigShow">隐藏</el-button>
      <el-button type="primary" :icon="TrendCharts" @click="goToMarket">行情</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, defineEmits, defineProps, onMounted} from 'vue';
import type { TabsPaneContext } from "element-plus";
import { TrendCharts, View } from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
const activeStepId = ref('0');
const emit = defineEmits(['currency-changed', 'show-currency-changed']);
const handleClick = (tab: TabsPaneContext) => {
  const currencyId = tab.props.name;
  emit('currency-changed', currencyId);
};
const headers = getHeader();
const { systemApi } = useServer()
const  showCurrency = ref(false);

defineProps({
  currencyTabs: {
    type: Array,
    required: true,
  }
});

const getConfigShow = async () => {
  try {
    const res = await systemApi.getUserSystemConfig({}, headers);
    if (res.code === 200) {
      showCurrency.value = res.data.showHide == 1?true:false;
      emit('show-currency-changed', showCurrency.value);
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

const setConfigShow = async () => {
  try {
    showCurrency.value = !showCurrency.value;
    emit('show-currency-changed', showCurrency.value);
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

onMounted(() => {
  getConfigShow()
})

const goToMarket = () => {
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