<template>
  <div class="page">
      <div class="user-title-wrap">
      <div class="head">
        <span class="h1">用户中心</span>
        <el-icon size="20"><el-image :src="info" /></el-icon>
      </div>
      <div class="table-list">
        <div class="title">管理设置</div>
        <div class="text" @click="jumpPage('/user-h5/manage/account', {})"><span><el-image :src="wallet" />账号信息</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text" @click="jumpPage('/user-h5/info', {})"><span><el-image :src="peo" />用户信息</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text"><span><el-image :src="editSquare" />申请/审批</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text" @click="jumpPage('/user-h5/address/list', {})"><span><el-image :src="add" />地址管理</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text" @click="jumpPage('/assets-account-h5/detail/order', {})"><span><el-image :src="order" />订单管理</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text" @click="jumpPage('/user-h5/contact/list', {})"><span><el-image :src="addressbook" />通讯录</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="title">关于auPay</div>
        <div class="text"><span><el-image :src="logo2" />关于我们</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text"><span><el-image :src="safe" />隐私条款</span><el-icon><ArrowRightBold /></el-icon></div>
        <div class="text"><span><el-image :src="server" />服务条款</span><el-icon><ArrowRightBold /></el-icon></div>
      </div>
      <div class="footer">auPay @2025.001版</div>
    </div>
    <el-row :gutter="20" class="menu-container" style="margin-left:0; margin-right: 0">
      <el-col :span="6">
        <router-link to="/user-h5" class="icon-text i1">
          <i></i><span>首页</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link to="/assets-account-h5/" class="icon-text i2">
          <i></i><span>资产</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <router-link to="/assets-account-h5/market" class="icon-text i3">
          <i></i><span>行情</span>
        </router-link>
      </el-col>
      <el-col :span="6">
        <p class="icon-text cur4">
          <i></i><span>用户</span>
        </p>
      </el-col>
    </el-row>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import { useRouter, useRoute } from 'vue-router';
import wallet from "@@/public/images/user/Wallet.svg";
import peo from "@@/public/images/user/peo.svg";
import editSquare from "@@/public/images/user/EditSquare.svg";
import add from "@@/public/images/user/add.svg";
import order from "@@/public/images/user/Order.svg";
import addressbook from "@@/public/images/user/Addressbook.svg";
import info from "@@/public/images/user/info.svg";
import logo2 from "@@/public/images/user/aupayLOGO2.svg";
import safe from "@@/public/images/user/Safe.svg";
import server from "@@/public/images/user/Serve.svg";
import {ArrowRightBold} from "@element-plus/icons-vue";

const headers = getHeader();
const router = useRouter();
const { assetsApi, systemApi } = useServer();

// 跳转列表首页
const jumpPage= (url: string, query: any) => {
  router.push({ path: url, query: query });
}


// 初始化数据
onMounted(() => {

})

</script>
<style scoped>
.page{
  height: calc(100vh - 28px);
}
.user-title-wrap{
  .head{
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
    div{
      display: flex;
      justify-content: space-between;
      height: 38px;
      line-height: 38px;
      margin: 15px 0;
    }
    .title{
      color: #333333;
    }
    .text{
      span{
        padding-left: 5px;
        .el-image{
          float: left;
          margin-top: 0px;
          margin-right: 8px;
          width: 20px;
        }
      }
      color: #666666;
    }
  }
  .footer{
    text-align: center;
    font-size: 12px;
    color: #999999;
    text-align: center;
  }
}

</style>
