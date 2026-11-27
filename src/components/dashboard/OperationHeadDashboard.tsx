'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Megaphone,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function OperationHeadDashboard() {
  const { currentEmployee, tasks, dailyReports, campaigns, followUps } = useApp();

  const overdueTasks = tasks.filter((t) => t.dueDate < '2026-11-25' && t.status !== 'Approved');
  const pendingFollowUps = followUps.filter((f) => f.status !== 'Completed');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-950 via-teal-950 to-slate-900 text-white border border-teal-800/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Operation Head • 8-Department Orchestration
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-teal-200 mt-1">
            Cross-department operational progress, overdue activity tracking, daily/weekly reports, and follow-up compliance.
          </p>
        </div>
        <Link href="/events" className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold flex items-center gap-1.5 w-fit">
          Event Coordination <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="8 Departments" value={8} subtext="All operational units active" icon={Building2} tone="indigo" />
        <DashboardMetricCard label="Overdue Activities" value={overdueTasks.length} subtext="Requires escalation" icon={AlertTriangle} tone="rose" />
        <DashboardMetricCard label="Daily Reports" value={dailyReports.length} subtext="Submitted today" icon={FileSpreadsheet} tone="emerald" />
        <DashboardMetricCard label="Pending Follow-ups" value={pendingFollowUps.length} subtext="Active reminders" icon={Clock} tone="amber" />
      </div>

      {/* 8 Department Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Eight-Department Operational Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PERMANENT_DEPARTMENTS.map((d) => {
            const deptTasks = tasks.filter((t) => t.department === d.name);
            return (
              <div key={d.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{d.name}</span>
                  <StatusBadge label={`${d.kpiRate}%`} variant="success" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Lead: {d.leadName}</p>
                <p className="text-[10px] text-slate-400 mt-1">{deptTasks.length} Active Tasks</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Tracking & Pending Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Megaphone className="w-4 h-4 text-orange-500" /> Campaign Tracking
          </h3>
          {campaigns.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                <StatusBadge label={c.status} variant="info" />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Departments: {c.participatingDepartments.join(', ')}
              </p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pending Follow-ups & Alerts
          </h3>
          {pendingFollowUps.map((f) => (
            <div key={f.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{f.description}</p>
                <p className="text-[11px] text-slate-500">{f.ownerName} ({f.department}) • {f.date}</p>
              </div>
              <StatusBadge label={f.status} variant={f.status === 'Escalated' ? 'danger' : 'warning'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
