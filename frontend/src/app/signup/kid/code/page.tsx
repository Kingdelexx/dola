'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, User, Lock, ArrowRight, Sparkles, School } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

interface FoundClass {
  id: number;
  name: string;
  join_code: string;
  school_name?: string;
  teacher_name?: string;
}

export default function KidsEnterCodeSignUpPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [classFound, setClassFound] = useState<FoundClass | null>(null);

  // Student registration in verified class
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('8');
  const [studentGender, setStudentGender] = useState<'boy' | 'girl'>('boy');
  const [studentPassword, setStudentPassword] = useState('');
  const [step, setStep] = useState<'enter_code' | 'student_info'>('enter_code');

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
        setStep('student_info');
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

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/join-class/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_code: classFound?.join_code || currentCode,
          student_name: studentName.trim(),
          age: parseInt(studentAge, 10) || 8,
          gender: studentGender,
          password: studentPassword || 'Student123!',
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to join class. Please try again.');
      }
    } catch (err) {
      console.error('Join class error:', err);
      setError('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 'enter_code' ? 'Enter Code' : 'Class Found!'}
      subtitle={
        step === 'enter_code'
          ? 'Enter the 4-digit code written on your classroom board.'
          : `Create your student seat in "${classFound?.name}"!`
      }
      badge="Classroom Join"
      badgeColor="emerald"
      backHref="/signup/kid"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Don't have a code?",
        linkText: "Ask a Parent",
        linkHref: "/signup/kid/no-code"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Checking Classroom..."
        subTitle="Connecting you to your teacher's workspace..."
      />

      {error && (
        <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
          <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 'enter_code' ? (
        <form onSubmit={handleVerifyCode} className="space-y-6 text-center">
          {/* 4 Colored Code Slots Matching Diagram 2 */}
          {!useCustomCode ? (
            <div className="flex justify-center items-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => {
                const colors = [
                  'bg-sky-500 text-white border-sky-400',
                  'bg-amber-400 text-slate-950 border-amber-300',
                  'bg-emerald-500 text-white border-emerald-400',
                  'bg-rose-500 text-white border-rose-400',
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
                      digits[idx] ? colors[idx] : 'bg-slate-100 text-slate-800 border-slate-300 focus:border-emerald-400'
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
                className="w-full text-center tracking-widest text-2xl font-black py-4 rounded-2xl bg-slate-50 border-4 border-emerald-300 outline-none uppercase"
                autoFocus
              />
            </div>
          )}

          {/* Toggle code mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setUseCustomCode(!useCustomCode);
                setError('');
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
            >
              {useCustomCode ? '← Use 4-slot code box' : 'My code has letters or dashes (e.g. CLS-1234)'}
            </button>
          </div>

          {/* Big Green "Go" Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg uppercase tracking-wider shadow-[0_5px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Verify Code</span>
            <ArrowRight size={20} />
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoinClass} className="space-y-4">
          {/* Class Banner */}
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
              Your Full Name or Nickname
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Tobi or Amara"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
                autoFocus
                required
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Age
              </label>
              <select
                value={studentAge}
                onChange={(e) => setStudentAge(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
              >
                {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((a) => (
                  <option key={a} value={a}>
                    {a} years old
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Avatar
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStudentGender('boy')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1 ${
                    studentGender === 'boy'
                      ? 'bg-sky-100 border-sky-400 text-sky-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>👦</span>
                  <span>Boy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStudentGender('girl')}
                  className={`flex-1 py-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1 ${
                    studentGender === 'girl'
                      ? 'bg-pink-100 border-pink-400 text-pink-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <span>👧</span>
                  <span>Girl</span>
                </button>
              </div>
            </div>
          </div>

          {/* Optional Password / PIN */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Secret Password <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
                placeholder="Choose a simple password"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep('enter_code')}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase"
            >
              Change Code
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join Class &amp; Start Coding!</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
