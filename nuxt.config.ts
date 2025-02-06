const isDev = process.env.NODE_ENV === 'development'
const timestamp = Date.now()
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'themes',
  target: 'static',
  devServer: {
    port: process.env.PORT
  },
  router: {
    middleware: ['refresh']
  },
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
  elementPlus:{
    defaultLocale:'zh-cn'
  },
  css: ['element-plus/dist/index.css'],
  nitro: {
    devProxy: {
      '/app/v1': {
        target: 'http://192.168.1.131:9000',
        changeOrigin: true,
        prependPath: true
      }
    },
    routeRules: {
      '/app/v1/**': {
        proxy: 'http://192.168.1.131:9000/**'
      }
    }
  },
  compatibilityDate: '2025-01-01'
})
