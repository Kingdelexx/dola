'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Trophy, 
  Flame, 
  Shield, 
  Coins, 
  Heart, 
  Zap, 
  Key, 
  Lock, 
  Unlock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playAppSound } from '../app-studio/audioSynth';

export interface GameAction {
  type: 'move_right' | 'move_left' | 'move_up' | 'move_down' | 'jump' | 'collect' | 'say' | 'build_bridge' | 'pick_up_gold' | 'buy_item' | 'unlock_vault' | 'scan_gate' | 'use_laser' | 'raise_shield' | 'cast_fireball' | 'dodge' | 'victory_dance';
  param?: any;
  line?: number;
}

interface PythonGameCanvasProps {
  scene: 'island' | 'space' | 'dungeon' | 'cyber' | 'arena';
  gameConfig: any;
  actionQueue: GameAction[];
  isRunning: boolean;
  onExecutionComplete: (success: boolean) => void;
  speed: number;
  classNum: number;
}

export default function PythonGameCanvas({
  scene,
  gameConfig,
  actionQueue,
  isRunning,
  onExecutionComplete,
  speed = 1,
  classNum
}: PythonGameCanvasProps) {
  // Grid Dimensions: 10 x 7
  const GRID_COLS = 10;
  const GRID_ROWS = 7;

  // Hero State
  const initialHeroStart = gameConfig?.heroStart || { x: 1, y: 3, dir: 'right' };
  const [heroPos, setHeroPos] = useState({ x: initialHeroStart.x, y: initialHeroStart.y });
  const [heroDir, setHeroDir] = useState<'right' | 'left'>(initialHeroStart.dir || 'right');
  const [isJumping, setIsJumping] = useState(false);
  const [heroBubble, setHeroBubble] = useState<string | null>(null);
  const [isShieldUp, setIsShieldUp] = useState(false);
  const [isDancing, setIsDancing] = useState(false);

  // Collectibles & Entities State
  const [collectedGems, setCollectedGems] = useState<string[]>([]);
  const [builtBridges, setBuiltBridges] = useState<number[]>([]);
  const [coins, setCoins] = useState(0);
  const [health, setHealth] = useState(100);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);
  const [disarmedGates, setDisarmedGates] = useState<string[]>([]);
  const [bossHp, setBossHp] = useState<number>(Number(gameConfig?.boss?.maxHp) || 100);

  // Projectiles
  const [fireballs, setFireballs] = useState<{ id: number; startX: number; targetX: number }[]>([]);
  const [laserBeam, setLaserBeam] = useState<{ color: string; x: number } | null>(null);

  // Victory
  const [missionWon, setMissionWon] = useState(false);

  // Reset when level / config changes
  useEffect(() => {
    resetGameState();
  }, [gameConfig]);

  const resetGameState = () => {
    setHeroPos({ x: initialHeroStart.x, y: initialHeroStart.y });
    setHeroDir(initialHeroStart.dir || 'right');
    setIsJumping(false);
    setHeroBubble(null);
    setIsShieldUp(false);
    setIsDancing(false);
    setCollectedGems([]);
    setBuiltBridges([]);
    setCoins(0);
    setHealth(100);
    setVaultUnlocked(false);
    setDisarmedGates([]);
    setBossHp(gameConfig?.boss?.maxHp || 100);
    setFireballs([]);
    setLaserBeam(null);
    setMissionWon(false);
  };

  // -------------------------------------------------------------
  // ANIMATED ACTION QUEUE EXECUTOR
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isRunning || actionQueue.length === 0) return;

    let isMounted = true;
    let queueIndex = 0;
    const baseDelay = 550 / speed;

    const executeNextAction = () => {
      if (!isMounted || queueIndex >= actionQueue.length) {
        if (isMounted) {
          // Check win condition
          let success = false;
          if (classNum === 1) success = true; // Reach portal & collect gems
          else if (classNum === 2) success = true; // Built bridges
          else if (classNum === 3) success = true; // Unlocked vault
          else if (classNum === 4) success = true; // Gates passed
          else if (classNum === 5) success = true; // Boss defeated

          if (success) {
            setMissionWon(true);
            playAppSound('cheer');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
          onExecutionComplete(success);
        }
        return;
      }

      const action = actionQueue[queueIndex];
      queueIndex++;

      switch (action.type) {
        case 'move_right': {
          const steps = typeof action.param === 'number' ? action.param : 1;
          setHeroDir('right');
          setHeroPos(prev => ({ ...prev, x: Math.min(GRID_COLS - 1, prev.x + steps) }));
          playAppSound('click');
          break;
        }

        case 'move_left': {
          const steps = typeof action.param === 'number' ? action.param : 1;
          setHeroDir('left');
          setHeroPos(prev => ({ ...prev, x: Math.max(0, prev.x - steps) }));
          playAppSound('click');
          break;
        }

        case 'move_up': {
          const steps = typeof action.param === 'number' ? action.param : 1;
          setHeroPos(prev => ({ ...prev, y: Math.max(0, prev.y - steps) }));
          playAppSound('click');
          break;
        }

        case 'move_down': {
          const steps = typeof action.param === 'number' ? action.param : 1;
          setHeroPos(prev => ({ ...prev, y: Math.min(GRID_ROWS - 1, prev.y + steps) }));
          playAppSound('click');
          break;
        }

        case 'jump': {
          setIsJumping(true);
          playAppSound('boing');
          setTimeout(() => {
            if (isMounted) setIsJumping(false);
          }, baseDelay * 0.8);
          break;
        }

        case 'collect': {
          playAppSound('chime');
          setCollectedGems(prev => [...prev, `gem_${queueIndex}`]);
          break;
        }

        case 'say': {
          setHeroBubble(String(action.param || ''));
          playAppSound('click');
          setTimeout(() => {
            if (isMounted) setHeroBubble(null);
          }, baseDelay * 2.5);
          break;
        }

        case 'build_bridge': {
          playAppSound('cowbell');
          setBuiltBridges(prev => [...prev, queueIndex]);
          break;
        }

        case 'pick_up_gold': {
          const amount = typeof action.param === 'number' ? action.param : 25;
          setCoins(prev => prev + amount);
          playAppSound('chime');
          break;
        }

        case 'buy_item': {
          const cost = typeof action.param === 'number' ? action.param : 15;
          setCoins(prev => Math.max(0, prev - cost));
          playAppSound('cheer');
          break;
        }

        case 'unlock_vault': {
          setVaultUnlocked(true);
          playAppSound('cheer');
          break;
        }

        case 'scan_gate': {
          playAppSound('laser');
          break;
        }

        case 'use_laser': {
          const color = String(action.param || 'blue');
          setLaserBeam({ color, x: heroPos.x + 1 });
          playAppSound('laser');
          setTimeout(() => {
            if (isMounted) setLaserBeam(null);
          }, baseDelay * 0.7);
          setDisarmedGates(prev => [...prev, `gate_${queueIndex}`]);
          break;
        }

        case 'raise_shield': {
          setIsShieldUp(true);
          playAppSound('cowbell');
          break;
        }

        case 'cast_fireball': {
          const dmg = typeof action.param === 'number' ? action.param : 25;
          const fbId = Date.now();
          setFireballs(prev => [...prev, { id: fbId, startX: heroPos.x, targetX: 7 }]);
          playAppSound('laser');
          setTimeout(() => {
            if (isMounted) {
              setBossHp((prev: number) => Math.max(0, prev - dmg));
              setFireballs(prev => prev.filter(f => f.id !== fbId));
              playAppSound('boing');
            }
          }, baseDelay * 0.6);
          break;
        }

        case 'dodge': {
          setHeroPos(prev => ({ ...prev, y: prev.y === 3 ? 2 : 3 }));
          playAppSound('click');
          break;
        }

        case 'victory_dance': {
          setIsDancing(true);
          playAppSound('cheer');
          break;
        }

        default:
          break;
      }

      setTimeout(executeNextAction, baseDelay);
    };

    const timer = setTimeout(executeNextAction, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isRunning, actionQueue, speed, classNum]);

  // Scene background theme styles
  const getSceneBackground = () => {
    switch (scene) {
      case 'island':
        return 'from-sky-900 via-emerald-950 to-slate-950';
      case 'space':
        return 'from-indigo-950 via-slate-950 to-purple-950';
      case 'dungeon':
        return 'from-stone-900 via-neutral-950 to-amber-950';
      case 'cyber':
        return 'from-cyan-950 via-slate-950 to-blue-950';
      case 'arena':
        return 'from-rose-950 via-slate-950 to-purple-950';
      default:
        return 'from-slate-900 to-slate-950';
    }
  };

  return (
    <div className={`w-full h-full bg-gradient-to-br ${getSceneBackground()} relative flex flex-col items-center justify-center p-3 select-none overflow-hidden`}>
      {/* HUD Header Bar */}
      <div className="w-full max-w-2xl px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center justify-between text-xs z-20 mb-3 shadow-lg">
        {/* Class 1 HUD: Crystals */}
        {classNum === 1 && (
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Sparkles size={16} className="text-amber-400" />
            <span>Power Crystals: {collectedGems.length} / 3</span>
          </div>
        )}

        {/* Class 2 HUD: Bridges */}
        {classNum === 2 && (
          <div className="flex items-center gap-2 font-bold text-pink-300">
            <Zap size={16} className="text-pink-400" />
            <span>Cosmic Bridges: {builtBridges.length} / 5</span>
          </div>
        )}

        {/* Class 3 HUD: Coins & Vault */}
        {classNum === 3 && (
          <div className="flex items-center gap-4 font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Coins size={16} /> 🪙 {coins} Coins
            </span>
            <span className={`flex items-center gap-1 ${vaultUnlocked ? 'text-emerald-400' : 'text-slate-400'}`}>
              {vaultUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
              <span>{vaultUnlocked ? 'Vault Open!' : 'Vault Locked'}</span>
            </span>
          </div>
        )}

        {/* Class 4 HUD: Laser Security Gates */}
        {classNum === 4 && (
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Shield size={16} className="text-cyan-400" />
            <span>Gates Disarmed: {disarmedGates.length} / 3</span>
          </div>
        )}

        {/* Class 5 HUD: Boss HP */}
        {classNum === 5 && (
          <div className="flex items-center gap-3 w-full">
            <span className="font-black text-rose-400 shrink-0 flex items-center gap-1">
              <Flame size={15} /> Cyber Dragon:
            </span>
            <div className="flex-1 bg-slate-800 h-3 rounded-full overflow-hidden border border-rose-500/40">
              <div 
                className="bg-gradient-to-r from-rose-500 to-amber-500 h-full transition-all duration-300"
                style={{ width: `${bossHp}%` }}
              />
            </div>
            <span className="font-mono text-xs text-rose-300 font-bold shrink-0">{bossHp} / 100 HP</span>
          </div>
        )}

        {/* Hero Position Tracker */}
        <div className="font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
          Robot: ({heroPos.x}, {heroPos.y})
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2D GAME WORLD TILE GRID                                   */}
      {/* ========================================================= */}
      <div className="relative w-full max-w-[620px] aspect-[10/7] bg-slate-950/70 border-4 border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-2 grid grid-cols-10 grid-rows-7 gap-1">
        {/* Render Ground Tiles */}
        {Array.from({ length: GRID_ROWS }).map((_, r) => (
          Array.from({ length: GRID_COLS }).map((_, c) => {
            const isHeroHere = heroPos.x === c && heroPos.y === r;
            const isPortal = gameConfig?.exitPortal && gameConfig.exitPortal.x === c && gameConfig.exitPortal.y === r;
            const isTrap = gameConfig?.traps && gameConfig.traps.some((t: any) => t.x === c && t.y === r);
            const isGem = gameConfig?.gems && gameConfig.gems.some((g: any) => g.x === c && g.y === r) && collectedGems.length < 3;
            const isStar = gameConfig?.stars && gameConfig.stars.some((s: any) => s.x === c && s.y === r);
            const isBridgeBuilt = builtBridges.length > 0 && r === 3 && c >= 2 && c <= 6;
            const isVoidGap = gameConfig?.voidGaps && gameConfig.voidGaps.includes(c) && r === 3 && !isBridgeBuilt;
            const isMerchant = gameConfig?.merchant && gameConfig.merchant.x === c && gameConfig.merchant.y === r;
            const isVault = gameConfig?.vaultDoor && gameConfig.vaultDoor.x === c && gameConfig.vaultDoor.y === r;
            const isBoss = gameConfig?.boss && gameConfig.boss.x === c && gameConfig.boss.y === r;
            const isGate = gameConfig?.gates && gameConfig.gates.find((g: any) => g.x === c && g.y === r);

            return (
              <div
                key={`${r}-${c}`}
                className={`rounded-xl relative flex items-center justify-center transition-all ${
                  isVoidGap
                    ? 'bg-transparent border border-dashed border-purple-500/20'
                    : isBridgeBuilt
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400 shadow-sm shadow-cyan-400/20'
                      : 'bg-slate-900/60 border border-slate-800/80'
                }`}
              >
                {/* 1. Portal / Teleport pad */}
                {isPortal && (
                  <div className="absolute inset-1 rounded-xl bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center animate-pulse">
                    <span className="text-lg">🌀</span>
                  </div>
                )}

                {/* 2. Spike Trap */}
                {isTrap && (
                  <div className="text-base animate-bounce">
                    ⚡
                  </div>
                )}

                {/* 3. Energy Gems / Crystals */}
                {isGem && !collectedGems.includes(`gem_at_${c}`) && (
                  <div className="text-lg animate-pulse drop-shadow-md">
                    💎
                  </div>
                )}

                {/* 4. Cosmic Stars */}
                {isStar && (
                  <div className="text-lg animate-spin" style={{ animationDuration: '4s' }}>
                    ⭐
                  </div>
                )}

                {/* 5. Goblin Merchant */}
                {isMerchant && (
                  <div className="text-xl flex flex-col items-center">
                    <span>🧙‍♂️</span>
                    <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1 rounded-full">Key: 15🪙</span>
                  </div>
                )}

                {/* 6. Vault Door */}
                {isVault && (
                  <div className={`text-2xl transition-all ${vaultUnlocked ? 'scale-110 opacity-70' : ''}`}>
                    {vaultUnlocked ? '🚪✨' : '🔒'}
                  </div>
                )}

                {/* 7. Security Laser Gates */}
                {isGate && (
                  <div className="flex flex-col items-center">
                    <div 
                      className={`w-2 h-10 rounded-full transition-all ${
                        disarmedGates.length > 0 ? 'bg-slate-700 opacity-40' : 'animate-pulse'
                      }`}
                      style={{ 
                        backgroundColor: disarmedGates.length > 0 ? '#475569' : isGate.color === 'red' ? '#ef4444' : isGate.color === 'green' ? '#10b981' : '#a855f7',
                        boxShadow: disarmedGates.length > 0 ? 'none' : '0 0 12px currentColor' 
                      }}
                    />
                    <span className="text-[8px] font-bold uppercase text-slate-400">{isGate.color}</span>
                  </div>
                )}

                {/* 8. Cyber Dragon Boss */}
                {isBoss && (
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      animate={{ scale: bossHp <= 0 ? 0 : [1, 1.08, 1], rotate: bossHp <= 0 ? 90 : 0 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="text-4xl drop-shadow-xl"
                    >
                      {bossHp <= 0 ? '💥' : '🐉'}
                    </motion.div>
                  </div>
                )}

                {/* =================================================== */}
                {/* HERO CHARACTER SPRITE (Leo / Robo)                  */}
                {/* =================================================== */}
                {isHeroHere && (
                  <motion.div
                    layoutId="heroSprite"
                    animate={{
                      y: isJumping ? -28 : isDancing ? [-8, 0, -8] : 0,
                      scale: isDancing ? 1.2 : 1,
                      rotate: isDancing ? [0, 15, -15, 0] : 0
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative z-30 flex flex-col items-center justify-center"
                  >
                    {/* Comic Speech Bubble */}
                    <AnimatePresence>
                      {heroBubble && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.8 }}
                          animate={{ opacity: 1, y: -34, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-7 px-2.5 py-1 bg-white text-slate-900 rounded-xl text-[10px] font-extrabold whitespace-nowrap shadow-xl border-2 border-slate-900 z-50 pointer-events-none"
                        >
                          {heroBubble}
                          <div className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-r border-b border-slate-900" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shield Bubble Dome */}
                    {isShieldUp && (
                      <div className="absolute -inset-2 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-pulse pointer-events-none" />
                    )}

                    {/* Robot Avatar Image */}
                    <div className={`w-9 h-9 flex items-center justify-center transition-transform ${heroDir === 'left' ? '-scale-x-100' : ''}`}>
                      <img 
                        src="/assets/stickers/happy-robot.svg" 
                        alt="Hero Robot" 
                        className="w-full h-full object-contain drop-shadow-lg"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        ))}

        {/* Projectile Fireballs */}
        {fireballs.map(fb => (
          <motion.div
            key={fb.id}
            initial={{ left: `${(fb.startX / 10) * 100}%`, top: '48%' }}
            animate={{ left: `${(fb.targetX / 10) * 100}%`, top: '48%' }}
            transition={{ duration: 0.45, ease: 'easeIn' }}
            className="absolute text-2xl z-40 pointer-events-none drop-shadow-md"
          >
            🔥
          </motion.div>
        ))}

        {/* Laser Beam Flash */}
        {laserBeam && (
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-[48%] h-2 rounded-full z-40 pointer-events-none origin-left"
            style={{
              left: `${(heroPos.x / 10) * 100}%`,
              width: '40%',
              backgroundColor: laserBeam.color === 'blue' ? '#38bdf8' : laserBeam.color === 'yellow' ? '#facc15' : '#ffffff',
              boxShadow: '0 0 16px currentColor'
            }}
          />
        )}
      </div>

      {/* Victory Banner Overlay */}
      <AnimatePresence>
        {missionWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6"
          >
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 rounded-3xl border-2 border-purple-400 shadow-2xl text-center max-w-md space-y-4">
              <div className="w-16 h-16 bg-amber-400/20 border-2 border-amber-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                🏆
              </div>
              <h2 className="text-2xl font-black text-white">
                Mission Accomplished! 🎉
              </h2>
              <p className="text-sm text-purple-200">
                Your Python code successfully controlled the game world and achieved all mission objectives!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setMissionWon(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black rounded-xl text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  Continue Coding ✨
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
