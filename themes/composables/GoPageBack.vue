<template>
  <div class="history-wrap">
    <!-- 左侧返回按钮 -->
    <button class="left-button" @click="goBack">
      <el-icon size="20"> <ArrowLeftBold /> </el-icon>
    </button>
    <!-- 中间文本 -->
    <div class="middle-text" v-if="title">
      <span v-html="titleText"></span>
    </div>
    <!-- 右侧按钮 -->
    <el-button
        v-if="buttonConfig && Object.keys(buttonConfig).length"
        :class="['right-button', buttonConfig.type]"
        @click="() => goList()">
      {{ buttonConfig.btnName }}
      <el-image v-if="buttonConfig.type === 'pay'" :src="pay" />
      <el-image v-if="buttonConfig.type === 'collect'" :src="collect" />
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
import collect from "@@/public/images/Group.svg";
import pay from "@@/public/images/Group2.svg";


const props = defineProps({
  buttonConfig: {
    type: Object,
    default: () => ({})
  },
  title: {
    type: String,
    default: ''
  },
  showScan: {
    type: Boolean,
    default: false
  },
  goBackTo: {
    type: String,
    default: ''
  }
});
const titleText = ref('');

//历史记录跳转
const router = useRouter();
const goBack = () => {
  if (props.goBackTo) {
    router.replace(props.goBackTo);
  } else {
    router.back();
  }
};

// 实时更新
watchEffect(() => {
  if (props.title) {
    if (props.title.includes('||')) {
      const beforeDelimiter = props.title.split('||')[0].trim();
      const afterDelimiter = props.title.split('||')[1].trim();
      titleText.value = `<span style='display: block;'>${beforeDelimiter}</span><span style='display: block; font-size: 12px;'>${afterDelimiter}</span>`;
    } else {
      titleText.value = props.title;
    }
  }
});

// 按钮跳转
const goList = () => {
  if (props.buttonConfig.navigateTo) {
    router.push(props.buttonConfig.navigateTo);
  }
};
</script>

<style lang="less" scoped>
.history-wrap {
  height: 46px;
  width: 100%;
  margin: 0 0 18px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}

.left-button {
  border: 0;
  width: 34px;
  height: 34px;
  border-radius: 17px;
  background-color: #f4f4f4;
}

.middle-text {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #333333;
}

.scan-wrap {
  width: 46px;
  height: 46px;
  background: #F4F4F4;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.right-button {
  margin-top: 4px;
  height: 34px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  line-height: 34px;
  padding: 0 15px;
  border: 0;
  display: flex;
  .el-image {
    margin-top: 22px;
    width: 11px;
    margin-left: 5px;
  }
}
.right-button.default{
  background: #5686E1;
  color: #fff;
}
.right-button.pay {
  background: #FFD862;
  color: #333333;
}

.right-button.collect {
  background: #5686E1;
  color: #fff;
}


</style>
