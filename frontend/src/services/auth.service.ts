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
};
