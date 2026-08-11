"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  Scale, 
  AlertCircle, 
  Mail, 
  ArrowLeft, 
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('agreement');

  const sections = [
    { id: 'agreement', title: '1. Agreement to Terms', icon: FileText },
    { id: 'eligibility', title: '2. User Accounts & Eligibility', icon: UserCheck },
    { id: 'google-sso', title: '3. Google Sign-In & Authentication', icon: ShieldCheck, highlight: true },
    { id: 'acceptable-use', title: '4. Code of Conduct & Acceptable Use', icon: Scale },
    { id: 'intellectual-property', title: '5. Intellectual Property & Content', icon: BookOpen },
    { id: 'subscriptions', title: '6. Platform Access & Services', icon: Award },
    { id: 'liability', title: '7. Disclaimer & Limitation of Liability', icon: AlertCircle },
    { id: 'contact', title: '8. Legal Contact Information', icon: Mail },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-purple-400 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-12 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="DolaCode Logo" className="w-[80px] h-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-300"
            >
              <Printer size={14} /> Print Terms
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={14} /> Back to DolaCode
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Banner (Bright Theme) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-100/70 via-pink-50/50 to-slate-50 border-b border-purple-100 py-12 lg:py-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-purple-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Scale size={16} /> Legal Agreement & Platform Guidelines
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Application Terms of Service
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Welcome to DolaCode. These Terms of Service govern your use of our interactive STEM & coding educational platform.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <Clock size={14} className="text-purple-500" /> Effective Date: August 11, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <CheckCircle2 size={14} className="text-emerald-500" /> Binding Legal Terms
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 py-2">
                Terms Navigation
              </h2>
              <nav className="space-y-1">
                {sections.map((sec) => {
                  const IconComponent = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md' 
                          : sec.highlight 
                            ? 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? 'text-white' : sec.highlight ? 'text-purple-500' : 'text-slate-400'} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 mt-4 px-3 space-y-3">
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Legal inquiries or terms questions:
                  </p>
                  <a 
                    href="mailto:legal@dolacode.com"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                  >
                    <Mail size={12} /> Email Legal Desk
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Detail Sections */}
          <div className="lg:col-span-3 space-y-10 text-slate-700 leading-relaxed text-sm">

            {/* Terms Summary Highlight Box (Bright Theme) */}
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-300/80 rounded-3xl p-6 lg:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-600">
                  <Scale size={26} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-purple-700">
                    Agreement Overview
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Important Terms for Parents, Students & Schools
                  </h3>
                </div>
              </div>
              <p className="text-slate-700 font-medium">
                By accessing or registering an account on DolaCode, you represent that you have read, understood, and agreed to these Terms of Service. If you are under the age of 18, your parent or legal guardian must review and agree to these terms on your behalf.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Educational platform for all ages</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Google OAuth SSO supported</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Parent & Teacher dashboard accounts</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-purple-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Safe Python & Blockly sandbox execution</span>
                </li>
              </ul>
            </div>

            {/* Section 1: Agreement */}
            <section id="agreement" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <FileText className="text-purple-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">1. Agreement to Terms</h2>
              </div>
              <p>
                These Terms of Service constitute a legally binding agreement between you and <strong>Devnaija Academy</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of the <strong>DolaCode</strong> website, application modules, parent/teacher dashboards, and related services.
              </p>
              <p>
                If you do not agree with all of these terms, you are expressly prohibited from using the platform and must discontinue use immediately.
              </p>
            </section>

            {/* Section 2: Eligibility */}
            <section id="eligibility" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <UserCheck className="text-pink-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">2. Account Registration & Minor Consent</h2>
              </div>
              <p>
                DolaCode provides learning accounts for Students, Parents, Teachers, and School Administrators.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Minor Students (Under 18):</strong> Students under the age of 18 must use DolaCode under the supervision of a parent, legal guardian, or authorized school educator.</li>
                <li><strong>Parent & Teacher Accounts:</strong> Adults registering parent or teacher accounts warrant that they have legal authority to enroll student sub-accounts and monitor student coding progress.</li>
                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and login sessions.</li>
              </ul>
            </section>

            {/* Section 3: Google SSO */}
            <section id="google-sso" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <ShieldCheck className="text-amber-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">3. Google Sign-In & Single Sign-On</h2>
              </div>
              <p>
                DolaCode permits account sign-in via <strong>Google OAuth 2.0</strong>. By signing in using your Google account:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You authorize DolaCode to access your basic Google profile details (name, email address, profile photo, and unique Google ID) to create and authenticate your DolaCode user account.</li>
                <li>DolaCode does not request access to your Google Drive, Gmail messages, contacts, or sensitive Google cloud files.</li>
                <li>You can revoke DolaCode&apos;s OAuth access at any time through your Google Security Account settings.</li>
              </ul>
            </section>

            {/* Section 4: Acceptable Use */}
            <section id="acceptable-use" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Scale className="text-sky-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">4. Code of Conduct & Acceptable Use</h2>
              </div>
              <p>
                You agree not to engage in any prohibited activities on DolaCode, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attempting to bypass browser sandboxes, execute malicious code, or compromise server security.</li>
                <li>Using automated bots, web scrapers, or scripts to flood DolaCode servers.</li>
                <li>Impersonating another student, parent, or school educator.</li>
                <li>Uploading objectionable, abusive, or harmful content into project files or AI prompts.</li>
              </ul>
            </section>

            {/* Section 5: Intellectual Property */}
            <section id="intellectual-property" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <BookOpen className="text-indigo-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">5. Intellectual Property Rights</h2>
              </div>
              <p>
                All curriculum materials, stage designs, graphics, branding, software code, and lesson content on DolaCode are owned by <strong>Devnaija Academy</strong>.
              </p>
              <p>
                <strong>Student Content:</strong> Students retain ownership of the original code, Blockly project scripts, and game creations they author on DolaCode.
              </p>
            </section>

            {/* Section 6: Subscriptions & Platform Access */}
            <section id="subscriptions" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Award className="text-emerald-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">6. Platform Availability & Subscriptions</h2>
              </div>
              <p>
                We strive to maintain continuous platform availability. However, we reserve the right to perform scheduled maintenance, update coding modules, or modify platform features to improve learning outcomes.
              </p>
            </section>

            {/* Section 7: Disclaimer & Limitation of Liability */}
            <section id="liability" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <AlertCircle className="text-rose-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">7. Limitation of Liability</h2>
              </div>
              <p>
                To the fullest extent permitted by law, DolaCode and Devnaija Academy shall not be liable for indirect, incidental, or consequential damages resulting from platform downtime or data loss beyond our reasonable control.
              </p>
            </section>

            {/* Section 8: Legal Contact */}
            <section id="contact" className="bg-gradient-to-br from-slate-100 to-purple-50 rounded-2xl border border-purple-200 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-purple-200 pb-4">
                <Mail className="text-purple-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">8. Legal Contact Information</h2>
              </div>
              <p>
                If you have questions regarding these Terms of Service, please contact our legal desk:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600">Legal Contact Email</h4>
                  <p className="text-sm font-bold text-slate-800">legal@dolacode.com</p>
                  <p className="text-xs text-slate-500">hello@dolacode.com</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-pink-600">Operating Entity</h4>
                  <p className="text-sm font-bold text-slate-800">Devnaija Academy</p>
                  <p className="text-xs text-slate-500">DolaCode Legal Department</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer (Bright Theme) */}
      <footer className="border-t border-slate-200 bg-white py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 DolaCode Platform (Devnaija Academy). All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-slate-800 transition-colors">About Us</Link>
            <Link href="/terms" className="text-purple-600 font-bold">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="/child-safety" className="hover:text-slate-800 transition-colors">Child Safety</Link>
            <Link href="/contact" className="hover:text-slate-800 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
