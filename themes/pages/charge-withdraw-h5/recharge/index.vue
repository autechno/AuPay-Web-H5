<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="false"   />
    <div class="box-wrap">
      <div class="title">您的 {{form.currencyChainName}} 地址</div>
      <div class="text">欢迎使用auPay</div>
      <div class="code-wrap">
        <QCcode :value="form.walletAddress" :size="180" />
      </div>
      <div class="text">请注意！此地址仅能接受 Ethere上的代币 （ETH，USTD，OZC，TOTO）</div>
      <div class="address-bg-wrap" @click="copyText(form.walletAddress)">
       {{ formatAddressString(form.walletAddress, 16, 20) }} <el-image :src="copy" />
      </div>
    </div>
    <el-button class="custom-button" >分享</el-button>
    <el-drawer v-model="drawerSearch"
               title="请注意！"
               :show-close="false"
               direction="btt"
               size="70%">
      <div>
        <p>本地址仅接受 Ethere 上的 USTD，OZC，TOTO，ETH 四种代币</p>
        <p>请您在充值前仔细核对币种, 不支持币种的任何转账, 不可退还和取消。</p>
      </div>
      <el-button class="custom-button" >我已知晓，会仔细核对充值币种</el-button>
    </el-drawer>

  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import copy from "@@/public/images/copy.svg";
import {copyText} from "@/utils/funcUtil";
import QCcode from "@/composables/QCcode.vue";

const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const drawerSearch = ref(true);
const address = ref('');

const form = ref({
  currencyId: '',
  currencyChain: '',
  walletAddress: '',
})

// 获取数据
const fetchData = async (id: number) => {
  try {
    // 同时发起两个请求
    const assetsRes = await assetsApi.getAccountAssetsById({ assetsId: id }, headers);
    // 处理第一个请求的结果
    if (assetsRes.code === 200) {
      const { currencyId, currencyChain} = assetsRes.data;
      // 检查是否已存在该货币数据
      form.value = {
        currencyId,
        currencyName: getDataInfo(currencyId, 'currencyChains')?.name,
        currencyChain: currencyChain,
        currencyChainName: getDataInfo(currencyChain, 'chains')?.name,
      };
      // 获取充值配置
      const rechargeConfigRes = await assetsApi.getAccountRechargeConfig({ currencyId, currencyChain }, headers);
      if (rechargeConfigRes.code === 200) {
        form.value.walletAddress = rechargeConfigRes.data.address
      } else {
        ElMessage.error(rechargeConfigRes.message || '查询失败');
      }
    }else{
      ElMessage.error(assetsRes.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};


// 初始化数据
onMounted(() => {
  fetchData(route.query.currencyId);
});
</script>

<style lang="less" scoped>
.code-wrap{
  margin: 0 auto;
  width: 250px;
  height: 250px;
  text-align: center;
  canvas{
    margin-top: 35px;
  }
}
*{
  margin: 0;
  padding: 0;
}
.box-wrap{
  background: #F9F9FA;
  margin-top:18px;
  text-align: center;
  padding-bottom: 35px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .title{
    padding: 25px 20px 0px 20px;
    height: 41px;
    line-height: 41px;
    overflow: hidden;
    font-size: 20px;
    color: #5686E1;
  }
  .text{
    padding: 0 20px;
    font-size: 14px;
    color: #353955;
  }
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .custom-button{
    position: fixed;
    bottom: 45px;
    left: 50%;
    width: 90%;
    transform: translate(-50%);
  }
  .address-bg-wrap{
    background: #EAF3FA;
    height: 56px;
    border-radius: 16px;
    text-align: center;
    line-height: 56px;
    color: #5686E1;
    width: 90%;
    position: fixed;
    bottom: 115px;
    left: 50%;
    transform: translate(-50%);
    .el-image{
      margin-top: 15px;
      width: 17px;
      height: 19px;
    }
  }
  /deep/ .el-drawer__header{
    text-align: center;
    padding:40px;
    margin: 0;
    .el-drawer__title{
      font-size: 20px;
      font-weight: bold;
      color: #333333;
    }
  }
  /deep/ .el-drawer__body{
    color: #333333;
    font-size: 18px;
    text-align: center;
    line-height: 35px;
    padding: 0 40px;
  }

}

</style>
