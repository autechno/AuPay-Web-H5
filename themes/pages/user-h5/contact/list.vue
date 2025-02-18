<template>
  <div class="page">
    <GoBack title="地址库" />
    <div class="search-wrap">
      <el-icon class="arrow" size="26"><Search /></el-icon>
      <input v-model="searchText" placeholder="搜索昵称/auPay ID" class="custom-input" />
    </div>
    <div class="table-list">
      <div class="item" v-for="(item, index) in contactList" >
        <el-icon><el-image :src="item.accountLogo ? item.accountLogo : head" /></el-icon>
        <div class="column">
          <div class="title">{{item.nickname}}</div>
          <div class="text"><span>{{item.email}}</span><span>{{item.transferQrcode}}</span></div>
        </div>
      </div>
    </div>
    <button class="custom-button custom-button-pos" @click="addContact">新增</button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import { getHeader } from "@/utils/storageUtils";
import {Search} from "@element-plus/icons-vue";
import head from "@@/public/images/head.svg";

const route = useRoute();
const router = useRouter();
const headers = getHeader();
const contactList = ref([]);
const originalContactList = ref([]);
const { userApi } = useServer();
const searchText = ref('');
const contactForm = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
  }
})
// 定义跳转函数
const addContact = () => {
  console.log('addressList')
  router.push({ path: '/user-h5/address/add', query: { } });
};

// 选择地址
const selectContact = (id: number) => {

}


// 获取资产数据
const fetchData = async () => {
  try {
    let res = await userApi.queryAccountContact(contactForm.value, headers);
    if (res.code == 200) {
      contactList.value = res.data.records;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showValidationErrorMessage();
  }
};

// 重置 addressList
const resetAddressList = () => {
  addressList.value = originalAddressList.value.filter(address => {
    return address.name.toLowerCase().includes(searchText.value.toLowerCase());
  });
};

// 监听
watch(searchText, () => {
  resetAddressList();
});

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


</style>
