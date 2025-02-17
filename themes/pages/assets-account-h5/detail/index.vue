<template>
  <div class="page" style="padding-top: 28px;">
    <GoBack go-back-to="./order" />
    <div :class="['tips', statusClass]">
      <span class="status"><el-image :src="statusImage" /></span>
      <p class="text">{{ getStatusText(assets.status, 'ACCOUNT') }}</p>
    </div>
    <div class="content">
      <div class="row"><span class="title">订单ID：</span><span>{{ assets.tradeNo }}</span></div>
      <div class="row"><span class="text">发起时间：</span><span>{{ formatDate(assets.createTime) }}</span></div>
      <div class="row"><span class="text">结束时间：</span><span>{{ formatDate(assets.finishTime) }}</span></div>
      <div class="hr"></div>
      <div class="row"><span class="title">交易进度:</span><span>{{ progressPercentage }}%</span></div>
      <div class="row">
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }" />
        </div>
      </div>
      <div class="row" v-if="assets.txHash"><span class="text">区块链ID</span><span>{{assets.txHash}}</span></div>
      <div class="row"><span class="title">概览</span></div>
      <div class="row" v-if="assets.fromAmount || assets.fromCurrencyId"><span class="text">提现：</span><span>{{ formatCurrency(assets.fromAmount) }}{{ getDataInfo(assets.fromCurrencyId, 'currencyChains')?.name }}</span></div>
      <div class="row" v-if="assets.fromCurrencyChain"><span class="text">网络：</span><span>{{ getDataInfo(assets.fromCurrencyChain, 'chains')?.name }}</span></div>
      <div class="box-wrap">
        <div class="box-item" v-if="assets.fromAccountName || assets.fromWalletAddress">
          <div class="left">
            <el-image :src="assets.fromLogo?assets.fromLogo:head"></el-image>
          </div>
          <div class="middle">
            <p class="font-t2" v-if="assets.fromNikeName ">{{ assets.fromNikeName }}</p>
            <p class="font-t3" v-if="assets.fromAccountName ">{{ assets.fromAccountName }}</p>
            <p class="font-t3" style="margin-top: 10px;" v-if="assets.fromWalletAddress ">{{ assets.fromWalletAddress }}</p>
          </div>
        </div>
        <div class="arrow-wrap" v-if="assets.fromAccountName || assets.toAccountName"><el-icon><el-image :src="arrow"></el-image></el-icon></div>
        <div class="box-item" v-if="assets.toAccountName || assets.toWalletAddress">
          <div class="left">
            <el-image :src="assets.toLogo?assets.toLogo:head"></el-image>
          </div>
          <div class="middle">
            <p class="font-t2" v-if="assets.toNikeName ">{{ assets.toNikeName }}</p>
            <p class="font-t3" v-if="assets.toAccountName ">{{ assets.toAccountName }}</p>
            <p class="font-t3" style="margin-top: 10px;" v-if="assets.toWalletAddress ">{{ assets.toWalletAddress }}</p>
          </div>
        </div>
      </div>

      <div class="row"><span class="title">代币转移</span></div>
      <div class="box-wrap">
        <div class="box-item" v-if="assets.fromAmount || assets.fromCurrencyId || assets.fromCurrencyChain">
          <div class="left">
            <el-image :src="btc"></el-image>
          </div>
          <div class="middle">
            <div class="amount" v-if="assets.fromAmount">{{formatCurrency(assets.fromAmount)	}}</div>
            <p class="font-t1" v-if="assets.fromCurrencyId">{{ getDataInfo(assets.fromCurrencyId, 'currencyChains')?.name }}</p>
            <p class="font-t1" v-if="assets.fromCurrencyChain">{{ getDataInfo(assets.fromCurrencyChain, 'chains')?.name}}</p>
            <p class="font-t2" style="margin-top: 10px;" v-if="assets.fromAccountName">{{assets.fromAccountName}}</p>
            <p class="font-t2" v-if="assets.fromWalletAddress">{{assets.fromWalletAddress}}</p>
          </div>
        </div>
        <div class="box-item" style="margin-top:45px;" v-if="assets.toAmount || assets.toCurrencyId || assets.toCurrencyChain">
          <div class="left">
            <el-image :src="btc"></el-image>
          </div>
          <div class="middle">
            <div class="amount" v-if="assets.toAmount">{{formatCurrency(assets.toAmount)}}</div>
            <p class="font-t1" v-if="assets.toCurrencyId">{{ getDataInfo(assets.toCurrencyId, 'currencyChains')?.name }}</p>
            <p class="font-t1" v-if="assets.toCurrencyChain">{{ getDataInfo(assets.toCurrencyChain, 'chains')?.name}}</p>
            <p class="font-t2" style="margin-top: 10px;" v-if="assets.toAccountName">{{assets.toAccountName}}</p>
            <p class="font-t2" v-if="assets.toWalletAddress">{{assets.toWalletAddress}}</p>
          </div>
        </div>
      </div>

      <div class="row"><span class="title">详情</span></div>
      <div class="detail">
        <div class="row">
          <span class="text">网络：</span>
          <span class="arrow-icon">{{ getDataInfo(assets.toCurrencyChain, 'chains')?.name }} <el-icon v-if="assets.toCurrencyChain && assets.toCurrencyChain"><el-image :src="arrow" /></el-icon> {{ getDataInfo(assets.fromCurrencyChain, 'chains')?.name }}</span>
        </div>
        <div class="row" v-if="assets.toAmount">
          <span class="text">数量：</span>
          <span>{{ assets.toAmount }}</span>
        </div>
        <div class="row">
          <span class="text">费用：</span>
          <span>
            {{ assets.fee }} {{ getDataInfo(assets.fromCurrencyId, 'currencyChains')?.name }}  {{ getDataInfo(assets.fromCurrencyChain, 'chains')?.name }}
          </span>
        </div>
        <div class="row" v-if="assets.toAmount">
          <span class="text">
              <span v-if="assets.tradeType == 2 || assets.tradeType == 72 || assets.tradeType == 82 || assets.tradeType == 92">实际支出：</span>
              <span v-else>实际到账：</span>
          </span>
          <span>{{ assets.toAmount }} {{ getDataInfo(assets.toCurrencyId, 'currencyChains')?.name }}</span>
        </div>
        <div class="row" v-if="assets.fromWalletAddress">
          <span class="text">发起：</span>
        </div>
        <div class="row" v-if="assets.fromWalletAddress">
          <span class="arrow-copy">{{ assets.fromWalletAddress }} <el-image :src="copy" @click="copyText(assets.fromWalletAddress)" /></span>
        </div>
        <div class="row"  v-if="assets.toWalletAddress">
          <span class="text">接收：</span>
        </div>
        <div class="row"  v-if="assets.toWalletAddress">
          <span class="arrow-copy" >{{ assets.toWalletAddress }} <el-image :src="copy" @click="copyText(assets.toWalletAddress)" /></span>
        </div>
        <div class="row" v-if="assets.contractAddress">
          <span class="text">目标：</span>
        </div>
        <div class="row" v-if="assets.contractAddress">
          <span class="arrow-copy" > {{ assets.contractAddress }} <el-image @click="copyText(assets.contractAddress)"  :src="copy" /></span>
        </div>
        <div class="row" v-if="assets.txHash">
          <span class="text">区块链交易ID：</span>
        </div>
        <div class="row" v-if="assets.txHash">
          <span class="arrow-copy" >  {{ assets.txHash }} <el-image @click="copyText(assets.txHash)" :src="copy" /> </span>
        </div>
        <div class="row">
          <span class="text"> <a href="https://sepolia.etherscan.io">区块链浏览器地址链接</a></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import {formatCurrency, formatDate, getDataInfo, getStatusText} from "~/utils/configUtils";
import { getHeader } from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
import s1 from '~~/public/images/s2.svg';
import s2 from '~~/public/images/s1.svg';
import s3 from '@@/public/images/s3.svg';
import {showCatchErrorMessage} from "@/utils/messageUtils";
import copy from '@@/public/images/copy2.svg';
import btc from '@@/public/images/btc.svg';
import head from '@@/public/images/head.svg';
import arrow from '@@/public/images/jiantou2.svg';

const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer();
const showStatus = ref(0);
const statusMap = {
  1: { percentage: 50, image: s1, class: 's1' },
  2: { percentage: 100, image: s2, class: 's2' },
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
      showStatus.value = res.data.status == 0?res.data.status + 1:res.data.status
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
  return statusMap[showStatus.value]?.percentage || 0;
});

// 计算状态类
const statusClass = computed(() => {
  return statusMap[showStatus.value]?.class || '';
});

// 计算状态图标
const statusImage = computed(() => {
  return statusMap[showStatus.value]?.image || '';
});

// 初始化数据
onMounted(() => {
  recordId.value = route.query.id;
  fetchData();
});
</script>

<style lang="less" scoped>
*{
  padding: 0;
  margin: 0;
}

.box-wrap{
  margin-bottom: 5px;
  background: #F5F5F5;
  border-radius: 16px;
  padding: 15px 16px;
  line-height: 20px;
  .font-t1{
    color: #0D0D0D;
    font-size: 14px;
  }
  .font-t2{
    color: #333333;
    font-size: 12px;
  }
  .font-t3{
    color: #999999;
    font-size: 12px;
  }
  .arrow-wrap{
    margin-top: 20px;
    margin-bottom: 32px;
    height: 20px;
    margin-left: 5px;
    .el-icon{
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #5686E1;
      .el-image{
        height: 10px;
      }
    }
  }
  .box-item {
    display: flex;
    .left {
      width: 40px;
      .el-image{
        width: 30px;
        height: 30px;
      }
    }
    .middle {
      position: relative;
      flex: 1;
      .amount{
        position: absolute;
        right: 0px;
        top: 8px;
        text-align: right;
      }
    }
  }
}
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
  padding-bottom: 30px;
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
    .arrow-copy{
      .el-image{
        height: 14px;
      }
    }
    .arrow-icon{
      .el-icon{
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #5686E1;
        .el-image{
          height: 10px;
          transform: rotate(-90deg);
        }
      }
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
