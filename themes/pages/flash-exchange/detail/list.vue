<template>
  <div class="sub-page">
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
          {{ getDataInfo(scope.row.cashOutCurrencyId, 'currencyChains').name }}
        </template>
      </el-table-column>
      <el-table-column label="兑出链" width="150">
        <template #default="scope">
          {{ getDataInfo(scope.row.cashOutChain, 'chains').name }}
        </template>
      </el-table-column>
      <el-table-column prop="cashOutAmount" label="兑出量" width="120"></el-table-column>
      <el-table-column label="兑入币种" width="150">
        <template #default="scope">
          {{ getDataInfo(scope.row.cashInCurrencyId, 'currencyChains').name }}
        </template>
      </el-table-column>
      <el-table-column label="兑入链" width="150">
        <template #default="scope">
          {{ getDataInfo(scope.row.cashInChain, 'chains').name }}
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
      <el-form :model="form.conditions">
        <el-form-item label="时间">
          <el-date-picker
              v-model="dateRange"
              type="daterange"
              placeholder="选择时间范围"
              @change="updateDateRange"
          />
        </el-form-item>
        <el-form-item label="兑出币种">
          <el-select v-model="form.conditions.cashOutCurrencyId" placeholder="请选择兑出币种">
            <el-option v-for="item in getDataList('currencyChains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="兑出链">
          <el-select v-model="form.conditions.cashOutCurrencyChain" placeholder="请选择链">
            <el-option v-for="item in getDataList('chains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="兑出数量">
          <el-input v-model="form.conditions.cashOutAmount" placeholder="请输入兑出数量" type="number" />
        </el-form-item>
        <el-form-item label="兑入币种">
          <el-select v-model="form.conditions.cashInCurrencyId" placeholder="请选择兑入币种">
            <el-option v-for="item in getDataList('currencyChains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="兑入链">
          <el-select v-model="form.conditions.cashInCurrencyChain" placeholder="请选择兑入链">
            <el-option v-for="item in getDataList('chains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="兑入数量">
          <el-input v-model="form.conditions.cashInAmount" placeholder="请输入兑入数量" type="number" />
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
import {getStatusText,formatDate, getDataList } from "~/utils/configUtils";

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
const recordList = ref([]);
const totalRecord = ref(0);
const filterDialogVisible = ref(false);
const dateRange = ref([]);
//转换搜索时间
const updateDateRange = (range) => {
  form.value.conditions.startTime = range.length > 0 ? range[0] : '';
  form.value.conditions.endTime = range.length > 0 ? range[1] : '';
};

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
