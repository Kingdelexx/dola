'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Smartphone, 
  Zap, 
  Heart, 
  HelpCircle, 
  Trophy,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClassNum?: number;
  onSelectClass?: (classNum: number) => void;
}

const APP_TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Class 1: App Builder Playground 📱',
    subtitle: 'Understand app screens and components!',
    icon: Smartphone,
    color: 'from-amber-500 to-orange-500',
    description: 'Every mobile app is made of visual building blocks: Buttons to tap, Pictures for mascots, Labels for titles, and Text Boxes for typing!',
    tip: 'Drag or tap components onto the phone simulator screen. Watch DolaCode reveal how each component is configured.',
    project: 'Project: My First Hello App',
    sticker: '/assets/stickers/happy-robot.svg'
  },
  {
    step: 2,
    title: 'Class 2: Magic Button Lab ⚡',
    subtitle: 'Understand events and actions!',
    icon: Zap,
    color: 'from-pink-500 to-purple-500',
    description: 'Connect visual blocks: WHEN button tapped → show message, play sound, change picture, or update score!',
    tip: 'Events give buttons superpowers. When a finger taps a button, your code executes immediately.',
    project: 'Project: Funny Soundboard App',
    sticker: '/assets/stickers/dino.svg'
  },
  {
    step: 3,
    title: 'Class 3: Smart Pet App 🐾',
    subtitle: 'Learn variables, conditions and state!',
    icon: Heart,
    color: 'from-emerald-500 to-teal-500',
    description: 'Build a virtual pet whose Happiness, Hunger, and Energy change when buttons are pressed! Use IF/ELSE conditions to change mood.',
    tip: 'Variables are containers for numbers that change. If hunger > 80, the pet gets hungry!',
    project: 'Project: My Virtual Pet',
    sticker: '/assets/stickers/leo-explorer.svg'
  },
  {
    step: 4,
    title: 'Class 4: Quiz & Game Factory 🎮',
    subtitle: 'Learn screens, navigation, lists and scoring!',
    icon: HelpCircle,
    color: 'from-cyan-500 to-blue-500',
    description: 'Build a quiz with multiple questions, answer choices, scores, and a celebration results screen! Use setScreen() to move between pages.',
    tip: 'Multi-screen apps let users journey from Start Screen to Question Screen and final Results Trophy screen.',
    project: 'Project: My Own Quiz App',
    sticker: '/assets/stickers/gold-star.svg'
  },
  {
    step: 5,
    title: 'Class 5: App Inventor Challenge 🚀',
    subtitle: 'Create a useful app independently!',
    icon: Trophy,
    color: 'from-purple-500 to-indigo-600',
    description: 'Choose between a Savings Tracker (with Nigerian Naira ₦ prices), Study Planner, Homework Organiser, or Reading Tracker.',
    tip: 'Preview your complete mobile app live and share your project link with family and friends!',
    project: 'Final Project: Completed App with Preview & Shareable Link',
    sticker: '/assets/stickers/rocket.svg'
  }
];

export default function AppTutorialModal({ 
  isOpen, 
  onClose,
  currentClassNum,
  onSelectClass
}: AppTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(
    currentClassNum ? Math.max(0, Math.min(APP_TUTORIAL_STEPS.length - 1, currentClassNum - 1)) : 0
  );

  React.useEffect(() => {
    if (isOpen && currentClassNum) {
      setCurrentStep(Math.max(0, Math.min(APP_TUTORIAL_STEPS.length - 1, currentClassNum - 1)));
    }
  }, [isOpen, currentClassNum]);

  if (!isOpen) return null;

  const stepData = APP_TUTORIAL_STEPS[currentStep];
  const IconComponent = stepData.icon;

  const handleNext = () => {
    if (currentStep < APP_TUTORIAL_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      if (onSelectClass) onSelectClass(stepData.step);
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
      <div className="bg-slate-900 border-2 border-emerald-400/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-100 relative">
        
        {/* Top Header Banner */}
        <div className={`p-6 bg-gradient-to-r ${stepData.color} flex items-center justify-between relative`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <IconComponent size={26} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 bg-white/30 px-2 py-0.5 rounded-full">
                Class {stepData.step} of {APP_TUTORIAL_STEPS.length}
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
              <h3 className="text-base font-black text-emerald-300">
                {stepData.subtitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {stepData.description}
              </p>
            </div>
          </div>

          {/* Project Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3">
            <Trophy size={20} className="text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Class Goal</span>
              <p className="text-xs font-black text-white">{stepData.project}</p>
            </div>
          </div>

          {/* Tip Box */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
            <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Pro Tip:</strong> {stepData.tip}</span>
          </div>

          {/* Stepper Dots */}
          <div className="flex justify-center gap-2 pt-2">
            {APP_TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  i === currentStep ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
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
            className="px-5 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <span>{currentStep === APP_TUTORIAL_STEPS.length - 1 ? 'Start Building! 📱' : 'Next Class'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
