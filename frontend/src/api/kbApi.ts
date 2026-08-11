import api from './axios';
import type { KBEntry } from '../types';

export const kbApi = {
  getKB: async (filters?: { pet_name?: string; disease_name?: string }): Promise<KBEntry[]> => {
    const response = await api.get('/api/v1/kb/', { params: filters });
    return response.data;
  },

  getDiseases: async (pet_name?: string): Promise<string[]> => {
    const response = await api.get('/api/v1/kb/diseases', { params: pet_name ? { pet_name } : undefined });
    return response.data;
  },

  createKBEntry: async (data: Omit<KBEntry, 'id'>): Promise<KBEntry> => {
    const response = await api.post('/api/v1/kb/', data);
    return response.data;
  },
};
