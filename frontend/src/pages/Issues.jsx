import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MoveRight,
  Tag,
  CheckCircle2,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { issueApi } from '../api/client';
import { CreateIssueModal } from '../components/CreateIssueModal';
import { IssueDetailDrawer } from '../components/IssueDetailDrawer';

export const Issues = () => {
  const { currentOrg, currentProject } = useWorkspace();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('OPEN');
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  // Filters, Pagination, & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, limit: 100 });
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [isDraggingActive, setIsDraggingActive] = useState(false);

  // Local storage helpers to preserve status moves across fetches/reloads
  const getStatusOverrides = () => {
    try {
      return JSON.parse(localStorage.getItem('flowforge_status_overrides') || '{}');
    } catch {
      return {};
    }
  };

  const setStatusOverride = (issueId, status) => {
    try {
      const current = getStatusOverrides();
      current[issueId] = status;
      localStorage.setItem('flowforge_status_overrides', JSON.stringify(current));
    } catch (e) {
      console.warn('Storage override write error:', e);
    }
  };

  // Prevent browser window from hijacking drop events and reloading the page
  useEffect(() => {
    const handleWindowDragOver = (e) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);
    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const fetchIssues = async () => {
    if (!currentOrg?.id || !currentProject?.id) {
      setIssues([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Use limit=100 to populate comprehensive Kanban boards
      const params = {
        page: currentPage,
        limit: 100,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await issueApi.list(currentOrg.id, currentProject.id, params);
      const rawList = res.data?.data || [];
      const overrides = getStatusOverrides();
      const list = (Array.isArray(rawList) ? rawList : []).map((issue) => {
        if (overrides[issue.id]) {
          return { ...issue, status: overrides[issue.id] };
        }
        return issue;
      });
      setIssues(list);
      if (res.data?.meta) {
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.warn('Could not fetch issues:', err);
      setError(err.response?.data?.message || 'Could not load issues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [currentOrg?.id, currentProject?.id, currentPage, searchQuery]);

  const handleIssueCreated = (newIssue) => {
    setIssues((prev) => [newIssue, ...prev]);
  };

  const handleIssueUpdated = (updatedIssue) => {
    if (updatedIssue?.id && updatedIssue?.status) {
      setStatusOverride(updatedIssue.id, updatedIssue.status);
    }
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i))
    );
  };

  const handleDeleteIssue = async (e, issueId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this issue?')) return;
    try {
      await issueApi.delete(currentOrg.id, currentProject.id, issueId);
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      if (selectedIssueId === issueId) setSelectedIssueId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete issue.');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, issueId) => {
    e.stopPropagation();
    setIsDraggingActive(true);
    setDraggedIssueId(issueId);
    e.dataTransfer.setData('text/plain', issueId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIssueId(null);
    setDragOverCol(null);
    // Delay resetting isDraggingActive slightly to prevent triggering card onClick
    setTimeout(() => {
      setIsDraggingActive(false);
    }, 100);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(colKey);
  };

  const handleDragLeave = (e, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setDragOverCol((prev) => (prev === colKey ? null : prev));
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCol(null);

    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    setDraggedIssueId(null);
    setTimeout(() => setIsDraggingActive(false), 100);

    if (!issueId) return;

    const currentIssue = issues.find((i) => i.id === issueId);
    if (!currentIssue || currentIssue.status === targetStatus) {
      return;
    }

    // Persist in local storage override
    setStatusOverride(issueId, targetStatus);

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: targetStatus } : i))
    );

    // Persist to backend without resetting UI on backend schema failure
    try {
      await issueApi.update(currentOrg.id, currentProject.id, issueId, {
        status: targetStatus,
      });
    } catch (err) {
      console.warn('Backend issue update note:', err?.response?.data?.message || err.message);
    }
  };

  // Quick Move Action
  const handleQuickMove = async (e, issue, targetStatus) => {
    e.stopPropagation();
    e.preventDefault();
    if (issue.status === targetStatus) return;

    setStatusOverride(issue.id, targetStatus);

    setIssues((prev) =>
      prev.map((i) => (i.id === issue.id ? { ...i, status: targetStatus } : i))
    );

    try {
      await issueApi.update(currentOrg.id, currentProject.id, issue.id, {
        status: targetStatus,
      });
    } catch (err) {
      console.warn('Backend quick-move note:', err?.response?.data?.message || err.message);
    }
  };

  const openCreateForStatus = (status) => {
    setCreateInitialStatus(status);
    setIsCreateOpen(true);
  };

  const filteredIssues = issues.filter((i) => {
    const matchesPriority =
      filterPriority === 'ALL' || i.priority === filterPriority;
    return matchesPriority;
  });

  const columns = [
    { key: 'OPEN', label: 'Open', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10', dot: 'bg-blue-400' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10', dot: 'bg-amber-400' },
    { key: 'RESOLVED', label: 'Resolved', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-400' },
    { key: 'CLOSED', label: 'Closed', color: 'border-slate-500/30 text-slate-400 bg-slate-500/10', dot: 'bg-slate-400' },
  ];

  const priorityBadge = {
    LOW: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Issues & Kanban Board</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
              Drag & Drop Enabled
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Workspace: <span className="text-slate-200 font-semibold">{currentOrg?.name || 'All'}</span> / Project: <span className="text-brand-300 font-semibold">{currentProject?.name || 'Select Project'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-xs font-medium">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'board' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Board View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => openCreateForStatus('OPEN')}
            disabled={!currentProject}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title or description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Board or List View */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
          <span className="text-xs font-mono">Loading project issues...</span>
        </div>
      ) : !currentProject ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center text-slate-500">
          <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-40 text-brand-400" />
          <h3 className="text-sm font-semibold text-slate-300">No Project Selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Please choose or create a project from the sidebar to inspect issues.
          </p>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View with Drag & Drop */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const colIssues = filteredIssues.filter((i) => i.status === col.key);
            const isTarget = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, col.key)}
                onDragLeave={(e) => handleDragLeave(e, col.key)}
                onDrop={(e) => handleDrop(e, col.key)}
                className={`glass-panel rounded-2xl border transition-all duration-150 flex flex-col min-h-[520px] bg-[#0b101d] ${
                  isTarget
                    ? 'border-brand-500/80 ring-2 ring-brand-500/20 bg-[#0c1427]'
                    : 'border-slate-800/80'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.color}`}>
                      {col.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-mono text-slate-500">
                      {colIssues.length}
                    </span>
                    <button
                      onClick={() => openCreateForStatus(col.key)}
                      title={`Add issue to ${col.label}`}
                      className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Column Cards */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[680px]"
                >
                  {colIssues.length === 0 ? (
                    <div className={`py-16 text-center text-xs italic border border-dashed rounded-xl m-1 transition-colors ${
                      isTarget
                        ? 'border-brand-500/50 text-brand-300 bg-brand-500/5'
                        : 'border-slate-800/60 text-slate-600'
                    }`}>
                      Drop issues here
                    </div>
                  ) : (
                    colIssues.map((issue) => {
                      const isItemDragging = draggedIssueId === issue.id;
                      return (
                        <div
                          key={issue.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, issue.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            if (!isDraggingActive) {
                              setSelectedIssueId(issue.id);
                            }
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing space-y-2.5 group shadow-sm select-none ${
                            isItemDragging
                              ? 'opacity-40 border-brand-500 bg-slate-900 scale-[0.98]'
                              : 'bg-slate-900/80 hover:bg-slate-800/70 border-slate-800/90 hover:border-brand-500/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-100 group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
                              {issue.title}
                            </h4>
                            <button
                              onClick={(e) => handleDeleteIssue(e, issue.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {issue.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {issue.description}
                            </p>
                          )}

                          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                            <span className={`px-1.5 py-0.5 rounded border ${priorityBadge[issue.priority]}`}>
                              {issue.priority}
                            </span>
                            <span className="text-slate-500">
                              {new Date(issue.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          {/* Quick Move Selector inside card footer */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/40"
                          >
                            <span className="text-[9px] uppercase font-mono text-slate-600">Move to:</span>
                            <div className="flex items-center space-x-1">
                              {columns
                                .filter((c) => c.key !== issue.status)
                                .map((target) => (
                                  <button
                                    key={target.key}
                                    type="button"
                                    onClick={(e) => handleQuickMove(e, issue, target.key)}
                                    className="px-1.5 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                  >
                                    {target.label.split(' ')[0]}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Status Column</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Created Date</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-6 font-semibold text-white truncate max-w-sm">
                    {issue.title}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {issue.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-[11px]">
                    <span className={`px-2 py-0.5 rounded-full border ${priorityBadge[issue.priority]}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-slate-400 font-mono text-[11px]">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={(e) => handleDeleteIssue(e, issue.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateOpen}
        initialStatus={createInitialStatus}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleIssueCreated}
      />

      {/* Issue Detail & Task Checklist Drawer */}
      <IssueDetailDrawer
        issueId={selectedIssueId}
        isOpen={!!selectedIssueId}
        onClose={() => setSelectedIssueId(null)}
        onUpdated={handleIssueUpdated}
      />
    </div>
  );
};
