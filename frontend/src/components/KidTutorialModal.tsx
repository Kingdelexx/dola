'use client';

import React, { useState } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, Rocket, Code2, Paintbrush, Play, CheckCircle2, Star } from 'lucide-react';

interface KidTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Welcome to Web Studio! 🚀',
    subtitle: 'You are now a Web Developer!',
    icon: Rocket,
    color: 'from-amber-500 to-orange-500',
    description: 'Websites are built using two main superpowers: HTML for building stuff, and CSS for styling stuff!',
    tip: 'No complicated setup needed — write code on the left and see your website come to life on the right stage!',
    sticker: '/assets/hero.png'
  },
  {
    step: 2,
    title: '1. HTML Studio (The Skeleton 🦴)',
    subtitle: 'Build headings, buttons, and pictures!',
    icon: Code2,
    color: 'from-amber-400 to-yellow-400',
    description: 'HTML tags tell the browser what to show. For example, <h1> is for BIG titles and <button> creates clickable buttons!',
    tip: 'Click the "+ Insert Sticker / Photo" button on the HTML tab to drop cool heroes, dinos, and rockets into your code!',
    sticker: '/assets/stickers/leo-explorer.svg'
  },
  {
    step: 3,
    title: '2. Magic CSS (The Paintbrush 🎨)',
    subtitle: 'Give your site awesome colors & glows!',
    icon: Paintbrush,
    color: 'from-sky-400 to-blue-500',
    description: 'CSS rules make your site look magical! Change background colors, add rounded borders, and make things shine.',
    tip: 'Click the row of visual Color Swatch dots above the CSS editor to quickly copy and paint colors into your site!',
    sticker: '/assets/stickers/happy-robot.svg'
  },
  {
    step: 4,
    title: '3. Live Stage & Saving 💾',
    subtitle: 'See live results and celebrate your wins!',
    icon: Play,
    color: 'from-emerald-400 to-teal-500',
    description: 'Your live stage updates instantly as you type! Click "Save Draft" anytime to keep your work safe.',
    tip: 'When you complete your mission goals, click "Submit Mission 🚀" to launch confetti and earn 50 XP!',
    sticker: '/assets/stickers/gold-star.svg'
  }
];

export default function KidTutorialModal({ isOpen, onClose }: KidTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stepData = TUTORIAL_STEPS[currentStep];
  const IconComponent = stepData.icon;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-100 relative">
        
        {/* Top Header Banner */}
        <div className={`p-6 bg-gradient-to-r ${stepData.color} flex items-center justify-between relative`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <IconComponent size={24} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 bg-white/30 px-2 py-0.5 rounded-full">
                Step {stepData.step} of {TUTORIAL_STEPS.length}
              </span>
              <h2 className="text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">
                {stepData.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-900/80 hover:text-slate-950 bg-white/20 hover:bg-white/40 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 shrink-0 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-center p-2">
              <img src={stepData.sticker} alt="Tutorial Illustration" className="max-w-full max-h-full object-contain drop-shadow-lg" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-amber-300 text-sm mb-1">{stepData.subtitle}</h3>
              <p className="text-slate-300 text-xs leading-relaxed">{stepData.description}</p>
            </div>
          </div>

          {/* Kid Tip Box */}
          <div className="bg-slate-950/80 border border-amber-400/30 p-4 rounded-2xl flex items-start gap-3">
            <Sparkles className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-xs font-black text-amber-400 block mb-0.5">PRO TIP:</span>
              <p className="text-xs text-slate-300 leading-normal">{stepData.tip}</p>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 py-1">
            {TUTORIAL_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStep(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-amber-400' : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? "Let's Code! 🎉" : "Next Step"}</span>
            {currentStep === TUTORIAL_STEPS.length - 1 ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}
