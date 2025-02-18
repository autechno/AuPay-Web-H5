<template>
  <div v-if="isVisible" class="password-level-wrap">
    <p :class="`title l${passwordLevel.level}`">
      <span>密码强度</span>
      <i class="line" />
      <i class="line" />
      <i class="line" />
      <i class="line" />
    </p>
    <div class="content">
      <span>
        <el-checkbox v-model="passwordLevel.conditions[0]" disabled size="small">8-16个字符</el-checkbox>
        <el-checkbox v-model="passwordLevel.conditions[1]" disabled size="small">至少包含1个特殊字符</el-checkbox>
      </span>
      <el-checkbox v-model="passwordLevel.conditions[2]" disabled size="small">至少包含1个大写字母</el-checkbox>
    </div>
    <div class="triangle-arrow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

const props = defineProps({
  password: {
    type: String,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});

const passwordLevel = ref({
  conditions: [false, false, false],
  level: 1,
  visible: false,
});

// 更新密码级别的函数
const checkPasswordConditions = (password: string) => {
  // passwordLevel.value.visible = true;
  // 检查条件
  passwordLevel.value.conditions[0] = password.length >= 8 && password.length <= 16;
  passwordLevel.value.conditions[1] = /[!@#$%^&*()_+[\]{};':"\\|,.<>\/?]/.test(password);
  passwordLevel.value.conditions[2] = /[A-Z]/.test(password);

  // 计算满足条件的数量
  const satisfiedConditions = passwordLevel.value.conditions.filter(Boolean).length;

  // 更新等级
  if (satisfiedConditions === 3) {
    passwordLevel.value.level = 2;
    const specialCharCount = (password.match(/[!@#$%^&*()_+[\]{};':"\\|,.<>\/?]/g) || []).length;
    const upperCaseCount = (password.match(/[A-Z]/g) || []).length;
    if ((specialCharCount + upperCaseCount) == 3) {
      passwordLevel.value.level = 3;
    }
    if ((specialCharCount + upperCaseCount) > 3) {
      passwordLevel.value.level = 4;
    }
  } else {
    passwordLevel.value.level = 1;
  }
};

// 监听密码变化
watch(() => props.password, (newPassword) => {
  checkPasswordConditions(newPassword);
});
</script>

<style scoped>

</style>
