'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Rocket, 
  Code2, 
  Paintbrush, 
  Play, 
  Zap, 
  ShoppingCart, 
  Trophy,
  CheckCircle2,
  Globe
} from 'lucide-react';

interface KidTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Class 1: Website Builder Island 🏝️',
    subtitle: 'Learn HTML without memorising HTML!',
    icon: Code2,
    color: 'from-amber-500 to-orange-500',
    description: 'Children drag headings, pictures, buttons, and paragraphs onto a blank webpage. When you drag a heading, DolaCode reveals <h1>Hello!</h1> live!',
    tip: 'No memorisation needed! Just pick your block, place it, and watch DolaCode show you the real HTML tags.',
    project: 'Project: My First Webpage',
    sticker: '/assets/stickers/leo-explorer.svg'
  },
  {
    step: 2,
    title: 'Class 2: Colour Magic Kingdom 🎨',
    subtitle: 'Learn CSS through creative design!',
    icon: Paintbrush,
    color: 'from-pink-500 to-purple-500',
    description: 'Change colours, fonts, borders, backgrounds and layouts. Decorate a dull grey website and instantly see the magic transformation!',
    tip: 'Move the sliders and pick gradient swatches to reveal the exact CSS styling rules in real-time.',
    project: 'Project: My Colourful Personal Website',
    sticker: '/assets/stickers/gold-star.svg'
  },
  {
    step: 3,
    title: 'Class 3: Button Power City ⚡',
    subtitle: 'Learn basic JavaScript through actions!',
    icon: Zap,
    color: 'from-cyan-500 to-blue-500',
    description: 'Make buttons change colours, display secret messages, count clicks, and reveal hidden treasures when clicked!',
    tip: 'JavaScript gives websites a brain! Click triggers like onclick="addGift()" bring your buttons to life.',
    project: 'Project: Interactive Birthday Website',
    sticker: '/assets/stickers/happy-robot.svg'
  },
  {
    step: 4,
    title: 'Class 4: My Online Shop 🛒',
    subtitle: 'Combine HTML, CSS and JavaScript!',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-teal-500',
    description: 'Create a virtual store for books, snacks, or toys. Add products, display real Naira (₦) prices, and calculate a live shopping basket total!',
    tip: 'Simulate the complete e-commerce experience safely with zero real payments or banking needed.',
    project: 'Project: My First Online Store',
    sticker: '/assets/stickers/dino.svg'
  },
  {
    step: 5,
    title: 'Class 5: Web Creator Challenge 🚀',
    subtitle: 'Build an original, responsive website!',
    icon: Trophy,
    color: 'from-purple-500 to-indigo-600',
    description: 'Choose between a school website, portfolio, animal club, story website, or small business website. Test on Desktop, Tablet & Mobile!',
    tip: 'Preview your website across different screen sizes and generate a shareable project link to show family and friends!',
    project: 'Final Project: Finished Responsive Website + Shareable Preview',
    sticker: '/assets/stickers/rocket.svg'
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
              <IconComponent size={26} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 bg-white/30 px-2 py-0.5 rounded-full">
                Class {stepData.step} of {TUTORIAL_STEPS.length}
              </span>
              <h2 className="text-xl font-extrabold text-white drop-shadow-sm tracking-tight mt-0.5">
                {stepData.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-800/80 rounded-2xl p-2 border border-slate-700/80 flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stepData.sticker} alt="Sticker" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-300">
                {stepData.subtitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {stepData.description}
              </p>
            </div>
          </div>

          {/* Project Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
            <Trophy size={20} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Class Goal</span>
              <p className="text-xs font-black text-white">{stepData.project}</p>
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Pro Tip:</strong> {stepData.tip}</span>
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-center gap-2 pt-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  i === currentStep ? 'w-6 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <span>{currentStep === TUTORIAL_STEPS.length - 1 ? 'Start Exploring! 🚀' : 'Next Class'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
