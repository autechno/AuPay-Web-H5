const isDev = process.env.NODE_ENV === 'development'
const timestamp = Date.now()
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'themes',
  devServer: {
    port: process.env.PORT
  },
  ssr: true,
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: `/favicon.ico` }],
      script: []
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  runtimeConfig: {
    public: {
      API_HOST: process.env.BASE_URL,
      timestamp
    }
  },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@element-plus/nuxt'
  ],
  piniaPersistedstate: { storage: 'localStorage' },
  pinia: {
    autoImports: ['defineStore', 'storeToRefs']
  },
  css: ['element-plus/dist/index.css'],
  nitro: {
    devProxy: {
      '/app/v1': {
        target: 'http://127.0.0.1:8090',
        changeOrigin: true,
        prependPath: true
      }
    },
    // 该配置用于服务端请求转发
    routeRules: {
      '/app/v1/**': {
        proxy: 'http://127.0.0.1:8090/**'
      }
    }
  },

  compatibilityDate: '2025-01-01'
})