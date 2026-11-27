'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Users, CalendarDays, Check, X, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function FacultyDashboard() {
  const { currentEmployee, batches, students, updateStudentAttendance } = useApp();

  // Faculty receives full UI management access for ASSIGNED batches only
  const assignedBatches = batches.filter((b) => b.assignedFacultyId === currentEmployee.id);
  const [selectedBatchId, setSelectedBatchId] = useState(assignedBatches[0]?.id || '');

  const activeBatch = assignedBatches.find((b) => b.id === selectedBatchId) || assignedBatches[0];
  const batchStudents = students.filter((s) => s.batchId === activeBatch?.id);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Faculty • Assigned Batches Full Access
          </span>
          <h1 className="text-2xl font-black mt-1.5">{currentEmployee.name}</h1>
          <p className="text-xs text-emerald-200 mt-1">
            Assigned cohorts, live attendance marking, upcoming sessions, student progress, and batch completion reports.
          </p>
        </div>
        <Link href="/education" className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold w-fit">
          Courses & Batches
        </Link>
      </div>

      {/* Batch Switcher */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {assignedBatches.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBatchId(b.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 ${
              b.id === activeBatch?.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {b.batchName} ({b.course})
          </button>
        ))}
      </div>

      {activeBatch && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DashboardMetricCard label="Assigned Batches" value={assignedBatches.length} subtext="Full batch UI access" icon={GraduationCap} tone="emerald" />
            <DashboardMetricCard label="Batch Students" value={activeBatch.studentCount} subtext={activeBatch.course} icon={Users} tone="blue" />
            <DashboardMetricCard label="Course Completion" value={`${Math.round((activeBatch.completedSessions / activeBatch.totalSessions) * 100)}%`} subtext={`${activeBatch.completedSessions}/${activeBatch.totalSessions} Sessions`} icon={BookOpen} tone="purple" />
            <DashboardMetricCard label="Upcoming Session" value="Today 6:30 PM" subtext={activeBatch.schedule} icon={CalendarDays} tone="amber" />
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Student Attendance & Progress — {activeBatch.batchName}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {batchStudents.map((stu) => (
                <div key={stu.id} className="py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                    <p className="text-[11px] text-slate-500">{stu.college} • {stu.id}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge label={stu.status} variant={stu.status === 'At Risk' ? 'danger' : 'success'} />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      Att: {stu.attendancePct}% • Prog: {stu.progressPct}%
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateStudentAttendance(stu.id, true)}
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        title="Mark Present"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateStudentAttendance(stu.id, false)}
                        className="p-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                        title="Mark Absent"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
