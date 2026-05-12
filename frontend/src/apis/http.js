import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

// 모든 API 호출이 공유하는 axios 인스턴스다.
// VITE_API_BASE_URL이 있으면 외부 API 서버를, 없으면 Vite proxy(/api)를 사용한다.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  timeout: 10_000
});

http.interceptors.request.use(config => {
  const { username, password } = useAuthStore.getState();

  if (username && password) {
    config.headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
  }

  return config;
});
