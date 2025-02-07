<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="false"  />
    <div class="sub-page">
      <div class="table-list" v-for="item in addressList" :key="item.id">
        <div class="item" @click="selectAddress(item)">
          <div class="left-column"><div class="currency-wrap"><el-image :src="btc" /></div></div>
          <div class="right-column">
            <div class="currency" @click="copyText(item.address)"><el-image :src="copy" /></div>
            <p class="row"><span class="title">{{item.name}}</span> <span class="text">{{item.remark}}</span></p>
            <p class="row"><span class="text">{{item.address}}</span></p>
          </div>
        </div>
      </div>
    </div>
    <el-button class="custom-button" >新增地址</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import btc from '@@/public/images/btc.svg'
import copy from '@@/public/images/copy2.svg'
const route = useRoute();
const router = useRouter();
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
const addressList = ref([]);
const currencyId = ref(0)
const { assetsApi, userApi } = useServer();

// 选择地址
const selectAddress = (item: any) => {
  router.push({ path: '/charge-withdraw-old/withdrawal', query: { currencyId:  currencyId.value, address: item.address } });
}

// 获取资产数据
const fetchData = async () => {
  try {
    let addressRes =  await  userApi.getFrequentlyList({}, headers);
    // 常用地址查询
    if (addressRes.code === 200) {
      addressList.value = addressRes.data.filter(item => !item.lock);
    } else {
      ElMessage.error(addressRes.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};
// 初始化数据
onMounted(() => {
  fetchData();
  currencyId.value = route.query.currencyId;
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
  .custom-button{
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translate(-50%);
  }
}
.sub-page{
  padding-top:5px;
  padding-bottom: 20px;
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
      width: 70%;
      margin-top:7px;
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
    width: 36px;
    height: 36px;
    position: absolute;
    right: 0;
    top:9px;
    border-radius: 50%;
    text-align: center;
    background: #EAF3FA;
    .el-image{
      width: 45%;
      margin-top:9px;
    }
  }
  .row {
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
