'use client';

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Trophy, 
  Globe, 
  Share2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SharePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  authorName?: string;
}

export default function SharePreviewModal({
  isOpen,
  onClose,
  title,
  htmlCode,
  cssCode,
  jsCode,
  authorName = 'Web Architect'
}: SharePreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const fullHtmlBundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Built with DolaCode Web Dev Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800;900&family=Nunito:wght@400;600;700;800&family=Orbitron:wght@500;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Poppins', system-ui, sans-serif;
      background-color: #0d1117;
      color: #f0f6fc;
      padding: 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-x: hidden;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 12px auto;
    }
    ${cssCode}
  </style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch (e) {
      console.log('Script execution note:', e);
    }
  </script>
</body>
</html>`;

  // Download standalone .html file
  const handleDownload = () => {
    try {
      const blob = new Blob([fullHtmlBundle], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'my-website'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {
      console.log('Download error:', e);
    }
  };

  // Copy shareable summary text
  const handleCopyShare = () => {
    const text = `🌟 Check out my website "${title}" built on DolaCode Web Dev Studio! Created with HTML, CSS & JavaScript! 🚀`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const getContainerClass = () => {
    switch (device) {
      case 'mobile':
        return 'w-[360px] h-[600px] rounded-3xl border-8 border-slate-700 shadow-2xl';
      case 'tablet':
        return 'w-[640px] h-[620px] rounded-2xl border-8 border-slate-700 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-[520px] rounded-2xl border border-slate-700 shadow-2xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
              <Globe size={22} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Published Preview
                </span>
                <span className="text-xs font-bold text-amber-200">
                  By {authorName}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate max-w-xs sm:max-w-md">
                {title || 'My Web Project'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download HTML Button */}
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0"
              title="Download website as single HTML file"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download .html</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-slate-950/30 hover:bg-slate-950/50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewport Toolbar */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                device === 'desktop' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={14} />
              <span className="hidden sm:inline">Desktop</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                device === 'tablet' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet size={14} />
              <span className="hidden sm:inline">Tablet</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                device === 'mobile' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Mobile (360px)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShare}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Live Preview Arena */}
        <div className="flex-1 bg-slate-950/60 p-4 flex items-center justify-center overflow-auto">
          <div className={`transition-all duration-300 ${getContainerClass()} overflow-hidden bg-slate-900`}>
            <iframe
              title="Shareable Responsive Preview"
              srcDoc={fullHtmlBundle}
              sandbox="allow-scripts"
              className="w-full h-full border-0 bg-[#0d1117]"
            />
          </div>
        </div>

        {/* Footer Badge Banner */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <span className="font-bold text-slate-300">Certified Web Creator Showcase</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
            <Sparkles size={13} />
            <span>Responsive HTML, CSS & JavaScript</span>
          </div>
        </div>

      </div>
    </div>
  );
}
