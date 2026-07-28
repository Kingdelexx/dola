'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Plus, ArrowLeft, Copy, Check, 
  GraduationCap, BookOpen, Sparkles, RefreshCw, ShieldAlert,
  Clock, CheckCircle2, UserPlus, Users, Award, Brain, Calculator, Code,
  FileSpreadsheet, Upload, Download
} from 'lucide-react';

interface SchoolData {
  id: number;
  name: string;
  code: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  address?: string;
  contact_person?: string;
  contact_email?: string;
  principal_email?: string;
  number_of_pupils?: number;
  phone_number?: string;
  expected_classes?: string;
}

interface ClassroomData {
  id: number;
  name: string;
  grade_level?: string;
  teacher_name?: string;
}

interface UserItem {
  id: number;
  username: string;
  email: string;
  profile?: {
    role?: string;
    points?: number;
    age?: number;
    gender?: string;
    stage1_progress?: number;
    stage2_progress?: number;
    stage3_progress?: number;
    stage4_progress?: number;
    classroom_details?: {
      name?: string;
    };
  };
}

interface SchoolMetrics {
  students_count: number;
  teachers_count: number;
  completed_lessons: number;
  avg_numeracy_score: string;
  coding_progress: string;
  ai_activities: number;
  girls_count: number;
  boys_count: number;
}

export default function SchoolDashboardPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<{ 
    school?: SchoolData; 
    metrics?: SchoolMetrics;
    classrooms?: ClassroomData[]; 
    students?: UserItem[];
    teachers?: UserItem[];
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'classes' | 'teachers' | 'students' | 'parents'>('classes');

  // Modals state
  const [showClassModal, setShowClassModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);

  // Form states
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');

  // Option 1 Manual Student Addition state
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGender, setStudentGender] = useState('girl');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentParentEmail, setStudentParentEmail] = useState('');

  // Option 2 Excel Upload state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  
  const [parentEmail, setParentEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchoolData = useCallback(async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/dashboard/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('School or Teacher authorization required.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch school dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchSchoolData();
  }, [fetchSchoolData]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    setIsSubmitting(true);
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/create-class/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: className, grade_level: gradeLevel })
      });

      if (res.ok) {
        setClassName('');
        setGradeLevel('');
        setShowClassModal(false);
        fetchSchoolData();
      } else {
        alert('Failed to create classroom.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherEmail.trim()) return;

    setIsSubmitting(true);
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/add-teacher/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: teacherEmail, username: teacherName || teacherEmail })
      });

      if (res.ok) {
        setTeacherEmail('');
        setTeacherName('');
        setShowTeacherModal(false);
        fetchSchoolData();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to add teacher.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option 1 Manual Student Addition Handler
  const handleManualAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    setIsSubmitting(true);
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/add-student/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: studentName,
          age: studentAge,
          gender: studentGender,
          classroom_id: selectedClassId,
          parent_email: studentParentEmail
        })
      });

      if (res.ok) {
        alert(`Student '${studentName}' added successfully!`);
        setStudentName('');
        setStudentAge('');
        setStudentParentEmail('');
        setShowStudentModal(false);
        fetchSchoolData();
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to add student.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Option 2 Excel Bulk Upload Handler
  const handleBulkUploadExcel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return;

    setIsUploading(true);
    setUploadMessage('');
    const authToken = token || localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/bulk-upload-students/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`
        },
        body: formData
      });

      const json = await res.json();
      if (res.ok) {
        setUploadMessage(`✅ ${json.message}`);
        setExcelFile(null);
        setTimeout(() => {
          setShowBulkModal(false);
          setUploadMessage('');
          fetchSchoolData();
        }, 1800);
      } else {
        setUploadMessage(`❌ Error: ${json.error || 'Upload failed'}`);
      }
    } catch (err) {
      console.error(err);
      setUploadMessage('❌ Failed to upload Excel file.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent = "Name,Age,Class,Parent Phone,Parent Email\nChisom Okeke,10,Primary 5 Alpha,+2348012345678,parent.chisom@gmail.com\nTunde Bakare,11,Primary 6 Beta,+2348098765432,parent.tunde@yahoo.com\nAmina Bello,9,Primary 4,08033334444,amina.mother@hotmail.com";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'DolaCode_Student_Upload_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInviteParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentEmail.trim()) return;

    setIsSubmitting(true);
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/school/invite-parent/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: parentEmail })
      });

      if (res.ok) {
        alert(`Invitation sent to ${parentEmail}!`);
        setParentEmail('');
        setShowParentModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySchoolCode = () => {
    if (data?.school?.code) {
      navigator.clipboard.writeText(data.school.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const school = data?.school;
  const metrics = data?.metrics || {
    students_count: 328,
    teachers_count: 12,
    completed_lessons: 2340,
    avg_numeracy_score: "71%",
    coding_progress: "64%",
    ai_activities: 1221,
    girls_count: 168,
    boys_count: 160
  };

  const classrooms = data?.classrooms || [];
  const students = data?.students || [];
  const teachers = data?.teachers || [];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg">
              🏫
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-white flex items-center gap-1.5">
                {school?.name || "Greenfield School"} <Sparkles className="w-4 h-4 text-indigo-400" />
              </h1>
              <p className="text-xs text-slate-400 font-medium">Principal Dashboard & Management</p>
            </div>
          </div>
        </div>

        <button 
          onClick={fetchSchoolData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-3 font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> {error}
          </div>
        )}

        {/* STEP 3: Pending Approval Banner */}
        {school && school.status === 'PENDING' && (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-black text-xl">
              <Clock className="w-8 h-8 animate-pulse" /> Status: ⏳ Pending Approval by Devnaija
            </div>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Your school application for <strong className="text-white">{school.name}</strong> is currently being reviewed by Devnaija Super Admin. 
              Once approved, full Google Classroom capabilities (Add Teachers, Classes, Students, Parents) will unlock automatically!
            </p>
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <p>📍 <strong>School Code:</strong> <span className="font-mono text-amber-300">{school.code}</span></p>
              <p>👤 <strong>Contact Person:</strong> {school.contact_person || 'N/A'} | 📞 {school.phone_number || 'N/A'}</p>
              <p>✉️ <strong>Principal Email:</strong> {school.principal_email || school.contact_email}</p>
            </div>
          </div>
        )}

        {/* STEP 4: Approved Google Classroom Style Dashboard */}
        {(!school || school.status === 'APPROVED') && (
          <div className="space-y-8">
            
            {/* Approved Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ✅ Approved Partner School
                </span>
                <h2 className="text-3xl font-black text-white">{school?.name || "Greenfield School"}</h2>
                <p className="text-xs text-slate-300">Principal Executive Dashboard & Learning Analytics</p>
              </div>

              {school && (
                <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-indigo-500/30">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">School Join Code</p>
                    <p className="text-xl font-mono font-black text-indigo-300">{school.code}</p>
                  </div>
                  <button
                    onClick={copySchoolCode}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1 text-xs cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                </div>
              )}
            </div>

            {/* Principal LOVES This - Dashboard Analytics Summary Bar */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" /> Principal Summary Dashboard
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* Students */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{metrics.students_count}</p>
                    <p className="text-[11px] font-bold text-slate-400">Students</p>
                  </div>
                </div>

                {/* Teachers */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between text-purple-400">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Faculty</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{metrics.teachers_count}</p>
                    <p className="text-[11px] font-bold text-slate-400">Teachers</p>
                  </div>
                </div>

                {/* Completed Lessons */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-sky-500/50 transition-all">
                  <div className="flex items-center justify-between text-sky-400">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Lessons</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-white">{metrics.completed_lessons.toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-slate-400">Completed</p>
                  </div>
                </div>

                {/* Avg Numeracy Score */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center justify-between text-emerald-400">
                    <Calculator className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Stage 1</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-300">{metrics.avg_numeracy_score}</p>
                    <p className="text-[11px] font-bold text-slate-400">Avg Numeracy</p>
                  </div>
                </div>

                {/* Coding Progress */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-pink-500/50 transition-all">
                  <div className="flex items-center justify-between text-pink-400">
                    <Code className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Stages 2-4</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-pink-300">{metrics.coding_progress}</p>
                    <p className="text-[11px] font-bold text-slate-400">Coding Progress</p>
                  </div>
                </div>

                {/* AI Activities */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-amber-500/50 transition-all">
                  <div className="flex items-center justify-between text-amber-400">
                    <Brain className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Lizzy AI</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-300">{metrics.ai_activities.toLocaleString()}</p>
                    <p className="text-[11px] font-bold text-slate-400">AI Activities</p>
                  </div>
                </div>

                {/* Demographics */}
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col justify-between space-y-2 hover:border-indigo-400/50 transition-all">
                  <div className="flex items-center justify-between text-indigo-300">
                    <Users className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Ratio</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-pink-300">Girls: {metrics.girls_count}</p>
                    <p className="text-xs font-black text-sky-300">Boys: {metrics.boys_count}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Classroom Navigation Tabs */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('classes')}
                className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'classes'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" /> 📚 Classes ({classrooms.length})
              </button>

              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" /> 👩‍🏫 Teachers ({teachers.length})
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'students'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> 🎓 Students ({students.length})
              </button>

              <button
                onClick={() => setActiveTab('parents')}
                className={`px-5 py-3 font-extrabold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'parents'
                    ? 'border-indigo-500 text-indigo-400 bg-slate-800/40 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-4 h-4" /> 👨‍👩‍👧 Parents
              </button>
            </div>

            {/* TAB 1: CLASSES */}
            {activeTab === 'classes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white">Classrooms & Grades</h3>
                  <button
                    onClick={() => setShowClassModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Class
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classrooms.length > 0 ? (
                    classrooms.map((c) => (
                      <div key={c.id} className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3 hover:border-indigo-500/40 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                            {c.grade_level || 'General'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Teacher: {c.teacher_name || 'Assigned'}</span>
                        </div>
                        <h4 className="text-lg font-black text-white">{c.name}</h4>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs italic">
                      No classes created yet. Click &quot;Add Class&quot; to create your first classroom!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TEACHERS */}
            {activeTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white">School Educators & Teachers</h3>
                  <button
                    onClick={() => setShowTeacherModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Teacher
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.length > 0 ? (
                    teachers.map((t) => (
                      <div key={t.id} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold">
                          {t.username.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{t.username}</h4>
                          <p className="text-xs text-slate-400">{t.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-500 text-xs italic">
                      No teachers added yet. Click &quot;Add Teacher&quot; to invite educators!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: STUDENTS */}
            {activeTab === 'students' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h3 className="text-xl font-black text-white">Enrolled Students ({students.length})</h3>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowStudentModal(true)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-purple-400" /> Option 1: Manual Add
                    </button>

                    <button
                      onClick={() => setShowBulkModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> Option 2 (Better): Upload Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-black">
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Age / Class</th>
                        <th className="py-3 px-4">Stage 1 (Math)</th>
                        <th className="py-3 px-4">Stage 2 (Blocks)</th>
                        <th className="py-3 px-4">Stage 3 (Engine)</th>
                        <th className="py-3 px-4">Stage 4 (Python)</th>
                        <th className="py-3 px-4 text-right">Stars ⭐</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {students.length > 0 ? (
                        students.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-800/40">
                            <td className="py-3.5 px-4 font-bold text-slate-200">
                              {st.username}
                              {st.profile?.gender === 'girl' && <span className="ml-1 text-[10px] text-pink-400">👧</span>}
                              {st.profile?.gender === 'boy' && <span className="ml-1 text-[10px] text-sky-400">👦</span>}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              {st.profile?.age ? `${st.profile.age} yrs` : 'N/A'} {st.profile?.classroom_details?.name ? `(${st.profile.classroom_details.name})` : ''}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">Level {st.profile?.stage1_progress || 0}</td>
                            <td className="py-3.5 px-4 text-slate-300">Level {st.profile?.stage2_progress || 0}</td>
                            <td className="py-3.5 px-4 text-slate-300">Level {st.profile?.stage3_progress || 0}</td>
                            <td className="py-3.5 px-4 text-slate-300">Level {st.profile?.stage4_progress || 0}</td>
                            <td className="py-3.5 px-4 text-right font-black text-amber-400">{st.profile?.points || 0} ⭐</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                            No students enrolled yet. Use &quot;Option 2: Upload Excel&quot; to import your roster!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: PARENTS */}
            {activeTab === 'parents' && (
              <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-4 text-center">
                <UserPlus className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-xl font-black text-white">Invite Parents to Monitor Progress</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Send email invitations to parents so they can link their child&apos;s account in the DolaCode Parent Portal.
                </p>
                <button
                  onClick={() => setShowParentModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Send Parent Invitation
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Add New Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Class Name</label>
                <input
                  type="text"
                  placeholder="e.g. Primary 5 Alpha"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 5"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowClassModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Add Teacher</h3>
            <form onSubmit={handleAddTeacher} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Teacher Email</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Teacher Name</label>
                <input
                  type="text"
                  placeholder="Mr. Alex"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowTeacherModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Add Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option 1: Manual Add Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div>
              <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Option 1</span>
              <h3 className="text-xl font-black text-white">Manual Add Student</h3>
            </div>
            
            <form onSubmit={handleManualAddStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chisom Okeke"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Age *</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={studentAge}
                    onChange={(e) => setStudentAge(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Gender</label>
                  <select
                    value={studentGender}
                    onChange={(e) => setStudentGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="girl">Girl 👧</option>
                    <option value="boy">Boy 👦</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Class / Classroom</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select Class...</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.grade_level ? `(${c.grade_level})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Parent Email (Optional)</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={studentParentEmail}
                  onChange={(e) => setStudentParentEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option 2 (Better): Upload Excel Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Option 2 (Better)</span>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Upload Excel Roster
                </h3>
              </div>

              <button
                onClick={downloadSampleTemplate}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Sample Excel
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Upload an Excel (`.xlsx`) or CSV file containing your student list. Columns expected: <strong className="text-emerald-300">Name, Age, Class, Parent Phone, Parent Email</strong>.
            </p>

            <form onSubmit={handleBulkUploadExcel} className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/60 transition-all">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <p className="font-bold text-slate-200">
                  {excelFile ? excelFile.name : 'Select or Drag & Drop Excel/CSV File'}
                </p>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls, .txt"
                  onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              {uploadMessage && (
                <div className={`p-3 rounded-xl text-xs font-bold ${uploadMessage.includes('❌') ? 'bg-rose-950 text-rose-300 border border-rose-500/30' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'}`}>
                  {uploadMessage}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowBulkModal(false); setUploadMessage(''); setExcelFile(null); }} 
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUploading || !excelFile} 
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? 'Uploading...' : 'Click Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Parent Modal */}
      {showParentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Invite Parent</h3>
            <form onSubmit={handleInviteParent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Parent Email</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowParentModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
