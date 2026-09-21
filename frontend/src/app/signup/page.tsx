"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Rocket, Mail, User, Lock, ChevronRight, Sparkles, Zap, Building2, UserPlus, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RocketLoader from '@/components/RocketLoader';
import GmailPasswordlessModal from '@/components/GmailPasswordlessModal';

export default function SignUpPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Guided Onboarding Steps:
  // Step 1: mainType ('none' | 'child' | 'school')
  // Step 2 (if school): schoolOption ('none' | 'setup' | 'join')
  const [mainType, setMainType] = useState<'none' | 'child' | 'school'>('none');
  const [schoolOption, setSchoolOption] = useState<'none' | 'setup' | 'join'>('none');
  
  // Form role derived from selection:
  // 'parent' (child flow) | 'school_admin' (setup school) | 'teacher' (join school)
  const role = mainType === 'child' ? 'parent' : (schoolOption === 'setup' ? 'school_admin' : 'teacher');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
          expected_classes: formData.expected_classes
        })
      });
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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
      gsap.from(titleRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "bounce.out" });
      gsap.from(".input-group", { 
        x: -20, opacity: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.5)", delay: 0.1 
      });
    }, containerRef);
    return () => ctx.revert();
  }, [mainType, schoolOption]);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '106344535315-jsm41ud840rm19plmbh4em94j9g3bb9o.apps.googleusercontent.com';

    const initGoogleBtn = () => {
      if (typeof window !== 'undefined' && (window as unknown as { google?: { accounts?: { id?: { initialize: (config: object) => void; renderButton: (el: HTMLElement, config: object) => void } } } }).google?.accounts?.id) {
        const googleObj = (window as unknown as { google: { accounts: { id: { initialize: (config: object) => void; renderButton: (el: HTMLElement, config: object) => void } } } }).google;
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
  }, [role, formData, mainType, schoolOption]);

  const resetSelection = () => {
    setMainType('none');
    setSchoolOption('none');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-100 to-indigo-200 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative" ref={containerRef}>
      {/* Launching Rocket Loader */}
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

      {/* Background Ornaments */}
      <div className="absolute top-10 left-10 w-40 h-40 bg-pink-300 rounded-full blur-[80px] opacity-60" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-[80px] opacity-60" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-purple-600 transition-colors z-20 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white font-bold text-xs shadow-sm">
        <ChevronRight className="rotate-180" size={16} /> Back to Home
      </Link>

      <div className="max-w-4xl w-full bg-white border-4 border-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative z-10 my-6">
        
        {/* Left Side Hero Banner */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 p-8 border-r-4 border-white image-container relative overflow-hidden flex-col justify-between text-white">
          <div className="w-full">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black mb-4 border border-white/30">
              <Sparkles size={14} className="text-yellow-300" /> Get Started
            </div>
            <h2 className="text-3xl font-black leading-tight drop-shadow-md">Coding Education Built for Africa</h2>
          </div>

          <div className="my-auto text-center">
            <img 
              src="/kids_signup_hero.png" 
              alt="DolaCode Coding" 
              className="w-full max-w-[240px] mx-auto drop-shadow-2xl rounded-2xl border-4 border-white/40 rotate-1 hover:rotate-0 transition-transform duration-500" 
            />
          </div>

          <div className="w-full text-center text-white/90 text-xs font-medium bg-black/20 backdrop-blur-sm py-3 px-4 rounded-xl border border-white/10">
            Student → Class → Teacher → School
          </div>
        </div>

        {/* Right Side Onboarding Flow */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 bg-slate-50 relative overflow-y-auto max-h-[90vh]">
          
          {/* Header */}
          <div ref={titleRef} className="mb-6">
            <Link href="/" className="inline-block mb-2">
              <img src="/logo.png" alt="DolaCode" className="w-[70px] h-auto object-contain" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {mainType === 'none' && 'How will you be using DolaCode?'}
              {mainType === 'child' && 'Parent Registration'}
              {mainType === 'school' && schoolOption === 'none' && 'School Onboarding'}
              {mainType === 'school' && schoolOption === 'setup' && 'Register New School'}
              {mainType === 'school' && schoolOption === 'join' && 'Teacher Registration'}
            </h1>
            <p className="text-slate-500 font-medium text-xs mt-1">
              {mainType === 'none' && 'Select your environment to get started.'}
              {mainType === 'child' && 'Set up your parent account to link and monitor your child.'}
              {mainType === 'school' && schoolOption === 'none' && 'Are you setting up a new school or joining an existing one?'}
              {mainType === 'school' && schoolOption === 'setup' && 'Register your school once. Your code will link teachers & classes.'}
              {mainType === 'school' && schoolOption === 'join' && 'Join your school using your School Code.'}
            </p>

            {(mainType !== 'none') && (
              <button 
                type="button" 
                onClick={resetSelection} 
                className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-600 hover:text-purple-700 mt-2 cursor-pointer"
              >
                <ArrowLeft size={14} /> Start Over / Switch Role
              </button>
            )}
          </div>

          {/* Banner for Students */}
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👧‍💻</span>
              <div>
                <div className="text-xs font-black text-amber-900">Are you a Student?</div>
                <div className="text-[11px] font-bold text-amber-700">Join your class directly using your Class Code!</div>
              </div>
            </div>
            <Link 
              href="/join-class" 
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              Join Class 🚀
            </Link>
          </div>

          {/* STEP 1: Main Selection (For Child vs For School) */}
          {mainType === 'none' && (
            <div className="space-y-4 input-group">
              <button
                type="button"
                onClick={() => setMainType('child')}
                className="w-full p-5 bg-white border-3 border-purple-200 hover:border-purple-500 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group cursor-pointer flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Home size={26} />
                </div>
                <div className="flex-grow">
                  <div className="text-base font-black text-slate-800 flex items-center justify-between">
                    <span>🏠 For my child</span>
                    <ChevronRight size={18} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Individual / Home learner. Parents register to track & empower their child's coding journey.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMainType('school')}
                className="w-full p-5 bg-white border-3 border-indigo-200 hover:border-indigo-500 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group cursor-pointer flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={26} />
                </div>
                <div className="flex-grow">
                  <div className="text-base font-black text-slate-800 flex items-center justify-between">
                    <span>🏫 For my school</span>
                    <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    School Administrators, Principals, and Teachers creating or joining a school account.
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2 (FOR SCHOOL): Setup vs Join School */}
          {mainType === 'school' && schoolOption === 'none' && (
            <div className="space-y-4 input-group">
              <button
                type="button"
                onClick={() => setSchoolOption('setup')}
                className="w-full p-5 bg-white border-3 border-indigo-200 hover:border-indigo-500 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group cursor-pointer flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Building2 size={26} />
                </div>
                <div className="flex-grow">
                  <div className="text-base font-black text-slate-800 flex items-center justify-between">
                    <span>Setting up a new school</span>
                    <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    For School Administrators & Principals. Generates your unique School Code (e.g., GFA-4827).
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSchoolOption('join')}
                className="w-full p-5 bg-white border-3 border-pink-200 hover:border-pink-500 rounded-2xl text-left transition-all shadow-sm hover:shadow-md group cursor-pointer flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <UserPlus size={26} />
                </div>
                <div className="flex-grow">
                  <div className="text-base font-black text-slate-800 flex items-center justify-between">
                    <span>Joining an existing school</span>
                    <ChevronRight size={18} className="text-pink-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    For Teachers. Enter your School Code or ask your admin for your school's invite link.
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* REGISTRATION FORM (When role is determined) */}
          {(mainType === 'child' || (mainType === 'school' && schoolOption !== 'none')) && (
            <>
              {/* Google Sign Up */}
              <div className="mb-4 flex flex-col gap-2">
                <div id="googleSignUpBtnDiv" className="w-full flex justify-center min-h-[44px]"></div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowGmailModal(true)}
                  className="w-full py-2 px-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 text-purple-700 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Zap size={14} className="text-amber-500 fill-amber-400" /> Manual Gmail Login (No Password)
                </button>
              </div>

              <div className="relative flex py-1 items-center mb-4">
                <div className="flex-grow border-t-2 border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-black text-slate-400">or fill credentials</span>
                <div className="flex-grow border-t-2 border-slate-200"></div>
              </div>

              <form ref={formRef} className="space-y-3.5" onSubmit={handleSubmit}>
                {error && <div className="text-red-600 text-xs font-bold bg-red-100 p-3 rounded-xl border-2 border-red-200 shadow-sm">{error}</div>}
                
                {/* Full Name */}
                <div className="input-group relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${focusedInput === 'name' ? 'text-pink-500' : 'text-slate-400'}`}>
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    placeholder={
                      role === 'school_admin' ? "Administrator Full Name (e.g. Mrs Adeyemi)" :
                      role === 'teacher' ? "Teacher Full Name (e.g. Mrs Johnson)" :
                      "Parent Full Name"
                    } 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={isLoading}
                    onFocus={() => setFocusedInput('name')}
                    onBlur={() => setFocusedInput(null)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
                  />
                </div>

                {/* Email */}
                <div className="input-group relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${focusedInput === 'email' ? 'text-purple-500' : 'text-slate-400'}`}>
                    <Mail size={18} />
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
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all shadow-sm"
                  />
                </div>

                {/* SCHOOL ADMIN SPECIFIC FIELDS */}
                {role === 'school_admin' && (
                  <div className="space-y-3 input-group bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-100">
                    <div className="text-xs font-black text-indigo-900 mb-1">School Profile Details</div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="School Name (e.g. Greenfield Academy) *" 
                        value={formData.school_name}
                        onChange={(e) => setFormData({...formData, school_name: e.target.value})}
                        required
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div>
                      <input 
                        type="text" 
                        placeholder="School Address *" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Contact Person *" 
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        required
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                      <input 
                        type="text" 
                        placeholder="Phone Number *" 
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        required
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="email" 
                        placeholder="Principal Email *" 
                        value={formData.principal_email}
                        onChange={(e) => setFormData({...formData, principal_email: e.target.value})}
                        required
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                      <input 
                        type="number" 
                        placeholder="Est. Pupils (e.g. 350)" 
                        value={formData.number_of_pupils}
                        onChange={(e) => setFormData({...formData, number_of_pupils: e.target.value})}
                        disabled={isLoading}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>
                )}

                {/* TEACHER SPECIFIC FIELDS (School Code) */}
                {role === 'teacher' && (
                  <div className="input-group">
                    <label className="block text-xs font-black text-slate-700 mb-1">Enter School Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GFA-4827" 
                      value={formData.school_code}
                      onChange={(e) => setFormData({...formData, school_code: e.target.value.toUpperCase()})}
                      required
                      disabled={isLoading}
                      className="w-full bg-white border-2 border-purple-300 rounded-xl py-2.5 px-3 text-sm font-extrabold uppercase text-purple-700 tracking-wider placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-sm"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Ask your School Administrator for your 6-character School Code or Invitation Link.</p>
                  </div>
                )}

                {/* Password */}
                <div className="input-group relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${focusedInput === 'password' ? 'text-pink-500' : 'text-slate-400'}`}>
                    <Lock size={18} />
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
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 font-medium placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all shadow-sm"
                  />
                </div>

                {/* Submit */}
                <div className="input-group pt-2">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="group w-full flex justify-center items-center gap-2 py-3 px-4 font-black text-base rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 shadow-[0_4px_0_#c026d3] hover:translate-y-[-2px] active:translate-y-[2px] transition-all cursor-pointer disabled:opacity-75"
                  >
                    {isLoading ? (
                      <>
                        <Rocket className="w-5 h-5 animate-bounce text-white" /> Launching...
                      </>
                    ) : (
                      <>
                        Complete Registration <Rocket size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-6 text-center text-xs font-bold text-slate-500 bg-white p-3 rounded-xl border-2 border-slate-100">
            Already registered?{' '}
            <Link href="/login" className="text-pink-500 hover:text-pink-400 transition-colors ml-1 underline decoration-2 underline-offset-2">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
