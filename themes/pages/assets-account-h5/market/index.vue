<template>
  <div class="page">
    <div class="tabs-container">
      <!-- 标签页切换 -->
      <el-tabs v-model="activeTab" type="card" @tab-click="handleClick">
        <el-tab-pane label="全部" name="1" />
        <el-tab-pane label="关注" name="2" />
      </el-tabs>
    </div>
    <div>
      <!-- 消息表格 -->
      <el-table :data="marketList" style="width: 100%">
        <el-table-column label="序号" width="60">
          <template #default="scope">
            {{scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column sortable label="币种" width="120">
          <template #default="scope">
            <span>{{ scope.row.coinSymbol }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalSupply" sortable label="市值" width="120" />
        <el-table-column prop="volume24h" sortable label="24h量" width="120" />
        <el-table-column prop="volume24h" sortable label="24h额" width="120" />
        <el-table-column prop="price" sortable label="价格" width="120" />
        <el-table-column prop="percentChange24h" sortable label="涨跌" width="120" />
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button @click="addToFavorites(scope.row.coinId, scope.row.focusId)">关注</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
          background
          layout="prev, pager, next"
          :total="totalMarket"
          :page-size="form.pageSize"
          :current-page="form.pageNo"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { TabsPaneContext } from 'element-plus';
import {getHeader} from "@/utils/storageUtils";
const headers = getHeader();
const {  assetsApi } = useServer()
const activeTab = ref('1')

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    focus: null
  }
})

// 数据列表
const marketList = ref([]);
const totalMarket = ref(0);

const fetchData = async () => {
  try {
    const res = await assetsApi.marketList(form.value, headers);
    if (res.code === 200) {
      marketList.value = res.data.records;
      totalMarket.value = res.data.total;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

const handleClick = (tab: TabsPaneContext) => {
  if(tab.index == 1){
    form.value.conditions.focus = true
  }else{
    form.value.conditions = {}
  }
  form.value.pageNo = 1
  fetchData();
}

const addToFavorites = async (coinId, focusId) => {
  try {
    const res = await assetsApi.marketFocus({coinId: coinId, focusId: focusId}, headers);
    if (res.code === 200) {
      ElMessage.success('关注成功')
      fetchData();
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
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

<style scoped>
.button-group {
  margin: 20px 0
}
</style>
