<template>
  <div class="page">
    <div class="page-content">
      <div class="exchange-container" style="height: 126px;">
        <div class="title">兑出</div>
        <div class="currency">22,684.02</div>
        <el-row class="flash-btn">
          <el-col :span="8"><span>25%</span></el-col>
          <el-col :span="8"><span>50%</span></el-col>
          <el-col :span="8"><span>100%</span></el-col>
        </el-row>
      </div>
      <div class="button"><img :src="fx" /> </div>
      <div class="exchange-container" style="height: 90px; margin-top:12px;">
        <div class="title">兑入</div>
        <div class="currency">22,684.02</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import fx from '@@/public/images/fx.svg';

</script>

<style lang="less" scoped>
.page-content{
  position: relative;
}

.exchange-container {
  border-radius: 16px;
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
}

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
</style>
