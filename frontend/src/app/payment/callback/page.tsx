"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2, Sparkles,
  ArrowRight, ShieldCheck, RefreshCw, LayoutDashboard, Rocket
} from 'lucide-react';

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'failed' | 'no_ref'>('loading');
  const [statusMessage, setStatusMessage] = useState('Verifying your payment with Paystack...');
  const [planName, setPlanName] = useState<string>('Family Subscription');
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [alreadyProcessed, setAlreadyProcessed] = useState(false);

  useEffect(() => {
    if (!reference) {
      setVerificationState('no_ref');
      setStatusMessage('No payment reference was found in the callback URL.');
      return;
    }

    if (authLoading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setVerificationState('failed');
      setStatusMessage('Authentication session expired. Please log in to complete payment confirmation.');
      return;
    }

    let isMounted = true;

    async function verifyPayment() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${apiUrl}/api/subscription/verify?reference=${encodeURIComponent(reference)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json();

        if (!isMounted) return;

        if (res.ok && data.success) {
          setVerificationState('success');
          setStatusMessage(data.message || 'Payment successfully verified!');
          setPlanName(data.plan_name || 'Family Subscription');
          setPeriodEnd(data.current_period_end || null);
          setAlreadyProcessed(Boolean(data.already_processed));
        } else {
          setVerificationState('failed');
          const errMsg = data.error || data.message || 'Payment could not be verified by the gateway.';
          setStatusMessage(errMsg);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Payment verification error:', err);
        setVerificationState('failed');
        setStatusMessage('Network error communicating with payment verification server. Please check your dashboard or refresh.');
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [reference, authLoading]);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return null;
    try {
      return new Date(isoStr).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100 py-16 px-4 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border-4 border-white p-8 sm:p-12 relative overflow-hidden">
        
        {/* Background accent glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-pink-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* LOADING STATE */}
        {verificationState === 'loading' && (
          <div className="text-center py-8 space-y-6 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center shadow-inner">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
                Confirming Payment...
              </h2>
              <p className="text-slate-600 text-sm sm:text-base font-medium">
                {statusMessage}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 font-mono break-all">
              Reference: {reference}
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {verificationState === 'success' && (
          <div className="text-center py-4 space-y-6 relative z-10 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-emerald-600">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} className="text-emerald-500" />
                {alreadyProcessed ? 'Subscription Active' : 'Payment Confirmed!'}
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Welcome to DolaCode!
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base">
                Your family subscription has been successfully verified. All linked children have instant, unlimited access!
              </p>
            </div>

            {/* Plan Info Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-100 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-indigo-100/70 pb-3">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Plan Name</span>
                <span className="text-sm font-black text-indigo-900">{planName}</span>
              </div>
              {periodEnd && (
                <div className="flex justify-between items-center border-b border-indigo-100/70 pb-3">
                  <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Active Until</span>
                  <span className="text-sm font-bold text-slate-700">{formatDate(periodEnd)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Reference</span>
                <span className="text-xs font-mono font-medium text-slate-500">{reference}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/parent-dashboard"
                className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <LayoutDashboard size={18} />
                Parent Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Rocket size={18} />
                Student Portal
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              Verified securely via Paystack Payment Gateway
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {verificationState === 'failed' && (
          <div className="text-center py-4 space-y-6 relative z-10 animate-fadeIn">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center shadow-lg shadow-rose-500/20 text-rose-600">
              <XCircle className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle size={14} className="text-rose-500" />
                Payment Incomplete
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Payment Could Not Be Verified
              </h2>
              <p className="text-slate-600 font-medium text-sm sm:text-base leading-relaxed">
                {statusMessage}
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-800 font-medium space-y-1">
              <p className="font-bold">Did your transaction get interrupted?</p>
              <p className="text-amber-700 leading-relaxed">
                If money was deducted, our automated webhook listener will still verify your payment and activate your subscription shortly. You can also re-attempt checkout below.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/subscribe"
                className="flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <RefreshCw size={18} />
                Try Again
              </Link>
              <Link
                href="/parent-dashboard"
                className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* NO REFERENCE STATE */}
        {verificationState === 'no_ref' && (
          <div className="text-center py-6 space-y-6 relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">
                Invalid Payment Callback
              </h2>
              <p className="text-slate-600 font-medium text-sm">
                No transaction reference was detected. Please choose a subscription plan to begin checkout.
              </p>
            </div>
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all"
            >
              View Subscription Plans
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}
