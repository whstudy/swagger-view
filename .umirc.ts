import { defineConfig } from "umi";
const target = 'https://10.128.137.239/'; // product BVT
export default defineConfig({
  title: "swagger-view",
  history: {
    type: 'hash'
  },
  routes: [
    { 
      path: "/", 
      component: "index" 
    },
    {
      path: "/swagger-ui",
      component: "swagger-ui",
    },
  ],
  proxy: {
    '/api/': {
      target: 'http://10.128.132.126/',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/swagger/': {
      target: 'http://10.128.132.126/',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/dsm/': {
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/portal/': {
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
    '/ui/': {
      target,
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
    },
  },
  npmClient: 'yarn',
  favicons: [
    // 此时将指向 `/favicon.png` ，确保你的项目含有 `public/favicon.png`
    '/favicon.ico'
  ]
});
