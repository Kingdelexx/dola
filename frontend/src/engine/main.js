import Sprite from './sprite';
import Stage from './stage';

export default class Engine {
  constructor(canvas) {
    this.stage = new Stage(canvas);
    this.sprites = [];
    this.activeSpriteId = null;
    
    // Add default sprite
    this.addSprite('sprite_1', 'Cat', '/assets/sprites/cat.png');
    
    // Engine state
    this.animationFrameId = null;
    
    this.lastTime = 0;
    
    // Drag state
    this.draggedSprite = null;
    this.onActiveSpriteChange = null; // callback for React
    
    // Bind the loop and events
    this.renderLoop = this.renderLoop.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    
    // Listeners
    this.stage.canvas.addEventListener('mousedown', this.onMouseDown);
    this.stage.canvas.addEventListener('mousemove', this.onMouseMove);
    this.stage.canvas.addEventListener('mouseup', this.onMouseUp);
    this.stage.canvas.addEventListener('mouseleave', this.onMouseUp);
  }

  addSprite(id, name, url) {
      const sprite = new Sprite(id, name, url);
      this.sprites.push(sprite);
      this.activeSpriteId = sprite.id; // set as active by default
      return sprite;
  }
  
  removeSprite(id) {
      if (this.sprites.length <= 1) return; // keep at least one
      this.sprites = this.sprites.filter(s => s.id !== id);
      if (this.activeSpriteId === id) {
          this.activeSpriteId = this.sprites[0].id;
      }
  }
  
  clearSprites() {
      this.sprites = [];
      this.activeSpriteId = null;
  }
  
  setBackdrop(url) {
      this.stage.setBackdrop(url);
  }
  
  // Get active sprite for commands
  get activeSprite() {
      return this.sprites.find(s => s.id === this.activeSpriteId) || this.sprites[0];
  }

  // Sensing mid-animation
  isTouching(spriteId, targetName) {
      const target = this.sprites.find(s => s.name === targetName);
      if (!target) return false;
      
      const sprite = this.sprites.find(s => s.id === spriteId);
      if (!sprite || sprite === target) return false;
      
      const dx = sprite.x - target.x;
      const dy = sprite.y - target.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Simple circular collision using combined radius (half size)
      // We make it slightly forgiving by multiplying by 0.8
      return dist < ((sprite.size + target.size) / 2) * 0.8;
  }
  
  isTouchingColor(spriteId, hexColor) {
      const sprite = this.sprites.find(s => s.id === spriteId);
      if (!sprite || !sprite.visible) return false;
      
      const hex = hexColor.replace('#', '');
      const r_target = parseInt(hex.substring(0, 2), 16);
      const g_target = parseInt(hex.substring(2, 4), 16);
      const b_target = parseInt(hex.substring(4, 6), 16);

      try {
          const cx = this.stage.centerX + sprite.x;
          const cy = this.stage.centerY - sprite.y;
          const r_size = sprite.size / 2;
          // Check 4 cardinal points on the bounding box edge
          const points = [
              {x: cx + r_size, y: cy},
              {x: cx - r_size, y: cy},
              {x: cx, y: cy + r_size},
              {x: cx, y: cy - r_size}
          ];
          for (let p of points) {
              // Ensure inside canvas
              if (p.x >= 0 && p.x < this.stage.canvas.width && p.y >= 0 && p.y < this.stage.canvas.height) {
                  const pixel = this.stage.ctx.getImageData(p.x, p.y, 1, 1).data;
                  if (pixel[3] > 0) { // not transparent
                      if (Math.abs(pixel[0] - r_target) < 30 && Math.abs(pixel[1] - g_target) < 30 && Math.abs(pixel[2] - b_target) < 30) {
                          return true;
                      }
                  }
              }
          }
      } catch(e) {
          console.warn("Canvas tainted or error reading pixels:", e);
      }
      return false;
  }
  
  // Dragging Mechanics
  getCanvasCoords(e) {
      const rect = this.stage.canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;
      
      const cartX = clientX - this.stage.centerX;
      const cartY = this.stage.centerY - clientY;
      return { cartX, cartY };
  }

  onMouseDown(e) {
      const { cartX, cartY } = this.getCanvasCoords(e);
      // Check collision from top-most sprite down
      for (let i = this.sprites.length - 1; i >= 0; i--) {
          const s = this.sprites[i];
          const halfSize = s.size / 2;
          if (cartX >= s.x - halfSize && cartX <= s.x + halfSize &&
              cartY >= s.y - halfSize && cartY <= s.y + halfSize) {
              this.draggedSprite = s;
              this.activeSpriteId = s.id;
              if (this.onActiveSpriteChange) this.onActiveSpriteChange(s.id);
              break;
          }
      }
  }

  onMouseMove(e) {
      if (this.draggedSprite) {
          const { cartX, cartY } = this.getCanvasCoords(e);
          this.draggedSprite.x = cartX;
          this.draggedSprite.y = cartY;
      }
  }

  onMouseUp(e) {
      this.draggedSprite = null;
  }
  
  start() {
      if (!this.animationFrameId) {
          this.animationFrameId = requestAnimationFrame(this.renderLoop);
      }
  }
  
  stop() {
      if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
      }
  }

  renderLoop(time) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop);
      this.stage.render(this.sprites);
      this.lastTime = time;
  }
  
  // Run a command immediately and return a Promise that resolves when done
  runCommand(spriteId, type, ...args) {
      return new Promise((resolve) => {
          const duration = 500; // ms per animated action
          const sprite = this.sprites.find(s => s.id === spriteId) || this.sprites[0];
          
          if (type === 'move') {
              const steps = args[0];
              const rad = (90 - sprite.direction) * Math.PI / 180;
              const targetX = sprite.x + Math.cos(rad) * steps;
              const targetY = sprite.y + Math.sin(rad) * steps;
              
              this.animateInterpolate(sprite, sprite.x, sprite.y, targetX, targetY, sprite.direction, duration, resolve);
          } else if (type === 'turn') {
              const degrees = args[0];
              const targetDir = sprite.direction + degrees;
              this.animateInterpolate(sprite, sprite.x, sprite.y, sprite.x, sprite.y, targetDir, duration, resolve);
          } else if (type === 'goTo') {
              const [x, y] = args;
              this.animateInterpolate(sprite, sprite.x, sprite.y, x, y, sprite.direction, duration, resolve);
          } else if (type === 'say') {
              const [msg, dur] = args;
              sprite.say(msg, dur || 2000); 
              setTimeout(resolve, 500); 
          } else if (type === 'wait') {
              const durMs = args[0] || 1000;
              setTimeout(resolve, durMs);
          } else if (type === 'activateSprite') {
              // Now spriteName instead of ID since Blockly block uses dropdown with names
              const spriteName = args[0];
              const targetSprite = this.sprites.find(s => s.name === spriteName);
              if (targetSprite) {
                  this.activeSpriteId = targetSprite.id;
                  if (this.onActiveSpriteChange) this.onActiveSpriteChange(targetSprite.id);
              } else {
                  console.warn(`Sprite ${spriteName} not found!`);
              }
              resolve();
          } else if (type === 'setX') {
              sprite.x = args[0];
              resolve();
          } else if (type === 'setY') {
              sprite.y = args[0];
              resolve();
          } else if (type === 'changeX') {
              sprite.x += args[0];
              resolve();
          } else if (type === 'changeY') {
              sprite.y += args[0];
              resolve();
          } else if (type === 'teleport') {
              sprite.x = args[0];
              sprite.y = args[1];
              resolve();
          } else if (type === 'hide') {
              sprite.visible = false;
              resolve();
          } else if (type === 'show') {
              sprite.visible = true;
              resolve();
          } else if (type === 'goToLayer') {
              const layer = args[0]; // 'front' or 'back'
              const index = this.sprites.indexOf(sprite);
              if (index > -1) {
                  this.sprites.splice(index, 1);
                  if (layer === 'front') {
                      this.sprites.push(sprite);
                  } else if (layer === 'back') {
                      this.sprites.unshift(sprite);
                  }
              }
              resolve();
          } else if (type === 'switchBackdrop') {
              const url = args[0];
              this.setBackdrop(url);
              resolve();
          } else if (type === 'createClone') {
              const newId = `clone_${Date.now()}_${Math.floor(Math.random()*1000)}`;
              const clone = this.addSprite(newId, sprite.name + "_clone", sprite.img ? sprite.img.src : null);
              clone.x = sprite.x;
              clone.y = sprite.y;
              clone.direction = sprite.direction;
              clone.size = sprite.size;
              clone.visible = sprite.visible;
              clone.isClone = true;
              if (this.onCloneCreated) this.onCloneCreated(spriteId, newId);
              resolve();
          } else if (type === 'deleteClone') {
              if (sprite.isClone) {
                  this.removeSprite(sprite.id);
              }
              resolve();
          } else if (type === 'stopAll') {
              if (this.onStopAll) this.onStopAll();
              resolve();
          } else if (type === 'reset') {
              sprite.setPos(0, 0);
              sprite.setDirection(90);
              sprite.clearSay();
              sprite.visible = true;
              resolve();
          } else {
              resolve(); // Unknown cmd
          }
      });
  }
  
  animateInterpolate(sprite, startX, startY, endX, endY, endDir, duration, onComplete) {
      const startTime = performance.now();
      const startDir = sprite.direction;
      
      const step = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;
          
          sprite.x = startX + (endX - startX) * easeProgress;
          sprite.y = startY + (endY - startY) * easeProgress;
          sprite.direction = startDir + (endDir - startDir) * easeProgress;
          
          if (progress < 1) {
              requestAnimationFrame(step);
          } else {
              onComplete();
          }
      };
      
      requestAnimationFrame(step);
  }
}
