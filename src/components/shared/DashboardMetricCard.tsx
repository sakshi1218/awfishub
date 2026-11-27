'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'indigo';
}

const toneMap = {
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
  indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10',
};

export function DashboardMetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone = 'blue',
}: DashboardMetricCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className={`p-1.5 rounded-lg ${toneMap[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
      {subtext && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}
