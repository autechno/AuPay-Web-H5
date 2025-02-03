<template>
  <div class="page">
    <GoBack />
    <div class="content">
      <div class="exchange-container" style="height: 126px;">
        <div class="title">兑出</div>
        <div class="currency">22,684.02</div>
        <el-row class="flash-btn">
          <el-col :span="8"><span>50%</span></el-col>
          <el-col :span="8"><span>100%</span></el-col>
        </el-row>
        <div class="select-wrap">
          <div class="img"></div>
          <div class="text-wrap">BTC</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
      <div class="button"><img :src="fx" /> </div>
      <div class="exchange-container" style="height: 90px; margin-top:12px;">
        <div class="title">兑入</div>
        <div class="currency">22,684.02</div>
      </div>
    </div>
    <div class="tips">
      <span>前兑换汇率：</span>
      <span>1 TOTO ≈ 0.2 OZC</span>
    </div>
    <div class="tips">
      <span>费用：</span>
      <span>10 USDT</span>
    </div>
      <el-button class="custom-button" native-type="submit">确认</el-button>
  </div>
</template>
<script setup lang="ts">
import fx from '@@/public/images/fx.svg';
import GoBack from "@/composables/GoBack.vue";
import {ArrowDownBold} from "@element-plus/icons-vue";

</script>

<style lang="less" scoped>
.page{
  position: relative;
  height: calc(100vh - 18px);
}
.content{
  padding-bottom: 20px;
  position: relative;
  .button{
    position: absolute;
    top: 118px;
    left: 50%;
    transform: translate(-50%);
    width: 34px;
    height: 34px;
    border-radius: 34px;
    background: #ffffff;
    border: 3px #C8DCE8 solid;
    display: flex;
    justify-content: center;
    align-items: center;
    .button img {
      max-width: 16.5px;
    }
  }
}

.exchange-container {
  border-radius: 16px;
  background: #ffffff;
  border: 3px #C8DCE8 solid;
  padding-left: 16px;
  .title {
    font-size: 14px;
    margin-top: 18px;
  }
  .flash-btn{
    margin-top: 15px;
    width: 42%;
    span{
      display: block;
      width: 46px;
      height: 24px;
      font-size: 12px;
      border-radius: 12px;
      line-height: 24px;
      text-align: center;
      color: #333333;
      background: #EAF3FA;
    }
  }
  .currency{
    font-size: 20px;
    line-height: 22px;
    overflow: hidden;
    font-weight: bold;
    margin-top: 5px;
  }
  .select-wrap{
    font-size: 14px;
    width: 110px;
    height: 34px;
    line-height: 34px;
    border-radius: 6px;
    color: #0D0D0D;
    background: #F4F4F4;
    position: absolute;
    top: 50px;
    right: 10px;
    display: flex;
    align-items: center;
    overflow: hidden;
    .img {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: #D8D8D8 2px solid;
      margin: 5px;
      flex-shrink: 0;
    }
    .text-wrap {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon {
      width: 22px;
      flex-shrink: 0;
    }
  }
}

.tips{
  line-height: 30px;
  margin-top: 5px;
  width: 100%;
  color: #666666;
  font-size: 16px;
  display: flex;
  justify-content: space-between;
}
.custom-button{
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translate(-50%);
}
</style>
