'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BananaLevel, Direction, GameAction, Particle, BananaItem, TileType } from './types';
import { SpriteRenderer } from './SpriteRenderer';
import { SoundFX } from './SoundFX';

interface BananaTalesCanvasProps {
  level: BananaLevel;
  actionQueue: GameAction[];
  isRunning: boolean;
  onExecutionComplete: (success: boolean, bananasCollected: number) => void;
  onActiveLineChange?: (line: number | null) => void;
  onReset: () => void;
}

export const BananaTalesCanvas: React.FC<BananaTalesCanvasProps> = ({
  level,
  actionQueue,
  isRunning,
  onExecutionComplete,
  onActiveLineChange,
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

  // Dynamic grid state (allows bridge.extend() to construct wooden planks in real time)
  const [dynamicGrid, setDynamicGrid] = useState<TileType[][]>(() => 
    level.grid.map(row => [...row])
  );

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
    moveDuration: 360, // ms per tile
    moveStartTime: 0,
    isJumping: false,
    particles: [] as Particle[],
    cameraShakeTimer: 0,
    cameraShakeIntensity: 0,
    redFlashAlpha: 0,
    animTime: 0
  });

  // Keep state in sync when level changes or resets
  useEffect(() => {
    setBananas(level.bananas.map(b => ({ ...b, collected: false })));
    setMonkeyGridPos({ x: level.monkeyStart.x, y: level.monkeyStart.y });
    setMonkeyDir(level.monkeyStart.dir);
    setSpeechBubble(null);
    setDynamicGrid(level.grid.map(row => [...row]));

    const st = animStateRef.current;
    st.visualX = level.monkeyStart.x * CELL_SIZE;
    st.visualY = level.monkeyStart.y * CELL_SIZE;
    st.fromX = st.visualX;
    st.fromY = st.visualY;
    st.targetX = st.visualX;
    st.targetY = st.visualY;
    st.isMoving = false;
    st.isJumping = false;
    st.moveProgress = 1;
    st.particles = [];
    st.cameraShakeTimer = 0;
    st.redFlashAlpha = 0;

    onActiveLineChange?.(null);
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

    // Synthesize bright ascending chime when grabbing banana
    SoundFX.playBananaChime();
  }, [CELL_SIZE]);

  // Spawn Sawdust wood particles when extending bridge
  const spawnWoodParticles = useCallback((gx: number, gy: number) => {
    const cx = (gx + 0.5) * CELL_SIZE;
    const cy = (gy + 0.5) * CELL_SIZE;
    const newParticles: Particle[] = [];

    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#8D6E63' : '#BCAAA4',
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        type: 'wood',
        lifetime: 0,
        maxLife: 30 + Math.random() * 15
      });
    }
    animStateRef.current.particles.push(...newParticles);

    // Synthesize wooden thud when extending bridge
    SoundFX.playBridgeThud();
  }, [CELL_SIZE]);

  // Trigger Hazard Hit (Water, Rock, or Bush collision)
  const triggerHazardCollision = useCallback((reason: 'water' | 'bush' | 'rock') => {
    const st = animStateRef.current;
    st.cameraShakeTimer = 30; // frames
    st.cameraShakeIntensity = 7;
    st.redFlashAlpha = 0.5;

    if (reason === 'water') {
      setSpeechBubble("Splash! Monkeys can't swim!");
    } else if (reason === 'rock') {
      setSpeechBubble("Ouch! It's a rock! Try monkey.jump()!");
    } else {
      setSpeechBubble("Ouch! A prickly bush!");
    }

    // Synthesize soft bonk on collision
    SoundFX.playCollisionBonk();
  }, []);

  // Helper to compute directional turn
  const computeTurnDirection = (current: Direction, dirCommand: string): Direction => {
    const cmd = dirCommand.toLowerCase();
    if (cmd === 'around') {
      if (current === 'right') return 'left';
      if (current === 'left') return 'right';
      if (current === 'up') return 'down';
      return 'up';
    }
    if (cmd === 'left') {
      if (current === 'right') return 'up';
      if (current === 'up') return 'left';
      if (current === 'left') return 'down';
      return 'right';
    }
    if (cmd === 'right') {
      if (current === 'right') return 'down';
      if (current === 'down') return 'left';
      if (current === 'left') return 'up';
      return 'right';
    }
    if (['up', 'down', 'left', 'right'].includes(cmd)) {
      return cmd as Direction;
    }
    return current;
  };

  // Execution runner for action queue with smooth sequential step interpolation & real-time line highlighting
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
          onActiveLineChange?.(null);
          const allCollected = bananas.every(b => b.collected) || collectedCount >= level.bananas.length;
          if (allCollected) {
            SoundFX.playFanfare();
          }
          onExecutionComplete(allCollected, collectedCount);
        }
        return;
      }

      const action = actionQueue[actionIndex];
      actionIndex++;

      // Highlight active executing line in code editor!
      if (action.line) {
        onActiveLineChange?.(action.line);
      }

      const actType = String(action.type).toUpperCase();

      // 1. SAY ACTION
      if (actType === 'SAY') {
        setSpeechBubble(action.message || 'Yum!');
        await new Promise(r => setTimeout(r, 600));
        setSpeechBubble(null);
        if (!isCancelled) executeNextAction();
        return;
      }

      // 2. TURN ACTION
      if (actType === 'TURN') {
        const targetDirCmd = String(action.direction || 'right');
        const newDir = computeTurnDirection(currentDir, targetDirCmd);
        currentDir = newDir;
        setMonkeyDir(newDir);
        await new Promise(r => setTimeout(r, 220));
        if (!isCancelled) executeNextAction();
        return;
      }

      // 3. BUILD_BRIDGE ACTION: bridge.extend(tiles=1)
      if (actType === 'BUILD_BRIDGE') {
        const count = typeof action.count === 'number' ? action.count : 1;
        let dx = 0;
        let dy = 0;
        if (currentDir === 'right') dx = 1;
        else if (currentDir === 'left') dx = -1;
        else if (currentDir === 'down') dy = 1;
        else if (currentDir === 'up') dy = -1;

        let builtAny = false;
        let bx = currentX;
        let by = currentY;

        for (let b = 0; b < count; b++) {
          bx += dx;
          by += dy;
          if (bx >= 0 && bx < COLS && by >= 0 && by < ROWS) {
            if (dynamicGrid[by][bx] === 'water') {
              const bridgeType: TileType = (dx !== 0) ? 'bridge_h' : 'bridge_v';
              setDynamicGrid(prev => {
                const next = prev.map(r => [...r]);
                next[by][bx] = bridgeType;
                return next;
              });
              spawnWoodParticles(bx, by);
              builtAny = true;
            }
          }
        }

        setSpeechBubble(builtAny ? 'Bridge extended!' : 'Planks ready!');
        await new Promise(r => setTimeout(r, 450));
        setSpeechBubble(null);
        if (!isCancelled) executeNextAction();
        return;
      }

      // 4. JUMP ACTION: monkey.jump() clears 1-tile rock obstacles!
      if (actType === 'JUMP') {
        let dx = 0;
        let dy = 0;
        if (currentDir === 'right') dx = 1;
        else if (currentDir === 'left') dx = -1;
        else if (currentDir === 'down') dy = 1;
        else if (currentDir === 'up') dy = -1;

        const immediateX = currentX + dx;
        const immediateY = currentY + dy;

        // If immediate tile ahead is a rock/stone obstacle, jump OVER it (2 tiles)!
        let targetX = immediateX;
        let targetY = immediateY;

        if (
          immediateX >= 0 && immediateX < COLS &&
          immediateY >= 0 && immediateY < ROWS &&
          dynamicGrid[immediateY][immediateX] === 'stone'
        ) {
          targetX = currentX + dx * 2;
          targetY = currentY + dy * 2;
        }

        // Bounds check
        if (targetX < 0 || targetX >= COLS || targetY < 0 || targetY >= ROWS) {
          triggerHazardCollision('bush');
          onActiveLineChange?.(null);
          onExecutionComplete(false, collectedCount);
          return;
        }

        // Check landing tile
        const landingTile = dynamicGrid[targetY][targetX];
        if (landingTile === 'water') {
          await animateMove(currentX, currentY, targetX, targetY, true);
          currentX = targetX;
          currentY = targetY;
          setMonkeyGridPos({ x: targetX, y: targetY });
          triggerHazardCollision('water');
          onActiveLineChange?.(null);
          onExecutionComplete(false, collectedCount);
          return;
        }

        if (landingTile === 'bush' || landingTile === 'stone') {
          triggerHazardCollision(landingTile === 'stone' ? 'rock' : 'bush');
          onActiveLineChange?.(null);
          onExecutionComplete(false, collectedCount);
          return;
        }

        // Valid jump: play warm marimba footstep and animate high arc jump
        SoundFX.playFootstep();
        await animateMove(currentX, currentY, targetX, targetY, true);
        currentX = targetX;
        currentY = targetY;
        setMonkeyGridPos({ x: targetX, y: targetY });

        // Banana collection check
        const foundBanana = level.bananas.find(b => b.x === targetX && b.y === targetY);
        if (foundBanana) {
          setBananas(prev =>
            prev.map(b => (b.id === foundBanana.id ? { ...b, collected: true } : b))
          );
          spawnBananaParticles(targetX, targetY);
          collectedCount++;
        }

        if (!isCancelled) executeNextAction();
        return;
      }

      // 5. STEP ACTION: monkey.step(steps=1)
      if (actType === 'STEP') {
        const steps = typeof action.count === 'number' ? action.count : 1;
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
            onActiveLineChange?.(null);
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Check target tile in dynamic grid
          const targetTile = dynamicGrid[nextY][nextX];

          // Water hazard
          if (targetTile === 'water') {
            await animateMove(currentX, currentY, nextX, nextY, false);
            currentX = nextX;
            currentY = nextY;
            setMonkeyGridPos({ x: nextX, y: nextY });
            triggerHazardCollision('water');
            onActiveLineChange?.(null);
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Rock obstacle collision (must use jump instead of step!)
          if (targetTile === 'stone') {
            triggerHazardCollision('rock');
            onActiveLineChange?.(null);
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Bush collision
          if (targetTile === 'bush') {
            triggerHazardCollision('bush');
            onActiveLineChange?.(null);
            onExecutionComplete(false, collectedCount);
            return;
          }

          // Valid step: play warm marimba footstep and animate
          SoundFX.playFootstep();
          await animateMove(currentX, currentY, nextX, nextY, false);
          currentX = nextX;
          currentY = nextY;
          setMonkeyGridPos({ x: nextX, y: nextY });

          // Banana collection check
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
      onActiveLineChange?.(null);
    };
  }, [isRunning, actionQueue, dynamicGrid]);

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
        p.vy += 0.12; // gravity
        p.rotation += p.rotSpeed;
        p.alpha = 1 - p.lifetime / p.maxLife;
        if (p.lifetime >= p.maxLife) {
          st.particles.splice(i, 1);
        }
      }

      // High-DPI Resolution handling
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

      // 1. Draw Terrain Base Grid
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const tile = dynamicGrid[r][c];
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
          if (dynamicGrid[r][c] === 'bush') {
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
  }, [dynamicGrid, bananas, monkeyGridPos, monkeyDir, speechBubble]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 select-none">
      <div className="relative w-full aspect-10/8 max-h-[700px] rounded-3xl overflow-hidden border-4 border-[#D7CCC8] shadow-[0_12px_36px_rgba(38,50,56,0.18)] bg-[#7CB342]">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          className="cursor-default"
        />

        {/* Coordinates & Status Badge */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#FAF6EE]/90 backdrop-blur-xs rounded-xl border border-[#D7CCC8] text-[11px] font-bold text-[#5D4037] flex items-center gap-1.5 shadow-sm font-fredoka">
          <span>Grid: 10×8</span>
          <span className="text-[#8D6E63]">•</span>
          <span>Monkey: ({monkeyGridPos.x}, {monkeyGridPos.y})</span>
          <span className="text-[#8D6E63]">•</span>
          <span className="text-[#7CB342] uppercase font-black">{monkeyDir}</span>
        </div>
      </div>
    </div>
  );
};
