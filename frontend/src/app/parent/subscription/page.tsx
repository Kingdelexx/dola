'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  CreditCard, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle,
  Clock, RefreshCw, Calendar, Download, Sparkles, AlertCircle,
  ExternalLink, ChevronRight, X, User, Heart, Award, Star, Flame
} from 'lucide-react';

interface CoveredChild {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  age: number | null;
  points: number;
  current_streak: number;
  stage1_progress: number;
  stage2_progress: number;
  stage3_progress: number;
  stage4_progress: number;
  badges_count: number;
}

interface PaymentRecord {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  channel: string;
  paystack_transaction_id: string | null;
  date: string;
  has_receipt: boolean;
}

interface AvailablePlan {
  id: number;
  plan_name: string;
  plan_description: string;
  amount: number;
  currency: string;
  billing_interval: string;
  billing_interval_display: string;
  is_promotional: boolean;
  promotional_price: number | null;
  promotional_headline: string;
  features: string[];
}

interface SubscriptionData {
  id: number;
  plan_id: number | null;
  plan_name: string;
  plan_description: string;
  billing_interval: string;
  billing_interval_display: string;
  amount_paid: number;
  currency: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive';
  subscription_start_date: string;
  current_period_start: string | null;
  current_period_end: string | null;
  next_payment_date: string | null;
  cancellation_date: string | null;
  grace_period_end: string | null;
  is_valid: boolean;
  is_manual_compensation: boolean;
  features: string[];
  has_paystack_subscription: boolean;
}

interface ApiResponse {
  has_subscription: boolean;
  subscription: SubscriptionData | null;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive';
  children: CoveredChild[];
  payments: PaymentRecord[];
  available_plans: AvailablePlan[];
  can_cancel: boolean;
  can_update_payment_method: boolean;
  can_renew: boolean;
}

interface ReceiptData {
  receipt_number: string;
  reference: string;
  paystack_transaction_id: string;
  date: string;
  parent_name: string;
  parent_email: string;
  plan_name: string;
  billing_interval: string;
  amount: number;
  currency: string;
  payment_channel: string;
  payment_status: string;
  covered_children: string[];
  issuer: {
    name: string;
    website: string;
    support_email: string;
    country: string;
  };
}

export default function ParentSubscriptionPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelResult, setCancelResult] = useState<{ message: string; access_until?: string } | null>(null);

  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<AvailablePlan | null>(null);
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [updateCardNotice, setUpdateCardNotice] = useState<{ message: string; url?: string } | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);

  const fetchSubscriptionDetails = useCallback(async () => {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (!authToken) {
      router.push('/login?redirect=/parent/subscription');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/subscription/detail/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else if (res.status === 403) {
        setError('Only parent accounts can manage family subscriptions.');
      } else {
        setError('Failed to load subscription details.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching subscription.');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/parent/subscription');
      } else {
        fetchSubscriptionDetails();
      }
    }
  }, [authLoading, user, fetchSubscriptionDetails, router]);

  // Handler: Cancel Subscription
  const handleConfirmCancel = async () => {
    const authToken = token || localStorage.getItem('token');
    setIsCancelling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/subscription/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setCancelResult({
          message: resData.message,
          access_until: resData.access_until
        });
        fetchSubscriptionDetails();
      } else {
        alert(resData.error || 'Failed to cancel subscription.');
      }
    } catch (err: any) {
      alert(err.message || 'Error communicating with server.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handler: Update Payment Method (Paystack Card)
  const handleUpdatePaymentMethod = async () => {
    const authToken = token || localStorage.getItem('token');
    setIsUpdatingCard(true);
    setUpdateCardNotice(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/subscription/update-payment-method/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        if (resData.type === 'link' && resData.management_url) {
          window.open(resData.management_url, '_blank');
          setUpdateCardNotice({
            message: 'Paystack card management window opened. Once you update your details, your next renewal will use your new card.',
            url: resData.management_url
          });
        } else {
          setUpdateCardNotice({
            message: resData.message || 'Payment method update link dispatched to your email.'
          });
        }
      } else {
        alert(resData.error || 'Unable to update payment method at this time.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsUpdatingCard(false);
    }
  };

  // Handler: View Receipt
  const handleViewReceipt = async (reference: string) => {
    const authToken = token || localStorage.getItem('token');
    setLoadingReceipt(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/parent/payments/${reference}/receipt/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedReceipt(json.receipt);
      } else {
        alert('Receipt could not be generated for this transaction.');
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching receipt.');
    } finally {
      setLoadingReceipt(false);
    }
  };

  // Handler: Initiate Change Plan or Renewal Checkout
  const handleSelectPlanToSubscribe = async (plan: AvailablePlan) => {
    const authToken = token || localStorage.getItem('token');
    setIsChangingPlan(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/initialize/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: plan.id,
          callback_url: `${window.location.origin}/payment/callback?source=parent_subscription`
        })
      });

      const resData = await res.json();
      if (res.ok && resData.authorization_url) {
        window.location.href = resData.authorization_url;
      } else {
        alert(resData.error || 'Failed to initialize plan checkout.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsChangingPlan(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center animate-spin">
            <RefreshCw size={28} />
          </div>
          <p className="font-extrabold text-slate-800 text-lg">Loading Subscription Details...</p>
        </div>
      </div>
    );
  }

  const sub = data?.subscription;
  const currentStatus = data?.status || 'inactive';

  // Status Styling & Badges
  const statusConfig = {
    active: {
      label: 'Active Membership',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      heroBg: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      desc: 'All coding stages and numeracy adventures are currently unlocked for your children.'
    },
    past_due: {
      label: 'Payment Past Due',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      heroBg: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      desc: "Your DolaCode subscription could not be renewed. Your child's learning progress and saved projects are safe. Please update your payment details to continue learning."
    },
    cancelled: {
      label: 'Cancelled (Access Retained)',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      heroBg: 'bg-gradient-to-r from-slate-700 to-slate-800 text-white',
      desc: sub?.current_period_end 
        ? `Membership is cancelled, but your children maintain full unlocked access through ${new Date(sub.current_period_end).toLocaleDateString()}.`
        : 'Your subscription is cancelled.'
    },
    expired: {
      label: 'Membership Expired',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
      heroBg: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white',
      desc: 'Your membership period has ended. Renew now to restore full access to all stages.'
    },
    inactive: {
      label: 'No Active Subscription',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: <CreditCard className="w-5 h-5 text-slate-600" />,
      heroBg: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
      desc: 'Unlock all 4 coding stages, numeracy games, and personalized AI tutoring for your family.'
    }
  }[currentStatus] || {
    label: currentStatus.toUpperCase(),
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: <CreditCard className="w-5 h-5 text-slate-600" />,
    heroBg: 'bg-indigo-600 text-white',
    desc: ''
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-900">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/parent-dashboard"
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors flex items-center gap-2 font-bold text-sm"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Back to Parent Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-indigo-600">Dola<span className="text-pink-500">Code</span></span>
            </Link>
            <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Family Billing
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="font-semibold text-sm">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="font-semibold text-sm">{successMsg}</p>
          </div>
        )}

        {/* Update Card Notice */}
        {updateCardNotice && (
          <div className="p-5 rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-black text-indigo-950 text-sm">Paystack Card Update Portal</h4>
                <p className="text-xs text-indigo-800 font-medium mt-0.5">{updateCardNotice.message}</p>
              </div>
            </div>
            {updateCardNotice.url && (
              <a
                href={updateCardNotice.url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md hover:bg-indigo-700 transition-all shrink-0"
              >
                <span>Open Paystack Portal</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}

        {/* Past Due Notification Banner */}
        {currentStatus === 'past_due' && (
          <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle size={22} />
              </div>
              <div>
                <h4 className="font-black text-base text-amber-950">
                  Your DolaCode subscription could not be renewed.
                </h4>
                <p className="text-xs text-amber-900 font-medium mt-0.5">
                  Your child's learning progress and saved projects are safe. Please update your payment details to continue learning.
                </p>
                {sub?.grace_period_end && (
                  <div className="text-[11px] font-bold text-amber-800 mt-1 flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-600" />
                    <span>Grace period active until {new Date(sub.grace_period_end).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUpdatePaymentMethod}
              disabled={isUpdatingCard}
              className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <CreditCard size={15} />
              <span>UPDATE PAYMENT</span>
            </button>
          </div>
        )}

        {/* HERO: Subscription Overview Card */}
        <section className={`p-8 rounded-3xl ${statusConfig.heroBg} shadow-xl relative overflow-hidden transition-all`}>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                {sub?.is_manual_compensation && (
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-300">
                    Sponsored / Compensated Access
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  {sub?.plan_name || 'Family Subscription'}
                </h1>
                <p className="text-white/80 font-medium text-sm sm:text-base mt-2">
                  {statusConfig.desc}
                </p>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20">
                <div>
                  <div className="text-xs uppercase font-extrabold text-white/70">Amount Paid</div>
                  <div className="text-xl sm:text-2xl font-black mt-0.5">
                    ₦{(sub?.amount_paid || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-white/60 font-semibold">{sub?.billing_interval_display || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs uppercase font-extrabold text-white/70">Start Date</div>
                  <div className="text-sm sm:text-base font-black mt-1">
                    {sub?.subscription_start_date 
                      ? new Date(sub.subscription_start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase font-extrabold text-white/70">
                    {currentStatus === 'cancelled' ? 'Access Paid Until' : 'Next Payment Date'}
                  </div>
                  <div className="text-sm sm:text-base font-black mt-1">
                    {sub?.next_payment_date 
                      ? new Date(sub.next_payment_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                      : (sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A')}
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase font-extrabold text-white/70">Covered Children</div>
                  <div className="text-xl sm:text-2xl font-black mt-0.5">
                    {data?.children.length || 0}
                  </div>
                  <div className="text-[11px] text-white/60 font-semibold">100% Unlocked</div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              {data?.can_renew && (
                <button
                  onClick={() => setShowChangePlanModal(true)}
                  className="px-6 py-3.5 rounded-2xl bg-white text-indigo-700 hover:bg-slate-100 font-black text-sm shadow-lg shadow-black/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span>{currentStatus === 'inactive' ? 'Unlock DolaCode' : 'Renew Membership'}</span>
                </button>
              )}

              {data?.can_cancel && (
                <button
                  onClick={() => setShowChangePlanModal(true)}
                  className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Switch / Upgrade Plan</span>
                </button>
              )}

              {data?.can_update_payment_method && (
                <button
                  onClick={handleUpdatePaymentMethod}
                  disabled={isUpdatingCard}
                  className="px-6 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs backdrop-blur-md transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard size={14} />
                  <span>{isUpdatingCard ? 'Contacting Paystack...' : 'Update Payment Method'}</span>
                </button>
              )}

              {data?.can_cancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-2.5 rounded-2xl text-white/80 hover:text-white hover:bg-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Cancel Subscription</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* SECTION: Covered Children Roster */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>Children Covered by Subscription</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {data?.children.length || 0} Registered
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Your family membership covers all children linked to your parent account at no additional charge.
              </p>
            </div>
            <Link
              href="/parent-dashboard"
              className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Manage Child Profiles</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {data?.children && data.children.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.children.map((child) => (
                <div
                  key={child.id}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-pink-500/20">
                      🎓
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                        {child.first_name || child.username}
                      </h4>
                      <div className="text-xs text-slate-500 font-medium">
                        @{child.username} {child.age ? `• Age ${child.age}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 text-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">XP</div>
                      <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <span>{child.points}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Streak</div>
                      <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Flame size={11} className="text-orange-500 fill-orange-500" />
                        <span>{child.current_streak}d</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Badges</div>
                      <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                        <Award size={11} className="text-purple-600" />
                        <span>{child.badges_count}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 py-1 font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-600" />
                    <span>Unlocked for All 4 Stages</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-600">No children currently linked to this parent account.</p>
              <Link
                href="/parent-dashboard"
                className="inline-block mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700"
              >
                Add Your Child
              </Link>
            </div>
          )}
        </section>

        {/* SECTION: Payment History & Receipts */}
        <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Payment History & Receipts</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              View official transaction records processed securely by Paystack. Download printable receipts anytime.
            </p>
          </div>

          {data?.payments && data.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {data.payments.map((pmt) => (
                    <tr key={pmt.reference} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {new Date(pmt.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                        {pmt.reference}
                      </td>
                      <td className="py-3.5 px-3 font-black text-slate-900">
                        ₦{pmt.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 capitalize">
                        {pmt.channel || 'Card'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          pmt.status === 'success' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : pmt.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {pmt.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {pmt.has_receipt ? (
                          <button
                            onClick={() => handleViewReceipt(pmt.reference)}
                            disabled={loadingReceipt}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Download size={13} />
                            <span>View Receipt</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-sm font-bold text-slate-600">No payment records found yet.</p>
            </div>
          )}
        </section>

      </main>

      {/* MODAL 1: Cancellation Confirmation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={30} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-slate-900">Cancel Family Subscription?</h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                We are sorry to see you go! Here is what happens when you cancel:
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs text-amber-900 font-medium">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Full Access Retained:</strong> Your children continue to have unlocked access to all coding stages until <strong>{sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'the end of your billing cycle'}</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>100% Work Preserved:</strong> All saved Python projects, mobile apps, Blockly games, XP, badges, and learning history will remain safely stored forever.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>No Surprise Charges:</strong> Paystack automatic recurring billing will be disabled immediately.
                </span>
              </div>
            </div>

            {cancelResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold text-center">
                  {cancelResult.message}
                </div>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelResult(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Keep Subscription
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Change / Renew Plan Selection */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Select Subscription Plan</h3>
                <p className="text-xs text-slate-500 font-medium">Choose the ideal billing interval for your family.</p>
              </div>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {data?.available_plans.map((pl) => {
                const isCurrent = sub?.plan_id === pl.id;
                return (
                  <div
                    key={pl.id}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isCurrent 
                        ? 'border-indigo-600 bg-indigo-50/40' 
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-base">{pl.plan_name}</h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-600 text-white">
                            Current Plan
                          </span>
                        )}
                        {pl.is_promotional && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-100 text-pink-700">
                            Promo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{pl.plan_description}</p>
                      <div className="text-lg font-black text-indigo-700 pt-1">
                        ₦{pl.amount.toLocaleString()}{' '}
                        <span className="text-xs font-semibold text-slate-500">
                          / {pl.billing_interval_display}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectPlanToSubscribe(pl)}
                      disabled={isChangingPlan}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isChangingPlan ? 'Redirecting...' : (isCurrent ? 'Renew Current Plan' : 'Switch to This Plan')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Official Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl border border-slate-100 relative print:shadow-none print:border-none print:w-full">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 print:hidden cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <div>
                <span className="font-black text-2xl tracking-tight text-indigo-600">Dola<span className="text-pink-500">Code</span></span>
                <p className="text-xs text-slate-500 font-semibold">{selectedReceipt.issuer.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{selectedReceipt.issuer.support_email}</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PAID IN FULL
                </span>
                <div className="text-xs font-mono font-bold text-slate-700 mt-2">{selectedReceipt.receipt_number}</div>
                <div className="text-[11px] text-slate-400">{new Date(selectedReceipt.date).toLocaleString()}</div>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">Billed To</div>
                <div className="font-black text-slate-900 text-sm mt-0.5">{selectedReceipt.parent_name}</div>
                <div className="text-slate-500 font-mono text-[11px]">{selectedReceipt.parent_email}</div>
              </div>
              <div>
                <div className="font-bold text-slate-400 uppercase text-[10px]">Payment Details</div>
                <div className="font-semibold text-slate-800 mt-0.5">Method: {selectedReceipt.payment_channel.toUpperCase()}</div>
                <div className="text-slate-500 font-mono text-[11px]">Tx Ref: {selectedReceipt.reference}</div>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase font-black text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Item Description</th>
                    <th className="py-2.5 px-4">Billing Interval</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {selectedReceipt.plan_name}
                      <div className="text-[11px] font-normal text-slate-500">
                        Covered: {selectedReceipt.covered_children.join(', ') || 'Registered Family Account'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{selectedReceipt.billing_interval}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">₦{selectedReceipt.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-black">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-slate-900">Total Paid (NGN)</td>
                    <td className="py-3 px-4 text-right text-indigo-700 text-base">₦{selectedReceipt.amount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Print CTA */}
            <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Download size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
