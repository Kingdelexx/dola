"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, Sparkles, CreditCard, Rocket, Star, Crown, Zap, AlertCircle
} from 'lucide-react';

interface Plan {
  id: number;
  plan_name: string;
  plan_description: string;
  amount: number;
  currency: string;
  billing_interval: string;
  billing_interval_display: string;
}

const DEFAULT_PLANS: Plan[] = [
  {
    id: 1,
    plan_name: "Monthly Explorer",
    plan_description: "Full access to all 4 coding worlds, 6 interactive numeracy games, and Lizzy AI tutor for all linked children.",
    amount: 10000,
    currency: "NGN",
    billing_interval: "monthly",
    billing_interval_display: "Monthly"
  },
  {
    id: 3,
    plan_name: "Annual Champion (1 Year)",
    plan_description: "Best value for full-year coding mastery! Covers all coding stages, game studios, and weekly AI progress reports. Save ₦20,000 (2 months free).",
    amount: 100000,
    currency: "NGN",
    billing_interval: "annually",
    billing_interval_display: "Annually (1 Year)"
  }
];

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentEmail?: string;
  childrenCount?: number;
  initialPlanId?: number | null;
  onSuccess?: () => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  parentEmail,
  childrenCount = 1,
  initialPlanId,
  onSuccess
}: SubscriptionModalProps) {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(initialPlanId || 3);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage('');

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/payments/plans/`)
      .then(res => res.json())
      .then(data => {
        if (data.plans && data.plans.length > 0) {
          const validPlans = data.plans.filter((p: Plan) => p.billing_interval !== 'quarterly');
          if (validPlans.length > 0) {
            setPlans(validPlans);
            if (initialPlanId && validPlans.some((p: Plan) => p.id === initialPlanId)) {
              setSelectedPlanId(initialPlanId);
            } else if (!selectedPlanId) {
              const defaultPlan = validPlans.length > 1 ? validPlans[1] : validPlans[0];
              setSelectedPlanId(defaultPlan.id);
            }
          }
        }
      })
      .catch(err => {
        console.error("Error fetching plans, using defaults:", err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!selectedPlanId) {
      setErrorMessage("Please select a subscription plan.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setErrorMessage("Please log in to proceed with payment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const callbackUrl = `${window.location.origin}/payment/callback`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/subscription/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: selectedPlanId,
          callback_url: callbackUrl
        })
      });

      const data = await res.json();
      if (res.ok && data.authorization_url) {
        // Redirect parent to Paystack's secure checkout page
        window.location.href = data.authorization_url;
      } else {
        setErrorMessage(data.error || "Failed to initialize payment gateway. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage("Network error connecting to payment gateway.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-white overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 sm:p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Close modal"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider backdrop-blur-md mb-3">
            <Sparkles size={14} className="text-yellow-300" /> DolaCode Family Membership
          </div>

          <h2 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-sm">
            Unlock Unlimited Coding & Math Puzzles
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
            One simple subscription gives <span className="font-bold text-white underline decoration-yellow-400">all your linked children</span> unlimited access to all 4 worlds, 6 games, and our 24/7 AI tutor!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Benefits Bullet Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700 font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">✓</span>
              <span>All 4 Coding Worlds (Numeracy &rarr; Python)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">✓</span>
              <span>6 Standalone Interactive Math Games</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">✓</span>
              <span>Lizzy AI Friendly Coding Sidekick</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">✓</span>
              <span>Covers all {childrenCount} linked {childrenCount === 1 ? 'child' : 'children'} under your account</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Plan Selector */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider block mb-3">
              Select Your Billing Interval:
            </label>

            {loadingPlans ? (
              <div className="py-8 text-center text-slate-400 text-xs font-bold animate-pulse">
                Loading membership plans...
              </div>
            ) : (
              <div>
                <div className={`grid grid-cols-1 ${plans.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'} gap-3.5`}>
                  {plans.map((p) => {
                    const isSelected = selectedPlanId === p.id;
                    const isPopular = p.billing_interval === 'annually';

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`relative p-5 rounded-2xl border-3 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'border-indigo-600 bg-indigo-50/60 shadow-lg shadow-indigo-500/10 scale-102' 
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {isPopular && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                            Best Value (Save ₦20k)
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                              {p.plan_name.split('(')[0]}
                            </h4>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                              {isSelected && <Check size={10} className="text-white" />}
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 leading-normal mb-3">
                            {p.billing_interval_display}
                          </p>
                        </div>

                        <div>
                          <div className="text-lg font-black text-slate-900">
                            ₦{p.amount.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-indigo-600 font-bold">
                            {isPopular ? 'Full Year Family Access' : 'Monthly Family Access'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* School / Institutional Outreach Note */}
                <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-center text-xs text-slate-600 font-medium">
                  Are you a school administrator, educator, or lab manager?{" "}
                  <a 
                    href="/contact?subject=School%20Pricing%20Inquiry" 
                    className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Reach out for custom school pricing &rarr;
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Checkout CTA Button */}
          <div className="pt-2">
            <button
              onClick={handleCheckout}
              disabled={isSubmitting || loadingPlans}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Paystack...</span>
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  <span>Pay with Paystack (Card, Transfer, USSD)</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Secured by 256-bit encrypted Paystack payment processing</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
