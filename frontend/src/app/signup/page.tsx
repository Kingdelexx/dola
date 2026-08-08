"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Rocket, Mail, User, Lock, ChevronRight, Calendar, Code, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RocketLoader from '@/components/RocketLoader';
import GmailPasswordlessModal from '@/components/GmailPasswordlessModal';

export default function SignUpPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'parent' | 'school_admin'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    coding_experience: '',
    password: '',
    school_name: '',
    school_code: '',
    address: '',
    contact_person: '',
    principal_email: '',
    number_of_pupils: '',
    phone_number: '',
    expected_classes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          role: role,
          school_name: formData.school_name,
          school_code: formData.school_code,
          address: formData.address,
          contact_person: formData.contact_person,
          principal_email: formData.principal_email,
          number_of_pupils: formData.number_of_pupils,
          phone_number: formData.phone_number,
          expected_classes: formData.expected_classes,
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
          const userRole = data.user?.profile?.role || role;
          if (userRole === 'super_admin') router.push('/super-admin');
          else if (userRole === 'school_admin' || userRole === 'teacher') router.push('/school-dashboard');
          else if (userRole === 'parent') router.push('/parent-dashboard');
          else router.push('/dashboard');
        } else {
          setError(Object.values(data).flat().join(', ') || 'Registration failed');
          setIsLoading(false);
        }
      } else {
        setError('Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
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

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '106344535315-jsm41ud840rm19plmbh4em94j9g3bb9o.apps.googleusercontent.com';

    const initGoogleBtn = () => {
      if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id?: { initialize: (config: object) => void; renderButton: (el: HTMLElement, config: object) => void; prompt: (notification?: any) => void } } } }).google?.accounts?.id) {
        const googleObj = (window as unknown as { google: { accounts: { id: { initialize: (config: object) => void; renderButton: (el: HTMLElement, config: object) => void; prompt: (notification?: any) => void } } } }).google;
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
                  body: JSON.stringify({ 
                    credential: response.credential,
                    role: role,
                    school_name: formData.school_name,
                    school_code: formData.school_code
                  })
                });
                const data = await res.json();
                if (res.ok) {
                  login(data.token, data.user);
                  const userRole = data.user?.profile?.role || role;
                  if (userRole === 'super_admin') router.push('/super-admin');
                  else if (userRole === 'teacher') router.push('/teacher-dashboard');
                  else if (userRole === 'school_admin') router.push('/school-dashboard');
                  else if (userRole === 'parent') router.push('/parent-dashboard');
                  else router.push('/dashboard');
                } else {
                  setError(data.error || 'Google Registration failed.');
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

        const btnContainer = document.getElementById('googleSignUpBtnDiv');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          googleObj.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            shape: 'pill',
            width: '100%'
          });
        }
      }
    };

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGoogleBtn();
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [role, formData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-indigo-200 text-slate-800 flex items-center justify-center p-6 font-sans overflow-hidden relative" ref={containerRef}>
      {/* Fullscreen Launching Rocket Loader */}
      <RocketLoader 
        isLoading={isLoading} 
        title="Launching Account..." 
        subTitle="Preparing your new coding mission control..." 
      />

      {/* Gmail Passwordless Modal */}
      <GmailPasswordlessModal 
        isOpen={showGmailModal} 
        onClose={() => setShowGmailModal(false)} 
      />

      {/* Playful Background Elements */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-pink-300 rounded-full blur-[80px] opacity-60" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-[80px] opacity-60" />
      <Sparkles className="absolute top-20 left-[20%] text-amber-400 w-8 h-8 opacity-60 animate-bounce" />
      <Code className="absolute bottom-20 left-[10%] text-purple-400 w-12 h-12 opacity-30 rotate-12" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors z-20 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold shadow-sm">
        <ChevronRight className="rotate-180" size={20} /> Back to Home
      </Link>

      <div className="max-w-5xl w-full bg-white border-4 border-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 my-8">
        
        {/* Left Side: Hero Graphic */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-purple-500 via-indigo-500 to-pink-500 items-center justify-center p-8 border-r-4 border-white image-container relative overflow-hidden flex-col justify-between">
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
          
          <div className="w-full text-left text-white z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black mb-3 border border-white/30">
              <Sparkles size={14} className="text-yellow-300" /> Start Free
            </div>
            <h2 className="text-3xl font-black leading-tight drop-shadow-md">Join Thousands of Young Coders</h2>
          </div>

          <img 
            src="/kids_signup_hero.png" 
            alt="Start Coding" 
            className="w-full max-w-[280px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10 rounded-[2rem] border-4 border-white/50 rotate-2 hover:rotate-0 transition-transform duration-500 my-auto" 
          />

          <div className="w-full text-center text-white/90 z-10 text-xs font-medium bg-black/10 backdrop-blur-sm py-3 px-4 rounded-2xl border border-white/10">
            "Coding is the superpower of the 21st century."
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 md:p-12 bg-slate-50 relative overflow-y-auto max-h-[90vh]">
          <div ref={titleRef} className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-black mb-2 text-slate-800 tracking-tight">Create Account</h1>
            <p className="text-slate-500 font-medium text-sm">Choose how you want to join DolaCode.</p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setRole('student')}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                role === 'student'
                  ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md scale-105'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
              }`}
            >
              <span className="text-2xl">👧‍💻</span>
              <span>Student</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setRole('parent')}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                role === 'parent'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md scale-105'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
              }`}
            >
              <span className="text-2xl">👨‍👩‍👧</span>
              <span>Parent</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => setRole('school_admin')}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                role === 'school_admin'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md scale-105'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200'
              }`}
            >
              <span className="text-2xl">🏫</span>
              <span>School / Teacher</span>
            </button>
          </div>

          {/* Google Sign Up Buttons */}
          <div className="mb-5 flex flex-col gap-2.5">
            <div id="googleSignUpBtnDiv" className="w-full flex justify-center min-h-[44px]"></div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setShowGmailModal(true)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border-2 border-purple-200 text-purple-700 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shadow-xs"
            >
              <Zap size={14} className="text-amber-500 fill-amber-400" /> Manual Gmail Login (No Password Needed)
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center mb-5">
            <div className="flex-grow border-t-2 border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-black text-slate-400 tracking-wider">or fill email & password</span>
            <div className="flex-grow border-t-2 border-slate-200"></div>
          </div>

          <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-sm font-bold bg-red-100 p-3 rounded-xl border-2 border-red-200 shadow-sm">{error}</div>}
            
            {/* Name */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'name' ? 'text-pink-500' : 'text-slate-400'}`}>
                <User size={20} />
              </div>
              <input 
                type="text" 
                placeholder={role === 'school_admin' ? "Full Name (Admin / Teacher)" : "Name"} 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                disabled={isLoading}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
              />
            </div>

            {/* Email */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'email' ? 'text-purple-500' : 'text-slate-400'}`}>
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                placeholder="Email Address" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                disabled={isLoading}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-sm"
              />
            </div>

            {/* Role Specific Fields */}
            {role === 'student' && (
              <div className="grid grid-cols-2 gap-3 input-group">
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${focusedInput === 'age' ? 'text-orange-500' : 'text-slate-400'}`}>
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="number" 
                    placeholder="Age" 
                    min="5" max="99"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    disabled={isLoading}
                    onFocus={() => setFocusedInput('age')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all shadow-sm"
                  />
                </div>

                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${focusedInput === 'exp' ? 'text-sky-500' : 'text-slate-400'}`}>
                    <Code size={18} />
                  </div>
                  <select 
                    disabled={isLoading}
                    onFocus={() => setFocusedInput('exp')}
                    onBlur={() => setFocusedInput(null)}
                    value={formData.coding_experience}
                    onChange={(e) => setFormData({...formData, coding_experience: e.target.value})}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-10 pr-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="" disabled hidden>Experience</option>
                    <option value="beginner">Beginner</option>
                    <option value="some">Played around</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
            )}

            {role === 'school_admin' && (
              <div className="space-y-3 input-group">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">School Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Royal International School" 
                    value={formData.school_name}
                    onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                    required
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">School Address *</label>
                  <input 
                    type="text" 
                    placeholder="Street, City, State" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Contact Person *</label>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={formData.contact_person}
                      onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                      required
                      disabled={isLoading}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Phone Number *</label>
                    <input 
                      type="text" 
                      placeholder="+234..." 
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      required
                      disabled={isLoading}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Principal Email *</label>
                    <input 
                      type="email" 
                      placeholder="principal@school.com" 
                      value={formData.principal_email}
                      onChange={(e) => setFormData({...formData, principal_email: e.target.value})}
                      required
                      disabled={isLoading}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Number of Pupils</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={formData.number_of_pupils}
                      onChange={(e) => setFormData({...formData, number_of_pupils: e.target.value})}
                      disabled={isLoading}
                      className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Classes (e.g. Basic 1 - Basic 6, JSS 1 - 3)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Primary 1 to 6, JSS 1 to 3" 
                    value={formData.expected_classes}
                    onChange={(e) => setFormData({...formData, expected_classes: e.target.value})}
                    disabled={isLoading}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* School Code option for Students */}
            {role === 'student' && (
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="School Code (Optional, e.g. SCH-DOL-101)" 
                  value={formData.school_code}
                  onChange={(e) => setFormData({...formData, school_code: e.target.value})}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
                />
              </div>
            )}

            {/* Password */}
            <div className="input-group relative">
              <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${focusedInput === 'password' ? 'text-pink-500' : 'text-slate-400'}`}>
                <Lock size={20} />
              </div>
              <input 
                type="password" 
                placeholder="Create Password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                disabled={isLoading}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
              />
            </div>

            <div className="input-group pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="group w-full flex justify-center items-center gap-2 py-3.5 px-4 font-black text-lg rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 shadow-[0_4px_0_#c026d3] hover:translate-y-[-2px] hover:shadow-[0_6px_0_#c026d3] active:translate-y-[2px] active:shadow-[0_0px_0_#c026d3] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Rocket className="w-5 h-5 animate-bounce text-white" /> Launching...
                  </>
                ) : (
                  <>
                    Create Account <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm font-bold text-slate-500 input-group bg-white p-3 rounded-xl border-2 border-slate-100">
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
