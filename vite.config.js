import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 支持 import 不带 vue 后缀
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 导出全局的 scss 变量，避免 @import 的使用
        additionalData: `@use "/src/assets/style/globalVars.scss" as *;`,
      },
    },
  },
})
