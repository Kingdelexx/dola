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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
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

  useEffect(() => {
    // Load persisted progress
    const savedLevel = user?.profile?.stage2_progress ?? (localStorage.getItem('stage2_progress') ? parseInt(localStorage.getItem('stage2_progress') || '0', 10) : 0);
    setCurrentLevelIndex(savedLevel);
    setMaxUnlockedLevel(savedLevel);
    // Load Lottie animation
    fetch('/assets/success.json')
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch success lottie");
        return res.json();
      })
      .then(data => setAnimationData(data))
      .catch(e => console.error("Could not load lottie json", e));
  }, [user]);

  const level = STAGE2_BLOCK_LEVELS[currentLevelIndex] || STAGE2_BLOCK_LEVELS[0];

  const handleOutput = (out: string) => {
      console.log("Pyodide Output/Error:", out);
      setOutput(out);
      // Let the animation play a bit, then pop up success modal
      setTimeout(() => {
          const isValid = level.validate(pythonCode);
          if (isValid) {
            const nextLevel = currentLevelIndex + 1;
            if (nextLevel > maxUnlockedLevel && nextLevel < STAGE2_BLOCK_LEVELS.length) {
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
          }
      }, 1500);
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
            <div className="flex gap-2">
                {STAGE2_BLOCK_LEVELS.map((lvm, idx) => {
                    const isUnlocked = true;
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
          <h1 className="text-3xl font-extrabold mb-2">Stage 2: Block Coding <span className="opacity-70 text-lg font-medium ml-2">| {level.theme} - {level.title}</span></h1>
          <p className="text-lg"><strong>Objective:</strong> {level.objective}</p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Workspace</h2>
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
