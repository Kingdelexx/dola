'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Swords, Trophy, ShieldAlert, Award } from 'lucide-react';
import { getLevelById } from '../app/stage4/data/pythonLevels';

interface Action {
  type: 'move' | 'collect' | 'say' | 'fireball' | 'drink' | 'unlock' | 'forge' | 'hatch' | 'victory';
  param?: string;
}

export default function GameCanvas({ 
  levelId, 
  codeOutput, 
  success,
  isRunning = false
}: { 
  levelId: string; 
  codeOutput: string; 
  success: boolean;
  isRunning?: boolean;
}) {
  const level = getLevelById(levelId);
  
  // Game state
  const [heroPos, setHeroPos] = useState({ x: 10, y: 50 });
  const [heroDir, setHeroDir] = useState<'right' | 'left'>('right');
  const [heroBubble, setHeroBubble] = useState<string | null>(null);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [gateUnlocked, setGateUnlocked] = useState(false);
  const [fireballs, setFireballs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isDrinking, setIsDrinking] = useState(false);
  const [dragonDefeated, setDragonDefeated] = useState(false);
  const [petHatched, setPetHatched] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [bagItems, setBagItems] = useState<string[]>([]);
  
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [printedLines, setPrintedLines] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Keep a ref to heroPos to avoid stale closures inside setTimeout
  const heroPosRef = useRef(heroPos);
  useEffect(() => {
    heroPosRef.current = heroPos;
  }, [heroPos]);

  // Reset visual state when level changes
  useEffect(() => {
    if (level) {
      setHeroPos(level.visualSetup.hero);
      setHeroDir(level.visualSetup.hero.dir);
      setHeroBubble(null);
      setCollectedIds([]);
      setGateUnlocked(false);
      setFireballs([]);
      setIsDrinking(false);
      setDragonDefeated(false);
      setPetHatched(false);
      setIsForging(false);
      setBagItems([]);
      setShowSuccessSplash(false);
      setPrintedLines([]);
      setFloatingTexts([]);
    }
  }, [levelId, level]);

  // Delay the final success popup to let kids enjoy the robot jump/spin and grid alignment animation
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setShowSuccessSplash(true);
      }, 2800);
      return () => clearTimeout(timer);
    } else {
      setShowSuccessSplash(false);
    }
  }, [success]);

  // Parse stdout lines and run action sequence
  useEffect(() => {
    if (!codeOutput || !level) return;
    
    // Clear logs for the new run
    setPrintedLines([]);
    setFloatingTexts([]);
    
    // Parse output lines
    const lines = codeOutput
      .split('\n')
      .map(l => l.trim().toLowerCase())
      .filter(Boolean);

    if (lines.length === 0) return;

    // Build action sequence based on printed stdout words
    const sequence: Action[] = [];
    
    lines.forEach(line => {
      if (line.includes('open sesame!')) {
        sequence.push({ type: 'unlock' });
        sequence.push({ type: 'say', param: 'The gate is open!' });
      }
      else if (line.includes('collect')) {
        sequence.push({ type: 'collect' });
      }
      else if (line.includes('drink')) {
        sequence.push({ type: 'drink' });
        sequence.push({ type: 'say', param: 'Nanite repair sequence activated! 🧪' });
      }
      else if (line.includes('fireball!')) {
        sequence.push({ type: 'fireball' });
        sequence.push({ type: 'say', param: 'Firing Plasma Blast! 🔥' });
      }
      else if (line.includes('forging...')) {
        sequence.push({ type: 'forge' });
        sequence.push({ type: 'say', param: 'Fabricating components... 🔨' });
      }
      else if (line.includes('hello!')) {
        sequence.push({ type: 'hatch' });
        sequence.push({ type: 'say', param: 'Hello Sparky! System fully operational! 🐉' });
      }
      else if (line.includes('victory')) {
        sequence.push({ type: 'victory' });
        sequence.push({ type: 'say', param: 'AI Core overridden! 🏆' });
      }
      else if (line.includes('sword') || line.includes('potion') || line.includes('shield')) {
        sequence.push({ type: 'say', param: `Register updated: ${line}` });
        // parse items
        if (line.includes('sword')) setBagItems(p => [...p, '🗡️ Sword']);
        if (line.includes('shield')) setBagItems(p => [...p, '🛡️ Shield']);
        if (line.includes('potion')) setBagItems(p => [...p, '🧪 Potion']);
      }
      else {
        // Generic speech bubble for other outputs
        sequence.push({ type: 'say', param: line });
      }
    });

    // Execute sequence with delays
    let timeAccumulator = 0;
    
    sequence.forEach((action, idx) => {
      setTimeout(() => {
        if (!level) return;

        const currentX = heroPosRef.current.x;
        const currentY = heroPosRef.current.y;

        if (action.type === 'say' && action.param) {
          setHeroBubble(action.param);
          
          // Spawn floating text particle
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text: action.param!, x: currentX, y: currentY - 12 }]);
          setTimeout(() => {
            setFloatingTexts(p => p.filter(t => t.id !== textId));
          }, 1500);

          // Add to log console
          setPrintedLines(p => [...p, action.param!]);

          setTimeout(() => setHeroBubble(null), 2200);
        }
        else if (action.type === 'unlock') {
          setGateUnlocked(true);
          setHeroPos({ x: 70, y: 50 });
          
          const text = "Core decrypted. Gate opened.";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);
        }
        else if (action.type === 'collect') {
          const targets = level.visualSetup.targets;
          const uncollectedIndex = targets.findIndex(t => !collectedIds.includes(t.id));
          if (uncollectedIndex !== -1) {
            const target = targets[uncollectedIndex];
            setHeroDir(target.x > currentX ? 'right' : 'left');
            setHeroPos({ x: target.x - 5, y: target.y });
            
            setTimeout(() => {
              setCollectedIds(prev => [...prev, target.id]);
              
              const text = `Data packet [${target.id}] acquired.`;
              const textId = Date.now() + idx + 100;
              setFloatingTexts(p => [...p, { id: textId, text, x: target.x, y: target.y - 12 }]);
              setPrintedLines(p => [...p, text]);
              setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);
            }, 500);
          }
        }
        else if (action.type === 'drink') {
          setIsDrinking(true);
          setTimeout(() => setIsDrinking(false), 1500);
          
          const text = "Nanite repairs initiated. HP restored.";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);
        }
        else if (action.type === 'fireball') {
          const startX = currentX + 8;
          const startY = currentY + 4;
          const fireballId = Date.now() + idx;
          
          setFireballs(prev => [...prev, { id: fireballId, x: startX, y: startY }]);
          
          const text = "Plasma beam discharging...";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);

          setTimeout(() => {
            setFireballs(prev => prev.filter(fb => fb.id !== fireballId));
            const goblinTarget = level.visualSetup.targets.find(t => t.type === 'goblin');
            if (goblinTarget) {
              setCollectedIds(prev => [...prev, goblinTarget.id]);
            }
          }, 800);
        }
        else if (action.type === 'forge') {
          setIsForging(true);
          
          const text = "Fabrication protocols running...";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);

          setTimeout(() => {
            setIsForging(false);
            setBagItems(p => [...p, '⚔️ Mythic Sword']);
          }, 1500);
        }
        else if (action.type === 'hatch') {
          setPetHatched(true);
          
          const text = "Companion AI online.";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);
        }
        else if (action.type === 'victory') {
          setDragonDefeated(true);
          
          const text = "Core threat neutralized. Mainframe secure.";
          const textId = Date.now() + idx;
          setFloatingTexts(p => [...p, { id: textId, text, x: currentX, y: currentY - 12 }]);
          setPrintedLines(p => [...p, text]);
          setTimeout(() => setFloatingTexts(p => p.filter(t => t.id !== textId)), 1500);
        }
      }, timeAccumulator);
      
      timeAccumulator += 2000;
    });

  }, [codeOutput, levelId]);

  if (!level) return null;

  // Background visual themes
  const bgThemes = {
    forest: 'bg-gradient-to-b from-emerald-950 to-emerald-900 border-emerald-800',
    cave: 'bg-gradient-to-b from-purple-950 to-slate-950 border-purple-900',
    garden: 'bg-gradient-to-b from-teal-950 via-emerald-950 to-teal-900 border-teal-800',
    castle: 'bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-900 border-slate-800'
  };

  return (
    <div className="w-full flex flex-col font-sans">
      <div className={`w-full aspect-[16/9] border-4 rounded-3xl relative overflow-hidden shadow-2xl ${bgThemes[level.visualSetup.scene]}`}>
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4%_8%]"></div>

        {/* Level Stats HUD Overlay */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center gap-1.5 text-xs text-slate-200 font-extrabold uppercase tracking-wider">
            <Trophy size={13} className="text-amber-500" />
            <span>Chapter {level.chapter}: {level.chapterTitle}</span>
          </div>
          {bagItems.length > 0 && (
            <div className="bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center gap-1.5 text-xs text-amber-200 font-bold">
              <span>🎒 Bag:</span>
              <span className="font-mono text-[10px] text-slate-300">{bagItems.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Stage Visualization Elements */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Decorative background scenery */}
          {level.visualSetup.scene === 'forest' && (
            <>
              <circle cx="20" cy="90" r="15" fill="#047857" opacity="0.2" />
              <circle cx="80" cy="95" r="20" fill="#047857" opacity="0.2" />
              <polygon points="5,90 10,75 15,90" fill="#065f46" opacity="0.4" />
              <polygon points="85,90 90,70 95,90" fill="#065f46" opacity="0.4" />
            </>
          )}

          {level.visualSetup.scene === 'cave' && (
            <>
              <polygon points="30,0 35,25 40,0" fill="#4c1d95" opacity="0.3" />
              <polygon points="70,0 73,20 76,0" fill="#4c1d95" opacity="0.3" />
              <circle cx="10" cy="85" r="6" fill="#3b0764" opacity="0.5" />
            </>
          )}

          {/* Render target items */}
          {level.visualSetup.targets.map((target) => {
            const isCollected = collectedIds.includes(target.id);
            
            if (target.type === 'gate') {
              return (
                <g key={target.id}>
                  {/* Gate pillars */}
                  <rect x={target.x - 6} y={target.y - 12} width="2" height="18" fill="#475569" />
                  <rect x={target.x + 4} y={target.y - 12} width="2" height="18" fill="#475569" />
                  <rect x={target.x - 6} y={target.y - 13} width="12" height="2" fill="#334155" />
                  
                  {/* Gate door */}
                  <motion.rect
                    x={target.x - 4}
                    y={target.y - 10}
                    width="8"
                    height="15"
                    fill="#1e293b"
                    stroke="#475569"
                    strokeWidth="0.5"
                    opacity="0.8"
                    animate={{
                      transform: gateUnlocked ? 'scaleY(0)' : 'scaleY(1)',
                      transformOrigin: 'top'
                    }}
                    transition={{ duration: 1 }}
                  />
                </g>
              );
            }

            return (
              <AnimatePresence key={target.id}>
                {!isCollected && (
                  <motion.g
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ 
                      scale: 0.15, 
                      opacity: 0, 
                      x: heroPos.x - target.x, 
                      y: heroPos.y - target.y 
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  >
                    {target.type === 'chest' && (
                      <motion.g initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <rect x={target.x - 4} y={target.y - 4} width="8" height="6" rx="1.5" fill="#1e293b" stroke="#3b82f6" strokeWidth="0.8" />
                        <rect x={target.x - 3} y={target.y - 4} width="6" height="2.5" rx="0.5" fill="#3b82f6" opacity="0.6" />
                        <circle cx={target.x} cy={target.y - 1.5} r="0.8" fill="#60a5fa" className="animate-pulse" />
                      </motion.g>
                    )}

                    {target.type === 'goblin' && (
                      <motion.g
                        initial={{ y: 0 }}
                        animate={{ y: [-1, 1, -1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        {/* Red hostile scanner drone */}
                        <circle cx={target.x} cy={target.y - 3} r="3" fill="#1f2937" stroke="#ef4444" strokeWidth="0.8" />
                        <ellipse cx={target.x} cy={target.y + 1} rx="4" ry="2.5" fill="#111827" stroke="#ef4444" strokeWidth="0.4" />
                        <circle cx={target.x - 1.2} cy={target.y - 3.5} r="0.6" fill="#f43f5e" className="animate-pulse" />
                        <circle cx={target.x + 1.2} cy={target.y - 3.5} r="0.6" fill="#f43f5e" className="animate-pulse" />
                      </motion.g>
                    )}

                    {target.type === 'gem' && (
                      <motion.g
                        animate={{ y: [-1.5, 1.5, -1.5], rotate: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
                        style={{ transformOrigin: `${target.x}px ${target.y}px` }}
                      >
                        <polygon
                          points={`${target.x},${target.y - 3.5} ${target.x + 2.5},${target.y} ${target.x},${target.y + 3.5} ${target.x - 2.5},${target.y}`}
                          fill="#06b6d4"
                          stroke="#0891b2"
                          strokeWidth="0.5"
                        />
                        <circle cx={target.x} cy={target.y} r="0.5" fill="white" />
                      </motion.g>
                    )}

                    {target.type === 'potion' && (
                      <motion.g
                        animate={{ y: [-1, 1, -1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {/* Blue Nanite Cell / Battery */}
                        <rect x={target.x - 1} y={target.y - 4} width="2" height="2" fill="#94a3b8" />
                        <circle cx={target.x} cy={target.y - 1} r="2.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.8" />
                        <rect x={target.x - 1.5} y={target.y - 4.5} width="3" height="0.8" fill="#cbd5e1" />
                        <rect x={target.x - 1.2} y={target.y - 2} width="2.4" height="1.5" fill="#93c5fd" />
                      </motion.g>
                    )}

                    {target.type === 'dragon' && !dragonDefeated && (
                      <motion.g
                        animate={{ y: [-3, 3, -3] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      >
                        {/* Rogue Security Core Mech */}
                        <path d={`M ${target.x - 8} ${target.y - 8} Q ${target.x - 18} ${target.y - 16} ${target.x - 16} ${target.y}`} fill="#3b82f6" opacity="0.6" />
                        <path d={`M ${target.x + 8} ${target.y - 8} Q ${target.x + 18} ${target.y - 16} ${target.x + 16} ${target.y}`} fill="#3b82f6" opacity="0.6" />
                        <circle cx={target.x} cy={target.y} r="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                        <circle cx={target.x + 5} cy={target.y - 6} r="4" fill="#334155" />
                        <polygon points={`${target.x + 4},${target.y - 9} ${target.x + 8},${target.y - 11} ${target.x + 6},${target.y - 6}`} fill="#60a5fa" />
                        <circle cx={target.x + 6.2} cy={target.y - 7} r="0.6" fill="#ef4444" />
                      </motion.g>
                    )}
                  </motion.g>
                )}
              </AnimatePresence>
            );
          })}
        </svg>

        {/* Render traveling fireballs */}
        <AnimatePresence>
          {fireballs.map((fb) => (
            <motion.div
              key={fb.id}
              initial={{ x: `${fb.x}%`, y: `${fb.y}%`, scale: 0.8 }}
              animate={{ x: '60%', y: '50%', scale: 1.4 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute z-10 w-4 h-4 bg-orange-500 rounded-full shadow-lg shadow-orange-600/50 flex items-center justify-center border-2 border-amber-300"
            >
              <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping"></div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Visual feedback effects: drinking potion, dragon defeat particles */}
        {isDrinking && (
          <div className="absolute inset-0 bg-emerald-500/10 border-4 border-emerald-500 animate-pulse flex items-center justify-center z-15">
            <span className="text-emerald-400 font-extrabold text-sm tracking-wide bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/30">🧪 HEALING +50 HP</span>
          </div>
        )}

        {isForging && (
          <div className="absolute inset-0 bg-amber-500/10 border-4 border-amber-500 animate-pulse flex items-center justify-center z-15">
            <span className="text-amber-400 font-extrabold text-sm tracking-wide bg-slate-900/90 px-3 py-1.5 rounded-xl border border-amber-500/30">🔨 FORGING MYTHIC SWORD</span>
          </div>
        )}

        {dragonDefeated && (
          <div className="absolute inset-0 bg-rose-500/10 border-4 border-rose-500 flex items-center justify-center z-15">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              className="text-rose-400 font-black text-sm tracking-widest bg-slate-900/90 px-4 py-2 rounded-2xl border border-rose-500/30 flex items-center gap-2"
            >
              <Swords className="text-rose-500" size={16} />
              <span>VOID DRAGON DEFEATED!</span>
            </motion.div>
          </div>
        )}

        {/* Futuristic Laser Scanning Line when running */}
        {isRunning && (
          <motion.div
            className="absolute left-0 w-full h-1 bg-cyan-400/80 shadow-[0_0_10px_#22d3ee] z-25"
            initial={{ top: '0%' }}
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
        )}

        {/* Lock-on / Systems Aligned HUD animation on success */}
        {success && (
          <div className="absolute inset-0 z-25 pointer-events-none flex items-center justify-center">
            {/* Top-Left Corner Bracket */}
            <motion.div
              className="absolute w-6 h-6 border-t-4 border-l-4 border-emerald-400"
              initial={{ top: '5%', left: '5%' }}
              animate={{ top: '25%', left: '38%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Top-Right Corner Bracket */}
            <motion.div
              className="absolute w-6 h-6 border-t-4 border-r-4 border-emerald-400"
              initial={{ top: '5%', right: '5%' }}
              animate={{ top: '25%', right: '38%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Bottom-Left Corner Bracket */}
            <motion.div
              className="absolute w-6 h-6 border-b-4 border-l-4 border-emerald-400"
              initial={{ bottom: '5%', left: '5%' }}
              animate={{ bottom: '25%', left: '38%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            {/* Bottom-Right Corner Bracket */}
            <motion.div
              className="absolute w-6 h-6 border-b-4 border-r-4 border-emerald-400"
              initial={{ bottom: '5%', right: '5%' }}
              animate={{ bottom: '25%', right: '38%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
            
            {/* Pulse alignment wave container */}
            <motion.div
              className="w-1/4 aspect-[16/9] border border-emerald-500/50 rounded-2xl bg-slate-950/90 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] px-2 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <motion.span 
                className="text-[9px] font-black text-emerald-400 uppercase tracking-widest"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                📡 GRID ALIGNED
              </motion.span>
              <span className="text-[7px] font-mono text-emerald-500/80 mt-0.5 uppercase">Sync Completed</span>
            </motion.div>
          </div>
        )}

        {/* Hero Character (Robot Sprite) */}
        <motion.div
          className="absolute z-20 w-12 h-12 flex flex-col items-center"
          animate={success ? {
            x: `${heroPos.x}%`,
            y: [`${heroPos.y}%`, `${heroPos.y - 12}%`, `${heroPos.y}%`],
            rotate: [0, 360, 360]
          } : {
            x: `${heroPos.x}%`,
            y: `${heroPos.y}%`
          }}
          transition={success ? {
            y: { duration: 0.7, ease: "easeInOut", repeat: 3 },
            rotate: { duration: 0.7, ease: "easeInOut", repeat: 3 }
          } : { type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* Speech Bubble */}
          <AnimatePresence>
            {heroBubble && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -26, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bg-slate-900/95 text-slate-100 text-[10px] font-black border border-slate-700 px-2 py-1.5 rounded-xl shadow-xl w-32 text-center break-words select-none leading-tight"
              >
                {heroBubble}
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sparky companion dragon flying beside hero */}
          {petHatched && (
            <motion.div
              className="absolute right-[-14px] top-[-8px] text-lg select-none"
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🐉
            </motion.div>
          )}

          {/* Robot body SVG */}
          <svg className="w-8 h-8 drop-shadow-lg" viewBox="0 0 32 32">
            {/* Robot Head */}
            <rect x="6" y="2" width="20" height="14" rx="3" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="11" cy="9" r="2.5" fill="#0ea5e9" />
            <circle cx="21" cy="9" r="2.5" fill="#0ea5e9" />
            {/* Antennas */}
            <line x1="16" y1="2" x2="16" y2="0" stroke="#475569" strokeWidth="1.5" />
            <circle cx="16" cy="0" r="1.5" fill="#38bdf8" />
            {/* Body */}
            <rect x="8" y="16" width="16" height="12" rx="2.5" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            {/* Screen details */}
            <rect x="11" y="19" width="10" height="6" rx="1" fill="#1e293b" />
            <circle cx="13" cy="22" r="1" fill="#f43f5e" className="animate-pulse" />
            {/* Wheels / feet */}
            <circle cx="11" cy="29" r="2" fill="#475569" />
            <circle cx="21" cy="29" r="2" fill="#475569" />
          </svg>
        </motion.div>

        {/* Success Splash overlay */}
        {showSuccessSplash && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex flex-col items-center justify-center z-30 select-none">
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-900 border-2 border-yellow-500/50 p-6 rounded-3xl shadow-2xl max-w-[280px] text-center space-y-4"
            >
              <div className="w-16 h-16 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl flex items-center justify-center mx-auto text-yellow-400">
                <Award size={36} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-md font-black text-slate-100 uppercase tracking-wider">Level Completed!</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Excellent coding! Your system protocols ran correctly. You earned +{level.xpReward} XP!</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Floating rising text particles */}
        <AnimatePresence>
          {floatingTexts.map(ft => (
            <motion.div
              key={ft.id}
              initial={{ opacity: 1, y: `${ft.y}%`, scale: 0.8 }}
              animate={{ opacity: 0, y: `${ft.y - 20}%`, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute z-35 bg-slate-950/90 text-cyan-400 font-mono text-[9px] font-black border border-cyan-500/30 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.2)] pointer-events-none"
              style={{ left: `${ft.x}%` }}
            >
              {ft.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Holographic Log Terminal overlay */}
        <div className="absolute top-4 right-4 z-20 w-44 bg-slate-950/85 backdrop-blur border border-indigo-500/30 p-2 rounded-xl text-[8px] font-mono text-cyan-400 space-y-1 max-h-16 overflow-hidden shadow-lg shadow-indigo-950/20">
          <div className="text-slate-400 font-extrabold text-[7px] border-b border-indigo-950 pb-0.5 flex justify-between">
            <span>📡 MAIN CONSOLE</span>
            <span className="animate-pulse text-emerald-400">● LIVE</span>
          </div>
          <div className="space-y-0.5 max-h-[40px] overflow-y-auto custom-scrollbar">
            {printedLines.slice(-3).map((line, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="truncate text-slate-300"
              >
                &gt; {line}
              </motion.div>
            ))}
            {printedLines.length === 0 && (
              <div className="text-slate-500 italic">Idle. Awaiting sync...</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
