'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  ArrowRightLeft,
  MessageSquare,
  X,
  Clock,
  AlertTriangle,
  History,
  Download,
  Users,
  Sparkles,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
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
  Employee,
} from '@/types';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TeamWorkloadView } from './TeamWorkloadView';

const STATUS_TABS: {
  id: TaskLifecycleStatus;
  label: string;
  dot: string;
  activeCls: string;
  stripeCls: string;
  selectCls: string;
}[] = [
  {
    id: 'Assigned',
    label: 'Assigned',
    dot: 'bg-blue-600',
    activeCls: 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500',
    stripeCls: 'border-l-blue-600',
    selectCls: 'border-blue-500/60 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  },
  {
    id: 'In Progress',
    label: 'Ongoing',
    dot: 'bg-amber-600',
    activeCls: 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500',
    stripeCls: 'border-l-amber-600',
    selectCls: 'border-amber-500/60 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  {
    id: 'Submitted',
    label: 'Submitted',
    dot: 'bg-violet-600',
    activeCls: 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-500',
    stripeCls: 'border-l-violet-600',
    selectCls: 'border-violet-500/60 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  },
  {
    id: 'Approved',
    label: 'Approved',
    dot: 'bg-emerald-600',
    activeCls: 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500',
    stripeCls: 'border-l-emerald-600',
    selectCls: 'border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  {
    id: 'Returned',
    label: 'Returned',
    dot: 'bg-rose-600',
    activeCls: 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-500',
    stripeCls: 'border-l-rose-600',
    selectCls: 'border-rose-500/60 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  },
];

const PRIORITY_BADGE: Record<TaskPriority, string> = {
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function getInitials(name: string) {
  if (!name || name === 'Unassigned') return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

function formatDueShort(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function TasksView({ defaultMyTasks = false }: { defaultMyTasks?: boolean }) {
  const {
    tasks,
    followUps,
    employees,
    currentEmployee,
    isChairperson,
    isDirector,
    getVisibleTasksForCurrentUser,
    getDirectorAllowedDepartments,
    getEmployeeWorkload,
    founderOverridePriority,
    addTask,
    updateTaskStatus,
    transferTask,
    respondToTask,
    addTaskComment,
  } = useApp();

  const [viewMode, setViewMode] = useState<'BOARD' | 'LIST' | 'WORKLOAD' | 'FOLLOWUPS'>('BOARD');
  const [activeStatus, setActiveStatus] = useState<TaskLifecycleStatus>('Assigned');
  const [segmentFilter, setSegmentFilter] = useState<'ALL' | 'URGENT' | 'OVERDUE' | 'DIR_1' | 'DIR_2' | 'DIR_3' | 'UNASSIGNED'>('ALL');
  const [personFilter, setPersonFilter] = useState<string>(defaultMyTasks ? currentEmployee.id : 'ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const [showCreate, setShowCreate] = useState(false);
  const [showFreeSuggestions, setShowFreeSuggestions] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [transferModalTask, setTransferModalTask] = useState<TaskItem | null>(null);
  const [transferToId, setTransferToId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [commentText, setCommentText] = useState('');
  const [responseReason, setResponseReason] = useState('');
  const [showResponseReasonInput, setShowResponseReasonInput] = useState<'Reschedule Requested' | 'Declined' | null>(null);

  // Founder override state inside drawer
  const [overrideMode, setOverrideMode] = useState(false);
  const [ovPriority, setOvPriority] = useState<TaskPriority>('Critical');
  const [ovDirPriority, setOvDirPriority] = useState<DirectorPriority>('Priority 1');
  const [ovDueDate, setOvDueDate] = useState('2026-11-28');
  const [ovAssigneeId, setOvAssigneeId] = useState('');
  const [ovStatus, setOvStatus] = useState<TaskLifecycleStatus>('Assigned');
  const [ovNote, setOvNote] = useState('');

  useEffect(() => {
    setPersonFilter(defaultMyTasks ? currentEmployee.id : 'ALL');
  }, [defaultMyTasks, currentEmployee.id]);

  // Open task drawer directly when navigated from notification (?taskId=TSK-xxx)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    if (taskId) {
      const match = tasks.find((t) => t.id === taskId);
      if (match) {
        setSelectedTask(match);
        setActiveStatus(match.status);
      }
    }
  }, [tasks]);

  const directors = employees.filter((e) => e.role === 'DIRECTOR' || e.role === 'CHAIRPERSON');

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

  // Visibility: Founder sees ALL tasks; My Tasks scopes to current user; other roles use strict visibility
  const authorizedTasks = useMemo(() => {
    const base = isChairperson ? tasks : getVisibleTasksForCurrentUser();
    if (defaultMyTasks) {
      return base.filter((t) => t.assignedToId === currentEmployee.id);
    }
    return base;
  }, [isChairperson, tasks, getVisibleTasksForCurrentUser, defaultMyTasks, currentEmployee.id]);

  const visibleFollowUps = useMemo(() => {
    if (defaultMyTasks) {
      return followUps.filter((f) => f.ownerId === currentEmployee.id);
    }
    if (isChairperson) return followUps;
    if (isDirector) {
      const allowed = getDirectorAllowedDepartments(currentEmployee.id);
      return followUps.filter((f) => allowed.includes(f.department));
    }
    return followUps.filter((f) => f.ownerId === currentEmployee.id || f.department === currentEmployee.department);
  }, [defaultMyTasks, isChairperson, isDirector, followUps, getDirectorAllowedDepartments, currentEmployee]);

  const isOverdue = (t: TaskItem) => t.dueDate < '2026-11-26' && t.status !== 'Approved';

  const matchesDirectorScope = (t: TaskItem, dirId: string) => {
    if (t.assigningDirectorId === dirId || t.assignedById === dirId || t.assignedToId === dirId) {
      return true;
    }
    const allowedDepts = getDirectorAllowedDepartments(dirId);
    const assignee = employees.find((e) => e.id === t.assignedToId);
    return allowedDepts.includes(t.department) || assignee?.reportingDirectorId === dirId;
  };

  // Urgent overload warning (anyone with 3+ open Critical/High tasks)
  const overloadWarning = useMemo(() => {
    const counts = new Map<string, { id: string; name: string; count: number }>();
    authorizedTasks.forEach((t) => {
      if (t.status !== 'Approved' && (t.priority === 'Critical' || t.priority === 'High') && t.assignedToId) {
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
  }, [authorizedTasks]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return authorizedTasks.filter((t) => {
      if (segmentFilter === 'URGENT' && t.priority !== 'Critical' && t.priority !== 'High') return false;
      if (segmentFilter === 'OVERDUE' && !isOverdue(t)) return false;
      if (segmentFilter === 'DIR_1' && !matchesDirectorScope(t, 'AWF-EMP-002')) return false;
      if (segmentFilter === 'DIR_2' && !matchesDirectorScope(t, 'AWF-EMP-003')) return false;
      if (segmentFilter === 'DIR_3' && !matchesDirectorScope(t, 'AWF-EMP-004')) return false;
      if (segmentFilter === 'UNASSIGNED' && t.assignedToId && t.assignedToName !== 'Unassigned') return false;
      if (personFilter !== 'ALL' && t.assignedToId !== personFilter && t.assignedById !== personFilter) return false;
      if (deptFilter !== 'ALL' && t.department !== deptFilter) return false;
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
  }, [authorizedTasks, segmentFilter, personFilter, deptFilter, search]);

  const visibleStatusTasks = useMemo(() => {
    return filteredTasks
      .filter((t) => t.status === activeStatus)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredTasks, activeStatus]);

  const peopleOptions = useMemo(() => {
    const map = new Map<string, string>();
    authorizedTasks.forEach((t) => {
      if (t.assignedToId && t.assignedToName) {
        map.set(t.assignedToId, t.assignedToName);
      }
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [authorizedTasks]);

  const getReportingChain = (t: TaskItem) => {
    const emp = employees.find((e) => e.id === t.assignedToId);
    if (!emp) return `Unassigned → ${t.department} → Pooja Ahire (Founder)`;
    const mgr = emp.reportingManagerName || 'Direct';
    const dir = emp.reportingDirectorId
      ? employees.find((e) => e.id === emp.reportingDirectorId)?.name || 'Director'
      : emp.role === 'DIRECTOR'
      ? emp.name
      : 'Executive';
    return `${emp.name} → ${mgr} → ${dir} → Pooja Ahire (Founder)`;
  };

  const handleExportCSV = () => {
    const headers = ['Task ID', 'Title', 'Assigned To', 'Assigned By', 'Department', 'Priority', 'Status', 'Due Date'];
    const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = filteredTasks.map((t) =>
      [t.id, t.title, t.assignedToName || 'Unassigned', t.assignedByName, t.department, t.priority, t.status, t.dueDate]
        .map(escape)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awfis-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = employees.find((emp) => emp.id === form.assignedToId) || currentEmployee;
    const dir = employees.find((emp) => emp.id === form.assigningDirectorId) || currentEmployee;
    const dirIndex =
      dir.id === 'AWF-EMP-002'
        ? `${dir.name} (Education Director)`
        : dir.id === 'AWF-EMP-003'
        ? `${dir.name} (Innovation Director)`
        : dir.id === 'AWF-EMP-004'
        ? `${dir.name} (Tech & Accounts)`
        : dir.name;

    addTask({
      title: form.title,
      description: form.description || form.title,
      assignedById: dir.id,
      assignedByName: dir.name,
      assigningDirectorId: dir.id,
      assigningDirectorName: dirIndex,
      assignedToId: assignee.id,
      assignedToName: assignee.name,
      department: form.department,
      team: assignee.team,
      project: 'AWFIS Team Tasks',
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
    setActiveStatus('Assigned');
    setShowCreate(false);
    setForm({ ...form, title: '', description: '', reasonForUrgency: '' });
  };

  const liveSelectedTask = selectedTask ? tasks.find((t) => t.id === selectedTask.id) || selectedTask : null;

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* 1. Calm Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
              {defaultMyTasks ? 'My Tasks' : 'Team Tasks'}
            </h1>
            {isChairperson && !defaultMyTasks && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                Founder View – Full Organization Access
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredTasks.length} of {authorizedTasks.length} tasks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Calm View Switcher */}
          <div className="inline-flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('BOARD')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'BOARD' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Board
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'LIST' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> List
            </button>
            {(isChairperson || isDirector) && !defaultMyTasks && (
              <button
                onClick={() => setViewMode('WORKLOAD')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'WORKLOAD' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Team Workload
              </button>
            )}
            <button
              onClick={() => setViewMode('FOLLOWUPS')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'FOLLOWUPS' ? 'bg-violet-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Follow-ups ({visibleFollowUps.length})
            </button>
          </div>

          {isChairperson && !defaultMyTasks && (
            <button
              onClick={handleExportCSV}
              className="min-h-[40px] px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}

          {(isChairperson || isDirector) && (
            <button
              onClick={() => {
                setShowFreeSuggestions(false);
                setShowCreate(true);
              }}
              className="min-h-[40px] px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> New task
            </button>
          )}
        </div>
      </header>

      {/* 2. Slim Warning Line */}
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
              setViewMode('BOARD');
              const firstMatch = authorizedTasks.find(
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

      {/* 3. Filter Bar */}
      {viewMode !== 'WORKLOAD' && viewMode !== 'FOLLOWUPS' && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Segmented buttons */}
          <div className="flex flex-wrap items-center gap-2">
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
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    segmentFilter === id
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Founder Director quick filter pills */}
            {isChairperson && !defaultMyTasks && (
              <div className="inline-flex flex-wrap bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 gap-1">
                {(
                  [
                    ['DIR_1', 'Education Dir.'],
                    ['DIR_2', 'Innovation Dir.'],
                    ['DIR_3', 'Tech & Accounts'],
                    ['UNASSIGNED', 'Unassigned'],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSegmentFilter(segmentFilter === id ? 'ALL' : id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      segmentFilter === id
                        ? 'bg-violet-600 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Person dropdown, Dept dropdown, Search */}
          <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
            {!defaultMyTasks && (
              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                aria-label="Filter by person"
                className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-600"
              >
                <option value="ALL">Everyone</option>
                {peopleOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              aria-label="Filter by department"
              className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-600"
            >
              <option value="ALL">All departments</option>
              {PERMANENT_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>

            <div className="relative min-w-[200px] flex-1 sm:flex-initial sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks or people..."
                className="w-full min-h-[42px] pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Status Buttons Row (Board View) */}
      {viewMode === 'BOARD' && (
        <>
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
                  className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-colors ${
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

          {/* 5. Task Cards Grid (Only active status, sorted by due date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleStatusTasks.length === 0 ? (
              <div className="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                No tasks in <strong>{STATUS_TABS.find((s) => s.id === activeStatus)?.label}</strong> match your filters.
              </div>
            ) : (
              visibleStatusTasks.map((t) => {
                const statusMeta = STATUS_TABS.find((s) => s.id === t.status) || STATUS_TABS[0];
                const overdue = isOverdue(t);
                return (
                  <article
                    key={t.id}
                    onClick={() => {
                      setSelectedTask(t);
                      setOverrideMode(false);
                      setOvAssigneeId(t.assignedToId);
                      setOvStatus(t.status);
                    }}
                    className={`cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-[5px] ${statusMeta.stripeCls} p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3.5`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
                        {t.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${PRIORITY_BADGE[t.priority]}`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-200 font-medium">
                      <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center shrink-0">
                        {getInitials(t.assignedToName)}
                      </span>
                      <span className="truncate">{t.assignedToName || 'Unassigned'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold font-mono">{t.id}</span>
                      <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                        {overdue ? `Overdue · ${formatDueShort(t.dueDate)}` : `Due ${formatDueShort(t.dueDate)}`}
                      </span>
                    </div>

                    <select
                      value={t.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTaskStatus(t.id, e.target.value as TaskLifecycleStatus);
                      }}
                      aria-label={`Change status for ${t.title}`}
                      className={`w-full min-h-[42px] px-3 rounded-xl border text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-600 ${statusMeta.selectCls}`}
                    >
                      {STATUS_TABS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}

      {/* LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500">
              <tr>
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Assigned to</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Due date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => {
                    setSelectedTask(t);
                    setOverrideMode(false);
                    setOvAssigneeId(t.assignedToId);
                    setOvStatus(t.status);
                  }}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    <span className="font-mono text-[11px] text-violet-600 mr-2">{t.id}</span>
                    {t.title}
                  </td>
                  <td className="py-3 px-4">{t.assignedToName || 'Unassigned'}</td>
                  <td className="py-3 px-4">{t.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${PRIORITY_BADGE[t.priority]}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge
                      label={t.status === 'In Progress' ? 'Ongoing' : t.status}
                      variant={t.status === 'Approved' ? 'success' : t.status === 'Returned' ? 'danger' : 'info'}
                    />
                  </td>
                  <td className={`py-3 px-4 ${isOverdue(t) ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {isOverdue(t) ? `Overdue · ${formatDueShort(t.dueDate)}` : formatDueShort(t.dueDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TEAM WORKLOAD VIEW */}
      {viewMode === 'WORKLOAD' && (
        <TeamWorkloadView
          onAssignToEmployee={(emp: Employee) => {
            setForm((prev) => ({
              ...prev,
              assignedToId: emp.id,
              department: emp.department,
            }));
            setShowFreeSuggestions(false);
            setShowCreate(true);
          }}
          onSelectTask={(t: TaskItem) => {
            setSelectedTask(t);
            setOverrideMode(false);
            setOvAssigneeId(t.assignedToId);
            setOvStatus(t.status);
          }}
        />
      )}

      {/* FOLLOW-UPS VIEW */}
      {viewMode === 'FOLLOWUPS' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          {visibleFollowUps.map((f) => (
            <div key={f.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{f.description}</p>
                <p className="text-[11px] text-slate-500">{f.ownerName} ({f.department}) • {f.date} {f.reminder}</p>
              </div>
              <StatusBadge label={f.status} variant={f.status === 'Completed' ? 'success' : 'warning'} />
            </div>
          ))}
        </div>
      )}

      {/* TASK DETAILS / EDIT DRAWER */}
      {liveSelectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-violet-600">{liveSelectedTask.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{liveSelectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{liveSelectedTask.description}</p>

            <div className="grid grid-cols-2 gap-2.5 text-xs p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div><span className="text-slate-400 block">Assigned by</span><b>{liveSelectedTask.assigningDirectorName || liveSelectedTask.assignedByName}</b></div>
              <div><span className="text-slate-400 block">Assigned to</span><b>{liveSelectedTask.assignedToName || 'Unassigned'}</b></div>
              <div><span className="text-slate-400 block">Department</span><b>{liveSelectedTask.department}</b></div>
              <div><span className="text-slate-400 block">Priority</span><b>{liveSelectedTask.priority}</b></div>
              <div><span className="text-slate-400 block">Director priority</span><b>{liveSelectedTask.directorPriority}</b></div>
              <div><span className="text-slate-400 block">Due date</span><b>{liveSelectedTask.dueDate}</b></div>
            </div>

            {isChairperson && (
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-[11px] text-violet-800 dark:text-violet-200">
                <b>Reporting chain:</b> {getReportingChain(liveSelectedTask)}
              </div>
            )}

            {liveSelectedTask.reasonForUrgency && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <b>Reason for urgency:</b> {liveSelectedTask.reasonForUrgency}
              </div>
            )}

            {/* Employee Response Controls */}
            {liveSelectedTask.assignedToId === currentEmployee.id && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Your response</span>
                  <StatusBadge
                    label={liveSelectedTask.employeeResponse?.status || 'Pending'}
                    variant={
                      liveSelectedTask.employeeResponse?.status === 'Accepted'
                        ? 'success'
                        : liveSelectedTask.employeeResponse?.status === 'Declined'
                        ? 'danger'
                        : 'warning'
                    }
                  />
                </div>
                {liveSelectedTask.employeeResponse?.reason && (
                  <p className="text-[11px] text-slate-500">Note: {liveSelectedTask.employeeResponse.reason}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      respondToTask(liveSelectedTask.id, 'Accepted');
                      setShowResponseReasonInput(null);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept & start
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResponseReasonInput('Reschedule Requested')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold"
                  >
                    Request reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResponseReasonInput('Declined')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold"
                  >
                    Decline
                  </button>
                </div>
                {showResponseReasonInput && (
                  <div className="flex gap-2 pt-1">
                    <input
                      value={responseReason}
                      onChange={(e) => setResponseReason(e.target.value)}
                      placeholder={`Reason for ${showResponseReasonInput}...`}
                      className="flex-1 p-2 rounded-lg border bg-white dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        respondToTask(
                          liveSelectedTask.id,
                          showResponseReasonInput,
                          responseReason || 'Schedule conflict'
                        );
                        setResponseReason('');
                        setShowResponseReasonInput(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-violet-600 text-white font-bold"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_TABS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateTaskStatus(liveSelectedTask.id, st.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    liveSelectedTask.status === st.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st.label}
                </button>
              ))}
              {(isChairperson || isDirector) && (
                <button
                  onClick={() => {
                    setTransferModalTask(liveSelectedTask);
                    setTransferToId(employees[0].id);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Reassign
                </button>
              )}
            </div>

            {/* Founder Override */}
            {isChairperson && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                {!overrideMode ? (
                  <button
                    onClick={() => {
                      setOverrideMode(true);
                      setOvPriority(liveSelectedTask.priority);
                      setOvDirPriority(liveSelectedTask.directorPriority);
                      setOvDueDate(liveSelectedTask.dueDate);
                      setOvAssigneeId(liveSelectedTask.assignedToId);
                      setOvStatus(liveSelectedTask.status);
                    }}
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold"
                  >
                    Founder override (priority, assignee, status & due date)
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                    <p className="font-bold">Founder override</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={ovPriority} onChange={(e) => setOvPriority(e.target.value as TaskPriority)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                      </select>
                      <select value={ovDirPriority} onChange={(e) => setOvDirPriority(e.target.value as DirectorPriority)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        <option value="Priority 1">Priority 1</option><option value="Priority 2">Priority 2</option><option value="Priority 3">Priority 3</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={ovAssigneeId} onChange={(e) => setOvAssigneeId(e.target.value)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        <option value="">Keep current assignee</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                      <select value={ovStatus} onChange={(e) => setOvStatus(e.target.value as TaskLifecycleStatus)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        {STATUS_TABS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <input type="date" value={ovDueDate} onChange={(e) => setOvDueDate(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
                    <input placeholder="Decision note" value={ovNote} onChange={(e) => setOvNote(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setOverrideMode(false)} className="px-2.5 py-1 text-slate-500">Cancel</button>
                      <button
                        onClick={() => {
                          founderOverridePriority(liveSelectedTask.id, ovPriority, ovDirPriority, ovDueDate, ovNote || 'Founder override');
                          if (ovAssigneeId && ovAssigneeId !== liveSelectedTask.assignedToId) {
                            transferTask(liveSelectedTask.id, ovAssigneeId, ovNote || 'Founder reassignment');
                          }
                          if (ovStatus !== liveSelectedTask.status) {
                            updateTaskStatus(liveSelectedTask.id, ovStatus);
                          }
                          setOverrideMode(false);
                          setOvNote('');
                        }}
                        className="px-3 py-1 rounded-lg bg-violet-600 text-white font-bold"
                      >
                        Save override
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Priority History */}
            {liveSelectedTask.priorityHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Priority & assignment history</h4>
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
                <button onClick={() => { if (commentText.trim()) { addTaskComment(liveSelectedTask.id, commentText); setCommentText(''); } }} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN / TRANSFER MODAL */}
      {transferModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-base font-bold">Reassign task</h3>
            <select value={transferToId} onChange={(e) => setTransferToId(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800">
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.department})</option>)}
            </select>
            <textarea rows={2} placeholder="Reason for reassignment..." value={transferReason} onChange={(e) => setTransferReason(e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setTransferModalTask(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
              <button onClick={() => { transferTask(transferModalTask.id, transferToId, transferReason || 'Rebalanced'); setTransferModalTask(null); }} className="px-4 py-1.5 rounded-lg bg-violet-600 text-white font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">New task</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Task name</label>
                <input required placeholder="e.g. Prepare college MoU deck" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea rows={2} placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Assigned by</label>
                  <select value={form.assigningDirectorId} onChange={(e) => setForm({ ...form, assigningDirectorId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {directors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold">Assigned to</label>
                    <button
                      type="button"
                      onClick={() => setShowFreeSuggestions((v) => !v)}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Suggest free
                    </button>
                  </div>
                  <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {employees.map((e) => {
                      const wl = getEmployeeWorkload(e.id);
                      return (
                        <option key={e.id} value={e.id}>
                          {e.name} ({wl.availability})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Workload Warning & Free Suggestions */}
              {(() => {
                const selectedWl = getEmployeeWorkload(form.assignedToId);
                const sameDeptFree = employees.filter((e) => {
                  const wl = getEmployeeWorkload(e.id);
                  return (
                    e.id !== form.assignedToId &&
                    (e.department === form.department || showFreeSuggestions) &&
                    (wl.availability === 'Free' || wl.availability === 'Light')
                  );
                });
                const isHeavy = selectedWl.availability === 'Busy' || selectedWl.availability === 'Overloaded';
                if (!isHeavy && !showFreeSuggestions) return null;
                return (
                  <div
                    className={`p-3 rounded-xl border text-[11px] space-y-2 ${
                      isHeavy
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    {isHeavy && (
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        This employee already has {selectedWl.activeCount} active tasks ({selectedWl.availability}). Assign anyway?
                      </p>
                    )}
                    {sameDeptFree.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {sameDeptFree.slice(0, 6).map((emp) => {
                          const wl = getEmployeeWorkload(emp.id);
                          return (
                            <button
                              key={emp.id}
                              type="button"
                              onClick={() => setForm({ ...form, assignedToId: emp.id, department: emp.department })}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100"
                            >
                              {emp.name} ({wl.availability})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value as DepartmentType })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Director priority</label>
                  <select value={form.directorPriority} onChange={(e) => setForm({ ...form, directorPriority: e.target.value as DirectorPriority })} className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <option value="Priority 1">Priority 1</option><option value="Priority 2">Priority 2</option><option value="Priority 3">Priority 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-semibold block mb-1">Due date</label><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2 rounded-xl border bg-slate-50 dark:bg-slate-800" /></div>
                <div><label className="font-semibold block mb-1">Attachments (optional)</label><input placeholder="Task_Brief.pdf" value={form.attachmentsText} onChange={(e) => setForm({ ...form, attachmentsText: e.target.value })} className="w-full p-2 rounded-xl border bg-slate-50 dark:bg-slate-800" /></div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white font-semibold">Save task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
