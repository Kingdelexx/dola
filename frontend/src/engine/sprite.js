export default class Sprite {
  constructor(id, name, imageUrl = null) {
    this.id = id || `sprite_${Date.now()}`;
    this.name = name || 'Sprite1';
    
    this.x = 0;
    this.y = 0;
    this.direction = 90; // degrees, 90 is right, 0 is up
    this.sayText = null;
    this.sayTimeout = null;
    
    // Image loading
    this.img = null;
    if (imageUrl) {
        this.img = new Image();
        this.img.src = imageUrl;
    }
    
    // Size and visual properties fallback
    this.size = 60; // increased default visual size
    this.color = '#3b82f6'; // blue-500
    this.visible = true;
  }

  // Setters for instant snapping
  setPos(x, y) {
    this.x = x;
    this.y = y;
  }

  setDirection(dir) {
    this.direction = dir;
  }
  
  say(text, durationMs = 2000) {
    this.sayText = text;
    if (this.sayTimeout) clearTimeout(this.sayTimeout);
    if (durationMs > 0) {
        this.sayTimeout = setTimeout(() => {
            this.sayText = null;
        }, durationMs);
    }
  }
  
  clearSay() {
      this.sayText = null;
      if (this.sayTimeout) clearTimeout(this.sayTimeout);
  }
}
