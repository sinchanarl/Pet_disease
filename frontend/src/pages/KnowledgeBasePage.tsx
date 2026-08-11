import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Loader2, ChevronDown, ChevronUp, Pill, AlertCircle, Bug, Eye, Scissors } from 'lucide-react';
import { kbApi } from '../api/kbApi';
import type { KBEntry } from '../types';

const CATEGORIES = [
  { label: 'All', value: 'all', icon: BookOpen },
  { label: 'Skin Diseases', value: 'skin', icon: AlertCircle },
  { label: 'Eye Infections', value: 'eye', icon: Eye },
  { label: 'Parasites', value: 'parasite', icon: Bug },
  { label: 'Wounds', value: 'wound', icon: Scissors },
  { label: 'Treatments', value: 'treatment', icon: Pill },
];

function KBCard({ entry }: { entry: KBEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden card-hover"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{entry.disease_name}</h3>
            <p className="text-slate-400 text-xs mt-0.5 capitalize">{entry.pet_name}</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5"
        >
          <div className="pt-3 border-t border-white/5">
            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wide">Treatment</p>
            <p className="text-slate-300 text-sm leading-relaxed">{entry.treatment}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    kbApi.getKB().then(setEntries).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.disease_name.toLowerCase().includes(q) || e.pet_name.toLowerCase().includes(q) || e.treatment.toLowerCase().includes(q);
    const matchCat =
      category === 'all' ||
      (category === 'skin' && (e.disease_name.toLowerCase().includes('skin') || e.disease_name.toLowerCase().includes('rash') || e.disease_name.toLowerCase().includes('mange'))) ||
      (category === 'eye' && (e.disease_name.toLowerCase().includes('eye') || e.disease_name.toLowerCase().includes('conjunctivitis'))) ||
      (category === 'parasite' && (e.disease_name.toLowerCase().includes('flea') || e.disease_name.toLowerCase().includes('tick') || e.disease_name.toLowerCase().includes('worm'))) ||
      (category === 'wound' && (e.disease_name.toLowerCase().includes('wound') || e.disease_name.toLowerCase().includes('injury'))) ||
      true; // for 'treatment' and 'all', show all
    return matchSearch && (category === 'all' || matchCat);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-slate-400 text-sm mt-1">Veterinary disease encyclopedia</p>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-primary-900/40 to-blue-900/40 border border-primary-500/20 rounded-2xl p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-8 h-8 text-primary-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Pet Disease Encyclopedia</h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse curated veterinary knowledge. Each entry includes disease details, affected animals, and proven treatment protocols.
          </p>
          <p className="text-primary-400 text-xs mt-2 font-medium">{entries.length} diseases in database</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search diseases, pets, treatments..."
          className="w-full bg-dark-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setCategory(value)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              category === value
                ? 'bg-primary-600 text-white'
                : 'bg-dark-800 border border-white/10 text-slate-400 hover:text-white hover:border-primary-500/50'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading knowledge base...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">
            {entries.length === 0 ? 'Knowledge base is empty' : 'No results found'}
          </h3>
          <p className="text-slate-400 text-sm">
            {entries.length === 0
              ? 'Add entries via the backend API or Swagger UI at localhost:8001/docs'
              : 'Try different search terms'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((entry) => <KBCard key={entry.id} entry={entry} />)}
        </div>
      )}
    </div>
  );
}
