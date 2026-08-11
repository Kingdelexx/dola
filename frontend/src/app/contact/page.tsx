"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  HelpCircle,
  User,
  Building,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  Headphones
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Parent',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const faqs = [
    {
      question: "How do I get DolaCode for my school or academy?",
      answer: "We offer tailored school onboarding packages with teacher training and student management dashboards. Contact us at support@devnaija.com or call 09152690938 to speak with our school success team."
    },
    {
      question: "What are your support hours?",
      answer: "Our support team is active Monday through Saturday from 8:00 AM to 6:00 PM (WAT). Urgent child safety or technical inquiries submitted via email receive priority response within 24 hours."
    },
    {
      question: "Can parents track child progress on DolaCode?",
      answer: "Yes! Parents receive real-time progress reports, activity history, and milestone certificates via the Parent Dashboard."
    },
    {
      question: "Is DolaCode safe and child-friendly?",
      answer: "Absolutely. DolaCode strictly complies with international child safety standards. We maintain zero public ads, strict privacy protection, and moderated learning environments."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-400 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-12 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={14} /> Back to DolaCode
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/70 via-indigo-50/50 to-slate-50 border-b border-sky-100 py-16 lg:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Sparkles size={16} /> We're Here to Help
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Contact <span className="text-sky-500">DolaCode</span> Support
          </h1>
          <p className="text-lg sm:text-xl font-bold text-indigo-900 max-w-2xl mx-auto leading-relaxed">
            Have a question, feedback, or need help with school onboarding? Our dedicated team is just a message away.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-16">

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Office Address Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-md hover:shadow-lg transition-all space-y-4 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Office Location</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Visit our physical headquarters</p>
              </div>
              <div className="pt-1">
                <p className="text-sm font-bold text-slate-800 leading-snug">
                  No. 18 Joseph Street, Opebi, Ikeja, Lagos
                </p>
              </div>
            </div>
            <div className="pt-3">
              <a 
                href="https://maps.google.com/?q=No.+18+Joseph+Street,+Opebi,+Ikeja,+Lagos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <MapPin size={12} /> View on Map
              </a>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-sky-100 shadow-md hover:shadow-lg transition-all space-y-4 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Phone & WhatsApp</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Speak directly with our team</p>
              </div>
              <div className="pt-1">
                <p className="text-lg font-black text-sky-600">09152690938</p>
              </div>
            </div>
            <div className="pt-3 flex flex-wrap gap-2">
              <a 
                href="tel:09152690938"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                <Phone size={12} /> Call
              </a>
              <a 
                href="https://wa.me/2349152690938" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare size={12} /> WhatsApp
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-md hover:shadow-lg transition-all space-y-4 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Email Support</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Send us an email anytime</p>
              </div>
              <div className="pt-1">
                <p className="text-sm font-black text-purple-600 break-all">support@devnaija.com</p>
              </div>
            </div>
            <div className="pt-3">
              <a 
                href="mailto:support@devnaija.com"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
              >
                <Mail size={12} /> Send Email
              </a>
            </div>
          </div>

          {/* Academy Info Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all space-y-4 group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Devnaija Academy</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">Powering DolaCode Platform</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 font-medium pt-1">
                <p className="flex items-center gap-1.5"><Clock size={13} className="text-indigo-500 flex-shrink-0" /> Mon - Sat: 8:00 AM - 4:00 PM</p>
                <p className="flex items-center gap-1.5"><Globe size={13} className="text-indigo-500 flex-shrink-0" /> devnaija.com</p>
                <p className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-indigo-500 flex-shrink-0" /> Registered EdTech</p>
              </div>
            </div>
          </div>

        </div>

        {/* Contact Form Section */}
        <section className="bg-white rounded-3xl p-8 lg:p-12 border-2 border-slate-200/90 shadow-md">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <span className="bg-indigo-50 text-indigo-700 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-200">
                Send a Direct Message
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">How can we assist you?</h2>
              <p className="text-slate-600 text-sm font-medium">Fill out the form below and our team will get back to you promptly.</p>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-emerald-900">Message Received!</h3>
                <p className="text-emerald-800 text-sm max-w-md mx-auto font-medium">
                  Thank you for reaching out to DolaCode. We have received your inquiry and will respond to <span className="font-bold">{formData.email}</span> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', role: 'Parent', subject: '', message: '' });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} className="text-sky-500" /> Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Johnson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-slate-800 font-medium transition-all text-sm"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={14} className="text-sky-500" /> Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. sarah@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-slate-800 font-medium transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Role Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Headphones size={14} className="text-indigo-500" /> I am a...
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-800 font-medium transition-all text-sm bg-white"
                    >
                      <option value="Parent">Parent / Guardian</option>
                      <option value="Teacher">Teacher / Educator</option>
                      <option value="School Owner">School Owner / Admin</option>
                      <option value="Student">Student / Learner</option>
                      <option value="Other">Other Inquiry</option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-indigo-500" /> Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. School Onboarding Inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-800 font-medium transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-purple-500" /> Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-slate-800 font-medium transition-all text-sm resize-y"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-black bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gradient-to-br from-indigo-50/60 via-sky-50/40 to-purple-50/60 rounded-3xl p-8 lg:p-12 border-2 border-indigo-200/80 shadow-md space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="bg-purple-100 text-purple-800 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-purple-300">
              Got Questions?
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm font-medium">Quick answers to common questions about DolaCode platform.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-bold text-slate-800 hover:text-indigo-600 transition-colors gap-4"
                >
                  <span className="text-base font-extrabold">{faq.question}</span>
                  {openFaqIndex === idx ? <ChevronUp size={18} className="text-indigo-600 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 font-medium">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer (Bright Theme) */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 DolaCode Platform (Devnaija Academy). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-slate-800 transition-colors">About Us</Link>
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="/child-safety" className="hover:text-slate-800 transition-colors">Child Safety</Link>
            <Link href="/contact" className="text-indigo-600 font-bold">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
