export default class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width; // 480
    this.height = canvas.height; // 360
    
    // Center point of canvas is (0,0) in Cartesian
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    
    // Backdrop support
    this.backdropImg = null;
  }

  setBackdrop(imageUrl) {
      if (!imageUrl) {
          this.backdropImg = null;
          return;
      }
      this.backdropImg = new Image();
      this.backdropImg.src = imageUrl;
  }

  // Convert Cartesian to Canvas coords
  toCanvasCoords(cartX, cartY) {
    return {
      x: this.centerX + cartX,
      y: this.centerY - cartY  // Y is inverted in Cartesian compared to Canvas top-left
    };
  }

  clear() {
    if (this.backdropImg && this.backdropImg.complete && this.backdropImg.naturalWidth !== 0) {
        this.ctx.drawImage(this.backdropImg, 0, 0, this.width, this.height);
    } else {
        this.ctx.fillStyle = '#ffffff'; // White bg fallback
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  drawSprite(sprite) {
    const { x, y } = this.toCanvasCoords(sprite.x, sprite.y);
    
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Scratch direction: 0 is UP, 90 is RIGHT
    // Canvas rotation: 0 is RIGHT, so we subtract 90 degrees to align Scratch 0 with Canvas UP.
    const rad = (sprite.direction - 90) * Math.PI / 180;
    this.ctx.rotate(rad);
    
    if (sprite.img && sprite.img.complete && sprite.img.naturalWidth !== 0) {
        // Draw the image centered
        // Assume image ratio mapping, we'll fit it to size x size approximately
        const aspect = sprite.img.naturalWidth / sprite.img.naturalHeight;
        let dw = sprite.size;
        let dh = sprite.size;
        if (aspect > 1) { dh = sprite.size / aspect; } 
        else { dw = sprite.size * aspect; }
        
        // If the sprite faces right by default in the image, we just draw it.
        // We flip horizontally if it's meant to turn left? Scratch rotates, but typically we might flip.
        // For simplicity, we strictly rotate here based on Scratch math.
        this.ctx.drawImage(sprite.img, -dw/2, -dh/2, dw, dh);
    } else {
        // Fallback to square
        this.ctx.fillStyle = sprite.color;
        this.ctx.fillRect(-sprite.size/2, -sprite.size/2, sprite.size, sprite.size);
        this.ctx.fillStyle = '#ef4444'; // red tip
        this.ctx.fillRect(sprite.size/2 - 8, -4, 8, 8); 
    }
    
    this.ctx.restore();
    
    // Draw say bubble if any
    if (sprite.sayText) {
        this.drawBubble(x, y, sprite.sayText);
    }
  }

  drawBubble(x, y, text) {
    this.ctx.save();
    this.ctx.font = '14px sans-serif';
    const padding = 10;
    const textWidth = this.ctx.measureText(text).width;
    const bubbleWidth = textWidth + padding * 2;
    const bubbleHeight = 32;
    
    // Position slightly top right of the sprite
    const bx = x + 15;
    const by = y - 55;
    
    // Drop shadow
    this.ctx.shadowColor = 'rgba(0,0,0,0.1)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetY = 2;

    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 1;
    
    // Bubble background
    this.ctx.beginPath();
    this.ctx.roundRect(bx, by, bubbleWidth, bubbleHeight, 8);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Clear shadow for text
    this.ctx.shadowColor = 'transparent';
    
    // Bubble text
    this.ctx.fillStyle = '#334155';
    this.ctx.fillText(text, bx + padding, by + 21);
    this.ctx.restore();
  }

  render(sprites) {
    this.clear();
    sprites.forEach(s => {
        if (s.visible) this.drawSprite(s);
    });
  }
}
