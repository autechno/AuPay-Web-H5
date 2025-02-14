<template>
  <div class="page">
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import banner from '@@/public/images/banner.png';
import { getHeader } from "@/utils/storageUtils";
import scan from "@@/public/images/Scan.svg";
import head from '@@/public/images/head.svg';
import { useRouter, useRoute } from 'vue-router';
import { formatCurrency, getDataInfo} from "@/utils/configUtils";

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();

})

</script>
<style scoped>
*{
  margin:0;
  padding: 0;
  font-size: 12px;
}
.page {
  padding-top: 28px;
  position: relative;
  color: #0D0D0D;
  padding-bottom: 100px;
}
</style>
