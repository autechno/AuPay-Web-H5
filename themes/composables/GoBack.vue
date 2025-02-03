<!-- GoBack.vue -->
<template>
  <div class="history-wrap">
    <button class="left-button" @click="goBack">
      <el-icon size="20"> <ArrowLeftBold /> </el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeftBold } from "@element-plus/icons-vue";
const router = useRouter();
const goBack = () => {
  router.back();
};
</script>
<style>
.history-wrap{
  height: 34px;
  width: 100%;
  margin: 0 0 18px 0;
  .left-button{
    border: 0;
    width: 34px;
    height: 34px;
    border-radius: 17px;
    background-color: #f4f4f4;
  }
}
</style>
