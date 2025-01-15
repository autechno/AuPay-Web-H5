<template>
  <div>
    <!-- 工单按钮 -->
    <el-button type="primary" @click="openDialog">创建工单</el-button>

    <!-- 消息表格 -->
    <el-table :data="workList" style="width: 100%">
      <el-table-column label="序号" width="60">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="问题"></el-table-column>
      <el-table-column prop="createTime" label="时间" width="180"></el-table-column>
      <el-table-column label="对话状态" width="200">
        <template #default="scope">
          {{ getStatusText(scope.row.conversationStatus, 'WORK') }}
        </template>
      </el-table-column>
      <el-table-column prop="replyStatus" label="客服回复状态" width="140">
        <template #default="scope">
          {{ getStatusText(scope.row.staffReplyStatus, 'WORK') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-link :href="`/work-order/detail/${scope.row.id}`">{{ getStatusText(scope.row.status) }}</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        background
        layout="prev, pager, next"
        :total="totalWork"
        :page-size="form.pageSize"
        :current-page="form.pageNo"
        @current-change="handlePageChange"
    />

    <!-- 创建工单对话框 -->
    <el-dialog title="创建工单" v-model="dialogVisible">
      <el-input type="textarea" v-model="newTicketContent" :rows="7" placeholder="请输入内容"></el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="createTicket">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import { getStatusText} from "@/utils/formatUtils";

const headers = getHeader();
const { messageApi } = useServer();

// 表单数据
const form = ref({
  pageNo: 1,
  pageSize: 10,
  conditions: {}
});

// 消息数据
const workList = ref([]);
const totalWork = ref(0);

// 对话框状态
const dialogVisible = ref(false);
const newTicketContent = ref('');

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true;
};

// 创建工单
const createTicket = async () => {
  try {
    const res = await messageApi.ticketCreate({ content: newTicketContent.value }, headers);
    if (res.code === 200) {
      ElMessage.success('工单创建成功');
      dialogVisible.value = false; // 关闭对话框
      window.location.href = `/work-order/detail/${res.data.id}`;
    } else {
      ElMessage.error(res.message || '创建工单失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 获取消息数据
const fetchData = async () => {
  try {
    const res = await messageApi.ticketList(form.value, headers);
    if (res.code === 200) {
      workList.value = res.data.records;
      totalWork.value = res.data.total;
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
