"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import 'animate.css';
import { 
  Blocks, Terminal, Bot, Rocket, Star, Sparkles, ChevronRight, 
  Play, MousePointerClick, Unlock, Ghost, LayoutGrid, Quote, UserCircle2,
  Plus, Minus, Mail, MapPin, Cloud, Trophy, Gamepad2, Sun, Crown, Heart
} from 'lucide-react';
import { FaTwitter, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const featuresRef = useRef(null);
  const shapesRef = useRef(null);
  const howItWorksRef = useRef(null);
  const demoRef = useRef(null);
  const marqueeRef = useRef(null);
  const ctaButtonRef = useRef(null);
  
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Playful floating clouds and shapes
      gsap.to(".floating-shape", {
        y: "random(-25, 25)",
        x: "random(-20, 20)",
        rotation: "random(-10, 10)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.15,
      });

      // Hero Elements bounce-in
      gsap.from(titleRef.current, { y: 60, opacity: 0, duration: 1.2, ease: "bounce.out", delay: 0.2 });
      gsap.from(subtitleRef.current, { y: 40, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4 });
      gsap.from(buttonsRef.current, { scale: 0.5, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)", delay: 0.6 });

      // How It Works Timeline (bouncy steps)
      const stepTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      const steps = [1, 2, 3, 4];
      steps.forEach(step => {
        stepTl.to(`.step-${step}`, {
          y: -15,
          scale: 1.05,
          boxShadow: "0 20px 25px -5px rgba(236, 72, 153, 0.3)",
          borderColor: "#ec4899",
          duration: 0.3,
          ease: "power2.out"
        })
        .to(`.step-${step} .step-icon`, { scale: 1.3, rotation: 10, duration: 0.2, yoyo: true, repeat: 1 }, "<")
        .to(`.step-${step}`, {
          y: 0,
          scale: 1,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          borderColor: "rgba(0,0,0,0.05)",
          duration: 0.5,
          ease: "bounce.out"
        }, "+=0.5");
      });

      // Demo Loop (More energetic)
      const demoTl = gsap.timeline({ repeat: -1 });
      demoTl.to(".demo-sprite", { x: 180, duration: 1.2, ease: "power2.inOut" })
            .to(".demo-sprite", { y: -80, duration: 0.4, ease: "power1.out" })
            .to(".demo-sprite", { y: 0, duration: 0.6, ease: "bounce.out" })
            .to(".demo-sprite", { x: 0, duration: 1.2, ease: "power2.inOut", delay: 0.5 })
            .to(".demo-sprite", { rotation: 360, duration: 0.8, ease: "back.out(1.5)" }, "-=1.2");
            
      const codeTl = gsap.timeline({ repeat: -1 });
      codeTl.fromTo(".fake-block-1", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" })
            .fromTo(".fake-block-2", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(2)" }, "+=0.3")
            .to(".fake-block-1, .fake-block-2", { opacity: 0, delay: 2.5 });

      // Marquee Loop
      if (marqueeRef.current) {
        gsap.to(".marquee-track", { xPercent: -50, ease: "none", duration: 35, repeat: -1 });
      }

      // CTA Wiggle
      gsap.to(ctaButtonRef.current, {
        rotation: "random(-3, 3)",
        scale: 1.05,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 2
      });

    }, heroRef);
    return () => ctx.revert();
  }, []);

  const testimonials = [
    { name: "Sarah", text: "DolaCode completely changed how my son sees learning. He's so excited to build games every day!", role: "Parent" },
    { name: "Leo, Age 10", text: "I made a space shooter game all by myself! Python is actually really fun when you use it here.", role: "Student" },
    { name: "Mr. Davis", text: "As a teacher, finding a platform that bridges blocks to text code is rare. This does it perfectly.", role: "Teacher" },
    { name: "Emma, Age 12", text: "The AI tutor is the best! It helps me fix my bugs without just giving me the answer immediately.", role: "Student" },
    { name: "Michael", text: "Finally an educational app that competes with regular video games for my kids' attention.", role: "Parent" }
  ];

  const faqs = [
    {
      question: "What age is this platform designed for?",
      answer: "DolaCode is built specifically for kids and teens aged 5 to 16. Our new DolaCode Numeracy (Stage 1) is perfect for younger kids to build coding readiness. Stage 2 (Block Coding) and Stage 3 (Python Coding) are perfect for starting visual coding and transitioning to real typed code, while Stage 4 (AI Co-pilot) offers assistance for older or more advanced developers."
    },
    {
      question: "Do I need prior coding experience?",
      answer: "Not at all! Our curriculum assumes zero prior knowledge. Kids start with basic maths for coding readiness (counting, logic, patterns) in Stage 1, drag visual blocks in Stage 2, and transition into writing real Python code in Stage 3."
    },
    {
      question: "Is DolaCode free to use?",
      answer: "Yes, creating an account and playing through the first several modules is completely free. We offer a premium subscription that unlocks advanced AI tutoring and unlimited project saves."
    },
    {
      question: "Does it work on iPads and Chromebooks?",
      answer: "Yes! The platform runs entirely in your web browser. There is nothing to install, making it perfectly compatible with Chromebooks, iPads, Macs, and Windows PCs."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 overflow-hidden font-sans selection:bg-pink-300 selection:text-pink-900" ref={heroRef}>
      {/* Playful Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" ref={shapesRef}>
        <div className="absolute top-0 left-0 w-full h-[80vh] bg-gradient-to-b from-sky-300 to-sky-100" />
        <Cloud className="floating-shape absolute top-24 left-[10%] text-white opacity-80" size={120} />
        <Cloud className="floating-shape absolute top-40 right-[15%] text-white opacity-60" size={160} />
        <Cloud className="floating-shape absolute top-72 left-[30%] text-white opacity-70" size={90} />
        <Sun className="floating-shape absolute top-16 right-[30%] text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]" size={100} />
        <Star className="floating-shape absolute top-32 left-1/4 text-yellow-400" size={40} />
        <Star className="floating-shape absolute top-64 right-1/4 text-pink-400" size={32} />
        <Star className="floating-shape absolute bottom-32 right-1/3 text-purple-400" size={48} />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center p-4 lg:px-8 bg-white/70 backdrop-blur-xl sticky top-4 mx-4 lg:mx-12 rounded-full border-[3px] border-white shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 transform -rotate-6">
            <Rocket className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-800 ml-1">
            DolaCode
          </span>
        </div>
        <div className="space-x-3 flex items-center">
          {!loading && user ? (
            <>
              {user.is_superuser && (
                <Link href="/admin-dashboard" className="px-5 py-2.5 rounded-full font-bold text-purple-600 hover:bg-purple-50 transition-colors">Admin</Link>
              )}
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full font-bold text-sky-600 hover:bg-sky-50 transition-colors">Dashboard</Link>
              <button onClick={logout} className="px-6 py-2.5 rounded-full font-bold bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-600 hover:scale-105 transition-all transform shadow-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2.5 rounded-full font-bold text-slate-600 hover:bg-slate-100 hover:text-sky-600 transition-colors hidden sm:block">Log In</Link>
              <Link href="/signup" className="px-6 py-2.5 rounded-full font-black bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-300 hover:to-orange-300 hover:scale-105 transition-all transform shadow-[0_6px_0_#ea580c] hover:translate-y-[-2px] active:translate-y-[4px] active:shadow-[0_2px_0_#ea580c]">
                Play Now!
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-16 pb-32 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border-2 border-pink-200 shadow-sm animate__animated animate__fadeInDown">
              <Sparkles className="text-pink-500" size={20} />
              <span className="text-sm font-bold text-pink-600 uppercase tracking-wide">The #1 coding game for kids</span>
            </div>
            <h1 ref={titleRef} className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-800 drop-shadow-sm">
              Code your own <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Games</span> and <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-505 to-green-400">Adventures!</span>
            </h1>
            <p ref={subtitleRef} className="text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 font-medium">
              Join thousands of kids learning to build games, animations, and apps. No boring lessons—just pure fun!
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href={user ? "/dashboard" : "/signup"} className="group relative px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-black text-xl text-white shadow-[0_8px_0_#c026d3] hover:translate-y-[-2px] hover:shadow-[0_10px_0_#c026d3] active:translate-y-[6px] active:shadow-[0_2px_0_#c026d3] transition-all w-full sm:w-auto text-center flex items-center justify-center gap-3">
                <Gamepad2 size={28} className="group-hover:rotate-12 transition-transform" />
                {user ? "Go to Dashboard" : "Start Playing"}
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-[400px] lg:h-[500px]">
            <img 
              src="/kids_coding_hero.png" 
              alt="Kids Coding" 
              className="w-full max-w-[500px] animate__animated animate__zoomIn drop-shadow-[0_20px_50px_rgba(236,72,153,0.3)] rounded-[3rem] border-[6px] border-white rotate-2 hover:rotate-0 transition-transform duration-500" 
            />
          </div>
        </div>
      </main>

      {/* Features Section - Gamified Cards */}
      <section className="relative z-20 pt-20 pb-32 bg-white rounded-t-[3rem] lg:rounded-t-[5rem] px-6 border-t-[8px] border-sky-200" ref={featuresRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full font-bold mb-2">
              <Trophy size={20} className="inline mr-2 -mt-1" /> Level Up Your Skills
            </div>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-800">Why kids <span className="text-pink-500">love</span> DolaCode</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-indigo-200 hover:border-indigo-400 shadow-[0_15px_30px_-5px_rgba(99,102,241,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(99,102,241,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white">
                <Star className="text-white fill-white" size={32} />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-800 group-hover:text-indigo-500 transition-colors">1. Numeracy (8 Parts)</h3>
              <p className="text-slate-655 leading-relaxed font-semibold text-sm">Maths for coding readiness. Part 1 covers number sense, Part 2 covers operations, Part 3 covers logic loops, Part 4 covers spatial grids, Part 5 covers real-life measurement variables, Part 6 covers fractions & decimals, Part 7 covers data & stats, and Part 8 covers problem solving & algorithms.</p>
            </div>
            {/* Card 2 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-pink-200 hover:border-pink-400 shadow-[0_15px_30px_-5px_rgba(236,72,153,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(236,72,153,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer mt-0 lg:mt-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-200 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 border-4 border-white animate-pulse">
                <Blocks className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-800 group-hover:text-pink-500 transition-colors">2. Block Logic</h3>
              <p className="text-slate-655 leading-relaxed font-semibold text-sm">Snap colorful Blockly blocks together like digital Legos! Learn structured programming without typing mistakes.</p>
            </div>
            {/* Card 3 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-sky-200 hover:border-sky-400 shadow-[0_15px_30px_-5px_rgba(56,189,248,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(56,189,248,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer mt-0 lg:mt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-200 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 border-4 border-white">
                <Terminal className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-800 group-hover:text-sky-500 transition-colors">3. Python Pro</h3>
              <p className="text-slate-655 leading-relaxed font-semibold text-sm">Transition cleanly into typing actual industry-standard Python code inside our interactive web app editor.</p>
            </div>
            {/* Card 4 */}
            <div className="feature-card bg-white rounded-[2rem] p-6 border-4 border-purple-200 hover:border-purple-400 shadow-[0_15px_30px_-5px_rgba(139,92,246,0.15)] hover:shadow-[0_20px_40px_-5px_rgba(139,92,246,0.3)] transition-all duration-300 transform hover:-translate-y-4 group cursor-pointer mt-0 lg:mt-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300 border-4 border-white">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-black mb-3 text-slate-800 group-hover:text-purple-500 transition-colors">4. AI Co-pilot</h3>
              <p className="text-slate-655 leading-relaxed font-semibold text-sm">Collaborate with our intelligent Robo-Tutor sidekick to get context-aware hints and learn coding practices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Map/Adventure theme) */}
      <section className="relative z-10 py-32 bg-amber-50 text-slate-800 px-6 border-t-8 border-dashed border-amber-200" ref={howItWorksRef}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-amber-600">Your <span className="text-pink-500">Curriculum</span> Map</h2>
            <p className="text-xl text-amber-700/70 max-w-2xl mx-auto font-medium">Progress through 4 exciting stages at your own pace!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Wavy path background for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] w-[80%] h-4 bg-amber-200 -translate-y-1/2 z-0 rounded-full"></div>

            {[
              { step: 1, title: "1. Numeracy (8 Parts)", desc: "Number sense, operations, logic, measurement, fractions, data, and algorithms.", icon: Star, color: "indigo" },
              { step: 2, title: "2. Block Coding", desc: "Snap Blockly code cards to control robots.", icon: Blocks, color: "pink" },
              { step: 3, title: "3. Python Coding", desc: "Type real script files to solve tasks.", icon: Terminal, color: "sky" },
              { step: 4, title: "4. AI Co-pilot", desc: "Co-author apps with a helpful AI tutor.", icon: Bot, color: "purple" }
            ].map((item, i) => (
              <div key={i} className={`step-${item.step} bg-white p-6 rounded-[2rem] border-4 border-slate-100 relative z-10 text-center flex flex-col items-center shadow-xl`}>
                <div className={`step-icon w-16 h-16 bg-indigo-500 rounded-[1.5rem] rotate-3 flex items-center justify-center mb-4 border-4 border-white shadow-lg`}>
                  <item.icon size={28} className="text-white fill-white" />
                </div>
                <div className="text-slate-500 font-black text-base mb-2 bg-slate-50 px-4 py-1 rounded-full border-2 border-slate-100">Stage {item.step}</div>
                <h3 className="text-xl font-black mb-2 mt-2">{item.title}</h3>
                <p className="text-slate-500 font-medium text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section - Playful Interface Preview */}
      <section className="relative z-10 py-32 bg-sky-400 px-6 overflow-hidden" ref={demoRef}>
        {/* Animated clouds for background */}
        <Cloud className="absolute top-10 left-10 text-white/30" size={150} />
        <Cloud className="absolute bottom-10 right-10 text-white/30" size={200} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-white drop-shadow-md">See it in <span className="text-yellow-300">Action!</span></h2>
          </div>
          
          <div className="relative mx-auto max-w-5xl bg-white rounded-[2.5rem] border-8 border-white shadow-[0_0_0_8px_rgba(255,255,255,0.2)] overflow-hidden flex flex-col md:flex-row h-[450px]">
            {/* Editor Side */}
            <div className="w-full md:w-1/2 bg-slate-50 border-r-4 border-slate-200 p-8 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex gap-3 mb-2">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <div className="w-4 h-4 rounded-full bg-green-400"></div>
              </div>
              <div className="fake-block-1 bg-sky-500 text-white font-bold text-lg p-4 rounded-xl w-[85%] shadow-[0_4px_0_#0284c7] border-2 border-sky-600 flex items-center gap-3">
                <Play size={24} className="fill-white" /> When Green Flag Clicked
              </div>
              <div className="fake-block-2 bg-orange-400 text-white font-bold text-lg p-4 rounded-xl w-[75%] ml-8 shadow-[0_4px_0_#c2410c] border-2 border-orange-500 flex items-center gap-3 relative">
                <div className="absolute -top-4 left-4 w-4 h-6 bg-orange-500"></div>
                Move <span className="bg-white text-orange-500 px-3 py-1 rounded-full text-sm">10</span> Steps
              </div>
              <div className="bg-purple-500 text-white font-bold text-lg p-4 rounded-xl w-[65%] ml-8 shadow-[0_4px_0_#7e22ce] border-2 border-purple-600 opacity-60 flex items-center gap-3 relative">
                <div className="absolute -top-4 left-4 w-4 h-6 bg-purple-600"></div>
                Jump <span className="bg-white text-purple-500 px-3 py-1 rounded-full text-sm">High</span>
              </div>
            </div>
            {/* Stage Side */}
            <div className="w-full md:w-1/2 bg-gradient-to-b from-sky-200 to-sky-300 relative overflow-hidden flex items-center justify-center border-t-4 md:border-t-0 border-slate-200">
              <div className="absolute bottom-0 left-0 w-full h-[40%] bg-emerald-400 border-t-8 border-emerald-500 rounded-t-[100%]"></div>
              <div className="demo-sprite relative z-10 text-slate-800 flex flex-col items-center">
                <div className="bg-white p-4 rounded-full shadow-xl border-4 border-pink-400">
                  <Ghost size={80} className="text-pink-500 fill-pink-200" />
                </div>
                <div className="w-16 h-4 bg-black/10 rounded-[100%] mt-4"></div>
              </div>
              <div className="absolute top-6 right-6 bg-white p-3 rounded-2xl shadow-lg border-4 border-yellow-300 flex items-center gap-3 rotate-3">
                <Star size={28} className="text-yellow-400 fill-yellow-400" />
                <span className="font-black text-xl text-slate-800">100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Bright and friendly */}
      <section className="relative z-10 py-32 bg-white overflow-hidden text-slate-900 border-t-8 border-dashed border-sky-200" ref={marqueeRef}>
        <div className="text-center mb-16 px-6">
          <div className="inline-flex items-center justify-center bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-bold mb-4">
            <Heart size={20} className="mr-2 fill-pink-500" /> Loved by Everyone
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-slate-800">Hall of <span className="text-purple-500">Fame</span></h2>
        </div>
        <div className="relative w-full flex overflow-hidden py-4">
          <div className="absolute top-0 left-0 w-16 md:w-40 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 md:w-40 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          <div className="marquee-track flex gap-8 w-max pl-8">
            {[...testimonials, ...testimonials].map((t, index) => (
              <div key={index} className="w-[380px] bg-sky-50 rounded-[2rem] p-8 border-4 border-sky-100 flex-shrink-0 flex flex-col justify-between shadow-lg">
                <div>
                  <Quote className="text-sky-300 mb-6" size={48} />
                  <p className="text-slate-700 font-medium text-lg leading-relaxed mb-8">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-4 mt-auto bg-white p-3 rounded-2xl border-2 border-sky-100">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner ${index % 2 === 0 ? 'bg-pink-400' : 'bg-purple-400'}`}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{t.name}</h4>
                    <span className="text-sm text-sky-600 font-bold uppercase tracking-wider">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - Friendly accordion */}
      <section className="relative z-10 py-32 bg-purple-50 px-6 border-t-8 border-purple-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl lg:text-6xl font-black text-purple-900">Got <span className="text-pink-500">Questions?</span></h2>
            <p className="text-xl text-purple-700 font-medium">We've got answers!</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`bg-white border-4 ${openFaq === index ? 'border-pink-400 shadow-[0_8px_0_#f472b6] translate-y-[-4px]' : 'border-purple-200 shadow-sm'} rounded-[1.5rem] overflow-hidden transition-all duration-300`}
              >
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className={`font-black text-xl ${openFaq === index ? 'text-pink-600' : 'text-purple-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border-2 ${openFaq === index ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-purple-100 border-purple-200 text-purple-600'}`}>
                    {openFaq === index ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pb-6 px-8' : 'grid-rows-[0fr] opacity-0 px-8 pb-0'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-600 font-medium text-lg leading-relaxed pt-4 border-t-2 border-slate-100">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Call to Action Section */}
      <section className="relative z-10 bg-pink-500 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center justify-center gap-3 mb-8 text-yellow-900 font-black bg-yellow-400 px-6 py-3 rounded-full shadow-[0_4px_0_#ca8a04] rotate-[-2deg]">
            <Star size={24} className="fill-yellow-900" /> Join 10,000+ Kids Coding Today!
          </div>
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-8 drop-shadow-lg">
            Ready to Build Your First <span className="text-yellow-300">Game?</span>
          </h2>
          <p className="text-2xl text-pink-100 mb-12 max-w-2xl mx-auto font-medium">
            Start coding for free right now. No credit card required, just your imagination!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              ref={ctaButtonRef}
              href={user ? "/dashboard" : "/signup"} 
              className="px-12 py-6 bg-yellow-400 text-yellow-900 rounded-full font-black text-3xl shadow-[0_10px_0_#ca8a04] hover:bg-yellow-300 hover:shadow-[0_12px_0_#ca8a04] active:translate-y-[8px] active:shadow-[0_2px_0_#ca8a04] transition-all w-full sm:w-auto border-4 border-white"
            >
              {user ? "Continue Playing" : "Play For Free!"}
            </Link>
          </div>
        </div>
      </section>

      {/* Playful Footer */}
      <footer className="bg-slate-900 text-slate-300 py-20 px-6 border-t-[12px] border-sky-400 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center rotate-6">
                <Rocket className="text-white" size={28} />
              </div>
              <span className="text-2xl font-black text-white">DolaCode</span>
            </div>
            <p className="font-medium text-slate-400 leading-relaxed">
              Empowering the next generation of creators through fun, interactive, and intelligent coding adventures!
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-sky-400 hover:border-sky-400 hover:text-white transition-all transform hover:-translate-y-2"><FaTwitter size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 hover:text-white transition-all transform hover:-translate-y-2"><FaFacebook size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-pink-500 hover:border-pink-500 hover:text-white transition-all transform hover:-translate-y-2"><FaInstagram size={20} /></a>
              <a href="#" className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-red-500 hover:border-red-500 hover:text-white transition-all transform hover:-translate-y-2"><FaYoutube size={20} /></a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-sky-400">Worlds</h4>
            <ul className="space-y-4 font-bold">
              <li><Link href="/stage1" className="hover:text-pink-400 hover:pl-2 transition-all block">1. DolaCode Numeracy</Link></li>
              <li><Link href="/stage2" className="hover:text-pink-400 hover:pl-2 transition-all block">2. Block Coding</Link></li>
              <li><Link href="/stage3" className="hover:text-pink-400 hover:pl-2 transition-all block">3. Python Coding</Link></li>
              <li><Link href="/stage4" className="hover:text-pink-400 hover:pl-2 transition-all block">4. AI Co-pilot</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-purple-400">Company</h4>
            <ul className="space-y-4 font-bold">
              <li><Link href="/about" className="hover:text-purple-300 hover:pl-2 transition-all block">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-purple-300 hover:pl-2 transition-all block">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-purple-300 hover:pl-2 transition-all block">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-purple-300 hover:pl-2 transition-all block">Contact</Link></li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-black text-lg mb-6 uppercase tracking-widest text-yellow-400">Say Hello</h4>
            <ul className="space-y-4 font-bold">
              <li><Link href="/terms" className="hover:text-yellow-300 hover:pl-2 transition-all block">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-yellow-300 hover:pl-2 transition-all block">Privacy Policy</Link></li>
              <li className="flex items-center gap-3 mt-6 text-slate-400 bg-slate-800 p-3 rounded-xl border border-slate-700"><Mail size={18} className="text-sky-400" /> hello@dolacode.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t-2 border-slate-800 text-center text-sm font-bold flex flex-col md:flex-row justify-between items-center text-slate-500">
          <p>© 2026 DolaCode Platform. All rights reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">Designed with <Heart size={16} className="text-pink-500 fill-pink-500" /> for kids everywhere.</p>
        </div>
      </footer>
    </div>
  );
}

