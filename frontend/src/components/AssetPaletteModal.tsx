'use client';

import React, { useState } from 'react';
import { Sparkles, X, Image as ImageIcon, Search, Check, Zap } from 'lucide-react';

export interface StickerAsset {
  id: string;
  title: string;
  category: 'Heroes & Avatars' | 'Monsters & Pets' | 'Space & Sci-Fi' | 'Badges & Stars';
  src: string;
  width: number;
  snippet: string;
}

const STICKER_ASSETS: StickerAsset[] = [
  {
    id: 'leo-explorer',
    title: 'Leo the Explorer',
    category: 'Heroes & Avatars',
    src: '/assets/stickers/leo-explorer.svg',
    width: 100,
    snippet: '<img src="/assets/stickers/leo-explorer.svg" width="100" alt="Leo Explorer">'
  },
  {
    id: 'hero-leo-3d',
    title: 'Space Leo 3D',
    category: 'Heroes & Avatars',
    src: '/assets/hero.png',
    width: 120,
    snippet: '<img src="/assets/hero.png" width="120" alt="Space Leo">'
  },
  {
    id: 'happy-robot',
    title: 'Beep-Boop Robot',
    category: 'Heroes & Avatars',
    src: '/assets/stickers/happy-robot.svg',
    width: 100,
    snippet: '<img src="/assets/stickers/happy-robot.svg" width="100" alt="Robot">'
  },
  {
    id: 'green-dino',
    title: 'Little Dino',
    category: 'Monsters & Pets',
    src: '/assets/stickers/dino.svg',
    width: 100,
    snippet: '<img src="/assets/stickers/dino.svg" width="100" alt="Little Dino">'
  },
  {
    id: 'turbo-rocket',
    title: 'Turbo Space Rocket',
    category: 'Space & Sci-Fi',
    src: '/assets/stickers/rocket.svg',
    width: 100,
    snippet: '<img src="/assets/stickers/rocket.svg" width="100" alt="Turbo Rocket">'
  },
  {
    id: 'gold-star',
    title: 'Shiny Gold Star',
    category: 'Badges & Stars',
    src: '/assets/stickers/gold-star.svg',
    width: 80,
    snippet: '<img src="/assets/stickers/gold-star.svg" width="80" alt="Gold Star">'
  }
];

interface AssetPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (snippet: string, title: string) => void;
}

export default function AssetPaletteModal({ isOpen, onClose, onSelectAsset }: AssetPaletteModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [insertedId, setInsertedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Heroes & Avatars', 'Monsters & Pets', 'Space & Sci-Fi', 'Badges & Stars'];

  const filteredAssets = STICKER_ASSETS.filter(asset => {
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInsert = (asset: StickerAsset) => {
    onSelectAsset(asset.snippet, asset.title);
    setInsertedId(asset.id);
    setTimeout(() => setInsertedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ImageIcon size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Sticker & Asset Palette
              </h2>
              <p className="text-xs text-slate-400">Click any sticker to insert it into your HTML Studio! 🎨</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-48 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search stickers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        </div>

        {/* Sticker Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredAssets.length > 0 ? (
            filteredAssets.map(asset => (
              <div
                key={asset.id}
                onClick={() => handleInsert(asset)}
                className="group relative bg-slate-950/80 hover:bg-slate-800/90 border-2 border-slate-800 hover:border-amber-400/70 p-4 rounded-2xl flex flex-col items-center justify-between gap-3 cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl shadow-slate-950"
              >
                <div className="w-24 h-24 flex items-center justify-center p-2 rounded-xl bg-slate-900 group-hover:scale-105 transition-transform">
                  <img src={asset.src} alt={asset.title} className="max-w-full max-h-full object-contain drop-shadow-md" />
                </div>
                <div className="text-center w-full">
                  <span className="font-extrabold text-xs text-slate-200 group-hover:text-amber-300 block truncate">
                    {asset.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    &lt;img width="{asset.width}"&gt;
                  </span>
                </div>

                {/* Insert Button */}
                <div className="w-full py-1.5 bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 font-black text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all">
                  {insertedId === asset.id ? (
                    <>
                      <Check size={14} className="text-emerald-400 group-hover:text-slate-950" />
                      <span>Inserted!</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Insert Tag</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 font-medium text-sm">
              No stickers found for &quot;{searchQuery}&quot; 🔍
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span>Clicking any sticker inserts clean HTML code directly into your editor!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
