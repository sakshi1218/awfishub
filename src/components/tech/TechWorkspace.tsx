'use client';

import { useState } from 'react';
import {
  BarChart3,
  BookOpenText,
  Code2,
  FolderKanban,
  Gauge,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import TechDashboard from './TechDashboard';
import TechReports from './TechReports';
import TechDocs from './TechDocs';
import TechProjects from './TechProjects';
import TechSprints from './TechSprints';
import TechTeam from './TechTeam';

type TechTab = 'dashboard' | 'reports' | 'docs' | 'projects' | 'sprints' | 'team';

const tabs: { id: TechTab; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Tech Dashboard', icon: Gauge },
  { id: 'reports', label: 'Tech Reports', icon: BarChart3 },
  { id: 'docs', label: 'Tech Docs', icon: BookOpenText },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'sprints', label: 'Sprints', icon: Code2 },
  { id: 'team', label: 'Team', icon: UsersRound },
];

export default function TechWorkspace() {
  const [activeTab, setActiveTab] = useState<TechTab>('dashboard');

  return (
    <div className="-m-4 min-h-[calc(100vh-72px)] min-w-0 space-y-5 bg-[#f8f7fc] p-4 dark:bg-slate-950 lg:-m-8 lg:p-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-[#ebe8f2] bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
          <Code2 className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            Tech Department Workspace
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Project tracking, technical documentation, reports, and tech operations.
          </p>
        </span>
      </header>

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div role="tablist" aria-label="Tech workspace sections" className="flex min-w-max gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 ${
                  active
                    ? 'border-fuchsia-200 bg-white text-fuchsia-700 shadow-sm dark:border-fuchsia-900 dark:bg-slate-900 dark:text-fuchsia-300'
                    : 'border-[#ebe8f2] bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-900 dark:hover:bg-violet-950/40 dark:hover:text-violet-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" className="min-w-0">
        {activeTab === 'dashboard' && <TechDashboard />}
        {activeTab === 'reports' && <TechReports />}
        {activeTab === 'docs' && <TechDocs />}
        {activeTab === 'projects' && <TechProjects />}
        {activeTab === 'sprints' && <TechSprints />}
        {activeTab === 'team' && <TechTeam />}
      </div>
    </div>
  );
}
