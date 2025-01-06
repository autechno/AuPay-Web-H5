<template>
  <div class="flex items-center justify-end" style="text-align: right;">
    <span style="padding-right:16px;">
      <el-icon style="font-size: 20px; position: relative; top: 4px;"><Refresh /></el-icon>闪兑
    </span>
    <span style="padding-right:16px;">
      <el-icon style="font-size: 20px; position: relative; top: 4px;"><Money /></el-icon>充值/提现
    </span>
    <span style="padding-right:16px; position: relative; top: 4px;">
      <el-avatar :size="20" class="mr-3" :icon="User" />
    </span>
    <el-badge is-dot class="item" style="position: relative; top: -2px;">
      <router-link to="/message">
        <el-avatar :size="20" class="mr-3" :icon="Message" />
      </router-link>
    </el-badge>
  </div>

  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
  >
    <el-menu-item
        v-for="item in menuItems.slice(0, 4)"
        :key="item.index"
        :index="item.index"
        @click="jumpMenuPath(item.path)"
    > {{ item.label }} </el-menu-item>
    <el-sub-menu index="5">
      <template #title>用户中心</template>
      <el-menu-item
          v-for="subItem in menuItems[4].children"
          :key="subItem.index"
          :index="subItem.index"
          @click="jumpMenuPath(subItem.path)">
        {{ subItem.label }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>

  <div style="padding-top:20px;">
    <el-breadcrumb>
      <el-breadcrumb-item
          v-for="(breadcrumb, index) in breadcrumbs"
          :key="index"
          :to="breadcrumb.path ? breadcrumb.path : undefined" >
        {{ breadcrumb.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message, Money, Refresh, User } from '@element-plus/icons-vue';

// Use the router and route instances
const router = useRouter();
const route = useRoute();

// Define the types for menu items
interface MenuItem {
  index: string;
  label: string;
  path: string;
  children?: MenuItem[];
}

// Define the main menu items
const menuItems: MenuItem[] = [
  { index: '1', label: '首页', path: '/' ,children:[] },
  { index: '2', label: '资产', path: '/property', children:[] },
  { index: '3', label: '我的应用', path: '/my-app', children:[] },
  { index: '4', label: 'Oz生态', path: '/oz-ecosystem', children:[] },
  {
    index: '5',
    label: '用户中心',
    path: '/user',
    children: [
      { index: '5-1', label: '信息管理', path: '/user/info' },
      { index: '5-2', label: '地址管理', path: '/user/address' },
      { index: '5-3', label: '企业商户端', path: '/user/merchant' },
      { index: '5-4', label: '白名单', path: '/user/white-list' },
      { index: '5-5', label: '绑定授权', path: '/user/bind-auth' },
    ]
  },
];

// Default active menu item based on the current route
const activeIndex = computed(() => {
  const currentPath = route.path;
  const foundItem = menuItems.find(item => item.path === currentPath) ||
      menuItems.reduce<MenuItem | undefined>((found, item) =>
          found || item.children?.find(child => child.path === currentPath), undefined);
  return foundItem ? foundItem.index : '1';

});

const jumpMenuPath = (path: string) => {
  if(path === '') {
    return;
  }
  router.push(path); // Use Vue Router for navigation
};

// Dynamic breadcrumbs based on the current route
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean); // Remove empty segments
  const breadcrumbList = paths.map((path, index) => {
    const fullPath = '/' + paths.slice(0, index + 1).join('/');
    console.log(fullPath);
    // Find the corresponding label in menuItems
    const menuItem = menuItems.find(item => item.path === fullPath) ||
        menuItems.reduce<MenuItem | null>((found, item) => found || (item.children ? item.children.find(child => child.path === fullPath) : null) || null, null);

    return {
      label: menuItem ? menuItem.label : path, // Use label from menuItem or fallback to path
      path: fullPath,
    };
  });

  return [{ label: 'auPay客户端', path: '/' }, ...breadcrumbList];
});
</script>

<style scoped>
.item {
  margin-top: 10px;
  margin-right: 40px;
}
</style>