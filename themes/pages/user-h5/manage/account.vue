<template>
  <div class="page">
    <GoPageBack />
    <div class="table-list">
      <div class="title-wrap">账号信息</div>
      <div class="text-wrap"><span class="title">账号</span><span>{{accountInfo.email}}</span></div>
      <div class="text-wrap" @click="jumpPage('password', {name: '登录密码', permissionId: 3})"><span class="title">登录密码</span><span><i class="setting">设置</i><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap" @click="jumpPage('password', {name: '交易密码', permissionId: 2})"><span class="title">交易密码</span><span><i class="setting">设置</i><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">第三方授权</div>
      <div class="text-wrap"><span class="title">Google登录</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">Apple登录</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">Apple登录</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">验证器</div>
      <div class="text-wrap"><span class="title">Google验证器</span><span>未绑定<el-icon><ArrowRightBold /></el-icon></span></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import {ArrowRightBold} from "@element-plus/icons-vue";
import GoPageBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { public: { API_HOST } } = useRuntimeConfig();
const headers = getHeader();
const { userApi, systemApi } = useServer();
const accountInfo = ref({
  email: "",
})

// 跳转URL
const jumpPage= (url: string, query: any) => {
  router.push({ path: url, query: query });
}

// 初始化
const fetchData = async () => {
  try {
    const userInfoRes = await userApi.getUserInfo({}, headers);
    if (userInfoRes.code === 200) {
      accountInfo.value = userInfoRes.data;
    }else{
      showErrorMessage(userInfoRes.code, userInfoRes.message)
    }
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
}

.table-list{
  div{
    display: flex;
    justify-content: space-between;
    height: 38px;
    line-height: 38px;
    margin: 15px 0;
  }
  .title-wrap{
    font-size: 16px;
    color: #333333;
    font-weight: 500;

  }
  .text-wrap{
    padding-left: 9px;
    color: #666666;
    font-weight: normal;
    font-size: 16px;
    .title{
      font-weight: 600;
      font-size: 16px;
    }
    .setting{
      color: #5686E1;
      font-style: normal;
    }
    .el-icon{
      margin-left: 5px;
      position: relative;
      top: 2px;
    }
  }

}
</style>
