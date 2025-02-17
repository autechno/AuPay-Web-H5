<template>
  <div class="sub-page">
    <h4>基本信息</h4>
    <table class="table">
      <tr>
        <td>闪兑单ID: </td><td>{{assets.inId}}</td>
      </tr>
      <tr>
        <td>关联订单: </td><td>{{assets.outId}}</td>
      </tr>
<!--      <tr>-->
<!--        <td>发起人: </td><td>{{assets.optUserId}}</td>-->
<!--      </tr>-->
      <tr>
        <td>当前状态: </td><td>{{getStatusText(assets.status, 'ACCOUNT')}}</td>
      </tr>
      <tr>
        <td>发起时间: </td><td>{{formatDate(assets.createTime)}}</td>
      </tr>
      <tr>
        <td>结束时间: </td><td>{{formatDate(assets.finishTime)}}</td>
      </tr>
    </table>
    <h4>交易进度</h4>
    <table class="table">
      <tr>
        <td>进度条:{{assets.status}}</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 67%;">67%</div>
          </div>
        </td>
      </tr>
    </table>
    <h4>概览</h4>
    <table class="table">
      <tr>
        <td>兑出</td><td>  {{assets.cashOutAmount	}}  {{ getDataInfo(assets.cashOutCurrencyId, 'currencyChains')?.name }}  {{getDataInfo(assets.cashOutChain, 'chains')?.name}}</td>
      </tr>
      <tr>
        <td>费用</td><td> {{assets.fee	}} {{ getDataInfo(assets.cashOutCurrencyId, 'currencyChains')?.name }}</td>
      </tr>
      <tr>
        <td>兑入</td><td> {{assets.cashInAmount	}} {{ getDataInfo(assets.cashInCurrencyId, 'currencyChains')?.name }}  {{getDataInfo(assets.cashInChain, 'chains')?.name}}</td>
      </tr>
    </table>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import {getStatusText, getDataInfo, formatDate} from "~/utils/configUtils";
import { useRoute } from 'vue-router';
const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer();

// 消息数据
const recordId = ref(0);
const tradeNo = ref('');
const assets = ref('');

// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.fastSwapApplyDetail({ id: recordId.value, tradeNo: tradeNo.value}, headers);
    if (res.code === 200) {
      assets.value = res.data;
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
