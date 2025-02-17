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
    <div class="sub-page">
      <div class="search-wrap">
        <el-icon class="arrow" size="26"><Search /></el-icon>
        <input v-model="searchText" placeholder="搜索" class="custom-input" />
      </div>
      <div class="table-title-wrap" style="margin-top: 10px">
        <div class="title">我的代币</div>
        <div class="select-wrap custom-no-shadow">
          <el-select class="select" v-model="form.conditions.tradeType" placeholder="订单类型" @change="handlePageChange">
            <el-option v-for="item in currencyList" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </div>
      </div>
      <div class="filter-wrap">
        排序
      </div>
      <div class="table-list-wrap">
        <div class="item" v-for="(item, index) in currencyMergedData" :key="index" @click="jumpPage('./detail/category', {assetsId: item.id})">
          <div class="left-column">
            <el-image :src="btc" />
          </div>
          <div class="right-column">
            <p class="row"><span class="title">{{ item.currencyName }}</span> <span class="title">{{ formatCurrency(item.balance) }}</span></p>
            <p class="row"><span class="text">{{ item.currencyChainName }}</span> <span class="text">{{ formatCurrency(item.totalBalanceUsdt) + ' ' +userInfo.currencyCode}}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
const headers = getHeader();
import { useRoute, useRouter } from 'vue-router';
import head from "@@/public/images/head.svg";
import scan from "@@/public/images/Scan.svg";
import btc from "~~/public/images/btc.svg";
import {formatCurrency, getDataInfo} from "~/utils/configUtils";
const currencyMergedData = ref([]);

const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    tradeType: ''
  }
});

const router = useRouter();
const { assetsApi } = useServer();
const currencyList = ref([]);
const searchText = ref('');

const jumpPage = (url: string, params: any) =>{

}
// 获取数据
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
        currencyList.value = totalBalanceSum;
        currencyMergedData.value = mergedData;
      }
    } else {
      showErrorMessage(assetsRes.code, assetsRes.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  userInfo.value.name = userStore.userInfo.nickname;
  fetchData();
});
</script>

<style lang="less" scoped>
.table-title-wrap{
  padding-top: 2px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .title{
    font-size: 16px;
    font-weight: bold;
    color: #0D0D0D;
    line-height: 34px;
  }
  .select-wrap{
    display: flex;
    .select{
      overflow: hidden;
      height: 30px;
      width: 110px;
      line-height: 30px;
      border: 2px solid #C8DCE8;
      border-radius: 8px;
      text-align: center;
      color: #0D0D0D;
      font-size: 14px;
      font-weight: bold;
      :deep(.el-date-editor){
        width: 110px;
        position: relative;
      }
      :deep(.el-input__inner){
        font-size: 14px;
        color: #0D0D0D;
      }
      :deep(.el-input__prefix){
        display: none;
      }
      :deep(.el-input__wrapper){
        border:0;
        box-shadow: none;
      }
    }
    .select:last-child{
      margin-left: 10px;
    }
  }
}
.page{
  position: relative;
  height: calc(100vh - 28px);
}
.sub-page{
  padding-top:20px;
  padding-bottom: 20px;
}
.custom-no-shadow{
  :deep(.el-select__wrapper) {
    box-shadow: none;
  }
}

</style>
