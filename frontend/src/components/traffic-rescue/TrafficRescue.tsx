'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Volume2, VolumeX, Sparkles, Star, Trophy, ArrowRight, RotateCcw,
  HelpCircle, CheckCircle2, Award, Play, Lightbulb, Lock,
  ChevronRight, RefreshCw, Trash2, ShieldAlert, Sparkle,
  Compass, Map, Heart, AlertTriangle, Check, Car, UserCheck, Clock, GitBranch
} from 'lucide-react';
import { speakFemale, stopSpeech } from '@/lib/speech';

// --- Web Audio Synthesizer (Zero External Asset Dependency) ---
class TrafficSoundEffects {
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

  // Cute cartoon car horn "Beep-Beep!"
  playHonk() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [0, 0.12].forEach((delay) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now + delay); // A4
      osc.frequency.linearRampToValueAtTime(466, now + delay + 0.08);
      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  }

  // Traffic light relay click
  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Pedestrian walk chime "Ding-Dong"
  playCrosswalkChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const tones = [880, 1174.66]; // A5, D6
    tones.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.22, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.25);
    });
  }

  // Gentle, friendly tire brake / stop squeak
  playBrake() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Smooth car engine whoosh
  playEngine() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(260, now + 0.3);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
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

  // City upgrade fanfare
  playUpgrade() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.25);
    });
  }
}

const trafficSounds = new TrafficSoundEffects();

// --- Types ---
type LightColor = 'RED' | 'YELLOW' | 'GREEN';

type CommandType =
  | 'SET_GREEN'
  | 'SET_YELLOW'
  | 'SET_RED'
  | 'WAIT_3_SEC'
  | 'ALLOW_PEDESTRIANS'
  | 'IF_PEDESTRIAN_WAITING'
  | 'IF_CAR_WAITING'
  | 'SWITCH_ROADS';

interface CommandBlock {
  id: string;
  type: CommandType;
  label: string;
  subLabel?: string;
  icon?: string;
  color: string;
}

interface Vehicle {
  id: string;
  name: string;
  emoji: string;
  color: string;
  road: 'east_west' | 'north_south';
  direction: 'to_east' | 'to_south';
  progress: number; // 0 to 100%
  isWaiting: boolean;
  destinationName: string;
  reached: boolean;
}

interface Pedestrian {
  id: string;
  name: string;
  emoji: string;
  progress: number; // 0 to 100%
  isWaiting: boolean;
  isCrossing: boolean;
  reached: boolean;
}

interface CityUpgrade {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  description: string;
  unlocked: boolean;
}

interface LevelConfig {
  level: number;
  title: string;
  topic: string;
  instruction: string;
  levelType: 'direct_light' | 'dual_road' | 'pedestrian' | 'timed_sequence' | 'conditional' | 'multi_vehicle' | 'debugging';
  vehicles: Vehicle[];
  pedestrians?: Pedestrian[];
  initialEastWestLight: LightColor;
  initialNorthSouthLight?: LightColor;
  allowedCommands?: CommandType[];
  buggyCommands?: CommandBlock[];
  speechText: string;
  lizzyHint: string;
  targetExplanation: string;
}

// Available City Upgrades in Store
const AVAILABLE_UPGRADES: CityUpgrade[] = [
  { id: 'cable_bridge', name: 'Grand Cable Bridge', emoji: '🌉', cost: 120, description: 'Connects the new river avenue with glowing cables!', unlocked: false },
  { id: 'solar_lamps', name: 'Solar Street Lamps', emoji: '☀️', cost: 150, description: 'Eco-friendly streetlights that glow warmly at night.', unlocked: false },
  { id: 'double_bus', name: 'Sunny Double-Decker', emoji: '🚌', cost: 200, description: 'Bright yellow school bus with double upper seats!', unlocked: false },
  { id: 'rainbow_cross', name: 'Rainbow Crosswalk', emoji: '🌈', cost: 250, description: 'Colourful rainbow stripes for happy walking children.', unlocked: false },
  { id: 'city_fountain', name: 'Park Water Fountain', emoji: '⛲', cost: 300, description: 'Sparkling water jets in the central city park.', unlocked: false },
  { id: 'clock_tower', name: 'Golden Clock Tower', emoji: '🕰️', cost: 400, description: 'Chimes on every hour to keep all city cars on time!', unlocked: false },
];

// 8 Interactive Levels for Traffic Rescue
const TRAFFIC_LEVELS: LevelConfig[] = [
  // Level 1: Traffic Light Colours & Actions
  {
    level: 1,
    title: 'Traffic Light Colours',
    topic: 'Signal Color Meanings',
    instruction: 'Little Blue is waiting at the RED light! Tap the GREEN lamp (or button) to let Little Blue GO safely to the bakery!',
    levelType: 'direct_light',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Little Blue', emoji: '🚗', color: '#3B82F6', road: 'east_west', direction: 'to_east', progress: 30, isWaiting: true, destinationName: 'Bakery', reached: false }
    ],
    speechText: 'Little Blue is waiting at the red light. Tap the green light to let Little Blue go!',
    lizzyHint: 'Green means GO, and Red means STOP! Tap the green lamp or the Set Green button to let Little Blue move.',
    targetExplanation: 'Green light signals vehicles that the road ahead is clear to drive.'
  },
  // Level 2: Guide Blue Car to School
  {
    level: 2,
    title: 'Rush to School Junction',
    topic: 'Single Junction Guidance',
    instruction: 'Little Blue has to reach school before the morning bell! Turn the light GREEN so Little Blue can cruise across the junction to school!',
    levelType: 'direct_light',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Little Blue', emoji: '🚗', color: '#3B82F6', road: 'east_west', direction: 'to_east', progress: 30, isWaiting: true, destinationName: 'Dola Primary School', reached: false }
    ],
    speechText: 'Little Blue is waiting at the junction. Turn the light green so Little Blue can drive to school!',
    lizzyHint: 'Tap the green light so Little Blue can cruise safely into the school parking lot.',
    targetExplanation: 'Junctions keep cars orderly by signaling when it is safe to proceed.'
  },
  // Level 3: Manage Crossroads (Two Roads)
  {
    level: 3,
    title: 'Crossroad Coordination',
    topic: 'Two Roads & Mutual Exclusion',
    instruction: 'Speedy Taxi is crossing on East road while Sunny Bus waits on North road! Let Speedy Taxi pass, then tap "Switch Active Road" to let Sunny Bus go!',
    levelType: 'dual_road',
    initialEastWestLight: 'GREEN',
    initialNorthSouthLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Speedy Taxi', emoji: '🚕', color: '#F59E0B', road: 'east_west', direction: 'to_east', progress: 15, isWaiting: false, destinationName: 'Airport', reached: false },
      { id: 'v2', name: 'Sunny Bus', emoji: '🚌', color: '#EAB308', road: 'north_south', direction: 'to_south', progress: 15, isWaiting: true, destinationName: 'City Library', reached: false }
    ],
    speechText: 'Speedy Taxi has the green light. Once the taxi passes, tap Switch Active Road to give Sunny Bus the green light!',
    lizzyHint: 'Wait for Speedy Taxi to cross, then tap "Switch Active Road" below to let Sunny Bus drive!',
    targetExplanation: 'Mutual exclusion ensures intersecting pathways never cross at the same second.'
  },
  // Level 4: Pedestrian Zebra Crossing
  {
    level: 4,
    title: 'Zebra Crossing Safety',
    topic: 'Pedestrian Priority & Walk Signals',
    instruction: 'Amina and Tunde need to cross to school! Tap "ALLOW PEDESTRIANS" to let the children cross safely, then tap "RESUME CAR TRAFFIC"!',
    levelType: 'pedestrian',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Ruby Racer', emoji: '🏎️', color: '#EF4444', road: 'east_west', direction: 'to_east', progress: 25, isWaiting: true, destinationName: 'Grand Garage', reached: false }
    ],
    pedestrians: [
      { id: 'p1', name: 'Amina & Tunde', emoji: '🎒👭', progress: 0, isWaiting: true, isCrossing: false, reached: false }
    ],
    speechText: 'Pedestrians first! Tap Allow Pedestrians to let Amina and Tunde cross, then tap Resume Car Traffic.',
    lizzyHint: 'Tap "Allow Pedestrians" to turn on the green walk signal! When the kids reach the other side, turn the car light back to Green.',
    targetExplanation: 'Pedestrian crossings give people right of way by safely halting oncoming vehicle traffic.'
  },
  // Level 5: Introduce Timing & Wait Intervals
  {
    level: 5,
    title: 'Timed Light Sequence',
    topic: 'Timed Sequences & Delays',
    instruction: 'Automate the city traffic light! Arrange: [TURN GREEN] -> [WAIT 3 SECONDS] -> [TURN YELLOW] -> [TURN RED], then press the green RUN button!',
    levelType: 'timed_sequence',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Speedy Taxi', emoji: '🚕', color: '#F59E0B', road: 'east_west', direction: 'to_east', progress: 30, isWaiting: true, destinationName: 'Train Station', reached: false }
    ],
    allowedCommands: ['SET_GREEN', 'WAIT_3_SEC', 'SET_YELLOW', 'SET_RED'],
    speechText: 'Build a timed cycle! Add Turn Green, Wait 3 Seconds, Turn Yellow, and Turn Red, then press Run.',
    lizzyHint: 'Add: 1. Turn Green, 2. Wait 3 Seconds, 3. Turn Yellow, 4. Turn Red. Then press RUN!',
    targetExplanation: 'Timer delays let cars complete their movement safely before signals switch state.'
  },
  // Level 6: Introduce IF/THEN Conditions
  {
    level: 6,
    title: 'Smart Sensor Light',
    topic: 'Conditional Logic (IF / THEN)',
    instruction: 'Build a smart traffic sensor! Arrange: [IF PEDESTRIAN WAITING] -> [TURN GREEN], then press RUN. Uncle Femi will cross safely, then Eco Van can drive!',
    levelType: 'conditional',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Eco Van', emoji: '🚐', color: '#10B981', road: 'east_west', direction: 'to_east', progress: 30, isWaiting: true, destinationName: 'Organic Market', reached: false }
    ],
    pedestrians: [
      { id: 'p1', name: 'Uncle Femi & Puppy', emoji: '🐕🚶', progress: 0, isWaiting: true, isCrossing: false, reached: false }
    ],
    allowedCommands: ['IF_PEDESTRIAN_WAITING', 'ALLOW_PEDESTRIANS', 'SET_GREEN'],
    speechText: 'Use conditional logic! Tap IF Pedestrian Waiting, then add Turn Green, and press Run.',
    lizzyHint: 'Tap "IF PEDESTRIAN WAITING", then tap "TURN GREEN", and press the green RUN button!',
    targetExplanation: 'Conditional statements check real-time sensors before deciding which action to trigger.'
  },
  // Level 7: Multi-Vehicle Anti-Gridlock
  {
    level: 7,
    title: 'City Center Anti-Gridlock',
    topic: 'Multi-Vehicle Scheduling',
    instruction: 'Three vehicles arrived at once! East-West vehicles go first, then switch roads so Sunny Bus can go. Get all 3 vehicles to their destinations!',
    levelType: 'multi_vehicle',
    initialEastWestLight: 'GREEN',
    initialNorthSouthLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Speedy Taxi', emoji: '🚕', color: '#F59E0B', road: 'east_west', direction: 'to_east', progress: 15, isWaiting: false, destinationName: 'City Center', reached: false },
      { id: 'v2', name: 'Sunny Bus', emoji: '🚌', color: '#EAB308', road: 'north_south', direction: 'to_south', progress: 15, isWaiting: true, destinationName: 'High School', reached: false },
      { id: 'v3', name: "Timi's Bike", emoji: '🚲', color: '#06B6D4', road: 'east_west', direction: 'to_east', progress: 0, isWaiting: false, destinationName: 'Sports Arena', reached: false }
    ],
    allowedCommands: ['SET_GREEN', 'SWITCH_ROADS', 'WAIT_3_SEC'],
    speechText: 'Let the East-West vehicles pass, then tap Switch Road to let Sunny Bus through!',
    lizzyHint: 'Wait for Speedy Taxi and Timi’s Bike to pass on East-West, then tap SWITCH ROADS for Sunny Bus!',
    targetExplanation: 'Smart queue scheduling keeps high-density traffic flowing without deadlock.'
  },
  // Level 8: Debug a Stuck Traffic Light
  {
    level: 8,
    title: 'Traffic Rule Debugger',
    topic: 'Debugging Stuck Signals',
    instruction: 'A bug in the computer turned the light RED forever, leaving Little Blue stuck! Delete or replace the BUGGY RED block with TURN GREEN, then press RUN!',
    levelType: 'debugging',
    initialEastWestLight: 'RED',
    vehicles: [
      { id: 'v1', name: 'Little Blue', emoji: '🚗', color: '#3B82F6', road: 'east_west', direction: 'to_east', progress: 30, isWaiting: true, destinationName: 'City Hospital', reached: false }
    ],
    buggyCommands: [
      { id: 'b1', type: 'WAIT_3_SEC', label: 'WAIT 3 SECONDS', color: 'bg-indigo-600' },
      { id: 'b2', type: 'SET_RED', label: 'TURN LIGHT RED (BUG!)', color: 'bg-rose-600' },
      { id: 'b3', type: 'WAIT_3_SEC', label: 'WAIT 3 SECONDS', color: 'bg-indigo-600' }
    ],
    allowedCommands: ['SET_GREEN', 'SET_YELLOW', 'SET_RED'],
    speechText: 'Find the bug! Step 2 turns the light Red, keeping Little Blue stuck. Remove it and add Turn Green!',
    lizzyHint: 'Click the trash can next to Step 2 (TURN LIGHT RED BUG!), tap "TURN LIGHT GREEN", and press RUN!',
    targetExplanation: 'Debugging detects erroneous instructions that lead to infinite loops or stalled states.'
  }
];

export default function TrafficRescue({ initialLevel }: { initialLevel?: number } = {}) {
  const router = useRouter();

  // Level State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(
    initialLevel ? Math.max(0, Math.min(TRAFFIC_LEVELS.length - 1, initialLevel - 1)) : 0
  );
  const currentLevel = TRAFFIC_LEVELS[currentLevelIdx] || TRAFFIC_LEVELS[0];

  // User Interaction Tracking (Prevents Auto-Complete)
  const [userInteracted, setUserInteracted] = useState(false);
  const [hasExecutedCode, setHasExecutedCode] = useState(false);

  // Traffic State
  const [eastWestLight, setEastWestLight] = useState<LightColor>(currentLevel.initialEastWestLight);
  const [northSouthLight, setNorthSouthLight] = useState<LightColor>(currentLevel.initialNorthSouthLight || 'RED');
  const [pedestrianSignal, setPedestrianSignal] = useState<'WALK' | 'STOP'>('STOP');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pedestrians, setPedestrians] = useState<Pedestrian[]>([]);

  // Coding Deck State
  const [commandDeck, setCommandDeck] = useState<CommandBlock[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState<number | null>(null);

  // Gamification & Progress State
  const [dolaCoins, setDolaCoins] = useState(120);
  const [xp, setXp] = useState(250);
  const [cityPoints, setCityPoints] = useState(180);
  const [stars, setStars] = useState(3);
  const [vehiclesGuidedCount, setVehiclesGuidedCount] = useState(0);
  const [pedestriansSavedCount, setPedestriansSavedCount] = useState(0);
  const [cityUpgrades, setCityUpgrades] = useState<CityUpgrade[]>(AVAILABLE_UPGRADES);
  const [earnedBadges, setEarnedBadges] = useState<string[]>(['Road Helper']);

  // Analytics Metrics
  const [attempts, setAttempts] = useState(1);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [sequencingScore, setSequencingScore] = useState(100);
  const [logicScore, setLogicScore] = useState(100);
  const [conditionScore, setConditionScore] = useState(100);
  const [timingScore, setTimingScore] = useState(100);
  const [debugScore, setDebugScore] = useState(100);

  // Modals & Feedback
  const [showLevelSuccess, setShowLevelSuccess] = useState(false);
  const [showFinaleModal, setShowFinaleModal] = useState(false);
  const [showUpgradeStore, setShowUpgradeStore] = useState(false);
  const [showHelpGuide, setShowHelpGuide] = useState(false);
  const [lizzyMessage, setLizzyMessage] = useState<string | null>(null);
  const [isBrakingWarning, setIsBrakingWarning] = useState(false);

  // Sound and Speech
  const [isMuted, setIsMuted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Fetch initial progress from Backend
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:8000/api/traffic-rescue/progress/', {
          headers: { Authorization: `Token ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.progress) {
            const p = data.progress;
            setDolaCoins(p.dola_coins || 120);
            setXp(p.xp_earned || 250);
            setCityPoints(p.city_points || 180);
            setVehiclesGuidedCount(p.vehicles_guided || 0);
            setPedestriansSavedCount(p.pedestrians_saved || 0);
            setEarnedBadges(p.badges || ['Road Helper']);

            if (p.city_upgrades && Array.isArray(p.city_upgrades)) {
              setCityUpgrades(prev =>
                prev.map(u => ({ ...u, unlocked: u.unlocked || p.city_upgrades.includes(u.id) }))
              );
            }
          }
        }
      } catch (err) {
        console.warn('TrafficRescue: Unable to load backend progress:', err);
      }
    };
    fetchProgress();
  }, []);

  // Read Aloud Helper with Web Speech API (Female Voice)
  const speakText = useCallback((text: string) => {
    if (isMuted) return;
    speakFemale(text, {
      rate: 0.92,
      pitch: 1.15,
    });
  }, [isMuted]);

  // Initialize current level
  const initLevel = useCallback((lvlIdx: number) => {
    const lvl = TRAFFIC_LEVELS[lvlIdx] || TRAFFIC_LEVELS[0];
    setEastWestLight(lvl.initialEastWestLight);
    setNorthSouthLight(lvl.initialNorthSouthLight || 'RED');
    setPedestrianSignal('STOP');
    setIsExecuting(false);
    setActiveStepIdx(null);
    setShowLevelSuccess(false);
    setShowFinaleModal(false);
    setIsBrakingWarning(false);
    setLizzyMessage(null);
    setUserInteracted(false);
    setHasExecutedCode(false);

    // Deep clone vehicles
    setVehicles(lvl.vehicles.map(v => ({ ...v, progress: v.progress, isWaiting: v.isWaiting, reached: false })));

    // Deep clone pedestrians
    if (lvl.pedestrians) {
      setPedestrians(lvl.pedestrians.map(p => ({ ...p, progress: p.progress, isWaiting: p.isWaiting, isCrossing: false, reached: false })));
    } else {
      setPedestrians([]);
    }

    // Buggy sequence or clear deck
    if (lvl.levelType === 'debugging' && lvl.buggyCommands) {
      setCommandDeck(lvl.buggyCommands.map(b => ({ ...b, id: Math.random().toString(36).substring(7) })));
    } else {
      setCommandDeck([]);
    }

    // Auto read aloud instruction
    setTimeout(() => {
      speakText(lvl.speechText);
    }, 400);
  }, [speakText]);

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx, initLevel]);

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    trafficSounds.muted = nextMuted;
    if (nextMuted) {
      stopSpeech();
    }
  };

  // Switch Light Helper for Level 1, 2
  const setEastWestLightState = (color: LightColor) => {
    trafficSounds.playClick();
    setUserInteracted(true);
    setEastWestLight(color);
    if (color === 'GREEN') {
      trafficSounds.playEngine();
    } else {
      trafficSounds.playBrake();
    }
  };

  const switchCrossroads = () => {
    trafficSounds.playClick();
    setUserInteracted(true);
    if (eastWestLight === 'GREEN') {
      setEastWestLight('RED');
      setNorthSouthLight('GREEN');
      trafficSounds.playHonk();
    } else {
      setEastWestLight('GREEN');
      setNorthSouthLight('RED');
      trafficSounds.playHonk();
    }
  };

  const togglePedestrianCrossing = () => {
    trafficSounds.playClick();
    setUserInteracted(true);
    if (pedestrianSignal === 'STOP') {
      setEastWestLight('RED');
      setNorthSouthLight('RED');
      setPedestrianSignal('WALK');
      trafficSounds.playCrosswalkChime();
    } else {
      setPedestrianSignal('STOP');
      setEastWestLight('GREEN');
    }
  };

  // Main Traffic Simulation Loop (Strict Physical Stopping & Passing)
  useEffect(() => {
    let lastTime = performance.now();
    const STOP_LINE = 35; // Position before intersection crosswalk

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update Vehicles
      setVehicles(prevVehicles => {
        let changed = false;
        const nextVehicles = prevVehicles.map(veh => {
          if (veh.reached) return veh;

          // Determine relevant traffic light for this vehicle
          const light = veh.road === 'east_west' ? eastWestLight : northSouthLight;
          const isCrosswalkActive = pedestrianSignal === 'WALK';
          const hasCrossedIntersection = veh.progress > (STOP_LINE + 10);

          if (hasCrossedIntersection) {
            // Already cleared the intersection: drive forward to destination!
            const nextProgress = Math.min(100, veh.progress + 28 * delta);
            const reached = nextProgress >= 100;
            if (reached && !veh.reached) {
              trafficSounds.playHonk();
            }
            changed = true;
            return {
              ...veh,
              progress: nextProgress,
              isWaiting: false,
              reached
            };
          } else {
            // Approaching or at the intersection stop line
            const canPass = light === 'GREEN' && !isCrosswalkActive;

            if (canPass) {
              // Light is GREEN and zebra crosswalk is clear -> GO!
              const nextProgress = Math.min(100, veh.progress + (veh.isWaiting ? 22 : 28) * delta);
              const reached = nextProgress >= 100;
              if (reached && !veh.reached) {
                trafficSounds.playHonk();
              }
              changed = true;
              return {
                ...veh,
                progress: nextProgress,
                isWaiting: false,
                reached
              };
            } else {
              // Light is RED or YELLOW or pedestrians are crossing -> MUST STOP AT STOP_LINE!
              if (veh.progress < STOP_LINE) {
                const nextProgress = Math.min(STOP_LINE, veh.progress + 18 * delta);
                const isWaiting = nextProgress >= STOP_LINE;
                if (isWaiting && !veh.isWaiting) {
                  trafficSounds.playBrake();
                }
                changed = true;
                return {
                  ...veh,
                  progress: nextProgress,
                  isWaiting
                };
              } else {
                // Hold firmly at STOP_LINE
                if (!veh.isWaiting) {
                  changed = true;
                }
                return {
                  ...veh,
                  progress: STOP_LINE,
                  isWaiting: true
                };
              }
            }
          }
        });
        return changed ? nextVehicles : prevVehicles;
      });

      // Update Pedestrians
      setPedestrians(prevPedestrians => {
        let changed = false;
        const nextPedestrians = prevPedestrians.map(ped => {
          if (ped.reached) return ped;

          if (pedestrianSignal === 'WALK') {
            const nextProgress = Math.min(100, ped.progress + 24 * delta);
            const reached = nextProgress >= 100;
            changed = true;
            return {
              ...ped,
              progress: nextProgress,
              isWaiting: false,
              isCrossing: true,
              reached
            };
          } else {
            if (ped.isCrossing) {
              changed = true;
            }
            return {
              ...ped,
              isWaiting: true,
              isCrossing: false
            };
          }
        });
        return changed ? nextPedestrians : prevPedestrians;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [eastWestLight, northSouthLight, pedestrianSignal]);

  // Check Level Win Conditions (Requires Deliberate User Actions)
  useEffect(() => {
    if (showLevelSuccess || showFinaleModal) return;

    // Guard: Player MUST have actively interacted! Levels never complete on their own.
    if (!userInteracted) return;

    // Guard: For coding levels (5, 6, 8), player must have pressed RUN
    const isCodingLevel = currentLevel.levelType === 'timed_sequence' ||
                          currentLevel.levelType === 'conditional' ||
                          currentLevel.levelType === 'debugging';
    if (isCodingLevel && !hasExecutedCode) return;

    // Guard: For Level 8 (debugging), verify bug block was removed
    if (currentLevel.levelType === 'debugging') {
      const hasBug = commandDeck.some(c => c.type === 'SET_RED' || c.label.includes('BUG'));
      const hasGreen = commandDeck.some(c => c.type === 'SET_GREEN');
      if (hasBug || !hasGreen) return;
    }

    // Guard: For Level 5, verify green was arranged
    if (currentLevel.levelType === 'timed_sequence') {
      const hasGreen = commandDeck.some(c => c.type === 'SET_GREEN');
      if (!hasGreen) return;
    }

    // Guard: All vehicles must have finished their journey
    const allVehiclesDone = vehicles.length > 0 && vehicles.every(v => v.reached);

    // Guard: All pedestrians must have crossed safely
    const allPedestriansDone = pedestrians.length === 0 || pedestrians.every(p => p.reached);

    if (allVehiclesDone && allPedestriansDone) {
      // Award Stars & Trigger celebration
      trafficSounds.playSuccess();
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });

      const bonusPoints = 100 + currentLevel.level * 25;
      const bonusCoins = 20;
      const bonusXp = 50;

      setCityPoints(cp => cp + bonusPoints);
      setDolaCoins(dc => dc + bonusCoins);
      setXp(x => x + bonusXp);
      setVehiclesGuidedCount(vg => vg + vehicles.length);
      if (pedestrians.length > 0) {
        setPedestriansSavedCount(ps => ps + pedestrians.length);
      }

      // Check Badges
      const newBadges = [...earnedBadges];
      if (currentLevel.level >= 1 && !newBadges.includes('Road Helper')) newBadges.push('Road Helper');
      if (currentLevel.level >= 3 && !newBadges.includes('Safe Driver')) newBadges.push('Safe Driver');
      if (currentLevel.level >= 5 && !newBadges.includes('Traffic Boss')) newBadges.push('Traffic Boss');
      if (currentLevel.level >= 6 && !newBadges.includes('Logic Controller')) newBadges.push('Logic Controller');
      if (currentLevel.level >= 8 && !newBadges.includes('City Coder')) newBadges.push('City Coder');
      setEarnedBadges(newBadges);

      // Save to Backend
      saveProgressToBackend(bonusCoins, bonusPoints, currentLevel.level, newBadges);

      if (currentLevel.level === TRAFFIC_LEVELS.length) {
        setShowFinaleModal(true);
      } else {
        setShowLevelSuccess(true);
      }
    }
  }, [vehicles, pedestrians, showLevelSuccess, showFinaleModal, currentLevel, earnedBadges, userInteracted, hasExecutedCode, commandDeck]);

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
        city_points: cityPoints + bonusPoints,
        accuracy: 95.0,
        attempts: attempts,
        vehicles_guided: vehiclesGuidedCount + vehicles.length,
        pedestrians_saved: pedestriansSavedCount + (pedestrians.length || 0),
        sequencing_ability: sequencingScore,
        logical_reasoning: logicScore,
        condition_usage: conditionScore,
        timing_accuracy: timingScore,
        debugging_accuracy: debugScore,
        hints_used: hintsUsed,
        time_spent_seconds: durationSec,
        city_upgrades: cityUpgrades.filter(u => u.unlocked).map(u => u.id),
        badges: badgesList
      };

      await fetch('http://localhost:8000/api/traffic-rescue/save-progress/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('TrafficRescue: Failed to save progress:', err);
    }
  };

  // Add Command to Deck
  const addCommand = (type: CommandType) => {
    trafficSounds.playClick();
    setUserInteracted(true);
    let label = '';
    let color = 'bg-blue-600';

    switch (type) {
      case 'SET_GREEN':
        label = 'TURN LIGHT GREEN';
        color = 'bg-emerald-600';
        break;
      case 'SET_YELLOW':
        label = 'TURN LIGHT YELLOW';
        color = 'bg-amber-500';
        break;
      case 'SET_RED':
        label = 'TURN LIGHT RED';
        color = 'bg-rose-600';
        break;
      case 'WAIT_3_SEC':
        label = 'WAIT 3 SECONDS';
        color = 'bg-indigo-600';
        break;
      case 'ALLOW_PEDESTRIANS':
        label = 'ALLOW PEDESTRIANS';
        color = 'bg-teal-600';
        break;
      case 'IF_PEDESTRIAN_WAITING':
        label = 'IF PEDESTRIAN WAITING -> STOP CARS';
        color = 'bg-purple-600';
        break;
      case 'IF_CAR_WAITING':
        label = 'IF CAR WAITING -> TURN GREEN';
        color = 'bg-sky-600';
        break;
      case 'SWITCH_ROADS':
        label = 'SWITCH CROSSROAD ROADS';
        color = 'bg-violet-600';
        break;
    }

    setCommandDeck(prev => [...prev, { id: Math.random().toString(36).substring(7), type, label, color }]);
  };

  const removeCommand = (id: string) => {
    trafficSounds.playClick();
    setUserInteracted(true);
    setCommandDeck(prev => prev.filter(c => c.id !== id));
  };

  const clearDeck = () => {
    trafficSounds.playClick();
    setCommandDeck([]);
    initLevel(currentLevelIdx);
  };

  // Run Code Commands Sequentially
  const runCodeDeck = async () => {
    if (commandDeck.length === 0 || isExecuting) return;

    setUserInteracted(true);
    setIsExecuting(true);
    setAttempts(a => a + 1);

    for (let i = 0; i < commandDeck.length; i++) {
      setActiveStepIdx(i);
      const cmd = commandDeck[i];

      trafficSounds.playClick();

      if (cmd.type === 'SET_GREEN') {
        setEastWestLight('GREEN');
        trafficSounds.playEngine();
        await new Promise(r => setTimeout(r, 2200));
      } else if (cmd.type === 'SET_YELLOW') {
        setEastWestLight('YELLOW');
        await new Promise(r => setTimeout(r, 1200));
      } else if (cmd.type === 'SET_RED') {
        setEastWestLight('RED');
        trafficSounds.playBrake();
        await new Promise(r => setTimeout(r, 1000));
      } else if (cmd.type === 'WAIT_3_SEC') {
        await new Promise(r => setTimeout(r, 2800));
      } else if (cmd.type === 'ALLOW_PEDESTRIANS') {
        setEastWestLight('RED');
        setPedestrianSignal('WALK');
        trafficSounds.playCrosswalkChime();
        await new Promise(r => setTimeout(r, 3200));
        setPedestrianSignal('STOP');
      } else if (cmd.type === 'IF_PEDESTRIAN_WAITING') {
        const hasPedWaiting = pedestrians.some(p => p.isWaiting && !p.reached);
        if (hasPedWaiting) {
          setEastWestLight('RED');
          setPedestrianSignal('WALK');
          trafficSounds.playCrosswalkChime();
          await new Promise(r => setTimeout(r, 3200));
          setPedestrianSignal('STOP');
        } else {
          setEastWestLight('GREEN');
          await new Promise(r => setTimeout(r, 2000));
        }
      } else if (cmd.type === 'SWITCH_ROADS') {
        switchCrossroads();
        await new Promise(r => setTimeout(r, 2400));
      }

      await new Promise(r => setTimeout(r, 600));
    }

    setIsExecuting(false);
    setActiveStepIdx(null);
    setHasExecutedCode(true);

    // If vehicles are still stuck after running
    setTimeout(() => {
      const stillStuck = vehicles.some(v => !v.reached);
      if (stillStuck) {
        setIsBrakingWarning(true);
        trafficSounds.playHonk();
        setLizzyMessage(currentLevel.lizzyHint);
        speakText(currentLevel.lizzyHint);
      }
    }, 1200);
  };

  // Buy City Upgrade
  const buyUpgrade = (upgrade: CityUpgrade) => {
    if (cityPoints >= upgrade.cost && !upgrade.unlocked) {
      trafficSounds.playUpgrade();
      confetti({ particleCount: 40, spread: 50 });
      setCityPoints(cp => cp - upgrade.cost);
      setCityUpgrades(prev =>
        prev.map(u => (u.id === upgrade.id ? { ...u, unlocked: true } : u))
      );
    }
  };

  // Advance to Next Level
  const handleNextLevel = () => {
    trafficSounds.playClick();
    if (currentLevelIdx < TRAFFIC_LEVELS.length - 1) {
      setCurrentLevelIdx(c => c + 1);
    } else {
      router.push('/stage1');
    }
  };

  // Replay Current Level
  const handleReplay = () => {
    trafficSounds.playClick();
    initLevel(currentLevelIdx);
  };

  // Jump to Specific Level
  const jumpToLevel = (levelIndex: number) => {
    trafficSounds.playClick();
    setCurrentLevelIdx(levelIndex);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* --- Top Navigation Bar --- */}
      <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/stage1')}
            className="px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5 border border-slate-600"
          >
            <Map className="w-4 h-4 text-amber-400" />
            <span>Stage 1 Map</span>
          </button>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 flex items-center gap-1.5">
              <span>🚦 Traffic Rescue</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Part 13 • Lvl {currentLevel.level}/8
              </span>
            </h1>
            <p className="text-xs text-slate-400">{currentLevel.title} — {currentLevel.topic}</p>
          </div>
        </div>

        {/* Level Quick Selector Pills */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
          {TRAFFIC_LEVELS.map((lvl, idx) => (
            <button
              key={lvl.level}
              onClick={() => jumpToLevel(idx)}
              className={`w-7 h-7 rounded-xl text-xs font-black transition-all flex items-center justify-center ${
                currentLevelIdx === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={`Jump to Level ${lvl.level}: ${lvl.title}`}
            >
              {lvl.level}
            </button>
          ))}
        </div>

        {/* Gamification Stats Deck */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
          {/* City Points */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
            <span className="text-sm">🏙️</span>
            <span>{cityPoints}</span>
            <span className="hidden md:inline text-[10px] text-indigo-400 font-normal">PTS</span>
          </div>

          {/* DolaCoins */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <span className="text-sm">🪙</span>
            <span>{dolaCoins}</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{xp} XP</span>
          </div>

          {/* City Upgrade Store Pill */}
          <button
            onClick={() => setShowUpgradeStore(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold transition-all shadow-sm"
          >
            <span>🏙️</span>
            <span className="hidden sm:inline">Upgrades</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => {
              trafficSounds.playClick();
              setShowHelpGuide(true);
            }}
            className="p-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-slate-300 transition-all border border-slate-600"
            title="How to play"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>

          {/* Audio Mute Button */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                : 'bg-slate-700/80 border-slate-600 text-emerald-400'
            }`}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Level Tabs */}
      <div className="md:hidden flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800/60 border-b border-slate-700 overflow-x-auto">
        {TRAFFIC_LEVELS.map((lvl, idx) => (
          <button
            key={lvl.level}
            onClick={() => jumpToLevel(idx)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              currentLevelIdx === idx
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            L{lvl.level}
          </button>
        ))}
      </div>

      {/* --- Main Interactive Stage --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row gap-5 items-stretch">
        
        {/* Left Column: Visual Miniature City Simulation */}
        <div className="flex-1 flex flex-col gap-3">
          
          {/* Mission Instruction Card */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 border border-slate-700 rounded-2xl p-3.5 sm:p-4 shadow-lg flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                🚦
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">Mission {currentLevel.level}</span>
                  <span className="text-[11px] text-slate-400">• {currentLevel.topic}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-100 mt-0.5 leading-snug">
                  {currentLevel.instruction}
                </p>
              </div>
            </div>

            <button
              onClick={() => speakText(currentLevel.speechText)}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 transition-all shrink-0 border border-slate-600"
              title="Read instruction aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Miniature City Canvas (Interactive SVG & CSS Canvas) */}
          <div className="flex-1 min-h-[380px] sm:min-h-[440px] bg-emerald-950/40 border-2 border-emerald-800/60 rounded-3xl p-4 relative overflow-hidden flex items-center justify-center shadow-2xl">
            
            {/* Background City Scenery Tiles */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

            {/* City Landmarks & Buildings */}
            <div className="absolute top-3 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur text-xs font-bold text-sky-300 shadow">
              <span>🏫</span>
              <span>Dola Primary School</span>
            </div>

            <div className="absolute top-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur text-xs font-bold text-emerald-300 shadow">
              <span>🌳</span>
              <span>City Garden Park</span>
            </div>

            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur text-xs font-bold text-amber-300 shadow">
              <span>🥖</span>
              <span>Sunny Bakery</span>
            </div>

            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 backdrop-blur text-xs font-bold text-rose-300 shadow">
              <span>🏥</span>
              <span>Central Hospital</span>
            </div>

            {/* Unlocked City Upgrades Overlay */}
            {cityUpgrades.filter(u => u.unlocked).map(u => (
              <div key={u.id} className="absolute z-10 animate-bounce duration-1000" style={{
                top: u.id === 'cable_bridge' ? '12%' : u.id === 'city_fountain' ? '80%' : '14%',
                left: u.id === 'cable_bridge' ? '46%' : u.id === 'solar_lamps' ? '28%' : '72%'
              }}>
                <span className="text-2xl drop-shadow-md" title={u.name}>{u.emoji}</span>
              </div>
            ))}

            {/* --- The Roads --- */}
            {/* Horizontal Road (East-West) */}
            <div className="absolute w-full h-24 bg-slate-800 border-y-4 border-slate-600 flex items-center justify-between px-2 shadow-inner">
              {/* White Dashed Center Line */}
              <div className="absolute left-0 right-0 h-0.5 border-t-2 border-dashed border-white/60"></div>

              {/* Stop Line (Painted White Line at 35%) */}
              <div className="absolute left-[35%] top-0 bottom-0 w-1.5 bg-white shadow-sm z-10"></div>

              {/* Zebra Crosswalk Stripes (Center Intersection) */}
              <div className="absolute left-1/2 -translate-x-1/2 w-16 h-full flex justify-between px-1 pointer-events-none opacity-85">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="w-1.5 h-full bg-white shadow-sm rounded-sm"></div>
                ))}
              </div>
            </div>

            {/* Vertical Road (North-South, if crossroads level) */}
            {(currentLevel.levelType === 'dual_road' || currentLevel.levelType === 'multi_vehicle') && (
              <div className="absolute h-full w-24 bg-slate-800 border-x-4 border-slate-600 flex items-center justify-between py-2 shadow-inner">
                {/* White Dashed Center Line */}
                <div className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-white/60 left-1/2 -translate-x-1/2"></div>
                {/* North Stop Line */}
                <div className="absolute top-[35%] left-0 right-0 h-1.5 bg-white shadow-sm z-10"></div>
              </div>
            )}

            {/* --- Traffic Light Post (Interactive Clickable Lamps) --- */}
            <div className="absolute top-1/2 -translate-y-1/2 left-[33%] z-20 flex flex-col items-center">
              {/* Post Pole */}
              <div className="w-2.5 h-10 bg-slate-700 border border-slate-900 rounded-sm mb-1"></div>

              {/* 3-Lamp Signal Housing */}
              <div className="bg-slate-950 p-2 rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col gap-2 items-center">
                {/* RED LAMP */}
                <button
                  onClick={() => setEastWestLightState('RED')}
                  className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                    eastWestLight === 'RED'
                      ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e] border-2 border-white scale-110 text-white animate-pulse'
                      : 'bg-rose-950/60 border border-rose-900/80 text-rose-700 hover:bg-rose-900/40'
                  }`}
                  title="Switch to RED (STOP)"
                >
                  {eastWestLight === 'RED' ? '●' : ''}
                </button>

                {/* YELLOW LAMP */}
                <button
                  onClick={() => setEastWestLightState('YELLOW')}
                  className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                    eastWestLight === 'YELLOW'
                      ? 'bg-amber-400 shadow-[0_0_20px_#fbbf24] border-2 border-white scale-110 text-slate-900'
                      : 'bg-amber-950/60 border border-amber-900/80 text-amber-700 hover:bg-amber-900/40'
                  }`}
                  title="Switch to YELLOW (READY)"
                >
                  {eastWestLight === 'YELLOW' ? '●' : ''}
                </button>

                {/* GREEN LAMP */}
                <button
                  onClick={() => setEastWestLightState('GREEN')}
                  className={`w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center font-bold text-xs ${
                    eastWestLight === 'GREEN'
                      ? 'bg-emerald-400 shadow-[0_0_22px_#34d399] border-2 border-white scale-110 text-slate-950'
                      : 'bg-emerald-950/60 border border-emerald-900/80 text-emerald-800 hover:bg-emerald-900/40'
                  }`}
                  title="Switch to GREEN (GO)"
                >
                  {eastWestLight === 'GREEN' ? '●' : ''}
                </button>
              </div>

              {/* Status Label */}
              <div className="mt-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                {eastWestLight === 'GREEN' ? '🟢 GO' : eastWestLight === 'YELLOW' ? '🟡 READY' : '🔴 STOP'}
              </div>
            </div>

            {/* Pedestrian Crossing Signal (If Pedestrian Level) */}
            {(currentLevel.levelType === 'pedestrian' || currentLevel.pedestrians) && (
              <div className="absolute top-[28%] right-[36%] z-20 flex flex-col items-center">
                <button
                  onClick={togglePedestrianCrossing}
                  className={`px-3 py-2 rounded-2xl border-2 transition-all flex items-center gap-2 shadow-xl ${
                    pedestrianSignal === 'WALK'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_18px_#10b981] scale-105'
                      : 'bg-slate-900 border-slate-700 text-rose-400 hover:border-slate-500'
                  }`}
                  title="Toggle Pedestrian Walk Signal"
                >
                  <span className="text-xl">{pedestrianSignal === 'WALK' ? '🚶‍♂️' : '✋'}</span>
                  <div className="text-left">
                    <p className="text-[10px] font-extrabold uppercase">{pedestrianSignal === 'WALK' ? 'WALK NOW' : 'WAIT'}</p>
                    <p className="text-[9px] text-slate-400">Crosswalk</p>
                  </div>
                </button>
              </div>
            )}

            {/* --- Vehicles on the Road --- */}
            {vehicles.map(veh => {
              // Calculate coordinate based on progress
              const isEastWest = veh.road === 'east_west';
              const leftPercent = isEastWest ? `${veh.progress * 0.9}%` : '50%';
              const topPercent = isEastWest ? '47%' : `${veh.progress * 0.8}%`;

              return (
                <div
                  key={veh.id}
                  className={`absolute z-30 transition-all duration-100 flex flex-col items-center pointer-events-none`}
                  style={{
                    left: leftPercent,
                    top: topPercent,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Speech balloon if stopped */}
                  {veh.isWaiting && !veh.reached && (
                    <div className="mb-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-md flex items-center gap-1 animate-bounce">
                      <span>Waiting at Light...</span>
                    </div>
                  )}

                  {/* Vehicle Emoji & Body */}
                  <div className="text-3xl sm:text-4xl filter drop-shadow-md">
                    {veh.emoji}
                  </div>

                  <span className="text-[10px] font-bold text-white bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-700">
                    {veh.name}
                  </span>
                </div>
              );
            })}

            {/* --- Pedestrians Crossing --- */}
            {pedestrians.map(ped => {
              // Pedestrians walk vertically across the crosswalk
              const topPercent = `${25 + ped.progress * 0.5}%`;
              const leftPercent = '50%';

              return (
                <div
                  key={ped.id}
                  className="absolute z-30 transition-all duration-100 flex flex-col items-center pointer-events-none"
                  style={{
                    top: topPercent,
                    left: leftPercent,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className={`text-3xl filter drop-shadow-lg ${ped.isCrossing ? 'animate-bounce' : ''}`}>
                    {ped.emoji}
                  </div>
                  <span className="text-[9px] font-bold text-white bg-slate-900/80 px-1 py-0.2 rounded border border-slate-700 mt-0.5">
                    {ped.name}
                  </span>
                </div>
              );
            })}

            {/* Gentle Lizzy Warning Overlay */}
            {isBrakingWarning && lizzyMessage && (
              <div className="absolute bottom-4 inset-x-4 z-40 bg-slate-900/95 border-2 border-amber-500 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-slide-up">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl shrink-0">
                    🤖
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-300">Lizzy Traffic Helper:</p>
                    <p className="text-xs text-slate-200">{lizzyMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBrakingWarning(false)}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Got it!
                </button>
              </div>
            )}
          </div>

          {/* Quick Action Bar: Tailored to Level Mechanics */}
          {currentLevel.levelType === 'direct_light' && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow">
              <span className="text-xs text-slate-300 font-medium">
                Tap light or button to control: <strong className="text-emerald-400">GREEN</strong> (Go), <strong className="text-rose-400">RED</strong> (Stop)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEastWestLightState('GREEN')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>🟢 Set Green (GO)</span>
                </button>
                <button
                  onClick={() => setEastWestLightState('RED')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>🔴 Set Red (STOP)</span>
                </button>
              </div>
            </div>
          )}

          {currentLevel.levelType === 'dual_road' && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow">
              <span className="text-xs text-slate-300 font-medium">
                East Road: <strong className={eastWestLight === 'GREEN' ? 'text-emerald-400' : 'text-rose-400'}>{eastWestLight}</strong> • North Road: <strong className={northSouthLight === 'GREEN' ? 'text-emerald-400' : 'text-rose-400'}>{northSouthLight}</strong>
              </span>
              <button
                onClick={switchCrossroads}
                className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <span>🔄 Switch Active Road</span>
              </button>
            </div>
          )}

          {currentLevel.levelType === 'pedestrian' && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow">
              <span className="text-xs text-slate-300 font-medium">
                Zebra Crossing: <strong className={pedestrianSignal === 'WALK' ? 'text-emerald-400' : 'text-amber-400'}>{pedestrianSignal === 'WALK' ? 'CHILDREN CROSSING' : 'WAITING'}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    trafficSounds.playClick();
                    setUserInteracted(true);
                    setEastWestLight('RED');
                    setPedestrianSignal('WALK');
                    trafficSounds.playCrosswalkChime();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>🚶‍♂️ Allow Pedestrians (Walk Signal)</span>
                </button>
                <button
                  onClick={() => {
                    trafficSounds.playClick();
                    setUserInteracted(true);
                    setPedestrianSignal('STOP');
                    setEastWestLight('GREEN');
                    trafficSounds.playEngine();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>🟢 Resume Car Traffic</span>
                </button>
              </div>
            </div>
          )}

          {currentLevel.levelType === 'multi_vehicle' && (
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow">
              <span className="text-xs text-slate-300 font-medium">
                Multi-Vehicle Flow: Guide all 3 vehicles safely to their destinations!
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={switchCrossroads}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>🔄 Switch Active Road</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Coding Command Deck & Controller Panel */}
        <div className="w-full lg:w-96 flex flex-col gap-3">
          
          {/* Deck Header */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3.5 flex items-center justify-between shadow">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
                ⌨️
              </div>
              <h2 className="text-sm font-bold text-white">Traffic Control Code</h2>
            </div>
            <button
              onClick={clearDeck}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-rose-400 transition-all text-xs"
              title="Clear commands"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sequence Deck Workspace */}
          <div className="flex-1 min-h-[190px] bg-slate-950/70 border-2 border-dashed border-slate-700 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto max-h-[300px] shadow-inner">
            {commandDeck.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-4">
                <span className="text-2xl mb-1 opacity-60">🧩</span>
                <p className="text-xs font-semibold">Sequence is empty</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Tap blocks below to build your automatic traffic rules!
                </p>
              </div>
            ) : (
              commandDeck.map((cmd, idx) => {
                const isActive = activeStepIdx === idx;
                return (
                  <div
                    key={cmd.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all shadow ${cmd.color} ${
                      isActive ? 'ring-4 ring-white scale-[1.02] shadow-lg' : 'opacity-95'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-black/25 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{cmd.label}</span>
                    </div>
                    {!isExecuting && (
                      <button
                        onClick={() => removeCommand(cmd.id)}
                        className="p-1 rounded hover:bg-black/20 text-white/80 hover:text-white transition-all"
                        title="Remove block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Run Code Button */}
          <button
            onClick={runCodeDeck}
            disabled={commandDeck.length === 0 || isExecuting}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              commandDeck.length === 0 || isExecuting
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-[0.98]'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Traffic Sequence...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RUN TRAFFIC SEQUENCE</span>
              </>
            )}
          </button>

          {/* Available Code Blocks Palette */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Tap Blocks to Add
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {/* Green Light Block */}
              <button
                onClick={() => addCommand('SET_GREEN')}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-emerald-500/40 shadow-sm"
              >
                <span>🟢</span>
                <span>TURN LIGHT GREEN</span>
              </button>

              {/* Yellow Light Block */}
              <button
                onClick={() => addCommand('SET_YELLOW')}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-amber-400/40 shadow-sm"
              >
                <span>🟡</span>
                <span>TURN LIGHT YELLOW</span>
              </button>

              {/* Red Light Block */}
              <button
                onClick={() => addCommand('SET_RED')}
                className="px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-rose-500/40 shadow-sm"
              >
                <span>🔴</span>
                <span>TURN LIGHT RED</span>
              </button>

              {/* Wait 3 Seconds Block */}
              <button
                onClick={() => addCommand('WAIT_3_SEC')}
                className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-indigo-500/40 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-300" />
                <span>WAIT 3 SECONDS</span>
              </button>

              {/* Allow Pedestrians Block */}
              <button
                onClick={() => addCommand('ALLOW_PEDESTRIANS')}
                className="px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-teal-500/40 shadow-sm"
              >
                <span>🚶‍♂️</span>
                <span>ALLOW PEDESTRIANS</span>
              </button>

              {/* Conditional Block */}
              <button
                onClick={() => addCommand('IF_PEDESTRIAN_WAITING')}
                className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs text-left transition-all flex items-center gap-2 border border-purple-500/40 shadow-sm"
              >
                <GitBranch className="w-3.5 h-3.5 text-purple-300" />
                <span>IF PEDESTRIAN WAITING</span>
              </button>
            </div>
          </div>

          {/* Hint Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-slate-300">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Controller Tip: </span>
              <span>{currentLevel.lizzyHint}</span>
            </div>
          </div>
        </div>
      </main>

      {/* --- LEVEL COMPLETE CELEBRATION MODAL --- */}
      {showLevelSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            
            {/* Stars Animation */}
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-100" />
              <Star className="w-10 h-10 fill-amber-400 animate-bounce delay-200" />
              <Star className="w-8 h-8 fill-amber-400 animate-bounce delay-300" />
            </div>

            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-sky-300">
              MISSION ACCOMPLISHED!
            </h3>
            <p className="text-xs text-slate-400 mt-1">Level {currentLevel.level} Complete: {currentLevel.title}</p>

            {/* Rewards Breakdown */}
            <div className="grid grid-cols-3 gap-3 my-5 w-full">
              <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">🏙️</span>
                <span className="text-xs font-black text-indigo-400">+{100 + currentLevel.level * 25}</span>
                <span className="text-[10px] text-slate-400">City Pts</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">🪙</span>
                <span className="text-xs font-black text-amber-400">+20</span>
                <span className="text-[10px] text-slate-400">Coins</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl flex flex-col items-center">
                <span className="text-lg">⭐</span>
                <span className="text-xs font-black text-emerald-400">+50</span>
                <span className="text-[10px] text-slate-400">XP</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60 leading-relaxed">
              💡 <strong>What you learned:</strong> {currentLevel.targetExplanation}
            </p>

            {/* Clear CTAs */}
            <div className="flex flex-col gap-2.5 w-full">
              <button
                onClick={handleNextLevel}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>NEXT MISSION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReplay}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={() => router.push('/stage1')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stage 1 Map</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FINALE MODAL (Level 8 Complete) --- */}
      {showFinaleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-3xl mb-3 shadow-lg">
              🏆
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300">
              CHIEF TRAFFIC CONTROLLER!
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm">
              Incredible work! You have mastered all 8 traffic control missions, automated city intersections, and kept every pedestrian and vehicle safe!
            </p>

            {/* Badges Display */}
            <div className="my-5 w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Earned Traffic Badges
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {earnedBadges.map(badge => (
                  <span
                    key={badge}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 shadow-sm"
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
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <Map className="w-4 h-4" />
                <span>RETURN TO STAGE 1 MAP</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReplay}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-sky-400" />
                  <span>Go to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CITY UPGRADES STORE MODAL --- */}
      {showUpgradeStore && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏙️</span>
                <div>
                  <h3 className="text-base font-black text-white">City Upgrade Store</h3>
                  <p className="text-xs text-slate-400">Spend City Points to upgrade your mini city!</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                <span>{cityPoints} Pts Available</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {cityUpgrades.map(upgrade => (
                <div
                  key={upgrade.id}
                  className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{upgrade.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{upgrade.name}</p>
                      <p className="text-[11px] text-slate-400">{upgrade.description}</p>
                    </div>
                  </div>

                  {upgrade.unlocked ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => buyUpgrade(upgrade)}
                      disabled={cityPoints < upgrade.cost}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        cityPoints >= upgrade.cost
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {upgrade.cost} Pts
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowUpgradeStore(false)}
              className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Close Store
            </button>
          </div>
        </div>
      )}

      {/* --- HOW TO PLAY GUIDE MODAL --- */}
      {showHelpGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🚦</span>
              <h3 className="text-base font-bold text-white">How to Play Traffic Rescue</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2">
                <span className="text-base">🟢</span>
                <p><strong>Green Light:</strong> Vehicles go smoothly through the road intersection.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2">
                <span className="text-base">🔴</span>
                <p><strong>Red Light:</strong> Vehicles stop safely before the zebra crosswalk line.</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2">
                <span className="text-base">🚶‍♂️</span>
                <p><strong>Zebra Crosswalk:</strong> Always give pedestrians priority when children or pets are crossing!</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2">
                <span className="text-base">⌨️</span>
                <p><strong>Code Commands:</strong> Use WAIT delays and IF/THEN condition blocks to automate city traffic.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpGuide(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
            >
              Got it, let’s drive!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
