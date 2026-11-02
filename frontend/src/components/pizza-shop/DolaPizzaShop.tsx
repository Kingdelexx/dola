'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw, 
  HelpCircle, CheckCircle2, Heart, Award, Flame, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, ChefHat, MessageSquare
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

  playBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // High cheerful shop bell tone (E6 -> B5)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.5, now); // E6
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08); // B5
    gain2.gain.setValueAtTime(0.35, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.7);
  }

  playSlicePickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playSlicePlace() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.28, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
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
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.07);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playMunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Crunch sound
    [0, 0.12].forEach((timeOffset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(80, now + timeOffset + 0.08);
      gain.gain.setValueAtTime(0.18, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + timeOffset + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.08);
    });
  }

  playHint() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.18);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }
}

const sounds = new SoundEffects();

// --- Customer Characters (African Children) ---
interface Customer {
  id: string;
  name: string;
  hair: 'puffs' | 'fade' | 'braids' | 'locs' | 'cornrows';
  skinTone: string; // Hex color
  shirtColor: string;
  accessory: string;
  greeting: string;
}

const CUSTOMERS: Customer[] = [
  {
    id: 'amara',
    name: 'Amara',
    hair: 'puffs',
    skinTone: '#6b3e26', // Warm cocoa
    shirtColor: '#f59e0b', // Sunflower amber
    accessory: 'yellow ribbons',
    greeting: 'Hi Chef! I love pizza!'
  },
  {
    id: 'kofi',
    name: 'Kofi',
    hair: 'fade',
    skinTone: '#4a2818', // Deep mahogany
    shirtColor: '#10b981', // Emerald green
    accessory: 'star badge',
    greeting: 'Hello! I am super hungry!'
  },
  {
    id: 'zola',
    name: 'Zola',
    hair: 'braids',
    skinTone: '#3b1d11', // Deep espresso
    shirtColor: '#8b5cf6', // Purple hoodie
    accessory: 'wooden beads',
    greeting: 'Greetings! Best pizza in town!'
  },
  {
    id: 'ade',
    name: 'Ade',
    hair: 'locs',
    skinTone: '#784328', // Rich bronze
    shirtColor: '#06b6d4', // Teal & orange cap
    accessory: 'cool cap',
    greeting: 'Hey there! Let us make something tasty!'
  },
  {
    id: 'nia',
    name: 'Nia',
    hair: 'cornrows',
    skinTone: '#5c331e', // Chocolate
    shirtColor: '#ec4899', // Coral pink dungarees
    accessory: 'pink beads',
    greeting: 'Yay! Pizza time with Lizzy!'
  }
];

// --- Order Definition ---
interface OrderChallenge {
  id: number;
  level: number;
  customerIndex: number;
  type: 'counting' | 'addition' | 'subtraction' | 'sharing' | 'fractions' | 'loops';
  prompt: string;
  speechText: string;
  initialPlateCount: number; // For addition/subtraction where slices start on plate
  targetCount: number; // Target number of slices that must be on plate
  totalAvailable: number; // Total slices provided on tray
  hintFormula?: string;
  loopCommand?: { repeat: number; add: number }; // For level 6 loop commands
  explanation?: string;
}

// Built-in order levels
const CHALLENGES: OrderChallenge[] = [
  // --- LEVEL 1: COUNTING 1–10 ---
  {
    id: 1,
    level: 1,
    customerIndex: 0, // Amara
    type: 'counting',
    prompt: 'I want 4 slices please! 🍕',
    speechText: 'I want 4 slices please!',
    initialPlateCount: 0,
    targetCount: 4,
    totalAvailable: 8,
    hintFormula: 'Count to 4 one by one!',
    explanation: 'Great counting! You served 4 slices.'
  },
  {
    id: 2,
    level: 1,
    customerIndex: 1, // Kofi
    type: 'counting',
    prompt: 'Please give me 3 yummy slices! 🍕',
    speechText: 'Please give me 3 yummy slices!',
    initialPlateCount: 0,
    targetCount: 3,
    totalAvailable: 8,
    hintFormula: 'Count 1, 2, 3!',
    explanation: 'Awesome! Exactly 3 slices on the plate.'
  },
  {
    id: 3,
    level: 1,
    customerIndex: 2, // Zola
    type: 'counting',
    prompt: 'Party time! I need 6 slices please! 🍕',
    speechText: 'Party time! I need 6 slices please!',
    initialPlateCount: 0,
    targetCount: 6,
    totalAvailable: 8,
    hintFormula: 'Count all the way to 6!',
    explanation: 'Super server! 6 slices ready to eat.'
  },
  {
    id: 4,
    level: 1,
    customerIndex: 3, // Ade
    type: 'counting',
    prompt: 'Just 2 slices for me today! 🍕',
    speechText: 'Just 2 slices for me today!',
    initialPlateCount: 0,
    targetCount: 2,
    totalAvailable: 8,
    hintFormula: 'Count 1, then 2!',
    explanation: 'Perfect! 2 slices for Ade.'
  },

  // --- LEVEL 2: SIMPLE ADDITION ---
  {
    id: 5,
    level: 2,
    customerIndex: 0, // Amara
    type: 'addition',
    prompt: 'I have 2 slices. Add 3 more! 🍕',
    speechText: 'I have 2 slices. Add 3 more please!',
    initialPlateCount: 2,
    targetCount: 5, // 2 + 3 = 5
    totalAvailable: 8,
    hintFormula: '2 + 3 = 5 slices in total!',
    explanation: '2 plus 3 equals 5! You are an Addition Wizard!'
  },
  {
    id: 6,
    level: 2,
    customerIndex: 1, // Kofi
    type: 'addition',
    prompt: 'I have 1 slice. Can you add 4 more? 🍕',
    speechText: 'I have 1 slice. Can you add 4 more?',
    initialPlateCount: 1,
    targetCount: 5, // 1 + 4 = 5
    totalAvailable: 8,
    hintFormula: '1 + 4 = 5 slices in total!',
    explanation: '1 plus 4 makes 5! Fantastic work!'
  },
  {
    id: 7,
    level: 2,
    customerIndex: 4, // Nia
    type: 'addition',
    prompt: 'I have 3 slices. Add 3 more! 🍕',
    speechText: 'I have 3 slices. Add 3 more please!',
    initialPlateCount: 3,
    targetCount: 6, // 3 + 3 = 6
    totalAvailable: 8,
    hintFormula: '3 + 3 = 6 slices!',
    explanation: 'Double 3 equals 6! Yum!'
  },

  // --- LEVEL 3: SIMPLE SUBTRACTION ---
  {
    id: 8,
    level: 3,
    customerIndex: 3, // Ade
    type: 'subtraction',
    prompt: 'There are 6 slices. I eat 2! How many remain? 🍕',
    speechText: 'There are 6 slices on my plate. I ate 2! Remove 2 to show what remains.',
    initialPlateCount: 6,
    targetCount: 4, // 6 - 2 = 4
    totalAvailable: 8,
    hintFormula: '6 - 2 = 4 slices remain!',
    explanation: '6 take away 2 leaves 4! Subtraction champion!'
  },
  {
    id: 9,
    level: 3,
    customerIndex: 2, // Zola
    type: 'subtraction',
    prompt: 'There are 5 slices. Take away 2 slices! 🍕',
    speechText: 'There are 5 slices. Take away 2 slices!',
    initialPlateCount: 5,
    targetCount: 3, // 5 - 2 = 3
    totalAvailable: 8,
    hintFormula: '5 - 2 = 3 slices remain!',
    explanation: '5 minus 2 equals 3! Spot on!'
  },
  {
    id: 10,
    level: 3,
    customerIndex: 4, // Nia
    type: 'subtraction',
    prompt: 'There are 7 slices. Remove 3 slices! 🍕',
    speechText: 'There are 7 slices on the plate. Remove 3 slices!',
    initialPlateCount: 7,
    targetCount: 4, // 7 - 3 = 4
    totalAvailable: 8,
    hintFormula: '7 - 3 = 4 slices remain!',
    explanation: '7 minus 3 equals 4! Deliciously solved!'
  },

  // --- LEVEL 4: SHARING ---
  {
    id: 11,
    level: 4,
    customerIndex: 1, // Kofi & Friend
    type: 'sharing',
    prompt: 'Share 6 slices equally with a friend! (3 each) 🍕',
    speechText: 'Share 6 slices equally with my friend! Put 3 on each plate.',
    initialPlateCount: 0,
    targetCount: 3,
    totalAvailable: 6,
    hintFormula: '6 shared between 2 friends is 3 each!',
    explanation: 'Fair share! 3 for each friend. Fair and delicious!'
  },

  // --- LEVEL 5: FRACTIONS ---
  {
    id: 12,
    level: 5,
    customerIndex: 0, // Amara
    type: 'fractions',
    prompt: 'I want HALF (1/2) of an 8-slice pizza! (4 slices) 🍕',
    speechText: 'I want half of the pizza please! That is 4 slices.',
    initialPlateCount: 0,
    targetCount: 4,
    totalAvailable: 8,
    hintFormula: 'Half of 8 slices is 4 slices (1/2)!',
    explanation: '1/2 of 8 slices is 4! You know your fractions!'
  },

  // --- LEVEL 6: COMPUTATIONAL THINKING (LOOPS) ---
  {
    id: 13,
    level: 6,
    customerIndex: 2, // Zola
    type: 'loops',
    prompt: 'Order: 6 slices. Use a LOOP to build it! 🔄',
    speechText: 'I need 6 slices! Run the loop block to add them automatically!',
    initialPlateCount: 0,
    targetCount: 6,
    totalAvailable: 8,
    loopCommand: { repeat: 3, add: 2 },
    hintFormula: 'REPEAT 3 TIMES: ADD 2 SLICES = 6 Slices!',
    explanation: 'Wow! You used a LOOP! A loop tells the computer to repeat instructions automatically!'
  }
];

// Badge Definitions
interface BadgeItem {
  slug: string;
  name: string;
  desc: string;
  icon: string;
}

const PIZZA_BADGES: BadgeItem[] = [
  { slug: 'rookie', name: 'Pizza Rookie', desc: 'Served your 1st pizza customer!', icon: '🍕' },
  { slug: 'server', name: 'Super Server', desc: 'Served 5 happy customers in a shift!', icon: '⭐' },
  { slug: 'counter', name: 'Counting Champion', desc: 'Mastered Level 1 counting!', icon: '🔢' },
  { slug: 'master', name: 'Pizza Master', desc: 'Mastered Level 2 slice addition!', icon: '👨‍🍳' },
  { slug: 'loop', name: 'Loop Legend', desc: 'Used repeating loop recipes!', icon: '🔄' }
];

export interface DolaPizzaShopProps {
  onBackToStage1?: () => void;
  initialLevel?: number;
}

export default function DolaPizzaShop({ onBackToStage1, initialLevel = 1 }: DolaPizzaShopProps) {
  const router = useRouter();
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Current game state
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevel);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState<number>(0);
  const [plateSlices, setPlateSlices] = useState<number[]>([]); // Slices on plate by ID
  const [traySlices, setTraySlices] = useState<number[]>([]); // Slices remaining on tray
  const [customerState, setCustomerState] = useState<'waiting' | 'eating' | 'thinking'>('waiting');
  const [lizzySpeech, setLizzySpeech] = useState<string>('Welcome to Dola\'s Pizza Shop! Drag or tap slices onto the plate.');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [orderServed, setOrderServed] = useState<boolean>(false);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const [starCount, setStarCount] = useState<number>(3);
  const [attemptsThisRound, setAttemptsThisRound] = useState<number>(0);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'kitchen' | 'badges'>('kitchen');

  // Level Complete / Shift Complete Modal
  const [levelCompleteModal, setLevelCompleteModal] = useState<{
    completedLevel: number;
    isGameFinale: boolean;
    starsEarned: number;
    dolaCoinsEarned: number;
    ordersServed: number;
  } | null>(null);

  // Loop execution state (Level 6)
  const [loopExecuting, setLoopExecuting] = useState<boolean>(false);
  const [loopStep, setLoopStep] = useState<number>(0);

  // Persistent Stats
  const [dolaCoins, setDolaCoins] = useState<number>(0);
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [totalOrdersServed, setTotalOrdersServed] = useState<number>(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<BadgeItem | null>(null);

  // Parent / Teacher Analytics
  const [countingAttempts, setCountingAttempts] = useState<number>(0);
  const [countingCorrect, setCountingCorrect] = useState<number>(0);
  const [additionAttempts, setAdditionAttempts] = useState<number>(0);
  const [additionCorrect, setAdditionCorrect] = useState<number>(0);
  const [subtractionAttempts, setSubtractionAttempts] = useState<number>(0);
  const [subtractionCorrect, setSubtractionCorrect] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [loopCompletedCount, setLoopCompletedCount] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  // Filter challenges for selected level
  const levelChallenges = CHALLENGES.filter(c => c.level === selectedLevel);
  const currentChallenge = levelChallenges[currentChallengeIndex] || levelChallenges[0] || CHALLENGES[0];
  const currentCustomer = CUSTOMERS[currentChallenge.customerIndex % CUSTOMERS.length];

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.muted = !next;
    if (!next) {
      stopSpeech();
    }
  };

  // Text to Speech for younger kids (Female Voice)
  const speakText = useCallback((text: string) => {
    if (!soundEnabled) return;
    speakFemale(text, {
      rate: 0.95,
      pitch: 1.15,
    });
  }, [soundEnabled]);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dola_pizza_shop_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dolaCoins) setDolaCoins(parsed.dolaCoins);
        if (parsed.xpPoints) setXpPoints(parsed.xpPoints);
        if (parsed.unlockedLevel) setUnlockedLevel(parsed.unlockedLevel);
        if (parsed.streak) setStreak(parsed.streak);
        if (parsed.totalOrdersServed) setTotalOrdersServed(parsed.totalOrdersServed);
        if (parsed.earnedBadges) setEarnedBadges(parsed.earnedBadges);
        if (parsed.hintsUsedCount) setHintsUsedCount(parsed.hintsUsedCount);
        if (parsed.countingCorrect) setCountingCorrect(parsed.countingCorrect);
        if (parsed.additionCorrect) setAdditionCorrect(parsed.additionCorrect);
        if (parsed.subtractionCorrect) setSubtractionCorrect(parsed.subtractionCorrect);
      }
    } catch (err) {
      console.warn('Could not read saved pizza state', err);
    }
  }, []);

  // Save state
  const saveState = useCallback((updated: Partial<{
    dolaCoins: number;
    xpPoints: number;
    unlockedLevel: number;
    streak: number;
    totalOrdersServed: number;
    earnedBadges: string[];
    hintsUsedCount: number;
    countingCorrect: number;
    countingAttempts: number;
    additionCorrect: number;
    additionAttempts: number;
    subtractionCorrect: number;
    subtractionAttempts: number;
  }>) => {
    try {
      const current = {
        dolaCoins,
        xpPoints,
        unlockedLevel,
        streak,
        totalOrdersServed,
        earnedBadges,
        hintsUsedCount,
        countingCorrect,
        countingAttempts,
        additionCorrect,
        additionAttempts,
        subtractionCorrect,
        subtractionAttempts,
        ...updated
      };
      localStorage.setItem('dola_pizza_shop_state', JSON.stringify(current));

      // Also sync to backend API if token is present
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const accuracy = current.totalOrdersServed > 0 
          ? Math.round((current.totalOrdersServed / (current.totalOrdersServed + (current.hintsUsedCount * 0.5))) * 100) 
          : 100;
        const countingAcc = current.countingAttempts > 0 
          ? Math.round((current.countingCorrect / current.countingAttempts) * 100) 
          : 100;
        const additionAcc = current.additionAttempts > 0 
          ? Math.round((current.additionCorrect / current.additionAttempts) * 100) 
          : 100;
        const subtractionAcc = current.subtractionAttempts > 0 
          ? Math.round((current.subtractionCorrect / current.subtractionAttempts) * 100) 
          : 100;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/pizza-shop/save-progress/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            current_level: current.unlockedLevel,
            stars_earned: Math.round(current.totalOrdersServed * 2.8),
            dola_coins: current.dolaCoins,
            xp_earned: current.xpPoints,
            accuracy,
            attempts: current.totalOrdersServed + current.hintsUsedCount,
            correct_orders: current.totalOrdersServed,
            time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
            counting_accuracy: countingAcc,
            addition_accuracy: additionAcc,
            subtraction_accuracy: subtractionAcc,
            problem_solving_accuracy: Math.round((countingAcc + additionAcc + subtractionAcc) / 3),
            hints_used: current.hintsUsedCount,
            coding_concepts_completed: loopCompletedCount,
            badges: current.earnedBadges
          })
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Could not save pizza shop state', err);
    }
  }, [
    dolaCoins, xpPoints, unlockedLevel, streak, totalOrdersServed, earnedBadges,
    hintsUsedCount, countingCorrect, countingAttempts, additionCorrect, additionAttempts,
    subtractionCorrect, subtractionAttempts, loopCompletedCount, startTime
  ]);

  // Setup current challenge round
  useEffect(() => {
    if (!currentChallenge) return;
    const initialPlate: number[] = [];
    for (let i = 0; i < currentChallenge.initialPlateCount; i++) {
      initialPlate.push(i + 1);
    }
    const initialTray: number[] = [];
    for (let i = currentChallenge.initialPlateCount; i < currentChallenge.totalAvailable; i++) {
      initialTray.push(i + 1);
    }

    setPlateSlices(initialPlate);
    setTraySlices(initialTray);
    setCustomerState('waiting');
    setOrderServed(false);
    setShowHint(false);
    setCoinsWon(null);
    setStarCount(3);
    setAttemptsThisRound(0);

    // Initial greeting / prompt
    sounds.playBell();
    const promptText = `${currentCustomer.greeting} ${currentChallenge.prompt}`;
    setLizzySpeech(currentChallenge.speechText);
    speakText(currentChallenge.speechText);
  }, [currentChallenge, currentCustomer, speakText]);

  // Award badges when milestones are reached
  const checkBadgeUnlocks = useCallback((newOrdersCount: number, currentBadges: string[], currentLvl: number) => {
    const newlyWon: BadgeItem[] = [];

    if (newOrdersCount >= 1 && !currentBadges.includes('Pizza Rookie')) {
      const b = PIZZA_BADGES.find(x => x.name === 'Pizza Rookie')!;
      newlyWon.push(b);
      currentBadges.push('Pizza Rookie');
    }
    if (newOrdersCount >= 5 && !currentBadges.includes('Super Server')) {
      const b = PIZZA_BADGES.find(x => x.name === 'Super Server')!;
      newlyWon.push(b);
      currentBadges.push('Super Server');
    }
    if (currentLvl >= 1 && selectedLevel === 1 && !currentBadges.includes('Counting Champion')) {
      const b = PIZZA_BADGES.find(x => x.name === 'Counting Champion')!;
      newlyWon.push(b);
      currentBadges.push('Counting Champion');
    }
    if (currentLvl >= 2 && selectedLevel === 2 && !currentBadges.includes('Pizza Master')) {
      const b = PIZZA_BADGES.find(x => x.name === 'Pizza Master')!;
      newlyWon.push(b);
      currentBadges.push('Pizza Master');
    }
    if ((selectedLevel >= 3 || loopCompletedCount >= 1) && !currentBadges.includes('Loop Legend')) {
      const b = PIZZA_BADGES.find(x => x.name === 'Loop Legend')!;
      newlyWon.push(b);
      currentBadges.push('Loop Legend');
    }

    if (newlyWon.length > 0) {
      setNewlyUnlockedBadge(newlyWon[0]);
      setEarnedBadges([...currentBadges]);
    }
  }, [selectedLevel, loopCompletedCount]);

  // Tap or drag: Move slice from tray to plate
  const moveSliceToPlate = (sliceId: number) => {
    if (orderServed || loopExecuting) return;
    sounds.playSlicePickup();
    setTraySlices(prev => prev.filter(id => id !== sliceId));
    setPlateSlices(prev => [...prev, sliceId]);
    sounds.playSlicePlace();
  };

  // Tap: Move slice from plate back to tray
  const moveSliceToTray = (sliceId: number) => {
    if (orderServed || loopExecuting) return;
    sounds.playSlicePickup();
    setPlateSlices(prev => prev.filter(id => id !== sliceId));
    setTraySlices(prev => [...prev, sliceId]);
    sounds.playSlicePlace();
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, sliceId: number, from: 'tray' | 'plate') => {
    if (orderServed || loopExecuting) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ sliceId, from }));
    sounds.playSlicePickup();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnPlate = (e: React.DragEvent) => {
    e.preventDefault();
    if (orderServed || loopExecuting) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.from === 'tray') {
        setTraySlices(prev => prev.filter(id => id !== data.sliceId));
        setPlateSlices(prev => [...prev, data.sliceId]);
        sounds.playSlicePlace();
      }
    } catch {
      // Handled
    }
  };

  const handleDropOnTray = (e: React.DragEvent) => {
    e.preventDefault();
    if (orderServed || loopExecuting) return;
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.from === 'plate') {
        setPlateSlices(prev => prev.filter(id => id !== data.sliceId));
        setTraySlices(prev => [...prev, data.sliceId]);
        sounds.playSlicePlace();
      }
    } catch {
      // Handled
    }
  };

  // Execute Loop Routine (Level 6)
  const runLoopRoutine = () => {
    if (loopExecuting || orderServed) return;
    setLoopExecuting(true);
    setLoopStep(0);
    setPlateSlices([]);
    setTraySlices([1, 2, 3, 4, 5, 6, 7, 8]);

    const command = currentChallenge.loopCommand || { repeat: 3, add: 2 };
    let currentRepeats = 0;

    const interval = setInterval(() => {
      currentRepeats++;
      setLoopStep(currentRepeats);
      sounds.playSlicePickup();

      // Add slices
      setPlateSlices(prev => {
        const nextId = prev.length + 1;
        return [...prev, nextId, nextId + 1];
      });
      setTraySlices(prev => prev.slice(2));
      sounds.playSlicePlace();

      if (currentRepeats >= command.repeat) {
        clearInterval(interval);
        setLoopExecuting(false);
        setLoopCompletedCount(prev => prev + 1);
        handleServeOrder(true);
      }
    }, 850);
  };

  // Serve Order Evaluation
  const handleServeOrder = (forceCorrect: boolean = false) => {
    if (orderServed) return;
    const count = plateSlices.length;
    const isCorrect = forceCorrect || count === currentChallenge.targetCount;

    // Track analytics based on type
    if (currentChallenge.type === 'counting') {
      setCountingAttempts(prev => prev + 1);
      if (isCorrect) setCountingCorrect(prev => prev + 1);
    } else if (currentChallenge.type === 'addition') {
      setAdditionAttempts(prev => prev + 1);
      if (isCorrect) setAdditionCorrect(prev => prev + 1);
    } else if (currentChallenge.type === 'subtraction') {
      setSubtractionAttempts(prev => prev + 1);
      if (isCorrect) setSubtractionCorrect(prev => prev + 1);
    }

    if (isCorrect) {
      // Cheerful success!
      setOrderServed(true);
      setCustomerState('eating');
      sounds.playMunch();
      sounds.playCorrect();
      sounds.playCoin();

      // Confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      const coinsAwarded = 10;
      setCoinsWon(coinsAwarded);
      const newCoins = dolaCoins + coinsAwarded;
      const newXp = xpPoints + 20;
      const newStreak = streak + 1;
      const newOrders = totalOrdersServed + 1;

      setDolaCoins(newCoins);
      setXpPoints(newXp);
      setStreak(newStreak);
      setTotalOrdersServed(newOrders);

      // Customer cheers
      const celebrationMsg = `Yummy! Thank you! 😋 ${currentChallenge.explanation || 'Perfect order!'}`;
      setLizzySpeech(celebrationMsg);
      speakText("Yummy! Thank you!");

      // Check level unlock
      let nextUnlocked = unlockedLevel;
      if (selectedLevel >= unlockedLevel && selectedLevel < 6) {
        nextUnlocked = selectedLevel + 1;
        setUnlockedLevel(nextUnlocked);
      }

      checkBadgeUnlocks(newOrders, earnedBadges, nextUnlocked);

      // Save state
      saveState({
        dolaCoins: newCoins,
        xpPoints: newXp,
        streak: newStreak,
        totalOrdersServed: newOrders,
        unlockedLevel: nextUnlocked
      });

      // Auto advance to next customer or shift results after 3.2 seconds
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNextCustomer();
      }, 3200);

    } else {
      // Friendly, non-harsh hint! No red buzzer or failure screen!
      setCustomerState('thinking');
      sounds.playHint();
      setAttemptsThisRound(prev => prev + 1);
      setStarCount(prev => Math.max(1, prev - 1));

      if (count < currentChallenge.targetCount) {
        const needed = currentChallenge.targetCount - count;
        const msg = `Let's count together! You have ${count} ${count === 1 ? 'slice' : 'slices'}. Can you add ${needed} more? 🍕`;
        setLizzySpeech(msg);
        speakText(msg);
      } else {
        const excess = count - currentChallenge.targetCount;
        const msg = `Oops! That is ${count} slices, but customer wants ${currentChallenge.targetCount}. Let's take ${excess} ${excess === 1 ? 'slice' : 'slices'} back! 🍕`;
        setLizzySpeech(msg);
        speakText(msg);
      }
    }
  };

  // Next Customer or Level Results
  const advanceToNextCustomer = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (currentChallengeIndex + 1 < levelChallenges.length) {
      setCurrentChallengeIndex(prev => prev + 1);
    } else {
      // Completed all challenges in level!
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 }
      });
      sounds.playCorrect();

      const isFinal = selectedLevel >= 6;
      setLevelCompleteModal({
        completedLevel: selectedLevel,
        isGameFinale: isFinal,
        starsEarned: Math.min(3, starCount),
        dolaCoinsEarned: dolaCoins,
        ordersServed: totalOrdersServed
      });
    }
  };

  // Request Hint
  const handleAskLizzy = () => {
    sounds.playHint();
    setShowHint(true);
    setHintsUsedCount(prev => prev + 1);
    const hintMsg = currentChallenge.hintFormula 
      ? `💡 Hint: ${currentChallenge.hintFormula}` 
      : `💡 Target is ${currentChallenge.targetCount} slices! Count one by one.`;
    setLizzySpeech(hintMsg);
    speakText(hintMsg);
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-5 p-2 sm:p-4 select-none">
      {/* Top Shop Bar */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl border-4 border-white flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
        {/* Decorative Pizza Motif */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-15 pointer-events-none text-9xl">
          🍕
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30">
            🍕
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-200 text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                Stage 1 • Part 9
              </span>
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">
                Ages 5–8
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
              Dola&apos;s Pizza Shop
            </h2>
          </div>
        </div>

        {/* Stats HUD (Coins, Streak, Sound Toggle) */}
        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          {/* DolaCoins */}
          <div className="flex items-center gap-1.5 bg-yellow-400 text-slate-900 px-3.5 py-1.5 rounded-2xl font-black text-sm shadow-md border-2 border-yellow-200 transform hover:scale-105 transition-transform">
            <span className="text-lg">🪙</span>
            <span>{dolaCoins}</span>
            <span className="text-[10px] text-yellow-900 uppercase ml-0.5">Coins</span>
          </div>

          {/* Happy Streak */}
          <div className="flex items-center gap-1.5 bg-rose-600/80 text-white px-3 py-1.5 rounded-2xl font-black text-sm shadow-md border border-rose-400/50">
            <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
            <span>{streak}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors border border-white/20 shadow-sm cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-rose-200" />}
          </button>

          {/* Back to stage button if provided */}
          {onBackToStage1 && (
            <button
              onClick={onBackToStage1}
              className="px-3 py-1.5 rounded-2xl bg-white text-slate-800 font-bold text-xs shadow-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Exit Shop
            </button>
          )}
        </div>
      </div>

      {/* Level Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar bg-white/80 backdrop-blur-md p-2 rounded-2xl border-2 border-orange-100 shadow-sm">
        {[
          { lvl: 1, title: 'Lvl 1: Counting', icon: '🔢', desc: '1–10 Slices' },
          { lvl: 2, title: 'Lvl 2: Addition', icon: '➕', desc: 'Add Slices' },
          { lvl: 3, title: 'Lvl 3: Subtraction', icon: '➖', desc: 'Eat Slices' },
          { lvl: 4, title: 'Lvl 4: Sharing', icon: '🤝', desc: 'Equal Slices' },
          { lvl: 5, title: 'Lvl 5: Fractions', icon: '🍰', desc: 'Half & Quarter' },
          { lvl: 6, title: 'Lvl 6: Loop Coding', icon: '🔄', desc: 'Code Recipes' }
        ].map((tab) => {
          const isUnlocked = tab.lvl <= unlockedLevel;
          const isActive = tab.lvl === selectedLevel;
          return (
            <button
              key={tab.lvl}
              onClick={() => {
                if (isUnlocked) {
                  setSelectedLevel(tab.lvl);
                  setCurrentChallengeIndex(0);
                }
              }}
              disabled={!isUnlocked}
              className={`flex-1 min-w-[130px] p-2 sm:p-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center gap-0.5 text-center
                ${isActive 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md scale-102 ring-2 ring-orange-300' 
                  : isUnlocked 
                    ? 'bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200' 
                    : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-1.5 font-black text-sm">
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
                {!isUnlocked && <Lock size={12} className="text-slate-400" />}
              </div>
              <span className={`text-[10px] ${isActive ? 'text-orange-100 font-medium' : 'text-slate-400'}`}>
                {tab.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Kitchen Counter Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Customer & Lizzy Helper (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Customer Counter Card */}
          <div className="bg-gradient-to-b from-sky-50 via-white to-orange-50 rounded-3xl p-5 border-4 border-orange-200 shadow-md flex flex-col items-center text-center relative overflow-hidden">
            {/* Shift Progress Badge */}
            <div className="w-full flex justify-between items-center mb-3">
              <span className="text-[11px] font-black uppercase text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 flex items-center gap-1">
                <ChefHat size={14} /> Customer {currentChallengeIndex + 1} of {levelChallenges.length}
              </span>
              {/* Star Rating */}
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={`${s <= starCount ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-100'} transition-all`}
                  />
                ))}
              </div>
            </div>

            {/* African Child Customer Avatar */}
            <div className="relative my-2">
              <CustomerAvatar 
                customer={currentCustomer} 
                state={customerState} 
              />
              {/* Eating heart particle animation */}
              {customerState === 'eating' && (
                <div className="absolute -top-3 right-0 text-2xl animate-bounce">
                  ❤️
                </div>
              )}
            </div>

            {/* Customer Name Tag */}
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-1.5 mt-1">
              {currentCustomer.name}
              <span className="text-xs text-slate-400 font-semibold">({currentCustomer.accessory})</span>
            </h3>

            {/* Customer Dialogue Bubble */}
            <div className="relative mt-3 w-full bg-white border-3 border-orange-300 rounded-2xl p-4 shadow-sm text-slate-800 text-sm font-extrabold flex items-center justify-between gap-2">
              <div className="flex-1 text-left">
                <p className="text-orange-950 text-base leading-snug">
                  {currentChallenge.prompt}
                </p>
                {/* Visual Math Formula Badge */}
                {currentChallenge.hintFormula && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                    {currentChallenge.hintFormula}
                  </div>
                )}
              </div>
              <button
                onClick={() => speakText(currentChallenge.speechText)}
                className="p-2 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors shrink-0 cursor-pointer"
                title="Hear Customer speak"
              >
                <Volume2 size={18} />
              </button>
            </div>
          </div>

          {/* Lizzy the Chef Helper Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-4 border-3 border-indigo-200 shadow-sm flex items-start gap-3 relative">
            {/* Lizzy Chef Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center text-2xl shrink-0 shadow-md border-2 border-white">
              🤖
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                  Lizzy • Pizza Helper
                </span>
                <button
                  onClick={handleAskLizzy}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs cursor-pointer"
                >
                  <Lightbulb size={12} /> Need Hint?
                </button>
              </div>
              <p className="text-xs text-indigo-950 font-bold mt-1 leading-relaxed">
                {lizzySpeech}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Pizza Board & Serving Plate (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border-4 border-amber-200 shadow-lg flex flex-col justify-between gap-6 relative">
          {/* Worktop Header */}
          <div className="flex justify-between items-center border-b-2 border-dashed border-amber-200 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest block">
                Chef Kitchen Counter
              </span>
              <h4 className="text-base font-black text-slate-800">
                {currentChallenge.type === 'loops' ? 'Code Recipe Loop' : 'Assemble Pizza Order'}
              </h4>
            </div>

            {/* Slice Counter Pill */}
            <div className="flex items-center gap-2">
              <div className={`px-4 py-1.5 rounded-full font-black text-sm shadow-inner flex items-center gap-1.5 border-2
                ${plateSlices.length === currentChallenge.targetCount 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' 
                  : 'bg-orange-50 text-orange-800 border-orange-200'}`}
              >
                <span>Plate:</span>
                <span className="text-base font-black">{plateSlices.length}</span>
                <span className="text-slate-400">/</span>
                <span className="text-base font-black">{currentChallenge.targetCount}</span>
                <span>🍕</span>
              </div>
            </div>
          </div>

          {/* Level 6 Special: Visual Loop Builder */}
          {currentChallenge.type === 'loops' && (
            <div className="bg-gradient-to-r from-purple-100 via-indigo-50 to-pink-100 p-4 rounded-2xl border-2 border-purple-300 flex flex-col items-center gap-3">
              <div className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" /> Computational Loop Block
              </div>
              
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <div className="bg-purple-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md border-2 border-purple-400">
                  REPEAT 3 TIMES 🔄
                </div>
                <span className="text-purple-400 font-bold">&rarr;</span>
                <div className="bg-indigo-600 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md border-2 border-indigo-400">
                  ADD 2 SLICES 🍕🍕
                </div>
              </div>

              <button
                onClick={runLoopRoutine}
                disabled={loopExecuting || orderServed}
                className="mt-1 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-md flex items-center gap-2 transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loopExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Step {loopStep} of 3...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    RUN RECIPE LOOP ▶️
                  </>
                )}
              </button>
            </div>
          )}

          {/* Interactive Plates & Tray Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Pizza Tray (Fresh Baked Slices) */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDropOnTray}
              className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-4 border-3 border-amber-300 min-h-[250px] flex flex-col items-center justify-between shadow-inner relative"
            >
              <div className="text-[11px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                <span>🔥 Oven Tray</span>
                <span className="text-xs text-amber-600 font-normal">({traySlices.length} slices)</span>
              </div>

              {/* Slices on Tray */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 w-full my-auto">
                {traySlices.length === 0 ? (
                  <div className="text-xs font-bold text-amber-400 py-6 text-center">
                    All slices are on the plate! 🍕
                  </div>
                ) : (
                  traySlices.map((sliceId) => (
                    <div
                      key={sliceId}
                      draggable={!orderServed && !loopExecuting}
                      onDragStart={(e) => handleDragStart(e, sliceId, 'tray')}
                      onClick={() => moveSliceToPlate(sliceId)}
                      className="cursor-pointer transform hover:scale-110 active:scale-90 transition-all select-none"
                      title="Tap or drag to put on plate!"
                    >
                      <PizzaSliceWidget sliceNumber={sliceId} />
                    </div>
                  ))
                )}
              </div>

              <div className="text-[10px] text-amber-700/80 font-bold bg-amber-200/50 px-2 py-0.5 rounded-full">
                👉 Tap or drag slice to Plate
              </div>
            </div>

            {/* Customer's Serving Plate */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDropOnPlate}
              className={`rounded-3xl p-4 border-4 min-h-[250px] flex flex-col items-center justify-between transition-all relative shadow-md
                ${plateSlices.length === currentChallenge.targetCount
                  ? 'bg-emerald-50/70 border-emerald-400 ring-4 ring-emerald-200'
                  : 'bg-slate-50 border-slate-300 border-dashed'}`}
            >
              <div className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <span>🍽️ {currentCustomer.name}&apos;s Plate</span>
                <span className="text-xs font-bold text-slate-400">
                  (Target: {currentChallenge.targetCount})
                </span>
              </div>

              {/* Slices on Plate */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 p-2 w-full my-auto">
                {plateSlices.length === 0 ? (
                  <div className="text-xs font-bold text-slate-400 py-6 text-center flex flex-col items-center gap-1">
                    <span className="text-3xl opacity-50">🍽️</span>
                    <span>Plate is empty!</span>
                    <span className="text-[10px] text-slate-400">Put slices here!</span>
                  </div>
                ) : (
                  plateSlices.map((sliceId, idx) => (
                    <div
                      key={sliceId}
                      draggable={!orderServed && !loopExecuting}
                      onDragStart={(e) => handleDragStart(e, sliceId, 'plate')}
                      onClick={() => moveSliceToTray(sliceId)}
                      className="cursor-pointer transform hover:scale-110 active:scale-90 transition-all relative select-none"
                      title="Tap to return slice to tray"
                    >
                      <PizzaSliceWidget sliceNumber={idx + 1} />
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        {idx + 1}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                🍽️ Tap a slice on plate to remove
              </div>
            </div>
          </div>

          {/* Bottom Action Serving Bell */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              onClick={() => {
                setPlateSlices([]);
                setTraySlices([1, 2, 3, 4, 5, 6, 7, 8]);
                sounds.playHint();
              }}
              disabled={orderServed || loopExecuting}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Reset Plate"
            >
              <RotateCcw size={16} /> Reset
            </button>

            {/* Serve Button or Next Customer Button */}
            {orderServed ? (
              <button
                onClick={advanceToNextCustomer}
                className="flex-1 py-4 px-6 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-200 ring-4 ring-emerald-300 transform hover:scale-102 active:scale-98 transition-all cursor-pointer animate-pulse"
              >
                <span>{currentChallengeIndex + 1 >= levelChallenges.length ? 'SEE SHIFT RESULTS 🏆' : 'NEXT CUSTOMER ➡️'}</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => handleServeOrder()}
                disabled={loopExecuting}
                className={`flex-1 py-4 px-6 rounded-2xl font-black text-base shadow-lg flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98 transition-all cursor-pointer
                  ${plateSlices.length === currentChallenge.targetCount
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200 ring-4 ring-emerald-200'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-200'}`}
              >
                <span className="text-xl">🛎️</span>
                <span>SERVE CUSTOMER!</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Coin Splash Animation Modal */}
      {coinsWon !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn pointer-events-none">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-yellow-300 text-center max-w-xs w-full animate-bounce">
            <div className="text-5xl mb-2">🪙</div>
            <h3 className="text-2xl font-black text-amber-600">+{coinsWon} DolaCoins!</h3>
            <p className="text-xs text-slate-500 font-bold mt-1">Yummy Pizza Served!</p>
          </div>
        </div>
      )}

      {/* Badge Unlocked Modal */}
      {newlyUnlockedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-b from-white to-amber-50 rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-yellow-400 text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner border-2 border-yellow-300">
              {newlyUnlockedBadge.icon}
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                New Badge Unlocked! 🏆
              </span>
              <h3 className="text-xl font-black text-slate-800 mt-1">
                {newlyUnlockedBadge.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {newlyUnlockedBadge.desc}
              </p>
            </div>
            <button
              onClick={() => setNewlyUnlockedBadge(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md hover:from-amber-400 hover:to-orange-400 transition-all cursor-pointer"
            >
              Collect Badge! ⭐
            </button>
          </div>
        </div>
      )}

      {/* Shift Complete / Game Finale Modal with CTA Buttons */}
      {levelCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gradient-to-b from-white via-orange-50/50 to-amber-50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-yellow-400 text-center space-y-5 relative overflow-hidden">
            {/* Background sparkle burst */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />

            {/* Big Trophy Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-xl border-4 border-white relative z-10 animate-bounce">
              {levelCompleteModal.isGameFinale ? '👑' : '🏆'}
            </div>

            <div className="relative z-10">
              <span className="text-xs font-black uppercase text-orange-600 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                {levelCompleteModal.isGameFinale ? 'Grand Finale Complete!' : `Level ${levelCompleteModal.completedLevel} Shift Complete!`}
              </span>
              <h3 className="text-2xl font-black text-slate-800 mt-2">
                {levelCompleteModal.isGameFinale 
                  ? 'Grand Pizza Master! 🎉' 
                  : 'Yummy Success! Great Job Chef! 🍕'}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1 max-w-xs mx-auto">
                {levelCompleteModal.isGameFinale
                  ? 'You completed every level of Dola\'s Pizza Shop! You are a true numeracy and loop coding genius!'
                  : `You served all hungry customers in Level ${levelCompleteModal.completedLevel} with fantastic numeracy skills!`}
              </p>
            </div>

            {/* Performance Stats Bar */}
            <div className="grid grid-cols-3 gap-2 bg-white/90 p-3 rounded-2xl border border-orange-200 shadow-inner relative z-10">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Stars</span>
                <span className="text-lg font-black text-amber-500">⭐⭐⭐</span>
              </div>
              <div className="text-center border-x border-orange-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Coins</span>
                <span className="text-base font-black text-yellow-600 flex items-center justify-center gap-0.5">
                  🪙 {dolaCoins}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Orders</span>
                <span className="text-base font-black text-orange-600">
                  🍕 {totalOrdersServed}
                </span>
              </div>
            </div>

            {/* Call to Action (CTA) Buttons */}
            <div className="space-y-2.5 pt-2 relative z-10">
              {!levelCompleteModal.isGameFinale ? (
                <button
                  onClick={() => {
                    const nextLvl = levelCompleteModal.completedLevel + 1;
                    setSelectedLevel(nextLvl);
                    setCurrentChallengeIndex(0);
                    setLevelCompleteModal(null);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base shadow-lg shadow-emerald-200 ring-4 ring-emerald-200 flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Play Level {levelCompleteModal.completedLevel + 1}</span>
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedLevel(1);
                    setCurrentChallengeIndex(0);
                    setLevelCompleteModal(null);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transform hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Play Again from Level 1 🔄</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setCurrentChallengeIndex(0);
                    setLevelCompleteModal(null);
                  }}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-orange-50 text-orange-700 font-bold text-xs border-2 border-orange-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={14} /> Replay Level
                </button>
                <button
                  onClick={() => {
                    setLevelCompleteModal(null);
                    if (onBackToStage1) {
                      onBackToStage1();
                    } else {
                      router.push('/stage1');
                    }
                  }}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs border-2 border-indigo-200 shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Stage 1 Map 🗺️</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setLevelCompleteModal(null);
                  router.push('/dashboard');
                }}
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                🏠 Return to Student Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- African Child SVG Component ---
function CustomerAvatar({ customer, state }: { customer: Customer; state: 'waiting' | 'eating' | 'thinking' }) {
  const isEating = state === 'eating';
  const isThinking = state === 'thinking';

  return (
    <div className="w-32 h-32 sm:w-36 sm:h-36 relative mx-auto transition-transform duration-300">
      <svg
        viewBox="0 0 160 160"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow halo */}
        <circle cx="80" cy="80" r="74" fill={customer.shirtColor} fillOpacity="0.12" />

        {/* Hair Styles */}
        {customer.hair === 'puffs' && (
          // Double Afro Puffs with ribbons
          <g>
            <circle cx="38" cy="46" r="24" fill="#1e1b18" />
            <circle cx="122" cy="46" r="24" fill="#1e1b18" />
            <ellipse cx="46" cy="60" rx="8" ry="4" fill="#fbbf24" />
            <ellipse cx="114" cy="60" rx="8" ry="4" fill="#fbbf24" />
          </g>
        )}

        {customer.hair === 'fade' && (
          // Sharp Clean Fade
          <g>
            <ellipse cx="80" cy="52" rx="42" ry="26" fill="#1e1b18" />
            <path d="M40 68 C40 45, 120 45, 120 68 Z" fill="#1e1b18" />
          </g>
        )}

        {customer.hair === 'braids' && (
          // Box Braids with Wooden Beads
          <g>
            <ellipse cx="80" cy="52" rx="42" ry="24" fill="#1e1b18" />
            <rect x="42" y="60" width="8" height="45" rx="4" fill="#1e1b18" />
            <rect x="54" y="60" width="8" height="42" rx="4" fill="#1e1b18" />
            <rect x="98" y="60" width="8" height="42" rx="4" fill="#1e1b18" />
            <rect x="110" y="60" width="8" height="45" rx="4" fill="#1e1b18" />
            {/* Beads */}
            <circle cx="46" cy="102" r="5" fill="#f59e0b" />
            <circle cx="58" cy="99" r="5" fill="#10b981" />
            <circle cx="102" cy="99" r="5" fill="#ef4444" />
            <circle cx="114" cy="102" r="5" fill="#f59e0b" />
          </g>
        )}

        {customer.hair === 'locs' && (
          // Dreadlocks with cool orange backwards cap
          <g>
            {/* Cap */}
            <ellipse cx="80" cy="50" rx="42" ry="24" fill="#ea580c" />
            <path d="M42 54 C42 42, 118 42, 118 54 Z" fill="#c2410c" />
            {/* Locs falling behind */}
            <rect x="36" y="58" width="8" height="38" rx="4" fill="#1a1512" />
            <rect x="116" y="58" width="8" height="38" rx="4" fill="#1a1512" />
          </g>
        )}

        {customer.hair === 'cornrows' && (
          // Neat Cornrows with beads
          <g>
            <ellipse cx="80" cy="52" rx="42" ry="24" fill="#1e1b18" />
            <path d="M50 48 Q80 34 110 48" stroke="#12100e" strokeWidth="4" />
            <path d="M44 56 Q80 40 116 56" stroke="#12100e" strokeWidth="4" />
            <circle cx="44" cy="72" r="4" fill="#ec4899" />
            <circle cx="116" cy="72" r="4" fill="#ec4899" />
          </g>
        )}

        {/* Head / Face */}
        <circle cx="80" cy="76" r="38" fill={customer.skinTone} />

        {/* Ears */}
        <circle cx="40" cy="78" r="9" fill={customer.skinTone} />
        <circle cx="120" cy="78" r="9" fill={customer.skinTone} />
        <circle cx="40" cy="78" r="5" fill="#2a140a" fillOpacity="0.25" />
        <circle cx="120" cy="78" r="5" fill="#2a140a" fillOpacity="0.25" />

        {/* Eyes */}
        {isEating ? (
          // Happy crescent eyes when eating!
          <g>
            <path d="M62 74 Q70 66 78 74" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M82 74 Q90 66 98 74" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : isThinking ? (
          // Curious / thoughtful eyes looking up
          <g>
            <circle cx="70" cy="70" r="6" fill="#1c1917" />
            <circle cx="90" cy="70" r="6" fill="#1c1917" />
            <circle cx="72" cy="68" r="2" fill="white" />
            <circle cx="92" cy="68" r="2" fill="white" />
          </g>
        ) : (
          // Big Beaming Sparkle Eyes
          <g>
            <ellipse cx="68" cy="72" rx="7" ry="8" fill="#1c1917" />
            <ellipse cx="92" cy="72" rx="7" ry="8" fill="#1c1917" />
            {/* Sparkle highlights */}
            <circle cx="70" cy="70" r="2.5" fill="white" />
            <circle cx="94" cy="70" r="2.5" fill="white" />
            <circle cx="66" cy="74" r="1.2" fill="white" />
            <circle cx="90" cy="74" r="1.2" fill="white" />
          </g>
        )}

        {/* Cute Nose */}
        <path d="M78 82 Q80 84 82 82" stroke="#261208" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mouth */}
        {isEating ? (
          // Chomping smile with pizza in mouth
          <g>
            <path d="M66 88 Q80 106 94 88 Z" fill="#991b1b" />
            <ellipse cx="80" cy="98" rx="8" ry="4" fill="#fbbf24" /> {/* Tiny pizza bite inside */}
          </g>
        ) : isThinking ? (
          // Gentle curious smile
          <path d="M72 88 Q80 94 88 88" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        ) : (
          // Big joyous smile!
          <g>
            <path d="M66 86 Q80 102 94 86" stroke="#1c1917" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M68 87 Q80 98 92 87 Z" fill="#ffffff" />
          </g>
        )}

        {/* Cheeks / Blush */}
        <circle cx="56" cy="82" r="5" fill="#f43f5e" fillOpacity="0.25" />
        <circle cx="104" cy="82" r="5" fill="#f43f5e" fillOpacity="0.25" />

        {/* Shoulders / Shirt */}
        <path
          d="M42 118 C42 108, 60 104, 80 104 C100 104, 118 108, 118 118 L130 150 L30 150 Z"
          fill={customer.shirtColor}
        />
        {/* Shirt collar */}
        <path d="M72 104 Q80 114 88 104" stroke="white" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}

// --- Pizza Slice SVG Component ---
function PizzaSliceWidget({ sliceNumber }: { sliceNumber: number }) {
  return (
    <div className="w-14 h-16 sm:w-16 sm:h-18 relative flex items-center justify-center filter drop-shadow-md">
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Golden Baked Crust Top Arc */}
        <path
          d="M10 24 C35 12, 65 12, 90 24 L50 114 Z"
          fill="#d97706" // Crust back
        />
        <path
          d="M10 24 C35 12, 65 12, 90 24 C90 32, 10 32, 10 24 Z"
          fill="#b45309" // Crust rim
        />

        {/* Gooey Melted Cheese Base */}
        <path
          d="M14 28 C38 18, 62 18, 86 28 L50 110 Z"
          fill="#fbbf24" // Mozzarella
        />
        <path
          d="M16 32 C38 22, 62 22, 84 32 L50 108 Z"
          fill="#fef08a" // Melty highlights
        />

        {/* Pepperoni Slices */}
        <circle cx="48" cy="46" r="11" fill="#dc2626" />
        <circle cx="50" cy="48" r="9" fill="#ef4444" />
        <circle cx="34" cy="74" r="8" fill="#dc2626" />
        <circle cx="35" cy="75" r="6.5" fill="#ef4444" />
        <circle cx="64" cy="68" r="9" fill="#dc2626" />
        <circle cx="65" cy="69" r="7.5" fill="#ef4444" />

        {/* Fresh Basil Leaves */}
        <path d="M40 58 Q46 54 50 60 Q44 64 40 58 Z" fill="#15803d" />
        <path d="M54 82 Q60 78 64 84 Q58 88 54 82 Z" fill="#15803d" />

        {/* Green Bell Pepper / Topping dots */}
        <rect x="62" y="40" width="6" height="6" rx="2" fill="#16a34a" />
        <rect x="28" cy="52" width="6" height="6" rx="2" fill="#16a34a" />
      </svg>
    </div>
  );
}
