'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Rocket, LogOut, Users, CreditCard, DollarSign,
  TrendingUp, ShieldAlert, CheckCircle2, AlertTriangle,
  Clock, XCircle, Search, Filter, Plus, Edit2, ToggleLeft,
  ToggleRight, RefreshCw, Eye, FileText, ChevronRight,
  ShieldCheck, AlertCircle, X, Sparkles, Award
} from 'lucide-react';

interface OverviewMetrics {
  total_registered_parents: number;
  total_registered_students: number;
  active_subscribers: number;
  inactive_subscribers: number;
  past_due_subscriptions: number;
  cancelled_subscriptions: number;
  expired_subscriptions: number;
  total_successful_payments: number;
  monthly_recurring_revenue: number;
  annual_subscription_revenue: number;
  new_subscribers_this_month: number;
}

interface SubscriberItem {
  id: number;
  parent_id: number;
  parent_name: string;
  parent_email: string;
  associated_children: string[];
  children_count: number;
  plan_name: string;
  billing_interval: string;
  subscription_amount: number;
  payment_status: string;
  subscription_start_date: string;
  next_payment_date: string | null;
  current_period_end: string | null;
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'inactive';
  is_manual_compensation: boolean;
  manual_compensation_reason: string;
  paystack_subscription_code: string | null;
}

interface PaymentItem {
  id: number;
  transaction_reference: string;
  parent_username: string;
  parent_email: string;
  amount: number;
  currency: string;
  payment_date: string;
  payment_method: string;
  paystack_reference: string;
  payment_status: string;
  plan_name: string;
}

interface PlanItem {
  id: number;
  plan_name: string;
  plan_description: string;
  amount: number;
  currency: string;
  billing_interval: string;
  billing_interval_display: string;
  paystack_plan_code: string | null;
  features: string[];
  is_active: boolean;
  is_promotional: boolean;
  promotional_price: number | null;
  promotional_headline: string;
  active_subscribers_count: number;
  created_at: string;
}

interface AuditLogItem {
  id: number;
  admin_username: string;
  admin_email: string;
  action: string;
  target_model: string;
  target_id: string;
  details: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'overview' | 'subscribers' | 'payments' | 'plans' | 'audit'>('overview');

  // Loading & error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [gracePeriodDays, setGracePeriodDays] = useState('3');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<{ expired_count: number; past_due_count: number; timestamp: string } | null>(null);

  // Filters & search
  const [subSearch, setSubSearch] = useState('');
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [pmtSearch, setPmtSearch] = useState('');
  const [pmtStatusFilter, setPmtStatusFilter] = useState('all');

  // Modals
  const [inspectSubscriber, setInspectSubscriber] = useState<SubscriberItem | null>(null);

  // Manual Compensation Modal
  const [compensateSub, setCompensateSub] = useState<SubscriberItem | null>(null);
  const [compReason, setCompReason] = useState('');
  const [compDays, setCompDays] = useState('30');
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);

  // Create / Edit Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [planForm, setPlanForm] = useState({
    plan_name: '',
    plan_description: '',
    amount: '',
    billing_interval: 'monthly',
    is_promotional: false,
    promotional_price: '',
    promotional_headline: ''
  });
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Fetch functions
  const fetchAllAdminData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError('');

    const headers = {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const [ovRes, subRes, pmtRes, plRes, auditRes, setRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/subscriptions/overview/`, { headers }),
        fetch(`${apiUrl}/api/admin/subscriptions/subscribers/?status=${subStatusFilter}&search=${encodeURIComponent(subSearch)}`, { headers }),
        fetch(`${apiUrl}/api/admin/subscriptions/payments/?status=${pmtStatusFilter}&search=${encodeURIComponent(pmtSearch)}`, { headers }),
        fetch(`${apiUrl}/api/admin/subscriptions/plans/`, { headers }),
        fetch(`${apiUrl}/api/admin/subscriptions/audit-logs/`, { headers }),
        fetch(`${apiUrl}/api/admin/subscriptions/settings/`, { headers })
      ]);

      if (ovRes.status === 403) {
        setError('Super Admin / Administrator privileges required to access this portal.');
        setLoading(false);
        return;
      }

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData.overview);
      }
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscribers(subData.subscribers || []);
      }
      if (pmtRes.ok) {
        const pmtData = await pmtRes.json();
        setPayments(pmtData.payments || []);
      }
      if (plRes.ok) {
        const plData = await plRes.json();
        setPlans(plData.plans || []);
      }
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.audit_logs || []);
      }
      if (setRes && setRes.ok) {
        const setData = await setRes.json();
        if (setData.grace_period_days !== undefined) {
          setGracePeriodDays(setData.grace_period_days.toString());
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed connecting to admin APIs.');
    } finally {
      setLoading(false);
    }
  }, [subStatusFilter, subSearch, pmtStatusFilter, pmtSearch, router]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_superuser && !user.is_staff && user.profile?.role !== 'super_admin' && user.role !== 'super_admin') {
        router.push('/dashboard');
      } else {
        fetchAllAdminData();
      }
    }
  }, [authLoading, user, fetchAllAdminData, router]);

  // Handler: Save Grace Period Setting
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setIsSavingSettings(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscriptions/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grace_period_days: parseInt(gracePeriodDays, 10) })
      });
      const resData = await res.json();
      if (res.ok) {
        setSuccessMsg(resData.message || 'Grace period setting updated successfully.');
        fetchAllAdminData();
      } else {
        alert(resData.error || 'Failed to update grace period setting.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handler: Trigger Scheduled Expiration Sweep
  const handleTriggerSweep = async () => {
    const token = localStorage.getItem('token');
    setIsSweeping(true);
    setSweepResult(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscriptions/process-renewals/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (res.ok && resData.result) {
        setSweepResult(resData.result);
        setSuccessMsg(`Expiration sweep executed. Expired transitioned: ${resData.result.expired_count}, Past-due marked: ${resData.result.past_due_count}. All child projects preserved.`);
        fetchAllAdminData();
      } else {
        alert('Failed to execute renewal sweep.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsSweeping(false);
    }
  };

  // Handler: Submit Manual Compensation
  const handleGrantManualCompensation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compensateSub) return;

    if (!compReason || compReason.trim().length < 10) {
      alert('A thorough justification reason (at least 10 characters) is required to document manual compensation.');
      return;
    }

    const token = localStorage.getItem('token');
    setIsSubmittingComp(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/subscriptions/${compensateSub.id}/manual-compensation/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          justification_reason: compReason.trim(),
          duration_days: parseInt(compDays, 10) || 30
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(resData.message);
        setCompensateSub(null);
        setCompReason('');
        fetchAllAdminData();
      } else {
        alert(resData.error || 'Failed to grant manual compensation.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsSubmittingComp(false);
    }
  };

  // Handler: Toggle Plan Active
  const handleTogglePlan = async (planId: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/subscriptions/plans/${planId}/toggle-status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        fetchAllAdminData();
      } else {
        alert('Failed to toggle plan status.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    }
  };

  // Handler: Open Plan Modal for Create or Edit
  const handleOpenPlanModal = (plan?: PlanItem) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        plan_name: plan.plan_name,
        plan_description: plan.plan_description,
        amount: plan.amount.toString(),
        billing_interval: plan.billing_interval,
        is_promotional: plan.is_promotional,
        promotional_price: plan.promotional_price ? plan.promotional_price.toString() : '',
        promotional_headline: plan.promotional_headline || ''
      });
    } else {
      setEditingPlan(null);
      setPlanForm({
        plan_name: '',
        plan_description: '',
        amount: '',
        billing_interval: 'monthly',
        is_promotional: false,
        promotional_price: '',
        promotional_headline: ''
      });
    }
    setShowPlanModal(true);
  };

  // Handler: Save Plan (Create or Update)
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    setIsSavingPlan(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const url = editingPlan 
      ? `${apiUrl}/api/admin/subscriptions/plans/${editingPlan.id}/` 
      : `${apiUrl}/api/admin/subscriptions/plans/`;
    const method = editingPlan ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_name: planForm.plan_name,
          plan_description: planForm.plan_description,
          amount: parseFloat(planForm.amount),
          billing_interval: planForm.billing_interval,
          is_promotional: planForm.is_promotional,
          promotional_price: planForm.promotional_price ? parseFloat(planForm.promotional_price) : null,
          promotional_headline: planForm.promotional_headline
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMsg(resData.message);
        setShowPlanModal(false);
        fetchAllAdminData();
      } else {
        alert(resData.error || 'Failed to save plan.');
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen bg-[#0b1120] text-white flex items-center justify-center">
        <RefreshCw className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans pb-24">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Rocket className="text-purple-400" size={24} />
              <span className="font-black text-xl tracking-tight text-white">
                Dola<span className="text-pink-500">Code</span>
              </span>
            </Link>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllAdminData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-colors"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Title & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Subscriptions & Payments</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Live Paystack Mode
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Platform revenue metrics, multi-tier family subscriber roster, live payment transactions, and pricing governance.
            </p>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'subscribers' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Subscribers ({overview?.active_subscribers ?? subscribers.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'payments' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Payments ({overview?.total_successful_payments ?? payments.length})
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'plans' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plan Management
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'audit' 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Trail
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
            <ShieldAlert size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW & REVENUE METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Top Revenue Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 shadow-xl">
                <div className="flex items-center justify-between text-indigo-400 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider">Monthly Recurring Revenue</span>
                  <DollarSign size={20} />
                </div>
                <div className="text-3xl font-black text-white">
                  ₦{(overview?.monthly_recurring_revenue || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  Normalized active recurring run rate
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/20 shadow-xl">
                <div className="flex items-center justify-between text-purple-400 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider">Annual Run Rate (ARR)</span>
                  <TrendingUp size={20} />
                </div>
                <div className="text-3xl font-black text-white">
                  ₦{(overview?.annual_subscription_revenue || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  Annualized projected revenue
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 shadow-xl">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider">Active Subscribers</span>
                  <CheckCircle2 size={20} />
                </div>
                <div className="text-3xl font-black text-white">
                  {overview?.active_subscribers || 0}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-2 font-medium">
                  +{overview?.new_subscribers_this_month || 0} new this month
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-900/40 to-slate-900 border border-pink-500/20 shadow-xl">
                <div className="flex items-center justify-between text-pink-400 mb-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider">Successful Payments</span>
                  <CreditCard size={20} />
                </div>
                <div className="text-3xl font-black text-white">
                  {overview?.total_successful_payments || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-medium">
                  Processed via Paystack gateway
                </div>
              </div>
            </div>

            {/* Subscriber Status Breakdown Grid */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
              <h3 className="text-lg font-black text-white">Platform User & Subscription Breakdown</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Parents</div>
                  <div className="text-2xl font-black text-white mt-1">{overview?.total_registered_parents || 0}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Family Accounts</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Students</div>
                  <div className="text-2xl font-black text-white mt-1">{overview?.total_registered_students || 0}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Registered Learners</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-center">
                  <div className="text-xs font-bold text-amber-400 uppercase">Past Due</div>
                  <div className="text-2xl font-black text-amber-300 mt-1">{overview?.past_due_subscriptions || 0}</div>
                  <div className="text-[10px] text-amber-400/60 mt-0.5">In Grace Period</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-orange-500/20 text-center">
                  <div className="text-xs font-bold text-orange-400 uppercase">Cancelled</div>
                  <div className="text-2xl font-black text-orange-300 mt-1">{overview?.cancelled_subscriptions || 0}</div>
                  <div className="text-[10px] text-orange-400/60 mt-0.5">Retaining Period</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/20 text-center">
                  <div className="text-xs font-bold text-rose-400 uppercase">Expired</div>
                  <div className="text-2xl font-black text-rose-300 mt-1">{overview?.expired_subscriptions || 0}</div>
                  <div className="text-[10px] text-rose-400/60 mt-0.5">Requires Renewal</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase">Inactive</div>
                  <div className="text-2xl font-black text-slate-400 mt-1">{overview?.inactive_subscribers || 0}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Unsubscribed</div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: SUBSCRIBER MANAGEMENT */}
        {activeTab === 'subscribers' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search parent name, email, or child username..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={subStatusFilter}
                  onChange={(e) => setSubStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Subscription Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="past_due">Past Due Only</option>
                  <option value="cancelled">Cancelled Only</option>
                  <option value="expired">Expired Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3 px-3">Parent</th>
                    <th className="py-3 px-3">Children</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3">Next Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {subscribers.length > 0 ? (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">{sub.parent_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{sub.parent_email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {sub.associated_children.length > 0 ? (
                              sub.associated_children.map((ch, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                                  @{ch}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 text-[11px]">0 linked</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-bold text-white">{sub.plan_name}</span>
                          <div className="text-[10px] text-slate-400 uppercase">{sub.billing_interval}</div>
                        </td>

                        <td className="py-3.5 px-3 font-bold text-emerald-400">
                          ₦{sub.subscription_amount.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sub.payment_status === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : sub.payment_status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {sub.payment_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                          {sub.next_payment_date 
                            ? new Date(sub.next_payment_date).toLocaleDateString()
                            : (sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A')}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.subscription_status === 'active' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : sub.subscription_status === 'past_due'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : sub.subscription_status === 'cancelled'
                              ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {sub.subscription_status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setInspectSubscriber(sub)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Inspect Subscription Details"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setCompensateSub(sub);
                                setCompReason('');
                                setCompDays('30');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Grant Documented Manual Compensation"
                            >
                              Compensate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                        No subscribers found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: PAYMENT TRANSACTIONS */}
        {activeTab === 'payments' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search reference, parent, or Paystack ref..."
                  value={pmtSearch}
                  onChange={(e) => setPmtSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={pmtStatusFilter}
                  onChange={(e) => setPmtStatusFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="success">Success Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="failed">Failed Only</option>
                </select>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Reference</th>
                    <th className="py-3 px-3">Parent</th>
                    <th className="py-3 px-3">Plan</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3">Paystack ID</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(p.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-white">
                          {p.transaction_reference}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-white">@{p.parent_username}</div>
                          <div className="text-[10px] text-slate-400">{p.parent_email}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-300">
                          {p.plan_name}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-emerald-400">
                          ₦{p.amount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 uppercase text-[11px]">
                          {p.payment_method}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                          {p.paystack_reference}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            p.payment_status === 'success' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : p.payment_status === 'pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-semibold">
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 4: PLAN MANAGEMENT */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">Subscription Catalog & Pricing</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Configure advertised subscription plans, billing intervals, promotional rates, and Paystack plan codes.
                </p>
              </div>

              <button
                onClick={() => handleOpenPlanModal()}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>Create New Plan</span>
              </button>
            </div>

            {/* Price Change Protection Advisory Banner */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Price Lock Guarantee:</strong> Editing a plan's advertised price creates a new pricing code and will <strong>NOT</strong> silently change existing recurring subscribers' charges on Paystack. Existing parents remain on their locked subscription rates unless migrated.
              </div>
            </div>

            {/* Grace Period & Expiration Sweep Governance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleSaveSettings} className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <Clock size={16} />
                    <span>Configurable Renewal Grace Period</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Number of days child learners retain full access after a recurring renewal fails.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(e.target.value)}
                    className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                  >
                    <option value="1">1 Day</option>
                    <option value="2">2 Days</option>
                    <option value="3">3 Days (Default Launch Setting)</option>
                    <option value="5">5 Days</option>
                    <option value="7">7 Days (One Week)</option>
                    <option value="14">14 Days (Two Weeks)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingSettings ? 'Saving...' : 'Save Grace Period'}
                  </button>
                </div>
              </form>

              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <RefreshCw size={16} className={isSweeping ? 'animate-spin' : ''} />
                    <span>Automated Renewal & Expiration Sweep</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Scheduled job identifies subscriptions whose paid-through or grace periods have ended, preserving 100% of child projects and badges.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {sweepResult ? `Last sweep: ${sweepResult.expired_count} expired, ${sweepResult.past_due_count} in grace` : 'Runs automatically / on-demand'}
                  </span>
                  <button
                    onClick={handleTriggerSweep}
                    disabled={isSweeping}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={isSweeping ? 'animate-spin' : ''} />
                    <span>{isSweeping ? 'Sweeping...' : 'Run Sweep Now'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((pl) => (
                <div
                  key={pl.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between gap-6 ${
                    pl.is_active 
                      ? 'bg-slate-900/60 border-slate-800' 
                      : 'bg-slate-900/20 border-slate-800/40 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        pl.is_active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {pl.is_active ? 'Active in Catalog' : 'Deactivated'}
                      </span>
                      {pl.is_promotional && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          Promo Active
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xl font-black text-white">{pl.plan_name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-1">{pl.plan_description}</p>
                    </div>

                    <div className="pt-2">
                      <div className="text-2xl font-black text-purple-400">
                        ₦{pl.amount.toLocaleString()}
                        <span className="text-xs font-semibold text-slate-400 ml-1">
                          / {pl.billing_interval_display}
                        </span>
                      </div>
                      {pl.promotional_price && (
                        <div className="text-xs text-pink-400 font-bold mt-0.5">
                          Intro promo: ₦{pl.promotional_price.toLocaleString()} ({pl.promotional_headline})
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Paystack Code: {pl.paystack_plan_code || 'Pending Sync'}
                    </div>

                    <div className="text-xs text-slate-300 font-bold">
                      Active Subscribers: {pl.active_subscribers_count}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenPlanModal(pl)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit Price / Details</span>
                    </button>
                    <button
                      onClick={() => handleTogglePlan(pl.id)}
                      className={`px-3 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        pl.is_active 
                          ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                      }`}
                      title={pl.is_active ? 'Deactivate from Catalog' : 'Activate in Catalog'}
                    >
                      {pl.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white">Administrative Actions Audit Log</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Tamper-evident record of all manual compensations, plan edits, price changes, and cancellations.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Admin</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3">Details & Justification</th>
                    <th className="py-3 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium text-slate-300">
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-white">
                          @{log.admin_username}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {log.target_model} #{log.target_id}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-300 max-w-md">
                          <div className="font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            {JSON.stringify(log.details)}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {log.ip_address || 'Internal'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-semibold">
                        No administrative audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: Inspect Subscriber */}
      {inspectSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white">Subscriber Inspection</h3>
              <button onClick={() => setInspectSubscriber(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Parent Account</span>
                <div className="text-base font-bold text-white">{inspectSubscriber.parent_name}</div>
                <div className="text-slate-400 font-mono">{inspectSubscriber.parent_email}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Plan & Interval</span>
                  <div className="font-bold text-white mt-0.5">{inspectSubscriber.plan_name} ({inspectSubscriber.billing_interval})</div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Subscribed Amount</span>
                  <div className="font-bold text-emerald-400 mt-0.5">₦{inspectSubscriber.subscription_amount.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px]">Covered Children</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {inspectSubscriber.associated_children.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-800 text-purple-300 font-bold">
                      @{c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Paystack Sub Code</span>
                  <div className="font-mono text-slate-300 mt-0.5">{inspectSubscriber.paystack_subscription_code || 'None'}</div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-bold text-[10px]">Period End</span>
                  <div className="font-semibold text-slate-300 mt-0.5">{inspectSubscriber.current_period_end ? new Date(inspectSubscriber.current_period_end).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {inspectSubscriber.is_manual_compensation && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  <div className="font-bold">Manual Compensation Active</div>
                  <div className="text-[11px] mt-0.5">{inspectSubscriber.manual_compensation_reason}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setInspectSubscriber(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Documented Manual Compensation */}
      {compensateSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-purple-400">
                <ShieldCheck size={22} />
                <h3 className="text-lg font-black text-white">Manual Compensation Process</h3>
              </div>
              <button onClick={() => setCompensateSub(null)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <strong>Audit Policy:</strong> Marking accounts paid without gateway verification is strictly prohibited unless authorized under this documented process. Your admin identity, IP, and justification will be recorded permanently in the audit trail.
            </div>

            <form onSubmit={handleGrantManualCompensation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Target Account</label>
                <div className="p-2.5 rounded-xl bg-slate-800/80 text-white font-semibold">
                  {compensateSub.parent_name} ({compensateSub.parent_email})
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Extension Duration</label>
                <select
                  value={compDays}
                  onChange={(e) => setCompDays(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="14">14 Days (Two Weeks Trial)</option>
                  <option value="30">30 Days (Standard 1 Month Comp)</option>
                  <option value="90">90 Days (Termly Sponsorship)</option>
                  <option value="180">180 Days (Half Year Scholarship)</option>
                  <option value="365">365 Days (Full Year Scholarship)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">
                  Justification Reason (Min 10 characters) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="E.g., Approved STEM scholarship grant, technical refund resolution, or promotional partnership authorization..."
                  value={compReason}
                  onChange={(e) => setCompReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCompensateSub(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComp}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSubmittingComp ? 'Documenting...' : 'Authorize Comp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create / Edit Subscription Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white">
                {editingPlan ? 'Edit Plan Pricing & Details' : 'Create New Subscription Plan'}
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {editingPlan && (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
                Changing this advertised price will create a new Paystack plan tier and will <strong>not</strong> alter existing subscribers' ongoing charges.
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Quarterly Scholar"
                  value={planForm.plan_name}
                  onChange={(e) => setPlanForm({ ...planForm, plan_name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  placeholder="Short summary of learning benefits and features..."
                  value={planForm.plan_description}
                  onChange={(e) => setPlanForm({ ...planForm, plan_description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Price (NGN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="100"
                    required
                    placeholder="E.g., 3500"
                    value={planForm.amount}
                    onChange={(e) => setPlanForm({ ...planForm, amount: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Billing Interval</label>
                  <select
                    value={planForm.billing_interval}
                    onChange={(e) => setPlanForm({ ...planForm, billing_interval: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly (3 Months)</option>
                    <option value="biannual">Biannual (6 Months)</option>
                    <option value="annually">Annually (1 Year)</option>
                  </select>
                </div>
              </div>

              {/* Promotional Pricing Section */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_promo"
                    checked={planForm.is_promotional}
                    onChange={(e) => setPlanForm({ ...planForm, is_promotional: e.target.checked })}
                    className="rounded border-slate-700 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="is_promo" className="text-xs font-bold text-white cursor-pointer">
                    Enable Promotional Discount Rate
                  </label>
                </div>

                {planForm.is_promotional && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Promo Price (NGN)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="E.g., 2500"
                        value={planForm.promotional_price}
                        onChange={(e) => setPlanForm({ ...planForm, promotional_price: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold uppercase text-[10px] mb-1">Promo Badge</label>
                      <input
                        type="text"
                        placeholder="E.g., Back to School"
                        value={planForm.promotional_headline}
                        onChange={(e) => setPlanForm({ ...planForm, promotional_headline: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 disabled:opacity-50"
                >
                  {isSavingPlan ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
