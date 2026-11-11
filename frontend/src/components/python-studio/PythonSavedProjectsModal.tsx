'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  X, 
  CheckCircle2, 
  Play, 
  Terminal, 
  Sparkles,
  Rocket
} from 'lucide-react';
import { playAppSound } from '../app-studio/audioSynth';

export interface SavedPythonProjectItem {
  id?: number;
  slug: string;
  title: string;
  class_number?: number;
  stage_order?: number;
  reward_xp?: number;
  what_to_achieve?: string;
  saved_code: string;
  is_completed?: boolean;
  completed_at?: string | null;
  has_draft?: boolean;
}

interface PythonSavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (slug: string, code?: string) => void;
  onNewProject: () => void;
}

export default function PythonSavedProjectsModal({
  isOpen,
  onClose,
  onOpenProject,
  onNewProject
}: PythonSavedProjectsModalProps) {
  const [projects, setProjects] = useState<SavedPythonProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/python-studio/projects-list/', { headers });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Failed to load python projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-purple-500/50 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <FolderOpen size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">My Python Projects</h3>
              <p className="text-xs text-purple-300">View progress across all 5 Python Pro classes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Project List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Sparkles className="animate-spin text-purple-400" size={32} />
              <p className="text-sm font-bold">Loading Python projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-10 text-center text-slate-400 space-y-3">
              <Terminal size={40} className="mx-auto text-purple-400 opacity-60" />
              <h4 className="text-sm font-black text-white">No Python projects yet!</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Pick any class from the toolbar to start writing Python and controlling animations!
              </p>
            </div>
          ) : (
            projects.map((proj) => (
              <div
                key={proj.slug}
                className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                    {proj.class_number === 1 ? '🤖' : proj.class_number === 2 ? '⚡' : proj.class_number === 3 ? '💰' : proj.class_number === 4 ? '🧠' : '🐉'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-400">
                        Class {proj.class_number}
                      </span>
                      {proj.is_completed && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Completed
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-white truncate">{proj.title}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{proj.what_to_achieve}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                    +{proj.reward_xp || 60} XP
                  </span>
                  <button
                    onClick={() => {
                      playAppSound('click');
                      onOpenProject(proj.slug, proj.saved_code);
                      onClose();
                    }}
                    className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Open</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              playAppSound('click');
              onNewProject();
              onClose();
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus size={14} />
            <span>Class 1: Robo Motion Island</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
