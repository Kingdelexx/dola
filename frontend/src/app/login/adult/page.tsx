'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

export default function AdultSignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email address or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: identifier.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);

        // Role-based redirection
        const userRole = data.user.profile?.role || data.user.role;
        if (data.user.is_superuser || userRole === 'super_admin') {
          router.push('/super-admin');
        } else if (userRole === 'teacher') {
          router.push('/teacher-dashboard');
        } else if (userRole === 'school_admin') {
          router.push('/school-dashboard');
        } else if (userRole === 'parent') {
          router.push('/parent-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorMsg =
          data.error ||
          data.non_field_errors?.[0] ||
          (typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Sign in failed. Please check your credentials.');
        setError(errorMsg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Adult login error:', err);
      setError('Network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Adult Sign In"
      subtitle="Parent & Educator portal for account management and progress tracking."
      badge="Parent / Teacher"
      badgeColor="amber"
      backHref="/login"
      backLabel="Back to Choice"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Don't have an adult account yet?",
        linkText: "Sign Up Here",
        linkHref: "/signup/role"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Signing You In..."
        subTitle="Preparing your guardian and classroom dashboard..."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5 animate-shake">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email / Username Field */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Email / Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. parent@gmail.com or username"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              autoFocus
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3.5 pl-11 pr-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <span>Login</span>
          <span>&rarr;</span>
        </button>
      </form>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border-4 border-amber-300 rounded-[2rem] p-6 max-w-sm w-full text-center shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 text-2xl">
              🔑
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Reset Your Password
            </h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed mb-4">
              To keep student data secure, password resets are processed via our verified support channel or registered email.
            </p>
            <div className="space-y-2 text-left bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Check your spam/inbox for welcome details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span>Or message our team at <strong>support@dolacode.com</strong></span>
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
