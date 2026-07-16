import React, { useRef, useState, useEffect } from 'react';
import { useAppStudioStore, AppElement } from '../store/useAppStudioStore';
import { 
  ZoomIn, ZoomOut, Maximize2, Trash2, Copy, Move, RefreshCw, 
  MapPin, Video, Volume2, Mic, Camera, BarChart2, Scan, EyeOff
} from 'lucide-react';

export default function VisualCanvas() {
  const {
    projects,
    currentProjectId,
    currentScreenId,
    selectedComponentId,
    updateElementProp,
    selectElement,
    deleteElement,
    duplicateElement,
    zoom,
    setZoom,
    pan,
    setPan,
    snapToGrid,
    gridSize
  } = useAppStudioStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 });
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const project = projects.find(p => p.id === currentProjectId);
  const screen = project?.screens.find(s => s.id === currentScreenId);
  const elements = screen?.elements || [];

  // Canvas Drag/Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking direct canvas workspace (middle button or spacebar + drag)
    if (e.target === canvasRef.current || e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggedElementId) {
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      
      let newX = dragStart.elX + dx;
      let newY = dragStart.elY + dy;

      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }

      // Constrain inside phone width/height (approx 320x560)
      newX = Math.max(0, Math.min(320 - 20, newX));
      newY = Math.max(0, Math.min(560 - 20, newY));

      updateElementProp(draggedElementId, 'style', { x: newX, y: newY });
    } else if (resizingElementId) {
      const dx = (e.clientX - resizeStart.x) / zoom;
      const dy = (e.clientY - resizeStart.y) / zoom;

      let newWidth = resizeStart.width + dx;
      let newHeight = resizeStart.height + dy;

      if (snapToGrid) {
        newWidth = Math.max(10, Math.round(newWidth / gridSize) * gridSize);
        newHeight = Math.max(10, Math.round(newHeight / gridSize) * gridSize);
      }

      updateElementProp(resizingElementId, 'style', { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedElementId(null);
    setResizingElementId(null);
  };

  // Keyboard deletion/duplication handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedComponentId) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          // Verify input fields are not active to avoid deleting components while typing properties
          if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
            deleteElement(selectedComponentId);
          }
        }
        if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          duplicateElement(selectedComponentId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, deleteElement, duplicateElement]);

  const startDragElement = (e: React.MouseEvent, el: AppElement) => {
    e.stopPropagation();
    selectElement(el.id);
    setDraggedElementId(el.id);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elX: el.style.x,
      elY: el.style.y
    });
  };

  const startResizeElement = (e: React.MouseEvent, el: AppElement) => {
    e.stopPropagation();
    setResizingElementId(el.id);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: el.style.width,
      height: el.style.height
    });
  };

  // Render element custom markup on visual canvas
  const renderElement = (el: AppElement) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      borderRadius: el.style.borderRadius,
      opacity: el.style.opacity,
      transform: `rotate(${el.style.rotation}deg)`,
      backgroundColor: el.style.backgroundColor,
      color: el.style.color,
      fontFamily: el.style.fontFamily,
      fontSize: el.style.fontSize,
      fontWeight: el.style.fontWeight,
      textAlign: el.style.textAlign,
      zIndex: el.style.zIndex,
      border: '1px solid #cbd5e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      userSelect: 'none',
      overflow: 'hidden'
    };

    switch (el.type) {
      case 'button':
        return <button style={{ ...baseStyle, cursor: 'move' }} className="shadow-sm font-bold">{el.text}</button>;
      case 'label':
        return <div style={{ ...baseStyle, border: '1px dashed #e2e8f0', justifyContent: el.style.textAlign === 'left' ? 'flex-start' : el.style.textAlign === 'right' ? 'flex-end' : 'center', padding: '0 4px' }}>{el.text}</div>;
      case 'input':
        return <input type="text" placeholder={el.hint} style={baseStyle} className="px-2" readOnly />;
      case 'passwordInput':
        return <input type="password" placeholder={el.hint} style={baseStyle} className="px-2" readOnly />;
      case 'numberInput':
        return <input type="number" value={el.value} style={baseStyle} className="px-2" readOnly />;
      case 'textArea':
        return <textarea placeholder={el.hint} style={{ ...baseStyle, alignItems: 'flex-start', padding: '4px' }} readOnly>{el.text}</textarea>;
      case 'image':
        return <img src={el.src} alt={el.name} style={{ ...baseStyle, objectFit: 'cover' }} />;
      case 'icon':
        return <div style={{ ...baseStyle, border: '0', fontSize: el.style.fontSize * 1.5 }}>{el.text}</div>;
      case 'divider':
        return <div style={{ ...baseStyle, border: '0', height: '2px', backgroundColor: el.style.backgroundColor }}></div>;
      case 'spacer':
        return <div style={{ ...baseStyle, border: '1px dashed #94a3b8', backgroundColor: 'transparent' }} className="text-[9px] text-slate-400">Spacer</div>;
      case 'card':
        return <div style={baseStyle} className="shadow-md bg-white border border-slate-200"></div>;
      case 'row':
        return <div style={{ ...baseStyle, border: '2px dashed #6366f1', backgroundColor: 'rgba(99,102,241,0.05)', justifyContent: 'space-around' }} className="text-[10px] text-indigo-400">Row Container</div>;
      case 'column':
        return <div style={{ ...baseStyle, border: '2px dashed #6366f1', backgroundColor: 'rgba(99,102,241,0.05)', flexDirection: 'column', justifyContent: 'space-around' }} className="text-[10px] text-indigo-400">Col Container</div>;
      case 'checkbox':
        return (
          <div style={{ ...baseStyle, justifyContent: 'flex-start', gap: '8px', border: '0' }}>
            <input type="checkbox" checked={el.checked} className="w-4 h-4" readOnly />
            <span className="text-xs">{el.text}</span>
          </div>
        );
      case 'switch':
        return (
          <div style={{ ...baseStyle, justifyContent: 'flex-start', gap: '8px', border: '0' }}>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${el.checked ? 'bg-indigo-600' : 'bg-slate-350'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${el.checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
            <span className="text-xs">{el.text}</span>
          </div>
        );
      case 'radioButton':
        return (
          <div style={{ ...baseStyle, justifyContent: 'flex-start', gap: '8px', border: '0' }}>
            <input type="radio" checked={el.checked} className="w-4 h-4" readOnly />
            <span className="text-xs">{el.text}</span>
          </div>
        );
      case 'dropdown':
        return (
          <select style={baseStyle} className="px-2">
            <option>{el.value || 'Select option...'}</option>
          </select>
        );
      case 'slider':
        return <input type="range" min="0" max="100" value={el.value} style={baseStyle} readOnly />;
      case 'datePicker':
        return <input type="date" value={el.value} style={baseStyle} className="px-2" readOnly />;
      case 'timePicker':
        return <input type="time" value={el.value} style={baseStyle} className="px-2" readOnly />;
      case 'audio':
        return (
          <div style={{ ...baseStyle, borderRadius: '50%', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
            <Volume2 size={24} className="text-indigo-600" />
          </div>
        );
      case 'video':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#000000' }} className="flex flex-col gap-1 text-[10px] text-slate-400">
            <Video size={24} />
            <span>Video URL Preview</span>
          </div>
        );
      case 'camera':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#334155' }} className="flex flex-col gap-1 text-slate-300 text-xs font-black">
            <Camera size={24} />
            <span>MOCK CAMERA</span>
          </div>
        );
      case 'microphone':
        return (
          <div style={{ ...baseStyle, borderRadius: '50%', backgroundColor: '#f8fafc' }}>
            <Mic size={24} className="text-red-500 animate-pulse" />
          </div>
        );
      case 'canvas':
        return (
          <div style={baseStyle} className="bg-white border-2 border-slate-300 flex flex-col items-center justify-center text-[10px] text-slate-400">
            <span>Paint Canvas Area</span>
          </div>
        );
      case 'chart':
        return (
          <div style={baseStyle} className="bg-white flex flex-col items-center justify-center gap-1.5 p-2">
            <BarChart2 size={32} className="text-indigo-500" />
            <span className="text-[10px] font-bold uppercase text-slate-500">{el.chartType || 'Bar'} Chart Data</span>
          </div>
        );
      case 'map':
        return (
          <div style={baseStyle} className="bg-slate-100 flex flex-col items-center justify-center gap-1.5 p-2">
            <MapPin size={24} className="text-red-500" />
            <span className="text-[10px] font-bold text-slate-600">{el.mapCenter || 'Coordinates'}</span>
          </div>
        );
      case 'qrScanner':
        return (
          <div style={{ ...baseStyle, backgroundColor: '#0f172a' }} className="relative flex flex-col items-center justify-center gap-1.5 text-slate-400">
            <Scan size={32} className="text-indigo-400" />
            <div className="absolute left-0 w-full h-0.5 bg-indigo-500 top-1/2 animate-bounce"></div>
            <span className="text-[9px] uppercase font-mono">QR SCANNING ACTIVE</span>
          </div>
        );
      case 'webViewer':
        return (
          <div style={baseStyle} className="bg-white flex flex-col items-center justify-center border-slate-300 text-[10px] text-slate-400">
            <span>Web Viewer Frame</span>
            <span className="text-[8px] truncate max-w-[90%] text-slate-500">{el.src}</span>
          </div>
        );
      default:
        return <div style={baseStyle}>[{el.type}]</div>;
    }
  };

  return (
    <div 
      ref={canvasRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex-1 bg-slate-950 border border-slate-900 overflow-hidden relative flex items-center justify-center select-none group/canvas cursor-grab active:cursor-grabbing custom-scrollbar"
    >
      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }}
      ></div>

      {/* Simulator Frame Container */}
      <div 
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`, 
          transformOrigin: 'center center',
          transition: isPanning ? 'none' : 'transform 0.05s ease-out'
        }}
        className="relative"
      >
        {/* Phone outer bezel */}
        <div className="w-[344px] h-[584px] bg-slate-900 border-[12px] border-slate-800 rounded-[38px] shadow-2xl flex items-center justify-center relative ring-4 ring-slate-850">
          {/* Top Speaker / Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
            <div className="w-12 h-1 bg-slate-900 rounded-full"></div>
          </div>

          {/* Canvas Screens Viewport */}
          <div 
            style={{ backgroundColor: screen?.backgroundColor || '#ffffff' }}
            className="w-[320px] h-[560px] rounded-[24px] overflow-hidden relative shadow-inner"
          >
            {elements.map((el) => {
              const isSelected = selectedComponentId === el.id;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => startDragElement(e, el)}
                  className="absolute cursor-move"
                  style={{
                    left: el.style.x,
                    top: el.style.y,
                    width: el.style.width,
                    height: el.style.height,
                    zIndex: el.style.zIndex
                  }}
                >
                  {/* Element wrapper */}
                  {renderElement(el)}

                  {/* Design Selection Ring */}
                  {isSelected && (
                    <div className="absolute inset-0 border-2 border-indigo-500 rounded-lg pointer-events-none ring-2 ring-indigo-500/10">
                      {/* Drag / Move Helper Icon */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white rounded px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1 shadow">
                        <Move size={8} /> {el.name}
                      </div>

                      {/* Resize Handle (Bottom Right Corner) */}
                      <div
                        onMouseDown={(e) => startResizeElement(e, el)}
                        className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-600 border border-white rounded-full cursor-se-resize flex items-center justify-center shadow pointer-events-auto hover:scale-125 transition-transform"
                        title="Drag to resize"
                      >
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Hidden Indicator */}
                  {!el.visible && (
                    <div className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-0.5 shadow border border-white">
                      <EyeOff size={10} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zoom Widget Controls */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center gap-1 shadow-lg z-30">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-mono font-bold text-slate-400 min-w-[32px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Reset Zoom & Pan"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Grid status display */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 shadow-lg pointer-events-none">
        Grid Snap: {snapToGrid ? `ON (${gridSize}px)` : 'OFF'}
      </div>
    </div>
  );
}
