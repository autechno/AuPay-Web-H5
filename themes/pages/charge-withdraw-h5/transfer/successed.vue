<template>
  <div class="page">
    <GoBack />
    <div class="success-page">
      <div class="title-box-wrap">
        <div class="title-wrap">付款至</div>
        <div class="title-item">
          <el-icon><el-image :src="assets.toLogo ? assets.toLogo : head" /></el-icon>
          <div class="column">
            <div class="title">{{assets.toNikeName?assets.toNikeName:qrCode}}</div>
            <div class="text" v-if="assets.toSign">{{assets.toSign}}</div>
            <div class="remark" v-if="remark">留言：{{remark}}</div>
          </div>
        </div>
      </div>
      <div :class="['trade-tips', statusClass]">
        <span class="trade-status"><el-image :src="statusImage" /></span>
        <p class="trade-text">{{ getStatusText(assets.status, 'ACCOUNT') }}</p>
      </div>
      <div class="text-wrap">
        您已向<span style="color: #F36A35">{{assets.toNikeName?assets.toNikeName:qrCode}}</span>成功转账{{assets.toAmount}} {{getDataInfo(assets.toCurrencyId, 'currencyChains')?.name}}请及时关注账户变动
      </div>
      <div style="font-size: 20px; text-align: center"> {{countdown}}秒回返回</div>
      <el-button class="custom-button custom-button-pos" @click="jumpPage">确认</el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import { useRoute, useRouter } from 'vue-router';
import head from '@@/public/images/head.svg';
import {formatCurrency, getDataInfo, getStatusText} from "@/utils/formatUtils";
import {ElMessage} from "element-plus";
import {getHeader} from "@/utils/storageUtils";
const headers = getHeader();
const router = useRouter();
const route = useRoute();
const countdown = ref(3)
const { assetsApi, userApi } = useServer();
import s1 from '@@/public/images/s1.svg';
import s2 from '@@/public/images/s2.svg';
import s3 from '@@/public/images/s3.svg';

// 消息数据
const recordId = ref(0);
const assets = ref({
  toLogo: '',
  status: '',
  toNikeName: '',
  toAmount: '',
  toCurrencyId: '',
  toSign: '',
});
const statusMap = {
  1: { percentage: 50, image: s2, class: 's1' },
  2: { percentage: 100, image: s1, class: 's2' },
  3: { percentage: 100, image: s3, class: 's3' },
};
const remark = ref("");
const qrCode = ref("");
//跳到充值首页
const jumpPage = () => {
  window.location.href = "/charge-withdraw-h5/transfer/pay";
}
// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.accountAssetsDetail({recordId: recordId.value}, headers);
    if (res.code === 200) {
      assets.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};


// 计算状态类
const statusClass = computed(() => {
  return statusMap[assets.value.status]?.class || '';
});

// 计算状态图标
const statusImage = computed(() => {
  return statusMap[assets.value.status]?.image || '';
});

const startCountdown = (duration) => {
  countdown.value = duration; // 设置初始倒计时
  const intervalId = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
    } else {
      clearInterval(intervalId);
      jumpPage(); // 倒计时结束后跳转
    }
  }, 1000);
  onBeforeUnmount(() => {
    clearInterval(intervalId);
  });
};

// 初始化数据
onMounted(() => {
  recordId.value = route.query.id;
  remark.value = route.query.remark;
  qrCode.value = route.query.qr;
  fetchData();
  // 启动倒计时，设置为3秒
  startCountdown(3);
});
</script>

<style lang="less" scoped>

*{
  margin: 0;
  padding: 0;
}
.input-amount-wrap{
  height: 49px;
  margin-top: 49px;
  .input-wrap{
    border: 0 !important;
    text-align: center;
    height: 49px;
    line-height: 49px;
    width: 100%;
    font-size: 36px;
    color: #0D0D0D;
  }
  .input-wrap::placeholder{
    font-size: 28px;
  }
}
.row-title{
  height: 25px;
  line-height: 25px;
  font-size: 16px;
  color: #0D0D0D;
  margin-top: 28px;
  margin-bottom: 80px;
  text-align: center;
}
.row-text{
  line-height: 40px;
  color: #333333;
  font-size: 14px;
}
.title-box-wrap {
  position: relative;
  .title-wrap{
    padding-top: 6px;
    color: #0D0D0D;
    line-height: 24px;
    font-size: 14px;
  }
  padding-bottom: 20px;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.table-title{
  font-size: 16px;
  color: #333333;
}
.title-item{
  margin-top: 16px;
  height: 46px;
  display: flex;
  .title{
    line-height: 20px;
    color: #333333;
    height: 22px;
  }
  .text{
    line-height: 16px;
    color: #999999;
    font-size: 12px;
    height: 16px;
    overflow: hidden;
  }
  .remark{
    font-size: 12px;
    color: #333333;
    height: 16px;
    line-height: 16px;
    margin-top: 10px;
  }
  .el-icon{
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
    height: 46px;
    width: 46px;
  }
}

.success-page{
  .trade-tips{
    padding: 90px 0 35px 0;
    text-align: center;
    .trade-status{
      display: inline-block;
      width: 46px;
      height: 46px;
      border-radius: 40%;
    }
    .trade-text{
      padding: 8px;
      font-size: 16px;
      font-weight: bold;
    }
  }
  .text-wrap{
    padding: 30px 50px 50px 50px;
    text-align: center;
    font-size: 12px;
    line-height: 20px;
  }
  .s2 {
    .trade-status{
      background: #5686E1;
    }
    color: #5686E1;
  }
  .s1 {
    .trade-status{
      background: #98E175;
    }
    color: #333333;
  }
  .s3 {
    .trade-status{
      background: #676B6D;
    }
    color: #676B6D;
  }
}

</style>
