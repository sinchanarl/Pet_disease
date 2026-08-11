import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Stethoscope, Home, AlertTriangle, Pill, Info } from 'lucide-react';
import type { DiagnosisResponse } from '../../types';
import SeverityBadge from './SeverityBadge';

interface DiagnosisCardProps {
  diagnosis: DiagnosisResponse;
}

interface Section {
  key: string;
  title: string;
  icon: React.ElementType;
  content: string | string[];
  color: string;
}

function ListSection({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function AccordionItem({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);
  const { title, icon: Icon, content, color } = section;
  const isArray = Array.isArray(content);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              {isArray && Array.isArray(content) ? (
                <ListSection items={content} />
              ) : (
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{content as string}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const { pet_name, disease_name, summary, kb, full_diagnosis } = diagnosis;
  const fd = full_diagnosis;

  const sections: Section[] = [
    {
      key: 'overview',
      title: 'Disease Overview',
      icon: Info,
      content: fd.disease_overview || 'No overview available.',
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      key: 'symptoms',
      title: 'Common Symptoms',
      icon: AlertTriangle,
      content: fd.common_symptoms?.length ? fd.common_symptoms : ['No symptoms listed.'],
      color: 'bg-yellow-500/20 text-yellow-400',
    },
    {
      key: 'treatment',
      title: 'Veterinary Treatment',
      icon: Stethoscope,
      content: fd.general_treatment?.length ? fd.general_treatment : ['No treatments listed.'],
      color: 'bg-primary-500/20 text-primary-400',
    },
    {
      key: 'homecare',
      title: 'Home Care Tips',
      icon: Home,
      content: fd.home_care_tips?.length ? fd.home_care_tips : ['No home care tips.'],
      color: 'bg-green-500/20 text-green-400',
    },
    {
      key: 'vet',
      title: 'When to Visit Vet',
      icon: AlertTriangle,
      content: fd.when_to_visit_vet?.length ? fd.when_to_visit_vet : ['Consult a vet if symptoms worsen.'],
      color: 'bg-orange-500/20 text-orange-400',
    },
  ];

  if (kb?.treatment && kb.treatment !== 'No specific treatment found in knowledge base.') {
    sections.push({
      key: 'kb',
      title: 'Knowledge Base Treatment',
      icon: Pill,
      content: kb.treatment,
      color: 'bg-purple-500/20 text-purple-400',
    });
  }

  return (
    <div className="bg-dark-800 rounded-2xl border border-white/5 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">{disease_name === 'None' ? 'No Disease Detected' : disease_name}</h2>
          <p className="text-slate-400 text-sm mt-1">
            Detected in: <span className="text-primary-400 font-medium">{pet_name}</span>
          </p>
        </div>
        <SeverityBadge isHealthy={summary.is_healthy} severity={summary.severity} size="sm" />
      </div>

      {/* Accordion sections */}
      <div className="space-y-2">
        {sections.map((s) => (
          <AccordionItem key={s.key} section={s} />
        ))}
      </div>

      {/* Disclaimer */}
      {fd.disclaimer && (
        <p className="text-xs text-slate-500 italic border-t border-white/5 pt-4">
          ⚠️ {fd.disclaimer}
        </p>
      )}
    </div>
  );
}
