import type { Severity } from '../../types';
import { Heart, AlertTriangle, AlertCircle, Zap } from 'lucide-react';

interface SeverityBadgeProps {
  isHealthy: boolean;
  severity?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

function getSeverity(isHealthy: boolean, severity?: string | null): Severity {
  if (isHealthy) return 'healthy';
  if (!severity) return 'unknown';
  const s = severity.toLowerCase();
  if (s.includes('mild')) return 'mild';
  if (s.includes('moderate')) return 'moderate';
  if (s.includes('severe') || s.includes('critical')) return 'severe';
  return 'unknown';
}

const config: Record<Severity, { label: string; icon: React.ElementType; classes: string; pulse?: boolean }> = {
  healthy: { label: 'Healthy', icon: Heart, classes: 'bg-green-500/15 text-green-400 border-green-500/30' },
  mild: { label: 'Mild Condition', icon: AlertTriangle, classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  moderate: { label: 'Moderate', icon: AlertCircle, classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  severe: { label: 'Severe', icon: Zap, classes: 'bg-red-500/15 text-red-400 border-red-500/30', pulse: true },
  unknown: { label: 'Needs Attention', icon: AlertCircle, classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
};

const sizes = {
  sm: 'text-xs px-2.5 py-1 gap-1.5',
  md: 'text-sm px-3.5 py-1.5 gap-2',
  lg: 'text-base px-5 py-2 gap-2.5',
};

export default function SeverityBadge({ isHealthy, severity, size = 'md' }: SeverityBadgeProps) {
  const sev = getSeverity(isHealthy, severity);
  const { label, icon: Icon, classes, pulse } = config[sev];
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${classes} ${sizes[size]} ${
        pulse ? 'animate-pulse' : ''
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
}
