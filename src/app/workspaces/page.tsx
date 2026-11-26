'use client';

import React, { useState } from 'react';
import { Layers, Users, CheckSquare, FileSpreadsheet, FileText, Bug, Lock, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { DepartmentType, TechnicalBug } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function WorkspacesPage() {
  const {
    employees,
    dailyReports,
    documents,
    counselingSessions,
    technicalBugs,
    updateBugStatus,
    batches,
    currentRole,
    currentEmployee,
    isChairperson,
    getDirectorAllowedDepartments,
    getVisibleTasksForCurrentUser,
    getPriorityConflicts,
    escalatePriorityConflict,
  } = useApp();

  const allowedDirectorDepts =
    currentRole === 'DIRECTOR' ? getDirectorAllowedDepartments(currentEmployee.id) : null;

  const visibleDepartments = allowedDirectorDepts
    ? PERMANENT_DEPARTMENTS.filter((d) => allowedDirectorDepts.includes(d.name))
    : PERMANENT_DEPARTMENTS;

  const [selectedDept, setSelectedDept] = useState<DepartmentType>(
    visibleDepartments[0]?.name || 'Media'
  );
  const [subTab, setSubTab] = useState<'OVERVIEW' | 'TASKS' | 'REPORTS' | 'TOOLS'>('OVERVIEW');

  const activeDeptName = visibleDepartments.some((d) => d.name === selectedDept)
    ? selectedDept
    : visibleDepartments[0]?.name || 'Media';

  const deptMeta = PERMANENT_DEPARTMENTS.find((d) => d.name === activeDeptName)!;
  const deptEmployees = employees.filter((e) => e.department === activeDeptName);
  const deptTasks = getVisibleTasksForCurrentUser().filter((t) => t.department === activeDeptName);
  const deptConflicts = getPriorityConflicts().filter((c) =>
    c.tasks.some((t) => t.department === activeDeptName)
  );
  const deptReports = dailyReports.filter((r) => r.department === activeDeptName);
  const deptDocs = documents.filter(
    (d) =>
      (d.classification !== 'Chairperson Confidential' || isChairperson) &&
      (d.owner === deptMeta.leadName || d.category === 'Course documents')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Workspaces"
        subtitle="Authorized department hubs with multi-director task priorities, conflict alerts, daily reports, and tools."
        icon={Layers}
        badge={deptMeta.code}
      />

      {/* Department Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleDepartments.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDept(d.name)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeDeptName === d.name
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Workspace Header Card */}
      <div className={`p-5 rounded-2xl bg-gradient-to-r ${deptMeta.color} text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <span className="text-[10px] font-bold uppercase opacity-80">{deptMeta.code} Workspace</span>
          <h2 className="text-xl font-black mt-0.5">{deptMeta.name}</h2>
          <p className="text-xs opacity-90 mt-1">{deptMeta.description}</p>
          <p className="text-[11px] opacity-85 mt-1">
            Lead: <b>{deptMeta.leadName}</b> • Supervising Director: <b>{deptMeta.directorName}</b>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {(['OVERVIEW', 'TASKS', 'REPORTS', 'TOOLS'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                subTab === t ? 'bg-white text-slate-900' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {t === 'TOOLS' ? 'Dept Tools' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {deptConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {deptConflicts.length} Multi-Director Priority Conflict(s) affecting {activeDeptName} tasks ({deptConflicts[0].employeeName}).
          </span>
          {deptConflicts[0].escalated ? (
            <StatusBadge label="Escalated to Founder" variant="danger" />
          ) : (
            <button
              onClick={() => escalatePriorityConflict(deptConflicts[0].tasks.map((t) => t.id))}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
            >
              Escalate to Founder
            </button>
          )}
        </div>
      )}

      {subTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" /> Workspace Directory ({deptEmployees.length})
            </h3>
            {deptEmployees.map((emp) => (
              <div key={emp.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                  <p className="text-[10px] text-slate-500">{emp.designation}</p>
                </div>
                <span className="font-mono text-[10px] text-blue-600">{emp.permanentId}</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" /> Shared Documents
            </h3>
            {deptDocs.map((doc) => (
              <div key={doc.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs flex justify-between items-center">
                <span className="font-semibold truncate pr-2">{doc.name}</span>
                <StatusBadge label={doc.fileType} variant="info" />
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Activity Feed</h3>
            {deptEmployees.flatMap((e) => e.activityHistory.map((a) => ({ ...a, who: e.name }))).slice(0, 5).map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{item.who}</p>
                <p className="text-[11px] text-slate-500">{item.action} • {item.date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'TASKS' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-blue-600" /> {activeDeptName} Task Board ({deptTasks.length})
          </h3>
          {deptTasks.map((t) => (
            <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-2 text-xs">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-blue-600">{t.id}</span>
                  <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} />
                  <StatusBadge label={t.directorPriority} variant="purple" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white mt-1">{t.title}</p>
                <p className="text-[11px] text-slate-500">
                  By: {t.assigningDirectorName || t.assignedByName} • To: {t.assignedToName} • Due {t.dueDate}
                </p>
              </div>
              <StatusBadge label={t.status} variant={t.status === 'Approved' ? 'success' : 'info'} />
            </div>
          ))}
        </div>
      )}

      {subTab === 'REPORTS' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Department Daily Reports ({deptReports.length})
          </h3>
          {deptReports.length === 0 ? (
            <p className="text-xs text-slate-400">No reports logged for {activeDeptName} today.</p>
          ) : (
            deptReports.map((r) => (
              <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold">{r.employeeName}</span>
                  <StatusBadge label={r.status} variant="success" />
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{r.workDescription}</p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'TOOLS' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {activeDeptName === 'Technical Team' && (
            <>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-rose-500" /> Technical Bug Tracking Lifecycle
              </h3>
              <div className="space-y-2.5">
                {technicalBugs.map((bug) => (
                  <div key={bug.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{bug.id}: {bug.title}</p>
                      <p className="text-[11px] text-slate-500">{bug.project} • Dev: {bug.assignedDeveloper} • Due {bug.deadline}</p>
                    </div>
                    <select
                      value={bug.status}
                      onChange={(e) => updateBugStatus(bug.id, e.target.value as TechnicalBug['status'])}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                    >
                      {(['Reported', 'Assigned', 'In Progress', 'Testing', 'Resolved'] as const).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeDeptName === 'Counselor' && (
            <>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-500" /> Counselor Sessions & Restricted Notes
              </h3>
              {counselingSessions.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{c.studentName} ({c.phone})</span>
                    <StatusBadge label={c.restrictedSensitiveNote ? 'Restricted Note' : c.outcome} variant={c.restrictedSensitiveNote ? 'warning' : 'success'} />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{c.guidanceNotes}</p>
                </div>
              ))}
            </>
          )}

          {activeDeptName === 'Trainer' && (
            <>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Training Batches</h3>
              {batches.map((b) => (
                <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs flex justify-between">
                  <div>
                    <p className="font-bold">{b.batchName}</p>
                    <p className="text-[11px] text-slate-500">{b.assignedFacultyName} • {b.schedule}</p>
                  </div>
                  <StatusBadge label={`${b.completedSessions}/${b.totalSessions} Sessions`} variant="info" />
                </div>
              ))}
            </>
          )}

          {activeDeptName !== 'Technical Team' && activeDeptName !== 'Counselor' && activeDeptName !== 'Trainer' && (
            <p className="text-xs text-slate-500">
              All {activeDeptName} operations, task priorities, and deliverables are synchronized with your dedicated module views.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
