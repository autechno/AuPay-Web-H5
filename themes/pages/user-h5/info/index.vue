<template>
  <div class="page">
    <GoPageBack />
    <div class="avatar-header">
      <div style="display: flex; ">
        <el-icon class="avatar"><el-image :src="userInfo.headPortrait ? userInfo.headPortrait : head" /></el-icon>
        <p style="margin-top: 8px;">
          <span class="name" style="margin-top: 0;">{{userInfo.nickname?userInfo.nickname:userInfo.email}}</span>
          <span class="sign">{{userInfo.sign}}</span>
        </p>
      </div>
      <el-upload class="edit"><el-image :src="edit" /></el-upload>

      <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headers"
          :action="`${API_HOST}/aupay-message/ticket/upload`"
      >
        <img :src="form.headPortrait" class="avatar" />
      </el-upload>

    </div>
    <div class="table-list">
      <div class="title-wrap">用户信息（{{type}}）</div>
      <div class="text-wrap"><span class="title">用户类型</span><span >{{userInfo.userType == 0 ? '注册用户' : '系统用户'}}</span></div>
      <div class="text-wrap"><span class="title">用户等级</span><span><span class="box-wrap">VIP{{userInfo.userLevel}}</span><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">昵称</span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">生日</span><span>{{userInfo.birthday}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">性别</span><span>{{ userInfo.sex == 1 ? '男' : userInfo.sex == 2 ? '女' : '' }}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">个性签名</span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">用户管理</div>
      <div class="text-wrap"><span class="title">auPay收款码</span><span>{{formatAddressString(userInfo.transferQR, 16, 16)}}<el-icon><ArrowRightBold /></el-icon></span></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import head from '@@/public/images/head.svg';
import edit from '@@/public/images/edit1.svg';
import { useRouter, useRoute } from 'vue-router';
import {ArrowRightBold} from "@element-plus/icons-vue";
import GoPageBack from "@/composables/GoPageBack.vue";

const headers = getHeader();
const router = useRouter();
const type = ref("个人")
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
  position: relative;
  height: 66px;
  .avatar{
    .el-image{ width: 100%; }
    Width: 66px;
    Height: 66px;
  }
  .edit{
    width: 26px;
    height: 26px;
    background: #5686E1;
    display: inline-flex;
    border-radius: 50%;
    position: absolute;
    left: 40px;
    bottom: 0px;
    .el-image{
      width: 14px;
      height: 14px;
    }
  }
}
.table-list{
  padding-top: 10px;
  div{
    display: flex;
    justify-content: space-between;
    height: 38px;
    line-height: 38px;
    margin: 15px 0;
  }
  .text-wrap{
    padding-left: 9px;
    color: #666666;
    font-size: 14px;
    .title{
      font-size: 16px;
      font-weight: bold;
    }
  }
  .el-icon{
    margin-left: 5px;
    position: relative;
    top: 2px;
  }
  .box-wrap{
    width: 42px;
    height: 22px;
    display: inline-block;
    background: #FDC92E;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    line-height: 22px;
    color: #fff;
  }
  .title-wrap{
    color: #999999;
  }
}
</style>
