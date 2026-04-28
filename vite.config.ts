import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 同时监听 IPv4(127.0.0.1) 与常见局域网地址，避免仅绑定 ::1 时浏览器用 localhost/127.0.0.1 出现 ERR_CONNECTION_REFUSED
  server: {
    host: true,
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
