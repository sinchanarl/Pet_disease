import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Printer, Loader2, Heart, AlertCircle, Stethoscope,
  Home, Clock, AlertTriangle
} from 'lucide-react';
import { scanApi } from '../api/scanApi';
import { useScanStore } from '../store/scanStore';
import type { PetScan, DiagnosisResponse } from '../types';
import SeverityBadge from '../components/diagnosis/SeverityBadge';

export default function ReportPage() {
  const { scan_id } = useParams<{ scan_id: string }>();
  const { uploadedImageUrl, scanResult } = useScanStore();
  const [scan, setScan] = useState<PetScan | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `PetCare Report - ${scan_id}`,
  });

  useEffect(() => {
    if (!scan_id) return;
    const load = async () => {
      try {
        const [s, d] = await Promise.all([
          scanResult && scanResult.scan_id === scan_id
            ? Promise.resolve({
                id: scan_id,
                is_valid_pet: scanResult.is_valid_pet,
                is_healthy: scanResult.is_healthy,
                result: scanResult.analysis,
                created_at: new Date().toISOString(),
              } as PetScan)
            : scanApi.getScan(scan_id),
          scanApi.getDiagnosis(scan_id).catch(() => null),
        ]);
        setScan(s);
        setDiagnosis(d);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [scan_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  const qa = scan?.result?.qa;
  const petName = qa?.detected_pet || 'Unknown Pet';
  const disease = qa?.suspected_condition;
  const fd = diagnosis?.full_diagnosis;
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between">
        <Link
          to={`/results/${scan_id}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results
        </Link>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          Download / Print
        </motion.button>
      </div>

      {/* Printable report */}
      <div ref={printRef} className="bg-dark-800 border border-white/5 rounded-2xl overflow-hidden">
        {/* Report Header */}
        <div className="bg-gradient-to-r from-primary-900/60 to-blue-900/60 p-8 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">PetCare AI Health Report</h1>
                <p className="text-slate-400 text-sm mt-1">AI-Powered Veterinary Diagnostic Report</p>
              </div>
            </div>
            <div className="text-right">
              <SeverityBadge isHealthy={scan?.is_healthy ?? true} size="md" />
              <p className="text-slate-400 text-xs mt-2">{reportDate}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Pet Info */}
          <div>
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🐾</span> Pet Information
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Pet Name', value: petName },
                { label: 'Scan ID', value: scan_id?.slice(-10) },
                { label: 'Health Status', value: scan?.is_healthy ? 'Healthy' : 'Unhealthy' },
                { label: 'Report Date', value: reportDate },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/3 rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-white text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          {diagnosis && (
            <>
              {/* Disease Info */}
              <div>
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-primary-400" />
                  Diagnosis
                </h2>
                <div className="bg-white/3 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-slate-400 text-xs">Detected Condition</p>
                      <p className="text-white font-bold text-xl mt-1">
                        {diagnosis.disease_name === 'None' ? 'No Disease Detected' : diagnosis.disease_name}
                      </p>
                    </div>
                    <SeverityBadge isHealthy={scan?.is_healthy ?? true} severity={diagnosis.summary.severity} size="sm" />
                  </div>
                  {fd?.disease_overview && (
                    <p className="text-slate-300 text-sm leading-relaxed mt-3 pt-3 border-t border-white/5">
                      {fd.disease_overview}
                    </p>
                  )}
                </div>
              </div>

              {/* Symptoms */}
              {fd?.common_symptoms && fd.common_symptoms.length > 0 && (
                <div>
                  <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    Common Symptoms
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {fd.common_symptoms.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/15 rounded-lg px-4 py-2">
                        <span className="text-yellow-400 text-xs mt-0.5">•</span>
                        <span className="text-slate-300 text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Treatment */}
              {fd?.general_treatment && fd.general_treatment.length > 0 && (
                <div>
                  <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary-400" />
                    Veterinary Treatment Plan
                  </h2>
                  <div className="space-y-2">
                    {fd.general_treatment.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 bg-primary-500/10 border border-primary-500/15 rounded-lg px-4 py-3">
                        <span className="text-primary-400 font-bold text-xs mt-0.5">{i + 1}</span>
                        <span className="text-slate-300 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Home care */}
              {fd?.home_care_tips && fd.home_care_tips.length > 0 && (
                <div>
                  <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Home className="w-4 h-4 text-green-400" />
                    Home Care Tips
                  </h2>
                  <div className="space-y-2">
                    {fd.home_care_tips.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 bg-green-500/10 border border-green-500/15 rounded-lg px-4 py-2">
                        <span className="text-green-400 text-xs mt-0.5">✓</span>
                        <span className="text-slate-300 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* When to visit vet */}
              {fd?.when_to_visit_vet && fd.when_to_visit_vet.length > 0 && (
                <div>
                  <h2 className="text-white font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    When to Visit the Vet
                  </h2>
                  <div className="space-y-2">
                    {fd.when_to_visit_vet.map((t, i) => (
                      <div key={i} className="flex items-start gap-2 bg-orange-500/10 border border-orange-500/15 rounded-lg px-4 py-2">
                        <span className="text-orange-400 text-xs mt-0.5">⚠</span>
                        <span className="text-slate-300 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
            <p className="text-slate-500 text-xs leading-relaxed">
              <strong className="text-slate-400">Disclaimer:</strong>{' '}
              {fd?.disclaimer || 'This report is AI-generated and intended for informational purposes only. It is not a substitute for professional veterinary diagnosis or treatment. Always consult a licensed veterinarian for medical decisions about your pet.'}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-slate-600">
            <span>Generated by PetCare AI — Powered by Google Gemini</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {reportDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
