<template>
  <div class="page">
    <GoPageBack />
    <div class="avatar-header-wrap">
      <div style="display: flex; ">
        <el-icon class="avatar"><el-image :src="accountInfo.accountLogo ? accountInfo.accountLogo : head" /></el-icon>
        <div style="margin-top: 8px;">
          <p class="name" style="margin-top: 0;">{{accountInfo.nickname}}</p>
          <p ><span>auPay ID: </span>{{formatAddressString(accountInfo.qrCode, 8, 10)}}</p>
          <p >{{formatEmailString(accountInfo.email)}}</p>
          <p >{{accountInfo.sign}}</p>
        </div>
      </div>
    </div>
    <div class="btn-wrap" v-if="isPage == 0">
      <button class="custom-button-down-default">删除</button>
      <button class="custom-button-down">付款给他</button>
    </div>
    <div v-else class="btn-wrap" >
      <button class="custom-button-down">删除</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import head from '@@/public/images/head.svg';
import GoPageBack from "@/composables/GoPageBack.vue";
import {useRoute, useRouter} from "#vue-router";
import {formatEmailString} from "~/utils/funcUtil";


const { public: { API_HOST } } = useRuntimeConfig();
const title = ref("");
const route = useRoute();
const router = useRouter();
const headers = getHeader();
const isPage = ref(0);
const { userApi, systemApi } = useServer();
const accountInfo = ref({
  accountId: 'fadsfa',
  accountName: 'afasfa',
  accountNo: 'af@au.com',
  accountLogo: '',
  sign: "232323",
  email: 'yoney.zhang@autech.one',
  nickname: 'fasf',
  qrCode: ''
});

// 初始化
const fetchData = async (qr: string) => {
  try {
    const res = await userApi.getCheckTransferCode({ qrCode: qr }, headers);
    if(res.code == 200){
      // accountInfo.value = res.data;
      accountInfo.value.qrCode = decodeURIComponent(qr);
    }else{
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化数据
onMounted(() => {
  isPage.value = route.query.isPage;
  fetchData(route.query.qrCode);
})

</script>
<style scoped>
.page {
}
.btn-wrap{
  margin-top: 20px;
  display: flex;
  .custom-button-down {
    margin-left: 10px;
  }
}

.avatar-header-wrap{
  position: relative;
  .avatar{
    .el-image{ width: 100%; }
    Width: 90px;
    Height: 90px;
    margin-right: 10px;
  }
  p{
    line-height: 30px;
    font-size: 18px;
    margin: 0;
    padding: 0;
    color: #0D0D0D;
    span{
      font-size: 16px;
      color: #999999;
      font-weight: normal;
    }
  }
}
</style>
