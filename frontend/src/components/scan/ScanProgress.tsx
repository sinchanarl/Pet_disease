import { motion } from 'framer-motion';
import { Check, Loader2, Upload, Search, AlertCircle, Stethoscope, HeartPulse } from 'lucide-react';

type StepStatus = 'pending' | 'active' | 'done' | 'error';

const steps = [
  { key: 'uploading', label: 'Uploading image', icon: Upload },
  { key: 'analyzing', label: 'AI analyzing pet', icon: Search },
  { key: 'detecting', label: 'Detecting disease', icon: AlertCircle },
  { key: 'diagnosing', label: 'Generating diagnosis', icon: Stethoscope },
  { key: 'complete', label: 'Preparing results', icon: HeartPulse },
];

const stepOrder = ['uploading', 'analyzing', 'detecting', 'diagnosing', 'complete'];

function getStatus(step: string, currentStep: string): StepStatus {
  const stepIdx = stepOrder.indexOf(step);
  const currentIdx = stepOrder.indexOf(currentStep);
  if (currentStep === 'error') return stepIdx === currentIdx ? 'error' : stepIdx < currentIdx ? 'done' : 'pending';
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

interface ScanProgressProps {
  currentStep: string;
}

export default function ScanProgress({ currentStep }: ScanProgressProps) {
  return (
    <div className="bg-dark-800 rounded-2xl border border-white/5 p-6 space-y-4">
      <h3 className="text-white font-semibold text-center mb-6">AI Analysis In Progress</h3>

      {steps.map(({ key, label, icon: Icon }, i) => {
        const status = getStatus(key, currentStep);
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4"
          >
            {/* Status icon */}
            <div className="relative flex-shrink-0">
              <motion.div
                animate={status === 'active' ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  status === 'done'
                    ? 'bg-primary-500/20 border-primary-500'
                    : status === 'active'
                    ? 'bg-blue-500/20 border-blue-500'
                    : status === 'error'
                    ? 'bg-red-500/20 border-red-500'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {status === 'done' ? (
                  <Check className="w-4 h-4 text-primary-400" />
                ) : status === 'active' ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Icon className="w-4 h-4 text-slate-600" />
                )}
              </motion.div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div
                  className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-4 transition-colors duration-500 ${
                    status === 'done' ? 'bg-primary-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex-1">
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  status === 'done'
                    ? 'text-primary-400'
                    : status === 'active'
                    ? 'text-white'
                    : status === 'error'
                    ? 'text-red-400'
                    : 'text-slate-600'
                }`}
              >
                {label}
              </span>
              {status === 'active' && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-0.5 bg-gradient-to-r from-blue-500 to-primary-500 rounded-full mt-1 max-w-[200px]"
                />
              )}
            </div>

            {/* Status badge */}
            {status === 'done' && (
              <span className="text-xs text-primary-400 font-medium">Done</span>
            )}
            {status === 'active' && (
              <span className="text-xs text-blue-400 font-medium animate-pulse">Running</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
