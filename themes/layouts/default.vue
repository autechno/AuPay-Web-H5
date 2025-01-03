<template>
    <Header></Header>
    <main class="container" style="min-height: calc(100vh - 365px); margin-top:24px">
      <slot></slot>
    </main>
</template>
<script setup lang="ts">
  import Header from '../composables/Header.vue'
</script>
