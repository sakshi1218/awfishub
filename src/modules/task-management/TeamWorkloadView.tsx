'use client';

import React, { useState, useMemo } from 'react';
import { Search, Users, Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Employee } from '@/types';

interface TeamWorkloadViewProps {
  onGiveTaskToEmployee: (employee: Employee) => void;
}

type WorkloadGroup = 'ALL' | 'FREE' | 'LIGHT' | 'BUSY' | 'OVERLOADED';

const AVAILABILITY_BADGE: Record<
  'Free now' | 'Light load' | 'Busy' | 'Overloaded',
  { bg: string; dot: string }
> = {
  'Free now': {
    bg: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  'Light load': {
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

function getGroupFromOpenCount(openCount: number): {
  group: Exclude<WorkloadGroup, 'ALL'>;
  label: 'Free now' | 'Light load' | 'Busy' | 'Overloaded';
} {
  if (openCount === 0) return { group: 'FREE', label: 'Free now' };
  if (openCount <= 2) return { group: 'LIGHT', label: 'Light load' };
  if (openCount <= 5) return { group: 'BUSY', label: 'Busy' };
  return { group: 'OVERLOADED', label: 'Overloaded' };
}

function formatDueShort(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function TeamWorkloadView({ onGiveTaskToEmployee }: TeamWorkloadViewProps) {
  const { tasks, getVisibleEmployees } = useApp();

  const [selectedGroup, setSelectedGroup] = useState<WorkloadGroup>('ALL');
  const [search, setSearch] = useState<string>('');

  const visibleEmployees = getVisibleEmployees();

  // Single source of truth for both summary cards and employee list below
  const baseEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visibleEmployees
      .filter((emp) => {
        if (
          q &&
          !emp.name.toLowerCase().includes(q) &&
          !emp.department.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .map((emp) => {
        const openTasks = tasks
          .filter((t) => t.assignedToId === emp.id && t.status !== 'Approved')
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
        const { group, label } = getGroupFromOpenCount(openTasks.length);
        return {
          employee: emp,
          openTasks,
          group,
          label,
        };
      });
  }, [visibleEmployees, tasks, search]);

  const totalCount = baseEmployees.length;
  const freeCount = baseEmployees.filter((e) => e.group === 'FREE').length;
  const busyCount = baseEmployees.filter((e) => e.group === 'BUSY').length;
  const overloadedCount = baseEmployees.filter((e) => e.group === 'OVERLOADED').length;

  const displayedEmployees = useMemo(() => {
    const list =
      selectedGroup === 'ALL'
        ? baseEmployees
        : baseEmployees.filter((e) => e.group === selectedGroup);

    return [...list].sort(
      (a, b) => a.openTasks.length - b.openTasks.length || a.employee.name.localeCompare(b.employee.name)
    );
  }, [baseEmployees, selectedGroup]);

  const handleCardClick = (group: WorkloadGroup) => {
    setSelectedGroup((prev) => (prev === group ? 'ALL' : group));
  };

  return (
    <div className="space-y-5">
      {/* 4 Clickable Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => handleCardClick('ALL')}
          aria-pressed={selectedGroup === 'ALL'}
          className={`text-left p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
            selectedGroup === 'ALL'
              ? 'border-2 border-violet-600 dark:border-violet-400 bg-violet-50/40 dark:bg-violet-950/20'
              : 'border border-slate-200 dark:border-slate-800 hover:border-violet-300'
          }`}
        >
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-violet-600" /> Total employees
          </span>
          <span className="block text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('FREE')}
          aria-pressed={selectedGroup === 'FREE'}
          className={`text-left p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
            selectedGroup === 'FREE'
              ? 'border-2 border-emerald-600 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
              : 'border border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Free now
          </span>
          <span className="block text-2xl font-black text-emerald-600 mt-1">{freeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('BUSY')}
          aria-pressed={selectedGroup === 'BUSY'}
          className={`text-left p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 ${
            selectedGroup === 'BUSY'
              ? 'border-2 border-amber-500 dark:border-amber-400 bg-amber-50/40 dark:bg-amber-950/20'
              : 'border border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <span className="text-xs text-amber-600 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Busy (3–5)
          </span>
          <span className="block text-2xl font-black text-amber-600 mt-1">{busyCount}</span>
        </button>

        <button
          type="button"
          onClick={() => handleCardClick('OVERLOADED')}
          aria-pressed={selectedGroup === 'OVERLOADED'}
          className={`text-left p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 ${
            selectedGroup === 'OVERLOADED'
              ? 'border-2 border-rose-600 dark:border-rose-400 bg-rose-50/40 dark:bg-rose-950/20'
              : 'border border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Overloaded
          </span>
          <span className="block text-2xl font-black text-rose-600 mt-1">{overloadedCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or department..."
            className="w-full min-h-[42px] pl-9 pr-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-violet-600"
          />
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedEmployees.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            No employees match this filter.
          </div>
        ) : (
          displayedEmployees.map(({ employee, openTasks, label }) => {
            const badge = AVAILABILITY_BADGE[label];
            const firstName = employee.name.split(' ')[0] || employee.name;

            return (
              <div
                key={employee.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3.5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full ${employee.avatarColor} text-white font-bold text-xs flex items-center justify-center shrink-0`}
                      >
                        {employee.avatarInitials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {employee.name}
                        </h4>
                        <p className="text-xs text-slate-500 truncate">{employee.department}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 shrink-0 ${badge.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {label}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {openTasks.length} open {openTasks.length === 1 ? 'task' : 'tasks'}
                  </p>

                  {openTasks.length === 0 ? (
                    <p className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                      No open tasks. Ready for new work.
                    </p>
                  ) : (
                    <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                      {openTasks.map((t) => {
                        const overdue = t.dueDate < '2026-11-27';
                        return (
                          <li
                            key={t.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                              {t.title}
                            </span>
                            <span
                              className={`shrink-0 text-[11px] font-semibold ${
                                overdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                              }`}
                            >
                              {overdue ? `Overdue · ${formatDueShort(t.dueDate)}` : formatDueShort(t.dueDate)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onGiveTaskToEmployee(employee)}
                    className="w-full min-h-[42px] rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Give a task to {firstName}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
