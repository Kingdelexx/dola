"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Baby, 
  Eye, 
  Lock, 
  UserCheck, 
  HeartHandshake, 
  ArrowLeft, 
  Printer, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  ShieldAlert,
  Bot
} from 'lucide-react';

export default function ChildSafetyPage() {
  const [activeSection, setActiveSection] = useState('commitment');

  const sections = [
    { id: 'commitment', title: '1. Our Safety Pledge', icon: HeartHandshake },
    { id: 'coppa-compliance', title: '2. COPPA & GDPR-K Compliance', icon: Baby, highlight: true },
    { id: 'ad-free', title: '3. Zero Ads & Data Privacy', icon: Eye },
    { id: 'parent-controls', title: '4. Parent & Teacher Controls', icon: UserCheck },
    { id: 'safe-ai', title: '5. Safe AI Sidekick (Lizzy AI)', icon: Bot },
    { id: 'security-moderation', title: '6. Private & Moderated Environment', icon: Lock },
    { id: 'reporting', title: '7. Reporting & Child Protection', icon: ShieldAlert },
    { id: 'contact', title: '8. Safety Contact Team', icon: Mail },
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-400 selection:text-white">
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

      {/* Hero Header Banner (Bright Theme) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-100/70 via-pink-50/50 to-slate-50 border-b border-purple-100 py-12 lg:py-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 border border-pink-300 text-pink-700 text-xs font-black uppercase tracking-wider shadow-xs">
            <Baby size={16} /> Child Safety & Online Protection Standards
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900">
            Child Safety Policy & Commitments
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            At DolaCode, creating a fun, inspiring, and 100% safe digital environment for kids and young learners is our highest priority.
          </p>
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-600 pt-2">
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <Clock size={14} className="text-pink-500" /> Effective Date: August 11, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <ShieldCheck size={14} className="text-emerald-500" /> Verified COPPA Safe
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
                Safety Navigation
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
                            ? 'text-pink-600 bg-pink-50 hover:bg-pink-100 border border-pink-200' 
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent size={16} className={isActive ? 'text-white' : sec.highlight ? 'text-pink-500' : 'text-slate-400'} />
                      <span className="truncate">{sec.title}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 mt-4 px-3 space-y-3">
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    Parents or educators with safety inquiries:
                  </p>
                  <a 
                    href="mailto:safety@dolacode.com"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-pink-600 hover:text-pink-700"
                  >
                    <Mail size={12} /> Contact Safety Desk
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Policy Detail Sections */}
          <div className="lg:col-span-3 space-y-10 text-slate-700 leading-relaxed text-sm">

            {/* Safety Guarantee Highlight Callout (Bright Theme) */}
            <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 border-2 border-pink-300/80 rounded-3xl p-6 lg:p-8 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-400/40 flex items-center justify-center text-pink-600">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-pink-600">
                    Child Safety Guarantee
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Built from the Ground Up for Young Coders
                  </h3>
                </div>
              </div>
              <p className="text-slate-700 font-medium">
                DolaCode is designed specifically for children, parents, and schools. We strictly enforce COPPA guidelines to ensure that young coders can create games, learn Python, and explore STEM subjects in a protected space free from targeted advertising, public chat risks, or privacy exploitation.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-pink-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>100% Ad-Free Environment</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-pink-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Parent & Teacher Progress Dashboards</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-pink-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>Content Moderated AI Tutor (Lizzy AI)</span>
                </li>
                <li className="flex items-center gap-2 bg-white p-3 rounded-xl border border-pink-200/80 shadow-2xs font-bold text-slate-800">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>No Public Direct Messaging or Social Feeds</span>
                </li>
              </ul>
            </div>

            {/* Section 1: Safety Pledge */}
            <section id="commitment" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <HeartHandshake className="text-pink-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">1. Our Safety Pledge to Families & Schools</h2>
              </div>
              <p>
                At <strong>DolaCode</strong> (operated by <strong>Devnaija Academy</strong>), we believe that learning to code should empower children without putting their online safety or privacy at risk.
              </p>
              <p>
                Our platform provides structured coding stages (Numeracy, Block Coding, Python Pro, App Studio) in a completely sandboxed and controlled environment. We treat every child user with the highest care, enforcing strict safety rules across all interactive modules.
              </p>
            </section>

            {/* Section 2: COPPA & GDPR-K Compliance */}
            <section id="coppa-compliance" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Baby className="text-purple-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">2. COPPA & GDPR-K Compliance</h2>
              </div>
              <p>
                DolaCode strictly complies with the <strong>Children&apos;s Online Privacy Protection Act (COPPA)</strong> in the United States and the <strong>General Data Protection Regulation for Children (GDPR-K)</strong> in Europe and internationally.
              </p>
              
              <h3 className="text-base font-bold text-slate-900 pt-2">Key Protections for Minors (Under 13 & Teens):</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Minimal Data Collection:</strong> We collect only the minimum necessary information required to maintain user accounts and save learning progress.</li>
                <li><strong>No Public Profiles:</strong> Student accounts do not feature public social profiles, location sharing, or unmoderated chat rooms.</li>
                <li><strong>Parental Authorization:</strong> Student sub-accounts are linked to verified parent or educator master accounts.</li>
              </ul>
            </section>

            {/* Section 3: Zero Ads & Data Privacy */}
            <section id="ad-free" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Eye className="text-sky-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">3. Zero Advertising & Zero Behavioral Mining</h2>
              </div>
              <p>
                DolaCode is 100% ad-free. We believe children should never be targeted by commercial advertisements, popups, or tracking cookies while learning.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We do <strong>NOT</strong> display third-party advertisements or sponsored pop-ups to children.</li>
                <li>We do <strong>NOT</strong> sell, rent, or trade student data, project files, or learning metrics to advertisers, marketers, or data brokers.</li>
                <li>We do <strong>NOT</strong> track students across other websites or build commercial advertising profiles.</li>
              </ul>
            </section>

            {/* Section 4: Parent & Teacher Controls */}
            <section id="parent-controls" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <UserCheck className="text-emerald-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">4. Parent & Teacher Oversight Controls</h2>
              </div>
              <p>
                Parents and verified school teachers maintain full oversight of student learning activity:
              </p>
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-pink-600 text-sm">Parent Dashboard</h4>
                  <p className="text-xs text-slate-600">
                    Monitor your child&apos;s active learning streak, completed stages, star rewards, and saved coding projects.
                  </p>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-purple-600 text-sm">Teacher & School Admin Portal</h4>
                  <p className="text-xs text-slate-600">
                    Manage student rosters, assign coding modules, track classroom statistics, and safeguard student login credentials.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5: Safe AI Sidekick (Lizzy AI) */}
            <section id="safe-ai" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Bot className="text-amber-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">5. Safe AI Coding Assistant (Lizzy AI)</h2>
              </div>
              <p>
                In Stage 4 (Python Pro), students interact with our AI tutor, <strong>Lizzy AI</strong>, for real-time coding guidance and debugging help.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" /> Safety Safeguards Built into Lizzy AI:
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>Content Safety Guardrails:</strong> Prompts are strictly scoped to programming concepts, syntax help, and educational encouragement.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>No Personal Information in AI Prompts:</strong> Student names, passwords, emails, or personal details are never sent to AI processing pipelines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <span><strong>No Unsupervised Social Chatting:</strong> Lizzy AI functions exclusively as a coding tutor—not a general conversation chatbot.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6: Security & Moderation */}
            <section id="security-moderation" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Lock className="text-indigo-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">6. Private & Sandboxed Execution Environment</h2>
              </div>
              <p>
                All student Python code and Blockly scripts run in isolated browser sandboxes (using Pyodide and Blockly execution engines).
              </p>
              <p>
                This ensures that student code cannot access local computer file systems, execute unauthorized network calls, or expose student devices to malicious external scripts.
              </p>
            </section>

            {/* Section 7: Reporting & Child Protection */}
            <section id="reporting" className="bg-white rounded-2xl border border-slate-200/90 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <ShieldAlert className="text-pink-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">7. Parental Rights & Reporting Safety Issues</h2>
              </div>
              <p>
                Parents, legal guardians, and educators have the right at any time to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Review all personal information and coding projects stored for their child.</li>
                <li>Request immediate deletion of their child&apos;s account and associated data.</li>
                <li>Report any safety concern, bug, or questionable content.</li>
              </ul>
            </section>

            {/* Section 8: Contact Information */}
            <section id="contact" className="bg-gradient-to-br from-slate-100 to-purple-50 rounded-2xl border border-purple-200 p-6 lg:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-3 border-b border-purple-200 pb-4">
                <Mail className="text-pink-500" size={24} />
                <h2 className="text-2xl font-black text-slate-900">8. Child Safety Response Team</h2>
              </div>
              <p>
                If you have an urgent child protection concern, wish to request account deletion, or have safety questions, please contact our dedicated Child Safety Officer:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-pink-600">Child Safety Email</h4>
                  <p className="text-sm font-bold text-slate-800">safety@dolacode.com</p>
                  <p className="text-xs text-slate-500">hello@dolacode.com</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-purple-600">Organization</h4>
                  <p className="text-sm font-bold text-slate-800">Devnaija Academy</p>
                  <p className="text-xs text-slate-500">DolaCode Child Protection Division</p>
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
            <Link href="/terms" className="hover:text-slate-800 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-800 transition-colors">Privacy Policy</Link>
            <Link href="/child-safety" className="text-pink-600 font-bold">Child Safety</Link>
            <Link href="/contact" className="hover:text-slate-800 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
