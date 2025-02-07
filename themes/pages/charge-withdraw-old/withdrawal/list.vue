<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="true"  />
    <div class="sub-page">
      <div class="search-wrap">
        <el-icon class="arrow" size="26"><Search /></el-icon>
        <input v-model="searchText" placeholder="搜索" class="custom-input" />
      </div>
      <div class="table-list" v-for="currency in currencyList" :key="currency.id">
        <div class="item" @click="selectCurrency(currency)">
          <div class="left-column"> <div class="currency-wrap"><el-image :src="btc"/></div> </div>
          <div class="right-column">
            <div class="currency">{{currency.balance}}</div>
            <p class="row"><span class="title">{{currency.currencyName}}</span></p>
            <p class="row"><span class="text">{{currency.currencyChainName}}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import {Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
import {ElMessage} from "element-plus";
import btc from '@@/public/images/btc.svg'

const headers = getHeader();
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const { assetsApi } = useServer();
// 整合数据列表
const currencyList = ref([]);
const originalCurrencyList = ref([]);
const currencyChainList = ref([]);
const searchText = ref('');

// 选择货币
const selectCurrency = async (currency: any) => {
  console.log(currency);
  const currencyId = currency.id;
  router.push({ path: '/charge-withdraw-old/withdrawal/selected', query: { currencyId } });
}

// 重置 currencyList
const resetCurrencyList = () => {
  currencyList.value = originalCurrencyList.value.filter(currency => {
    return currency.currencyName.toLowerCase().includes(searchText.value.toLowerCase());
  });
};


// 获取数据
const fetchData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code == 200) {
      let currencyData = new Array();
      let chainData = new Array();
      const dataList = res.data;
      dataList.forEach(item => {
        const {id, currencyId, currencyChain, balance, totalBalanceUsdt } = item;
        // 检查是否已存在该货币数据
        currencyData.push({
            id,
            balance,
            totalBalanceUsdt,
            currencyId,
            currencyName: getDataInfo(currencyId, 'currencyChains')?.name,
            currencyChain: currencyChain,
            currencyChainName: getDataInfo(currencyChain, 'chains')?.name,
          });
        // 添加链信息，避免重复
        const chainInfo = { id: currencyChain, name: getDataInfo(currencyChain, 'chains')?.name };
        if (!chainData.some(chain => chain.id === chainInfo.id)) {
          chainData.push(chainInfo);
        }
      });
      currencyList.value = currencyData;
      originalCurrencyList.value = currencyData;
      currencyChainList.value = chainData;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};


// 监听
watch(searchText, () => {
  resetCurrencyList();
});

// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.sub-page{
  padding-top:20px;
  padding-bottom: 20px;
  position: relative;
}
.search-wrap{
  margin-bottom: 20px;
  height: 40px;
  padding-right: 10px;
  background: #ffffff;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .arrow{
    height: 23px;
    width: 28px;
    margin-top: 8px;
    margin-left: 10px;
    margin-right:5px;
    color: #E3E3E3;
  }
  .custom-input::placeholder {
    color: #E3E3E3;
  }
  .custom-input{
    border: 1px #ffffff solid;
    height: 30px;
    line-height: 32px;
    margin-top: 4px;
    font-size: 18px;
    overflow: hidden;
    width: 100%;
  }
}
.table-list{
  position: relative;
  margin-top: 5px;
  .item{
    display: flex;
    height: 52px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f1f1;
    overflow: hidden;
  }
}
.left-column {
  width: 48px;
  height: 48px;
  .currency-wrap{
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
    border-radius: 50%;
    .el-image{
      width: 100%;
      height: 100%;
    }
  }
}
.right-column {
  padding-left: 10px;
  flex: 1;
  padding-top: 5px;
  justify-content: flex-start;
  flex-direction: column;
  position: relative;
  .currency{
    height: 100%;
    line-height: 48px;
    color: #666666;
    text-align: right;
    position: absolute;
    right: 0;
    top:0;
  }
  .row {
    display: flex;
    width: 40%;
    overflow: hidden;
    justify-content: space-between;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
    .text {
      color: #6E6E6E;
    }
  }
}

</style>
