import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 本地开发时将 /api 代理到后端（compose 映射端口 21104，可用 VITE_API_TARGET 覆盖）。
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:21104",
        changeOrigin: true
      }
    }
  }
});
