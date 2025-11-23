import { apiClient } from './api.client';

export interface Job {
  id: number;
  repoUrl: string;
  status: 'PENDING' | 'CLONING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  result?: any;
}

export const jobsService = {
  createJob: async (repoUrl: string) => {
    const response = await apiClient.post('/jobs', { repoUrl });
    return response.data;
  },

  getAllJobs: async (): Promise<Job[]> => {
    const response = await apiClient.get('/jobs');
    return response.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },
};
