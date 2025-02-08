<template>
  <div class="page">
    <GoBack :buttonConfig="buttonConfig" />
    <div class="box-wrap">
      <div class="title">收款</div>
      <div class="text"  @click="copyText(form.transferQR)">auPayID: {{formatAddressString(form.transferQR, 8, 14)}}<el-image :src="copy" /></div>
      <div class="code-wrap">
        <QCcode :value="form.generateQR" :size="180" />
      </div>
      <div class="select-wrap" v-if="form.currencyId == ''">
        <div class="select" @click="isDrawerVisible = true">编辑收款<el-icon size="12"><ArrowRightBold /></el-icon></div>
      </div>
      <div class="select-wrap" v-else>
        <div class="select">
          <button class="btn">编辑</button><button class="btn">清除</button>
        </div>
      </div>
    </div>
    <el-drawer class="custom-drawer" v-model="isDrawerVisible"
               title=""
               :show-close="false"
               @close="handleCloseDrawer"
               direction="rtl"
               size="100%">
      <GoClose @close="handleCloseDrawer" />
      <div class="icon-edit-wrap">
        <div class="icon-edit"><el-image :src="Shape"></el-image></div>
      </div>
    </el-drawer>
    <el-button class="custom-button-down" >分享</el-button>
    <el-button class="custom-button-down-default">下载</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import GoClose from "@/composables/GoPageClose.vue";
import { useRoute, useRouter } from 'vue-router';
import {ElMessage} from "element-plus";
import copy from "@@/public/images/copy2.svg";
import Shape from "@@/public/images/Shape2.svg";
import {copyText, formatAddressString} from "@/utils/funcUtil";
import QCcode from "@/composables/QCcode.vue";
import {ArrowRightBold, Search} from "@element-plus/icons-vue";
const isDrawerVisible = ref(false);
const handleCloseDrawer = () => {
  isDrawerVisible.value = false;
};
const { assetsApi } = useServer();
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const form = ref({
  transferQR: '',
  generateQR: '',
  currencyId: '',
  currencyChainId: '',
  amount: '',
  remark: '',
})
const buttonConfig = ref({
  navigateTo: '/order-list',
  btnName: '付款',
  type: 'pay',
})

// 获取数据
const fetchData = async () => {
  try {
    const assetsRes = await assetsApi.getAccountAssetsById({ assetsId: 987 }, headers);
    if (assetsRes.code === 200) {
    }else{
      ElMessage.error(assetsRes.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  form.value.transferQR = userStore.userInfo.transferQR;
  form.value.generateQR = userStore.userInfo.transferQR;
});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.select-wrap{
  height: 26px;
  line-height: 26px;
  text-align: center;
  margin: 15px 0;
  .select{
    font-size: 18px;
    color: #333333;
    .btn{
      font-size: 14px;
      background: #FFEEEE;
      border:0;
      width: 56px;
      height: 23px;
      border-radius: 8px;
      line-height: 14px;
      margin:0 5px;
    }
    .el-icon{
      margin-left: 3px;
      border: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #EAF3FA;
    }
  }
}
.code-wrap{
  margin: 0 auto;
  width: 250px;
  height: 250px;
  text-align: center;
  canvas{
    margin-top: 35px;
  }
}
.box-wrap{
  background: #ffffff;
  margin-top:18px;
  text-align: center;
  padding-bottom: 35px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .title{
    padding: 25px 20px 3px 20px;
    height: 41px;
    line-height: 41px;
    overflow: hidden;
    font-size: 24px;
    color: #0D0D0D;
  }
  .text{
    padding: 0 20px;
    font-size: 16px;
    color: #0D0D0D;
    display: inline-flex;
    .el-image{
      margin-left: 3px;
      margin-top: 3px;
      height: 16px;
    }
  }
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .custom-button-down{
    position: fixed;
    bottom: 90px;
    left: 50%;
    width: 85%;
    transform: translate(-50%);
  }
  .custom-button-down-default{
    position: fixed;
    bottom: 35px;
    left: 50%;
    width: 85%;
    transform: translate(-50%);
  }
  /deep/ .el-drawer__header{
    text-align: center;
    padding:40px;
    margin: 0;
    .el-drawer__title{
      font-size: 20px;
      font-weight: bold;
      color: #333333;
    }
  }
  /deep/ .el-drawer__body{
    color: #333333;
    font-size: 18px;
    text-align: center;
    line-height: 35px;
    padding: 0 40px;
  }
}
.icon-edit-wrap{

}
.icon-edit{
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #5686E1;
  .el-image{
    width: 20px;
    margin-top: 6px;
  }
}
</style>
