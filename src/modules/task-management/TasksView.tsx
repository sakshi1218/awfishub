'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Kanban,
  Table as TableIcon,
  Calendar,
  ArrowRightLeft,
  MessageSquare,
  X,
  Clock,
  Star,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  TaskItem,
  TaskCategory,
  TaskVisibility,
  TaskPriority,
  DirectorPriority,
  TaskLifecycleStatus,
  DepartmentType,
} from '@/types';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

const LIFECYCLE_COLUMNS: TaskLifecycleStatus[] = [
  'Assigned',
  'In Progress',
  'Submitted',
  'Approved',
  'Returned',
];

export function TasksView({ defaultMyTasks = false }: { defaultMyTasks?: boolean }) {
  const {
    tasks,
    followUps,
    employees,
    currentEmployee,
    isChairperson,
    isDirector,
    getVisibleTasksForCurrentUser,
    getPriorityConflicts,
    escalatePriorityConflict,
    founderOverridePriority,
    addTask,
    updateTaskStatus,
    transferTask,
    addTaskComment,
  } = useApp();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST' | 'TIMELINE' | 'FOLLOWUPS'>('KANBAN');
  const [taskScope, setTaskScope] = useState<
    'ALL' | 'MINE' | 'DIR_1' | 'DIR_2' | 'DIR_3' | 'CRITICAL' | 'OVERDUE' | 'HIGHLIGHTED'
  >(defaultMyTasks ? 'MINE' : 'ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [transferModalTask, setTransferModalTask] = useState<TaskItem | null>(null);
  const [transferToId, setTransferToId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [commentText, setCommentText] = useState('');

  // Founder override state inside drawer
  const [overrideMode, setOverrideMode] = useState(false);
  const [ovPriority, setOvPriority] = useState<TaskPriority>('Critical');
  const [ovDirPriority, setOvDirPriority] = useState<DirectorPriority>('Priority 1');
  const [ovDueDate, setOvDueDate] = useState('2026-11-28');
  const [ovNote, setOvNote] = useState('');

  const directors = employees.filter((e) => e.role === 'DIRECTOR' || e.role === 'CHAIRPERSON');

  // 12-Field Multi-Director Task Creation Form
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigningDirectorId: currentEmployee.role === 'DIRECTOR' ? currentEmployee.id : 'AWF-EMP-002',
    assignedToId: 'AWF-EMP-013',
    department: currentEmployee.department,
    priority: 'High' as TaskPriority,
    directorPriority: 'Priority 1' as DirectorPriority,
    startDate: '2026-11-26',
    dueDate: '2026-12-05',
    expectedCompletionDate: '2026-12-04',
    reasonForUrgency: '',
    attachmentsText: 'Task_Brief.pdf',
    category: 'Project-Based' as TaskCategory,
    visibility: 'Team' as TaskVisibility,
  });

  // Strict Role Visibility Enforcement
  const authorizedTasks = getVisibleTasksForCurrentUser();
  const visibleConflicts = getPriorityConflicts().filter((c) =>
    c.tasks.some((t) => authorizedTasks.some((at) => at.id === t.id))
  );

  const filteredTasks = authorizedTasks.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || t.department === deptFilter;
    const matchScope =
      taskScope === 'ALL' ||
      (taskScope === 'MINE' && t.assignedToId === currentEmployee.id) ||
      (taskScope === 'DIR_1' && t.assigningDirectorId === 'AWF-EMP-002') ||
      (taskScope === 'DIR_2' && t.assigningDirectorId === 'AWF-EMP-003') ||
      (taskScope === 'DIR_3' && t.assigningDirectorId === 'AWF-EMP-004') ||
      (taskScope === 'CRITICAL' && t.priority === 'Critical') ||
      (taskScope === 'OVERDUE' && t.dueDate < '2026-11-25' && t.status !== 'Approved') ||
      (taskScope === 'HIGHLIGHTED' && Boolean(t.highlighted));
    return matchSearch && matchDept && matchScope;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = employees.find((emp) => emp.id === form.assignedToId) || currentEmployee;
    const dir = employees.find((emp) => emp.id === form.assigningDirectorId) || currentEmployee;
    const dirIndex =
      dir.id === 'AWF-EMP-002'
        ? `${dir.name} (Director 1)`
        : dir.id === 'AWF-EMP-003'
        ? `${dir.name} (Director 2)`
        : dir.id === 'AWF-EMP-004'
        ? `${dir.name} (Director 3)`
        : dir.name;

    addTask({
      title: form.title,
      description: form.description,
      assignedById: dir.id,
      assignedByName: dir.name,
      assigningDirectorId: dir.id,
      assigningDirectorName: dirIndex,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      department: form.department,
      team: assignee.team,
      project: 'AWFIS Multi-Director Operations',
      category: form.category,
      visibility: form.visibility,
      priority: form.priority,
      directorPriority: form.directorPriority,
      startDate: form.startDate,
      dueDate: form.dueDate,
      expectedCompletionDate: form.expectedCompletionDate,
      reasonForUrgency: form.reasonForUrgency,
      status: 'Assigned',
      progressPct: 0,
      attachments: form.attachmentsText.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setShowCreate(false);
    setForm({ ...form, title: '', description: '', reasonForUrgency: '' });
  };

  const liveSelectedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) || selectedTask : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={defaultMyTasks ? 'My Consolidated Tasks' : 'Multi-Director Task Management Engine'}
        subtitle="Task urgency + Director-level work priority, priority conflict detection, Founder override, and strict role visibility."
        icon={CheckSquare}
        actions={
          <>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button onClick={() => setViewMode('KANBAN')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'KANBAN' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Kanban className="w-3.5 h-3.5" /> Kanban
              </button>
              <button onClick={() => setViewMode('LIST')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <TableIcon className="w-3.5 h-3.5" /> List
              </button>
              <button onClick={() => setViewMode('TIMELINE')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'TIMELINE' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Calendar className="w-3.5 h-3.5" /> Timeline
              </button>
              <button onClick={() => setViewMode('FOLLOWUPS')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'FOLLOWUPS' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                <Clock className="w-3.5 h-3.5" /> Follow-ups ({followUps.length})
              </button>
            </div>
            {(isChairperson || isDirector) && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Assign Task
              </button>
            )}
          </>
        }
      />

      {/* Priority Conflict Banner */}
      {visibleConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            {visibleConflicts.length} Multi-Director Priority Conflict(s) detected (e.g. {visibleConflicts[0].employeeName} has {visibleConflicts[0].tasks.length} competing urgent tasks).
          </div>
          {!visibleConflicts[0].escalated && (
            <button
              onClick={() => escalatePriorityConflict(visibleConflicts[0].tasks.map((t) => t.id))}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
            >
              Escalate to Founder
            </button>
          )}
        </div>
      )}

      {/* Scope Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['ALL', 'All Authorized'],
              ['MINE', 'My Tasks'],
              ['DIR_1', 'Director 1'],
              ['DIR_2', 'Director 2'],
              ['DIR_3', 'Director 3'],
              ['CRITICAL', 'Critical'],
              ['OVERDUE', 'Overdue'],
              ['HIGHLIGHTED', 'Highlighted'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTaskScope(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                taskScope === id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
            />
          </div>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <option value="ALL">All Departments</option>
            {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {LIFECYCLE_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col);
            return (
              <div key={col} className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[420px] space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{col}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800">{colTasks.length}</span>
                </div>
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => { setSelectedTask(t); setOverrideMode(false); }}
                    className="cursor-pointer p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm space-y-1.5"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-blue-600 flex items-center gap-1">
                        {t.id} {t.highlighted && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </span>
                      <StatusBadge label={t.directorPriority} variant="purple" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{t.title}</h4>
                    <p className="text-[10px] text-slate-500">To: <b>{t.assignedToName}</b></p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                      By: {t.assigningDirectorName || t.assignedByName}
                    </p>
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                      <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} />
                      <span>Due {t.dueDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Assigning Director</th>
                <th className="py-3 px-4">Assigned Employee</th>
                <th className="py-3 px-4">Task Priority</th>
                <th className="py-3 px-4">Director Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((t) => (
                <tr key={t.id} onClick={() => { setSelectedTask(t); setOverrideMode(false); }} className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{t.title}</td>
                  <td className="py-3 px-4 text-purple-600 font-semibold">{t.assigningDirectorName || t.assignedByName}</td>
                  <td className="py-3 px-4">{t.assignedToName} ({t.department})</td>
                  <td className="py-3 px-4"><StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} /></td>
                  <td className="py-3 px-4"><StatusBadge label={t.directorPriority} variant="purple" /></td>
                  <td className="py-3 px-4"><StatusBadge label={t.status} variant={t.status === 'Approved' ? 'success' : 'info'} /></td>
                  <td className="py-3 px-4 text-slate-500">{t.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {viewMode === 'TIMELINE' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          {[...filteredTasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((t) => (
            <div key={t.id} onClick={() => setSelectedTask(t)} className="cursor-pointer p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-mono font-bold text-blue-600">{t.startDate} → {t.dueDate}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{t.title}</p>
                <p className="text-[11px] text-slate-500">{t.assignedToName} • {t.assigningDirectorName || t.assignedByName}</p>
              </div>
              <div className="flex gap-1.5">
                <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} />
                <StatusBadge label={t.directorPriority} variant="purple" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOLLOW-UPS */}
      {viewMode === 'FOLLOWUPS' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {followUps.map((f) => (
            <div key={f.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{f.description}</p>
                <p className="text-[11px] text-slate-500">{f.ownerName} • {f.date} {f.reminder}</p>
              </div>
              <StatusBadge label={f.status} variant={f.status === 'Completed' ? 'success' : 'warning'} />
            </div>
          ))}
        </div>
      )}

      {/* TASK DETAILS DRAWER */}
      {liveSelectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{liveSelectedTask.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{liveSelectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{liveSelectedTask.description}</p>

            <div className="grid grid-cols-2 gap-2.5 text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div><span className="text-slate-400 block">Assigning Director</span><b>{liveSelectedTask.assigningDirectorName || liveSelectedTask.assignedByName}</b></div>
              <div><span className="text-slate-400 block">Assigned Employee</span><b>{liveSelectedTask.assignedToName}</b></div>
              <div><span className="text-slate-400 block">Task Urgency</span><b>{liveSelectedTask.priority}</b></div>
              <div><span className="text-slate-400 block">Director Work Priority</span><b>{liveSelectedTask.directorPriority}</b></div>
              <div><span className="text-slate-400 block">Deadline</span><b>{liveSelectedTask.dueDate}</b></div>
              <div><span className="text-slate-400 block">Expected Completion</span><b>{liveSelectedTask.expectedCompletionDate || liveSelectedTask.dueDate}</b></div>
            </div>

            {liveSelectedTask.reasonForUrgency && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <b>Reason for Urgency:</b> {liveSelectedTask.reasonForUrgency}
              </div>
            )}

            {/* Lifecycle Status */}
            <div className="flex flex-wrap gap-1.5">
              {LIFECYCLE_COLUMNS.map((st) => (
                <button
                  key={st}
                  onClick={() => updateTaskStatus(liveSelectedTask.id, st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    liveSelectedTask.status === st ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
              {(isChairperson || isDirector) && (
                <button
                  onClick={() => { setTransferModalTask(liveSelectedTask); setTransferToId(employees[0].id); }}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
                </button>
              )}
            </div>

            {/* Founder Override Button */}
            {isChairperson && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                {!overrideMode ? (
                  <button
                    onClick={() => {
                      setOverrideMode(true);
                      setOvPriority(liveSelectedTask.priority);
                      setOvDirPriority(liveSelectedTask.directorPriority);
                      setOvDueDate(liveSelectedTask.dueDate);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold"
                  >
                    Founder Override Priority & Schedule
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                    <p className="font-bold">Founder Priority Override</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={ovPriority} onChange={(e) => setOvPriority(e.target.value as TaskPriority)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                      </select>
                      <select value={ovDirPriority} onChange={(e) => setOvDirPriority(e.target.value as DirectorPriority)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        <option value="Priority 1">Priority 1</option><option value="Priority 2">Priority 2</option><option value="Priority 3">Priority 3</option>
                      </select>
                    </div>
                    <input type="date" value={ovDueDate} onChange={(e) => setOvDueDate(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
                    <input placeholder="Decision Note" value={ovNote} onChange={(e) => setOvNote(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setOverrideMode(false)} className="px-2.5 py-1 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          founderOverridePriority(liveSelectedTask.id, ovPriority, ovDirPriority, ovDueDate, ovNote || 'Founder override');
                          setOverrideMode(false);
                          setOvNote('');
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
                      >
                        Save Override
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Priority History */}
            {liveSelectedTask.priorityHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Priority & Assignment History</h4>
                {liveSelectedTask.priorityHistory.map((ph) => (
                  <div key={ph.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] space-y-0.5">
                    <p className="font-bold">{ph.action} — {ph.actorName} ({ph.date})</p>
                    <p className="text-slate-500">{ph.newPriority} / {ph.newDirectorPriority} • {ph.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Comments</h4>
              {liveSelectedTask.comments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <b>{c.author}</b>: {c.text}
                </div>
              ))}
              <div className="flex gap-2">
                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add comment..." className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none" />
                <button onClick={() => { if (commentText.trim()) { addTaskComment(liveSelectedTask.id, commentText); setCommentText(''); } }} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK TRANSFER MODAL */}
      {transferModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-base font-bold">Transfer Task</h3>
            <select value={transferToId} onChange={(e) => setTransferToId(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800">
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
            </select>
            <textarea rows={2} placeholder="Transfer reason..." value={transferReason} onChange={(e) => setTransferReason(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTransferModalTask(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
              <button onClick={() => { transferTask(transferModalTask.id, transferToId, transferReason || 'Rebalanced'); setTransferModalTask(null); }} className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* 12-FIELD MULTI-DIRECTOR TASK CREATION MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Multi-Director Task (12 Fields)</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <input required placeholder="1. Task Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <textarea required rows={2} placeholder="2. Task Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">3. Assigning Director</label>
                  <select value={form.assigningDirectorId} onChange={(e) => setForm({ ...form, assigningDirectorId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {directors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">4. Assigned Employee</label>
                  <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">5. Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentType })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">6. Task Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">7. Director Priority</label>
                  <select value={form.directorPriority} onChange={(e) => setForm({ ...form, directorPriority: e.target.value as DirectorPriority })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <option value="Priority 1">Priority 1</option><option value="Priority 2">Priority 2</option><option value="Priority 3">Priority 3</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="font-semibold block mb-1">8. Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full p-2 rounded-xl border bg-slate-50 dark:bg-slate-800" /></div>
                <div><label className="font-semibold block mb-1">9. Deadline</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2 rounded-xl border bg-slate-50 dark:bg-slate-800" /></div>
                <div><label className="font-semibold block mb-1">10. Expected Completion</label><input type="date" value={form.expectedCompletionDate} onChange={(e) => setForm({ ...form, expectedCompletionDate: e.target.value })} className="w-full p-2 rounded-xl border bg-slate-50 dark:bg-slate-800" /></div>
              </div>
              <input placeholder="11. Reason for Urgency" value={form.reasonForUrgency} onChange={(e) => setForm({ ...form, reasonForUrgency: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input placeholder="12. Task Attachments (comma-separated mock filenames)" value={form.attachmentsText} onChange={(e) => setForm({ ...form, attachmentsText: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
