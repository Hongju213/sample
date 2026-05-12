import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  username: string;
  password: string;
  setCredentials: (username: string, password: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
