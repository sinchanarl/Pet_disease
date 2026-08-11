import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Loader2, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { scanApi } from '../api/scanApi';
import { useScanStore } from '../store/scanStore';
import type { PetScan, DiagnosisResponse } from '../types';
import BoundingBoxViewer from '../components/scan/BoundingBoxViewer';
import SeverityBadge from '../components/diagnosis/SeverityBadge';
import DiagnosisCard from '../components/diagnosis/DiagnosisCard';

export default function ResultsPage() {
  const { scan_id } = useParams<{ scan_id: string }>();
  const { uploadedImageUrl, scanResult } = useScanStore();
  const [scan, setScan] = useState<PetScan | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(uploadedImageUrl);
  const [loading, setLoading] = useState(true);
  const [diagLoading, setDiagLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!scan_id) return;
    const loadScan = async () => {
      try {
        // Use cached scan result if available
        if (scanResult && scanResult.scan_id === scan_id) {
          setScan({
            id: scan_id,
            is_valid_pet: scanResult.is_valid_pet,
            is_healthy: scanResult.is_healthy,
            result: scanResult.analysis,
            created_at: new Date().toISOString(),
          });
        } else {
          const data = await scanApi.getScan(scan_id);
          setScan(data);
        }
      } catch {
        // not found
      } finally {
        setLoading(false);
      }
    };

    const loadDiagnosis = async () => {
      try {
        const diag = await scanApi.getDiagnosis(scan_id);
        setDiagnosis(diag);
      } catch {
        // silent
      } finally {
        setDiagLoading(false);
      }
    };

    loadScan();
    loadDiagnosis();
  }, [scan_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-white font-semibold">Scan not found</p>
        <Link to="/history" className="text-primary-400 text-sm hover:text-primary-300">
          ← Back to history
        </Link>
      </div>
    );
  }

  const qa = scan.result?.qa;
  const bboxes = scan.result?.bboxes || [];
  const petName = qa?.detected_pet || 'Unknown';
  const disease = qa?.suspected_condition;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Scan Results</h1>
            <p className="text-slate-500 text-xs font-mono">{scan_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/report/${scan_id}`}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Report
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column - Image + metadata */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image with bounding boxes */}
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">Pet Image</h2>
              {bboxes.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {bboxes.length} detection{bboxes.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {imageUrl ? (
              <BoundingBoxViewer imageUrl={imageUrl} detections={bboxes} />
            ) : (
              <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                Image not available
              </div>
            )}
          </div>

          {/* Health status card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-white/5 rounded-2xl p-5"
          >
            <h2 className="text-white font-semibold mb-4">Health Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <SeverityBadge isHealthy={scan.is_healthy} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Pet Detected</span>
                <span className="text-white text-sm font-medium capitalize">{petName}</span>
              </div>
              {disease && disease !== 'None' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Condition</span>
                  <span className="text-red-400 text-sm font-medium">{disease}</span>
                </div>
              )}
              {bboxes.length > 0 && (
                <div className="pt-3 border-t border-white/5">
                  <p className="text-slate-400 text-xs mb-2">Detected Regions</p>
                  <div className="space-y-1.5">
                    {bboxes.map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-sm flex-shrink-0" />
                        {b.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!disease || disease === 'None' ? (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 mt-2">
                  <span className="text-green-400 text-sm">✓ No diseases detected. Your pet appears healthy!</span>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>

        {/* Right column - Diagnosis */}
        <div className="lg:col-span-3">
          {diagLoading ? (
            <div className="bg-dark-800 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 min-h-64">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              <p className="text-slate-400 text-sm">Generating AI Diagnosis...</p>
              <p className="text-slate-600 text-xs">Consulting Gemini AI</p>
            </div>
          ) : diagnosis ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <DiagnosisCard diagnosis={diagnosis} />
            </motion.div>
          ) : (
            <div className="bg-dark-800 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 min-h-64">
              <RefreshCw className="w-8 h-8 text-slate-600" />
              <p className="text-slate-400 text-sm">Diagnosis unavailable</p>
              <p className="text-slate-600 text-xs">Backend may be offline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
