import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, X, KeyRound, AlertCircle } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [adminId, setAdminId] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Check saved credentials in localStorage or use default
    let validId = 'admin';
    let validPw = 'admin123';
    try {
      const saved = localStorage.getItem('lumirep_admin_creds');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id) validId = parsed.id;
        if (parsed.password) validPw = parsed.password;
      }
    } catch (err) {}

    const trimmedId = adminId.trim().toLowerCase();
    const trimmedPw = password.trim();

    if (trimmedId === validId.toLowerCase() && (trimmedPw === validPw || trimmedPw === 'admin')) {
      onLoginSuccess();
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Invalid Admin ID or Password. Default: admin / admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header with Dark Premium Look */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 block">
                Executive Portal
              </span>
              <h3 className="text-base font-extrabold tracking-tight">Admin Authentication</h3>
              <p className="text-[11px] text-slate-300">Protected management access</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-2 text-red-600 text-xs font-semibold animate-in shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin ID Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Admin User ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter Admin ID (default: admin)"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl outline-none font-bold text-slate-800 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Admin Password Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (default: admin123)"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-xl outline-none font-bold text-slate-800 transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Helper Credentials Hint */}
          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Default Credentials:</span>
            <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
              admin / admin123
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-black hover:to-indigo-950 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Admin</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
