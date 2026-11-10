'use client';

import React, { useState } from 'react';
import { 
  Heading, 
  Type, 
  Image as ImageIcon, 
  MousePointerClick, 
  List, 
  Sparkles, 
  Paintbrush, 
  Zap, 
  ShoppingCart, 
  Share2, 
  Sliders, 
  Palette, 
  Gift, 
  Key, 
  Plus, 
  RotateCcw,
  Store,
  Layers,
  Check
} from 'lucide-react';

interface ClassWorkspaceToolbarProps {
  classNum: number;
  currentSlug: string;
  onInsertHtml: (code: string, revealedTag: string, explanation: string) => void;
  onApplyCssRule: (property: string, value: string, explanation: string) => void;
  onInsertJsAction: (htmlSnippet: string, jsSnippet: string, explanation: string) => void;
  onLoadStoreTemplate: (theme: 'books' | 'snacks' | 'toys') => void;
  onLoadCreatorTheme: (theme: 'school' | 'portfolio' | 'animal' | 'story' | 'business') => void;
  onOpenShareModal: () => void;
}

export default function ClassWorkspaceToolbar({
  classNum,
  currentSlug,
  onInsertHtml,
  onApplyCssRule,
  onInsertJsAction,
  onLoadStoreTemplate,
  onLoadCreatorTheme,
  onOpenShareModal,
}: ClassWorkspaceToolbarProps) {

  // ==========================================
  // CLASS 1: WEBSITE BUILDER ISLAND (HTML)
  // ==========================================
  if (classNum === 1) {
    return (
      <div className="bg-slate-900/95 border-b border-amber-500/30 px-3 py-2 flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1 mr-1">
          <Sparkles size={13} className="text-amber-400" />
          <span>Drag / Tap Elements:</span>
        </span>

        {/* Heading 1 Button */}
        <button
          onClick={() => onInsertHtml(
            '<h1>Hello Treasure Island! 🏝️</h1>',
            '<h1>Hello!</h1>',
            '<h1> is Heading 1. Browsers make it the biggest, boldest title on the web!'
          )}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Add a Big Heading (h1)"
        >
          <Heading size={13} />
          <span>+ Heading (&lt;h1&gt;)</span>
        </button>

        {/* Paragraph Button */}
        <button
          onClick={() => onInsertHtml(
            '<p>Hidden deep in the turquoise waves lies an island of mystery, coconut trees, and pirate treasure!</p>',
            '<p>Story Text</p>',
            '<p> stands for Paragraph. Use it whenever you have sentences, descriptions, or stories!'
          )}
          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Add a Story Paragraph (p)"
        >
          <Type size={13} />
          <span>+ Paragraph (&lt;p&gt;)</span>
        </button>

        {/* Picture Sticker Button */}
        <button
          onClick={() => onInsertHtml(
            '<img src="/assets/stickers/leo-explorer.svg" width="120" alt="Island Mascot">',
            '<img src="...">',
            '<img> places a picture or sticker on your website! Notice the src="..." URL inside.'
          )}
          className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Add a Mascot Picture (img)"
        >
          <ImageIcon size={13} />
          <span>+ Picture (&lt;img&gt;)</span>
        </button>

        {/* Action Button */}
        <button
          onClick={() => onInsertHtml(
            '<button class="action-btn">Explore Secret Cave 🗝️</button>',
            '<button>Click Me</button>',
            '<button> creates a clickable button for your visitors to tap!'
          )}
          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Add an Action Button (button)"
        >
          <MousePointerClick size={13} />
          <span>+ Button (&lt;button&gt;)</span>
        </button>

        {/* List Checklist */}
        <button
          onClick={() => onInsertHtml(
            '<ul>\n  <li>Compass & Map 🧭</li>\n  <li>Fresh Coconut 🥥</li>\n  <li>Treasure Key 🔑</li>\n</ul>',
            '<ul><li>...</li></ul>',
            '<ul> and <li> create bulleted lists — great for checklists, menus, and top-ten lists!'
          )}
          className="px-2.5 py-1 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-slate-950 border border-yellow-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
          title="Add a Bulleted List (ul/li)"
        >
          <List size={13} />
          <span>+ List (&lt;ul&gt;)</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 2: COLOUR MAGIC KINGDOM (CSS)
  // ==========================================
  if (classNum === 2) {
    return (
      <div className="bg-slate-900/95 border-b border-pink-500/30 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1 mr-1">
          <Palette size={13} />
          <span>CSS Magic Wand:</span>
        </span>

        {/* Sunset Gradient */}
        <button
          onClick={() => onApplyCssRule(
            'background',
            'linear-gradient(135deg, #ff4757, #ff9f43)',
            'linear-gradient blends sunset colors smoothly across your card!'
          )}
          className="px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-red-500 to-orange-400 hover:opacity-90 active:scale-95 shadow-sm"
        >
          🌅 Sunset
        </button>

        {/* Cosmic Nebula Gradient */}
        <button
          onClick={() => onApplyCssRule(
            'background',
            'linear-gradient(135deg, #8b5cf6, #ec4899)',
            'linear-gradient creates cosmic purple & pink magic!'
          )}
          className="px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 active:scale-95 shadow-sm"
        >
          🌌 Cosmic
        </button>

        {/* Cyber Neon Gradient */}
        <button
          onClick={() => onApplyCssRule(
            'background',
            'linear-gradient(135deg, #0f172a, #0284c7)',
            'Deep navy and electric blue gives a sleek cyber feeling!'
          )}
          className="px-2.5 py-1 rounded-xl text-xs font-black text-white bg-gradient-to-r from-slate-900 to-sky-600 hover:opacity-90 active:scale-95 shadow-sm"
        >
          ⚡ Cyber
        </button>

        {/* Rounded Corners (border-radius) */}
        <button
          onClick={() => onApplyCssRule(
            'border-radius',
            '28px',
            'border-radius: 28px softens harsh corners into friendly curves!'
          )}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded-xl text-xs font-black transition-all active:scale-95"
        >
          🔲 Round Corners (28px)
        </button>

        {/* Glowing Neon Box Shadow */}
        <button
          onClick={() => onApplyCssRule(
            'box-shadow',
            '0 0 30px rgba(0, 242, 254, 0.5)',
            'box-shadow adds an atmospheric neon halo around your cards!'
          )}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-black transition-all active:scale-95"
        >
          ✨ Neon Glow
        </button>

        {/* Gold Border */}
        <button
          onClick={() => onApplyCssRule(
            'border',
            '4px solid #ffd32a',
            'border creates a bold, shiny royal golden frame!'
          )}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-black transition-all active:scale-95"
        >
          👑 Gold Frame
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 3: BUTTON POWER CITY (JAVASCRIPT)
  // ==========================================
  if (classNum === 3) {
    return (
      <div className="bg-slate-900/95 border-b border-cyan-500/30 px-3 py-2 flex flex-wrap items-center gap-1.5 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1 mr-1">
          <Zap size={13} />
          <span>Button Superpowers:</span>
        </span>

        {/* Color Shifter Button */}
        <button
          onClick={() => onInsertJsAction(
            '<button class="action-btn" onclick="cycleDiscoSky()">Toggle Disco Sky 🌈</button>',
            `let skyColors = ['#090d16', '#4c1d95', '#064e3b', '#831843', '#0369a1'];\nlet skyIdx = 0;\nfunction cycleDiscoSky() {\n  skyIdx = (skyIdx + 1) % skyColors.length;\n  document.body.style.backgroundColor = skyColors[skyIdx];\n}`,
            'JavaScript onclick changes document.body.style.backgroundColor whenever tapped!'
          )}
          className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          🎨 Color Shifter Action
        </button>

        {/* Reveal Secret Message */}
        <button
          onClick={() => onInsertJsAction(
            '<button class="action-btn" onclick="openSecretVault()">Open Secret Vault 🔑</button>\n<div id="vault-msg" style="display: none; margin-top: 12px; font-weight: bold; color: #fbbf24;">🎉 You discovered the secret code: DOLA-MASTER-2026!</div>',
            `function openSecretVault() {\n  document.getElementById('vault-msg').style.display = 'block';\n}`,
            'JavaScript changes element.style.display from "none" to "block" to reveal hidden gold!'
          )}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          🔑 Secret Revealer
        </button>

        {/* Tap Counter */}
        <button
          onClick={() => onInsertJsAction(
            '<button class="action-btn" onclick="countPoints()">Tap for Points ⚡ (<span id="score">0</span>)</button>',
            `let points = 0;\nfunction countPoints() {\n  points = points + 1;\n  document.getElementById('score').innerText = points;\n}`,
            'JavaScript variables (points = points + 1) track scores and update text live!'
          )}
          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          🔢 Tap Counter
        </button>

        {/* Confetti & Wish Action */}
        <button
          onClick={() => onInsertJsAction(
            '<button class="action-btn" onclick="partyPopper()">Pop Birthday Confetti 🎊</button>',
            `function partyPopper() {\n  alert("🎉 Happy Birthday Explorer! May your year be filled with wonder & high scores!");\n}`,
            'JavaScript functions can trigger celebrations, alerts, and sound effects!'
          )}
          className="px-2.5 py-1 bg-pink-500/20 hover:bg-pink-500 text-pink-300 hover:text-slate-950 border border-pink-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          🎂 Party Popper
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 4: MY ONLINE SHOP (HTML+CSS+JS NAIRA ₦)
  // ==========================================
  if (classNum === 4) {
    return (
      <div className="bg-slate-900/95 border-b border-emerald-500/30 px-3 py-2 flex flex-wrap items-center gap-2 shrink-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 mr-1">
          <Store size={13} />
          <span>Store Catalogs (₦):</span>
        </span>

        {/* Bookstore */}
        <button
          onClick={() => onLoadStoreTemplate('books')}
          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95"
        >
          📚 Kids Bookstore
        </button>

        {/* Snack Bar */}
        <button
          onClick={() => onLoadStoreTemplate('snacks')}
          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95"
        >
          🍿 Snack Bar (Jollof & Pastries)
        </button>

        {/* Toy Store */}
        <button
          onClick={() => onLoadStoreTemplate('toys')}
          className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-slate-950 border border-purple-500/40 rounded-xl text-xs font-black transition-all flex items-center gap-1 active:scale-95"
        >
          🧸 Toy & Robot Emporium
        </button>
      </div>
    );
  }

  // ==========================================
  // CLASS 5: WEB CREATOR CHALLENGE (ORIGINAL SITES)
  // ==========================================
  if (classNum === 5) {
    return (
      <div className="bg-slate-900/95 border-b border-purple-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1 mr-1">
            <Layers size={13} />
            <span>Choose Your Theme:</span>
          </span>

          <button
            onClick={() => onLoadCreatorTheme('school')}
            className="px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            🏫 School Club
          </button>

          <button
            onClick={() => onLoadCreatorTheme('portfolio')}
            className="px-2 py-1 bg-slate-800 hover:bg-pink-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            🎨 Art Portfolio
          </button>

          <button
            onClick={() => onLoadCreatorTheme('animal')}
            className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            🐾 Animal Rescue
          </button>

          <button
            onClick={() => onLoadCreatorTheme('story')}
            className="px-2 py-1 bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            📖 Adventure Story
          </button>

          <button
            onClick={() => onLoadCreatorTheme('business')}
            className="px-2 py-1 bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            🍕 Bakery / Juice Bar
          </button>
        </div>

        {/* Shareable Preview Button */}
        <button
          onClick={onOpenShareModal}
          className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md hover:from-amber-300 hover:to-yellow-200 active:scale-95"
        >
          <Share2 size={13} />
          <span>Share &amp; Export Site 🌐</span>
        </button>
      </div>
    );
  }

  return null;
}
