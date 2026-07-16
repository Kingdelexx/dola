'use client';
import { useEffect, useState } from 'react';
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
  success 
}: { 
  levelId: string; 
  codeOutput: string; 
  success: boolean;
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
    }
  }, [levelId, level]);

  // Parse stdout lines and run action sequence
  useEffect(() => {
    if (!codeOutput || !level) return;
    
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
        sequence.push({ type: 'say', param: 'Ah, yummy health potion! 🧪' });
      }
      else if (line.includes('fireball!')) {
        sequence.push({ type: 'fireball' });
        sequence.push({ type: 'say', param: 'Take this, Goblin! 🔥' });
      }
      else if (line.includes('forging...')) {
        sequence.push({ type: 'forge' });
        sequence.push({ type: 'say', param: 'Hammertime! Forging a weapon... 🔨' });
      }
      else if (line.includes('hello!')) {
        sequence.push({ type: 'hatch' });
        sequence.push({ type: 'say', param: 'Hello Sparky! Welcome to the world! 🐉' });
      }
      else if (line.includes('victory')) {
        sequence.push({ type: 'victory' });
        sequence.push({ type: 'say', param: 'We defeated the Boss! 🏆' });
      }
      else if (line.includes('sword') || line.includes('potion') || line.includes('shield')) {
        sequence.push({ type: 'say', param: `Inventory updated: ${line}` });
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

        if (action.type === 'say' && action.param) {
          setHeroBubble(action.param);
          setTimeout(() => setHeroBubble(null), 2200);
        }
        else if (action.type === 'unlock') {
          setGateUnlocked(true);
          // Walk to gate
          setHeroPos({ x: 70, y: 50 });
        }
        else if (action.type === 'collect') {
          // Walk to next uncollected gem/chest
          const targets = level.visualSetup.targets;
          const uncollectedIndex = targets.findIndex(t => !collectedIds.includes(t.id));
          if (uncollectedIndex !== -1) {
            const target = targets[uncollectedIndex];
            setHeroDir(target.x > heroPos.x ? 'right' : 'left');
            setHeroPos({ x: target.x - 5, y: target.y });
            
            // collect it after walk time
            setTimeout(() => {
              setCollectedIds(prev => [...prev, target.id]);
            }, 500);
          }
        }
        else if (action.type === 'drink') {
          setIsDrinking(true);
          setTimeout(() => setIsDrinking(false), 1500);
        }
        else if (action.type === 'fireball') {
          // Shoot fireball projectile
          const startX = heroPos.x + 8;
          const startY = heroPos.y + 4;
          const fireballId = Date.now() + idx;
          
          setFireballs(prev => [...prev, { id: fireballId, x: startX, y: startY }]);
          
          // Animate fireball traveling
          setTimeout(() => {
            setFireballs(prev => prev.filter(fb => fb.id !== fireballId));
            // Trigger goblin defeated
            const goblinTarget = level.visualSetup.targets.find(t => t.type === 'goblin');
            if (goblinTarget) {
              setCollectedIds(prev => [...prev, goblinTarget.id]);
            }
          }, 800);
        }
        else if (action.type === 'forge') {
          setIsForging(true);
          setTimeout(() => {
            setIsForging(false);
            setBagItems(p => [...p, '⚔️ Mythic Sword']);
          }, 1500);
        }
        else if (action.type === 'hatch') {
          setPetHatched(true);
        }
        else if (action.type === 'victory') {
          setDragonDefeated(true);
        }
      }, timeAccumulator);
      
      timeAccumulator += 2000; // 2 seconds per sequence action
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
            if (isCollected && target.type !== 'gate') return null;

            return (
              <g key={target.id}>
                {target.type === 'chest' && (
                  <motion.g initial={{ scale: 1 }} animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <rect x={target.x - 4} y={target.y - 4} width="8" height="6" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
                    <rect x={target.x - 3} y={target.y - 4} width="6" height="2.5" rx="0.5" fill="#d97706" />
                    <circle cx={target.x} cy={target.y - 1.5} r="0.8" fill="#f59e0b" />
                  </motion.g>
                )}

                {target.type === 'gate' && (
                  <g>
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
                )}

                {target.type === 'goblin' && (
                  <motion.g
                    initial={{ y: 0 }}
                    animate={{ y: [-1, 1, -1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <circle cx={target.x} cy={target.y - 3} r="3" fill="#15803d" />
                    <ellipse cx={target.x} cy={target.y + 1} rx="4" ry="2.5" fill="#166534" />
                    <circle cx={target.x - 1.2} cy={target.y - 3.5} r="0.6" fill="#f43f5e" />
                    <circle cx={target.x + 1.2} cy={target.y - 3.5} r="0.6" fill="#f43f5e" />
                  </motion.g>
                )}

                {target.type === 'gem' && (
                  <motion.g
                    animate={{ y: [-1.5, 1.5, -1.5] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  >
                    <polygon
                      points={`${target.x},${target.y - 3.5} ${target.x + 2.5},${target.y} ${target.x},${target.y + 3.5} ${target.x - 2.5},${target.y}`}
                      fill="#06b6d4"
                      stroke="#0891b2"
                      strokeWidth="0.5"
                    />
                    <circle cx={target.x} cy={target.y} r="0.5" fill="#white" />
                  </motion.g>
                )}

                {target.type === 'potion' && (
                  <motion.g
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <rect x={target.x - 1} y={target.y - 4} width="2" height="2" fill="#cbd5e1" />
                    <circle cx={target.x} cy={target.y - 1} r="2.5" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.5" />
                    <rect x={target.x - 1.5} y={target.y - 4.5} width="3" height="0.8" fill="#94a3b8" />
                  </motion.g>
                )}

                {target.type === 'dragon' && !dragonDefeated && (
                  <motion.g
                    animate={{ y: [-3, 3, -3] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    {/* Giant Dragon wings */}
                    <path d={`M ${target.x - 8} ${target.y - 8} Q ${target.x - 18} ${target.y - 16} ${target.x - 16} ${target.y}`} fill="#dc2626" opacity="0.8" />
                    <path d={`M ${target.x + 8} ${target.y - 8} Q ${target.x + 18} ${target.y - 16} ${target.x + 16} ${target.y}`} fill="#dc2626" opacity="0.8" />
                    {/* Dragon Body */}
                    <circle cx={target.x} cy={target.y} r="8" fill="#991b1b" />
                    <circle cx={target.x + 5} cy={target.y - 6} r="4" fill="#b91c1c" />
                    <polygon points={`${target.x + 4},${target.y - 9} ${target.x + 8},${target.y - 11} ${target.x + 6},${target.y - 6}`} fill="#b45309" />
                    {/* Glowing yellow dragon eyes */}
                    <circle cx={target.x + 6.2} cy={target.y - 7} r="0.6" fill="#fbbf24" />
                  </motion.g>
                )}
              </g>
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

        {/* Hero Character (Robot Sprite) */}
        <motion.div
          className="absolute z-20 w-12 h-12 flex flex-col items-center"
          animate={{
            x: `${heroPos.x}%`,
            y: `${heroPos.y}%`
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
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
        {success && (
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
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Excellent coding! Your spells ran correctly and solved the quest. You earned +{level.xpReward} XP!</p>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
