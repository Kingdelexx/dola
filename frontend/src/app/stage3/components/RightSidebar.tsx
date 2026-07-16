import React, { useState } from 'react';
import { useAppStudioStore, AppElement } from '../store/useAppStudioStore';
import { Settings, BookOpen, Trash2, Copy, Shield, Layers, HelpCircle } from 'lucide-react';

interface ComponentDoc {
  description: string;
  usage: string;
  example: string;
  bestPractices: string;
  mistakes: string;
  challenge: string;
}

const COMPONENT_DOCS: Record<string, ComponentDoc> = {
  button: {
    description: "Buttons are interactive elements that users click to trigger actions in an application.",
    usage: "Use buttons for submits, increments, navigation, or triggering animations.",
    example: "onEvent(\"button1\", \"click\", () => { log(\"Clicked!\"); });",
    bestPractices: "Give buttons clear action words like 'Save', 'Submit', or 'Play Game'.",
    mistakes: "Leaving the default ID as 'button1' when you have 10 buttons makes code hard to read. Rename it to 'btnSubmit'.",
    challenge: "Add a button, rename its ID to 'btnColor', and write code to change the screen background when clicked."
  },
  label: {
    description: "Labels display read-only text or descriptions on the screen.",
    usage: "Display headings, score counters, instructions, or static info.",
    example: "setText(\"scoreDisplay\", \"Score: \" + score);",
    bestPractices: "Set text alignments (center/left/right) carefully to ensure a polished layout.",
    mistakes: "Setting a small width, causing long labels to wrap awkwardly or clip off-screen.",
    challenge: "Create a label that acts as a timer, updating its text every second."
  },
  input: {
    description: "Text Inputs allow users to type in single-line text data.",
    usage: "Capture user names, comments, search terms, or email addresses.",
    example: "let name = getText(\"nameInput\");",
    bestPractices: "Always provide a clear 'hint' or placeholder so users know what to enter.",
    mistakes: "Trying to read number variables directly from a text input without converting (use Number(getText(...))).",
    challenge: "Create a welcome page where entering a name and clicking a button changes a label to 'Welcome, [Name]!'."
  },
  slider: {
    description: "Sliders allow users to pick a numeric value by sliding a knob.",
    usage: "Adjust volume levels, font sizes, screen brightness, or values in graphs.",
    example: "onEvent(\"volumeSlider\", \"change\", () => { let val = getProperty(\"volumeSlider\", \"value\"); });",
    bestPractices: "Set reasonable default ranges in code, like 0 to 100.",
    mistakes: "Using a slider without updating a visual indicator (like a label) next to it to show the active value.",
    challenge: "Create a slider that dynamically changes the font size of a label as it slides."
  },
  switch: {
    description: "Switches allow users to toggle a setting between ON and OFF states.",
    usage: "Enable dark mode, toggle notifications, or mute game music.",
    example: "let isMuted = getProperty(\"soundSwitch\", \"checked\");",
    bestPractices: "Provide clear labeling so the user knows what turning the switch ON does.",
    mistakes: "Not checking the 'checked' state in your handler, assuming a switch click is always positive.",
    challenge: "Create a switch that toggles the background of the screen between dark blue and light grey."
  },
  image: {
    description: "Images display pictures, graphics, or icons loaded from a web URL.",
    usage: "Add user avatars, banners, illustrative diagrams, or custom background assets.",
    example: "setProperty(\"avatarImg\", \"src\", \"https://example.com/pic.png\");",
    bestPractices: "Use optimized image URLs that load quickly to avoid blank spaces.",
    mistakes: "Using non-secure HTTP image links, which might get blocked by browsers.",
    challenge: "Create a gallery switcher with 'Next' and 'Prev' buttons that update the image source URL."
  },
  chart: {
    description: "Charts render interactive data visualizations (bar, line, or pie charts).",
    usage: "Display dashboard reports, expense analysis, or quiz statistics.",
    example: "setProperty(\"salesChart\", \"chartType\", \"pie\");",
    bestPractices: "Ensure color contrast is high so users can distinguish data sections.",
    mistakes: "Displaying too many columns, making the chart look cluttered.",
    challenge: "Add a chart and create buttons to toggle the chart type between bar, line, and pie."
  },
  map: {
    description: "Maps embed interactive street maps in the application screen.",
    usage: "Display location addresses, route tracking, or school project campuses.",
    example: "setProperty(\"schoolMap\", \"mapCenter\", \"London, UK\");",
    bestPractices: "Combine map listings with search inputs so users can zoom to their preferred cities.",
    mistakes: "Leaving default map coordinates, making it irrelevant to the local app context.",
    challenge: "Create a travel explorer where clicking buttons for cities like 'Tokyo' or 'Paris' centers the map on those locations."
  }
};

export default function RightSidebar() {
  const {
    currentProjectId,
    currentScreenId,
    selectedComponentId,
    projects,
    updateElementProp,
    deleteElement,
    duplicateElement,
    setElementOrder
  } = useAppStudioStore();

  const [activeSubTab, setActiveSubTab] = useState<'inspector' | 'learn'>('inspector');

  const project = projects.find(p => p.id === currentProjectId);
  const screen = project?.screens.find(s => s.id === currentScreenId);
  const element = screen?.elements.find(e => e.id === selectedComponentId);

  if (!selectedComponentId || !element) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center p-6 text-slate-500 text-center select-none">
        <HelpCircle size={48} className="text-slate-700 mb-4 animate-bounce" />
        <h3 className="font-bold text-slate-400 mb-1">No Element Selected</h3>
        <p className="text-xs max-w-[200px]">Click any component on the visual canvas or select one from the Left Sidebar to edit properties.</p>
      </div>
    );
  }

  const handlePropChange = (prop: keyof AppElement, val: any) => {
    updateElementProp(element.id, prop, val);
  };

  const handleStyleChange = (styleProp: string, val: any) => {
    updateElementProp(element.id, 'style', { [styleProp]: val });
  };

  const handleEventChange = (eventProp: string, val: any) => {
    updateElementProp(element.id, 'events', { [eventProp]: val });
  };

  const doc = COMPONENT_DOCS[element.type] || {
    description: `A standard ${element.type} component.`,
    usage: "Place inside containers or screens.",
    example: `// Use setProperty/getProperty to control\nsetProperty("${element.id}", "visible", false);`,
    bestPractices: "Rename the ID to be semantic.",
    mistakes: "Leaving defaults unmodified.",
    challenge: "Explore the style parameters to customize the visual look."
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-hidden text-slate-300">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 p-1">
        <button
          onClick={() => setActiveSubTab('inspector')}
          className={`flex-1 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'inspector' ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings size={14} />
          PROPERTIES
        </button>
        <button
          onClick={() => setActiveSubTab('learn')}
          className={`flex-1 py-2 text-xs font-black rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'learn' ? 'bg-indigo-600/25 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen size={14} />
          LEARN & HELP
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {activeSubTab === 'inspector' ? (
          <>
            {/* Component Metadata */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{element.type} component</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => duplicateElement(element.id)}
                    title="Duplicate Element"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => deleteElement(element.id)}
                    title="Delete Element"
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Component ID</label>
                <input
                  type="text"
                  value={element.id}
                  onChange={(e) => handlePropChange('id', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="w-full bg-slate-900 border border-slate-850 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono text-indigo-300 font-bold"
                />
              </div>
            </div>

            {/* General Properties */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">General</h4>
              
              {/* Text Property (Conditional) */}
              {element.text !== undefined && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Text Value</label>
                  <input
                    type="text"
                    value={element.text}
                    onChange={(e) => handlePropChange('text', e.target.value)}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Hint Property (Conditional) */}
              {element.hint !== undefined && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Hint / Placeholder</label>
                  <input
                    type="text"
                    value={element.hint}
                    onChange={(e) => handlePropChange('hint', e.target.value)}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Value Property (Conditional) */}
              {element.value !== undefined && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Default Value</label>
                  <input
                    type="text"
                    value={element.value}
                    onChange={(e) => handlePropChange('value', e.target.value)}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Options List (Conditional for Dropdown) */}
              {element.options !== undefined && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">Options (Comma separated)</label>
                  <input
                    type="text"
                    value={element.options.join(', ')}
                    onChange={(e) => handlePropChange('options', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Source Link (Conditional for Media) */}
              {element.src !== undefined && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-bold">Asset Source URL</label>
                  <input
                    type="text"
                    value={element.src}
                    onChange={(e) => handlePropChange('src', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Checked State (Conditional for Selection) */}
              {element.checked !== undefined && (
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-400 font-bold">Default Checked</label>
                  <input
                    type="checkbox"
                    checked={element.checked}
                    onChange={(e) => handlePropChange('checked', e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded bg-slate-950 border-slate-850"
                  />
                </div>
              )}

              {/* Chart Type (Conditional for Charts) */}
              {element.chartType !== undefined && (
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Chart Type</label>
                  <select
                    value={element.chartType}
                    onChange={(e) => handlePropChange('chartType', e.target.value)}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
              )}

              {/* Visibility and State */}
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400 font-bold">Visible on startup</label>
                <input
                  type="checkbox"
                  checked={element.visible}
                  onChange={(e) => handlePropChange('visible', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-[11px] text-slate-400 font-bold">Enabled</label>
                <input
                  type="checkbox"
                  checked={element.enabled}
                  onChange={(e) => handlePropChange('enabled', e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
              </div>
            </div>

            {/* Layout & Style Properties */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">Appearance</h4>
              
              {/* Positions */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">X Position</label>
                  <input
                    type="number"
                    value={element.style.x}
                    onChange={(e) => handleStyleChange('x', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Y Position</label>
                  <input
                    type="number"
                    value={element.style.y}
                    onChange={(e) => handleStyleChange('y', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Width (px)</label>
                  <input
                    type="number"
                    value={element.style.width}
                    onChange={(e) => handleStyleChange('width', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase">Height (px)</label>
                  <input
                    type="number"
                    value={element.style.height}
                    onChange={(e) => handleStyleChange('height', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Styling Details */}
              <div className="space-y-2">
                {/* Background color */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Bg Color</label>
                  <input
                    type="color"
                    value={element.style.backgroundColor.startsWith('#') ? element.style.backgroundColor : '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="h-8 w-12 bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={element.style.backgroundColor}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none font-mono"
                  />
                </div>

                {/* Text Color */}
                {element.text !== undefined && (
                  <div className="grid grid-cols-3 items-center gap-2">
                    <label className="text-[11px] text-slate-400 font-bold">Text Color</label>
                    <input
                      type="color"
                      value={element.style.color.startsWith('#') ? element.style.color : '#000000'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="h-8 w-12 bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={element.style.color}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none font-mono"
                    />
                  </div>
                )}

                {/* Font Styling */}
                {element.text !== undefined && (
                  <>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-[11px] text-slate-400 font-bold">Font Size</label>
                      <input
                        type="number"
                        value={element.style.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                        className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-[11px] text-slate-400 font-bold">Alignment</label>
                      <select
                        value={element.style.textAlign}
                        onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                        className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-2">
                      <label className="text-[11px] text-slate-400 font-bold">Font Family</label>
                      <select
                        value={element.style.fontFamily}
                        onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                        className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="system-ui">System Default</option>
                        <option value="monospace">Monospace</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="serif">Serif</option>
                        <option value="cursive">Cursive</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Border Radius */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={element.style.borderRadius}
                    onChange={(e) => handleStyleChange('borderRadius', Number(e.target.value))}
                    className="col-span-2 h-1 accent-indigo-500 rounded bg-slate-800"
                  />
                </div>

                {/* Opacity */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={element.style.opacity}
                    onChange={(e) => handleStyleChange('opacity', Number(e.target.value))}
                    className="col-span-2 h-1 accent-indigo-500 rounded bg-slate-800"
                  />
                </div>

                {/* Rotation */}
                <div className="grid grid-cols-3 items-center gap-2">
                  <label className="text-[11px] text-slate-400 font-bold">Rotation</label>
                  <input
                    type="number"
                    value={element.style.rotation}
                    onChange={(e) => handleStyleChange('rotation', Number(e.target.value))}
                    className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Layers Control */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">Layers</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setElementOrder(element.id, 'front')}
                  className="flex-1 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <Layers size={12} /> Bring Front
                </button>
                <button
                  onClick={() => setElementOrder(element.id, 'back')}
                  className="flex-1 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <Layers size={12} className="rotate-180" /> Send Back
                </button>
              </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1">Accessibility (ARIA)</h4>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-[11px] text-slate-400 font-bold">Aria Label</label>
                <input
                  type="text"
                  value={element.ariaLabel || ''}
                  onChange={(e) => handlePropChange('ariaLabel', e.target.value)}
                  className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g. Plus button"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <label className="text-[11px] text-slate-400 font-bold">Tab Index</label>
                <input
                  type="number"
                  value={element.tabIndex || 0}
                  onChange={(e) => handlePropChange('tabIndex', Number(e.target.value))}
                  className="col-span-2 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Behavior Events */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1 font-mono">Event Handlers</h4>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black font-mono">ONCLICK</label>
                  <input
                    type="text"
                    value={element.events?.onClick || ''}
                    onChange={(e) => handleEventChange('onClick', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none font-mono text-emerald-400"
                    placeholder="e.g. handleIncrement();"
                  />
                </div>
                {element.type === 'input' || element.type === 'slider' || element.type === 'dropdown' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-black font-mono">ONCHANGE</label>
                    <input
                      type="text"
                      value={element.events?.onChange || ''}
                      onChange={(e) => handleEventChange('onChange', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none font-mono text-emerald-400"
                      placeholder="e.g. handleUpdateValue();"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          /* Learning Help Panel */
          <div className="space-y-5 text-slate-300">
            <div className="bg-indigo-950/30 border border-indigo-500/20 p-4 rounded-xl space-y-2">
              <h3 className="text-sm font-black text-indigo-400 flex items-center gap-2">
                <BookOpen size={16} />
                {element.type.toUpperCase()} COMPONENT
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">{doc.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">When to Use</h4>
              <p className="text-xs leading-relaxed text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850">{doc.usage}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">Code Example</h4>
              <pre className="text-[11px] font-mono text-emerald-400 bg-slate-950 p-3 rounded-lg border border-slate-850 overflow-x-auto whitespace-pre-wrap select-all">
                {doc.example}
              </pre>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Shield size={12} /> Best Practices
              </h4>
              <p className="text-xs leading-relaxed text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850">{doc.bestPractices}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1">
                ⚠️ Common Mistakes
              </h4>
              <p className="text-xs leading-relaxed text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850">{doc.mistakes}</p>
            </div>

            <div className="space-y-2">
              <div className="bg-amber-950/20 border border-amber-500/20 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  ⭐ Mini Challenge
                </h4>
                <p className="text-xs leading-relaxed text-slate-300">{doc.challenge}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
