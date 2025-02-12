<template>
  <div class="page">
    <GoBack goBackTo="list" :title="titleBar" :showScan="true"  />
    <div class="tips">至</div>
    <div class="sub-page">
      <div class="search-wrap">
        <input v-model="addressText" placeholder="请填写地址" class="custom-input" />
        <div class="select-address" @click="drawerVisible = true"><el-icon class="icon" size="10" ><CloseBold /></el-icon> 选地址</div>
      </div>
      <div class="copy-list">
        <div class="item" v-for="item in copyList" :key="item" @click="copyToAddress(item)">
          <el-image :src="clip" /><span class="text">{{ formatAddressString(item, 28, 35) }}</span>
        </div>
      </div>
    </div>
    <el-button @click="nextTick()" class="custom-button custom-button-pos" >下一步</el-button>
    <el-drawer class="custom-drawer" v-model="drawerVisible"
               title=""
               :show-close="false"
               @close="drawerVisible = false"
               direction="rtl"
               size="100%">
      <Address @select-address="setAddress" :id="assetsId" type="withdrawal" />
    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import clip from '@@/public/images/ClipBoard.svg';
import { CloseBold } from "@element-plus/icons-vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import Address from "../../user-h5/address/selectList.vue";

const router = useRouter();
const route = useRoute();
const assetsId = ref<string>('');
const titleBar = ref();
const addressText = ref('');
const copyList = ref([]);
const drawerVisible = ref(false);
const { assetsApi } = useServer();
const headers = getHeader();

// 读取剪贴板内容并添加到 copyList
const readClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText(); // 读取剪贴板文本
    if (text) {
      copyList.value.push(text); // 将读取的内容添加到 copyList
    }
  } catch (err) {
    console.error('无法读取剪贴板内容:', err);
    ElMessage.error( '请确保您已允许访问剪贴板');
  }
};
// 设置地址
const setAddress = (address) => {
  addressText.value = address;
  drawerVisible.value = false;
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

// 复制到地址文本框
const copyToAddress = (item: string) => {
  addressText.value = item.replace(/\s+/g, '');
};
const nextTick = () => {
  if(!addressText.value){
    showErrorMessage(0, '地址不能为空')
    return;
  }
  // TODO 添加地址验证
  router.push({ path: './', query: { assetsId: assetsId.value, address: encodeURIComponent(addressText.value) } });
};

// 获取数据
const fetchData = async (assetsId: number) => {
  try {
    let res = await assetsApi.getAccountAssetsById({ assetsId:  assetsId }, headers);
    if (res.code == 200) {
      let currencyName = getDataInfo(res.data.currencyId, 'currencyChains')?.name + ' 提款';
      let chainName = getDataInfo(res.data.currencyId, 'chains')?.name;
      titleBar.value = currencyName + "||"+ chainName;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  }
};

// 初始化数据
onMounted(async () => {
  if (route.query.assetsId) {
    assetsId.value = route.query.assetsId;
    await fetchData(assetsId.value);
  }
  if (route.query.address) {
    addressText.value = decodeURIComponent(route.query.address);
  }
  // 粘体板
  const hasContent = await checkClipboardContent();
  if (hasContent) {
    await readClipboard();
  }
});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}

.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .currency-title-bar{
    top: 32px;
    position: absolute;
    text-align: center;
    width: 200px;
    margin: 0 auto;
    color: #333333;
    .title{
      height: 22px;
      line-height: 22px;
    }
    .text{
      font-size: 12px;
      line-height: 16px;
      height: 16px;
    }
  }
  .sub-page{
    padding-top:10px;
    padding-bottom: 20px;
    position: relative;
  }
  .tips{
    height: 22px;
    color: #0D0D0D;
    margin-top: 15px;
  }
  .copy-list{
    padding-top: 30px;
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
}
.search-wrap{
  margin-bottom: 20px;
  height: 40px;
  padding: 5px 15px 5px 15px;
  background: #ffffff;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .custom-input::placeholder {
    color: #E3E3E3;
    font-size: 16px;
  }
  .select-address{
    font-size: 12px;
    line-height: 30px;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 75px;
    height: 30px;
    color: #333333;
    border-radius: 8px;
    background: #EAF3FA;
    text-align: center;
    .icon {
      display: inline-block;
      transform: rotate(45deg);
    }
  }
  .custom-input{
    width: calc(100vw - 150px);
    border: 1px #ffffff solid;
    height: 30px;
    line-height: 32px;
    margin-top: 4px;
    font-size: 18px;
    overflow: hidden;
  }
}

</style>
