import api from './axios';
import type { ScanStats, DiseaseStatItem } from '../types';

export const statsApi = {
  getScanStats: async (): Promise<ScanStats> => {
    const response = await api.get('/api/v1/stats/scans');
    return response.data;
  },

  getDiseaseStats: async (): Promise<DiseaseStatItem[]> => {
    const response = await api.get('/api/v1/stats/diseases');
    return response.data;
  },
};
