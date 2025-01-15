<template>
  <div class="exchange-container">
    <el-tabs v-model="activeIndex" @tab-click="handleTabClick">
      <el-tab-pane label="充值">
          <Recharge  />
      </el-tab-pane>
      <el-tab-pane label="转账">
          <TransferAccounts  />
      </el-tab-pane>
      <el-tab-pane label="提现">
          <Withdrawal  />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import Recharge from '@/composables/Recharge.vue';
import TransferAccounts from '@/composables/TransferAccounts.vue';
import Withdrawal from '@/composables/Withdrawal.vue';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

// 默认选中充值
const activeIndex = ref(route.query.typeId || '0');

// 处理选项卡点击事件
const handleTabClick = (tab: any) => {
  activeIndex.value = tab.index;
  return navigateTo({
    path: `/charge-withdraw`,
    query: { typeId: activeIndex.value }
  });
};

</script>

<style scoped>
</style>
