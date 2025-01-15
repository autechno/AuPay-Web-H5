<template>
  <div>
    <el-button type="primary" @click="showFilterDialog">筛选</el-button>

    <!-- 消息表格 -->
    <el-table :data="recordList" style="width: 100%">
      <el-table-column label="序号" width="60">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="tradeNo" label="闪兑单ID" width="150"></el-table-column>
      <el-table-column label="发起时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="完成时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.finishTime) }}
        </template>
      </el-table-column>
      <el-table-column label="兑出币种" width="150">
        <template #default="scope">
          {{ getCurrencyInfo(scope.row.cashOutCurrencyId).name }}
        </template>
      </el-table-column>
      <el-table-column label="兑出币种协议" width="150">
        <template #default="scope">
          {{ getCoinInfo(scope.row.cashOutChain).name }}
        </template>
      </el-table-column>
      <el-table-column prop="cashOutAmount" label="兑出量" width="120"></el-table-column>
      <el-table-column prop="cashInCurrencyId" label="兑入币种" width="150">
        <template #default="scope">
          {{ getCurrencyInfo(scope.row.cashInCurrencyId).name }}
        </template>
      </el-table-column>
      <el-table-column label="兑入币种协议" width="150">
        <template #default="scope">
          {{ getCoinInfo(scope.row.cashInChain).name }}
        </template>
      </el-table-column>
      <el-table-column prop="cashInAmount" label="兑入量" width="120"></el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          {{ getStatusText(scope.row.status, 'FLASH') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-link :href="`/flash-exchange/detail?id=${scope.row.id}&tradeNo=${scope.row.tradeNo}`">查看详情</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        background
        layout="prev, pager, next"
        :total="totalRecord"
        :page-size="form.pageSize"
        :current-page="form.pageNo"
        @current-change="handlePageChange"
    />

    <!-- 筛选弹窗 -->
    <el-dialog title="筛选条件" v-model="filterDialogVisible">
      <el-form :model="filterForm">
        <el-form-item label="时间">
          <el-date-picker v-model="filterForm.dateRange" type="daterange" placeholder="选择时间范围" />
        </el-form-item>
        <el-form-item label="兑出币种">
          <el-input v-model="filterForm.outCurrency" placeholder="请输入兑出币种" />
        </el-form-item>
        <el-form-item label="兑出币种协议">
          <el-input v-model="filterForm.outProtocol" placeholder="请输入兑出币种协议" />
        </el-form-item>
        <el-form-item label="兑出数量">
          <el-input v-model="filterForm.outAmount" placeholder="请输入兑出数量" type="number" />
        </el-form-item>
        <el-form-item label="兑入币种">
          <el-input v-model="filterForm.inCurrency" placeholder="请输入兑入币种" />
        </el-form-item>
        <el-form-item label="兑入币种协议">
          <el-input v-model="filterForm.inProtocol" placeholder="请输入兑入币种协议" />
        </el-form-item>
        <el-form-item label="兑入数量">
          <el-input v-model="filterForm.inAmount" placeholder="请输入兑入数量" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="filterDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="applyFilter">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import {getStatusText, getCoinInfo, formatDate, getCurrencyInfo} from "@/utils/formatUtils";

const headers = getHeader();
const { assetsApi } = useServer();

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {}
});

// 消息数据
const recordList = ref([]);
const totalRecord = ref(0);

// 筛选弹窗状态和表单数据
const filterDialogVisible = ref(false);
const filterForm = ref({
  dateRange: [],
  outCurrency: '',
  outProtocol: '',
  outAmount: null,
  inCurrency: '',
  inProtocol: '',
  inAmount: null
});

// 获取消息数据
const fetchData = async () => {
  try {
    const res = await assetsApi.fastSwapApplyList(form.value, headers);
    if (res.code === 200) {
      recordList.value = res.data.records;
      totalRecord.value = res.data.total;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 处理分页变化
const handlePageChange = (page: number) => {
  form.value.pageNo = page;
  fetchData();
};

// 显示筛选弹窗
const showFilterDialog = () => {
  filterDialogVisible.value = true;
};

// 应用筛选条件
const applyFilter = () => {
  // 将筛选条件应用到表单中
  form.value.conditions = { ...filterForm.value };
  filterDialogVisible.value = false;
  fetchData(); // 重新获取数据
};

// 初始化数据
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.button-group {
  margin: 20px 0;
}
</style>
