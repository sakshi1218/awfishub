'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  TrendingUp,
  HardDrive,
  BadgeDollarSign,
  GraduationCap,
  CalendarDays,
  Megaphone,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/lib/format';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { TaskItem, TaskPriority, DirectorPriority } from '@/types';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

const PIE_COLORS = ['#7c3aed', '#ec4899', '#2563eb', '#a855f7', '#06b6d4'];

export default function ChairpersonDashboard() {
  const {
    employees,
    tasks,
    campaigns,
    crmLeads,
    batches,
    events,
    assets,
    expenseClaims,
    recurringBills,
    updateTaskStatus,
    updateExpenseClaimStatus,
    getPriorityConflicts,
    directorPriorityOrder,
    setDirectorPriorityOrder,
    founderOverridePriority,
  } = useApp();

  const [overrideTask, setOverrideTask] = useState<TaskItem | null>(null);
  const [newPriority, setNewPriority] = useState<TaskPriority>('Critical');
  const [newDirPriority, setNewDirPriority] = useState<DirectorPriority>('Priority 1');
  const [newDueDate, setNewDueDate] = useState('2026-11-28');
  const [decisionNote, setDecisionNote] = useState('');

  const activeEmployees = employees.filter((e) => e.employmentStatus === 'Active').length;
  const approvedTasks = tasks.filter((t) => t.status === 'Approved').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress').length;
  const overdueTasks = tasks.filter((t) => t.dueDate < '2026-11-25' && t.status !== 'Approved').length;
  const pendingApprovals = tasks.filter((t) => t.status === 'Submitted');
  const pendingClaims = expenseClaims.filter((c) => c.status === 'Submitted' || c.status === 'Under Review');
  const conflicts = getPriorityConflicts();

  const totalAssetValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
  const wonRevenue = crmLeads.filter((l) => l.stage === 'Won').reduce((s, l) => s + l.expectedOpportunity, 0);

  const deptChartData = PERMANENT_DEPARTMENTS.map((d) => ({
    name: d.code,
    headcount: employees.filter((e) => e.department === d.name).length,
    kpi: d.kpiRate,
  }));

  const taskStatusData = [
    { name: 'Approved', value: approvedTasks },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length },
    { name: 'Submitted', value: pendingApprovals.length },
    { name: 'Returned', value: tasks.filter((t) => t.status === 'Returned').length },
    { name: 'Assigned', value: tasks.filter((t) => t.status === 'Assigned').length },
  ];

  const directors = employees.filter((e) => e.role === 'DIRECTOR');

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTask) return;
    founderOverridePriority(
      overrideTask.id,
      newPriority,
      newDirPriority,
      newDueDate,
      decisionNote || 'Founder resolved competing Director priorities.'
    );
    setOverrideTask(null);
    setDecisionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-blue-600 text-white border border-purple-400/30 shadow-lg shadow-purple-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Founder & Chairperson Command
          </span>
          <h1 className="text-2xl font-black mt-1.5">MindLyft Enterprise Control Center</h1>
          <p className="text-xs text-purple-100 mt-1 max-w-2xl">
            Pooja Ahire — Company-wide visibility across all 3 Directors, 8 departments, employee workloads, priority conflict overrides, assets, and finance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/accounts" className="px-3.5 py-2 rounded-xl bg-white text-violet-700 hover:bg-purple-50 text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <BadgeDollarSign className="w-4 h-4" /> Finance UI
          </Link>
          <Link href="/assets" className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/30 flex items-center gap-1.5">
            <HardDrive className="w-4 h-4" /> Asset Inventory
          </Link>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <DashboardMetricCard label="Workforce" value={employees.length} subtext={`${activeEmployees} Active`} icon={Users} tone="blue" />
        <DashboardMetricCard label="Tasks Done" value={`${approvedTasks}/${tasks.length}`} subtext={`${pendingTasks} Active • ${overdueTasks} Overdue`} icon={CheckSquare} tone="emerald" />
        <DashboardMetricCard label="Priority Conflicts" value={conflicts.length} subtext="Multi-Director Competing" icon={AlertTriangle} tone="rose" />
        <DashboardMetricCard label="CRM Won" value={`₹${(wonRevenue / 100000).toFixed(1)}L`} subtext={`${crmLeads.length} Active Deals`} icon={TrendingUp} tone="indigo" />
        <DashboardMetricCard label="Batches" value={batches.length} subtext="229 Enrolled Students" icon={GraduationCap} tone="purple" />
        <DashboardMetricCard label="Asset Valuation" value={`₹${(totalAssetValue / 100000).toFixed(1)}L`} subtext={`${assets.length} Tracked Units`} icon={HardDrive} tone="amber" />
      </div>

      {/* FOUNDER PRIORITY CONFLICT RESOLUTION & OVERRIDE */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Multi-Director Task Priority Conflicts ({conflicts.length})
            </h2>
            <p className="text-xs text-slate-500">
              Competing urgent tasks assigned by different Directors to the same employee. Override priorities or configure an optional Director authority order.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Sliders className="w-4 h-4 text-slate-400" />
            <select
              value={directorPriorityOrder}
              onChange={(e) => setDirectorPriorityOrder(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
            >
              <option value="Equal Authority (Founder Resolves Conflicts)">Equal Authority (Neutral)</option>
              <option value="Director 1 > Director 2 > Director 3">Director 1 &gt; Director 2 &gt; Director 3</option>
              <option value="Director 2 > Director 1 > Director 3">Director 2 &gt; Director 1 &gt; Director 3</option>
              <option value="Director 3 > Director 2 > Director 1">Director 3 &gt; Director 2 &gt; Director 1</option>
            </select>
          </div>
        </div>

        {conflicts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active multi-director priority conflicts.</p>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.employeeId} className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      Affected Employee: {conflict.employeeName} ({conflict.employeeId})
                    </span>
                    <span className="ml-2 text-slate-500">• {conflict.tasks.length} competing tasks</span>
                  </div>
                  <StatusBadge
                    label={conflict.escalated ? 'Escalated to Founder' : 'Detected Conflict'}
                    variant={conflict.escalated ? 'danger' : 'warning'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {conflict.tasks.map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-mono text-[10px] font-bold text-blue-600">{t.id}</span>
                        <div className="flex gap-1">
                          <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'warning'} />
                          <StatusBadge label={t.directorPriority} variant="purple" />
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                      <p className="text-[11px] text-slate-500">By: <b>{t.assigningDirectorName || t.assignedByName}</b></p>
                      <p className="text-[11px] text-slate-500">Deadline: <b>{t.dueDate}</b></p>
                      <button
                        onClick={() => {
                          setOverrideTask(t);
                          setNewPriority(t.priority);
                          setNewDirPriority(t.directorPriority);
                          setNewDueDate(t.dueDate);
                        }}
                        className="w-full py-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-bold hover:opacity-90"
                      >
                        Founder Priority Override
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Team-Wise KPI Achievement (%) & Task Distribution
            </h2>
            <Link href="/workspaces" className="text-xs font-bold text-blue-600 flex items-center gap-1">
              Workspaces <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="kpi" name="KPI %" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Task Completion Analytics</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskStatusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={3}>
                  {taskStatusData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center text-[10px]">
            {taskStatusData.map((item, idx) => (
              <span key={item.name} className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                {item.name} ({item.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Director-wise Task Distribution & Performance */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Director Performance & Director-Wise Task Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {directors.map((dir, index) => {
            const dirTasks = tasks.filter((t) => t.assigningDirectorId === dir.id || t.assignedById === dir.id);
            const dirCritical = dirTasks.filter((t) => t.priority === 'Critical').length;
            return (
              <div key={dir.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Director {index + 1}: {dir.name}
                  </p>
                  <StatusBadge label="Active" variant="success" />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{dir.designation}</p>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Assigned Tasks: <b>{dirTasks.length}</b></span>
                  <span className="text-rose-600 font-bold">{dirCritical} Critical</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Approvals + Campaigns/Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pending Executive Approvals ({pendingApprovals.length + pendingClaims.length})
          </h3>
          {pendingApprovals.map((t) => (
            <div key={t.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-[11px] text-slate-500">{t.department} • {t.assignedToName}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => updateTaskStatus(t.id, 'Returned')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700">Return</button>
                <button onClick={() => updateTaskStatus(t.id, 'Approved')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white">Approve</button>
              </div>
            </div>
          ))}
          {pendingClaims.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Expense Claim: ₹{formatINR(c.amount)} ({c.claimantName})
                </p>
                <p className="text-[11px] text-slate-500">{c.description}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => updateExpenseClaimStatus(c.id, 'Rejected')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-100 text-rose-700">Reject</button>
                <button onClick={() => updateExpenseClaimStatus(c.id, 'Approved')} className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white">Approve</button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Campaigns, Events & Utility Alerts</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300"><Megaphone className="w-4 h-4" /> Campaigns</div>
              <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">{campaigns.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900">
              <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300"><CalendarDays className="w-4 h-4" /> Events</div>
              <p className="text-xl font-black mt-1 text-slate-900 dark:text-white">{events.length}</p>
            </div>
          </div>
          {recurringBills.filter((b) => b.paymentStatus !== 'Paid').map((b) => (
            <div key={b.id} className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs">
              <span className="font-semibold">{b.vendor} — ₹{formatINR(b.amount)}</span>
              <StatusBadge label={b.reminderBadge || b.paymentStatus} variant={b.paymentStatus === 'Overdue' ? 'danger' : 'warning'} />
            </div>
          ))}
        </div>
      </div>

      {/* FOUNDER PRIORITY OVERRIDE MODAL */}
      {overrideTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Founder Priority Override</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {overrideTask.id}: {overrideTask.title} ({overrideTask.assignedToName})
            </p>
            <form onSubmit={handleOverrideSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Task Urgency Priority</label>
                <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Director-Level Work Priority</label>
                <select value={newDirPriority} onChange={(e) => setNewDirPriority(e.target.value as DirectorPriority)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <option value="Priority 1">Priority 1</option>
                  <option value="Priority 2">Priority 2</option>
                  <option value="Priority 3">Priority 3</option>
                </select>
              </div>
              <div>
                <label className="font-semibold block mb-1">Final Rescheduled Deadline</label>
                <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Founder Decision Note (Recorded in History)</label>
                <textarea required rows={2} value={decisionNote} onChange={(e) => setDecisionNote(e.target.value)} placeholder="Explain scheduling decision across competing Directors..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOverrideTask(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Record Override</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
