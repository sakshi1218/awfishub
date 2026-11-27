'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckSquare, Calendar, Send, Bell, User, AlertTriangle, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

type EmployeeTaskFilter =
  | 'ALL'
  | 'DIR_1'
  | 'DIR_2'
  | 'DIR_3'
  | 'CRITICAL'
  | 'HIGH'
  | 'UPCOMING'
  | 'OVERDUE';

export default function StaffDashboard() {
  const {
    currentEmployee,
    tasks,
    followUps,
    notifications,
    submitDailyReport,
    updateTaskStatus,
    getPriorityConflicts,
    escalatePriorityConflict,
  } = useApp();

  const [filter, setFilter] = useState<EmployeeTaskFilter>('ALL');
  const [workDesc, setWorkDesc] = useState('');
  const [submittedMsg, setSubmittedMsg] = useState(false);

  // Employee sees ONLY tasks assigned to them (never Directors' private tasks or other employees' private tasks)
  const myAssignedTasks = tasks.filter((t) => t.assignedToId === currentEmployee.id);
  const myConflict = getPriorityConflicts().find((c) => c.employeeId === currentEmployee.id);
  const myFollowUps = followUps.filter((f) => f.ownerId === currentEmployee.id);

  const filteredTasks = myAssignedTasks.filter((t) => {
    if (filter === 'DIR_1') return t.assigningDirectorId === 'AWF-EMP-002';
    if (filter === 'DIR_2') return t.assigningDirectorId === 'AWF-EMP-003';
    if (filter === 'DIR_3') return t.assigningDirectorId === 'AWF-EMP-004';
    if (filter === 'CRITICAL') return t.priority === 'Critical';
    if (filter === 'HIGH') return t.priority === 'High';
    if (filter === 'UPCOMING') return t.dueDate >= '2026-11-25' && t.status !== 'Approved';
    if (filter === 'OVERDUE') return t.dueDate < '2026-11-25' && t.status !== 'Approved';
    return true;
  });

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDesc.trim()) return;
    submitDailyReport({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      date: '2026-11-25',
      tasksWorkedOn: myAssignedTasks.map((t) => t.title),
      tasksCompleted: [],
      tasksPending: myAssignedTasks.map((t) => t.title),
      timeSpentHours: 8,
      workDescription: workDesc,
      challengesFaced: 'None reported',
      planForTomorrow: 'Continue active deliverables',
    });
    setWorkDesc('');
    setSubmittedMsg(true);
    setTimeout(() => setSubmittedMsg(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 text-white shadow-lg shadow-purple-600/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
            Combined Employee Task Dashboard • {currentEmployee.permanentId}
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-purple-100 mt-1">
            {currentEmployee.designation} • Consolidated workload across Director 1, Director 2, and Director 3.
          </p>
        </div>
        <Link href="/my-tasks" className="px-3.5 py-2 rounded-xl bg-white text-violet-700 hover:bg-purple-50 text-xs font-bold w-fit shadow-sm">
          Full Task Workspace
        </Link>
      </div>

      {/* Priority Conflict Alert if competing urgent tasks from multiple Directors */}
      {myConflict && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              Priority Conflict Warning: {myConflict.tasks.length} competing urgent tasks assigned by multiple Directors!
            </div>
            {myConflict.escalated ? (
              <StatusBadge label="Escalated to Founder Pooja Ahire" variant="danger" />
            ) : (
              <button
                onClick={() => escalatePriorityConflict(myConflict.tasks.map((t) => t.id))}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold"
              >
                Escalate Conflict to Founder
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            {myConflict.tasks.map((t) => (
              <div key={t.id} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900">
                <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  From: <b>{t.assigningDirectorName || t.assignedByName}</b>
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.priority} • {t.directorPriority} • Due {t.dueDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="Consolidated Tasks" value={myAssignedTasks.length} subtext="Across all Directors" icon={CheckSquare} tone="blue" />
        <DashboardMetricCard label="Critical Tasks" value={myAssignedTasks.filter((t) => t.priority === 'Critical').length} subtext="Urgent deadlines" icon={AlertTriangle} tone="rose" />
        <DashboardMetricCard label="Follow-ups" value={myFollowUps.length} subtext="Scheduled" icon={Calendar} tone="amber" />
        <DashboardMetricCard label="Notifications" value={notifications.filter((n) => !n.isRead).length} subtext="Unread updates" icon={Bell} tone="indigo" />
      </div>

      {/* Combined Multi-Director Task Table + Filters */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Consolidated Multi-Director Task Queue
            </h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3" /> Priorities assigned by Directors are read-only for employees.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            {(
              [
                ['ALL', 'All Tasks'],
                ['DIR_1', 'Director 1 (Anchal)'],
                ['DIR_2', 'Director 2 (Rutuja)'],
                ['DIR_3', 'Director 3 (Shubham)'],
                ['CRITICAL', 'Critical'],
                ['HIGH', 'High Priority'],
                ['UPCOMING', 'Upcoming'],
                ['OVERDUE', 'Overdue'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  filter === id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-2.5 px-3">Task Title</th>
                <th className="py-2.5 px-3">Assigning Director</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Task Priority</th>
                <th className="py-2.5 px-3">Director Priority</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3">Progress / Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((t) => (
                <tr key={t.id}>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{t.title}</td>
                  <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    {t.assigningDirectorName || t.assignedByName}
                  </td>
                  <td className="py-3 px-3">{t.department}</td>
                  <td className="py-3 px-3">
                    <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warning' : 'info'} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge label={t.directorPriority} variant="purple" />
                  </td>
                  <td className="py-3 px-3 text-slate-500">{t.dueDate}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold">{t.progressPct}%</span> • {t.status}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {t.status !== 'Submitted' && t.status !== 'Approved' && (
                      <button
                        onClick={() => updateTaskStatus(t.id, 'Submitted', 100)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                      >
                        Submit Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Submit Daily Work Report</h3>
          <form onSubmit={handleReportSubmit} className="space-y-2.5">
            <textarea
              rows={3}
              required
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              placeholder="Work completed today, blockers, tomorrow's plan..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
            />
            {submittedMsg && <p className="text-xs text-emerald-600 font-semibold">✓ Daily report submitted!</p>}
            <button type="submit" className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit Daily Report
            </button>
          </form>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs space-y-1.5">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" /> My Profile
          </h4>
          <p>Permanent ID: <b>{currentEmployee.permanentId}</b> • Role Seat: <b>{currentEmployee.roleSeatId}</b></p>
          <p>Department: <b>{currentEmployee.department}</b> • Reporting Manager: <b>{currentEmployee.reportingManagerName}</b></p>
          <p className="text-slate-500">Email: {currentEmployee.email}</p>
        </div>
      </div>
    </div>
  );
}
