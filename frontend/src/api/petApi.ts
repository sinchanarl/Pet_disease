import api from './axios';
import type { Pet, PetCreate } from '../types';

export const petApi = {
  createPet: async (data: PetCreate): Promise<Pet> => {
    const response = await api.post('/api/v1/pets/', data);
    return response.data;
  },

  listPets: async (): Promise<Pet[]> => {
    const response = await api.get('/api/v1/pets/');
    return response.data;
  },

  getPet: async (petId: string): Promise<Pet> => {
    const response = await api.get(`/api/v1/pets/${petId}`);
    return response.data;
  },
};
