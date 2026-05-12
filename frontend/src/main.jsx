import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';
import './index.css';

// React Query 기본값은 화면 전체에서 공유된다.
// retry를 1회만 허용해서 개발 중 API 장애를 빠르게 확인할 수 있게 했다.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          colorPrimary: '#1f6feb',
          borderRadius: 6,
          fontFamily:
            'Inter, Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        },
        components: {
          Layout: {
            bodyBg: '#f6f8fb',
            headerBg: '#ffffff',
            siderBg: '#14213d'
          }
        }
      }}
    >
      <AntdApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);
