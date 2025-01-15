<template>
  <div>
    {{content.createTime}}
    {{content.tradeNo}}
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import { getStatusText, getCoinInfo, getCurrencyByCode } from "@/utils/formatUtils";
import { useRoute } from 'vue-router';
const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer();

// 消息数据
const recordId = ref(0);
const tradeNo = ref('');
const content = ref('');

// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.fastSwapApplyDetail({ id: recordId.value, tradeNo: tradeNo.value}, headers);
    if (res.code === 200) {
      content.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  recordId.value = route.query.id;
  tradeNo.value = route.query.tradeNo;
  fetchData();
});
</script>

<style scoped>
.reply-area {
  border: solid 1px #ccc;
  position: fixed;
  right: 20px;
  bottom: 440px;
  width: 300px;
  padding:20px;
  z-index: 1000;
}

</style>
