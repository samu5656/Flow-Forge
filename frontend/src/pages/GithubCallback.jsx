import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../api/client';

export const GithubCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [message, setMessage] = useState('Authenticating with GitHub OAuth...');
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing code or state parameters from GitHub OAuth callback.');
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/github/callback`, {
          params: { code, state },
          withCredentials: true,
        });

        if (res.data?.success) {
          setStatus('success');
          setMessage(res.data?.message || 'GitHub connected successfully!');
          setAccount(res.data?.data);
        } else {
          setStatus('error');
          setMessage(res.data?.message || 'GitHub OAuth failed.');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to exchange authorization code with GitHub.'
        );
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 text-center">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        {status === 'processing' && (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto" />
            <h2 className="text-base font-bold text-white">Completing GitHub Handshake</h2>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">GitHub Connected!</h2>
            <p className="text-xs text-slate-300">{message}</p>
            {account && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3 text-left">
                {account.avatarUrl && (
                  <img
                    src={account.avatarUrl}
                    alt={account.username}
                    className="w-9 h-9 rounded-full border border-slate-700"
                  />
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">@{account.username}</p>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {account.githubId}</p>
                </div>
              </div>
            )}
            <a
              href="/github"
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-md transition-all"
            >
              <span>Return to GitHub Hub</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">OAuth Connection Failed</h2>
            <p className="text-xs text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 leading-relaxed">
              {message}
            </p>
            <a
              href="/github"
              className="mt-4 inline-flex items-center space-x-2 text-xs text-slate-400 hover:text-white"
            >
              <span>Back to GitHub Hub</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
