'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box, Palette,
  Monitor, Sparkles, Gift, BookOpen, Pencil, AlertTriangle, Loader2,
} from 'lucide-react';
import Card from '../ui/Card';

interface ApiProgram {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isFree: boolean;
  isLimited: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box,
  Palette, Monitor, Sparkles, Gift, BookOpen, Pencil,
};

function ProgramIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name] ?? Code;
  return <Icon size={size} className={className} />;
}

export default function ProgramSelectionStep() {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const selectedPrograms: string[] = watch('programs.programs') || [];

  const [programs, setPrograms]   = useState<ApiProgram[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/programs')
      .then(r => r.json())
      .then(d => { if (d.success) setPrograms(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hasFreeSelected = programs.some(p => p.isFree && selectedPrograms.includes(p.id));
  const selectedFreeProgram = programs.find(p => p.isFree && selectedPrograms.includes(p.id));

  const getError = () => {
    const error = errors.programs as any;
    return error?.programs?.message as string;
  };

  function handleProgramClick(program: ApiProgram) {
    if (program.isFree) {
      if (selectedPrograms.includes(program.id)) {
        setValue('programs.programs', []);
        setValue('payment.coupon', '');
      } else {
        setValue('programs.programs', [program.id]);
      }
    } else {
      // Deselect any free program if selecting a regular one
      if (hasFreeSelected) {
        setValue('programs.programs', [program.id]);
        setValue('payment.coupon', '');
      } else {
        const checkbox = document.getElementById(`program-${program.id}`) as HTMLInputElement;
        checkbox?.click();
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Select Programs
      </h2>

      {getError() && (
        <p className="text-sm text-red-500">{getError()}</p>
      )}

      {/* Free program selected banner */}
      {hasFreeSelected && selectedFreeProgram && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden border border-emerald-200"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-800 text-sm">
            <Gift size={18} className="text-emerald-600 flex-shrink-0" />
            <span><strong>Free program selected!</strong> You&apos;ll enter your coupon code on the next step to complete registration.</span>
          </div>
          {selectedFreeProgram.isLimited && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-t border-red-100 text-red-700 text-xs font-semibold">
              <AlertTriangle size={13} className="flex-shrink-0" />
              Limited spots available — complete your registration quickly to secure your place.
            </div>
          )}
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={20} className="animate-spin" /> Loading programs…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program, index) => {
            const isSelected = selectedPrograms.includes(program.id);

            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={program.isFree ? 'sm:col-span-2 lg:col-span-3' : ''}
              >
                <Card
                  className={`p-6 cursor-pointer transition-all duration-300 relative ${
                    isSelected && program.isFree
                      ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : isSelected
                      ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : program.isFree
                      ? 'hover:shadow-lg border-dashed border-emerald-300 bg-emerald-50/30'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleProgramClick(program)}
                >
                  {program.isFree && (
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                        FREE
                      </span>
                      {program.isLimited && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                          <AlertTriangle size={9} /> LIMITED SPOTS
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${program.color} text-white`}>
                      <ProgramIcon name={program.icon} size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold dark:text-white mb-1 ${program.isFree ? 'text-emerald-800' : 'text-gray-900'}`}>
                        {program.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{program.description}</p>
                      {program.isFree && program.isLimited && (
                        <p className="flex items-center gap-1 text-xs font-semibold text-red-600 mb-2">
                          <AlertTriangle size={11} /> Limited entry — secure your spot now!
                        </p>
                      )}
                      <input
                        id={`program-${program.id}`}
                        type="checkbox"
                        value={program.id}
                        {...register('programs.programs')}
                        className="sr-only"
                      />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`inline-flex items-center gap-1 text-sm font-medium ${program.isFree ? 'text-emerald-600' : 'text-indigo-600 dark:text-indigo-400'}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${program.isFree ? 'bg-emerald-600' : 'bg-indigo-600'}`} />
                          Selected
                        </motion.div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        You can select multiple programs. Free programs require a coupon code.
      </p>
    </div>
  );
}
