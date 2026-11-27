'use client';

import React, { useState } from 'react';
import { Globe, CalendarDays } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CRMPipelineStage, OpenMarketLead } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

const CATEGORIES: Array<'ALL' | OpenMarketLead['category']> = [
  'ALL',
  'Direct B2C',
  'Corporate Clients',
  'External Organizations',
  'Workshop Opportunities',
  'Training Opportunities',
  'Other Outside Sales',
];

const STAGES: CRMPipelineStage[] = ['New', 'Contacted', 'Interested', 'Pitched', 'Negotiation', 'Agreement', 'Won', 'Lost'];

export default function OpenMarketPage() {
  const { openMarketLeads, updateOpenMarketStage } = useApp();
  const [catFilter, setCatFilter] = useState<'ALL' | OpenMarketLead['category']>('ALL');

  const filtered = openMarketLeads.filter((l) => catFilter === 'ALL' || l.category === catFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Open Market Management"
        subtitle="Direct B2C, Corporate Clients, External Organizations, and Event/Expo originating opportunities."
        icon={Globe}
        badge={`${filtered.length} Leads`}
      />

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              catFilter === c
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lead) => (
          <div key={lead.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="flex justify-between items-start gap-2">
              <StatusBadge label={lead.category} variant="info" />
              <StatusBadge label={lead.interestLevel} variant={lead.interestLevel === 'Hot' ? 'danger' : 'warning'} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{lead.leadName}</h3>
              <p className="text-[11px] text-slate-500">{lead.organization} • {lead.contactPerson}</p>
            </div>
            <p className="text-slate-600 dark:text-slate-300">{lead.requirement}</p>
            {lead.originatingEvent && (
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                Originating Event: {lead.originatingEvent}
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-emerald-600">₹{(lead.expectedOpportunity / 100000).toFixed(2)}L</span>
              <select
                value={lead.stage}
                onChange={(e) => updateOpenMarketStage(lead.id, e.target.value as CRMPipelineStage)}
                className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              >
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
