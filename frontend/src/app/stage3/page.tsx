'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import FeedbackModal from '@/components/FeedbackModal';
import LizzyChat from '@/components/LizzyChat';

import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import BottomPanel from './components/BottomPanel';
import VisualCanvas from './components/VisualCanvas';
import BlocklyWorkspace from './components/BlocklyWorkspace';
import JavaScriptEditor from './components/JavaScriptEditor';
import LivePreview from './components/LivePreview';

import { useAppStudioStore } from './store/useAppStudioStore';
import { Smartphone, Library, Layers, Sliders, Puzzle, Play, LayoutGrid } from 'lucide-react';

export default function Stage3Page() {
  const router = useRouter();
  const { user, updateUser, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.profile?.role === 'parent') {
        router.push('/parent-dashboard');
      }
    }
  }, [user, loading, router]);
  
  const {
    activeTab,
    setActiveTab,
    projects,
    initProjects
  } = useAppStudioStore();

  useEffect(() => {
    initProjects();
  }, [initProjects]);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // Mobile responsive view controller:
  // 'canvas' -> VisualCanvas design editor
  // 'library' -> LeftSidebar component library & screen manager
  // 'inspector' -> RightSidebar properties inspector
  // 'blocks' -> BlocklyWorkspace block programming
  // 'simulator' -> LivePreview interactive mobile simulator
  const [mobileActiveView, setMobileActiveView] = useState<'canvas' | 'library' | 'inspector' | 'blocks' | 'simulator'>('canvas');

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
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
      {/* Top Nav Header */}
      <TopNav onCompleteStage={handleCompleteStage} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT COL: LeftSidebar (Component Library / Screens / Assets) */}
        {/* Desktop: visible. Mobile: visible when mobileActiveView === 'library' */}
        <div className={`shrink-0 h-full lg:block ${mobileActiveView === 'library' ? 'block absolute inset-0 z-30 w-full' : 'hidden'}`}>
          <LeftSidebar />
        </div>

        {/* CENTER COL: VisualCanvas or BlocklyWorkspace */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${
          mobileActiveView === 'library' || mobileActiveView === 'inspector' || mobileActiveView === 'simulator'
            ? 'hidden lg:flex' 
            : 'flex'
        }`}>
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* Visual Canvas View */}
            <div className={`flex-1 h-full ${
              activeTab === 'design' && (mobileActiveView === 'canvas' || mobileActiveView === 'library' || mobileActiveView === 'inspector')
                ? 'block' 
                : (activeTab === 'design' ? 'hidden lg:block' : 'hidden')
            }`}>
              <VisualCanvas />
            </div>

            {/* Blockly Blocks View */}
            <div className={`flex-1 h-full ${
              activeTab === 'blocks' || mobileActiveView === 'blocks'
                ? 'block' 
                : 'hidden'
            }`}>
              <BlocklyWorkspace />
            </div>
          </div>

          {/* Bottom Panel Console Output */}
          <div className="hidden lg:block">
            <BottomPanel />
          </div>
        </div>

        {/* RIGHT COL: Inspector (RightSidebar) or Simulator (LivePreview) */}
        <div className={`shrink-0 h-full lg:block ${
          mobileActiveView === 'inspector' || mobileActiveView === 'simulator' ? 'block absolute inset-0 z-30 w-full lg:static lg:z-auto lg:w-auto' : 'hidden'
        }`}>
          {activeTab === 'design' && mobileActiveView !== 'simulator' ? (
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
      <div className="lg:hidden h-14 bg-slate-900 border-t border-slate-800 flex items-center justify-around text-slate-400 shrink-0 z-40 px-1">
        <button
          onClick={() => {
            setActiveTab('design');
            setMobileActiveView('canvas');
          }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${
            mobileActiveView === 'canvas' && activeTab === 'design' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <LayoutGrid size={17} />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setMobileActiveView('library')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${
            mobileActiveView === 'library' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Library size={17} />
          <span>Library</span>
        </button>

        <button
          onClick={() => setMobileActiveView('inspector')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${
            mobileActiveView === 'inspector' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Sliders size={17} />
          <span>Inspector</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('blocks');
            setMobileActiveView('blocks');
          }}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${
            mobileActiveView === 'blocks' || activeTab === 'blocks' ? 'text-indigo-400 font-extrabold' : ''
          }`}
        >
          <Puzzle size={17} />
          <span>Blocks</span>
        </button>

        <button
          onClick={() => setMobileActiveView('simulator')}
          className={`flex flex-col items-center gap-0.5 text-[9px] font-black uppercase tracking-wider ${
            mobileActiveView === 'simulator' ? 'text-emerald-400 font-extrabold' : ''
          }`}
        >
          <Play size={17} />
          <span>Test App</span>
        </button>
      </div>

      {/* Branded Learner Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        stage={3}
        part={1}
        onClose={handleFeedbackClose}
      />

      {/* Lizzy AI Tutor Floating Chatbox */}
      <LizzyChat stage={3} />
    </div>
  );
}
