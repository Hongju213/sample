import axios from 'axios';
import { useAuthStore } from '../store/authStore.js';

export const CommonAxios = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
});

// 요청 인터셉터: Zustand authStore에서 Basic Auth 헤더를 동적으로 추출하여 주입
CommonAxios.interceptors.request.use(
  config => {
    const { username, password } = useAuthStore.getState();
    if (username && password) {
      config.headers.Authorization = `Basic ${window.btoa(`${username}:${password}`)}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 데이터 추출 자동화 (response.data Unwrap) 및 에러 가공
CommonAxios.interceptors.response.use(
  response => {
    // 백엔드가 반환하는 실제 JSON 페이로드만 바로 반환되도록 설정 (fetchJson과 호환성 유지)
    return response.data;
  },
  error => {
    const status = error.response?.status;
    const errorText = error.response?.data?.message || error.message;
    console.error(`[CommonAxios Error] Status: ${status}, Message: ${errorText}`);
    return Promise.reject(error);
  }
);

export default CommonAxios;
