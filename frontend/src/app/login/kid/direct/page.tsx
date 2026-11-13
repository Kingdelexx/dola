'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, AlertCircle, Sparkles, Delete, KeyRound, Palette } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

const PICTURE_COLORS = [
  { id: 'red', name: 'Red', color: 'bg-rose-500 hover:bg-rose-600 border-rose-600', emoji: '🔴' },
  { id: 'blue', name: 'Blue', color: 'bg-sky-500 hover:bg-sky-600 border-sky-600', emoji: '🔵' },
  { id: 'green', name: 'Green', color: 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600', emoji: '🟢' },
  { id: 'orange', name: 'Orange', color: 'bg-orange-500 hover:bg-orange-600 border-orange-600', emoji: '🟠' },
  { id: 'yellow', name: 'Yellow', color: 'bg-amber-400 hover:bg-amber-500 border-amber-500', emoji: '🟡' },
  { id: 'purple', name: 'Purple', color: 'bg-purple-500 hover:bg-purple-600 border-purple-600', emoji: '🟣' },
  { id: 'navy', name: 'Navy', color: 'bg-indigo-600 hover:bg-indigo-700 border-indigo-700', emoji: '🔷' },
];

export default function KidDirectSignInPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [passwordMode, setPasswordMode] = useState<'picture' | 'text'>('picture');
  const [pictureSequence, setPictureSequence] = useState<string[]>([]);
  const [textPassword, setTextPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleColorClick = (colorName: string) => {
    if (pictureSequence.length < 6) {
      setPictureSequence([...pictureSequence, colorName]);
      setError('');
    }
  };

  const handleBackspace = () => {
    setPictureSequence(pictureSequence.slice(0, -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const targetUser = username.trim() || userId.trim();
    if (!targetUser) {
      setError('Please enter your Username or User ID.');
      return;
    }

    // Determine password string
    let effectivePassword = '';
    if (passwordMode === 'picture') {
      if (pictureSequence.length === 0) {
        setError('Please tap your Picture Password colors.');
        return;
      }
      effectivePassword = pictureSequence.join('-');
    } else {
      if (!textPassword) {
        setError('Please enter your secret password or PIN.');
        return;
      }
      effectivePassword = textPassword;
    }

    setIsLoading(true);

    try {
      // 1. First attempt login with username + password
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetUser,
          password: effectivePassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.token && data.user) {
        login(data.token, data.user);
        router.push('/dashboard');
        return;
      }

      // 2. If parent email was given in User ID and student entered PIN
      if (userId.includes('@') && effectivePassword.length === 4 && /^\d+$/.test(effectivePassword)) {
        const pinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/child-pin-login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parent_email: userId.trim(),
            pin: effectivePassword,
            child_name: username.trim(),
          }),
        });

        const pinData = await pinRes.json();
        if (pinRes.ok && pinData.token && pinData.user) {
          login(pinData.token, pinData.user);
          router.push('/dashboard');
          return;
        }
      }

      setError(data.error || 'Oops! We could not find a match for that Username and Password. Try again!');
    } catch (err) {
      console.error('Kid sign in error:', err);
      setError('Could not connect. Please check your internet connection!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Kid Sign In"
      subtitle="Enter your details and secret password to jump into your world!"
      badge="Young Coder"
      badgeColor="emerald"
      backHref="/login/kid"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Signing in with a classroom code?",
        linkText: "Use Class Code",
        linkHref: "/login/kid/code"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Launching Your Coding Quest!"
        subTitle="Unlocking your games, badges, and avatars..."
      />

      {/* Cheerful Mascot Header (Matching Diagram 1 Kid Phone Screen) */}
      <div className="bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 rounded-3xl p-4 text-center text-white mb-6 shadow-md relative overflow-hidden">
        <div className="text-5xl mb-1">👧🎒</div>
        <div className="text-sm font-black tracking-tight drop-shadow-xs">
          Welcome back, Super Coder!
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* User ID Field */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            User ID <span className="text-slate-400 font-normal">(or Parent Email)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. kid123 or parent@gmail.com"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. tobi_coder"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
              autoFocus
            />
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Password Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              {passwordMode === 'picture' ? 'Picture Password' : 'Type Password / PIN'}
            </label>
            <button
              type="button"
              onClick={() => {
                setPasswordMode(passwordMode === 'picture' ? 'text' : 'picture');
                setError('');
              }}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
            >
              {passwordMode === 'picture' ? (
                <>
                  <KeyRound size={12} />
                  <span>Type Password Instead</span>
                </>
              ) : (
                <>
                  <Palette size={12} />
                  <span>Use Picture Password</span>
                </>
              )}
            </button>
          </div>

          {passwordMode === 'picture' ? (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3.5">
              {/* Sequence Display */}
              <div className="h-10 bg-white border border-slate-200 rounded-xl mb-3 flex items-center justify-center gap-2 px-3">
                {pictureSequence.length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium italic">
                    Tap colors below in your secret order
                  </span>
                ) : (
                  pictureSequence.map((col, idx) => (
                    <span key={idx} className="text-lg animate-bounce">
                      {PICTURE_COLORS.find((c) => c.name === col)?.emoji || '⭐'}
                    </span>
                  ))
                )}
              </div>

              {/* Picture Password Color Buttons (Matching Diagram 1 Keypad) */}
              <div className="grid grid-cols-4 gap-2">
                {PICTURE_COLORS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleColorClick(item.name)}
                    className={`h-12 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-md active:scale-95 transition-all border-b-4 ${item.color}`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                  </button>
                ))}

                {/* Backspace Button */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={pictureSequence.length === 0}
                  className="h-12 rounded-xl bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 font-black flex items-center justify-center shadow-md active:scale-95 transition-all border-b-4 border-slate-400"
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <input
                type="password"
                value={textPassword}
                onChange={(e) => setTextPassword(e.target.value)}
                placeholder="Enter your secret password or PIN"
                className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          )}
        </div>

        {/* Big Green "Go" Button (Matching Diagram 1) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg uppercase tracking-wider shadow-[0_5px_0_#047857] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-5"
        >
          <span>Go</span>
          <span>🚀</span>
        </button>
      </form>
    </AuthLayout>
  );
}
