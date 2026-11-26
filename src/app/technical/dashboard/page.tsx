'use client';

import { useState } from 'react';
import { BarChart3, BookOpen, BriefcaseBusiness } from 'lucide-react';
import ModulePage from '@/components/ui/ModulePage';
import TechnicalProjectsContent from '@/components/technical/TechnicalProjectsContent';
import TechnicalDocumentationContent from '@/components/technical/TechnicalDocumentationContent';
import TechnicalReportsContent from '@/components/technical/TechnicalReportsContent';

const tabs = [
  { id: 'projects', label: 'Projects', icon: BriefcaseBusiness },
  { id: 'documentation', label: 'Technical Documentation', icon: BookOpen },
  { id: 'reports', label: 'Technical Reports', icon: BarChart3 },
] as const;

type TechnicalTab = (typeof tabs)[number]['id'];

export default function TechnicalDashboardPage() {
  const [activeTab, setActiveTab] = useState<TechnicalTab>('projects');

  return (
    <ModulePage pathname="/technical/dashboard" hideQuickLinks>
      <section aria-label="Technical Team workspace" className="w-full">
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
          {activeTab === 'projects' && <TechnicalProjectsContent />}
          {activeTab === 'documentation' && <TechnicalDocumentationContent />}
          {activeTab === 'reports' && <TechnicalReportsContent />}
        </div>
      </section>
    </ModulePage>
  );
}
