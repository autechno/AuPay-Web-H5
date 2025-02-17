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
      <el-upload
          class="edit"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="headers"
          :action="`${API_HOST}/aupay-message/ticket/upload`"
          :limit="1"
          accept="image/*"
      >
        <el-icon>
          <el-image :src="edit" />
        </el-icon>
      </el-upload>
    </div>
    <div class="table-list">
      <div class="title-wrap">用户信息（{{type}}）</div>
      <div class="text-wrap"><span class="title">用户类型</span><span >{{userInfo.userType == 0 ? '注册用户' : '系统用户'}}</span></div>
      <div class="text-wrap"><span class="title">用户等级</span><span><span class="box-wrap">VIP{{userInfo.userLevel}}</span><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('sign')"><span class="title">昵称</span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">生日</span><span>{{userInfo.birthday}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">性别</span><span>{{ userInfo.sex == 1 ? '男' : userInfo.sex == 2 ? '女' : '' }}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"><span class="title">个性签名</span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">用户管理</div>
      <div class="text-wrap"><span class="title">auPay收款码</span><span>{{formatAddressString(userInfo.transferQR, 16, 16)}}<el-icon><ArrowRightBold /></el-icon></span></div>
    </div>
    <el-drawer class="custom-drawer" v-model="drawerVisible"
               title=""
               :show-close="false"
               @close="drawerVisible = false"
               direction="rtl"
               size="100%">
      <GoClose  @close="drawerVisible = false" />

    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import head from '@@/public/images/head.svg';
import edit from '@@/public/images/edit1.svg';
import { useRouter, useRoute } from 'vue-router';
import {ArrowRightBold} from "@element-plus/icons-vue";
import type { UploadProps } from 'element-plus';
import GoPageBack from "@/composables/GoPageBack.vue";
import GoClose from "~/composables/GoPageClose.vue";
const { public: { API_HOST } } = useRuntimeConfig();
const drawerVisible = ref(false);

const headers = getHeader();
const router = useRouter();
const type = ref("个人")
const { userApi, systemApi } = useServer();
const userInfo = ref({
  email: "",
  userType: 0,
  userLevel: 0,
  nickname: "",
  headPortrait: "https://media.vancaro.com/Help/banner-pc-20240701.jpg",
  birthday: "",
  sex: '',
  country: "",
  sign: "",
  transferQR: ''
})

const editForm = (key: string) => {
  console.log(key)
  drawerVisible.value = true;

}

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

// 提交表单
const handleSubmit = async () => {
  try{
    const res = await userApi.setUserInfo({headPortrait: userInfo.value.headPortrait}, headers);
    if (res.code == 200) {
      const userStore = UseUserStore();
      let isSuccess = await userStore.fetchUserInfo();
      if(isSuccess){
        showSuccessMessage(0, '保存成功');
      }
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 文件上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200) {
    userInfo.value.headPortrait = response.data.imageUrl;
    handleSubmit()
  }
};

// 文件上传验证
const beforeAvatarUpload = (rawFile) => {
  const isValidFormat = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(rawFile.type);
  const isValidSize = rawFile.size >= 10 * 1024 && rawFile.size <= 2 * 1024 * 1024; // 10KB to 2MB
  if (!isValidFormat) {
    ElMessage.error('头像图片必须为 JPG, PNG 或 GIF 格式!');
    return false;
  }
  if (!isValidSize) {
    ElMessage.error('头像图片大小必须在 10KB 到 2MB 之间!');
    return false;
  }
  return true;
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
    display: flex;
    border-radius: 50%;
    position: absolute;
    left: 40px;
    bottom: 0px;
    justify-content: center;
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
