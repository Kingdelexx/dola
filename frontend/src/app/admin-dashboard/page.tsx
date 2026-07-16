"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Rocket, LogOut, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{total_users?: number}>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!user.is_superuser) {
        router.push('/dashboard'); // Not an admin
      } else if (stats.total_users === undefined) {
        // Fetch admin stats
        const token = localStorage.getItem('token');
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin-stats/`, {
          headers: {
            'Authorization': `Token ${token}`
          }
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch stats');
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          }
          throw new Error("Response is not JSON");
        })
        .then(data => setStats(data))
        .catch(err => setError(err.message));
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !user.is_superuser) {
    return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <Rocket className="text-purple-500" size={24} />
            <span className="font-bold tracking-tight text-xl">DolaCode Admin</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-2 bg-white/10 hover:bg-red-500/80 px-4 py-2 rounded-lg font-bold transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl mb-8">
          <h1 className="text-4xl font-black mb-8 text-purple-400">Admin Dashboard</h1>
          
          {error && <div className="text-red-400 mb-4">{error}</div>}

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-700 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-blue-400" />
              </div>
              <h3 className="text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Total Registered Users</h3>
              <p className="text-5xl font-black text-white">{stats.total_users !== undefined ? stats.total_users : '...'}</p>
            </div>
            
            {/* Future stat cards can go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
