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
      <div class="table-title-wrap" >
        <div class="title">
          <span @click="setActive('tokens')" :class="{ cur: activeTab === 'tokens' }">全部</span>
          <span @click="setActive('favorites')" :class="{ cur: activeTab === 'favorites' }">关注</span>
        </div>
      </div>
      <div class="filter-wrap">
        <el-col :span="12">
          <span @click="toggle('volume_24h')" class="filter-item">
            成交量<i :class="status.volume_24h ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </span>
          <span @click="toggle('market_cap')" class="filter-item">
            市值<i :class="status.market_cap ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </span>
        </el-col>
        <el-col :span="12" style="text-align: right ">
          <span @click="toggle('price')" class="filter-item" >
            价格<i :class="status.price ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </span>
          <span @click="toggle('percent_change_24h')" class="filter-item">
            涨跌幅<i :class="status.percent_change_24h ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
          </span>
        </el-col>
      </div>
      <div class="table-list-wrap" >
        <div class="item" v-for="(item, index) in currencyList" :key="index" >
          <div class="left-column">
            <el-image :src="btc" />
          </div>
          <div class="right-column">
            <p class="row"><span class="title">{{ item.coinSymbol }}</span> <span class="title">${{ formatCurrency(item.price?item.price:0.00) }}</span></p>
            <p class="row">
              <span class="text" style="font-size: 12px;">${{ item.volume24h?item.volume24h:0.00 }}</span>
              <span class="text" :style="{ color: item.percentChange24h > 0 ? '#0F9A50' : '#F36A35' }">
                {{ item.percentChange24h > 0 ? `+${item.percentChange24h}` : `-${Math.abs(item.percentChange24h)}` }}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <el-row :gutter="20" class="menu-container" style="margin-left:0; margin-right: 0">
      <el-col :span="6">
        <router-link to="/user" class="icon-text i1">
          <i></i><span>首页</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link to="/assets-account-h5/" class="icon-text i2">
          <i></i><span>资产</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <p class="icon-text cur3">
          <i></i><span>行情</span>
        </p>
      </el-col>
      <el-col :span="6">
        <router-link to="/user/manage/"  class="icon-text i4">
          <i></i><span>用户</span>
        </router-link>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
import { useRoute, useRouter } from 'vue-router';
import head from "@@/public/images/head.svg";
import scan from "@@/public/images/Scan.svg";
import btc from "~~/public/images/btc.svg";
import {formatCurrency, getDataInfo} from "~/utils/configUtils";

const headers = getHeader();
const router = useRouter();
const { assetsApi } = useServer();
const currencyList = ref([]);
const originalCurrencyList = ref([]);
const searchText = ref('');
const activeTab = ref('tokens'); // 默认激活的标签
const setActive = (tab: 'tokens' | 'favorites') => {
  activeTab.value = tab;
  if(tab == 'tokens'){
    form.value.conditions = {};
  }else{
    form.value.conditions.focus = true;
  }
  handlePageChange();
};

const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})

// 暂时一页显示
const form = ref({
  pageNo: 1,
  pageSize: 100,
  conditions: {
    focus: null,
  },
  descs:[
  ],
  ascs: [
  ]
});

// 切换状态
const status = ref({
  volume_24h: false,
  price: false,
  market_cap: false,
  percent_change_24h: false,
});
const toggle = async (key: any) => {
  if(key != null){
    status.value[key] = !status.value[key];
  }
  form.value.ascs = [];
  form.value.descs = [];
  for (const [k, v] of Object.entries(status.value)) {
    if (v) {
      form.value.ascs.push(k);
    } else {
      form.value.descs.push(k);
    }
  }
  handlePageChange()
};

// 跳转列表
const jumpPage= (url: string, query: any) => {
  router.push({ path: url, query: query });
}

// 重置 currencyList
const resetCurrencyList = () => {
  currencyList.value = originalCurrencyList.value.filter(currency => {
    return currency.coinSymbol.toLowerCase().includes(searchText.value.toLowerCase());
  });
};

const handlePageChange = async () => {
  try {
    const res = await assetsApi.marketList(form.value, headers);
    // 处理资产响应
    if (res.code == 200) {
        currencyList.value = res.data.records;
        originalCurrencyList.value = res.data.records;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 监听
watch(searchText, () => {
  resetCurrencyList();
});

// 初始化数据
onMounted(async () => {
  const userStore = UseUserStore();
  userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  userInfo.value.name = userStore.userInfo.nickname;
  toggle();
});
</script>
<style lang="less" scoped>
.table-title-wrap{
  padding-top: 3px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .title{
    font-size: 16px;
    font-weight: bold;
    color: #999999;
    line-height: 34px;
    span:first-child {
      margin-right: 5px;
    }
  }
  .title .cur{
    color: #0D0D0D;
    font-size: 18px;
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
.filter-wrap{
  padding-top: 21px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  span{
    font-size: 12px;
    color: #0D0D0D;
  }
  .el-icon-arrow-up{
    background: url(@@/public/images/jiantou.svg) no-repeat;
    background-size:10px 8px ;
    width: 10px;
    height: 8px;
    display: inline-block;
    transform: rotate(90deg);
  }
  .el-icon-arrow-down{
    background: url(@@/public/images/jiantou.svg) no-repeat;
    background-size: 10px 8px;
    width: 10px;
    height: 8px;
    display: inline-block;
    transform: rotate(-90deg);
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
