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
      <div class="title-wrap">用户信息（{{userType}}）</div>
      <div class="text-wrap"><span class="title">用户类型</span><span >{{userInfo.userType == 0 ? '注册用户' : '系统用户'}}</span></div>
      <div class="text-wrap"><span class="title">用户等级</span><span><span class="box-wrap">VIP{{userInfo.userLevel}}</span><el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('nickname', '昵称')"><span class="title">昵称<i class="tips">（本月可维护{{userInfo.propsModifyVO.nickname}}次）</i></span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('birthday', '生日')"><span class="title">生日<i class="tips">（可修改{{userInfo.propsModifyVO.birthday}}次）</i></span><span>{{userInfo.birthday}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('sex', '性别')"><span class="title">性别</span><span>{{ userInfo.sex == 1 ? '男' : userInfo.sex == 2 ? '女' : '' }}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('sign', '个性签名')"><span class="title">个性签名</span><span>{{userInfo.sign}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="text-wrap"  @click="editForm('country', '国家')"><span class="title">国家</span><span>{{userInfo.countryName}}<el-icon><ArrowRightBold /></el-icon></span></div>
      <div class="title-wrap">用户管理</div>
      <div class="text-wrap"  @click="editForm('transferQR', 'auPay收款码')"><span class="title">auPay收款码<i class="tips">（可修改{{userInfo.propsModifyVO.transferQr}}次）</i></span><span>{{formatAddressString(userInfo.transferQR, 10, 12)}}<el-icon><ArrowRightBold /></el-icon></span></div>
    </div>
    <el-drawer class="custom-drawer" v-model="drawerVisible"
               title=""
               :show-close="false"
               @close="drawerVisible = false"
               direction="rtl"
               size="100%">
      <GoClose :title="title" @close="drawerVisible = false" />
      <el-form :model="userInfo" :rules="rules" class="custom-input" ref="formRef" @submit.prevent="handleSubmit">
        <el-form-item prop="name"  v-if="currentField === 'nickname'" >
          <el-input v-model="userInfo.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="" prop="birthday" v-if="currentField === 'birthday'" >
          <el-date-picker
              v-model="userInfo.birthday"
              type="date"
              placeholder="请选择生日"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item prop="" v-if="currentField === 'sex'" >
          <el-select v-model="userInfo.sex" placeholder="请选择性别">
            <el-option :key="1" label="男" :value="1" />
            <el-option :key="2" label="女" :value="2" />
          </el-select>
        </el-form-item>
        <!-- 国家 -->
        <el-form-item label="" v-if="currentField === 'country'" >
          <el-select v-model="userInfo.country" placeholder="请选择国家">
            <el-option v-for="item in countryList" :key="item.code31662" :label="item.officialNameCn" :value="item.code31662" />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="sign"  v-if="currentField === 'sign'" >
          <el-input v-model="userInfo.sign" type="input" :rows="2" placeholder="请输入个性签名" />
        </el-form-item>
        <el-form-item label=""  prop="transferQR" v-if="currentField === 'transferQR'" >
          <el-input  v-model="userInfo.transferQR" placeholder="auPay收款码" />
        </el-form-item>
        <button class="custom-button custom-button-pos" native-type="submit">保存</button>
      </el-form>
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
import {ElForm, ElMessage, type UploadProps} from 'element-plus';
import GoPageBack from "@/composables/GoPageBack.vue";
import GoClose from "@/composables/GoPageClose.vue";
import {rules} from "@/utils/validationRules";


const countryList = ref([]);
const currentField = ref('');
const { public: { API_HOST } } = useRuntimeConfig();
const drawerVisible = ref(false);
const title = ref("");
const headers = getHeader();
const userType = ref("")
const { userApi, systemApi } = useServer();
const userInfo = ref({
  email: "",
  userType: 0,
  userLevel: 0,
  nickname: "",
  headPortrait: "",
  birthday: "",
  sex: '',
  country: "",
  countryName: "",
  sign: "",
  transferQR: '',
  propsModifyVO: {
    nickname: 0,
    birthday: 0,
    transferQr: 0
  }
})
const formRef: any = ref(null);
const editForm = (key: string, name: string) => {
  if(key == 'nickname' && userInfo.value.propsModifyVO.nickname == 0){
    return ;
  }
  if( key == 'birthday' && userInfo.value.propsModifyVO.birthday == 0){
    return ;
  }
  if(key == 'transferQR' && userInfo.value.propsModifyVO.transferQr == 0){
    return ;
  }
  title.value = name;
  currentField.value = key;
  drawerVisible.value = true;
}


// 初始化
const fetchData = async () => {
  try {
    const [userInfoRes, countryListRes] = await Promise.all([
      userApi.getUserInfo({}, headers),
      systemApi.getCountryList({}, headers)
    ]);
    if (userInfoRes.code === 200) {
      userInfo.value = userInfoRes.data;
      if(userInfo.value.sex == 0){
        userInfo.value.sex = ''
      }
      userInfo.value.countryName = userInfo.value.country;
      userType.value = userInfoRes.data.userType == 0?'个人':'企业';
    }else{
      showErrorMessage(userInfoRes.code, userInfoRes.message)
    }
    if (countryListRes.code === 200) {
      countryList.value = countryListRes.data;
      if(userInfo.value.country){
        userInfo.value.countryName = countryList.value.find(item => item.code31662 == userInfo.value.country)?.officialNameCn;
      }
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 提交表单
const handleSubmit = async () => {
  try{
    let params = {};
    params[currentField.value] = userInfo.value[currentField.value]
    const res = await userApi.setUserInfo(params, headers);
    if (res.code == 200) {
      const userStore = UseUserStore();
      let isSuccess = await userStore.fetchUserInfo();
      if(isSuccess){
        showSuccessMessage(0, '保存成功');
      }
    } else {
      showErrorMessage(res.code, res.message)
    }
    drawerVisible.value = false;
  } catch (error) {
    drawerVisible.value = false;
    showCatchErrorMessage()
  }
};

// 文件上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200) {
    userInfo.value.headPortrait = response.data.imageUrl;
    currentField.value = 'headPortrait';
    handleSubmit();
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

.custom-input{
  padding-top: 70px;
  :deep(.el-input){
    width: 100%;
    height: 56px;
    border-radius: 16px;
    font-size: 16px;
    border: 0;
  }
  :deep(.el-select__wrapper) {
    height: 56px;
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.el-input__prefix){
    display: none;
  }
  :deep(.el-input__wrapper) {
    border-radius: 16px;
    border: 3px #C8DCE8 solid;
  }
  :deep(.checkbox__label){
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error){
    padding-left: 14px;
  }
  :deep(.el-checkbox__label){
    font-weight: normal !important;
  }
  :deep(.el-radio){
    margin-right: 15px;
  }
  :deep(.el-radio__label){
    padding-left: 5px;
  }
  :deep(.el-form-item__label){
    color: #0D0D0D !important;
  }
  :deep(.el-radio__label){
    color: #0D0D0D !important;
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
    .tips{
      font-size: 12px;
      color: #F36A35;
      font-weight: normal;
      font-style: normal;
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
