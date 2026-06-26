'use client';

import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sun, User } from 'lucide-react';
import Card from '../ui/Card';

const schedules = [
  { id: 'weekend', name: 'Weekend Classes', description: 'Saturday & Sunday sessions', icon: Calendar, color: 'from-blue-500 to-indigo-500' },
  { id: 'after-school', name: 'After School Classes', description: 'Weekday evening sessions', icon: Clock, color: 'from-purple-500 to-pink-500' },
  { id: 'holiday', name: 'Holiday Bootcamp', description: 'Intensive holiday programs', icon: Sun, color: 'from-orange-500 to-red-500' },
  { id: 'private', name: 'Private Coaching', description: 'One-on-one personalized sessions', icon: User, color: 'from-green-500 to-emerald-500' },
];

export default function ScheduleStep() {
  const { register, watch, formState: { errors } } = useFormContext();
  const selectedSchedule = watch('schedule.schedule');

  const getError = () => {
    const error = errors.schedule as any;
    return error?.schedule?.message as string;
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Choose Your Schedule</h2>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Pick the session type that works best for your family.</p>
      </div>
      
      {getError() && (
        <p className="text-sm text-red-500">{getError()}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule, index) => {
          const Icon = schedule.icon;
          const isSelected = selectedSchedule === schedule.id;
          
          return (
            <motion.div
              key={schedule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all duration-300 ${isSelected ? '' : ''}`}
                style={isSelected ? { outline: '2px solid #D97706', outlineOffset: '2px', backgroundColor: '#FFFAF3' } : {}}
                onClick={() => {
                  const radio = document.getElementById(`schedule-${schedule.id}`) as HTMLInputElement;
                  radio.click();
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${schedule.color} text-white`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-0.5" style={{ color: '#1F2937' }}>{schedule.name}</h3>
                    <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{schedule.description}</p>
                    <input
                      id={`schedule-${schedule.id}`}
                      type="radio"
                      value={schedule.id}
                      {...register('schedule.schedule')}
                      className="sr-only"
                    />
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 text-xs font-bold"
                        style={{ color: '#D97706' }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97706' }} />
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
    </div>
  );
}
