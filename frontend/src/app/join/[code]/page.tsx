"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Rocket, Mail, User, Lock, Building2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RocketLoader from '@/components/RocketLoader';

interface SchoolData {
  id: number;
  name: string;
  code: string;
  address?: string;
}

export default function JoinSchoolTeacherPage() {
  const params = useParams();
  const rawCode = params?.code as string;
  const schoolCode = rawCode ? rawCode.toUpperCase() : '';

  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!schoolCode) return;
    const fetchSchool = async () => {
      setIsFetching(true);
      setFetchError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/join-info/?code=${schoolCode}`);
        const data = await res.json();
        if (res.ok && data.school) {
          setSchool(data.school);
        } else {
          setFetchError(data.error || `No school found matching code ${schoolCode}`);
        }
      } catch (err) {
        setFetchError('Failed to fetch school details.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchSchool();
  }, [schoolCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'teacher',
          school_code: schoolCode
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        router.push('/teacher-dashboard');
      } else {
        setSubmitError(Object.values(data).flat().join(', ') || 'Registration failed');
        setIsLoading(false);
      }
    } catch (err) {
      setSubmitError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-200 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      <RocketLoader 
        isLoading={isLoading} 
        title="Joining School..." 
        subTitle={`Setting up your Teacher account...`} 
      />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors z-20 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold text-xs shadow-sm">
        <ChevronRight className="rotate-180" size={16} /> Home
      </Link>

      <div className="max-w-md w-full bg-white border-4 border-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <img src="/logo.png" alt="DolaCode" className="w-[70px] mx-auto h-auto object-contain" />
          </Link>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-full mb-3 border border-purple-200">
            <Building2 size={14} /> Teacher Invitation
          </div>

          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Join School Team
          </h1>
        </div>

        {isFetching ? (
          <div className="py-12 text-center space-y-3">
            <Rocket className="w-10 h-10 text-purple-600 animate-bounce mx-auto" />
            <p className="text-xs font-extrabold text-slate-500">Checking invitation code...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <div className="text-sm font-black text-red-800">Invalid Invitation Link</div>
            <p className="text-xs font-medium text-red-600">{fetchError}</p>
            <Link 
              href="/signup" 
              className="inline-block px-4 py-2 bg-red-600 text-white font-black text-xs rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              Go to Regular Signup
            </Link>
          </div>
        ) : school ? (
          <>
            {/* School Invitation Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl mb-6 shadow-md relative overflow-hidden">
              <div className="text-[11px] uppercase font-black tracking-wider text-indigo-200">Official Invitation</div>
              <div className="text-lg font-black mt-0.5 flex items-center justify-between">
                <span>{school.name}</span>
                <CheckCircle2 size={20} className="text-emerald-300" />
              </div>
              <div className="text-xs font-medium text-white/90 mt-1">
                Code: <span className="font-extrabold tracking-widest bg-white/20 px-2 py-0.5 rounded text-white">{school.code}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="text-xs font-bold text-red-600 bg-red-100 p-3 rounded-xl border border-red-200">
                  {submitError}
                </div>
              )}

              {/* Teacher Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Teacher Full Name (e.g. Mrs Johnson)" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="Teacher Email Address" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  placeholder="Create Password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 px-4 font-black text-sm rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-[0_4px_0_#4338ca] hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Join as Teacher <Rocket size={18} />
              </button>
            </form>
          </>
        ) : null}

        <div className="mt-6 text-center text-xs font-medium text-slate-500 border-t pt-4">
          Already have an account? <Link href="/login" className="text-purple-600 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
