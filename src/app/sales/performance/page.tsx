'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  GraduationCap,
  FileCheck2,
  PhoneCall,
  DollarSign,
  Target,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalesPerformancePage() {
  const { currentUser, isFounder, isDirector, isSalesRole } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const res = await fetch('/api/sales/performance');
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading sales performance analytics...</p>
      </div>
    );
  }

  const { summary, stageCounts, employeePerformance, targets } = data;
  const deptTarget = targets.find((t: any) => t.departmentId) || {
    targetVisits: 30,
    achievedVisits: 22,
    targetFDPs: 6,
    achievedFDPs: 4,
    targetAgreements: 5,
    achievedAgreements: 3,
    targetRevenue: 1500000,
    achievedRevenue: 1120000,
  };

  const revenueAchievedPct = Math.min(
    100,
    Math.round((deptTarget.achievedRevenue / deptTarget.targetRevenue) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PieChart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Sales & Partnerships Performance Dashboard
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Departmental targets, conversion metrics, field visits, and sales employee leaderboard
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
            Current Month: November 2026
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total College Visits
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.totalVisits}
            </span>
            <span className="text-xs font-bold text-blue-600">Active</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            FDP Sessions Done
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {summary.totalFDPs}
            </span>
            <span className="text-xs font-bold text-purple-600">Masterclasses</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Signed MoUs & Agreements
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.totalAgreements}
            </span>
            <span className="text-xs font-bold text-emerald-600">Institutional</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Overall Win Rate
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summary.conversionRate}%
            </span>
            <span className="text-xs font-bold text-indigo-600">Conversion</span>
          </div>
        </div>
      </div>

      {/* Target vs Achievement Progress Bars */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Department Monthly Target vs Achievement
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            ₹{(deptTarget.achievedRevenue / 100000).toFixed(1)}L / ₹
            {(deptTarget.targetRevenue / 100000).toFixed(1)}L Revenue Target
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Revenue Target Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Revenue Booked
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {revenueAchievedPct}% ({deptTarget.achievedRevenue.toLocaleString()} /{' '}
                {deptTarget.targetRevenue.toLocaleString()})
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                style={{ width: `${revenueAchievedPct}%` }}
              />
            </div>
          </div>

          {/* Visits Target Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Campus Visits Target
              </span>
              <span className="font-bold text-purple-600 dark:text-purple-400">
                {Math.round((deptTarget.achievedVisits / deptTarget.targetVisits) * 100)}% (
                {deptTarget.achievedVisits} / {deptTarget.targetVisits})
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (deptTarget.achievedVisits / deptTarget.targetVisits) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Agreements Target Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                MoU Signings Target
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {Math.round((deptTarget.achievedAgreements / deptTarget.targetAgreements) * 100)}%
                ({deptTarget.achievedAgreements} / {deptTarget.targetAgreements})
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    (deptTarget.achievedAgreements / deptTarget.targetAgreements) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employee-wise Sales Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Sales Team Individual Performance Leaderboard
          </h3>
          <span className="text-xs text-slate-400">Field Activity & Conversions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Sales Executive</th>
                <th className="px-4 py-3.5">Designation</th>
                <th className="px-4 py-3.5 text-center">College Visits</th>
                <th className="px-4 py-3.5 text-center">Assigned Leads</th>
                <th className="px-4 py-3.5 text-center">Converted</th>
                <th className="px-5 py-3.5 text-right">Revenue Closed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {employeePerformance.map((emp: any) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 font-medium">{emp.designation}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-blue-600">
                    {emp.visits}
                  </td>
                  <td className="px-4 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {emp.leadsAssigned}
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600">
                    {emp.converted}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{emp.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
