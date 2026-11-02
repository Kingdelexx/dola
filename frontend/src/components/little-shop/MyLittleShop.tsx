'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw, 
  HelpCircle, CheckCircle2, Award, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, Trash2, ShoppingBag, Store, Coins,
  Plus, Minus, ArrowLeft, Home, Map, Heart, Check, Sparkle, Tag
} from 'lucide-react';
import { speakFemale, stopSpeech } from '@/lib/speech';

// --- Web Audio Synthesizer (Zero Audio Asset Dependency) ---
class ShopSoundEffects {
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

  // Cash Register "Cha-Ching!"
  playCashRegister() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // High cheerful bell ring (E6)
    const bellOsc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(1318.5, now);
    bellGain.gain.setValueAtTime(0.3, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    bellOsc.connect(bellGain);
    bellGain.connect(this.ctx.destination);
    bellOsc.start(now);
    bellOsc.stop(now + 0.5);

    // Cash drawer slide noise
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now + 0.05);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now + 0.05);
  }

  // Metallic Coin Clink
  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Item pickup pop
  playItemPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Paper Naira note placement
  playNote() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Gentle soft error tone (not harsh)
  playGentleOops() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Victory fanfare
  playVictory() {
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
      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.4);
    });
  }
}

const sounds = new ShopSoundEffects();

// --- Speech Synthesis Helper (Female Voice) ---
function speakText(text: string, enabled: boolean) {
  speakFemale(text, {
    enabled,
    rate: 0.95,
    pitch: 1.15,
  });
}

// --- Customer Definitions ---
export interface ShopCustomer {
  id: string;
  name: string;
  avatarEmoji: string;
  greeting: string;
  speechPitch: number;
}

const CUSTOMERS: ShopCustomer[] = [
  { id: 'amara', name: 'Amara', avatarEmoji: '👧🏾', greeting: 'Hello Shopkeeper! Good day!', speechPitch: 1.2 },
  { id: 'kofi', name: 'Kofi', avatarEmoji: '👦🏾', greeting: 'Hi there! I came to buy some treats!', speechPitch: 1.0 },
  { id: 'zola', name: 'Zola', avatarEmoji: '👧🏿', greeting: 'Good morning! What a colourful shop!', speechPitch: 1.25 },
  { id: 'ade', name: 'Ade', avatarEmoji: '👦🏽', greeting: 'Hey friend! Hope your shop is having a busy day!', speechPitch: 1.05 },
  { id: 'nia', name: 'Nia', avatarEmoji: '👧🏾', greeting: 'Yay, my favourite shop! I have my pocket money!', speechPitch: 1.3 }
];

// --- Product Definitions with Nigerian Naira (₦) Prices ---
export interface ShopProduct {
  id: string;
  name: string;
  category: 'fruit' | 'snack' | 'drink' | 'school' | 'toy';
  price: number; // in Naira (₦)
  emoji: string;
  badgeColor: string;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  // Fruits
  { id: 'banana', name: 'Sweet Banana', category: 'fruit', price: 100, emoji: '🍌', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'mango', name: 'Ripe Mango', category: 'fruit', price: 150, emoji: '🥭', badgeColor: 'bg-orange-100 text-orange-800' },
  { id: 'apple', name: 'Red Apple', category: 'fruit', price: 200, emoji: '🍎', badgeColor: 'bg-rose-100 text-rose-800' },
  { id: 'pineapple', name: 'Golden Pineapple', category: 'fruit', price: 300, emoji: '🍍', badgeColor: 'bg-yellow-100 text-yellow-800' },

  // Snacks
  { id: 'chin_chin', name: 'Crunchy Chin Chin', category: 'snack', price: 100, emoji: '🥨', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'meat_pie', name: 'Warm Meat Pie', category: 'snack', price: 250, emoji: '🥟', badgeColor: 'bg-orange-100 text-orange-800' },
  { id: 'puff_puff', name: 'Sweet Puff Puff', category: 'snack', price: 50, emoji: '🍩', badgeColor: 'bg-yellow-100 text-yellow-800' },
  { id: 'plantain_chips', name: 'Plantain Chips', category: 'snack', price: 150, emoji: '🍌', badgeColor: 'bg-emerald-100 text-emerald-800' },

  // Drinks
  { id: 'zobo', name: 'Chilled Zobo', category: 'drink', price: 100, emoji: '🍷', badgeColor: 'bg-rose-100 text-rose-800' },
  { id: 'juice', name: 'Orange Juice', category: 'drink', price: 200, emoji: '🧃', badgeColor: 'bg-orange-100 text-orange-800' },
  { id: 'malt', name: 'Cold Malt Drink', category: 'drink', price: 250, emoji: '🥤', badgeColor: 'bg-amber-100 text-amber-800' },
  { id: 'water', name: 'Pure Water', category: 'drink', price: 50, emoji: '💧', badgeColor: 'bg-sky-100 text-sky-800' },

  // School Supplies & Toys
  { id: 'pencil', name: 'Writing Pencil', category: 'school', price: 50, emoji: '✏️', badgeColor: 'bg-indigo-100 text-indigo-800' },
  { id: 'book', name: 'Exercise Book', category: 'school', price: 200, emoji: '📒', badgeColor: 'bg-blue-100 text-blue-800' },
  { id: 'toy_car', name: 'Toy Car', category: 'toy', price: 500, emoji: '🚗', badgeColor: 'bg-purple-100 text-purple-800' },
  { id: 'football', name: 'Football', category: 'toy', price: 700, emoji: '⚽', badgeColor: 'bg-emerald-100 text-emerald-800' }
];

// --- Nigerian Naira Currency Notes & Coins ---
export interface NairaDenomination {
  value: number;
  label: string;
  type: 'note' | 'coin';
  bgColor: string;
  borderColor: string;
  textColor: string;
  portraitDesc: string;
}

export const NAIRA_DENOMINATIONS: NairaDenomination[] = [
  { value: 50, label: '₦50', type: 'note', bgColor: 'bg-teal-600', borderColor: 'border-teal-700', textColor: 'text-teal-50', portraitDesc: 'People' },
  { value: 100, label: '₦100', type: 'note', bgColor: 'bg-amber-700', borderColor: 'border-amber-800', textColor: 'text-amber-50', portraitDesc: 'Chief Awolowo' },
  { value: 200, label: '₦200', type: 'note', bgColor: 'bg-emerald-700', borderColor: 'border-emerald-800', textColor: 'text-emerald-50', portraitDesc: 'Alhaji Bello' },
  { value: 500, label: '₦500', type: 'note', bgColor: 'bg-sky-700', borderColor: 'border-sky-800', textColor: 'text-sky-50', portraitDesc: 'Dr. Azikiwe' },
  { value: 1000, label: '₦1000', type: 'note', bgColor: 'bg-purple-800', borderColor: 'border-purple-900', textColor: 'text-purple-50', portraitDesc: 'Mai-Bornu & Isong' }
];

// --- Shop Challenge / Order Structure ---
export interface ShopChallenge {
  id: number;
  level: number;
  customerIndex: number;
  type: 'match_items' | 'add_prices' | 'give_change' | 'multi_items' | 'multiplication' | 'stock' | 'profit' | 'automation_loop';
  speechText: string;
  promptText: string;
  // Specific challenge parameters
  requestedItems?: { productId: string; quantity: number }[];
  customerPaidNote?: number; // e.g. 500 Naira
  expectedTotal?: number; // e.g. 300 Naira
  expectedChange?: number; // e.g. 200 Naira
  stockInitial?: number; // e.g. 8 apples
  stockSold?: number; // e.g. 3 sold
  expectedStockRemain?: number; // e.g. 5 remain
  costPrice?: number; // e.g. 500
  sellPrice?: number; // e.g. 700
  expectedProfit?: number; // e.g. 200
  loopRepeatCount?: number; // e.g. 3
  loopProductId?: string; // e.g. 'chin_chin'
  hintText: string;
}

// --- Challenges for Levels 1–8 ---
const SHOP_CHALLENGES: ShopChallenge[] = [
  // LEVEL 1: Match Quantities to Customer Orders
  {
    id: 1,
    level: 1,
    customerIndex: 0, // Amara
    type: 'match_items',
    speechText: 'Hello Shopkeeper! Please give me 2 sweet bananas!',
    promptText: 'Amara wants 2 sweet bananas! 🍌🍌',
    requestedItems: [{ productId: 'banana', quantity: 2 }],
    expectedTotal: 200,
    hintText: 'Tap on the banana twice to put 2 bananas in Amara\'s shopping basket!'
  },
  {
    id: 2,
    level: 1,
    customerIndex: 1, // Kofi
    type: 'match_items',
    speechText: 'Good day! Please give me 3 crunchy chin chin snacks!',
    promptText: 'Kofi wants 3 crunchy chin chin! 🥨🥨🥨',
    requestedItems: [{ productId: 'chin_chin', quantity: 3 }],
    expectedTotal: 300,
    hintText: 'Tap the chin chin snack 3 times to count 1, 2, 3!'
  },

  // LEVEL 2: Add Prices (Naira Addition)
  {
    id: 3,
    level: 2,
    customerIndex: 2, // Zola
    type: 'add_prices',
    speechText: 'Hello! I would like 1 banana for ₦100 and 1 orange juice for ₦200. How much is my total?',
    promptText: 'Calculate Zola\'s total: 1 Banana (₦100) + 1 Orange Juice (₦200)',
    requestedItems: [
      { productId: 'banana', quantity: 1 },
      { productId: 'juice', quantity: 1 }
    ],
    expectedTotal: 300,
    hintText: 'Add ₦100 + ₦200 = ₦300!'
  },
  {
    id: 4,
    level: 2,
    customerIndex: 3, // Ade
    type: 'add_prices',
    speechText: 'Hey shopkeeper! I want 1 meat pie for ₦250 and 1 pure water for ₦50. What is my total?',
    promptText: 'Calculate Ade\'s total: 1 Meat Pie (₦250) + 1 Water (₦50)',
    requestedItems: [
      { productId: 'meat_pie', quantity: 1 },
      { productId: 'water', quantity: 1 }
    ],
    expectedTotal: 300,
    hintText: '₦250 + ₦50 = ₦300! You can do it!'
  },

  // LEVEL 3: Give Correct Change (Naira Subtraction)
  {
    id: 5,
    level: 3,
    customerIndex: 4, // Nia
    type: 'give_change',
    speechText: 'My snacks cost ₦300. Here is a ₦500 note! How much change do you give me?',
    promptText: 'Total is ₦300. Nia pays with ₦500. Give the correct change!',
    customerPaidNote: 500,
    expectedTotal: 300,
    expectedChange: 200,
    hintText: '₦500 - ₦300 = ₦200 change! Tap the ₦200 note to hand it to Nia.'
  },
  {
    id: 6,
    level: 3,
    customerIndex: 0, // Amara
    type: 'give_change',
    speechText: 'My items cost ₦800. Here is a ₦1000 note! Please give me my change.',
    promptText: 'Total is ₦800. Amara pays with ₦1000. Give correct change!',
    customerPaidNote: 1000,
    expectedTotal: 800,
    expectedChange: 200,
    hintText: '₦1000 - ₦800 = ₦200 change! Select ₦200 to give back.'
  },

  // LEVEL 4: Multiple Items (Shopping Basket)
  {
    id: 7,
    level: 4,
    customerIndex: 1, // Kofi
    type: 'multi_items',
    speechText: 'I want 2 bags of Chin Chin at ₦100 each, and 1 Zobo drink for ₦100! What is my total?',
    promptText: 'Kofi buys: 2 Chin Chin (₦100 each) + 1 Zobo (₦100)',
    requestedItems: [
      { productId: 'chin_chin', quantity: 2 },
      { productId: 'zobo', quantity: 1 }
    ],
    expectedTotal: 300,
    hintText: '2 Chin Chin = ₦200. Plus 1 Zobo (₦100) = ₦300 total!'
  },

  // LEVEL 5: Simple Multiplication (Repeated Addition)
  {
    id: 8,
    level: 5,
    customerIndex: 2, // Zola
    type: 'multiplication',
    speechText: 'I need 3 bottles of orange juice for my party! They are ₦200 each. What is the total?',
    promptText: 'Zola needs 3 Orange Juices at ₦200 each (3 × ₦200)',
    requestedItems: [{ productId: 'juice', quantity: 3 }],
    expectedTotal: 600,
    hintText: '3 times ₦200 is: ₦200 + ₦200 + ₦200 = ₦600!'
  },

  // LEVEL 6: Stock Management (Inventory Subtraction)
  {
    id: 9,
    level: 6,
    customerIndex: 3, // Ade
    type: 'stock',
    speechText: 'You have 8 red apples in your fruit crate. Ade buys 3 apples. How many remain in stock?',
    promptText: 'Stock Check: You had 8 apples. You sold 3. How many remain?',
    stockInitial: 8,
    stockSold: 3,
    expectedStockRemain: 5,
    hintText: '8 apples minus 3 apples = 5 apples remain in your crate!'
  },

  // LEVEL 7: Simple Profit (Early Entrepreneurship)
  {
    id: 10,
    level: 7,
    customerIndex: 4, // Nia
    type: 'profit',
    speechText: 'You bought a toy car from the wholesale market for ₦500. You sell it to Nia for ₦700. How much profit did you make?',
    promptText: 'Bought for ₦500, Sold for ₦700. Calculate your shop profit!',
    costPrice: 500,
    sellPrice: 700,
    expectedProfit: 200,
    hintText: 'Profit = Selling Price (₦700) - Cost Price (₦500) = ₦200 profit!'
  },

  // LEVEL 8: Coding Automation / Loops (REPEAT Block)
  {
    id: 11,
    level: 8,
    customerIndex: 0, // Line of 3 customers
    type: 'automation_loop',
    speechText: 'Three customers in line all want 1 cold Zobo drink! Use a coding loop: REPEAT 3 TIMES: SELL 1 ZOBO!',
    promptText: 'Automation Mission: 3 customers want Zobo! Use a REPEAT loop to serve all three automatically!',
    loopRepeatCount: 3,
    loopProductId: 'zobo',
    expectedTotal: 300,
    hintText: 'Tap REPEAT 3×: SELL ZOBO to run your automated cashier loop!'
  }
];

// --- Badge Definitions ---
export interface ShopBadge {
  name: string;
  title: string;
  icon: string;
  desc: string;
  unlocked: boolean;
}

const SHOP_BADGES: ShopBadge[] = [
  { name: 'Shop Helper', title: 'Shop Helper', icon: '🏪', desc: 'Serve your first customer in My Little Shop!', unlocked: false },
  { name: 'Money Master', title: 'Money Master', icon: '💰', desc: 'Master calculating prices and totals using Naira!', unlocked: false },
  { name: 'Change Champion', title: 'Change Champion', icon: '💵', desc: 'Give exact change to customers with high accuracy!', unlocked: false },
  { name: 'Smart Seller', title: 'Smart Seller', icon: '🛍️', desc: 'Master multi-item customer orders and stock management!', unlocked: false },
  { name: 'Young Entrepreneur', title: 'Young Entrepreneur', icon: '🌟', desc: 'Calculate shop profits, unlock upgrades, and grow your shop!', unlocked: false }
];

export interface MyLittleShopProps {
  initialLevel?: number;
  onBackToStage1?: () => void;
}

export default function MyLittleShop({ initialLevel = 1, onBackToStage1 }: MyLittleShopProps) {
  const router = useRouter();

  // Active level & challenge index
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevel);
  const currentChallenge = SHOP_CHALLENGES.find(c => c.level === selectedLevel) || SHOP_CHALLENGES[0];
  const activeCustomer = CUSTOMERS[currentChallenge.customerIndex % CUSTOMERS.length];

  // Basket / Counter Items (for matching & checkout)
  const [basketItems, setBasketItems] = useState<{ productId: string; quantity: number }[]>([]);
  
  // Change Given by Child (sum of Naira notes given)
  const [givenChangeNotes, setGivenChangeNotes] = useState<number[]>([]);

  // Selected Answer for Math Questions (Level 2, 5, 6, 7)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Automation Loop State (Level 8)
  const [loopExecuting, setLoopExecuting] = useState<boolean>(false);
  const [loopStep, setLoopStep] = useState<number>(0);

  // Feedback & Lizzy
  const [lizzySpeech, setLizzySpeech] = useState<string>(currentChallenge.promptText);
  const [showHintBubble, setShowHintBubble] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [shakeCounter, setShakeCounter] = useState<boolean>(false);

  // Shop Upgrades State
  const [shopUpgrades, setShopUpgrades] = useState<string[]>(['basic_shop']);
  const [activeTab, setActiveTab] = useState<'shop' | 'upgrades' | 'badges'>('shop');

  // Gamification Stats
  const [dolaCoins, setDolaCoins] = useState<number>(0);
  const [xpPoints, setXpPoints] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<ShopBadge | null>(null);

  // Parent / Teacher Analytics
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [customersServed, setCustomersServed] = useState<number>(0);
  const [additionCorrect, setAdditionCorrect] = useState<number>(0);
  const [additionAttempts, setAdditionAttempts] = useState<number>(0);
  const [changeCorrect, setChangeCorrect] = useState<number>(0);
  const [changeAttempts, setChangeAttempts] = useState<number>(0);
  const [stockCorrect, setStockCorrect] = useState<number>(0);
  const [profitCorrect, setProfitCorrect] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Level Complete Modal
  const [levelCompleteModal, setLevelCompleteModal] = useState<{
    completedLevel: number;
    isGameFinale: boolean;
    starsEarned: number;
    dolaCoinsEarned: number;
    xpEarned: number;
  } | null>(null);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dola_my_little_shop_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dolaCoins !== undefined) setDolaCoins(parsed.dolaCoins);
        if (parsed.xpPoints !== undefined) setXpPoints(parsed.xpPoints);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.unlockedLevel !== undefined) {
          setUnlockedLevel(parsed.unlockedLevel);
        }
        if (parsed.earnedBadges) setEarnedBadges(parsed.earnedBadges);
        if (parsed.shopUpgrades) setShopUpgrades(parsed.shopUpgrades);
        if (parsed.customersServed) setCustomersServed(parsed.customersServed);
        if (parsed.totalAttempts) setTotalAttempts(parsed.totalAttempts);
        if (parsed.hintsUsedCount) setHintsUsedCount(parsed.hintsUsedCount);
        if (parsed.timeSpentSeconds) setTimeSpentSeconds(parsed.timeSpentSeconds);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  // Time tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state to localStorage and Django API
  const persistProgress = useCallback((updated: Partial<{
    dolaCoins: number;
    xpPoints: number;
    unlockedLevel: number;
    streak: number;
    customersServed: number;
    earnedBadges: string[];
    shopUpgrades: string[];
    hintsUsedCount: number;
    totalAttempts: number;
  }>) => {
    try {
      const current = {
        dolaCoins,
        xpPoints,
        unlockedLevel,
        streak,
        customersServed,
        earnedBadges,
        shopUpgrades,
        hintsUsedCount,
        totalAttempts,
        timeSpentSeconds,
        ...updated
      };
      localStorage.setItem('dola_my_little_shop_state', JSON.stringify(current));

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const accuracy = current.totalAttempts > 0 
          ? Math.round((current.customersServed / Math.max(1, current.totalAttempts)) * 100) 
          : 100;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/my-little-shop/save-progress/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            current_level: current.unlockedLevel,
            stars_earned: Math.round(current.customersServed * 3),
            dola_coins: current.dolaCoins,
            xp_earned: current.xpPoints,
            accuracy,
            attempts: current.totalAttempts,
            customers_served: current.customersServed,
            addition_accuracy: additionAttempts > 0 ? Math.round((additionCorrect / additionAttempts) * 100) : 100,
            change_accuracy: changeAttempts > 0 ? Math.round((changeCorrect / changeAttempts) * 100) : 100,
            hints_used: current.hintsUsedCount,
            time_spent_seconds: current.timeSpentSeconds,
            shop_upgrades: current.shopUpgrades,
            badges: current.earnedBadges
          })
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }, [
    dolaCoins, xpPoints, unlockedLevel, streak, customersServed, earnedBadges,
    shopUpgrades, hintsUsedCount, totalAttempts, timeSpentSeconds, additionAttempts,
    additionCorrect, changeAttempts, changeCorrect
  ]);

  // Load / Reset level challenge
  const loadChallenge = useCallback((lvl: number) => {
    setSelectedLevel(lvl);
    setBasketItems([]);
    setGivenChangeNotes([]);
    setSelectedAnswer(null);
    setShowHintBubble(false);
    setLevelCompleteModal(null);
    setLoopExecuting(false);
    setLoopStep(0);

    const challenge = SHOP_CHALLENGES.find(c => c.level === lvl) || SHOP_CHALLENGES[0];
    setLizzySpeech(challenge.promptText);
    speakText(challenge.speechText, soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    loadChallenge(selectedLevel);
  }, [selectedLevel, loadChallenge]);

  // Add Item to Counter / Basket
  const addItemToBasket = (productId: string) => {
    sounds.playItemPickup();
    setBasketItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  // Remove Item from Basket
  const removeItemFromBasket = (productId: string) => {
    sounds.playItemPickup();
    setBasketItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter(i => i.productId !== productId);
      }
      return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  // Add Change Note
  const addChangeNote = (noteValue: number) => {
    sounds.playNote();
    setGivenChangeNotes(prev => [...prev, noteValue]);
  };

  // Remove Change Note
  const removeChangeNote = (index: number) => {
    sounds.playNote();
    setGivenChangeNotes(prev => prev.filter((_, idx) => idx !== index));
  };

  // Clear Basket or Change
  const clearSelection = () => {
    sounds.playItemPickup();
    setBasketItems([]);
    setGivenChangeNotes([]);
    setSelectedAnswer(null);
  };

  // Badge unlock helper
  const checkBadges = useCallback((served: number, level: number, changeAcc: number, upgrades: string[]) => {
    const updated = [...earnedBadges];
    let justEarned: ShopBadge | null = null;

    if (served >= 1 && !updated.includes('Shop Helper')) {
      updated.push('Shop Helper');
      justEarned = SHOP_BADGES.find(b => b.name === 'Shop Helper') || null;
    }
    if (level >= 2 && !updated.includes('Money Master')) {
      updated.push('Money Master');
      justEarned = SHOP_BADGES.find(b => b.name === 'Money Master') || null;
    }
    if (level >= 3 && changeAcc >= 80 && !updated.includes('Change Champion')) {
      updated.push('Change Champion');
      justEarned = SHOP_BADGES.find(b => b.name === 'Change Champion') || null;
    }
    if (level >= 4 && !updated.includes('Smart Seller')) {
      updated.push('Smart Seller');
      justEarned = SHOP_BADGES.find(b => b.name === 'Smart Seller') || null;
    }
    if ((level >= 7 || upgrades.length >= 2) && !updated.includes('Young Entrepreneur')) {
      updated.push('Young Entrepreneur');
      justEarned = SHOP_BADGES.find(b => b.name === 'Young Entrepreneur') || null;
    }

    if (justEarned) {
      setNewlyUnlockedBadge(justEarned);
      sounds.playVictory();
    }
    setEarnedBadges(updated);
    return updated;
  }, [earnedBadges]);

  // Handle Order Success
  const handleSuccess = (coinsAwarded = 15, xpAwarded = 35) => {
    sounds.playCashRegister();
    sounds.playVictory();
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });

    const newCoins = dolaCoins + coinsAwarded;
    const newXp = xpPoints + xpAwarded;
    const newServed = customersServed + 1;
    const nextUnlocked = Math.min(8, Math.max(unlockedLevel, selectedLevel + 1));
    const isFinale = selectedLevel === 8;

    setDolaCoins(newCoins);
    setXpPoints(newXp);
    setCustomersServed(newServed);
    setUnlockedLevel(nextUnlocked);

    const changeAcc = changeAttempts > 0 ? Math.round((changeCorrect / changeAttempts) * 100) : 100;
    const updatedBadges = checkBadges(newServed, selectedLevel, changeAcc, shopUpgrades);

    persistProgress({
      dolaCoins: newCoins,
      xpPoints: newXp,
      customersServed: newServed,
      unlockedLevel: nextUnlocked,
      earnedBadges: updatedBadges
    });

    const celebrationMsg = isFinale 
      ? '🎉 Amazing! You mastered all shop challenges and coding loops!'
      : `🌟 Order Complete! Customer smiled and said: "Thank you so much!"`;
    setLizzySpeech(celebrationMsg);
    speakText(celebrationMsg, soundEnabled);

    setLevelCompleteModal({
      completedLevel: selectedLevel,
      isGameFinale: isFinale,
      starsEarned: 3,
      dolaCoinsEarned: coinsAwarded,
      xpEarned: xpAwarded
    });
  };

  // Verify child's submission based on level type
  const handleSubmitOrder = () => {
    setTotalAttempts(prev => prev + 1);

    // LEVEL 1: Match Quantities
    if (currentChallenge.type === 'match_items') {
      const targetReq = currentChallenge.requestedItems || [];
      const isMatch = targetReq.every(req => {
        const inBasket = basketItems.find(b => b.productId === req.productId);
        return inBasket && inBasket.quantity === req.quantity;
      }) && basketItems.length === targetReq.length;

      if (isMatch) {
        handleSuccess(15, 30);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = "Almost! Check the items in your basket to match what the customer asked for.";
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 2 & 4: Add Prices
    else if (currentChallenge.type === 'add_prices' || currentChallenge.type === 'multi_items') {
      setAdditionAttempts(prev => prev + 1);
      if (selectedAnswer === currentChallenge.expectedTotal) {
        setAdditionCorrect(prev => prev + 1);
        handleSuccess(20, 35);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = "Let's check the price tags together! Add the Naira numbers on the items.";
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 3: Give Change
    else if (currentChallenge.type === 'give_change') {
      setChangeAttempts(prev => prev + 1);
      const totalChangeGiven = givenChangeNotes.reduce((sum, val) => sum + val, 0);
      if (totalChangeGiven === currentChallenge.expectedChange) {
        setChangeCorrect(prev => prev + 1);
        handleSuccess(25, 40);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = `You handed ₦${totalChangeGiven}. The customer needs exactly ₦${currentChallenge.expectedChange}!`;
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 5: Multiplication
    else if (currentChallenge.type === 'multiplication') {
      if (selectedAnswer === currentChallenge.expectedTotal) {
        handleSuccess(25, 40);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = "Multiply quantity × price, or add the price 3 times!";
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 6: Stock Management
    else if (currentChallenge.type === 'stock') {
      if (selectedAnswer === currentChallenge.expectedStockRemain) {
        setStockCorrect(prev => prev + 1);
        handleSuccess(20, 35);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = "Start with 8 apples, then subtract the 3 you sold!";
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 7: Simple Profit
    else if (currentChallenge.type === 'profit') {
      if (selectedAnswer === currentChallenge.expectedProfit) {
        setProfitCorrect(prev => prev + 1);
        handleSuccess(30, 45);
      } else {
        sounds.playGentleOops();
        setShakeCounter(true);
        setTimeout(() => setShakeCounter(false), 500);
        const msg = "Profit is Selling Price minus Cost Price (₦700 - ₦500)!";
        setLizzySpeech(msg);
        speakText(msg, soundEnabled);
        setShowHintBubble(true);
      }
    }

    // LEVEL 8: Automation Loop
    else if (currentChallenge.type === 'automation_loop') {
      runLoopAutomation();
    }
  };

  // Run Level 8 Coding Loop Automation
  const runLoopAutomation = async () => {
    if (loopExecuting) return;
    setLoopExecuting(true);
    setLoopStep(0);

    for (let i = 1; i <= 3; i++) {
      setLoopStep(i);
      sounds.playItemPickup();
      sounds.playCoin();
      await new Promise(r => setTimeout(r, 600));
    }

    setLoopExecuting(false);
    handleSuccess(35, 50);
  };

  // Buy Shop Upgrade with DolaCoins
  const buyUpgrade = (upgradeId: string, cost: number) => {
    if (dolaCoins < cost || shopUpgrades.includes(upgradeId)) return;
    sounds.playCashRegister();
    sounds.playVictory();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });

    const newCoins = dolaCoins - cost;
    const newUpgrades = [...shopUpgrades, upgradeId];
    setDolaCoins(newCoins);
    setShopUpgrades(newUpgrades);

    persistProgress({
      dolaCoins: newCoins,
      shopUpgrades: newUpgrades
    });
  };

  // Total change value given so far
  const totalChangeGiven = givenChangeNotes.reduce((sum, n) => sum + n, 0);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center select-none font-sans pb-12 px-2 sm:px-4">
      {/* ================= HEADER & STATS BAR ================= */}
      <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-amber-300 p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Shop Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 text-2xl">
              🏪
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">My Little Shop</h1>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  Level {selectedLevel} of 8
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-500">
                Nigerian Market Simulation • Ages 5–8
              </p>
            </div>
          </div>

          {/* Gamification Stats: DolaCoins, XP, Mute, Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* DolaCoins */}
            <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-300 px-3 py-1.5 rounded-2xl shadow-sm">
              <span className="text-lg">🪙</span>
              <span className="font-black text-amber-700 text-sm sm:text-base">{dolaCoins}</span>
              <span className="text-xs font-bold text-amber-600 hidden sm:inline">Coins</span>
            </div>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-purple-50 border-2 border-purple-300 px-3 py-1.5 rounded-2xl shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600 fill-purple-400" />
              <span className="font-black text-purple-700 text-sm sm:text-base">{xpPoints}</span>
              <span className="text-xs font-bold text-purple-600 hidden sm:inline">XP</span>
            </div>

            {/* Audio Mute Toggle */}
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
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-600" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
            </button>

            {/* Shop Upgrades Button */}
            <button
              onClick={() => setActiveTab(activeTab === 'upgrades' ? 'shop' : 'upgrades')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all ${
                activeTab === 'upgrades'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Upgrades</span>
            </button>

            {/* Badges Tab */}
            <button
              onClick={() => setActiveTab(activeTab === 'badges' ? 'shop' : 'badges')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-2xl font-bold text-xs sm:text-sm border-2 transition-all ${
                activeTab === 'badges'
                  ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Badges ({earnedBadges.length})</span>
            </button>

            {/* Stage 1 Map */}
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

        {/* Level Selector Pills (Levels 1 to 8) */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {SHOP_CHALLENGES.map(ch => {
            const isUnlocked = ch.level <= unlockedLevel;
            const isCurrent = ch.level === selectedLevel;
            return (
              <button
                key={ch.level}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.playCoin();
                    setSelectedLevel(ch.level);
                  }
                }}
                disabled={!isUnlocked}
                className={`flex-shrink-0 px-3 py-1 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-200 scale-105'
                    : isUnlocked
                    ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-200'
                    : 'bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed border border-dashed border-slate-300'
                }`}
              >
                {!isUnlocked && <Lock className="w-3 h-3" />}
                Lvl {ch.level}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SHOP UPGRADES VIEW ================= */}
      {activeTab === 'upgrades' && (
        <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-6 mb-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-black text-slate-800">Shop Customizer &amp; Upgrades</h2>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700"
            >
              Back to Shop 🏪
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 font-medium mb-4">
            Use your earned DolaCoins (🪙 <strong>{dolaCoins}</strong>) to decorate your kiosk and make your neighbourhood shop the most popular in town!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'canopy_stripe', name: 'Striped Sunny Canopy', icon: '🎪', cost: 40, desc: 'A bright yellow and green shade over your counter!' },
              { id: 'market_radio', name: 'Vintage Market Radio', icon: '📻', cost: 50, desc: 'Plays sweet highlife and afrobeats in the shop!' },
              { id: 'gold_register', name: 'Golden Cash Register', icon: '🌟', cost: 75, desc: 'Shiny golden till that goes ding with every sale!' },
              { id: 'flower_pot', name: 'Hibiscus Flower Pot', icon: '🌺', cost: 30, desc: 'Welcoming red hibiscus on the shop entrance!' },
              { id: 'golden_tags', name: 'Golden Price Tags', icon: '🏷️', cost: 60, desc: 'Sparkly Naira price tags for all your fruits & snacks!' },
            ].map(up => {
              const owned = shopUpgrades.includes(up.id);
              const canAfford = dolaCoins >= up.cost;
              return (
                <div
                  key={up.id}
                  className={`p-4 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    owned
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
                      {up.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-800">{up.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{up.desc}</p>
                    </div>
                  </div>

                  {owned ? (
                    <div className="flex items-center justify-center gap-1 py-2 bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl">
                      <Check className="w-4 h-4" />
                      <span>Installed in Shop!</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => buyUpgrade(up.id, up.cost)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>🪙 Buy for {up.cost} Coins</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= BADGES TAB ================= */}
      {activeTab === 'badges' && (
        <div className="w-full bg-white rounded-3xl shadow-xl border-4 border-purple-300 p-6 mb-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-black text-slate-800">Your Shopkeeper Badges</h2>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700"
            >
              Back to Shop 🏪
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SHOP_BADGES.map(badge => {
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
                      {hasBadge ? 'Earned! ⭐' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MAIN SHOPPING GAMEPLAY ARENA ================= */}
      {activeTab === 'shop' && (
        <div className="w-full flex flex-col gap-4">
          
          {/* 1. CUSTOMER & LIZZY SHOPPING COUNTER */}
          <div className="w-full bg-gradient-to-r from-amber-100 via-orange-50 to-yellow-100 border-4 border-amber-300 rounded-[2.5rem] p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Awning Decoration */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500 opacity-70" />

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
              {/* Customer Avatar & Speech */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-200/80 border-3 border-amber-400 flex items-center justify-center text-5xl shadow-md shrink-0">
                  {activeCustomer.avatarEmoji}
                </div>
                <div className="flex-1">
                  <div className="inline-block bg-amber-600 text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full mb-1">
                    Customer: {activeCustomer.name}
                  </div>
                  <div className="bg-white/95 rounded-2xl p-3 border-2 border-amber-300 shadow-sm relative">
                    <p className="text-sm sm:text-base font-black text-slate-800 leading-snug">
                      &quot;{currentChallenge.speechText}&quot;
                    </p>
                    {showHintBubble && (
                      <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-300 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{currentChallenge.hintText}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Narration Speaker & Hint Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => speakText(currentChallenge.speechText, true)}
                  className="p-3 rounded-2xl bg-white hover:bg-amber-100 text-amber-700 border-2 border-amber-300 shadow-sm active:scale-95 transition-transform"
                  title="Read customer request aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    sounds.playCoin();
                    setShowHintBubble(!showHintBubble);
                    setHintsUsedCount(prev => prev + 1);
                    if (!showHintBubble) {
                      speakText(currentChallenge.hintText, soundEnabled);
                    }
                  }}
                  className="p-3 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-800 border-2 border-amber-400 shadow-sm active:scale-95 transition-transform"
                  title="Need a Hint?"
                >
                  <Lightbulb className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. SHOPPING WORKSPACE (TWO-COLUMN): PRODUCTS SHELF (LEFT) & CHECKOUT TILL (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            
            {/* LEFT: SHOP SHELVES & ITEMS (7 cols on lg) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-4 sm:p-5 flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <span className="font-extrabold text-sm text-slate-800">Shop Shelves (Tap to Select)</span>
                </div>
                <span className="text-xs font-bold text-slate-400">All prices in Nigerian Naira (₦)</span>
              </div>

              {/* Grid of Products on Wooden Shelves */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SHOP_PRODUCTS.map(product => {
                  const inBasket = basketItems.find(b => b.productId === product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => addItemToBasket(product.id)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between text-center transition-all transform active:scale-95 relative ${
                        inBasket
                          ? 'bg-amber-50 border-amber-400 shadow-md scale-102'
                          : 'bg-slate-50 hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {/* Quantity in Basket Badge */}
                      {inBasket && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                          {inBasket.quantity}
                        </div>
                      )}

                      <span className="text-3xl sm:text-4xl mb-1 filter drop-shadow-sm">{product.emoji}</span>
                      <span className="text-xs font-black text-slate-800 leading-tight mb-1">{product.name}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300">
                        ₦{product.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT: CHECKOUT COUNTER / REGISTER / CASH TRAY (5 cols on lg) */}
            <div className={`lg:col-span-5 bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-4 sm:p-5 flex flex-col gap-4 ${
              shakeCounter ? 'animate-wiggle' : ''
            }`}>
              
              {/* TILL HEADER */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-sm text-slate-800">Checkout Counter</span>
                </div>
                {(basketItems.length > 0 || givenChangeNotes.length > 0) && (
                  <button
                    onClick={clearSelection}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 p-1 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* SPECIFIC CHALLENGE TYPE CONTROLS */}
              
              {/* --- TYPE 1: MATCHING ITEMS BASKET --- */}
              {currentChallenge.type === 'match_items' && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-slate-500">Items placed in shopping bag:</span>
                  <div className="min-h-[120px] bg-amber-50/60 border-2 border-dashed border-amber-300 rounded-2xl p-3 flex flex-wrap gap-2 items-center">
                    {basketItems.length === 0 ? (
                      <div className="w-full text-center py-6 text-slate-400">
                        <ShoppingBag className="w-8 h-8 text-amber-300 mx-auto mb-1" />
                        <p className="text-xs font-bold">Shopping bag is empty</p>
                        <p className="text-[11px]">Tap items from the shelves on the left!</p>
                      </div>
                    ) : (
                      basketItems.map(item => {
                        const prod = SHOP_PRODUCTS.find(p => p.id === item.productId);
                        if (!prod) return null;
                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-amber-300 rounded-xl shadow-xs"
                          >
                            <span className="text-xl">{prod.emoji}</span>
                            <span className="text-xs font-black text-slate-800">{prod.name} × {item.quantity}</span>
                            <button
                              onClick={() => removeItemFromBasket(item.productId)}
                              className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* --- TYPE 2, 4, 5, 7: NUMERIC / MONEY OPTIONS --- */}
              {(currentChallenge.type === 'add_prices' || currentChallenge.type === 'multi_items' || currentChallenge.type === 'multiplication' || currentChallenge.type === 'stock' || currentChallenge.type === 'profit') && (
                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      {currentChallenge.type === 'stock' ? 'How many items remain?' : currentChallenge.type === 'profit' ? 'How much profit was made?' : 'Select Total Amount:'}
                    </span>
                    <div className="text-2xl font-black text-amber-700">
                      {selectedAnswer !== null 
                        ? (currentChallenge.type === 'stock' ? `${selectedAnswer} items` : `₦${selectedAnswer}`) 
                        : 'Tap an Option Below'}
                    </div>
                  </div>

                  {/* Multiple Choice Answer Pills */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Generate sensible choice pills around the correct answer */}
                    {(() => {
                      const correct = currentChallenge.expectedTotal || currentChallenge.expectedStockRemain || currentChallenge.expectedProfit || 300;
                      const offset = currentChallenge.type === 'stock' ? 1 : 100;
                      const options = [
                        correct - offset,
                        correct,
                        correct + offset,
                        correct + (offset * 2)
                      ].filter(v => v > 0).slice(0, 4);

                      return options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => {
                            sounds.playCoin();
                            setSelectedAnswer(opt);
                          }}
                          className={`py-3 px-3 rounded-2xl font-black text-sm border-2 transition-all ${
                            selectedAnswer === opt
                              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                              : 'bg-slate-50 hover:bg-amber-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {currentChallenge.type === 'stock' ? `${opt} Items` : `₦${opt}`}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* --- TYPE 3: GIVE CHANGE (VISUAL NAIRA NOTES TRAY) --- */}
              {currentChallenge.type === 'give_change' && (
                <div className="flex flex-col gap-3">
                  {/* Customer Payment Info */}
                  <div className="p-3 bg-sky-50 border-2 border-sky-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-sky-700 block">Customer Paid</span>
                      <span className="text-base font-black text-sky-900">₦{currentChallenge.customerPaidNote}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-500 block">Bill Total</span>
                      <span className="text-base font-black text-slate-800">₦{currentChallenge.expectedTotal}</span>
                    </div>
                  </div>

                  {/* Change Dispensed Tray */}
                  <div className="p-3 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl min-h-[75px] flex flex-wrap gap-2 items-center">
                    {givenChangeNotes.length === 0 ? (
                      <span className="text-xs font-bold text-slate-400 mx-auto">Tap Naira notes below to give change</span>
                    ) : (
                      givenChangeNotes.map((note, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-xs flex items-center gap-1"
                        >
                          <span>₦{note}</span>
                          <button onClick={() => removeChangeNote(idx)} className="text-emerald-200 hover:text-white font-bold ml-1">✕</button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-black text-slate-700">
                      Change Ready: <strong className="text-emerald-700 text-sm">₦{totalChangeGiven}</strong>
                    </span>
                  </div>

                  {/* Visual Naira Notes Selector */}
                  <span className="text-[11px] font-black uppercase text-slate-400 text-center">Tap Naira Notes to Give:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {NAIRA_DENOMINATIONS.slice(0, 4).map(denom => (
                      <button
                        key={denom.value}
                        onClick={() => addChangeNote(denom.value)}
                        className={`p-2 rounded-xl text-white font-black text-xs shadow-xs flex flex-col items-center justify-center border transition-all active:scale-95 ${denom.bgColor} ${denom.borderColor}`}
                      >
                        <span className="text-sm font-black">{denom.label}</span>
                        <span className="text-[9px] opacity-80">{denom.portraitDesc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* --- TYPE 8: AUTOMATION LOOP (LEVEL 8) --- */}
              {currentChallenge.type === 'automation_loop' && (
                <div className="flex flex-col gap-3">
                  <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 text-center">
                    <span className="text-xs font-black uppercase text-purple-800 flex items-center justify-center gap-1 mb-1">
                      <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                      <span>Cashier Loop Block</span>
                    </span>
                    <p className="text-xs text-purple-900 font-semibold mb-3">
                      Serve all 3 queueing customers in one smart coding loop!
                    </p>

                    <div className="p-3 bg-white rounded-xl border-2 border-purple-200 font-mono text-xs font-black text-purple-900 shadow-inner">
                      <div>REPEAT 3 TIMES:</div>
                      <div className="text-purple-600 pl-4">↳ SERVE 1 ZOBO DRINK 🍷</div>
                    </div>
                  </div>

                  {loopExecuting && (
                    <div className="text-center font-black text-sm text-purple-700 animate-pulse">
                      Serving Customer #{loopStep} of 3...
                    </div>
                  )}
                </div>
              )}

              {/* BIG GREEN CHECKOUT BUTTON */}
              <button
                onClick={handleSubmitOrder}
                disabled={loopExecuting}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>COMPLETE ORDER 🛍️</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEVEL COMPLETE CELEBRATION MODAL WITH ALL CTAs ================= */}
      {levelCompleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Confetti Ribbon */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-yellow-300 to-amber-400 rounded-full opacity-30 pointer-events-none" />

            {/* Victory Shop Icon */}
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 mx-auto flex items-center justify-center text-4xl shadow-xl shadow-orange-200 mb-4 animate-bounce">
              {levelCompleteModal.isGameFinale ? '🏆' : '🏪'}
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {levelCompleteModal.isGameFinale ? 'Grand Merchant! 🏆' : 'Customer Delighted! 🌟'}
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1 mb-4">
              {levelCompleteModal.isGameFinale
                ? 'You completed all 8 shop levels, mastered Naira math, and automated orders with loops!'
                : `Level ${levelCompleteModal.completedLevel} completed! The customer loved their purchase.`}
            </p>

            {/* Stars Display */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map(st => (
                <Star
                  key={st}
                  className="w-9 h-9 text-amber-400 fill-amber-400 scale-110 drop-shadow"
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
                <Sparkles className="w-6 h-6 text-purple-600 fill-purple-400" />
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
                onClick={() => {
                  if (selectedLevel < 8) {
                    loadChallenge(selectedLevel + 1);
                  } else {
                    loadChallenge(1);
                  }
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base shadow-lg shadow-orange-200 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span>{levelCompleteModal.isGameFinale ? 'Play Again from Lvl 1 🔄' : 'Next Customer / Level ➡️'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* SECONDARY: REPLAY THIS LEVEL */}
              <button
                onClick={() => loadChallenge(selectedLevel)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm border-2 border-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-600" />
                <span>Replay Level</span>
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

      {/* ================= NEW BADGE UNLOCKED MODAL ================= */}
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
