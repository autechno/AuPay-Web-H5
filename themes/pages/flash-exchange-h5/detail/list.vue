<template>
  <div class="page" style="padding-top: 28px;">
    <GoBack :buttonConfig="buttonConfig" />
    <div class="flash-title-wrap">
      <div class="title">{{yearText}}年度闪兑单</div>
      <div class="select-wrap">
        <div class="select">
          <el-date-picker
              size="small"
              ref="datePicker"
              v-model="dateText"
              type="month"
              :clearable="false"
              :editable="false"
              :placeholder="dateText"
              @change="handleDateChange"
          />
        </div>
      </div>
    </div>
    <div class="flash-content">
      <div class="exchange-container" v-for="item in recordList" @click="jumpDetail(`/flash-exchange-h5/detail?id=${item.id}&tradeNo=${item.tradeNo}`)">
          <div class="item-wrap">
            <el-row type="flex" >
              <el-col :span="11">
                <div class="item" >
                  <div class="flash-img-wrap">
                    <el-image :src="sol" />
                  </div>
                  <div class="text-wrap">
                    <p class="title">{{item.cashOutAmount}} </p>
                    <p class="text">{{ getDataInfo(item.cashOutChain, 'chains').name }}</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="2">
                <div class="flash-img-wrap separator">
                  <div class="arrow-wrap"><el-image :src="arrow" /></div>
                </div>
              </el-col>
              <el-col :span="11">
                <div class="item" style="text-align: right">
                  <div class="text-wrap">
                    <p class="title">{{item.cashInAmount}} </p>
                    <p class="text"> {{ getDataInfo(item.cashInChain, 'chains').name }}</p>
                  </div>
                  <div class="flash-img-wrap" style="right: 0; left: auto">
                    <el-image :src="btc" />
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="date-wrap"> {{ formatDate(item.createTime) }} </div>
      </div>
      <!-- 分页组件 -->
      <el-pagination
          background
          layout="prev, pager, next"
          :total="totalRecord"
          :page-size="form.pageSize"
          :current-page="form.pageNo"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getHeader } from "@/utils/storageUtils";
import { formatDate } from "~/utils/configUtils";
import GoBack from "@/composables/GoPageBack.vue";
import sol from '@@/public/images/sol.svg'
import arrow from '@@/public/images/jiantou.svg'
import btc from '@@/public/images/btc.svg'
import {showCatchErrorMessage} from "~/utils/messageUtils";
const router = useRouter()
const headers = getHeader();
const { assetsApi } = useServer();

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    startTime: '',
    endTime: '',
    cashOutCurrencyId: '',
    cashOutCurrencyChain: '',
    cashOutAmount: '',
    cashInCurrencyId: '',
    cashInCurrencyChain: '',
    cashInAmount: ''
  }
});

// 消息数据
const yearText = ref('2025');
const recordList = ref([]);
const totalRecord = ref(0);
const jumpDetail = (path: string) => {
  router.push(path);
}
// 跳转配置
const buttonConfig = ref({
  navigateTo: '/assets-account-h5/detail/order',
  btnName: '订单',
  type: 'default',
})
// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.fastSwapApplyList(form.value, headers);
    if (res.code === 200) {
      recordList.value = res.data.records;
      totalRecord.value = res.data.total;
    } else {
      showErrorMessage(res.code, res.message);
    }
  } catch (error) {
    showCatchErrorMessage();
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  form.value.pageNo = page;
  fetchData();
};

// 初始化数据
onMounted(() => {
  fetchData();
});

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
};
</script>

<style lang="less" scoped>
.flash-title-wrap{
  margin-top: 37px;
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
    display: flex;
    width: 110px;
    .select{
      margin-right: 10px;
      overflow: hidden;
      height: 30px;
      min-width: 100px;
      line-height: 30px;
      border: 2px solid #C8DCE8;
      border-radius: 8px;
      text-align: center;
      color: #0D0D0D;
      font-size: 14px;
      font-weight: bold;
      :deep(.el-date-editor){
        width: 110px;
        position: relative;
      }
      :deep(.el-input__inner){
        font-size: 14px;
        color: #0D0D0D;
      }
      :deep(.el-input__prefix){
        display: none;
      }
      :deep(.el-input__wrapper){
        border:0;
        box-shadow: none;
      }
    }
  }
}
.input_box{
  :deep(.el-select__wrapper) {
    height: 34px;
    width: 100px;
    border-radius: 8px;
    border: 2px #C8DCE8 solid;
    box-shadow: none;
  }
  :deep(.checkbox__label){
    color: #dcdcdc !important;
  }
  :deep(.el-form-item__error){
    padding-left: 14px;
  }
  :deep(.el-checkbox__label){
    font-weight: normal !important;
  }
}
.flash-content{
  margin-top:18px;
  padding-bottom: 20px;
  width: 100%;
  .exchange-container {
    padding: 18px 18px 0 18px;
    margin-bottom: 16px;
    border-radius: 16px;
    background: #ffffff;
    border: 3px #E0EBF2 solid;
    .item-wrap {
      height: 60px;
      .item{
        padding:0 20px;
        position: relative;
        .flash-img-wrap{
          position: absolute;
          left: 0;
          top: 0;
        }
        .text-wrap{
          padding: 0 5px;
          .title{
            color: #0D0D0D;
            font-size: 16px;
            font-weight: bold;
            margin:0;
          }
          .text{
            color: #6D6D6D;
            font-size: 12px;
            margin:0;
          }
        }
      }
      .separator {
        width: 20px;
        height: 20px;
        margin: 0 auto;
        text-align: center;
        .arrow-wrap{
          padding-top: 4px;
        }
      }
    }
    .date-wrap{
      height: 40px;
      border-top: 1px solid #F1F1F1;
      line-height: 40px;
      color: #999999;
      font-size: 12px;
    }
  }
}
.flash-img-wrap{
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background: #F2F2F2;
}
</style>
