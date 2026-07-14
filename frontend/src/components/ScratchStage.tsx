'use client';
import { useEffect, useRef, useState } from 'react';
import Engine from '../engine/main';

export default function ScratchStage({ 
  onRun,
  levelId,
  startBackdrop,
  startSprites,
  onActiveSpriteChange,
  activeSpriteIdProp
}: { 
  onRun?: () => void;
  levelId?: number;
  startBackdrop?: string | null;
  startSprites?: { name: string, url: string }[];
  onActiveSpriteChange?: (id: string) => void;
  activeSpriteIdProp?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [activeSpriteId, setActiveSpriteId] = useState<string | null>(null);
  const [spritesList, setSpritesList] = useState<{id: string, name: string, url: string|null}[]>([]);

  // Initialize engine once
  useEffect(() => {
    if (canvasRef.current && !engine) {
      const initEngine = new Engine(canvasRef.current);
      initEngine.start();
      setEngine(initEngine);
      
      initEngine.onActiveSpriteChange = (id: string) => {
          setActiveSpriteId(id);
          if (onActiveSpriteChange) onActiveSpriteChange(id);
      };
      
      // Expose globally so Pyodide can call window engine methods directly
      (window as any).move = async (spriteId: string, steps: number) => {
          await initEngine.runCommand(spriteId, 'move', steps);
      };
      (window as any).turn = async (spriteId: string, degrees: number) => {
          await initEngine.runCommand(spriteId, 'turn', degrees);
      };
      (window as any).goTo = async (spriteId: string, x: number, y: number) => {
          await initEngine.runCommand(spriteId, 'goTo', x, y);
      };
      (window as any).say = async (spriteId: string, msg: string, dur: number) => {
          await initEngine.runCommand(spriteId, 'say', msg, dur);
      };
      (window as any).wait = async (spriteId: string, durMs: number) => {
          await initEngine.runCommand(spriteId, 'wait', durMs);
      };
      (window as any).activateSprite = async (spriteId: string, spriteName: string) => {
          await initEngine.runCommand(spriteId, 'activateSprite', spriteName);
      };
      (window as any).setX = async (spriteId: string, x: number) => {
          await initEngine.runCommand(spriteId, 'setX', x);
      };
      (window as any).setY = async (spriteId: string, y: number) => {
          await initEngine.runCommand(spriteId, 'setY', y);
      };
      (window as any).changeX = async (spriteId: string, dx: number) => {
          await initEngine.runCommand(spriteId, 'changeX', dx);
      };
      (window as any).changeY = async (spriteId: string, dy: number) => {
          await initEngine.runCommand(spriteId, 'changeY', dy);
      };
      (window as any).teleport = async (spriteId: string, x: number, y: number) => {
          await initEngine.runCommand(spriteId, 'teleport', x, y);
      };
      (window as any).switchBackdrop = async (spriteId: string, url: string) => {
          await initEngine.runCommand(spriteId, 'switchBackdrop', url);
      };
      (window as any).hideSprite = async (spriteId: string) => {
          await initEngine.runCommand(spriteId, 'hide');
      };
      (window as any).showSprite = async (spriteId: string) => {
          await initEngine.runCommand(spriteId, 'show');
      };
      (window as any).goToLayer = async (spriteId: string, layer: string) => {
          await initEngine.runCommand(spriteId, 'goToLayer', layer);
      };
      (window as any).createClone = async (spriteId: string) => {
          await initEngine.runCommand(spriteId, 'createClone');
      };
      (window as any).deleteClone = async (spriteId: string) => {
          await initEngine.runCommand(spriteId, 'deleteClone');
      };
      (window as any).stopAll = async () => {
          await initEngine.runCommand(null, 'stopAll');
      };
      
      // Synchronous sensing
      (window as any).isTouching = (spriteId: string, targetName: string) => {
          return initEngine.isTouching(spriteId, targetName);
      };
      
      (window as any).isTouchingColor = (spriteId: string, hexColor: string) => {
          return initEngine.isTouchingColor(spriteId, hexColor);
      };

      // Event sensing
      if (!(window as any)._scratchKeys) {
          (window as any)._scratchKeys = new Set();
          window.addEventListener('keydown', (e) => (window as any)._scratchKeys.add(e.key === ' ' ? 'space' : e.key));
          window.addEventListener('keyup', (e) => (window as any)._scratchKeys.delete(e.key === ' ' ? 'space' : e.key));
      }
      (window as any).isKeyPressed = (key: string) => {
          if (key === 'any') return (window as any)._scratchKeys.size > 0;
          return (window as any)._scratchKeys.has(key);
      };

      (window as any).isSpriteClicked = (spriteId: string) => {
          return (window as any)._lastClickedSprite === spriteId;
      };

      (window as any).getCurrentBackdrop = () => {
          return initEngine.stage.backdropImg ? initEngine.stage.backdropImg.src : null;
      };
    }
    return () => {
      // Don't stop engine on rerender, only on unmount
      if (engine && !canvasRef.current) engine.stop();
    };
  }, [engine]);

  // Handle level changes via props
  useEffect(() => {
    if (!engine) return;
    
    // Clear and reset according to level config
    engine.clearSprites();
    engine.setBackdrop(startBackdrop || null);
    
    if (startSprites && startSprites.length > 0) {
        startSprites.forEach((spriteData, index) => {
            const added = engine.addSprite(`sprite_${levelId}_${index}`, spriteData.name, spriteData.url);
            if (index === 0) {
               engine.activeSpriteId = added.id;
               setActiveSpriteId(added.id);
               if (onActiveSpriteChange) onActiveSpriteChange(added.id);
            }
        });
    }

    setSpritesList(engine.sprites.map(s => ({id: s.id, name: s.name, url: s.img?.src || null})));

  }, [engine, levelId, startBackdrop, startSprites]); // Excluded onActiveSpriteChange on purpose to avoid infinite loop
  
  useEffect(() => {
      if (engine && activeSpriteIdProp) {
          engine.activeSpriteId = activeSpriteIdProp;
          setActiveSpriteId(activeSpriteIdProp);
      }
  }, [engine, activeSpriteIdProp]);

  return (
    <div className="w-full flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4">
      <div className="w-full flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
        <h3 className="font-bold text-slate-600">Stage Display</h3>
      </div>
      
      {/* 480x360 is the classic Scratch stage proportion */}
      <div className="w-full max-w-[480px] mx-auto border-[4px] border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner flex justify-center items-center aspect-[4/3]">
        <canvas 
          ref={canvasRef} 
          width={480} 
          height={360} 
          className="block bg-white w-full h-full object-contain"
          onClick={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect || !engine) return;
              const scaleX = 480 / rect.width;
              const scaleY = 360 / rect.height;
              const x = (e.clientX - rect.left - rect.width / 2) * scaleX;
              const y = -(e.clientY - rect.top - rect.height / 2) * scaleY;
              
              const sprites = [...engine.sprites].reverse();
              for (const sprite of sprites) {
                  if (!sprite.visible) continue;
                  const size = sprite.size;
                  if (x >= sprite.x - size/2 && x <= sprite.x + size/2 &&
                      y >= sprite.y - size/2 && y <= sprite.y + size/2) {
                      (window as any)._lastClickedSprite = sprite.id;
                      setTimeout(() => { (window as any)._lastClickedSprite = null; }, 150);
                      break;
                  }
              }
          }}
        />
      </div>
      <p className="text-xs text-slate-400 mt-2 mb-4">Center is (0,0). Width: 480, Height: 360</p>
      
      {/* Assets Manager Panel */}
      <div className="w-full flex flex-col sm:flex-row gap-4 mt-2">
          {/* Sprites Manager */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-slate-600">Sprites</h4>
              </div>
              <div className="flex gap-2 mb-3 overflow-x-auto py-1">
                  {spritesList.map(s => (
                      <div 
                        key={s.id} 
                        onClick={() => {
                            if (engine) engine.activeSpriteId = s.id;
                            setActiveSpriteId(s.id);
                            if (onActiveSpriteChange) onActiveSpriteChange(s.id);
                        }}
                        className={`w-16 h-16 rounded-md border-2 cursor-pointer flex flex-col justify-center items-center bg-white shadow-sm overflow-hidden ${activeSpriteId === s.id ? 'border-blue-500' : 'border-transparent hover:border-slate-300'}`}
                      >
                          {s.url ? <img src={s.url} alt={s.name} className="w-10 h-10 object-contain" /> : <div className="w-10 h-10 bg-blue-400"></div>}
                      </div>
                  ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Cat', '/assets/sprites/cat.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Cat</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Robot', '/assets/sprites/robot.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Robot</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Dog', '/assets/sprites/dog.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Dog</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Alien', '/assets/sprites/alien.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Alien</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Rocket', '/assets/sprites/rocket.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Rocket</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Wizard', '/assets/sprites/wizard.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Wizard</button>
                  <button onClick={() => {
                      if (engine) {
                          const id = engine.addSprite(`sprite_${Date.now()}`, 'Dinosaur', '/assets/sprites/dinosaur.png').id;
                          setActiveSpriteId(id);
                          if (onActiveSpriteChange) onActiveSpriteChange(id);
                      }
                      setSpritesList(engine!.sprites.map(sp => ({id: sp.id, name: sp.name, url: sp.img?.src || null})));
                  }} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">+ Dinosaur</button>
              </div>
          </div>
          
          {/* Backdrop Manager */}
          <div className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-slate-600 mb-2">Stage (Backdrops)</h4>
              <div className="flex flex-col gap-2">
                  <button onClick={() => engine?.setBackdrop('/assets/backdrops/space.png')} className="text-xs w-full py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">🔭 Space</button>
                  <button onClick={() => engine?.setBackdrop('/assets/backdrops/meadow.png')} className="text-xs w-full py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">🌿 Meadow</button>
                  <button onClick={() => engine?.setBackdrop('/assets/backdrops/desert.png')} className="text-xs w-full py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">🏜️ Desert</button>
                  <button onClick={() => engine?.setBackdrop('/assets/backdrops/underwater.png')} className="text-xs w-full py-1 bg-white border border-slate-300 rounded hover:bg-slate-100">🌊 Underwater</button>
                  <button onClick={() => engine?.setBackdrop(null)} className="text-xs w-full py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 text-red-500">🚫 Clear</button>
              </div>
          </div>
      </div>
      
    </div>
  );
}
