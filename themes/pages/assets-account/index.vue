<template>
  <div class="page">
    <CurrencyTabs :currency-tabs="currencyTabData" @currency-changed="handleCurrencyChange" @show-currency-changed="handleShowCurrencyChanged" />
    <div v-if="selectedCurrencyId == 0">
      <el-row v-for="(item, index) in currencyMergedData" :key="index" class="asset-item">
        <el-col :span="12">{{ item.currencyJson.name }}</el-col>
        <el-col :span="12" style="text-align: right;">{{ !isShowCurrency?'******':formatCurrency(item.balance) }}</el-col>
      </el-row>
      <div style="text-align: right; margin-top: 20px; font-weight: bold;">
        总资产：{{!isShowCurrency?'******':formatCurrency(totalAssets) }}{{currencySign}}
      </div>
      <el-button type="primary" @click="searchDialogVisible = true">筛选</el-button>
      <el-table :data="accountAssetsList" style="width: 100%">
        <el-table-column label="序号" width="60">
          <template #default="scope">
            {{scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="tradeNo" label="订单ID" sortable />
        <el-table-column label="订单类型" >
          <template #default="scope">
            {{ getDataInfo(scope.row.tradeType, 'trade').name || '' }}
          </template>
        </el-table-column>
        <el-table-column label="发起时间" sortable >
          <template #default="scope">
            {{ formatDate(scope.row.createTime) || '' }}
          </template>
        </el-table-column>
        <el-table-column label="完成时间" sortable >
          <template #default="scope">
            {{ formatDate(scope.row.finishTime) || '' }}
          </template>
        </el-table-column>
        <el-table-column label="币种" sortable>
          <template #default="scope">
            {{ getDataInfo(scope.row.currencyId, 'currencyChains').name || '' }}
          </template>
        </el-table-column>
        <el-table-column label="链" sortable>
          <template #default="scope">
            {{ getDataInfo(scope.row.currencyChain, 'chains')?.name || '' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="数量" sortable />
        <el-table-column label="交易状态" sortable>
          <template #default="scope">
            {{ getStatusText(scope.row.status, 'ACCOUNT') || '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <a :href="`/assets-account/detail?id=${scope.row.id}`">查看详情</a>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
          background
          layout="prev, pager, next"
          :total="accountAssetsTotal"
          :page-size="form.pageSize"
          :current-page="form.pageNo"
          @current-change="handlePageChange"
      />
    </div>
    <div v-else>
      <div v-for="(item, index) in currencyItemData" class="container list-wrap" :key="index" >
          <el-row :gutter="20" v-if="item.currencyId === selectedCurrencyId">
            <el-col :span="18">
              <div class="h1">{{ item.currencyJson.name }}</div>
              <div>{{ item.coinJson.name }}</div>
              <div @click="copyText(item.walletAddress)" class="copyable-text">
                {{ item.walletAddress }}
              </div>
            </el-col>
            <el-col :span="6">
              <el-row class="right-column" type="flex" justify="end" align="middle">
                <el-col :span="12">
                  <div class="right-content">
                    <p class="left-width">{{ !isShowCurrency?'******':formatCurrency(item.balance) }}</p>
                    <p> 1%</p>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="right-content">
                    <p class="left-width">{{ item.currencyJson.name }}</p>
                    <p>{{ !isShowCurrency?'******':formatCurrency(item.totalBalanceUsdt) }}{{currencySign}}</p>
                  </div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
      </div>
      <div class="button-group">
        <el-button type="primary" >转账</el-button>
        <el-button type="primary" >充值</el-button>
        <el-button type="primary" >提现</el-button>
      </div>
    </div>

    <el-dialog title="筛选" v-model="searchDialogVisible" @close="searchDialogVisible = false">
      <el-form :model="form">
        <el-form-item label="币种">
          <el-select v-model="form.conditions.currencyId" placeholder="请选择币种">
            <el-option v-for="item in getDataList('currencyChains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="链">
          <el-select v-model="form.conditions.currencyChain" placeholder="请选择链">
            <el-option v-for="item in getDataList('chains')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易类型">
          <el-select v-model="form.conditions.tradeType" placeholder="请选择交易类型">
            <el-option v-for="item in getDataList('trade')" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model="form.conditions.amount" placeholder="请输入数量"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="searchDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="applySearch">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getHeader } from "@/utils/storageUtils";
import {
  formatCurrency,
  formatDate,
  getStatusText,
  getDataInfo,
  getDataList
} from "~/utils/configUtils";
import CurrencyTabs from "@/composables/CurrencyTabs.vue";
import {ElMessage} from "element-plus";
import { copyText } from "@/utils/funcUtil";
const searchDialogVisible = ref(false);
const headers = getHeader();
const { assetsApi, systemApi } = useServer();
const selectedCurrencyId = ref(0);
const currencyTabData = ref([{
  currencyId: 0,
  name: '余额总揽'
}]);
const currencyCode = ref();
const currencySign = ref("$");
const accountAssetsList = ref([]);
const accountAssetsTotal= ref(0);
const currencyItemData = ref([]);
const currencyMergedData = ref([]);
const totalAssets = ref(0);
const isShowCurrency = ref(false);

// 应用搜索条件
const applySearch = () => {
  form.value.pageNo = 1;
  accountAssetsData();
  searchDialogVisible.value = false;
};

// 切换tabs
const handleCurrencyChange = (currencyId: number) => {
  selectedCurrencyId.value = currencyId;
  if(selectedCurrencyId.value ==  0 ){
    accountAssetsData();
  }
};

// 金额是否显示
const handleShowCurrencyChanged = (value) => {
  isShowCurrency.value = value;
};

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

// 资金分页
const handlePageChange = (page: number) => {
  form.value.pageNo = page;
  accountAssetsData();
}
// 资金分页列表
const accountAssetsData = async () => {
  try {
    const res = await assetsApi.accountAssetsList(form.value, headers);
    if (res.code === 200) {
      accountAssetsList.value = res.data.records;
      accountAssetsTotal.value = res.data.total;
    } else {
      ElMessage.error(res.message || '查询失败')
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试')
  } finally {
  }
}

const fetchData = async () => {
  try {
    const [rateResponse, assetsResponse] = await Promise.all([
      assetsApi.getRateU2Currency({ currency: currencyCode.value }, headers),
      assetsApi.accountAssets({}, headers)
    ]);
    // 处理汇率响应
    let exchangeRate = 1;
    if (rateResponse.code == 200) {
      exchangeRate = rateResponse.data
    }
    // 处理资产响应
    if (assetsResponse.code == 200) {
      const mergedData = {};
      // 初始化总和变量
      let totalBalanceUsdtSum = 0;
      const dataList = assetsResponse.data; // 假设数据在 res.data 中
      if (dataList && dataList.length > 0) {
        dataList.forEach(item => {
          item['totalBalanceUsdt'] = item['totalBalanceUsdt'] * exchangeRate;
          const { currencyId, currencyChain,  balance, freezeBalance, totalBalance, totalBalanceUsdt } = item;
          let currencyKeyValue =  getDataInfo(currencyId, 'currencyChains');
          let coinKeyValue =  getDataInfo(currencyChain, 'chains');
          let mergedStore  = { ...item, currencyJson: currencyKeyValue, coinJson: coinKeyValue };
          currencyItemData.value.push(mergedStore);
          if (!mergedData[currencyId]) {
            mergedData[currencyId] = mergedStore;
            currencyTabData.value.push({ currencyId: currencyId, name: currencyKeyValue.name });
          }else{
            mergedData[currencyId].balance += balance;
            mergedData[currencyId].freezeBalance += freezeBalance;
            mergedData[currencyId].totalBalance += totalBalance;
            mergedData[currencyId].totalBalanceUsdt += totalBalanceUsdt;
          }
          totalBalanceUsdtSum += totalBalanceUsdt;
        });
        totalAssets.value = totalBalanceUsdtSum;
        currencyMergedData.value = Object.values(mergedData);
      }
    } else {
      ElMessage.error(assetsResponse.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  const userStore = UseUserStore();
  currencyCode.value = userStore.userInfo.currencyUnit;
  currencySign.value = getDataInfo(currencyCode.value, 'currency')?.sign;
  fetchData();
  accountAssetsData();
})

</script>

<style scoped>
  .button-group {
    display: flex;
    gap: 10px; /* Space between buttons */
  }
  .asset-item {
    width: 80%;
    background: #f1f1f1;
    margin-bottom: 10px;
  }
  .copyable-text {
    cursor: pointer;
    color: blue;
    text-decoration: underline;
    margin-bottom: 5px;
  }
  .right-column {
    display: flex;
    justify-content: flex-end;
  }
  .right-content {
    text-align: right;
  }
  .list-wrap {
    background: #dcdcdc;
    margin-bottom: 20px;
  }
  .left-width {
    width: 100%;
  }
  .button-group {
    text-align: right;
  }
  .dialog-footer {
    margin-top: 20px;
  }
</style>
