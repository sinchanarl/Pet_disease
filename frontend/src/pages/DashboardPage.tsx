import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, Heart, AlertCircle, ScanLine, TrendingUp, Plus, ChevronRight,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { statsApi } from '../api/statsApi';
import { scanApi } from '../api/scanApi';
import type { ScanStats, DiseaseStatItem, PetScan } from '../types';
import SeverityBadge from '../components/diagnosis/SeverityBadge';

const COLORS = ['#0d9488', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Mock trend data for chart (since backend doesn't have timeseries)
const trendData = [
  { day: 'Mon', scans: 2, healthy: 1 },
  { day: 'Tue', scans: 5, healthy: 3 },
  { day: 'Wed', scans: 3, healthy: 2 },
  { day: 'Thu', scans: 8, healthy: 5 },
  { day: 'Fri', scans: 4, healthy: 3 },
  { day: 'Sat', scans: 6, healthy: 4 },
  { day: 'Sun', scans: 3, healthy: 2 },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border border-white/5 rounded-2xl p-6 card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-slate-600" />
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<ScanStats | null>(null);
  const [diseases, setDiseases] = useState<DiseaseStatItem[]>([]);
  const [recentScans, setRecentScans] = useState<PetScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, d, scans] = await Promise.all([
          statsApi.getScanStats(),
          statsApi.getDiseaseStats(),
          scanApi.getScans(5),
        ]);
        setStats(s);
        setDiseases(d);
        setRecentScans(scans);
      } catch {
        // silently fail — show zeros
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const pieData = diseases.slice(0, 6).map((d) => ({
    name: d.disease_name,
    value: d.count,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">AI Pet Health Overview</p>
        </div>
        <Link
          to="/scan"
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Scan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          icon={ScanLine}
          label="Total Scans"
          value={loading ? '...' : (stats?.total_scans ?? 0)}
          color="bg-primary-500/20 text-primary-400"
          sub="All time"
        />
        <StatCard
          icon={Heart}
          label="Healthy Pets"
          value={loading ? '...' : (stats?.healthy ?? 0)}
          color="bg-green-500/20 text-green-400"
          sub={`${stats ? Math.round((stats.healthy / (stats.total_scans || 1)) * 100) : 0}% of total`}
        />
        <StatCard
          icon={AlertCircle}
          label="Unhealthy Pets"
          value={loading ? '...' : (stats?.unhealthy ?? 0)}
          color="bg-red-500/20 text-red-400"
          sub="Need attention"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-dark-800 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold">Scan Trends</h2>
              <p className="text-slate-400 text-xs mt-1">This week's activity</p>
            </div>
            <Activity className="w-5 h-5 text-slate-600" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="scans" stroke="#0d9488" strokeWidth={2} fill="url(#colorScans)" name="Scans" />
              <Area type="monotone" dataKey="healthy" stroke="#3b82f6" strokeWidth={2} fill="url(#colorHealthy)" name="Healthy" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-white font-bold">Top Diseases</h2>
            <p className="text-slate-400 text-xs mt-1">Most detected conditions</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {pieData.slice(0, 3).map(({ name, value }, i) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-300 truncate max-w-[120px]">{name}</span>
                    </div>
                    <span className="text-slate-400">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
              <CheckCircle2 className="w-8 h-8 mb-2 text-green-600" />
              <p className="text-xs">All pets healthy!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold">Recent Scans</h2>
            <p className="text-slate-400 text-xs mt-1">Last 5 analyses</p>
          </div>
          <Link to="/history" className="flex items-center gap-1 text-primary-400 text-xs hover:text-primary-300 transition-colors">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentScans.length === 0 ? (
          <div className="text-center py-12">
            <ScanLine className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No scans yet</p>
            <Link to="/scan" className="text-primary-400 text-sm hover:text-primary-300 mt-2 inline-block">
              Upload your first scan →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => {
              const qa = scan.result?.qa;
              const disease = qa?.suspected_condition || 'None';
              const petName = qa?.detected_pet || 'Unknown';
              return (
                <Link
                  key={scan.id}
                  to={`/results/${scan.id}`}
                  className="flex items-center justify-between p-4 bg-white/3 hover:bg-white/5 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${scan.is_healthy ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                      {scan.is_healthy ? '🐾' : '🏥'}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium capitalize">{petName}</div>
                      <div className="text-slate-400 text-xs">{disease === 'None' ? 'Healthy' : disease}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SeverityBadge isHealthy={scan.is_healthy} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
