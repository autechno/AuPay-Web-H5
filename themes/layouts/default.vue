<template>
<!--  <Header v-if="!isFilteredRoute"></Header>-->
  <main>
    <slot></slot>
<!--    <AffixContainer />-->
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import Header from '@/composables/Header.vue';
import AffixContainer from '@/composables/AffixContainer.vue';
import { useRoute } from 'vue-router';
// 获取当前路由
const route = useRoute();
const isFilteredRoute = computed(() => {
  const filteredRoutes = [ '/', '/user/login', '/user/forgot-password', '/user/register', '/user/register/stepReg', '/user/register/stepBind', '/user/login/stepEmail'];
  return filteredRoutes.includes(route.path);
});
onMounted(() => {
  document.body.className = isFilteredRoute.value ? 'default-body' : 'filtered-body';
});
</script>

<style lang="less">
.default-body {
  position: relative;
  margin: 0 !important;
  background: linear-gradient(to bottom, #EAF7FF, #FFFFFF);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.filtered-body {
  position: relative;
  margin: 0 !important;
  background: radial-gradient(circle at top left, #EAF7FF, #FFFFFF);
  background-size: 90% 30%;
  background-repeat: no-repeat;
  min-height: 100vh;
  height: auto;
  overflow: auto;
}


</style>
