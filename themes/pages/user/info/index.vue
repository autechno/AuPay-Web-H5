<template>
  <div class="page">
    <div class="form-container">
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
      <div class="header-text">
        <div>邮箱：{{ form.email }}</div>
        <div>用户类型：{{ form.userType == 0 ? '注册用户' : '系统用户' }}</div>
        <div>用户等级: VIP{{ form.userLevel }}</div>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <!-- 昵称 -->
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <!-- 生日 -->
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
              v-model="form.birthday"
              type="date"
              placeholder="请选择生日"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <!-- 性别 -->
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option :key="1" label="男" :value="1" />
            <el-option :key="2" label="女" :value="2" />
          </el-select>
        </el-form-item>
        <!-- 国家 -->
        <el-form-item label="国家" prop="country">
          <el-select v-model="form.country" placeholder="请选择国家">
            <el-option v-for="item in countryList" :key="item.code31662" :label="item.officialNameCn" :value="item.code31662" />
          </el-select>
        </el-form-item>
        <!-- 个性签名 -->
        <el-form-item label="个性签名" prop="sign">
          <el-input v-model="form.sign" type="textarea" :rows="2" placeholder="请输入个性签名" />
        </el-form-item>
        <!-- auPay收款码 -->
        <el-form-item label="auPay收款码"  prop="transferQR">
          <el-input v-model="form.transferQR" placeholder="auPay收款码" />
          <el-button size="small" @click="copyText(form.transferQR)">复制</el-button>
          <el-button size="small" @click="showQrDialog = true">二维码</el-button>
        </el-form-item>
        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存</el-button>
        </el-form-item>
      </el-form>
      <el-dialog v-model="showQrDialog" style="height: 500px; width: 500px">
        <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
          <QCcode :value="form.transferQR" :size="300" />
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import { rules } from "@/utils/validationRules";
import { copyText } from "@/utils/funcUtil";
import type { UploadProps } from 'element-plus';
import QCcode from "@/composables/QCcode.vue";
const { public: { API_HOST } } = useRuntimeConfig();
const countryList = ref([]);
const headers = getHeader();
const { userApi, systemApi } = useServer();
const showQrDialog = ref(false);

// 表单数据
const form = ref({
  email: "",
  userType: 0,
  userLevel: 0,
  nickname: "",
  headPortrait: "",
  birthday: "",
  sex: 1,
  country: "",
  sign: "",
  transferQR: ''
});


// 文件上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200) {
    form.value.headPortrait = response.data.imageUrl;
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

// 提交表单
const handleSubmit = async () => {
  try {
    const res = await userApi.setUserInfo(form.value, headers);
    if (res.code === 200) {
      ElMessage.success('保存成功');
    } else {
      ElMessage.error(res.message || '保存失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 获取初始化信息
const fetchData = async () => {
  try {
    const [userInfoRes, countryListRes] = await Promise.all([
      userApi.getUserInfo({}, headers),
      systemApi.getCountryList({}, headers)
    ]);
    // 用户信息
    if (userInfoRes.code === 200) {
      form.value = userInfoRes.data;
      // 设置默认头像
      if (!userInfoRes.data.headPortrait) {
        form.value.headPortrait = '/image/header.png';
      }
    }
    // 国家列表
    if (countryListRes.code === 200) {
      countryList.value = countryListRes.data;
    } else {
      ElMessage.error(countryListRes.message || '获取国家列表失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 128px;
  height: 128px;
  display: block;
  border-radius: 128px;
}

.header-text {
  height: 60px;
  display: flex;
  justify-content: space-between;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>
