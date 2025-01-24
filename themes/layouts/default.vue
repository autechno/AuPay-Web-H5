<template>
  <Header v-if="!isFilteredRoute"></Header>
  <main>
    <slot></slot>
<!--    <div class="affix-container">-->
<!--      <el-affix target=".affix-container" :offset="80">-->
<!--        <a href="/work-order">-->
<!--          <el-button type="primary" class="break-text">客服中心</el-button>-->
<!--        </a>-->
<!--      </el-affix>-->
<!--    </div>-->
  </main>
</template>

<script setup lang="ts">
import Header from "@/composables/Header.vue";
import { computed } from 'vue';
import { useRoute } from 'vue-router';
// 获取当前路由
const route = useRoute();
const isFilteredRoute = computed(() => {
  const filteredRoutes = [ '/', '/user/login', '/user/forgot-password', '/user/register', '/user/register/stepReg', '/user/register/stepBind', '/user/login/stepEmail'];
  return filteredRoutes.includes(route.path);
});
</script>

<style>
body {
  margin: 0!important;
  padding: 18px;
  background: linear-gradient(to bottom, #EAF7FF, #FFFFFF);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
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
