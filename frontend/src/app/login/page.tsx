"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Mail, Lock, ChevronRight, Gamepad2, Star, Rocket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RocketLoader from '@/components/RocketLoader';

export default function LoginPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
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
          setIsLoading(false);
        }
      } else {
        setError('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
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

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleGoogleAuth = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '106344535315-jsm41ud840rm19plmbh4em94j9g3bb9o.apps.googleusercontent.com';
    
    const triggerFallbackPrompt = async () => {
      const promptEmail = prompt("Enter your Gmail address to sign in with Google:");
      if (!promptEmail || !promptEmail.trim()) return;

      setError('');
      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: promptEmail, name: promptEmail.split('@')[0] })
        });
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
          setError(data.error || 'Google Authentication failed.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Google Authentication failed.');
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id?: { initialize: (config: object) => void; prompt: (notification?: any) => void } } } }).google?.accounts?.id) {
      const googleObj = (window as unknown as { google: { accounts: { id: { initialize: (config: object) => void; prompt: (notification?: any) => void } } } }).google;
      googleObj.accounts.id.initialize({
        client_id: googleClientId,
        use_fedcm_for_prompt: false,
        callback: async (response: { credential?: string }) => {
          if (response.credential) {
            setIsLoading(true);
            try {
              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: response.credential })
              });
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
                setError(data.error || 'Google Login failed.');
                setIsLoading(false);
              }
            } catch (err) {
              console.error(err);
              setError('Google Authentication error.');
              setIsLoading(false);
            }
          }
        }
      });
      googleObj.accounts.id.prompt((notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getNotDisplayedReason: () => string }) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Google prompt not displayed, using prompt fallback.');
          triggerFallbackPrompt();
        }
      });
    } else {
      triggerFallbackPrompt();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-200 text-slate-800 flex items-center justify-center p-6 font-sans overflow-hidden relative" ref={containerRef}>
      {/* Fullscreen Rocket Launch Overlay Loader */}
      <RocketLoader 
        isLoading={isLoading} 
        title="Preparing for Liftoff..." 
        subTitle="Logging into your coding mission control..." 
      />

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
          <div ref={titleRef} className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-sky-600 text-sm font-black mb-4 border-2 border-sky-200 shadow-sm">
              <Gamepad2 size={18} className="fill-sky-500 text-white" /> Player 1 Ready
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 text-slate-800 tracking-tight">Log In</h1>
            <p className="text-slate-500 font-medium text-base">Select your preferred login option.</p>
          </div>

          {/* Google Sign In Button */}
          <div className="mb-6">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleAuth}
              className="w-full py-3.5 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google / Gmail
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t-2 border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs uppercase font-black text-slate-400 tracking-wider">or with email</span>
            <div className="flex-grow border-t-2 border-slate-200"></div>
          </div>

          <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="input-group pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="group w-full flex justify-center items-center gap-2 py-4 px-4 font-black text-xl rounded-xl text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 shadow-[0_6px_0_#2563eb] hover:translate-y-[-2px] hover:shadow-[0_8px_0_#2563eb] active:translate-y-[4px] active:shadow-[0_0px_0_#2563eb] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Rocket className="w-6 h-6 animate-bounce text-white" /> Launching...
                  </>
                ) : (
                  <>
                    Enter World <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center font-bold text-slate-500 input-group bg-white p-4 rounded-xl border-2 border-slate-100">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-sky-500 hover:text-sky-400 transition-colors ml-1 underline decoration-2 underline-offset-2">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
