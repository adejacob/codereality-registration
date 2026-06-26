'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Code, Bot, Brain, Globe, Smartphone, Gamepad2, Box, Palette,
  Monitor, Sparkles, Gift, Pencil, Save, X, Check, AlertTriangle,
  Plus, Trash2, Loader2, ToggleLeft, ToggleRight, BookOpen, Users,
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
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1F2937' }}>Programs</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>{programs.length} program{programs.length !== 1 ? 's' : ''} · shown to students during registration</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setAddError(''); setAddForm(BLANK_FORM); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          style={{ backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
        >
          <Plus size={15} /> Add Program
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
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              style={{ border: '1px solid #E7DCCB', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            >
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #E7DCCB', backgroundColor: '#FFFAF3' }}>
                <h2 className="font-black text-base" style={{ color: '#1F2937' }}>Add New Program</h2>
                <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-xl transition-colors" style={{ color: '#9CA3AF' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Preview */}
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FFFAF3', border: '1px solid #E7DCCB' }}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${addForm.color} flex items-center justify-center shadow-sm`}>
                    <ProgramIcon name={addForm.icon} size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#1F2937' }}>{addForm.name || 'Program Name'}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>Preview</p>
                  </div>
                </div>

                {[null].map(() => {
                  const iClass = "w-full px-3 py-2.5 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all";
                  const iStyle = { borderColor: '#E7DCCB', color: '#1F2937' };
                  const lClass = "block text-xs font-bold uppercase tracking-wide mb-1";
                  const lStyle = { color: '#6B7280' };
                  return (
                    <>
                      <div>
                        <label className={lClass} style={lStyle}>Program Name *</label>
                        <input type="text" value={addForm.name} onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Data Science for Kids" className={iClass} style={iStyle} />
                      </div>
                      <div>
                        <label className={lClass} style={lStyle}>Description *</label>
                        <textarea rows={3} value={addForm.description} onChange={(e) => setAddForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Brief description of the program..." className={iClass + ' resize-none'} style={iStyle} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={lClass} style={lStyle}>Icon</label>
                          <select value={addForm.icon} onChange={(e) => setAddForm(f => ({ ...f, icon: e.target.value }))} className={iClass} style={iStyle}>
                            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={lClass} style={lStyle}>Color</label>
                          <select value={addForm.color} onChange={(e) => setAddForm(f => ({ ...f, color: e.target.value }))} className={iClass} style={iStyle}>
                            {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </>
                  );
                })}

                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addForm.isFree} onChange={(e) => setAddForm(f => ({ ...f, isFree: e.target.checked }))} className="w-4 h-4 rounded accent-emerald-600" />
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>Free program</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addForm.isLimited} onChange={(e) => setAddForm(f => ({ ...f, isLimited: e.target.checked }))} className="w-4 h-4 rounded accent-red-600" />
                    <span className="text-sm font-medium" style={{ color: '#1F2937' }}>Limited entry</span>
                  </label>
                </div>

                {addError && (
                  <p className="text-sm flex items-center gap-1.5" style={{ color: '#DC2626' }}>
                    <AlertTriangle size={14} /> {addError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid #E7DCCB' }}>
                  <button onClick={addProgram} disabled={adding}
                    className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                    style={{ backgroundColor: '#D97706' }}>
                    {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Add Program
                  </button>
                  <button onClick={() => setShowAdd(false)}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
                    style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
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
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ backgroundColor: '#F3E8D4' }} />)}
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-2xl" style={{ border: '1px solid #FECACA' }}>
          <AlertTriangle size={28} className="mx-auto mb-2" style={{ color: '#DC2626' }} />
          <p className="font-medium" style={{ color: '#DC2626' }}>{error}</p>
          <button onClick={load} className="mt-3 text-sm font-bold" style={{ color: '#D97706' }}>Try again</button>
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
                className="bg-white rounded-2xl p-5 transition-opacity"
                style={{ opacity: !program.isActive ? 0.55 : 1, border: `1px solid ${program.isFree ? '#A7F3D0' : '#E7DCCB'}`, boxShadow: '0 2px 10px rgba(215,119,6,0.06)' }}
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
                        {[null].map(() => {
                          const iClass = "w-full px-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:border-[#D97706] transition-all";
                          const iStyle = { borderColor: '#E7DCCB', color: '#1F2937' };
                          const lClass = "block text-[11px] font-bold uppercase tracking-wide mb-1";
                          const lStyle = { color: '#6B7280' };
                          return (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className={lClass} style={lStyle}>Name</label>
                                  <input type="text" value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className={iClass + ' font-semibold'} style={iStyle} />
                                </div>
                                <div>
                                  <label className={lClass} style={lStyle}>Icon</label>
                                  <select value={editForm.icon} onChange={(e) => setEditForm(f => ({ ...f, icon: e.target.value }))} className={iClass} style={iStyle}>
                                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className={lClass} style={lStyle}>Description</label>
                                <textarea rows={2} value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className={iClass + ' resize-none'} style={iStyle} />
                              </div>
                              <div>
                                <label className={lClass} style={lStyle}>Color</label>
                                <select value={editForm.color} onChange={(e) => setEditForm(f => ({ ...f, color: e.target.value }))} className={iClass} style={iStyle}>
                                  {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                              </div>
                            </>
                          );
                        })}
                        <div className="flex items-center gap-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editForm.isFree} onChange={(e) => setEditForm(f => ({ ...f, isFree: e.target.checked }))} className="w-4 h-4 rounded accent-emerald-600" />
                            <span className="text-sm" style={{ color: '#1F2937' }}>Free program</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={editForm.isLimited} onChange={(e) => setEditForm(f => ({ ...f, isLimited: e.target.checked }))} className="w-4 h-4 rounded accent-red-600" />
                            <span className="text-sm" style={{ color: '#1F2937' }}>Limited entry</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => saveEdit(program.id)} disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                            style={{ backgroundColor: '#D97706' }}>
                            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                          </button>
                          <button onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors"
                            style={{ border: '1px solid #E7DCCB', color: '#6B7280' }}>
                            <X size={13} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-sm" style={{ color: program.isFree ? '#065F46' : '#1F2937' }}>{program.name}</h3>
                            {!program.isActive && <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }}>INACTIVE</span>}
                            {program.isFree && <span className="px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>FREE</span>}
                            {program.isLimited && <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}><AlertTriangle size={9} /> LIMITED</span>}
                            {isSaved && <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full" style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}><Check size={10} /> Saved</span>}
                          </div>
                          <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>{program.description}</p>
                          <p className="text-[11px] font-mono mt-1" style={{ color: '#9CA3AF' }}>ID: {program.id}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Link href={`/admin/programs/${program.id}/registrations`}
                            className="flex items-center gap-1.5 p-2 rounded-xl transition-colors"
                            style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' }}
                            title="View Registrations">
                            <Users size={13} />
                          </Link>
                          <button onClick={() => startEdit(program)}
                            className="p-2 rounded-xl transition-colors"
                            style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }}
                            title="Edit">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => toggleActive(program)} disabled={togglingId === program.id}
                            className="p-2 rounded-xl transition-colors"
                            style={program.isActive ? { backgroundColor: '#DCFCE7', color: '#15803D', border: '1px solid #A7F3D0' } : { backgroundColor: '#F3F4F6', color: '#9CA3AF', border: '1px solid #E5E7EB' }}
                            title={program.isActive ? 'Deactivate' : 'Activate'}>
                            {togglingId === program.id ? <Loader2 size={13} className="animate-spin" /> : program.isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          </button>
                          <button onClick={() => deleteProgram(program.id)} disabled={deletingId === program.id}
                            className="p-2 rounded-xl transition-colors"
                            style={{ backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                            title="Delete">
                            {deletingId === program.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
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
