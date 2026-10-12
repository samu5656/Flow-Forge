import React, { useState, useEffect } from 'react';
import {
  Milestone as MilestoneIcon,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  Check,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { milestoneApi } from '../api/client';

export const Milestones = () => {
  const { currentOrg, currentProject } = useWorkspace();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingMilestone, setEditingMilestone] = useState(null);

  const fetchMilestones = async () => {
    if (!currentOrg?.id || !currentProject?.id) {
      setMilestones([]);
      return;
    }
    setLoading(true);
    try {
      const res = await milestoneApi.list(currentOrg.id, currentProject.id);
      const list = res.data?.data || [];
      setMilestones(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [currentOrg?.id, currentProject?.id]);

  const handleOpenCreate = () => {
    setEditingMilestone(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMilestone(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setDueDate(m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrg?.id || !currentProject?.id) return;
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      };

      if (editingMilestone) {
        await milestoneApi.update(currentOrg.id, currentProject.id, editingMilestone.id, payload);
      } else {
        await milestoneApi.create(currentOrg.id, currentProject.id, payload);
      }
      setIsModalOpen(false);
      await fetchMilestones();
    } catch (err) {
      console.error('Failed to save milestone:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save milestone.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (milestoneId) => {
    if (!window.confirm('Delete this milestone?')) return;
    try {
      await milestoneApi.delete(currentOrg.id, currentProject.id, milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete milestone.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Milestones & Release Roadmap</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
              Live API
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sprint deliverables and target milestones for <span className="text-brand-300 font-semibold">{currentProject?.name || 'current project'}</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={!currentProject}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Milestone</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          <span className="text-xs font-mono">Loading milestones...</span>
        </div>
      ) : milestones.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
          <MilestoneIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-300">No Milestones Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create sprint milestones (e.g. v1.0 Launch, Beta Release, Auth Migration) with due dates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
                    <MilestoneIcon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mt-3">{m.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {m.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <span>
                    {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </span>
                <span className="text-emerald-400">In Progress</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingMilestone ? 'Edit Milestone' : 'Create New Milestone'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. v1.0 Production Release"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Release objectives, deliverables, criteria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingMilestone ? 'Save Changes' : 'Create Milestone'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
