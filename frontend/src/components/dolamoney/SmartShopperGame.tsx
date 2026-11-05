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
    <div className="bg-white border-4 border-amber-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🛒
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-700 font-black">
              World 2 &bull; Smart Shopper
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {stage === 'comparison' ? 'Price Comparison Challenge' : 'Needs vs Wants Shopping'}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* STAGE 1: SHOPPING */}
      {stage === 'shopping' && (
        <div>
          {/* Mission & Budget Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl">
              <div className="text-xs font-black uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1.5">
                <ShoppingBag size={14} /> Mission Objective
              </div>
              <p className="text-sm font-bold text-amber-950">
                You need a <span className="underline decoration-amber-500 font-black">School Notebook</span> and a <span className="underline decoration-amber-500 font-black">Water Bottle</span> for school!
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">Shopping Budget</div>
                <div className="text-2xl font-black text-slate-900">₦{budget.toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-600">Remaining</div>
                <div className="text-2xl font-black text-emerald-600">₦{remainingBudget.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Educational Concept Callout */}
          <div className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3.5 mb-6 text-xs text-indigo-900 font-medium">
            <HelpCircle size={18} className="text-indigo-600 shrink-0" />
            <span>
              <strong>Smart Rule:</strong> <span className="font-black text-indigo-700">NEED</span> = something important we must have. <span className="font-black text-purple-700">WANT</span> = something nice to have that can wait.
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
                    p-5 rounded-3xl border-3 transition-all cursor-pointer relative overflow-hidden flex items-center gap-4
                    ${inCart
                      ? 'bg-amber-50/80 border-amber-400 shadow-lg scale-102 ring-4 ring-amber-300/40'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0 shadow-inner border border-slate-200">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-base">{item.name}</h4>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        item.category === 'NEED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-purple-100 text-purple-800 border border-purple-300'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                    <div className="text-base font-black text-amber-600 mt-2">
                      ₦{item.price.toLocaleString()}
                    </div>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                    inCart ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs' : 'border-slate-300 text-slate-400'
                  }`}>
                    {inCart ? '✓' : '+'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl">
            <div className="text-sm">
              <span className="text-slate-500 font-bold">Cart Total: </span>
              <span className="font-black text-slate-900 text-lg">₦{cartTotal.toLocaleString()}</span>
              <span className="text-slate-500 text-xs ml-2">({cart.length} items)</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Checkout & See Result &rarr;
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: CONSEQUENCE FEEDBACK */}
      {stage === 'consequence' && (
        <div className="text-center py-6 max-w-xl mx-auto animate-fadeIn">
          <div className={`w-22 h-22 rounded-3xl mx-auto flex items-center justify-center text-4xl mb-4 shadow-xl border-4 ${
            consequenceFeedback.success ? 'bg-emerald-100 border-emerald-400 text-emerald-600' : 'bg-amber-100 border-amber-400 text-amber-600'
          }`}>
            {consequenceFeedback.success ? '🎉' : '💡'}
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            {consequenceFeedback.title}
          </h3>

          <p className="text-slate-700 text-base leading-relaxed bg-slate-50 border-2 border-slate-200 p-6 rounded-3xl mb-8 text-left font-medium">
            {consequenceFeedback.explanation}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!consequenceFeedback.success ? (
              <button
                onClick={resetShopping}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_#d97706] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                <RotateCcw size={16} /> Try Again
              </button>
            ) : (
              <button
                onClick={handleProceedToComparison}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800 text-xs font-black uppercase mb-3 border border-cyan-300">
            <Sparkles size={14} className="text-amber-500" /> Mission 2: Comparison Shopping
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            Which shop saves you more money?
          </h3>
          <p className="text-slate-600 text-sm font-medium mb-6">
            Both shops sell the exact same sturdy school backpack!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6">
            {/* Shop A */}
            <div
              onClick={() => handleComparisonSelect('A')}
              className={`p-6 rounded-3xl border-3 cursor-pointer transition-all ${
                comparisonChoice === 'A'
                  ? 'bg-rose-50 border-rose-400'
                  : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm'
              }`}
            >
              <div className="text-4xl mb-2">🏬</div>
              <h4 className="font-black text-lg text-slate-900">Super Store A</h4>
              <p className="text-xs text-slate-500 mt-1">School Backpack</p>
              <div className="text-2xl font-black text-rose-600 my-3">₦8,000</div>
              <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-black">
                Buy at Store A
              </button>
            </div>

            {/* Shop B */}
            <div
              onClick={() => handleComparisonSelect('B')}
              className={`p-6 rounded-3xl border-3 cursor-pointer transition-all ${
                comparisonChoice === 'B'
                  ? 'bg-emerald-50 border-emerald-400 shadow-xl ring-4 ring-emerald-300/40'
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-sm'
              }`}
            >
              <div className="text-4xl mb-2">🏪</div>
              <h4 className="font-black text-lg text-slate-900">Community Market B</h4>
              <p className="text-xs text-slate-500 mt-1">Exact Same Backpack</p>
              <div className="text-2xl font-black text-emerald-600 my-3">₦6,500</div>
              <button className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-md cursor-pointer">
                Buy at Store B (Saves ₦1,500!)
              </button>
            </div>
          </div>

          {comparisonChoice === 'A' && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 text-sm font-bold flex items-center justify-center gap-2">
              <AlertTriangle size={16} className="text-rose-600" /> Store A charges ₦8,000, which is ₦1,500 more expensive! Choose the cheaper store.
            </div>
          )}
        </div>
      )}

      {/* STAGE 4: COMPLETION */}
      {stage === 'complete' && (
        <div className="text-center py-6 max-w-md mx-auto animate-scaleUp">
          <div className="w-22 h-22 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 mx-auto flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-4 animate-bounce">
            🛒
          </div>
          <h3 className="text-3xl font-black text-slate-900 mb-2">
            Smart Shopper Mastered!
          </h3>
          <p className="text-slate-600 text-sm font-medium mb-6">
            You know how to prioritize Needs over Wants and compare prices before spending!
          </p>

          <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 mb-6 flex items-center justify-around">
            <div>
              <div className="text-2xl font-black text-amber-600">+50</div>
              <div className="text-[10px] font-black uppercase text-slate-500">DolaCoins</div>
            </div>
            <div className="w-px h-10 bg-amber-200" />
            <div>
              <div className="text-2xl font-black text-cyan-600">+100</div>
              <div className="text-[10px] font-black uppercase text-slate-500">XP Earned</div>
            </div>
            <div className="w-px h-10 bg-amber-200" />
            <div>
              <div className="text-2xl">🛒</div>
              <div className="text-[10px] font-black uppercase text-amber-600">Smart Shopper</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            Back to World Map &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
