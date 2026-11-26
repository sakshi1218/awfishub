'use client';

import React from 'react';
import Link from 'next/link';
import { Users, CheckSquare, Clock, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function TeamLeadDashboard() {
  const { currentEmployee, employees, tasks, followUps, dailyReports, updateTaskStatus } = useApp();

  const teamMembers = employees.filter(
    (e) => e.department === currentEmployee.department || e.reportingManagerId === currentEmployee.id
  );
  const teamTasks = tasks.filter((t) => t.department === currentEmployee.department);
  const pendingTasks = teamTasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress');
  const completedTasks = teamTasks.filter((t) => t.status === 'Approved');
  const overdueTasks = teamTasks.filter((t) => t.dueDate < '2026-11-25' && t.status !== 'Approved');
  const teamFollowUps = followUps.filter((f) => f.department === currentEmployee.department);
  const teamReports = dailyReports.filter((r) => r.department === currentEmployee.department);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Team Lead • {currentEmployee.department}
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-blue-200 mt-1">
            Team task execution, employee workload balancing, follow-ups, and daily work report reviews.
          </p>
        </div>
        <Link href="/tasks" className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold w-fit">
          Open Task Kanban
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="Team Members" value={teamMembers.length} subtext={currentEmployee.department} icon={Users} tone="blue" />
        <DashboardMetricCard label="Active / Pending" value={pendingTasks.length} subtext={`${completedTasks.length} Approved`} icon={Clock} tone="indigo" />
        <DashboardMetricCard label="Overdue" value={overdueTasks.length} subtext="Follow up needed" icon={AlertTriangle} tone="rose" />
        <DashboardMetricCard label="Daily Reports" value={teamReports.length} subtext="Team submissions" icon={FileSpreadsheet} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Workload</h3>
          {teamMembers.map((m) => {
            const count = tasks.filter((t) => t.assignedToId === m.id).length;
            return (
              <div key={m.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                  <p className="text-[11px] text-slate-500">{m.designation}</p>
                </div>
                <StatusBadge label={`${count} Assigned`} variant="info" />
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Tasks & Follow-ups</h3>
          {teamTasks.map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-[11px] text-slate-500">{t.assignedToName} • Due {t.dueDate}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge label={t.status} variant={t.status === 'Approved' ? 'success' : 'warning'} />
                {t.status === 'Submitted' && (
                  <button onClick={() => updateTaskStatus(t.id, 'Approved')} className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold">
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
          {teamFollowUps.map((f) => (
            <div key={f.id} className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
              Follow-up: {f.description} ({f.date})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
