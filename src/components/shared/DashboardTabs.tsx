'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type DashboardTab = {
  id: string;
  label: string;
  icon?: LucideIcon;
};

export default function DashboardTabs({
  id,
  ariaLabel,
  tabs,
  value,
  onChange,
  children,
}: {
  id: string;
  ariaLabel: string;
  tabs: readonly DashboardTab[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = Math.max(0, tabs.findIndex((tab) => tab.id === value));

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    let nextIndex = selectedIndex;

    if (event.key === 'ArrowRight') nextIndex = (selectedIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (selectedIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    onChange(nextTab.id);
    buttonRefs.current[nextIndex]?.focus();
  };

  const selectedTab = tabs[selectedIndex];

  return (
    <div>
      <div
        className="flex min-w-0 flex-wrap items-center gap-1.5 rounded-2xl border border-[#e7e2ef] bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        role="tablist"
        aria-label={ariaLabel}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
          <button
            key={tab.id}
            ref={(element) => { buttonRefs.current[index] = element; }}
            id={`${id}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            aria-controls={`${id}-panel`}
            tabIndex={value === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={handleKeyDown}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:px-4 ${
              value === tab.id
                ? 'bg-violet-600 text-white shadow-sm hover:bg-violet-700'
                : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-950/50 dark:hover:text-violet-200'
            }`}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {tab.label}
          </button>
          );
        })}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${selectedTab.id}`}
        tabIndex={0}
        className="mt-4 focus-visible:outline-none"
      >
        {children}
      </div>
    </div>
  );
}
