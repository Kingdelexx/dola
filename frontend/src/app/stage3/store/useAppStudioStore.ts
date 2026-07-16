import { create } from 'zustand';

export interface AppElement {
  id: string;
  type: string;
  name: string;
  visible?: boolean;
  enabled?: boolean;
  text?: string;
  hint?: string;
  value?: any;
  ariaLabel?: string;
  tabIndex?: number;
  style: {
    x: number;
    y: number;
    width: number;
    height: number;
    minWidth?: number;
    maxWidth?: number;
    padding?: string;
    margin?: string;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
    borderRadius: number;
    boxShadow?: 'none' | 'sm' | 'md' | 'lg';
    opacity: number;
    rotation: number;
    backgroundColor: string;
    color: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    textAlign: 'left' | 'center' | 'right';
    position: 'absolute' | 'relative';
    zIndex: number;
  };
  events?: {
    onClick?: string;
    onChange?: string;
    onFocus?: string;
    onBlur?: string;
    onLoad?: string;
  };
  src?: string;
  options?: string[];
  checked?: boolean;
  chartType?: 'bar' | 'line' | 'pie';
  mapCenter?: string;
}

export interface AppScreen {
  id: string;
  name: string;
  backgroundColor: string;
  elements: AppElement[];
}

export interface ProjectAsset {
  id: string;
  name: string;
  type: 'image' | 'audio' | 'video' | 'json' | 'font';
  url: string;
}

export interface AppProject {
  id: string;
  name: string;
  screens: AppScreen[];
  assets: ProjectAsset[];
  code: string;
  blocklyXml: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AppStudioState {
  // Projects
  projects: AppProject[];
  currentProjectId: string | null;
  currentScreenId: string | null;
  selectedComponentId: string | null;
  
  // Workspace Config
  activeTab: 'design' | 'blocks' | 'code';
  leftSidebarTab: 'components' | 'screens' | 'assets' | 'templates' | 'files';
  bottomPanelTab: 'console' | 'problems' | 'logs' | 'output';
  ideTheme: 'dark' | 'light';
  
  // Canvas settings
  zoom: number;
  pan: { x: number; y: number };
  snapToGrid: boolean;
  gridSize: number;
  
  // Simulation State
  isRunning: boolean;
  simulatorActiveScreenId: string | null;
  simulatorElements: AppElement[];
  simulatorScreenColor: string;
  consoleLogs: string[];
  problems: { type: 'error' | 'warning'; message: string; line?: number }[];
  interactionLogs: string[];
  mockDatabase: Record<string, any>;
  
  // History Stack
  undoStack: Omit<AppProject, 'id' | 'createdAt' | 'updatedAt'>[];
  redoStack: Omit<AppProject, 'id' | 'createdAt' | 'updatedAt'>[];

  // Actions
  initProjects: () => void;
  selectProject: (id: string) => void;
  createProject: (name?: string) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => void;
  toggleFavoriteProject: (id: string) => void;
  
  // Screens Actions
  addScreen: () => void;
  deleteScreen: (id: string) => void;
  duplicateScreen: (id: string) => void;
  renameScreen: (id: string, name: string) => void;
  selectScreen: (id: string) => void;
  
  // Elements Actions
  addElement: (type: string) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  updateElementProp: (id: string, prop: keyof AppElement | 'style' | 'events', val: any) => void;
  selectElement: (id: string | null) => void;
  setElementOrder: (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => void;
  
  // Code & Blocks
  updateCode: (code: string) => void;
  updateBlocklyXml: (xml: string) => void;
  
  // View mode
  setActiveTab: (tab: 'design' | 'blocks' | 'code') => void;
  setLeftSidebarTab: (tab: 'components' | 'screens' | 'assets' | 'templates' | 'files') => void;
  setBottomPanelTab: (tab: 'console' | 'problems' | 'logs' | 'output') => void;
  setIdeTheme: (theme: 'dark' | 'light') => void;
  
  // Zoom & Pan
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  
  // Simulation Controls
  startSimulation: () => void;
  stopSimulation: () => void;
  setSimulatorScreen: (screenId: string) => void;
  addConsoleLog: (msg: string) => void;
  addProblem: (prob: { type: 'error' | 'warning'; message: string; line?: number }) => void;
  clearProblems: () => void;
  addInteractionLog: (msg: string) => void;
  updateSimulatorElementVal: (id: string, val: any) => void;
  updateMockDatabase: (key: string, val: any) => void;
  
  // History management
  pushStateToUndo: () => void;
  undo: () => void;
  redo: () => void;
  
  // Assets
  addAsset: (name: string, type: ProjectAsset['type'], url: string) => void;
  deleteAsset: (id: string) => void;
  
  // Templates
  loadTemplate: (templateName: string) => void;
}

const DEFAULT_PROJECTS: AppProject[] = [
  {
    id: 'counter-app',
    name: 'Counter App Demo',
    screens: [
      {
        id: 'screen1',
        name: 'Main Screen',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'titleLabel',
            type: 'label',
            name: 'Title Label',
            visible: true,
            enabled: true,
            text: 'Simple Counter 🔢',
            style: { x: 50, y: 40, width: 220, height: 40, borderRadius: 0, opacity: 1, rotation: 0, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 24, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'countDisplay',
            type: 'label',
            name: 'Count Label',
            visible: true,
            enabled: true,
            text: '0',
            style: { x: 50, y: 150, width: 220, height: 80, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#f1f5f9', color: '#4f46e5', fontFamily: 'monospace', fontSize: 48, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnMinus',
            type: 'button',
            name: 'Minus Button',
            visible: true,
            enabled: true,
            text: 'DEC -',
            style: { x: 40, y: 280, width: 100, height: 50, borderRadius: 25, opacity: 1, rotation: 0, backgroundColor: '#ef4444', color: '#ffffff', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 3 }
          },
          {
            id: 'btnPlus',
            type: 'button',
            name: 'Plus Button',
            visible: true,
            enabled: true,
            text: 'INC +',
            style: { x: 180, y: 280, width: 100, height: 50, borderRadius: 25, opacity: 1, rotation: 0, backgroundColor: '#22c55e', color: '#ffffff', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 4 }
          }
        ]
      }
    ],
    assets: [
      { id: '1', name: 'Success sound', type: 'audio', url: 'https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg' }
    ],
    code: `let count = 0;

onEvent("btnPlus", "click", () => {
  count = count + 1;
  setProperty("countDisplay", "text", count);
  playAudio("Success sound");
  log("Incremented count to " + count);
});

onEvent("btnMinus", "click", () => {
  count = count - 1;
  setProperty("countDisplay", "text", count);
  log("Decremented count to " + count);
});`,
    blocklyXml: '',
    isFavorite: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useAppStudioStore = create<AppStudioState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  currentScreenId: null,
  selectedComponentId: null,
  activeTab: 'design',
  leftSidebarTab: 'components',
  bottomPanelTab: 'console',
  ideTheme: 'dark',
  zoom: 1,
  pan: { x: 0, y: 0 },
  snapToGrid: true,
  gridSize: 10,
  
  isRunning: false,
  simulatorActiveScreenId: null,
  simulatorElements: [],
  simulatorScreenColor: '#ffffff',
  consoleLogs: [],
  problems: [],
  interactionLogs: [],
  mockDatabase: {},
  
  undoStack: [],
  redoStack: [],

  initProjects: () => {
    const saved = localStorage.getItem('dola_appstudio_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          set({
            projects: parsed,
            currentProjectId: parsed[0].id,
            currentScreenId: parsed[0].screens[0]?.id || null
          });
          return;
        }
      } catch (e) {
        console.error("Failed to parse projects:", e);
      }
    }
    // Seed defaults
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(DEFAULT_PROJECTS));
    set({
      projects: DEFAULT_PROJECTS,
      currentProjectId: DEFAULT_PROJECTS[0].id,
      currentScreenId: DEFAULT_PROJECTS[0].screens[0].id
    });
  },

  selectProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    if (project) {
      set({
        currentProjectId: id,
        currentScreenId: project.screens[0]?.id || null,
        selectedComponentId: null,
        undoStack: [],
        redoStack: []
      });
    }
  },

  createProject: (name = 'New Application') => {
    const newProj: AppProject = {
      id: `project-${Date.now()}`,
      name,
      screens: [
        { id: `screen-${Date.now()}`, name: 'Screen 1', backgroundColor: '#ffffff', elements: [] }
      ],
      assets: [],
      code: `// Write your JavaScript app logic here\nlog("App loaded! 🚀");\n`,
      blocklyXml: '',
      isFavorite: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updated = [...get().projects, newProj];
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentProjectId: newProj.id,
      currentScreenId: newProj.screens[0].id,
      selectedComponentId: null,
      undoStack: [],
      redoStack: []
    });
  },

  deleteProject: (id) => {
    const updated = get().projects.filter(p => p.id !== id);
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    const nextProj = updated[0]?.id || null;
    const nextScreen = updated[0]?.screens[0]?.id || null;
    set({
      projects: updated,
      currentProjectId: nextProj,
      currentScreenId: nextScreen,
      selectedComponentId: null
    });
  },

  renameProject: (id, name) => {
    const updated = get().projects.map(p => {
      if (p.id === id) {
        return { ...p, name, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  duplicateProject: (id) => {
    const target = get().projects.find(p => p.id === id);
    if (!target) return;
    const duplicate: AppProject = {
      ...target,
      id: `project-${Date.now()}`,
      name: `${target.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...get().projects, duplicate];
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentProjectId: duplicate.id,
      currentScreenId: duplicate.screens[0]?.id || null
    });
  },

  toggleFavoriteProject: (id) => {
    const updated = get().projects.map(p => {
      if (p.id === id) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  // Screens
  addScreen: () => {
    const projId = get().currentProjectId;
    if (!projId) return;
    
    get().pushStateToUndo();
    
    const newScreen: AppScreen = {
      id: `screen-${Date.now()}`,
      name: `Screen ${get().projects.find(p => p.id === projId)!.screens.length + 1}`,
      backgroundColor: '#ffffff',
      elements: []
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: [...p.screens, newScreen],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentScreenId: newScreen.id,
      selectedComponentId: null
    });
  },

  deleteScreen: (screenId) => {
    const projId = get().currentProjectId;
    if (!projId) return;
    const proj = get().projects.find(p => p.id === projId)!;
    if (proj.screens.length <= 1) return; // Prevent deleting last screen
    
    get().pushStateToUndo();

    const filteredScreens = proj.screens.filter(s => s.id !== screenId);
    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: filteredScreens,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentScreenId: filteredScreens[0].id,
      selectedComponentId: null
    });
  },

  duplicateScreen: (screenId) => {
    const projId = get().currentProjectId;
    if (!projId) return;
    const proj = get().projects.find(p => p.id === projId)!;
    const screen = proj.screens.find(s => s.id === screenId);
    if (!screen) return;

    get().pushStateToUndo();

    const copy: AppScreen = {
      ...screen,
      id: `screen-${Date.now()}`,
      name: `${screen.name} Copy`,
      elements: screen.elements.map(el => ({
        ...el,
        id: `${el.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      }))
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: [...p.screens, copy],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentScreenId: copy.id,
      selectedComponentId: null
    });
  },

  renameScreen: (screenId, name) => {
    const projId = get().currentProjectId;
    if (!projId) return;

    get().pushStateToUndo();

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => s.id === screenId ? { ...s, name } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  selectScreen: (id) => {
    set({ currentScreenId: id, selectedComponentId: null });
  },

  // Elements
  addElement: (type) => {
    const projId = get().currentProjectId;
    const screenId = get().currentScreenId;
    if (!projId || !screenId) return;

    get().pushStateToUndo();

    const proj = get().projects.find(p => p.id === projId)!;
    const screen = proj.screens.find(s => s.id === screenId)!;
    
    const count = screen.elements.filter(e => e.type === type).length + 1;
    const elId = `${type}${count}_${Date.now().toString().slice(-4)}`;

    const defaults: Record<string, Partial<Omit<AppElement, 'style'>> & { style?: Partial<AppElement['style']> }> = {
      button: { text: 'Button 🔘', style: { width: 140, height: 45, borderRadius: 8, backgroundColor: '#4f46e5', color: '#ffffff', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'bold', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      label: { text: 'Label text 📝', style: { width: 150, height: 35, borderRadius: 0, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      input: { text: '', hint: 'Type here...', style: { width: 180, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      passwordInput: { text: '', hint: 'Password...', style: { width: 180, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      numberInput: { text: '0', hint: '0', style: { width: 120, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      textArea: { text: '', hint: 'Write long text here...', style: { width: 220, height: 80, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      image: { src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop', style: { width: 120, height: 120, borderRadius: 8, backgroundColor: 'transparent', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      icon: { text: '⭐', style: { width: 40, height: 40, borderRadius: 0, backgroundColor: 'transparent', color: '#f59e0b', fontFamily: 'system-ui', fontSize: 24, fontWeight: 'bold', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      divider: { style: { width: 260, height: 2, borderRadius: 0, backgroundColor: '#e2e8f0', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      spacer: { style: { width: 200, height: 20, borderRadius: 0, backgroundColor: 'transparent', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      card: { style: { width: 240, height: 140, borderRadius: 16, backgroundColor: '#ffffff', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      row: { style: { width: 260, height: 60, borderRadius: 8, backgroundColor: '#f8fafc', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      column: { style: { width: 120, height: 200, borderRadius: 8, backgroundColor: '#f8fafc', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      grid: { style: { width: 240, height: 160, borderRadius: 8, backgroundColor: '#f8fafc', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      stack: { style: { width: 200, height: 120, borderRadius: 8, backgroundColor: '#f8fafc', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      scrollContainer: { style: { width: 240, height: 180, borderRadius: 8, backgroundColor: '#ffffff', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      checkbox: { text: 'Agree to Terms', checked: false, style: { width: 160, height: 30, borderRadius: 4, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      switch: { text: 'Mute Sound', checked: false, style: { width: 140, height: 30, borderRadius: 4, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      radioButton: { text: 'Option A', checked: false, style: { width: 140, height: 30, borderRadius: 4, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      dropdown: { options: ['Option 1', 'Option 2', 'Option 3'], value: 'Option 1', style: { width: 180, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      slider: { value: 50, style: { width: 180, height: 30, borderRadius: 10, backgroundColor: 'transparent', color: '#4f46e5', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      datePicker: { value: '2026-07-14', style: { width: 180, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      timePicker: { value: '09:00', style: { width: 120, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      audio: { src: 'https://actions.google.com/sounds/v1/cartoon/cartoon_cowbell.ogg', style: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f3f4f6', color: '#4f46e5', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      video: { src: 'https://www.w3schools.com/html/mov_bbb.mp4', style: { width: 240, height: 165, borderRadius: 8, backgroundColor: '#000000', color: '#ffffff', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      camera: { style: { width: 240, height: 180, borderRadius: 12, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'bold', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      microphone: { style: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#f1f5f9', color: '#ef4444', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      canvas: { style: { width: 240, height: 180, borderRadius: 8, backgroundColor: '#ffffff', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      chart: { chartType: 'bar', style: { width: 260, height: 160, borderRadius: 12, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      map: { mapCenter: 'New York, NY', style: { width: 260, height: 160, borderRadius: 12, backgroundColor: '#e2e8f0', color: '#1e293b', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      qrScanner: { style: { width: 200, height: 200, borderRadius: 16, backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } },
      webViewer: { src: 'https://example.com', style: { width: 260, height: 200, borderRadius: 8, backgroundColor: '#ffffff', color: '#000000', fontFamily: 'system-ui', fontSize: 12, fontWeight: 'normal', textAlign: 'center', opacity: 1, rotation: 0, position: 'absolute', zIndex: 10 } }
    };

    const newElement: AppElement = {
      id: elId,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${count}`,
      visible: true,
      enabled: true,
      text: defaults[type]?.text,
      hint: defaults[type]?.hint,
      value: defaults[type]?.value,
      src: defaults[type]?.src,
      options: defaults[type]?.options,
      checked: defaults[type]?.checked,
      chartType: defaults[type]?.chartType,
      mapCenter: defaults[type]?.mapCenter,
      style: {
        x: 30 + (screen.elements.length * 10) % 80,
        y: 80 + (screen.elements.length * 15) % 150,
        width: defaults[type]?.style?.width || 100,
        height: defaults[type]?.style?.height || 40,
        borderRadius: defaults[type]?.style?.borderRadius || 0,
        backgroundColor: defaults[type]?.style?.backgroundColor || '#ffffff',
        color: defaults[type]?.style?.color || '#000000',
        fontFamily: defaults[type]?.style?.fontFamily || 'system-ui',
        fontSize: defaults[type]?.style?.fontSize || 14,
        fontWeight: defaults[type]?.style?.fontWeight || 'normal',
        textAlign: defaults[type]?.style?.textAlign || 'left',
        opacity: defaults[type]?.style?.opacity || 1,
        rotation: defaults[type]?.style?.rotation || 0,
        position: 'absolute',
        zIndex: 10 + screen.elements.length
      },
      events: {
        onClick: '',
        onChange: ''
      }
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => s.id === screenId ? { ...s, elements: [...s.elements, newElement] } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      selectedComponentId: newElement.id
    });
  },

  deleteElement: (elId) => {
    const projId = get().currentProjectId;
    const screenId = get().currentScreenId;
    if (!projId || !screenId) return;

    get().pushStateToUndo();

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => s.id === screenId ? { ...s, elements: s.elements.filter(e => e.id !== elId) } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      selectedComponentId: get().selectedComponentId === elId ? null : get().selectedComponentId
    });
  },

  duplicateElement: (elId) => {
    const projId = get().currentProjectId;
    const screenId = get().currentScreenId;
    if (!projId || !screenId) return;

    get().pushStateToUndo();

    const proj = get().projects.find(p => p.id === projId)!;
    const screen = proj.screens.find(s => s.id === screenId)!;
    const target = screen.elements.find(e => e.id === elId);
    if (!target) return;

    const copy: AppElement = {
      ...target,
      id: `${target.type}_${Date.now()}`,
      name: `${target.name} Copy`,
      style: {
        ...target.style,
        x: target.style.x + 15,
        y: target.style.y + 15,
        zIndex: target.style.zIndex + 1
      }
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => s.id === screenId ? { ...s, elements: [...s.elements, copy] } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      selectedComponentId: copy.id
    });
  },

  updateElementProp: (elId, prop, val) => {
    const projId = get().currentProjectId;
    const screenId = get().currentScreenId;
    if (!projId || !screenId) return;

    // Simple auto-save for layout drag, don't flood undo stack
    // (Actual button properties, text editing pushes to undo stack on focus/blur or directly)

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => {
            if (s.id === screenId) {
              return {
                ...s,
                elements: s.elements.map(e => {
                  if (e.id === elId) {
                    if (prop === 'style') {
                      return { ...e, style: { ...e.style, ...val } };
                    }
                    if (prop === 'events') {
                      return { ...e, events: { ...e.events, ...val } };
                    }
                    return { ...e, [prop]: val };
                  }
                  return e;
                })
              };
            }
            return s;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  selectElement: (id) => {
    set({ selectedComponentId: id });
  },

  setElementOrder: (elId, direction) => {
    const projId = get().currentProjectId;
    const screenId = get().currentScreenId;
    if (!projId || !screenId) return;

    const proj = get().projects.find(p => p.id === projId)!;
    const screen = proj.screens.find(s => s.id === screenId)!;
    const elements = [...screen.elements];
    const index = elements.findIndex(e => e.id === elId);
    if (index === -1) return;

    get().pushStateToUndo();

    if (direction === 'front') {
      const maxZ = Math.max(...elements.map(e => e.style.zIndex), 0);
      elements[index].style.zIndex = maxZ + 1;
    } else if (direction === 'back') {
      const minZ = Math.min(...elements.map(e => e.style.zIndex), 1);
      elements[index].style.zIndex = Math.max(1, minZ - 1);
    } else if (direction === 'forward') {
      elements[index].style.zIndex += 1;
    } else if (direction === 'backward') {
      elements[index].style.zIndex = Math.max(1, elements[index].style.zIndex - 1);
    }

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: p.screens.map(s => s.id === screenId ? { ...s, elements } : s),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  // Code
  updateCode: (code) => {
    const projId = get().currentProjectId;
    if (!projId) return;

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return { ...p, code, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  updateBlocklyXml: (blocklyXml) => {
    const projId = get().currentProjectId;
    if (!projId) return;

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return { ...p, blocklyXml, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  // Tabs / Sidebars
  setActiveTab: (activeTab) => set({ activeTab }),
  setLeftSidebarTab: (leftSidebarTab) => set({ leftSidebarTab }),
  setBottomPanelTab: (bottomPanelTab) => set({ bottomPanelTab }),
  setIdeTheme: (ideTheme) => set({ ideTheme }),
  
  setZoom: (zoom) => set({ zoom }),
  setPan: (pan) => set((state) => ({ pan: typeof pan === 'function' ? pan(state.pan) : pan })),
  setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
  setGridSize: (gridSize) => set({ gridSize }),

  // Simulation
  startSimulation: () => {
    const projId = get().currentProjectId;
    if (!projId) return;
    const proj = get().projects.find(p => p.id === projId)!;
    
    set({
      isRunning: true,
      simulatorActiveScreenId: get().currentScreenId,
      simulatorElements: JSON.parse(JSON.stringify(proj.screens.find(s => s.id === get().currentScreenId)?.elements || [])),
      simulatorScreenColor: proj.screens.find(s => s.id === get().currentScreenId)?.backgroundColor || '#ffffff',
      consoleLogs: ['Simulator started 🚀'],
      problems: [],
      interactionLogs: ['Session started'],
      mockDatabase: {}
    });
  },

  stopSimulation: () => {
    set({
      isRunning: false,
      simulatorActiveScreenId: null,
      simulatorElements: [],
      consoleLogs: [...get().consoleLogs, 'Simulator stopped ⏹️']
    });
  },

  setSimulatorScreen: (screenId) => {
    const projId = get().currentProjectId;
    if (!projId) return;
    const proj = get().projects.find(p => p.id === projId)!;
    const screen = proj.screens.find(s => s.id === screenId);
    if (screen) {
      set({
        simulatorActiveScreenId: screenId,
        simulatorElements: JSON.parse(JSON.stringify(screen.elements)),
        simulatorScreenColor: screen.backgroundColor
      });
      get().addConsoleLog(`Navigated to screen: ${screen.name}`);
    }
  },

  addConsoleLog: (msg) => {
    set((state) => ({ consoleLogs: [...state.consoleLogs, msg] }));
  },

  addProblem: (prob) => {
    set((state) => ({ problems: [...state.problems, prob] }));
  },

  clearProblems: () => set({ problems: [] }),

  addInteractionLog: (msg) => {
    set((state) => ({ interactionLogs: [...state.interactionLogs, `[${new Date().toLocaleTimeString()}] ${msg}`] }));
  },

  updateSimulatorElementVal: (id, val) => {
    set((state) => ({
      simulatorElements: state.simulatorElements.map(e => {
        if (e.id === id) {
          return { ...e, ...val };
        }
        return e;
      })
    }));
  },

  updateMockDatabase: (key, val) => {
    set((state) => ({
      mockDatabase: { ...state.mockDatabase, [key]: val }
    }));
  },

  // Undo / Redo History
  pushStateToUndo: () => {
    const projId = get().currentProjectId;
    if (!projId) return;
    const proj = get().projects.find(p => p.id === projId)!;
    const snapshot = {
      name: proj.name,
      screens: JSON.parse(JSON.stringify(proj.screens)),
      assets: JSON.parse(JSON.stringify(proj.assets)),
      code: proj.code,
      blocklyXml: proj.blocklyXml,
      isFavorite: proj.isFavorite,
      isArchived: proj.isArchived
    };
    set((state) => ({
      undoStack: [...state.undoStack, snapshot].slice(-25), // Cap history at 25 states
      redoStack: []
    }));
  },

  undo: () => {
    const undoStack = [...get().undoStack];
    const prevSnapshot = undoStack.pop();
    if (!prevSnapshot) return;

    const projId = get().currentProjectId;
    if (!projId) return;

    const proj = get().projects.find(p => p.id === projId)!;
    const currentSnapshot = {
      name: proj.name,
      screens: JSON.parse(JSON.stringify(proj.screens)),
      assets: JSON.parse(JSON.stringify(proj.assets)),
      code: proj.code,
      blocklyXml: proj.blocklyXml,
      isFavorite: proj.isFavorite,
      isArchived: proj.isArchived
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          ...prevSnapshot,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      undoStack,
      redoStack: [...get().redoStack, currentSnapshot],
      selectedComponentId: null
    });
  },

  redo: () => {
    const redoStack = [...get().redoStack];
    const nextSnapshot = redoStack.pop();
    if (!nextSnapshot) return;

    const projId = get().currentProjectId;
    if (!projId) return;

    const proj = get().projects.find(p => p.id === projId)!;
    const currentSnapshot = {
      name: proj.name,
      screens: JSON.parse(JSON.stringify(proj.screens)),
      assets: JSON.parse(JSON.stringify(proj.assets)),
      code: proj.code,
      blocklyXml: proj.blocklyXml,
      isFavorite: proj.isFavorite,
      isArchived: proj.isArchived
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          ...nextSnapshot,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      undoStack: [...get().undoStack, currentSnapshot],
      redoStack,
      selectedComponentId: null
    });
  },

  // Assets
  addAsset: (name, type, url) => {
    const projId = get().currentProjectId;
    if (!projId) return;
    
    get().pushStateToUndo();

    const newAsset: ProjectAsset = {
      id: `asset-${Date.now()}`,
      name,
      type,
      url
    };

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          assets: [...p.assets, newAsset],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  deleteAsset: (assetId) => {
    const projId = get().currentProjectId;
    if (!projId) return;

    get().pushStateToUndo();

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          assets: p.assets.filter(a => a.id !== assetId),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({ projects: updated });
  },

  // Templates loader
  loadTemplate: (templateName) => {
    const projId = get().currentProjectId;
    if (!projId) return;

    get().pushStateToUndo();

    const quizTemplateScreens: AppScreen[] = [
      {
        id: 'quizWelcome',
        name: 'Welcome Screen',
        backgroundColor: '#4f46e5',
        elements: [
          {
            id: 'welcomeTitle',
            type: 'label',
            name: 'Welcome Title',
            visible: true,
            enabled: true,
            text: 'Trivia Quest 🏆',
            style: { x: 30, y: 80, width: 260, height: 60, borderRadius: 0, opacity: 1, rotation: 0, backgroundColor: 'transparent', color: '#ffffff', fontFamily: 'system-ui', fontSize: 28, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'welcomeDesc',
            type: 'label',
            name: 'Welcome Desc',
            visible: true,
            enabled: true,
            text: 'Test your knowledge on coding and space! Read carefully and get a perfect score.',
            style: { x: 40, y: 160, width: 240, height: 80, borderRadius: 0, opacity: 0.9, rotation: 0, backgroundColor: 'transparent', color: '#e0e7ff', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'normal', textAlign: 'center', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnStartQuiz',
            type: 'button',
            name: 'Start Button',
            visible: true,
            enabled: true,
            text: 'START GAME',
            style: { x: 60, y: 320, width: 200, height: 55, borderRadius: 28, opacity: 1, rotation: 0, backgroundColor: '#fbbf24', color: '#1e293b', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 3 }
          }
        ]
      },
      {
        id: 'quizQuestion',
        name: 'Question Screen',
        backgroundColor: '#f8fafc',
        elements: [
          {
            id: 'qNumLabel',
            type: 'label',
            name: 'Question Number Label',
            visible: true,
            enabled: true,
            text: 'Question 1 of 3',
            style: { x: 30, y: 30, width: 260, height: 30, borderRadius: 0, opacity: 1, rotation: 0, backgroundColor: 'transparent', color: '#4f46e5', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'qTextLabel',
            type: 'label',
            name: 'Question Text Label',
            visible: true,
            enabled: true,
            text: 'Which programming language is mainly used for building Android Apps?',
            style: { x: 30, y: 70, width: 260, height: 90, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnOpt1',
            type: 'button',
            name: 'Option 1 Button',
            visible: true,
            enabled: true,
            text: 'A. Python',
            style: { x: 30, y: 190, width: 260, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 15, fontWeight: 'bold', textAlign: 'left', position: 'absolute', zIndex: 3 }
          },
          {
            id: 'btnOpt2',
            type: 'button',
            name: 'Option 2 Button',
            visible: true,
            enabled: true,
            text: 'B. Kotlin',
            style: { x: 30, y: 250, width: 260, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 15, fontWeight: 'bold', textAlign: 'left', position: 'absolute', zIndex: 4 }
          },
          {
            id: 'btnOpt3',
            type: 'button',
            name: 'Option 3 Button',
            visible: true,
            enabled: true,
            text: 'C. HTML',
            style: { x: 30, y: 310, width: 260, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 15, fontWeight: 'bold', textAlign: 'left', position: 'absolute', zIndex: 5 }
          },
          {
            id: 'btnOpt4',
            type: 'button',
            name: 'Option 4 Button',
            visible: true,
            enabled: true,
            text: 'D. Swift',
            style: { x: 30, y: 370, width: 260, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 15, fontWeight: 'bold', textAlign: 'left', position: 'absolute', zIndex: 6 }
          }
        ]
      },
      {
        id: 'quizResult',
        name: 'Result Screen',
        backgroundColor: '#10b981',
        elements: [
          {
            id: 'resTitle',
            type: 'label',
            name: 'Result Title',
            visible: true,
            enabled: true,
            text: 'Game Completed! 🎉',
            style: { x: 30, y: 80, width: 260, height: 40, borderRadius: 0, opacity: 1, rotation: 0, backgroundColor: 'transparent', color: '#ffffff', fontFamily: 'system-ui', fontSize: 24, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'scoreLabel',
            type: 'label',
            name: 'Score Display Label',
            visible: true,
            enabled: true,
            text: 'Your Score: 0/3',
            style: { x: 50, y: 150, width: 220, height: 70, borderRadius: 16, opacity: 1, rotation: 0, backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontFamily: 'system-ui', fontSize: 22, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnRestart',
            type: 'button',
            name: 'Restart Button',
            visible: true,
            enabled: true,
            text: 'PLAY AGAIN',
            style: { x: 60, y: 300, width: 200, height: 50, borderRadius: 25, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#10b981', fontFamily: 'system-ui', fontSize: 16, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 3 }
          }
        ]
      }
    ];

    const quizTemplateCode = `let currentQuestion = 0;
let score = 0;

const questions = [
  {
    text: "Which programming language is mainly used for building Android Apps?",
    options: ["A. Python", "B. Kotlin", "C. HTML", "D. Swift"],
    correct: 1
  },
  {
    text: "What does HTML stand for?",
    options: ["A. Hypertext Markup Language", "B. Hightech Multi Language", "C. Hyperlink Text Maker", "D. Home Text Markup"],
    correct: 0
  },
  {
    text: "Which symbol is used for comments in JavaScript?",
    options: ["A. #", "B. <!-- -->", "C. //", "D. **"],
    correct: 2
  }
];

onEvent("btnStartQuiz", "click", () => {
  currentQuestion = 0;
  score = 0;
  loadQuestion();
  navigateTo("quizQuestion");
});

function loadQuestion() {
  let q = questions[currentQuestion];
  setProperty("qNumLabel", "text", "Question " + (currentQuestion + 1) + " of " + questions.length);
  setProperty("qTextLabel", "text", q.text);
  setProperty("btnOpt1", "text", q.options[0]);
  setProperty("btnOpt2", "text", q.options[1]);
  setProperty("btnOpt3", "text", q.options[2]);
  setProperty("btnOpt4", "text", q.options[3]);
}

function handleAnswer(selectedOption) {
  let q = questions[currentQuestion];
  if (selectedOption === q.correct) {
    score = score + 1;
    showToast("Correct! 🎉");
  } else {
    showToast("Wrong answer! 😢");
  }
  
  currentQuestion = currentQuestion + 1;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    setProperty("scoreLabel", "text", "Score: " + score + " / " + questions.length);
    navigateTo("quizResult");
  }
}

onEvent("btnOpt1", "click", () => { handleAnswer(0); });
onEvent("btnOpt2", "click", () => { handleAnswer(1); });
onEvent("btnOpt3", "click", () => { handleAnswer(2); });
onEvent("btnOpt4", "click", () => { handleAnswer(3); });

onEvent("btnRestart", "click", () => {
  navigateTo("quizWelcome");
});`;

    const calculatorScreens: AppScreen[] = [
      {
        id: 'calcScreen',
        name: 'Calculator Screen',
        backgroundColor: '#1e293b',
        elements: [
          {
            id: 'display',
            type: 'label',
            name: 'Calc Display',
            visible: true,
            enabled: true,
            text: '0',
            style: { x: 20, y: 40, width: 280, height: 60, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#0f172a', color: '#10b981', fontFamily: 'monospace', fontSize: 32, fontWeight: 'bold', textAlign: 'right', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'btnC',
            type: 'button',
            name: 'Clear Button',
            visible: true,
            enabled: true,
            text: 'C',
            style: { x: 20, y: 120, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#ef4444', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnDiv',
            type: 'button',
            name: 'Divide Button',
            visible: true,
            enabled: true,
            text: '/',
            style: { x: 240, y: 120, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#f59e0b', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 3 }
          },
          {
            id: 'btn7',
            type: 'button',
            name: 'Btn 7',
            visible: true,
            enabled: true,
            text: '7',
            style: { x: 20, y: 185, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 4 }
          },
          {
            id: 'btn8',
            type: 'button',
            name: 'Btn 8',
            visible: true,
            enabled: true,
            text: '8',
            style: { x: 92, y: 185, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 5 }
          },
          {
            id: 'btn9',
            type: 'button',
            name: 'Btn 9',
            visible: true,
            enabled: true,
            text: '9',
            style: { x: 165, y: 185, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 6 }
          },
          {
            id: 'btnMul',
            type: 'button',
            name: 'Multiply Button',
            visible: true,
            enabled: true,
            text: '*',
            style: { x: 240, y: 185, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#f59e0b', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 7 }
          },
          {
            id: 'btn4',
            type: 'button',
            name: 'Btn 4',
            visible: true,
            enabled: true,
            text: '4',
            style: { x: 20, y: 250, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 8 }
          },
          {
            id: 'btn5',
            type: 'button',
            name: 'Btn 5',
            visible: true,
            enabled: true,
            text: '5',
            style: { x: 92, y: 250, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 9 }
          },
          {
            id: 'btn6',
            type: 'button',
            name: 'Btn 6',
            visible: true,
            enabled: true,
            text: '6',
            style: { x: 165, y: 250, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 10 }
          },
          {
            id: 'btnSub',
            type: 'button',
            name: 'Subtract Button',
            visible: true,
            enabled: true,
            text: '-',
            style: { x: 240, y: 250, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#f59e0b', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 11 }
          },
          {
            id: 'btn1',
            type: 'button',
            name: 'Btn 1',
            visible: true,
            enabled: true,
            text: '1',
            style: { x: 20, y: 315, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 12 }
          },
          {
            id: 'btn2',
            type: 'button',
            name: 'Btn 2',
            visible: true,
            enabled: true,
            text: '2',
            style: { x: 92, y: 315, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 13 }
          },
          {
            id: 'btn3',
            type: 'button',
            name: 'Btn 3',
            visible: true,
            enabled: true,
            text: '3',
            style: { x: 165, y: 315, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 14 }
          },
          {
            id: 'btnAdd',
            type: 'button',
            name: 'Add Button',
            visible: true,
            enabled: true,
            text: '+',
            style: { x: 240, y: 315, width: 60, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#f59e0b', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 15 }
          },
          {
            id: 'btn0',
            type: 'button',
            name: 'Btn 0',
            visible: true,
            enabled: true,
            text: '0',
            style: { x: 20, y: 380, width: 132, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#334155', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 16 }
          },
          {
            id: 'btnEq',
            type: 'button',
            name: 'Equals Button',
            visible: true,
            enabled: true,
            text: '=',
            style: { x: 165, y: 380, width: 135, height: 50, borderRadius: 12, opacity: 1, rotation: 0, backgroundColor: '#10b981', color: '#ffffff', fontFamily: 'system-ui', fontSize: 18, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 17 }
          }
        ]
      }
    ];

    const calculatorTemplateCode = `let currentInput = "";
let previousInput = "";
let operation = "";

function updateDisplay(val) {
  setProperty("display", "text", val === "" ? "0" : val);
}

function handleDigit(d) {
  currentInput = currentInput + d;
  updateDisplay(currentInput);
}

function handleOp(op) {
  if (currentInput === "") return;
  previousInput = currentInput;
  currentInput = "";
  operation = op;
  updateDisplay("0");
}

onEvent("btn0", "click", () => { handleDigit("0"); });
onEvent("btn1", "click", () => { handleDigit("1"); });
onEvent("btn2", "click", () => { handleDigit("2"); });
onEvent("btn3", "click", () => { handleDigit("3"); });
onEvent("btn4", "click", () => { handleDigit("4"); });
onEvent("btn5", "click", () => { handleDigit("5"); });
onEvent("btn6", "click", () => { handleDigit("6"); });
onEvent("btn7", "click", () => { handleDigit("7"); });
onEvent("btn8", "click", () => { handleDigit("8"); });
onEvent("btn9", "click", () => { handleDigit("9"); });

onEvent("btnAdd", "click", () => { handleOp("+"); });
onEvent("btnSub", "click", () => { handleOp("-"); });
onEvent("btnMul", "click", () => { handleOp("*"); });
onEvent("btnDiv", "click", () => { handleOp("/"); });

onEvent("btnC", "click", () => {
  currentInput = "";
  previousInput = "";
  operation = "";
  updateDisplay("0");
});

onEvent("btnEq", "click", () => {
  if (currentInput === "" || previousInput === "" || operation === "") return;
  let val1 = Number(previousInput);
  let val2 = Number(currentInput);
  let result = 0;
  
  if (operation === "+") result = val1 + val2;
  else if (operation === "-") result = val1 - val2;
  else if (operation === "*") result = val1 * val2;
  else if (operation === "/") result = val2 === 0 ? "Error" : val1 / val2;
  
  currentInput = String(result);
  previousInput = "";
  operation = "";
  updateDisplay(currentInput);
});`;

    const todoScreens: AppScreen[] = [
      {
        id: 'todoMain',
        name: 'Todo Screen',
        backgroundColor: '#f1f5f9',
        elements: [
          {
            id: 'todoHeader',
            type: 'label',
            name: 'Todo Header',
            visible: true,
            enabled: true,
            text: 'My Tasks List 📝',
            style: { x: 30, y: 30, width: 260, height: 40, borderRadius: 0, opacity: 1, rotation: 0, backgroundColor: 'transparent', color: '#1e293b', fontFamily: 'system-ui', fontSize: 22, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 1 }
          },
          {
            id: 'todoInput',
            type: 'input',
            name: 'Task Input',
            visible: true,
            enabled: true,
            text: '',
            hint: 'Write a new task...',
            style: { x: 30, y: 80, width: 180, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#ffffff', color: '#1e293b', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'normal', textAlign: 'left', position: 'absolute', zIndex: 2 }
          },
          {
            id: 'btnAddTodo',
            type: 'button',
            name: 'Add Button',
            visible: true,
            enabled: true,
            text: 'ADD',
            style: { x: 220, y: 80, width: 70, height: 45, borderRadius: 8, opacity: 1, rotation: 0, backgroundColor: '#4f46e5', color: '#ffffff', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'bold', textAlign: 'center', position: 'absolute', zIndex: 3 }
          },
          {
            id: 'taskTitle1',
            type: 'label',
            name: 'Task Title 1',
            visible: true,
            text: '1. Learn Blockly snap cards 🧱',
            style: { x: 30, y: 150, width: 260, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'semibold', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 4 }
          },
          {
            id: 'taskTitle2',
            type: 'label',
            name: 'Task Title 2',
            visible: true,
            text: '2. Program App Studio 📱',
            style: { x: 30, y: 200, width: 260, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'semibold', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 5 }
          },
          {
            id: 'taskTitle3',
            type: 'label',
            name: 'Task Title 3',
            visible: false,
            text: '',
            style: { x: 30, y: 250, width: 260, height: 40, borderRadius: 8, backgroundColor: '#ffffff', color: '#334155', fontFamily: 'system-ui', fontSize: 14, fontWeight: 'semibold', textAlign: 'left', opacity: 1, rotation: 0, position: 'absolute', zIndex: 6 }
          }
        ]
      }
    ];

    const todoTemplateCode = `let todoCount = 2;

onEvent("btnAddTodo", "click", () => {
  let task = getText("todoInput");
  if (task === "") {
    showAlert("Please write a task name!");
    return;
  }
  
  todoCount = todoCount + 1;
  log("Added task: " + task);
  
  if (todoCount === 3) {
    setProperty("taskTitle3", "text", "3. " + task);
    show("taskTitle3");
  } else {
    showToast("List is full (Max 3 for demo)!");
  }
  
  setText("todoInput", "");
});`;

    let finalScreens = DEFAULT_PROJECTS[0].screens;
    let finalCode = DEFAULT_PROJECTS[0].code;

    if (templateName === 'quiz') {
      finalScreens = quizTemplateScreens;
      finalCode = quizTemplateCode;
    } else if (templateName === 'calculator') {
      finalScreens = calculatorScreens;
      finalCode = calculatorTemplateCode;
    } else if (templateName === 'todo') {
      finalScreens = todoScreens;
      finalCode = todoTemplateCode;
    }

    const updated = get().projects.map(p => {
      if (p.id === projId) {
        return {
          ...p,
          screens: finalScreens,
          code: finalCode,
          blocklyXml: '',
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    localStorage.setItem('dola_appstudio_projects', JSON.stringify(updated));
    set({
      projects: updated,
      currentScreenId: finalScreens[0].id,
      selectedComponentId: null
    });
    
    get().addConsoleLog(`Loaded starter template: ${templateName}`);
  }
}));
