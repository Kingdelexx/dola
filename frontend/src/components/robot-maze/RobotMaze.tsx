'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw, 
  HelpCircle, CheckCircle2, Award, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, Trash2, ArrowUp, ArrowDown, ArrowLeft,
  Bot, BatteryCharging, Zap, Compass, Bug, ShieldCheck, Home, Map
} from 'lucide-react';
import { speakFemale, stopSpeech } from '@/lib/speech';

// --- Sound Synthesizer via Web Audio API (Zero External Asset Dependency) ---
class SoundEffects {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playStep() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.07);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  playTurn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.09);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Gentle, friendly obstacle bounce (boing tone - never harsh or scary)
  playBump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [659.25, 880, 1046.5]; // E5, A5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.22, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.2);
    });
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.28, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.45);
    });
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playDelete() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

const sounds = new SoundEffects();

// --- Speech Synthesis Helper (Female Voice) ---
function speakText(text: string, enabled: boolean) {
  speakFemale(text, {
    enabled,
    rate: 0.95,
    pitch: 1.15,
  });
}

// --- Maze Types & Enums ---
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type CellType = 'empty' | 'wall' | 'rock' | 'water' | 'tree' | 'target' | 'crystal';

export interface CommandBlock {
  id: string;
  type: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'REPEAT' | 'IF_CLEAR';
  repeatCount?: number;
  innerCommand?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export interface MazeGridDefinition {
  id: number;
  level: number;
  title: string;
  missionName: string;
  storyPrompt: string;
  speechText: string;
  rows: number;
  cols: number;
  startPos: [number, number]; // [row, col]
  startDirection: Direction;
  targetPos: [number, number];
  obstacles: { pos: [number, number]; type: 'wall' | 'rock' | 'water' | 'tree' }[];
  crystals: [number, number][]; // Optional items to collect
  preloadedCommands?: CommandBlock[]; // For debugging levels
  allowedCommands: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'REPEAT' | 'IF_CLEAR')[];
  hintText: string;
  optimalCommandsCount: number;
}

// --- 10 Pre-Designed Educational Maze Levels (Levels 1–10) ---
const MAZE_LEVELS: MazeGridDefinition[] = [
  // LEVEL 1: Simple one-step movement
  {
    id: 1,
    level: 1,
    title: 'Level 1: Robo\'s First Step',
    missionName: 'Power Dock Discovery',
    storyPrompt: 'Help Robo take 2 steps forward to reach the glowing power dock! ⚡',
    speechText: 'Help Robo step forward into the power dock! Tap MOVE RIGHT twice, then press GO!',
    rows: 4,
    cols: 4,
    startPos: [1, 1],
    startDirection: 'RIGHT',
    targetPos: [1, 3],
    obstacles: [
      { pos: [0, 1], type: 'wall' },
      { pos: [0, 2], type: 'wall' },
      { pos: [2, 1], type: 'wall' },
      { pos: [2, 2], type: 'wall' },
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
    hintText: 'Robo is facing right! Tap MOVE RIGHT ➡️ twice, then tap the big GO button.',
    optimalCommandsCount: 2
  },

  // LEVEL 2: Two- and three-step sequences
  {
    id: 2,
    level: 2,
    title: 'Level 2: Step-by-Step Path',
    missionName: 'Garden Pathway',
    storyPrompt: 'Guide Robo straight across the stones to the charging station! 🔋',
    speechText: 'Guide Robo across the path to the charging station. Use three forward steps!',
    rows: 4,
    cols: 5,
    startPos: [1, 0],
    startDirection: 'RIGHT',
    targetPos: [1, 3],
    obstacles: [
      { pos: [0, 1], type: 'tree' },
      { pos: [0, 2], type: 'tree' },
      { pos: [2, 1], type: 'rock' },
      { pos: [2, 2], type: 'rock' },
      { pos: [1, 4], type: 'wall' }
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
    hintText: 'Count the tiles from Robo to the dock: 1, 2, 3! Put 3 MOVE RIGHT blocks in line.',
    optimalCommandsCount: 3
  },

  // LEVEL 3: Longer paths with turns
  {
    id: 3,
    level: 3,
    title: 'Level 3: Turning the Corner',
    missionName: 'Corner Castle',
    storyPrompt: 'Watch out for the stone wall! Turn the corner to guide Robo home! 🏰',
    speechText: 'Robo needs to turn the corner! Walk right, then turn and walk down to home base.',
    rows: 5,
    cols: 5,
    startPos: [1, 1],
    startDirection: 'RIGHT',
    targetPos: [3, 3],
    obstacles: [
      { pos: [1, 3], type: 'wall' },
      { pos: [2, 1], type: 'water' },
      { pos: [0, 2], type: 'tree' },
      { pos: [4, 3], type: 'rock' }
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
    hintText: 'Move RIGHT 2 times, then move DOWN 2 times to reach the safe charging base!',
    optimalCommandsCount: 4
  },

  // LEVEL 4: Collect items before reaching the target
  {
    id: 4,
    level: 4,
    title: 'Level 4: Crystal Collector',
    missionName: 'Energy Crystal Hunt',
    storyPrompt: 'Collect the blue energy crystal before entering the charging station! 💎',
    speechText: 'Collect the blue energy crystal on the way to the charging station!',
    rows: 5,
    cols: 5,
    startPos: [1, 0],
    startDirection: 'RIGHT',
    targetPos: [3, 2],
    obstacles: [
      { pos: [0, 1], type: 'rock' },
      { pos: [2, 1], type: 'wall' },
      { pos: [1, 3], type: 'tree' },
      { pos: [3, 1], type: 'water' }
    ],
    crystals: [[1, 2]],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
    hintText: 'Go RIGHT 2 times to grab the crystal 💎, then go DOWN 2 times to charge up!',
    optimalCommandsCount: 4
  },

  // LEVEL 5: Introduce REPEAT blocks
  {
    id: 5,
    level: 5,
    title: 'Level 5: Loop Power!',
    missionName: 'Speedy Super Corridor',
    storyPrompt: 'Use a REPEAT loop to zoom down the long hallway with fewer blocks! 🔄',
    speechText: 'Use a REPEAT block! Instead of 4 separate arrows, loop MOVE RIGHT 4 times!',
    rows: 4,
    cols: 6,
    startPos: [1, 0],
    startDirection: 'RIGHT',
    targetPos: [1, 4],
    obstacles: [
      { pos: [0, 0], type: 'wall' },
      { pos: [0, 1], type: 'wall' },
      { pos: [0, 2], type: 'wall' },
      { pos: [0, 3], type: 'wall' },
      { pos: [0, 4], type: 'wall' },
      { pos: [2, 0], type: 'wall' },
      { pos: [2, 1], type: 'wall' },
      { pos: [2, 2], type: 'wall' },
      { pos: [2, 3], type: 'wall' },
      { pos: [2, 4], type: 'wall' },
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'REPEAT'],
    hintText: 'Tap the purple REPEAT block! Set it to REPEAT 4× MOVE RIGHT to reach the dock in one command!',
    optimalCommandsCount: 1
  },

  // LEVEL 6: Dual Loop Expedition
  {
    id: 6,
    level: 6,
    title: 'Level 6: Dual Loop Expedition',
    missionName: 'Double Loop Journey',
    storyPrompt: 'Combine two repeat loops: one for walking right, one for walking down! 🚀',
    speechText: 'Combine two loops! First loop right across the open yard, then loop down to the goal.',
    rows: 6,
    cols: 6,
    startPos: [1, 1],
    startDirection: 'RIGHT',
    targetPos: [4, 4],
    obstacles: [
      { pos: [2, 2], type: 'water' },
      { pos: [2, 3], type: 'water' },
      { pos: [3, 2], type: 'rock' },
      { pos: [3, 3], type: 'rock' },
      { pos: [0, 1], type: 'wall' },
      { pos: [5, 4], type: 'wall' }
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'REPEAT'],
    hintText: 'Build: [REPEAT 3× RIGHT] then [REPEAT 3× DOWN]! That solves the entire journey with 2 blocks!',
    optimalCommandsCount: 2
  },

  // LEVEL 7: Introduce simple conditions (IF PATH IS CLEAR)
  {
    id: 7,
    level: 7,
    title: 'Level 7: Smart Sensor Robot',
    missionName: 'Robo Radar Sensor',
    storyPrompt: 'Robo has obstacle radar! Use IF PATH CLEAR to walk forward safely! 🤖',
    speechText: 'Use Robo radar! IF PATH IS CLEAR tells Robo to step forward only when safe.',
    rows: 5,
    cols: 5,
    startPos: [2, 1],
    startDirection: 'RIGHT',
    targetPos: [2, 4],
    obstacles: [
      { pos: [1, 2], type: 'tree' },
      { pos: [3, 2], type: 'tree' },
      { pos: [0, 4], type: 'rock' }
    ],
    crystals: [],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'IF_CLEAR'],
    hintText: 'Robo path is clear ahead! Use IF CLEAR: RIGHT or 3 forward steps to reach home.',
    optimalCommandsCount: 3
  },

  // LEVEL 8: Debug incorrect code
  {
    id: 8,
    level: 8,
    title: 'Level 8: Bug Detective!',
    missionName: 'Fix the Broken Code',
    storyPrompt: 'Uh oh! Someone left a bug in Robo code that hits a tree. Fix it! 🐛',
    speechText: 'Robo pre-loaded code has a bug! Tap on the wrong block to remove or fix it.',
    rows: 5,
    cols: 5,
    startPos: [1, 1],
    startDirection: 'RIGHT',
    targetPos: [3, 3],
    obstacles: [
      { pos: [0, 2], type: 'tree' },
      { pos: [2, 1], type: 'rock' },
      { pos: [1, 3], type: 'wall' }
    ],
    crystals: [],
    // Buggy code preloaded: RIGHT, RIGHT, UP (bumps tree!), DOWN, DOWN
    preloadedCommands: [
      { id: 'b1', type: 'RIGHT' },
      { id: 'b2', type: 'RIGHT' },
      { id: 'b3', type: 'UP' }, // The bug!
      { id: 'b4', type: 'DOWN' },
      { id: 'b5', type: 'DOWN' },
    ],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT'],
    hintText: 'Look at step 3: MOVE UP will bump right into the tree! Delete step 3 or change it.',
    optimalCommandsCount: 4
  },

  // LEVEL 9: Crystal Cavern Maze
  {
    id: 9,
    level: 9,
    title: 'Level 9: Crystal Cavern Maze',
    missionName: 'Triple Crystal Quest',
    storyPrompt: 'Collect all 2 glowing crystals before entering the home station! 💎💎',
    speechText: 'Collect both energy crystals before stepping onto the home dock!',
    rows: 6,
    cols: 6,
    startPos: [1, 1],
    startDirection: 'RIGHT',
    targetPos: [4, 4],
    obstacles: [
      { pos: [1, 3], type: 'wall' },
      { pos: [2, 3], type: 'wall' },
      { pos: [3, 1], type: 'water' },
      { pos: [3, 2], type: 'rock' }
    ],
    crystals: [[1, 2], [3, 3]],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'REPEAT'],
    hintText: 'Collect crystal #1 at (1,2), step down to crystal #2 at (3,3), then proceed to the dock!',
    optimalCommandsCount: 5
  },

  // LEVEL 10: Robo's Grand Journey Finale
  {
    id: 10,
    level: 10,
    title: 'Level 10: Robo\'s Grand Journey Finale',
    missionName: 'Grand Championship Maze',
    storyPrompt: 'The Grand Mission! Use everything you learned to win the Golden Robo Trophy! 🏆',
    speechText: 'The grand finale! Collect the gold battery crystal and guide Robo safely home!',
    rows: 6,
    cols: 6,
    startPos: [0, 0],
    startDirection: 'RIGHT',
    targetPos: [5, 5],
    obstacles: [
      { pos: [0, 2], type: 'wall' },
      { pos: [1, 2], type: 'wall' },
      { pos: [2, 2], type: 'wall' },
      { pos: [3, 4], type: 'water' },
      { pos: [4, 4], type: 'water' },
      { pos: [3, 1], type: 'tree' },
      { pos: [4, 1], type: 'rock' }
    ],
    crystals: [[2, 1], [4, 3]],
    allowedCommands: ['UP', 'DOWN', 'LEFT', 'RIGHT', 'REPEAT'],
    hintText: 'Plan your route: Walk down and collect the crystal, turn past the water, and loop home!',
    optimalCommandsCount: 6
  }
];

// --- Badge Definitions ---
export interface RobotBadge {
  name: string;
  title: string;
  icon: string;
  desc: string;
  unlocked: boolean;
}

const BADGES_LIST: RobotBadge[] = [
  { name: 'Robo Rookie', title: 'Robo Rookie', icon: '🤖', desc: 'Complete your first robot maze mission!', unlocked: false },
  { name: 'Maze Explorer', title: 'Maze Explorer', icon: '🧭', desc: 'Guide Robo through 5 tricky maze missions!', unlocked: false },
  { name: 'Direction Master', title: 'Direction Master', icon: '🎯', desc: 'Master multi-turn navigation paths!', unlocked: false },
  { name: 'Bug Fixer', title: 'Bug Fixer', icon: '🛠️', desc: 'Debug and fix broken code to guide Robo home!', unlocked: false },
  { name: 'Loop Legend', title: 'Loop Legend', icon: '🔄', desc: 'Master repeat loops to write ultra-smart code!', unlocked: false },
];

export interface RobotMazeProps {
  initialLevel?: number;
  onBackToStage1?: () => void;
}

export default function RobotMaze({ initialLevel = 1, onBackToStage1 }: RobotMazeProps) {
  const router = useRouter();

  // Active level state
  const [currentLevelNum, setCurrentLevelNum] = useState<number>(initialLevel);
  const currentLevelDef = MAZE_LEVELS.find(l => l.level === currentLevelNum) || MAZE_LEVELS[0];

  // Robo position and orientation
  const [roboPos, setRoboPos] = useState<[number, number]>(currentLevelDef.startPos);
  const [roboDir, setRoboDir] = useState<Direction>(currentLevelDef.startDirection);
  const [isBumping, setIsBumping] = useState<boolean>(false);
  const [isDancing, setIsDancing] = useState<boolean>(false);

  // Command queue & Execution
  const [commands, setCommands] = useState<CommandBlock[]>([]);
  const [executingIndex, setExecutingIndex] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Repeat count selector for new loop blocks
  const [selectedRepeatCount, setSelectedRepeatCount] = useState<number>(3);
  const [selectedRepeatDir, setSelectedRepeatDir] = useState<Direction>('RIGHT');

  // Collected crystals in current round
  const [collectedCrystals, setCollectedCrystals] = useState<string[]>([]); // "row,col"

  // Feedback & Lizzy
  const [lizzySpeech, setLizzySpeech] = useState<string>(currentLevelDef.storyPrompt);
  const [showHintBubble, setShowHintBubble] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Performance & Gamification Stats
  const [dolaCoins, setDolaCoins] = useState<number>(0);
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<RobotBadge | null>(null);

  // Analytics for Parents / Teachers
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [missionsCompleted, setMissionsCompleted] = useState<number>(0);
  const [commandsUsedTotal, setCommandsUsedTotal] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [debuggingAttempts, setDebuggingAttempts] = useState<number>(0);
  const [loopsCompletedCount, setLoopsCompletedCount] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Navigation / Modal States
  const [levelCompleteModal, setLevelCompleteModal] = useState<{
    completedLevel: number;
    isGameFinale: boolean;
    starsEarned: number;
    dolaCoinsEarned: number;
    xpEarned: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'maze' | 'badges'>('maze');

  // Load saved progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dola_robot_maze_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dolaCoins !== undefined) setDolaCoins(parsed.dolaCoins);
        if (parsed.xpPoints !== undefined) setXpPoints(parsed.xpPoints);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.unlockedLevel !== undefined) {
          setUnlockedLevel(parsed.unlockedLevel);
          if (initialLevel === 1 && parsed.unlockedLevel > 1) {
            // Keep user on their latest unlocked level if no specific initialLevel requested
            // but respect initialLevel prop if > 1
          }
        }
        if (parsed.earnedBadges) setEarnedBadges(parsed.earnedBadges);
        if (parsed.totalAttempts) setTotalAttempts(parsed.totalAttempts);
        if (parsed.missionsCompleted) setMissionsCompleted(parsed.missionsCompleted);
        if (parsed.commandsUsedTotal) setCommandsUsedTotal(parsed.commandsUsedTotal);
        if (parsed.hintsUsedCount) setHintsUsedCount(parsed.hintsUsedCount);
        if (parsed.debuggingAttempts) setDebuggingAttempts(parsed.debuggingAttempts);
        if (parsed.loopsCompletedCount) setLoopsCompletedCount(parsed.loopsCompletedCount);
        if (parsed.timeSpentSeconds) setTimeSpentSeconds(parsed.timeSpentSeconds);
      }
    } catch (e) {
      // Ignore
    }
  }, [initialLevel]);

  // Timer tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state to local storage and backend API
  const persistProgress = useCallback((updated: Partial<{
    dolaCoins: number;
    xpPoints: number;
    unlockedLevel: number;
    streak: number;
    missionsCompleted: number;
    earnedBadges: string[];
    hintsUsedCount: number;
    totalAttempts: number;
    commandsUsedTotal: number;
    debuggingAttempts: number;
    loopsCompletedCount: number;
  }>) => {
    try {
      const current = {
        dolaCoins,
        xpPoints,
        unlockedLevel,
        streak,
        missionsCompleted,
        earnedBadges,
        hintsUsedCount,
        totalAttempts,
        commandsUsedTotal,
        debuggingAttempts,
        loopsCompletedCount,
        timeSpentSeconds,
        ...updated
      };
      localStorage.setItem('dola_robot_maze_state', JSON.stringify(current));

      // Sync with backend API
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const accuracy = current.totalAttempts > 0 
          ? Math.round((current.missionsCompleted / Math.max(1, current.totalAttempts)) * 100) 
          : 100;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/robot-maze/save-progress/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            current_level: current.unlockedLevel,
            stars_earned: Math.round(current.missionsCompleted * 3),
            dola_coins: current.dolaCoins,
            xp_earned: current.xpPoints,
            accuracy,
            attempts: current.totalAttempts,
            missions_completed: current.missionsCompleted,
            commands_used: current.commandsUsedTotal,
            hints_used: current.hintsUsedCount,
            debugging_attempts: current.debuggingAttempts,
            loops_completed: current.loopsCompletedCount,
            time_spent_seconds: current.timeSpentSeconds,
            badges: current.earnedBadges
          })
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }, [
    dolaCoins, xpPoints, unlockedLevel, streak, missionsCompleted, earnedBadges,
    hintsUsedCount, totalAttempts, commandsUsedTotal, debuggingAttempts,
    loopsCompletedCount, timeSpentSeconds
  ]);

  // Reset/Initialize level
  const loadLevel = useCallback((levelNum: number) => {
    const def = MAZE_LEVELS.find(l => l.level === levelNum) || MAZE_LEVELS[0];
    setCurrentLevelNum(levelNum);
    setRoboPos(def.startPos);
    setRoboDir(def.startDirection);
    setIsBumping(false);
    setIsDancing(false);
    setIsRunning(false);
    setExecutingIndex(null);
    setCollectedCrystals([]);
    setShowHintBubble(false);
    setLevelCompleteModal(null);
    setLizzySpeech(def.storyPrompt);

    // If preloaded commands (e.g. debugging level 8), populate them
    if (def.preloadedCommands && def.preloadedCommands.length > 0) {
      setCommands([...def.preloadedCommands]);
    } else {
      setCommands([]);
    }

    speakText(def.speechText, soundEnabled);
  }, [soundEnabled]);

  // Initialize level on mount or when level changes
  useEffect(() => {
    loadLevel(currentLevelNum);
  }, [currentLevelNum, loadLevel]);

  // Add command to sequence
  const addCommand = (type: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'REPEAT' | 'IF_CLEAR') => {
    if (isRunning) return;
    sounds.playClick();

    const newCmd: CommandBlock = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      repeatCount: type === 'REPEAT' ? selectedRepeatCount : undefined,
      innerCommand: type === 'REPEAT' ? selectedRepeatDir : undefined
    };

    setCommands(prev => [...prev, newCmd]);
    setCommandsUsedTotal(prev => prev + 1);
  };

  // Remove single command
  const removeCommand = (index: number) => {
    if (isRunning) return;
    sounds.playDelete();
    setCommands(prev => prev.filter((_, idx) => idx !== index));
    if (currentLevelDef.level === 8) {
      // User is actively debugging
      setDebuggingAttempts(prev => prev + 1);
    }
  };

  // Clear all commands
  const clearCommands = () => {
    if (isRunning) return;
    sounds.playDelete();
    setCommands([]);
  };

  // Check if position contains obstacle
  const getObstacleAt = (row: number, col: number) => {
    return currentLevelDef.obstacles.find(o => o.pos[0] === row && o.pos[1] === col);
  };

  // Check if within bounds
  const isWithinBounds = (row: number, col: number) => {
    return row >= 0 && row < currentLevelDef.rows && col >= 0 && col < currentLevelDef.cols;
  };

  // Check and award badges
  const checkBadges = useCallback((missions: number, level: number, loops: number, debugs: number) => {
    const newBadges = [...earnedBadges];
    let justEarned: RobotBadge | null = null;

    if (missions >= 1 && !newBadges.includes('Robo Rookie')) {
      newBadges.push('Robo Rookie');
      justEarned = BADGES_LIST.find(b => b.name === 'Robo Rookie') || null;
    }
    if (missions >= 5 && !newBadges.includes('Maze Explorer')) {
      newBadges.push('Maze Explorer');
      justEarned = BADGES_LIST.find(b => b.name === 'Maze Explorer') || null;
    }
    if (level >= 3 && !newBadges.includes('Direction Master')) {
      newBadges.push('Direction Master');
      justEarned = BADGES_LIST.find(b => b.name === 'Direction Master') || null;
    }
    if (debugs >= 1 && !newBadges.includes('Bug Fixer')) {
      newBadges.push('Bug Fixer');
      justEarned = BADGES_LIST.find(b => b.name === 'Bug Fixer') || null;
    }
    if (loops >= 1 && !newBadges.includes('Loop Legend')) {
      newBadges.push('Loop Legend');
      justEarned = BADGES_LIST.find(b => b.name === 'Loop Legend') || null;
    }

    if (justEarned) {
      setNewlyUnlockedBadge(justEarned);
      sounds.playSuccess();
    }
    setEarnedBadges(newBadges);
    return newBadges;
  }, [earnedBadges]);

  // Execute the sequence of commands step-by-step
  const runCode = async () => {
    if (isRunning || commands.length === 0) return;
    setIsRunning(true);
    setIsBumping(false);
    setShowHintBubble(false);
    setTotalAttempts(prev => prev + 1);

    // Expand commands (handling REPEAT blocks into flattened steps for execution animation)
    const expandedSteps: { dir: Direction; sourceIndex: number }[] = [];
    commands.forEach((cmd, idx) => {
      if (cmd.type === 'REPEAT') {
        const count = cmd.repeatCount || 2;
        const dir = cmd.innerCommand || 'RIGHT';
        for (let r = 0; r < count; r++) {
          expandedSteps.push({ dir, sourceIndex: idx });
        }
      } else if (cmd.type === 'IF_CLEAR') {
        // Look ahead in current robo direction
        expandedSteps.push({ dir: roboDir, sourceIndex: idx });
      } else {
        expandedSteps.push({ dir: cmd.type as Direction, sourceIndex: idx });
      }
    });

    let curPos: [number, number] = [...currentLevelDef.startPos];
    let curDir: Direction = currentLevelDef.startDirection;
    let localCrystals = [...collectedCrystals];
    let hitObstacle = false;

    // Reset position to start before running
    setRoboPos(curPos);
    setRoboDir(curDir);
    await new Promise(r => setTimeout(r, 200));

    for (let stepIdx = 0; stepIdx < expandedSteps.length; stepIdx++) {
      const step = expandedSteps[stepIdx];
      setExecutingIndex(step.sourceIndex);

      // 1. Turn robo toward target direction
      if (curDir !== step.dir) {
        curDir = step.dir;
        setRoboDir(curDir);
        sounds.playTurn();
        await new Promise(r => setTimeout(r, 220));
      }

      // 2. Calculate next tile
      let nextRow = curPos[0];
      let nextCol = curPos[1];
      if (step.dir === 'UP') nextRow -= 1;
      if (step.dir === 'DOWN') nextRow += 1;
      if (step.dir === 'LEFT') nextCol -= 1;
      if (step.dir === 'RIGHT') nextCol += 1;

      // 3. Collision Check: Bounds or Obstacles
      const obstacle = getObstacleAt(nextRow, nextCol);
      if (!isWithinBounds(nextRow, nextCol) || obstacle) {
        // GENTLE NON-HARSH BUMP ANIMATION & SOUND
        hitObstacle = true;
        sounds.playBump();
        setIsBumping(true);

        const obsName = obstacle?.type || 'wall';
        const msg = `Oops! Robo found a ${obsName}. Can you change one step?`;
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);

        // Gentle wobble recovery
        await new Promise(r => setTimeout(r, 600));
        setIsBumping(false);
        break;
      }

      // 4. Safe step forward
      curPos = [nextRow, nextCol];
      setRoboPos(curPos);
      sounds.playStep();

      // Check if stepped on a crystal
      const crystalKey = `${curPos[0]},${curPos[1]}`;
      const isCrystalTile = currentLevelDef.crystals.some(c => c[0] === curPos[0] && c[1] === curPos[1]);
      if (isCrystalTile && !localCrystals.includes(crystalKey)) {
        localCrystals.push(crystalKey);
        setCollectedCrystals([...localCrystals]);
        sounds.playCollect();
      }

      // Wait between steps for child to follow easily
      await new Promise(r => setTimeout(r, 450));
    }

    setExecutingIndex(null);
    setIsRunning(false);

    // Verify mission completion
    if (!hitObstacle) {
      const reachedTarget = curPos[0] === currentLevelDef.targetPos[0] && curPos[1] === currentLevelDef.targetPos[1];
      const collectedAllCrystals = currentLevelDef.crystals.length === localCrystals.length;

      if (reachedTarget && collectedAllCrystals) {
        // CELEBRATION!
        setIsDancing(true);
        sounds.playSuccess();
        sounds.playCoin();

        // Canvas confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        const isFinale = currentLevelNum === 10;
        const awardedCoins = 10 + (commands.length <= currentLevelDef.optimalCommandsCount ? 5 : 0);
        const awardedXp = 35;
        const stars = commands.length <= currentLevelDef.optimalCommandsCount ? 3 : 2;

        const newCoins = dolaCoins + awardedCoins;
        const newXp = xpPoints + awardedXp;
        const newMissions = missionsCompleted + 1;
        const newLoops = loopsCompletedCount + (commands.some(c => c.type === 'REPEAT') ? 1 : 0);
        const newDebugs = debuggingAttempts + (currentLevelDef.level === 8 ? 1 : 0);
        const nextUnlocked = Math.min(10, Math.max(unlockedLevel, currentLevelNum + 1));

        setDolaCoins(newCoins);
        setXpPoints(newXp);
        setMissionsCompleted(newMissions);
        setLoopsCompletedCount(newLoops);
        setUnlockedLevel(nextUnlocked);

        const updatedBadges = checkBadges(newMissions, currentLevelNum, newLoops, newDebugs);

        persistProgress({
          dolaCoins: newCoins,
          xpPoints: newXp,
          missionsCompleted: newMissions,
          unlockedLevel: nextUnlocked,
          earnedBadges: updatedBadges,
          loopsCompletedCount: newLoops,
          debuggingAttempts: newDebugs
        });

        const cheer = isFinale 
          ? '🎉 GRAND FINALE WON! You mastered all Robot Mazes!' 
          : '⚡ Mission Accomplished! Robo docked and charged safely!';
        setLizzySpeech(cheer);
        speakText(cheer, soundEnabled);

        // Open level complete modal with clear CTA buttons
        setLevelCompleteModal({
          completedLevel: currentLevelNum,
          isGameFinale: isFinale,
          starsEarned: stars,
          dolaCoinsEarned: awardedCoins,
          xpEarned: awardedXp
        });

      } else if (reachedTarget && !collectedAllCrystals) {
        const msg = 'Almost! Robo reached the dock, but missed a shiny energy crystal! 💎';
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      } else {
        const msg = 'Robo stopped before reaching the target. Can you add more steps? 🚀';
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }
  };

  // Helper to reset Robo back to start position
  const resetRoboToStart = () => {
    if (isRunning) return;
    sounds.playTurn();
    setRoboPos(currentLevelDef.startPos);
    setRoboDir(currentLevelDef.startDirection);
    setIsBumping(false);
    setIsDancing(false);
    setCollectedCrystals([]);
    setShowHintBubble(false);
  };

  // Advance to next level
  const handleNextLevel = () => {
    if (currentLevelNum < 10) {
      loadLevel(currentLevelNum + 1);
    } else {
      loadLevel(1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none font-sans pb-12 px-2 sm:px-4">
      {/* ================= HEADER & STATS BAR ================= */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-emerald-300 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-200">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Robot Maze</h1>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Level {currentLevelNum} of 10
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                {currentLevelDef.missionName}
              </p>
            </div>
          </div>

          {/* Gamification Stats: DolaCoins, XP, Sound Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* DolaCoins */}
            <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-300 px-3 py-1.5 rounded-2xl shadow-sm">
              <span className="text-lg">🪙</span>
              <span className="font-black text-amber-700 text-sm sm:text-base">{dolaCoins}</span>
              <span className="text-xs font-bold text-amber-600 hidden sm:inline">Coins</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-purple-50 border-2 border-purple-300 px-3 py-1.5 rounded-2xl shadow-sm">
              <Zap className="w-4 h-4 text-purple-600 fill-purple-500" />
              <span className="font-black text-purple-700 text-sm sm:text-base">{xpPoints}</span>
              <span className="text-xs font-bold text-purple-600 hidden sm:inline">XP</span>
            </div>

            {/* Sound Mute Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.muted = !next;
                if (!next) stopSpeech();
              }}
              className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 transition-transform active:scale-95"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
            </button>

            {/* Badges / Trophy Tab */}
            <button
              onClick={() => setActiveTab(activeTab === 'maze' ? 'badges' : 'maze')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                activeTab === 'badges'
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-md'
                  : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-300'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Badges ({earnedBadges.length})</span>
            </button>

            {/* Stage 1 Map / Exit */}
            {onBackToStage1 ? (
              <button
                onClick={onBackToStage1}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-2xl border-2 border-slate-300"
              >
                <Map className="w-4 h-4 text-slate-600" />
                <span>Stage 1 Map</span>
              </button>
            ) : (
              <button
                onClick={() => router.push('/stage1')}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm px-3 py-1.5 rounded-2xl border-2 border-slate-300"
              >
                <Map className="w-4 h-4 text-slate-600" />
                <span>Stage 1 Map</span>
              </button>
            )}
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {MAZE_LEVELS.map(lvl => {
            const isUnlocked = lvl.level <= unlockedLevel;
            const isCurrent = lvl.level === currentLevelNum;
            return (
              <button
                key={lvl.level}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playClick();
                    loadLevel(lvl.level);
                  }
                }}
                disabled={!isUnlocked}
                className={`flex-shrink-0 px-3 py-1 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105'
                    : isUnlocked
                    ? 'bg-slate-100 hover:bg-emerald-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed border border-dashed border-slate-300'
                }`}
              >
                {!isUnlocked && <Lock className="w-3 h-3" />}
                Lvl {lvl.level}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= BADGES MODAL VIEW ================= */}
      {activeTab === 'badges' && (
        <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-6 mb-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black text-slate-800">Your Robot Maze Badges</h2>
            </div>
            <button
              onClick={() => setActiveTab('maze')}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700"
            >
              Back to Maze 🤖
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES_LIST.map(badge => {
              const hasBadge = earnedBadges.includes(badge.name);
              return (
                <div
                  key={badge.name}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    hasBadge
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 shadow-md'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                    hasBadge ? 'bg-amber-100 shadow-inner' : 'bg-slate-200 grayscale'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-slate-800">{badge.title}</h4>
                      {hasBadge ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{badge.desc}</p>
                    <span className={`inline-block text-[10px] font-black uppercase mt-1 px-2 py-0.5 rounded-md ${
                      hasBadge ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {hasBadge ? 'Unlocked! ⭐' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MAIN GAMEPLAY VIEW ================= */}
      {activeTab === 'maze' && (
        <div className="w-full flex flex-col gap-4">
          {/* LIZZY STORY & SPEECH CARD */}
          <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-3 border-teal-200 rounded-3xl p-4 shadow-md flex items-center gap-4 relative overflow-hidden">
            {/* Lizzy Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl shadow-md border-2 border-white">
                🦎
              </div>
              <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider mt-0.5">Lizzy</span>
            </div>

            {/* Lizzy Dialogue */}
            <div className="flex-1">
              <div className="bg-white/90 rounded-2xl p-3 border border-teal-200 shadow-sm relative">
                <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                  {lizzySpeech}
                </p>
                {showHintBubble && (
                  <div className="mt-2 text-xs font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>{currentLevelDef.hintText}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Narration Speaker Button */}
            <button
              onClick={() => speakText(lizzySpeech, true)}
              className="flex-shrink-0 p-3 rounded-2xl bg-white hover:bg-teal-100 text-teal-700 border-2 border-teal-200 shadow-sm active:scale-95 transition-transform"
              title="Read aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* GAMEPLAY TWO-COLUMN LAYOUT: MAZE GRID (LEFT) + COMMAND PALETTE & TIMELINE (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT: MAZE GRID BOARD (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-4 sm:p-6 flex flex-col items-center">
              {/* Mission Indicator Bar */}
              <div className="w-full flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-sm text-slate-700">{currentLevelDef.title}</span>
                </div>
                {currentLevelDef.crystals.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-300 text-cyan-800 font-bold text-xs">
                    <span>💎 Crystals:</span>
                    <span>{collectedCrystals.length} / {currentLevelDef.crystals.length}</span>
                  </div>
                )}
              </div>

              {/* GRID CONTAINER */}
              <div 
                className="bg-emerald-900/10 p-3 sm:p-4 rounded-3xl border-3 border-emerald-300 shadow-inner inline-block"
                style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${currentLevelDef.rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${currentLevelDef.cols}, minmax(0, 1fr))`,
                  gap: '8px'
                }}
              >
                {Array.from({ length: currentLevelDef.rows }).map((_, r) =>
                  Array.from({ length: currentLevelDef.cols }).map((_, c) => {
                    const isRoboHere = roboPos[0] === r && roboPos[1] === c;
                    const isTargetHere = currentLevelDef.targetPos[0] === r && currentLevelDef.targetPos[1] === c;
                    const obstacle = getObstacleAt(r, c);
                    const isCrystalHere = currentLevelDef.crystals.some(cr => cr[0] === r && cr[1] === c);
                    const isCrystalCollected = collectedCrystals.includes(`${r},${c}`);

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center relative transition-all duration-300 select-none ${
                          obstacle
                            ? obstacle.type === 'wall'
                              ? 'bg-slate-700 border-2 border-slate-900 shadow-md text-2xl'
                              : obstacle.type === 'rock'
                              ? 'bg-amber-900/70 border-2 border-amber-950 shadow-md text-2xl'
                              : obstacle.type === 'water'
                              ? 'bg-sky-400 border-2 border-sky-600 shadow-md text-2xl animate-pulse'
                              : 'bg-emerald-800 border-2 border-emerald-950 shadow-md text-2xl'
                            : isTargetHere
                            ? 'bg-gradient-to-tr from-amber-300 to-yellow-400 border-3 border-amber-500 shadow-lg shadow-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100/80 border-2 border-emerald-200/80 shadow-sm'
                        }`}
                      >
                        {/* Obstacle Icons */}
                        {obstacle && !isRoboHere && (
                          <span className="transform hover:scale-110 transition-transform">
                            {obstacle.type === 'wall' && '🧱'}
                            {obstacle.type === 'rock' && '🪨'}
                            {obstacle.type === 'water' && '💧'}
                            {obstacle.type === 'tree' && '🌳'}
                          </span>
                        )}

                        {/* Crystal Collectible */}
                        {isCrystalHere && !isCrystalCollected && !isRoboHere && (
                          <div className="flex flex-col items-center animate-bounce">
                            <span className="text-2xl filter drop-shadow">💎</span>
                          </div>
                        )}

                        {/* Target Docking Station */}
                        {isTargetHere && !isRoboHere && (
                          <div className="flex flex-col items-center">
                            <BatteryCharging className="w-7 h-7 text-amber-800 animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-amber-900 tracking-tighter">Goal</span>
                          </div>
                        )}

                        {/* ROBO THE CHARACTER */}
                        {isRoboHere && (
                          <div
                            className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
                              isBumping ? 'animate-wiggle scale-90' : isDancing ? 'animate-bounce scale-110' : ''
                            }`}
                            style={{
                              transform: `rotate(${
                                roboDir === 'UP' ? -90 : roboDir === 'DOWN' ? 90 : roboDir === 'LEFT' ? 180 : 0
                              }deg)`
                            }}
                          >
                            {/* Animated SVG Robo Avatar */}
                            <svg className="w-10 h-10 sm:w-13 sm:h-13 filter drop-shadow-md" viewBox="0 0 100 100">
                              {/* Wheeled Tank Tracks */}
                              <rect x="18" y="15" width="64" height="14" rx="7" fill="#334155" />
                              <rect x="18" y="71" width="64" height="14" rx="7" fill="#334155" />
                              <circle cx="28" cy="22" r="4" fill="#94a3b8" />
                              <circle cx="50" cy="22" r="4" fill="#94a3b8" />
                              <circle cx="72" cy="22" r="4" fill="#94a3b8" />
                              <circle cx="28" cy="78" r="4" fill="#94a3b8" />
                              <circle cx="50" cy="78" r="4" fill="#94a3b8" />
                              <circle cx="72" cy="78" r="4" fill="#94a3b8" />

                              {/* Main Robot Body */}
                              <rect x="25" y="24" width="50" height="52" rx="14" fill="#0284c7" stroke="#0369a1" strokeWidth="4" />
                              
                              {/* Chest Screen / Visor */}
                              <rect x="32" y="32" width="36" height="24" rx="8" fill="#0f172a" />
                              
                              {/* Cheerful Glowing Cyan Eyes */}
                              <circle cx="42" cy="44" r="5" fill="#38bdf8" />
                              <circle cx="58" cy="44" r="5" fill="#38bdf8" />
                              <circle cx="43" cy="43" r="1.5" fill="#ffffff" />
                              <circle cx="59" cy="43" r="1.5" fill="#ffffff" />

                              {/* Smiling Mouth */}
                              <path d="M 44 64 Q 50 70 56 64" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />

                              {/* Antenna with pulse ball */}
                              <line x1="50" y1="24" x2="50" y2="10" stroke="#0284c7" strokeWidth="3" />
                              <circle cx="50" cy="8" r="5" fill="#f59e0b" className="animate-pulse" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Reset Robo & Hint Helper Buttons */}
              <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={resetRoboToStart}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Start</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHintBubble(!showHintBubble);
                    setHintsUsedCount(prev => prev + 1);
                    if (!showHintBubble) {
                      speakText(currentLevelDef.hintText, soundEnabled);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-all"
                >
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>{showHintBubble ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              </div>
            </div>

            {/* RIGHT: COMMAND PALETTE & SEQUENCE QUEUE (5 cols on lg) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* 1. COMMAND BUTTONS PALETTE */}
              <div className="bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-4">
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>Command Blocks</span>
                </h3>

                {/* Directional Visual Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {/* MOVE UP */}
                  {currentLevelDef.allowedCommands.includes('UP') && (
                    <button
                      onClick={() => addCommand('UP')}
                      disabled={isRunning}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
                    >
                      <ArrowUp className="w-6 h-6 stroke-[3]" />
                      <span className="text-[11px] font-black uppercase mt-1">Up</span>
                    </button>
                  )}

                  {/* MOVE DOWN */}
                  {currentLevelDef.allowedCommands.includes('DOWN') && (
                    <button
                      onClick={() => addCommand('DOWN')}
                      disabled={isRunning}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md shadow-amber-200 transition-all disabled:opacity-50"
                    >
                      <ArrowDown className="w-6 h-6 stroke-[3]" />
                      <span className="text-[11px] font-black uppercase mt-1">Down</span>
                    </button>
                  )}

                  {/* MOVE LEFT */}
                  {currentLevelDef.allowedCommands.includes('LEFT') && (
                    <button
                      onClick={() => addCommand('LEFT')}
                      disabled={isRunning}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white shadow-md shadow-rose-200 transition-all disabled:opacity-50"
                    >
                      <ArrowLeft className="w-6 h-6 stroke-[3]" />
                      <span className="text-[11px] font-black uppercase mt-1">Left</span>
                    </button>
                  )}

                  {/* MOVE RIGHT */}
                  {currentLevelDef.allowedCommands.includes('RIGHT') && (
                    <button
                      onClick={() => addCommand('RIGHT')}
                      disabled={isRunning}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white shadow-md shadow-teal-200 transition-all disabled:opacity-50"
                    >
                      <ArrowRight className="w-6 h-6 stroke-[3]" />
                      <span className="text-[11px] font-black uppercase mt-1">Right</span>
                    </button>
                  )}
                </div>

                {/* ADVANCED BLOCKS: REPEAT LOOP BLOCK (LEVEL 5+) */}
                {currentLevelDef.allowedCommands.includes('REPEAT') && (
                  <div className="bg-purple-50 p-3 rounded-2xl border-2 border-purple-200 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-purple-900 uppercase flex items-center gap-1">
                        <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                        <span>Repeat Loop Block</span>
                      </span>
                      {/* Repeat Count selector */}
                      <div className="flex items-center gap-1">
                        {[2, 3, 4].map(n => (
                          <button
                            key={n}
                            onClick={() => setSelectedRepeatCount(n)}
                            className={`w-6 h-6 rounded-lg text-xs font-black transition-all ${
                              selectedRepeatCount === n
                                ? 'bg-purple-600 text-white shadow'
                                : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
                            }`}
                          >
                            {n}×
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedRepeatDir}
                        onChange={(e) => setSelectedRepeatDir(e.target.value as Direction)}
                        className="bg-white border-2 border-purple-300 rounded-xl px-2.5 py-1 text-xs font-black text-purple-800"
                      >
                        <option value="RIGHT">MOVE RIGHT ➡️</option>
                        <option value="DOWN">MOVE DOWN ⬇️</option>
                        <option value="UP">MOVE UP ⬆️</option>
                        <option value="LEFT">MOVE LEFT ⬅️</option>
                      </select>

                      <button
                        onClick={() => addCommand('REPEAT')}
                        disabled={isRunning}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                      >
                        <span>+ Add Loop ({selectedRepeatCount}×)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CONDITIONAL BLOCK: IF PATH IS CLEAR (LEVEL 7) */}
                {currentLevelDef.allowedCommands.includes('IF_CLEAR') && (
                  <button
                    onClick={() => addCommand('IF_CLEAR')}
                    disabled={isRunning}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-white font-black text-xs py-2 px-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>+ IF PATH CLEAR ➜ STEP FORWARD</span>
                  </button>
                )}
              </div>

              {/* 2. PROGRAM SEQUENCE TIMELINE */}
              <div className="bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-800">Robo's Code Sequence</span>
                    <span className="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded-full text-slate-600">
                      {commands.length} steps
                    </span>
                  </div>

                  {commands.length > 0 && (
                    <button
                      onClick={clearCommands}
                      disabled={isRunning}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* SEQUENCE LIST */}
                <div className="min-h-[140px] max-h-[220px] overflow-y-auto bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-2.5 flex flex-col gap-1.5 mb-3">
                  {commands.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 text-slate-400">
                      <Bot className="w-8 h-8 text-slate-300 mb-1" />
                      <p className="text-xs font-bold">No commands yet!</p>
                      <p className="text-[11px]">Tap the arrows above to program Robo.</p>
                    </div>
                  ) : (
                    commands.map((cmd, idx) => {
                      const isCurrentlyActive = executingIndex === idx;
                      return (
                        <div
                          key={cmd.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border-2 transition-all ${
                            isCurrentlyActive
                              ? 'bg-yellow-300 border-yellow-500 scale-102 shadow-md animate-pulse'
                              : cmd.type === 'REPEAT'
                              ? 'bg-purple-100 border-purple-300 text-purple-900'
                              : cmd.type === 'IF_CLEAR'
                              ? 'bg-cyan-100 border-cyan-300 text-cyan-900'
                              : cmd.type === 'UP'
                              ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                              : cmd.type === 'DOWN'
                              ? 'bg-amber-100 border-amber-300 text-amber-900'
                              : cmd.type === 'LEFT'
                              ? 'bg-rose-100 border-rose-300 text-rose-900'
                              : 'bg-teal-100 border-teal-300 text-teal-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[10px] font-black">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-black">
                              {cmd.type === 'REPEAT' ? (
                                `REPEAT ${cmd.repeatCount}× (${cmd.innerCommand})`
                              ) : cmd.type === 'IF_CLEAR' ? (
                                'IF PATH CLEAR ➜ MOVE'
                              ) : (
                                `MOVE ${cmd.type}`
                              )}
                            </span>
                          </div>

                          <button
                            onClick={() => removeCommand(idx)}
                            disabled={isRunning}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove step"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* BIG GREEN GO BUTTON */}
                <button
                  onClick={runCode}
                  disabled={isRunning || commands.length === 0}
                  className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 ${
                    isRunning || commands.length === 0
                      ? 'bg-slate-300 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-emerald-200 hover:shadow-xl'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span>Robo is Moving...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 fill-white" />
                      <span>RUN CODE (GO! 🚀)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEVEL COMPLETE MODAL WITH ALL CTAs ================= */}
      {levelCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-4 border-emerald-400 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Confetti Ribbon */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-yellow-300 to-amber-400 rounded-full opacity-30 pointer-events-none" />

            {/* Victory Robot Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-teal-200 mb-4 animate-bounce">
              {levelCompleteModal.isGameFinale ? (
                <Trophy className="w-12 h-12 text-yellow-300 fill-yellow-300" />
              ) : (
                <Bot className="w-12 h-12" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {levelCompleteModal.isGameFinale ? 'Grand Champion! 🏆' : 'Mission Accomplished! ⚡'}
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1 mb-4">
              {levelCompleteModal.isGameFinale
                ? 'You conquered all 10 Robot Maze levels! You are an algorithmic genius!'
                : `Robo reached the dock safely on Level ${levelCompleteModal.completedLevel}!`}
            </p>

            {/* Stars Display */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map(st => (
                <Star
                  key={st}
                  className={`w-9 h-9 transition-transform ${
                    st <= levelCompleteModal.starsEarned
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Rewards Card: Coins & XP */}
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 border-2 border-amber-200 rounded-2xl p-3 flex items-center justify-around mb-6">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl">🪙</span>
                <div className="text-left">
                  <div className="font-black text-amber-800 text-sm">+{levelCompleteModal.dolaCoinsEarned}</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase">DolaCoins</div>
                </div>
              </div>

              <div className="h-8 w-px bg-amber-200" />

              <div className="flex items-center gap-1.5">
                <Zap className="w-6 h-6 text-purple-600 fill-purple-500" />
                <div className="text-left">
                  <div className="font-black text-purple-800 text-sm">+{levelCompleteModal.xpEarned}</div>
                  <div className="text-[10px] font-bold text-purple-600 uppercase">XP Points</div>
                </div>
              </div>
            </div>

            {/* PROMINENT ACTION CTA BUTTONS */}
            <div className="flex flex-col gap-2.5">
              {/* PRIMARY: NEXT LEVEL OR PLAY AGAIN */}
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-black text-base shadow-lg shadow-emerald-200 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{levelCompleteModal.isGameFinale ? 'Play Again from Lvl 1 🔄' : 'Play Next Level ➡️'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* SECONDARY: REPLAY THIS LEVEL */}
              <button
                onClick={() => {
                  loadLevel(currentLevelNum);
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-2 border-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Replay Mission</span>
              </button>

              {/* TERTIARY: STAGE 1 MAP OR DASHBOARD */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    if (onBackToStage1) {
                      onBackToStage1();
                    } else {
                      router.push('/stage1');
                    }
                  }}
                  className="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all flex items-center justify-center gap-1"
                >
                  <Map className="w-3.5 h-3.5" />
                  <span>Stage 1 Map</span>
                </button>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-1"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= NEW BADGE UNLOCKED CELEBRATION MODAL ================= */}
      {newlyUnlockedBadge && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gradient-to-b from-amber-400 via-orange-400 to-rose-500 rounded-3xl p-1 max-w-sm w-full shadow-2xl">
            <div className="bg-white rounded-[22px] p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-4xl shadow-inner mb-3 animate-bounce">
                {newlyUnlockedBadge.icon}
              </div>
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider">New Badge Earned!</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1 mb-2">{newlyUnlockedBadge.title}</h3>
              <p className="text-xs text-slate-600 mb-5">{newlyUnlockedBadge.desc}</p>
              <button
                onClick={() => setNewlyUnlockedBadge(null)}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md"
              >
                Awesome! ⭐
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
