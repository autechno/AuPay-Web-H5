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

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import banner from '@@/public/images/banner.png';
import { getHeader } from "@/utils/storageUtils";
import eye from "@@/public/images/see.svg";
import scan from "@@/public/images/Scan.svg";
import head from '@@/public/images/head.svg';
import btc from '@@/public/images/btc.svg'
import { useRouter, useRoute } from 'vue-router';
import { formatCurrency, getDataInfo} from "@/utils/configUtils";

const headers = getHeader();
const router = useRouter();
const { userApi, systemApi } = useServer();
const currencyMergedData = ref([]);
const totalAssets = ref(0);
const isShowCurrency = ref(false);
const userInfo = ref({
  headPortrait: '',
  name: '',
  currencyCode: 'USD',
  currencySign: '$'
})

const jumpPage = (url: string, query: any) => {
  router.push({ path: url, query: query });
}

// 初始化
const fetchData = async () => {
  try {
    const res = await userApi.getUserInfo({}, headers);

  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
})

</script>
<style scoped>
.page {
  color: #0D0D0D;
  padding-bottom: 100px;
}
 .amount-input-wrap {
   border: none;
   outline: none;
   width: 100%;
   font-size: 36px;
   font-weight: bold;
   line-height: 49px;
 }
.assets-main{
  margin-top: 32px;
}

.table-title {
  line-height: 20px;
  overflow: hidden;
  display: flex;
  font-size: 12px;
  justify-content: space-between;
}
.banner{
  margin-top: 25px;
  margin-bottom: 25px;
}
.banner img{
  width: 100%;
}
.table-list{
  position: relative;
  margin-top: 10px;
}
.table-list .item{
  display: flex;
  height: 52px;
  padding: 10px 0;
  border-bottom: 1px solid #f1f1f1;
  overflow: hidden;
}
.left-column {
  width: 48px;
  height: 48px;
  .el-image{
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
    border-radius: 48px;
  }
}
.right-column {
  padding-left: 10px;
  flex: 1;
  padding-top: 5px;
  justify-content: flex-start;
  flex-direction: column;
}
.right-column .row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.right-column .row .title {
  font-weight: bold;
  font-size: 16px;
}

.right-column .row .text {
  color: #6E6E6E;
}
</style>
