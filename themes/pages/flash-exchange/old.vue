<template>
  <div class="exchange-container">
    <h2>闪兑</h2>
    <div class="select-container">
      <div class="selects">
        <el-select v-model="selectedOut" placeholder="选择兑出币种" @change="updateValues">
          <el-option
              v-for="currency in outCurrencies"
              :key="currency.id"
              :label="currency.label"
              :value="currency.value">
          </el-option>
        </el-select>
        <el-select style="margin-top:20px;" v-model="selectedIn" placeholder="选择兑入币种" @change="updateValues">
          <el-option
              v-for="currency in inCurrencies"
              :key="currency.id"
              :label="currency.label"
              :value="currency.value">
          </el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="swapCurrencies" class="swap-button">切换</el-button>
    </div>
    <div class="amount-display">
      <div class="amount">
        <span>{{ amount }}</span>
      </div>
      <div class="currency-label">
        {{ selectedIn.label }}
      </div>
    </div>
    <div class="flex" style="text-align: right">
      可兑换余额：{{ balance }} USDT
    </div>
    <el-button type="primary">确认兑换</el-button>
  </div>
  <div class="container" style="margin-top: 20px">
    <h2>闪兑记录</h2>
    <el-button type="primary" @click="openFilterDialog" class="swap-button">筛选</el-button>
    <el-dialog  width="500px" title="筛选条件" v-model="dialogVisible">
        <el-select v-model="filterOutCurrency" placeholder="选择兑出币种">
          <el-option
              v-for="currency in outCurrencies"
              :key="currency.id"
              :label="currency.label"
              :value="currency.value">
          </el-option>
        </el-select>
        <el-select v-model="filterOutProtocol" placeholder="选择兑出币种协议">
          <el-option label="ERC-20" value="ERC-20"></el-option>
          <el-option label="OZC" value="OZC"></el-option>
        </el-select>
        <el-input v-model="filterOutAmount" placeholder="兑出数量" style="width: 200px;"></el-input>
        <el-select v-model="filterInCurrency" placeholder="选择兑入币种">
          <el-option
              v-for="currency in inCurrencies"
              :key="currency.id"
              :label="currency.label"
              :value="currency.value">
          </el-option>
        </el-select>
        <el-select v-model="filterInProtocol" placeholder="选择兑入币种协议">
          <el-option label="ERC-20" value="ERC-20"></el-option>
          <el-option label="OZC" value="OZC"></el-option>
        </el-select>
        <el-input v-model="filterInAmount" placeholder="兑入数量" style="width: 200px;"></el-input>
        <el-button type="primary" class="swap-button">筛选</el-button>
    </el-dialog>

    <el-table :data="exchangeData" style="width: 100%">
      <el-table-column prop="index" label="序号" width="80"></el-table-column>
      <el-table-column prop="exchangeId" label="闪兑单ID" width="150"></el-table-column>
      <el-table-column prop="initTime" label="发起时间" width="180"></el-table-column>
      <el-table-column prop="completeTime" label="完成时间" width="180"></el-table-column>
      <el-table-column prop="outCurrency" label="兑出币种" width="150"></el-table-column>
      <el-table-column prop="outProtocol" label="兑出币种协议" width="150"></el-table-column>
      <el-table-column prop="outAmount" label="兑出量" width="120"></el-table-column>
      <el-table-column prop="inCurrency" label="兑入币种" width="150"></el-table-column>
      <el-table-column prop="inProtocol" label="兑入币种协议" width="150"></el-table-column>
      <el-table-column prop="inAmount" label="兑入量" width="120"></el-table-column>
      <el-table-column prop="status" label="状态" width="100"></el-table-column>
      <el-table-column prop="action" label="操作" width="100"></el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

const outCurrencies = ref([
  { id: 1, label: 'USDT', value: 'usdt' },
  { id: 2, label: 'USDT', value: 'usdt2' }
]);

const inCurrencies = ref([
  { id: 1, label: 'OZC', value: 'ozc' },
  { id: 2, label: 'OZC', value: 'ozc2' }
]);

const selectedOut = ref(outCurrencies.value[0]);
const selectedIn = ref(inCurrencies.value[0]);
const amount = ref(2000);
const balance = ref(3008.00);

// 筛选条件
const filterOutCurrency = ref('');
const filterOutProtocol = ref('');
const filterOutAmount = ref('');
const filterInCurrency = ref('');
const filterInProtocol = ref('');
const filterInAmount = ref('');
const dialogVisible = ref(false);

const openFilterDialog = () => {
  dialogVisible.value = true; // 打开对话框
};


const exchangeData = ref([
  {
    index: 1,
    exchangeId: '123456',
    initTime: '2023-01-01 10:00:00',
    completeTime: '2023-01-01 10:05:00',
    outCurrency: 'USDT',
    outProtocol: 'ERC-20',
    outAmount: 2000,
    inCurrency: 'OZC',
    inProtocol: 'OZC',
    inAmount: 1950,
    status: '完成',
    action: '查看'
  },
  {
    index: 2,
    exchangeId: '123457',
    initTime: '2023-01-02 11:00:00',
    completeTime: '2023-01-02 11:05:00',
    outCurrency: 'USDT',
    outProtocol: 'ERC-20',
    outAmount: 2000,
    inCurrency: 'OZC',
    inProtocol: 'OZC',
    inAmount: 1950,
    status: '完成',
    action: '查看'
  }
]);

const updateValues = () => {
  if (selectedIn.value.label === 'OZC') {
    amount.value = 2000; // 根据逻辑设置值
  } else {
    amount.value = 1000; // 其他币种逻辑
  }
};

const swapCurrencies = () => {
  const temp = selectedOut.value;
  selectedOut.value = selectedIn.value;
  selectedIn.value = temp;

  // 更新值
  updateValues();
};
</script>

<style scoped>
.exchange-container {
  width: 640px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 30px;

}

.select-container {
  display: flex;
  align-items: flex-start; /* 对齐选择框和按钮 */
}

.selects {
  flex: 1;
  margin-right: 20px;
}

.swap-button {
  width: 20%;
}

.amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  font-size: 18px;
}

.amount {
  flex: 4;
  border-bottom: #dcdcdc 1px solid;
}

.currency-label {
  flex: 1;
}
</style>
