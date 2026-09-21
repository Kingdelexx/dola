'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  ArrowLeft, RefreshCw, ShieldAlert, Sparkles,
  Users, CheckCircle2, BookOpen, FileText, Award, AlertTriangle, TrendingUp,
  Key, Copy, Check
} from 'lucide-react';

interface StudentProfile {
  points?: number;
  stage1_progress?: number;
  stage2_progress?: number;
  stage3_progress?: number;
  stage4_progress?: number;
  gender?: string;
  age?: number;
  learning_band?: string;
}

interface StudentUser {
  id: number;
  username: string;
  email: string;
  profile?: StudentProfile;
}

interface ClassroomInfo {
  id: number;
  name: string;
  grade_level?: string;
  join_code?: string;
  students_count: number;
}

interface ClassLearningProfile {
  numeracy_mastery: string;
  logical_reasoning: string;
  computational_thinking: string;
  coding_proficiency: string;
  most_common_weakness: string;
  strongest_competency: string;
}

interface TeacherMetrics {
  attendance: string;
  lesson_completion: string;
  homework: string;
  learning_profile?: ClassLearningProfile;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState<ClassroomInfo | null>(null);
  const [metrics, setMetrics] = useState<TeacherMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentUser[]>([]);
  const [strongStudents, setStrongStudents] = useState<StudentUser[]>([]);
  const [weakStudents, setWeakStudents] = useState<StudentUser[]>([]);
  const [teacherName, setTeacherName] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchTeacherData = useCallback(async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/teacher/dashboard/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setTeacherName(json.teacher?.username || 'Teacher');
        setClassroom(json.classroom);
        setMetrics(json.metrics);
        setLeaderboard(json.leaderboard || []);
        setStrongStudents(json.strong_students || []);
        setWeakStudents(json.weak_students || []);
      } else {
        setError('Teacher authorization required.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch teacher dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const copyJoinCode = () => {
    if (classroom?.join_code) {
      navigator.clipboard.writeText(classroom.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const cls = classroom || { name: 'No Classroom Assigned', grade_level: 'N/A', join_code: 'P5A7KD', students_count: 0 };
  const met = metrics || { attendance: '0% (0 Present)', lesson_completion: '0%', homework: '0%' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              👩‍🏫
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-white flex items-center gap-1.5">
                Teacher Portal <Sparkles className="w-4 h-4 text-emerald-400" />
              </h1>
              <p className="text-xs text-slate-400 font-medium">Welcome back, {teacherName}!</p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchTeacherData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-3 font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> {error}
          </div>
        )}

        {/* Hero Class Banner with Class Join Code */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30">
              Assigned Classroom
            </span>
            <h2 className="text-4xl font-black text-white">{cls.name}</h2>
            <p className="text-slate-300 text-sm font-medium">
              You are viewing student performance for <strong className="text-emerald-300">{cls.name}</strong> ({cls.students_count} Students).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Student Class Join Code Card */}
            {cls.join_code && (
              <div className="bg-amber-950/80 p-4 rounded-2xl border border-amber-500/40 flex items-center gap-3">
                <Key className="w-7 h-7 text-amber-400" />
                <div>
                  <p className="text-[10px] uppercase font-black text-amber-300">Student Class Join Code</p>
                  <p className="text-2xl font-mono font-black text-amber-200 tracking-wider">{cls.join_code}</p>
                </div>
                <button
                  onClick={copyJoinCode}
                  className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30">
              <Users className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-[10px] uppercase font-black text-slate-400">Class Roster</p>
                <p className="text-2xl font-black text-white">{cls.students_count} Students</p>
              </div>
            </div>
          </div>
        </div>

        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Today's Attendance */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase text-emerald-400/80 tracking-wider">Daily Roll</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Today&apos;s Attendance</p>
              <p className="text-2xl font-black text-white">{met.attendance}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[96%]" />
            </div>
          </div>

          {/* Lesson Completion */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between text-indigo-400">
              <BookOpen className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase text-indigo-400/80 tracking-wider">Curriculum</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Lesson Completion</p>
              <p className="text-2xl font-black text-white">{met.lesson_completion}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[84%]" />
            </div>
          </div>

          {/* Homework */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all shadow-lg">
            <div className="flex items-center justify-between text-purple-400">
              <FileText className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase text-purple-400/80 tracking-wider">Assignments</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Homework Submitted</p>
              <p className="text-2xl font-black text-white">{met.homework}</p>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Class Skill Competencies aggregates */}
        {met.learning_profile && (
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" /> Class Skill Competencies
                </h3>
                <p className="text-xs text-slate-400">Average competency levels across all active student profiles</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  Strongest Area: {met.learning_profile.strongest_competency} 🚀
                </span>
                <span className="px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/20 text-rose-300 text-[11px] font-bold">
                  Focus Area: {met.learning_profile.most_common_weakness} 💡
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Numeracy Mastery</span>
                  <span className="text-emerald-400">{met.learning_profile.numeracy_mastery}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                    style={{ width: met.learning_profile.numeracy_mastery }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Stage 1 basic and advanced math concepts</p>
              </div>

              <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Logical Reasoning</span>
                  <span className="text-indigo-400">{met.learning_profile.logical_reasoning}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-400 h-full rounded-full"
                    style={{ width: met.learning_profile.logical_reasoning }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Pattern sequencing and logic deduction</p>
              </div>

              <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Computational Thinking</span>
                  <span className="text-purple-400">{met.learning_profile.computational_thinking}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-400 h-full rounded-full"
                    style={{ width: met.learning_profile.computational_thinking }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Algorithmic planning & decomposition</p>
              </div>

              <div className="space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Coding Proficiency</span>
                  <span className="text-sky-400">{met.learning_profile.coding_proficiency}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-blue-400 h-full rounded-full"
                    style={{ width: met.learning_profile.coding_proficiency }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500">Blockly & Python coding stages</p>
              </div>
            </div>
          </div>
        )}

        {/* Grid: Left Column Leaderboard | Right Column Weak vs Strong */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Class Leaderboard */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Class Leaderboard ({cls.name})
                </h3>
                <p className="text-xs text-slate-400">Student rankings by total stars & stage achievements</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-500/30">
                Top Performers ⭐
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-black">
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Stage Progress</th>
                    <th className="py-3 px-4 text-right">Stars Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {leaderboard.length > 0 ? (
                    leaderboard.map((st, idx) => (
                      <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-black">
                          {idx === 0 && <span className="text-lg">🥇</span>}
                          {idx === 1 && <span className="text-lg">🥈</span>}
                          {idx === 2 && <span className="text-lg">🥉</span>}
                          {idx > 2 && <span className="text-slate-400">#{idx + 1}</span>}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          {st.username}
                          {st.profile?.gender === 'girl' && <span className="ml-1.5 text-pink-400 text-[10px]">👧</span>}
                          {st.profile?.gender === 'boy' && <span className="ml-1.5 text-sky-400 text-[10px]">👦</span>}
                        </td>
                        <td className="py-3.5 px-4 space-x-1.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            M:{st.profile?.stage1_progress || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            B:{st.profile?.stage2_progress || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            E:{st.profile?.stage3_progress || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                            P:{st.profile?.stage4_progress || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-amber-400 text-sm">
                          {st.profile?.points || 0} ⭐
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                        No students found in this class yet. Ask students to join with code: <strong className="text-amber-300">{cls.join_code}</strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Weak Students vs Strong Students */}
          <div className="space-y-6">
            
            {/* Weak Students */}
            <div className="rounded-3xl bg-slate-900/80 border border-amber-500/30 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Weak Students (Needs Focus)
              </div>
              <p className="text-xs text-slate-400">
                Students requiring extra guidance or Lizzy AI tutor support in Math & Coding basics.
              </p>

              <div className="space-y-2.5">
                {weakStudents.length > 0 ? (
                  weakStudents.map((st) => (
                    <div key={st.id} className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-200 text-xs">{st.username}</p>
                        <p className="text-[10px] text-amber-400/80">Stage 1 Level: {st.profile?.stage1_progress || 0}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                        Target Help
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">All students are progressing well!</p>
                )}
              </div>
            </div>

            {/* Strong Students */}
            <div className="rounded-3xl bg-slate-900/80 border border-emerald-500/30 p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-lg">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Strong Students (Star Achievers)
              </div>
              <p className="text-xs text-slate-400">
                High-achieving students excelling across all 4 DolaCode stages.
              </p>

              <div className="space-y-2.5">
                {strongStudents.length > 0 ? (
                  strongStudents.map((st) => (
                    <div key={st.id} className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-200 text-xs">{st.username}</p>
                        <p className="text-[10px] text-emerald-400/80">Points: {st.profile?.points || 0} ⭐</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                        Advanced
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No strong student data yet.</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
