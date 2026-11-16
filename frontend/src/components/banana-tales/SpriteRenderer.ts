import { Direction, TileType, Particle } from './types';

/**
 * SpriteRenderer - 60fps Vector Sprite Renderer for Banana Tales.
 * 
 * Draws crisp, layered, shaded storybook vector art directly to HTML5 Canvas.
 * Structured with clean method boundaries so external PNG spritesheets 
 * or sprite atlases can be easily swapped in later without modifying game logic.
 */
export class SpriteRenderer {
  // Optional external sprite image assets (can be assigned if external PNG sheets are loaded)
  public static monkeySpriteSheet: HTMLImageElement | null = null;
  public static tileSpriteSheet: HTMLImageElement | null = null;
  public static bananaSpriteSheet: HTMLImageElement | null = null;

  /**
   * Draw Grass Tile (checkered meadow green with depth & grass blades)
   */
  public static drawGrassTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    col: number,
    row: number,
    time: number
  ): void {
    const isAlt = (col + row) % 2 === 0;
    // Meadow greens
    ctx.fillStyle = isAlt ? '#7CB342' : '#689F38';
    ctx.fillRect(x, y, size, size);

    // Subtle inner top/left sunlight highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(x, y, size, 3);
    ctx.fillRect(x, y, 3, size);

    // Subtle bottom/right bevel shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(x, y + size - 3, size, 3);
    ctx.fillRect(x + size - 3, y, 3, size);

    // Occasional decorative grass tufts based on deterministic pseudo-random seed
    const seed = (col * 17 + row * 31) % 10;
    if (seed < 4) {
      const tuftX = x + size * (0.3 + (seed * 0.15));
      const tuftY = y + size * (0.4 + (seed * 0.1));
      const sway = Math.sin(time * 2 + col + row) * 2;

      ctx.strokeStyle = '#558B2F';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      // Left blade
      ctx.moveTo(tuftX, tuftY);
      ctx.quadraticCurveTo(tuftX - 4 + sway, tuftY - 6, tuftX - 6 + sway, tuftY - 8);
      // Center blade
      ctx.moveTo(tuftX, tuftY);
      ctx.quadraticCurveTo(tuftX + sway, tuftY - 9, tuftX + 1 + sway, tuftY - 12);
      // Right blade
      ctx.moveTo(tuftX, tuftY);
      ctx.quadraticCurveTo(tuftX + 4 + sway, tuftY - 6, tuftX + 7 + sway, tuftY - 7);
      ctx.stroke();

      // Tiny white jungle daisy for seed === 1
      if (seed === 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(tuftX + 2 + sway, tuftY - 13, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD54F';
        ctx.beginPath();
        ctx.arc(tuftX + 2 + sway, tuftY - 13, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draw Warm Dirt Path Tile
   */
  public static drawPathTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    col: number,
    row: number
  ): void {
    // Dirt base
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(x, y, size, size);

    // Warm undertone & texture
    ctx.fillStyle = 'rgba(141, 110, 99, 0.12)';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);

    // Edge shading to blend into grass
    ctx.strokeStyle = '#BCAAA4';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);

    // Tiny storybook pebbles
    const seed = (col * 23 + row * 41) % 6;
    const pebbleCoords = [
      { rx: 0.25, ry: 0.3, r: 3, c: '#8D6E63' },
      { rx: 0.75, ry: 0.65, r: 2.5, c: '#A1887F' },
      { rx: 0.45, ry: 0.75, r: 2, c: '#BCAAA4' },
      { rx: 0.6, ry: 0.25, r: 3.5, c: '#6D4C41' }
    ];

    const pebble = pebbleCoords[seed % pebbleCoords.length];
    const px = x + size * pebble.rx;
    const py = y + size * pebble.ry;

    // Pebble shadow
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(px + 1, py + 1.5, pebble.r, pebble.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pebble body
    ctx.fillStyle = pebble.c;
    ctx.beginPath();
    ctx.ellipse(px, py, pebble.r, pebble.r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pebble highlight
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(px - 0.8, py - 0.8, pebble.r * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw Flowing Water River Tile with animated ripples and wave crests
   */
  public static drawWaterTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number
  ): void {
    // Deep river water gradient
    const waterGrad = ctx.createLinearGradient(x, y, x, y + size);
    waterGrad.addColorStop(0, '#0288D1');
    waterGrad.addColorStop(0.5, '#29B6F6');
    waterGrad.addColorStop(1, '#0277BD');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(x, y, size, size);

    // Flowing water wave ripples
    const waveOffset1 = (time * 40 + (x + y) * 0.2) % size;
    const waveOffset2 = (time * 30 + (x * 1.5)) % size;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    // Wave ripple 1
    ctx.beginPath();
    const ry1 = y + ((waveOffset1) % (size - 10)) + 5;
    ctx.moveTo(x + 8, ry1);
    ctx.bezierCurveTo(x + size * 0.3, ry1 - 4, x + size * 0.7, ry1 + 4, x + size - 8, ry1);
    ctx.stroke();

    // Wave ripple 2
    ctx.strokeStyle = 'rgba(225, 245, 254, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const ry2 = y + ((waveOffset2 + size * 0.5) % (size - 10)) + 5;
    ctx.moveTo(x + 12, ry2);
    ctx.bezierCurveTo(x + size * 0.4, ry2 + 3, x + size * 0.6, ry2 - 3, x + size - 12, ry2);
    ctx.stroke();
  }

  /**
   * Draw Stone River Stepping Stone Tile
   */
  public static drawStoneRiverTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number
  ): void {
    // River base first
    this.drawWaterTile(ctx, x, y, size, time);

    const cx = x + size / 2;
    const cy = y + size / 2;
    const radius = size * 0.34;

    // Water ripple foam around stone
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, radius * 1.25, radius * 0.95, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Stone shadow
    ctx.fillStyle = 'rgba(1, 87, 155, 0.5)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 5, radius * 1.05, radius * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Stepping Stone Gradient (Slate River Rock)
    const stoneGrad = ctx.createRadialGradient(cx - 5, cy - 6, 2, cx, cy, radius);
    stoneGrad.addColorStop(0, '#ECEFF1');
    stoneGrad.addColorStop(0.4, '#90A4AE');
    stoneGrad.addColorStop(0.85, '#607D8B');
    stoneGrad.addColorStop(1, '#455A64');

    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.8, -0.05, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Wet stone top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx - radius * 0.25, cy - radius * 0.25, radius * 0.4, radius * 0.22, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw Wooden Bridge Tile (spanning river with wood grain, planks & rope rails)
   */
  public static drawBridgeTile(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    orientation: 'horizontal' | 'vertical' = 'horizontal',
    time: number = 0
  ): void {
    // Water flows underneath bridge
    this.drawWaterTile(ctx, x, y, size, time);

    // Bridge shadow on water
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    if (orientation === 'horizontal') {
      ctx.fillRect(x, y + 8, size, size - 16);
    } else {
      ctx.fillRect(x + 8, y, size - 16, size);
    }

    // Wooden Planks
    const plankCount = 4;
    const plankWidth = size / plankCount;

    if (orientation === 'horizontal') {
      for (let i = 0; i < plankCount; i++) {
        const px = x + i * plankWidth;
        const py = y + 6;
        const pw = plankWidth - 2;
        const ph = size - 12;

        // Plank wood gradient
        const plankGrad = ctx.createLinearGradient(px, py, px + pw, py);
        plankGrad.addColorStop(0, '#8D6E63');
        plankGrad.addColorStop(0.5, '#A1887F');
        plankGrad.addColorStop(1, '#6D4C41');

        ctx.fillStyle = plankGrad;
        ctx.fillRect(px, py, pw, ph);

        // Plank border / gaps
        ctx.strokeStyle = '#4E342E';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, pw, ph);

        // Iron Nails
        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(px + pw / 2, py + 5, 1.8, 0, Math.PI * 2);
        ctx.arc(px + pw / 2, py + ph - 5, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wooden Side Rails / Ropes (top and bottom)
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x, y + 2, size, 4);
      ctx.fillRect(x, y + size - 6, size, 4);

      ctx.strokeStyle = '#D7CCC8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y + 2, size, 4);
      ctx.strokeRect(x, y + size - 6, size, 4);
    } else {
      // Vertical Bridge
      for (let i = 0; i < plankCount; i++) {
        const px = x + 6;
        const py = y + i * plankWidth;
        const pw = size - 12;
        const ph = plankWidth - 2;

        const plankGrad = ctx.createLinearGradient(px, py, px, py + ph);
        plankGrad.addColorStop(0, '#8D6E63');
        plankGrad.addColorStop(0.5, '#A1887F');
        plankGrad.addColorStop(1, '#6D4C41');

        ctx.fillStyle = plankGrad;
        ctx.fillRect(px, py, pw, ph);

        ctx.strokeStyle = '#4E342E';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px, py, pw, ph);

        ctx.fillStyle = '#3E2723';
        ctx.beginPath();
        ctx.arc(px + 5, py + ph / 2, 1.8, 0, Math.PI * 2);
        ctx.arc(px + pw - 5, py + ph / 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x + 2, y, 4, size);
      ctx.fillRect(x + size - 6, y, 4, size);
    }
  }

  /**
   * Draw Lush Jungle Bush (multi-lobed leafy clusters with breeze sway)
   */
  public static drawBush(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2 + 4;
    const sway = Math.sin(time * 2.5 + x * 0.1) * 2;

    // Bush base ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, y + size - 8, size * 0.42, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bush Lobes: Deep background layer
    ctx.fillStyle = '#2E7D32';
    const lobesBack = [
      { ox: -size * 0.25, oy: -size * 0.1, r: size * 0.28 },
      { ox: size * 0.25, oy: -size * 0.1, r: size * 0.28 },
      { ox: 0, oy: -size * 0.22, r: size * 0.32 },
    ];
    for (const lobe of lobesBack) {
      ctx.beginPath();
      ctx.arc(cx + lobe.ox + sway * 0.6, cy + lobe.oy, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mid layer: Vibrant Jungle Green
    ctx.fillStyle = '#388E3C';
    const lobesMid = [
      { ox: -size * 0.2, oy: 0, r: size * 0.26 },
      { ox: size * 0.2, oy: 0, r: size * 0.26 },
      { ox: 0, oy: -size * 0.1, r: size * 0.3 },
    ];
    for (const lobe of lobesMid) {
      ctx.beginPath();
      ctx.arc(cx + lobe.ox + sway, cy + lobe.oy, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top Sunny Highlights: Lime accents
    ctx.fillStyle = '#66BB6A';
    const lobesFront = [
      { ox: -size * 0.12, oy: -size * 0.16, r: size * 0.18 },
      { ox: size * 0.1, oy: -size * 0.14, r: size * 0.16 },
      { ox: 0, oy: -size * 0.22, r: size * 0.15 },
    ];
    for (const lobe of lobesFront) {
      ctx.beginPath();
      ctx.arc(cx + lobe.ox + sway * 1.2, cy + lobe.oy, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dark outline accents for storybook look
    ctx.strokeStyle = '#1B5E20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx + sway, cy - size * 0.1, size * 0.35, 0.4, Math.PI - 0.4, true);
    ctx.stroke();

    // Tiny jungle berries
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(cx - 8 + sway, cy - 2, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 12 + sway, cy - 6, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 4 + sway, cy + 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw Golden Banana (Spinning 3D scale, glowing rings & sparkle)
   */
  public static drawBanana(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    time: number,
    collected: boolean
  ): void {
    if (collected) return;

    const cx = x + size / 2;
    // Gentle vertical bobbing
    const bob = Math.sin(time * 3.5) * 5;
    const cy = y + size / 2 + bob;

    // Ground shadow that scales inversely with bob
    const shadowScale = 1 - (bob / 20);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, y + size - 10, (size * 0.28) * shadowScale, (size * 0.1) * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pulsating Golden Glow Ring
    const glowAlpha = 0.35 + Math.sin(time * 4) * 0.2;
    const glowRadius = size * 0.38 + Math.sin(time * 3) * 4;

    const glowGrad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, glowRadius);
    glowGrad.addColorStop(0, `rgba(255, 235, 59, ${glowAlpha})`);
    glowGrad.addColorStop(0.6, `rgba(255, 193, 7, ${glowAlpha * 0.6})`);
    glowGrad.addColorStop(1, 'rgba(255, 193, 7, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3D Spinning horizontal scale effect
    const spinScale = Math.cos(time * 2.8);
    const scaleX = Math.abs(spinScale) < 0.15 ? (spinScale >= 0 ? 0.15 : -0.15) : spinScale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scaleX, 1);

    // Vector Banana Crescent
    ctx.beginPath();
    // Curved outer back of banana
    ctx.moveTo(-16, -10);
    ctx.bezierCurveTo(-4, -18, 14, -12, 18, 10);
    // Inner belly curve
    ctx.bezierCurveTo(12, 4, 0, 0, -14, -6);
    ctx.closePath();

    // Golden Mango/Banana Gradient
    const bananaGrad = ctx.createLinearGradient(-16, -15, 18, 15);
    bananaGrad.addColorStop(0, '#FFF59D');
    bananaGrad.addColorStop(0.3, '#FFEB3B');
    bananaGrad.addColorStop(0.7, '#FFC107');
    bananaGrad.addColorStop(1, '#FFA000');

    ctx.fillStyle = bananaGrad;
    ctx.fill();

    ctx.strokeStyle = '#FF8F00';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Shiny peel highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-10, -11);
    ctx.bezierCurveTo(-2, -14, 10, -9, 14, 4);
    ctx.stroke();

    // Brown/Green stem tip
    ctx.fillStyle = '#689F38';
    ctx.beginPath();
    ctx.rect(-17, -13, 3, 5);
    ctx.fill();
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(17.5, 9.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Cute Storybook Monkey Character
   * Includes idle breathing animation, directional gaze/facing, walking hop, and speech bubbles.
   */
  public static drawMonkey(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    dir: Direction,
    animTime: number,
    isWalking: boolean,
    isJumping: boolean,
    speechBubble?: string | null
  ): void {
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Walking / jumping vertical bob
    const walkBob = isWalking ? Math.abs(Math.sin(animTime * 14)) * 6 : 0;
    const jumpHop = isJumping ? Math.sin(animTime * Math.PI) * 16 : 0;
    const totalBob = -walkBob - jumpHop;

    // Idle breathing: subtle vertical scale
    const breathScale = 1 + (isWalking ? 0 : Math.sin(animTime * 3.5) * 0.025);

    // Ground Contact Shadow
    const shadowRadius = size * 0.32 * (1 - (walkBob + jumpHop) / 35);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cx, y + size - 8, shadowRadius, shadowRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy + totalBob);
    ctx.scale(1, breathScale);

    // Directional orientation handling
    const isFacingLeft = dir === 'left';
    const isFacingUp = dir === 'up';
    const isFacingDown = dir === 'down';
    const flipX = isFacingLeft ? -1 : 1;

    ctx.scale(flipX, 1);

    // 1. Monkey Tail (animated curly spring tail behind body)
    const tailWiggle = Math.sin(animTime * 6) * 4;
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, 12);
    ctx.bezierCurveTo(-22, 10, -26 + tailWiggle, -6, -18, -14);
    ctx.bezierCurveTo(-14, -18, -8, -16, -10, -10);
    ctx.stroke();

    // 2. Monkey Body
    const bodyGrad = ctx.createLinearGradient(-16, -4, 16, 20);
    bodyGrad.addColorStop(0, '#8D6E63');
    bodyGrad.addColorStop(1, '#5D4037');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Soft Peach Tummy Patch
    if (!isFacingUp) {
      ctx.fillStyle = '#FFE0B2';
      ctx.beginPath();
      ctx.ellipse(isFacingDown ? 0 : 3, 9, 10, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Feet / Paws
    const legOffset = isWalking ? Math.sin(animTime * 14) * 4 : 0;
    ctx.fillStyle = '#5D4037';
    // Left foot
    ctx.beginPath();
    ctx.ellipse(-9, 21 - legOffset, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right foot
    ctx.beginPath();
    ctx.ellipse(9, 21 + legOffset, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Monkey Head
    const headGrad = ctx.createLinearGradient(-18, -26, 18, 0);
    headGrad.addColorStop(0, '#8D6E63');
    headGrad.addColorStop(1, '#6D4C41');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, -10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Big Rounded Monkey Ears
    const earInnerGrad = '#FFAB91';
    // Left Ear
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(-18, -12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = earInnerGrad;
    ctx.beginPath();
    ctx.arc(-18, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Right Ear
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(18, -12, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = earInnerGrad;
    ctx.beginPath();
    ctx.arc(18, -12, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Face Mask & Features (if not looking up/away)
    if (!isFacingUp) {
      const faceShiftX = isFacingDown ? 0 : 3;

      // Heart/Double-lobed Peach Face Mask
      ctx.fillStyle = '#FFE0B2';
      // Left cheek lobe
      ctx.beginPath();
      ctx.arc(faceShiftX - 5.5, -11, 7.5, 0, Math.PI * 2);
      ctx.arc(faceShiftX + 5.5, -11, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Lower snout bulge
      ctx.beginPath();
      ctx.ellipse(faceShiftX, -5, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Big Expressive Dark Eyes
      const eyeSpacing = isFacingDown ? 6 : 5;
      const eyeRadius = 3.5;

      ctx.fillStyle = '#263238';
      // Left eye
      ctx.beginPath();
      ctx.arc(faceShiftX - eyeSpacing, -11, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      // Right eye
      ctx.beginPath();
      ctx.arc(faceShiftX + eyeSpacing, -11, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glossy Eye Highlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(faceShiftX - eyeSpacing - 1, -12, 1.3, 0, Math.PI * 2);
      ctx.arc(faceShiftX + eyeSpacing - 1, -12, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Snout Nostrils & Cheerful Mouth
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.arc(faceShiftX - 2, -6, 1.1, 0, Math.PI * 2);
      ctx.arc(faceShiftX + 2, -6, 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#4E342E';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(faceShiftX, -4, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Facing up: back of head hair tuft
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.arc(0, -22, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 8. Speech Bubble
    if (speechBubble) {
      this.drawSpeechBubble(ctx, cx, cy - 35 + totalBob, speechBubble);
    }
  }

  /**
   * Draw Crisp Speech Bubble
   */
  public static drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    text: string
  ): void {
    ctx.save();
    ctx.font = '700 13px Fredoka, sans-serif';
    const textMetrics = ctx.measureText(text);
    const bubbleWidth = Math.max(textMetrics.width + 24, 70);
    const bubbleHeight = 32;
    const bx = x - bubbleWidth / 2;
    const by = y - bubbleHeight - 12;

    // Bubble Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 2, bubbleWidth, bubbleHeight, 12);
    ctx.fill();

    // Bubble Parchment Body
    ctx.fillStyle = '#FAF6EE';
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleWidth, bubbleHeight, 12);
    ctx.fill();

    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pointer tail pointing down towards monkey
    ctx.fillStyle = '#FAF6EE';
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bubbleHeight - 1);
    ctx.lineTo(x, by + bubbleHeight + 8);
    ctx.lineTo(x + 6, by + bubbleHeight - 1);
    ctx.fill();

    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 6, by + bubbleHeight);
    ctx.lineTo(x, by + bubbleHeight + 8);
    ctx.lineTo(x + 6, by + bubbleHeight);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#263238';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, by + bubbleHeight / 2);

    ctx.restore();
  }

  /**
   * Draw Particle Bursts (Gold Stars & Green Jungle Leaves)
   */
  public static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === 'sparkle') {
        // 4-Point Golden Star Sparkle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const r = p.size;
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Fluttering Green Jungle Leaf
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-p.size * 1.2, 0);
        ctx.lineTo(p.size * 1.2, 0);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  /**
   * Draw Camera Shake and Red Flash Overlay
   */
  public static drawRedFlash(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    alpha: number
  ): void {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
