'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [cat, setCat] = useState('ALL');

  const filtered = notifications.filter((n) => cat === 'ALL' || n.category === cat);
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        subtitle="Task assignments, transfers, approvals, follow-up reminders, asset returns, and recurring bill alerts."
        icon={Bell}
        badge={`${unread} Unread`}
        actions={
          <button onClick={markAllNotificationsRead} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {['ALL', 'Task Assignment', 'Task Transfer', 'Approval', 'Follow-up', 'Finance', 'Asset'].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              cat === c
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`cursor-pointer p-4 rounded-2xl border transition-all flex flex-wrap justify-between items-center gap-3 text-xs ${
              n.isRead
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge label={n.category} variant={n.isRead ? 'default' : 'info'} />
                <span className="font-bold text-slate-900 dark:text-white">{n.title}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-1">{n.message}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
            </div>
            <Link href={n.targetUrl} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-blue-600">
              Open →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
