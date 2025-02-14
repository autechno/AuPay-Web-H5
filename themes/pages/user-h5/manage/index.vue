<template>
<div class="page" style="padding-top: 28px;">
    <div class="user-title-wrap">
      <div class="row">
        <span class="h1">用户中心</span>
        <el-icon><el-image :src="shape" /></el-icon>
      </div>
<!--      <div class="row">-->
<!--        <span class="h1">33</span>        <span class="h1">33</span>-->
<!--      </div>-->
<!--      <div class="table-list">-->
<!--        <div class="title">管理设置</div>-->
<!--        <div class="text"><el-image :src="shape" />账号信息</div>-->
<!--        <div class="text">用户信息</div>-->
<!--        <div class="text">申请/审批</div>-->
<!--        <div class="text">地址管理</div>-->
<!--        <div class="text">订单管理</div>-->
<!--        <div class="title">通讯录</div>-->
<!--        <div class="text">关于auPay</div>-->
<!--        <div class="text">关于我们</div>-->
<!--        <div class="text">隐私条款</div>-->
<!--        <div class="text">服务条款</div>-->
<!--      </div>-->
<!--      <div class="footer">auPay @2025.001版</div>-->
<!--    </div>-->

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
import { getHeader } from "@/utils/storageUtils";
import { useRouter, useRoute } from 'vue-router';
import shape from '@@/public/images/Shape.svg'
import { formatCurrency, getDataInfo} from "@/utils/configUtils";


const headers = getHeader();
const router = useRouter();
const { assetsApi, systemApi } = useServer();
const currencyMergedData = ref([]);
const totalAssets = ref(0);
const isShowCurrency = ref(false);

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
  // const userStore = UseUserStore();
  // userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  // userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  // isShowCurrency.value = userStore.userInfo.showHide == 1;
  // userInfo.value.name = userStore.userInfo.nickname;
  // fetchData();
})

</script>
<style scoped>
*{
  margin:0;
  padding: 0;
  font-size: 12px;
.user-title-wrap{
  .row{
    width: 100%;
    color: #333333;
    display: flex;
    justify-content: space-between;
    .h1{
      font-size: 26px;
    }
  }
  .footer{
    text-align: center;
    font-size: #999999;
    padding-top: 50px;
  }
  .table-list{
    .title{
      color: #333333;
    }
    .text{
      color: #666666;
    }
  }
  }
}
</style>
