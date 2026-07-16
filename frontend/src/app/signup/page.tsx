"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Rocket, Mail, User, Lock, ChevronRight, Calendar, Code, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', age: '', coding_experience: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          profile: {
            age: parseInt(formData.age) || null,
            coding_experience: formData.coding_experience
          }
        })
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) {
          login(data.token, data.user);
          router.push('/dashboard');
        } else {
          setError(Object.values(data).flat().join(', ') || 'Registration failed');
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, { y: -40, opacity: 0, duration: 0.8, ease: "bounce.out" });
      gsap.from(".input-group", { 
        x: -30, opacity: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)", delay: 0.2 
      });
      gsap.from(".image-container", { scale: 0.8, rotation: -5, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 0.4 });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 text-slate-800 flex items-center justify-center p-6 font-sans overflow-hidden" ref={containerRef}>
      {/* Playful Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-[80px] opacity-60" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-300 rounded-full blur-[80px] opacity-60" />
      <Star className="absolute top-20 left-[20%] text-yellow-400 w-12 h-12 opacity-50 rotate-12" />
      <Star className="absolute bottom-32 left-[10%] text-pink-400 w-8 h-8 opacity-50 -rotate-12" />
      <Rocket className="absolute top-32 right-[15%] text-purple-400 w-16 h-16 opacity-30 rotate-45" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors z-20 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold shadow-sm">
        <ChevronRight className="rotate-180" size={20} /> Back to Home
      </Link>

      <div className="max-w-5xl w-full bg-white border-4 border-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Animation & Playful Vibe */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-pink-400 to-purple-500 items-center justify-center p-12 border-r-4 border-white image-container relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <img 
            src="/kids_signup_hero.png" 
            alt="Start your adventure" 
            className="w-full max-w-[400px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10 rounded-[2rem] border-4 border-white/50 rotate-3 hover:rotate-0 transition-transform duration-500" 
          />
          <div className="absolute bottom-8 left-8 right-8 text-center text-white z-10">
            <h3 className="font-black text-2xl drop-shadow-md">Join the Adventure!</h3>
            <p className="font-medium text-pink-100 mt-2">Build games, make friends, and learn to code!</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 bg-slate-50 relative">
          <div ref={titleRef} className="mb-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-sm font-black mb-4 border-2 border-pink-200 shadow-sm">
              <Sparkles size={18} className="fill-pink-500" /> Welcome, Champ!
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-800 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium text-lg">Start your coding adventure today!</p>
          </div>

          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-sm font-bold bg-red-100 p-4 rounded-xl border-2 border-red-200 shadow-sm">{error}</div>}
            
            {/* Name */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'name' ? 'text-pink-500' : 'text-slate-400'}`}>
                <User size={22} />
              </div>
              <input 
                type="text" 
                placeholder="Your Name or Nickname" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
              />
            </div>

            {/* Email */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'email' ? 'text-purple-500' : 'text-slate-400'}`}>
                <Mail size={22} />
              </div>
              <input 
                type="email" 
                placeholder="Parent or Your Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 input-group">
              {/* Age */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'age' ? 'text-orange-500' : 'text-slate-400'}`}>
                  <Calendar size={22} />
                </div>
                <input 
                  type="number" 
                  placeholder="Age" 
                  min="5" max="99"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  required
                  onFocus={() => setFocusedInput('age')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
                />
              </div>

              {/* Experience */}
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'exp' ? 'text-sky-500' : 'text-slate-400'}`}>
                  <Code size={22} />
                </div>
                <select 
                  onFocus={() => setFocusedInput('exp')}
                  onBlur={() => setFocusedInput(null)}
                  value={formData.coding_experience}
                  onChange={(e) => setFormData({...formData, coding_experience: e.target.value})}
                  required
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="" disabled hidden>Experience</option>
                  <option value="beginner">Beginner</option>
                  <option value="some">Played around</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'password' ? 'text-pink-500' : 'text-slate-400'}`}>
                <Lock size={22} />
              </div>
              <input 
                type="password" 
                placeholder="Create Secret Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
              />
            </div>

            <div className="input-group pt-4">
              <button 
                type="submit" 
                className="group w-full flex justify-center items-center gap-2 py-4 px-4 font-black text-xl rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 shadow-[0_6px_0_#c026d3] hover:translate-y-[-2px] hover:shadow-[0_8px_0_#c026d3] active:translate-y-[4px] active:shadow-[0_0px_0_#c026d3] transition-all"
              >
                Let's Go! <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-bold text-slate-500 input-group bg-white p-4 rounded-xl border-2 border-slate-100">
            Already have an account?{' '}
            <Link href="/login" className="text-pink-500 hover:text-pink-400 transition-colors ml-1 underline decoration-2 underline-offset-2">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
