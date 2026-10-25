'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw,
  HelpCircle, CheckCircle2, Award, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, Trash2, ShieldAlert, Sparkle,
  Compass, Map, Heart, AlertTriangle, Check, Repeat, GitBranch, ShoppingBag
} from 'lucide-react';

// --- Web Audio Synthesizer (Zero External Asset Dependency) ---
class PetSoundEffects {
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

  // Playful puppy bark "Woof Woof!"
  playBark() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.14].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now + delay);
      osc.frequency.exponentialRampToValueAtTime(160, now + delay + 0.09);
      gain.gain.setValueAtTime(0.28, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.09);
    });
  }

  // Gentle kitten purr/meow
  playMeow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.linearRampToValueAtTime(740, now + 0.12);
    osc.frequency.linearRampToValueAtTime(460, now + 0.28);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Food munching crunch
  playCrunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.08, 0.16].forEach((delay, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400 - idx * 50, now + delay);
      osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.05);
      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.05);
    });
  }

  // Lullaby sleep chime
  playLullaby() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.2, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  }

  // Pleasant click/pop
  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
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

const petSounds = new PetSoundEffects();

// --- Types ---
type PetType = 'puppy' | 'kitten' | 'rabbit' | 'parrot' | 'turtle';
type LevelType =
  | 'counting'
  | 'matching'
  | 'sorting'
  | 'sequencing'
  | 'patterns'
  | 'conditionals'
  | 'loops'
  | 'debugging';

interface RescuePet {
  id: string;
  type: PetType;
  name: string;
  emoji: string;
  favoriteFood: string;
  favoriteFoodEmoji: string;
  sound: 'bark' | 'meow' | 'crunch' | 'lullaby';
}

interface PetAccessory {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  unlocked: boolean;
  description: string;
}

interface RoutineStep {
  id: string;
  action: string;
  emoji: string;
  color: string;
}

interface LevelConfig {
  level: number;
  title: string;
  topic: string;
  instruction: string;
  levelType: LevelType;
  pet: RescuePet;
  targetCount?: number;
  foodEmoji?: string;
  foodName?: string;
  matchingPairs?: { pet: RescuePet; food: { name: string; emoji: string } }[];
  sortItems?: { id: string; name: string; emoji: string; category: 'food' | 'toy' }[];
  sequenceSteps?: RoutineStep[];
  correctSequenceIds?: string[];
  buggySequence?: RoutineStep[];
  patternSequence?: string[];
  patternOptions?: { emoji: string; isCorrect: boolean }[];
  conditionRules?: { condition: string; action: string; emoji: string }[];
  loopTarget?: number;
  speechText: string;
  lizzyHint: string;
  targetExplanation: string;
}

// Available Pet Accessories in Store
const AVAILABLE_ACCESSORIES: PetAccessory[] = [
  { id: 'bowtie', name: 'Silky Red Bowtie', emoji: '🎀', cost: 80, unlocked: false, description: 'Gives any rescue pet a handsome gentleman look!' },
  { id: 'party_hat', name: 'Rainbow Party Hat', emoji: '🥳', cost: 120, unlocked: false, description: 'Ready for the rescue adoption festival!' },
  { id: 'golden_bell', name: 'Golden Bell Collar', emoji: '🔔', cost: 150, unlocked: false, description: 'Tinkles softly with every joyful step.' },
  { id: 'crown', name: 'Royal Prince Crown', emoji: '👑', cost: 200, unlocked: false, description: 'Crown your favourite pet the ruler of the shelter!' },
  { id: 'cape', name: 'Superhero Red Cape', emoji: '🦸', cost: 250, unlocked: false, description: 'For brave pets on heroic cuddle missions!' },
  { id: 'garden', name: 'Sunny Flower Bed', emoji: '🌻', cost: 300, unlocked: false, description: 'A warm outdoor spot for afternoon snoozing.' },
];

const RESCUE_PETS: Record<PetType, RescuePet> = {
  puppy: { id: 'p1', type: 'puppy', name: 'Buster', emoji: '🐶', favoriteFood: 'Bone Biscuits', favoriteFoodEmoji: '🦴', sound: 'bark' },
  kitten: { id: 'p2', type: 'kitten', name: 'Milo', emoji: '🐱', favoriteFood: 'Tasty Fish', favoriteFoodEmoji: '🐟', sound: 'meow' },
  rabbit: { id: 'p3', type: 'rabbit', name: 'Coco', emoji: '🐰', favoriteFood: 'Sweet Carrots', favoriteFoodEmoji: '🥕', sound: 'crunch' },
  parrot: { id: 'p4', type: 'parrot', name: 'Sunny', emoji: '🦜', favoriteFood: 'Sunflower Seeds', favoriteFoodEmoji: '🌻', sound: 'lullaby' },
  turtle: { id: 'p5', type: 'turtle', name: 'Shelly', emoji: '🐢', favoriteFood: 'Crisp Lettuce', favoriteFoodEmoji: '🥬', sound: 'crunch' }
};

// 8 Interactive Levels for Pet Rescue
const PET_LEVELS: LevelConfig[] = [
  // Level 1: Counting Food Items
  {
    level: 1,
    title: 'Biscuit Count',
    topic: 'Counting (1–5)',
    instruction: 'Buster the puppy is hungry! Tap the bone biscuit 4 times to put 4 biscuits into Buster’s bowl, then tap FEED BUSTER!',
    levelType: 'counting',
    pet: RESCUE_PETS.puppy,
    targetCount: 4,
    foodEmoji: '🦴',
    foodName: 'Bone Biscuit',
    speechText: 'Count 4 biscuits into Buster’s bowl, then tap Feed Buster!',
    lizzyHint: 'Tap the bone biscuit 4 times until the counter shows 4 of 4, then tap the green button to feed Buster!',
    targetExplanation: 'Counting allocates exact quantities to meet specific dietary requirements.'
  },
  // Level 2: Matching Animals with Correct Items
  {
    level: 2,
    title: 'Treat Matchmaker',
    topic: 'Relational Matching',
    instruction: 'Match each rescue pet with their favourite treat! Puppy loves Bones, Kitten loves Fish, Rabbit loves Carrots, and Parrot loves Seeds.',
    levelType: 'matching',
    pet: RESCUE_PETS.kitten,
    matchingPairs: [
      { pet: RESCUE_PETS.puppy, food: { name: 'Bone', emoji: '🦴' } },
      { pet: RESCUE_PETS.kitten, food: { name: 'Fish', emoji: '🐟' } },
      { pet: RESCUE_PETS.rabbit, food: { name: 'Carrot', emoji: '🥕' } },
      { pet: RESCUE_PETS.parrot, food: { name: 'Seeds', emoji: '🌻' } },
    ],
    speechText: 'Match each pet to the correct food treat!',
    lizzyHint: 'Puppies eat bones, kittens eat fish, bunnies eat carrots, and birds eat seeds! Tap a pet and tap its matching treat.',
    targetExplanation: 'Relational mapping connects compatible data types to proper receivers.'
  },
  // Level 3: Sorting and Classification
  {
    level: 3,
    title: 'Shelter Playroom Cleanup',
    topic: 'Sorting & Classification',
    instruction: 'Sort the items into the correct boxes! Put all FOOD TREATS into the Food Tray and all CHEW TOYS into the Toy Box.',
    levelType: 'sorting',
    pet: RESCUE_PETS.puppy,
    sortItems: [
      { id: 's1', name: 'Bone', emoji: '🦴', category: 'food' },
      { id: 's2', name: 'Tennis Ball', emoji: '🎾', category: 'toy' },
      { id: 's3', name: 'Fish Slice', emoji: '🐟', category: 'food' },
      { id: 's4', name: 'Yarn Ball', emoji: '🧶', category: 'toy' },
      { id: 's5', name: 'Fresh Carrot', emoji: '🥕', category: 'food' },
      { id: 's6', name: 'Squeak Duck', emoji: '🦆', category: 'toy' },
    ],
    speechText: 'Sort each item into Food Tray or Toy Box!',
    lizzyHint: 'Is it something pets eat or something pets play with? Tap the item, then tap the right box.',
    targetExplanation: 'Classification groups items based on common categorical attributes.'
  },
  // Level 4: Care Routines in Sequence
  {
    level: 4,
    title: 'Kitten Care Routine',
    topic: 'Sequence & Chronological Order',
    instruction: 'Milo the kitten needs bedtime care! Arrange the routine cards in proper order: [1. FOOD] → [2. WATER] → [3. SWEET NAP]!',
    levelType: 'sequencing',
    pet: RESCUE_PETS.kitten,
    sequenceSteps: [
      { id: 'step_nap', action: 'SWEET NAP', emoji: '🛏️', color: 'bg-indigo-600' },
      { id: 'step_food', action: 'GIVE FOOD', emoji: '🍲', color: 'bg-amber-600' },
      { id: 'step_water', action: 'GIVE WATER', emoji: '💧', color: 'bg-sky-600' }
    ],
    correctSequenceIds: ['step_food', 'step_water', 'step_nap'],
    speechText: 'Arrange Milo’s care routine: Food first, then Water, then Sweet Nap!',
    lizzyHint: 'Pets always eat and drink before sleeping! Arrange: 1. Give Food, 2. Give Water, 3. Sweet Nap.',
    targetExplanation: 'Step sequencing ensures operations execute in logical, cause-and-effect order.'
  },
  // Level 5: Patterns
  {
    level: 5,
    title: 'Toy Patterns',
    topic: 'Repeating Patterns (AB, AAB)',
    instruction: 'Buster is lining up his toys! Look at the pattern: [Bone, Ball, Bone, Ball...]. Which toy comes next?',
    levelType: 'patterns',
    pet: RESCUE_PETS.puppy,
    patternSequence: ['🦴', '🎾', '🦴', '🎾'],
    patternOptions: [
      { emoji: '🦴', isCorrect: true },
      { emoji: '🎾', isCorrect: false },
      { emoji: '🥕', isCorrect: false }
    ],
    speechText: 'Look at the pattern: Bone, Ball, Bone, Ball. What comes next?',
    lizzyHint: 'The rhythm goes: Bone, then Ball, then Bone, then Ball. The next toy must be Bone!',
    targetExplanation: 'Patterns repeat cyclic elements that can be predicted with inductive logic.'
  },
  // Level 6: Introduce IF/THEN Rules
  {
    level: 6,
    title: 'Smart Pet Care Rules',
    topic: 'Conditional Logic (IF / THEN)',
    instruction: 'Build a smart care rule! Select: [IF PET IS HUNGRY] → [GIVE FOOD], and [IF PET IS TIRED] → [LET PET SLEEP]. Then tap ACTIVATE!',
    levelType: 'conditionals',
    pet: RESCUE_PETS.rabbit,
    conditionRules: [
      { condition: 'IF PET IS HUNGRY', action: 'GIVE FOOD', emoji: '🍲' },
      { condition: 'IF PET IS TIRED', action: 'LET PET SLEEP', emoji: '🛏️' },
      { condition: 'IF PET IS PLAYFUL', action: 'THROW BALL', emoji: '🎾' }
    ],
    speechText: 'Build smart conditional rules to care for your hungry and sleepy pets!',
    lizzyHint: 'Tap "IF PET IS HUNGRY → GIVE FOOD", and "IF PET IS TIRED → LET PET SLEEP", then activate the rule!',
    targetExplanation: 'Conditional statements trigger specific actions based on real-time state evaluation.'
  },
  // Level 7: Introduce Loops
  {
    level: 7,
    title: 'Feeding Loops',
    topic: 'Loop Automation (REPEAT 3 TIMES)',
    instruction: 'Coco the rabbit wants 3 crunchy carrots! Use a smart loop: tap [REPEAT 3 TIMES] → [GIVE 1 CARROT], then tap RUN LOOP!',
    levelType: 'loops',
    pet: RESCUE_PETS.rabbit,
    loopTarget: 3,
    foodEmoji: '🥕',
    foodName: 'Carrot',
    speechText: 'Use a loop to give Coco 3 carrots in one smart automated command!',
    lizzyHint: 'Tap the purple REPEAT 3 TIMES block, then tap RUN LOOP. Coco will get all 3 carrots!',
    targetExplanation: 'Loops execute repeated actions with concise, non-redundant instructions.'
  },
  // Level 8: Debug a Pet-Care Routine
  {
    level: 8,
    title: 'Routine Detective',
    topic: 'Debugging Muddled Routines',
    instruction: 'Oh no! The routine is mixed up: [1. NAP] → [2. FOOD] → [3. WATER]! Fix it so Milo eats and drinks before his sweet nap!',
    levelType: 'debugging',
    pet: RESCUE_PETS.kitten,
    buggySequence: [
      { id: 'step_nap', action: 'SWEET NAP (BUG!)', emoji: '🛏️', color: 'bg-rose-600' },
      { id: 'step_food', action: 'GIVE FOOD', emoji: '🍲', color: 'bg-amber-600' },
      { id: 'step_water', action: 'GIVE WATER', emoji: '💧', color: 'bg-sky-600' }
    ],
    correctSequenceIds: ['step_food', 'step_water', 'step_nap'],
    speechText: 'Find and fix the bug in Milo’s routine so Milo eats before sleeping!',
    lizzyHint: 'Tap the swap buttons to move SWEET NAP to the end (Step 3) and FOOD to the beginning (Step 1)!',
    targetExplanation: 'Debugging refactors erroneous sequences to ensure proper execution outcomes.'
  }
];

export default function PetRescue({ initialLevel }: { initialLevel?: number } = {}) {
  const router = useRouter();

  // Level State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(
    initialLevel ? Math.max(0, Math.min(PET_LEVELS.length - 1, initialLevel - 1)) : 0
  );
  const currentLevel = PET_LEVELS[currentLevelIdx] || PET_LEVELS[0];

  // Pet Interactive State
  const [petMood, setPetMood] = useState<'neutral' | 'happy' | 'eating' | 'sleeping'>('neutral');
  const [happinessPercent, setHappinessPercent] = useState(20);
  const [showHearts, setShowHearts] = useState(false);

  // Level 1 (Counting) State
  const [bowlCount, setBowlCount] = useState(0);

  // Level 2 (Matching) State
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [matchedPetIds, setMatchedPetIds] = useState<string[]>([]);

  // Level 3 (Sorting) State
  const [remainingSortItems, setRemainingSortItems] = useState(currentLevel.sortItems || []);
  const [foodBasket, setFoodBasket] = useState<any[]>([]);
  const [toyBasket, setToyBasket] = useState<any[]>([]);
  const [selectedSortItem, setSelectedSortItem] = useState<any | null>(null);

  // Level 4 & 8 (Sequencing / Debugging) State
  const [currentSequence, setCurrentSequence] = useState<RoutineStep[]>([]);

  // Level 5 (Patterns) State
  const [patternAnswers, setPatternAnswers] = useState<string[]>([]);
  const [patternSolved, setPatternSolved] = useState(false);

  // Level 6 (Conditionals) State
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Level 7 (Loops) State
  const [loopExecuting, setLoopExecuting] = useState(false);
  const [carrotsGiven, setCarrotsGiven] = useState(0);

  // Gamification & Progress State
  const [dolaCoins, setDolaCoins] = useState(140);
  const [xp, setXp] = useState(300);
  const [happinessPoints, setHappinessPoints] = useState(220);
  const [stars, setStars] = useState(3);
  const [petsHelpedCount, setPetsHelpedCount] = useState(0);
  const [accessories, setAccessories] = useState<PetAccessory[]>(AVAILABLE_ACCESSORIES);
  const [activeAccessory, setActiveAccessory] = useState<string | null>('bowtie');
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['Pet Helper']);

  // Analytics Metrics
  const [attempts, setAttempts] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Modals & Feedback
  const [showLevelSuccess, setShowLevelSuccess] = useState(false);
  const [showFinaleModal, setShowFinaleModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [lizzyMessage, setLizzyMessage] = useState<string | null>(null);

  // Sound and Speech
  const [isMuted, setIsMuted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Fetch initial progress from Backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:8000/api/pet-rescue/progress/', {
          headers: { Authorization: `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.progress) {
            const p = data.progress;
            setDolaCoins(p.dola_coins || 140);
            setXp(p.xp_earned || 300);
            setHappinessPoints(p.happiness_points || 220);
            setPetsHelpedCount(p.pets_helped || 0);
            setEarnedBadges(p.badges || ['Pet Helper']);

            if (p.unlocked_accessories && Array.isArray(p.unlocked_accessories)) {
              setAccessories(prev =>
                prev.map(a => ({ ...a, unlocked: a.unlocked || p.unlocked_accessories.includes(a.id) }))
              );
            }
          }
        }
      } catch (err) {
        console.warn('PetRescue: Unable to load backend progress:', err);
      }
    };
    fetchProgress();
  }, []);

  // Read Aloud Helper with Web Speech API
  const speakText = useCallback((text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.15;
      window.speechSynthesis.speak(utterance);
    }
  }, [isMuted]);

  // Initialize current level
  const initLevel = useCallback((lvlIdx: number) => {
    const lvl = PET_LEVELS[lvlIdx] || PET_LEVELS[0];
    setPetMood('neutral');
    setHappinessPercent(25);
    setShowHearts(false);
    setShowLevelSuccess(false);
    setShowFinaleModal(false);
    setLizzyMessage(null);

    // Reset Level Specific State
    setBowlCount(0);
    setSelectedPetId(null);
    setMatchedPetIds([]);

    if (lvl.sortItems) {
      setRemainingSortItems([...lvl.sortItems]);
      setFoodBasket([]);
      setToyBasket([]);
      setSelectedSortItem(null);
    }

    if (lvl.levelType === 'debugging' && lvl.buggySequence) {
      setCurrentSequence([...lvl.buggySequence]);
    } else if (lvl.sequenceSteps) {
      setCurrentSequence([...lvl.sequenceSteps]);
    }

    setPatternAnswers([]);
    setPatternSolved(false);
    setSelectedConditions([]);
    setLoopExecuting(false);
    setCarrotsGiven(0);

    setTimeout(() => {
      speakText(lvl.speechText);
    }, 350);
  }, [speakText]);

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx, initLevel]);

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    petSounds.muted = nextMuted;
    if (nextMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Trigger Win Celebration
  const triggerWin = () => {
    petSounds.playSuccess();
    setPetMood('happy');
    setHappinessPercent(100);
    setShowHearts(true);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    const bonusPoints = 120 + currentLevel.level * 20;
    const bonusCoins = 20;
    const bonusXp = 50;

    setHappinessPoints(hp => hp + bonusPoints);
    setDolaCoins(dc => dc + bonusCoins);
    setXp(x => x + bonusXp);
    setPetsHelpedCount(p => p + 1);

    // Award Badges
    const newBadges = [...earnedBadges];
    if (currentLevel.level >= 1 && !newBadges.includes('Pet Helper')) newBadges.push('Pet Helper');
    if (currentLevel.level >= 2 && !newBadges.includes('Animal Friend')) newBadges.push('Animal Friend');
    if (currentLevel.level >= 5 && !newBadges.includes('Pattern Star')) newBadges.push('Pattern Star');
    if (currentLevel.level >= 4 && !newBadges.includes('Care Champion')) newBadges.push('Care Champion');
    if (currentLevel.level >= 6 && !newBadges.includes('Pet Coder')) newBadges.push('Pet Coder');
    setEarnedBadges(newBadges);

    saveProgressToBackend(bonusCoins, bonusPoints, currentLevel.level, newBadges);

    setTimeout(() => {
      if (currentLevel.level === PET_LEVELS.length) {
        setShowFinaleModal(true);
      } else {
        setShowLevelSuccess(true);
      }
    }, 1200);
  };

  // Save Progress to Backend API
  const saveProgressToBackend = async (
    bonusCoins: number,
    bonusPoints: number,
    levelCompleted: number,
    badgesList: string[]
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);
      const payload = {
        current_level: levelCompleted + 1,
        stars_earned: stars,
        dola_coins: dolaCoins + bonusCoins,
        xp_earned: xp + 50,
        happiness_points: happinessPoints + bonusPoints,
        accuracy: 95.0,
        attempts: attempts,
        pets_helped: petsHelpedCount + 1,
        counting_accuracy: 100.0,
        classification_accuracy: 100.0,
        sequence_accuracy: 100.0,
        pattern_accuracy: 100.0,
        condition_usage: 100.0,
        loops_completed: currentLevel.levelType === 'loops' ? 1 : 0,
        debugging_accuracy: 100.0,
        hints_used: hintsUsed,
        time_spent_seconds: durationSec,
        unlocked_pets: ['puppy', 'kitten', 'rabbit', 'parrot', 'turtle'],
        unlocked_accessories: accessories.filter(a => a.unlocked).map(a => a.id),
        badges: badgesList
      };

      await fetch('http://localhost:8000/api/pet-rescue/save-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('PetRescue: Failed to save progress:', err);
    }
  };

  // Level 1: Add Biscuit to Bowl
  const handleAddBiscuit = () => {
    petSounds.playPop();
    const nextCount = bowlCount + 1;
    setBowlCount(nextCount);
    setHappinessPercent(Math.min(90, 25 + nextCount * 15));
  };

  const handleFeedPuppy = () => {
    if (bowlCount === currentLevel.targetCount) {
      petSounds.playCrunch();
      petSounds.playBark();
      setPetMood('eating');
      triggerWin();
    } else {
      petSounds.playPop();
      const hint = bowlCount < (currentLevel.targetCount || 4)
        ? `Buster still needs ${ (currentLevel.targetCount || 4) - bowlCount } more biscuits!`
        : `That’s a few too many biscuits! Buster needs exactly ${currentLevel.targetCount}.`;
      setLizzyMessage(hint);
      speakText(hint);
    }
  };

  // Level 2: Matching Pet & Treat
  const handleSelectMatchingFood = (foodName: string) => {
    petSounds.playPop();
    if (!selectedPetId) {
      setLizzyMessage('Tap on a pet first, then tap its matching treat!');
      return;
    }

    const pair = currentLevel.matchingPairs?.find(p => p.pet.id === selectedPetId);
    if (pair && pair.food.name === foodName) {
      petSounds.playBark();
      const nextMatched = [...matchedPetIds, selectedPetId];
      setMatchedPetIds(nextMatched);
      setSelectedPetId(null);
      setHappinessPercent(25 + nextMatched.length * 20);

      if (nextMatched.length === (currentLevel.matchingPairs?.length || 4)) {
        triggerWin();
      }
    } else {
      setLizzyMessage('Oops! That pet prefers a different treat. Try again!');
      speakText('Try another treat for this pet!');
    }
  };

  // Level 3: Sorting into Basket
  const handleSortItem = (basketType: 'food' | 'toy') => {
    if (!selectedSortItem) return;
    petSounds.playPop();

    if (selectedSortItem.category === basketType) {
      if (basketType === 'food') {
        setFoodBasket(prev => [...prev, selectedSortItem]);
      } else {
        setToyBasket(prev => [...prev, selectedSortItem]);
      }

      const nextRemaining = remainingSortItems.filter(item => item.id !== selectedSortItem.id);
      setRemainingSortItems(nextRemaining);
      setSelectedSortItem(null);
      setHappinessPercent(25 + (6 - nextRemaining.length) * 12);

      if (nextRemaining.length === 0) {
        petSounds.playBark();
        triggerWin();
      }
    } else {
      const hint = `Oops! ${selectedSortItem.name} belongs in the ${selectedSortItem.category === 'food' ? 'Food Tray' : 'Toy Box'}!`;
      setLizzyMessage(hint);
      speakText(hint);
    }
  };

  // Level 4 & 8: Move Sequence Step
  const handleMoveStep = (fromIdx: number, toIdx: number) => {
    petSounds.playPop();
    const newSeq = [...currentSequence];
    const [moved] = newSeq.splice(fromIdx, 1);
    newSeq.splice(toIdx, 0, moved);
    setCurrentSequence(newSeq);
  };

  const handleRunSequence = () => {
    const isCorrect = currentSequence.every(
      (step, idx) => step.id === currentLevel.correctSequenceIds?.[idx]
    );

    if (isCorrect) {
      petSounds.playMeow();
      petSounds.playLullaby();
      setPetMood('happy');
      triggerWin();
    } else {
      const hint = 'Not quite in the right order! Pets should eat and drink before sleeping.';
      setLizzyMessage(hint);
      speakText(hint);
    }
  };

  // Level 5: Patterns
  const handleSelectPatternOption = (emoji: string, isCorrect: boolean) => {
    petSounds.playPop();
    if (isCorrect) {
      setPatternAnswers([emoji]);
      setPatternSolved(true);
      petSounds.playBark();
      triggerWin();
    } else {
      const hint = 'Look closely at the pattern rhythm: Bone, Ball, Bone, Ball... What comes next?';
      setLizzyMessage(hint);
      speakText(hint);
    }
  };

  // Level 6: Conditionals
  const toggleCondition = (ruleKey: string) => {
    petSounds.playPop();
    if (selectedConditions.includes(ruleKey)) {
      setSelectedConditions(prev => prev.filter(k => k !== ruleKey));
    } else {
      setSelectedConditions(prev => [...prev, ruleKey]);
    }
  };

  const handleActivateConditions = () => {
    if (selectedConditions.includes('IF PET IS HUNGRY') && selectedConditions.includes('IF PET IS TIRED')) {
      petSounds.playCrunch();
      petSounds.playLullaby();
      triggerWin();
    } else {
      const hint = 'Select both smart rules: IF PET IS HUNGRY and IF PET IS TIRED!';
      setLizzyMessage(hint);
      speakText(hint);
    }
  };

  // Level 7: Loops
  const handleRunLoop = async () => {
    setLoopExecuting(true);
    petSounds.playPop();

    for (let i = 1; i <= 3; i++) {
      setCarrotsGiven(i);
      petSounds.playCrunch();
      setHappinessPercent(30 + i * 23);
      await new Promise(r => setTimeout(r, 700));
    }

    setLoopExecuting(false);
    triggerWin();
  };

  // Buy Accessory in Store
  const buyAccessory = (acc: PetAccessory) => {
    if (happinessPoints >= acc.cost && !acc.unlocked) {
      petSounds.playCoin();
      confetti({ particleCount: 30, spread: 50 });
      setHappinessPoints(hp => hp - acc.cost);
      setAccessories(prev =>
        prev.map(a => (a.id === acc.id ? { ...a, unlocked: true } : a))
      );
      setActiveAccessory(acc.id);
    }
  };

  // Jump to Specific Level
  const jumpToLevel = (levelIndex: number) => {
    petSounds.playPop();
    setCurrentLevelIdx(levelIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-50 text-slate-900 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* --- Top Navigation Bar --- */}
      <header className="bg-white/90 backdrop-blur border-b border-rose-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/stage1')}
            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-xs font-bold text-rose-900 transition-all flex items-center gap-1.5 border border-rose-300"
          >
            <Map className="w-4 h-4 text-rose-600" />
            <span>Stage 1 Map</span>
          </button>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-base font-black text-rose-600 flex items-center gap-1.5">
              <span>🐾 Pet Rescue Centre</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 font-bold border border-rose-300">
                Part 14 • Lvl {currentLevel.level}/8
              </span>
            </h1>
            <p className="text-xs text-slate-500">{currentLevel.title} — {currentLevel.topic}</p>
          </div>
        </div>

        {/* Level Quick Selector Pills */}
        <div className="hidden md:flex items-center gap-1 bg-rose-100/60 p-1 rounded-2xl border border-rose-200">
          {PET_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.level}
              onClick={() => jumpToLevel(idx)}
              className={`w-7 h-7 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                currentLevelIdx === idx
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-white'
              }`}
              title={`Level ${lvl.level}: ${lvl.title}`}
            >
              {lvl.level}
            </button>
          ))}
        </div>

        {/* Gamification Stats Deck */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
          {/* Happiness Points */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-100 border border-pink-300 text-pink-700">
            <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
            <span>{happinessPoints}</span>
            <span className="hidden md:inline text-[10px] text-pink-500 font-normal">PTS</span>
          </div>

          {/* DolaCoins */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-800">
            <span className="text-sm">🪙</span>
            <span>{dolaCoins}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{xp} XP</span>
          </div>

          {/* Pet Store Button */}
          <button
            onClick={() => setShowStoreModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold transition-all shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Store</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => {
              petSounds.playPop();
              setShowHelpGuide(true);
            }}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 transition-all border border-slate-200"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4 text-sky-500" />
          </button>

          {/* Audio Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-white border-slate-200 text-emerald-600'
            }`}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Level Tabs */}
      <div className="md:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-white/70 border-b border-rose-200 overflow-x-auto">
        {PET_LEVELS.map((lvl, idx) => (
          <button
            key={lvl.level}
            onClick={() => jumpToLevel(idx)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentLevelIdx === idx
                ? 'bg-rose-500 text-white font-black'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            L{lvl.level}
          </button>
        ))}
      </div>

      {/* --- Main Interactive Stage --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
        
        {/* Left Column: Interactive Rescue Animal Nursery Room */}
        <div className="flex-1 flex flex-col gap-3">
          
          {/* Mission Instruction Card */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-4 shadow-sm flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-center text-2xl shrink-0">
                {currentLevel.pet.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600">Mission {currentLevel.level}</span>
                  <span className="text-[11px] text-slate-400">• {currentLevel.topic}</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-slate-800 mt-0.5 leading-snug">
                  {currentLevel.instruction}
                </p>
              </div>
            </div>

            <button
              onClick={() => speakText(currentLevel.speechText)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all shrink-0 border border-rose-200"
              title="Read instruction aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Nursery Room Canvas */}
          <div className="flex-1 min-h-[360px] sm:min-h-[420px] bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 border-4 border-white rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col items-center justify-between shadow-lg">
            
            {/* Floating Hearts Celebration */}
            {showHearts && (
              <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                <span className="text-4xl animate-bounce duration-700">💖</span>
                <span className="text-5xl animate-bounce duration-1000 delay-100">💕</span>
                <span className="text-4xl animate-bounce duration-500 delay-200">🥰</span>
              </div>
            )}

            {/* Room Banner & Happiness Meter */}
            <div className="w-full flex items-center justify-between z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur border border-rose-200 shadow-xs">
                <span className="text-base">🏡</span>
                <span className="text-xs font-bold text-slate-700">Rescue Nursery</span>
              </div>

              {/* Happiness Meter */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/90 backdrop-blur border border-pink-200 shadow-xs">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-pulse" />
                <div className="w-24 sm:w-32 bg-pink-100 rounded-full h-3 overflow-hidden border border-pink-200">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-rose-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${happinessPercent}%` }}
                  ></div>
                </div>
                <span className="text-[11px] font-black text-pink-700">{happinessPercent}%</span>
              </div>
            </div>

            {/* Center Animal Presentation */}
            <div className="flex flex-col items-center justify-center my-auto z-10 relative">
              {/* Pet Accessory Overlay */}
              {activeAccessory && (
                <div className="absolute -top-6 text-3xl animate-bounce">
                  {accessories.find(a => a.id === activeAccessory)?.emoji}
                </div>
              )}

              {/* Large Animated Cartoon Pet Character */}
              <div className={`text-7xl sm:text-8xl transition-all duration-300 filter drop-shadow-lg ${
                petMood === 'happy' ? 'animate-bounce scale-110' : petMood === 'eating' ? 'animate-pulse' : ''
              }`}>
                {currentLevel.pet.emoji}
              </div>

              {/* Pet Name & Status Badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-xs font-black text-slate-800 shadow-xs">
                  {currentLevel.pet.name} the {currentLevel.pet.type}
                </span>
                {petMood === 'eating' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold animate-pulse">
                    Yummy!
                  </span>
                )}
                {petMood === 'happy' && (
                  <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-bold">
                    Super Happy!
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Nursery Floor Elements */}
            <div className="w-full flex items-center justify-around z-10 pt-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl">🍲</span>
                <span className="text-[10px] font-bold text-slate-500">Food Bowl</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl">💧</span>
                <span className="text-[10px] font-bold text-slate-500">Fresh Water</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl">🛏️</span>
                <span className="text-[10px] font-bold text-slate-500">Cozy Bed</span>
              </div>
            </div>

            {/* Gentle Lizzy Tip Banner */}
            {lizzyMessage && (
              <div className="absolute bottom-3 inset-x-4 z-20 bg-white/95 border-2 border-rose-300 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3 animate-slide-up">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-lg shrink-0">
                    🤖
                  </div>
                  <p className="text-xs font-bold text-slate-800">{lizzyMessage}</p>
                </div>
                <button
                  onClick={() => setLizzyMessage(null)}
                  className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shrink-0"
                >
                  OK!
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive Level Task Deck */}
        <div className="w-full lg:w-96 flex flex-col gap-3">
          
          {/* Deck Header */}
          <div className="bg-white border-2 border-rose-200 rounded-3xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📋</span>
              <h2 className="text-sm font-extrabold text-slate-900">Pet Care Activity</h2>
            </div>
            <button
              onClick={() => initLevel(currentLevelIdx)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all text-xs"
              title="Reset level"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Play Arena By Level Type */}
          <div className="flex-1 bg-white border-2 border-rose-200 rounded-3xl p-4 shadow-sm flex flex-col justify-between gap-4">
            
            {/* --- Level 1: Counting Food Items --- */}
            {currentLevel.levelType === 'counting' && (
              <div className="flex flex-col items-center justify-between h-full gap-4">
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biscuits in Bowl</span>
                  <div className="text-3xl font-black text-rose-600 mt-1">
                    {bowlCount} / {currentLevel.targetCount}
                  </div>
                </div>

                {/* Feeding Bowl Graphic */}
                <div className="w-full bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-2 min-h-[90px]">
                  {bowlCount === 0 ? (
                    <span className="text-xs text-slate-400 font-semibold italic">Bowl is empty! Tap biscuit below.</span>
                  ) : (
                    [...Array(bowlCount)].map((_, i) => (
                      <span key={i} className="text-3xl animate-scale-up">
                        {currentLevel.foodEmoji}
                      </span>
                    ))
                  )}
                </div>

                {/* Tap to Add Biscuit */}
                <button
                  onClick={handleAddBiscuit}
                  className="w-full py-4 rounded-2xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 text-amber-900 font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <span className="text-2xl">{currentLevel.foodEmoji}</span>
                  <span>TAP TO ADD BISCUIT (+1)</span>
                </button>

                {/* Feed Pet CTA */}
                <button
                  onClick={handleFeedPuppy}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition-all active:scale-98"
                >
                  FEED BUSTER NOW!
                </button>
              </div>
            )}

            {/* --- Level 2: Matching Animals with Items --- */}
            {currentLevel.levelType === 'matching' && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500">1. Select a Pet:</span>
                <div className="grid grid-cols-2 gap-2">
                  {currentLevel.matchingPairs?.map(pair => {
                    const isMatched = matchedPetIds.includes(pair.pet.id);
                    const isSelected = selectedPetId === pair.pet.id;
                    return (
                      <button
                        key={pair.pet.id}
                        disabled={isMatched}
                        onClick={() => {
                          petSounds.playPop();
                          setSelectedPetId(pair.pet.id);
                        }}
                        className={`p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 font-bold text-xs ${
                          isMatched
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 opacity-60'
                            : isSelected
                            ? 'bg-rose-100 border-rose-500 text-rose-900 shadow-sm scale-102'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-2xl">{pair.pet.emoji}</span>
                        <span>{pair.pet.name}</span>
                        {isMatched && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto" />}
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-bold text-slate-500 mt-2">2. Match with Favourite Treat:</span>
                <div className="grid grid-cols-2 gap-2">
                  {['Bone', 'Fish', 'Carrot', 'Seeds'].map(foodName => {
                    const emoji = foodName === 'Bone' ? '🦴' : foodName === 'Fish' ? '🐟' : foodName === 'Carrot' ? '🥕' : '🌻';
                    return (
                      <button
                        key={foodName}
                        onClick={() => handleSelectMatchingFood(foodName)}
                        className="p-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-900 font-black text-xs flex items-center gap-2 shadow-xs transition-all active:scale-95"
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span>{foodName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Level 3: Sorting and Classification --- */}
            {currentLevel.levelType === 'sorting' && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-500">Tap an item to sort:</span>
                <div className="flex flex-wrap gap-2 min-h-[50px] p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {remainingSortItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        petSounds.playPop();
                        setSelectedSortItem(item);
                      }}
                      className={`p-2 rounded-xl border-2 flex items-center gap-1.5 text-xs font-bold transition-all ${
                        selectedSortItem?.id === item.id
                          ? 'bg-rose-100 border-rose-500 shadow-sm scale-105'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-2">
                  {/* Food Basket */}
                  <button
                    onClick={() => handleSortItem('food')}
                    className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 flex flex-col items-center gap-1 shadow-xs transition-all active:scale-98"
                  >
                    <span className="text-2xl">🍲</span>
                    <span className="text-xs font-black uppercase">Food Tray</span>
                    <span className="text-[10px] text-amber-700">{foodBasket.length} sorted</span>
                  </button>

                  {/* Toy Basket */}
                  <button
                    onClick={() => handleSortItem('toy')}
                    className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-300 text-indigo-900 flex flex-col items-center gap-1 shadow-xs transition-all active:scale-98"
                  >
                    <span className="text-2xl">🧸</span>
                    <span className="text-xs font-black uppercase">Toy Box</span>
                    <span className="text-[10px] text-indigo-700">{toyBasket.length} sorted</span>
                  </button>
                </div>
              </div>
            )}

            {/* --- Level 4 & 8: Routine Sequencing & Debugging --- */}
            {(currentLevel.levelType === 'sequencing' || currentLevel.levelType === 'debugging') && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-500">Arrange steps in proper order (Step 1 to 3):</span>
                <div className="space-y-2">
                  {currentSequence.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-2.5 rounded-2xl text-white font-bold text-xs shadow-xs ${step.color}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-black/25 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="text-lg">{step.emoji}</span>
                        <span>{step.action}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {idx > 0 && (
                          <button
                            onClick={() => handleMoveStep(idx, idx - 1)}
                            className="p-1 rounded bg-black/20 hover:bg-black/30"
                            title="Move Up"
                          >
                            ▲
                          </button>
                        )}
                        {idx < currentSequence.length - 1 && (
                          <button
                            onClick={() => handleMoveStep(idx, idx + 1)}
                            className="p-1 rounded bg-black/20 hover:bg-black/30"
                            title="Move Down"
                          >
                            ▼
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRunSequence}
                  className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-md transition-all active:scale-98"
                >
                  START CARE ROUTINE!
                </button>
              </div>
            )}

            {/* --- Level 5: Patterns --- */}
            {currentLevel.levelType === 'patterns' && (
              <div className="flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toy Pattern Rhythm</span>
                
                {/* Pattern Row */}
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300">
                  {currentLevel.patternSequence?.map((emoji, i) => (
                    <span key={i} className="text-3xl p-1 bg-white rounded-xl shadow-xs border border-amber-200">
                      {emoji}
                    </span>
                  ))}
                  <span className="text-2xl w-10 h-10 flex items-center justify-center bg-rose-100 rounded-xl border-2 border-rose-400 text-rose-600 font-black animate-pulse">
                    {patternSolved ? patternAnswers[0] : '?'}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-600">Which toy comes next?</span>
                <div className="flex items-center gap-3">
                  {currentLevel.patternOptions?.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectPatternOption(opt.emoji, opt.isCorrect)}
                      className="w-14 h-14 rounded-2xl bg-white hover:bg-rose-50 border-2 border-slate-200 hover:border-rose-300 text-3xl flex items-center justify-center shadow-xs transition-all active:scale-90"
                    >
                      {opt.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- Level 6: Conditionals --- */}
            {currentLevel.levelType === 'conditionals' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-slate-500">Tap to activate smart rules:</span>
                <div className="space-y-2">
                  {currentLevel.conditionRules?.map(rule => {
                    const isSelected = selectedConditions.includes(rule.condition);
                    return (
                      <button
                        key={rule.condition}
                        onClick={() => toggleCondition(rule.condition)}
                        className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-xs font-bold ${
                          isSelected
                            ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{rule.emoji}</span>
                          <span>{rule.condition} → {rule.action}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleActivateConditions}
                  className="mt-3 w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-md transition-all active:scale-98"
                >
                  ACTIVATE SMART CARE!
                </button>
              </div>
            )}

            {/* --- Level 7: Loops --- */}
            {currentLevel.levelType === 'loops' && (
              <div className="flex flex-col items-center justify-between h-full gap-4">
                <div className="w-full p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-purple-900 font-black text-sm">
                    <Repeat className="w-4 h-4 text-purple-600 animate-spin" />
                    <span>REPEAT 3 TIMES:</span>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-xl border border-purple-200 text-xs font-bold text-purple-800 flex items-center gap-2 shadow-xs">
                    <span className="text-xl">🥕</span>
                    <span>GIVE 1 CARROT TO COCO</span>
                  </div>
                </div>

                {/* Carrots Eaten Counter */}
                <div className="flex items-center gap-2">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                        idx < carrotsGiven
                          ? 'bg-amber-100 border-amber-400 scale-105'
                          : 'bg-slate-100 border-slate-200 opacity-40'
                      }`}
                    >
                      🥕
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleRunLoop}
                  disabled={loopExecuting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  {loopExecuting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Looping...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>RUN AUTOMATED LOOP!</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Controller Tip Card */}
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2 text-xs text-rose-900">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-700">Caretaker Tip: </span>
                <span>{currentLevel.lizzyHint}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- LEVEL COMPLETE CELEBRATION MODAL --- */}
      {showLevelSuccess && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-rose-300 rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            
            {/* Stars Animation */}
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-100" />
              <Star className="w-10 h-10 fill-amber-400 animate-bounce delay-200" />
              <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-300" />
            </div>

            <h3 className="text-2xl font-black text-rose-600">
              PET RESCUED &amp; HAPPY!
            </h3>
            <p className="text-xs text-slate-500 mt-1">Level {currentLevel.level} Complete: {currentLevel.title}</p>

            {/* Rewards Breakdown */}
            <div className="grid grid-cols-3 gap-3 my-5 w-full">
              <div className="bg-pink-50 border border-pink-200 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">💖</span>
                <span className="text-xs font-black text-pink-700">+{120 + currentLevel.level * 20}</span>
                <span className="text-[10px] text-pink-500">Love Pts</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">🪙</span>
                <span className="text-xs font-black text-amber-700">+20</span>
                <span className="text-[10px] text-amber-500">Coins</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">⭐</span>
                <span className="text-xs font-black text-emerald-700">+50</span>
                <span className="text-[10px] text-emerald-500">XP</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
              🐾 <strong>What you learned:</strong> {currentLevel.targetExplanation}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => {
                  petSounds.playPop();
                  if (currentLevelIdx < PET_LEVELS.length - 1) {
                    setCurrentLevelIdx(c => c + 1);
                  } else {
                    router.push('/stage1');
                  }
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>NEXT MISSION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => initLevel(currentLevelIdx)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={() => router.push('/stage1')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5 text-rose-500" />
                  <span>Map</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-500" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FINALE MODAL (Level 8 Complete) --- */}
      {showFinaleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-4 border-amber-300 rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl mb-3 shadow-sm">
              🏆
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-amber-600">
              MASTER PET RESCUER!
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm">
              Incredible caring heart! You fed, sorted, scheduled routines, and automated care rules for all animals in the rescue centre!
            </p>

            {/* Badges Display */}
            <div className="my-5 w-full bg-amber-50 border border-amber-200 rounded-2xl p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Earned Pet Care Badges
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {earnedBadges.map(badge => (
                  <span
                    key={badge}
                    className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <span>🎖️</span>
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={() => router.push('/stage1')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Map className="w-4 h-4" />
                <span>RETURN TO STAGE 1 MAP</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => initLevel(currentLevelIdx)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-500" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PET STORE & ACCESSORIES MODAL --- */}
      {showStoreModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 rounded-[2.5rem] p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">Pet Boutique &amp; Nursery Store</h3>
                  <p className="text-xs text-slate-500">Dress up your rescue pets with love points!</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-100 text-pink-700 text-xs font-bold">
                <span>{happinessPoints} Pts</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {accessories.map(acc => (
                <div
                  key={acc.id}
                  className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{acc.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{acc.name}</p>
                      <p className="text-[11px] text-slate-500">{acc.description}</p>
                    </div>
                  </div>

                  {acc.unlocked ? (
                    <button
                      onClick={() => setActiveAccessory(acc.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeAccessory === acc.id
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {activeAccessory === acc.id ? 'Wearing' : 'Wear'}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyAccessory(acc)}
                      disabled={happinessPoints < acc.cost}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        happinessPoints >= acc.cost
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {acc.cost} Pts
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowStoreModal(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Close Boutique
            </button>
          </div>
        </div>
      )}

      {/* --- HOW TO PLAY GUIDE MODAL --- */}
      {showHelpGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-300 rounded-[2.5rem] p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐾</span>
              <h3 className="text-base font-bold text-slate-900">How to Play Pet Rescue</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <span className="text-base">🦴</span>
                <p><strong>Counting Food:</strong> Count biscuits or carrots into the bowls to fill hungry tummies.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <span className="text-base">🐶</span>
                <p><strong>Matching:</strong> Learn what each animal eats (puppy bones, kitten fish, bunny carrots, bird seeds).</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <span className="text-base">📋</span>
                <p><strong>Routines:</strong> Put daily care steps in order: food and water first, then peaceful nap time!</p>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2">
                <span className="text-base">💻</span>
                <p><strong>Coding Logic:</strong> Use IF/THEN condition rules and loops to automate animal care like a true coder!</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all"
            >
              Got it, let’s care for pets!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
