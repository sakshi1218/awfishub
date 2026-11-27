'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { FOUNDER_PILLARS, CompanyPillar } from '@/data/mock/founderPillars';
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
    <div className="w-full space-y-8 sm:space-y-10 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <header className="space-y-2 text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#0f172a] dark:text-white leading-tight">
          Welcome Back, Founder!
        </h1>
        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium">
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
              className={`group text-left p-7 sm:p-8 rounded-[28px] border ${pillar.accentColor.cardBorder} ${pillar.accentColor.cardTint} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-500`}
            >
              <div>
                {/* Vertical Name */}
                <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-[#0f172a] dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {pillar.name}
                </h2>

                {/* Short Description */}
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed min-h-[44px]">
                  {pillar.description}
                </p>

                {/* Relevant Summary Statistics */}
                <div className="mt-8 space-y-3.5 border-t border-slate-200/70 dark:border-slate-800/80 pt-6">
                  {pillar.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between text-sm py-0.5"
                    >
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {stat.label}
                      </span>
                      <span className="font-extrabold text-[#0f172a] dark:text-white tabular-nums text-base">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple Text Link at the bottom */}
              <div className="mt-9 pt-5 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300 group-hover:underline flex items-center gap-1.5">
                  Open {pillar.name === 'AI IT SOLUTIONS' ? 'AI IT Solutions' : pillar.name.charAt(0) + pillar.name.slice(1).toLowerCase()}
                </span>
                <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
