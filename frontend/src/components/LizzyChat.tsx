'use client';

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Sparkles, Lightbulb, HelpCircle, Smile, RefreshCw } from 'lucide-react';

interface LizzyChatProps {
  stage?: number | string;
  level?: number | string;
  initialOpen?: boolean;
  contextInfo?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function LizzyChat({ stage = 1, level = 1, initialOpen = false, contextInfo = '' }: LizzyChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi there! I'm Lizzy 🧚✨, your AI tutor guide!\nI'm here to help you solve Stage ${stage} ${level ? `(Level ${level})` : ''} challenges. What are we working on right now?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getLocalFallbackReply = (userText: string, stageNum: number | string, levelNum: number | string) => {
    const lower = userText.toLowerCase();
    const stg = String(stageNum);
    const lvl = String(levelNum);
    const ctxText = contextInfo ? `\n📌 **Context**: ${contextInfo}` : '';

    if (lower.includes('hint') || lower.includes('help') || lower.includes('stuck') || lower.includes('clue') || lower.includes('💡')) {
      if (stg === '1') {
        return `💡 **Lizzy's Stage 1 Hint (Level ${lvl})**:${ctxText}\nLook closely at the numbers or math pattern! Try counting out each step or breaking big numbers down. You've got this! ⭐`;
      } else if (stg === '2') {
        return `🧱 **Lizzy's Stage 2 Hint (Level ${lvl})**:${ctxText}\nCheck your Blockly workspace! Make sure your move blocks and loop counts are in order. Try running your blocks step-by-step! 🎮`;
      } else if (stg === '3') {
        return `🎨 **Lizzy's Stage 3 Hint**:${ctxText}\nIn this game builder world, check your sprite events, motion blocks, and collision triggers! Make sure all events are hooked up properly. 🚀`;
      } else if (stg === '4') {
        return `🐍 **Lizzy's Stage 4 Hint**:${ctxText}\nCheck your Python syntax carefully! Look out for missing colons, indentations, or misspelled variables. Run your code to check the terminal output for clues! 💻`;
      } else {
        return `🌟 **Lizzy's Hint**:${ctxText}\nBreak the goal down into 2 smaller steps. What is the very first thing your code or math equation needs to do?`;
      }
    }

    if (lower.includes('explain') || lower.includes('how to') || lower.includes('what') || lower.includes('🧐')) {
      return `Great question! 🧐 In Stage ${stg} (Level ${lvl}), we are building logic step-by-step.${ctxText} Try telling me what part of the puzzle feels confusing, and we'll tackle it together! 💫`;
    }

    if (lower.includes('cheer') || lower.includes('encourage') || lower.includes('thank') || lower.includes('cool') || lower.includes('awesome') || lower.includes('great') || lower.includes('⭐')) {
      return `You are doing AMAZING! 🌟 Coding and math take practice, but every attempt gets you closer to mastering it! Keep pushing forward! 🚀✨`;
    }

    return `I'm right here with you! 🧚✨ In Stage ${stg} (Level ${lvl}), try taking it one step at a time.${ctxText} Click "Give Hint 💡" or type what you're trying to solve!`;
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await axios.post(`${baseUrl}/api/chat/`, {
        messages: updatedMessages,
        stage: stage,
        level: level,
        contextInfo: contextInfo
      }, { timeout: 6000 });

      const replyContent = response.data.reply || getLocalFallbackReply(textToSend, stage, level);
      setMessages([...updatedMessages, { role: 'assistant', content: replyContent }]);
    } catch (error) {
      console.error("Lizzy Chat API Error:", error);
      const fallbackReply = getLocalFallbackReply(textToSend, stage, level);
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: fallbackReply
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] mb-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shadow-inner border border-white/40">
                  🧚✨
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-purple-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                  Lizzy <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                </h3>
                <p className="text-xs text-purple-100 font-medium">
                  AI Learning Guide • World Stage {stage} {level ? `(Lvl ${level})` : ''}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors"
              title="Minimize chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[85%] ${
                  msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-sm shrink-0 mt-0.5">
                    🧚
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md font-medium'
                      : 'bg-white text-gray-800 border border-purple-100 shadow-sm rounded-tl-none font-sans whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 self-start max-w-[85%] items-center">
                <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-300 flex items-center justify-center text-sm shrink-0">
                  🧚
                </div>
                <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2 text-purple-600 text-xs font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Lizzy is thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-purple-50/70 border-t border-purple-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleSend("Can I have a hint for this level? 💡")}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs bg-white text-purple-700 hover:bg-purple-100 rounded-full border border-purple-200 transition-all shadow-xs flex items-center gap-1 font-medium whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Give Hint 💡
            </button>
            <button
              onClick={() => handleSend("Explain how to solve this! 🧐")}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs bg-white text-indigo-700 hover:bg-indigo-100 rounded-full border border-indigo-200 transition-all shadow-xs flex items-center gap-1 font-medium whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Explain 🧐
            </button>
            <button
              onClick={() => handleSend("Encourage me! ⭐")}
              disabled={isLoading}
              className="px-2.5 py-1 text-xs bg-white text-pink-700 hover:bg-pink-100 rounded-full border border-pink-200 transition-all shadow-xs flex items-center gap-1 font-medium whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <Smile className="w-3.5 h-3.5 text-pink-500" /> Cheer ⭐
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Lizzy anything..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button (70% smaller, compact & unobtrusive) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/40 cursor-pointer"
          title="Ask Lizzy AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="text-base group-hover:rotate-12 transition-transform duration-300 inline-block">🧚</span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-purple-800 rounded-full animate-ping"></span>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-purple-800 rounded-full"></span>
          </div>

          <span className="font-extrabold text-xs tracking-tight flex items-center gap-1">
            Lizzy <Sparkles className="w-3 h-3 text-yellow-300" />
          </span>
        </button>
      )}
    </div>
  );
}
