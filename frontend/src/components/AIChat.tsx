'use client';
import { useState } from 'react';
import axios from 'axios';

export default function AIChat() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([
    { role: 'assistant', content: "Hi there! I'm Lizzy 🧚✨, your AI learning tutor. Ask me anything about your code or level puzzles!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
      const response = await axios.post(`${baseUrl}/api/chat/`, {
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      });
      setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'Oops! I am having trouble connecting right now.' }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] border border-purple-200 rounded-xl shadow-lg bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white p-3 font-bold text-center text-lg shadow-md z-10 flex items-center justify-center gap-2">
        🧚✨ Lizzy AI Tutor
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${msg.role === 'user' ? 'bg-indigo-100 self-end text-indigo-900 border border-indigo-200 rounded-tr-none' : 'bg-white self-start text-gray-800 border border-gray-200 rounded-tl-none'}`}>
            <p className="text-sm font-sans whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isLoading && <div className="text-gray-400 text-sm italic p-2 self-start bg-white rounded-2xl rounded-tl-none border shadow-sm">Thinking...</div>}
      </div>
      <div className="p-3 bg-white border-t border-purple-100 flex gap-2">
        <input 
          className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask for a hint..."
        />
        <button onClick={sendMessage} disabled={isLoading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 shadow-md">
          Send
        </button>
      </div>
    </div>
  );
}
