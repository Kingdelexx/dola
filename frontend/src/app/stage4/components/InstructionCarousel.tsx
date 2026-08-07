'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Code, Sparkles, Star } from 'lucide-react';
import { PythonLevel } from '../data/pythonLevels';

interface InstructionCarouselProps {
  level: PythonLevel;
}

interface SlideItem {
  id: string;
  tag: string;
  title: string;
  icon: string;
  type: string;
  content?: string;
  description?: string;
  codeSnippet?: string;
  highlight?: string;
}

export default function InstructionCarousel({ level }: InstructionCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Reset slide index whenever active level changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [level.id]);

  // Generate interactive instruction cards dynamically
  const generateSlides = (): SlideItem[] => {
    if (level.chapter === 0) {
      return [
        {
          id: 'welcome',
          tag: 'Card 1 of 5',
          title: 'Welcome to World 4: Python Quest! 🚀',
          icon: '🤖',
          type: 'intro',
          content: "Before coding Rover's missions, let's master the core programming concepts that power every Python script!",
          highlight: 'Click Next to learn about Variables, Loops, and Functions.'
        },
        {
          id: 'concept_vars',
          tag: 'Card 2 of 5',
          title: '1. Variables 📦',
          icon: '📦',
          type: 'concept',
          description: 'Variables are containers that store data in system memory for later access.',
          codeSnippet: '# Storing data in variables:\nhp = 100\nname = "Rover"'
        },
        {
          id: 'concept_loops',
          tag: 'Card 3 of 5',
          title: '2. Loops 🔁',
          icon: '🔁',
          type: 'concept',
          description: 'Loops repeat a block of code multiple times without typing it over and over.',
          codeSnippet: '# Repeating actions with a loop:\nfor i in range(3):\n    print("collect")'
        },
        {
          id: 'concept_funcs',
          tag: 'Card 4 of 5',
          title: '3. Functions ⚡',
          icon: '⚡',
          type: 'concept',
          description: 'Functions are reusable groups of instructions packed into a single callable routine.',
          codeSnippet: '# Defining a custom routine:\ndef blast():\n    print("fireball!")'
        },
        {
          id: 'objective',
          tag: 'Card 5 of 5',
          title: '🎯 Quest Objective',
          icon: '🎯',
          type: 'objective',
          content: level.instructions,
          highlight: 'Type print("Calibrated") in the Python Code Console below and click Execute!'
        }
      ];
    }

    // Default 2-slide layout for other levels
    return [
      {
        id: 'story',
        tag: 'Card 1 of 2',
        title: level.title,
        icon: '📜',
        type: 'story',
        content: level.narrative
      },
      {
        id: 'objective',
        tag: 'Card 2 of 2',
        title: '🎯 Quest Objective',
        icon: '🎯',
        type: 'objective',
        content: level.instructions,
        highlight: 'Complete the objective in the editor below and execute your script!'
      }
    ];
  };

  const slides = generateSlides();
  const totalSlides = slides.length;

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const slide = slides[currentSlide];

  return (
    <div className="w-full bg-gradient-to-br from-amber-50/90 via-purple-50/90 to-sky-50/90 border-4 border-purple-200 rounded-[32px] p-5 shadow-xl relative overflow-hidden flex flex-col gap-3 shrink-0 select-none text-slate-900">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b-2 border-purple-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-purple-600" />
          <span className="text-xs font-black text-purple-950 tracking-wider uppercase">⭐ Mission Guide Cards</span>
          <span className="text-[10px] bg-purple-200 border border-purple-300 text-purple-900 font-black px-3 py-0.5 rounded-full">
            {slide.tag}
          </span>
        </div>

        {/* Carousel pagination indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-6 bg-purple-600 shadow-md' : 'w-2.5 bg-purple-200 hover:bg-purple-300'
              }`}
              title={`Go to card ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Slide Content with AnimatePresence */}
      <div className="min-h-[145px] flex flex-col justify-center relative py-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-3xl bg-white p-2 rounded-2xl border-2 border-purple-200 shadow-md">{slide.icon}</span>
              <h3 className="text-base font-black text-slate-900 tracking-wide">{slide.title}</h3>
            </div>

            {slide.content && (
              <p className="text-xs text-slate-800 leading-relaxed font-bold bg-white/80 p-3.5 rounded-2xl border-2 border-purple-100 shadow-sm">
                {slide.content}
              </p>
            )}

            {slide.description && (
              <p className="text-xs text-slate-800 font-bold leading-relaxed bg-white/60 p-3 rounded-2xl border border-purple-100">
                {slide.description}
              </p>
            )}

            {slide.codeSnippet && (
              <div className="bg-slate-950 p-3.5 rounded-2xl border-2 border-slate-800 font-mono text-xs text-indigo-300 leading-relaxed shadow-inner">
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Code size={12} /> Python Code Example:
                </div>
                <pre className="whitespace-pre-wrap">{slide.codeSnippet}</pre>
              </div>
            )}

            {slide.highlight && (
              <div className="text-[11px] font-extrabold text-amber-900 bg-amber-100 border-2 border-amber-300 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                <Sparkles size={14} className="text-amber-600 shrink-0 animate-bounce" />
                <span>{slide.highlight}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex items-center justify-between border-t-2 border-purple-100 pt-3 text-xs font-black text-purple-900">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white hover:bg-purple-50 border-2 border-purple-200 text-purple-900 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>

        <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest bg-purple-100 px-3 py-1 rounded-full">
          Card {currentSlide + 1} of {totalSlides}
        </span>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black shadow-md shadow-purple-400/40 transition-all active:scale-95 cursor-pointer border-2 border-purple-400"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
