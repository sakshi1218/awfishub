'use client';

import React, { useState } from 'react';
import { Building2, Users, CheckSquare, AlertTriangle, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DepartmentsPage() {
  const {
    employees,
    currentRole,
    currentEmployee,
    getDirectorAllowedDepartments,
    getVisibleTasksForCurrentUser,
    getPriorityConflicts,
  } = useApp();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const allowedDirectorDepts =
    currentRole === 'DIRECTOR' ? getDirectorAllowedDepartments(currentEmployee.id) : null;

  const visibleDepartments = allowedDirectorDepts
    ? PERMANENT_DEPARTMENTS.filter((d) => allowedDirectorDepts.includes(d.name))
    : PERMANENT_DEPARTMENTS;

  const visibleTasks = getVisibleTasksForCurrentUser();
  const allConflicts = getPriorityConflicts();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments, Priority Workload & Privacy"
        subtitle="Department KPIs, Critical & Priority 1 task counts, and multi-director conflict indicators."
        icon={Building2}
        badge={`${visibleDepartments.length} Authorized Units`}
      />

      {currentRole === 'DIRECTOR' && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-500 shrink-0" />
          Showing only departments assigned to <b>{currentEmployee.name}</b>. Other Directors&apos; departments and private metrics are hidden.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleDepartments.map((d) => {
          const deptEmps = employees.filter((e) => e.department === d.name);
          const deptTasks = visibleTasks.filter((t) => t.department === d.name);
          const criticalCount = deptTasks.filter((t) => t.priority === 'Critical').length;
          const p1Count = deptTasks.filter((t) => t.directorPriority === 'Priority 1').length;
          const deptConflicts = allConflicts.filter((c) => c.tasks.some((t) => t.department === d.name)).length;

          return (
            <div
              key={d.id}
              onClick={() => setSelectedDept(d.name)}
              className="cursor-pointer p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm space-y-3 text-xs"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold text-blue-600">{d.code}</span>
                <StatusBadge label={`${d.kpiRate}% KPI`} variant="success" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{d.name}</h3>
              <p className="text-slate-500 line-clamp-2">{d.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {criticalCount > 0 && <StatusBadge label={`${criticalCount} Critical`} variant="danger" />}
                {p1Count > 0 && <StatusBadge label={`${p1Count} Priority 1`} variant="purple" />}
                {deptConflicts > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600">
                    <AlertTriangle className="w-3 h-3" /> {deptConflicts} Conflict
                  </span>
                )}
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <p>Lead: <b>{d.leadName}</b></p>
                <p>Director: <b>{d.directorName}</b></p>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {deptEmps.length} Staff</span>
                  <span className="flex items-center gap-1"><CheckSquare className="w-3.5 h-3.5" /> {deptTasks.length} Tasks</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedDept} Roster & Task Load</h3>
              <button onClick={() => setSelectedDept(null)} className="text-slate-500 font-bold">Close</button>
            </div>
            {employees.filter((e) => e.department === selectedDept).map((e) => {
              const empTasks = visibleTasks.filter((t) => t.assignedToId === e.id);
              const hasConflict = allConflicts.some((c) => c.employeeId === e.id);
              return (
                <div key={e.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{e.name}</p>
                    <p className="text-[10px] text-slate-500">{e.designation} • {empTasks.length} Tasks</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasConflict && <StatusBadge label="Conflict" variant="danger" />}
                    <span className="font-mono text-blue-600">{e.permanentId}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
