<template>
  <div class="form-container">
    <el-upload
        class="avatar-uploader"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
        :headers="headers"
        action="/app/v1/aupay-message/ticket/upload"
    >
      <img v-if="form.headPortrait" :src="form.headPortrait" class="avatar" />
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
        <el-select v-model="form.sex" placeholder="请选择国家">
          <el-option :key="1" label="男" :value="1" />
          <el-option :key="2" label="女" :value="2" />
        </el-select>
      </el-form-item>

      <!-- 国家 -->
      <el-form-item label="国家" prop="country">
        <el-select v-model="form.country" placeholder="请选择国家">
          <el-option v-for="item in countryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 个性签名 -->
      <el-form-item label="个性签名" prop="sign">
        <el-input v-model="form.sign" type="textarea" :rows="2" placeholder="请输入个性签名" />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </el-form-item>
    </el-form>


    <el-form-item label="auPay收款码">
      <el-input v-model="form.transferQR" placeholder="auPay收款码" />
      <el-button size="small" @click="copyText(form.transferQR)">复制</el-button>
      <el-button size="small" @click="editCode">修改</el-button>
      <el-button size="small" @click="showQrDialog = true">二维码</el-button>
    </el-form-item>
    <el-dialog v-model="showQrDialog" style="height: 500px; width: 500px">
      <div style="display: flex; justify-content: center; align-items: center; height: 100%;">
        <QCcode :value="form.transferQR" :size="300" />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { getHeader } from "@/utils/storageUtils";
import type { UploadProps } from 'element-plus';
import QCcode from "@/composables/QCcode.vue";
const headers = getHeader();
const { userApi } = useServer();
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

// 表单验证
const rules = {
  nickname: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  sign: [{ required: true, message: "请输入个性签名", trigger: "blur" }],
  birthday: [{ required: true, message: "请选择生日", trigger: "change" }],
  country: [{ required: true, message: "请选择国家", trigger: "change" }],
};

// 国家选项
const countryOptions = [
  { label: "中国", value: "China" },
  { label: "美国", value: "USA" },
];

// 文件上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.code === 200) {
    form.value.headPortrait = response.data.imageUrl;
  }
};

// 文件上传验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('头像图片必须为 JPG 格式!');
    return false;
  }
  return true;
};

// 复制方法
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '成功',
      message: '链接已复制到剪贴板!',
      type: 'success',
      duration: 2000,
    });
  }).catch(err => {
    console.error('复制文本时出错: ', err);
  });
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

// 编辑二维码
const editCode = async () => {
  try {
    let str = form.value.transferQR;
    const qrCodePattern = /^[a-zA-Z0-9]{7,20}$/;
    if (!qrCodePattern.test(str)) {
      ElMessage.warning('二维码格式不正确。请确保是7-20位的数字和字母（大小写）');
      return;
    }
    const res = await userApi.setTransferCode({qrCode: str}, headers);
    if (res.code === 200) {
      ElMessage.success('修改成功');
    } else {
      ElMessage.error(res.message || '修改失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 获取初始化信息
const fetchData = async () => {
  try {
    const res = await userApi.getUserInfo({}, headers);
    if (res.code === 200) {
      form.value = res.data;
      if(!res.data.headPortrait){
        form.value.headPortrait = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png';
      }
    } else {
      ElMessage.error(res.message || '查询失败');
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
