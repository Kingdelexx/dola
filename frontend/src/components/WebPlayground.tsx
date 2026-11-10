'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import AssetPaletteModal from './AssetPaletteModal';
import KidTutorialModal from './KidTutorialModal';
import SavedProjectsModal from './SavedProjectsModal';
import SharePreviewModal from './SharePreviewModal';
import DolaCodeRevealer from './DolaCodeRevealer';
import ClassWorkspaceToolbar from './ClassWorkspaceToolbar';
import MissionInstructionPanel, { MissionData, ALL_MISSIONS } from './MissionInstructionPanel';
import { 
  Code2, 
  Paintbrush, 
  Zap,
  Play, 
  RotateCcw, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Maximize2, 
  Minimize2, 
  Check, 
  Copy, 
  Info,
  ImageIcon,
  Palette,
  Save,
  HelpCircle,
  CloudCheck,
  Eye,
  Columns,
  Plus,
  FolderOpen,
  Share2
} from 'lucide-react';

// Dynamically import Monaco Editor to avoid SSR hydration issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-sm">
      <div className="flex items-center gap-3">
        <Sparkles className="animate-spin text-amber-400" size={20} />
        <span>Loading Editor Studio...</span>
      </div>
    </div>
  ),
});

const DEFAULT_STARTER_HTML = `<div class="island-card">
  <h1>Welcome to Treasure Island! 🏝️</h1>
</div>`;

const DEFAULT_STARTER_CSS = `.island-card {
  background: #0f172a;
  border: 4px solid #f59e0b;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: #ffffff;
}
h1 {
  color: #fbbf24;
  font-family: 'Poppins', sans-serif;
}`;

const DEFAULT_STARTER_JS = `// JavaScript gives your buttons superpowers!
console.log("Welcome to DolaCode Web Dev Studio! 🌐");`;

// Kid-Friendly Color Swatches
const QUICK_COLOR_SWATCHES = [
  { name: 'Electric Gold', hex: '#fbbf24' },
  { name: 'Neon Cyan', hex: '#00f2fe' },
  { name: 'Hot Pink', hex: '#ff007f' },
  { name: 'Emerald Slime', hex: '#10b981' },
  { name: 'Midnight Navy', hex: '#0f172a' },
  { name: 'Coral Red', hex: '#ff4757' },
  { name: 'Cosmic Purple', hex: '#8b5cf6' },
  { name: 'Pure White', hex: '#ffffff' },
];

export default function WebPlayground() {
  const [slug, setSlug] = useState('class-1-heading-island');
  const [challenge, setChallenge] = useState<MissionData | null>(null);

  const [htmlCode, setHtmlCode] = useState(DEFAULT_STARTER_HTML);
  const [cssCode, setCssCode] = useState(DEFAULT_STARTER_CSS);
  const [jsCode, setJsCode] = useState(DEFAULT_STARTER_JS);
  
  // Debounced code for preview rendering (350ms)
  const [debouncedHtml, setDebouncedHtml] = useState(DEFAULT_STARTER_HTML);
  const [debouncedCss, setDebouncedCss] = useState(DEFAULT_STARTER_CSS);
  const [debouncedJs, setDebouncedJs] = useState(DEFAULT_STARTER_JS);

  // UI States
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [mobileWorkspaceView, setMobileWorkspaceView] = useState<'editor' | 'preview' | 'split'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // DolaCode Revealer Banner State
  const [revealedSnippet, setRevealedSnippet] = useState<string | null>(null);
  const [revealedExplanation, setRevealedExplanation] = useState<string | null>(null);

  // Modal States
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isSaving, setIsSaving] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Validation States
  const [criteriaResults, setCriteriaResults] = useState<{ criterion: string; passed: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Monaco Editor References
  const htmlEditorRef = useRef<any>(null);
  const cssEditorRef = useRef<any>(null);
  const jsEditorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active class number (1 through 5)
  const activeMission = ALL_MISSIONS.find(m => m.slug === slug) || ALL_MISSIONS[0];
  const activeClassNum = activeMission.classNum || 1;

  // Web Audio API Retro Sound Effects
  const playRewardSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.08);
        osc.stop(audioCtx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {
      // Audio fallback
    }
  };

  const playClickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Audio fallback
    }
  };

  // Safely trigger editor layout on tab or view changes
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        if (activeTab === 'html' && htmlEditorRef.current) {
          htmlEditorRef.current.layout();
        } else if (activeTab === 'css' && cssEditorRef.current) {
          cssEditorRef.current.layout();
        } else if (activeTab === 'js' && jsEditorRef.current) {
          jsEditorRef.current.layout();
        }
      } catch (e) {
        // Suppress
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [activeTab, mobileWorkspaceView, isFullscreen]);

  // Fetch challenge details and saved draft when slug changes
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Token ${token}`;

        const res = await fetch(`/api/web-studio/challenges/${slug}/`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.challenge) {
            setChallenge(data.challenge);
            
            // Check student progress draft or load default starters
            if (data.student_progress && data.student_progress.saved_html) {
              setHtmlCode(data.student_progress.saved_html);
              setCssCode(data.student_progress.saved_css || data.challenge.starter_css);
              setJsCode(data.student_progress.saved_js || data.challenge.starter_js || DEFAULT_STARTER_JS);
              setIsCompleted(data.student_progress.is_completed || false);
            } else {
              setHtmlCode(data.challenge.starter_html || DEFAULT_STARTER_HTML);
              setCssCode(data.challenge.starter_css || DEFAULT_STARTER_CSS);
              setJsCode(data.challenge.starter_js || DEFAULT_STARTER_JS);
              setIsCompleted(false);
            }

            // Populate initial criteria check
            const reqTags: string[] = data.challenge.solution_criteria?.required_tags || [];
            const reqClasses: string[] = data.challenge.solution_criteria?.required_classes || [];
            const reqJs: string[] = data.challenge.solution_criteria?.required_js_rules || [];
            const initResults = [
              ...reqTags.map(t => ({ criterion: `Must contain <${t}> tag`, passed: false })),
              ...reqClasses.map(c => ({ criterion: `Must contain class '.${c}'`, passed: false })),
              ...reqJs.map(j => ({ criterion: `Must use JavaScript '${j}'`, passed: false }))
            ];
            setCriteriaResults(initResults);
          }
        }
      } catch (err) {
        console.log('Error loading challenge:', err);
      }
    };
    fetchChallenge();
  }, [slug]);

  // Debounce handler for Live Preview (350ms) + Autosave status tracking
  useEffect(() => {
    setIsUpdating(true);
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
      setDebouncedCss(cssCode);
      setDebouncedJs(jsCode);
      setIsUpdating(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode]);

  // Autosave interval every 6 seconds if unsaved
  useEffect(() => {
    const autosaveTimer = setTimeout(() => {
      if (saveStatus === 'unsaved') {
        saveDraft(true);
      }
    }, 6000);
    return () => clearTimeout(autosaveTimer);
  }, [htmlCode, cssCode, jsCode, saveStatus]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  // Open Selected Project from Modal
  const handleOpenProject = (targetSlug: string, savedHtml?: string, savedCss?: string, savedJs?: string) => {
    setSlug(targetSlug);
    if (savedHtml) setHtmlCode(savedHtml);
    if (savedCss) setCssCode(savedCss);
    if (savedJs) setJsCode(savedJs);
    playClickSound();
    showToast(`Loaded: ${targetSlug}! 🚀`);
  };

  // Create New Project / Reset Studio
  const handleNewProject = () => {
    setSlug('class-1-heading-island');
    setHtmlCode(`<div class="island-card">\n  <h1>My Brand New Webpage 🌟</h1>\n  <p>Start dragging elements to build your creative universe!</p>\n</div>`);
    setCssCode(`.island-card {\n  background: #0f172a;\n  border: 4px solid #fbbf24;\n  border-radius: 24px;\n  padding: 30px;\n  color: #f8fafc;\n  text-align: center;\n}`);
    setJsCode(`console.log("New project canvas created!");`);
    playClickSound();
    showToast("New Canvas Created! 🎨 Start Building!");
  };

  // Save Draft API Call
  const saveDraft = async (silent = false) => {
    setSaveStatus('saving');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/web-studio/save-draft/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug,
          saved_html: htmlCode,
          saved_css: cssCode,
          saved_js: jsCode
        })
      });

      if (res.ok) {
        setSaveStatus('saved');
        if (!silent) {
          playClickSound();
          showToast("Saved to Cloud! 💾");
        }
      } else {
        setSaveStatus('unsaved');
      }
    } catch (e) {
      setSaveStatus('unsaved');
    } finally {
      setIsSaving(false);
    }
  };

  // Submit Mission & Validate Code against Criteria API
  const handleSubmitMission = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      const res = await fetch('/api/web-studio/submit/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          slug,
          html: htmlCode,
          css: cssCode,
          js: jsCode
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCriteriaResults(data.criteria_results || []);
        if (data.success) {
          setIsCompleted(true);
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
          playRewardSound();
          showToast(`Mission Cleared! +${data.reward_xp || challenge?.reward_xp || 50} XP! 🎉`);
        } else {
          playClickSound();
          showToast(data.message || "Keep tweaking to fulfill all mission requirements!");
        }
      }
    } catch (e) {
      console.log('Submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset starter template
  const handleReset = () => {
    if (challenge) {
      setHtmlCode(challenge.starter_html);
      setCssCode(challenge.starter_css);
      setJsCode(challenge.starter_js || DEFAULT_STARTER_JS);
    } else {
      setHtmlCode(DEFAULT_STARTER_HTML);
      setCssCode(DEFAULT_STARTER_CSS);
      setJsCode(DEFAULT_STARTER_JS);
    }
    playClickSound();
    showToast("Reset to Starter Template! 🚀");
  };

  // ========================================================
  // DOLACODE REVEALER & CODE INJECTORS
  // ========================================================

  // Insert HTML Element & Trigger DolaCode Revealer
  const handleInsertHtml = (codeSnippet: string, revealedTag: string, explanation: string) => {
    setHtmlCode(prev => {
      // If code ends with </div>, inject before closing div
      const lastDivIndex = prev.lastIndexOf('</div>');
      if (lastDivIndex !== -1) {
        return prev.slice(0, lastDivIndex) + `  ${codeSnippet}\n` + prev.slice(lastDivIndex);
      }
      return `${prev}\n${codeSnippet}`;
    });
    setRevealedSnippet(revealedTag);
    setRevealedExplanation(explanation);
    setActiveTab('html');
    playRewardSound();
    showToast(`DolaCode revealed: ${revealedTag}! ✨`);
  };

  // Apply CSS Rule & Trigger DolaCode Revealer
  const handleApplyCssRule = (property: string, value: string, explanation: string) => {
    const newRuleSnippet = `${property}: ${value};`;
    setCssCode(prev => {
      // Append inside first class or card block
      if (prev.includes('{')) {
        const openBrace = prev.indexOf('{');
        return prev.slice(0, openBrace + 1) + `\n  ${newRuleSnippet}` + prev.slice(openBrace + 1);
      }
      return `${prev}\n.decorated {\n  ${newRuleSnippet}\n}`;
    });
    setRevealedSnippet(newRuleSnippet);
    setRevealedExplanation(explanation);
    setActiveTab('css');
    playRewardSound();
    showToast(`CSS Magic Applied: ${property}! 🎨`);
  };

  // Insert JavaScript Action & Trigger DolaCode Revealer
  const handleInsertJsAction = (htmlSnippet: string, jsSnippet: string, explanation: string) => {
    setHtmlCode(prev => {
      const lastDivIndex = prev.lastIndexOf('</div>');
      if (lastDivIndex !== -1) {
        return prev.slice(0, lastDivIndex) + `  ${htmlSnippet}\n` + prev.slice(lastDivIndex);
      }
      return `${prev}\n${htmlSnippet}`;
    });
    setJsCode(prev => `${prev}\n\n${jsSnippet}`);
    setRevealedSnippet(`onclick / ${jsSnippet.split('(')[0].replace('function ', '').trim()}()`);
    setRevealedExplanation(explanation);
    setActiveTab('js');
    playRewardSound();
    showToast(`JavaScript Superpower Added! ⚡`);
  };

  // Insert Sticker Asset into HTML Editor
  const handleInsertSticker = (snippet: string, title: string) => {
    handleInsertHtml(
      snippet,
      '<img src="...">',
      `Sticker "${title}" added! The src attribute tells browsers where to load the image.`
    );
    setIsAssetModalOpen(false);
  };

  // Click Swatch Color -> Appends hex into CSS
  const handleColorSwatchClick = (swatch: { name: string; hex: string }) => {
    handleApplyCssRule(
      'background',
      swatch.hex,
      `Changed background color to ${swatch.name} (${swatch.hex})`
    );
  };

  // Class 4: Load Online Store Template with Nigerian Naira (₦)
  const handleLoadStoreTemplate = (theme: 'books' | 'snacks' | 'toys') => {
    playRewardSound();
    if (theme === 'books') {
      setHtmlCode(`<div class="store-app">
  <div class="store-header">
    <h1>📚 DOLASTORE KIDS BOOKSHOP</h1>
    <p>Read, learn, and grow! All prices in Nigerian Naira (₦)</p>
  </div>
  <div class="shop-grid">
    <div class="item-card">
      <img src="/assets/stickers/happy-robot.svg" width="70" alt="Robot Book">
      <h3>Coding Space Comic</h3>
      <div class="price-tag">₦1,500</div>
      <button class="cart-btn" onclick="buyItem('Coding Comic', 1500)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/dino.svg" width="70" alt="Dino Story">
      <h3>Dino Safari Story</h3>
      <div class="price-tag">₦2,200</div>
      <button class="cart-btn" onclick="buyItem('Dino Story', 2200)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/gold-star.svg" width="70" alt="Maths Quest">
      <h3>Maths Quest Atlas</h3>
      <div class="price-tag">₦3,000</div>
      <button class="cart-btn" onclick="buyItem('Maths Atlas', 3000)">Add to Basket</button>
    </div>
  </div>
  <div class="cart-summary">
    <h2>🛍️ Shopping Basket: <span id="cart-count">0</span> books</h2>
    <div class="total-line">Total: <span class="total-naira" id="cart-total">₦0</span></div>
    <div class="cart-actions">
      <button class="checkout-btn" onclick="checkoutOrder()">Simulate Checkout (No Real Money) 💳</button>
      <button class="clear-btn" onclick="resetCart()">Empty Basket 🗑️</button>
    </div>
    <p id="receipt-msg" class="receipt-box"></p>
  </div>
</div>`);
    } else if (theme === 'snacks') {
      setHtmlCode(`<div class="store-app">
  <div class="store-header">
    <h1>🍿 JOLLOF & PASTRY CAFE</h1>
    <p>Delicious snacks fresh out of the kitchen! Prices in Naira (₦)</p>
  </div>
  <div class="shop-grid">
    <div class="item-card">
      <img src="/assets/stickers/leo-explorer.svg" width="70" alt="Jollof Box">
      <h3>Party Jollof Rice Box</h3>
      <div class="price-tag">₦2,500</div>
      <button class="cart-btn" onclick="buyItem('Jollof Rice Box', 2500)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/gold-star.svg" width="70" alt="Meat Pie">
      <h3>Crispy Meat Pie & Juice</h3>
      <div class="price-tag">₦1,800</div>
      <button class="cart-btn" onclick="buyItem('Meat Pie Combo', 1800)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/happy-robot.svg" width="70" alt="Puff Puff">
      <h3>Golden Puff Puff Platter</h3>
      <div class="price-tag">₦1,000</div>
      <button class="cart-btn" onclick="buyItem('Puff Puff Platter', 1000)">Add to Basket</button>
    </div>
  </div>
  <div class="cart-summary">
    <h2>🛍️ Shopping Basket: <span id="cart-count">0</span> items</h2>
    <div class="total-line">Total: <span class="total-naira" id="cart-total">₦0</span></div>
    <div class="cart-actions">
      <button class="checkout-btn" onclick="checkoutOrder()">Simulate Checkout (No Real Money) 💳</button>
      <button class="clear-btn" onclick="resetCart()">Empty Basket 🗑️</button>
    </div>
    <p id="receipt-msg" class="receipt-box"></p>
  </div>
</div>`);
    } else {
      setHtmlCode(`<div class="store-app">
  <div class="store-header">
    <h1>🧸 GALAXY TOY EMPORIUM</h1>
    <p>Awesome robots and space toys! Prices in Naira (₦)</p>
  </div>
  <div class="shop-grid">
    <div class="item-card">
      <img src="/assets/stickers/rocket.svg" width="70" alt="Space Shuttle">
      <h3>Space Rocket Toy</h3>
      <div class="price-tag">₦4,500</div>
      <button class="cart-btn" onclick="buyItem('Rocket Toy', 4500)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/happy-robot.svg" width="70" alt="Robot">
      <h3>Cyber Explorer Robot</h3>
      <div class="price-tag">₦5,500</div>
      <button class="cart-btn" onclick="buyItem('Cyber Robot', 5500)">Add to Basket</button>
    </div>
    <div class="item-card">
      <img src="/assets/stickers/dino.svg" width="70" alt="Dino Plush">
      <h3>Soft Dino Plushie</h3>
      <div class="price-tag">₦3,200</div>
      <button class="cart-btn" onclick="buyItem('Dino Plushie', 3200)">Add to Basket</button>
    </div>
  </div>
  <div class="cart-summary">
    <h2>🛍️ Shopping Basket: <span id="cart-count">0</span> toys</h2>
    <div class="total-line">Total: <span class="total-naira" id="cart-total">₦0</span></div>
    <div class="cart-actions">
      <button class="checkout-btn" onclick="checkoutOrder()">Simulate Checkout (No Real Money) 💳</button>
      <button class="clear-btn" onclick="resetCart()">Empty Basket 🗑️</button>
    </div>
    <p id="receipt-msg" class="receipt-box"></p>
  </div>
</div>`);
    }

    setCssCode(`.store-app {
  background: #090d16;
  border: 4px solid #10b981;
  border-radius: 24px;
  padding: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
}
.shop-grid {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
  flex-wrap: wrap;
}
.item-card {
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 16px;
  padding: 16px;
  width: 170px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.price-tag {
  color: #34d399;
  font-weight: 900;
  font-size: 18px;
  margin: 6px 0 10px;
}
.cart-btn {
  background: #10b981;
  color: white;
  font-weight: bold;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  width: 100%;
}
.cart-summary {
  background: #131b2e;
  border-radius: 18px;
  padding: 18px;
  margin-top: 10px;
  border: 2px dashed #10b981;
}
.total-naira {
  color: #fbbf24;
  font-size: 24px;
  font-weight: 900;
  margin-left: 10px;
}
.checkout-btn {
  background: #fbbf24;
  color: #0f172a;
  font-weight: 900;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin: 10px 6px;
}
.clear-btn {
  background: #ef4444;
  color: white;
  font-weight: bold;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}
.receipt-box {
  margin-top: 10px;
  font-weight: bold;
  color: #6ee7b7;
}`);

    setJsCode(`let cartTotal = 0;
let itemCount = 0;

function buyItem(name, price) {
  itemCount = itemCount + 1;
  cartTotal = cartTotal + price;
  
  document.getElementById('cart-count').innerText = itemCount;
  document.getElementById('cart-total').innerText = '₦' + cartTotal.toLocaleString();
  document.getElementById('receipt-msg').innerText = 'Added ' + name + ' (₦' + price.toLocaleString() + ') to your basket!';
}

function resetCart() {
  cartTotal = 0;
  itemCount = 0;
  document.getElementById('cart-count').innerText = '0';
  document.getElementById('cart-total').innerText = '₦0';
  document.getElementById('receipt-msg').innerText = 'Your basket is now empty.';
}

function checkoutOrder() {
  if (itemCount === 0) {
    alert('Your basket is empty! Please choose a product first.');
    return;
  }
  document.getElementById('receipt-msg').innerText = '🎉 Order Simulated! Total: ₦' + cartTotal.toLocaleString() + ' (No real money charged). Great job building your store!';
}`);

    setRevealedSnippet('let cartTotal = cartTotal + price;');
    setRevealedExplanation(`Loaded ${theme.toUpperCase()} Store with live Naira (₦) shopping cart!`);
    showToast(`Loaded ${theme.toUpperCase()} store template! 🛒`);
  };

  // Class 5: Load Creator Challenge Theme Starter
  const handleLoadCreatorTheme = (theme: 'school' | 'portfolio' | 'animal' | 'story' | 'business') => {
    playRewardSound();
    if (theme === 'school') {
      setHtmlCode(`<div class="site-card">
  <h1>🏫 Welcome to Greenwood Coding Club!</h1>
  <p>We build cool games, design websites, and solve math puzzles every Thursday!</p>
  <img src="/assets/stickers/happy-robot.svg" width="110" alt="Club Mascot">
  <button class="club-btn" onclick="joinClub()">Join Our Club 🌟</button>
  <p id="club-status"></p>
</div>`);
      setCssCode(`.site-card {
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  border: 4px solid #60a5fa;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  color: white;
}
.club-btn {
  background: #fbbf24;
  color: #0f172a;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 14px;
}`);
      setJsCode(`function joinClub() {
  document.getElementById('club-status').innerText = "🎉 Welcome new club member! Your explorer badge is unlocked!";
}`);
    } else if (theme === 'portfolio') {
      setHtmlCode(`<div class="site-card">
  <img src="/assets/stickers/leo-explorer.svg" width="100" alt="Avatar">
  <h1>Ada's Digital Art Portfolio 🎨</h1>
  <p>Junior Web Architect, Game Maker, and Pixel Artist!</p>
  <div class="project-pills">
    <span>🎮 Dino Runner</span>
    <span>🌐 Web Studio Island</span>
    <span>🚀 Space Explorer</span>
  </div>
  <button class="club-btn" onclick="showLove()">Send Star Rating ⭐ (<span id="stars">0</span>)</button>
</div>`);
      setCssCode(`.site-card {
  background: linear-gradient(135deg, #831843, #ec4899);
  border: 4px solid #f472b6;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  color: white;
}
.project-pills span {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 6px 14px;
  border-radius: 999px;
  margin: 6px;
  font-size: 13px;
  font-weight: bold;
}
.club-btn {
  background: #ffd32a;
  color: #0f172a;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 16px;
}`);
      setJsCode(`let stars = 0;
function showLove() {
  stars = stars + 1;
  document.getElementById('stars').innerText = stars;
}`);
    } else if (theme === 'story') {
      setHtmlCode(`<div class="site-card">
  <h1>📖 The Legend of Whispering Woods</h1>
  <p>Chapter 1: You arrive at a fork in the ancient forest. A glowing dragon flies above!</p>
  <img src="/assets/stickers/dino.svg" width="110" alt="Dragon">
  <div class="story-choice">
    <button class="choice-btn" onclick="choosePath('river')">Follow Crystal River 🌊</button>
    <button class="choice-btn" onclick="choosePath('cave')">Enter Dragon Cave ⛰️</button>
  </div>
  <p id="story-outcome" class="outcome-text"></p>
</div>`);
      setCssCode(`.site-card {
  background: linear-gradient(135deg, #064e3b, #047857);
  border: 4px solid #34d399;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  color: white;
}
.choice-btn {
  background: #34d399;
  color: #064e3b;
  font-weight: 800;
  padding: 10px 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin: 8px;
}
.outcome-text {
  margin-top: 14px;
  font-weight: bold;
  color: #fef08a;
}`);
      setJsCode(`function choosePath(path) {
  if (path === 'river') {
    document.getElementById('story-outcome').innerText = "🌊 You follow the river and find a golden chest floating by the reeds!";
  } else {
    document.getElementById('story-outcome').innerText = "⛰️ Inside the cave, the dragon gently smiles and offers you a glowing jewel!";
  }
}`);
    } else {
      // Animal Club
      setHtmlCode(`<div class="site-card">
  <div class="club-badge">🐾 PET RESCUE HAVEN</div>
  <h1>Loving Homes for Happy Pets 🐶🐱</h1>
  <img src="/assets/stickers/happy-robot.svg" width="110" alt="Pet Mascot">
  <p>We rescue, shelter, and care for friendly puppies and kittens across the city!</p>
  <button class="club-btn" onclick="patPet()">Pat the Mascot ❤️ (<span id="pats">0</span> pats)</button>
</div>`);
      setCssCode(`.site-card {
  background: linear-gradient(135deg, #1e1b4b, #4338ca);
  border: 4px solid #a5b4fc;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  color: white;
}
.club-badge {
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1px;
  color: #facc15;
  margin-bottom: 8px;
}
.club-btn {
  background: #facc15;
  color: #1e1b4b;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 14px;
}`);
      setJsCode(`let pats = 0;
function patPet() {
  pats = pats + 1;
  document.getElementById('pats').innerText = pats;
}`);
    }
    showToast(`Loaded ${theme.toUpperCase()} Creator Website! 🚀`);
  };

  // Construct complete HTML string with kid-friendly CSS resets & Google Fonts + Script execution
  const srcDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800;900&family=Nunito:wght@400;600;700;800&family=Fredoka:wght@400;600;700&family=Orbitron:wght@500;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Poppins', 'Nunito', system-ui, -apple-system, sans-serif;
      background-color: #0d1117;
      color: #f0f6fc;
      padding: 20px;
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
    .action-btn {
      background: #fbbf24;
      color: #0f172a;
      border: none;
      padding: 10px 22px;
      font-family: inherit;
      font-size: 14px;
      font-weight: 800;
      border-radius: 12px;
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
      margin-top: 12px;
      display: inline-block;
    }
    .action-btn:hover {
      transform: translateY(-2px);
      background: #f59e0b;
    }
    ${debouncedCss}
  </style>
</head>
<body>
  ${debouncedHtml}
  <script>
    try {
      ${debouncedJs}
    } catch (e) {
      console.log('Script notice:', e);
    }
  </script>
</body>
</html>
  `;

  // Dynamic preview iframe width based on selected device preview
  const getDeviceClass = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-[320px] sm:w-[360px] h-[580px] rounded-3xl border-8 border-slate-700 shadow-2xl';
      case 'tablet':
        return 'w-[640px] h-[780px] rounded-2xl border-8 border-slate-700 shadow-2xl';
      case 'desktop':
      default:
        return 'w-full h-full rounded-xl border border-slate-800';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-950 text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'w-full h-[calc(100vh-64px)] min-h-[600px]'
      }`}
    >
      {/* Top Header Navigation */}
      <header className="h-14 md:h-16 bg-slate-900 border-b border-slate-800/80 px-3 md:px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Code2 className="text-amber-400 w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm md:text-lg tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
                Web Studio
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full hidden xs:inline">
                Class {activeClassNum}: {activeMission.title.split(':')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 md:gap-2">

          {/* New Project Button */}
          <button
            onClick={handleNewProject}
            className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 shadow-md hover:from-amber-400 hover:to-yellow-300 active:scale-95 shrink-0"
            title="Create New Blank Project"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New Project</span>
          </button>

          {/* Saved Projects List Modal Button */}
          <button
            onClick={() => setIsProjectsModalOpen(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Open Saved Projects"
          >
            <FolderOpen size={14} className="text-amber-400" />
            <span className="hidden sm:inline">My Projects</span>
          </button>
          
          {/* Tutorial Button */}
          <button
            onClick={() => setIsTutorialOpen(true)}
            className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-lg text-xs font-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
            title="5 Classes Curriculum Guide"
          >
            <HelpCircle size={14} className="text-amber-400" />
            <span className="hidden md:inline">5 Classes Guide</span>
          </button>

          {/* Share & Export Modal Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-lg text-xs transition-all flex items-center gap-1 shadow-md active:scale-95"
            title="Share and download your responsive website"
          >
            <Share2 size={14} />
            <span className="hidden md:inline">Share Site</span>
          </button>

          {/* Manual Save Button */}
          <button
            onClick={() => saveDraft(false)}
            disabled={isSaving}
            className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : saveStatus === 'saving'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400'
            }`}
            title="Save code draft to database"
          >
            {saveStatus === 'saved' ? (
              <CloudCheck size={14} />
            ) : saveStatus === 'saving' ? (
              <Sparkles size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-bold transition-all active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </header>

      {/* Level Selector & Class Instruction Panel */}
      <MissionInstructionPanel
        currentSlug={slug}
        challenge={challenge}
        criteriaResults={criteriaResults}
        isCompleted={isCompleted}
        onSelectMission={(newSlug) => setSlug(newSlug)}
        onSubmitMission={handleSubmitMission}
        isSubmitting={isSubmitting}
      />

      {/* Interactive Class Visual Tools Strip (HTML Drag/Tap, CSS Magic Wand, JS Actions, Shop Catalogs) */}
      <ClassWorkspaceToolbar
        classNum={activeClassNum}
        currentSlug={slug}
        onInsertHtml={handleInsertHtml}
        onApplyCssRule={handleApplyCssRule}
        onInsertJsAction={handleInsertJsAction}
        onLoadStoreTemplate={handleLoadStoreTemplate}
        onLoadCreatorTheme={handleLoadCreatorTheme}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Animated DolaCode Code Revealer Toast / Banner */}
      <DolaCodeRevealer
        revealedSnippet={revealedSnippet}
        explanation={revealedExplanation}
        onClose={() => setRevealedSnippet(null)}
      />

      {/* MOBILE WORKSPACE TOGGLE SWITCHER (Shown on screens < 1024px) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-1.5 flex items-center justify-center gap-1 shrink-0 select-none">
        <button
          onClick={() => setMobileWorkspaceView('editor')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            mobileWorkspaceView === 'editor'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Code2 size={14} />
          <span>Code Editors</span>
        </button>

        <button
          onClick={() => setMobileWorkspaceView('preview')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
            mobileWorkspaceView === 'preview'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
        >
          <Eye size={14} />
          <span>Live Stage</span>
        </button>

        <button
          onClick={() => setMobileWorkspaceView('split')}
          className={`py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
            mobileWorkspaceView === 'split'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-800/60'
          }`}
          title="Split View"
        >
          <Columns size={14} />
          <span className="hidden sm:inline">Split</span>
        </button>
      </div>

      {/* Main Split Screen / Responsive Column Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* LEFT COLUMN: CODE EDITORS (HTML, CSS, JAVASCRIPT) */}
        <div 
          className={`w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/50 overflow-hidden transition-all ${
            mobileWorkspaceView === 'preview' ? 'invisible absolute -left-[9999px] lg:visible lg:relative lg:left-0 lg:flex' : 'flex'
          } ${mobileWorkspaceView === 'split' ? 'h-1/2 lg:h-full' : 'h-full'}`}
        >
          {/* Tab View Mode */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Editor Tabs & Toolbars Bar */}
            <div className="flex items-center justify-between bg-slate-900 border-b border-slate-800 px-3 pt-2 shrink-0 overflow-x-auto">
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Tab 1: HTML */}
                <button
                  onClick={() => setActiveTab('html')}
                  className={`px-3 sm:px-4 py-2 text-xs font-black rounded-t-xl transition-all flex items-center gap-1.5 border-t-2 ${
                    activeTab === 'html'
                      ? 'bg-slate-950 text-amber-400 border-amber-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <Code2 size={15} className={activeTab === 'html' ? 'text-amber-400' : 'text-slate-400'} />
                  <span>1. HTML</span>
                </button>

                {/* Tab 2: CSS */}
                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-3 sm:px-4 py-2 text-xs font-black rounded-t-xl transition-all flex items-center gap-1.5 border-t-2 ${
                    activeTab === 'css'
                      ? 'bg-slate-950 text-sky-400 border-sky-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <Paintbrush size={15} className={activeTab === 'css' ? 'text-sky-400' : 'text-slate-400'} />
                  <span>2. Magic CSS</span>
                </button>

                {/* Tab 3: JavaScript */}
                <button
                  onClick={() => setActiveTab('js')}
                  className={`px-3 sm:px-4 py-2 text-xs font-black rounded-t-xl transition-all flex items-center gap-1.5 border-t-2 ${
                    activeTab === 'js'
                      ? 'bg-slate-950 text-emerald-400 border-emerald-400 shadow-lg'
                      : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                  }`}
                >
                  <Zap size={15} className={activeTab === 'js' ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>3. JavaScript</span>
                </button>
              </div>

              {/* Toolbar Trigger for Active Tab */}
              {activeTab === 'html' ? (
                <button
                  onClick={() => setIsAssetModalOpen(true)}
                  className="mb-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0"
                >
                  <ImageIcon size={13} className="text-amber-400" />
                  <span>+ Sticker</span>
                </button>
              ) : activeTab === 'css' ? (
                <div className="mb-1.5 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
                  <Palette size={13} className="text-sky-400 shrink-0" />
                  <div className="flex items-center gap-1">
                    {QUICK_COLOR_SWATCHES.slice(0, 5).map((swatch) => (
                      <button
                        key={swatch.hex}
                        onClick={() => handleColorSwatchClick(swatch)}
                        className="w-3.5 h-3.5 rounded-full border border-slate-700 hover:scale-125 transition-transform shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                        title={`Apply ${swatch.name} (${swatch.hex})`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-xl shrink-0">
                  <Zap size={12} />
                  <span>Actions &amp; Logic</span>
                </div>
              )}
            </div>

            {/* Editor Container (PERSISTENT MONACO INSTANCES) */}
            <div className="flex-1 relative bg-slate-950 overflow-hidden">
              {/* HTML Editor */}
              <div className={`h-full w-full ${activeTab === 'html' ? 'block' : 'hidden'}`}>
                <MonacoEditor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={htmlCode}
                  onChange={(val) => setHtmlCode(val || '')}
                  onMount={(editor) => { htmlEditorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>

              {/* CSS Editor */}
              <div className={`h-full w-full ${activeTab === 'css' ? 'block' : 'hidden'}`}>
                <MonacoEditor
                  height="100%"
                  language="css"
                  theme="vs-dark"
                  value={cssCode}
                  onChange={(val) => setCssCode(val || '')}
                  onMount={(editor) => { cssEditorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>

              {/* JavaScript Editor */}
              <div className={`h-full w-full ${activeTab === 'js' ? 'block' : 'hidden'}`}>
                <MonacoEditor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={jsCode}
                  onChange={(val) => setJsCode(val || '')}
                  onMount={(editor) => { jsEditorRef.current = editor; }}
                  options={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    automaticLayout: true,
                    tabSize: 2,
                    padding: { top: 12, bottom: 12 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW STAGE */}
        <div 
          className={`w-full lg:w-1/2 flex flex-col bg-slate-950 overflow-hidden transition-all ${
            mobileWorkspaceView === 'editor' ? 'invisible absolute -left-[9999px] lg:visible lg:relative lg:left-0 lg:flex' : 'flex'
          } ${mobileWorkspaceView === 'split' ? 'h-1/2 lg:h-full' : 'h-full'}`}
        >
          {/* Live Preview Window Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 md:px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-black text-slate-300 ml-1 flex items-center gap-1">
                <Play size={13} className="text-emerald-400 fill-emerald-400" />
                Live Stage
              </span>
              {isUpdating && (
                <span className="flex items-center gap-1 text-[9px] text-amber-400 font-semibold bg-amber-400/10 px-1.5 py-0.2 rounded-full border border-amber-400/20">
                  <Sparkles size={9} className="animate-spin" /> Live
                </span>
              )}
            </div>

            {/* Device Viewport Toggle & Reset */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                title="Reset code to mission template"
              >
                <RotateCcw size={13} />
              </button>

              <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 rounded-md transition-all ${
                    previewDevice === 'desktop' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor size={13} />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1 rounded-md transition-all ${
                    previewDevice === 'tablet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Tablet View (640px)"
                >
                  <Tablet size={13} />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 rounded-md transition-all ${
                    previewDevice === 'mobile' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Mobile View (360px)"
                >
                  <Smartphone size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Sandboxed Iframe Container */}
          <div className="flex-1 bg-slate-900/40 p-2 sm:p-4 flex items-center justify-center overflow-auto relative">
            <div className={`transition-all duration-300 ${getDeviceClass()} overflow-hidden bg-slate-900 shadow-2xl relative max-w-full`}>
              <iframe
                title="Dolacode Live Web Preview"
                srcDoc={srcDoc}
                sandbox="allow-scripts"
                className="w-full h-full border-0 bg-[#0d1117]"
              />
            </div>
          </div>

          {/* Live Stage Footer */}
          <div className="bg-slate-900 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <div className="flex items-center gap-1.5 font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sandboxed Engine (HTML + CSS + JS)</span>
            </div>
            <div className="font-mono text-slate-500">
              350ms instant live preview
            </div>
          </div>

        </div>

      </div>

      {/* Saved Projects List Modal */}
      <SavedProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
      />

      {/* Asset Palette Modal Drawer */}
      <AssetPaletteModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        onSelectAsset={handleInsertSticker}
      />

      {/* Interactive Kid Tutorial Modal */}
      <KidTutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Share & Responsive Preview Modal */}
      <SharePreviewModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={challenge?.title || 'My Web Project'}
        htmlCode={htmlCode}
        cssCode={cssCode}
        jsCode={jsCode}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border-2 border-amber-400 text-amber-300 px-3.5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce text-xs">
          <Sparkles className="text-amber-400 shrink-0" size={16} />
          <span className="font-extrabold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
