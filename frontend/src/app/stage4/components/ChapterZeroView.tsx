'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, CheckCircle2, ArrowRight, 
  BookOpen, Code, Star, Rocket, Smile, Zap
} from 'lucide-react';
import { usePythonStageStore } from '../store/usePythonStageStore';

interface ConceptModule {
  id: string;
  category: 'fundamentals' | 'logic' | 'data' | 'oop';
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  cardBg: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  codeSnippet: React.ReactNode;
  tip?: string;
}

export default function ChapterZeroView() {
  const { completeLevel, selectChapter, selectLevel } = usePythonStageStore();
  const [activeCategory, setActiveCategory] = useState<'all' | 'fundamentals' | 'logic' | 'data' | 'oop'>('all');

  const handleStartChapter1 = async () => {
    // Mark Chapter 0 complete and transition to Chapter 1 Level 1
    await completeLevel('ch0_l1');
    selectChapter(1);
    selectLevel('ch1_l1');
  };

  const conceptModules: ConceptModule[] = [
    {
      id: 'variables',
      category: 'fundamentals',
      icon: '📦',
      title: '1. Variables & Magic Boxes',
      subtitle: 'Data Containers',
      description: 'Variables are like labeled magic boxes that hold numbers, names, and secret game scores so you can use them anytime!',
      cardBg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100',
      borderColor: 'border-amber-300 hover:border-amber-500',
      badgeBg: 'bg-amber-200 text-amber-900 border-amber-300',
      badgeText: 'text-amber-700',
      codeSnippet: (
        <>
          <p><span className="text-emerald-400 font-bold">hp</span> = <span className="text-amber-300 font-bold">100</span> <span className="text-slate-400"># Player health</span></p>
          <p><span className="text-emerald-400 font-bold">name</span> = <span className="text-sky-300 font-bold">"Rover"</span> <span className="text-slate-400"># Robot name</span></p>
          <p><span className="text-emerald-400 font-bold">is_online</span> = <span className="text-purple-300 font-bold">True</span> <span className="text-slate-400"># Status</span></p>
        </>
      ),
      tip: 'Variables help your robot remember stats while exploring levels!'
    },
    {
      id: 'print',
      category: 'fundamentals',
      icon: '🗣️',
      title: '2. Print & Speech Bubble',
      subtitle: 'Console Communication',
      description: 'The print() statement lets your robot speak! It displays messages and scores on the terminal screen.',
      cardBg: 'bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-100',
      borderColor: 'border-sky-300 hover:border-sky-500',
      badgeBg: 'bg-sky-200 text-sky-900 border-sky-300',
      badgeText: 'text-sky-700',
      codeSnippet: (
        <>
          <p><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Hello Future Coder! 👋"</span>)</p>
          <p><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Current Points:"</span>, <span className="text-amber-300 font-bold">150</span>)</p>
        </>
      ),
      tip: 'Put text inside quote marks " " so Python knows it is words!'
    },
    {
      id: 'datatypes',
      category: 'fundamentals',
      icon: '🔠',
      title: '3. Data Types & Numbers',
      subtitle: 'Text, Integers & Booleans',
      description: 'Python uses different types of building blocks: Numbers (123), Words ("hello"), Decimals (9.5), and True/False!',
      cardBg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100',
      borderColor: 'border-rose-300 hover:border-rose-500',
      badgeBg: 'bg-rose-200 text-rose-900 border-rose-300',
      badgeText: 'text-rose-700',
      codeSnippet: (
        <>
          <p><span className="text-emerald-400 font-bold">level</span> = <span className="text-amber-300 font-bold">5</span> <span className="text-slate-400"># Whole number (int)</span></p>
          <p><span className="text-emerald-400 font-bold">speed</span> = <span className="text-amber-300 font-bold">12.5</span> <span className="text-slate-400"># Decimal (float)</span></p>
          <p><span className="text-emerald-400 font-bold">status</span> = <span className="text-sky-300 font-bold">"Level "</span> + <span className="text-sky-300 font-bold">str</span>(<span className="text-emerald-400 font-bold">level</span>)</p>
        </>
      ),
      tip: 'Use str(5) to turn numbers into text words so you can combine them!'
    },
    {
      id: 'conditionals',
      category: 'logic',
      icon: '🌿',
      title: '4. Decision Logic (If / Else)',
      subtitle: 'Smart Branching Choices',
      description: 'Make your robot super smart! Use if/else so your robot decides what action to take based on the situation.',
      cardBg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
      borderColor: 'border-emerald-300 hover:border-emerald-500',
      badgeBg: 'bg-emerald-200 text-emerald-900 border-emerald-300',
      badgeText: 'text-emerald-700',
      codeSnippet: (
        <>
          <p><span className="text-purple-300 font-bold">if</span> <span className="text-emerald-400 font-bold">hp</span> &lt; <span className="text-amber-300 font-bold">50</span>:</p>
          <p className="pl-4"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Drink repair potion! 🧪"</span>)</p>
          <p><span className="text-purple-300 font-bold">else</span>:</p>
          <p className="pl-4"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Engage laser beam! ⚡"</span>)</p>
        </>
      ),
      tip: 'Don\'t forget the colon ":" at the end of if and else lines!'
    },
    {
      id: 'loops',
      category: 'logic',
      icon: '🔁',
      title: '5. Super Loops',
      subtitle: 'Automatic Repetition',
      description: 'Instead of writing the same command 100 times, a loop repeats your code automatically as many times as you want!',
      cardBg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
      borderColor: 'border-purple-300 hover:border-purple-500',
      badgeBg: 'bg-purple-200 text-purple-900 border-purple-300',
      badgeText: 'text-purple-700',
      codeSnippet: (
        <>
          <p><span className="text-slate-400"># Repeat 3 times:</span></p>
          <p><span className="text-purple-300 font-bold">for</span> i <span className="text-purple-300 font-bold">in</span> <span className="text-sky-300 font-bold">range</span>(<span className="text-amber-300 font-bold">3</span>):</p>
          <p className="pl-4"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Collect shiny gem! 💎"</span>)</p>
        </>
      ),
      tip: 'range(3) runs the code inside 3 times!'
    },
    {
      id: 'functions',
      category: 'logic',
      icon: '⚡',
      title: '6. Superpower Functions',
      subtitle: 'Custom Reusable Moves',
      description: 'Functions pack a group of actions into one superpower move! Give it a name and call it anytime.',
      cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
      borderColor: 'border-orange-300 hover:border-orange-500',
      badgeBg: 'bg-orange-200 text-orange-900 border-orange-300',
      badgeText: 'text-orange-700',
      codeSnippet: (
        <>
          <p><span className="text-purple-300 font-bold">def</span> <span className="text-blue-300 font-bold">blast</span>():</p>
          <p className="pl-4"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"FIREBALL BLAST! 🔥"</span>)</p>
          <p>&nbsp;</p>
          <p><span className="text-blue-300 font-bold">blast</span>() <span className="text-slate-400"># Launch superpower!</span></p>
        </>
      ),
      tip: 'Create custom moves like blast() or jump() with def!'
    },
    {
      id: 'lists',
      category: 'data',
      icon: '🎒',
      title: '7. Inventory Lists',
      subtitle: 'Item Collections',
      description: 'Lists are like backpacks! Store items, swords, and potions together inside square brackets [ ].',
      cardBg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100',
      borderColor: 'border-indigo-300 hover:border-indigo-500',
      badgeBg: 'bg-indigo-200 text-indigo-900 border-indigo-300',
      badgeText: 'text-indigo-700',
      codeSnippet: (
        <>
          <p><span className="text-emerald-400 font-bold">bag</span> = [<span className="text-sky-300 font-bold">"sword"</span>, <span className="text-sky-300 font-bold">"shield"</span>, <span className="text-sky-300 font-bold">"potion"</span>]</p>
          <p><span className="text-yellow-300 font-bold">print</span>(<span className="text-emerald-400 font-bold">bag</span>[<span className="text-amber-300 font-bold">0</span>]) <span className="text-slate-400"># Gets "sword"</span></p>
          <p><span className="text-emerald-400 font-bold">bag</span>.<span className="text-blue-300 font-bold">append</span>(<span className="text-sky-300 font-bold">"gem"</span>) <span className="text-slate-400"># Adds item</span></p>
        </>
      ),
      tip: 'Python lists start counting at item 0!'
    },
    {
      id: 'dictionaries',
      category: 'data',
      icon: '📇',
      title: '8. Creature Dictionaries',
      subtitle: 'Key-Value Profiles',
      description: 'Dictionaries store creature profiles with key names like "power" and "type" inside curly braces { }!',
      cardBg: 'bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-100',
      borderColor: 'border-teal-300 hover:border-teal-500',
      badgeBg: 'bg-teal-200 text-teal-900 border-teal-300',
      badgeText: 'text-teal-700',
      codeSnippet: (
        <>
          <p><span className="text-emerald-400 font-bold">dragon</span> = {'{'}</p>
          <p className="pl-4"><span className="text-sky-300 font-bold">"name"</span>: <span className="text-sky-300 font-bold font-bold">"Draco"</span>,</p>
          <p className="pl-4"><span className="text-sky-300 font-bold">"power"</span>: <span className="text-amber-300 font-bold">95</span></p>
          <p>{'}'}</p>
          <p><span className="text-yellow-300 font-bold">print</span>(<span className="text-emerald-400 font-bold">dragon</span>[<span className="text-sky-300 font-bold">"name"</span>])</p>
        </>
      ),
      tip: 'Use key names to look up stats instantly!'
    },
    {
      id: 'classes',
      category: 'oop',
      icon: '🏗️',
      title: '9. Robot Classes & Blueprints',
      subtitle: 'Build Custom AI Companions',
      description: 'Classes are blueprints for building custom companion bots with names, greetings, and special talents!',
      cardBg: 'bg-gradient-to-br from-fuchsia-50 via-pink-50 to-fuchsia-100',
      borderColor: 'border-fuchsia-300 hover:border-fuchsia-500',
      badgeBg: 'bg-fuchsia-200 text-fuchsia-900 border-fuchsia-300',
      badgeText: 'text-fuchsia-700',
      codeSnippet: (
        <>
          <p><span className="text-purple-300 font-bold">class</span> <span className="text-blue-300 font-bold font-black">Companion</span>:</p>
          <p className="pl-4"><span className="text-purple-300 font-bold">def</span> <span className="text-blue-300 font-bold">greet</span>(<span className="text-purple-300 font-bold">self</span>):</p>
          <p className="pl-8"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Beep Boop! I am Sparky 🤖"</span>)</p>
          <p>&nbsp;</p>
          <p><span className="text-emerald-400 font-bold">bot</span> = <span className="text-blue-300 font-bold">Companion</span>()</p>
          <p><span className="text-emerald-400 font-bold">bot</span>.<span className="text-blue-300 font-bold">greet</span>()</p>
        </>
      ),
      tip: 'Classes let you create dozens of unique game characters!'
    },
    {
      id: 'errorhandling',
      category: 'oop',
      icon: '🛡️',
      title: '10. Error Shield Protection',
      subtitle: 'Try & Except Defense',
      description: 'Try/Except blocks protect your code from accidental bugs and glitches so your game never crashes!',
      cardBg: 'bg-gradient-to-br from-rose-50 via-red-50 to-rose-100',
      borderColor: 'border-rose-300 hover:border-rose-500',
      badgeBg: 'bg-rose-200 text-rose-900 border-rose-300',
      badgeText: 'text-rose-700',
      codeSnippet: (
        <>
          <p><span className="text-purple-300 font-bold">try</span>:</p>
          <p className="pl-4"><span className="text-emerald-400 font-bold">result</span> = <span className="text-amber-300 font-bold">100</span> / <span className="text-amber-300 font-bold">0</span></p>
          <p><span className="text-purple-300 font-bold">except</span>:</p>
          <p className="pl-4"><span className="text-yellow-300 font-bold">print</span>(<span className="text-sky-300 font-bold">"Shield activated! Bug blocked 🛡️"</span>)</p>
        </>
      ),
      tip: 'Error shields keep your robot running smoothly!'
    }
  ];

  const filteredModules = conceptModules.filter(m => 
    activeCategory === 'all' ? true : m.category === activeCategory
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-amber-50/60 via-purple-50/40 to-sky-50/80 p-4 sm:p-8 space-y-8 font-sans">
      
      {/* Playful Colorful Hero Header Banner */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 border-4 border-white/80 rounded-[36px] p-6 sm:p-10 shadow-2xl relative overflow-hidden text-white">
        {/* Playful background decorative shapes */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-2 right-10 text-6xl opacity-30 select-none pointer-events-none">🚀</div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-widest">
            <span className="bg-white/25 backdrop-blur-md border border-white/40 px-3.5 py-1.5 rounded-full text-white flex items-center gap-1.5 shadow-md">
              <Sparkles size={14} className="text-yellow-200 animate-spin" /> Chapter 0: Kid Coding Academy 🎈
            </span>
            <span className="bg-emerald-400 text-slate-950 font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Star size={14} fill="currentColor" /> Beginner Friendly
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
            Welcome to Python Quest! 🐍✨
          </h1>

          <p className="text-sm sm:text-lg text-purple-50 font-bold leading-relaxed max-w-3xl drop-shadow-sm">
            Learn Python concepts with magic boxes, superpower moves, and friendly bot companions before launching into coding missions!
          </p>
        </div>
      </div>

      {/* Colorful Category Filter Buttons */}
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-3xl border-2 border-purple-100 shadow-lg">
          <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
            <BookOpen className="text-pink-500" size={22} />
            <span>⭐ Pick a Topic to Explore:</span>
          </div>

          {/* Bright Pill Buttons */}
          <div className="flex flex-wrap gap-2 text-xs font-black">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-2xl border-2 transition-all transform active:scale-95 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-400/50 scale-105'
                  : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              🌈 All Topics (10)
            </button>
            <button
              onClick={() => setActiveCategory('fundamentals')}
              className={`px-4 py-2 rounded-2xl border-2 transition-all transform active:scale-95 cursor-pointer ${
                activeCategory === 'fundamentals'
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-400/50 scale-105'
                  : 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              📦 Basics
            </button>
            <button
              onClick={() => setActiveCategory('logic')}
              className={`px-4 py-2 rounded-2xl border-2 transition-all transform active:scale-95 cursor-pointer ${
                activeCategory === 'logic'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-400/50 scale-105'
                  : 'bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              ⚡ Logic & Loops
            </button>
            <button
              onClick={() => setActiveCategory('data')}
              className={`px-4 py-2 rounded-2xl border-2 transition-all transform active:scale-95 cursor-pointer ${
                activeCategory === 'data'
                  ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-400/50 scale-105'
                  : 'bg-white border-sky-200 text-sky-700 hover:bg-sky-50'
              }`}
            >
              🎒 Backpack & Data
            </button>
            <button
              onClick={() => setActiveCategory('oop')}
              className={`px-4 py-2 rounded-2xl border-2 transition-all transform active:scale-95 cursor-pointer ${
                activeCategory === 'oop'
                  ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-400/50 scale-105'
                  : 'bg-white border-pink-200 text-pink-700 hover:bg-pink-50'
              }`}
            >
              🤖 Bots & Shields
            </button>
          </div>
        </div>

        {/* Colorful Modules Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredModules.map((module) => (
              <motion.div
                key={module.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className={`${module.cardBg} border-3 ${module.borderColor} rounded-[32px] p-6 space-y-4 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 shadow-md flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shrink-0">
                        {module.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{module.title}</h3>
                        <span className={`text-[11px] font-black uppercase tracking-wider ${module.badgeText}`}>
                          {module.subtitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 leading-relaxed font-bold">
                    {module.description}
                  </p>

                  {/* Dark code editor box for high readability */}
                  <div className="bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 font-mono text-xs text-indigo-300 space-y-1 shadow-inner overflow-x-auto">
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Code size={12} className="text-yellow-400" /> Python Code Example:
                    </div>
                    {module.codeSnippet}
                  </div>
                </div>

                {module.tip && (
                  <div className="mt-2 text-[11px] text-slate-800 bg-white/90 border border-slate-200 p-3 rounded-2xl font-bold flex items-start gap-2 shadow-sm">
                    <span className="text-amber-500 font-black text-xs">💡 Pro Tip:</span>
                    <span>{module.tip}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Playful Next Chapter Action Card */}
      <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 border-4 border-white p-6 sm:p-8 rounded-[36px] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl text-white">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider text-emerald-950">
            <CheckCircle2 size={16} className="text-emerald-950" /> Training Handbook Complete!
          </div>
          <h3 className="text-2xl font-black">Ready to Code Rover's Missions?</h3>
          <p className="text-xs font-bold text-teal-50">
            You've explored all Python topics! Click below to start live coding missions in Chapter 1!
          </p>
        </div>

        <button
          onClick={handleStartChapter1}
          className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl flex items-center gap-2.5 shadow-xl shadow-teal-950/30 transform hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer border-2 border-yellow-200"
        >
          <span>Start Chapter 1 Missions 🚀</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
