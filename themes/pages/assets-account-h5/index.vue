<template>
  <div class="page">
    <div class="avatar-header">
      <div class="avatar" style="float: left"><img v-if="userInfo.headPortrait" style="width: 100%;"  :src="userInfo.headPortrait" /></div>
      <span class="name">{{userInfo.name}}</span>
      <div class="avatar" style="float: right">
        <img :src="scan" class="scan" />
      </div>
    </div>
    <div class="main">
      <div @click="setConfigShow">
        <span style="color: #6E6E6E; font-size: 14px;">你的总资产<img :src="eye"  style="vertical-align: middle; width: 16px;"></span>
        <p style="height: 49px; font-weight: bold; font-size: 36px; line-height: 49px;">
          {{!isShowCurrency ? '******' : userInfo.currencySign + formatCurrency(totalAssets) }}
        </p>
      </div>
      <el-row :gutter="20" class="icon-container">
        <el-col :span="6">
          <p class="icon-text">
            <i class="i1"></i>
            <span>充值</span>
          </p>
        </el-col>
        <el-col :span="6">
          <p class="icon-text">
            <i class="i2"></i>
            <span>提现</span>
          </p>
        </el-col>
        <el-col :span="6">
          <p class="icon-text">
            <i class="i3"></i>
            <span>转帐</span>
          </p>
        </el-col>
        <el-col :span="6">
          <p class="icon-text">
            <i class="i4"></i>
            <span>转帐</span>
          </p>
        </el-col>
      </el-row>
      <div class="banner"> <img :src="banner" /> </div>
      <div class="table-title"><span style="font-size: 18px;">我的代币</span><span style="font-size: 12px; color: #FDC92E">所有代币</span></div>
      <div class="table-list">
        <div class="item" v-for="(item, index) in currencyMergedData" :key="index">
          <div class="left-column">
            <div class="currency-wrap"></div>
          </div>
          <div class="right-column">
            <p class="row"><span class="title">{{ item.currencyJson.name }}</span> <span class="title">{{formatCurrency(totalAssets)}}</span></p>
            <p class="row"><span class="text">{{!isShowCurrency ? '******' : userInfo.currencySign + formatCurrency(item.balance) }}</span> <span class="text" style="color: #0F9A50">+2000U</span></p>
          </div>
        </div>
      </div>
    </div>
    <el-row :gutter="20" class="home-container" style="margin-left:0; margin-right: 0">
      <el-col :span="6">
        <p class="icon-text">
          <i class="i1"></i>
          <span>首页</span>
        </p>
      </el-col>
      <el-col :span="6">
        <p class="icon-text">
          <i class="cur2"></i>
          <span>资产</span>
        </p>
      </el-col>
      <el-col :span="6">
        <p class="icon-text">
          <i class="i3"></i>
          <span>行情</span>
        </p>
      </el-col>
      <el-col :span="6">
        <p class="icon-text">
          <i class="i4"></i>
          <span>用户</span>
        </p>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import banner from '@@/public/images/banner.png';
import { getHeader } from "@/utils/storageUtils";
import eye from "@@/public/images/eye3x.svg";
import scan from "@@/public/images/Scan.svg";
import {
  formatCurrency,
  getDataInfo,
} from "~/utils/configUtils";
import {ElMessage} from "element-plus";
const headers = getHeader();
const { assetsApi, systemApi } = useServer();
const currencyItemData = ref([]);
const currencyMergedData = ref([]);
const totalAssets = ref(0);
const isShowCurrency = ref(false);
const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})

//
const fetchData = async () => {
  try {
    const [rateResponse, assetsResponse] = await Promise.all([
      assetsApi.getRateU2Currency({ currency: userInfo.value.currencyCode }, headers),
      assetsApi.accountAssets({}, headers)
    ]);
    // 处理汇率响应
    let exchangeRate = 1;
    if (rateResponse.code == 200) {
      exchangeRate = rateResponse.data
    }
    // 处理资产响应
    if (assetsResponse.code == 200) {
      const mergedData = {};
      // 初始化总和变量
      let totalBalanceUsdtSum = 0;
      const dataList = assetsResponse.data; // 假设数据在 res.data 中
      if (dataList && dataList.length > 0) {
        dataList.forEach(item => {
          item['totalBalanceUsdt'] = item['totalBalanceUsdt'] * exchangeRate;
          const { currencyId, currencyChain,  balance, freezeBalance, totalBalance, totalBalanceUsdt } = item;
          let currencyKeyValue =  getDataInfo(currencyId, 'currencyChains');
          let coinKeyValue =  getDataInfo(currencyChain, 'chains');
          let mergedStore  = { ...item, currencyJson: currencyKeyValue, coinJson: coinKeyValue };
          currencyItemData.value.push(mergedStore);
          if (!mergedData[currencyId]) {
            mergedData[currencyId] = mergedStore;
          }else{
            mergedData[currencyId].balance += balance;
            mergedData[currencyId].freezeBalance += freezeBalance;
            mergedData[currencyId].totalBalance += totalBalance;
            mergedData[currencyId].totalBalanceUsdt += totalBalanceUsdt;
          }
          totalBalanceUsdtSum += totalBalanceUsdt;
        });
        totalAssets.value = totalBalanceUsdtSum;
        currencyMergedData.value = Object.values(mergedData);
      }
    } else {
      ElMessage.error(assetsResponse.message || '查询失败');
    }
  } catch (error) {
    console.log(error)
    console.log(error)
    console.log(error)
    ElMessage.error('请求失败，请重试');
  }
};
// 显示隐藏
const setConfigShow = async () => {
   isShowCurrency.value = !isShowCurrency.value;
}
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  userInfo.value.name = userStore.userInfo.nickname;
  userInfo.value.currencySign = getDataInfo(userInfo.value.currencyCode, 'currency')?.sign;
  fetchData();
})

</script>
<style scoped>
*{
  margin:0;
  padding: 0;
  font-size: 12px;
}
.page {
  position: relative;
  color: #0D0D0D;
  padding-bottom: 100px;
}
.avatar-header{
  margin-top: 30px;
  width: 100%;
  height: 46px;
}
.avatar-header .name{
  font-size: 18px;
  font-weight: bold;
  line-height: 46px;
  padding-left: 5px;
}
.avatar-header .avatar{
  Width: 46px;
  Height: 46px;
  background: #F4F4F4;
  overflow: hidden;
  border-radius: 50%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.avatar-header .scan {
  object-fit: cover;
  width: 24px;
  height: 24px;
}
.main{
  margin-top: 32px;
}
.icon-container{
  margin-top: 22px;
  width: 106%;
  text-align: center;
}
.icon-container .icon-text{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  height: 64px;
  background: #EAF3FA;
  overflow: hidden;
  border-radius: 10px;
  font-weight: bold;
  font-size: 12px!important;
}
.icon-container  i{
  display: block;
  width: 28px;
  height: 28px;
  margin: 7px auto 4px auto;
}
.icon-container  i.i1{
  background: url(@@/public/images/cz3.png)  no-repeat;
  background-size: 100%;
}
.icon-container  i.i2{
  background: url(@@/public/images/tx@3x.png)  no-repeat;
  background-size: 100%;
}
.icon-container  i.i3{
  background: url(@@/public/images/zh3x.png)  no-repeat;
  background-size: 100%;
}
.icon-container  i.i4{
  background: url(@@/public/images/sd@3x.png)  no-repeat;
  background-size: 100%;
}
.icon-container i img{
  width: 28px;
  height: 28px;
  margin-bottom: 3px;
}

.home-container{
  width: calc(100% - 36px);
  text-align: center;
  background: #ffffff;
  height: 88px;
  border-radius: 30px;
  box-shadow: 0 12px 20px rgba(109, 110, 124, 0.2);
  position: fixed;
  bottom: 16px;
  left: 18px;
}
.home-container .icon-text{
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 10px;
  width: 70px;
  height: 64px;
  overflow: hidden;
  font-weight: bold;
  font-size: 12px!important;
  color: #1C63FF;
}
.home-container  i{
  display: block;
  width: 28px;
  height: 28px;
  margin: 7px auto 4px auto;
}
.home-container  i.i1{
  background: url(@@/public/images/Home@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.i2{
  background: url(@@/public/images/zichan@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.i3{
  background: url(@@/public/images/hangqing@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.i4{
  background: url(@@/public/images/wo@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.cur1{
  background: url(@@/public/images/Home2@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.cur2{
  background: url(@@/public/images/zichan2@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.cur3{
  background: url(@@/public/images/hangqing2@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container  i.cur4{
  background: url(@@/public/images/yonghu2@3x.png)  no-repeat;
  background-size: 100%;
}
.home-container i img{
  width: 28px;
  height: 28px;
}

.table-title {
  line-height: 20px;
  overflow: hidden;
  display: flex;
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
}
.left-column .currency-wrap{
  width: 100%;
  height: 100%;
  background-color: #eaeaea;
  border-radius: 48px;
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
