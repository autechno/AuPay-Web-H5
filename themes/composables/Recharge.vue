<template>
  <div class="container">
    <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit" v-if="activeStepId == 1">
      <div style="margin: 0 auto; width: 40%;">
        <el-form-item label="" prop="tokenProtocol">
          <el-select v-model="form.tokenProtocol" placeholder="请选择代币协议">
            <el-option
                v-for="protocol in tokenProtocols"
                :key="protocol.value"
                :label="protocol.label"
                :value="protocol.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择币种">
            <el-option
                v-for="currency in currencies"
                :key="currency.value"
                :label="currency.label"
                :value="currency.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </div>
      <div class="social-login">
        <el-button type="primary" native-type="submit">确认生成收款码</el-button>
      </div>
    </el-form>
    <div v-if="activeStepId == 2">
      <img :src="qrCodeSrc" alt="QR Code" />
      <p @click="copyText(url)" class="copyable-text">{{ url }}</p>
      <div class="social-login">
        <el-button type="primary" @click="jumpUrl">生成图片</el-button>
      </div>
    </div>
    <div v-if="activeStepId == 3">
      <img :src="qrCodeSrc" alt="QR Code" />
      <p @click="copyText(url)" class="copyable-text">{{ url }}</p>
      <!-- Avatar Upload -->
      <el-upload
          class="avatar-uploader"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          :show-file-list="false"
          :on-success="handleAvatarSuccess('avatar')"
          :before-upload="beforeUpload"
      >
        <el-avatar v-if="form.avatarUrl" :src="form.avatarUrl" :size="80" />
        <template v-else> <el-avatar :size="80" :src="circleUrl" /> </template>
      </el-upload>

      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleSubmit">
        <div style="margin: 0 auto; width: 40%;">
          <el-form-item label="" prop="name">
            <el-input v-model="form.name" placeholder="请输入名称" />
          </el-form-item>
          <el-upload
              action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
              :show-file-list="false"
              :on-success="handleAvatarSuccess('background')"
              :before-upload="beforeUpload"
          >
            <img v-if="form.backgroupdUrl" :src="form.backgroupdUrl" class="background" />
            <template v-else> <span>上传背景图片（800*1024）</span> <el-button >上传</el-button> </template>
          </el-upload>

          <el-form-item label="" prop="text">
            <el-input v-model="form.text" placeholder="请输入说明文本" />
          </el-form-item>
          <div class="social-login">
            <el-button type="primary" native-type="submit">确认</el-button>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElNotification, ElMessage } from 'element-plus';
const circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png');
const route = useRoute();
const formRef: any = ref(null);
const url = ref('https://example.com/qr-code-link');
const qrCodeSrc = ref('https://via.placeholder.com/150');
const activeStepId = ref(route.query.stepId || 1);

const form = reactive({
  tokenProtocol: 'protocolA',
  currency: 'BTC',
  name: '',
  backgroupdUrl: '',
  avatarUrl: 'https://via.placeholder.com/150',
  text: '',
});

const rules = {
  tokenProtocol: [{ required: true, message: '请选择代币协议', trigger: 'change' }],
  currency: [{ required: true, message: '请选择币种', trigger: 'change' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  text: [{ required: true, message: '说明文本不能为空', trigger: 'blur' }],
};

const tokenProtocols = [
  { label: '协议A', value: 'protocolA' },
  { label: '协议B', value: 'protocolB' },
  { label: '协议C', value: 'protocolC' },
];

const currencies = [
  { label: '比特币', value: 'BTC' },
  { label: '以太坊', value: 'ETH' },
  { label: '莱特币', value: 'LTC' },
];

// 复制二维码连接
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      title: '成功',
      message: '链接已复制到剪贴板!',
      type: 'success',
      duration: 2000,
    });
  }).catch(err => {
    console.error('Error copying text: ', err);
  });
};

// 表单提交
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if(activeStepId.value === 1){
        // 成功跳转
      }else if(activeStepId.value === 2){
        // 成功跳转
      }else if(activeStepId.value === 3){

      }
      console.log(activeStepId);
      jumpUrl();
    } else {
      console.error('输入无效');
    }
  });
};

onMounted(() => {

});


// 转跳当前URL
const jumpUrl = () => {
  const nextStepId = parseInt(activeStepId.value) + 1;
  window.location.href = '/charge-withdraw?typeId=0&stepId=' + nextStepId;
};

// 图片上传成功处理
const handleAvatarSuccess = (type: 'avatar' | 'background') => (response, uploadFile) => {
  if (type === 'avatar') {
    form.avatarUrl = URL.createObjectURL(uploadFile.raw!);
  } else if (type === 'background') {
    form.backgroupdUrl = URL.createObjectURL(uploadFile.raw!);
  }
};
// 图片验证
const beforeUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('图片必须为 JPG 格式!');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};
</script>

<style scoped>
.container{
  text-align: center;
  width: 40%;
  margin: 0 auto;
}
.social-login {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.avatar {
  width: 50px;
  height: 50px;

}
</style>