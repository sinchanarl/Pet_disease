import api from './axios';
import type { PetScan, ScanUploadResponse, DiagnosisResponse } from '../types';

export const scanApi = {
  uploadScan: async (formData: FormData): Promise<ScanUploadResponse> => {
    const response = await api.post('/api/v1/pets/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getScans: async (limit = 20, offset = 0): Promise<PetScan[]> => {
    const response = await api.get('/api/v1/scans/', { params: { limit, offset } });
    return response.data;
  },

  getScan: async (scanId: string): Promise<PetScan> => {
    const response = await api.get(`/api/v1/scans/${scanId}`);
    return response.data;
  },

  getDiagnosis: async (scanId: string): Promise<DiagnosisResponse> => {
    const response = await api.get(`/api/v1/scans/${scanId}/diagnosis`);
    return response.data;
  },

  getScanSummary: async (scanId: string) => {
    const response = await api.get(`/api/v1/scans/${scanId}/summary`);
    return response.data;
  },

  deleteScan: async (scanId: string): Promise<void> => {
    await api.delete(`/api/v1/scans/${scanId}`);
  },
};
