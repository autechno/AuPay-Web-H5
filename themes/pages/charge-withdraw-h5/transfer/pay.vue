<template>
  <div class="page">
    <GoBack :buttonConfig="buttonConfig" :goBackTo="'/assets-account-h5'" />
    <div class="sub-page">
      <div class="title-box-wrap">
        <div class="title-wrap">付款给</div>
      </div>
      <el-form :model="form" @submit.prevent="handleSubmit">
        <div class="search-wrap">
          <input v-model="form.transferQR" placeholder="auPay ID" class="custom-input" @blur="validateTransferQR" />
          <el-icon ><el-image :src="scan" /></el-icon>
        </div>
        <div class="error-message"><span v-if="errorMessage" >{{ errorMessage }}</span></div>
        <div class="copy-list" v-if="copyList.length">
          <div class="item" v-for="item in copyList" :key="item" @click="copyToAddress(item)">
            <el-image :src="clip" /><span class="text">{{ formatAddressString(item, 28, 35) }}</span>
          </div>
        </div>
        <div v-if="contactList.length">
          <div class="table-title"><span>最近转账用户</span> <div class="more"><el-image :src="addressbook" />通讯录</div></div>
          <div class="table-list">
            <div class="item" v-for="(item, index) in contactList" @click="copyToAddress(item.transferQrcode)">
                <el-icon><el-image :src="item.accountLogo ? item.accountLogo : head" /></el-icon>
                <div class="column">
                  <div class="title">{{item.nickname}}</div>
                  <div class="text"><span>{{formatEmailString(item.email)}}</span><span>auPay ID: {{formatAddressString(item.transferQrcode, 7, 15)}}</span></div>
                </div>
              </div>
          </div>
        </div>
        <el-form-item>
          <button class="custom-button custom-button-pos" native-type="submit">下一步</button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import scan from '@@/public/images/Scan3.svg';
import head from '@@/public/images/head.svg';
import clip from "@@/public/images/ClipBoard.svg";
import addressbook from "@@/public/images/addressbook.svg";
import {ElMessage} from "element-plus";
import {showCatchErrorMessage} from "~/utils/messageUtils";
import {getDataInfo} from "~/utils/configUtils";
import {formatAddressString, formatEmailString} from "~/utils/funcUtil";

const { userApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const errorMessage = ref('');
const copyList = ref([]);
// 通讯录列表
const contactList = ref([]);
const form = ref({
  transferQR: "",
})
const contactForm = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
  }
})
// 读取剪贴板内容并添加到 copyList
const readClipboard = async () => {
  try {
    const text: string = await navigator.clipboard.readText(); // 读取剪贴板文本
    if (text) {
      copyList.value.push(text); // 将读取的内容添加到 copyList
    }
  } catch (err) {
    console.error('无法读取剪贴板内容:', err);
    showErrorMessage(0, '请确保您已允许访问剪贴板');
  }
};
// 检查剪贴板是否有内容
const checkClipboardContent = async () => {
  try {
    const text = await navigator.clipboard.readText();
    return text.trim() !== ''; // 返回内容是否非空
  } catch (err) {
    console.error('无法检查剪贴板内容:', err);
    return false;
  }
};
// 复制填充地址
const copyToAddress =  (address: any) => {
  form.value.transferQR = address.replace(/\s+/g, '');
};
// 表单验证
const validateTransferQR = () => {
  const length = form.value.transferQR.length;
  // 检查输入是否为空
  if (length === 0) {
    errorMessage.value = "请输入auPay收款码";
    return;
  }
  errorMessage.value = '';
};
// 确认按钮的处理
const handleSubmit = async () => {
  validateTransferQR();
  try{
    if(!errorMessage.value){
      const res = await userApi.getCheckTransferCode({ qrCode: form.value.transferQR }, headers);
      if(res.code == 200){
        router.push({ path: 'selected', query: { qr: encodeURIComponent(form.value.transferQR) } });
      }else{
        showErrorMessage(res.code, res.message)
      }
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};
// 跳转配置信息
const buttonConfig = ref({
  navigateTo: 'collect',
  btnName: '收款',
  type: 'collect',
})


// 获取数据
const fetchData = async () => {
  try {
    let res = await userApi.queryAccountContact(contactForm.value, headers);
    if (res.code == 200) {
      contactList.value = res.data.records;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化数据
onMounted(async() => {
  const hasContent = await checkClipboardContent();
  if (hasContent) {
    await readClipboard();
  }
  if(route.query.qrCode){
    form.value.transferQR = decodeURIComponent(route.query.qrCode);
  }
  fetchData();
});
</script>

<style lang="less" scoped>
.copy-list{
  padding-top: 10px;
  padding-bottom: 20px;
  .item{
    overflow: hidden;
    margin-bottom: 10px;
    height: 56px;
    line-height: 56px;
    border-radius: 16px;
    background: #F1F1F1;
    padding:0 14px;
    display: flex;
    .el-image{
      width: 18px;
      height: 26px;
      margin-top: 14px;
      margin-right: 5px;
    }
    .text{
      width: calc(100vw - 70px);
      overflow: hidden;
      color: #353955;
    }
  }
}
.title-box-wrap {
  position: relative;
  .title-wrap{
    padding-top: 30px;
    color: #0D0D0D;
    line-height: 24px;
    font-size: 24px;
    text-align: center;
  }
  padding-bottom: 28px;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.error-message{
  color:red;
  font-size: 12px;
  padding-left: 15px;
  height: 20px;
  line-height: 20px;
  overflow: hidden;
}
.search-wrap{
  height: 40px;
  padding: 5px 15px;
  background: #ffffff;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .custom-input::placeholder {
    color: #E3E3E3;
    font-size: 16px;
  }
  .el-icon{
    width: 45px;
    height: 45px;
    position: absolute;
    right: 5px;
    top: 2px;
  }
  .el-image{
    width: 24px;
  }
  .custom-input{
    width: calc(100vw - 150px);
    border: 1px #ffffff solid;
    height: 30px;
    color: #353955;
    line-height: 32px;
    margin-top: 4px;
    font-size: 16px;
    overflow: hidden;
  }
}
.table-title{
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
  .more{
    font-size: 12px;
    .el-image{
      margin-right: 5px;
      position: relative;
      top: 3px;
      width: 14px;
      height: 15px;
    }
  }
}
.table-list{
  .item{
    margin-top: 20px;
    height: 40px;
    display: flex;
    .column{
      width: 100%;
      .title{
        line-height: 20px;
        color: #333333;
        height: 20px;
      }
      .text{
        display: flex;
        justify-content: space-between;
        line-height: 16px;
        color: #999999;
        font-size: 12px;
        height: 16px;
        overflow: hidden;
      }
    }
  }
  .el-icon{
    margin-top:2px;
    height: 34px;
    width: 34px;
    margin-right: 5px;
  }
}
</style>
