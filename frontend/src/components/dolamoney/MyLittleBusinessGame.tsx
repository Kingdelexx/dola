'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Store, DollarSign, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MyLittleBusinessGameProps {
  onComplete: (coinsEarned: number, xpEarned: number, profit: number, badgeAwarded?: string) => void;
  onClose: () => void;
}

interface BusinessOption {
  id: string;
  name: string;
  icon: string;
  itemName: string;
  unitCost: number;
  itemCount: number;
}

export const MyLittleBusinessGame: React.FC<MyLittleBusinessGameProps> = ({ onComplete, onClose }) => {
  const businesses: BusinessOption[] = [
    { id: 'lemonade', name: 'Fresh Lemonade Stand', icon: '🍋', itemName: 'Cups of Lemonade', unitCost: 200, itemCount: 10 },
    { id: 'snacks', name: 'Puff-Puff & Snack Stall', icon: '🥟', itemName: 'Snack Packs', unitCost: 200, itemCount: 10 },
    { id: 'bracelets', name: 'Beaded Bracelet Shop', icon: '📿', itemName: 'Handmade Bracelets', unitCost: 200, itemCount: 10 },
    { id: 'fruit', name: 'Juicy Fruit Cups Bar', icon: '🍉', itemName: 'Fruit Cups', unitCost: 200, itemCount: 10 }
  ];

  const [selectedBiz, setSelectedBiz] = useState<BusinessOption | null>(null);
  const [sellingPrice, setSellingPrice] = useState<number>(300);
  const [stage, setStage] = useState<'pick_business' | 'set_price' | 'simulating' | 'results' | 'reinvest'>('pick_business');
  const [customerReactions, setCustomerReactions] = useState<{ emoji: string; text: string; bought: boolean }[]>([]);
  const [itemsSold, setItemsSold] = useState<number>(0);
  const [reinvestChoice, setReinvestChoice] = useState<'save' | 'spend' | 'reinvest' | null>(null);

  const priceOptions = [150, 250, 300, 500, 800];

  const handleSelectBiz = (biz: BusinessOption) => {
    setSelectedBiz(biz);
    setSellingPrice(300);
    setStage('set_price');
  };

  const startDaySimulation = () => {
    if (!selectedBiz) return;
    setStage('simulating');

    let buyersCount = 0;
    const reactions: { emoji: string; text: string; bought: boolean }[] = [];

    for (let i = 0; i < selectedBiz.itemCount; i++) {
      let bought = false;
      let text = '';
      let emoji = '🙂';

      if (sellingPrice === 150) {
        bought = true;
        text = 'Super cheap! What a bargain!';
        emoji = '🤩';
      } else if (sellingPrice === 250) {
        bought = Math.random() > 0.1;
        text = bought ? 'Great price! I love it!' : 'Maybe next time!';
        emoji = bought ? '😊' : '🤔';
      } else if (sellingPrice === 300) {
        bought = Math.random() > 0.15;
        text = bought ? 'Fair price and looks delicious!' : 'Just looking today!';
        emoji = bought ? '😋' : '👋';
      } else if (sellingPrice === 500) {
        bought = Math.random() > 0.6;
        text = bought ? 'A bit pricey, but I will try one!' : 'Too expensive for me!';
        emoji = bought ? '💸' : '😬';
      } else {
        bought = Math.random() > 0.85;
        text = 'Way too high! ₦800 is unreasonable!';
        emoji = '🙅';
      }

      if (bought) buyersCount++;
      reactions.push({ emoji, text, bought });
    }

    setCustomerReactions(reactions);
    setItemsSold(buyersCount);

    setTimeout(() => {
      setStage('results');
      confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
    }, 2000);
  };

  const totalCost = selectedBiz ? selectedBiz.unitCost * selectedBiz.itemCount : 0;
  const totalRevenue = itemsSold * sellingPrice;
  const profit = totalRevenue - totalCost;

  const handleReinvestDecision = (choice: 'save' | 'spend' | 'reinvest') => {
    setReinvestChoice(choice);
    setTimeout(() => {
      onComplete(60, 150, profit, "Profit Pro");
      onClose();
    }, 1500);
  };

  return (
    <div className="bg-white border-4 border-amber-300 rounded-[2.5rem] p-6 sm:p-9 text-slate-800 max-w-4xl mx-auto shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center text-3xl shadow-lg border-2 border-white">
            🏪
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-700 font-black">
              World 5 &bull; My Little Business
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {stage === 'pick_business' ? 'Choose Your Business' : selectedBiz?.name}
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

      {/* STEP 1: PICK BUSINESS */}
      {stage === 'pick_business' && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Which business would you like to launch today?
            </h3>
            <p className="text-slate-600 text-sm font-medium max-w-lg mx-auto">
              Learn how buying stock, setting prices, and calculating profit makes a business thrive!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {businesses.map((biz) => (
              <div
                key={biz.id}
                onClick={() => handleSelectBiz(biz)}
                className="bg-slate-50 hover:bg-amber-50/60 border-3 border-slate-200 hover:border-amber-400 p-5 rounded-3xl cursor-pointer transition-all hover:scale-102 flex items-center gap-4 group shadow-sm"
              >
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform shadow-xs border border-slate-200">
                  {biz.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 text-base">{biz.name}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    10 {biz.itemName} @ ₦{biz.unitCost} cost each
                  </p>
                  <div className="text-xs font-black text-amber-600 mt-2">
                    Total Startup Cost: ₦{(biz.unitCost * biz.itemCount).toLocaleString()}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-amber-100 group-hover:bg-amber-500 text-amber-800 group-hover:text-white flex items-center justify-center font-black text-base transition-colors shadow-xs">
                  &rarr;
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: SET SELLING PRICE */}
      {stage === 'set_price' && selectedBiz && (
        <div className="max-w-2xl mx-auto">
          {/* Inventory Cost Recap */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <span className="text-4xl">{selectedBiz.icon}</span>
              <div>
                <div className="font-black text-slate-900 text-lg">{selectedBiz.name}</div>
                <div className="text-xs text-slate-500 font-medium">
                  Bought {selectedBiz.itemCount} {selectedBiz.itemName} at ₦{selectedBiz.unitCost} each
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase font-black tracking-wider text-rose-600">Total Spent</div>
              <div className="text-2xl font-black text-slate-900">₦{totalCost.toLocaleString()}</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Choose Your Selling Price
            </h3>
            <p className="text-slate-600 text-sm font-medium">
              If you set it too high, fewer customers buy. If too low, you make less profit!
            </p>
          </div>

          {/* Price Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
            {priceOptions.map((p) => {
              const isSelected = sellingPrice === p;
              const unitProfit = p - selectedBiz.unitCost;
              return (
                <div
                  key={p}
                  onClick={() => setSellingPrice(p)}
                  className={`
                    p-4 rounded-3xl border-3 cursor-pointer text-center transition-all
                    ${isSelected
                      ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/40 scale-105 shadow-md'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="text-xs font-bold text-slate-500 mb-1">Sell For</div>
                  <div className="text-xl font-black text-slate-900">₦{p}</div>
                  <div className={`text-[10px] font-black uppercase mt-1 ${
                    unitProfit < 0 ? 'text-rose-600' : unitProfit > 0 ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {unitProfit < 0 ? 'Loss!' : `+₦${unitProfit} gain`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch Day Button */}
          <button
            onClick={startDaySimulation}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-[0_4px_0_#d97706] hover:shadow-[0_6px_0_#d97706] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Open Stall & Serve Customers! <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 3: SIMULATING CUSTOMERS */}
      {stage === 'simulating' && (
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="text-7xl mb-4 animate-bounce">🏪</div>
          <h3 className="text-3xl font-black text-slate-900 mb-2">
            Customers are arriving at your stall...
          </h3>
          <p className="text-amber-700 text-sm font-semibold">
            Selling at ₦{sellingPrice} per item. Let&apos;s see how many buy!
          </p>
        </div>
      )}

      {/* STEP 4: VISUAL CONTAINERS (MONEY IN / MONEY SPENT / MONEY LEFT) */}
      {stage === 'results' && selectedBiz && (
        <div className="max-w-2xl mx-auto animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase mb-2 border border-emerald-300">
              <Sparkles size={14} className="text-amber-500" /> End of Day Financial Report
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              You sold {itemsSold} out of {selectedBiz.itemCount} items!
            </h3>
          </div>

          {/* The Exact Visual Containers Requested in Prompt */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* 1. MONEY IN */}
            <div className="bg-emerald-50 border-3 border-emerald-400 p-5 rounded-3xl text-center shadow-md">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800 mb-1 flex items-center justify-center gap-1">
                📥 MONEY IN
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                ₦{totalRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold">
                {itemsSold} sold &times; ₦{sellingPrice}
              </div>
            </div>

            {/* 2. MONEY SPENT */}
            <div className="bg-rose-50 border-3 border-rose-300 p-5 rounded-3xl text-center shadow-md">
              <div className="text-xs font-black uppercase tracking-wider text-rose-700 mb-1 flex items-center justify-center gap-1">
                📤 MONEY SPENT
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1">
                ₦{totalCost.toLocaleString()}
              </div>
              <div className="text-[10px] text-rose-600 font-bold">
                {selectedBiz.itemCount} stock &times; ₦{selectedBiz.unitCost}
              </div>
            </div>

            {/* 3. MONEY LEFT (PROFIT) */}
            <div className={`p-5 rounded-3xl text-center shadow-xl border-4 ${
              profit >= 0
                ? 'bg-amber-50 border-amber-400 ring-4 ring-amber-300/40'
                : 'bg-rose-50 border-rose-400'
            }`}>
              <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1 flex items-center justify-center gap-1">
                💰 MONEY LEFT
              </div>
              <div className={`text-2xl sm:text-3xl font-black my-1 ${
                profit >= 0 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {profit >= 0 ? `₦${profit.toLocaleString()}` : `-₦${Math.abs(profit).toLocaleString()}`}
              </div>
              <div className="text-[10px] text-amber-800 font-black uppercase">
                {profit >= 0 ? 'Your Profit!' : 'Loss'}
              </div>
            </div>
          </div>

          {/* Educational Concept Reveal */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 mb-8 text-center font-medium">
            <div className="text-sm text-slate-700 leading-relaxed">
              {profit > 0 ? (
                <>
                  That <strong className="text-amber-600 font-black">₦{profit.toLocaleString()}</strong> left over is your <strong>PROFIT</strong>!
                  Profit is the money you keep after paying for all your materials and supplies.
                </>
              ) : profit === 0 ? (
                <>
                  You broke even! Your revenue paid for your stock, but there is no profit left over.
                </>
              ) : (
                <>
                  You made a loss because your selling price was lower than what it cost to make the items!
                </>
              )}
            </div>
          </div>

          {/* Customer Sample Speech Bubbles */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 mb-8">
            <div className="text-xs uppercase font-black tracking-wider text-slate-500 mb-3 text-center">
              Customer Feedback
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {customerReactions.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium shadow-2xs">
                  <span>{c.emoji}</span>
                  <span className="text-slate-700">{c.text}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStage('reinvest')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-base uppercase tracking-wider shadow-[0_4px_0_#047857] hover:shadow-[0_6px_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Decide What To Do With Your Profit <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* STEP 5: REINVESTMENT DECISION */}
      {stage === 'reinvest' && (
        <div className="max-w-xl mx-auto text-center py-4">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 mx-auto flex items-center justify-center text-4xl mb-3 shadow-xl border-4 border-white">
            🚀
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
            The Entrepreneur&apos;s Big Decision
          </h3>
          <p className="text-slate-600 text-sm font-medium mb-6">
            <strong>Reinvesting</strong> means putting some profit back into your business to buy better equipment, bigger stock, or advertising so your business can grow!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* SPEND */}
            <div
              onClick={() => handleReinvestDecision('spend')}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-pink-50 border-3 border-slate-200 hover:border-pink-300 cursor-pointer transition-all hover:scale-105 shadow-xs"
            >
              <div className="text-4xl mb-2">🍭</div>
              <div className="font-black text-slate-900 text-sm">SPEND</div>
              <div className="text-[11px] text-slate-500 mt-1">Buy immediate treats for yourself</div>
            </div>

            {/* SAVE */}
            <div
              onClick={() => handleReinvestDecision('save')}
              className="p-5 rounded-3xl bg-slate-50 hover:bg-cyan-50 border-3 border-slate-200 hover:border-cyan-300 cursor-pointer transition-all hover:scale-105 shadow-xs"
            >
              <div className="text-4xl mb-2">🏦</div>
              <div className="font-black text-slate-900 text-sm">SAVE</div>
              <div className="text-[11px] text-slate-500 mt-1">Deposit in DolaBank for the future</div>
            </div>

            {/* REINVEST */}
            <div
              onClick={() => handleReinvestDecision('reinvest')}
              className="p-5 rounded-3xl bg-emerald-50 hover:bg-emerald-100 border-3 border-emerald-400 cursor-pointer transition-all hover:scale-105 shadow-md ring-4 ring-emerald-300/40"
            >
              <div className="text-4xl mb-2">🌱</div>
              <div className="font-black text-emerald-800 text-sm">REINVEST</div>
              <div className="text-[11px] text-emerald-900 mt-1 font-semibold">Buy cooler tools & expand shop!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
