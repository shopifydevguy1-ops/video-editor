import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthResponse } from '@ai-video-editor/shared';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setAuth: (authResponse: AuthResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await apiClient.instance.post<AuthResponse>('/auth/login', {
          email,
          password,
        });
        const { user, accessToken } = response.data;
        apiClient.setToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      register: async (email: string, password: string, name: string) => {
        const response = await apiClient.instance.post<AuthResponse>('/auth/register', {
          email,
          password,
          name,
        });
        const { user, accessToken } = response.data;
        apiClient.setToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },

      logout: () => {
        apiClient.instance.defaults.headers.Authorization = '';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      setAuth: (authResponse: AuthResponse) => {
        const { user, accessToken } = authResponse;
        apiClient.setToken(accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

