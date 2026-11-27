'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DailyReportsPage() {
  const {
    dailyReports,
    currentEmployee,
    currentRole,
    getDirectorAllowedDepartments,
    submitDailyReport,
    reviewDailyReport,
  } = useApp();

  const [showAdd, setShowAdd] = useState(false);
  const [workDesc, setWorkDesc] = useState('');
  const [challenges, setChallenges] = useState('');
  const [planTomorrow, setPlanTomorrow] = useState('');
  const [hours, setHours] = useState(8);

  const visibleReports =
    currentRole === 'DIRECTOR'
      ? dailyReports.filter((r) => getDirectorAllowedDepartments(currentEmployee.id).includes(r.department))
      : dailyReports;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDailyReport({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: currentEmployee.department,
      date: '2026-11-25',
      tasksWorkedOn: ['Daily Operational Deliverables'],
      tasksCompleted: [workDesc],
      tasksPending: [planTomorrow || 'Follow-up items'],
      timeSpentHours: hours,
      workDescription: workDesc,
      challengesFaced: challenges || 'None',
      planForTomorrow: planTomorrow || 'Continue sprint',
    });
    setShowAdd(false);
    setWorkDesc('');
    setChallenges('');
    setPlanTomorrow('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Work Reports"
        subtitle="Submit daily logs, review team activity, and approve or request updates."
        icon={FileSpreadsheet}
        badge={`${visibleReports.length} Reports`}
        actions={
          <button onClick={() => setShowAdd(true)} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Submit Today&apos;s Report
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleReports.map((r) => (
          <div key={r.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{r.employeeName}</h3>
                <p className="text-[11px] text-slate-500">{r.department} • {r.date} • {r.timeSpentHours} hrs</p>
              </div>
              <StatusBadge label={r.status} variant={r.status === 'Reviewed' ? 'success' : r.status === 'Changes Requested' ? 'danger' : 'info'} />
            </div>
            <p className="text-slate-700 dark:text-slate-300">{r.workDescription}</p>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p><b>Challenges:</b> {r.challengesFaced}</p>
              <p><b>Tomorrow:</b> {r.planForTomorrow}</p>
            </div>
            {r.status === 'Submitted' && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => reviewDailyReport(r.id, 'Changes Requested')} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">Request Changes</button>
                <button onClick={() => reviewDailyReport(r.id, 'Reviewed')} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">Mark Reviewed</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Submit Daily Work Report</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <textarea required rows={3} placeholder="Work Description" value={workDesc} onChange={(e) => setWorkDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input placeholder="Challenges Faced" value={challenges} onChange={(e) => setChallenges(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input placeholder="Plan for Tomorrow" value={planTomorrow} onChange={(e) => setPlanTomorrow(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input type="number" step="0.5" value={hours} onChange={(e) => setHours(Number(e.target.value) || 8)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
