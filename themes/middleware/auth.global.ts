import { defineNuxtRouteMiddleware, useCookie, useNuxtApp } from 'nuxt/app'

export default defineNuxtRouteMiddleware((to, from) => {
    //路由守卫
    /*
    if (process.client) {
      //只在客户端显示
      const token = useCookie('appToken')
      const noTokenPath = ['/login', '/register']
      if (!noTokenPath.includes(to.path)) {
        if (!token.value) {
          //延迟500, 跳转登录
        }
      }
    }*/
})
