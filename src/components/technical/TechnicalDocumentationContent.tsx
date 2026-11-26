'use client';

import { useState } from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import TechnicalInfoDialog, { type TechnicalInfoItem } from '@/components/technical/TechnicalInfoDialog';

const documents: TechnicalInfoItem[] = [
  {
    title: 'CalibiUpx — Placement Assessment Software',
    preview: 'A sample platform for creating online assessments that measure student skills and placement readiness.',
    details: [
      { label: 'Technology stack', value: 'Next.js, TypeScript, PostgreSQL' },
      { label: 'Overview', value: 'A sample platform for creating online assessments that measure student skills and placement readiness.' },
      { label: 'Main functionality', value: 'Test creation, timed assessments, automatic scoring, and performance summaries.' },
      { label: 'Technical notes', value: 'Example structure separates assessment setup, test delivery, and results.' },
    ],
  },
  {
    title: 'Emellos — Email Campaigning & Newsletter Marketing Software',
    preview: 'A sample service for designing newsletters and sending campaigns to subscriber lists.',
    details: [
      { label: 'Technology stack', value: 'React, Node.js, PostgreSQL' },
      { label: 'Overview', value: 'A sample service for designing newsletters and sending campaigns to subscriber lists.' },
      { label: 'Main functionality', value: 'Newsletter editing, subscriber management, campaign scheduling, and delivery analytics.' },
      { label: 'Technical notes', value: 'Example structure groups campaign content, recipients, and delivery results.' },
    ],
  },
  {
    title: 'Awficio — Human Resource Management System',
    preview: 'A sample system for keeping employee records and handling everyday HR work.',
    details: [
      { label: 'Technology stack', value: 'Next.js, TypeScript, PostgreSQL' },
      { label: 'Overview', value: 'A sample system for keeping employee records and handling everyday HR work.' },
      { label: 'Main functionality', value: 'Employee profiles, attendance, leave, onboarding, and employee self-service.' },
      { label: 'Technical notes', value: 'Example structure organizes employee information and HR workflows by function.' },
    ],
  },
];

export default function TechnicalDocumentationContent() {
  const [selectedDocument, setSelectedDocument] = useState<TechnicalInfoItem | null>(null);

  return (
    <section aria-label="Technical documentation">
      <div className="grid items-stretch gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {documents.map((document) => (
          <button
            key={document.title}
            type="button"
            onClick={() => setSelectedDocument(document)}
            aria-haspopup="dialog"
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-900 dark:focus-visible:ring-offset-slate-950 sm:p-6"
          >
            <span className="flex w-full items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="text-[15px] font-semibold leading-6 text-slate-900 dark:text-white">{document.title}</span>
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
            </span>
            <span className="mt-3 text-[13px] leading-5 text-slate-600 dark:text-slate-300">{document.preview}</span>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 group-hover:text-violet-800 dark:text-violet-300 dark:group-hover:text-violet-200">
              View documentation <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      {selectedDocument && (
        <TechnicalInfoDialog item={selectedDocument} onClose={() => setSelectedDocument(null)} />
      )}
    </section>
  );
}
