<!-- AffixContainer.vue -->
<template>
  <div class="affix-container">
    <el-affix target=".affix-container" :offset="80">
      <a href="/work-order">
        <el-button type="primary" class="break-text">客服中心</el-button>
      </a>
    </el-affix>
  </div>
</template>

<script setup lang="ts">
// No props needed since values are fixed.
</script>

<style>
.affix-container {
  position: fixed;
  bottom: 100px;
  width: 40px;
  right: 0px;
  text-align: center;
  border-radius: 4px;
  background: var(--el-color-primary-light-9);
  z-index: 1000;
}

.break-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1;
  font-size: 16px;
  height: 180px;
}
</style>
