<template>
  <div class="page">
    <GoBack :buttonConfig="buttonConfig" />
    <div class="sub-page">
      <div class="title-box-wrap">
        <div class="title-wrap">付款至</div>
        <div class="title-item">
          <el-icon><el-image :src="Scan" /></el-icon>
          <div class="column">
            <div class="title">3432323</div>
            <div class="text">Life be beautiful like summer …</div>
          </div>
        </div>
      </div>
      <div class="search-wrap">
        <input v-model="searchText" placeholder="auPay ID" class="custom-input" />
        <el-icon><el-image :src="Scan" /></el-icon>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import Scan from '@@/public/images/Scan3.svg';
import {ArrowRightBold, Search} from "@element-plus/icons-vue";
import {formatCurrency, getDataInfo} from "@/utils/formatUtils";

const router = useRouter();
const route = useRoute();
const searchText = ref('');

const form = ref({

})
const buttonConfig = ref({
  navigateTo: '/charge-withdraw-h5/transfer',
  btnName: '收款',
  type: 'pay',
})

// 初始化数据
onMounted(() => {
});
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.title-box-wrap {
  position: relative;
  .title-wrap{
    padding-top: 30px;
    color: #0D0D0D;
    line-height: 24px;
    font-size: 14px;
  }
  padding-bottom: 28px;
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
.search-wrap{
  margin-bottom: 20px;
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
  font-size: 16px;
  color: #333333;
}
.title-item{
  margin-top: 20px;
  height: 46px;
  display: flex;
  .title{
    line-height: 20px;
    color: #333333;
    height: 20px;
  }
  .text{
    line-height: 12px;
    color: #999999;
    font-size: 12px;
    height: 14px;
    overflow: hidden;
  }
  .el-icon{
    height: 46px;
    width: 46px;
  }


}
</style>
