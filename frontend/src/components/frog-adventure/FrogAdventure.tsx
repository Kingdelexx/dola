'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw, 
  HelpCircle, CheckCircle2, Award, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, Trash2, ArrowUp, ArrowLeft, ArrowRight as ArrowRightIcon,
  Compass, Bug, Home, Map, Repeat, Footprints, ShieldAlert, Sparkle, Shirt
} from 'lucide-react';

// --- Web Audio Synthesizer (Zero External Asset Dependency) ---
class FrogSoundEffects {
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

  // Playful frog jump "Boing!"
  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Cute double-hop jump
  playSuperJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.1].forEach((delay, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + idx * 80, now + delay);
      osc.frequency.exponentialRampToValueAtTime(640 + idx * 80, now + delay + 0.1);
      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  }

  // Quick turn pop
  playTurn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(660, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Gentle, friendly obstacle bonk or water splash
  playBump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Sweet fruit munch
  playCollectFruit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [587.33, 783.99, 1046.5]; // D5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.22, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.18);
    });
  }

  // Triumphant victory fanfare
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

  // Coin jingle
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
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

const frogSounds = new FrogSoundEffects();

// Types
type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
type CommandType = 'JUMP' | 'JUMP_2' | 'TURN_LEFT' | 'TURN_RIGHT' | 'REPEAT';
type EnvironmentType = 'pond' | 'rainforest' | 'garden' | 'river' | 'jungle';

interface Command {
  id: string;
  type: CommandType;
  repeatCount?: number;
  subCommands?: Command[];
}

interface Obstacle {
  x: number;
  y: number;
  type: 'rock' | 'water_gap' | 'log' | 'snake' | 'bush';
  emoji: string;
  name: string;
}

interface FruitItem {
  x: number;
  y: number;
  type: 'mango' | 'watermelon' | 'strawberry';
  emoji: string;
  points: number;
  collected?: boolean;
}

interface TargetGoal {
  x: number;
  y: number;
  type: 'lily_pad' | 'treasure' | 'friend' | 'home';
  emoji: string;
  label: string;
}

interface Costume {
  id: string;
  name: string;
  emoji: string;
  price: number;
  unlocked: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  topic: string;
  instruction: string;
  environment: EnvironmentType;
  gridCols: number;
  gridRows: number;
  startPos: { x: number; y: number; dir: Direction };
  goal: TargetGoal;
  obstacles: Obstacle[];
  fruits?: FruitItem[];
  showCoordinates?: boolean;
  isPatternLevel?: boolean;
  patternOptions?: { label: string; cmd: CommandType; isCorrect: boolean }[];
  isShortestPathLevel?: boolean;
  targetMaxSteps?: number;
  isDebuggingLevel?: boolean;
  buggySequence?: Command[];
  hasLoopBlock?: boolean;
  lizzyHint: string;
  speechText: string;
}

const AVAILABLE_COSTUMES: Costume[] = [
  { id: 'default', name: 'Classic Green', emoji: '🐸', price: 0, unlocked: true },
  { id: 'explorer', name: 'Explorer Hat', emoji: '🤠', price: 30, unlocked: false },
  { id: 'crown', name: 'Royal Prince Crown', emoji: '👑', price: 50, unlocked: false },
  { id: 'superhero', name: 'Superhero Cape', emoji: '🦸‍♂️', price: 60, unlocked: false },
  { id: 'wizard', name: 'Magic Wizard Hat', emoji: '🧙‍♂️', price: 80, unlocked: false },
  { id: 'scuba', name: 'Scuba Goggles', emoji: '🤿', price: 100, unlocked: false },
];

const FROG_LEVELS: LevelConfig[] = [
  // Level 1: Counting Jumps (1–5)
  {
    level: 1,
    title: 'Lily Pad Leap',
    topic: 'Count Jumps (1–5)',
    instruction: 'Count the lily pads and build a sequence of 3 jumps to reach the giant pink water lily!',
    environment: 'pond',
    gridCols: 5,
    gridRows: 3,
    startPos: { x: 0, y: 1, dir: 'EAST' },
    goal: { x: 3, y: 1, type: 'lily_pad', emoji: '🪷', label: 'Giant Water Lily' },
    obstacles: [
      { x: 1, y: 0, type: 'rock', emoji: '🪨', name: 'Pond Rock' },
      { x: 2, y: 2, type: 'water_gap', emoji: '🌀', name: 'Deep Whirlpool' },
    ],
    lizzyHint: 'Count: 1, 2, 3 lily pads ahead! Add 3 Jump Forward blocks and press GO LEAP!',
    speechText: 'Count the lily pads to help Hoppy leap safely to the big pink water lily!',
  },
  // Level 2: Directional Trail
  {
    level: 2,
    title: 'Garden Treasure Trail',
    topic: 'Follow Directions',
    instruction: 'Guide Hoppy around the garden rocks using TURN and JUMP to reach the golden treasure chest!',
    environment: 'garden',
    gridCols: 5,
    gridRows: 4,
    startPos: { x: 0, y: 0, dir: 'EAST' },
    goal: { x: 3, y: 2, type: 'treasure', emoji: '🪙', label: 'Golden Treasure' },
    obstacles: [
      { x: 2, y: 0, type: 'rock', emoji: '🪨', name: 'Garden Boulder' },
      { x: 1, y: 2, type: 'bush', emoji: '🌿', name: 'Thorny Bush' },
      { x: 0, y: 3, type: 'bush', emoji: '🌿', name: 'Thorny Bush' },
    ],
    lizzyHint: 'Try: Jump 1 space, Turn Right to face down, Jump 2 spaces, then Turn Left to the treasure!',
    speechText: 'Turn left or right to avoid the rocks and find the shiny treasure chest!',
  },
  // Level 3: Shortest Path Optimization
  {
    level: 3,
    title: 'River Crossing Scout',
    topic: 'Choose the Shortest Path',
    instruction: 'Find the quickest route to visit Toby the Turtle! Use floating logs to avoid the long detour.',
    environment: 'river',
    gridCols: 5,
    gridRows: 4,
    startPos: { x: 0, y: 1, dir: 'EAST' },
    goal: { x: 4, y: 1, type: 'friend', emoji: '🐢', label: 'Toby the Turtle' },
    obstacles: [
      { x: 2, y: 0, type: 'water_gap', emoji: '🌀', name: 'Whirlpool' },
      { x: 2, y: 2, type: 'water_gap', emoji: '🌀', name: 'Whirlpool' },
      { x: 3, y: 3, type: 'log', emoji: '🪵', name: 'Mossy Log' },
    ],
    isShortestPathLevel: true,
    targetMaxSteps: 4,
    lizzyHint: 'The straight path across 4 river lily pads is the fastest! Jump Forward 4 times.',
    speechText: 'Find the shortest path across the river to say hello to Toby the Turtle!',
  },
  // Level 4: Rainforest Fruit Feast
  {
    level: 4,
    title: 'Rainforest Fruit Feast',
    topic: 'Collect Fruit & Navigate',
    instruction: 'Collect both delicious fruits on your way through the rainforest to Hoppy’s cozy treehouse!',
    environment: 'rainforest',
    gridCols: 5,
    gridRows: 4,
    startPos: { x: 0, y: 3, dir: 'NORTH' },
    goal: { x: 4, y: 0, type: 'home', emoji: '🏠', label: 'Treehouse Home' },
    obstacles: [
      { x: 1, y: 1, type: 'snake', emoji: '🐍', name: 'Sleeping Python' },
      { x: 3, y: 2, type: 'rock', emoji: '🪨', name: 'Rainforest Rock' },
    ],
    fruits: [
      { x: 0, y: 1, type: 'mango', emoji: '🥭', points: 15 },
      { x: 2, y: 0, type: 'watermelon', emoji: '🍉', points: 20 },
    ],
    lizzyHint: 'Jump North to gobble the golden mango, turn East for the watermelon, then head into the treehouse!',
    speechText: 'Hop through the rainforest, munch the sweet fruits, and head safely home!',
  },
  // Level 5: Patterns & Rhythm
  {
    level: 5,
    title: 'Rhythm Leap Pattern',
    topic: 'Patterns: Jump 1, Jump 2',
    instruction: 'Detect the pattern: Jump 1, Jump 2, Jump 1, Jump 2... What comes next to cross the enchanted pond?',
    environment: 'pond',
    gridCols: 6,
    gridRows: 3,
    startPos: { x: 0, y: 1, dir: 'EAST' },
    goal: { x: 5, y: 1, type: 'lily_pad', emoji: '🪷', label: 'Enchanted Pad' },
    obstacles: [
      { x: 1, y: 0, type: 'rock', emoji: '🪨', name: 'Pond Rock' },
      { x: 4, y: 2, type: 'water_gap', emoji: '🌀', name: 'Water Gap' },
    ],
    isPatternLevel: true,
    patternOptions: [
      { label: '🟢 JUMP 1 SPACE', cmd: 'JUMP', isCorrect: true },
      { label: '🚀 JUMP 2 SPACES', cmd: 'JUMP_2', isCorrect: false },
      { label: '↺ TURN LEFT', cmd: 'TURN_LEFT', isCorrect: false },
    ],
    lizzyHint: 'The rhythm is: 1 hop, 2 hops, 1 hop, 2 hops... Next must be 1 hop! Select Jump 1 space.',
    speechText: 'Look at the pattern: Jump 1, Jump 2, Jump 1, Jump 2. What comes next?',
  },
  // Level 6: Numbered Grid Coordinates
  {
    level: 6,
    title: 'Numbered Grid Coordinates',
    topic: 'Cartesian Coordinates (X, Y)',
    instruction: 'Bella the Butterfly is waiting at Column 4, Row 3 (4, 3)! Guide Hoppy directly to her coordinates.',
    environment: 'garden',
    gridCols: 5,
    gridRows: 5,
    startPos: { x: 0, y: 0, dir: 'EAST' },
    goal: { x: 3, y: 2, type: 'friend', emoji: '🦋', label: 'Bella the Butterfly' },
    obstacles: [
      { x: 1, y: 1, type: 'bush', emoji: '🌿', name: 'Rose Bush' },
      { x: 2, y: 3, type: 'rock', emoji: '🪨', name: 'Stepping Stone' },
    ],
    showCoordinates: true,
    lizzyHint: 'Look at the numbered grid! Column 4 is 3 steps East, and Row 3 is 2 steps South. Guide Hoppy to (4, 3)!',
    speechText: 'Follow the numbered grid coordinates to fly with Bella the Butterfly!',
  },
  // Level 7: Introduce Loops
  {
    level: 7,
    title: 'Pond Hopper Loops',
    topic: 'Introduce Loops (REPEAT 4)',
    instruction: 'Cross the wide river using REPEAT 4 TIMES: JUMP FORWARD instead of arranging 4 single blocks!',
    environment: 'river',
    gridCols: 6,
    gridRows: 3,
    startPos: { x: 0, y: 1, dir: 'EAST' },
    goal: { x: 4, y: 1, type: 'lily_pad', emoji: '🪷', label: 'River Bloom' },
    obstacles: [
      { x: 1, y: 0, type: 'water_gap', emoji: '🌀', name: 'River Whirlpool' },
      { x: 3, y: 2, type: 'log', emoji: '🪵', name: 'Floating Branch' },
    ],
    hasLoopBlock: true,
    lizzyHint: 'Tap the purple REPEAT 4 block! It tells Hoppy to jump forward 4 times in one command.',
    speechText: 'Use a loop to repeat Hoppy’s jump four times with one smart block!',
  },
  // Level 8: Simple Debugging
  {
    level: 8,
    title: 'Frog Detective - Fix the Bug',
    topic: 'Debugging Faulty Code',
    instruction: 'Hoppy’s sequence has a bug that turns Right into a thorny bush! Fix the bad command to save Hoppy!',
    environment: 'jungle',
    gridCols: 5,
    gridRows: 4,
    startPos: { x: 0, y: 1, dir: 'EAST' },
    goal: { x: 3, y: 0, type: 'home', emoji: '🏠', label: 'Jungle Hut' },
    obstacles: [
      { x: 2, y: 2, type: 'bush', emoji: '🌿', name: 'Prickly Brambles' },
      { x: 1, y: 0, type: 'snake', emoji: '🐍', name: 'Vine Snake' },
    ],
    isDebuggingLevel: true,
    buggySequence: [
      { id: 'b1', type: 'JUMP' },
      { id: 'b2', type: 'JUMP' },
      { id: 'b3', type: 'TURN_RIGHT' }, // BUG! Needs to be TURN_LEFT
      { id: 'b4', type: 'JUMP' },
    ],
    lizzyHint: 'Look at Step 3: TURN RIGHT will head into the prickly bush! Change Step 3 to TURN LEFT.',
    speechText: 'Find the mistake in Hoppy’s commands and fix it so he does not bump the prickly bush!',
  },
];

export default function FrogAdventure({ initialLevel }: { initialLevel?: number } = {}) {
  const router = useRouter();

  // Game state
  const [currentLevelIdx, setCurrentLevelIdx] = useState(
    initialLevel ? Math.max(0, Math.min(FROG_LEVELS.length - 1, initialLevel - 1)) : 0
  );
  const [commands, setCommands] = useState<Command[]>([]);
  const [frogPos, setFrogPos] = useState({ x: 0, y: 0, dir: 'EAST' as Direction });
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  
  // Stats & Gamification
  const [stars, setStars] = useState(0);
  const [dolaCoins, setDolaCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [fruitsCollectedCount, setFruitsCollectedCount] = useState(0);
  const [levelFruits, setLevelFruits] = useState<FruitItem[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [costumes, setCostumes] = useState<Costume[]>(AVAILABLE_COSTUMES);
  const [activeCostume, setActiveCostume] = useState('default');
  const [isCostumeModalOpen, setIsCostumeModalOpen] = useState(false);

  // Performance analytics
  const [countingAccuracy, setCountingAccuracy] = useState(100);
  const [sequenceAccuracy, setSequenceAccuracy] = useState(100);
  const [patternAccuracy, setPatternAccuracy] = useState(100);
  const [coordinatesAccuracy, setCoordinatesAccuracy] = useState(100);
  const [routePlanningAccuracy, setRoutePlanningAccuracy] = useState(100);
  const [loopsCompleted, setLoopsCompleted] = useState(0);
  const [debuggingAttempts, setDebuggingAttempts] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  // Modals & Feedback
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showFinaleModal, setShowFinaleModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [frogExpression, setFrogExpression] = useState<'happy' | 'leaping' | 'bump' | 'victory'>('happy');

  const currentLevel = FROG_LEVELS[currentLevelIdx] || FROG_LEVELS[0];

  // Sound mute toggle
  const toggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    frogSounds.muted = nextMuted;
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch saved progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('http://127.0.0.1:8000/api/frog-adventure/progress/', {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.progress) {
            setDolaCoins(data.progress.dola_coins || 0);
            setXp(data.progress.xp_earned || 0);
            setStars(data.progress.stars_earned || 0);
            setEarnedBadges(data.progress.badges || []);
            setFruitsCollectedCount(data.progress.fruits_collected || 0);
            setLoopsCompleted(data.progress.loops_completed || 0);
            setDebuggingAttempts(data.progress.debugging_attempts || 0);
            if (data.progress.unlocked_costumes && Array.isArray(data.progress.unlocked_costumes)) {
              setCostumes(prev => prev.map(c => ({
                ...c,
                unlocked: c.unlocked || data.progress.unlocked_costumes.includes(c.id)
              })));
            }
            if (data.progress.current_level && data.progress.current_level <= FROG_LEVELS.length) {
              setCurrentLevelIdx(data.progress.current_level - 1);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load frog adventure progress:', err);
      }
    };
    loadProgress();
  }, []);

  // Initialize level
  const initLevel = useCallback((lvlIndex: number) => {
    const lvl = FROG_LEVELS[lvlIndex] || FROG_LEVELS[0];
    setFrogPos({ ...lvl.startPos });
    setIsExecuting(false);
    setActiveStepIdx(null);
    setErrorMessage(null);
    setShowHint(false);
    setFrogExpression('happy');

    // Deep clone fruits
    if (lvl.fruits) {
      setLevelFruits(lvl.fruits.map(f => ({ ...f, collected: false })));
    } else {
      setLevelFruits([]);
    }

    // Buggy sequence or empty sequence
    if (lvl.isDebuggingLevel && lvl.buggySequence) {
      setCommands(lvl.buggySequence.map(c => ({ ...c, id: Math.random().toString(36).substring(7) })));
    } else {
      setCommands([]);
    }
  }, []);

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx, initLevel]);

  // Save Progress to Backend
  const saveProgressToBackend = async (earnedBonusCoins: number, newlyCompletedLevel: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload = {
        current_level: newlyCompletedLevel + 1,
        stars_earned: stars + 3,
        dola_coins: dolaCoins + earnedBonusCoins,
        xp_earned: xp + 50,
        accuracy: 95,
        attempts: attempts + 1,
        fruits_collected: fruitsCollectedCount,
        counting_accuracy: countingAccuracy,
        sequence_accuracy: sequenceAccuracy,
        pattern_accuracy: patternAccuracy,
        coordinates_accuracy: coordinatesAccuracy,
        route_planning_accuracy: routePlanningAccuracy,
        loops_completed: loopsCompleted,
        debugging_attempts: debuggingAttempts,
        hints_used: hintsUsed,
        time_spent_seconds: durationSec,
        unlocked_costumes: costumes.filter(c => c.unlocked).map(c => c.id),
        badges: earnedBadges
      };

      const res = await fetch('http://127.0.0.1:8000/api/frog-adventure/save-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const respData = await res.json();
        if (respData.newly_awarded_badges && respData.newly_awarded_badges.length > 0) {
          const names = respData.newly_awarded_badges.map((b: any) => b.name);
          setEarnedBadges(prev => Array.from(new Set([...prev, ...names])));
        }
      }
    } catch (e) {
      console.warn('Failed to save frog adventure progress:', e);
    }
  };

  // Command Palette Additions
  const addCommand = (type: CommandType, repeatCount?: number) => {
    if (isExecuting) return;
    frogSounds.playTurn();
    const newCmd: Command = {
      id: Math.random().toString(36).substring(7),
      type,
      repeatCount: repeatCount || (type === 'REPEAT' ? 4 : undefined),
      subCommands: type === 'REPEAT' ? [{ id: Math.random().toString(36).substring(7), type: 'JUMP' }] : undefined
    };
    setCommands(prev => [...prev, newCmd]);
  };

  const removeCommand = (index: number) => {
    if (isExecuting) return;
    frogSounds.playTurn();
    setCommands(prev => prev.filter((_, i) => i !== index));
  };

  const clearCommands = () => {
    if (isExecuting) return;
    frogSounds.playTurn();
    setCommands([]);
  };

  // Helper Direction Rotations
  const getNextDirection = (current: Direction, turn: 'LEFT' | 'RIGHT'): Direction => {
    const clockwiseOrder: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const idx = clockwiseOrder.indexOf(current);
    if (turn === 'RIGHT') {
      return clockwiseOrder[(idx + 1) % 4];
    } else {
      return clockwiseOrder[(idx + 3) % 4];
    }
  };

  const getForwardOffset = (dir: Direction, distance: number = 1): { dx: number; dy: number } => {
    switch (dir) {
      case 'NORTH': return { dx: 0, dy: -distance };
      case 'SOUTH': return { dx: 0, dy: distance };
      case 'EAST': return { dx: distance, dy: 0 };
      case 'WEST': return { dx: -distance, dy: 0 };
    }
  };

  // Run the sequence
  const runSequence = async () => {
    if (isExecuting || commands.length === 0) return;
    setIsExecuting(true);
    setErrorMessage(null);
    setAttempts(prev => prev + 1);

    // Reset to starting position
    let curX = currentLevel.startPos.x;
    let curY = currentLevel.startPos.y;
    let curDir = currentLevel.startPos.dir;
    setFrogPos({ x: curX, y: curY, dir: curDir });
    setFrogExpression('leaping');

    // Flatten repeat loops into execution steps
    const executionList: { cmd: Command; label: string }[] = [];
    for (const cmd of commands) {
      if (cmd.type === 'REPEAT') {
        const count = cmd.repeatCount || 4;
        for (let r = 0; r < count; r++) {
          executionList.push({ cmd: { id: `${cmd.id}_${r}`, type: 'JUMP' }, label: `Loop Hop ${r + 1}` });
        }
      } else {
        executionList.push({ cmd, label: cmd.type });
      }
    }

    let hasBumped = false;
    let fruitsHarvestedThisRun = 0;

    for (let i = 0; i < executionList.length; i++) {
      setActiveStepIdx(i);
      const step = executionList[i];

      if (step.cmd.type === 'TURN_LEFT') {
        curDir = getNextDirection(curDir, 'LEFT');
        setFrogPos({ x: curX, y: curY, dir: curDir });
        frogSounds.playTurn();
        await new Promise(r => setTimeout(r, 400));
      } else if (step.cmd.type === 'TURN_RIGHT') {
        curDir = getNextDirection(curDir, 'RIGHT');
        setFrogPos({ x: curX, y: curY, dir: curDir });
        frogSounds.playTurn();
        await new Promise(r => setTimeout(r, 400));
      } else if (step.cmd.type === 'JUMP' || step.cmd.type === 'JUMP_2') {
        const jumpDistance = step.cmd.type === 'JUMP_2' ? 2 : 1;
        const { dx, dy } = getForwardOffset(curDir, jumpDistance);
        const targetX = curX + dx;
        const targetY = curY + dy;

        // Check bounds
        if (targetX < 0 || targetX >= currentLevel.gridCols || targetY < 0 || targetY >= currentLevel.gridRows) {
          hasBumped = true;
          setFrogExpression('bump');
          frogSounds.playBump();
          setErrorMessage("Splash! Hoppy leaped out of the pond area! Let's adjust our directions.");
          speakText("Oops! Hoppy leaped out of the pond. Let's adjust our jump steps!");
          break;
        }

        // Check obstacles
        const obstacleHit = currentLevel.obstacles.find(o => o.x === targetX && o.y === targetY);
        if (obstacleHit) {
          hasBumped = true;
          setFrogExpression('bump');
          frogSounds.playBump();
          setErrorMessage(`Oops! Hoppy bumped into a ${obstacleHit.name} ${obstacleHit.emoji}! Can you tweak a turn?`);
          speakText(`Oops! Hoppy bumped into a ${obstacleHit.name}! Try changing one command.`);
          break;
        }

        // Move frog
        curX = targetX;
        curY = targetY;
        setFrogPos({ x: curX, y: curY, dir: curDir });
        if (jumpDistance === 2) {
          frogSounds.playSuperJump();
        } else {
          frogSounds.playJump();
        }

        // Check fruit collection
        setLevelFruits(prev => prev.map(f => {
          if (f.x === curX && f.y === curY && !f.collected) {
            fruitsHarvestedThisRun++;
            frogSounds.playCollectFruit();
            setFruitsCollectedCount(c => c + 1);
            setDolaCoins(c => c + 5);
            return { ...f, collected: true };
          }
          return f;
        }));

        await new Promise(r => setTimeout(r, 500));
      }
    }

    setIsExecuting(false);
    setActiveStepIdx(null);

    if (hasBumped) {
      setTimeout(() => setFrogExpression('happy'), 1800);
      return;
    }

    // Check if reached goal
    const reachedGoal = curX === currentLevel.goal.x && curY === currentLevel.goal.y;

    // Check fruits requirement if applicable
    const allFruitsCollected = currentLevel.fruits ? levelFruits.every(f => f.collected || (f.x === curX && f.y === curY)) : true;

    if (reachedGoal && allFruitsCollected) {
      setFrogExpression('victory');
      frogSounds.playSuccess();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const bonusCoins = 15 + fruitsHarvestedThisRun * 5;
      setDolaCoins(c => c + bonusCoins);
      setXp(x => x + 50);
      setStars(s => s + 3);

      if (currentLevel.hasLoopBlock) {
        setLoopsCompleted(l => l + 1);
      }
      if (currentLevel.isDebuggingLevel) {
        setDebuggingAttempts(d => d + 1);
      }

      saveProgressToBackend(bonusCoins, currentLevel.level);

      setTimeout(() => {
        if (currentLevelIdx >= FROG_LEVELS.length - 1) {
          setShowFinaleModal(true);
        } else {
          setShowLevelComplete(true);
        }
      }, 1000);
    } else if (reachedGoal && !allFruitsCollected) {
      setFrogExpression('bump');
      frogSounds.playBump();
      setErrorMessage("Yummy fruit left behind! Pick up all delicious fruits before heading home.");
      speakText("Remember to collect all the fruits on the way!");
    } else {
      setFrogExpression('happy');
      setErrorMessage("Almost there! Hoppy didn't reach the goal yet. Add more jumps to get there!");
      speakText("Almost there! Add more jump steps to reach the goal.");
    }
  };

  // Pattern Choice Handler for Level 5
  const handlePatternChoice = (cmd: CommandType, isCorrect: boolean) => {
    if (isCorrect) {
      frogSounds.playSuccess();
      setPatternAccuracy(100);
      addCommand(cmd);
      setErrorMessage(null);
    } else {
      frogSounds.playBump();
      setPatternAccuracy(prev => Math.max(50, prev - 15));
      setErrorMessage("Not quite! Listen to the rhythm: Jump 1, Jump 2, Jump 1, Jump 2... What's next?");
      speakText("Listen to the rhythm: Jump 1, Jump 2, Jump 1, Jump 2... What comes next?");
    }
  };

  // Next level navigation
  const nextLevel = () => {
    setShowLevelComplete(false);
    if (currentLevelIdx < FROG_LEVELS.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
    }
  };

  const replayLevel = () => {
    setShowLevelComplete(false);
    setShowFinaleModal(false);
    initLevel(currentLevelIdx);
  };

  // Purchase Costume
  const buyCostume = (c: Costume) => {
    if (c.unlocked) {
      setActiveCostume(c.id);
      frogSounds.playCoin();
      return;
    }
    if (dolaCoins >= c.price) {
      frogSounds.playSuccess();
      setDolaCoins(coins => coins - c.price);
      setCostumes(prev => prev.map(item => item.id === c.id ? { ...item, unlocked: true } : item));
      setActiveCostume(c.id);
      confetti({ particleCount: 40, spread: 50 });
    } else {
      frogSounds.playBump();
      setErrorMessage(`You need ${c.price} DolaCoins for ${c.name}! Keep leaping!`);
    }
  };

  // Environment styling themes
  const getEnvStyles = (env: EnvironmentType) => {
    switch (env) {
      case 'pond':
        return {
          wrapper: 'from-sky-100 via-blue-50 to-teal-100 border-sky-300',
          tileBg: 'bg-sky-200/50 hover:bg-sky-300/60 border-sky-300/70',
          lilyPad: 'bg-emerald-500 border-emerald-600 shadow-md',
          accent: 'text-sky-700',
          name: 'Sparkling Lily Pond 🌊',
        };
      case 'rainforest':
        return {
          wrapper: 'from-emerald-100 via-teal-50 to-green-100 border-emerald-300',
          tileBg: 'bg-emerald-200/50 hover:bg-emerald-300/60 border-emerald-300/70',
          lilyPad: 'bg-emerald-600 border-emerald-700 shadow-md',
          accent: 'text-emerald-800',
          name: 'Tropical Rainforest 🌴',
        };
      case 'garden':
        return {
          wrapper: 'from-amber-100 via-yellow-50 to-lime-100 border-lime-300',
          tileBg: 'bg-lime-200/50 hover:bg-lime-300/60 border-lime-300/70',
          lilyPad: 'bg-lime-500 border-lime-600 shadow-md',
          accent: 'text-lime-800',
          name: 'Blossom Garden 🌻',
        };
      case 'river':
        return {
          wrapper: 'from-cyan-100 via-sky-50 to-blue-100 border-cyan-300',
          tileBg: 'bg-cyan-200/50 hover:bg-cyan-300/60 border-cyan-300/70',
          lilyPad: 'bg-teal-500 border-teal-600 shadow-md',
          accent: 'text-cyan-800',
          name: 'Winding River Stream 🛶',
        };
      case 'jungle':
        return {
          wrapper: 'from-emerald-200 via-green-100 to-teal-200 border-green-400',
          tileBg: 'bg-green-300/50 hover:bg-green-400/60 border-green-400/70',
          lilyPad: 'bg-green-700 border-green-800 shadow-md',
          accent: 'text-green-900',
          name: 'Ancient Deep Jungle 🌿',
        };
    }
  };

  const theme = getEnvStyles(currentLevel.environment);

  // Frog Costume accessory helper
  const renderCostumeAccessory = () => {
    switch (activeCostume) {
      case 'explorer':
        return <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xl select-none">🤠</span>;
      case 'crown':
        return <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl select-none animate-bounce">👑</span>;
      case 'superhero':
        return <span className="absolute -top-1 -right-2 text-xl select-none">🦸‍♂️</span>;
      case 'wizard':
        return <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-xl select-none">🧙‍♂️</span>;
      case 'scuba':
        return <span className="absolute top-1 left-1/2 -translate-x-1/2 text-base select-none">🤿</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 space-y-4 select-none">
      
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border-2 border-emerald-200 shadow-sm">
        
        {/* Left: Back / Map links */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.push('/stage1')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors shadow-2xs"
          >
            <Map className="w-3.5 h-3.5 text-emerald-600" /> Stage 1 Map
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" /> Dashboard
          </button>
        </div>

        {/* Level Badges & Topic */}
        <div className="flex items-center gap-2 text-center">
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-xs">
            Part 12: Frog Adventure • Level {currentLevel.level} of {FROG_LEVELS.length}
          </span>
          <span className="hidden sm:inline text-xs font-bold text-slate-600">
            {currentLevel.title}
          </span>
        </div>

        {/* Right: Gamification Badges, Coins, Mute, Costumes */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCostumeModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-colors shadow-2xs"
            title="Hoppy's Wardrobe"
          >
            <Shirt className="w-3.5 h-3.5 text-amber-600" />
            <span>Wardrobe</span>
          </button>

          <span className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-yellow-400 text-slate-900 font-black text-xs shadow-xs border border-yellow-300">
            <span>🪙</span> {dolaCoins}
          </span>

          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
            <span>⭐</span> {stars}
          </span>

          <button
            onClick={toggleSound}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Level Header Banner & Mission Prompt */}
      <div className={`p-5 rounded-3xl bg-gradient-to-br ${theme.wrapper} border-2 shadow-sm relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-800 font-black text-[11px] uppercase tracking-wider border border-emerald-200 shadow-2xs">
                {theme.name}
              </span>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Topic: {currentLevel.topic}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>🐸</span> {currentLevel.instruction}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Arrange the jump command blocks in the tray below, then tap <strong className="text-emerald-700">GO LEAP! 🚀</strong>
            </p>
          </div>

          {/* Audio speech & hint triggers */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => speakText(currentLevel.speechText)}
              disabled={speaking}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs transition-all shadow-xs ${
                speaking 
                  ? 'bg-purple-200 text-purple-900 animate-pulse' 
                  : 'bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 hover:border-purple-300'
              }`}
            >
              <Volume2 className="w-4 h-4 text-purple-600" />
              <span>{speaking ? 'Reading...' : 'Listen 🔊'}</span>
            </button>

            <button
              onClick={() => {
                setShowHint(!showHint);
                if (!showHint) {
                  setHintsUsed(h => h + 1);
                  speakText(currentLevel.lizzyHint);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition-all shadow-xs"
            >
              <Lightbulb className="w-4 h-4 text-slate-950" />
              <span>{showHint ? 'Hide Hint' : 'Lizzy Hint 💡'}</span>
            </button>
          </div>
        </div>

        {/* Lizzy Hint Card */}
        {showHint && (
          <div className="mt-3 p-3.5 rounded-2xl bg-white/95 border-2 border-amber-300 shadow-sm flex items-start gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0 border border-amber-300">
              💡
            </div>
            <div>
              <p className="text-xs font-black text-amber-900">Lizzy the Frog Guide says:</p>
              <p className="text-xs text-slate-700 font-medium mt-0.5">{currentLevel.lizzyHint}</p>
            </div>
          </div>
        )}

        {/* Error message banner */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2 shadow-2xs animate-fade-in">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-rose-500 hover:text-rose-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Play Area: Left Column Grid | Right Column Command Sequence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: 2D Frog Grid World */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-2 border-b border-slate-100">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              Environment: <strong className="text-slate-900 capitalize">{currentLevel.environment}</strong>
            </span>
            <span className="flex items-center gap-2">
              {levelFruits.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black border border-amber-200">
                  Fruits: {levelFruits.filter(f => f.collected).length} / {levelFruits.length} 🥭
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                Facing: <strong className="text-emerald-700">{frogPos.dir}</strong>
              </span>
            </span>
          </div>

          {/* Grid Box */}
          <div className="relative mx-auto w-full max-w-[480px] aspect-square sm:aspect-auto sm:h-[420px] rounded-3xl p-3 bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-slate-200 flex flex-col justify-center shadow-inner">
            
            {/* Coordinate X-axis Header (If coordinate level) */}
            {currentLevel.showCoordinates && (
              <div className="grid grid-flow-col auto-cols-fr text-center text-xs font-black text-indigo-700 mb-1 pl-6">
                {Array.from({ length: currentLevel.gridCols }).map((_, c) => (
                  <span key={c} className="py-0.5 bg-indigo-50/80 rounded border border-indigo-200 mx-0.5">
                    Col {c + 1}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-1 items-stretch">
              
              {/* Coordinate Y-axis Sidebar (If coordinate level) */}
              {currentLevel.showCoordinates && (
                <div className="flex flex-col justify-around text-center text-xs font-black text-indigo-700 pr-2">
                  {Array.from({ length: currentLevel.gridRows }).map((_, r) => (
                    <span key={r} className="px-1.5 py-1 bg-indigo-50/80 rounded border border-indigo-200 my-0.5">
                      Row {r + 1}
                    </span>
                  ))}
                </div>
              )}

              {/* Grid Tiles */}
              <div 
                className="grid gap-2 flex-1 w-full h-full"
                style={{
                  gridTemplateColumns: `repeat(${currentLevel.gridCols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${currentLevel.gridRows}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: currentLevel.gridRows }).map((_, row) => (
                  Array.from({ length: currentLevel.gridCols }).map((_, col) => {
                    const isFrogHere = frogPos.x === col && frogPos.y === row;
                    const isGoalHere = currentLevel.goal.x === col && currentLevel.goal.y === row;
                    const obstacleHere = currentLevel.obstacles.find(o => o.x === col && o.y === row);
                    const fruitHere = levelFruits.find(f => f.x === col && f.y === row && !f.collected);

                    return (
                      <div
                        key={`${col}-${row}`}
                        className={`relative rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                          theme.tileBg
                        } ${
                          isGoalHere ? 'ring-4 ring-amber-400 ring-offset-1 bg-amber-50/90' : ''
                        }`}
                      >
                        {/* Tile Lily Pad Texture */}
                        <div className="absolute inset-1.5 rounded-xl border border-white/60 pointer-events-none flex items-center justify-center opacity-30">
                          <span className="text-xl">🍃</span>
                        </div>

                        {/* Obstacle Rendering */}
                        {obstacleHere && (
                          <div className="z-10 flex flex-col items-center justify-center animate-wiggle">
                            <span className="text-2xl sm:text-3xl filter drop-shadow">
                              {obstacleHere.emoji}
                            </span>
                            <span className="text-[9px] font-black text-slate-700 bg-white/80 px-1 rounded shadow-2xs mt-0.5">
                              {obstacleHere.name.split(' ')[0]}
                            </span>
                          </div>
                        )}

                        {/* Fruit Item */}
                        {fruitHere && !isFrogHere && (
                          <div className="z-10 flex flex-col items-center justify-center animate-bounce">
                            <span className="text-2xl sm:text-3xl filter drop-shadow-md">
                              {fruitHere.emoji}
                            </span>
                            <span className="text-[8px] font-black text-amber-800 bg-amber-100 px-1 rounded border border-amber-200">
                              +{fruitHere.points}
                            </span>
                          </div>
                        )}

                        {/* Goal Item */}
                        {isGoalHere && !isFrogHere && (
                          <div className="z-10 flex flex-col items-center justify-center">
                            <span className="text-3xl sm:text-4xl filter drop-shadow-lg animate-pulse">
                              {currentLevel.goal.emoji}
                            </span>
                            <span className="text-[9px] font-black text-amber-900 bg-yellow-200 px-1.5 py-0.2 rounded-full shadow-xs mt-0.5 border border-yellow-300">
                              GOAL
                            </span>
                          </div>
                        )}

                        {/* Hoppy the Frog Character Rendering */}
                        {isFrogHere && (
                          <div 
                            className={`z-20 relative flex flex-col items-center justify-center transition-transform duration-300 ${
                              frogExpression === 'leaping' ? 'scale-110' : ''
                            } ${
                              frogExpression === 'bump' ? 'rotate-12 animate-shake' : ''
                            } ${
                              frogExpression === 'victory' ? 'animate-bounce' : ''
                            }`}
                            style={{
                              transform: `rotate(${
                                frogPos.dir === 'NORTH' ? 0 :
                                frogPos.dir === 'EAST' ? 90 :
                                frogPos.dir === 'SOUTH' ? 180 : 270
                              }deg)`
                            }}
                          >
                            {/* Accessory / Hat */}
                            <div className="relative">
                              {renderCostumeAccessory()}
                              {/* Cartoon Frog SVG Body */}
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" viewBox="0 0 100 100">
                                {/* Back webbed feet */}
                                <ellipse cx="22" cy="78" rx="14" ry="9" fill="#15803d" />
                                <ellipse cx="78" cy="78" rx="14" ry="9" fill="#15803d" />
                                {/* Main body */}
                                <ellipse cx="50" cy="55" rx="35" ry="32" fill="#22c55e" />
                                {/* Soft tummy */}
                                <ellipse cx="50" cy="62" rx="22" ry="18" fill="#86efac" />
                                {/* Front webbed feet */}
                                <ellipse cx="30" cy="85" rx="10" ry="6" fill="#16a34a" />
                                <ellipse cx="70" cy="85" rx="10" ry="6" fill="#16a34a" />
                                {/* Left Big Eye */}
                                <circle cx="34" cy="30" r="16" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                                <circle cx="34" cy="30" r="11" fill="#ffffff" />
                                <circle cx="36" cy="30" r="6" fill="#0f172a" />
                                <circle cx="38" cy="28" r="2.5" fill="#ffffff" />
                                {/* Right Big Eye */}
                                <circle cx="66" cy="30" r="16" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                                <circle cx="66" cy="30" r="11" fill="#ffffff" />
                                <circle cx="64" cy="30" r="6" fill="#0f172a" />
                                <circle cx="62" cy="28" r="2.5" fill="#ffffff" />
                                {/* Cheeks */}
                                <circle cx="28" cy="52" r="6" fill="#f472b6" opacity="0.6" />
                                <circle cx="72" cy="52" r="6" fill="#f472b6" opacity="0.6" />
                                {/* Smile */}
                                {frogExpression === 'bump' ? (
                                  <ellipse cx="50" cy="56" rx="6" ry="6" fill="#0f172a" />
                                ) : (
                                  <path d="M 38 52 Q 50 64 62 52" stroke="#0f172a" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                                )}
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Coordinate (X,Y) watermark */}
                        {currentLevel.showCoordinates && (
                          <span className="absolute bottom-1 right-1 text-[9px] font-bold text-slate-400 select-none opacity-60">
                            {col + 1},{row + 1}
                          </span>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          </div>

          {/* Level 5 Pattern Prompt Bar (If Pattern Level) */}
          {currentLevel.isPatternLevel && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧩</span>
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                  Pattern Puzzle: Jump 1, Jump 2, Jump 1, Jump 2, [ ? ]
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentLevel.patternOptions?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePatternChoice(opt.cmd, opt.isCorrect)}
                    className="p-3 rounded-2xl bg-white hover:bg-amber-100/80 border-2 border-amber-200 hover:border-amber-400 text-slate-800 font-black text-xs transition-all shadow-xs active:scale-95 text-center"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shortest Path Step Counter Bar (If Shortest Path Level) */}
          {currentLevel.isShortestPathLevel && (
            <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-cyan-600" /> Planned Steps: <strong>{commands.length}</strong>
              </span>
              <span className="font-black text-cyan-800 bg-white px-2.5 py-1 rounded-xl border border-cyan-200">
                Target: {currentLevel.targetMaxSteps || 4} Steps (Shortest Route)
              </span>
            </div>
          )}

        </div>

        {/* Right Column: Code Action Tray & Large Command Buttons */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Action Sequence Tray Card */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                  {commands.length}
                </div>
                <h3 className="font-black text-sm text-slate-900">Hoppy&apos;s Command Tray</h3>
              </div>
              <button
                onClick={clearCommands}
                disabled={isExecuting || commands.length === 0}
                className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Programmed Sequence List */}
            <div className="min-h-[140px] max-h-[220px] overflow-y-auto p-2 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              {commands.length === 0 ? (
                <div className="h-28 flex flex-col items-center justify-center text-center text-slate-400 p-3">
                  <span className="text-2xl mb-1 opacity-60">📋</span>
                  <p className="text-xs font-bold">No commands yet!</p>
                  <p className="text-[11px] text-slate-400">Tap the large command buttons below to build Hoppy&apos;s sequence.</p>
                </div>
              ) : (
                commands.map((cmd, idx) => {
                  const isActive = activeStepIdx === idx;
                  const isBuggy = currentLevel.isDebuggingLevel && idx === 2; // Step 3 bug in Level 8

                  return (
                    <div
                      key={cmd.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all ${
                        isActive
                          ? 'bg-yellow-100 border-yellow-400 scale-[1.02] shadow-sm'
                          : isBuggy
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        
                        {cmd.type === 'JUMP' && (
                          <span className="font-black text-xs text-emerald-700 flex items-center gap-1.5">
                            <ArrowUp className="w-4 h-4 text-emerald-600" /> JUMP FORWARD 1
                          </span>
                        )}
                        {cmd.type === 'JUMP_2' && (
                          <span className="font-black text-xs text-sky-700 flex items-center gap-1.5">
                            <span className="text-sm">🚀</span> JUMP 2 SPACES
                          </span>
                        )}
                        {cmd.type === 'TURN_LEFT' && (
                          <span className="font-black text-xs text-indigo-700 flex items-center gap-1.5">
                            <ArrowLeft className="w-4 h-4 text-indigo-600" /> TURN LEFT (↺)
                          </span>
                        )}
                        {cmd.type === 'TURN_RIGHT' && (
                          <span className="font-black text-xs text-amber-700 flex items-center gap-1.5">
                            <ArrowRightIcon className="w-4 h-4 text-amber-600" /> TURN RIGHT (↻)
                          </span>
                        )}
                        {cmd.type === 'REPEAT' && (
                          <span className="font-black text-xs text-purple-700 flex items-center gap-1.5">
                            <Repeat className="w-4 h-4 text-purple-600" /> REPEAT {cmd.repeatCount || 4}x: JUMP
                          </span>
                        )}

                        {isBuggy && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-200 text-rose-800 text-[9px] font-black uppercase">
                            🐛 Bug
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => removeCommand(idx)}
                        disabled={isExecuting}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg text-xs font-bold"
                        title="Remove step"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Big Green GO Button */}
            <button
              onClick={runSequence}
              disabled={isExecuting || commands.length === 0}
              className={`w-full py-4 rounded-3xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                isExecuting
                  ? 'bg-emerald-400 text-white cursor-wait animate-pulse'
                  : commands.length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-emerald-500/25'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isExecuting ? 'Hoppy is Leaping... 🐸' : 'GO LEAP! 🚀'}</span>
            </button>
          </div>

          {/* Large Visual Command Buttons */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm space-y-3">
            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡</span> Command Blocks
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Jump Forward 1 */}
              <button
                onClick={() => addCommand('JUMP')}
                disabled={isExecuting}
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                  ⬆️
                </div>
                <div className="text-left">
                  <div className="font-black text-xs">JUMP 1</div>
                  <div className="text-[10px] text-emerald-700 font-medium">Forward 1 space</div>
                </div>
              </button>

              {/* Jump 2 Spaces */}
              <button
                onClick={() => addCommand('JUMP_2')}
                disabled={isExecuting}
                className="p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border-2 border-sky-300 text-sky-900 font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                  🚀
                </div>
                <div className="text-left">
                  <div className="font-black text-xs">JUMP 2</div>
                  <div className="text-[10px] text-sky-700 font-medium">Long leap 2 spaces</div>
                </div>
              </button>

              {/* Turn Left */}
              <button
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isExecuting}
                className="p-3.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                  ↺
                </div>
                <div className="text-left">
                  <div className="font-black text-xs">TURN LEFT</div>
                  <div className="text-[10px] text-indigo-700 font-medium">Rotate 90° Left</div>
                </div>
              </button>

              {/* Turn Right */}
              <button
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isExecuting}
                className="p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-black text-xs flex items-center gap-2 transition-all active:scale-95 shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                  ↻
                </div>
                <div className="text-left">
                  <div className="font-black text-xs">TURN RIGHT</div>
                  <div className="text-[10px] text-amber-700 font-medium">Rotate 90° Right</div>
                </div>
              </button>

            </div>

            {/* Loop Block for Loop Level / Advanced */}
            {(currentLevel.hasLoopBlock || currentLevel.level >= 7) && (
              <button
                onClick={() => addCommand('REPEAT', 4)}
                disabled={isExecuting}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 border-2 border-purple-300 text-purple-950 font-black text-xs flex items-center justify-between transition-all active:scale-98 shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-2xs">
                    🔄
                  </div>
                  <div className="text-left">
                    <div className="font-black text-xs">REPEAT 4 TIMES (LOOP)</div>
                    <div className="text-[10px] text-purple-700 font-medium">Repeats Jump Forward 4x automatically</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                  + Add Loop
                </span>
              </button>
            )}

            {/* Reset Frog Button */}
            <button
              onClick={() => {
                setFrogPos({ ...currentLevel.startPos });
                setFrogExpression('happy');
                setErrorMessage(null);
              }}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Hoppy to Start
            </button>

          </div>

        </div>

      </div>

      {/* Wardrobe Modal */}
      {isCostumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-2 border-amber-300 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-6 h-6 text-amber-500" />
                <h3 className="font-black text-lg text-slate-900">Hoppy&apos;s Wardrobe</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 font-black text-xs shadow-xs">
                  🪙 {dolaCoins} DolaCoins
                </span>
                <button 
                  onClick={() => setIsCostumeModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold text-xs"
                >
                  ✕
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Spend your earned DolaCoins to unlock fun hats and costumes for Hoppy!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {costumes.map(c => {
                const isEquipped = activeCostume === c.id;
                return (
                  <div
                    key={c.id}
                    className={`p-3.5 rounded-2xl border-2 text-center flex flex-col items-center justify-between transition-all ${
                      isEquipped
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-3xl mb-1">{c.emoji}</span>
                    <span className="font-black text-xs text-slate-900">{c.name}</span>
                    
                    <button
                      onClick={() => buyCostume(c)}
                      className={`mt-2 w-full py-1.5 rounded-xl font-black text-xs transition-colors shadow-2xs ${
                        isEquipped
                          ? 'bg-emerald-600 text-white'
                          : c.unlocked
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : dolaCoins >= c.price
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-950'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isEquipped ? 'Equipped ✓' : c.unlocked ? 'Wear' : `🪙 ${c.price}`}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsCostumeModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Done Dressing Up
            </button>
          </div>
        </div>
      )}

      {/* Level Complete Modal */}
      {showLevelComplete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-emerald-300 max-w-md w-full p-6 text-center space-y-5 shadow-2xl animate-scale-up">
            
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white mx-auto flex items-center justify-center text-3xl shadow-lg animate-bounce">
              🐸
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">
                Adventure Completed!
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Ribbit! Fantastic Leap!
              </h3>
              <p className="text-xs text-slate-600">
                You helped Hoppy solve the sequence and reach the goal safely!
              </p>
            </div>

            {/* Stars & Coins Reward Box */}
            <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="text-center">
                <div className="text-lg">⭐⭐⭐</div>
                <span className="text-[10px] text-emerald-800 font-bold">3 Stars</span>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div className="text-center">
                <div className="font-black text-amber-600 text-base">🪙 +15</div>
                <span className="text-[10px] text-amber-800 font-bold">DolaCoins</span>
              </div>
              <div className="h-8 w-px bg-emerald-200" />
              <div className="text-center">
                <div className="font-black text-purple-600 text-base">⚡ +50</div>
                <span className="text-[10px] text-purple-800 font-bold">XP Points</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={nextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <span>Play Next Level</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={replayLevel}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay
                </button>
                <button
                  onClick={() => router.push('/stage1')}
                  className="py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Map className="w-3.5 h-3.5" /> Stage 1 Map
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" /> Dashboard
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Grand Finale Modal */}
      {showFinaleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-amber-300 max-w-lg w-full p-6 text-center space-y-5 shadow-2xl animate-scale-up">
            
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-emerald-500 text-white mx-auto flex items-center justify-center text-4xl shadow-xl animate-bounce">
              👑
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                🌟 Frog Adventure Champion 🌟
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Hoppy Reached Home!
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                You mastered jump counting, directions, shortest routes, fruit waypoints, patterns, coordinates, loops, and debugging!
              </p>
            </div>

            {/* Badges Earned Ribbon */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">
                Earned Adventure Badges:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {['Little Jumper', 'Pond Explorer', 'Pattern Pro', 'Path Finder', 'Frog Coder'].map(badge => (
                  <span key={badge} className="px-2.5 py-1 rounded-full bg-white text-emerald-800 font-bold text-xs border border-emerald-200 shadow-2xs">
                    ⭐ {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Grand CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => router.push('/stage1')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <Map className="w-4 h-4" /> Return to Stage 1 Map (120 Levels)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={replayLevel}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay Level 10
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <Home className="w-3.5 h-3.5" /> Student Dashboard
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
