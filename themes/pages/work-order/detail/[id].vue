<template>
  <div>
    对话ID：{{ ticket.id }}   创建时间：{{ ticket.createTime }}  对话状态：{{ getStatusText(ticket.conversationStatus, 'WORK') }}  客服回复状态：{{ getStatusText(ticket.staffReplyStatus, '') }}
    <!-- 消息表格 -->
    <el-table :data="workList" style="width: 100%">
      <el-table-column prop="createTime" label="本人（我)" width="180"></el-table-column>
      <el-table-column prop="messageContent" :label="ticket.content"></el-table-column>
      <el-table-column prop="createTime" label="客服001（comer）" width="180"></el-table-column>
    </el-table>
    <div class="button-group">
      <el-button type="warning" @click="ticketPress">催促</el-button>
      <el-button type="primary" @click="dialogVisible = true">回复</el-button>
      <el-button type="success" @click="ticketFix">问题已解决</el-button>
    </div>
    <!-- 回复对话框 -->
    <el-dialog title="回复" v-model="dialogVisible">
      <el-input
          type="textarea"
          v-model="replyContent"
          placeholder="请输入回复内容（不超过800字）"
          :maxlength="800"
          :show-word-limit="true"
          :rows="7"
      ></el-input>
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="submitReply">确 定</el-button>
    </el-dialog>
  </div>
</template>


<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getHeader } from "@/utils/storageUtils";
import { getStatusText } from "@/utils/formatUtils";
import { useRoute } from 'vue-router';
const route = useRoute();
const headers = getHeader();
const { messageApi } = useServer();
const dialogVisible = ref(false);

// 消息数据
const workList = ref([]);
const ticketId = ref(0);
const ticket = ref({});
const replyContent = ref('');

// 获取消息数据
const fetchData = async (ticketId: number) => {
  try {
    const res = await messageApi.ticketMessageList({ ticketId }, headers);
    if (res.code === 200) {
      ticket.value = res.data.ticket;
      workList.value = res.data.messageList;
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 提交回复
const submitReply = async () => {
  if (!replyContent.value) {
    ElMessage.warning('请输入回复内容');
    return;
  }
  try {
    const res = await messageApi.ticketMessageCreate({ticketId: ticketId.value, messageContent: replyContent.value }, headers);
    if (res.code === 200) {
      ElMessage.success('回复成功');
      // 清空内容
      replyContent.value = '';
      dialogVisible.value = false;
      fetchData(ticketId.value);
    } else {
      ElMessage.error(res.message || '回复失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 催促方法
const ticketPress = async () => {
  try {
    const res = await messageApi.ticketPress({ ticketId: ticket.value.id }, headers);
    if (res.code === 200) {
      ElMessage.success('催促成功');
      dialogVisible.value = false;
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 问题已解决方法
const ticketFix = async () => {
  try {
    const res = await messageApi.ticketFixList({ ticketId: ticket.value.id }, headers);
    if (res.code === 200) {
      ElMessage.success('问题已解决');
    } else {
      ElMessage.error(res.message);
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  ticketId.value = parseInt(route.params.id);
  fetchData(ticketId.value);
});
</script>

<style scoped>
.reply-area {
  border: solid 1px #ccc;
  position: fixed;
  right: 20px;
  bottom: 440px;
  width: 300px;
  padding:20px;
  z-index: 1000;
}

</style>
