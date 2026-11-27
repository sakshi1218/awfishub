'use client';

import { useState } from 'react';
import { ArrowUpRight, BarChart3 } from 'lucide-react';
import TechnicalInfoDialog, { type TechnicalInfoItem } from '@/components/technical/TechnicalInfoDialog';

const reports: TechnicalInfoItem[] = [
  {
    title: 'Assessment flow review',
    preview: 'CalibiUpx · 2026-11-10',
    details: [
      { label: 'Project', value: 'CalibiUpx' },
      { label: 'Date', value: '2026-11-10' },
      { label: 'Completed', value: 'Sample assessment setup and scoring flow reviewed.' },
      { label: 'Ongoing', value: 'Example results summary is being refined.' },
      { label: 'Issues', value: 'None listed in this sample.' },
      { label: 'Next', value: 'Review the sample summary with users.' },
    ],
  },
  {
    title: 'Subscriber campaign workflow',
    preview: 'Emellos · 2026-11-14',
    details: [
      { label: 'Project', value: 'Emellos' },
      { label: 'Date', value: '2026-11-14' },
      { label: 'Completed', value: 'Sample subscriber import and unsubscribe steps documented.' },
      { label: 'Ongoing', value: 'Example campaign scheduling flow is under review.' },
      { label: 'Issues', value: 'Demo note: confirm email delivery requirements.' },
      { label: 'Next', value: 'Check the sample flow from campaign setup through delivery.' },
    ],
  },
  {
    title: 'Employee profile workflow',
    preview: 'Awficio · 2026-11-18',
    details: [
      { label: 'Project', value: 'Awficio' },
      { label: 'Date', value: '2026-11-18' },
      { label: 'Completed', value: 'Sample employee profile fields organized for review.' },
      { label: 'Ongoing', value: 'Example onboarding steps are being outlined.' },
      { label: 'Issues', value: 'None listed in this sample.' },
      { label: 'Next', value: 'Review the proposed profile and onboarding information.' },
    ],
  },
];

export default function TechnicalReportsContent() {
  const [selectedReport, setSelectedReport] = useState<TechnicalInfoItem | null>(null);

  return (
    <section aria-label="Technical reports">
      <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {reports.map((report) => (
          <button
            key={report.title}
            type="button"
            onClick={() => setSelectedReport(report)}
            aria-haspopup="dialog"
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900 dark:focus-visible:ring-offset-slate-950 sm:p-6"
          >
            <span className="flex w-full items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-[15px] font-semibold leading-6 text-slate-900 dark:text-white">{report.title}</span>
              <BarChart3 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
            </span>
            <span className="mt-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{report.preview}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 group-hover:text-violet-800 dark:text-violet-300 dark:group-hover:text-violet-200">
              View report <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {selectedReport && (
        <TechnicalInfoDialog item={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </section>
  );
}
