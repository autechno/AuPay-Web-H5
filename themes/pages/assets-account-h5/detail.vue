<template>
  <div class="page">
    <GoBack  />
    <div :class="['tips', statusClass]">
      <span class="status"><el-image :src="statusImage" /></span>
      <p class="text">{{ getStatusText(assets.status, 'ACCOUNT') }}</p>
    </div>
    <div class="content">
      <div class="row"><span class="title">订单ID:</span><span>{{ assets.tradeNo }}</span></div>
      <div class="row"><span class="text">发起时间:</span><span>{{ formatDate(assets.createTime) }}</span></div>
      <div class="row"><span class="text">结束时间</span><span>{{ formatDate(assets.finishTime) }}</span></div>
      <div class="hr"></div>
      <div class="row"><span class="title">交易进度:</span><span>{{ progressPercentage }}%</span></div>
      <div class="row">
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }" />
        </div>
      </div>
      <div class="row" v-if="assets.txHash"><span class="text">区块链ID</span><span>{{assets.txHash}}</span></div>
      <div class="row"><span class="title">概览:</span></div>
      <div class="row"><span class="title">代币转移:</span></div>
      <div class="row"><span class="title">详情:</span></div>

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { formatDate, getStatusText } from "~/utils/configUtils";
import { getHeader } from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
import s1 from '@@/public/images/s1.svg';
import s2 from '@@/public/images/s2.svg';
import s3 from '@@/public/images/s3.svg';
import {showCatchErrorMessage} from "~/utils/messageUtils";
import {ElMessage} from "element-plus";

const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer();
const statusMap = {
  1: { percentage: 50, image: s2, class: 's1' },
  2: { percentage: 100, image: s1, class: 's2' },
  3: { percentage: 100, image: s3, class: 's3' },
};

// 数据
const recordId = ref(0);
const assets = ref('');

// 获取数据
const fetchData = async () => {
  try {
    const res = await assetsApi.accountAssetsDetail({recordId: recordId.value}, headers);
    if (res.code === 200) {
      assets.value = res.data;
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage();
  }
};

// 计算交易进度
const progressPercentage = computed(() => {
  return statusMap[assets.value.status]?.percentage || 0;
});

// 计算状态类
const statusClass = computed(() => {
  return statusMap[assets.value.status]?.class || '';
});

// 计算状态图标
const statusImage = computed(() => {
  return statusMap[assets.value.status]?.image || '';
});

// 初始化数据
onMounted(() => {
  recordId.value = route.query.id;
  fetchData();
});
</script>

<style lang="less" scoped>

.progress-bar-container {
  width: 100%;
  background-color: #EBEBEB;
  border-radius: 5px;
  overflow: hidden;
  height: 12px;
  margin: 20px 0;
}
.progress-bar {
  height: 12px;
  background-color: #FDC92E;
  text-align: center;
  line-height: 12px;
  color: white;
  font-weight: bold;
}
.hr{
  height: 15px;
  border-top:#F1F1F1 solid 1px;
  margin-top: 15px;
}
.content{
  font-size: 14px;
  .row{
    display: flex;
    justify-content: space-between;
    line-height: 30px;
    color: #0D0D0D;
    .title{
      font-weight: bold;
    }
    .text{
      color: #999999;
      font-size: 13px;
    }
  }

}
.tips{
  padding: 50px 0 35px 0;
  text-align: center;
  .status{
    display: inline-block;
    width: 46px;
    height: 46px;
    border-radius: 40%;
  }
  .text{
    padding: 8px;
    font-size: 16px;
    font-weight: bold;
  }
}
.s2 {
  .status{
    background: #5686E1;
  }
  color: #5686E1;
}
.s1 {
  .status{
    background: #98E175;
  }
  color: #333333;
}
.s3 {
  .status{
    background: #676B6D;
  }
  color: #676B6D;
}

</style>
