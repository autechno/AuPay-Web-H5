<template>
  <div class="page">
    <GoBack :buttonConfig="buttonConfig" :goBackTo="'/assets-account-h5'" />
    <div class="box-wrap">
      <div class="title-tips"><span class="btn">收款</span></div>
      <div class="tips-text"  @click="copyText(form.transferQR)">auPayID: {{formatAddressString(form.transferQR, 8, 14)}}<el-image :src="copy" /></div>
      <div class="code-wrap">
        <QCcode :value="form.generateQR" :size="180" />
        <el-image class="arrow top-left" :src="arrow" />
        <el-image class="arrow top-right" :src="arrow" />
        <el-image class="arrow bottom-left" :src="arrow" />
        <el-image class="arrow bottom-right" :src="arrow" />
      </div>
      <div class="select-wrap" v-if="form.currencyId == ''">
        <div class="select" @click="drawerVisible = true">编辑收款<el-icon size="12"><ArrowRightBold /></el-icon></div>
      </div>
      <div class="select-wrap" v-else>
        <div class="select">
          <button class="btn" @click="drawerVisible = true">编辑</button><button class="btn" @click="cleanQR">清除</button>
          <div class="row-wrap" style="margin-top: 10px;"><span class="text">币种：</span><span>{{getDataInfo(form.currencyId, 'currencyChains')?.name}}</span></div>
          <div class="row-wrap"><span class="text">网络：</span><span>{{getDataInfo(form.currencyChain, 'currencyChains')?.name}}</span></div>
          <div class="row-wrap"><span class="text">数量：</span><span>{{formatCurrency(form.amount)}}</span></div>
          <div class="row-wrap"><span class="text">备注：</span><span>{{formatAddressString(form.remark, 4, 8)}}</span></div>
        </div>
      </div>
    </div>
    <div class="tips-wrap">编辑收款功能仅能编辑“二维码”auPayID不受编辑影响</div>
    <el-drawer class="custom-drawer" v-model="drawerVisible"
         title=""
         :show-close="false"
         @close="drawerVisible = false"
         direction="rtl"
         size="100%">
      <GoClose @close="drawerVisible = false" />
      <div class="icon-edit-wrap">
        <div class="icon-edit"><el-image :src="Shape"></el-image></div>
      </div>
      <div class="title"> 编辑收款 </div>
      <TransferForm
          style="margin-top: 20px;"
          :form="form"
          @update:form="updateForm"
      />
    </el-drawer>
    <button class="custom-button-down" @click="shareVisible = true">分享</button>
    <button class="custom-button-down-default">下载</button>
    <Share
        v-if="shareVisible"
        :generateQR="form.generateQR"
        :transferQR="form.transferQR"
        type="collect"
        @close="shareVisible = false" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import GoClose from "@/composables/GoPageClose.vue";
import Share from "@/composables/Share.vue";
import { useRoute, useRouter } from 'vue-router';
import copy from "@@/public/images/copy2.svg";
import Shape from "@@/public/images/Shape2.svg";
import {copyText, formatAddressString} from "@/utils/funcUtil";
import QCcode from "@/composables/QCcode.vue";
import {ArrowRightBold} from "@element-plus/icons-vue";
import TransferForm from "@/composables/TransferForm.vue";
import {formatCurrency, getDataInfo} from "~/utils/configUtils";
import arrow from '@@/public/images/arrow-right.svg';
const drawerVisible = ref(false);
const shareVisible = ref(false);
// 更新父组件的 form 数据
const updateForm = (newForm: any) => {
  form.value = newForm;
  drawerVisible.value = false;
  console.log(newForm);
};
const router = useRouter();
const route = useRoute();
const form = ref({
  transferQR: '',
  generateQR: '',
  currencyId: '',
  currencyChain: '',
  amount: '',
  remark: '',
})
const buttonConfig = ref({
  navigateTo: 'pay',
  btnName: '付款',
  type: 'pay',
})
// 清空表单
const cleanQR = () => {
  form.value.generateQR = form.value.transferQR;
  form.value.currencyId = '';
  form.value.currencyChain = '';
  form.value.amount = '';
  form.value.remark = '';
};
// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  form.value.transferQR = userStore.userInfo.transferQR;
  form.value.generateQR = userStore.userInfo.transferQR;
});
</script>
<style lang="less" scoped>
.code-wrap{
  width: 250px;
  height: 250px;
  margin: 33px auto 0 auto;
}

.tips-wrap {
 color:  #FD6B2E;
  line-height: 20px;
  text-align: center;
  background-color: #FFEEEE;
  padding: 6px 20px;
  font-size: 12px;
  border-radius: 8px;
  margin-top: 11px;
}
.select-wrap{
  line-height: 26px;
  text-align: center;
  margin: 44px 0 20px 0;
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
  .row-wrap{
    line-height: 26px;
    height: 26px;
    display: flex;
    width: 50%;
    margin:0 auto;
    font-size: 14px;
    overflow: hidden;
    color: #0D0D0D;
    justify-content: space-between;
    .text{
      font-size: 13px;
      color: #999999;
    }
  }
}
.box-wrap{
  background: #ffffff;
  margin-top:18px;
  text-align: center;
  padding-bottom: 35px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .title-tips{
    padding: 25px 20px 6px 20px;
    text-align: center;
    color: #333333;
    .text{
      font-size: 16px;
    }
    .btn{
      height: 48px;
      line-height: 48px;
      font-size: 24px;
      background: #EAF3FA;
      border-radius: 16px;
      display: inline-block;
      width: 226px;
      height: 100%
    }
  }
  .tips-text{
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
  height: 54px;
  display: flex;
  align-items: flex-end;
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
}

</style>
