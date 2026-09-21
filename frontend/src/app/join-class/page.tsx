"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Sparkles, Key, CheckCircle2, ChevronRight, User, Calendar, Smile } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RocketLoader from '@/components/RocketLoader';

interface ClassData {
  id: number;
  name: string;
  grade_level?: string;
  teacher_name?: string;
  join_code: string;
  school_name: string;
}

export default function StudentJoinClassPage() {
  const [classCode, setClassCode] = useState('');
  const [classInfo, setClassInfo] = useState<ClassData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [codeError, setCodeError] = useState('');

  const [studentName, setStudentName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'girl' | 'boy'>('girl');
  const [password, setPassword] = useState('');
  
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!classCode.trim()) return;

    setIsSearching(true);
    setCodeError('');
    setClassInfo(null);

    try {
      const cleanCode = classCode.trim().toUpperCase();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/class/join-info/?code=${cleanCode}`);
      const data = await res.json();
      if (res.ok && data.classroom) {
        setClassInfo({
          ...data.classroom,
          school_name: data.school?.name || data.classroom.school_name
        });
      } else {
        setCodeError(data.error || `No class found matching code "${cleanCode}". Ask your teacher!`);
      }
    } catch (err) {
      setCodeError('Failed to connect to class finder. Try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classInfo) return;
    setSubmitError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/join-class/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_code: classInfo.join_code,
          student_name: studentName,
          age: parseInt(age) || null,
          gender: gender,
          password: password || 'Student123!'
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        router.push('/dashboard');
      } else {
        setSubmitError(data.error || (typeof data === 'object' ? Object.values(data).flat().join(', ') : 'Join failed'));
        setIsLoading(false);
      }
    } catch (err) {
      setSubmitError('Join failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-orange-100 to-pink-200 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <RocketLoader 
        isLoading={isLoading} 
        title="Joining Class Mission!" 
        subTitle={`Setting up ${studentName || 'student'}'s coding seat...`} 
      />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors z-20 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold text-xs shadow-sm">
        <ChevronRight className="rotate-180" size={16} /> Home
      </Link>

      <div className="max-w-lg w-full bg-white border-4 border-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 relative z-10 my-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-2">
            <img src="/logo.png" alt="DolaCode" className="w-[75px] mx-auto h-auto object-contain" />
          </Link>
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-full mb-2 border border-amber-200">
            <Sparkles size={14} className="text-amber-500 fill-amber-400" /> Student Entry
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Join Your Class! 🚀
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Type the Class Code written on your board by your teacher!
          </p>
        </div>

        {/* STEP 1: Enter Class Code */}
        {!classInfo ? (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {codeError && (
              <div className="text-xs font-bold text-red-600 bg-red-100 p-3 rounded-xl border border-red-200 text-center">
                {codeError}
              </div>
            )}

            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1.5 rounded-2xl shadow-md">
              <div className="bg-white rounded-xl p-3 flex items-center gap-3">
                <Key className="text-amber-500" size={24} />
                <input 
                  type="text" 
                  placeholder="Enter Class Code (e.g. P5A7KD)" 
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  required
                  maxLength={10}
                  className="w-full text-base sm:text-lg font-black uppercase tracking-widest text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSearching || !classCode.trim()}
              className="w-full py-3.5 px-4 font-black text-base rounded-2xl text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-[0_4px_0_#d97706] hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSearching ? 'Finding Class...' : 'Find My Class 🔍'}
            </button>
          </form>
        ) : (
          /* STEP 2: Preview Found Class & Enter Student Info */
          <form onSubmit={handleJoinClassSubmit} className="space-y-4">
            {/* Found Class Banner */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white p-4 rounded-2xl shadow-md relative overflow-hidden">
              <div className="text-[10px] uppercase font-black tracking-widest text-amber-200">Class Found! 🎉</div>
              <div className="text-lg font-black mt-0.5">{classInfo.name}</div>
              <div className="text-xs font-bold text-white/90 flex flex-wrap gap-2 mt-1">
                <span>🏫 {classInfo.school_name}</span>
                {classInfo.teacher_name && <span>• 👩‍🏫 {classInfo.teacher_name}</span>}
              </div>
              <button 
                type="button" 
                onClick={() => setClassInfo(null)}
                className="absolute top-3 right-3 text-[10px] font-black underline bg-black/20 hover:bg-black/30 px-2 py-1 rounded text-white"
              >
                Change Code
              </button>
            </div>

            {submitError && (
              <div className="text-xs font-bold text-red-600 bg-red-100 p-3 rounded-xl border border-red-200">
                {submitError}
              </div>
            )}

            {/* Student Name */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">Your Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. David Okon" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Age *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={16} />
                  </div>
                  <input 
                    type="number" 
                    placeholder="Age (e.g. 9)" 
                    min="5" max="18"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Gender *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Smile size={16} />
                  </div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'girl' | 'boy')}
                    disabled={isLoading}
                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="girl">👧 Girl</option>
                    <option value="boy">👦 Boy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PIN / Password */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1">Create Secret PIN / Password (Optional)</label>
              <input 
                type="password" 
                placeholder="4-digit PIN or Password (default: Student123!)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-4 font-black text-base rounded-2xl text-white bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 shadow-[0_4px_0_#d97706] hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Join Class & Start Coding 🚀
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs font-bold text-slate-500 border-t pt-4">
          Looking for parent or teacher signup? <Link href="/signup" className="text-amber-600 hover:underline ml-1">Go to Main Signup</Link>
        </div>
      </div>
    </div>
  );
}
