<!-- TransferForm.vue -->
<template>
  <el-dialog title="转账" v-model="props.isDialogVisible" width="500">
    <el-form :model="form" :rules="rules" ref="formRef">
      <el-form-item
          label="货币"
          prop="currencyId"
          :rules="[{ required: true, message: '货币不能为空', trigger: 'blur' }]">
        <el-select
            style="margin-bottom: 20px;"
            id="currency-select"
            v-model="form.currencyId"
            placeholder="请选择货币"
            @change="handleCurrencyChain">
          <el-option
              v-for="currency in currencyList"
              :key="currency.currencyId"
              :label="currency.currencyName"
              :value="currency.currencyId"
          />
        </el-select>
      </el-form-item>
      <el-form-item
          label="货币链"
          prop="currencyChainId"
          :rules="[{ required: true, message: '货币链不能为空', trigger: 'blur' }]">
        <el-select
            id="chain-select"
            v-model="form.currencyChainId"
            placeholder="请选择货币链">
          <el-option
              v-for="chain in currencyChainList"
              :key="chain.currencyChainId"
              :label="chain.currencyChainName"
              :value="chain.currencyChainId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="inputAmount" :rules="[{ required: true, message: '数量不能为空', trigger: 'blur' }]">
        <el-input v-model.number="form.inputAmount"></el-input>
      </el-form-item>
      <div>

      </div>
      <el-form-item label="收款备注" prop="remark">
        <el-input v-model="form.remark"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue';
import { ElMessage } from "element-plus";
import { getHeader } from "@/utils/storageUtils";

const currencyList = ref([]);
const currencyChainList = ref([]);
const formRef = ref(null);
const props = defineProps({
  form: Object,
  isDialogVisible: Boolean,
});
// 表单验证规则
const rules = {
  currencyId: [
    { required: true, message: '货币不能为空', trigger: 'blur' },
  ],
  currencyChainId: [
    { required: true, message: '货币链不能为空', trigger: 'blur' },
  ],
  inputAmount: [
    { required: true, message: '数量不能为空', trigger: 'blur' },
  ],
};

const emit = defineEmits(['update:form', 'close']);

// 选择链
const handleCurrencyChain = () => {
  const currentCurrency = currencyList.value.find(currency => currency.currencyId === props.form.currencyId);
  if (currentCurrency) {
    currencyChainList.value = currentCurrency.chains;
    props.form.currencyChainId = currentCurrency.chains[0]?.currencyChainId;
  }
};

// 提交转账
const handleSubmit = async () => {
  const valid = await formRef.value.validate();
  if (valid) {
    props.form.generateQR = `?qr=${props.form.transferQR}&currencyId=${props.form.currencyId}&currencyChainId=${props.form.currencyChainId}&inputAmount=${props.form.inputAmount}&remark=${props.form.remark}`;
    props.isDialogVisible = false;
    emit('update:form', { ...props.form }); // 更新父组件的 form 数据
    emit('close');
  } else {
    ElMessage.error('表单验证失败');
  }
};

// 取消操作
const cancel = () => {
  emit('close');
};

// 获取资产数据
const assetsData = async () => {
  const headers = getHeader();
  const { assetsApi } = useServer();
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
    } else {
      ElMessage.error(res.message || '查询失败');
    }
  } catch (error) {
    ElMessage.error('请求失败，请重试');
  }
};

// 初始化数据
onMounted(() => {
  assetsData();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
