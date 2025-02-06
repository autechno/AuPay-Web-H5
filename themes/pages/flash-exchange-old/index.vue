<template>
  <div class="page">
    <GoBack :showRightButton="false" />
    <div class="content">
      <div class="exchange-container" style="height: 126px;">
        <div class="title">兑出</div>
        <div class="currency">22,684.02</div>
        <el-row class="flash-btn">
          <el-col :span="8"><span>50%</span></el-col>
          <el-col :span="8"><span>100%</span></el-col>
        </el-row>
        <div class="box-wrap" @click="exchange(1)">
          <div class="img"></div>
          <div class="text-wrap">BTC</div>
          <el-icon size="12" class="icon"> <ArrowDownBold /> </el-icon>
        </div>
      </div>
      <div class="button"><el-image :src="fx" /> </div>
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

    <el-drawer class="custom-title" v-model="drawerSearch"
               :title="title"
               :show-close="false"
               direction="btt"
               size="85%">
      <div class="sub-page">
        <div class="search-wrap">
          <el-icon class="arrow" size="26"><Search /></el-icon>
          <input v-model="searchText" placeholder="搜索" class="custom-input" />
        </div>
        <div class="table-list">
          <div class="item" >
            <div class="left-column"> <div class="currency-wrap"></div> </div>
            <div class="right-column">
              <div class="currency">0.00</div>
              <p class="row"><span class="title">ETC</span></p>
              <p class="row"><span class="text">Ethereum</span></p>
            </div>
          </div>
        </div>
      </div>

    </el-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import fx from '@@/public/images/fx.svg';
import GoBack from "@/composables/GoBack.vue";
import {ArrowDownBold,  Search} from "@element-plus/icons-vue";
const drawerSearch = ref(false);
const searchText = ref('');
const title = ref('兑出');
const dialogSource = ref({
  1: {name: '兑出', id: 1},
  2: {name: '兑入', id: 2},
});
const exchange = (type: number) => {
  console.log(dialogSource.value[type].name)
  title.value = dialogSource.value[type].name
  drawerSearch.value = true;
}
</script>

<style lang="less" scoped>
*{
  margin:0;
  padding: 0;
}
.page{
  position: relative;
  height: calc(100vh - 18px);
}

.content{
  margin-top:18px;
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
    margin-top: 16px;
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
    margin-top: 8px;
  }
  .box-wrap{
    font-size: 14px;
    width: 110px;
    height: 34px;
    line-height: 34px;
    border-radius: 8px;
    color: #0D0D0D;
    background: #F4F4F4;
    position: absolute;
    top: 45px;
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

.sub-page{

}
.search-wrap{
  height: 40px;
  padding-right: 10px;
  border: #C8DCE8 solid 3px;
  border-radius: 16px;
  position: relative;
  display: flex!important;
  .arrow{
    height: 23px;
    width: 28px;
    margin-top: 8px;
    margin-left: 10px;
    margin-right:5px;
    color: #E3E3E3;
  }
  .custom-input::placeholder {
    color: #E3E3E3;
  }
  .custom-input{
    border: 1px #ffffff solid;
    height: 30px;
    line-height: 32px;
    margin-top: 4px;
    font-size: 18px;
    overflow: hidden;
    width: 100%;
  }
}
/deep/ .el-drawer {
  --el-drawer-padding-primary: 15px 20px 0 20px;
}
/deep/ .el-drawer__header{
  margin-bottom: 0;
  position: relative;
}
/deep/ .el-drawer__body{
  position: relative;
  top: -5px;
}
/deep/ .el-drawer__title {
  color: #0D0D0D;
  font-size: 16px;
}

.table-list{
  position: relative;
  margin-top: 40px;
  .item{
    display: flex;
    height: 52px;
    padding: 10px 0;
    border-bottom: 1px solid #f1f1f1;
    overflow: hidden;
  }
}
.left-column {
  width: 48px;
  height: 48px;
  .currency-wrap{
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
    border-radius: 50%;
  }
}
.right-column {
  padding-left: 10px;
  flex: 1;
  padding-top: 5px;
  justify-content: flex-start;
  flex-direction: column;
  position: relative;
  .currency{
    height: 100%;
    line-height: 48px;
    color: #666666;
    text-align: right;
    position: absolute;
    right: 0;
    top:0;
  }
  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
    .title {
      font-weight: bold;
      font-size: 16px;
    }
    .text {
      color: #6E6E6E;
    }
  }
}

</style>
