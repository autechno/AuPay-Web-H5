<template>

  <div class="flex items-center justify-end" style="text-align: right;">
        <span style="padding-right:16px;">
          <el-icon style="font-size: 20px; position: relative; top: 4px;"> <Refresh /> </el-icon>闪兑
        </span>
    <span style="padding-right:16px;">
          <el-icon style="font-size: 20px; position: relative; top: 4px;"> <Money /> </el-icon>充值/提现
        </span>
    <span style="padding-right:16px; position: relative; top: 4px;">
            <el-avatar :size="20" class="mr-3"
              :icon="User"
            />
        </span>
    <el-badge is-dot class="item" style="position: relative; top: -2px;">
      <el-avatar :size="20" class="mr-3" :icon="Message" />
    </el-badge>
  </div>
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
      @select="handleSelect"
  >
    <el-menu-item index="1">首页</el-menu-item>
    <el-menu-item index="2">资产</el-menu-item>
    <el-menu-item index="3">常用</el-menu-item>
    <el-menu-item index="4">Oz生态</el-menu-item>
    <el-sub-menu index="5">
      <template #title>用户中心</template>
      <el-menu-item index="5-1">信息管理</el-menu-item>
      <el-menu-item index="5-2">地址管理</el-menu-item>
      <el-menu-item index="5-3">企业商户端</el-menu-item>
      <el-menu-item index="5-4">白名单</el-menu-item>
      <el-menu-item index="5-5">绑定授权</el-menu-item>
    </el-sub-menu>
  </el-menu>

  <div style="padding-top:20px;">
    <el-breadcrumb >
      <el-breadcrumb-item :to="{ path: '/' }">auPay客户端</el-breadcrumb-item>
      <el-breadcrumb-item>资产</el-breadcrumb-item>
      <el-breadcrumb-item>账户总揽</el-breadcrumb-item>
    </el-breadcrumb>
  </div>

</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { Message, Money, Refresh, User } from '@element-plus/icons-vue'
  const activeIndex = ref('2')
  const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)
  }
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>