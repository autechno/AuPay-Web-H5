<template>
  <div class="page">
    <el-button class="custom-button custom-button-pos"> 确定 </el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";

// 初始化数据
onMounted(() => {

});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}

.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .custom-button{
    position: fixed;
    bottom: 30px;
    left: 50%;
    width: 85%;
    transform: translate(-50%);
  }
}

</style>
