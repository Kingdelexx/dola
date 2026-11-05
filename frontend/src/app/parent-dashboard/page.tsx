'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Users, ArrowLeft, Star, Flame, 
  Sparkles, RefreshCw, ShieldAlert, UserPlus,
  BookOpen, Calculator, Code, Clock, Award, FileText, CheckCircle2, CreditCard, LogOut,
  Rocket, KeyRound, X, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import confetti from 'canvas-confetti';

interface ParentSubscription {
  has_subscription: boolean;
  is_active: boolean;
  plan_name: string;
  status: string;
  current_period_end: string | null;
  grace_period_end: string | null;
}

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

interface LearningProfile {
  numeracy_pattern_recognition: number;
  logical_reasoning: number;
  sequencing: number;
  problem_decomposition: number;
  computational_thinking: number;
  coding_application: number;
  debugging: number;
  creative_problem_solving: number;
}

interface WeeklyJourney {
  title: string;
  activities_completed: number;
  biggest_improvement: string;
  new_skill: string;
  project_completed: string;
  needs_practice: string;
  journey_level_label: string;
  journey_group: string;
  journey_level_percentage: number;
  try_at_home: string;
}

interface PizzaShopStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  accuracy: number;
  counting_accuracy: number;
  addition_accuracy: number;
  subtraction_accuracy: number;
  problem_solving_accuracy: number;
  hints_used: number;
  coding_concepts_completed: number;
  correct_orders: number;
  time_spent_seconds: number;
  badges: string[];
}

interface RobotMazeStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  accuracy: number;
  attempts: number;
  missions_completed: number;
  commands_used: number;
  hints_used: number;
  debugging_attempts: number;
  loops_completed: number;
  time_spent_seconds: number;
  badges: string[];
}

interface MyLittleShopStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  accuracy: number;
  attempts: number;
  customers_served: number;
  addition_accuracy: number;
  subtraction_accuracy: number;
  money_recognition_accuracy: number;
  change_accuracy: number;
  multiplication_accuracy: number;
  profit_accuracy: number;
  stock_accuracy: number;
  problem_solving_accuracy: number;
  hints_used: number;
  time_spent_seconds: number;
  shop_upgrades: string[];
  badges: string[];
}

interface FrogAdventureStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  accuracy: number;
  attempts: number;
  fruits_collected: number;
  counting_accuracy: number;
  sequence_accuracy: number;
  pattern_accuracy: number;
  coordinates_accuracy: number;
  route_planning_accuracy: number;
  loops_completed: number;
  debugging_attempts: number;
  hints_used: number;
  time_spent_seconds: number;
  unlocked_costumes: string[];
  badges: string[];
}

interface TrafficRescueStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  city_points: number;
  accuracy: number;
  attempts: number;
  vehicles_guided: number;
  pedestrians_saved: number;
  sequencing_ability: number;
  logical_reasoning: number;
  condition_usage: number;
  timing_accuracy: number;
  debugging_accuracy: number;
  hints_used: number;
  time_spent_seconds: number;
  city_upgrades: string[];
  badges: string[];
}

interface PetRescueStats {
  current_level: number;
  stars_earned: number;
  dola_coins: number;
  xp_earned: number;
  happiness_points: number;
  accuracy: number;
  attempts: number;
  pets_helped: number;
  counting_accuracy: number;
  classification_accuracy: number;
  sequence_accuracy: number;
  pattern_accuracy: number;
  condition_usage: number;
  loops_completed: number;
  debugging_accuracy: number;
  hints_used: number;
  time_spent_seconds: number;
  unlocked_pets: string[];
  unlocked_accessories: string[];
  badges: string[];
}

interface DolaMoneyStats {
  dola_coins: number;
  xp_earned: number;
  savings_streak: number;
  savings_total: number;
  current_world: number;
  completed_worlds: number[];
  active_savings_goal?: { name?: string; target?: number; current?: number };
  badges: string[];
  skills?: {
    [key: string]: { name: string; status: 'Learning' | 'Practising' | 'Mastered' };
  };
  conversation_prompts?: string[];
}

interface ChildAnalytics {
  lessons_completed: number;
  homework_submitted: string;
  numeracy_score: string;
  coding_score: string;
  time_spent: string;
  achievements: Achievement[];
  pizza_shop_stats?: PizzaShopStats;
  robot_maze_stats?: RobotMazeStats;
  my_little_shop_stats?: MyLittleShopStats;
  frog_adventure_stats?: FrogAdventureStats;
  traffic_rescue_stats?: TrafficRescueStats;
  pet_rescue_stats?: PetRescueStats;
  dolamoney_stats?: DolaMoneyStats;
  weekly_report: WeeklyReport;
  weekly_journey?: WeeklyJourney;
  learning_profile?: LearningProfile;
  subscription: SubscriptionInfo;
}

interface ChildData {
  user: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    pin?: string;
    email: string;
    profile?: {
      role?: string;
      age?: number;
      gender?: string;
      pin?: string;
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
  const { user, login, logout } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [data, setData] = useState<{ parent?: any; parent_subscription?: ParentSubscription; children?: ChildData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Link child modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkMode, setLinkMode] = useState<'create' | 'existing'>('create');
  const [childName, setChildName] = useState('');
  const [childPin, setChildPin] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState<'boy' | 'girl'>('boy');
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [linkError, setLinkError] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // Edit PIN modal state
  const [editingChild, setEditingChild] = useState<any | null>(null);
  const [editPin, setEditPin] = useState('');
  const [editPinError, setEditPinError] = useState('');
  const [isUpdatingPin, setIsUpdatingPin] = useState(false);
  const [showPinMap, setShowPinMap] = useState<{ [childId: number]: boolean }>({});

  // Direct switch to child session
  const [isSwitchingChild, setIsSwitchingChild] = useState<number | null>(null);

  // Subscription modal & payment verification
  const [showSubModal, setShowSubModal] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState('');

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
        if (res.status === 403) {
          // If current session is actually a student, seamlessly transition them to student dashboard
          const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u?.profile?.role === 'student' || u?.role === 'student') {
                window.location.href = '/dashboard';
                return;
              }
            } catch (e) {}
          }
        }
        setError('Parent authorization required.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Parent Portal data.');
    } finally {
      setLoading(false);
    }
  }, [router, token]);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  // Handle Paystack redirect return and verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isComplete = params.get('payment') === 'complete';
      const ref = params.get('reference') || params.get('trxref');

      if (isComplete && ref) {
        setPaymentVerifying(true);
        const authToken = token || localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/verify/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reference: ref })
        })
          .then(res => res.json())
          .then(resData => {
            if (resData.success) {
              setPaymentSuccessMessage(resData.message || 'Payment verified! Your family membership is now active.');
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              fetchParentData();
            } else {
              setError(resData.message || 'Payment verification was not completed.');
            }
          })
          .catch(err => {
            console.error("Payment verification error:", err);
          })
          .finally(() => {
            setPaymentVerifying(false);
            window.history.replaceState({}, document.title, window.location.pathname);
          });
      }
    }
  }, [token, fetchParentData]);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    const authToken = token || localStorage.getItem('token');
    if (!authToken) return;

    let payload: any = {};
    if (linkMode === 'create') {
      if (!childName.trim()) {
        setLinkError("Please enter your child's name.");
        return;
      }
      if (!childPin.trim() || childPin.trim().length !== 4 || !/^\d+$/.test(childPin.trim())) {
        setLinkError("PIN must be exactly 4 digits (e.g. 1234).");
        return;
      }
      payload = {
        name: childName.trim(),
        pin: childPin.trim(),
        age: childAge ? parseInt(childAge) : null,
        gender: childGender
      };
    } else {
      if (!studentIdentifier.trim()) {
        setLinkError("Student username or email is required.");
        return;
      }
      payload = {
        identifier: studentIdentifier.trim(),
        pin: childPin.trim() || undefined
      };
    }

    setIsLinking(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/link-child/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (res.ok) {
        setChildName('');
        setChildPin('');
        setChildAge('');
        setStudentIdentifier('');
        setShowLinkModal(false);
        fetchParentData();
      } else {
        setLinkError(json.error || 'Could not create or link child account.');
      }
    } catch (err) {
      console.error(err);
      setLinkError('Failed to create or link child. Try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUpdateChildPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    setEditPinError('');

    if (!editPin.trim() || editPin.trim().length !== 4 || !/^\d+$/.test(editPin.trim())) {
      setEditPinError("PIN must be exactly 4 digits (e.g. 1234).");
      return;
    }

    setIsUpdatingPin(true);
    const authToken = token || localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/children/${editingChild.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pin: editPin.trim() })
      });

      const json = await res.json();
      if (res.ok) {
        setEditingChild(null);
        setEditPin('');
        fetchParentData();
      } else {
        setEditPinError(json.error || 'Failed to update PIN.');
      }
    } catch (err) {
      console.error(err);
      setEditPinError('Network error updating PIN.');
    } finally {
      setIsUpdatingPin(false);
    }
  };

  const handleLaunchChildDashboard = async (childId: number) => {
    setIsSwitchingChild(childId);
    const authToken = token || localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/switch-to-child/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ child_id: childId })
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {
        console.error("Non-JSON response from server:", e);
      }

      if (res.ok && json?.token && json?.user) {
        login(json.token, json.user);
        window.location.href = '/dashboard';
      } else {
        alert(json?.error || json?.message || `Failed to launch learner session (Status: ${res.status}).`);
        setIsSwitchingChild(null);
      }
    } catch (err: any) {
      console.error("Error switching to child:", err);
      alert(err?.message || 'Error connecting to server. Please try again.');
      setIsSwitchingChild(null);
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
          <Link
            href="/parent/subscription"
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-lg"
          >
            <CreditCard className="w-4 h-4" /> {data?.parent_subscription?.is_active ? 'Membership Active' : 'Subscribe / Upgrade'}
          </Link>
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

        {/* Payment Verification Feedback */}
        {paymentVerifying && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center gap-3 font-semibold shadow-xs animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Verifying your Paystack payment transaction... Please hold on.</span>
          </div>
        )}

        {paymentSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between font-bold shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <span>{paymentSuccessMessage}</span>
            </div>
            <button 
              onClick={() => setPaymentSuccessMessage('')} 
              className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Past Due Grace Period Notification Banner */}
        {data?.parent_subscription?.status === 'past_due' && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-black text-base text-amber-950">
                  Your DolaCode subscription could not be renewed.
                </h4>
                <p className="text-xs text-amber-900 font-medium mt-0.5">
                  Your child's learning progress and saved projects are safe. Please update your payment details to continue learning.
                </p>
                {data.parent_subscription.grace_period_end && (
                  <div className="text-[11px] font-bold text-amber-800 mt-1 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-600" />
                    <span>Grace period active until {new Date(data.parent_subscription.grace_period_end).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href="/parent/subscription"
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <CreditCard size={15} />
              <span>UPDATE PAYMENT</span>
            </Link>
          </div>
        )}

        {/* Family Subscription Status Card */}
        <div className="p-6 rounded-3xl bg-white border-2 border-indigo-100/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
              data?.parent_subscription?.is_active 
                ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' 
                : 'bg-amber-100 text-amber-600 border-2 border-amber-200'
            }`}>
              {data?.parent_subscription?.is_active ? '🌟' : '🔒'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Family Membership: <span className="text-indigo-600">{data?.parent_subscription?.plan_name || 'No Active Plan'}</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  data?.parent_subscription?.is_active 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {data?.parent_subscription?.status || 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {data?.parent_subscription?.is_active && data.parent_subscription.current_period_end 
                  ? `Covers all linked children • Valid until ${new Date(data.parent_subscription.current_period_end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`
                  : 'Subscribe to give all your linked children full access to all 4 coding stages and math games.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/parent/subscription"
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <span>Manage & Receipts</span>
            </Link>
            <button
              onClick={() => setShowSubModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CreditCard size={15} />
              <span>{data?.parent_subscription?.is_active ? 'Renew Plan' : 'Activate Membership'}</span>
            </button>
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
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-md shadow-pink-500/20">
                        🎓
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-black text-slate-900">
                            {childUser.first_name || childUser.username}
                          </h3>
                          {profile?.age && (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                              Age {profile.age}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Username: <strong className="text-slate-700 font-mono">{childUser.username}</strong> | School: <strong className="text-slate-800">{profile?.school_details?.name || 'Home Learner'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* 4-digit PIN Quick Badge & Controls */}
                      {childUser.pin ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold shadow-xs">
                          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                          <span>Login PIN:</span>
                          <span className="font-mono tracking-widest text-sm text-purple-950 font-black">
                            {showPinMap[childUser.id] ? childUser.pin : '••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowPinMap(p => ({ ...p, [childUser.id]: !p[childUser.id] }))}
                            className="p-1 hover:bg-purple-200 rounded-md transition-colors text-purple-600"
                            title={showPinMap[childUser.id] ? "Hide PIN" : "Show PIN"}
                          >
                            {showPinMap[childUser.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingChild(childUser);
                              setEditPin(childUser.pin || '');
                              setEditPinError('');
                            }}
                            className="ml-1 text-[11px] underline text-purple-700 hover:text-purple-950 font-bold"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChild(childUser);
                            setEditPin('');
                            setEditPinError('');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-xs"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          Set 4-Digit Login PIN
                        </button>
                      )}

                      {/* Launch Child Session Directly */}
                      <button
                        type="button"
                        onClick={() => handleLaunchChildDashboard(childUser.id)}
                        disabled={isSwitchingChild === childUser.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        title="Directly launch learner dashboard without entering PIN"
                      >
                        <Rocket className="w-4 h-4" />
                        <span>{isSwitchingChild === childUser.id ? 'Launching...' : 'Launch Learner World'}</span>
                      </button>

                      <div className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> {profile?.points || 0} Stars
                      </div>
                      <div className="px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                        <Flame className="w-4 h-4 text-orange-500" /> {profile?.current_streak || 0} Streak
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

                  {/* Category-Grouped Learning Profile Progress Bars */}
                  {analytics.learning_profile && (
                    <div className="space-y-4 pt-2 border-t border-slate-100 mt-4">
                      <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-500" /> Learning Profile Competencies
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. Mathematical Foundations */}
                        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/60 space-y-4">
                          <h5 className="font-black text-xs uppercase tracking-wider text-pink-600 flex items-center gap-1.5">
                            📐 Mathematical Foundations
                          </h5>
                          <div className="space-y-3.5">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Numeracy & Pattern Recognition</span>
                                <span>{analytics.learning_profile.numeracy_pattern_recognition}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.numeracy_pattern_recognition}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Sequencing</span>
                                <span>{analytics.learning_profile.sequencing}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.sequencing}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Computational Thinking */}
                        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/60 space-y-4">
                          <h5 className="font-black text-xs uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
                            🧠 Computational Thinking
                          </h5>
                          <div className="space-y-3.5">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Problem Decomposition</span>
                                <span>{analytics.learning_profile.problem_decomposition}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.problem_decomposition}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Computational Thinking</span>
                                <span>{analytics.learning_profile.computational_thinking}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.computational_thinking}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Software Engineering Skills */}
                        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/60 space-y-4">
                          <h5 className="font-black text-xs uppercase tracking-wider text-sky-600 flex items-center gap-1.5">
                            💻 Software Engineering Skills
                          </h5>
                          <div className="space-y-3.5">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Coding Application</span>
                                <span>{analytics.learning_profile.coding_application}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.coding_application}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Debugging</span>
                                <span>{analytics.learning_profile.debugging}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.debugging}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. Cognitive Logic & Solving */}
                        <div className="p-6 rounded-3xl bg-slate-50/70 border border-slate-200/60 space-y-4">
                          <h5 className="font-black text-xs uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                            ✨ Logical & Creative Solving
                          </h5>
                          <div className="space-y-3.5">
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Logical Reasoning</span>
                                <span>{analytics.learning_profile.logical_reasoning}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.logical_reasoning}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Creative Problem Solving</span>
                                <span>{analytics.learning_profile.creative_problem_solving}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${analytics.learning_profile.creative_problem_solving}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Weekly Journey Track & Lizzy AI Recommendations */}
                  {analytics.weekly_journey && (
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs mt-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          <h4 className="font-extrabold text-base text-slate-900">
                            {analytics.weekly_journey.title}
                          </h4>
                        </div>
                        <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-505 to-pink-500 text-white font-bold text-xs shadow-xs">
                          {analytics.weekly_journey.journey_group} ({analytics.weekly_journey.journey_level_label})
                        </span>
                      </div>

                      {/* Journey Stepper / Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-600">
                          <span>Numeracy-to-Code Journey Progress</span>
                          <span className="text-indigo-600">{analytics.weekly_journey.journey_level_label} ({analytics.weekly_journey.journey_level_percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200/60 p-0.5 shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${analytics.weekly_journey.journey_level_percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-1">
                          <span>Lv.1 Think & Discover</span>
                          <span>Lv.4 Blockly Basics</span>
                          <span>Lv.7 Screen Builder</span>
                          <span>Lv.10 Python Quest</span>
                        </div>
                      </div>

                      {/* 4 Cards (Activities completed, biggest improvement, new skill, project completed) */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3 shadow-xs">
                          <div className="text-xl p-1 bg-indigo-100 rounded-lg">📈</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">Weekly Activities</p>
                            <p className="font-extrabold text-slate-900 text-xs mt-0.5">{analytics.weekly_journey.activities_completed} completed</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3 shadow-xs">
                          <div className="text-xl p-1 bg-emerald-100 rounded-lg">⭐</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">Improvement</p>
                            <p className="font-extrabold text-slate-900 text-xs mt-0.5">{analytics.weekly_journey.biggest_improvement}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-start gap-3 shadow-xs">
                          <div className="text-xl p-1 bg-pink-100 rounded-lg">🔑</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">Skill Mastered</p>
                            <p className="font-extrabold text-slate-900 text-xs mt-0.5 text-pink-700">{analytics.weekly_journey.new_skill}</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3 shadow-xs">
                          <div className="text-xl p-1 bg-amber-100 rounded-lg">🚀</div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">Project Done</p>
                            <p className="font-extrabold text-slate-900 text-xs mt-0.5 text-amber-700">{analytics.weekly_journey.project_completed}</p>
                          </div>
                        </div>

                      </div>

                      {/* Needs Practice & Try at Home Try Tip */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs flex gap-2">
                          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-rose-950 font-bold block mb-0.5">Needs more practice:</strong>
                            <span className="text-rose-800 font-medium">{analytics.weekly_journey.needs_practice}</span>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-xs flex gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-purple-950 font-bold block mb-0.5">Try at home:</strong>
                            <span className="text-purple-800 font-medium">{analytics.weekly_journey.try_at_home}</span>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  )}

                  {/* Dola's Pizza Shop (Stage 1 Mini-Game) Early Numeracy & Coding Metrics */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-white border-2 border-orange-200/80 space-y-6 shadow-xs mt-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-orange-100 pb-4 gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl shadow-xs">
                          🍕
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            Dola&apos;s Pizza Shop
                            <span className="text-[10px] bg-orange-100 text-orange-800 font-black px-2 py-0.5 rounded-full uppercase border border-orange-200">
                              Stage 1 Mini-Game (Ages 5–8)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Early numeracy, slice arithmetic, sharing &amp; loop foundations</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs shadow-xs border border-yellow-300 flex items-center gap-1">
                          <span>🪙</span> {analytics.pizza_shop_stats?.dola_coins ?? 0} DolaCoins
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-xs shadow-xs">
                          Level {analytics.pizza_shop_stats?.current_level ?? 1}
                        </span>
                      </div>
                    </div>

                    {/* Numeracy & Coding Competency Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Counting</span>
                        <div className="text-base font-black text-orange-600">
                          {analytics.pizza_shop_stats?.counting_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Accuracy</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Addition</span>
                        <div className="text-base font-black text-emerald-600">
                          {analytics.pizza_shop_stats?.addition_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Accuracy</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Subtraction</span>
                        <div className="text-base font-black text-blue-600">
                          {analytics.pizza_shop_stats?.subtraction_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Accuracy</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Problem-Solving</span>
                        <div className="text-base font-black text-purple-600">
                          {analytics.pizza_shop_stats?.problem_solving_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Accuracy</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Hints Used</span>
                        <div className="text-base font-black text-amber-600">
                          {analytics.pizza_shop_stats?.hints_used ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Lizzy Helps</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-orange-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Coding Loops</span>
                        <div className="text-base font-black text-indigo-600">
                          {analytics.pizza_shop_stats?.coding_concepts_completed ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                      </div>
                    </div>

                    {/* Customer Orders & Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200/60 text-xs gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🍕</span>
                        <span className="text-slate-700 font-bold">
                          Orders Served: <strong className="text-orange-950 font-black">{analytics.pizza_shop_stats?.correct_orders ?? 0}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-bold text-[11px] mr-1">Earned Badges:</span>
                        {(analytics.pizza_shop_stats?.badges && analytics.pizza_shop_stats.badges.length > 0) ? (
                          analytics.pizza_shop_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-white text-orange-800 font-bold text-[10px] border border-orange-200 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ready to earn &quot;Pizza Rookie&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Robot Maze Mini-Game Progress Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-cyan-50/70 border border-teal-200 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-2xl shadow-md text-white">
                          🤖
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            Robot Maze
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-black px-2 py-0.5 rounded-full uppercase border border-teal-200">
                              Stage 1 Mini-Game (Ages 5–8)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Directional sequencing, algorithms, loop mastery &amp; playful debugging</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs shadow-xs border border-yellow-300 flex items-center gap-1">
                          <span>🪙</span> {analytics.robot_maze_stats?.dola_coins ?? 0} DolaCoins
                        </span>
                        <span className="px-3 py-1 rounded-full bg-teal-600 text-white font-bold text-xs shadow-xs">
                          Level {analytics.robot_maze_stats?.current_level ?? 1}
                        </span>
                      </div>
                    </div>

                    {/* Robot Maze Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Missions</span>
                        <div className="text-base font-black text-teal-700">
                          {analytics.robot_maze_stats?.missions_completed ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Completed</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Accuracy</span>
                        <div className="text-base font-black text-emerald-600">
                          {analytics.robot_maze_stats?.accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Navigation</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Commands</span>
                        <div className="text-base font-black text-blue-600">
                          {analytics.robot_maze_stats?.commands_used ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Arranged</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Repeat Loops</span>
                        <div className="text-base font-black text-purple-600">
                          {analytics.robot_maze_stats?.loops_completed ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Executed</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Debugging</span>
                        <div className="text-base font-black text-rose-600">
                          {analytics.robot_maze_stats?.debugging_attempts ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Bugs Fixed</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-teal-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Hints Used</span>
                        <div className="text-base font-black text-amber-600">
                          {analytics.robot_maze_stats?.hints_used ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Lizzy Helps</span>
                      </div>
                    </div>

                    {/* Robot Maze Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-teal-50/70 rounded-2xl border border-teal-200/60 text-xs gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <span className="text-slate-700 font-bold">
                          Total Attempts: <strong className="text-teal-950 font-black">{analytics.robot_maze_stats?.attempts ?? 0}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-bold text-[11px] mr-1">Robot Badges:</span>
                        {(analytics.robot_maze_stats?.badges && analytics.robot_maze_stats.badges.length > 0) ? (
                          analytics.robot_maze_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-white text-teal-800 font-bold text-[10px] border border-teal-200 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ready to earn &quot;Robo Rookie&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* My Little Shop Mini-Game Progress Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50/70 via-emerald-50/40 to-yellow-50/60 border-2 border-amber-300/80 space-y-4 shadow-xs mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 flex items-center justify-center text-2xl shadow-md text-white">
                          🏪
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            My Little Shop
                            <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-2 py-0.5 rounded-full uppercase border border-amber-300">
                              Stage 1 Mini-Game (Ages 5–8)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Nigerian Naira (₦) numeracy, change giving, stock, profit &amp; shop automation</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs shadow-xs border border-yellow-300 flex items-center gap-1">
                          <span>🪙</span> {analytics.my_little_shop_stats?.dola_coins ?? 0} DolaCoins
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                          Level {analytics.my_little_shop_stats?.current_level ?? 1}
                        </span>
                      </div>
                    </div>

                    {/* My Little Shop Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Money Recognition</span>
                        <div className="text-base font-black text-emerald-600">
                          {analytics.my_little_shop_stats?.money_recognition_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Naira Notes</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Addition Math</span>
                        <div className="text-base font-black text-amber-600">
                          {analytics.my_little_shop_stats?.addition_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Order Totals</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Giving Change</span>
                        <div className="text-base font-black text-blue-600">
                          {analytics.my_little_shop_stats?.change_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Accuracy</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Multiplication</span>
                        <div className="text-base font-black text-indigo-600">
                          {analytics.my_little_shop_stats?.multiplication_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Repeated Sales</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Stock &amp; Profit</span>
                        <div className="text-base font-black text-purple-600">
                          {analytics.my_little_shop_stats?.profit_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Shop Logic</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-amber-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Hints Used</span>
                        <div className="text-base font-black text-rose-500">
                          {analytics.my_little_shop_stats?.hints_used ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Lizzy Helps</span>
                      </div>
                    </div>

                    {/* Customers & Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/70 text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🛍️</span>
                        <span className="text-slate-700 font-bold">
                          Customers Served: <strong className="text-amber-950 font-black">{analytics.my_little_shop_stats?.customers_served ?? 0}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-700 font-bold">
                          Upgrades: <strong className="text-emerald-700 font-black">{analytics.my_little_shop_stats?.shop_upgrades?.length ?? 0} unlocked</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-bold text-[11px] mr-1">Shop Badges:</span>
                        {(analytics.my_little_shop_stats?.badges && analytics.my_little_shop_stats.badges.length > 0) ? (
                          analytics.my_little_shop_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-white text-amber-900 font-bold text-[10px] border border-amber-300 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ready to earn &quot;Shop Helper&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Frog Adventure Mini-Game Progress Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-lime-50/70 via-emerald-50/40 to-teal-50/60 border-2 border-emerald-300/80 space-y-4 shadow-xs mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200/60">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-lime-500 via-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-md text-white">
                          🐸
                        </div>
                        <div>
                          <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                            Frog Adventure
                            <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2 py-0.5 rounded-full uppercase border border-emerald-300">
                              Stage 1 Mini-Game (Ages 5–8)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">Jump counting, spatial directions, patterns, grid coordinates, loops &amp; debugging</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs shadow-xs border border-yellow-300 flex items-center gap-1">
                          <span>🪙</span> {analytics.frog_adventure_stats?.dola_coins ?? 0} DolaCoins
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                          Level {analytics.frog_adventure_stats?.current_level ?? 1}
                        </span>
                      </div>
                    </div>

                    {/* Frog Adventure Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Counting</span>
                        <div className="text-base font-black text-emerald-600">
                          {analytics.frog_adventure_stats?.counting_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Jump Steps</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Sequencing</span>
                        <div className="text-base font-black text-sky-600">
                          {analytics.frog_adventure_stats?.sequence_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Directions</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Patterns</span>
                        <div className="text-base font-black text-purple-600">
                          {analytics.frog_adventure_stats?.pattern_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Rhythm Leap</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Coordinates</span>
                        <div className="text-base font-black text-indigo-600">
                          {analytics.frog_adventure_stats?.coordinates_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">2D Grid (X, Y)</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Coding Loops</span>
                        <div className="text-base font-black text-amber-600">
                          {analytics.frog_adventure_stats?.loops_completed ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Repeats Used</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-100 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Hints Used</span>
                        <div className="text-base font-black text-rose-500">
                          {analytics.frog_adventure_stats?.hints_used ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Lizzy Helps</span>
                      </div>
                    </div>

                    {/* Fruits & Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/70 text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🥭</span>
                        <span className="text-slate-700 font-bold">
                          Fruits Harvested: <strong className="text-emerald-950 font-black">{analytics.frog_adventure_stats?.fruits_collected ?? 0}</strong>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-700 font-bold">
                          Wardrobe: <strong className="text-teal-700 font-black">{analytics.frog_adventure_stats?.unlocked_costumes?.length ?? 1} outfits</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-bold text-[11px] mr-1">Frog Badges:</span>
                        {(analytics.frog_adventure_stats?.badges && analytics.frog_adventure_stats.badges.length > 0) ? (
                          analytics.frog_adventure_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-white text-emerald-900 font-bold text-[10px] border border-emerald-300 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ready to earn &quot;Little Jumper&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Traffic Rescue (Mini-Game Analytics) */}
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                          🚦
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                            <span>Traffic Rescue Controller Report</span>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Part 13 (Ages 5–8)
                            </span>
                          </h4>
                          <p className="text-xs text-slate-400">Logic, sequencing, timing, and conditional IF/THEN traffic mastery.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-xs border border-amber-300 flex items-center gap-1">
                          <span>🏙️</span> {analytics.traffic_rescue_stats?.city_points ?? 0} City Pts
                        </span>
                        <span className="px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs shadow-xs">
                          Level {analytics.traffic_rescue_stats?.current_level ?? 1}
                        </span>
                      </div>
                    </div>

                    {/* Traffic Rescue Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Sequencing</span>
                        <div className="text-base font-black text-sky-400">
                          {analytics.traffic_rescue_stats?.sequencing_ability ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Step Order</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Logic</span>
                        <div className="text-base font-black text-amber-400">
                          {analytics.traffic_rescue_stats?.logical_reasoning ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Crossroads</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Conditions</span>
                        <div className="text-base font-black text-purple-400">
                          {analytics.traffic_rescue_stats?.condition_usage ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">IF / THEN</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Timing</span>
                        <div className="text-base font-black text-emerald-400">
                          {analytics.traffic_rescue_stats?.timing_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Delays</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Vehicles Safe</span>
                        <div className="text-base font-black text-indigo-400">
                          {analytics.traffic_rescue_stats?.vehicles_guided ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Guided</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Pedestrians</span>
                        <div className="text-base font-black text-rose-400">
                          {analytics.traffic_rescue_stats?.pedestrians_saved ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Crossed</span>
                      </div>
                    </div>

                    {/* Upgrades & Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🏙️</span>
                        <span className="text-slate-300 font-bold">
                          City Upgrades: <strong className="text-amber-300 font-black">{analytics.traffic_rescue_stats?.city_upgrades?.length ?? 0} unlocked</strong>
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-300 font-bold">
                          DolaCoins: <strong className="text-amber-400 font-black">{analytics.traffic_rescue_stats?.dola_coins ?? 0} 🪙</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 font-bold text-[11px] mr-1">Traffic Badges:</span>
                        {(analytics.traffic_rescue_stats?.badges && analytics.traffic_rescue_stats.badges.length > 0) ? (
                          analytics.traffic_rescue_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-slate-700 text-amber-300 font-bold text-[10px] border border-amber-500/30 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Ready to earn &quot;Road Helper&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 6. Pet Rescue Centre Report Card */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-pink-950 border border-rose-800/50 shadow-md space-y-4 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/30">
                          🐶
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-base text-white">Pet Rescue Centre</h4>
                            <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500/30 text-rose-300 border border-rose-400/30">
                              Stage 1 Part 14 • Ages 5–8
                            </span>
                          </div>
                          <p className="text-xs text-rose-200/80 font-medium">
                            Counting food, sorting items, care sequence, pattern logic &amp; IF/THEN rules
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 font-bold uppercase block">Rescue Missions</span>
                          <span className="text-lg font-black text-rose-400">
                            Level {analytics.pet_rescue_stats?.current_level ?? 1}/8
                          </span>
                        </div>
                        <div className="text-right pl-3 border-l border-slate-700">
                          <span className="text-[11px] text-slate-400 font-bold uppercase block">Stars</span>
                          <span className="text-lg font-black text-amber-400 flex items-center justify-end gap-1">
                            ⭐ {analytics.pet_rescue_stats?.stars_earned ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Rescue Centre Mastery</span>
                        <span className="text-rose-300">
                          {Math.round(((analytics.pet_rescue_stats?.current_level ?? 1) / 8) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                        <div
                          className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 h-2.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round(((analytics.pet_rescue_stats?.current_level ?? 1) / 8) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Core Learning Outcomes */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Happiness</span>
                        <div className="text-base font-black text-rose-400">
                          {analytics.pet_rescue_stats?.happiness_points ?? 85}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Care Meter</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Counting</span>
                        <div className="text-base font-black text-amber-400">
                          {analytics.pet_rescue_stats?.counting_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Food Quantities</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Sorting</span>
                        <div className="text-base font-black text-cyan-400">
                          {analytics.pet_rescue_stats?.classification_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Categories</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Sequence</span>
                        <div className="text-base font-black text-emerald-400">
                          {analytics.pet_rescue_stats?.sequence_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Care Routines</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Patterns</span>
                        <div className="text-base font-black text-purple-400">
                          {analytics.pet_rescue_stats?.pattern_accuracy ?? 100}%
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Predictions</span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-xs">
                        <span className="text-[10px] text-slate-400 font-black uppercase block mb-1">Pets Helped</span>
                        <div className="text-base font-black text-pink-400">
                          {analytics.pet_rescue_stats?.pets_helped ?? 0}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Total Rescued</span>
                      </div>
                    </div>

                    {/* Upgrades & Badges */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🏡</span>
                        <span className="text-slate-300 font-bold">
                          Unlocked Pets: <strong className="text-pink-300 font-black">{analytics.pet_rescue_stats?.unlocked_pets?.length ?? 1} friends</strong>
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-300 font-bold">
                          DolaCoins: <strong className="text-amber-400 font-black">{analytics.pet_rescue_stats?.dola_coins ?? 0} 🪙</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-400 font-bold text-[11px] mr-1">Pet Badges:</span>
                        {(analytics.pet_rescue_stats?.badges && analytics.pet_rescue_stats.badges.length > 0) ? (
                          analytics.pet_rescue_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-slate-700 text-pink-300 font-bold text-[10px] border border-pink-500/30 shadow-2xs">
                              ⭐ {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Ready to earn &quot;Pet Helper&quot;!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Literacy (DolaMoney Quest) Analytics */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border-2 border-emerald-500/40 text-white space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4 relative z-10">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-900 flex items-center justify-center text-2xl shadow-lg border-2 border-white shrink-0">
                          🪙
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-lg text-white">Financial Literacy &bull; DolaMoney Quest</h4>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase tracking-wider">
                              Nigerian Naira (₦)
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 font-medium mt-0.5">
                            Learn. Earn. Save. Spend. Build. &bull; Practical decision-making through games
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-black text-xs flex items-center gap-1.5">
                          <span>🪙</span> {analytics.dolamoney_stats?.dola_coins ?? 0} DolaCoins
                        </span>
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-400/40 text-orange-300 font-black text-xs flex items-center gap-1">
                          <span>🔥</span> {analytics.dolamoney_stats?.savings_streak ?? 0}-Week Streak
                        </span>
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-black text-xs flex items-center gap-1">
                          <span>🌍</span> {analytics.dolamoney_stats?.completed_worlds?.length ?? 0}/10 Worlds
                        </span>
                      </div>
                    </div>

                    {/* 7 Core Financial Competencies */}
                    <div className="space-y-2.5 relative z-10">
                      <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Financial Competencies &amp; Progression
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {analytics.dolamoney_stats?.skills ? (
                          Object.entries(analytics.dolamoney_stats.skills).map(([k, sk]) => (
                            <div key={k} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">{sk.name}</span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                sk.status === 'Mastered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : sk.status === 'Practising'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                              }`}>
                                {sk.status}
                              </span>
                            </div>
                          ))
                        ) : (
                          ['Money Recognition (Naira)', 'Needs vs Wants', 'Savings & Goals', 'Budgeting & Planning', 'Banking Basics', 'Entrepreneurship & Profit', 'Decision Making'].map((name, i) => (
                            <div key={i} className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-200">{name}</span>
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                                Learning
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Weekly Parent Conversation Starters */}
                    <div className="p-4.5 rounded-2xl bg-emerald-950/40 border border-emerald-400/30 space-y-2 relative z-10">
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                        <span>💬</span> Real-World Parent Conversation Starters of the Week
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed font-medium">
                        {(analytics.dolamoney_stats?.conversation_prompts && analytics.dolamoney_stats.conversation_prompts.length > 0) ? (
                          analytics.dolamoney_stats.conversation_prompts.map((prompt, pi) => (
                            <div key={pi} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">&bull;</span>
                              <span>{prompt}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">&bull;</span>
                            <span>
                              Ask {childUser.first_name || childUser.username}: &quot;If you were given ₦2,000 today, would you choose to save it in your savings jar towards a goal, or spend a part of it?&quot;
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges & Active Goal Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-emerald-500/20 pt-4 relative z-10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-bold text-[11px]">Financial Badges:</span>
                        {(analytics.dolamoney_stats?.badges && analytics.dolamoney_stats.badges.length > 0) ? (
                          analytics.dolamoney_stats.badges.map((b, bi) => (
                            <span key={bi} className="px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 font-bold text-[10px] border border-emerald-500/30">
                              🏆 {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-[11px]">Ready to unlock first badge in World 1</span>
                        )}
                      </div>

                      {analytics.dolamoney_stats?.active_savings_goal?.name && (
                        <div className="text-slate-300 font-semibold text-xs">
                          Active Goal: <strong className="text-emerald-300">{analytics.dolamoney_stats.active_savings_goal.name}</strong> (₦{analytics.dolamoney_stats.active_savings_goal.current?.toLocaleString() || 0} / ₦{analytics.dolamoney_stats.active_savings_goal.target?.toLocaleString() || 0})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Narrative Weekly Report & Lizzy AI Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Weekly Progress Summary */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-pink-500" /> Narrative Weekly Report
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {weeklyReport.summary}
                      </p>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                        💬 <strong>Teacher Note:</strong> {weeklyReport.teacher_feedback}
                      </div>
                    </div>

                    {/* Lizzy AI Recommendation */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200/80 space-y-3 shadow-xs">
                      <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-purple-600" /> Narrative Lizzy Recommendation
                      </h4>
                      <p className="text-xs text-purple-950 leading-relaxed font-medium">
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

      {/* Add / Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-600" />
                Add Child Profile
              </h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setLinkMode('create')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  linkMode === 'create'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create New Profile (Name &amp; PIN)
              </button>
              <button
                type="button"
                onClick={() => setLinkMode('existing')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  linkMode === 'existing'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Link Existing Username
              </button>
            </div>

            {linkError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{linkError}</span>
              </div>
            )}

            <form onSubmit={handleLinkChild} className="space-y-4">
              {linkMode === 'create' ? (
                <>
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 font-medium">
                    ✨ <strong>Simple for Kids:</strong> No email address required. Your child signs in by entering your email (<strong>{user?.email || 'your email'}</strong>), picking their profile, and typing their 4-digit PIN!
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Child&apos;s Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tobi Davies or Amina Bello"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      4-Digit Child PIN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      placeholder="e.g. 1234"
                      value={childPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setChildPin(val);
                      }}
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3.5 text-base tracking-widest font-mono text-center focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-bold"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Choose an easy 4-digit number your child can remember.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Age (Optional)</label>
                      <input
                        type="number"
                        min={4}
                        max={18}
                        placeholder="e.g. 7"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                      <select
                        value={childGender}
                        onChange={(e) => setChildGender(e.target.value as 'boy' | 'girl')}
                        className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                      >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Student Username or Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SamuelCoder or student@email.com"
                      value={studentIdentifier}
                      onChange={(e) => setStudentIdentifier(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assign 4-Digit PIN (Optional)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      placeholder="4 digits e.g. 1234"
                      value={childPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setChildPin(val);
                      }}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl py-2.5 px-3.5 text-base tracking-widest font-mono text-center focus:outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-500/20 transition-all font-bold"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Set a PIN so this student can also sign in easily without typing passwords.
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs cursor-pointer disabled:opacity-50 shadow-md shadow-pink-500/20 transition-all"
                >
                  {isLinking ? 'Saving...' : linkMode === 'create' ? 'Create Child Profile' : 'Link Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit PIN Modal */}
      {editingChild && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-purple-600" />
                Change 4-Digit PIN
              </h3>
              <button
                type="button"
                onClick={() => setEditingChild(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Update login PIN for <strong>{editingChild.first_name || editingChild.username}</strong>:
            </p>

            {editPinError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {editPinError}
              </div>
            )}

            <form onSubmit={handleUpdateChildPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  autoFocus
                  placeholder="Enter 4 digits"
                  value={editPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEditPin(val);
                  }}
                  required
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-2xl py-3 px-4 text-xl tracking-widest font-mono text-center focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all font-black"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingChild(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPin}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 shadow-md shadow-purple-500/20 transition-all"
                >
                  {isUpdatingPin ? 'Saving...' : 'Update PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paystack Family Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        childrenCount={children.length || 1}
        onSuccess={() => {
          setShowSubModal(false);
          fetchParentData();
        }}
      />
    </div>
  );
}
