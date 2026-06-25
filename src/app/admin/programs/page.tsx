'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box, Palette,
  Monitor, Sparkles, Gift, Pencil, Save, X, Check, AlertTriangle,
  Plus, Trash2, Loader2, ToggleLeft, ToggleRight, BookOpen,
} from 'lucide-react';

interface Program {
  _id: string;
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isFree: boolean;
  isLimited: boolean;
  isActive: boolean;
  order: number;
}

const ICON_OPTIONS = [
  'Code', 'Bot', 'Brain', 'Globe', 'Smartphone', 'Gamepad2', 'Box',
  'Palette', 'Monitor', 'Sparkles', 'Gift', 'BookOpen', 'Pencil',
];

const COLOR_OPTIONS = [
  { label: 'Blue → Cyan',      value: 'from-blue-500 to-cyan-500'      },
  { label: 'Purple → Pink',    value: 'from-purple-500 to-pink-500'    },
  { label: 'Green → Emerald',  value: 'from-green-500 to-emerald-500'  },
  { label: 'Indigo → Blue',    value: 'from-indigo-500 to-blue-500'    },
  { label: 'Orange → Red',     value: 'from-orange-500 to-red-500'     },
  { label: 'Pink → Rose',      value: 'from-pink-500 to-rose-500'      },
  { label: 'Yellow → Orange',  value: 'from-yellow-500 to-orange-500'  },
  { label: 'Violet → Purple',  value: 'from-violet-500 to-purple-500'  },
  { label: 'Teal → Cyan',      value: 'from-teal-500 to-cyan-500'      },
  { label: 'Amber → Yellow',   value: 'from-amber-500 to-yellow-500'   },
  { label: 'Emerald → Green',  value: 'from-emerald-500 to-green-500'  },
  { label: 'Red → Rose',       value: 'from-red-500 to-rose-500'       },
  { label: 'Indigo → Purple',  value: 'from-indigo-500 to-purple-600'  },
];

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box,
  Palette, Monitor, Sparkles, Gift, BookOpen, Pencil,
};

function ProgramIcon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const Icon = ICON_MAP[name] ?? Code;
  return <Icon size={size} className={className} />;
}

const BLANK_FORM = { name: '', description: '', color: 'from-indigo-500 to-purple-600', icon: 'Code', isFree: false, isLimited: false };

export default function ProgramsPage() {
  const [programs, setPrograms]     = useState<Program[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editForm, setEditForm]     = useState({ name: '', description: '', color: '', icon: '', isFree: false, isLimited: false });
  const [saving, setSaving]         = useState(false);
  const [savedId, setSavedId]       = useState<string | null>(null);

  const [showAdd, setShowAdd]       = useState(false);
  const [addForm, setAddForm]       = useState(BLANK_FORM);
  const [adding, setAdding]         = useState(false);
  const [addError, setAddError]     = useState('');

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/programs');
      const data = await res.json();
      if (data.success) setPrograms(data.data);
      else setError(data.message ?? 'Failed to load programs');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function startEdit(p: Program) {
    setEditingId(p.id);
    setEditForm({ name: p.name, description: p.description, color: p.color, icon: p.icon, isFree: p.isFree, isLimited: p.isLimited });
  }

  function cancelEdit() { setEditingId(null); }

  async function saveEdit(id: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...editForm } : p));
        setEditingId(null);
        setSavedId(id);
        setTimeout(() => setSavedId(null), 2000);
      }
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  async function toggleActive(p: Program) {
    setTogglingId(p.id);
    try {
      const res = await fetch(`/api/admin/programs/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setPrograms(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x));
      }
    } catch { /* silent */ }
    finally { setTogglingId(null); }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Delete this program? Students who selected it will still have it in their registration records.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setPrograms(prev => prev.filter(p => p.id !== id));
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  }

  async function addProgram() {
    if (!addForm.name.trim() || !addForm.description.trim()) {
      setAddError('Name and description are required.');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setPrograms(prev => [...prev, data.data]);
        setShowAdd(false);
        setAddForm(BLANK_FORM);
      } else {
        setAddError(data.message ?? 'Failed to add program');
      }
    } catch {
      setAddError('Network error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 mt-0.5 text-sm">{programs.length} program{programs.length !== 1 ? 's' : ''} · shown to students during registration</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAddError(''); setAddForm(BLANK_FORM); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow transition-all"
        >
          <Plus size={16} /> Add Program
        </button>
      </div>

      {/* Add Program Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg">Add New Program</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${addForm.color} flex items-center justify-center shadow`}>
                    <ProgramIcon name={addForm.icon} size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{addForm.name || 'Program Name'}</p>
                    <p className="text-xs text-gray-400">Preview</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Program Name *</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Data Science for Kids"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={addForm.description}
                    onChange={(e) => setAddForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the program..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Icon</label>
                    <select
                      value={addForm.icon}
                      onChange={(e) => setAddForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                      {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Color</label>
                    <select
                      value={addForm.color}
                      onChange={(e) => setAddForm(f => ({ ...f, color: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                    >
                      {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isFree}
                      onChange={(e) => setAddForm(f => ({ ...f, isFree: e.target.checked }))}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                    <span className="text-sm text-gray-700 font-medium">Free program</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isLimited}
                      onChange={(e) => setAddForm(f => ({ ...f, isLimited: e.target.checked }))}
                      className="w-4 h-4 rounded accent-red-600"
                    />
                    <span className="text-sm text-gray-700 font-medium">Limited entry</span>
                  </label>
                </div>

                {addError && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5">
                    <AlertTriangle size={14} /> {addError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={addProgram}
                    disabled={adding}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                  >
                    {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                    Add Program
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Programs List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-red-100">
          <AlertTriangle size={32} className="mx-auto text-red-400 mb-2" />
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={load} className="mt-3 text-sm text-indigo-600 hover:underline">Try again</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map((program, i) => {
            const isEditing = editingId === program.id;
            const isSaved   = savedId   === program.id;

            return (
              <motion.div
                key={program._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition-opacity ${
                  !program.isActive ? 'opacity-50' : ''
                } ${program.isFree ? 'border-emerald-200' : 'border-gray-100'}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${program.color} flex items-center justify-center shadow-md`}>
                    <ProgramIcon name={program.icon} size={22} className="text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</label>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Icon</label>
                            <select
                              value={editForm.icon}
                              onChange={(e) => setEditForm(f => ({ ...f, icon: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                            >
                              {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={editForm.description}
                            onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Color</label>
                          <select
                            value={editForm.color}
                            onChange={(e) => setEditForm(f => ({ ...f, color: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                          >
                            {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isFree}
                              onChange={(e) => setEditForm(f => ({ ...f, isFree: e.target.checked }))}
                              className="w-4 h-4 rounded accent-emerald-600"
                            />
                            <span className="text-sm text-gray-700">Free program</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.isLimited}
                              onChange={(e) => setEditForm(f => ({ ...f, isLimited: e.target.checked }))}
                              className="w-4 h-4 rounded accent-red-600"
                            />
                            <span className="text-sm text-gray-700">Limited entry</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(program.id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                          >
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
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
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`font-bold text-sm ${program.isFree ? 'text-emerald-800' : 'text-gray-900'}`}>
                              {program.name}
                            </h3>
                            {!program.isActive && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">INACTIVE</span>
                            )}
                            {program.isFree && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">FREE</span>
                            )}
                            {program.isLimited && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                <AlertTriangle size={10} /> LIMITED
                              </span>
                            )}
                            {isSaved && (
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                <Check size={11} /> Saved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{program.description}</p>
                          <p className="text-[11px] text-gray-400 font-mono mt-1">ID: {program.id}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => startEdit(program)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-100"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => toggleActive(program)}
                            disabled={togglingId === program.id}
                            className={`p-2 rounded-xl transition-colors border ${
                              program.isActive
                                ? 'text-green-600 bg-green-50 hover:bg-green-100 border-green-100'
                                : 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }`}
                            title={program.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {togglingId === program.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : program.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
                            }
                          </button>
                          <button
                            onClick={() => deleteProgram(program.id)}
                            disabled={deletingId === program.id}
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
                            title="Delete"
                          >
                            {deletingId === program.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
