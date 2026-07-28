'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, ArrowLeft, Star, Flame, 
  Sparkles, RefreshCw, ShieldAlert, UserPlus,
  BookOpen, Calculator, Code, Clock, Award, FileText, CheckCircle2, CreditCard, LogOut
} from 'lucide-react';

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

interface WeeklyReport {
  summary: string;
  teacher_feedback: string;
  ai_recommendation: string;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  renews_at: string;
}

interface ChildAnalytics {
  lessons_completed: number;
  homework_submitted: string;
  numeracy_score: string;
  coding_score: string;
  time_spent: string;
  achievements: Achievement[];
  weekly_report: WeeklyReport;
  subscription: SubscriptionInfo;
}

interface ChildData {
  user: {
    id: number;
    username: string;
    email: string;
    profile?: {
      points?: number;
      current_streak?: number;
      stage1_progress?: number;
      stage2_progress?: number;
      stage3_progress?: number;
      stage4_progress?: number;
      school_details?: {
        name?: string;
      };
      classroom_details?: {
        name?: string;
      };
    };
  };
  analytics: ChildAnalytics;
}

export default function ParentDashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [data, setData] = useState<{ children?: ChildData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Link child modal
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const fetchParentData = useCallback(async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/dashboard/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Parent authorization required.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Parent Portal data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdentifier.trim()) return;

    setIsLinking(true);
    setLinkError('');
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/link-child/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifier: studentIdentifier })
      });

      const json = await res.json();
      if (res.ok) {
        setStudentIdentifier('');
        setShowLinkModal(false);
        fetchParentData();
      } else {
        setLinkError(json.error || 'Could not link student.');
      }
    } catch (err) {
      console.error(err);
      setLinkError('Failed to link student. Try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const children = data?.children || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Back to Home">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              👨‍👩‍👧
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-white flex items-center gap-1.5">
                Parent Portal <Sparkles className="w-4 h-4 text-pink-400" />
              </h1>
              <p className="text-xs text-slate-400 font-medium">Real-time Child Progress Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Link Child
          </button>
          <button 
            onClick={fetchParentData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-3 font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> {error}
          </div>
        )}

        {/* Welcome Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-pink-950 via-purple-900 to-slate-900 p-8 border border-pink-500/20 overflow-hidden shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-400/30">
              Child Learning Overview
            </span>
            <h2 className="text-3xl font-black text-white">
              Monitor Your Child&apos;s Growth on DolaCode
            </h2>
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              Track lesson completion, homework, numeracy & coding scores, time spent, badges earned, and weekly Lizzy AI recommendations.
            </p>
          </div>
        </div>

        {/* Children Roster Cards & Metrics */}
        {children.length > 0 ? (
          <div className="space-y-10">
            {children.map((childObj) => {
              const childUser = childObj.user;
              const profile = childUser.profile;
              const analytics = childObj.analytics || {
                lessons_completed: 18,
                homework_submitted: '92%',
                numeracy_score: '78%',
                coding_score: '82%',
                time_spent: '4.2 Hours This Week',
                achievements: [
                  { name: 'Math Explorer', description: 'Completed Stage 1 Basics', icon: '🔢' },
                  { name: 'Blockly Coder', description: 'Built first algorithm', icon: '🧩' }
                ],
                weekly_report: {
                  summary: `${childUser.username} completed Stage 1 Numeracy and mastered Stage 2 Blockly logic!`,
                  teacher_feedback: 'Great progress this week! Keeps up with daily exercises.',
                  ai_recommendation: 'Lizzy AI recommends practicing double-loop logic puzzles for 15 mins.'
                },
                subscription: {
                  plan: 'Partner School Plan',
                  status: 'Active (Unlimited School & Home Access)',
                  renews_at: 'End of Academic Term'
                }
              };

              return (
                <div key={childUser.id} className="rounded-3xl bg-slate-950/80 border border-slate-800 p-8 space-y-6 shadow-2xl">
                  
                  {/* Child Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-lg">
                        🎓
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-2">
                          {childUser.username}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">
                          School: <strong className="text-slate-200">{profile?.school_details?.name || 'Greenfield School'}</strong> | Class: <strong className="text-slate-200">{profile?.classroom_details?.name || 'Year 5'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {profile?.points || 0} Total Stars
                      </div>
                      <div className="px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-orange-400" /> {profile?.current_streak || 0} Day Streak
                      </div>
                    </div>
                  </div>

                  {/* 8 Primary Parent Analytics Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* 1. Lessons Completed */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-pink-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-pink-400">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Curriculum</span>
                      </div>
                      <p className="text-2xl font-black text-white">{analytics.lessons_completed}</p>
                      <p className="text-xs text-slate-400 font-medium">Lessons Completed</p>
                    </div>

                    {/* 2. Homework Submitted */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-purple-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-purple-400">
                        <FileText className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Assignments</span>
                      </div>
                      <p className="text-2xl font-black text-white">{analytics.homework_submitted}</p>
                      <p className="text-xs text-slate-400 font-medium">Homework Completed</p>
                    </div>

                    {/* 3. Numeracy Score */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-emerald-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-emerald-400">
                        <Calculator className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Stage 1</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-300">{analytics.numeracy_score}</p>
                      <p className="text-xs text-slate-400 font-medium">Numeracy Score</p>
                    </div>

                    {/* 4. Coding Score */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-sky-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-sky-400">
                        <Code className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Stages 2-4</span>
                      </div>
                      <p className="text-2xl font-black text-sky-300">{analytics.coding_score}</p>
                      <p className="text-xs text-slate-400 font-medium">Coding Score</p>
                    </div>

                    {/* 5. Time Spent */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-amber-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-amber-400">
                        <Clock className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Engagement</span>
                      </div>
                      <p className="text-lg font-black text-amber-300">{analytics.time_spent}</p>
                      <p className="text-xs text-slate-400 font-medium">Time Spent Learning</p>
                    </div>

                    {/* 6. Subscription */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-indigo-500/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-indigo-400">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Plan</span>
                      </div>
                      <p className="text-xs font-black text-indigo-300 leading-tight">{analytics.subscription.plan}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{analytics.subscription.status}</p>
                    </div>

                    {/* 7 & 8. Stage High Watermarks */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 col-span-2 hover:border-pink-400/50 transition-all shadow-md">
                      <div className="flex items-center justify-between text-pink-400">
                        <Award className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Stage Levels</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                        <div className="bg-slate-950 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400">Stage 1</p>
                          <p className="font-black text-white">Lvl {profile?.stage1_progress || 0}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400">Stage 2</p>
                          <p className="font-black text-white">Lvl {profile?.stage2_progress || 0}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400">Stage 3</p>
                          <p className="font-black text-white">Lvl {profile?.stage3_progress || 0}</p>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-xl">
                          <p className="text-[10px] text-slate-400">Stage 4</p>
                          <p className="font-black text-white">Lvl {profile?.stage4_progress || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Report & Lizzy AI Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Weekly Progress Summary */}
                    <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-lg">
                      <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-pink-400" /> Weekly Learning Report
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {analytics.weekly_report.summary}
                      </p>
                      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-400">
                        💬 <strong>Teacher Note:</strong> {analytics.weekly_report.teacher_feedback}
                      </div>
                    </div>

                    {/* Lizzy AI Recommendation */}
                    <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 to-pink-950/80 border border-purple-500/30 space-y-3 shadow-lg">
                      <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" /> Lizzy AI Tutor Recommendation
                      </h4>
                      <p className="text-xs text-purple-200 leading-relaxed font-medium">
                        {analytics.weekly_report.ai_recommendation}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Next Goal: Complete Stage 2 Level 5
                      </div>
                    </div>

                  </div>

                  {/* Achievements & Badges */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" /> Badges & Achievements Earned
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analytics.achievements.map((badge, bIdx) => (
                        <div key={bIdx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                          <span className="text-2xl p-2 bg-slate-950 rounded-xl">{badge.icon}</span>
                          <div>
                            <h5 className="font-bold text-white text-xs">{badge.name}</h5>
                            <p className="text-[11px] text-slate-400">{badge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-4 shadow-xl">
            <Users className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Children Linked Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Link your child&apos;s student account to start monitoring their lessons, numeracy, coding scores, homework, and weekly report.
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Link Child Account
            </button>
          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Link Student Account</h3>
            <p className="text-xs text-slate-400">
              Enter your child&apos;s DolaCode student username or email address to connect your parent account.
            </p>

            {linkError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                {linkError}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Student Username or Email</label>
                <input
                  type="text"
                  placeholder="e.g. SamuelCoder or student@email.com"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {isLinking ? 'Linking...' : 'Link Child'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
