'use client';

import React, { useState } from 'react';
import { ShoppingBag, Sparkles, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartShopperGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

interface Item {
  id: string;
  name: string;
  price: number;
  category: 'NEED' | 'WANT';
  icon: string;
  description: string;
}

export const SmartShopperGame: React.FC<SmartShopperGameProps> = ({ onComplete, onClose }) => {
  const [stage, setStage] = useState<'shopping' | 'consequence' | 'comparison' | 'complete'>('shopping');
  const [budget] = useState<number>(3000);
  const [cart, setCart] = useState<Item[]>([]);
  const [consequenceFeedback, setConsequenceFeedback] = useState<{ success: boolean; title: string; explanation: string }>({
    success: false,
    title: '',
    explanation: ''
  });
  const [comparisonChoice, setComparisonChoice] = useState<'A' | 'B' | null>(null);

  const shopItems: Item[] = [
    {
      id: 'notebook',
      name: 'School Notebook',
      price: 700,
      category: 'NEED',
      icon: '📚',
      description: 'Required for taking notes in class'
    },
    {
      id: 'water_bottle',
      name: 'Sturdy Water Bottle',
      price: 1000,
      category: 'NEED',
      icon: '🍶',
      description: 'Keeps you hydrated during school hours'
    },
    {
      id: 'toy_robot',
      name: 'Turbo Toy Robot',
      price: 2500,
      category: 'WANT',
      icon: '🤖',
      description: 'Super fun to play with at home'
    },
    {
      id: 'snack',
      name: 'Meat Pie & Juice',
      price: 500,
      category: 'WANT',
      icon: '🥧',
      description: 'A yummy afternoon treat'
    }
  ];

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const remainingBudget = budget - cartTotal;

  const toggleCartItem = (item: Item) => {
    if (cart.some(i => i.id === item.id)) {
      setCart(cart.filter(i => i.id !== item.id));
    } else {
      if (cartTotal + item.price > budget) {
        alert(`You don't have enough money! ₦${item.price} exceeds your remaining ₦${remainingBudget}.`);
        return;
      }
      setCart([...cart, item]);
    }
  };

  const handleCheckout = () => {
    const hasNotebook = cart.some(i => i.id === 'notebook');
    const hasWaterBottle = cart.some(i => i.id === 'water_bottle');
    const hasToy = cart.some(i => i.id === 'toy_robot');

    if (hasToy && (!hasNotebook || !hasWaterBottle)) {
      setConsequenceFeedback({
        success: false,
        title: "You bought the shiny toy robot...",
        explanation: "You bought the toy, but you no longer have enough money for your school items! In real life, a NEED is something essential you must have (like your notebook and water bottle for school). A WANT is something fun that can wait for later. Let's try again!"
      });
      setStage('consequence');
    } else if (hasNotebook && hasWaterBottle) {
      setConsequenceFeedback({
        success: true,
        title: "Brilliant Decision, Smart Shopper!",
        explanation: `You took care of all your school NEEDS first! You still have ₦${remainingBudget.toLocaleString()} left over, which you can save in your wallet or use for a treat later!`
      });
      setStage('consequence');
    } else {
      setConsequenceFeedback({
        success: false,
        title: "Missing Required School Items",
        explanation: "Remember, your teacher requires a School Notebook and a Water Bottle. Make sure to prioritize those needs before spending your budget!"
      });
      setStage('consequence');
    }
  };

  const resetShopping = () => {
    setCart([]);
    setStage('shopping');
  };

  const handleProceedToComparison = () => {
    setStage('comparison');
  };

  const handleComparisonSelect = (shop: 'A' | 'B') => {
    setComparisonChoice(shop);
    if (shop === 'B') {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setTimeout(() => {
        setStage('complete');
        onComplete(50, 100, "Smart Shopper");
      }, 1500);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border-4 border-amber-500/30 rounded-3xl p-6 sm:p-8 text-white max-w-4xl mx-auto shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-2xl shadow-lg border border-white/20">
            🛒
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-black">
              World 2 &bull; Smart Shopper
            </div>
            <h2 className="text-2xl font-black text-white">
              {stage === 'comparison' ? 'Price Comparison Challenge' : 'Needs vs Wants Shopping'}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-sm transition-all"
        >
          ✕ Exit
        </button>
      </div>

      {/* STAGE 1: SHOPPING */}
      {stage === 'shopping' && (
        <div>
          {/* Mission & Budget Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-950/40 border border-amber-400/30 p-4 rounded-2xl">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                <ShoppingBag size={14} /> Mission Objective
              </div>
              <p className="text-sm font-bold text-amber-100">
                You need a <span className="underline decoration-amber-400">School Notebook</span> and a <span className="underline decoration-amber-400">Water Bottle</span> for school!
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">Shopping Budget</div>
                <div className="text-2xl font-black text-white">₦{budget.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400">Remaining</div>
                <div className="text-2xl font-black text-emerald-300">₦{remainingBudget.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Educational Concept Callout */}
          <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3 mb-6 text-xs text-indigo-200">
            <HelpCircle size={18} className="text-indigo-400 shrink-0" />
            <span>
              <strong>Smart Rule:</strong> <strong>NEED</strong> = something important we must have. <strong>WANT</strong> = something nice to have that can wait.
            </span>
          </div>

          {/* Shop Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {shopItems.map((item) => {
              const inCart = cart.some(i => i.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCartItem(item)}
                  className={`
                    p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex items-center gap-4
                    ${inCart
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg scale-102 ring-2 ring-amber-400/50'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shrink-0 shadow-inner">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-white text-base">{item.name}</h4>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.category === 'NEED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{item.description}</p>
                    <div className="text-base font-black text-amber-400 mt-2">
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                    inCart ? 'bg-amber-400 text-slate-900 border-amber-300' : 'border-slate-600'
                  }`}>
                    {inCart ? '✓' : '+'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Button */}
          <div className="flex items-center justify-between bg-slate-800/90 border border-slate-700 p-4 rounded-2xl">
            <div className="text-sm">
              <span className="text-slate-400">Cart Total: </span>
              <span className="font-black text-white text-lg">₦{cartTotal.toLocaleString()}</span>
              <span className="text-slate-500 text-xs ml-2">({cart.length} items)</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black text-sm uppercase tracking-wider shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-98"
            >
              Checkout & See Result &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: CONSEQUENCE FEEDBACK */}
      {stage === 'consequence' && (
        <div className="text-center py-6 max-w-xl mx-auto animate-fadeIn">
          <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-xl border-4 ${
            consequenceFeedback.success ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-amber-500/20 border-amber-400 text-amber-400'
          }`}>
            {consequenceFeedback.success ? '🎉' : '💡'}
          </div>

          <h3 className="text-2xl font-black text-white mb-3">
            {consequenceFeedback.title}
          </h3>

          <p className="text-slate-200 text-base leading-relaxed bg-slate-800/80 border border-slate-700 p-5 rounded-2xl mb-8 text-left">
            {consequenceFeedback.explanation}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!consequenceFeedback.success ? (
              <button
                onClick={resetShopping}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            ) : (
              <button
                onClick={handleProceedToComparison}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-900 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                Next Mission: Price Comparison <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: PRICE COMPARISON */}
      {stage === 'comparison' && (
        <div className="text-center py-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black mb-3 border border-cyan-400/30">
            <Sparkles size={14} /> Mission 2: Comparison Shopping
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            Which shop saves you more money?
          </h3>
          <p className="text-slate-300 text-sm mb-6">
            Both shops sell the exact same sturdy school backpack!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
            {/* Shop A */}
            <div
              onClick={() => handleComparisonSelect('A')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                comparisonChoice === 'A'
                  ? 'bg-rose-500/20 border-rose-400'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400'
              }`}
            >
              <div className="text-3xl mb-2">🏬</div>
              <h4 className="font-black text-lg text-white">Super Store A</h4>
              <p className="text-xs text-slate-400 mt-1">School Backpack</p>
              <div className="text-2xl font-black text-rose-400 my-3">₦8,000</div>
              <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-black">
                Buy at Store A
              </button>
            </div>

            {/* Shop B */}
            <div
              onClick={() => handleComparisonSelect('B')}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                comparisonChoice === 'B'
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-xl ring-2 ring-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 hover:border-emerald-400'
              }`}
            >
              <div className="text-3xl mb-2">🏪</div>
              <h4 className="font-black text-lg text-white">Community Market B</h4>
              <p className="text-xs text-slate-400 mt-1">Exact Same Backpack</p>
              <div className="text-2xl font-black text-emerald-400 my-3">₦6,500</div>
              <button className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-900 text-xs font-black shadow-md">
                Buy at Store B (Saves ₦1,500!)
              </button>
            </div>
          </div>

          {comparisonChoice === 'A' && (
            <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-xl text-rose-200 text-sm font-bold flex items-center justify-center gap-2">
              <AlertTriangle size={16} /> Store A charges ₦8,000, which is ₦1,500 more expensive! Choose the cheaper store.
            </div>
          )}
        </div>
      )}

      {/* STAGE 4: COMPLETION */}
      {stage === 'complete' && (
        <div className="text-center py-6 max-w-md mx-auto animate-scaleUp">
          <div className="w-20 h-20 rounded-full bg-yellow-400 text-slate-900 mx-auto flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-4 animate-bounce">
            🛒
          </div>
          <h3 className="text-3xl font-black text-white mb-2">
            Smart Shopper Mastered!
          </h3>
          <p className="text-slate-300 text-sm mb-6">
            You know how to prioritize Needs over Wants and compare prices before spending!
          </p>

          <div className="bg-black/30 rounded-2xl p-4 border border-white/10 mb-6 flex items-center justify-around">
            <div>
              <div className="text-2xl font-black text-yellow-300">+50</div>
              <div className="text-[10px] font-black uppercase text-slate-400">DolaCoins</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl font-black text-cyan-300">+100</div>
              <div className="text-[10px] font-black uppercase text-slate-400">XP Earned</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div>
              <div className="text-2xl">🛒</div>
              <div className="text-[10px] font-black uppercase text-yellow-400">Smart Shopper</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-900 font-black text-base uppercase tracking-wider shadow-xl transition-all transform active:scale-98"
          >
            Back to World Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
