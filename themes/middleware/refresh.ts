// middleware/refresh.ts
import { defineNuxtRouteMiddleware } from 'nuxt/app';

export default defineNuxtRouteMiddleware(() => {
    // 确保在路由变化时刷新页面
    if (import.meta.client) {
        window.location.reload();
    }
});
