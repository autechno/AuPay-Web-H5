<template>
  <div class="page">
    <el-tabs v-model="activeIndex" @tab-click="handleTabClick">
        <el-tab-pane label="充值" /> <el-tab-pane label="转账" /> <el-tab-pane label="提现" />
      </el-tabs>
      <el-tabs v-model="activeInnerIndex" @tab-click="handleInnerTabClick">
        <el-tab-pane label="收款">
          <Collect />
        </el-tab-pane>
        <el-tab-pane  label="付款">
          <Pay />
        </el-tab-pane>
      </el-tabs>
    </div>
</template>

<script setup lang="ts">
import Collect from './collect.vue';
import Pay from './pay.vue';
import { ref } from 'vue';
// 默认选中充值
const activeIndex = ref('1');
const activeInnerIndex = ref('0');

// 处理外部选项卡点击事件
const handleTabClick = (tab: any) => {
  if(tab.index == '0'){
    window.location.href="/charge-withdraw/recharge";
  }else if(tab.index == '2'){
    window.location.href="/charge-withdraw/withdrawal";
  }
};
// 处理内部选项卡点击事件
const handleInnerTabClick = (tab: any) => {
  activeInnerIndex.value = tab.name;
};
</script>

<style scoped>
.exchange-container {
  padding: 20px;
}
</style>
