<template>
  <div class="history-wrap">
    <!-- 左侧返回按钮 -->
    <button class="left-button" @click="goBack">
      <el-icon size="20"> <ArrowLeftBold /> </el-icon>
    </button>
    <!-- 中间文本 -->
    <div class="middle-text">{{ title }}</div>
    <!-- 右侧按钮 -->
    <el-button
        v-if="buttonConfig"
        class="right-button"
        @click="() => goList()">
      {{buttonConfig.btnName}}
      <el-image  v-if="buttonConfig.type == 'pay'" :src="pay" />
    </el-button>

    <div class="scan-wrap" v-if="showScan">
      <el-image :src="scan" class="scan" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftBold } from "@element-plus/icons-vue";
import scan from "@@/public/images/Scana.svg";
import pay from "@@/public/images/Group.svg";

const props = defineProps({
  buttonConfig: {
    type: Object,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  showScan: {
    type: Boolean,
    default: false
  }
});

const router = useRouter();

const goBack = () => {
  router.back();
};

const goList = () => {
  if (props.buttonConfig.navigateTo) {
    router.push(props.buttonConfig.navigateTo);
  }
};

const scanPage = () => {
  // 执行扫码的逻辑
};
</script>

<style lang="less" scoped>
.history-wrap {
  height: 46px;
  width: 100%;
  margin: 0 0 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center; /* 垂直居中对齐 */
}

.left-button {
  border: 0;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #f4f4f4;
  margin-top: 8px;
}

.middle-text {
  flex: 1;
  text-align: center;
  font-size: 16px;
}

.scan-wrap {
  width: 46px;
  height: 46px;
  background: #F4F4F4;
  text-align: center;
  border-radius: 50%;
  .scan {
    padding-top: 10px;
  }
}
.right-button {
  margin-top: 5px;
  background: #5686E1;
  height: 34px;
  border-radius: 15px;
  font-size: 14px;
  font-weight: 600;
  line-height: 34px;
  padding:0 15px;
  color: #fff;
  border: 0;
  display: inline-flex;
  .el-image{
    margin-top: 20px;
    margin-left: 3px;
  }
}
</style>
