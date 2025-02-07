<template>
  <div class="page">
    <GoBack :showRightButton="false"  :showScan="false"   />
    <div class="tips">至</div>
    <div class="sub-page">
      <div class="search-wrap">
        <input v-model="addressText" placeholder="请填写地址" class="custom-input" />
        <div class="select-address" @click="resetBtn"><span class="icon"><el-image :src="shape" /></span> 编辑</div>
      </div>
      <div class="input-amount-wrap">
        <input v-model="form.amount" @input="" />
      </div>
    </div>
    <el-button @click="submit" class="custom-button" >确认</el-button>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoBack.vue";
import {getHeader} from "@/utils/storageUtils";
import shape from '@@/public/images/Shape.svg'



const route = useRoute();
const currencyId = ref('');
const addressText = ref('');
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const form = ref({
  amount: 0,
})
// 确认提现
const submit = () => {
}
// 回退
const resetBtn = () => {

}

// 初始化数据
onMounted(() => {
  currencyId.value = route.query.currencyId;
  addressText.value = route.query.address;
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
.page{
  position: relative;
  margin-top: 28px;
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
  .select-address{
    font-size: 14px;
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
    .el-image{
      position: relative;
      top: 2px;
      width: 14px;
      height: 14px;
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
