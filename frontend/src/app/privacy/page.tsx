"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  UserCheck, 
  Server, 
  Baby, 
  Key, 
  Mail, 
  ArrowLeft, 
  ExternalLink,
  Printer,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Rocket
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: '1. Overview & Scope', icon: Eye },
    { id: 'google-data', title: '2. Google OAuth & Limited Use', icon: ShieldCheck, highlight: true },
    { id: 'data-collection', title: '3. Data We Collect', icon: FileText },
    { id: 'data-use', title: '4. How We Use Data', icon: UserCheck },
    { id: 'children-privacy', title: '5. Children\'s Privacy (COPPA)', icon: Baby },
    { id: 'data-sharing', title: '6. Data Sharing & Security', icon: Server },
    { id: 'user-rights', title: '7. Data Deletion & Rights', icon: Key },
    { id: 'contact', title: '8. Contact Information', icon: Mail },
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-pink-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-105 transition-transform">
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
              <Printer size={14} /> Print Policy
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-md transition-all hover:scale-105"
            >
              <ArrowLeft size={14} /> Back to DolaCode
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-900 border-b border-slate-800 py-12 lg:py-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={16} /> Privacy & Google OAuth Compliance
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">
            Application Privacy Policy
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Your privacy and data security are our top priorities. Learn how DolaCode protects your information, enforces COPPA standards, and complies with Google API Limited Use Requirements.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-2">
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <Clock size={14} className="text-pink-400" /> Last Updated: August 9, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <CheckCircle2 size={14} className="text-emerald-400" /> Google Branding Verified
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
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' 
                          : sec.highlight 
                            ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? 'text-white' : sec.highlight ? 'text-amber-400' : 'text-slate-400'} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-700/60 mt-4 px-3 space-y-3">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                    Need help or want your account data removed?
                  </p>
                  <a 
                    href="mailto:privacy@dolacode.com"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:text-pink-300"
                  >
                    <Mail size={12} /> Email Privacy Team
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Detail Sections */}
          <div className="lg:col-span-3 space-y-10 text-slate-300 leading-relaxed text-sm">

            {/* Crucial Google API Limited Use Highlight Callout */}
            <div className="bg-gradient-to-r from-amber-950/50 via-slate-800 to-purple-950/40 border-2 border-amber-500/40 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Mandatory Google Disclosure
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Google API Services User Data Policy Compliance
                  </h3>
                </div>
              </div>
              <p className="text-slate-200 font-medium">
                DolaCode strictly adheres to Google&apos;s API Services User Data Policy. When you sign in to DolaCode using Google OAuth:
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30 text-amber-200 font-mono text-xs leading-normal">
                &ldquo;DolaCode&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
                <a 
                  href="https://developers.google.com/terms/api-services-user-data-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline hover:text-white inline-flex items-center gap-1 font-bold"
                >
                  Google API Services User Data Policy <ExternalLink size={11} />
                </a>
                , including the Limited Use requirements.&rdquo;
              </div>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                <li className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>No selling or renting of Google user data</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>No advertising profiling or targeted ads</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>No unauthorized AI model training on profile data</span>
                </li>
                <li className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Strict access limited to user authentication</span>
                </li>
              </ul>
            </div>

            {/* Section 1: Overview & Scope */}
            <section id="overview" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Eye className="text-pink-400" size={24} />
                <h2 className="text-2xl font-black text-white">1. Overview & Scope</h2>
              </div>
              <p>
                Welcome to <strong>DolaCode</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;), operated by <strong>Devnaija Academy</strong>. DolaCode is an interactive coding and STEM learning platform designed for kids, young learners, parents, teachers, and schools.
              </p>
              <p>
                This Privacy Policy outlines how we collect, use, store, share, and protect your personal information when you visit our website, register an account, or interact with our interactive learning stages (DolaCode Numeracy, Block Coding, App Studio, Python Pro, Parent & Teacher Dashboards).
              </p>
              <p>
                By using DolaCode or signing in via Google OAuth, you agree to the practices described in this policy.
              </p>
            </section>

            {/* Section 2: Google OAuth & Limited Use */}
            <section id="google-data" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <ShieldCheck className="text-amber-400" size={24} />
                <h2 className="text-2xl font-black text-white">2. Google OAuth & Limited Use Requirements</h2>
              </div>
              <p>
                DolaCode provides single sign-on (SSO) integration using <strong>Google Sign-In (Google OAuth 2.0)</strong> for easy, passwordless authentication.
              </p>
              
              <h3 className="text-base font-bold text-white pt-2">Data Accessed via Google OAuth:</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-300">
                <li><strong>Basic Profile Information:</strong> Your full name and profile picture URL (used exclusively to display your account name and avatar within the DolaCode header and user dashboard).</li>
                <li><strong>Email Address:</strong> Used to uniquely identify your account, send registration verification, passwordless magic login links, and platform notifications.</li>
                <li><strong>Google User ID (`sub` claim):</strong> A secure, unique identifier used to link your Google authentication token with your DolaCode student or educator profile.</li>
              </ul>

              <h3 className="text-base font-bold text-white pt-2">Google Limited Use Restrictions:</h3>
              <p>
                In strict compliance with the Google API Services User Data Policy:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>We only request access to basic profile scopes necessary for user authentication (<code className="bg-slate-900 px-2 py-0.5 rounded text-pink-400">openid</code>, <code className="bg-slate-900 px-2 py-0.5 rounded text-pink-400">profile</code>, <code className="bg-slate-900 px-2 py-0.5 rounded text-pink-400">email</code>).</li>
                <li>We do not transfer or share your Google user data with any third party, except as strictly required to provide server hosting or database services essential for app operation.</li>
                <li>We do not use Google user data for advertising, remarketing, credit assessment, or market research.</li>
                <li>Human personnel do not read your Google user data unless required for security investigations, user support requests, or compliance with applicable law.</li>
              </ol>
            </section>

            {/* Section 3: Data We Collect */}
            <section id="data-collection" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <FileText className="text-sky-400" size={24} />
                <h2 className="text-2xl font-black text-white">3. Information We Collect</h2>
              </div>
              <p>
                In addition to Google OAuth profile data, we collect information directly provided by users or generated during platform usage:
              </p>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 space-y-2">
                  <h4 className="font-bold text-pink-400 text-sm">Account & Profile Information</h4>
                  <p className="text-xs text-slate-300">
                    Username, account role (Student, Parent, Teacher, School Admin), enrolled grade level, avatar selection, and linked parent/teacher email addresses.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 space-y-2">
                  <h4 className="font-bold text-purple-400 text-sm">Learning & Progress Data</h4>
                  <p className="text-xs text-slate-300">
                    Completed coding challenges, star scores, Blockly project XML/JSON files, Python scripts, game canvas saves, and stage badges.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 space-y-2">
                  <h4 className="font-bold text-yellow-400 text-sm">Technical & Device Data</h4>
                  <p className="text-xs text-slate-300">
                    IP address, browser type, device type (Chromebook, iPad, PC), operating system version, and system language settings.
                  </p>
                </div>
                <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-700/50 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">Cookies & Local Storage</h4>
                  <p className="text-xs text-slate-300">
                    Session authentication tokens, Pyodide execution environment state, and Blockly workspace temporary storage.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4: How We Use Data */}
            <section id="data-use" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <UserCheck className="text-purple-400" size={24} />
                <h2 className="text-2xl font-black text-white">4. How We Use Your Information</h2>
              </div>
              <p>
                We process collected data exclusively for valid operational and educational purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Management:</strong> Authenticate user sessions, process passwordless logins, and display personalized user profiles.</li>
                <li><strong>Educational Service Delivery:</strong> Save coding project progress across Stage 1 (Numeracy), Stage 2 (Block Coding), Stage 3 (App Studio), and Stage 4 (Python Pro).</li>
                <li><strong>Parent & Teacher Dashboards:</strong> Provide parents and teachers with learning activity summaries, completed module milestones, and student roster management.</li>
                <li><strong>AI Coding Assistance (Lizzy AI):</strong> Provide real-time debugging tips and guidance for Python code exercises without storing sensitive user credentials in AI prompts.</li>
                <li><strong>Platform Security:</strong> Monitor and prevent unauthorized access, abuse, spam, or cyber threats.</li>
              </ul>
            </section>

            {/* Section 5: Children's Privacy (COPPA) */}
            <section id="children-privacy" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Baby className="text-pink-400" size={24} />
                <h2 className="text-2xl font-black text-white">5. Children&apos;s Privacy (COPPA & GDPR-K Compliance)</h2>
              </div>
              <p>
                As a platform built for kids and educational institutions, DolaCode takes children&apos;s online safety with utmost seriousness in full compliance with the <strong>Children&apos;s Online Privacy Protection Act (COPPA)</strong> and <strong>GDPR for Children (GDPR-K)</strong>.
              </p>
              <div className="bg-pink-950/30 border border-pink-500/30 rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-pink-300 flex items-center gap-2">
                  <Sparkles size={18} /> Our Guarantees for Young Learners:
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-pink-400 mt-0.5 shrink-0" />
                    <span><strong>No Targeted Advertising:</strong> We never display third-party advertisements or use children&apos;s data for commercial behavioral profiling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-pink-400 mt-0.5 shrink-0" />
                    <span><strong>Parental & Educator Controls:</strong> Parents and verified school teachers maintain full oversight of student accounts created under their dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-pink-400 mt-0.5 shrink-0" />
                    <span><strong>Minimal Data Minimization:</strong> Student profiles only require an optional username or avatar—no public social profiles or public chat rooms exist.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6: Data Sharing & Security */}
            <section id="data-sharing" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Server className="text-emerald-400" size={24} />
                <h2 className="text-2xl font-black text-white">6. Data Sharing & Security Measures</h2>
              </div>
              <p>
                <strong>We do not sell, rent, or trade your personal data or Google account information to any third party.</strong>
              </p>
              <p>
                We only share data under the following limited circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Operational Service Providers:</strong> Trusted cloud infrastructure and database providers (e.g., cloud hosting, database management) who operate under strict non-disclosure and data privacy agreements.</li>
                <li><strong>Legal Requirements:</strong> If required by valid law enforcement requests, subpoenas, or legal proceedings to protect rights, safety, and property.</li>
              </ul>
              
              <h3 className="text-base font-bold text-white pt-2">Security Protection:</h3>
              <p>
                We employ industry-standard security practices, including TLS/HTTPS encryption in transit, hashed passwords, access-controlled cloud infrastructure, and regular security audits to safeguard your account.
              </p>
            </section>

            {/* Section 7: Data Deletion & User Rights */}
            <section id="user-rights" className="bg-slate-800/40 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Key className="text-amber-400" size={24} />
                <h2 className="text-2xl font-black text-white">7. User Rights & Account Data Deletion</h2>
              </div>
              <p>
                Every DolaCode user, parent, and educator has the following rights regarding their data:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access & Export:</strong> Request a copy of all personal profile information and coding projects stored on DolaCode.</li>
                <li><strong>Correction:</strong> Update or correct your profile name, role, or linked contact email at any time in settings.</li>
                <li><strong>Account & Data Deletion:</strong> You have the absolute right to request the permanent deletion of your account, Google OAuth token association, and all associated student progress data.</li>
              </ul>

              <div className="bg-slate-900/80 p-5 rounded-xl border border-amber-500/30 space-y-3 mt-4">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <HelpCircle size={16} /> How to Request Account Deletion:
                </h4>
                <p className="text-xs text-slate-300">
                  To permanently delete your DolaCode account and wipe all stored data:
                </p>
                <ol className="list-decimal pl-5 text-xs text-slate-300 space-y-1">
                  <li>Send an email to <a href="mailto:privacy@dolacode.com" className="text-pink-400 font-bold underline">privacy@dolacode.com</a> or <a href="mailto:hello@dolacode.com" className="text-pink-400 font-bold underline">hello@dolacode.com</a> with the subject line <em>&ldquo;Account Deletion Request&rdquo;</em>.</li>
                  <li>Include the email address associated with your DolaCode or Google Sign-In account.</li>
                  <li>Our support team will process your request and permanently delete your record within <strong>7 business days</strong>.</li>
                </ol>
              </div>
            </section>

            {/* Section 8: Contact Information */}
            <section id="contact" className="bg-gradient-to-br from-slate-800/80 to-purple-950/30 rounded-2xl border border-slate-700/60 p-6 lg:p-8 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
                <Mail className="text-pink-400" size={24} />
                <h2 className="text-2xl font-black text-white">8. Contact Us & Privacy Inquiries</h2>
              </div>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy, our Google OAuth data practices, or children&apos;s data privacy, please reach out to our dedicated privacy response team:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-pink-400">Privacy & Support Email</h4>
                  <p className="text-sm font-bold text-slate-200">privacy@dolacode.com</p>
                  <p className="text-xs text-slate-400">hello@dolacode.com</p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-purple-400">Platform Developer</h4>
                  <p className="text-sm font-bold text-slate-200">Devnaija Academy</p>
                  <p className="text-xs text-slate-400">DolaCode Platform Services</p>
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
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-pink-400 font-bold">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
