'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Building2, Users, GraduationCap, Award, ShieldAlert, 
  Sparkles, ArrowLeft, Search, CheckCircle2, RefreshCw 
} from 'lucide-react';

interface SchoolItem {
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
  created_at: string;
}

export default function SuperAdminPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [data, setData] = useState<{ metrics?: Record<string, number>; schools?: SchoolItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const fetchSuperAdminStats = useCallback(async () => {
    const authToken = token || localStorage.getItem('token');
    if (!authToken) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/super-admin/dashboard/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Super Admin privileges required to view this portal.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch Super Admin metrics.');
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchSuperAdminStats();
  }, [fetchSuperAdminStats]);

  const handleApproveSchool = async (schoolId: number, status: 'APPROVED' | 'REJECTED') => {
    setApprovingId(schoolId);
    const authToken = token || localStorage.getItem('token');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/super-admin/approve-school/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ school_id: schoolId, status })
      });

      if (res.ok) {
        fetchSuperAdminStats();
      } else {
        alert('Failed to update school approval status.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApprovingId(null);
    }
  };

  const metrics = data?.metrics || {
    total_schools: 0,
    total_parents: 0,
    total_students: 0,
    total_teachers: 0,
    total_points: 0
  };

  const filteredSchools = (data?.schools || []).filter((s: SchoolItem) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
              D
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-white flex items-center gap-1.5">
                Devnaija Super Admin <Sparkles className="w-4 h-4 text-amber-400" />
              </h1>
              <p className="text-xs text-slate-400 font-medium">DolaCode Platform Oversight</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchSuperAdminStats}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <div className="px-3.5 py-1.5 rounded-full bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold">
            ⚡ Platform Owner
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-3 font-semibold">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> {error}
          </div>
        )}

        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 border border-purple-500/20 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-400/30">
              Multi-Tenant Oversight
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Devnaija Platform Command Center
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-medium">
              Review and approve pending school applications, track global student growth, and oversee DolaCode portals.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-purple-400">
              <Building2 className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-400/70">Schools</span>
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_schools}</span>
            <span className="text-xs text-slate-400 font-medium">Registered Schools</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between text-indigo-400">
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400/70">Parents</span>
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_parents}</span>
            <span className="text-xs text-slate-400 font-medium">Parent Accounts</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 hover:border-pink-500/40 transition-all">
            <div className="flex items-center justify-between text-pink-400">
              <GraduationCap className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-400/70">Students</span>
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_students}</span>
            <span className="text-xs text-slate-400 font-medium">Active Learners</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-emerald-400">
              <Users className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/70">Teachers</span>
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_teachers}</span>
            <span className="text-xs text-slate-400 font-medium">Educators & Admins</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-amber-400">
              <Award className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/70">Stars</span>
            </div>
            <span className="text-3xl font-black text-white">{metrics.total_points}</span>
            <span className="text-xs text-slate-400 font-medium">Total Stars Earned</span>
          </div>
        </div>

        {/* Registered Schools & Devnaija Approvals Table */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" /> Devnaija School Approvals & Directory
              </h3>
              <p className="text-xs text-slate-400">Review pending school registrations and grant platform approvals</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search school name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-black tracking-wider">
                  <th className="py-3 px-4">School Details</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Contact & Principal</th>
                  <th className="py-3 px-4">Pupils & Classes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Devnaija Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((s: SchoolItem) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-200 text-sm">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.address || 'No address provided'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono bg-purple-950/70 border border-purple-500/30 text-purple-300 px-2.5 py-1 rounded-md text-xs font-bold">
                          {s.code}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-semibold text-slate-300">{s.contact_person || 'N/A'} {s.phone_number ? `(${s.phone_number})` : ''}</div>
                        <div className="text-[11px] text-slate-400">{s.principal_email || s.contact_email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-semibold text-slate-300">{s.number_of_pupils ? `${s.number_of_pupils} Pupils` : 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{s.expected_classes || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {s.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" /> ✅ Approved
                          </span>
                        )}
                        {s.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 text-[11px]">
                            ⏳ Pending Approval
                          </span>
                        )}
                        {s.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/80 px-2.5 py-1 rounded-full border border-rose-500/30 text-[11px]">
                            ❌ Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {s.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleApproveSchool(s.id, 'APPROVED')}
                              disabled={approvingId === s.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {s.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleApproveSchool(s.id, 'REJECTED')}
                              disabled={approvingId === s.id}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      No schools registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
