'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#130d26] p-5 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-600/15 via-fuchsia-500/15 to-blue-600/15 text-violet-600 dark:text-violet-400 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}
