import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Vite 설정도 JavaScript로 유지한다. 이 프로젝트는 TypeScript 빌드 단계를 쓰지 않는다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // API 서버가 켜져 있으면 프론트에서 /api 호출을 그대로 백엔드로 전달한다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/actuator': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
