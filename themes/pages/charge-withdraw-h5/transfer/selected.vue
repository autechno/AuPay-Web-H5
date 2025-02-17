<template>
  <div class="page">
    <GoBack />
    <div class="sub-page">
      <div class="title-box-wrap">
        <div class="title-wrap">付款至</div>
        <div class="title-item">
          <el-icon><el-image :src="!accountForm.accountLogo ? head : accountForm.accountLogo" /></el-icon>
          <div class="column">
            <div class="title">{{accountForm.accountName}}</div>
            <div class="text">{{accountForm.sign}}</div>
          </div>
        </div>
      </div>
      <div class="search-wrap">
        <el-icon class="arrow" size="26"><Search /></el-icon>
        <input v-model="searchText" placeholder="搜索币种" class="custom-input" />
      </div>
      <div class="table-list" v-for="currency in currencyList" :key="currency.id">
        <div class="item" @click="selectCurrency(currency)">
          <div class="left-column"><div class="currency-wrap"><el-image :src="sol" /></div></div>
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
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import { Search} from "@element-plus/icons-vue";
import { getDataInfo} from "~/utils/configUtils";
const headers = getHeader();

const router = useRouter();
const route = useRoute();
const searchText = ref('');
import head from '@@/public/images/head.svg';
import sol from "@@/public/images/sol.svg";
import {getHeader} from "@/utils/storageUtils";
import {showCatchErrorMessage} from "~/utils/messageUtils";
// 整合数据
const currencyList = ref([]);
const originalCurrencyList = ref([]);
const { assetsApi, userApi } = useServer();
const form = ref({
  transferQR: '',
})
const accountForm = ref({
  accountLogo: '',
  accountName: '',
  accountNo: '',
  sign: '',
})

// 重置 currencyList
const resetCurrencyList = () => {
  currencyList.value = originalCurrencyList.value.filter(currency => {
    const isSearchMatch = currency.currencyName.toLowerCase().includes(searchText.value.toLowerCase());
    return isSearchMatch;
  });
};

const selectCurrency = async (item: any) => {
  let qr = encodeURIComponent(form.value.transferQR);
  router.push({ path: './', query: { qr: qr, assetsId: item.id} });
}

// 获取数据
const fetchData = async (transferQR: string) => {
  try {
    // 并发请求账户资产和二维码验证
    const [resAssets, resQR] = await Promise.all([
      assetsApi.accountAssets({}, headers),
      userApi.getCheckTransferCode({ qrCode: transferQR }, headers)
    ]);

    // 处理账户资产数据
    if (resAssets.code === 200) {
      let currencyData = [];
      const dataList = resAssets.data;
      dataList.forEach(item => {
        const { id, currencyId, currencyChain, balance, totalBalanceUsdt } = item;
        currencyData.push({
          id,
          balance,
          totalBalanceUsdt,
          currencyId,
          currencyName: getDataInfo(currencyId, 'currencyChains')?.name,
          currencyChain: currencyChain,
          currencyChainName: getDataInfo(currencyChain, 'chains')?.name,
        });
      });
      // 更新货币列表
      currencyList.value = currencyData;
      originalCurrencyList.value = currencyData;
    } else {
      showErrorMessage(resAssets.code, resAssets.message);
    }
    // 处理二维码验证结果
    if (resQR.code === 200) {
      accountForm.value = resQR.data; // 更新账户表单数据
    } else {
      showErrorMessage(resQR.code, resQR.message);
    }
  } catch (error) {
    showCatchErrorMessage();
  }
};

// 监听
watch(searchText, () => {
  resetCurrencyList();
});

// 初始化数据
onMounted(() => {
  if(route.query.qr){
    form.value.transferQR = decodeURIComponent(route.query.qr);
    fetchData(form.value.transferQR);
  }
});
</script>

<style lang="less" scoped>
.title-box-wrap {
  position: relative;
  .title-wrap{
    padding-top: 6px;
    color: #0D0D0D;
    line-height: 24px;
    font-size: 14px;
  }
  padding-bottom: 20px;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.search-wrap{
  height: 40px;
  padding-right: 10px;
  border: #C8DCE8 solid 3px;
  background: #ffffff;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  margin-bottom: 20px;
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
.table-title{
  font-size: 16px;
  color: #333333;
}
.title-item{
  margin-top: 16px;
  height: 46px;
  display: flex;
  .title{
    line-height: 20px;
    color: #333333;
    height: 22px;
  }
  .text{
    line-height: 16px;
    color: #999999;
    font-size: 12px;
    height: 16px;
    overflow: hidden;
  }
  .el-icon{
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
    height: 46px;
    width: 46px;
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
      height: 100%;
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
    justify-content: space-between;
    width: 100%;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
    .text {
      font-size: 12px;
      color: #6E6E6E;
    }
  }
}
</style>
