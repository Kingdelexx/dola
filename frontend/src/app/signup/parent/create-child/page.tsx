'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, AlertCircle, ArrowRight, User, KeyRound, CheckCircle2 } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

export default function CreateChildAccountPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('8');
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');
  const [childPin, setChildPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute learning band preview
  const ageNum = parseInt(childAge, 10) || 8;
  const learningBand =
    ageNum <= 8
      ? { name: 'Discoverer', desc: 'Ages 5–8 • Foundational logic & playful numeracy' }
      : ageNum <= 11
      ? { name: 'Explorer', desc: 'Ages 9–11 • Block coding & visual algorithms' }
      : ageNum <= 14
      ? { name: 'Builder', desc: 'Ages 12–14 • App design & web creativity' }
      : { name: 'Innovator', desc: 'Ages 15+ • Python programming & computer science' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!childName.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    if (!childPin || childPin.length !== 4 || !/^\d+$/.test(childPin)) {
      setError('Please choose a 4-digit PIN for your child (e.g. 1234).');
      return;
    }

    setIsLoading(true);

    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/link-child/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify({
          name: childName.trim(),
          age: ageNum,
          gender: childGender,
          pin: childPin.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successfully created child account -> redirect to Parent Dashboard!
        router.push('/parent-dashboard?child_created=true');
      } else {
        setError(data.error || 'Failed to create child profile. Please check the information.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Create child error:', err);
      setError('Network connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Child Account"
      subtitle="Step 2 of 2: Set up your child's first coding profile with a safe, memorable 4-digit PIN."
      badge="Child Account Setup"
      badgeColor="purple"
      backHref="/signup/parent"
      backLabel="Back"
      maxWidth="max-w-md"
      footerPrompt={{
        text: "Want to configure this later in Parent Dashboard?",
        linkText: "Skip for Now",
        linkHref: "/parent-dashboard"
      }}
    >
      <RocketLoader
        isLoading={isLoading}
        title="Setting Up Child Profile..."
        subTitle={`Preparing ${childName || 'child'}'s personalized coding seat...`}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Child's Name */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Child&apos;s First Name or Nickname
          </label>
          <div className="relative">
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Amara or Tobi"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400"
              autoFocus
              required
            />
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        </div>

        {/* Child's Age & Band */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Age
            </label>
            <select
              value={childAge}
              onChange={(e) => setChildAge(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:bg-white text-slate-900 font-bold text-sm outline-none transition-all"
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
              Avatar Gender
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChildGender('boy')}
                className={`flex-1 py-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1 ${
                  childGender === 'boy'
                    ? 'bg-sky-100 border-sky-400 text-sky-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>👦</span>
                <span>Boy</span>
              </button>
              <button
                type="button"
                onClick={() => setChildGender('girl')}
                className={`flex-1 py-3 rounded-2xl font-black text-xs border-2 transition-all flex items-center justify-center gap-1 ${
                  childGender === 'girl'
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

        {/* Dynamic Learning Band Badge */}
        <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-purple-600">
              Assigned Pathway
            </div>
            <div className="font-black text-purple-900 text-sm">{learningBand.name}</div>
            <div className="text-purple-700 font-medium text-[11px]">{learningBand.desc}</div>
          </div>
          <Sparkles className="text-purple-500 shrink-0" size={20} />
        </div>

        {/* Child 4-Digit PIN */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Child&apos;s 4-Digit Secret PIN
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={4}
              value={childPin}
              onChange={(e) => setChildPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 1 2 3 4"
              className="w-full text-center tracking-widest text-2xl font-black px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-purple-400 focus:bg-white text-slate-900 outline-none transition-all placeholder:text-slate-300 placeholder:text-base placeholder:tracking-normal"
              required
            />
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Your child will use this simple 4-digit PIN to sign in on their own!
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-sm uppercase tracking-wider shadow-[0_5px_0_#4338ca] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-5"
        >
          <span>Create Child Account &amp; Start Coding</span>
          <span>🚀</span>
        </button>
      </form>
    </AuthLayout>
  );
}
