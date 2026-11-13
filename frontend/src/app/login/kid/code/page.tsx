'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, AlertCircle, CheckCircle2, User, Lock, ArrowRight } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

interface FoundClass {
  id: number;
  name: string;
  join_code: string;
  school_name?: string;
  teacher_name?: string;
}

export default function EnterClassCodeLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classFound, setClassFound] = useState<FoundClass | null>(null);

  // Student credentials within found class
  const [studentName, setStudentName] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [loginStep, setLoginStep] = useState<'enter_code' | 'enter_student'>('enter_code');

  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).toUpperCase();
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError('');

    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const currentCode = useCustomCode ? customCode.trim() : digits.join('').trim();

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!currentCode || currentCode.length < 3) {
      setError('Please enter your full classroom code.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/class/join-info/?code=${currentCode}`);
      const data = await res.json();

      if (res.ok && data.classroom) {
        setClassFound({
          ...data.classroom,
          school_name: data.school?.name || data.classroom.school_name,
        });
        setLoginStep('enter_student');
      } else {
        setError(data.error || `No classroom found for code "${currentCode}". Check with your teacher!`);
      }
    } catch (err) {
      console.error('Verify code error:', err);
      setError('Could not verify class code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your name or username.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // First attempt direct login with username + password
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: studentName.trim(),
          password: studentPassword || 'Student123!',
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        router.push('/dashboard');
        return;
      }

      // If account does not exist yet for this class, join/create student seat automatically
      const joinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/join-class/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_code: classFound?.join_code || currentCode,
          student_name: studentName.trim(),
          password: studentPassword || 'Student123!',
        }),
      });

      const joinData = await joinRes.json();

      if (joinRes.ok && joinData.token && joinData.user) {
        login(joinData.token, joinData.user);
        router.push('/dashboard');
      } else {
        setError(joinData.error || 'Failed to sign into class. Please check your details.');
      }
    } catch (err) {
      console.error('Student class login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={loginStep === 'enter_code' ? 'Enter Code' : 'Welcome to Class!'}
      subtitle={
        loginStep === 'enter_code'
          ? 'Type the 4-digit code written on the classroom board.'
          : `You are signing into "${classFound?.name}"!`
      }
      badge="Classroom Code"
      badgeColor="amber"
      backHref="/login/kid"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Need to sign in with username & password instead?",
        linkText: "Click Here",
        linkHref: "/login/kid/direct"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Checking Classroom..."
        subTitle="Connecting you to your teacher's coding class..."
      />

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loginStep === 'enter_code' ? (
        <form onSubmit={handleVerifyCode} className="space-y-6 text-center">
          {/* 4 Code Slots Matching Diagram 1 */}
          {!useCustomCode ? (
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const colors = [
                  'bg-rose-500 text-white border-rose-400',
                  'bg-amber-400 text-slate-950 border-amber-300',
                  'bg-emerald-500 text-white border-emerald-400',
                  'bg-sky-500 text-white border-sky-400',
                ];
                return (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs[idx].current = el; }}
                    type="text"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={`w-14 h-16 sm:w-16 sm:h-20 rounded-2xl text-3xl font-black text-center shadow-lg border-4 transition-all focus:scale-105 outline-none ${
                      digits[idx] ? colors[idx] : 'bg-slate-100 text-slate-800 border-slate-300 focus:border-amber-400'
                    }`}
                  />
                );
              })}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Classroom Code
              </label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                placeholder="e.g. CLS-4892"
                className="w-full text-center tracking-widest text-2xl font-black py-4 rounded-2xl bg-slate-50 border-4 border-amber-300 outline-none uppercase"
                autoFocus
              />
            </div>
          )}

          {/* Toggle between 4 digits and alphanumeric code */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseCustomCode(!useCustomCode);
                setError('');
              }}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
            >
              {useCustomCode ? '← Use 4-slot code box' : 'My code has letters or dashes (e.g. CLS-1234)'}
            </button>
          </div>

          {/* Big Green "Go" Button Matching Diagram 1 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg uppercase tracking-wider shadow-[0_5px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go</span>
            <span>🚀</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleStudentLogin} className="space-y-4">
          {/* Class Found Banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
              Class Verified! 🏫
            </div>
            <div className="text-xl font-black">{classFound?.name}</div>
            {classFound?.school_name && (
              <div className="text-xs text-white/90 font-semibold">{classFound.school_name}</div>
            )}
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Your Name or Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. David or Tobi"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
                autoFocus
                required
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {/* Optional Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Secret PIN or Password <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                placeholder="Leave blank if teacher did not set one"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLoginStep('enter_code')}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase"
            >
              Change Code
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join &amp; Start Coding!</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
