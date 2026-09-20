'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  X, 
  Code2, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Clock, 
  FileCode,
  Rocket,
  Play
} from 'lucide-react';

export interface SavedProjectItem {
  id?: number;
  slug: string;
  title: string;
  stage_order?: number;
  reward_xp?: number;
  saved_html: string;
  saved_css: string;
  is_completed?: boolean;
  completed_at?: string | null;
  has_draft?: boolean;
  updated_at?: string;
}

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (slug: string, html?: string, css?: string) => void;
  onNewProject: () => void;
}

export default function SavedProjectsModal({
  isOpen,
  onClose,
  onOpenProject,
  onNewProject
}: SavedProjectsModalProps) {
  const [projects, setProjects] = useState<SavedProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'drafts'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchSavedProjects();
    }
  }, [isOpen]);

  const fetchSavedProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/web-studio/projects/', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.projects) {
          setProjects(data.projects);
        }
      }
    } catch (e) {
      console.log('Error fetching saved projects:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === 'completed') return matchesSearch && p.is_completed;
    if (activeFilter === 'drafts') return matchesSearch && p.has_draft && !p.is_completed;
    return matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/40 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileCode size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent">
                My Saved Projects & Missions
              </h2>
              <p className="text-xs text-slate-400">Select any project to load and edit in Web Studio!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Project Quick Trigger */}
            <button
              onClick={() => {
                onNewProject();
                onClose();
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:from-amber-400 hover:to-yellow-300 transition-all active:scale-95"
            >
              <Plus size={15} />
              <span>New Project</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-3 sm:p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Projects ({projects.length})
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'completed'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Cleared ({projects.filter(p => p.is_completed).length})
            </button>

            <button
              onClick={() => setActiveFilter('drafts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === 'drafts'
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Drafts ({projects.filter(p => p.has_draft && !p.is_completed).length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
              <Sparkles size={24} className="animate-spin text-amber-400" />
              <span>Loading saved projects...</span>
            </div>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((proj) => (
              <div
                key={proj.slug}
                className="bg-slate-950/80 hover:bg-slate-800/80 border-2 border-slate-800 hover:border-amber-400/60 p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-200 shadow-lg group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-800 text-amber-400 px-2 py-0.5 rounded-md border border-slate-700">
                      Level {proj.stage_order || 1}
                    </span>
                    {proj.is_completed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        <CheckCircle2 size={12} />
                        Cleared (+{proj.reward_xp} XP)
                      </span>
                    ) : proj.has_draft ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md border border-sky-500/30">
                        <Edit3 size={12} />
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">
                        Not Started
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-amber-300 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>
                </div>

                {/* HTML/CSS Code Preview Thumbnail */}
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold truncate">
                    <Code2 size={12} />
                    <span>{proj.saved_html ? proj.saved_html.substring(0, 45) + '...' : 'Starter HTML code'}</span>
                  </div>
                </div>

                {/* Open & Edit Action */}
                <button
                  onClick={() => {
                    onOpenProject(proj.slug, proj.saved_html, proj.saved_css);
                    onClose();
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Play size={13} className="fill-current" />
                  <span>Open & Edit Project</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 text-center">
              <Rocket size={32} className="text-slate-600" />
              <p className="text-sm font-bold text-slate-400">No projects found</p>
              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="mt-2 px-4 py-2 bg-amber-500 text-slate-950 font-black rounded-xl text-xs"
              >
                ➕ Start a New Project Now
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Total Projects: {projects.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
