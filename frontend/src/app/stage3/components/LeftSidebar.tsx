import React, { useState } from 'react';
import { useAppStudioStore, ProjectAsset } from '../store/useAppStudioStore';
import { 
  Grid, Play, Plus, Trash2, Copy, FileText, Image, Music, Film, Folder, 
  Sparkles, Code, CheckSquare, Layers, Laptop, Smartphone, HelpCircle
} from 'lucide-react';

export default function LeftSidebar() {
  const {
    leftSidebarTab,
    setLeftSidebarTab,
    projects,
    currentProjectId,
    currentScreenId,
    addElement,
    addScreen,
    deleteScreen,
    duplicateScreen,
    renameScreen,
    selectScreen,
    addAsset,
    deleteAsset,
    loadTemplate
  } = useAppStudioStore();

  const [renameScreenId, setRenameScreenId] = useState<string | null>(null);
  const [tempScreenName, setTempScreenName] = useState('');
  
  // Custom asset form state
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState<ProjectAsset['type']>('image');
  const [assetUrl, setAssetUrl] = useState('');
  const [showAssetForm, setShowAssetForm] = useState(false);

  const project = projects.find(p => p.id === currentProjectId);
  if (!project) return null;

  const componentCategories = [
    {
      title: 'Basic Components',
      items: [
        { type: 'button', label: 'Button', desc: 'Clickable button', icon: '🔘' },
        { type: 'label', label: 'Label', desc: 'Static text label', icon: '📝' },
        { type: 'input', label: 'Text Input', desc: 'Single-line input', icon: '✍️' },
        { type: 'passwordInput', label: 'Password Input', desc: 'Hidden text field', icon: '🔒' },
        { type: 'numberInput', label: 'Number Input', desc: 'Numeric field', icon: '🔢' },
        { type: 'textArea', label: 'Text Area', desc: 'Multi-line block text', icon: '🗒️' },
        { type: 'image', label: 'Image', desc: 'Display a picture URL', icon: '🖼️' },
        { type: 'icon', label: 'Icon', desc: 'Emoji or visual symbol', icon: '⭐' },
        { type: 'divider', label: 'Divider', desc: 'Horizontal line', icon: '➖' },
        { type: 'spacer', label: 'Spacer', desc: 'Empty spacing layout', icon: '⬜' }
      ]
    },
    {
      title: 'Containers',
      items: [
        { type: 'card', label: 'Card', desc: 'Box container with shadow', icon: '🎴' },
        { type: 'row', label: 'Row Layout', desc: 'Horizontal flex wrapper', icon: '↔️' },
        { type: 'column', label: 'Column Layout', desc: 'Vertical stack wrapper', icon: '↕️' }
      ]
    },
    {
      title: 'Selection Controls',
      items: [
        { type: 'checkbox', label: 'Checkbox', desc: 'Toggle checkbox box', icon: '☑️' },
        { type: 'switch', label: 'Switch', desc: 'Toggle switch slider', icon: '🔛' },
        { type: 'radioButton', label: 'Radio Button', desc: 'Single pick button', icon: '🔘' },
        { type: 'dropdown', label: 'Dropdown Select', desc: 'Option chooser menu', icon: '🔽' },
        { type: 'slider', label: 'Slider Pick', desc: 'Slide value scale', icon: '🎚️' },
        { type: 'datePicker', label: 'Date Picker', desc: 'Interactive calendar', icon: '📅' },
        { type: 'timePicker', label: 'Time Picker', desc: 'Clock time chooser', icon: '🕒' }
      ]
    },
    {
      title: 'Media Elements',
      items: [
        { type: 'audio', label: 'Audio Clip', desc: 'Play sounds/music', icon: '🔊' },
        { type: 'video', label: 'Video Player', desc: 'Stream video content', icon: '🎥' },
        { type: 'camera', label: 'Camera Viewer', desc: 'Mock camera feed', icon: '📷' },
        { type: 'microphone', label: 'Mic Input', desc: 'Mock voice record', icon: '🎙️' },
        { type: 'canvas', label: 'Drawing Canvas', desc: 'Finger paint pad', icon: '🎨' }
      ]
    },
    {
      title: 'Advanced Controls',
      items: [
        { type: 'chart', label: 'Chart Diagram', desc: 'Data visualization plot', icon: '📊' },
        { type: 'map', label: 'Street Map', desc: 'Leaflet/Mapbox placeholder', icon: '🗺️' },
        { type: 'qrScanner', label: 'QR Scanner', desc: 'Camera scanning box', icon: '📱' },
        { type: 'webViewer', label: 'Web Viewer', desc: 'Iframe website frame', icon: '🌐' }
      ]
    }
  ];

  const handleStartRename = (screenId: string, screenName: string) => {
    setRenameScreenId(screenId);
    setTempScreenName(screenName);
  };

  const handleFinishRename = (screenId: string) => {
    if (tempScreenName.trim()) {
      renameScreen(screenId, tempScreenName);
    }
    setRenameScreenId(null);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetName && assetUrl) {
      addAsset(assetName, assetType, assetUrl);
      setAssetName('');
      setAssetUrl('');
      setShowAssetForm(false);
    }
  };

  const starterTemplates = [
    { id: 'quiz', name: 'Trivia Quiz Game 🏆', desc: 'Multiple questions, options click events, scoring system, and custom slide-up toast feedback.' },
    { id: 'calculator', name: 'Digital Calculator 🔢', desc: 'Responsive button grid, operation accumulator logic, and a dynamic display display.' },
    { id: 'todo', name: 'Simple Task Manager 📝', desc: 'Form field inputs, dynamic adding of lists, delete handlers, and DB saving triggers.' }
  ];

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden text-slate-300">
      {/* Tab Selectors */}
      <div className="grid grid-cols-5 border-b border-slate-800 bg-slate-950 p-1 text-center text-slate-400">
        {(['components', 'screens', 'assets', 'templates', 'files'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setLeftSidebarTab(tab)}
            className={`py-2 text-[10px] font-black uppercase rounded transition-all leading-tight ${
              leftSidebarTab === tab ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            {tab === 'components' ? 'Blocks' : tab}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {leftSidebarTab === 'components' && (
          <div className="space-y-4">
            <div className="bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-lg text-xs leading-relaxed text-indigo-300">
              💡 Click on any component item in the library to instantly spawn it onto your selected screen canvas.
            </div>
            {componentCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  {cat.title}
                </h4>
                <div className="grid grid-cols-1 gap-1.5">
                  {cat.items.map((item) => (
                    <button
                      key={item.type}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({ type: item.type }));
                        e.dataTransfer.setData('text/plain', item.type);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                      onClick={() => addElement(item.type)}
                      className="w-full flex items-center justify-between text-left p-2.5 bg-slate-950 hover:bg-indigo-900/15 border border-slate-850 hover:border-indigo-500/30 rounded-xl transition-all group cursor-grab active:cursor-grabbing"
                      title="Drag to canvas or click to add"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                        <div>
                          <p className="text-xs font-black text-slate-200 group-hover:text-indigo-400 transition-colors">{item.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                        </div>
                      </div>
                      <Plus size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:rotate-90 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {leftSidebarTab === 'screens' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Active Screens</h4>
              <button
                onClick={addScreen}
                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-black flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> ADD
              </button>
            </div>

            <div className="space-y-2">
              {project.screens.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    currentScreenId === s.id
                      ? 'bg-indigo-600/10 border-indigo-500/30 shadow'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Layers size={14} className={currentScreenId === s.id ? 'text-indigo-400' : 'text-slate-500'} />
                    {renameScreenId === s.id ? (
                      <input
                        type="text"
                        value={tempScreenName}
                        onChange={(e) => setTempScreenName(e.target.value)}
                        onBlur={() => handleFinishRename(s.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(s.id)}
                        autoFocus
                        className="bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-indigo-300 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => selectScreen(s.id)}
                        onDoubleClick={() => handleStartRename(s.id, s.name)}
                        className={`text-xs font-bold truncate text-left w-full ${
                          currentScreenId === s.id ? 'text-indigo-300 font-extrabold' : 'text-slate-300 hover:text-slate-100'
                        }`}
                        title="Double click to rename"
                      >
                        {s.name}
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateScreen(s.id)}
                      title="Duplicate Screen"
                      className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                    {project.screens.length > 1 && (
                      <button
                        onClick={() => deleteScreen(s.id)}
                        title="Delete Screen"
                        className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {leftSidebarTab === 'assets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Asset Manager</h4>
              <button
                onClick={() => setShowAssetForm(!showAssetForm)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-black flex items-center gap-1 transition-colors"
              >
                {showAssetForm ? 'CANCEL' : 'ADD ASSET'}
              </button>
            </div>

            {/* Asset Adder form */}
            {showAssetForm && (
              <form onSubmit={handleAddAsset} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Asset Name</label>
                  <input
                    type="text"
                    required
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="e.g. click_sound"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Asset Type</label>
                  <select
                    value={assetType}
                    onChange={(e) => setAssetType(e.target.value as ProjectAsset['type'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="image">Image</option>
                    <option value="audio">Audio Sound</option>
                    <option value="video">Video URL</option>
                    <option value="font">Custom Font</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Source URL</label>
                  <input
                    type="text"
                    required
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-black transition-colors"
                >
                  SAVE ASSET
                </button>
              </form>
            )}

            {/* Assets List */}
            <div className="space-y-2">
              {project.assets.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs border-2 border-dashed border-slate-800 rounded-xl">
                  No assets uploaded yet.<br />Add image/audio URLs to play in your app logic.
                </div>
              ) : (
                project.assets.map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-850 rounded-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      {asset.type === 'image' && <Image size={14} className="text-emerald-400" />}
                      {asset.type === 'audio' && <Music size={14} className="text-amber-400" />}
                      {asset.type === 'video' && <Film size={14} className="text-sky-400" />}
                      {asset.type === 'font' && <FileText size={14} className="text-purple-400" />}
                      <div>
                        <p className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{asset.name}</p>
                        <p className="text-[9px] font-mono text-slate-500 truncate max-w-[130px]">{asset.url}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="p-1 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {leftSidebarTab === 'templates' && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Starter Templates</h4>
            <div className="space-y-3">
              {starterTemplates.map((tpl) => (
                <div key={tpl.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <div>
                    <h5 className="text-xs font-black text-indigo-400">{tpl.name}</h5>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1">{tpl.desc}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Loading this template will replace your current workspace screen and code. Do you want to proceed?`)) {
                        loadTemplate(tpl.id);
                      }
                    }}
                    className="w-full py-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/25 hover:border-indigo-600 hover:text-white rounded text-[10px] font-black tracking-widest text-indigo-400 transition-all flex items-center justify-center gap-1"
                  >
                    <Sparkles size={11} /> LOAD TEMPLATE
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {leftSidebarTab === 'files' && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Workspace Files</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 p-2 bg-slate-950 rounded border border-slate-850 text-indigo-400 font-bold">
                <Code size={14} />
                <span>AppStudio.js</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-slate-950 rounded text-slate-400 cursor-not-allowed">
                <Folder size={14} />
                <span>manifest.json</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-slate-950 rounded text-slate-400 cursor-not-allowed">
                <Folder size={14} />
                <span>index.html</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
