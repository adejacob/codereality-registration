'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box, Palette,
  Monitor, Sparkles, Gift, Pencil, Save, X, Check, AlertTriangle,
} from 'lucide-react';

interface Program {
  id: string;
  name: string;
  description: string;
  color: string;
  isFree: boolean;
  isLimited: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const DEFAULT_PROGRAMS: Program[] = [
  { id: 'coding',    name: 'Coding & Programming',                  description: 'Learn the fundamentals of programming through hands-on projects.',             color: 'from-blue-500 to-cyan-500',     isFree: false, isLimited: false, icon: Code       },
  { id: 'robotics',  name: 'Robotics Engineering',                  description: 'Build and program robots using sensors, motors and microcontrollers.',         color: 'from-purple-500 to-pink-500',   isFree: false, isLimited: false, icon: Bot        },
  { id: 'ai',        name: 'Artificial Intelligence',               description: 'Explore machine learning, neural networks and AI applications.',               color: 'from-green-500 to-emerald-500', isFree: false, isLimited: false, icon: Brain      },
  { id: 'web',       name: 'Web Development',                       description: 'Design and build modern websites with HTML, CSS, JavaScript and React.',       color: 'from-indigo-500 to-blue-500',   isFree: false, isLimited: false, icon: Globe      },
  { id: 'mobile',    name: 'Mobile App Development',                description: 'Create iOS and Android apps using modern cross-platform frameworks.',          color: 'from-orange-500 to-red-500',    isFree: false, isLimited: false, icon: Smartphone },
  { id: 'game',      name: 'Game Development',                      description: 'Design and code 2D/3D games using Unity and game design principles.',          color: 'from-pink-500 to-rose-500',     isFree: false, isLimited: false, icon: Gamepad2   },
  { id: '3d',        name: '3D Design & Modeling',                  description: 'Master 3D modeling, animation and rendering with industry tools.',             color: 'from-yellow-500 to-orange-500', isFree: false, isLimited: false, icon: Box        },
  { id: 'graphic',   name: 'Graphic Design',                        description: 'Create stunning visuals, logos, and digital art with design software.',        color: 'from-violet-500 to-purple-500', isFree: false, isLimited: false, icon: Palette    },
  { id: 'digital',   name: 'Digital Literacy',                      description: 'Develop essential computer skills, online safety, and productivity tools.',    color: 'from-teal-500 to-cyan-500',     isFree: false, isLimited: false, icon: Monitor    },
  { id: 'scratch',   name: 'Scratch Programming',                   description: 'Introduction to coding using Scratch — perfect for beginners aged 6–12.',     color: 'from-amber-500 to-yellow-500',  isFree: false, isLimited: false, icon: Sparkles   },
  { id: 'workshop',  name: 'FREE ONLINE KIDS APP CREATOR WORKSHOP', description: 'A free online workshop where kids build their first app. Coupon required.',   color: 'from-emerald-500 to-green-500', isFree: true,  isLimited: true,  icon: Gift       },
];

const STORAGE_KEY = 'cr_program_descriptions';

function loadDescriptions(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(() => {
    const saved = loadDescriptions();
    return DEFAULT_PROGRAMS.map(p => ({
      ...p,
      description: saved[p.id] ?? p.description,
    }));
  });

  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editName, setEditName]       = useState('');
  const [editDesc, setEditDesc]       = useState('');
  const [savedId, setSavedId]         = useState<string | null>(null);

  function startEdit(p: Program) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDesc(p.description);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  }

  function saveEdit(id: string) {
    const updated = programs.map(p =>
      p.id === id ? { ...p, name: editName.trim() || p.name, description: editDesc.trim() || p.description } : p
    );
    setPrograms(updated);

    // Persist descriptions to localStorage
    const descMap: Record<string, string> = {};
    updated.forEach(p => { descMap[p.id] = p.description; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(descMap));

    setEditingId(null);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Edit program names and descriptions shown to students during registration.
        </p>
      </div>

      <div className="grid gap-4">
        {programs.map((program, i) => {
          const Icon = program.icon;
          const isEditing = editingId === program.id;
          const isSaved   = savedId  === program.id;

          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl border p-5 ${
                program.isFree ? 'border-emerald-200' : 'border-gray-100'
              } shadow-sm`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-md`}>
                  <Icon size={22} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Program Name</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                        <textarea
                          rows={3}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(program.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className={`font-bold text-sm ${program.isFree ? 'text-emerald-800' : 'text-gray-900'}`}>
                            {program.name}
                          </h3>
                          {program.isFree && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">FREE</span>
                          )}
                          {program.isLimited && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              <AlertTriangle size={10} /> LIMITED ENTRY
                            </span>
                          )}
                          {isSaved && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                              <Check size={11} /> Saved
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{program.description}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-1">ID: {program.id}</p>
                      </div>
                      <button
                        onClick={() => startEdit(program)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 italic">
        Note: Name and description changes are stored locally. Program IDs cannot be changed as they are referenced in registrations.
      </p>
    </div>
  );
}
