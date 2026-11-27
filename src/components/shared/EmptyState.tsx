'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center">
      <div className="w-10 h-10 mx-auto rounded-xl bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
        <Inbox className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
