<template>
  <div class="page">
    <el-tabs v-model="activeIndex" @tab-click="handleTabClick">
      <el-tab-pane label="充值" /> <el-tab-pane label="转账"  /> <el-tab-pane label="提现"  />
    </el-tabs>
    <div class="exchange-container">
      <el-form :model="form" ref="formRef" @submit.prevent="showQrDialog = true">
        <el-select
            style="margin-bottom: 20px;"
            id="currency-select"
            v-model="form.currencyId"
            placeholder="请选择货币"
            @change="handleCurrencyChain"
        >
          <el-option
              v-for="currency in currencyList"
              :key="currency.currencyId"
              :label="currency.currencyName"
              :value="currency.currencyId"
          />
        </el-select>

        <el-select
            id="chain-select"
            style="margin-bottom: 20px;"
            v-model="form.currencyChainId"
            placeholder="请选择链"
            @change="handleWalletAddress"
        >
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChainId"
              :label="chain.currencyChainName"
              :value="chain.currencyChainId"
          />
        </el-select>
        <div class="social-login">
          <el-button type="primary" native-type="submit">确认生成收款码</el-button>
        </div>
      </el-form>
      <el-dialog v-model="showQrDialog" style="height: 450px; width: 400px">
          <div style="margin: 30px 30%">
            <img v-if="form.avatar" :src="form.avatar" class="avatar" style="margin: 20px auto" />
            <QCcode :value="form.walletAddress" :size="150" />
            <el-button @click="copyText(form.walletAddress)"> 复制地址 </el-button>
          </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getHeader } from "~/utils/storageUtils";
import { ElMessage } from "element-plus";
import QCcode from "~/composables/QCcode.vue";
const showQrDialog = ref(false);
const headers = getHeader();
import { copyText } from "@/utils/funcUtil";
const { assetsApi } = useServer();
const form = ref({
  currencyId: null,
  currencyChainId: null,
  walletAddress: '',
  avatar: '',
});
const currencyList = ref([]);
const currencyChainList = ref([]);
const formRef = ref(null);
const activeIndex = ref('0');

// 处理外部选项卡点击事件
const handleTabClick = (tab: any) => {
  if(tab.index == '1'){
    window.location.href="/charge-withdraw/transfer";
  }else if(tab.index == '2'){
    window.location.href="/charge-withdraw/withdrawal";
  }
};


// 获取 URL 查询参数
const getQueryParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    currencyId: urlParams.get('currencyId'),
    currencyChainId: urlParams.get('currencyChainId'),
  };
};

// 获取数据的函数
const fetchData = async () => {
  try {
    let res = await assetsApi.accountAssets({}, headers);
    if (res.code === 200) {
      let dataList = res.data;
      const currencyMap = new Map();
      dataList.forEach(item => {
        if (!currencyMap.has(item.currencyId)) {
          currencyMap.set(item.currencyId, {
            currencyId: item.currencyId,
            currencyName: getCurrencyInfo(item.currencyId)?.name,
            chains: [],
            walletAddress: item.walletAddress,
          });
        }
        currencyMap.get(item.currencyId).chains.push({
          currencyChainId: item.currencyChain,
          currencyChainName: getCoinInfo(item.currencyChain)?.name,
          walletAddress: item.walletAddress,
        });
      });
      currencyList.value = Array.from(currencyMap.values());
      // 查询参数
      const { currencyId, currencyChainId } = getQueryParams();
      if (currencyId) {
        form.value.currencyId = currencyId;
        handleCurrencyChain();
        console.log(form.value)

      }else{
        form.value.currencyId = currencyList.value[0]?.currencyId;
        console.log(form.value)

        form.value.currencyChainId = currencyList.value[0]?.chains[0]?.currencyChainId;
        form.value.walletAddress = currencyList.value[0]?.walletAddress || '';
        currencyChainList.value = currencyList.value[0]?.chains || [];
      }
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 更新链选择
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === form.value.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    form.value.currencyChainId = currentCurrency.chains[0]?.currencyChainId;
    form.value.walletAddress = currentCurrency.chains[0]?.walletAddress || '';
  }
};

// 更新钱包地址
const handleWalletAddress = () => {
  const selectedChain = currencyChainList.value.find(chain => chain.currencyChainId === form.value.currencyChainId);
  if (selectedChain) {
    form.value.walletAddress = selectedChain.walletAddress;
  }
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  form.value.avatar = userStore.userInfo.headPortrait;
  fetchData();
});
</script>

<style scoped>
.exchange-container {
  height: 180px;
  width: 340px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 30px;
  margin: 0 auto;
}
.avatar {
  width: 80px;
  height: 80px;
  display: block;
  border-radius: 80px;
}

</style>
