<template>
  <main>
    <slot></slot>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
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

<style>
.default-body {
  margin: 0 !important;
  padding: 0 18px;
  background: linear-gradient(to bottom, #EAF7FF, #FFFFFF);
  background-size: 100% 100%;
  background-repeat: no-repeat;
}
.filtered-body {
  margin: 0 !important;
  padding: 0 18px;
  background: radial-gradient(circle at top left, #EAF7FF, #FFFFFF);
  background-size: 90% 30%;
  background-repeat: no-repeat;
  min-height: 100vh;
  height: auto;
  overflow: auto;
}
.page{
  padding-top: 18px;
}
.custom-button{
  background: #5686E1;
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  line-height: 22.5px;
  height: 56px;
  color: #fff;
  border: 0;
  border-radius: 16px;
}

</style>
