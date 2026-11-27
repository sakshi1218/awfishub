'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FOUNDER_PILLARS } from '@/data/mock/founderPillars';
import VerticalDetailView from './VerticalDetailView';

export default function FounderDashboard() {
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);

  if (selectedVertical && FOUNDER_PILLARS[selectedVertical]) {
    return (
      <VerticalDetailView
        pillar={FOUNDER_PILLARS[selectedVertical]}
        onBack={() => setSelectedVertical(null)}
      />
    );
  }

  const pillarsList = [
    FOUNDER_PILLARS['education'],
    FOUNDER_PILLARS['innovation'],
    FOUNDER_PILLARS['ai-it-solutions'],
  ];

  return (
    <div className="w-full space-y-8 sm:space-y-10 py-3 sm:py-6">
      {/* Executive Welcome Header */}
      <header className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold tracking-tight text-slate-900 dark:text-white">
          Welcome Back, Founder!
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Manage all three business verticals from one central workspace.
        </p>
      </header>

      {/* Exactly Three Main Company Pillars in a single horizontal row on desktop */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {pillarsList.map((pillar) => {
          return (
            <div
              key={pillar.id}
              onClick={() => setSelectedVertical(pillar.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedVertical(pillar.id);
                }
              }}
              className="group text-left p-7 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141824] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 dark:focus-visible:ring-white"
            >
              <div>
                {/* Vertical Name */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-[22px] font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {pillar.name}
                  </h2>
                </div>

                {/* Short Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed min-h-[42px]">
                  {pillar.description}
                </p>

                {/* Relevant Summary Statistics */}
                <div className="mt-7 space-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
                  {pillar.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between text-sm py-0.5"
                    >
                      <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                        {stat.label}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums text-sm">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple Text Link at the bottom */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  Open {pillar.name === 'AI IT SOLUTIONS' ? 'AI IT Solutions' : pillar.name.charAt(0) + pillar.name.slice(1).toLowerCase()}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
