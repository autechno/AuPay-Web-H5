<template>
  <div class="ad-wrap">
    <div class="box-wrap">
      <div class="title-tips">
        <span class="text" v-if="type === 'pay'">仅支持在Ethereum上的OZC充值</span>
      </div>
      <div class="code-wrap">
        <QCcode :value="generateQR" :size="180" />
        <el-image class="arrow top-left" :src="arrow" />
        <el-image class="arrow top-right" :src="arrow" />
        <el-image class="arrow bottom-left" :src="arrow" />
        <el-image class="arrow bottom-right" :src="arrow" />
      </div>
      <div class="tips-text" v-if="type === 'collect'"> auPayID: {{transferQR}} </div>
      <div class="hr"></div>
      <div class="website-code-wrap">
        <div class="website">
          <el-image :src="LOGO"/>
          <p>{{website}}</p>
        </div>
        <div class="code"><QCcode :value="website" :size="72" /></div>
      </div>
    </div>
    <div class="footer-wrap">
      <button @click="close" class="custom-button-down-default">取消</button>
      <button class="custom-button-down">分享</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import QCcode from "./QCcode.vue";
import LOGO from "@@/public/images/LOGO.svg";
import arrow from '@@/public/images/arrow-right.svg';

const props = defineProps({
  generateQR: String,
  transferQR: String,
  type: String,
});
const website = ref('auPay.com/en')
const emit = defineEmits(['close']);
const close = () => {
  emit('close');
};
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.ad-wrap {
  background: rgba(0, 0, 0, 0.5);
  width: 100vw;
  height: 100vh;
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  .website-code-wrap{
    display: flex;
    justify-content: space-between;
    height: 110px;
    .website{
      font-size: 16px;
      color: #333333;
      text-align: left;
      padding-top: 32px;
      .el-image{
        width: 88px;
        margin-bottom: 5px;
      }
    }
    .code{
      margin-top: 22px;
      background: #5686E1;
      border-radius: 8px;
      width: 72px;
      height: 72px;
      padding: 4px;
    }
  }
  .hr{
    border-bottom: 2px dashed #5686E1;
    height: 40px;
  }
  .title{
    color: #353955;
    font-size: 16px;
    line-height: 22px;
    padding: 5px 20px;
  }
}
.code-wrap{
  width: 250px;
  height: 250px;
  margin: 0 auto;
}
.footer-wrap {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #ffffff;
  height: 100px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  display: flex;
  align-items: center;
  .el-button {
    flex: 1;
    margin-left: 30px;
  }
  .el-button:last-child {
    margin-right: 30px;
  }
}
.box-wrap{
  margin: 20% 20px 20px 20px;
  padding: 20px 15px;
  background: #ffffff;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  .title-tips{
    text-align: center;
    color: #333333;
    padding:25px;
    .text{
      line-height: 22px;
      display: block;
      padding:0 20px 25px 20px;
      font-size: 16px;
    }
  }
  .tips-text{
    margin-top: 25px;
    padding: 0 20px;
    font-size: 16px;
    color: #5686E1;
  }
}
</style>
