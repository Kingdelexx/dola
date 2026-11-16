'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BananaLevel, Direction, GameAction, Particle, BananaItem } from './types';
import { SpriteRenderer } from './SpriteRenderer';
import { playAppSound } from '../app-studio/audioSynth';

interface BananaTalesCanvasProps {
  level: BananaLevel;
  actionQueue: GameAction[];
  isRunning: boolean;
  onExecutionComplete: (success: boolean, bananasCollected: number) => void;
  onReset: () => void;
}

export const BananaTalesCanvas: React.FC<BananaTalesCanvasProps> = ({
  level,
  actionQueue,
  isRunning,
  onExecutionComplete,
  onReset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Logical grid coordinates
  const COLS = 10;
  const ROWS = 8;
  const CELL_SIZE = 80;
  const CANVAS_WIDTH = COLS * CELL_SIZE; // 800
  const CANVAS_HEIGHT = ROWS * CELL_SIZE; // 640

  // Monkey State
  const [monkeyGridPos, setMonkeyGridPos] = useState({ x: level.monkeyStart.x, y: level.monkeyStart.y });
  const [monkeyDir, setMonkeyDir] = useState<Direction>(level.monkeyStart.dir);
  const [bananas, setBananas] = useState<BananaItem[]>([]);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);

  // Animation interpolation state
  const animStateRef = useRef({
    visualX: level.monkeyStart.x * CELL_SIZE,
    visualY: level.monkeyStart.y * CELL_SIZE,
    fromX: level.monkeyStart.x * CELL_SIZE,
    fromY: level.monkeyStart.y * CELL_SIZE,
    targetX: level.monkeyStart.x * CELL_SIZE,
    targetY: level.monkeyStart.y * CELL_SIZE,
    isMoving: false,
    moveProgress: 1,
    moveDuration: 350, // ms per tile
    moveStartTime: 0,
    isJumping: false,
    particles: [] as Particle[],
    cameraShakeTimer: 0,
    cameraShakeIntensity: 0,
    redFlashAlpha: 0,
    animTime: 0
  });

  // Keep bananas in sync with level
  useEffect(() => {
    setBananas(level.bananas.map(b => ({ ...b, collected: false })));
    setMonkeyGridPos({ x: level.monkeyStart.x, y: level.monkeyStart.y });
    setMonkeyDir(level.monkeyStart.dir);
    setSpeechBubble(null);

    const st = animStateRef.current;
    st.visualX = level.monkeyStart.x * CELL_SIZE;
    st.visualY = level.monkeyStart.y * CELL_SIZE;
    st.fromX = st.visualX;
    st.fromY = st.visualY;
    st.targetX = st.visualX;
    st.targetY = st.visualY;
    st.isMoving = false;
    st.moveProgress = 1;
    st.particles = [];
    st.cameraShakeTimer = 0;
    st.redFlashAlpha = 0;
  }, [level]);

  // Spawn Particle Burst when banana is collected
  const spawnBananaParticles = useCallback((gx: number, gy: number) => {
    const cx = (gx + 0.5) * CELL_SIZE;
    const cy = (gy + 0.5) * CELL_SIZE;
    const newParticles: Particle[] = [];

    // 20 Golden sparkle stars
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.4;
      const speed = 2 + Math.random() * 4.5;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 5 + Math.random() * 5,
        color: Math.random() > 0.4 ? '#FFD54F' : '#FFA000',
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        type: 'sparkle',
        lifetime: 0,
        maxLife: 35 + Math.random() * 20
      });
    }

    // 10 Fluttering jungle leaves
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#7CB342' : '#66BB6A',
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        type: 'leaf',
        lifetime: 0,
        maxLife: 45 + Math.random() * 20
      });
    }

    animStateRef.current.particles.push(...newParticles);

    // Play chime sound
    try {
      playAppSound('reward');
    } catch {
      // Audio synth
    }
  }, [CELL_SIZE]);

  // Trigger Hazard Hit (Water or Bush collision)
  const triggerHazardCollision = useCallback((reason: 'water' | 'bush') => {
    const st = animStateRef.current;
    st.cameraShakeTimer = 30; // frames
    st.cameraShakeIntensity = 7;
    st.redFlashAlpha = 0.5;

    if (reason === 'water') {
      setSpeechBubble("Splash! Monkeys can't swim!");
    } else {
      setSpeechBubble("Ouch! A prickly bush!");
    }

    try {
      playAppSound('boing');
    } catch {
      // Audio fallback
    }
  }, []);

  // Execution runner for action queue with smooth sequential step interpolation
  useEffect(() => {
    if (!isRunning || actionQueue.length === 0) return;

    let isCancelled = false;
    let actionIndex = 0;
    let currentDir: Direction = monkeyDir;
    let currentX = monkeyGridPos.x;
    let currentY = monkeyGridPos.y;
    let collectedCount = bananas.filter(b => b.collected).length;

    const executeNextAction = async () => {
      if (isCancelled || actionIndex >= actionQueue.length) {
        if (!isCancelled) {
          // Check if all bananas collected
          const allCollected = bananas.every(b => b.collected) || collectedCount >= level.bananas.length;
          onExecutionComplete(allCollected, collectedCount);
        }
        return;
      }

      const action = actionQueue[actionIndex];
      actionIndex++;

      if (action.type === 'say') {
        setSpeechBubble(String(action.param || 'Yum!'));
        await new Promise(r => setTimeout(r, 600));
        setSpeechBubble(null);
        if (!isCancelled) executeNextAction();
        return;
      }

      if (action.type === 'turn') {
        const newDir = action.param as Direction;
        currentDir = newDir;
        setMonkeyDir(newDir);
        await new Promise(r => setTimeout(r, 220));
        if (!isCancelled) executeNextAction();
        return;
      }

      if (action.type === 'step' || action.type === 'jump') {
        const steps = typeof action.param === 'number' ? action.param : 1;
        const isJump = action.type === 'jump';

        // Step cell by cell for smooth interpolation
        const stepDir = steps >= 0 ? 1 : -1;
        const totalSteps = Math.abs(steps);

        let dx = 0;
        let dy = 0;
        if (currentDir === 'right') dx = stepDir;
        else if (currentDir === 'left') dx = -stepDir;
        else if (currentDir === 'down') dy = stepDir;
        else if (currentDir === 'up') dy = -stepDir;

        for (let s = 0; s < totalSteps; s++) {
          if (isCancelled) return;

          const nextX = currentX + dx;
          const nextY = currentY + dy;

          // Bounds check
          if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
            triggerHazardCollision('bush');
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Check hazard tile in level
          const targetTile = level.grid[nextY][nextX];
          if (targetTile === 'water') {
            // Smoothly move into water then splash
            await animateMove(currentX, currentY, nextX, nextY, isJump);
            currentX = nextX;
            currentY = nextY;
            setMonkeyGridPos({ x: nextX, y: nextY });
            triggerHazardCollision('water');
            onExecutionComplete(false, collectedCount);
            return;
          }

          if (targetTile === 'bush') {
            triggerHazardCollision('bush');
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Valid move: interpolate smoothly
          await animateMove(currentX, currentY, nextX, nextY, isJump);
          currentX = nextX;
          currentY = nextY;
          setMonkeyGridPos({ x: nextX, y: nextY });

          // Check if stepped onto a banana
          const foundBanana = level.bananas.find(b => b.x === nextX && b.y === nextY);
          if (foundBanana) {
            setBananas(prev =>
              prev.map(b => (b.id === foundBanana.id ? { ...b, collected: true } : b))
            );
            spawnBananaParticles(nextX, nextY);
            collectedCount++;
          }
        }

        if (!isCancelled) executeNextAction();
      }
    };

    // Helper to animate one grid cell move smoothly
    const animateMove = (
      fromGX: number,
      fromGY: number,
      toGX: number,
      toGY: number,
      isJump: boolean
    ): Promise<void> => {
      return new Promise(resolve => {
        const st = animStateRef.current;
        st.fromX = fromGX * CELL_SIZE;
        st.fromY = fromGY * CELL_SIZE;
        st.targetX = toGX * CELL_SIZE;
        st.targetY = toGY * CELL_SIZE;
        st.isMoving = true;
        st.isJumping = isJump;
        st.moveProgress = 0;
        st.moveStartTime = performance.now();

        const duration = st.moveDuration;

        const checkProgress = () => {
          if (isCancelled) {
            resolve();
            return;
          }
          if (st.moveProgress >= 1) {
            st.isMoving = false;
            st.isJumping = false;
            st.visualX = st.targetX;
            st.visualY = st.targetY;
            resolve();
          } else {
            requestAnimationFrame(checkProgress);
          }
        };
        requestAnimationFrame(checkProgress);
      });
    };

    executeNextAction();

    return () => {
      isCancelled = true;
    };
  }, [isRunning, actionQueue]);

  // 60fps HTML5 Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const st = animStateRef.current;
      st.animTime += dt;

      // Update movement interpolation if active
      if (st.isMoving) {
        const elapsed = now - st.moveStartTime;
        st.moveProgress = Math.min(elapsed / st.moveDuration, 1);
        // Smooth quadratic ease-out
        const t = st.moveProgress;
        const ease = t * (2 - t);
        st.visualX = st.fromX + (st.targetX - st.fromX) * ease;
        st.visualY = st.fromY + (st.targetY - st.fromY) * ease;
      } else {
        st.visualX = monkeyGridPos.x * CELL_SIZE;
        st.visualY = monkeyGridPos.y * CELL_SIZE;
      }

      // Update camera shake
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (st.cameraShakeTimer > 0) {
        st.cameraShakeTimer--;
        const shakeDecay = st.cameraShakeTimer / 30;
        shakeOffsetX = Math.sin(now * 0.08) * st.cameraShakeIntensity * shakeDecay;
        shakeOffsetY = Math.cos(now * 0.09) * st.cameraShakeIntensity * shakeDecay;
      }

      // Update red flash decay
      if (st.redFlashAlpha > 0) {
        st.redFlashAlpha = Math.max(0, st.redFlashAlpha - dt * 1.5);
      }

      // Update particles
      for (let i = st.particles.length - 1; i >= 0; i--) {
        const p = st.particles[i];
        p.lifetime++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gentle gravity
        p.rotation += p.rotSpeed;
        p.alpha = 1 - p.lifetime / p.maxLife;
        if (p.lifetime >= p.maxLife) {
          st.particles.splice(i, 1);
        }
      }

      // Setup High-DPI canvas resolution
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== CANVAS_WIDTH * dpr || canvas.height !== CANVAS_HEIGHT * dpr) {
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // Clear canvas with background
      ctx.fillStyle = '#FAF6EE';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Terrain Base Grid (Grass, Dirt Paths, River, Bridges)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = level.grid[r][c];
          const tx = c * CELL_SIZE;
          const ty = r * CELL_SIZE;

          if (tile === 'path') {
            SpriteRenderer.drawPathTile(ctx, tx, ty, CELL_SIZE, c, r);
          } else if (tile === 'water') {
            SpriteRenderer.drawWaterTile(ctx, tx, ty, CELL_SIZE, st.animTime);
          } else if (tile === 'stone') {
            SpriteRenderer.drawStoneRiverTile(ctx, tx, ty, CELL_SIZE, st.animTime);
          } else if (tile === 'bridge_h') {
            SpriteRenderer.drawBridgeTile(ctx, tx, ty, CELL_SIZE, 'horizontal', st.animTime);
          } else if (tile === 'bridge_v') {
            SpriteRenderer.drawBridgeTile(ctx, tx, ty, CELL_SIZE, 'vertical', st.animTime);
          } else {
            // Grass tile (also acts as base under bushes)
            SpriteRenderer.drawGrassTile(ctx, tx, ty, CELL_SIZE, c, r, st.animTime);
          }
        }
      }

      // 2. Draw Golden Bananas
      for (const b of bananas) {
        SpriteRenderer.drawBanana(
          ctx,
          b.x * CELL_SIZE,
          b.y * CELL_SIZE,
          CELL_SIZE,
          st.animTime,
          b.collected
        );
      }

      // 3. Draw Bushes
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (level.grid[r][c] === 'bush') {
            SpriteRenderer.drawBush(ctx, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, st.animTime);
          }
        }
      }

      // 4. Draw Cute Monkey Character
      SpriteRenderer.drawMonkey(
        ctx,
        st.visualX,
        st.visualY,
        CELL_SIZE,
        monkeyDir,
        st.animTime,
        st.isMoving,
        st.isJumping,
        speechBubble
      );

      // 5. Draw Particles
      SpriteRenderer.drawParticles(ctx, st.particles);

      // 6. Draw Red Flash if active
      if (st.redFlashAlpha > 0.01) {
        SpriteRenderer.drawRedFlash(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, st.redFlashAlpha);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [level, bananas, monkeyGridPos, monkeyDir, speechBubble]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 select-none">
      <div className="relative w-full aspect-10/8 max-h-[700px] rounded-3xl overflow-hidden border-4 border-[#D7CCC8] shadow-[0_12px_36px_rgba(38,50,56,0.18)] bg-[#7CB342]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          className="cursor-default"
        />

        {/* Storybook Grid Overlay Coordinates Indicator (Subtle bottom-left badge) */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#FAF6EE]/90 backdrop-blur-xs rounded-xl border border-[#D7CCC8] text-[11px] font-bold text-[#5D4037] flex items-center gap-1.5 shadow-sm font-fredoka">
          <span>Grid: 10×8</span>
          <span className="text-[#8D6E63]">•</span>
          <span>Monkey: ({monkeyGridPos.x}, {monkeyGridPos.y})</span>
        </div>
      </div>
    </div>
  );
};
