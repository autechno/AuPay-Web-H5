<template>
  <div class="page">
    <h4>基本信息</h4>
    <table class="table">
      <tr>
        <td>订单ID: </td><td>{{assets.tradeNo}}</td>
      </tr>
      <tr>
        <td>订单类型: </td><td>{{ getDataInfo(assets.tradeType, 'trade')?.name }}</td>
      </tr>
      <tr>
        <td>发起人: </td><td>{{assets.optUserId}}</td>
      </tr>
      <tr>
        <td>当前状态: </td><td>{{getStatusText(assets.status, 'ACCOUNT')}}</td>
      </tr>
      <tr>
        <td>发起时间: </td><td>{{formatDate(assets.createTime)}}</td>
      </tr>
      <tr>
        <td>结束时间: </td><td>{{formatDate(assets.finishTime)}}</td>
      </tr>
    </table>
    <h4>交易进度</h4>
    <table class="table">
      <tr>
        <td>进度条:{{assets.status}}</td>
        <td>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: 67%;">67%</div>
          </div>
        </td>
      </tr>
      <tr>
        <td>节点确认数: </td><td>--</td>
      </tr>
      <tr>
        <td>区块链确认数: </td><td>--</td>
      </tr>
      <tr>
        <td>区块链ID: </td><td>{{assets.txHash}}</td>
      </tr>
    </table>
    <h4>概览</h4>
    <table class="table" width="100%">
      <tr>
        <td>
          <table class="table">
            <tr>
              <td>用户头像:</td><td><img :src="assets.fromLogo" /></td>
            </tr>
            <tr>
              <td>用户昵称: </td><td>{{assets.fromNikeName}}</td>
            </tr>
            <tr>
              <td>用户账户: </td><td>{{assets.fromAccountName}}</td>
            </tr>
            <tr>
              <td>交易地址: </td><td>{{assets.fromWalletAddress}}</td>
            </tr>
          </table>
        </td>
        <td>
          <table class="table">
            <tr>
              <td>交易类型:</td><td>{{assets.tradeType}}</td>
            </tr>
            <tr>
              <td>数量: </td><td>{{assets.fromAmount}}</td>
            </tr>
            <tr>
              <td>代币名称: </td><td>{{assets.fromCurrencyId}}</td>
            </tr>
            <tr>
              <td>链: </td><td>{{assets.fromCurrencyChain	}}</td>
            </tr>
            <tr>
              <td>字符“至”: </td><td>空</td>
            </tr>
          </table>
        </td>
        <td>
          <table class="table">
            <tr>
              <td>用户头像:</td><td><img :src="assets.toLogo" /></td>
            </tr>
            <tr>
              <td>用户昵称: </td><td>{{assets.toNikeName}}</td>
            </tr>
            <tr>
              <td>用户账户: </td><td>{{assets.toAccountName}}</td>
            </tr>
            <tr>
              <td>交易地址: </td><td>{{assets.toWalletAddress}}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <h4>代币转移</h4>
    <table class="table" width="100%">
      <tr>
        <td>
          <table class="table">
            <tr>
              <td>账户:</td><td>{{assets.fromAccountName}}</td>
            </tr>
            <tr>
              <td>地址: </td><td>{{assets.fromWalletAddress}}</td>
            </tr>
            <tr>
              <td>网络: </td><td>{{assets.fromCurrencyChain}}</td>
            </tr>
            <tr>
              <td>币种: </td><td>{{assets.fromCurrencyId	}}</td>
            </tr>
            <tr>
              <td> {{assets.fromAmount	}}</td><td></td>
            </tr>
          </table>
        </td>
        <td>
          <table class="table">
            <tr>
              <td>账户:</td><td>{{assets.toAccountName}}</td>
            </tr>
            <tr>
              <td>地址: </td><td>{{assets.toWalletAddress}}</td>
            </tr>
            <tr>
              <td>网络: </td><td>{{assets.toCurrencyChain}}</td>
            </tr>
            <tr>
              <td>币种: </td><td>{{assets.toCurrencyId	}}</td>
            </tr>
            <tr>
              <td> {{assets.toAmount	}}</td><td></td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
    <h4>详情</h4>
    <table class="table">
      <tr><td>网络</td></tr>
      <tr> <td>{{assets.toCurrencyChain}} {{assets.formCurrencyChain}}</td></tr>
      <tr><td>数量</td></tr>
      <tr> <td>+/- {{assets.toAmount}} </td> </tr>
      <tr><td>费用</td></tr>
      <tr> <td>{{assets.fee}} {{assets.fromCurrencyId}} {{assets.formCurrencyChain}}</td></tr>
      <tr><td>实际到账/实际支出</td></tr>
      <tr> <td>{{assets.toAmount}} {{assets.toCurrencyId}} </td></tr>
      <tr><td>发起</td></tr>
      <tr> <td>{{assets.formWalletAddress}} <button>copy</button> </td></tr>
      <tr><td>接收</td></tr>
      <tr> <td>{{assets.toWalletAddress}} <button>copy</button> </td></tr>
      <tr><td>目标</td></tr>
      <tr> <td>{{assets.contractAddress}} <button>copy</button> </td></tr>
      <tr><td>区块链交易ID</td></tr>
      <tr> <td>{{assets.txHash}}  <button>copy</button>  <a href="https://sepolia.etherscan.io">区块链浏览器地址链接</a></td></tr>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import {getHeader} from "@/utils/storageUtils";
import { useRoute } from 'vue-router';
const route = useRoute();
const headers = getHeader();
const { assetsApi } = useServer()
const assets = ref({})
const recordId = ref(0)
import {formatDate, getStatusText, getDataInfo} from "@/utils/formatUtils";

const fetchData = async () => {
  try {
    const res = await assetsApi.accountAssetsDetail({recordId: recordId.value}, headers);
    if (res.code === 200) {
      assets.value = res.data;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

// 初始化数据
onMounted(() => {
  recordId.value = parseInt(route.query.id);
  fetchData();
})
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar {
  height: 20px;
  background-color: #3b82f6; /* Blue color */
  text-align: center;
  line-height: 20px; /* Center text vertically */
  color: white;
  font-weight: bold;
}
</style>
