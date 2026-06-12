'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box, Palette, Monitor, Sparkles } from 'lucide-react';
import Card from '../ui/Card';

const programs = [
  { id: 'coding', name: 'Coding & Programming', icon: Code, color: 'from-blue-500 to-cyan-500' },
  { id: 'robotics', name: 'Robotics Engineering', icon: Bot, color: 'from-purple-500 to-pink-500' },
  { id: 'ai', name: 'Artificial Intelligence', icon: Brain, color: 'from-green-500 to-emerald-500' },
  { id: 'web', name: 'Web Development', icon: Globe, color: 'from-indigo-500 to-blue-500' },
  { id: 'mobile', name: 'Mobile App Development', icon: Smartphone, color: 'from-orange-500 to-red-500' },
  { id: 'game', name: 'Game Development', icon: Gamepad2, color: 'from-pink-500 to-rose-500' },
  { id: '3d', name: '3D Design & Modeling', icon: Box, color: 'from-yellow-500 to-orange-500' },
  { id: 'graphic', name: 'Graphic Design', icon: Palette, color: 'from-violet-500 to-purple-500' },
  { id: 'digital', name: 'Digital Literacy', icon: Monitor, color: 'from-teal-500 to-cyan-500' },
  { id: 'scratch', name: 'Scratch Programming', icon: Sparkles, color: 'from-amber-500 to-yellow-500' },
];

export default function ProgramSelectionStep() {
  const { register, watch, formState: { errors } } = useFormContext();
  const selectedPrograms = watch('programs.programs') || [];

  const getError = () => {
    const error = errors.programs as any;
    return error?.programs?.message as string;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Select Programs
      </h2>
      
      {getError() && (
        <p className="text-sm text-red-500">{getError()}</p>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program, index) => {
          const Icon = program.icon;
          const isSelected = selectedPrograms.includes(program.id);
          
          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => {
                  const checkbox = document.getElementById(`program-${program.id}`) as HTMLInputElement;
                  checkbox.click();
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${program.color} text-white`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {program.name}
                    </h3>
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
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                      >
                        <span className="w-2 h-2 bg-indigo-600 rounded-full" />
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
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        You can select multiple programs
      </p>
    </div>
  );
}
