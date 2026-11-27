'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, AlertTriangle, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  TaskItem,
  TaskPriority,
  TaskLifecycleStatus,
  Employee,
} from '@/types';
import { TeamWorkloadView } from './TeamWorkloadView';

const STATUS_TABS: {
  id: TaskLifecycleStatus;
  label: string;
  dot: string;
  activeCls: string;
  stripeCls: string;
}[] = [
  {
    id: 'Assigned',
    label: 'Assigned',
    dot: 'bg-blue-600',
    activeCls: 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500',
    stripeCls: 'border-l-blue-600',
  },
  {
    id: 'In Progress',
    label: 'Ongoing',
    dot: 'bg-amber-600',
    activeCls: 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500',
    stripeCls: 'border-l-amber-600',
  },
  {
    id: 'Submitted',
    label: 'Submitted',
    dot: 'bg-violet-600',
    activeCls: 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-500',
    stripeCls: 'border-l-violet-600',
  },
  {
    id: 'Approved',
    label: 'Approved',
    dot: 'bg-emerald-600',
    activeCls: 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500',
    stripeCls: 'border-l-emerald-600',
  },
  {
    id: 'Returned',
    label: 'Returned',
    dot: 'bg-rose-600',
    activeCls: 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500',
    stripeCls: 'border-l-rose-600',
  },
];

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function formatDueShort(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function TasksView({ defaultMyTasks = false }: { defaultMyTasks?: boolean }) {
  const {
    tasks,
    currentEmployee,
    isChairperson,
    isDirector,
    isOperationHead,
    getVisibleTasksForCurrentUser,
    getVisibleEmployees,
    addTask,
    updateTaskStatus,
    editTaskDetails,
    respondToTask,
  } = useApp();

  const canManageArea = isChairperson || isDirector || isOperationHead;
  const [activeTab, setActiveTab] = useState<'TASKS' | 'WORKLOAD'>('TASKS');
  const [activeStatus, setActiveStatus] = useState<TaskLifecycleStatus>('Assigned');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'URGENT' | 'OVERDUE'>('ALL');
  const [personFilter, setPersonFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Give a task modal (4 fields: what, who, due date, priority)
  const areaEmployees = getVisibleEmployees();
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [assignmentMode, setAssignmentMode] = useState<'Individual' | 'Collaborative'>('Individual');
  const [giveForm, setGiveForm] = useState({
    title: '',
    assignedToId: areaEmployees[0]?.id || '',
    dueDate: '2026-11-30',
    priority: 'High' as TaskPriority,
  });
  const [collaborativeAssigneeIds, setCollaborativeAssigneeIds] = useState<string[]>([]);

  // Edit task modal (for managers on open tasks not their own)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    assignedToId: '',
    dueDate: '',
    priority: 'High' as TaskPriority,
    status: 'Assigned' as TaskLifecycleStatus,
  });

  // Reason / note prompt modal (for Decline, Ask for a new date, Send back)
  const [noteModal, setNoteModal] = useState<{
    taskId: string;
    title: string;
    action: 'Reschedule Requested' | 'Declined' | 'Send back';
  } | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (areaEmployees.length > 0 && !areaEmployees.some((e) => e.id === giveForm.assignedToId)) {
      setGiveForm((prev) => ({ ...prev, assignedToId: areaEmployees[0].id }));
    }
  }, [areaEmployees, giveForm.assignedToId]);

  // Deep-link ?taskId=TSK-xxx switches to that task's status tab
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    if (taskId) {
      const match = tasks.find((t) => t.id === taskId);
      if (match) {
        setActiveTab('TASKS');
        setActiveStatus(match.status);
      }
    }
  }, [tasks]);

  // Scoped tasks from AppContext
  const scopedTasks = useMemo(() => {
    const visible = getVisibleTasksForCurrentUser();
    if (defaultMyTasks) {
      return visible.filter((t) => t.assignedToId === currentEmployee.id);
    }
    return visible;
  }, [getVisibleTasksForCurrentUser, defaultMyTasks, currentEmployee.id]);

  const isOverdue = (t: TaskItem) => t.dueDate < '2026-11-27' && t.status !== 'Approved';

  // Top plain-language summary sentence
  const summarySentence = useMemo(() => {
    const open = scopedTasks.filter((t) => t.status !== 'Approved');
    const overdueCount = open.filter(isOverdue).length;
    if (defaultMyTasks) {
      const base = `You have ${open.length} ${open.length === 1 ? 'task' : 'tasks'} to do.`;
      return overdueCount > 0
        ? `${base} ${overdueCount} ${overdueCount === 1 ? 'is' : 'are'} overdue.`
        : base;
    }
    if (isChairperson) {
      return `${scopedTasks.length} ${scopedTasks.length === 1 ? 'task' : 'tasks'} across the organization.`;
    }
    return `${scopedTasks.length} ${scopedTasks.length === 1 ? 'task' : 'tasks'} in your area.`;
  }, [scopedTasks, defaultMyTasks, isChairperson]);

  // Overload warning on Task Management (3+ open Critical or High tasks in viewer's area)
  const overloadWarning = useMemo(() => {
    if (defaultMyTasks) return null;
    const areaIds = new Set(areaEmployees.map((e) => e.id));
    const counts = new Map<string, { id: string; name: string; count: number }>();
    scopedTasks.forEach((t) => {
      if (
        t.status !== 'Approved' &&
        (t.priority === 'Critical' || t.priority === 'High') &&
        t.assignedToId &&
        areaIds.has(t.assignedToId)
      ) {
        const prev = counts.get(t.assignedToId) || { id: t.assignedToId, name: t.assignedToName, count: 0 };
        prev.count += 1;
        counts.set(t.assignedToId, prev);
      }
    });
    let top: { id: string; name: string; count: number } | null = null;
    counts.forEach((entry) => {
      if (entry.count >= 3 && (!top || entry.count > top.count)) {
        top = entry;
      }
    });
    return top as { id: string; name: string; count: number } | null;
  }, [defaultMyTasks, scopedTasks, areaEmployees]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedTasks.filter((t) => {
      if (segmentFilter === 'URGENT' && t.priority !== 'Critical' && t.priority !== 'High') return false;
      if (segmentFilter === 'OVERDUE' && !isOverdue(t)) return false;
      if (!defaultMyTasks && personFilter !== 'ALL' && t.assignedToId !== personFilter) return false;
      if (
        q &&
        !t.title.toLowerCase().includes(q) &&
        !t.assignedToName.toLowerCase().includes(q) &&
        !t.id.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [scopedTasks, segmentFilter, defaultMyTasks, personFilter, search]);

  const visibleStatusTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => t.status === activeStatus)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredTasks, activeStatus]);

  const handleGiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedIds = assignmentMode === 'Collaborative' ? collaborativeAssigneeIds : [giveForm.assignedToId];
    const assignees = selectedIds.map((id) => areaEmployees.find((emp) => emp.id === id)).filter((employee): employee is Employee => Boolean(employee));
    if (!giveForm.title.trim() || !assignees.length || (assignmentMode === 'Collaborative' && assignees.length < 2)) return;

    const collaborationId = assignmentMode === 'Collaborative' ? `COLLAB-${Date.now()}` : undefined;
    assignees.forEach((assignee) => addTask({
      title: giveForm.title.trim(),
      description: giveForm.title.trim(),
      assignedById: currentEmployee.id,
      assignedByName: currentEmployee.name,
      assigningDirectorId: isDirector ? currentEmployee.id : undefined,
      assigningDirectorName: isDirector ? currentEmployee.name : currentEmployee.name,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      assignmentMode,
      collaborationId,
      collaborationGroupName: assignmentMode === 'Collaborative' ? giveForm.title.trim() : undefined,
      collaborationMemberIds: assignmentMode === 'Collaborative' ? assignees.map((member) => member.id) : undefined,
      department: assignee.department,
      team: assignee.team,
      project: assignmentMode === 'Collaborative' ? 'Collaborative Team Tasks' : 'Team Tasks',
      category: 'Daily',
      visibility: assignmentMode === 'Collaborative' ? 'Collaborative' : 'Team',
      priority: giveForm.priority,
      directorPriority: giveForm.priority === 'Critical' ? 'Priority 1' : giveForm.priority === 'High' ? 'Priority 2' : 'Priority 3',
      startDate: '2026-11-27',
      dueDate: giveForm.dueDate,
      status: 'Assigned',
      progressPct: 0,
      attachments: [],
    }));

    setShowGiveModal(false);
    setAssignmentMode('Individual');
    setCollaborativeAssigneeIds([]);
    setGiveForm((prev) => ({ ...prev, title: '' }));
    setActiveTab('TASKS');
    setActiveStatus('Assigned');
    setSegmentFilter('ALL');
    setPersonFilter('ALL');
    setSearch('');
  };

  const openEditModal = (t: TaskItem) => {
    setEditingTask(t);
    setEditForm({
      title: t.title,
      assignedToId: t.assignedToId,
      dueDate: t.dueDate,
      priority: t.priority,
      status: t.status,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editForm.title.trim()) return;
    editTaskDetails(editingTask.id, {
      title: editForm.title.trim(),
      assignedToId: editForm.assignedToId,
      dueDate: editForm.dueDate,
      priority: editForm.priority,
      status: editForm.status,
    });
    setEditingTask(null);
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModal || !noteText.trim()) return;
    if (noteModal.action === 'Send back') {
      updateTaskStatus(noteModal.taskId, 'Returned', undefined, noteText.trim());
    } else {
      respondToTask(noteModal.taskId, noteModal.action, noteText.trim());
    }
    setNoteModal(null);
    setNoteText('');
  };

  const pageTitle = defaultMyTasks ? 'My Tasks' : 'Task Management';
  const tasksTabLabel = isChairperson ? "Everyone's tasks" : 'Team tasks';

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{summarySentence}</p>
        </div>

        {canManageArea && !defaultMyTasks && (
          <button
            type="button"
            onClick={() => setShowGiveModal(true)}
            className="min-h-[44px] px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Give a task
          </button>
        )}
      </header>

      {/* Two Tabs on /tasks */}
      {!defaultMyTasks && canManageArea && (
        <div className="inline-flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('TASKS')}
            className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 ${
              activeTab === 'TASKS'
                ? 'bg-violet-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tasksTabLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WORKLOAD')}
            className={`min-h-[40px] px-4 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 ${
              activeTab === 'WORKLOAD'
                ? 'bg-violet-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Who is free
          </button>
        </div>
      )}

      {/* TAB 1: TASKS */}
      {(defaultMyTasks || activeTab === 'TASKS') && (
        <>
          {/* Overload Warning */}
          {overloadWarning && (
            <div className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-sm flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{overloadWarning.name}</strong> has {overloadWarning.count} urgent tasks at once. Consider moving one.
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPersonFilter(overloadWarning.id);
                  setSegmentFilter('URGENT');
                  const firstMatch = scopedTasks.find(
                    (t) =>
                      t.assignedToId === overloadWarning.id &&
                      t.status !== 'Approved' &&
                      (t.priority === 'Critical' || t.priority === 'High')
                  );
                  if (firstMatch) setActiveStatus(firstMatch.status);
                }}
                className="text-violet-700 dark:text-violet-300 font-semibold underline hover:text-violet-800"
              >
                Show tasks
              </button>
            </div>
          )}

          {/* Simple Filters in One Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1">
              {(
                [
                  ['ALL', 'All'],
                  ['URGENT', 'Urgent'],
                  ['OVERDUE', 'Overdue'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSegmentFilter(id)}
                  className={`min-h-[36px] px-3.5 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 ${
                    segmentFilter === id
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              {!defaultMyTasks && (
                <select
                  value={personFilter}
                  onChange={(e) => setPersonFilter(e.target.value)}
                  aria-label="Filter by person"
                  className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  <option value="ALL">Everyone</option>
                  {areaEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
            </div>
          </div>

          {/* Five Single-Select Status Buttons */}
          <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Task status">
            {STATUS_TABS.map((tab) => {
              const count = filteredTasks.filter((t) => t.status === tab.id).length;
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveStatus(tab.id)}
                  className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 ${
                    isActive
                      ? tab.activeCls
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${tab.dot}`} />
                  <span>{tab.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Task Cards Grid (1 per row on phones, sorted by due date) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleStatusTasks.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                No tasks in <strong>{STATUS_TABS.find((s) => s.id === activeStatus)?.label}</strong>.
              </div>
            ) : (
              visibleStatusTasks.map((t) => {
                const statusMeta = STATUS_TABS.find((s) => s.id === t.status) || STATUS_TABS[0];
                const overdue = isOverdue(t);
                const isAssignee = t.assignedToId === currentEmployee.id;
                const isManagerNotSelf = canManageArea && !isAssignee;
                const isOpen = t.status !== 'Approved';

                return (
                  <article
                    key={t.id}
                    className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-[5px] ${statusMeta.stripeCls} p-4 shadow-sm flex flex-col justify-between gap-3.5`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-500">{t.id}</span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PRIORITY_BADGE[t.priority]}`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug">
                        {t.title}
                      </h3>

                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                        <p>
                          Assigned to: <strong>{t.assignedToName || 'Unassigned'}</strong>
                        </p>
                        {t.assignmentMode === 'Collaborative' && (
                          <p className="font-semibold text-violet-600 dark:text-violet-300">Collaborative group task</p>
                        )}
                        <p className="text-slate-500 dark:text-slate-400">From {t.assignedByName}</p>
                      </div>

                      <p className={`text-xs ${overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {overdue ? `Overdue · ${formatDueShort(t.dueDate)}` : `Due ${formatDueShort(t.dueDate)}`}
                      </p>
                    </div>

                    {/* Plain-word action buttons directly on the card */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                      {t.status === 'Assigned' && isAssignee && (
                        <>
                          <button
                            type="button"
                            onClick={() => respondToTask(t.id, 'Accepted')}
                            className="min-h-[38px] px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                          >
                            Accept and start
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNoteText('');
                              setNoteModal({ taskId: t.id, title: t.title, action: 'Reschedule Requested' });
                            }}
                            className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-violet-400"
                          >
                            Ask for a new date
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNoteText('');
                              setNoteModal({ taskId: t.id, title: t.title, action: 'Declined' });
                            }}
                            className="min-h-[38px] px-3 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {t.status === 'In Progress' && isAssignee && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(t.id, 'Submitted', 100)}
                          className="min-h-[38px] px-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                        >
                          Submit for review
                        </button>
                      )}

                      {t.status === 'Submitted' && isManagerNotSelf && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(t.id, 'Approved', 100)}
                            className="min-h-[38px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNoteText('');
                              setNoteModal({ taskId: t.id, title: t.title, action: 'Send back' });
                            }}
                            className="min-h-[38px] px-3.5 rounded-xl border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            Send back
                          </button>
                        </>
                      )}

                      {t.status === 'Returned' && isAssignee && (
                        <button
                          type="button"
                          onClick={() => updateTaskStatus(t.id, 'In Progress')}
                          className="min-h-[38px] px-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                        >
                          Start again
                        </button>
                      )}

                      {isManagerNotSelf && isOpen && (
                        <button
                          type="button"
                          onClick={() => openEditModal(t)}
                          className="min-h-[38px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-violet-400 ml-auto"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}

      {/* TAB 2: WHO IS FREE */}
      {!defaultMyTasks && canManageArea && activeTab === 'WORKLOAD' && (
        <TeamWorkloadView
          onGiveTaskToEmployee={(emp: Employee) => {
            setGiveForm((prev) => ({ ...prev, assignedToId: emp.id }));
            setShowGiveModal(true);
          }}
        />
      )}

      {/* GIVE A TASK MODAL */}
      {showGiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Give a task</h2>
              <button
                type="button"
                onClick={() => setShowGiveModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleGiveSubmit} className="space-y-4 text-sm">
              <div>
                <label className="font-semibold block mb-1.5">What</label>
                <input
                  required
                  value={giveForm.title}
                  onChange={(e) => setGiveForm({ ...giveForm, title: e.target.value })}
                  placeholder="Describe the task..."
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1.5">Assignment type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Individual', 'Collaborative'] as const).map((mode) => (
                    <button key={mode} type="button" onClick={() => setAssignmentMode(mode)} className={`min-h-[42px] rounded-xl border text-xs font-semibold ${assignmentMode === mode ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'}`}>
                      {mode === 'Individual' ? 'One employee' : 'Collaborative group'}
                    </button>
                  ))}
                </div>
              </div>

              {assignmentMode === 'Individual' ? (
                <div>
                  <label className="font-semibold block mb-1.5">Employee</label>
                  <select value={giveForm.assignedToId} onChange={(e) => setGiveForm({ ...giveForm, assignedToId: e.target.value })} className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600">
                    {areaEmployees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="font-semibold block mb-1.5">Employees <span className="text-xs font-normal text-slate-500">(select at least two)</span></label>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
                    {areaEmployees.map((emp) => <label key={emp.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-white dark:hover:bg-slate-700"><input type="checkbox" checked={collaborativeAssigneeIds.includes(emp.id)} onChange={(event) => setCollaborativeAssigneeIds((current) => event.target.checked ? [...current, emp.id] : current.filter((id) => id !== emp.id))} className="accent-violet-600" /><span>{emp.name} <span className="text-slate-500">({emp.department})</span></span></label>)}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1.5">Due date</label>
                  <input
                    type="date"
                    required
                    value={giveForm.dueDate}
                    onChange={(e) => setGiveForm({ ...giveForm, dueDate: e.target.value })}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1.5">Priority</label>
                  <select
                    value={giveForm.priority}
                    onChange={(e) => setGiveForm({ ...giveForm, priority: e.target.value as TaskPriority })}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGiveModal(false)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  Give task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit {editingTask.id}</h2>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="font-semibold block mb-1.5">What</label>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1.5">Who</label>
                <select
                  value={editForm.assignedToId}
                  onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  {areaEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1.5">Due date</label>
                  <input
                    type="date"
                    required
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1.5">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TaskPriority })}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1.5">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskLifecycleStatus })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                >
                  {STATUS_TABS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REASON / NOTE MODAL (required for Decline, Ask for a new date, Send back) */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {noteModal.action === 'Send back'
                ? 'Send task back'
                : noteModal.action === 'Declined'
                ? 'Decline task'
                : 'Ask for a new date'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">{noteModal.title}</p>
            <form onSubmit={handleNoteSubmit} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="font-semibold block mb-1.5">
                  {noteModal.action === 'Send back' ? 'Note (required)' : 'Reason (required)'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write a short explanation..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-600"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNoteModal(null)}
                  className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[42px] px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
