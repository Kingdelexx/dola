'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  X, 
  CheckCircle2, 
  Play, 
  Smartphone, 
  Sparkles,
  Rocket
} from 'lucide-react';
import { playAppSound } from './audioSynth';

export interface SavedAppProjectItem {
  id?: number;
  slug: string;
  title: string;
  class_number?: number;
  stage_order?: number;
  reward_xp?: number;
  saved_screens: any[];
  saved_code: string;
  is_completed?: boolean;
  completed_at?: string | null;
  has_draft?: boolean;
}

interface AppSavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (slug: string, screens?: any[], code?: string) => void;
  onNewProject: () => void;
}

export default function AppSavedProjectsModal({
  isOpen,
  onClose,
  onOpenProject,
  onNewProject
}: AppSavedProjectsModalProps) {
  const [projects, setProjects] = useState<SavedAppProjectItem[]>([]);
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

      const res = await fetch('/api/app-studio/projects-list/', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.projects) {
          setProjects(data.projects);
        }
      }
    } catch (e) {
      // Suppress
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-emerald-400/50 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <FolderOpen size={22} className="text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                App Projects Drawer
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                My App Dev Studio Projects
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Plus size={14} />
              <span>New App</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Sparkles className="animate-spin text-emerald-400" size={28} />
              <p className="text-xs font-bold">Loading your saved apps...</p>
            </div>
          ) : projects.length > 0 ? (
            projects.map((proj) => (
              <div
                key={proj.slug}
                className="bg-slate-950/80 hover:bg-slate-800/80 border-2 border-slate-800 hover:border-emerald-400/60 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all duration-200 shadow-md group"
              >
                <div className="truncate">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md border border-slate-700">
                      Class {proj.class_number || 1}
                    </span>
                    {proj.is_completed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        Cleared (+{proj.reward_xp || 50} XP)
                      </span>
                    ) : proj.has_draft ? (
                      <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-md border border-cyan-500/30">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">
                        Not Started
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-emerald-300 transition-colors truncate">
                    {proj.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    playAppSound('click');
                    onOpenProject(proj.slug, proj.saved_screens, proj.saved_code);
                    onClose();
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <Play size={13} className="fill-current" />
                  <span>Open App</span>
                </button>
              </div>
            ))
          ) : (
            <div className="py-14 flex flex-col items-center justify-center gap-3 text-center">
              <Rocket size={32} className="text-slate-600" />
              <p className="text-sm font-bold text-slate-400">No projects yet!</p>
              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="mt-1 px-4 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs"
              >
                Create First App 🚀
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
