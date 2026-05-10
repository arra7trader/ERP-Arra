'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Budget } from '@/types';

const categoryLabels: Record<string, string> = {
  talent_fee: 'Talent Fee',
  equipment: 'Equipment',
  location: 'Lokasi',
  editing: 'Editing',
  marketing: 'Marketing',
  misc: 'Lainnya',
};

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  approved: 'bg-blue-100 text-blue-800',
  spent: 'bg-green-100 text-green-800',
  over_budget: 'bg-red-100 text-red-800',
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await api.getMe();
      setUserId(user.id);
      const data = await api.getBudgetsByUser(user.id);
      setBudgets(data);
      
      // Calculate stats
      const totalPlanned = data.reduce((sum: number, b: Budget) => sum + b.plannedAmount, 0);
      const totalActual = data.reduce((sum: number, b: Budget) => sum + b.actualAmount, 0);
      const atRisk = data.filter((b: Budget) => b.aiRiskFlag).length;
      const overBudget = data.filter((b: Budget) => b.status === 'over_budget').length;
      
      setStats({ totalPlanned, totalActual, atRisk, overBudget });
    } catch (error) {
      console.error('Failed to load budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const getProgressColor = (planned: number, actual: number) => {
    const percent = (actual / planned) * 100;
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 90) return 'bg-orange-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group budgets by video
  const budgetsByVideo = budgets.reduce((acc: Record<string, Budget[]>, budget) => {
    const videoTitle = budget.video?.title || 'Unknown';
    if (!acc[videoTitle]) acc[videoTitle] = [];
    acc[videoTitle].push(budget);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RAB Module</h1>
        <p className="text-gray-600">Kelola Rencana Anggaran Biaya per proyek video</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-600">Total Rencana</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPlanned)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-600">Total Terpakai</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalActual)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-600">Sisa Budget</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPlanned - stats.totalActual)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border">
            <p className="text-sm text-gray-600">Alert</p>
            <p className="text-xl font-bold text-orange-600">{stats.atRisk + stats.overBudget} item</p>
          </div>
        </div>
      )}

      {/* Budget by Video */}
      <div className="space-y-6">
        {Object.entries(budgetsByVideo).map(([videoTitle, videoBudgets]) => {
          const totalPlanned = videoBudgets.reduce((sum, b) => sum + b.plannedAmount, 0);
          const totalActual = videoBudgets.reduce((sum, b) => sum + b.actualAmount, 0);
          const percentUsed = totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

          return (
            <div key={videoTitle} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {/* Video Header */}
              <div className="p-5 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{videoTitle}</h3>
                    <p className="text-sm text-gray-500">{videoBudgets.length} item budget</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total: {formatCurrency(totalPlanned)}</p>
                    <p className="text-sm font-medium text-gray-900">Terpakai: {formatCurrency(totalActual)} ({percentUsed}%)</p>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(totalPlanned, totalActual)} transition-all`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
              </div>

              {/* Budget Items */}
              <div className="divide-y">
                {videoBudgets.map((budget) => {
                  const itemPercent = budget.plannedAmount > 0 ? Math.round((budget.actualAmount / budget.plannedAmount) * 100) : 0;
                  return (
                    <div key={budget.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${budget.aiRiskFlag ? 'bg-orange-500' : 'bg-green-500'}`} />
                          <div>
                            <p className="font-medium text-gray-900">{budget.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {categoryLabels[budget.category] || budget.category}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[budget.status]}`}>
                                {budget.status.replace('_', ' ')}
                              </span>
                              {budget.aiRiskFlag && (
                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Risk
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Rencana: {formatCurrency(budget.plannedAmount)}</p>
                          <p className="font-medium text-gray-900">Aktual: {formatCurrency(budget.actualAmount)}</p>
                          <p className={`text-xs ${itemPercent >= 90 ? 'text-red-600' : 'text-gray-500'}`}>
                            {itemPercent}% terpakai
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada budget</h3>
          <p className="text-gray-500">Budget akan muncul setelah Anda membuat proyek video</p>
        </div>
      )}
    </div>
  );
}
