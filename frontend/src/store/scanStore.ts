import { create } from 'zustand';
import type { ScanUploadResponse, DiagnosisResponse, ScanStep } from '../types';

interface ScanState {
  step: ScanStep;
  uploadedImageUrl: string | null;
  scanResult: ScanUploadResponse | null;
  diagnosis: DiagnosisResponse | null;
  setStep: (step: ScanStep) => void;
  setUploadedImageUrl: (url: string | null) => void;
  setScanResult: (result: ScanUploadResponse | null) => void;
  setDiagnosis: (diagnosis: DiagnosisResponse | null) => void;
  reset: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  step: 'idle',
  uploadedImageUrl: null,
  scanResult: null,
  diagnosis: null,

  setStep: (step) => set({ step }),
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),
  setScanResult: (result) => set({ scanResult: result }),
  setDiagnosis: (diagnosis) => set({ diagnosis }),
  reset: () =>
    set({
      step: 'idle',
      uploadedImageUrl: null,
      scanResult: null,
      diagnosis: null,
    }),
}));
