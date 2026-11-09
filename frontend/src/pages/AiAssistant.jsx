import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Database,
  FileText,
  CornerDownLeft,
  Loader2,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { aiApi, documentApi } from '../api/client';

export const AiAssistant = () => {
  const { currentOrg, currentProject } = useWorkspace();
  const { user } = useAuth();

  const [activeModel, setActiveModel] = useState('Google Gemini (Live Project Context)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'Developer'}! I am your FlowForge AI Assistant.\n\nI have access to live database context for ${currentProject?.name || 'your active project'}, including current issues, tasks, milestones, labels, and project documentation.\n\nHow can I help you? You can ask me to analyze project status, summarize critical bugs, create new issues, or add subtasks!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Knowledge Base Documents State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isKbDrawerOpen, setIsKbDrawerOpen] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Knowledge Base Document Ingestion Modal
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('ARCHITECTURE');
  const [docContent, setDocContent] = useState('');
  const [isIngestingDoc, setIsIngestingDoc] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');
  const [docErrorMsg, setDocErrorMsg] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Fetch indexed project documents whenever project changes
  const fetchDocuments = async () => {
    if (!currentOrg?.id || !currentProject?.id) {
      setDocuments([]);
      return;
    }
    setLoadingDocs(true);
    try {
      const res = await documentApi.list(currentOrg.id, currentProject.id);
      const list = res.data?.data || [];
      setDocuments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Could not load project documents:', err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    if (currentProject) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'assistant',
          text: `Active project switched to "${currentProject.name}". Context is now synchronized with this project.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setHistory([]);
    }
  }, [currentOrg?.id, currentProject?.id]);

  // Prompt suggestions
  const samplePrompts = [
    'What is the current status of all issues in this project?',
    'List all unresolved tasks that need attention',
    'Create an issue titled "Security audit: Verify JWT refresh tokens"',
    'Summarize this project architecture and knowledge base documents',
  ];

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input;
    if (!query.trim() || isProcessing) return;

    if (!currentOrg?.id || !currentProject?.id) {
      setErrorBanner('Please select an Organization and a Project from the sidebar before chatting with AI.');
      return;
    }

    setErrorBanner('');
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const res = await aiApi.chat(currentOrg.id, currentProject.id, {
        message: query.trim(),
        history: history,
      });

      if (res.data?.success && res.data?.data) {
        const { reply, history: updatedHistory } = res.data.data;
        if (updatedHistory && Array.isArray(updatedHistory)) {
          setHistory(updatedHistory);
        }

        const botMessage = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: reply || 'I received your request but have no response content.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(res.data?.message || 'Unexpected response format from AI service.');
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to communicate with FlowForge AI backend.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: `⚠️ **AI Service Error**: ${errMsg}\n\nPlease check your backend GEMINI_API_KEY and network connectivity.`,
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIngestDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim() || !docContent.trim() || !currentOrg?.id || !currentProject?.id) return;

    setIsIngestingDoc(true);
    setDocErrorMsg('');
    setDocSuccessMsg('');

    try {
      const res = await documentApi.create(currentOrg.id, currentProject.id, {
        title: docTitle.trim(),
        category: docCategory,
        content: docContent.trim(),
      });

      if (res.data?.success) {
        setDocSuccessMsg('Document successfully added to Project Knowledge Base!');
        setDocTitle('');
        setDocContent('');
        await fetchDocuments();
        setTimeout(() => {
          setIsDocModalOpen(false);
          setDocSuccessMsg('');
        }, 1200);

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'assistant',
            text: `📄 Ingested new architecture document "${docTitle.trim()}" (${docCategory}). The document has been saved and is now accessible by the AI assistant.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to ingest document:', err);
      setDocErrorMsg(err.response?.data?.message || 'Failed to ingest and embed document.');
    } finally {
      setIsIngestingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId, title) => {
    if (!window.confirm(`Delete document "${title}" from project knowledge base?`)) return;
    try {
      await documentApi.delete(currentOrg.id, currentProject.id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const clearChat = () => {
    setHistory([]);
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Conversation cleared. What project context would you like to explore next?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const filteredDocs = documents.filter((d) => {
    if (!docSearchQuery.trim()) return true;
    const q = docSearchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.content?.toLowerCase().includes(q)
    );
  });

  const categoryBadgeColors = {
    ARCHITECTURE: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    API: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ONBOARDING: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    GENERAL: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>AI Project Assistant</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
              Smart Assistant
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Intelligent assistant connected to your project workspace, tasks, deliverables, and documentation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Knowledge Base Manager Button */}
          <button
            onClick={() => setIsKbDrawerOpen(true)}
            disabled={!currentProject}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Knowledge Base ({documents.length})</span>
          </button>

          {/* Document Ingestion Button */}
          <button
            onClick={() => setIsDocModalOpen(true)}
            disabled={!currentProject}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Document</span>
          </button>

          {/* Model Selector */}
          <select
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 text-xs font-mono focus:outline-none"
          >
            <option value="Google Gemini (Live Project Context)">Google Gemini (Live Project Context)</option>
          </select>

          <button
            onClick={clearChat}
            title="Clear Chat"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RAG Context Strip */}
      <div className="glass-panel p-3 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
          <Database className="w-3.5 h-3.5 text-purple-400" />
          <span>Active Context:</span>
          <span className="text-slate-200 font-semibold">{currentProject?.name || 'No Project Selected'}</span>
          {currentOrg && (
            <span className="text-slate-500">({currentOrg.name})</span>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-purple-300">{documents.length} Project Documents</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="text-emerald-400 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Assistant Online</span>
          </span>
        </div>
      </div>

      {errorBanner && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Chat Messages Log */}
      <div className="flex-1 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden bg-[#0a0f1e]">
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex space-x-3.5 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white shadow-lg'
                    : m.isError
                    ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                <div className="text-[9px] text-slate-500 text-right font-mono">
                  {m.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center space-x-3 text-xs text-purple-300 font-mono">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>FlowForge AI is analyzing live project context and querying Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div className="px-6 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center space-x-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 font-mono shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={isProcessing}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center space-x-3"
        >
          <input
            type="text"
            value={input}
            disabled={isProcessing}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask AI about ${currentProject?.name || 'FlowForge'} project issues, tasks, or request issue creation...`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-colors"
          >
            <span>Ask Copilot</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Knowledge Base Documents Drawer */}
      {isKbDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl h-full glass-panel border-l border-slate-800 shadow-2xl flex flex-col bg-[#0c1222] animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Project Knowledge Base</h3>
                  <p className="text-[11px] text-slate-400">
                    Documents embedded as vector embeddings for semantic retrieval
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsKbDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Actions */}
            <div className="p-4 border-b border-slate-800/80 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  placeholder="Search indexed documents..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => {
                  setIsKbDrawerOpen(false);
                  setIsDocModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Doc</span>
              </button>
            </div>

            {/* Document List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingDocs ? (
                <div className="py-20 text-center text-slate-500 flex flex-col items-center space-y-2">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                  <span className="text-xs font-mono">Loading project documents...</span>
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto opacity-40 text-purple-400" />
                  <p className="text-xs font-medium text-slate-300">No documents found</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Add specifications, requirements, project briefs, or guides to help your AI assistant understand your project.
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 space-y-2 group transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${categoryBadgeColors[doc.category] || categoryBadgeColors.GENERAL}`}>
                          {doc.category}
                        </span>
                        <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                          {doc.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                        title="Delete Document"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                      {doc.content}
                    </p>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{doc.content?.length || 0} characters</span>
                      <span>Indexed {new Date(doc.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ingest Project Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-2xl border border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-150 bg-[#0c1222]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Add Project Document</h3>
                  <p className="text-[11px] text-slate-400">Add documentation to your project knowledge base</p>
                </div>
              </div>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {docSuccessMsg && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{docSuccessMsg}</span>
              </div>
            )}

            {docErrorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{docErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleIngestDocument} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Authentication & Token Architecture"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value="ARCHITECTURE">ARCHITECTURE</option>
                  <option value="API">API</option>
                  <option value="ONBOARDING">ONBOARDING</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Content (Markdown / Text)
                </label>
                <textarea
                  required
                  rows={6}
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste documentation content, schema details, or system flow for AI vector indexing..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIngestingDoc || !docTitle.trim() || !docContent.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md disabled:opacity-50 transition-all"
                >
                  {isIngestingDoc ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>{isIngestingDoc ? 'Computing Vector Embeddings...' : 'Ingest & Embed'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
