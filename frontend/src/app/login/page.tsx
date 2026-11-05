"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { 
  Mail, Lock, ChevronRight, Gamepad2, Star, Rocket, Zap, ChevronDown,
  Users, KeyRound, ArrowLeft, Check, Sparkles, AlertCircle, RefreshCw, Delete
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import RocketLoader from '@/components/RocketLoader';
import GmailPasswordlessModal from '@/components/GmailPasswordlessModal';

export default function LoginPage() {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const titleRef = useRef(null);
  
  // Login Tab: Child PIN vs Direct Email/Password
  const [activeTab, setActiveTab] = useState<'child_pin' | 'direct'>('child_pin');

  // Direct login state
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [portalRole, setPortalRole] = useState<'auto' | 'teacher' | 'school_admin' | 'parent' | 'student'>('auto');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGmailModal, setShowGmailModal] = useState(false);

  // Child & Family PIN Login State
  const [familyStep, setFamilyStep] = useState<'email' | 'select' | 'pin' | 'parent_password'>('email');
  const [parentEmailInput, setParentEmailInput] = useState('');
  const [familyData, setFamilyData] = useState<any | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [parentPasswordInput, setParentPasswordInput] = useState('');
  const [familyError, setFamilyError] = useState('');
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);
  const [pinShake, setPinShake] = useState(false);

  // 4 PIN box refs for auto-advance
  const pinInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null)
  ];

  const { login } = useAuth();
  const router = useRouter();

  // Load remembered parent email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('dola_parent_email');
      if (savedEmail) {
        setParentEmailInput(savedEmail);
      }
    }
  }, []);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, { y: -30, opacity: 0, duration: 0.6, ease: "bounce.out" });
      gsap.from(".login-card", { scale: 0.96, opacity: 0, duration: 0.5, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Google SSO Initialization for Direct Tab
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

        const btnContainer = document.getElementById('googleLoginBtnDiv');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          googleObj.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
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
  }, [activeTab]);

  // Handle Direct Login Submit
  const handleDirectSubmit = async (e: React.FormEvent) => {
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
          if (portalRole !== 'auto') {
            if (portalRole === 'teacher') router.push('/teacher-dashboard');
            else if (portalRole === 'school_admin') router.push('/school-dashboard');
            else if (portalRole === 'parent') router.push('/parent-dashboard');
            else router.push('/dashboard');
          } else {
            if (role === 'super_admin') router.push('/super-admin');
            else if (role === 'teacher') router.push('/teacher-dashboard');
            else if (role === 'school_admin') router.push('/school-dashboard');
            else if (role === 'parent') router.push('/parent-dashboard');
            else router.push('/dashboard');
          }
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

  // --- Child & Family Login Handlers ---

  // Step 1: Discover Family Profiles by Parent Email
  const handleFamilyEmailLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = parentEmailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setFamilyError("Please enter your parent's email address.");
      return;
    }

    setFamilyError('');
    setIsFamilyLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/family-profiles/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (res.ok && data.found) {
        // Save parent email for next time
        if (typeof window !== 'undefined') {
          localStorage.setItem('dola_parent_email', cleanEmail);
        }

        setFamilyData(data);
        // If it's a student account with no linked children, or if no child profiles yet
        if (!data.is_family && data.role === 'student') {
          // Direct student without family profiles, switch to standard login
          setFamilyError("This is a standalone student account. Please use Direct Email Login.");
          setIsFamilyLoading(false);
          return;
        }

        setFamilyStep('select');
      } else {
        setFamilyError(data.message || data.error || "No family account found with this email. Please check spelling or ask your parent.");
      }
    } catch (err) {
      console.error(err);
      setFamilyError("Could not connect to DolaCode servers. Please check your internet connection.");
    } finally {
      setIsFamilyLoading(false);
    }
  };

  // Step 2: Select Profile
  const handleSelectProfile = (profile: any) => {
    setSelectedProfile(profile);
    setFamilyError('');

    if (profile.is_parent) {
      // Parent wants to log in -> prompt for parent password
      setFamilyStep('parent_password');
    } else {
      // Child wants to log in -> reset digits and prompt for 4-digit PIN
      setPinDigits(['', '', '', '']);
      setFamilyStep('pin');
      setTimeout(() => {
        pinInputRefs[0].current?.focus();
      }, 150);
    }
  };

  // Step 3: Handle 4-Digit PIN Input Digit change
  const handlePinDigitChange = (index: number, val: string) => {
    // Only accept numeric
    const clean = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = clean;
    setPinDigits(newDigits);

    if (clean && index < 3) {
      // Advance to next input
      pinInputRefs[index + 1].current?.focus();
    }

    // Auto-submit if all 4 digits are entered
    if (clean && index === 3) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 4) {
        handleChildPinSubmit(fullPin);
      }
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };

  // On-screen number pad for touch screens / young learners
  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      // Find last filled index
      const lastFilledIndex = pinDigits.map(d => Boolean(d)).lastIndexOf(true);
      if (lastFilledIndex >= 0) {
        const newDigits = [...pinDigits];
        newDigits[lastFilledIndex] = '';
        setPinDigits(newDigits);
        pinInputRefs[lastFilledIndex].current?.focus();
      }
      return;
    }

    if (val === 'clear') {
      setPinDigits(['', '', '', '']);
      pinInputRefs[0].current?.focus();
      return;
    }

    // Find first empty index
    const firstEmptyIndex = pinDigits.findIndex(d => !d);
    if (firstEmptyIndex !== -1) {
      const newDigits = [...pinDigits];
      newDigits[firstEmptyIndex] = val;
      setPinDigits(newDigits);

      if (firstEmptyIndex < 3) {
        pinInputRefs[firstEmptyIndex + 1].current?.focus();
      } else {
        // All 4 digits filled
        const fullPin = newDigits.join('');
        handleChildPinSubmit(fullPin);
      }
    }
  };

  // Step 3 Submit: Authenticate Child via Parent Email + Child ID + 4-Digit PIN
  const handleChildPinSubmit = async (pinValue?: string) => {
    const pin = pinValue || pinDigits.join('');
    if (!pin || pin.length !== 4) {
      setFamilyError("Please enter your full 4-digit PIN.");
      return;
    }

    setFamilyError('');
    setIsFamilyLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/child-pin-login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_email: parentEmailInput.trim().toLowerCase(),
          child_id: selectedProfile.id,
          pin: pin
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        router.push('/dashboard');
      } else {
        setPinShake(true);
        setTimeout(() => setPinShake(false), 600);
        setPinDigits(['', '', '', '']);
        pinInputRefs[0].current?.focus();
        setFamilyError(data.error || "Incorrect 4-digit PIN. Please try again or ask your parent to check the PIN.");
      }
    } catch (err) {
      console.error(err);
      setFamilyError("Failed to log in. Please check your internet connection.");
    } finally {
      setIsFamilyLoading(false);
    }
  };

  // Parent Password Submit (when parent clicked their card from family screen)
  const handleParentPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentPasswordInput) {
      setFamilyError("Please enter your parent password.");
      return;
    }

    setFamilyError('');
    setIsFamilyLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: parentEmailInput.trim().toLowerCase(),
          password: parentPasswordInput
        })
      });

      const data = await res.json();
      if (res.ok && data.token) {
        login(data.token, data.user);
        router.push('/parent-dashboard');
      } else {
        setFamilyError(data.non_field_errors?.[0] || data.error || "Incorrect password. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setFamilyError("Network error. Please try again.");
    } finally {
      setIsFamilyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-200 via-indigo-100 to-purple-200 text-slate-800 flex items-center justify-center p-4 sm:p-6 font-sans overflow-hidden relative" ref={containerRef}>
      
      {/* Fullscreen Rocket Launch Overlay Loader */}
      <RocketLoader 
        isLoading={isLoading || isFamilyLoading} 
        title="Preparing for Liftoff..." 
        subTitle="Logging into your coding mission control..." 
      />

      {/* Gmail Passwordless Modal */}
      <GmailPasswordlessModal 
        isOpen={showGmailModal} 
        onClose={() => setShowGmailModal(false)} 
      />

      {/* Playful Background Elements */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-sky-300 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-300 rounded-full blur-[80px] opacity-60 pointer-events-none" />
      <Star className="absolute top-24 right-[25%] text-yellow-400 w-10 h-10 opacity-60 rotate-45 pointer-events-none" />
      <Gamepad2 className="absolute bottom-24 right-[15%] text-indigo-400 w-16 h-16 opacity-30 -rotate-12 pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors z-20 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-white font-bold shadow-xs text-xs sm:text-sm">
        <ChevronRight className="rotate-180" size={18} /> Back to Home
      </Link>

      <div className="login-card max-w-5xl w-full bg-white border-4 border-white rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row-reverse relative z-10 my-8">
        
        {/* Right Side: Hero Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12 border-l-4 border-white image-container relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center max-w-sm">
            <img 
              src="/kids_login_hero.png" 
              alt="DolaCode Learning World" 
              className="w-full max-w-[280px] mx-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)] rounded-[2rem] border-4 border-white/40 -rotate-2 hover:rotate-0 transition-transform duration-500 mb-6" 
            />
            <div className="text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider backdrop-blur-sm mb-2">
                <Sparkles size={14} className="text-yellow-300" /> Kid-Friendly STEM
              </span>
              <h3 className="font-black text-2xl drop-shadow-md">Welcome Back, Cadets!</h3>
              <p className="font-medium text-pink-100 text-xs sm:text-sm mt-1">
                Your math missions, block coding worlds, and Python quests are ready.
              </p>
            </div>
          </div>
        </div>

        {/* Left Side: Interactive Auth Panels */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 bg-slate-50 relative flex flex-col justify-between">
          <div>
            {/* Header / Brand */}
            <div ref={titleRef} className="mb-6 text-center md:text-left">
              <Link href="/" className="inline-block mb-3">
                <img src="/logo.png" alt="DolaCode Logo" className="w-[75px] h-auto object-contain" />
              </Link>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Enter DolaCode
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                Choose your login method below:
              </p>
            </div>

            {/* Primary Toggle: Child PIN Login vs Direct Login */}
            <div className="flex p-1.5 bg-slate-200/80 rounded-2xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('child_pin');
                  setError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'child_pin'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users size={16} className="text-pink-500" />
                <span>Child &amp; Family PIN</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('direct');
                  setFamilyError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'direct'
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound size={16} className="text-indigo-500" />
                <span>Direct / Staff</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB 1: CHILD & FAMILY PIN LOGIN FLOW                     */}
            {/* ======================================================== */}
            {activeTab === 'child_pin' && (
              <div className="space-y-5">
                
                {familyError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{familyError}</span>
                  </div>
                )}

                {/* SUB-STEP 1: Enter Parent Email */}
                {familyStep === 'email' && (
                  <form onSubmit={handleFamilyEmailLookup} className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100">
                      <p className="text-xs text-sky-950 font-medium leading-relaxed">
                        👧 <strong>Children don&apos;t need their own email!</strong> Simply enter your parent&apos;s registered email to see all family accounts and log in with your 4-digit PIN.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                        Parent or Family Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="e.g. parent@gmail.com"
                          value={parentEmailInput}
                          onChange={(e) => setParentEmailInput(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isFamilyLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 shadow-md shadow-indigo-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>Find My Profile</span>
                      <ChevronRight size={18} />
                    </button>
                  </form>
                )}

                {/* SUB-STEP 2: Select Profile ("Who is learning today?") */}
                {familyStep === 'select' && familyData && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-black text-slate-900">Who is learning today?</h2>
                        <p className="text-xs text-slate-500 font-medium">Family: {familyData.parent_name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFamilyStep('email');
                          setFamilyError('');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                      >
                        <ArrowLeft size={14} /> Change Email
                      </button>
                    </div>

                    {/* Profile Avatar Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto p-1">
                      {familyData.profiles.map((p: any) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProfile(p)}
                          className={`p-4 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-98 ${
                            p.is_parent
                              ? 'bg-slate-50 border-slate-200 hover:border-slate-400'
                              : 'bg-white border-pink-200 hover:border-pink-400 shadow-md shadow-pink-500/5'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-sm shrink-0 ${
                            p.is_parent 
                              ? 'bg-gradient-to-tr from-slate-600 to-slate-800' 
                              : p.gender === 'girl'
                                ? 'bg-gradient-to-tr from-pink-500 to-rose-500'
                                : 'bg-gradient-to-tr from-indigo-500 to-cyan-500'
                          }`}>
                            {p.is_parent ? '👨‍👩‍👧' : p.avatar_letter}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-sm text-slate-900 truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {p.is_parent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700">Parent</span>
                              )}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {p.is_parent ? 'Manage Billing & Kids' : p.age ? `Age ${p.age} • ⭐ ${p.points} stars` : `⭐ ${p.points} stars`}
                            </p>
                            <span className="text-[11px] font-bold text-indigo-600 mt-1 flex items-center gap-1">
                              {p.is_parent ? 'Password Login →' : '🔑 Enter 4-Digit PIN →'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {familyData.children_count === 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-2 text-center">
                        <p>No child profiles have been added to this family account yet.</p>
                        <p className="font-bold">Log in as Parent to add your children!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-STEP 3: 4-Digit Child PIN Screen */}
                {familyStep === 'pin' && selectedProfile && (
                  <div className={`space-y-5 animate-in fade-in duration-200 ${pinShake ? 'animate-bounce' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-sm">
                          {selectedProfile.avatar_letter || '👧'}
                        </div>
                        <div>
                          <h2 className="text-base font-black text-slate-900">
                            Hi, {selectedProfile.name}! 👋
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">Enter your 4-digit secret PIN:</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFamilyStep('select');
                          setFamilyError('');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                      >
                        Not you?
                      </button>
                    </div>

                    {/* 4 Large Digit Input Boxes */}
                    <div className="flex justify-center items-center gap-3 py-2">
                      {pinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={pinInputRefs[idx]}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          pattern="[0-9]"
                          value={digit}
                          onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handlePinKeyDown(idx, e)}
                          className={`w-14 h-16 rounded-2xl border-3 text-2xl font-black text-center font-mono shadow-sm transition-all focus:outline-none ${
                            digit
                              ? 'border-pink-500 bg-pink-50 text-pink-700 scale-105'
                              : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500 focus:bg-indigo-50/50'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Kid-friendly On-Screen Keypad */}
                    <div className="max-w-xs mx-auto grid grid-cols-3 gap-2 pt-1">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeypadPress(num)}
                          className="py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-black text-lg text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('clear')}
                        className="py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 font-bold text-xs text-slate-600 active:scale-95 transition-all cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('0')}
                        className="py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-black text-lg text-slate-800 shadow-xs active:scale-95 transition-all cursor-pointer"
                      >
                        0
                      </button>
                      <button
                        type="button"
                        onClick={() => handleKeypadPress('backspace')}
                        className="py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-rose-100 hover:text-rose-600 font-bold text-sm text-slate-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        title="Delete digit"
                      >
                        <Delete size={18} />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={isFamilyLoading || pinDigits.some(d => !d)}
                      onClick={() => handleChildPinSubmit()}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md shadow-pink-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                    >
                      <Rocket size={18} />
                      <span>{isFamilyLoading ? 'Opening World...' : 'Launch Learner Dashboard 🚀'}</span>
                    </button>
                  </div>
                )}

                {/* SUB-STEP 4: Parent Password Screen */}
                {familyStep === 'parent_password' && selectedProfile && (
                  <form onSubmit={handleParentPasswordSubmit} className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg text-white">
                          👨‍👩‍👧
                        </div>
                        <div>
                          <h2 className="text-base font-black text-slate-900">
                            Parent Portal Login
                          </h2>
                          <p className="text-xs text-slate-500 font-medium">{parentEmailInput}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFamilyStep('select')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                      >
                        Back
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mb-1.5">
                        Parent Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          autoFocus
                          placeholder="••••••••"
                          value={parentPasswordInput}
                          onChange={(e) => setParentPasswordInput(e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm font-semibold placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all shadow-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isFamilyLoading}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <span>Open Parent Dashboard</span>
                      <ChevronRight size={18} />
                    </button>
                  </form>
                )}

              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: DIRECT / STAFF EMAIL & PASSWORD LOGIN             */}
            {/* ======================================================== */}
            {activeTab === 'direct' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Google Sign In Button */}
                <div className="flex flex-col gap-2.5">
                  <div id="googleLoginBtnDiv" className="w-full flex justify-center min-h-[44px]"></div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setShowGmailModal(true)}
                    className="w-full py-2 px-3 bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 border border-sky-200 text-sky-700 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs shadow-xs"
                  >
                    <Zap size={14} className="text-amber-500 fill-amber-400" /> Manual Gmail Login (No Password)
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] uppercase font-black text-slate-400 tracking-wider">or email password</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <form ref={formRef} className="space-y-4" onSubmit={handleDirectSubmit}>
                  {error && (
                    <div className="text-red-600 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-200 shadow-xs">
                      {error}
                    </div>
                  )}

                  {/* Target Portal Selection Dropdown */}
                  <div className="input-group relative">
                    <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide flex items-center justify-between">
                      <span>Portal Role</span>
                      <span className="text-indigo-600 font-bold normal-case text-xs">
                        {portalRole === 'auto' && '✨ Auto-Detect Role'}
                        {portalRole === 'teacher' && '👩‍🏫 Teacher Portal'}
                        {portalRole === 'school_admin' && '🏫 School Portal'}
                        {portalRole === 'parent' && '👨‍👩‍👧 Parent Portal'}
                        {portalRole === 'student' && '👧‍💻 Student Portal'}
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={portalRole}
                        onChange={(e) => setPortalRole(e.target.value as any)}
                        disabled={isLoading}
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 pr-10 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs appearance-none cursor-pointer"
                      >
                        <option value="auto">✨ Auto-Detect Role from Account</option>
                        <option value="teacher">👩‍🏫 Teacher Portal</option>
                        <option value="school_admin">🏫 School Administrator Portal</option>
                        <option value="parent">👨‍👩‍👧 Parent Dashboard</option>
                        <option value="student">👧‍💻 Student Learning Dashboard</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="input-group relative">
                    <label className="block text-xs font-black text-slate-600 mb-1 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusedInput === 'email' ? 'text-indigo-500' : 'text-slate-400'}`}>
                        <Mail size={18} />
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
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="input-group relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-black text-slate-600 uppercase tracking-wide">Password</label>
                      <Link href="#" className="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                        Forgot Secret?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${focusedInput === 'password' ? 'text-indigo-500' : 'text-slate-400'}`}>
                        <Lock size={18} />
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
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="input-group pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full py-3 px-4 font-black text-sm rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Rocket className="w-5 h-5 animate-bounce text-white" /> Launching...
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ChevronRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer Signup Link */}
          <div className="mt-6 text-center font-bold text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-100">
            Don&apos;t have an account yet?{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 transition-colors ml-1 underline decoration-2 underline-offset-2">
              Create parent account now
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}