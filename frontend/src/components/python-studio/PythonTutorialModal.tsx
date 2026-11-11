'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Terminal, 
  Zap, 
  Coins, 
  Brain, 
  Trophy,
  CheckCircle2,
  Code2
} from 'lucide-react';

interface PythonTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClassNum?: number;
  onSelectClass?: (classNum: number) => void;
}

const PYTHON_TUTORIAL_STEPS = [
  {
    step: 1,
    title: 'Class 1: Robo Motion Island 🤖',
    subtitle: 'Python Commands & Sequencing',
    icon: Terminal,
    color: 'from-amber-500 to-orange-500',
    description: 'Learn real typed Python! Programs are executed line-by-line from top to bottom. Call commands like hero.move_right(3), hero.jump(), and hero.collect() to navigate the island.',
    tip: 'Pass numbers into parentheses like hero.move_right(2) to tell your robot how many steps to walk!',
    project: 'Project: Robo Treasure Run',
    sticker: '/assets/stickers/happy-robot.svg'
  },
  {
    step: 2,
    title: 'Class 2: Power Loop Realm ⚡',
    subtitle: 'For Loops & Repetition',
    icon: Zap,
    color: 'from-pink-500 to-purple-500',
    description: 'Don\'t Repeat Yourself (DRY)! Why type 15 repetitive lines when you can write a loop in 3 lines? Use "for step in range(5):" to repeat commands automatically.',
    tip: 'Make sure your loop commands are indented with spaces or tabs so Python knows they belong inside the loop.',
    project: 'Project: Cosmic Bridge Builder',
    sticker: '/assets/stickers/dino.svg'
  },
  {
    step: 3,
    title: 'Class 3: Variable Vault 💰',
    subtitle: 'Variables, Math & Score Counters',
    icon: Coins,
    color: 'from-emerald-500 to-teal-500',
    description: 'Variables are labeled storage boxes in your computer\'s memory! Store coins, add gold (coins = coins + 25), and calculate purchases (coins = coins - 15) to buy the Golden Key.',
    tip: 'Use print("Coins:", coins) to inspect variable values in the interactive console below the editor.',
    project: 'Project: Vault Master Heist',
    sticker: '/assets/stickers/gold-star.svg'
  },
  {
    step: 4,
    title: 'Class 4: Decision Dungeon 🧠',
    subtitle: 'Conditionals: If / Elif / Else',
    icon: Brain,
    color: 'from-cyan-500 to-blue-500',
    description: 'Smart robots make decisions based on sensors! Use "if color == \'red\':" to fire counter-beams, freeze barriers, and dodge traps.',
    tip: 'Don\'t forget the colon ":" at the end of if, elif, and else statements!',
    project: 'Project: Smart Scanner Drone',
    sticker: '/assets/stickers/leo-explorer.svg'
  },
  {
    step: 5,
    title: 'Class 5: Code Master Challenge 🐉',
    subtitle: 'Functions & Boss Battle',
    icon: Trophy,
    color: 'from-purple-500 to-indigo-600',
    description: 'Bundle multiple commands into custom superpowers using "def"! Create combo attacks, raise shields, and defeat the Cyber Dragon in an epic boss arena.',
    tip: 'Functions keep your code clean, modular, and reusable. Define once, call anywhere!',
    project: 'Final Project: Epic Cyber Dragon Defense',
    sticker: '/assets/stickers/rocket.svg'
  }
];

export default function PythonTutorialModal({ 
  isOpen, 
  onClose,
  currentClassNum,
  onSelectClass
}: PythonTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(
    currentClassNum ? Math.max(0, Math.min(PYTHON_TUTORIAL_STEPS.length - 1, currentClassNum - 1)) : 0
  );

  useEffect(() => {
    if (isOpen && currentClassNum) {
      setCurrentStep(Math.max(0, Math.min(PYTHON_TUTORIAL_STEPS.length - 1, currentClassNum - 1)));
    }
  }, [isOpen, currentClassNum]);

  if (!isOpen) return null;

  const stepData = PYTHON_TUTORIAL_STEPS[currentStep];
  const IconComponent = stepData.icon;

  const handleNext = () => {
    if (currentStep < PYTHON_TUTORIAL_STEPS.length - 1) {
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
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col text-slate-100 relative">
        
        {/* Top Header Banner */}
        <div className={`p-6 bg-gradient-to-r ${stepData.color} flex items-center justify-between relative`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <IconComponent size={26} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-900/80 bg-white/30 px-2 py-0.5 rounded-full">
                Class {stepData.step} of {PYTHON_TUTORIAL_STEPS.length}
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
              <img src={stepData.sticker} alt="Sticker" className="w-16 h-16 object-contain" />
            </div>
            <div>
              <h3 className="text-base font-black text-purple-300">
                {stepData.subtitle}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {stepData.description}
              </p>
            </div>
          </div>

          {/* Project Box */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3.5 flex items-center gap-3">
            <Trophy size={20} className="text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 block">Class Goal</span>
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
            {PYTHON_TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full cursor-pointer transition-all ${
                  i === currentStep ? 'w-6 bg-purple-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
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
            className="px-5 py-2 bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-300 hover:to-indigo-400 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <span>{currentStep === PYTHON_TUTORIAL_STEPS.length - 1 ? 'Start Coding! 🚀' : 'Next Class'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
