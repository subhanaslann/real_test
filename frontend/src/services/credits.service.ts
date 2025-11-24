import { apiClient } from './api.client';

export interface CreditStatus {
  creditsRemaining: number;
  creditsTotal: number;
  subscriptionTier: 'FREE' | 'STARTER' | 'PRO' | 'UNLIMITED';
  lastReset: string;
  nextReset: string;
  isUnlimited: boolean;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  reason: string;
  createdAt: string;
  job?: {
    id: number;
    repoUrl: string;
    status: string;
    createdAt: string;
  };
}

export const creditsService = {
  getStatus: async (): Promise<CreditStatus> => {
    const response = await apiClient.get('/credits/status');
    return response.data;
  },

  getHistory: async (limit: number = 50): Promise<CreditTransaction[]> => {
    const response = await apiClient.get(`/credits/history?limit=${limit}`);
    return response.data;
  },

  checkCredits: async (): Promise<boolean> => {
    const response = await apiClient.get('/credits/check');
    return response.data.hasCredits;
  },
};
