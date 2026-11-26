'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
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
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TeamWorkloadView } from './TeamWorkloadView';

const LIFECYCLE_COLUMNS: TaskLifecycleStatus[] = [
  'Assigned',
  'In Progress',
  'Submitted',
  'Approved',
  'Returned',
];

type TaskScopeType =
  | 'ALL'
  | 'MINE'
  | 'DIR_1'
  | 'DIR_2'
  | 'DIR_3'
  | 'CRITICAL'
  | 'OVERDUE'
  | 'HIGHLIGHTED'
  | 'BY_EMPLOYEE'
  | 'BY_DEPARTMENT'
  | 'UNASSIGNED';

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
    getPriorityConflicts,
    escalatePriorityConflict,
    founderOverridePriority,
    addTask,
    updateTaskStatus,
    transferTask,
    respondToTask,
    addTaskComment,
  } = useApp();

  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST' | 'TIMELINE' | 'FOLLOWUPS' | 'WORKLOAD'>('KANBAN');
  const [showFreeSuggestions, setShowFreeSuggestions] = useState(false);
  const [responseReason, setResponseReason] = useState('');
  const [showResponseReasonInput, setShowResponseReasonInput] = useState<'Reschedule Requested' | 'Declined' | null>(null);

  // Open task drawer directly when navigated from notification (?taskId=TSK-xxx)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    if (taskId) {
      const match = tasks.find((t) => t.id === taskId);
      if (match) {
        setSelectedTask(match);
      }
    }
  }, [tasks]);
  const [taskScope, setTaskScope] = useState<TaskScopeType>(defaultMyTasks ? 'MINE' : 'ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Founder searchable employee filter & workload panel
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [empSearch, setEmpSearch] = useState('');
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const [showWorkload, setShowWorkload] = useState(false);

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
  const [ovAssigneeId, setOvAssigneeId] = useState('');
  const [ovStatus, setOvStatus] = useState<TaskLifecycleStatus>('Assigned');
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

  // Visibility function: Founder gets ALL tasks; other roles get strict role-scoped tasks
  const authorizedTasks = useMemo(
    () => (isChairperson ? tasks : getVisibleTasksForCurrentUser()),
    [isChairperson, tasks, getVisibleTasksForCurrentUser]
  );

  // Follow-ups scoped consistently with authorized tasks/role
  const visibleFollowUps = useMemo(() => {
    if (isChairperson) return followUps;
    if (isDirector) {
      const allowed = getDirectorAllowedDepartments(currentEmployee.id);
      return followUps.filter((f) => allowed.includes(f.department));
    }
    return followUps.filter((f) => f.ownerId === currentEmployee.id || f.department === currentEmployee.department);
  }, [isChairperson, isDirector, followUps, getDirectorAllowedDepartments, currentEmployee]);

  // Priority conflicts: Founder sees ALL conflicts across all directors
  const allConflicts = getPriorityConflicts();
  const visibleConflicts = isChairperson
    ? allConflicts
    : allConflicts.filter((c) => c.tasks.some((t) => authorizedTasks.some((at) => at.id === t.id)));

  // Helper: check if task belongs to a Director (created by, assigned to, or reporting team)
  const matchesDirectorScope = (t: TaskItem, dirId: string) => {
    if (t.assigningDirectorId === dirId || t.assignedById === dirId || t.assignedToId === dirId) {
      return true;
    }
    const allowedDepts = getDirectorAllowedDepartments(dirId);
    const assignee = employees.find((e) => e.id === t.assignedToId);
    return allowedDepts.includes(t.department) || assignee?.reportingDirectorId === dirId;
  };

  const filteredTasks = authorizedTasks.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.assignedToName.toLowerCase().includes(q) ||
      t.assignedByName.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);
    const matchDept = deptFilter === 'ALL' || t.department === deptFilter;
    const matchEmployee =
      !isChairperson ||
      selectedEmployeeId === 'ALL' ||
      t.assignedToId === selectedEmployeeId ||
      t.assignedById === selectedEmployeeId ||
      t.assigningDirectorId === selectedEmployeeId;

    const matchScope =
      taskScope === 'ALL' ||
      taskScope === 'BY_EMPLOYEE' ||
      taskScope === 'BY_DEPARTMENT' ||
      (taskScope === 'MINE' && t.assignedToId === currentEmployee.id) ||
      (taskScope === 'DIR_1' && matchesDirectorScope(t, 'AWF-EMP-002')) ||
      (taskScope === 'DIR_2' && matchesDirectorScope(t, 'AWF-EMP-003')) ||
      (taskScope === 'DIR_3' && matchesDirectorScope(t, 'AWF-EMP-004')) ||
      (taskScope === 'CRITICAL' && t.priority === 'Critical') ||
      (taskScope === 'OVERDUE' && t.dueDate < '2026-11-25' && t.status !== 'Approved') ||
      (taskScope === 'HIGHLIGHTED' && Boolean(t.highlighted)) ||
      (taskScope === 'UNASSIGNED' && (!t.assignedToId || t.assignedToName === 'Unassigned'));

    return matchSearch && matchDept && matchEmployee && matchScope;
  });

  // Workload by Employee (Founder-only summary)
  const workloadByEmployee = useMemo(() => {
    if (!isChairperson) return [];
    return employees.map((emp) => {
      const empTasks = authorizedTasks.filter((t) => t.assignedToId === emp.id);
      const overdueCount = empTasks.filter((t) => t.dueDate < '2026-11-25' && t.status !== 'Approved').length;
      const criticalCount = empTasks.filter((t) => t.priority === 'Critical').length;
      return {
        employee: emp,
        total: empTasks.length,
        overdue: overdueCount,
        critical: criticalCount,
      };
    });
  }, [isChairperson, employees, authorizedTasks]);

  const getEmployeeRoleLabel = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return empId ? 'Staff' : 'Unassigned';
    if (emp.id === 'AWF-EMP-001') return 'Founder';
    if (emp.role === 'DIRECTOR') return emp.designation;
    return emp.designation;
  };

  const getReportingChain = (t: TaskItem) => {
    const emp = employees.find((e) => e.id === t.assignedToId);
    if (!emp) return `Unassigned → ${t.department} → Founder (Pooja Ahire)`;
    const mgr = emp.reportingManagerName || 'Direct';
    const dir = emp.reportingDirectorId
      ? employees.find((e) => e.id === emp.reportingDirectorId)?.name || 'Director'
      : emp.role === 'DIRECTOR'
      ? emp.name
      : 'Executive';
    return `${emp.name} → ${mgr} → ${dir} → Pooja Ahire (Founder)`;
  };

  const handleExportCSV = () => {
    const headers = [
      'Task ID',
      'Title',
      'Assigned To',
      'Assigned By',
      'Assigning Director',
      'Department',
      'Priority',
      'Director Priority',
      'Status',
      'Start Date',
      'Due Date',
      'Urgency Reason',
    ];
    const escape = (val: string) => `"${(val || '').replace(/"/g, '""')}"`;
    const rows = filteredTasks.map((t) =>
      [
        t.id,
        t.title,
        t.assignedToName || 'Unassigned',
        t.assignedByName,
        t.assigningDirectorName || '',
        t.department,
        t.priority,
        t.directorPriority,
        t.status,
        t.startDate,
        t.dueDate,
        t.reasonForUrgency || '',
      ]
        .map(escape)
        .join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `awfis-founder-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
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

  const searchableEmployees = employees.filter(
    (e) =>
      !empSearch ||
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.designation.toLowerCase().includes(empSearch.toLowerCase())
  );

  const scopeTabs: { id: TaskScopeType; label: string }[] = [
    { id: 'ALL', label: 'All Authorized' },
    { id: 'MINE', label: 'My Tasks' },
    { id: 'DIR_1', label: 'Director 1 (Education)' },
    { id: 'DIR_2', label: 'Director 2 (Innovation)' },
    { id: 'DIR_3', label: 'Director 3 (Tech & Accounts)' },
    { id: 'CRITICAL', label: 'Critical' },
    { id: 'OVERDUE', label: 'Overdue' },
    { id: 'HIGHLIGHTED', label: 'Highlighted' },
    ...(isChairperson
      ? [
          { id: 'BY_EMPLOYEE' as const, label: 'By Employee' },
          { id: 'BY_DEPARTMENT' as const, label: 'By Department' },
          { id: 'UNASSIGNED' as const, label: 'Unassigned/Orphan Tasks' },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={defaultMyTasks ? 'My Consolidated Tasks' : 'Multi-Director Task Management Engine'}
        subtitle="Task urgency + Director-level work priority, priority conflict detection, Founder override, and strict role visibility."
        icon={CheckSquare}
        badge={isChairperson ? 'Founder View – Full Organization Access' : undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button onClick={() => setViewMode('KANBAN')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'KANBAN' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-sm' : 'text-slate-500'}`}>
                <Kanban className="w-3.5 h-3.5" /> Kanban
              </button>
              <button onClick={() => setViewMode('LIST')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'LIST' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-sm' : 'text-slate-500'}`}>
                <TableIcon className="w-3.5 h-3.5" /> List
              </button>
              <button onClick={() => setViewMode('TIMELINE')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'TIMELINE' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-sm' : 'text-slate-500'}`}>
                <Calendar className="w-3.5 h-3.5" /> Timeline
              </button>
              <button onClick={() => setViewMode('FOLLOWUPS')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'FOLLOWUPS' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-sm' : 'text-slate-500'}`}>
                <Clock className="w-3.5 h-3.5" /> Follow-ups ({visibleFollowUps.length})
              </button>
              {(isChairperson || isDirector) && (
                <button onClick={() => setViewMode('WORKLOAD')} className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 ${viewMode === 'WORKLOAD' ? 'bg-white dark:bg-slate-900 text-violet-600 shadow-sm' : 'text-slate-500'}`}>
                  <Users className="w-3.5 h-3.5" /> Team Workload
                </button>
              )}
            </div>
            {isChairperson && (
              <>
                <button
                  onClick={() => setShowWorkload((v) => !v)}
                  className="px-3 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" /> Workload
                  {showWorkload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </>
            )}
            {(isChairperson || isDirector) && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Assign Task
              </button>
            )}
          </div>
        }
      />

      {/* Founder Workload by Employee Summary */}
      {isChairperson && showWorkload && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-900/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-violet-600" />
              Workload by Employee (Click any employee to filter tasks)
            </h3>
            {selectedEmployeeId !== 'ALL' && (
              <button
                onClick={() => setSelectedEmployeeId('ALL')}
                className="text-[11px] font-bold text-violet-600 hover:underline"
              >
                Clear Employee Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {workloadByEmployee.map(({ employee, total, overdue, critical }) => (
              <button
                key={employee.id}
                onClick={() => {
                  setSelectedEmployeeId(employee.id);
                  setTaskScope('BY_EMPLOYEE');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedEmployeeId === employee.id
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-violet-400'
                }`}
              >
                <p className="text-xs font-bold truncate">{employee.name}</p>
                <p className={`text-[10px] truncate ${selectedEmployeeId === employee.id ? 'text-violet-100' : 'text-slate-400'}`}>
                  {employee.department}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                  <span>{total} Tasks</span>
                  {critical > 0 && (
                    <span className={selectedEmployeeId === employee.id ? 'text-amber-200' : 'text-rose-600'}>
                      {critical} Crit
                    </span>
                  )}
                  {overdue > 0 && (
                    <span className={selectedEmployeeId === employee.id ? 'text-rose-200' : 'text-amber-600'}>
                      {overdue} Late
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Priority Conflict Banner */}
      {visibleConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              {visibleConflicts.length} Multi-Director Priority Conflict(s) detected across organization (e.g. {visibleConflicts[0].employeeName} has {visibleConflicts[0].tasks.length} competing urgent tasks).
            </div>
            {!visibleConflicts[0].escalated && !isChairperson && (
              <button
                onClick={() => escalatePriorityConflict(visibleConflicts[0].tasks.map((t) => t.id))}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
              >
                Escalate to Founder
              </button>
            )}
          </div>
          {isChairperson && (
            <div className="flex flex-wrap gap-2 pt-1">
              {visibleConflicts.map((c) => (
                <div key={c.employeeId} className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.employeeName}:</span>
                  {c.tasks.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => {
                        setSelectedTask(ct);
                        setOverrideMode(true);
                        setOvPriority(ct.priority);
                        setOvDirPriority(ct.directorPriority);
                        setOvDueDate(ct.dueDate);
                        setOvAssigneeId(ct.assignedToId);
                        setOvStatus(ct.status);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-200"
                    >
                      {ct.id} ({ct.assigningDirectorName?.split(' ')[0] || ct.assignedByName})
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scope Tabs + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {scopeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTaskScope(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                taskScope === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Founder Searchable Employee Picker */}
          {isChairperson && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmpDropdown((v) => !v)}
                className="px-3 py-1.5 text-xs rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-violet-600" />
                {selectedEmployeeId === 'ALL'
                  ? 'Filter by Employee (All)'
                  : employees.find((e) => e.id === selectedEmployeeId)?.name || 'Employee'}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showEmpDropdown && (
                <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl z-40 p-2 space-y-1.5">
                  <input
                    type="text"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search employee name/dept..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                  <div className="max-h-56 overflow-y-auto space-y-0.5 text-xs">
                    <button
                      onClick={() => {
                        setSelectedEmployeeId('ALL');
                        setShowEmpDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold ${
                        selectedEmployeeId === 'ALL' ? 'bg-violet-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      All Employees ({authorizedTasks.length} tasks)
                    </button>
                    {searchableEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployeeId(emp.id);
                          setShowEmpDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          selectedEmployeeId === emp.id
                            ? 'bg-violet-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate font-semibold">{emp.name}</span>
                        <span className={`text-[10px] ml-2 shrink-0 ${selectedEmployeeId === emp.id ? 'text-violet-100' : 'text-slate-400'}`}>
                          {emp.department}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                    onClick={() => {
                      setSelectedTask(t);
                      setOverrideMode(false);
                      setOvAssigneeId(t.assignedToId);
                      setOvStatus(t.status);
                    }}
                    className="cursor-pointer p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 shadow-sm space-y-1.5"
                  >
                    <div className="flex justify-between items-center gap-1">
                      <span className="text-[10px] font-mono font-bold text-violet-600 flex items-center gap-1">
                        {t.id} {t.highlighted && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                      </span>
                      <StatusBadge label={t.directorPriority} variant="purple" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">{t.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate">
                      To: <b>{t.assignedToName || 'Unassigned'}</b>
                      {isChairperson && t.assignedToId && (
                        <span className="text-slate-400"> ({getEmployeeRoleLabel(t.assignedToId)})</span>
                      )}
                    </p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400 truncate">
                      By: {t.assigningDirectorName || t.assignedByName}
                    </p>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {t.department}
                      </span>
                      {t.reasonForUrgency && (
                        <span
                          title={t.reasonForUrgency}
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 truncate max-w-[120px]"
                        >
                          Urgent: {t.reasonForUrgency}
                        </span>
                      )}
                    </div>
                    {isChairperson && (
                      <div
                        title={getReportingChain(t)}
                        className="text-[9px] text-slate-400 hover:text-violet-600 truncate cursor-help"
                      >
                        Chain: {getReportingChain(t)}
                      </div>
                    )}
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
                <th className="py-3 px-4">ID & Task Title</th>
                <th className="py-3 px-4">Assigning Director</th>
                <th className="py-3 px-4">Assigned Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Task Priority</th>
                <th className="py-3 px-4">Director Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
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
                  title={isChairperson ? `Reporting Chain: ${getReportingChain(t)}` : undefined}
                  className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                >
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-[10px] text-violet-600 mr-1.5">{t.id}</span>
                    {t.title}
                  </td>
                  <td className="py-3 px-4 text-purple-600 font-semibold">{t.assigningDirectorName || t.assignedByName}</td>
                  <td className="py-3 px-4">
                    {t.assignedToName || 'Unassigned'}
                    {isChairperson && t.assignedToId && (
                      <span className="text-[10px] text-slate-400 block">{getEmployeeRoleLabel(t.assignedToId)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{t.department}</td>
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
            <div
              key={t.id}
              onClick={() => {
                setSelectedTask(t);
                setOverrideMode(false);
                setOvAssigneeId(t.assignedToId);
                setOvStatus(t.status);
              }}
              className="cursor-pointer p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-mono font-bold text-violet-600">{t.id} • {t.startDate} → {t.dueDate}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{t.title}</p>
                <p className="text-[11px] text-slate-500">
                  {t.assignedToName || 'Unassigned'} ({t.department}) • {t.assigningDirectorName || t.assignedByName}
                </p>
              </div>
              <div className="flex gap-1.5">
                <StatusBadge label={t.status} variant={t.status === 'Approved' ? 'success' : 'info'} />
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

      {/* TASK DETAILS DRAWER */}
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
              <div><span className="text-slate-400 block">Assigning Director</span><b>{liveSelectedTask.assigningDirectorName || liveSelectedTask.assignedByName}</b></div>
              <div><span className="text-slate-400 block">Assigned Employee</span><b>{liveSelectedTask.assignedToName || 'Unassigned'}</b></div>
              <div><span className="text-slate-400 block">Department</span><b>{liveSelectedTask.department}</b></div>
              <div><span className="text-slate-400 block">Task Urgency</span><b>{liveSelectedTask.priority}</b></div>
              <div><span className="text-slate-400 block">Director Work Priority</span><b>{liveSelectedTask.directorPriority}</b></div>
              <div><span className="text-slate-400 block">Deadline</span><b>{liveSelectedTask.dueDate}</b></div>
            </div>

            {isChairperson && (
              <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 text-[11px] text-violet-800 dark:text-violet-200">
                <b>Reporting Chain:</b> {getReportingChain(liveSelectedTask)}
              </div>
            )}

            {liveSelectedTask.reasonForUrgency && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs">
                <b>Reason for Urgency:</b> {liveSelectedTask.reasonForUrgency}
              </div>
            )}

            {/* Employee Response Controls */}
            {liveSelectedTask.assignedToId === currentEmployee.id && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Your Response</span>
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
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Start
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResponseReasonInput('Reschedule Requested')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold"
                  >
                    Request Reschedule
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

            {/* Lifecycle Status (Founder can approve, return, or reopen any task in any status) */}
            <div className="flex flex-wrap gap-1.5">
              {LIFECYCLE_COLUMNS.map((st) => (
                <button
                  key={st}
                  onClick={() => updateTaskStatus(liveSelectedTask.id, st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    liveSelectedTask.status === st ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {st === 'Assigned' && liveSelectedTask.status === 'Approved' && isChairperson ? 'Reopen (Assigned)' : st}
                </button>
              ))}
              {(isChairperson || isDirector) && (
                <button
                  onClick={() => { setTransferModalTask(liveSelectedTask); setTransferToId(employees[0].id); }}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Reassign / Transfer
                </button>
              )}
            </div>

            {/* Founder Override Button (Reprioritize, Reassign, Schedule & Status) */}
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
                    Founder Override (Priority, Assignee, Status & Schedule)
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                    <p className="font-bold">Founder Full Override</p>
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
                        <option value="">Keep Current Assignee</option>
                        {employees.map((e) => (
                          <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                        ))}
                      </select>
                      <select value={ovStatus} onChange={(e) => setOvStatus(e.target.value as TaskLifecycleStatus)} className="p-2 rounded-lg border bg-white dark:bg-slate-900">
                        {LIFECYCLE_COLUMNS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <input type="date" value={ovDueDate} onChange={(e) => setOvDueDate(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
                    <input placeholder="Decision Note" value={ovNote} onChange={(e) => setOvNote(e.target.value)} className="w-full p-2 rounded-lg border bg-white dark:bg-slate-900" />
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
                <button onClick={() => { if (commentText.trim()) { addTaskComment(liveSelectedTask.id, commentText); setCommentText(''); } }} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TASK TRANSFER MODAL */}
      {transferModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-base font-bold">Reassign / Transfer Task</h3>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold">4. Assigned Employee</label>
                    <button
                      type="button"
                      onClick={() => setShowFreeSuggestions((v) => !v)}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Suggest Free Employees
                    </button>
                  </div>
                  <select value={form.assignedToId} onChange={(e) => setForm({ ...form, assignedToId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    {employees.map((e) => {
                      const wl = getEmployeeWorkload(e.id);
                      return (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.department} — {wl.availability})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Workload Warning & Free Employee Suggestions */}
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
                      <div>
                        <span className="font-semibold block mb-1">
                          Free / Light employees ({form.department}):
                        </span>
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
                      </div>
                    )}
                  </div>
                );
              })()}
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
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-violet-600 text-white font-bold">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
