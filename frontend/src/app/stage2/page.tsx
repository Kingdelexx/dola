'use client';
import { useState, useRef, useEffect } from 'react';
import BlocklyEditor from '@/components/BlocklyEditor';
import PyodideRunner from '@/components/PyodideRunner';
import ScratchStage from '@/components/ScratchStage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/components/FeedbackModal';
import LizzyChat from '@/components/LizzyChat';
import { useAuth } from '@/context/AuthContext';
import { STAGE2_BLOCK_LEVELS } from '@/data/stage2BlockLevels';
import dynamic from 'next/dynamic';

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Stage2Page() {
  const router = useRouter();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pythonCode, setPythonCode] = useState('');
  const [output, setOutput] = useState('');
  const runnerRef = useRef<any>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { user, updateUser, loading } = useAuth();
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      } else if (user.profile?.role === 'student') {
        const hasClassroom = !!user.profile?.classroom;
        const hasStartingScore = user.profile?.starting_score !== null && user.profile?.starting_score !== undefined;
        if (!hasStartingScore && !hasClassroom) {
          router.push('/onboarding/challenge');
        }
      }
    }
  }, [user, loading, router]);

  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<any[]>([]);
  const [showBadgeCelebration, setShowBadgeCelebration] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [animationData, setAnimationData] = useState<any>(null);
  const [activeSpriteId, setActiveSpriteId] = useState<string | null>(null);
  const [spriteWorkspaces, setSpriteWorkspaces] = useState<Record<string, {state: any, code: string}>>({});

  // Unplugged Logic States
  const [unpluggedAnswers, setUnpluggedAnswers] = useState<any>(null);
  const [unpluggedRunning, setUnpluggedRunning] = useState(false);
  const [unpluggedFeedback, setUnpluggedFeedback] = useState<string | null>(null);

  // Capstone Plan & Reflection States
  const [capstonePlan, setCapstonePlan] = useState<{type: string, forWho: string, behavior: string} | null>(null);
  const [editingPlan, setEditingPlan] = useState({ type: '', forWho: '', behavior: '' });
  const [showReflectStep, setShowReflectStep] = useState(false);
  const [reflectData, setReflectData] = useState({ didWork: '', changes: '', proudOf: '' });

  // Load success lottie on mount
  useEffect(() => {
    fetch('/assets/success.json')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch success lottie");
        return res.json();
      })
      .then(data => setAnimationData(data))
      .catch(e => console.error("Could not load lottie json", e));
  }, []);

  useEffect(() => {
    if (!loading && user && !progressLoaded) {
      // Load persisted progress
      const savedLevel = user?.profile?.stage2_progress ?? (localStorage.getItem('stage2_progress') ? parseInt(localStorage.getItem('stage2_progress') || '0', 10) : 0);
      setCurrentLevelIndex(savedLevel);
      setMaxUnlockedLevel(savedLevel);
      setProgressLoaded(true);
    }
  }, [user, loading, progressLoaded]);

  const level = STAGE2_BLOCK_LEVELS[currentLevelIndex] || STAGE2_BLOCK_LEVELS[0];

  // Initialize unplugged answers when level changes
  useEffect(() => {
    setUnpluggedFeedback(null);
    setUnpluggedRunning(false);
    
    if (level.isUnplugged) {
      if (level.unpluggedType === 'matching') {
        setUnpluggedAnswers({ rain: '', light: '', correct: '' });
      } else if (level.unpluggedType === 'instructions') {
        setUnpluggedAnswers([]);
      } else if (level.unpluggedType === 'loops') {
        setUnpluggedAnswers('');
      } else if (level.unpluggedType === 'debugging') {
        setUnpluggedAnswers(level.puzzleData?.brokenSequence ? [...level.puzzleData.brokenSequence] : []);
      } else if (level.unpluggedType === 'decisions') {
        setUnpluggedAnswers({ yes: '', no: '' });
      } else if (level.unpluggedType === 'ai_detective') {
        setUnpluggedAnswers({ correctness: '', privacy: '' });
      } else if (level.unpluggedType === 'treasure') {
        setUnpluggedAnswers([]);
      }
    } else {
      setUnpluggedAnswers(null);
    }

    if (level.isCapstone) {
      setCapstonePlan(null);
      setEditingPlan({ type: '', forWho: '', behavior: '' });
      setShowReflectStep(false);
      setReflectData({ didWork: '', changes: '', proudOf: '' });
    }
  }, [currentLevelIndex, level]);

  const triggerLevelComplete = (nextLevel: number) => {
    if (nextLevel > maxUnlockedLevel && nextLevel <= STAGE2_BLOCK_LEVELS.length) {
        setMaxUnlockedLevel(nextLevel);
        localStorage.setItem('stage2_progress', nextLevel.toString());
    }

    // Call backend progress update
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          stage: 2,
          progress: nextLevel
        })
      })
      .then(res => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response is not JSON");
      })
      .then(data => {
        if (data.success) {
          updateUser(data.user);
          setPointsEarned(data.points_earned);
          setStreakCount(data.current_streak);
          if (data.newly_unlocked_badges && data.newly_unlocked_badges.length > 0) {
            setNewlyUnlockedBadges(data.newly_unlocked_badges);
            setTimeout(() => {
              setShowBadgeCelebration(true);
            }, 2000);
          }
        }
      })
      .catch(err => console.error("Error updating progress on backend:", err));
    } else {
      setPointsEarned(0);
      setStreakCount(0);
    }

    setShowModal(true);
  };

  const handleOutput = (out: string) => {
      console.log("Pyodide Output/Error:", out);
      setOutput(out);
      // Let the animation play a bit, then pop up success modal
      setTimeout(() => {
          const isValid = level.validate(pythonCode);
          if (isValid) {
            if (level.isCapstone) {
              setShowReflectStep(true);
            } else {
              triggerLevelComplete(currentLevelIndex + 1);
            }
          }
      }, 1500);
  };

  const compileUnpluggedToPython = (answers: any, lvl: any) => {
    if (lvl.unpluggedType === 'instructions') {
      let script = `
import asyncio
import js
async def run_instr():
    print("DolaBot starting sequence...")
`;
      if (Array.isArray(answers)) {
        answers.forEach(cmd => {
          if (cmd === 'Forward 1 Step') {
            script += `    await window.move('sprite_${lvl.id}_0', 50)\n`;
          } else if (cmd === 'Forward 2 Steps') {
            script += `    await window.move('sprite_${lvl.id}_0', 100)\n`;
          } else if (cmd === 'Forward 3 Steps') {
            script += `    await window.move('sprite_${lvl.id}_0', 150)\n`;
          } else if (cmd === 'Turn Right') {
            script += `    await window.turn('sprite_${lvl.id}_0', 90)\n`;
          } else if (cmd === 'Turn Left') {
            script += `    await window.turn('sprite_${lvl.id}_0', -90)\n`;
          }
        });
      }
      script += `    print("Sequence Complete! DolaBot reached the goal! 🎉")\nawait run_instr()`;
      return script;
    }

    if (lvl.unpluggedType === 'treasure') {
      let script = `
import asyncio
import js
async def run_project():
    print("Executing Golden Maze sequence...")
`;
      if (Array.isArray(answers)) {
        answers.forEach(cmd => {
          if (cmd === 'Move Forward') {
            script += `    await window.move('sprite_${lvl.id}_0', 50)\n`;
          } else if (cmd === 'Turn Right') {
            script += `    await window.turn('sprite_${lvl.id}_0', 90)\n`;
          } else if (cmd === 'Move Forward 2 Steps') {
            script += `    await window.move('sprite_${lvl.id}_0', 100)\n`;
          } else if (cmd === 'Open Chest') {
            script += `    await window.say('sprite_${lvl.id}_0', "Treasure Unlocked! 🏆 Gold found!", 2)\n`;
          }
        });
      }
      script += `    print("Treasure Hunt Project Complete! 🎉")\nawait run_project()`;
      return script;
    }

    if (lvl.unpluggedType === 'matching') {
      return `
import asyncio
import js
async def run_match():
    await window.say('sprite_${lvl.id}_0', "Conditions Linked! 💡 Grab umbrella, Stop, Star!", 2.5)
await run_match()
`;
    }

    if (lvl.unpluggedType === 'loops') {
      return `
import asyncio
import js
async def run_loop():
    for i in range(5):
        await window.move('sprite_${lvl.id}_0', 20)
        await window.move('sprite_${lvl.id}_0', -20)
        await window.wait('sprite_${lvl.id}_0', 100)
    await window.say('sprite_${lvl.id}_0', "Perfect! Loop Iterator executed 5 times! 🔄", 2)
await run_loop()
`;
    }

    if (lvl.unpluggedType === 'debugging') {
      let isCorrect = Array.isArray(answers) && answers[2] === "RIGHT";
      if (isCorrect) {
        return `
import asyncio
import js
async def run_correct():
    await window.move('sprite_${lvl.id}_0', 50)
    await window.move('sprite_${lvl.id}_0', 50)
    await window.turn('sprite_${lvl.id}_0', 90)
    await window.move('sprite_${lvl.id}_0', 50)
    await window.say('sprite_${lvl.id}_0', "Bug fixed! Found the treasure chest! 🐞✨", 2)
await run_correct()
`;
      } else {
        return `
import asyncio
import js
async def run_crash():
    await window.move('sprite_${lvl.id}_0', 50)
    await window.move('sprite_${lvl.id}_0', 50)
    direction = 90 if "${answers[2]}" == "RIGHT" else (-90 if "${answers[2]}" == "LEFT" else 0)
    await window.turn('sprite_${lvl.id}_0', direction)
    await window.move('sprite_${lvl.id}_0', 50)
    await window.say('sprite_${lvl.id}_0', "Oh no! Crashed into the block! 🌳💥", 2)
await run_crash()
`;
      }
    }

    if (lvl.unpluggedType === 'decisions') {
      let isYesStop = answers.yes === "Stop";
      let isNoContinue = answers.no === "Continue";
      if (isYesStop && isNoContinue) {
        return `
import asyncio
import js
async def run_decision():
    await window.say('sprite_${lvl.id}_0', "Traffic red? Yes = Stop. Otherwise, Continue! 🚦", 3)
await run_decision()
`;
      } else {
        return `
import asyncio
import js
async def run_bad_decision():
    await window.say('sprite_${lvl.id}_0', "DolaBot got confused at the intersection!", 3.5)
await run_bad_decision()
`;
      }
    }

    if (lvl.unpluggedType === 'ai_detective') {
      let isCorrectnessOk = answers.correctness === "No, AI can make mistakes!";
      let isPrivacyOk = answers.privacy === "Never give AI private information!";
      if (isCorrectnessOk && isPrivacyOk) {
        return `
import asyncio
import js
async def run_ai_det():
    await window.say('sprite_${lvl.id}_0', "AI Literacy Verified! You protected the data! 🛡️🤖", 3.0)
await run_ai_det()
`;
      } else {
        return `
import asyncio
import js
async def run_bad_ai_det():
    await window.say('sprite_${lvl.id}_0', "Check machine responses again to spot the error!", 3.0)
await run_bad_ai_det()
`;
      }
    }

    return 'pass';
  };

  const handleRunUnplugged = async () => {
    if (!runnerRef.current || unpluggedRunning) return;
    setUnpluggedRunning(true);
    setUnpluggedFeedback(null);

    let serialized = '';
    if (level.unpluggedType === 'loops') {
      serialized = unpluggedAnswers || '';
    } else {
      serialized = JSON.stringify(unpluggedAnswers || {});
    }

    const pyScript = compileUnpluggedToPython(unpluggedAnswers, level);
    const result = await runnerRef.current.runCode(pyScript);

    setTimeout(() => {
      const isValid = level.validate(serialized);
      setUnpluggedRunning(false);
      
      if (isValid) {
        setUnpluggedFeedback("Correct! DolaBot executed successfully! 🎉");
        triggerLevelComplete(currentLevelIndex + 1);
      } else {
        setUnpluggedFeedback("Oops! That plan didn't quite work. Try editing your commands!");
      }
    }, 2500);
  };

  const handleNextLevel = () => {
    setShowModal(false);
    setPythonCode('');
    setSpriteWorkspaces({});
    if (currentLevelIndex === STAGE2_BLOCK_LEVELS.length - 1) {
      setShowFeedbackModal(true);
    } else {
      setCurrentLevelIndex(currentLevelIndex + 1);
    }
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    router.push('/stage3');
  };

  const handleWorkspaceChange = (spriteId: string, state: any, code: string) => {
      setSpriteWorkspaces(prev => ({
          ...prev,
          [spriteId]: { state, code }
      }));
  };

  // Compile the concurrent script for all sprites
  const superScript = `
import asyncio
import js
import random

${Object.entries(spriteWorkspaces).map(([spriteId, data], index) => {
    const codeWithId = data.code.replace(/__SPRITE_ID__/g, `'${spriteId}'`);
    const lines = codeWithId.split('\n').map(line => line.trimEnd());
    const hasCode = lines.some(line => line !== '');
    const indentedCode = hasCode 
        ? lines.filter(line => line !== '').map(line => '    ' + line).join('\n') 
        : '    pass';
    return `
async def run_sprite_${index}():
${indentedCode}
`;
}).join('\n')}

async def main():
    await asyncio.gather(
${Object.keys(spriteWorkspaces).map((_, index) => `        run_sprite_${index}(),`).join('\n')}
    )

await main()
  `;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-blue-500 hover:text-blue-700 inline-block font-bold">&larr; Back to Dashboard</Link>
            <div className="flex gap-2 flex-wrap max-w-lg justify-end">
                {STAGE2_BLOCK_LEVELS.map((lvm, idx) => {
                    const isUnlocked = idx <= maxUnlockedLevel;
                    return (
                        <div 
                            key={lvm.id} 
                            onClick={() => { if (isUnlocked) { setPythonCode(''); setSpriteWorkspaces({}); setCurrentLevelIndex(idx); } }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${isUnlocked ? 'cursor-pointer hover:scale-110 shadow-sm' : 'cursor-not-allowed opacity-50'} ${idx === currentLevelIndex ? 'bg-green-500 text-white ring-4 ring-green-200' : isUnlocked ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-slate-200 text-slate-400'}`}
                            title={isUnlocked ? `Go to ${lvm.title}` : "Locked"}
                        >
                            {idx + 1}
                        </div>
                    );
                })}
            </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-extrabold mb-2">Stage 2: Logic & Blocks <span className="opacity-70 text-lg font-medium ml-2">| {level.theme} - {level.title}</span></h1>
          <p className="text-lg"><strong>Objective:</strong> {level.objective}</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Workspace</h2>
            {level.isUnplugged ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
                
                {/* 1. MATCHING CARD CHALLENGE */}
                {level.unpluggedType === 'matching' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      💡 Draw links and matches! Select the correct action for each situation.
                    </div>
                    {level.puzzleData.challenges.map((ch: any) => (
                      <div key={ch.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <span className="font-extrabold text-slate-700 text-base">{ch.condition}</span>
                        <select 
                          value={unpluggedAnswers?.[ch.id] || ''} 
                          onChange={(e) => setUnpluggedAnswers((prev: any) => ({ ...prev, [ch.id]: e.target.value }))}
                          className="px-4 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">-- Select Action --</option>
                          {ch.options.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. DolaBot DIRECTIONS PATH BUILDER */}
                {level.unpluggedType === 'instructions' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      🤖 Build consecutive instructions to guide DolaBot. Click commands below to queue them up!
                    </div>
                    
                    <div className="min-h-[120px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-wrap gap-2 items-center">
                      {Array.isArray(unpluggedAnswers) && unpluggedAnswers.length === 0 ? (
                        <span className="text-slate-400 font-bold text-sm mx-auto">No instructions added yet.</span>
                      ) : (
                        Array.isArray(unpluggedAnswers) && unpluggedAnswers.map((cmd: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-indigo-700 font-black text-sm shadow-sm">
                            <span>{idx + 1}. {cmd}</span>
                            <button 
                              onClick={() => setUnpluggedAnswers((prev: any) => prev.filter((_: any, i: number) => i !== idx))}
                              className="text-indigo-400 hover:text-indigo-650 font-black ml-1 font-sans"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {level.puzzleData.commands.map((cmd: string) => (
                        <button
                          key={cmd}
                          onClick={() => setUnpluggedAnswers((prev: any) => [...(prev || []), cmd])}
                          className="px-3 py-2 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl font-bold text-slate-700 text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                          +{cmd}
                        </button>
                      ))}
                      <button 
                        onClick={() => setUnpluggedAnswers([])}
                        className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-sm ml-auto hover:bg-rose-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. REPEAT LOOPS OPTIMIZER */}
                {level.unpluggedType === 'loops' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      🔄 Spot the repeating pattern! Choose the loop command that optimizes the sequence.
                    </div>
                    <div className="flex flex-col gap-3">
                      {level.puzzleData.options.map((opt: string) => {
                        const isSelected = unpluggedAnswers === opt;
                        return (
                          <div
                            key={opt}
                            onClick={() => setUnpluggedAnswers(opt)}
                            className={`cursor-pointer p-4 border-2 rounded-xl font-extrabold text-base transition-all flex items-center gap-3 ${isSelected ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-md scale-[1.02]' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-350'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. GRID PATH DEBUGGING */}
                {level.unpluggedType === 'debugging' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      {"🐞 Fix the crash! The sequence (Forward -> Forward -> LEFT -> Forward) fails. Click the 3rd step to fix it!"}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-center bg-slate-50 border border-slate-100 p-6 rounded-xl">
                      {Array.isArray(unpluggedAnswers) && unpluggedAnswers.map((step: string, idx: number) => {
                        const isBug = idx === 2;
                        return (
                          <div 
                            key={idx}
                            className={`px-4 py-3 rounded-xl border-2 flex flex-col items-center ${isBug ? 'border-amber-400 bg-amber-50 animate-pulse' : 'border-slate-200 bg-white'}`}
                          >
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Step {idx + 1}</span>
                            <span className={`font-black ${isBug ? 'text-amber-800 text-lg animate-bounce' : 'text-slate-700'}`}>{step}</span>
                            {isBug && <span className="text-[9px] text-amber-600 font-bold uppercase mt-1">⚠️ Change Me</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-600 mb-3">Available Patches:</h3>
                      <div className="flex gap-3">
                        {level.puzzleData.fixes.map((fix: string) => (
                          <button
                            key={fix}
                            onClick={() => {
                              setUnpluggedAnswers((prev: any) => {
                                const copy = [...prev];
                                copy[2] = fix;
                                return copy;
                              });
                            }}
                            className="flex-1 py-3 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 text-slate-700 hover:text-blue-600 font-black rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95"
                          >
                            🔧 Use {fix}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. MAKE A DECISION RED LIGHT */}
                {level.unpluggedType === 'decisions' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      🚥 Traffic logic! Select what action DolaBot performs based on red light feedback.
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {level.puzzleData.branches.map((br: any) => {
                        const key = br.label.includes("YES") ? "yes" : "no";
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                            <span className="font-extrabold text-slate-700 text-base">{br.label}</span>
                            <select 
                              value={unpluggedAnswers?.[key] || ''} 
                              onChange={(e) => setUnpluggedAnswers((prev: any) => ({ ...prev, [key]: e.target.value }))}
                              className="px-4 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-blue-500 focus:outline-none"
                            >
                              <option value="">-- Select Action --</option>
                              {br.choices.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. DolaBot Treasure Hunt Project */}
                {level.unpluggedType === 'treasure' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      {"🏆 Final Project! Program the steps (Forward -> Right -> Forward 2 Steps -> Open Chest) to win the gold!"}
                    </div>
                    
                    <div className="min-h-[120px] bg-amber-50/50 border-2 border-dashed border-amber-200 rounded-xl p-4 flex flex-wrap gap-2 items-center">
                      {Array.isArray(unpluggedAnswers) && unpluggedAnswers.length === 0 ? (
                        <span className="text-amber-700/60 font-black text-sm mx-auto">Build the route instructions...</span>
                      ) : (
                        Array.isArray(unpluggedAnswers) && unpluggedAnswers.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg text-yellow-800 font-black text-sm shadow-sm animate-pulse">
                            <span>{idx + 1}. {step}</span>
                            <button 
                              onClick={() => setUnpluggedAnswers((prev: any) => prev.filter((_: any, i: number) => i !== idx))}
                              className="text-yellow-600 hover:text-yellow-800 font-black ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2 flex-wrap items-center">
                      {level.puzzleData.choices.map((chOption: string) => (
                        <button
                          key={chOption}
                          onClick={() => setUnpluggedAnswers((prev: any) => [...(prev || []), chOption])}
                          className="px-3 py-2 bg-white border-2 border-slate-200 hover:border-slate-400 rounded-xl font-bold text-slate-700 text-sm shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                          +{chOption}
                        </button>
                      ))}
                      <button 
                        onClick={() => setUnpluggedAnswers([])}
                        className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-sm ml-auto hover:bg-rose-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* AI DETECTIVE LITERACY */}
                {level.unpluggedType === 'ai_detective' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm font-semibold">
                      🕵️‍♂️ Inspect the machine responses. Identify mistakes and prevent personal details from leaking!
                    </div>
                    {level.puzzleData.questions.map((q: any) => (
                      <div key={q.id} className="flex flex-col gap-3 p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <span className="font-extrabold text-slate-700 text-base">{q.prompt}</span>
                        <div className="flex flex-col sm:flex-row gap-3">
                          {q.choices.map((choice: string) => {
                            const isChosen = unpluggedAnswers?.[q.id] === choice;
                            return (
                              <button
                                key={choice}
                                onClick={() => setUnpluggedAnswers((prev: any) => ({ ...prev, [q.id]: choice }))}
                                className={`flex-1 py-3 px-4 border-2 rounded-xl text-sm font-bold transition-all ${isChosen ? 'border-indigo-500 bg-indigo-50 text-indigo-850 font-black' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer bar for unplugged runner */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center gap-4 flex-wrap">
                  <div className={`text-sm font-bold ${unpluggedFeedback?.includes("Correct") ? 'text-green-600' : 'text-slate-500'}`}>
                    {unpluggedFeedback || "Ready to execute DolaBot?"}
                  </div>
                  <button
                    onClick={handleRunUnplugged}
                    disabled={unpluggedRunning}
                    className={`px-6 py-2.5 rounded-xl font-extrabold text-white shadow-md transition-all active:scale-95 ${unpluggedRunning ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600'}`}
                  >
                    {unpluggedRunning ? "Playing..." : "▶ Run & Test DolaBot"}
                  </button>
                </div>
              </div>
            ) : level.isCapstone && !capstonePlan ? (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-150 rounded-2xl p-6 shadow-lg min-h-[480px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full text-indigo-700 font-extrabold text-xs w-fit">
                    ✨ MY FIRST DOLACODE CREATION
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">SOLVE Phase 1: Planning</h3>
                  <p className="text-sm font-semibold text-slate-500 mb-6">Before we touch any blocks, let's make a blueprint for your project!</p>
                  
                  <div className="space-y-4 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-extrabold text-slate-600">1. What are you making?</label>
                      <select 
                        value={editingPlan.type}
                        onChange={(e) => setEditingPlan(prev => ({ ...prev, type: e.target.value }))}
                        className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">-- Choose Type --</option>
                        <option value="Maths Game">Maths Game</option>
                        <option value="Interactive Story">Interactive Story</option>
                        <option value="Maze">Maze</option>
                        <option value="Quiz">Quiz</option>
                        <option value="Simple Animation">Simple Animation</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-extrabold text-slate-600">2. Who is it for?</label>
                      <input 
                        type="text"
                        placeholder="e.g. My mom, my friend, DolaBot..."
                        value={editingPlan.forWho}
                        onChange={(e) => setEditingPlan(prev => ({ ...prev, forWho: e.target.value }))}
                        className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-extrabold text-slate-600">3. What should it do?</label>
                      <textarea 
                        rows={2}
                        placeholder="Describe how it behaves when you play it..."
                        value={editingPlan.behavior}
                        onChange={(e) => setEditingPlan(prev => ({ ...prev, behavior: e.target.value }))}
                        className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={!editingPlan.type || !editingPlan.forWho || !editingPlan.behavior}
                  onClick={() => setCapstonePlan(editingPlan)}
                  className="w-full py-4.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 animate-pulse"
                >
                  🚀 Start Building!
                </button>
              </div>
            ) : (
              <>
                <BlocklyEditor 
                    key={level.id} 
                    onCodeChange={(code) => {
                        setPythonCode(code);
                        if (activeSpriteId) {
                            setSpriteWorkspaces(prev => ({
                                ...prev,
                                [activeSpriteId]: { state: prev[activeSpriteId]?.state, code }
                            }));
                        }
                    }} 
                    allowedBlocks={level.allowedBlocks} 
                    activeSpriteId={activeSpriteId}
                    workspaceStates={Object.fromEntries(Object.entries(spriteWorkspaces).map(([k, v]) => [k, v.state]))}
                    onWorkspaceChange={handleWorkspaceChange}
                />
                <PyodideRunner ref={runnerRef} code={superScript} onOutput={handleOutput} />
              </>
            )}
            
            {/* Mount PyodideRunner in background for Unplugged levels */}
            {level.isUnplugged && (
              <PyodideRunner ref={runnerRef} />
            )}
          </div>
          <div className="flex flex-col gap-4">
            <ScratchStage 
                levelId={level.id} 
                startBackdrop={level.startBackdrop} 
                startSprites={level.startSprites} 
                activeSpriteIdProp={activeSpriteId}
                onActiveSpriteChange={setActiveSpriteId}
            />
          </div>
        </div>
      </div>

      {showReflectStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in duration-300 border-4 border-indigo-400">
            <div>
              <div className="flex items-center gap-2 mb-4 bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full text-indigo-700 font-extrabold text-xs w-fit mx-auto">
                🌟 SOLVE Phase 4: Reflection & Improvement
              </div>
              <h2 className="text-3xl font-black text-slate-800 text-center mb-1">Your Project is Alive!</h2>
              <p className="text-center text-slate-500 text-sm font-semibold mb-6">Let's reflect on your first DolaCode creation.</p>
              
              <div className="space-y-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600">1. Did it work as planned?</label>
                  <select 
                    value={reflectData.didWork}
                    onChange={(e) => setReflectData(prev => ({ ...prev, didWork: e.target.value }))}
                    className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose Option --</option>
                    <option value="Yes, perfectly!">Yes, perfectly!</option>
                    <option value="Mostly, with a few tweaks">Mostly, with a few tweaks</option>
                    <option value="No, but I learned a lot">No, but I learned a lot</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600">2. What did you end up changing during build?</label>
                  <input 
                    type="text"
                    placeholder="e.g. Added a loop, changed the sprite path..."
                    value={reflectData.changes}
                    onChange={(e) => setReflectData(prev => ({ ...prev, changes: e.target.value }))}
                    className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-750 font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-extrabold text-slate-600">3. What are you most proud of in this project?</label>
                  <input 
                    type="text"
                    placeholder="e.g. Making my rocket turn, fixing my debugging blocks..."
                    value={reflectData.proudOf}
                    onChange={(e) => setReflectData(prev => ({ ...prev, proudOf: e.target.value }))}
                    className="px-4 py-2.5 border-2 border-slate-200 rounded-xl bg-white text-slate-750 font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={!reflectData.didWork || !reflectData.changes || !reflectData.proudOf}
              onClick={() => {
                setShowReflectStep(false);
                triggerLevelComplete(currentLevelIndex + 1);
              }}
              className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-lg rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🎉 Finish & Claim Rewards!
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="w-48 h-48 mb-4 pointer-events-none">
                    {animationData ? (
                        <Lottie animationData={animationData} loop={false} autoplay />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-100 rounded-full text-green-500 font-bold text-6xl">✓</div>
                    )}
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Level Complete!</h2>
                
                {pointsEarned > 0 && (
                  <div className="flex gap-4 mb-4">
                    <span className="flex items-center gap-1.5 bg-yellow-50 border-2 border-yellow-200 px-3 py-1 rounded-full text-yellow-700 font-black text-sm shadow-sm">
                      ⭐ +{pointsEarned} Stars
                    </span>
                    {streakCount > 0 && (
                      <span className="flex items-center gap-1.5 bg-orange-50 border-2 border-orange-200 px-3 py-1 rounded-full text-orange-700 font-black text-sm shadow-sm">
                        🔥 {streakCount} Day Streak
                      </span>
                    )}
                  </div>
                )}

                {level.unlockedAbility && (
                    <p className="text-center text-slate-600 mb-6 text-lg">
                        You unlocked a new ability:<br/>
                        <span className="font-bold text-indigo-600 text-xl">{level.unlockedAbility}</span>
                    </p>
                )}
                <div className="w-full flex gap-4">
                    <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                        Stay Here
                    </button>
                    {currentLevelIndex < STAGE2_BLOCK_LEVELS.length - 1 ? (
                        <button onClick={handleNextLevel} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105">
                            Next Level
                        </button>
                    ) : (
                        <button onClick={handleNextLevel} className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md transition-all transform hover:scale-105 text-center">
                            Go to Stage 3
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Badge Celebration Modal */}
      {showBadgeCelebration && newlyUnlockedBadges.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300 border-4 border-yellow-400 relative overflow-hidden text-center">
            {/* Glimmer background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-200/30 rounded-full blur-[60px]" />
            
            {/* Confetti & sparkles */}
            <div className="relative z-10 w-32 h-32 mb-6 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-full border-4 border-yellow-300 flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-7xl">{newlyUnlockedBadges[0].icon}</span>
            </div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-black mb-3 border border-yellow-300 uppercase tracking-widest">
                🏆 Achievement Unlocked
              </span>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2">
                {newlyUnlockedBadges[0].name}
              </h2>
              
              <p className="text-slate-600 font-bold mb-8 text-base px-4">
                {newlyUnlockedBadges[0].description}
              </p>
              
              <button 
                onClick={() => {
                  const remaining = newlyUnlockedBadges.slice(1);
                  setNewlyUnlockedBadges(remaining);
                  if (remaining.length === 0) {
                    setShowBadgeCelebration(false);
                  }
                }} 
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-yellow-100 transition-all active:scale-95"
              >
                {newlyUnlockedBadges.length > 1 ? "Next Badge! 🚀" : "Awesome! 🌟"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        stage={2} 
        part={1} 
        onClose={handleFeedbackClose} 
      />

      {/* Lizzy AI Tutor Floating Chatbox */}
      <LizzyChat 
        stage={2} 
        level={currentLevelIndex + 1} 
        contextInfo={`Stage 2 Level ${currentLevelIndex + 1} (${level.title}): ${level.objective}. Theme: ${level.theme}. Current Generated Code: "${pythonCode}"`} 
      />
    </div>
  );
}
