import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Plus, Loader2, User, Calendar, VenetianMask } from 'lucide-react';
import { petApi } from '../api/petApi';
import type { Pet, PetCreate } from '../types';
import toast from 'react-hot-toast';

const PET_TYPES = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Hamster', 'Other'];
const GENDERS = ['Male', 'Female'];

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PetCreate>({ pet_name: '', pet_type: 'Dog', age: undefined, gender: '' });

  useEffect(() => {
    petApi.listPets().then(setPets).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pet_name || !form.pet_type) {
      toast.error('Name and type are required');
      return;
    }
    setSubmitting(true);
    try {
      const pet = await petApi.createPet(form);
      setPets((prev) => [pet, ...prev]);
      setForm({ pet_name: '', pet_type: 'Dog', age: undefined, gender: '' });
      setShowForm(false);
      toast.success(`${pet.pet_name} added! 🐾`);
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  const petEmoji: Record<string, string> = {
    Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐇', Fish: '🐟', Hamster: '🐹', Other: '🐾',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Pets</h1>
          <p className="text-slate-400 text-sm mt-1">{pets.length} registered pet{pets.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Pet
        </button>
      </div>

      {/* Add Pet Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-primary-500/30 rounded-2xl p-6"
        >
          <h2 className="text-white font-bold mb-5">Register New Pet</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Pet Name *</label>
              <input
                type="text"
                value={form.pet_name}
                onChange={(e) => setForm({ ...form, pet_name: e.target.value })}
                placeholder="e.g., Buddy"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Pet Type *</label>
              <select
                value={form.pet_type}
                onChange={(e) => setForm({ ...form, pet_type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                {PET_TYPES.map((t) => <option key={t} value={t} className="bg-dark-800">{t}</option>)}
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Age (years)</label>
              <input
                type="number"
                value={form.age ?? ''}
                onChange={(e) => setForm({ ...form, age: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="e.g., 3"
                min={0}
                max={30}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block font-medium">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="" className="bg-dark-800">Select gender</option>
                {GENDERS.map((g) => <option key={g} value={g} className="bg-dark-800">{g}</option>)}
              </select>
            </div>

            {/* Buttons */}
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? 'Registering...' : 'Register Pet'}
              </motion.button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Pets Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading pets...</span>
        </div>
      ) : pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PawPrint className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No pets registered</h3>
          <p className="text-slate-400 text-sm mb-6">Add your first pet to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Add First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((pet, i) => (
            <motion.div
              key={pet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-dark-800 border border-white/5 rounded-2xl p-5 card-hover"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center text-3xl">
                  {petEmoji[pet.pet_type] || '🐾'}
                </div>
                <div>
                  <h3 className="text-white font-bold">{pet.pet_name}</h3>
                  <p className="text-primary-400 text-xs font-medium">{pet.pet_type}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/5">
                {pet.age && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{pet.age} year{pet.age > 1 ? 's' : ''} old</span>
                  </div>
                )}
                {pet.gender && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <VenetianMask className="w-3.5 h-3.5" />
                    <span>{pet.gender}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5" />
                  <span className="font-mono">{pet.id.slice(-8)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
