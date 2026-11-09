import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../api/client';

export const FloatingAiChatbot = () => {
  const { currentOrg, currentProject } = useWorkspace();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I am your FlowForge AI Assistant.\n\nAsk me anything about your project tasks, milestones, deliverables, or workspace documentation.`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isProcessing]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query || isProcessing) return;

    if (!currentOrg?.id || !currentProject?.id) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'Please select an Organization and a Project from the top bar so I can assist you with your active project workspace.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    const userMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      const payload = {
        message: query,
        history: history.slice(-8),
      };

      const res = await aiApi.chat(currentOrg.id, currentProject.id, payload);
      const reply = res.data?.data?.reply || res.data?.reply || 'I processed your request, but received no text response.';

      const botMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);

      setHistory((prev) => [
        ...prev,
        { role: 'user', content: query },
        { role: 'model', content: reply },
      ]);
    } catch (err) {
      const errorReply =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Sorry, I encountered an issue connecting to the AI service. Please try again.';

      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ ${errorReply}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Chat cleared. How else can I help you with "${currentProject?.name || 'your workspace'}"?`,
        timestamp: 'Just now',
      },
    ]);
    setHistory([]);
  };

  const handleSuggestionClick = (promptText) => {
    setInput(promptText);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] rounded-3xl border border-slate-800 bg-[#0d1424]/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>FlowForge Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                  {currentProject?.name ? `Project: ${currentProject.name}` : 'Workspace Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions (if only 1 welcome message) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex flex-wrap gap-1.5">
              {[
                'Summarize active tasks',
                'What is our project status?',
                'Draft a new milestone',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => {
              const isMe = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <div className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 mt-0.5 border border-brand-500/20">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                      isMe
                        ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[9px] mt-1 text-right font-mono ${
                        isMe ? 'text-brand-200/70' : 'text-slate-500'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <div className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-2xl rounded-bl-sm flex items-center space-x-1.5 text-slate-400 text-xs font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI assistant anything..."
              disabled={isProcessing}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-brand-500 focus:outline-none placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white shadow-md shadow-brand-500/20 transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all duration-200 relative group"
        title={isOpen ? 'Close AI Assistant' : 'Chat with AI Assistant'}
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <>
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090d16]" />
          </>
        )}
      </button>
    </div>
  );
};
