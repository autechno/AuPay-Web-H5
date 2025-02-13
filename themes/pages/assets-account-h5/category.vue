<template>
  <div class="page">
    <GoBack goBackTo="list"  />
    <div class="category-wrap">
      <div class="input-amount-wrap">
        <div class="input-wrap" :style="{ fontSize: computedFontSize }">{{formatCurrency(assets.balance)}} </div>
      </div>
      <div class="text-wrap" style="margin-top: 16px; margin-bottom: 40px;">
        <span style="color: #0F9A50;">+20%</span>
        <span style="color: #333333">{{formatCurrency(assets.amount)}}</span>
      </div>
      <div class="copy-wrap" @click="copyText(assets.walletAddress)">
        {{ formatAddressString(assets.walletAddress, 16, 20) }} <el-image :src="copy" />
      </div>
      <div class="tips-wrap">地址仅支持{{assets.currencyName}}的转入，请勿转入其他资产造成损失</div>
      <el-row :gutter="20" class="icon-container">
        <el-col v-for="(item, index) in icons" :key="index" :span="6">
          <router-link :to="item.url" class="icon-text">
            <i :class="item.iconClass"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </el-col>
      </el-row>
      <div class="table-title"><span style="font-size: 18px;">订单记录</span><span style="color: #FDC92E" @click="jumpOrder">要看更多</span></div>
      <div class="table-list">
        <div class="item" v-for="item in assetsList" :key="item.id" @click="jumpDetail(item.id)">
          <div class="list">
            <span style="font-size: 20px; ">{{getDataInfo(item.tradeType, 'trade')?.name}}</span>
            <span style="font-size: 14px;" :class="item.tradeType == 1 || item.tradeType == 71|| item.tradeType == 81|| item.tradeType == 91? 'pay' : 'collect'">
                {{ formatCurrency(item.amount) }}
            </span>
          </div>
          <div class="list">
            <span>{{formatDate(item.createTime)}}</span>
            <span>{{getDataInfo(item.currencyChain, 'currencyChains')?.name}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import {getHeader} from "@/utils/storageUtils";
import { useRoute, useRouter } from 'vue-router';
import copy from '@@/public/images/copy2.svg';
import {copyText} from "@/utils/funcUtil";

const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const titleBar = ref();
const assetsList = ref([]);
const assets = ref({
  fee: '',
  totalBalanceUsdt: '',
  balance: '',
  amount: 0,
  walletAddress: ''
})

const icons = ref([
  { iconClass: 'i1', label: '充值', url: '/charge-withdraw-h5/recharge/list' },
  { iconClass: 'i2', label: '提现', url: '/charge-withdraw-h5/withdrawal/list'},
  { iconClass: 'i3', label: '转帐', url: '/charge-withdraw-h5/transfer/pay'},
  { iconClass: 'i4', label: '闪兑', url: '/flash-exchange-h5'},
]);

// 获取数据
const fetchData = async (assetsId: number, currencyUnit: string) => {
  try {
    const [rateRes, assetsRes] = await Promise.all([
      assetsApi.getRateU2Currency({ currency: currencyUnit }, headers),
      await assetsApi.getAccountAssetsById({ assetsId:  assetsId }, headers)
    ]);
    // 汇率
    let exchangeRate = rateRes.code == 200?rateRes.data:1;
    if (assetsRes.code == 200) {
      let currencyId = assetsRes.data.currencyId
      let currencyChain = assetsRes.data.currencyChain
      assets.value = assetsRes.data;
      assets.value.amount = assetsRes.data.totalBalanceUsdt * exchangeRate;

      // 获取充值配置
      const rechargeConfigRes = await assetsApi.getAccountRechargeConfig({currencyId, currencyChain}, headers);
      if (rechargeConfigRes.code === 200) {
        assets.value.walletAddress = rechargeConfigRes.data.address
      } else {
        showErrorMessage(rechargeConfigRes.code, rechargeConfigRes.message)
      }
      // 资金列表
      const assetsListRes = await assetsApi.accountAssetsList({
        pageNo: 1,
        pageSize: 10,
        conditions: {currencyId: currencyId, currencyChain: currencyChain}
      }, headers);
      if (assetsListRes.code == 200) {
        assetsList.value = assetsListRes.data.records;
      }
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 计算字体大小
const computedFontSize = computed(() => {
  const length = assets.value.toString().length;
  const reducedFontSize = 40 - (length > 10 ? (length - 10) : 0);
  return `${Math.max(reducedFontSize, 12)}px`;
});

// 跳转列表首页
const jumpOrder= () => {
  router.push({ path: '/assets-account-h5/order', query: {} });
}
// 跳转
const jumpDetail = (id: number) => {
  router.push({ path: 'detail', query: {id: id} });
}

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  fetchData(route.query.assetsId, userStore.userInfo.currencyUnit);
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
.category-wrap{
  .table-list{
    padding-bottom: 28px;
    .item{
      height: 76px;
      border: #E0EBF2 solid 3px;
      padding: 0 17px;
      border-radius: 16px;
      margin-top: 12px;
      font-size: 12px;
      color: #333333;
      .list{
        display: flex;
        justify-content: space-between;
      }
      .list:first-child{
        padding-top: 14px;
        line-height: 28px;
        padding-bottom: 4px;
      }
      .pay {
        color: #F36A35;
      }
      .collect{
        color: #0F9A50;
      }
    }
  }
  .copy-wrap{
    margin-bottom: 6px;
    color: #666666;
    font-size: 12px;
    text-align: center;
    display: flex;
    justify-content: center;
    height: 20px;
    line-height: 20px;
    .el-image{
      width: 14px;
      height: 16px;
      margin-left: 3px;
    }
  }
  .table-title {
    margin-top: 25px;
    line-height: 20px;
    overflow: hidden;
    display: flex;
    font-size: 12px;
    justify-content: space-between;
  }
  .tips-wrap{
    padding: 5px;
    background: #FFEEEE;
    border-radius: 8px;
    line-height: 16px;
    font-size: 12px;
    color: #FD6B2E;
    text-align: center;
  }
  .text-wrap{
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    text-align: center;
    span:first-child{
      margin-right: 10px;
    }
  }
  .input-amount-wrap{
    height: 49px;
    padding-top: 12px;
    .input-wrap{
      border: 0 !important;
      text-align: center;
      height: 49px;
      line-height: 49px;
      font-size: 40px;
      width: 100%;
      font-weight: bold;
      color: #0D0D0D;
    }
    .input-wrap::placeholder{
      font-size: 28px;
    }
  }
}


</style>
