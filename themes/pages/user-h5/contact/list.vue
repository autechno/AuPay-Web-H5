<template>
  <div class="page">
    <GoBack title="通讯录" />
    <div class="search-wrap">
      <el-icon class="arrow" size="26"><Search /></el-icon>
      <input v-model="searchText" placeholder="搜索昵称/auPay ID" @input="searchContact" class="custom-input" />
    </div>
    <div class="table-list">
      <div class="item" v-for="(item, index) in contactList" >
        <el-icon><el-image :src="item.accountLogo ? item.accountLogo : head" /></el-icon>
        <div class="column">
          <div class="title">{{item.nickname}}</div>
          <div class="text"><span>{{item.email}}</span><span>auPay ID: {{item.transferQrcode}}</span></div>
        </div>
      </div>
    </div>
    <button class="custom-button custom-button-pos" @click="drawerVisible = true">新增</button>
    <el-drawer class="custom-drawer" v-model="drawerVisible"
               title=""
               :show-close="false"
               @close="drawerVisible = false"
               direction="rtl"
               size="100%">
        <GoClose :title="title" @close="drawerVisible = false" />
        <div class="search-wrap">
          <input v-model="transferQr" placeholder="auPay ID" class="custom-input" />
          <el-icon class="edit"><el-image :src="scan" /></el-icon>
        </div>
        <button class="custom-button custom-button-pos" native-type="submit" @click="getAccountInfo">确定</button>
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import { getHeader } from "@/utils/storageUtils";
import {Search} from "@element-plus/icons-vue";
import head from "@@/public/images/head.svg";
import GoClose from "@/composables/GoPageClose.vue";
import scan from "@@/public/images/Scan3.svg";

const title = '新增通讯录好友';
const route = useRoute();
const router = useRouter();
const headers = getHeader();
const drawerVisible = ref(false);
const isPage = ref(0);
const contactList = ref([]);
const transferQr = ref('0KVMONDOBWqJ3tGigOzbsjj1oYTluiLF');
const { userApi } = useServer();
const searchText = ref('');
const form = ref({
  pageNo: 1,
  pageSize: 100,
  conditions: {
  }
})

// 搜索
const searchContact = () => {
  if(searchText.value){
    form.value.conditions['searchStr'] = searchText.value;
  }else{
    form.value.conditions = {};
  }
  fetchData();
}

// 选择地址
const selectContact = (id: number) => {
}

// 确认按钮的处理
const getAccountInfo = async () => {
  try{
    const res = await userApi.getCheckTransferCode({ qrCode: transferQr.value }, headers);
    if(res.code == 200){
      router.push({ path: './', query: { isPage: isPage.value, qrCode: encodeURIComponent(transferQr.value) } });
    }else{
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 获取资产数据
const fetchData = async () => {
  try {
    let res = await userApi.queryAccountContact(form.value, headers);
    if (res.code == 200) {
      //通讯录只查一页
      contactList.value = res.data.records;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showValidationErrorMessage();
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>

.address-body{
  .table-list{
    position: relative;
    margin-top: 5px;
    .item{
      display: flex;
      height: 52px;
      padding: 10px 0;
      border-bottom: 1px solid #f1f1f1;
    }
  }
  .left-column {
    width: 48px;
    height: 48px;
    position: relative;
    .wlist{
      position: absolute;
      right: 0;
      bottom: -6px;
      z-index: 2;
    }
    .el-icon{
      width: 100%;
      height: 100%;
      background-color: #eaeaea;
      border-radius: 50%;
      .el-image{
        width: 70%;
      }
    }
  }
  .right-column {
    padding-left: 10px;
    flex: 1;
    padding-top: 5px;
    position: relative;
    .btn-wrap{
      width: 83px;
      position: absolute;
      right: 0;
      top: 10px;
      display: flex;
      justify-content: space-between;
      .el-icon{
        width: 36px;
        height: 36px;
        border-radius: 50%;
        text-align: center;
        background: #EAF3FA;
        .el-image{
          width: 50%;
        }
      }
    }
    .row {
      width: calc(100vw - 200px);
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
}

.table-list{
  .item{
    margin-top: 20px;
    height: 40px;
    display: flex;
    .column{
      width: 100%;
      .title{
        line-height: 20px;
        color: #333333;
        height: 20px;
      }
      .text{
        display: flex;
        justify-content: space-between;
        line-height: 16px;
        color: #999999;
        font-size: 12px;
        height: 16px;
        overflow: hidden;
      }
    }
  }
  .el-icon{
    margin-top:2px;
    height: 34px;
    width: 34px;
    margin-right: 5px;
  }
}
</style>
