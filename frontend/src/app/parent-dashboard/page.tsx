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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors" title="Back to Home">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-pink-500/20">
              👨‍👩‍👧
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-slate-900 flex items-center gap-1.5">
                Parent Portal <Sparkles className="w-4 h-4 text-pink-500" />
              </h1>
              <p className="text-xs text-slate-500 font-medium">Real-time Child Progress Monitoring</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4" /> Link Child
          </button>
          <button 
            onClick={fetchParentData}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 font-semibold shadow-xs">
            <ShieldAlert className="w-5 h-5 text-rose-500" /> {error}
          </div>
        )}

        {/* Welcome Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 p-8 border border-white/20 overflow-hidden shadow-xl shadow-purple-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
          <div className="space-y-2 max-w-2xl relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase tracking-wider border border-white/30 backdrop-blur-sm">
              Child Learning Overview
            </span>
            <h2 className="text-3xl font-black text-white">
              Monitor Your Child&apos;s Growth on DolaCode
            </h2>
            <p className="text-pink-50/90 text-sm font-medium leading-relaxed">
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
              const analytics = childObj.analytics || {};
              const achievements = analytics.achievements || [];
              const weeklyReport = analytics.weekly_report || {
                summary: `${childUser.username} is ready to start learning on DolaCode.`,
                teacher_feedback: 'No teacher notes yet.',
                ai_recommendation: 'Lizzy AI recommends starting Stage 1 Numeracy.'
              };
              const subscription = analytics.subscription || {
                plan: profile?.school_details?.name ? `${profile.school_details.name} Plan` : 'Independent Learner Plan',
                status: 'Active Account',
                renews_at: 'N/A'
              };

              return (
                <div key={childUser.id} className="rounded-3xl bg-white border border-slate-200/80 p-8 space-y-6 shadow-xl shadow-slate-200/50">
                  
                  {/* Child Profile Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-md shadow-pink-500/20">
                        🎓
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                          {childUser.username}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          School: <strong className="text-slate-800">{profile?.school_details?.name || 'Not Enrolled in School'}</strong> | Class: <strong className="text-slate-800">{profile?.classroom_details?.name || 'Unassigned'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> {profile?.points || 0} Total Stars
                      </div>
                      <div className="px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <Flame className="w-4 h-4 text-orange-500" /> {profile?.current_streak || 0} Day Streak
                      </div>
                    </div>
                  </div>

                  {/* 8 Primary Parent Analytics Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    
                    {/* 1. Lessons Completed */}
                    <div className="p-5 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-2 hover:border-pink-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-pink-600">
                        <BookOpen className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-pink-500/80">Curriculum</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900">{analytics.lessons_completed ?? 0}</p>
                      <p className="text-xs text-slate-500 font-medium">Lessons Completed</p>
                    </div>

                    {/* 2. Homework Submitted */}
                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2 hover:border-purple-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-purple-600">
                        <FileText className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-purple-500/80">Assignments</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900">{analytics.homework_submitted || '0%'}</p>
                      <p className="text-xs text-slate-500 font-medium">Homework Completed</p>
                    </div>

                    {/* 3. Numeracy Score */}
                    <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 hover:border-emerald-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-emerald-600">
                        <Calculator className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-emerald-600/80">Stage 1</span>
                      </div>
                      <p className="text-2xl font-black text-emerald-700">{analytics.numeracy_score || '0%'}</p>
                      <p className="text-xs text-slate-500 font-medium">Numeracy Score</p>
                    </div>

                    {/* 4. Coding Score */}
                    <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-2 hover:border-sky-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-sky-600">
                        <Code className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-sky-600/80">Stages 2-4</span>
                      </div>
                      <p className="text-2xl font-black text-sky-700">{analytics.coding_score || '0%'}</p>
                      <p className="text-xs text-slate-500 font-medium">Coding Score</p>
                    </div>

                    {/* 5. Time Spent */}
                    <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2 hover:border-amber-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-amber-600">
                        <Clock className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-amber-600/80">Engagement</span>
                      </div>
                      <p className="text-lg font-black text-amber-700">{analytics.time_spent || '0 Mins'}</p>
                      <p className="text-xs text-slate-500 font-medium">Time Spent Learning</p>
                    </div>

                    {/* 6. Subscription */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 hover:border-indigo-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-indigo-600">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-indigo-600/80">Plan</span>
                      </div>
                      <p className="text-xs font-black text-indigo-800 leading-tight">{subscription.plan}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{subscription.status}</p>
                    </div>

                    {/* 7 & 8. Stage High Watermarks */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 col-span-2 hover:border-slate-300 transition-all shadow-xs">
                      <div className="flex items-center justify-between text-pink-600">
                        <Award className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase text-slate-400">Stage Levels</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <p className="text-[10px] text-slate-400 font-semibold">Stage 1</p>
                          <p className="font-black text-slate-900">Lvl {profile?.stage1_progress || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <p className="text-[10px] text-slate-400 font-semibold">Stage 2</p>
                          <p className="font-black text-slate-900">Lvl {profile?.stage2_progress || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <p className="text-[10px] text-slate-400 font-semibold">Stage 3</p>
                          <p className="font-black text-slate-900">Lvl {profile?.stage3_progress || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
                          <p className="text-[10px] text-slate-400 font-semibold">Stage 4</p>
                          <p className="font-black text-slate-900">Lvl {profile?.stage4_progress || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Report & Lizzy AI Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Weekly Progress Summary */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-md shadow-slate-100">
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-pink-500" /> Weekly Learning Report
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {weeklyReport.summary}
                      </p>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                        💬 <strong>Teacher Note:</strong> {weeklyReport.teacher_feedback}
                      </div>
                    </div>

                    {/* Lizzy AI Recommendation */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200/80 space-y-3 shadow-md shadow-purple-500/5">
                      <h4 className="font-extrabold text-base text-purple-950 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" /> Lizzy AI Tutor Recommendation
                      </h4>
                      <p className="text-xs text-purple-900 leading-relaxed font-medium">
                        {weeklyReport.ai_recommendation}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Goal: Practice 15 Mins Daily
                      </div>
                    </div>

                  </div>

                  {/* Achievements & Badges */}
                  <div className="space-y-3 pt-2">
                    <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" /> Badges & Achievements Earned
                    </h4>
                    {achievements.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {achievements.map((badge, bIdx) => (
                          <div key={bIdx} className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-md flex items-center gap-3 transition-all">
                            <span className="text-2xl p-2 bg-amber-50 rounded-xl border border-amber-100">{badge.icon || '🏆'}</span>
                            <div>
                              <h5 className="font-bold text-slate-900 text-xs">{badge.name}</h5>
                              <p className="text-[11px] text-slate-500">{badge.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-xs text-slate-500 text-center font-medium">
                        No badges earned yet. Complete stages to unlock achievements! 🌟
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-slate-200/80 text-center space-y-4 shadow-xl shadow-slate-200/50">
            <Users className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Children Linked Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Link your child&apos;s student account to start monitoring their lessons, numeracy, coding scores, homework, and weekly report.
            </p>
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-500/20 hover:shadow-lg cursor-pointer transition-all"
            >
              Link Child Account
            </button>
          </div>
        )}
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h3 className="text-xl font-black text-slate-900">Link Student Account</h3>
            <p className="text-xs text-slate-500">
              Enter your child&apos;s DolaCode student username or email address to connect your parent account.
            </p>

            {linkError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {linkError}
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Username or Email</label>
                <input
                  type="text"
                  placeholder="e.g. SamuelCoder or student@email.com"
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 shadow-md shadow-pink-500/20 transition-all"
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
