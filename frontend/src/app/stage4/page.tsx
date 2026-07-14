'use client';
import { useState, useEffect } from 'react';
import PythonEditor from '@/components/PythonEditor';
import PyodideRunner from '@/components/PyodideRunner';
import GameCanvas from '@/components/GameCanvas';
import AIChat from '@/components/AIChat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeedbackModal from '@/components/FeedbackModal';
import { useAuth } from '@/context/AuthContext';

export default function Stage4Page() {
  const [pythonCode, setPythonCode] = useState('# Challenge: Print numbers from 1 to 10!\n\nfor i in range(1, 11):\n    print(i)\n');
  const [output, setOutput] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const { user, updateUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({})
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          updateUser(data.user);
        }
      })
      .catch(err => console.error("Error updating streak on mount:", err));
    }
  }, []);

  const handleCompleteStage = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/user/progress/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            stage: 4,
            progress: 1
          })
        });
        const data = await response.json();
        if (data.success) {
          updateUser(data.user);
        }
      } catch (err) {
        console.error("Error updating progress on backend:", err);
      }
    }
    setShowFeedbackModal(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-2 font-bold">
            &larr; Back to Dashboard
          </Link>
          <button
            onClick={handleCompleteStage}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-indigo-400"
          >
            Complete Stage & Feedback 💬
          </button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-extrabold mb-2">Stage 4: AI Co-pilot</h1>
          <p className="text-lg">Got stuck? Ask Robo-Tutor for a hint while you write Python!</p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col">
            <h2 className="text-xl font-bold text-slate-700 mb-4">Code Editor</h2>
            <PythonEditor code={pythonCode} onChange={setPythonCode} />
            <PyodideRunner code={pythonCode} onOutput={setOutput} />
            <div className="mt-8">
               <GameCanvas codeOutput={output} />
            </div>
          </div>
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-slate-700 mb-4">AI Assistant</h2>
            <AIChat />
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={4}
        part={1}
        onClose={handleFeedbackClose}
      />
    </div>
  );
}
