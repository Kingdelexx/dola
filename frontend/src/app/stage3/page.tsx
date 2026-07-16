'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal from '@/components/FeedbackModal';

import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomPanel from './components/BottomPanel';
import VisualCanvas from './components/VisualCanvas';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import JavaScriptEditor from './components/JavaScriptEditor';
import LivePreview from './components/LivePreview';

import { useAppStudioStore } from './store/useAppStudioStore';
import { Smartphone, Code, Library, Layers } from 'lucide-react';

export default function Stage3Page() {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  const {
    activeTab,
    projects,
    initProjects
  } = useAppStudioStore();

  useEffect(() => {
    initProjects();
  }, [initProjects]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Mobile responsive view controller
  // 'preview' -> Canvas / LivePreview
  // 'workspace' -> BlocklyWorkspace / JavaScriptEditor
  // 'sidebar' -> LeftSidebar (Component Library / Assets / Templates)
  const [mobileActiveView, setMobileActiveView] = useState<'preview' | 'workspace' | 'sidebar'>('preview');

  // Load streak / user progress updates
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
      .then(res => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Response is not JSON");
      })
      .then(data => {
        if (data.success) {
          updateUser(data.user);
        }
      })
      .catch(err => console.error("Error updating user streak:", err));
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
            stage: 3,
            progress: 1
          })
        });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success) {
            updateUser(data.user);
          }
        } else {
          throw new Error("Response is not JSON");
        }
      } catch (err) {
        console.error("Error submitting progress to API:", err);
      }
    }
    setShowFeedbackModal(true);
  };

  const handleFeedbackClose = () => {
    setShowFeedbackModal(false);
    router.push('/dashboard');
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans select-none">
      {/* Top Nav Header */}
      <TopNav onCompleteStage={handleCompleteStage} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COL: LeftSidebar */}
        {/* Desktop: visible. Mobile: visible only if mobileActiveView === 'sidebar' */}
        <div className={`shrink-0 h-full lg:block ${mobileActiveView === 'sidebar' ? 'block absolute inset-0 z-30 w-full' : 'hidden'}`}>
          <LeftSidebar />
        </div>

        {/* CENTER COL: Workspace (Canvas / Blocks / Code) */}
        {/* On mobile, we show either workspace or canvas depending on mobileActiveView */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${
          mobileActiveView === 'sidebar' ? 'hidden lg:flex' : 'flex'
        }`}>
          {/* Main workspace frame based on activeTab */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            
            {activeTab === 'design' && (
              <div className={`flex-1 h-full ${mobileActiveView === 'preview' ? 'block' : 'hidden lg:block'}`}>
                <VisualCanvas />
              </div>
            )}

            {activeTab === 'blocks' && (
              <div className={`flex-1 h-full ${mobileActiveView === 'workspace' ? 'block' : 'hidden lg:block'}`}>
                <BlocklyWorkspace />
              </div>
            )}

            {activeTab === 'code' && (
              <div className={`flex-1 h-full ${mobileActiveView === 'workspace' ? 'block' : 'hidden lg:block'}`}>
                <JavaScriptEditor />
              </div>
            )}
          </div>

          {/* Bottom Panel Console Output (collapses on mobile workspace) */}
          <div className="hidden lg:block">
            <BottomPanel />
          </div>
        </div>

        {/* RIGHT COL: LivePreview or RightSidebar properties inspector */}
        {/* In Design mode, we show RightSidebar properties inspector. */}
        {/* In Blocks & Code modes, we show LivePreview simulator. */}
        {/* On mobile: visible only if mobileActiveView === 'preview' */}
        <div className={`shrink-0 h-full lg:block ${
          mobileActiveView === 'preview' ? 'block w-full lg:w-auto' : 'hidden'
        }`}>
          {activeTab === 'design' ? (
            <div className="h-full">
              <RightSidebar />
            </div>
          ) : (
            <div className="h-full">
              <LivePreview />
            </div>
          )}
        </div>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* Renders only on mobile devices (lg:hidden) */}
      <div className="lg:hidden h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around text-slate-400 shrink-0 z-40">
        <button
          onClick={() => setMobileActiveView('sidebar')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wider ${
            mobileActiveView === 'sidebar' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Library size={18} />
          <span>Library</span>
        </button>

        <button
          onClick={() => setMobileActiveView('preview')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wider ${
            mobileActiveView === 'preview' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Smartphone size={18} />
          <span>Simulator</span>
        </button>

        <button
          onClick={() => setMobileActiveView('workspace')}
          disabled={activeTab === 'design'}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed ${
            mobileActiveView === 'workspace' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Code size={18} />
          <span>Editor</span>
        </button>
      </div>

      {/* Branded Learner Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={3}
        part={1}
        onClose={handleFeedbackClose}
      />
    </div>
  );
}
