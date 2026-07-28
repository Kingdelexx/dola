import { create } from 'zustand';
import { pythonLevels, PythonLevel, getLevelById } from '../data/pythonLevels';

interface PythonStageState {
  currentChapterId: number;
  currentLevelId: string;
  xp: number;
  hintTokens: number;
  unlockedHints: Record<string, number>; // maps levelId -> count of hints unlocked (0 to 3)
  codeState: Record<string, string>; // maps levelId -> code text
  completedLevels: string[]; // list of completed levelIds
  isCompleted: boolean;
  
  // Actions
  initStore: () => void;
  selectLevel: (levelId: string) => void;
  selectChapter: (chapter: number) => void;
  updateCode: (levelId: string, code: string) => void;
  unlockHint: (levelId: string) => boolean;
  addXP: (amount: number) => void;
  completeLevel: (levelId: string) => Promise<void>;
  resetProgress: () => void;
}

export const usePythonStageStore = create<PythonStageState>((set, get) => ({
  currentChapterId: 0,
  currentLevelId: 'ch0_l1',
  xp: 0,
  hintTokens: 3, // Start with 3 hint keys
  unlockedHints: {},
  codeState: {},
  completedLevels: [],
  isCompleted: false,

  initStore: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedXp = localStorage.getItem('dola_python_xp');
      const savedCompleted = localStorage.getItem('dola_python_completed');
      const savedCode = localStorage.getItem('dola_python_code');
      const savedHints = localStorage.getItem('dola_python_hints');
      const savedTokens = localStorage.getItem('dola_python_tokens');
      const savedCurrentLevel = localStorage.getItem('dola_python_current_level');

      const completed = savedCompleted ? JSON.parse(savedCompleted) : [];
      const code = savedCode ? JSON.parse(savedCode) : {};
      const hints = savedHints ? JSON.parse(savedHints) : {};
      const currentLevelId = savedCurrentLevel || 'ch0_l1';
      const activeLevel = getLevelById(currentLevelId) || pythonLevels[0];

      set({
        xp: savedXp ? parseInt(savedXp, 10) : 0,
        completedLevels: completed,
        codeState: code,
        unlockedHints: hints,
        hintTokens: savedTokens ? parseInt(savedTokens, 10) : 3,
        currentLevelId: activeLevel.id,
        currentChapterId: activeLevel.chapter
      });
    } catch (e) {
      console.error('Failed to load python stage progress:', e);
    }
  },

  selectLevel: (levelId) => {
    const level = getLevelById(levelId);
    if (level) {
      set({
        currentLevelId: levelId,
        currentChapterId: level.chapter
      });
      localStorage.setItem('dola_python_current_level', levelId);
    }
  },

  selectChapter: (chapter) => {
    const chapterLevels = pythonLevels.filter(l => l.chapter === chapter);
    if (chapterLevels.length > 0) {
      const levelId = chapterLevels[0].id;
      set({
        currentLevelId: levelId,
        currentChapterId: chapter
      });
      localStorage.setItem('dola_python_current_level', levelId);
    }
  },

  updateCode: (levelId, code) => {
    set(state => {
      const nextCode = { ...state.codeState, [levelId]: code };
      localStorage.setItem('dola_python_code', JSON.stringify(nextCode));
      return { codeState: nextCode };
    });
  },

  unlockHint: (levelId) => {
    const state = get();
    const currentUnlockedCount = state.unlockedHints[levelId] || 0;
    const level = getLevelById(levelId);
    
    if (!level || currentUnlockedCount >= level.hints.length || state.hintTokens <= 0) {
      return false;
    }

    set(prev => {
      const nextUnlocked = { ...prev.unlockedHints, [levelId]: currentUnlockedCount + 1 };
      const nextTokens = prev.hintTokens - 1;
      
      localStorage.setItem('dola_python_hints', JSON.stringify(nextUnlocked));
      localStorage.setItem('dola_python_tokens', String(nextTokens));
      
      return {
        unlockedHints: nextUnlocked,
        hintTokens: nextTokens
      };
    });
    return true;
  },

  addXP: (amount) => {
    set(prev => {
      const nextXp = prev.xp + amount;
      localStorage.setItem('dola_python_xp', String(nextXp));
      return { xp: nextXp };
    });
  },

  completeLevel: async (levelId) => {
    const state = get();
    if (state.completedLevels.includes(levelId)) return;

    const level = getLevelById(levelId);
    if (!level) return;

    const nextCompleted = [...state.completedLevels, levelId];
    // Completing challenges earns hint tokens! Give 1 hint token per level solved.
    const nextTokens = state.hintTokens + 1;
    const nextXp = state.xp + level.xpReward;

    set({
      completedLevels: nextCompleted,
      hintTokens: nextTokens,
      xp: nextXp
    });

    localStorage.setItem('dola_python_completed', JSON.stringify(nextCompleted));
    localStorage.setItem('dola_python_tokens', String(nextTokens));
    localStorage.setItem('dola_python_xp', String(nextXp));

    // Persist stage completion to the database backend if the user completes the final chapter/boss level
    if (level.isBoss || levelId === 'ch10_l1') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
              stage: 4,
              progress: 1
            })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              set({ isCompleted: true });
            }
          }
        } catch (err) {
          console.error('Error posting stage 4 completion to backend:', err);
        }
      }
    }
  },

  resetProgress: () => {
    set({
      currentChapterId: 0,
      currentLevelId: 'ch0_l1',
      xp: 0,
      hintTokens: 3,
      unlockedHints: {},
      codeState: {},
      completedLevels: [],
      isCompleted: false
    });
    localStorage.removeItem('dola_python_xp');
    localStorage.removeItem('dola_python_completed');
    localStorage.removeItem('dola_python_code');
    localStorage.removeItem('dola_python_hints');
    localStorage.removeItem('dola_python_tokens');
    localStorage.removeItem('dola_python_current_level');
  }
}));
