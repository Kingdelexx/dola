export type Direction = 'right' | 'left' | 'up' | 'down';

export type TileType = 
  | 'grass' 
  | 'path' 
  | 'water' 
  | 'stone' 
  | 'bridge_h' 
  | 'bridge_v' 
  | 'bush';

export interface GameAction {
  type: 'step' | 'turn' | 'jump' | 'say';
  param?: number | string;
  line?: number;
}

export interface BananaItem {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  type: 'sparkle' | 'leaf';
  lifetime: number;
  maxLife: number;
}

export interface BananaLevel {
  id: number;
  title: string;
  subtitle: string;
  optimalLines: number;
  starterCode: string;
  grid: TileType[][]; // 8 rows by 10 columns
  monkeyStart: {
    x: number;
    y: number;
    dir: Direction;
  };
  bananas: { id: string; x: number; y: number }[];
  hint: string;
}

export interface ParseResult {
  actions: GameAction[];
  stdout: string[];
  error: string | null;
  errorLine: number | null;
}
