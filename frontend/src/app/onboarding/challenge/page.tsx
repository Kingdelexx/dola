"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Rocket, Brain, Award, Play, ChevronRight, Activity, SkipForward, ArrowRight, Star } from 'lucide-react';
import RocketLoader from '@/components/RocketLoader';

interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Sequencing & Logic",
    question: "DolaBot wants to reach a star 2 steps straight ahead. What instruction works?",
    options: [
      "Move right 2 steps",
      "Move forward 2 steps",
      "Turn left and jump",
      "Repeat slide"
    ],
    correctIndex: 1
  },
  {
    id: 2,
    category: "Pattern Recognition",
    question: "Finish the number pattern sequence: 2, 4, 8, 16, ___",
    options: [
      "18",
      "20",
      "32",
      "64"
    ],
    correctIndex: 2
  },
  {
    id: 3,
    category: "Loop Optimization",
    question: "DolaBot needs to take 4 steps forward. What's the best block command?",
    options: [
      "Walk forward 4 separate times manually",
      "Repeat 4 times: Walk forward",
      "Turn around 4 times",
      "Walk forward 10 steps"
    ],
    correctIndex: 1
  },
  {
    id: 4,
    category: "Debugging & Reasoning",
    question: "Spot the bug: age = input() ... if age >= 12 will throw an error because:",
    options: [
      "We wrote input instead of print",
      "The input age is text (string), but 12 is a number (integer)",
      "We misspelled DolaBot's command",
      "Python does not know what 12 means"
    ],
    correctIndex: 1
  },
  {
    id: 5,
    category: "Variables & Math",
    question: "If a variable x = 5, what value does x + 3 evaluate to?",
    options: [
      "5",
      "3",
      "8",
      "53"
    ],
    correctIndex: 2
  }
];

export default function OnboardingChallengePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Auto skip if this user already completed the challenge or has is teacher/parent
  useEffect(() => {
    if (user) {
      if (user.profile?.role && user.profile.role !== 'student') {
        router.push('/dashboard');
      } else if (user.profile?.starting_score !== null && user.profile?.starting_score !== undefined) {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleNext = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate final score
      let finalScore = 0;
      QUESTIONS.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctIndex) {
          finalScore += 20; // 20 points per question
        }
      });
      setScore(finalScore);
      setFinished(true);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/onboarding-diagnostic/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: 0 })
      });
      const data = await response.json();
      if (response.ok) {
        // Update user state context
        login(localStorage.getItem('token') || '', data.user);
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitScore = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/onboarding-diagnostic/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ score: score })
      });
      const data = await response.json();
      if (response.ok) {
        login(localStorage.getItem('token') || '', data.user);
        router.push('/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch {
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = QUESTIONS[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-pink-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <RocketLoader isLoading={isLoading} title="Updating Mission Control..." subTitle="Analyzing your starting capabilities..." />
      
      {!finished ? (
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-6 sm:p-10 border-4 border-indigo-200 shadow-2xl flex flex-col justify-between min-h-[500px]">
          {/* Top Panel progress */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-black">
                ✨ Diagnostic Assessment
              </div>
              <button 
                onClick={handleSkip}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-650 transition-colors"
              >
                Skip Assessment <SkipForward size={14} />
              </button>
            </div>

            <div className="flex gap-1.5 mb-8">
              {QUESTIONS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                    idx === currentIndex 
                      ? 'bg-indigo-500 scale-y-110 shadow-sm' 
                      : idx < currentIndex 
                      ? 'bg-indigo-300' 
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="text-left">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                Topic: {currentQuestion.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 mt-3 mb-6 leading-snug">
                {currentQuestion.question}
              </h1>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedOption(optIdx)}
                    className={`w-full p-4 text-left rounded-2xl border-2 font-bold text-sm sm:text-base transition-all flex items-center gap-3 active:scale-99 cursor-pointer ${
                      selectedOption === optIdx
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 shadow-md ring-4 ring-indigo-50'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                      selectedOption === optIdx
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-350 bg-slate-100 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="py-3 px-6 bg-gradient-to-r from-indigo-500 to-sky-500 disabled:from-slate-300 disabled:to-slate-400 text-white font-black text-base rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-md disabled:cursor-not-allowed"
            >
              <span>{currentIndex === QUESTIONS.length - 1 ? "Finish Assessment" : "Next Question"}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-10 border-4 border-emerald-400 shadow-2xl flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-200 rounded-full border-4 border-white flex items-center justify-center text-5xl mb-6 shadow-xl relative animate-bounce">
            <Star className="text-yellow-500 fill-yellow-400 absolute -top-1 -right-1 w-8 h-8 rotate-12" />
            🎉
          </div>
          
          <h1 className="text-3xl font-black text-slate-800 mb-2">Great Job!</h1>
          <p className="text-slate-500 font-semibold text-sm mb-6">You've successfully completed the baseline challenge!</p>

          <div className="bg-emerald-50 border-2 border-emerald-100 p-5 rounded-2xl w-full mb-8 relative">
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider mb-1">Assigned Score</div>
            <div className="text-4xl font-extrabold text-slate-800">{score} / 100 XP</div>
            
            <div className="mt-4 text-xs font-bold text-slate-650 bg-white border border-emerald-100 py-1.5 px-3 rounded-full inline-block">
              Band: <span className="font-extrabold text-emerald-600">{user?.profile?.learning_band || 'Explorer'}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitScore}
            className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-lg active:scale-95 transition-all"
          >
            Enter Mission Control 🚀
          </button>
        </div>
      )}
    </div>
  );
}
