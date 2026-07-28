'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

function ParentOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const { login } = useAuth();
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/claim-account/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        login(data.token, data.user);
        setTimeout(() => {
          router.push('/parent-dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Failed to set password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center mx-auto text-2xl shadow-lg">
            👨‍👩‍👧
          </div>
          <h1 className="text-2xl font-black text-white flex items-center justify-center gap-1.5">
            Welcome to DolaCode <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Create your password to claim your Parent account and monitor your child&apos;s learning progress!
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Password created! Redirecting to Parent Dashboard...
          </div>
        )}

        <form onSubmit={handleCreatePassword} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300 block mb-1">Parent Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Create Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Set Password & Access Dashboard'}
          </button>
        </form>

        <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <p>✨ <strong>What happens next?</strong></p>
          <p>You will gain immediate access to monitor lessons completed, homework submissions, numeracy & coding progress, weekly reports, and subscription details!</p>
        </div>
      </div>
    </div>
  );
}

export default function ParentOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <ParentOnboardingContent />
    </Suspense>
  );
}
