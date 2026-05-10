'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DashboardSummary, AIBriefing } from '@/types';

const statusColors: Record<string, string> = {
  ideation: 'bg-gray-100 text-gray-800',
  pre_production: 'bg-blue-100 text-blue-800',
  production: 'bg-yellow-100 text-yellow-800',
  post_production: 'bg-purple-100 text-purple-800',
  review: 'bg-orange-100 text-orange-800',
  published: 'bg-green-100 text-green-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [briefing, setBriefing] = useState<AIBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await api.getMe();
        setUserId(user.id);
        
        const [summaryData, briefingData] = await Promise.all([
          api.getDashboardSummary(user.id),
          api.getAIBriefing(user.id),
        ]);
        
        setSummary(summaryData);
        setBriefing(briefingData);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Command Center</h1>
        <p className="text-gray-600">Selamat datang di YouTube Creator ERP</p>
      </div>

      {/* AI Briefing Card */}
      {briefing && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-2">Daily Briefing dari AI</h2>
              <p className="text-white/90 mb-4">{briefing.aiInsights}</p>
              <div className="flex flex-wrap gap-2">
                {briefing.todayTasks.map((task, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {task}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Video</p>
                <p className="text-2xl font-bold text-gray-900">{summary.videoStats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{summary.videoStats.inProduction} dalam produksi</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.budgetStats.totalPlanned)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Terpakai: {formatCurrency(summary.budgetStats.totalActual)}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Talent</p>
                <p className="text-2xl font-bold text-gray-900">{summary.talentCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Database talent aktif</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kampanye</p>
                <p className="text-2xl font-bold text-gray-900">{summary.campaignStats.total}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">{summary.campaignStats.scheduled} terjadwal</p>
          </div>
        </div>
      )}

      {/* Financial Health & Alerts */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Health */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kesehatan Finansial</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="48" cy="48" r="40"
                    stroke={summary.financialHealth >= 50 ? '#10b981' : '#ef4444'}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${summary.financialHealth * 2.51} 251`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{summary.financialHealth}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sisa Budget</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(summary.budgetStats.totalPlanned - summary.budgetStats.totalActual)}
                </p>
                {summary.budgetStats.atRisk > 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    {summary.budgetStats.atRisk} item berisiko over-budget
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline Mendatang</h3>
            {summary.upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {summary.upcomingDeadlines.slice(0, 4).map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{video.title}</p>
                      <p className="text-sm text-gray-500">
                        {video.plannedEndDate && new Date(video.plannedEndDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[video.status]}`}>
                      {video.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada deadline dalam 7 hari ke depan</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Videos */}
      {summary && summary.recentVideos.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Video Terbaru</h3>
            <a href="/videos" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Lihat Semua →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Judul</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Prioritas</th>
                  <th className="pb-3 font-medium">Kategori</th>
                  <th className="pb-3 font-medium">Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {summary.recentVideos.map((video) => (
                  <tr key={video.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <a href={`/videos/${video.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {video.title}
                      </a>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[video.status]}`}>
                        {video.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[video.priority]}`}>
                        {video.priority}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">{video.category || '-'}</td>
                    <td className="py-3 text-gray-500 text-sm">
                      {new Date(video.createdAt).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
