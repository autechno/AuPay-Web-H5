<template>
  <div class="tabs-container">
    <!-- 标签页切换 -->
    <el-tabs v-model="activeTab" type="card" @tab-click="handleClick">
      <el-tab-pane label="系统消息" name="1" />
      <el-tab-pane label="业务消息" name="2" />
    </el-tabs>

    <!-- 按钮组 -->
    <div class="button-group">
      <el-button type="primary" @click="viewBusiness(1)">查看未读</el-button>
      <el-button type="primary" @click="viewBusiness(0)">全部标记已读</el-button>
    </div>
  </div>
  <div>
    <!-- 消息表格 -->
    <el-table :data="messagesList" style="width: 100%">
      <el-table-column label="序号" width="60">
        <template #default="scope">
          {{scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="消息类型" width="180">
        <template #default="scope">
          {{ scope.row.type === 1 ? '系统消息' : '业务消息' }}
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" width="200"></el-table-column>
      <el-table-column prop="content" label="消息内容" width="300"></el-table-column>
      <el-table-column prop="link" label="链接" width="150">
        <template #default="scope">
          <el-link :href="scope.row.linkUrl" target="_blank">{{scope.row.linkName}}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          {{ scope.row.isRead === 1 ? '未读' : '已读' }}
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
        background
        layout="prev, pager, next"
        :total="totalMessages"
        :page-size="form.pageSize"
        :current-page="form.pageNo"
        @current-change="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { TabsPaneContext } from 'element-plus';
import {getHeader} from "@/utils/storageUtils";
import {formatDate} from "~/utils/formatUtils";
const headers = getHeader();
const { messageApi } = useServer()
const activeTab = ref('1')

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {
    type: 1,
    isRead: null
  }
})

// 消息数据
const messagesList = ref([]);
const totalMessages = ref(0);

const fetchData = async () => {
  try {
    const res = await messageApi.messageList(form.value, headers);
    if (res.code === 200) {
      messagesList.value = res.data.records;
      totalMessages.value = res.data.total;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

const handleClick = (tab: TabsPaneContext) => {
  let type = parseInt(tab.index) + 1
  form.value.conditions.type = type
  form.value.pageNo = 1
  fetchData();
}

// 查看未读消息的处理函数
const viewBusiness = (type: number) => {
  form.value.conditions.isRead = type;
  form.value.pageNo = 1;
  fetchData();
}

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
