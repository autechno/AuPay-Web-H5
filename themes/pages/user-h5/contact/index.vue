<template>
  <div class="page">
    <GoPageBack />
    <div class="avatar-header-wrap">
      <div style="display: flex; ">
        <el-icon class="avatar"><el-image :src="accountInfo.accountLogo ? accountInfo.accountLogo : head" /></el-icon>
        <div style="margin-top: 8px;">
          <p >{{accountInfo.nickname}}</p>
          <p v-if="accountInfo.qrCode"><span>auPay ID: </span>{{formatAddressString(accountInfo.qrCode, 8, 10)}}</p>
          <p >{{formatEmailString(accountInfo.email)}}</p>
          <p >{{accountInfo.sign}}</p>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <button v-if="isSave" class="custom-button-down-default" @click="deleteContact">删除</button>
      <button v-else class="custom-button-down" style="margin-right: 15px;" @click="addContact">添加</button>
      <button class="custom-button-down"  style="margin-left: 15px;" @click="jumpPage('/charge-withdraw-h5/transfer/pay', {qr: originQr})">付款给他</button>
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
const isSave = ref(false);
const originQr = ref('');
const { userApi, systemApi } = useServer();
const accountInfo = ref({
  id: '',
  accountId: '',
  accountName: '',
  accountNo: '',
  accountLogo: '',
  sign: "",
  email: '',
  nickname: '',
  qrCode: ''
});

// 添加
const addContact = async () => {
  try {
    const headers = getHeader();
    const res = await userApi.addAccountContact({ qrcode: accountInfo.value.qrCode }, headers);
    if(res.code == 200){
      showSuccessMessage(0, '删除成功');
      goBackDelay(router, "list");
    }else{
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 跳转
const jumpPage = (url: string, params: any) =>{
  router.push({path: url, query: params});
}

// 删除
const deleteContact = async () => {
  try {
    const headers = getHeader();
    const res = await userApi.removeAccountContact({ id: accountInfo.value.id }, headers);
    if(res.code == 200){
      showSuccessMessage(0, '删除成功');
      goBackDelay(router, "list");
    }else{
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化
const fetchData = async (qr: string) => {
  try {
    const headers = getHeader();
    const [transferCodeRes, accountContactRes] = await Promise.all([
      userApi.getCheckTransferCode({ qrCode: qr }, headers),
      userApi.queryAccountContact({
        pageNo: 1,
        pageSize: 100,
        conditions: {
          qrCode: qr
        }
      }, headers)
    ]);
    if(accountContactRes.code == 200){
      if( accountContactRes.data.records.length > 0){
        isSave.value = true;
        accountInfo.value.id = accountContactRes.data.records[0].id;
      }
    }else{
      showErrorMessage(accountContactRes.code, accountContactRes.message)
    }
    if(transferCodeRes.code == 200){
      accountInfo.value = transferCodeRes.data;
      accountInfo.value.qrCode = qr;
    }else{
      showErrorMessage(transferCodeRes.code, transferCodeRes.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化数据
onMounted(() => {
  originQr.value = route.query.qrCode
  fetchData(decodeURIComponent(route.query.qrCode));
})

</script>
<style scoped>
.page {
}
.btn-wrap{
  margin-top: 30px;
  display: flex;
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
