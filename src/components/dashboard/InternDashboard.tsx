'use client';

import React, { useState } from 'react';
import { CheckSquare, BookOpen, Send, Award, UserCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function InternDashboard() {
  const { currentEmployee, tasks, submitDailyReport } = useApp();
  const [log, setLog] = useState('');
  const [saved, setSaved] = useState(false);

  const myTasks = tasks.filter((t) => t.assignedToId === currentEmployee.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!log.trim()) return;
    submitDailyReport({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      date: '2026-11-25',
      tasksWorkedOn: myTasks.map((t) => t.title),
      tasksCompleted: [],
      tasksPending: myTasks.map((t) => t.title),
      timeSpentHours: 6.5,
      workDescription: log,
      challengesFaced: 'None',
      planForTomorrow: 'Implement mentor feedback',
    });
    setLog('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-amber-950 via-teal-950 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Intern Workspace • {currentEmployee.permanentId}
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-teal-200 mt-1">
            {currentEmployee.designation} • Assigned Mentor: {currentEmployee.reportingManagerName}
          </p>
        </div>
        <StatusBadge label={currentEmployee.employmentStatus} variant="warning" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="Assigned Tasks" value={myTasks.length} subtext="Active sprint" icon={CheckSquare} tone="amber" />
        <DashboardMetricCard label="Weekly Progress" value="82%" subtext="On track for Week 24" icon={BookOpen} tone="emerald" />
        <DashboardMetricCard label="Mentor" value={currentEmployee.reportingManagerName} subtext="Technical Lead" icon={UserCheck} tone="blue" />
        <DashboardMetricCard label="Mentor Rating" value="4.8 / 5" subtext="Strong UI craftsmanship" icon={Award} tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Tasks & Mentor Feedback</h3>
          {myTasks.map((t) => (
            <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                <StatusBadge label={t.status} variant={t.status === 'Returned' ? 'danger' : 'info'} />
              </div>
              <p className="text-[11px] text-slate-500">{t.description}</p>
              {t.comments[0] && (
                <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg">
                  Mentor Feedback ({t.comments[0].author}): {t.comments[0].text}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Submit Daily Intern Progress</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              rows={4}
              required
              value={log}
              onChange={(e) => setLog(e.target.value)}
              placeholder="Summarize today's tasks, learnings, and questions for your mentor..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
            />
            {saved && <p className="text-xs text-emerald-600 font-semibold">✓ Daily intern report logged!</p>}
            <button type="submit" className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit Daily Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
