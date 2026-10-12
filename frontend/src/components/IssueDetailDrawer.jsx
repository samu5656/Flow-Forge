import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Loader2,
  Check,
  Edit3,
} from 'lucide-react';
import { issueApi, taskApi } from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';

export const IssueDetailDrawer = ({ issueId, isOpen, onClose, onUpdated }) => {
  const { currentOrg, currentProject } = useWorkspace();
  const [issue, setIssue] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Editable fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState('');

  useEffect(() => {
    if (!isOpen || !issueId || !currentOrg?.id || !currentProject?.id) return;
    loadIssueDetails();
  }, [isOpen, issueId, currentOrg?.id, currentProject?.id]);

  const loadIssueDetails = async () => {
    setLoading(true);
    setIsEditingTitle(false);
    setIsEditingDesc(false);
    try {
      const [issueRes, tasksRes] = await Promise.all([
        issueApi.get(currentOrg.id, currentProject.id, issueId),
        taskApi.list(currentOrg.id, currentProject.id, issueId),
      ]);
      const data = issueRes.data?.data;
      setIssue(data);
      setTitleInput(data?.title || '');
      setDescInput(data?.description || '');
      setTasks(tasksRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load issue details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!issue || issue.status === newStatus) return;
    setStatusUpdating(true);
    const updated = { ...issue, status: newStatus };
    setIssue(updated);
    onUpdated(updated);
    try {
      const current = JSON.parse(localStorage.getItem('flowforge_status_overrides') || '{}');
      current[issue.id] = newStatus;
      localStorage.setItem('flowforge_status_overrides', JSON.stringify(current));
      await issueApi.update(currentOrg.id, currentProject.id, issue.id, {
        status: newStatus,
      });
    } catch (err) {
      console.warn('Backend status update note:', err?.response?.data?.message || err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!issue || issue.priority === newPriority) return;
    const updated = { ...issue, priority: newPriority };
    setIssue(updated);
    onUpdated(updated);
    try {
      await issueApi.update(currentOrg.id, currentProject.id, issue.id, {
        priority: newPriority,
      });
    } catch (err) {
      console.warn('Backend priority update note:', err?.response?.data?.message || err.message);
    }
  };

  const handleSaveTitle = async () => {
    if (!titleInput.trim() || titleInput === issue?.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      const res = await issueApi.update(currentOrg.id, currentProject.id, issue.id, {
        title: titleInput.trim(),
      });
      const updated = res.data?.data;
      setIssue(updated);
      setIsEditingTitle(false);
      onUpdated(updated);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleSaveDescription = async () => {
    if (descInput === (issue?.description || '')) {
      setIsEditingDesc(false);
      return;
    }
    try {
      const res = await issueApi.update(currentOrg.id, currentProject.id, issue.id, {
        description: descInput.trim() || undefined,
      });
      const updated = res.data?.data;
      setIssue(updated);
      setIsEditingDesc(false);
      onUpdated(updated);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !issue) return;
    setAddingTask(true);
    try {
      const res = await taskApi.create(currentOrg.id, currentProject.id, issue.id, {
        title: newTaskTitle.trim(),
      });
      setTasks((prev) => [...prev, res.data?.data]);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await taskApi.update(
        currentOrg.id,
        currentProject.id,
        issue.id,
        task.id,
        { completed: !task.completed }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? res.data?.data : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskApi.delete(currentOrg.id, currentProject.id, issue.id, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  if (!isOpen) return null;

  const priorityColors = {
    LOW: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  const statusColors = {
    OPEN: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    IN_PROGRESS: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    RESOLVED: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    CLOSED: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full glass-panel border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 bg-[#0c1222]">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-500">
              ISSUE-{issueId?.slice(0, 8)}
            </span>
            {issue && (
              <>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusColors[issue.status]}`}>
                  {issue.status}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${priorityColors[issue.priority]}`}>
                  {issue.priority}
                </span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            <span className="text-xs font-mono">Loading issue details...</span>
          </div>
        ) : !issue ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Issue not found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-brand-500 text-sm font-bold text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-500"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTitleInput(issue.title);
                      setIsEditingTitle(false);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="group flex items-start justify-between">
                  <h2
                    onClick={() => setIsEditingTitle(true)}
                    className="text-lg font-bold text-white tracking-tight leading-snug cursor-pointer hover:text-brand-300 transition-colors"
                  >
                    {issue.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity ml-2 shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Created {new Date(issue.createdAt).toLocaleString()}</span>
              </p>
            </div>

            {/* Quick Status & Priority Controls */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Status Column
                </label>
                <select
                  value={issue.status}
                  disabled={statusUpdating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-brand-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                  Priority
                </label>
                <select
                  value={issue.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:border-brand-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </h3>
                {!isEditingDesc && (
                  <button
                    onClick={() => setIsEditingDesc(true)}
                    className="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-brand-500 text-xs text-slate-200 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => {
                        setDescInput(issue.description || '');
                        setIsEditingDesc(false);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
                    >
                      Save Description
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans cursor-pointer hover:border-slate-700 transition-colors"
                >
                  {issue.description || 'No description provided. Click to add one.'}
                </div>
              )}
            </div>

            {/* Tasks / Subtask Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-brand-400" />
                  <span>Subtask Checklist</span>
                </h3>
                {tasks.length > 0 && (
                  <span className="text-[11px] font-mono text-brand-300">
                    {completedCount} of {tasks.length} completed
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-500 h-1.5 transition-all duration-300"
                    style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Task Items */}
              <div className="space-y-1.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition-colors group"
                  >
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="flex items-center space-x-2.5 flex-1 text-left"
                    >
                      {task.completed ? (
                        <CheckSquare className="w-4 h-4 text-brand-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddTask} className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Add a subtask checklist item..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
