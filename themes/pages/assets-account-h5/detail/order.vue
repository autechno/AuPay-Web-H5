<template>
  <div class="page">
    <GoBack :buttonConfig="buttonConfig" />
    <div class="order-wrap">
      <div class="table-title-wrap">
        <div class="title">{{yearText}}年度闪兑单</div>
        <div class="select-wrap">
          <span>{{dateText}}</span>
          <el-icon size="12" class="el-icon--right"><arrow-down-bold /></el-icon>
        </div>
      </div>
      <div class="table-list">
        <div class="item" v-for="item in assetsList" :key="item.id" @click="jumpDetail(item.id)">
          <div class="list">
            <span style="font-size: 20px; ">{{getDataInfo(item.tradeType, 'trade')?.name}}</span>
            <span style="font-size: 14px;" :class="item.tradeType == 1 || item.tradeType == 71|| item.tradeType == 81|| item.tradeType == 91? 'pay' : 'collect'">
                {{ formatCurrency(item.amount) }}
            </span>
          </div>
          <div class="list">
            <span>{{formatDate(item.createTime)}}</span>
            <span>{{getDataInfo(item.currencyChain, 'currencyChains')?.name}}</span>
          </div>
        </div>
      </div>
      <!-- 分页组件 -->
      <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="form.pageSize"
          :current-page="form.pageNo"
          @current-change="handlePageChange" />
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue';
import GoBack from "@/composables/GoPageBack.vue";
import {getHeader} from "@/utils/storageUtils";
import { useRoute, useRouter } from 'vue-router';
import {ArrowDownBold} from "@element-plus/icons-vue";
const {  assetsApi } = useServer()
const headers = getHeader();
const yearText = ref('2025');
const buttonConfig = ref({
  navigateTo: '/flash-exchange-h5/detail/list',
  btnName: '闪兑单',
  type: 'default',
})

// 数据列表
const assetsList = ref([]);
const total = ref(0);

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    currencyId: '',
    currencyChain: '',
    tradeType: '',
  }
})

// 初始化数据
const fetchData = async () => {
  try {
    const res = await assetsApi.accountAssetsList(form.value, headers);
    if (res.code === 200) {
      assetsList.value = res.data.records;
      total.value = res.data.total;
    } else {
      showErrorMessage(res.code, res.message)
    }
  } catch (error) {
    showCatchErrorMessage()
  } finally {
  }
}

const dateText = ref('所有时间');
const dialogDrawer = ref(false);
const datePicker = ref(null);
const handleClose = (done: () => void) => {
  dialogDrawer.value = false;
};
const selectedDate = ref('');
const handleDateChange = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 获取月份并补零
  dateText.value = `${year}${month}`;
  yearText.value = year;
  // 获取当月的第一天
  const startTime = `${year}-${month}-01T00:00:00`;
  // 计算当月最后一天
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
  const endTime = `${year}-${month}-${lastDay}T23:59:59`;

  // 更新表单数据
  form.value.pageNo = 1;
  form.value.conditions.startTime = startTime;
  form.value.conditions.endTime = endTime;
  fetchData();
  nextTick(() => {
    handleClose(); // 关闭抽屉
  });
};

// 处理分页变化
const handlePageChange = (page: number) => {
  form.value.pageNo = page;
  fetchData();
}

// 初始化数据
onMounted(() => {
  fetchData();
})
</script>

<style lang="less" scoped>
*{
  margin: 0;
  padding: 0;
}
.page{
  position: relative;
  padding-top: 28px;
  height: calc(100vh - 28px);
}
.table-title-wrap{
  margin-top: 67px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .title{
    font-size: 16px;
    font-weight: bold;
    color: #0D0D0D;
    line-height: 34px;
  }
  .select-wrap{
    overflow: hidden;
    width: 92px;
    height: 30px;
    line-height: 30px;
    border: 2px solid #C8DCE8;
    border-radius: 8px;
    text-align: center;
    color: #0D0D0D;
    font-size: 14px;
    font-weight: bold;
    :deep(.el-dropdown){
      line-height: 30px;
    }
  }
}
.order-wrap{
  .table-list{
    padding-bottom: 28px;
    .item{
      height: 76px;
      border: #E0EBF2 solid 3px;
      padding: 0 17px;
      border-radius: 16px;
      margin-top: 12px;
      font-size: 12px;
      color: #333333;
      .list{
        display: flex;
        justify-content: space-between;
      }
      .list:first-child{
        padding-top: 14px;
        line-height: 28px;
        padding-bottom: 4px;
      }
      .pay {
        color: #F36A35;
      }
      .collect{
        color: #0F9A50;
      }
    }
  }
  .copy-wrap{
    margin-bottom: 6px;
    color: #666666;
    font-size: 12px;
    text-align: center;
    display: flex;
    justify-content: center;
    height: 20px;
    line-height: 20px;
    .el-image{
      width: 14px;
      height: 16px;
      margin-left: 3px;
    }
  }
  .table-title {
    margin-top: 25px;
    line-height: 20px;
    overflow: hidden;
    display: flex;
    font-size: 12px;
    justify-content: space-between;
  }
  .tips-wrap{
    padding: 5px;
    background: #FFEEEE;
    border-radius: 8px;
    line-height: 16px;
    font-size: 12px;
    color: #FD6B2E;
    text-align: center;
  }
  .text-wrap{
    height: 16px;
    line-height: 16px;
    font-size: 12px;
    text-align: center;
    span:first-child{
      margin-right: 10px;
    }
  }
  .input-amount-wrap{
    height: 49px;
    padding-top: 12px;
    .input-wrap{
      border: 0 !important;
      text-align: center;
      height: 49px;
      line-height: 49px;
      font-size: 40px;
      width: 100%;
      font-weight: bold;
      color: #0D0D0D;
    }
    .input-wrap::placeholder{
      font-size: 28px;
    }
  }
}


</style>
