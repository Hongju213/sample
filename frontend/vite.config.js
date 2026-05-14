import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 샘플 화면은 src/dev/testData.json만 읽는다.
// 별도 백엔드 프록시를 두지 않아 네트워크 상태와 무관하게 화면을 검토할 수 있다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true
      }
    }
  }
});
