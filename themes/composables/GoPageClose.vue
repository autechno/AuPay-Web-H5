<template>
  <div class="history-wrap">
    <!-- 左侧返回按钮 -->
    <button class="left-button" @click="closeDrawer">
      <el-icon size="20"> <ArrowLeftBold /> </el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftBold } from "@element-plus/icons-vue";
// 定义 emit 事件
const emit = defineEmits(['close']);
const closeDrawer = () => {
  emit('close'); // 触发 close 事件
};
</script>

<style lang="less" scoped>
.history-wrap {
  height: 46px;
  width: 100%;
  margin: 0 0 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center; /* 垂直居中对齐 */
}

.left-button {
  border: 0;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #f4f4f4;
  margin-top: 8px;
}

.middle-text {
  flex: 1;
  text-align: center;
  font-size: 16px;
}
</style>
