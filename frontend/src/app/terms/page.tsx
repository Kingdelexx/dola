"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  Scale, 
  Clock, 
  ArrowLeft, 
  Printer, 
  Mail, 
  Rocket,
  AlertCircle,
  CreditCard,
  Gavel,
  ShieldCheck
} from 'lucide-react';

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms', icon: CheckCircle2 },
    { id: 'accounts', title: '2. Accounts & Parent Consent', icon: UserCheck },
    { id: 'google-sso', title: '3. Google OAuth & Authentication', icon: ShieldCheck },
    { id: 'use-conduct', title: '4. Platform Usage & Rules', icon: ShieldAlert },
    { id: 'intellectual-property', title: '5. Intellectual Property', icon: Scale },
    { id: 'billing', title: '6. Subscriptions & Payments', icon: CreditCard },
    { id: 'disclaimer', title: '7. Limitation of Liability', icon: AlertCircle },
    { id: 'governing-law', title: '8. Governing Law & Termination', icon: Gavel },
    { id: 'contact', title: '9. Contact Information', icon: Mail },
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Rocket className="text-white" size={22} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                DolaCode
              </span>
              <span className="text-xs text-slate-400 font-medium">Devnaija Academy</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <Printer size={14} /> Print Terms
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={14} /> Back to DolaCode
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-b border-slate-800 py-12 lg:py-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
            <FileText size={16} /> Legal Terms & Conditions
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">
            Application Terms of Service
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Please read these terms carefully before using DolaCode, our learning stages, parent/teacher dashboards, or signing in with Google.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock size={14} className="text-purple-400" /> Effective Date: August 9, 2026
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Table of Contents Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700/80 p-4 space-y-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 px-3 py-2">
                Quick Navigation
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
                          ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-700/60 mt-4 px-3 space-y-3">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Have questions about our Terms of Service?
                  </p>
                  <a 
                    href="mailto:legal@dolacode.com"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
                  >
                    <Mail size={12} /> Contact Legal Team
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Detail Sections */}
          <div className="lg:col-span-3 space-y-10 text-slate-300 leading-relaxed text-sm">

            {/* Section 1 */}
            <section id="acceptance" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <CheckCircle2 className="text-purple-400" size={24} />
                <h2 className="text-2xl font-black text-white">1. Acceptance of Terms</h2>
              </div>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you and <strong>Devnaija Academy</strong> (&ldquo;DolaCode&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of the DolaCode platform, website, interactive learning stages, code editors, and mobile/web applications.
              </p>
              <p>
                By creating an account, logging in, or accessing DolaCode, you confirm that you have read, understood, and agreed to these Terms and our <Link href="/privacy" className="text-pink-400 font-bold underline">Privacy Policy</Link>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="accounts" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <UserCheck className="text-pink-400" size={24} />
                <h2 className="text-2xl font-black text-white">2. User Accounts & Parental Authorization</h2>
              </div>
              <p>
                DolaCode provides customized user portals for Students, Parents, Teachers, and School Administrators:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Minor Accounts & Parental Consent:</strong> If you are under 18 years of age, you may use DolaCode only under the supervision and with the consent of a parent, legal guardian, or authorized educator.</li>
                <li><strong>Parent & Teacher Responsibility:</strong> Parents and verified school teachers registering accounts for minors agree to supervise learning activity and ensure compliance with these Terms.</li>
                <li><strong>Account Security:</strong> You are responsible for safeguarding your authentication credentials (including Google OAuth tokens) and for all activities that occur under your account.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="google-sso" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <ShieldCheck className="text-amber-400" size={24} />
                <h2 className="text-2xl font-black text-white">3. Google OAuth & Third-Party Authentication</h2>
              </div>
              <p>
                DolaCode offers single sign-on authentication via Google OAuth 2.0. By using Google Sign-In:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You grant DolaCode permission to access your basic Google profile (Name, Email, Profile Picture URL, Unique Google User ID) solely for authentication and account creation.</li>
                <li>You acknowledge that DolaCode complies with the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-bold underline">Google API Services User Data Policy</a>, including the Limited Use requirements as outlined in our <Link href="/privacy" className="text-pink-400 font-bold underline">Privacy Policy</Link>.</li>
                <li>You remain subject to Google&apos;s Terms of Service and Privacy Policy regarding your Google account credentials.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="use-conduct" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <ShieldAlert className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-black text-white">4. Platform Rules & Acceptable Use</h2>
              </div>
              <p>You agree not to engage in any of the following prohibited activities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attempting to bypass security mechanisms, reverse engineer Pyodide execution environments, or inject malicious code into interactive editors.</li>
                <li>Scraping, automated data extraction, or running unauthorized bots on the platform.</li>
                <li>Impersonating another user, parent, teacher, or DolaCode administrator.</li>
                <li>Using the platform for any commercial purpose or unauthorized advertisement distribution.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="intellectual-property" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Scale className="text-sky-400" size={24} />
                <h2 className="text-2xl font-black text-white">5. Intellectual Property Rights</h2>
              </div>
              <p>
                All curriculum materials, challenge stages, Blockly blocks, graphics, software, code templates, brand logos, and artwork on DolaCode are owned by Devnaija Academy and protected by copyright and intellectual property laws.
              </p>
              <p>
                <strong>Student Ownership:</strong> Students retain ownership of original code and creative projects they write on DolaCode. By saving projects to DolaCode servers, you grant us a non-exclusive, worldwide license to host, display, and execute your project files within your user dashboard and class showcases.
              </p>
            </section>

            {/* Section 6 */}
            <section id="billing" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <CreditCard className="text-emerald-400" size={24} />
                <h2 className="text-2xl font-black text-white">6. Subscriptions & Payments</h2>
              </div>
              <p>
                DolaCode offers free introductory access and optional premium subscription tiers for expanded AI tutoring features and school licenses:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Subscription fees are billed in advance on a recurring monthly or annual basis as selected during purchase.</li>
                <li>Parents or schools may cancel subscriptions at any time via account settings. Access will continue through the end of the current billing cycle.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="disclaimer" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <AlertCircle className="text-amber-400" size={24} />
                <h2 className="text-2xl font-black text-white">7. Limitation of Liability & Disclaimers</h2>
              </div>
              <p>
                DolaCode is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied. To the maximum extent permitted by law, Devnaija Academy disclaims all warranties, including merchantability and fitness for a particular purpose.
              </p>
              <p>
                Devnaija Academy shall not be liable for indirect, incidental, special, or consequential damages resulting from platform downtime or loss of saved project data.
              </p>
            </section>

            {/* Section 8 */}
            <section id="governing-law" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Gavel className="text-purple-400" size={24} />
                <h2 className="text-2xl font-black text-white">8. Governing Law & Account Termination</h2>
              </div>
              <p>
                We reserve the right to suspend or terminate any account that violates these Terms, compromises platform security, or engages in fraudulent activity.
              </p>
              <p>
                These Terms shall be governed by and construed in accordance with applicable governing laws, without regard to conflict of law principles.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="bg-gradient-to-br from-slate-800/80 to-purple-950/30 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Mail className="text-pink-400" size={24} />
                <h2 className="text-2xl font-black text-white">9. Contact & Legal Enquiries</h2>
              </div>
              <p>
                If you have any questions or legal inquiries regarding these Terms of Service, please contact us:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">Legal Department</h4>
                  <p className="text-sm font-bold text-slate-200">legal@dolacode.com</p>
                  <p className="text-xs text-slate-400">hello@dolacode.com</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-pink-400">Organization</h4>
                  <p className="text-sm font-bold text-slate-200">Devnaija Academy</p>
                  <p className="text-xs text-slate-400">DolaCode Educational Platform</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 DolaCode Platform (Devnaija Academy). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/terms" className="text-purple-400 font-bold">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
