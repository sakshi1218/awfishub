import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, CircleDot, Layers3, LayoutGrid } from 'lucide-react';
import { flatNavigation, getNavigationAncestors, getNavigationEntry } from '@/lib/navigation';

interface ModulePageProps {
  pathname: string;
  title?: string;
  description?: string;
  children?: ReactNode;
  hideQuickLinks?: boolean;
}

export default function ModulePage({
  pathname,
  title,
  description,
  children,
  hideQuickLinks = false,
}: ModulePageProps) {
  const entry = getNavigationEntry(pathname);
  const resolvedTitle = title ?? entry?.label ?? pathname.split('/').pop()?.replace(/-/g, ' ') ?? 'Module';
  const resolvedDescription =
    description ??
    entry?.description ??
    'This page establishes the module structure for future workflow development.';
  const ancestors = getNavigationAncestors(pathname);
  const sectionName = entry?.section ?? ancestors[ancestors.length - 1]?.section ?? 'AWSFISHUB';
  const parentName = entry?.parent;
  const isTechnicalDashboard = pathname === '/technical/dashboard';
  const quickLinks = flatNavigation
    .filter((candidate) =>
      candidate.href !== pathname &&
      candidate.section === sectionName &&
      (parentName ? candidate.parent === parentName : !candidate.parent)
    )
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className={`relative isolate overflow-hidden bg-gradient-to-br px-5 py-6 sm:px-7 ${isTechnicalDashboard ? 'from-violet-50 via-white to-indigo-50 dark:from-violet-950/40 dark:via-slate-900 dark:to-indigo-950/30' : 'from-indigo-50 via-white to-blue-50 dark:from-indigo-950/60 dark:via-slate-900 dark:to-blue-950/40'}`}>
          <div className={`pointer-events-none absolute -right-10 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] ${isTechnicalDashboard ? 'border-violet-100/70 dark:border-violet-900/20' : 'border-indigo-100/60 dark:border-indigo-900/20'}`} />
          <div className={`pointer-events-none absolute right-28 top-12 -z-10 h-20 w-20 rounded-full border border-dashed ${isTechnicalDashboard ? 'border-violet-200 dark:border-violet-900/70' : 'border-blue-200 dark:border-blue-900/70'}`} />
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-700 dark:hover:text-indigo-300">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span>{sectionName}</span>
            {parentName && (
              <>
                <span aria-hidden="true">/</span>
                <span>{parentName}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-slate-800 dark:text-slate-200">{resolvedTitle}</span>
          </nav>

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-3xl">
              <span className={`mb-3 inline-flex items-center gap-1.5 rounded-full border bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] dark:bg-slate-900/70 ${isTechnicalDashboard ? 'border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-300' : 'border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300'}`}>
                <CircleDot className="h-3 w-3" />
                {isTechnicalDashboard ? 'DEMO DATA · UI PROTOTYPE' : 'UI structure · Demo preview'}
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {resolvedTitle}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {resolvedDescription}
              </p>
            </div>
            <span className={`inline-flex w-fit items-center gap-2 rounded-xl border bg-white/80 px-3 py-2 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 ${isTechnicalDashboard ? 'border-violet-200 dark:border-violet-900' : 'border-slate-200'}`}>
              <Layers3 className={`h-4 w-4 ${isTechnicalDashboard ? 'text-violet-600 dark:text-violet-400' : 'text-indigo-600 dark:text-indigo-400'}`} />
              {isTechnicalDashboard ? 'Technical workspace' : 'Initial module layout'}
            </span>
          </div>
        </div>

        {parentName !== 'Technical Team' && !isTechnicalDashboard && (
          <div className={`grid gap-3 border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5 ${isTechnicalDashboard ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-3'}`}>
          {[
            { label: 'Module structure', value: 'Ready for review', icon: LayoutGrid },
            { label: 'Interaction state', value: 'Prototype only', icon: CircleDot },
            { label: 'Data source', value: 'No live records', icon: Layers3 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60 ${isTechnicalDashboard ? 'h-full min-h-[76px]' : ''}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className={`min-w-0 ${isTechnicalDashboard ? 'flex-1' : ''}`}>
                  <span className="block text-[10px] font-medium leading-4 text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span className="block text-xs font-semibold leading-5 text-slate-800 dark:text-slate-100">{item.value}</span>
                </span>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {children ?? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <LayoutGrid className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              Module layout is in place
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Detailed workflows will be added in a later phase. This prototype does not save or process real records.
            </p>
          </div>
        </section>
      )}

      {!hideQuickLinks && parentName !== 'Technical Team' && quickLinks.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Explore this area</h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Related AWSFISHUB module pages</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((quickLink) => (
              <Link
                key={quickLink.href}
                href={quickLink.href ?? '/'}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{quickLink.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                </span>
                <span className="mt-2 block text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  {quickLink.description}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
