"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Rocket, Mail, Lock, ChevronRight, Gamepad2, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          login(data.token, data.user);
          const role = data.user?.profile?.role;
          if (role === 'super_admin') router.push('/super-admin');
          else if (role === 'teacher') router.push('/teacher-dashboard');
          else if (role === 'school_admin') router.push('/school-dashboard');
          else if (role === 'parent') router.push('/parent-dashboard');
          else router.push('/dashboard');
        } else {
          setError(data.non_field_errors?.[0] || 'Invalid email or password.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, { y: -40, opacity: 0, duration: 0.8, ease: "bounce.out" });
      gsap.from(".input-group", { 
        y: 20, opacity: 0, duration: 0.5, stagger: 0.15, ease: "back.out(1.5)", delay: 0.2 
      });
      gsap.from(".image-container", { x: 50, scale: 0.9, opacity: 0, duration: 1, ease: "elastic.out(1, 0.7)", delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-200 text-slate-800 flex items-center justify-center p-6 font-sans overflow-hidden" ref={containerRef}>
      {/* Playful Background Elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-sky-300 rounded-full blur-[80px] opacity-60" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-300 rounded-full blur-[80px] opacity-60" />
      <Star className="absolute top-24 right-[25%] text-yellow-400 w-10 h-10 opacity-60 rotate-45" />
      <Gamepad2 className="absolute bottom-24 right-[15%] text-indigo-400 w-16 h-16 opacity-30 -rotate-12" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors z-20 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold shadow-sm">
        <ChevronRight className="rotate-180" size={20} /> Back to Home
      </Link>

      <div className="max-w-5xl w-full bg-white border-4 border-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row-reverse relative z-10">
        
        {/* Right Side: Animation (Reversed for login) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-sky-400 to-indigo-500 items-center justify-center p-12 border-l-4 border-white image-container relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
          <img 
            src="/kids_login_hero.png" 
            alt="Unlock your world" 
            className="w-full max-w-[350px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10 rounded-[2rem] border-4 border-white/50 -rotate-3 hover:rotate-0 transition-transform duration-500" 
          />
          <div className="absolute bottom-8 left-8 right-8 text-center text-white z-10">
            <h3 className="font-black text-2xl drop-shadow-md">Welcome Back!</h3>
            <p className="font-medium text-sky-100 mt-2">Ready to continue your coding journey?</p>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-slate-50 relative">
          <div ref={titleRef} className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-600 text-sm font-black mb-4 border-2 border-sky-200 shadow-sm">
              <Gamepad2 size={18} className="fill-sky-500 text-white" /> Player 1 Ready
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-800 tracking-tight">Log In</h1>
            <p className="text-slate-500 font-medium text-lg">Enter your details to jump back in.</p>
          </div>

          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-sm font-bold bg-red-100 p-4 rounded-xl border-2 border-red-200 shadow-sm">{error}</div>}
            
            {/* Email */}
            <div className="input-group relative">
              <label className="block text-sm font-black text-slate-600 mb-2 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'email' ? 'text-sky-500' : 'text-slate-400'}`}>
                  <Mail size={22} />
                </div>
                <input 
                  type="email" 
                  placeholder="hello@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group relative">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-black text-slate-600 uppercase tracking-wide">Password</label>
                <Link href="#" className="text-sm font-bold text-sky-500 hover:text-sky-600 transition-colors">
                  Forgot Secret?
                </Link>
              </div>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'password' ? 'text-sky-500' : 'text-slate-400'}`}>
                  <Lock size={22} />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="input-group pt-4">
              <button 
                type="submit" 
                className="group w-full flex justify-center items-center gap-2 py-4 px-4 font-black text-xl rounded-xl text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 shadow-[0_6px_0_#2563eb] hover:translate-y-[-2px] hover:shadow-[0_8px_0_#2563eb] active:translate-y-[4px] active:shadow-[0_0px_0_#2563eb] transition-all"
              >
                Enter World <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-bold text-slate-500 input-group bg-white p-4 rounded-xl border-2 border-slate-100">
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-sky-500 hover:text-sky-400 transition-colors ml-1 underline decoration-2 underline-offset-2">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
