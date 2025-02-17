<template>
  <div class="page">
    <div class="avatar-header">
      <span>
        <el-icon class="avatar" style="float: left"><el-image :src="userInfo.headPortrait ? userInfo.headPortrait : head" /></el-icon>
        <span class="name">{{userInfo.name}}</span>
      </span>
      <el-icon class="avatar">
        <el-image :src="scan" />
      </el-icon>
    </div>
    <div class="sub-page">
      <div class="search-wrap">
        <el-icon class="arrow" size="26"><Search /></el-icon>
        <input v-model="searchText" placeholder="搜索" class="custom-input" />
      </div>
      <div class="table-title-wrap">
        <div class="title">我的代币</div>
        <div class="select-wrap custom-input-shadow">
          <el-select class="select" v-model="form.conditions.tradeType" placeholder="订单类型" @change="handlePageChange(1)">
            <el-option v-for="item in currencyList" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {Search} from "@element-plus/icons-vue";
import {getHeader} from "@/utils/storageUtils";
const headers = getHeader();
import { useRoute, useRouter } from 'vue-router';
import head from "@@/public/images/head.svg";
import scan from "@@/public/images/Scan.svg";

const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    tradeType: ''
  }
});
const router = useRouter();
const { assetsApi } = useServer();
const currencyList = ref([]);
const searchText = ref('');

// 获取数据
const fetchData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code == 200) {
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  userInfo.value.headPortrait = userStore.userInfo.headPortrait;
  userInfo.value.currencyCode = userStore.userInfo.currencyUnit;
  userInfo.value.name = userStore.userInfo.nickname;
  fetchData();
});

</script>

<style lang="less" scoped>
.page{
  position: relative;
  height: calc(100vh - 28px);
}
.sub-page{
  padding-top:20px;
  padding-bottom: 20px;
}
.custom-input-shadow{
  :deep(.el-select__wrapper) {
    box-shadow: none;
  }
}

</style>
