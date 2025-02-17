<template>
  <div class="flex items-center justify-end" style="text-align: right;">
    <!-- 刷新链接 -->
    <span style="padding-right:16px;">
      <a href="/flash-exchange">
        <el-icon style="font-size: 20px; position: relative; top: 4px;"><Refresh /></el-icon>闪兑
      </a>
    </span>
    <!-- 充值/提现链接 -->
    <span style="padding-right:16px;">
      <a href="/charge-withdraw/transfer">
        <el-icon style="font-size: 20px; position: relative; top: 4px;"><Money /></el-icon>充值/提现
      </a>
    </span>
    <!-- 消息通知图标 -->
    <el-badge :is-dot="isReadMessage" class="item" >
      <a href="/message"><el-avatar :size="20" class="mr-3" :icon="Message" /></a>
    </el-badge>
    <el-dropdown style="padding-right:16px; margin-top: 5px;" @command="handleCommand">
      <el-avatar :size="20" class="mr-3" :icon="User" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item
              v-for="(item, index) in userItems"
              :key="item.key"
              :command="item.command">
            {{ item.name }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

  </div>

  <!-- 菜单 -->
  <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      background-color="#545c64"
      text-color="#fff"
      active-text-color="#ffd04b"
  >
    <!-- 主菜单项 -->
    <el-menu-item
        v-for="item in menuItems.slice(0, 4)"
        :key="item.index"
        :index="item.index"
        @click="jumpMenuPath(item.path)"> {{ item.label }}
    </el-menu-item>

    <!-- 子菜单 -->
    <el-sub-menu index="5">
      <template #title>用户中心</template>
      <el-menu-item
          v-for="subItem in menuItems[4].children"
          :key="subItem.index"
          :index="subItem.index"
          @click="jumpMenuPath(subItem.path)"> {{ subItem.label }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>

  <!-- 面包屑导航 -->
  <div style="padding-top:20px;">
    <el-breadcrumb>
      <el-breadcrumb-item
          v-for="(breadcrumb, index) in breadcrumbs"
          :key="index"
          :to="breadcrumb.path ? breadcrumb.path : undefined"> {{ breadcrumb.label }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Message, Money, Refresh, User } from '@element-plus/icons-vue';
import { getHeader } from '@/utils/storageUtils';
import {ElMessage} from "element-plus";
const headers = getHeader();
const { userApi, messageApi } = useServer();

// 使用路由和路由实例
const router = useRouter();
const route = useRoute();
const isReadMessage = ref(false);

// 定义下拉菜单项
const userItems = [
  { key: 'login', name: '登录', command: '/user/login' },
  { key: 'user', name: '账号', command: '/user' },
  { key: 'register', name: '注册', command: '/user/register' },
  { key: 'settings', name: '设置', command: '/user/setting' },
  { key: 'logout', name: '退出', command: '/user/logout' },
];

// 定义菜单项的类型
interface MenuItem {
  index: string;
  label: string;
  path: string;
  children?: MenuItem[];
}

// 定义主要的菜单项
const menuItems: MenuItem[] = [
  { index: '1', label: '首页', path: '/' ,children:[] },
  { index: '2', label: '资产', path: '/assets-account', children:[] },
  { index: '3', label: '我的应用', path: '/my-app', children:[] },
  { index: '4', label: 'Oz生态', path: '/oz-ecosystem', children:[] },
  {
    index: '5',
    label: '用户中心',
    path: '/user',
    children: [
      { index: '5-1', label: '信息管理', path: '/user/info' },
      { index: '5-2', label: '地址管理', path: '/user/address' },
      { index: '5-3', label: '绑定授权', path: '/user' },
      { index: '5-4', label: '账户管理', path: '/user' },
      { index: '5-5', label: '用户协议', path: '/user' },
    ]
  },
];

// 根据当前路由确定默认活动菜单项
const activeIndex = computed(() => {
  const currentPath = route.path;
  const foundItem = menuItems.find(item => item.path === currentPath) ||
      menuItems.reduce<MenuItem | undefined>((found, item) =>
          found || item.children?.find(child => child.path === currentPath), undefined);
  return foundItem ? foundItem.index : '1';
});

// 跳转到指定的菜单路径
const jumpMenuPath = (path: string) => {
  if (path === '') {
    return;
  }
  router.push(path);
};

// 动态面包屑导航，根据当前路由生成
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean); // 移除空段
  const breadcrumbList = paths.map((path, index) => {
    const fullPath = '/' + paths.slice(0, index + 1).join('/');
    // 过滤掉 charge-withdraw 路由
    if (path === 'charge-withdraw') {
      return null; // 返回 null 以在后续步骤中过滤
    }
    // 在菜单项中查找对应的标签
    const menuItem = menuItems.find(item => item.path === fullPath) ||
        menuItems.reduce<MenuItem | null>((found, item) => found || (item.children ? item.children.find(child => child.path === fullPath) : null) || null, null);
    return {
      label: menuItem ? menuItem.label : path,
      path: fullPath,
    };
  }).filter(Boolean);
  // 添加根面包屑
  return [{ label: 'auPay客户端', path: '/' }, ...breadcrumbList];
});

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  if (command === '/user/logout') {
    let res = await userApi.logout({}, headers);
    if (res.code === 200) {
      const userStore = UseUserStore();
      userStore.clearUserState()
      router.push("/");
    } else {
      ElMessage.error(res.message || '退出失败'); // 错误提示
    }
  }else{
    router.push(command);
  }
};

// 查询消息状态
const fetchData = async () => {
  try {
    let res = await messageApi.messageCount({}, headers);
    if (res.code == 200) {
      isReadMessage.value = res.data > 0;
    }
  }catch(err) {
    console.log(err.message);
  }
};
onMounted(() => {
  fetchData();
  // const intervalId = setInterval(fetchData, 10000);
  // onBeforeUnmount(() => {
  //   clearInterval(intervalId);
  // });
});

</script>

<style scoped>
.item {
  position: relative; top: -2px;
  margin-top: 10px;
  margin-right: 30px; /* 设置间距 */
}
</style>
