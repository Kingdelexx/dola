"use client";

import React, { useState } from 'react';
import { Mail, Sparkles, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface GmailPasswordlessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GmailPasswordlessModal({ isOpen, onClose }: GmailPasswordlessModalProps) {
  const [gmail, setGmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanGmail = gmail.trim().toLowerCase();
    if (!cleanGmail || !cleanGmail.includes('@')) {
      setError('Please enter a valid Gmail address (e.g. name@gmail.com)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanGmail, 
          name: cleanGmail.split('@')[0] 
        })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        onClose();
        const role = data.user?.profile?.role;
        if (role === 'super_admin') router.push('/super-admin');
        else if (role === 'teacher') router.push('/teacher-dashboard');
        else if (role === 'school_admin') router.push('/school-dashboard');
        else if (role === 'parent') router.push('/parent-dashboard');
        else router.push('/dashboard');
      } else {
        setError(data.error || 'Gmail login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Gmail passwordless login error:", err);
      setError('Network error. Could not authenticate Gmail address.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-sky-200 relative overflow-hidden text-slate-800">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black mb-4 border border-emerald-200 shadow-xs uppercase tracking-wider">
          <ShieldCheck size={14} /> Passwordless Instant Login
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Sign In with Gmail</h3>
            <p className="text-slate-500 text-xs font-medium">No password required. Instant login!</p>
          </div>
        </div>

        <form onSubmit={handleGmailSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wide mb-2">Your Gmail Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-slate-800 font-bold placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-sm shadow-xs"
              />
            </div>
          </div>

          <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl flex items-start gap-2 text-xs text-sky-700 font-medium">
            <CheckCircle2 size={16} className="text-sky-500 shrink-0 mt-0.5" />
            <span>Enter your Gmail address to sign in immediately without remembering a password.</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !gmail.trim()}
              className="flex-[2] py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : <>Sign In Now <ArrowRight size={14} /></>}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
