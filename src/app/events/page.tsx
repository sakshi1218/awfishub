'use client';

import React, { useState } from 'react';
import { CalendarDays, MapPin, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function EventsPage() {
  const { events, isChairperson } = useApp();
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Expo' | 'External Event' | 'Internal Event'>('ALL');

  const filtered = events.filter((e) =>
    typeFilter === 'ALL' ||
    (typeFilter === 'External Event'
      ? e.eventType !== 'Expo' && e.eventType !== 'Internal Event'
      : e.eventType === typeFilter)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events, Expos & Post-Event ROI"
        subtitle="Unified management for Expos, Internal Workshops, College Workshops, FDPs, and External Events."
        icon={CalendarDays}
        badge={`${filtered.length} Events`}
      />

      <div className="flex flex-wrap gap-1.5">
        {(['ALL', 'Expo', 'External Event', 'Internal Event'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              typeFilter === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((evt) => (
          <div key={evt.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-bold text-indigo-600">{evt.id} • {evt.eventType}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{evt.name}</h3>
              </div>
              <StatusBadge label={evt.status} variant={evt.status === 'Completed' ? 'success' : 'info'} />
            </div>

            <p className="flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {evt.venue} • {evt.date}
            </p>
            {evt.boothDetails && <p className="text-indigo-600 font-semibold">Expo Stall: {evt.boothDetails}</p>}
            <p className="text-slate-500">Organizer: <b>{evt.organizer}</b> • Teams: {evt.participatingDepartments.join(', ')}</p>

            {/* Post-Event Report Metrics */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b>{evt.leadsCollected}</b><span className="block text-[10px] text-slate-400">Leads</span></div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b>{evt.qualifiedLeads}</b><span className="block text-[10px] text-slate-400">Qualified</span></div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b className="text-emerald-600">{evt.conversions}</b><span className="block text-[10px] text-slate-400">Converted</span></div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                {isChairperson ? (
                  <>
                    <b>₹{(evt.expenseRef / 100000).toFixed(1)}L</b>
                    <span className="block text-[10px] text-slate-400">Expense</span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 flex flex-col items-center justify-center h-full">
                    <Lock className="w-3 h-3 mb-0.5" /> Restricted
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
