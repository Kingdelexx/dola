'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, School, Sparkles } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

export default function TeacherSignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid school or personal email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          role: 'teacher',
          school_name: schoolName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        router.push('/teacher-dashboard');
      } else {
        const errorMsg =
          data.error ||
          data.username?.[0] ||
          data.email?.[0] ||
          (typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Teacher registration failed.');
        setError(errorMsg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Teacher signup error:', err);
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Teacher Sign Up"
      subtitle="Set up your educator workspace, create classrooms, and generate student join codes."
      badge="Educator Portal"
      badgeColor="amber"
      backHref="/signup/role"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Already registered as a teacher?",
        linkText: "Sign In",
        linkHref: "/login/adult"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Setting Up Classroom..."
        subTitle="Creating your teacher workspace and code generator..."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Teacher Full Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Teacher Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mrs. Funke Johnson"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400"
              autoFocus
              required
            />
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            School / Personal Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. teacher@school.edu.ng"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400"
              required
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* School Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            School Name <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Corona Primary School"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400"
            />
            <School className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-4 py-3.5 pl-11 pr-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400"
              required
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

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#b45309] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-5"
        >
          <span>Create Teacher Account &amp; Class</span>
          <ArrowRight size={18} />
        </button>
      </form>
    </AuthLayout>
  );
}
