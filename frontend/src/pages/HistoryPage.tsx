import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ScanLine, ChevronRight, Trash2, Filter, LayoutGrid, LayoutList, Loader2
} from 'lucide-react';
import { scanApi } from '../api/scanApi';
import type { PetScan } from '../types';
import SeverityBadge from '../components/diagnosis/SeverityBadge';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const [scans, setScans] = useState<PetScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'unhealthy'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadScans = async (reset = false) => {
    setLoading(true);
    try {
      const off = reset ? 0 : offset;
      const data = await scanApi.getScans(PAGE_SIZE, off);
      if (reset) {
        setScans(data);
        setOffset(PAGE_SIZE);
      } else {
        setScans((prev) => [...prev, ...data]);
        setOffset((p) => p + PAGE_SIZE);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans(true);
  }, []);

  const handleDelete = async (scanId: string) => {
    try {
      await scanApi.deleteScan(scanId);
      setScans((prev) => prev.filter((s) => s.id !== scanId));
      toast.success('Scan deleted');
    } catch {
      // handled
    }
  };

  const filtered = scans.filter((s) => {
    const pet = s.result?.qa?.detected_pet?.toLowerCase() || '';
    const disease = s.result?.qa?.suspected_condition?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchSearch = !q || pet.includes(q) || disease.includes(q) || s.id.includes(q);
    const matchHealth =
      healthFilter === 'all' ||
      (healthFilter === 'healthy' && s.is_healthy) ||
      (healthFilter === 'unhealthy' && !s.is_healthy);
    return matchSearch && matchHealth;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan History</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} record{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link
          to="/scan"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <ScanLine className="w-4 h-4" />
          New Scan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pet, disease or scan ID..."
            className="w-full bg-dark-800 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Health filter */}
        <div className="flex bg-dark-800 border border-white/10 rounded-xl p-1 gap-1">
          {(['all', 'healthy', 'unhealthy'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setHealthFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                healthFilter === f
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex bg-dark-800 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'card' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && scans.length === 0 ? (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          <span className="text-slate-400 text-sm">Loading scan history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ScanLine className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No scans found</h3>
          <p className="text-slate-400 text-sm mb-6">
            {search || healthFilter !== 'all' ? 'Try adjusting filters' : 'Upload your first scan to get started'}
          </p>
          <Link
            to="/scan"
            className="bg-primary-600 text-white text-sm font-medium px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Start a Scan
          </Link>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs text-slate-500 font-semibold px-5 py-3">Pet</th>
                <th className="text-left text-xs text-slate-500 font-semibold px-5 py-3">Condition</th>
                <th className="text-left text-xs text-slate-500 font-semibold px-5 py-3">Status</th>
                <th className="text-left text-xs text-slate-500 font-semibold px-5 py-3">Date</th>
                <th className="text-left text-xs text-slate-500 font-semibold px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((scan, i) => {
                const qa = scan.result?.qa;
                const petName = qa?.detected_pet || 'Unknown';
                const disease = qa?.suspected_condition;
                const date = new Date(scan.created_at).toLocaleDateString();
                return (
                  <motion.tr
                    key={scan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{scan.is_healthy ? '🐾' : '🏥'}</span>
                        <span className="text-white text-sm font-medium capitalize">{petName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-sm ${disease && disease !== 'None' ? 'text-red-400' : 'text-green-400'}`}>
                        {disease && disease !== 'None' ? disease : 'None'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <SeverityBadge isHealthy={scan.is_healthy} size="sm" />
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-slate-400 text-xs">{date}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/results/${scan.id}`}
                          className="flex items-center gap-1 text-primary-400 text-xs hover:text-primary-300 transition-colors"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((scan, i) => {
            const qa = scan.result?.qa;
            const petName = qa?.detected_pet || 'Unknown';
            const disease = qa?.suspected_condition;
            const date = new Date(scan.created_at).toLocaleDateString();
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-dark-800 border border-white/5 rounded-2xl p-5 card-hover"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{scan.is_healthy ? '🐾' : '🏥'}</span>
                    <div>
                      <p className="text-white font-semibold text-sm capitalize">{petName}</p>
                      <p className="text-slate-500 text-xs font-mono">{scan.id.slice(-8)}</p>
                    </div>
                  </div>
                  <SeverityBadge isHealthy={scan.is_healthy} size="sm" />
                </div>
                <p className={`text-sm mb-3 ${disease && disease !== 'None' ? 'text-red-400' : 'text-green-400'}`}>
                  {disease && disease !== 'None' ? disease : 'No disease detected'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-slate-500 text-xs">{date}</span>
                  <Link
                    to={`/results/${scan.id}`}
                    className="text-primary-400 text-xs hover:text-primary-300 transition-colors flex items-center gap-1"
                  >
                    View report <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <button
            onClick={() => loadScans(false)}
            className="bg-dark-800 border border-white/10 text-slate-300 text-sm px-6 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Load more scans
          </button>
        </div>
      )}
    </div>
  );
}
