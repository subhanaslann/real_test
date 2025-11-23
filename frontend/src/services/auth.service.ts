import { apiClient } from './api.client';

export interface User {
  id: number;
  username: string;
  avatarUrl: string;
}

export const authService = {
  login: () => {
    // Redirects to Backend GitHub Auth Endpoint
    window.location.href = `${apiClient.defaults.baseURL}/auth/github`;
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  getRepos: async (): Promise<any[]> => {
    const response = await apiClient.get('/auth/repos');
    return response.data;
  },

  logout: () => {
    // Assuming token is stored in cookies by the backend auth flow, 
    // but if we were using local storage:
    localStorage.removeItem('accessToken'); 
    // If backend uses cookies, we might need a backend logout endpoint. 
    // But based on prompt "localStorage.removeItem", I will follow prompt.
    // Note: The current auth flow seems to use cookies or token in URL? 
    // The backend redirects to /auth/callback?token=...
    // The frontend likely processes this token and stores it.
    // I will assume standard localStorage usage as requested.
    window.location.href = '/login';
  }
};
