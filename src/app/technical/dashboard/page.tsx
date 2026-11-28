'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3, BookOpen, BriefcaseBusiness, Code2, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { AuthProvider } from '@/context/AuthContext';
import TechnicalEmployeesContent from '@/components/technical/TechnicalEmployeesContent';
import TechnicalProjectsContent from '@/components/technical/TechnicalProjectsContent';
import TechnicalDocumentationContent from '@/components/technical/TechnicalDocumentationContent';
import TechnicalReportsContent from '@/components/technical/TechnicalReportsContent';

const tabs = [
  { id: 'employees', label: 'Tech Employees', icon: Users },
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'documentation', label: 'Technical Documentation', icon: BookOpen },
  { id: 'reports', label: 'Technical Reports', icon: BarChart3 },
] as const;

type TechnicalTab = (typeof tabs)[number]['id'];

export default function TechnicalDashboardPage() {
  const [activeTab, setActiveTab] = useState<TechnicalTab>('employees');

  return (
    <AuthProvider>
      <div className="space-y-6"><PageHeader title="Technical Team Workspace" subtitle="Technical employees, projects, documentation and delivery reports." icon={Code2} actions={<Link href="/departments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ArrowLeft className="h-4 w-4" /> Back</Link>} /><section aria-label="Technical Team workspace" className="w-full">
        <div role="tablist" aria-label="Technical Team sections" className="flex w-full gap-2 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                id={`technical-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="technical-tab-panel"
                onClick={() => setActiveTab(id)}
                className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950 ${
                  selected
                  ? 'border-violet-200 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/70 hover:text-violet-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-900 dark:hover:bg-violet-950/30 dark:hover:text-violet-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <div
          id="technical-tab-panel"
          role="tabpanel"
          aria-labelledby={`technical-tab-${activeTab}`}
          className="mt-5"
        >
          {activeTab === 'employees' && <TechnicalEmployeesContent />}
          {activeTab === 'projects' && <TechnicalProjectsContent />}
          {activeTab === 'documentation' && <TechnicalDocumentationContent />}
          {activeTab === 'reports' && <TechnicalReportsContent />}
        </div>
      </section></div>
    </AuthProvider>
  );
}
