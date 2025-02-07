<template>
  <div class="history-wrap">
    <button class="left-button" @click="goBack">
      <el-icon size="20"> <ArrowLeftBold /> </el-icon>
    </button>
    <el-button
        v-if="showRightButton"
        class="right-button"
        @click="() => goList(navigateTo)">
      查看订单
    </el-button>
    <el-button
        v-if="showRightButton"
        class="right-button"
        @click="() => goList(navigateTo)">
      查看订单
    </el-button>
    <div class="avatar" v-if="showScan">
      <el-image :src="scan" class="scan" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftBold } from "@element-plus/icons-vue";
import scan from "@@/public/images/Scana.svg";

const props = defineProps({
  showRightButton: {
    type: Boolean,
    default: false
  },
  navigateTo: {
    type: String,
    default: ''
  },
  showScan: {  // 新增 avatarSrc prop
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const goBack = () => {
  router.back();
};

const goList = (navigateTo: string) => {
  if (navigateTo) {
    router.push(navigateTo);
  }
};
</script>

<style>
.history-wrap {
  height: 46px;
  width: 100%;
  margin: 0 0 18px 0;
  display: flex;
  justify-content: space-between;
}

.left-button {
  border: 0;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #f4f4f4;
  margin-top: 8px;
}

.avatar{
  width: 46px;
  height: 46px;
  background: #F4F4F4;
  text-align: center;
  border-radius: 50%;
  .scan{
    padding-top: 10px;
  }
}
.right-button {
  margin-top:5px;
  background: #5686E1;
  width: 90px;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  color: #fff;
  border: 0;
}
</style>
