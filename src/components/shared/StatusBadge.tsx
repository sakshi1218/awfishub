'use client';

import React from 'react';

interface StatusBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
};

export function StatusBadge({ label, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}
