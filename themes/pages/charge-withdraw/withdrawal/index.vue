<template>
  <div class="page">
    <el-tabs v-model="activeIndex" @tab-click="handleTabClick">
      <el-tab-pane label="充值" /> <el-tab-pane label="转账" /> <el-tab-pane label="提现"  />
    </el-tabs>
    withdrawal
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
const activeIndex = ref('2');

// 处理外部选项卡点击事件
const handleTabClick = (tab: any) => {
  if(tab.index == '1'){
    window.location.href="/charge-withdraw/transfer";
  }else if(tab.index == '0'){
    window.location.href="/charge-withdraw/recharge";
  }
};


</script>

<style scoped>
</style>
