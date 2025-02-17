<template>
  <div class="page">
    <GoBack :goBackTo="'/assets-account-h5'"  />
    <div class="sub-page">
      <div class="search-wrap">
        <el-icon class="arrow" size="26"><Search /></el-icon>
        <input v-model="searchText" placeholder="搜索" class="custom-input" />
      </div>
      <div class="table-list" v-for="item in currencyList" :key="item.id">
        <div class="item" @click="selectCurrency(item)">
          <div class="left-column"><div class="currency-wrap"><el-image :src="btc" /></div></div>
          <div class="right-column">
            <div class="currency"><el-image :src="ewm" /></div>
            <p class="row"><span class="title">{{item.currencyName}}</span> </p>
            <p class="row"><span class="text">{{item.currencyChainName}}</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import {Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
import {ElMessage} from "element-plus";
import btc from '@@/public/images/btc.svg'
import ewm from "@@/public/images/ewm.svg";
import { useRoute, useRouter } from 'vue-router';
import {showCatchErrorMessage} from "~/utils/messageUtils";

const headers = getHeader();
const router = useRouter();
const { assetsApi } = useServer();
// 整合数据列表
const currencyList = ref([]);
const originalCurrencyList = ref([]);
const currencyChainList = ref([]);
const searchText = ref('');

// 选择货币
const selectCurrency = async (currency: any) => {
  router.push({ path: './', query: {
      currencyId: currency.id,
    }
  });
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
      showErrorMessage(res.code, res.message);
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
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
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
    text-align: center;
    .el-image{
      width: 75%;
      margin-top:8px;
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

  .currency {
    width: 36px;
    height: 36px;
    position: absolute;
    right: 0;
    top: 9px;
    border-radius: 50%;
    text-align: center;
    background: #EAF3FA;
    .el-image {
      width: 45%;
      margin-top: 9px;
    }
  }
  .row {
    margin:0;
    padding: 0;
    width: calc(100vw - 150px);
    .title {
      font-weight: bold;
      font-size: 16px;
      color: #0D0D0D;
    }
    .text {
      color: #6E6E6E;
      font-size: 12px;
    }
  }
}

</style>
