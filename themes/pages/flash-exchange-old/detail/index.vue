<template>
  <div class="page">
    <GoBack :showRightButton="false" :showScan="false"  />
      <div :class="['tips', statusClass]">
        <span class="status"><el-image :src="statusImage" /></span>
        <p class="text">{{ getStatusText(assets.status, 'ACCOUNT') }}</p>
      </div>
      <div class="content">
        <div class="row"><span class="title">闪兑单ID:</span><span>{{ assets.inId }}</span></div>
        <div class="row"><span class="text">关联订单</span><span>{{ assets.outId }}</span></div>
        <div class="hr"></div>
        <div class="row"><span class="text">发起时间:</span><span>{{ formatDate(assets.createTime) }}</span></div>
        <div class="row"><span class="text">结束时间</span><span>{{ formatDate(assets.finishTime) }}</span></div>
        <div class="hr"></div>
        <div class="row"><span class="title">交易进度:</span><span>{{ progressPercentage }}%</span></div>
        <div class="row">
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progressPercentage + '%' }" />
          </div>
        </div>
        <div class="row"><span class="title">概览:</span></div>
        <div class="row"><span class="text">兑出:</span><span>{{ assets.cashOutAmount }} {{ getDataInfo(assets.cashOutCurrencyId, 'currencyChains')?.name }} {{ getDataInfo(assets.cashOutChain, 'chains')?.name }}</span></div>
        <div class="row"><span class="text">费用:</span><span>{{ assets.fee }} {{ getDataInfo(assets.cashOutCurrencyId, 'currencyChains')?.name }}</span></div>
        <div class="row"><span class="text">兑入:</span><span>{{ assets.cashInAmount }} {{ getDataInfo(assets.cashInCurrencyId, 'currencyChains')?.name }} {{ getDataInfo(assets.cashInChain, 'chains')?.name }}</span></div>
      </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import { formatDate, getDataInfo, getStatusText } from "~/utils/formatUtils";
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
import s1 from '@@/public/images/s1.svg';
import s2 from '@@/public/images/s2.svg';
import s3 from '@@/public/images/s3.svg';

const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer();
const statusMap = {
  1: { percentage: 50, image: s1, class: 's1' },
  2: { percentage: 100, image: s2, class: 's2' },
  3: { percentage: 100, image: s3, class: 's3' },
};

// 消息数据
const recordId = ref(0);
const tradeNo = ref('');
const assets = ref('');

// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.fastSwapApplyDetail({ id: recordId.value, tradeNo: tradeNo.value }, headers);
    if (res.code === 200) {
      assets.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
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
  tradeNo.value = route.query.tradeNo;
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
