import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, AlertCircle, Loader2, Check, X } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { labelApi } from '../api/client';

export const Labels = () => {
  const { currentOrg, currentProject } = useWorkspace();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState('#8b5cf6');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingLabel, setEditingLabel] = useState(null);

  const presetColors = [
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#64748b', // Slate
  ];

  const fetchLabels = async () => {
    if (!currentOrg?.id || !currentProject?.id) {
      setLabels([]);
      return;
    }
    setLoading(true);
    try {
      const res = await labelApi.list(currentOrg.id, currentProject.id);
      const list = res.data?.data || [];
      setLabels(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to load labels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [currentOrg?.id, currentProject?.id]);

  const handleOpenCreate = () => {
    setEditingLabel(null);
    setLabelName('');
    setLabelColor('#8b5cf6');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (label) => {
    setEditingLabel(label);
    setLabelName(label.name);
    setLabelColor(label.color || '#8b5cf6');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrg?.id || !currentProject?.id) return;
    setSubmitting(true);
    setError('');

    try {
      if (editingLabel) {
        await labelApi.update(currentOrg.id, currentProject.id, editingLabel.id, {
          name: labelName.trim(),
          color: labelColor,
        });
      } else {
        await labelApi.create(currentOrg.id, currentProject.id, {
          name: labelName.trim(),
          color: labelColor,
        });
      }
      setIsModalOpen(false);
      await fetchLabels();
    } catch (err) {
      console.error('Failed to save label:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save label.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (labelId) => {
    if (!window.confirm('Delete this label?')) return;
    try {
      await labelApi.delete(currentOrg.id, currentProject.id, labelId);
      setLabels((prev) => prev.filter((l) => l.id !== labelId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete label.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Project Labels & Tags</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
              Live API
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Categorize issues and tasks for <span className="text-brand-300 font-semibold">{currentProject?.name || 'current project'}</span>.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={!currentProject}
          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Label</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          <span className="text-xs font-mono">Loading labels...</span>
        </div>
      ) : labels.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-300">No Labels Created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create classification tags (e.g. bug, feature, security, documentation) with custom colors.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {labels.map((label) => (
            <div
              key={label.id}
              className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all"
            >
              <div className="flex items-center space-x-2.5 truncate">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: label.color || '#8b5cf6' }}
                />
                <span className="text-xs font-semibold text-white truncate">
                  {label.name}
                </span>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenEdit(label)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(label.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">
                {editingLabel ? 'Edit Label' : 'Create New Label'}
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
                  Label Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={labelName}
                  onChange={(e) => setLabelName(e.target.value)}
                  placeholder="e.g. backend, bug, ui"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Color Tag ({labelColor})
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLabelColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        labelColor.toLowerCase() === c.toLowerCase()
                          ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
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
                  disabled={submitting || !labelName.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingLabel ? 'Save Changes' : 'Create Label'}</span>
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
