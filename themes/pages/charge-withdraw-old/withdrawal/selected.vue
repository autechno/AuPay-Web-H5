<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="true"  />
    <div class="tips">至</div>
    <div class="sub-page">
      <div class="search-wrap">
        <input v-model="addressText" placeholder="请填写地址" class="custom-input" />
        <div class="select-address" @click="selectAddress"><el-icon class="icon" size="10" ><CloseBold /></el-icon> 选地址</div>
      </div>
      <div class="copy-list">
        <div class="item"><el-image :src="clip" class="icon" /><span class="text">5asdkfjaioiuoiuoiu……t4u8</span></div>
      </div>
    </div>
    <el-button @click="nextTick()" class="custom-button" >下一步</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import {getHeader} from "@/utils/storageUtils";
import clip from '@@/public/images/ClipBoard.svg'
import {CloseBold} from "@element-plus/icons-vue";
const route = useRoute();
const currencyId = ref('');
const addressText = ref('');
const dialogDrawer = ref(false);
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const nextTick = () => {

}
const selectAddress = () => {
  router.push({ path: '/charge-withdraw-old/withdrawal/address', query: { currencyId:  currencyId.value } });
}
// 初始化数据
onMounted(() => {
  currencyId.value = route.query.currencyId;
});
</script>

<style lang="less" scoped>

*{
  margin: 0;
  padding: 0;
}
.tips{
  height: 22px;
  color: #0D0D0D;
  margin-top: 15px;
}
.copy-list{
  padding-top: 30px;
  .item{
    height: 56px;
    line-height: 56px;
    border-radius: 16px;
    background: #F1F1F1;
    padding:0 14px;
    display: flex;
    .icon{
      width: 26px;
      height: 30px;
      margin-top: 12px;
      margin-right: 5px;
    }
    .text{
      color: #353955;
    }
  }
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
  .custom-button{
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translate(-50%);
  }
}

.sub-page{
  padding-top:10px;
  padding-bottom: 20px;
  position: relative;
}
.chain-wrap{
  height: 50px;
  padding: 20px 0 ;
  .text-wrap{
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color: #666666;
  }
  .list-chain-wrap {
    .cur{
      border-color: #5686E1 !important;
    }
    width: 100%;
    height: 30px;
    margin-top: 5px;
    .item{
      height: 28px;
      width: 28px;
      margin-right: 10px;
      border: #C8DCE8 solid 1px;
      border-radius: 8px;
      background: #ffffff;
      text-align: center;
      .img{
        margin-top: 4px;
        width: 18px;
        height: 18px;
      }
    }
    .btn{
      font-size: 12px;
      text-align: center;
      height: 28px;
      line-height: 28px;
      width: 33px;
      border-radius: 8px;
      background: #ffffff;
      border: #C8DCE8 solid 1px;
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

.table-list{
  position: relative;
  margin-top: 5px;
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
