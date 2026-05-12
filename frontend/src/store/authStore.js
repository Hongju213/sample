import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 샘플 사용자 입력값을 전역으로 보관한다.
// persist를 사용하므로 새로고침 후에도 마지막 입력값이 유지된다.
export const useAuthStore = create(
  persist(
    set => ({
      username: 'root',
      password: 'root',
      setCredentials: (username, password) => set({ username, password }),
      clear: () => set({ username: '', password: '' })
    }),
    {
      name: 'sample-auth'
    }
  )
);
