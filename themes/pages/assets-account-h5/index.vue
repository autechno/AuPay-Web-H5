<template>
  <div class="page">
    <div class="avatar-header">
      <span>
        <el-icon class="avatar" style="float: left"><el-image :src="userInfo.headPortrait ? userInfo.headPortrait : head" /></el-icon>
        <span class="name">{{userInfo.name}}</span>
      </span>
      <el-icon class="avatar">
        <el-image :src="scan" />
      </el-icon>
    </div>
    <div class="assets-main">
      <div @click="switchConfigShow" >
        <span style="color: #6E6E6E; font-size: 14px;">你的总资产<img :src="eye"  style="vertical-align: middle; width: 16px;"></span>
        <p class="amount-input-wrap" :style="{ fontSize: computedFontSize }">
          {{!isShowCurrency ? '******' : userInfo.currencySign + formatCurrency(totalAssets) }}
        </p>
      </div>
      <el-row :gutter="20" class="icon-container">
        <el-col v-for="(item, index) in icons" :key="index" :span="6">
          <router-link :to="item.url" class="icon-text">
            <i :class="item.iconClass"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </el-col>
      </el-row>
      <div class="banner"> <img :src="banner" /> </div>
      <div class="table-title"><span style="font-size: 18px;">我的代币</span><span style="color: #FDC92E" @click="jumpPage('./detail/list', {})">所有代币</span></div>
      <div class="table-list">
        <div class="item" v-for="(item, index) in currencyMergedData" :key="index" @click="jumpPage('./detail/category', {assetsId: item.id})">
          <div class="left-column">
            <el-image :src="btc" />
          </div>
          <div class="right-column">
            <p class="row"><span class="title">{{ item.currencyName }}</span> <span class="title">{{!isShowCurrency ? '******' : formatCurrency(item.balance) }}</span></p>
            <p class="row"><span class="text">{{ item.currencyChainName }}</span> <span class="text">{{!isShowCurrency ? '******' : formatCurrency(item.totalBalanceUsdt) + ' ' +userInfo.currencyCode}}</span></p>
          </div>
        </div>
      </div>
    </div>
    <el-row :gutter="20" class="menu-container" style="margin-left:0; margin-right: 0">
      <el-col :span="6">
        <router-link to="/user-h5" class="icon-text i1">
          <i></i><span>首页</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <p class="icon-text cur1">
          <i></i><span>资产</span>
        </p>
      </el-col>
      <el-col :span="6">
        <router-link to="/assets-account-h5/market" class="icon-text i3">
          <i></i><span>行情</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link to="/user-h5/manage"  class="icon-text i4">
          <i></i><span>用户</span>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import banner from '@@/public/images/banner.png';
import { getHeader } from "@/utils/storageUtils";
import eye from "@@/public/images/see.svg";
import scan from "@@/public/images/Scan.svg";
import head from '@@/public/images/head.svg';
import btc from '@@/public/images/btc.svg'
import { useRouter, useRoute } from 'vue-router';
import { formatCurrency, getDataInfo} from "@/utils/configUtils";

const headers = getHeader();
const router = useRouter();
const { assetsApi, systemApi } = useServer();
const currencyMergedData = ref([]);
const totalAssets = ref(0);
const isShowCurrency = ref(false);
const searchText = ref('');
const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})
const icons = ref([
  { iconClass: 'i1', label: '充值', url: '/charge-withdraw-h5/recharge/list' },
  { iconClass: 'i2', label: '提现', url: '/charge-withdraw-h5/withdrawal/list'},
  { iconClass: 'i3', label: '转帐', url: '/charge-withdraw-h5/transfer/pay'},
  { iconClass: 'i4', label: '闪兑', url: '/flash-exchange-h5'},
]);

const jumpPage = (url: string, query: any) => {
  router.push({ path: url, query: query });
}

// 计算字体大小
const computedFontSize = computed(() => {
  const length = totalAssets.value.toString().length;
  const reducedFontSize = 36 - (length > 10 ? (length - 10) : 0);
  return `${Math.max(reducedFontSize, 12)}px`;
});

// 初始化
const fetchData = async () => {
  try {
    const [rateRes, assetsRes] = await Promise.all([
      assetsApi.getRateU2Currency({ currency: userInfo.value.currencyCode }, headers),
      assetsApi.accountAssets({}, headers)
    ]);
    // 处理汇率响应
    let exchangeRate = rateRes.code == 200?rateRes.data:1;
    // 处理资产响应
    if (assetsRes.code == 200) {
      const mergedData = [];
      // 初始化总和变量
      let totalBalanceSum = 0;
      const dataList = assetsRes.data;
      if (dataList && dataList.length > 0) {
        dataList.forEach( item => {
          item['totalBalanceUsdt'] = item.totalBalanceUsdt * exchangeRate;
          item['totalBalanceUsdt'] = item.totalBalanceUsdt * exchangeRate;
          const { currencyId, currencyChain, balance, totalBalanceUsdt, freezeBalance, totalBalance } = item;
          let currencyName = getDataInfo(currencyId, 'currencyChains')?.name;
          let currencyChainName = getDataInfo(currencyChain, 'chains')?.name;
          let mergedStore = { ...item, currencyName, currencyChainName };
          mergedData.push(mergedStore);
          // 累加总余额
          totalBalanceSum += totalBalanceUsdt;
        });
        totalAssets.value = totalBalanceSum;
        currencyMergedData.value = mergedData;
      }
    } else {
      showErrorMessage(assetsRes.code, assetsRes.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};
// 显示隐藏
const switchConfigShow = async () => {
   isShowCurrency.value = !isShowCurrency.value;
}
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  isShowCurrency.value = userStore.userInfo.showHide == 1;
  userInfo.value.name = userStore.userInfo.nickname;
  userInfo.value.currencySign = getDataInfo(userInfo.value.currencyCode, 'currency')?.sign;
  fetchData();
})

</script>
<style scoped>
.page {
  color: #0D0D0D;
  padding-bottom: 100px;
}
 .amount-input-wrap {
   border: none;
   outline: none;
   width: 100%;
   font-size: 36px;
   font-weight: bold;
   line-height: 49px;
 }
.assets-main{
  margin-top: 32px;
}

.table-title {
  line-height: 20px;
  overflow: hidden;
  display: flex;
  font-size: 12px;
  justify-content: space-between;
}
.banner{
  margin-top: 25px;
  margin-bottom: 25px;
}
.banner img{
  width: 100%;
}
.table-list{
  position: relative;
  margin-top: 10px;
}
.table-list .item{
  display: flex;
  height: 52px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f1f1;
  overflow: hidden;
}
.left-column {
  width: 48px;
  height: 48px;
  .el-image{
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
    border-radius: 48px;
  }
}
.right-column {
  padding-left: 10px;
  flex: 1;
  padding-top: 5px;
  justify-content: flex-start;
  flex-direction: column;
}
.right-column .row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.right-column .row .title {
  font-weight: bold;
  font-size: 16px;
}

.right-column .row .text {
  color: #6E6E6E;
}
</style>
