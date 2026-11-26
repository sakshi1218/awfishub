'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Users,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DirectorDashboard() {
  const {
    currentEmployee,
    getDirectorAllowedDepartments,
    getVisibleTasksForCurrentUser,
    getPriorityConflicts,
    escalatePriorityConflict,
    employees,
    dailyReports,
    updateTaskStatus,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'ALL' | 'MY_TASKS' | 'TEAM_TASKS' | 'CRITICAL' | 'OVERDUE' | 'COMPLETED'>('ALL');

  // STRICT VISIBILITY: Director only sees their own tasks & assigned team's tasks/reports
  const allowedDepts = getDirectorAllowedDepartments(currentEmployee.id);
  const myDivisionDepts = PERMANENT_DEPARTMENTS.filter((d) => allowedDepts.includes(d.name));
  const myDivisionEmployees = employees.filter(
    (e) =>
      e.id !== currentEmployee.id &&
      e.role !== 'CHAIRPERSON' &&
      e.role !== 'DIRECTOR' &&
      (allowedDepts.includes(e.department) || e.reportingDirectorId === currentEmployee.id)
  );
  const visibleTasks = getVisibleTasksForCurrentUser();

  const myTasks = visibleTasks.filter((t) => t.assignedToId === currentEmployee.id || t.assignedById === currentEmployee.id);
  const teamTasks = visibleTasks.filter((t) => t.assignedToId !== currentEmployee.id);
  const criticalTasks = visibleTasks.filter((t) => t.priority === 'Critical');
  const pendingTasks = visibleTasks.filter((t) => t.status === 'Assigned' || t.status === 'In Progress');
  const completedTasks = visibleTasks.filter((t) => t.status === 'Approved');
  const overdueTasks = visibleTasks.filter((t) => t.dueDate < '2026-11-25' && t.status !== 'Approved');

  // Scoped daily reports (team only, never other Directors)
  const myDivisionReports = dailyReports.filter((r) => allowedDepts.includes(r.department));

  // Priority conflicts involving this Director's tasks
  const myConflicts = getPriorityConflicts().filter((c) =>
    c.tasks.some((t) => t.assigningDirectorId === currentEmployee.id || allowedDepts.includes(t.department))
  );

  const displayedTasks =
    activeSection === 'MY_TASKS'
      ? myTasks
      : activeSection === 'TEAM_TASKS'
      ? teamTasks
      : activeSection === 'CRITICAL'
      ? criticalTasks
      : activeSection === 'OVERDUE'
      ? overdueTasks
      : activeSection === 'COMPLETED'
      ? completedTasks
      : visibleTasks;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-violet-700 via-pink-600 to-blue-600 text-white border border-purple-400/30 shadow-lg shadow-purple-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Isolated Director Dashboard
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-purple-100 mt-1">
            {currentEmployee.designation} • Authorized Team Scope: {allowedDepts.join(', ')}
          </p>
        </div>
        <Link href="/tasks" className="px-3.5 py-2 rounded-xl bg-white text-violet-700 hover:bg-purple-50 text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm">
          Assign Multi-Director Task <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Privacy Notice */}
      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
        <Lock className="w-4 h-4 text-purple-500 shrink-0" />
        <span>
          <b>Director Privacy Simulation:</b> You can only view your own tasks, authorized team tasks, and team daily reports. Founder&apos;s private tasks and other Directors&apos; private dashboards are hidden.
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <DashboardMetricCard label="Pending Tasks" value={pendingTasks.length} subtext="Active queue" icon={Clock} tone="blue" />
        <DashboardMetricCard label="Critical Tasks" value={criticalTasks.length} subtext="Urgent priority" icon={AlertTriangle} tone="rose" />
        <DashboardMetricCard label="Completed" value={completedTasks.length} subtext="Approved" icon={CheckSquare} tone="emerald" />
        <DashboardMetricCard label="Overdue" value={overdueTasks.length} subtext="Past deadline" icon={AlertTriangle} tone="amber" />
        <DashboardMetricCard label="My Team" value={myDivisionEmployees.length} subtext={`${myDivisionDepts.length} Depts`} icon={Users} tone="purple" />
      </div>

      {/* Priority Conflicts Involving This Director */}
      {myConflicts.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Priority Conflicts Involving Your Tasks ({myConflicts.length})
              </h3>
              <p className="text-xs text-slate-500">
                Competing urgent tasks assigned to the same employee across Directors. Escalate to the Founder for final scheduling authority.
              </p>
            </div>
          </div>

          {myConflicts.map((c) => (
            <div key={c.employeeId} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 space-y-2.5 text-xs">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  Employee: {c.employeeName} ({c.tasks.length} competing tasks)
                </span>
                {c.escalated ? (
                  <StatusBadge label="Escalated to Founder" variant="danger" />
                ) : (
                  <button
                    onClick={() => escalatePriorityConflict(c.tasks.map((t) => t.id))}
                    className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold"
                  >
                    Escalate to Founder
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {c.tasks.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Director: <b>{t.assigningDirectorName || t.assignedByName}</b>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.priority} • {t.directorPriority} • Due {t.dueDate}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Director Task Filter & List */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Director Task Management</h3>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                ['ALL', 'All Authorized'],
                ['MY_TASKS', 'My Tasks'],
                ['TEAM_TASKS', 'Assigned to My Team'],
                ['CRITICAL', 'Critical'],
                ['OVERDUE', 'Overdue'],
                ['COMPLETED', 'Completed'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  activeSection === id
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {displayedTasks.map((t) => (
            <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600">{t.id}</span>
                  <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} />
                  <StatusBadge label={t.directorPriority} variant="purple" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{t.title}</p>
                <p className="text-[11px] text-slate-500">Assignee: {t.assignedToName} ({t.department}) • Due {t.dueDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={t.status} variant={t.status === 'Approved' ? 'success' : 'info'} />
                {t.status === 'Submitted' && (
                  <button onClick={() => updateTaskStatus(t.id, 'Approved')} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Employee Workload, Team Performance & Daily Work Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Workload</h3>
          {myDivisionEmployees.map((emp) => {
            const count = visibleTasks.filter((t) => t.assignedToId === emp.id).length;
            return (
              <div key={emp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                  <p className="text-[10px] text-slate-500">{emp.department}</p>
                </div>
                <StatusBadge label={`${count} Tasks`} variant="info" />
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Performance</h3>
          {myDivisionDepts.map((d) => (
            <div key={d.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="font-bold">{d.name}</span>
                <span className="font-bold text-emerald-600">{d.kpiRate}% KPI</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${d.kpiRate}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Authorized Team Daily Reports
          </h3>
          {myDivisionReports.map((r) => (
            <div key={r.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex justify-between">
                <span className="font-bold">{r.employeeName}</span>
                <span className="text-[10px] text-slate-400">{r.timeSpentHours}h</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{r.workDescription}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
