import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  User,
  Upload,
  Key,
  Shield,
  Copy,
  Check,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';

export const Profile = () => {
  const { user, token, updateAvatar } = useAuth();
  const { isConnected } = useSocket();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus(null);
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      await updateAvatar(formData);
      setUploadStatus({
        type: 'success',
        text: 'Avatar uploaded and profile updated successfully!',
      });
      setSelectedFile(null);
    } catch (err) {
      console.error('Avatar upload failed:', err);
      setUploadStatus({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload avatar.',
      });
    } finally {
      setUploading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const userAvatar =
    previewUrl ||
    (user?.avatarUrl
      ? user.avatarUrl.startsWith('http')
        ? user.avatarUrl
        : user.avatarUrl
      : null);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <span>Developer Settings & Profile</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-mono">
            Auth v1
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your account credentials, avatar asset, and real-time WebSocket connectivity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center">
            <div className="relative mx-auto w-28 h-28 rounded-full border-2 border-brand-500/50 p-1 mb-4 shadow-xl glow-brand-sm">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={user?.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
            </div>

            <h2 className="text-base font-bold text-white">{user?.name || 'Developer'}</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email}</p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 glow-brand-sm animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="text-[11px] font-mono text-slate-400">
                {isConnected ? 'Socket Room Active' : 'Offline'}
              </span>
            </div>
          </div>

          {/* Avatar Upload Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center space-x-2">
              <Upload className="w-4 h-4 text-brand-400" />
              <span>Update Profile Picture</span>
            </h3>

            {uploadStatus && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs ${
                  uploadStatus.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {uploadStatus.text}
              </div>
            )}

            <form onSubmit={handleAvatarUpload} className="space-y-4">
              <div className="border border-dashed border-slate-700 hover:border-brand-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-950/40">
                <input
                  type="file"
                  id="avatarInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="avatarInput" className="cursor-pointer block">
                  <Upload className="w-6 h-6 mx-auto text-slate-500 mb-2" />
                  <span className="text-xs text-slate-300 block font-medium">
                    {selectedFile ? selectedFile.name : 'Choose an image file'}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    PNG, JPG, WebP up to 5MB
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!selectedFile || uploading}
                className="w-full py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <span>Uploading to /api/v1/auth/avatar...</span>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Avatar</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Account Details & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Identity & Session Context</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  User ID
                </span>
                <span className="text-slate-200 break-all">{user?.id || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  Email Address
                </span>
                <span className="text-slate-200">{user?.email || 'N/A'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  Registered Date
                </span>
                <span className="text-slate-200">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">
                  Security Protocol
                </span>
                <span className="text-emerald-400">JWT + HttpOnly Cookie</span>
              </div>
            </div>
          </div>

          {/* Active JWT Access Token Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                <Key className="w-4 h-4 text-brand-400" />
                <span>Active Bearer Token</span>
              </h3>
              <button
                onClick={copyToken}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-1.5 transition-colors border border-slate-700"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Token</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400">
              This short-lived JWT Bearer token is automatically attached to every FlowForge API call.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-brand-300/80 break-all select-all">
              {token || 'No active token'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
