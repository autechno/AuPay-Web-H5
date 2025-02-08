<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="true"   />
    <div class="box-wrap">
      <div class="title">{{form.currencyChainName}}</div>
      <div class="text">auPay</div>
      <div class="code-wrap">

      </div>
      <div class="text">文案固定文案固定文案固定文案固定文案固定文案固定</div>
      <div class="address-bg-wrap">
       {{ formatAddressString(address) }} <el-image :src="copy" />
      </div>
    </div>
    <el-button @click="dialogCheckVisible = true" class="custom-button" >分享</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import copy from "@@/public/images/copy.svg";

const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const address = ref('');
const dialogCheckVisible = ref(false);


// 获取数据
const fetchData = async (id: number, currencyId: number, currencyChain: number ) => {
  try {
    // 同时发起两个请求
    const [assetsRes, rechargeConfigRes] = await Promise.all([
      assetsApi.getAccountAssetsById({ assetsId: id }, headers),
      assetsApi.getAccountRechargeConfig({ currencyId: currencyId, currencyChain: currencyChain}, headers),
    ]);
    // 处理第一个请求的结果
    if (assetsRes.code === 200) {
      const { id, currencyId, currencyChain, balance, totalBalanceUsdt } = assetsRes.data;
      // 检查是否已存在该货币数据
      let data = {
        id,
        balance,
        totalBalanceUsdt,
        currencyId,
        currencyName: getDataInfo(currencyId, 'currencyChains')?.name,
        currencyChain: currencyChain,
        currencyChainName: getDataInfo(currencyChain, 'chains')?.name,
      };
      form.value = data;
      form.value.amount = '';
      form.value.permissionStatus = false;
    }else{
      ElMessage.error(assetsRes.message || '查询失败');
    }

    // 处理充值配置
    if (rechargeConfigRes.code === 200) {
      address.value  = rechargeConfigRes.data.address
    }else{
      ElMessage.error(rechargeConfigRes.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

const form = ref({
  amount: '',
  totalBalanceUsdt: '',
  balance: '',
  permissionStatus: ''
})

// 初始化数据
onMounted(() => {
  fetchData(route.query.id, route.query.currencyChain, route.query.currencyId);
});
</script>

<style lang="less" scoped>
.address-bg-wrap{
  background: #EAF3FA;
  height: 56px;
  border-radius: 16px;
  text-align: center;
  line-height: 56px;
  color: #5686E1;
  .el-image{
    margin-top: 15px;
    width: 17px;
    height: 19px;
  }
}
.code-wrap{
  width: 250px;
  height: 250px;
}
*{
  margin: 0;
  padding: 0;
}
.box-wrap{
  background: #F9F9FA;
  margin-top:18px;
  height: calc(100vh - 115px);
  text-align: center;
  .title{
    padding: 0 50px;
    height: 41px;
    line-height: 41px;
    overflow: hidden;
    color: #353955;
    padding-top: 22px;
    font-size: 20px;
  }
  .text{
    padding: 0 50px;
    font-size: 14px;
    color: #5686E1;
  }
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .custom-button{
    position: absolute;
    bottom: 25px;
    left: 50%;
    width: 85%;
    transform: translate(-50%);
  }
  .address-bg-wrap{
    width: 85%;
    position: absolute;
    bottom: 95px;
    left: 50%;
    transform: translate(-50%);
  }
}

</style>
