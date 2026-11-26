'use client';

import React, { useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function AttendancePage() {
  const { employees, currentEmployee } = useApp();
  const [checkedIn, setCheckedIn] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Attendance & Check-In"
        subtitle="Daily check-in status across all 8 permanent departments (mock frontend state)."
        icon={Clock}
        actions={
          <button
            onClick={() => setCheckedIn(!checkedIn)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              checkedIn ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" /> {checkedIn ? 'Checked In (09:15 AM)' : 'Check In Now'}
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Check-In</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.map((e) => (
              <tr key={e.id}>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                  {e.name} {e.id === currentEmployee.id && <span className="text-blue-600">(You)</span>}
                </td>
                <td className="py-3 px-4">{e.department}</td>
                <td className="py-3 px-4 font-mono text-slate-500">09:15 AM IST</td>
                <td className="py-3 px-4">
                  <StatusBadge label={e.employmentStatus === 'Active' ? 'Present' : e.employmentStatus} variant="success" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
