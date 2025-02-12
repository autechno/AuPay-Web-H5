<template>
  <div class="address-page">
    <GoBack />
    <div class="address-body">
      <div class="table-list" v-for="item in addressList" :key="item.id">
        <div class="item" @click="selectAddress(item)">
          <div class="left-column">
            <el-icon><el-image :src="sol" /></el-icon>
            <el-image class="wlist" v-if="item.white" :src="wlist" />
          </div>
          <div class="right-column">
            <div class="btn-wrap">
              <el-icon @click.stop="copyText(item.address)"><el-image :src="edit" /></el-icon>
              <el-icon  @click.stop="copyText(item.address)"><el-image :src="copy" /></el-icon>
            </div>
            <p class="row"><span class="title">{{item.name}}</span> <span class="text">{{item.remark}}</span></p>
            <p class="row"><span class="text">{{formatAddressString(item.address, 20, 20)}}</span></p>
          </div>
        </div>
      </div>
    </div>
    <el-button class="custom-button custom-button-pos" >新增地址</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import sol from '@@/public/images/sol.svg'
import copy from '@@/public/images/copy2.svg'
import edit from '@@/public/images/edit3.svg'
import wlist from '@@/public/images/wlist.svg'
const route = useRoute();
const router = useRouter();
import { getHeader } from "@/utils/storageUtils";
const headers = getHeader();
const addressList = ref([]);
const assetsId = ref(0)
const { userApi } = useServer();

// 选择地址
const selectAddress = (item: any) => {

}
// 选择地址
const editAddress = (item: any) => {
  // router.push({ path: '/charge-withdraw-h5/withdrawal', query: { assetsId:  assetsId.value, address: item.address } });
}


// 获取资产数据
const fetchData = async () => {
  try {
    let addressRes = await userApi.getFrequentlyList({}, headers);
    // 常用地址查询
    if (addressRes.code === 200) {
      addressList.value = addressRes.data;
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
  assetsId.value = route.query.assetsId;
});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.address-page{
  position: relative;
  padding-top: 10px;
}
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
