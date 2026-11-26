'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Employee, TaskItem } from '@/types';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface TeamWorkloadViewProps {
  onAssignToEmployee: (employee: Employee) => void;
  onSelectTask: (task: TaskItem) => void;
}

const AVAILABILITY_BADGE: Record<
  'Free' | 'Light' | 'Busy' | 'Overloaded',
  { bg: string; dot: string }
> = {
  Free: {
    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Light: {
    bg: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  Busy: {
    bg: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  Overloaded: {
    bg: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    dot: 'bg-rose-500',
  },
};

export function TeamWorkloadView({ onAssignToEmployee, onSelectTask }: TeamWorkloadViewProps) {
  const {
    currentEmployee,
    isChairperson,
    isDirector,
    getVisibleEmployees,
    getEmployeeWorkload,
    getDirectorAllowedDepartments,
  } = useApp();

  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [directorFilter, setDirectorFilter] = useState<string>('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('ALL');
  const [onlyFree, setOnlyFree] = useState<boolean>(false);
  const [includeOtherTeams, setIncludeOtherTeams] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<'FREE_FIRST' | 'LOADED_FIRST' | 'NAME'>('FREE_FIRST');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const visibleEmployees = getVisibleEmployees(includeOtherTeams);

  const enriched = useMemo(() => {
    return visibleEmployees.map((emp) => ({
      employee: emp,
      workload: getEmployeeWorkload(emp.id),
    }));
  }, [visibleEmployees, getEmployeeWorkload]);

  // Summary strip counts
  const totalCount = enriched.length;
  const freeCount = enriched.filter((e) => e.workload.availability === 'Free').length;
  const busyCount = enriched.filter((e) => e.workload.availability === 'Busy').length;
  const overloadedCount = enriched.filter((e) => e.workload.availability === 'Overloaded').length;

  const isInDirectorScope = (emp: Employee) => {
    if (isChairperson) return true;
    if (!isDirector) return emp.id === currentEmployee.id;
    const allowed = getDirectorAllowedDepartments(currentEmployee.id);
    return (
      emp.id === currentEmployee.id ||
      emp.reportingDirectorId === currentEmployee.id ||
      allowed.includes(emp.department)
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = enriched.filter(({ employee, workload }) => {
      if (deptFilter !== 'ALL' && employee.department !== deptFilter) return false;
      if (directorFilter !== 'ALL') {
        const dirAllowed = getDirectorAllowedDepartments(directorFilter);
        if (
          employee.id !== directorFilter &&
          employee.reportingDirectorId !== directorFilter &&
          !dirAllowed.includes(employee.department)
        ) {
          return false;
        }
      }
      if (onlyFree && workload.availability !== 'Free') return false;
      if (availabilityFilter !== 'ALL' && workload.availability !== availabilityFilter) return false;
      if (
        q &&
        !employee.name.toLowerCase().includes(q) &&
        !employee.designation.toLowerCase().includes(q) &&
        !employee.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'FREE_FIRST') {
        return a.workload.activeCount - b.workload.activeCount || a.employee.name.localeCompare(b.employee.name);
      }
      if (sortBy === 'LOADED_FIRST') {
        return b.workload.activeCount - a.workload.activeCount || a.employee.name.localeCompare(b.employee.name);
      }
      return a.employee.name.localeCompare(b.employee.name);
    });
  }, [
    enriched,
    deptFilter,
    directorFilter,
    onlyFree,
    availabilityFilter,
    search,
    sortBy,
    getDirectorAllowedDepartments,
  ]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-violet-600" /> Total Employees
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Free Now
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{freeCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm">
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Busy (3–5 Tasks)
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">{busyCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 shadow-sm">
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Overloaded
          </p>
          <p className="text-2xl font-black text-rose-600 mt-1">{overloadedCount}</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee name..."
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none w-48"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            <option value="ALL">All Departments</option>
            {PERMANENT_DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {isChairperson && (
            <select
              value={directorFilter}
              onChange={(e) => setDirectorFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
            >
              <option value="ALL">All Directors / Teams</option>
              <option value="AWF-EMP-002">Anchal Agawane (Education)</option>
              <option value="AWF-EMP-003">Rutuja Botre (Innovation)</option>
              <option value="AWF-EMP-004">Shubham Jadhav (Tech & Accounts)</option>
            </select>
          )}

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            <option value="ALL">All Availability</option>
            <option value="Free">Free (0 tasks)</option>
            <option value="Light">Light (1–2 tasks)</option>
            <option value="Busy">Busy (3–5 tasks)</option>
            <option value="Overloaded">Overloaded (6+ / Critical Late)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'FREE_FIRST' | 'LOADED_FIRST' | 'NAME')}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
          >
            <option value="FREE_FIRST">Sort: Most Free First</option>
            <option value="LOADED_FIRST">Sort: Most Loaded First</option>
            <option value="NAME">Sort: Name (A–Z)</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyFree((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              onlyFree
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {onlyFree ? 'Showing Only Free ✓' : 'Show Only Free Employees'}
          </button>

          {isDirector && (
            <button
              type="button"
              onClick={() => setIncludeOtherTeams((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                includeOtherTeams
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              {includeOtherTeams ? 'All Teams (Read-Only)' : 'Spot Free Across Teams'}
            </button>
          )}
        </div>
      </div>

      {/* Employee Workload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(({ employee, workload }) => {
          const badge = AVAILABILITY_BADGE[workload.availability];
          const isExpanded = Boolean(expandedIds[employee.id]);
          const canAssign = isInDirectorScope(employee);
          const isFree = workload.availability === 'Free';

          return (
            <div
              key={employee.id}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col justify-between gap-3 transition-all ${
                isFree
                  ? 'border-emerald-300 dark:border-emerald-800'
                  : workload.availability === 'Overloaded'
                  ? 'border-rose-300 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                {/* Top row: Avatar, Name, Availability */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${employee.avatarColor} text-white font-extrabold text-xs flex items-center justify-center shrink-0`}
                    >
                      {employee.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                        {employee.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">{employee.designation}</p>
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
                        {employee.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {workload.availability}
                  </span>
                </div>

                {/* Counts */}
                <div className="grid grid-cols-5 gap-1.5 text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[10px]">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-xs">{workload.activeCount}</p>
                    <p className="text-slate-400">Active</p>
                  </div>
                  <div>
                    <p className="font-black text-blue-600 text-xs">{workload.inProgressCount}</p>
                    <p className="text-slate-400">In Prog</p>
                  </div>
                  <div>
                    <p className="font-black text-violet-600 text-xs">{workload.submittedCount}</p>
                    <p className="text-slate-400">Submit</p>
                  </div>
                  <div>
                    <p className="font-black text-amber-600 text-xs">{workload.overdueCount}</p>
                    <p className="text-slate-400">Late</p>
                  </div>
                  <div>
                    <p className="font-black text-rose-600 text-xs">{workload.criticalCount}</p>
                    <p className="text-slate-400">Crit</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Next Due: <strong className="text-slate-700 dark:text-slate-300">{workload.nextDueDate || 'None'}</strong>
                  </span>
                  {workload.activeTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(employee.id)}
                      className="text-violet-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      {isExpanded ? 'Hide Tasks' : `View Tasks (${workload.activeTasks.length})`}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Expandable Tasks List */}
                {isExpanded && workload.activeTasks.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-48 overflow-y-auto">
                    {workload.activeTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-violet-400 cursor-pointer text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-violet-600">{t.id}</span>
                          <StatusBadge label={t.priority} variant={t.priority === 'Critical' ? 'danger' : 'info'} />
                        </div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{t.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{t.status}</span>
                          <span>Due {t.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {canAssign ? (
                  <button
                    type="button"
                    onClick={() => onAssignToEmployee(employee)}
                    className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isFree
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        : 'bg-violet-600 hover:bg-violet-700 text-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isFree ? 'Assign Task (Free Now)' : 'Assign Task'}
                  </button>
                ) : (
                  <span className="w-full py-2 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-semibold">
                    Read-Only (Other Director Team)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
