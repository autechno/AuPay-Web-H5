<template>
  <div class="page">
    <div class="avatar-header">
      <span>
        <el-icon class="avatar" style="float: left"><el-image :src="userInfo.headPortrait ? userInfo.headPortrait : head" /></el-icon>
        <p class="name">{{userInfo.nickname?userInfo.nickname:userInfo.email}}</p>
        <p class="sign">{{userInfo.sign}}</p>
      </span>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import head from '@@/public/images/head.svg';
import { useRouter, useRoute } from 'vue-router';

const headers = getHeader();
const router = useRouter();
const { userApi, systemApi } = useServer();
const userInfo = ref({})

// 初始化
const fetchData = async () => {
  try {
    const res = await userApi.getUserInfo({}, headers);
    if(res.code === 200) {
      userInfo.value = res.data;
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
.avatar-header{
  height: 66px;
  .name{
    line-height: 22px;
    margin-top: 0px;
  }
  .avatar{
    Width: 46px;
    Height: 46px;
    background: #F4F4F4;
    overflow: hidden;
    border-radius: 50%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sign{
    color: #999999;
    font-size: 14px;
    padding-left: 5px;
  }
}
</style>
