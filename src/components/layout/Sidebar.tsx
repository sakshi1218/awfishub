'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GitFork,
  LayoutDashboard,
  Megaphone,
  Package,
  PhoneCall,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { navigationSections, type NavigationEntry } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const iconByName: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  workspace: FolderKanban,
  tasks: CheckSquare,
  reports: FileSpreadsheet,
  notifications: Bell,
  people: Users,
  organization: Building2,
  hierarchy: GitFork,
  projects: Briefcase,
  meetings: CalendarDays,
  attendance: Clock3,
  leave: Clock3,
  media: Megaphone,
  learning: BookOpen,
  calls: PhoneCall,
  technical: Code2,
  sales: BarChart3,
  operations: Settings,
  events: CalendarDays,
  finance: Wallet,
  assets: Package,
  documents: FileText,
  settings: Settings,
};

function isPathActive(pathname: string, href?: string) {
  if (href === '/sales') return pathname === href;
  return Boolean(href && (pathname === href || pathname.startsWith(`${href}/`)));
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ Overview: true });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const activeSection = navigationSections.find((section) =>
      section.entries.some((entry) => {
        if (isPathActive(pathname, entry.href)) return true;
        return entry.children?.some((child) => isPathActive(pathname, child.href)) ?? false;
      })
    );

    if (!activeSection) return;

    setOpenSections((current) => ({ ...current, [activeSection.label]: true }));
    const activeGroup = activeSection.entries.find((entry) =>
      entry.children?.some((child) => isPathActive(pathname, child.href))
    );

    if (activeGroup) {
      setOpenGroups((current) => ({
        ...current,
        [`${activeSection.label}:${activeGroup.label}`]: true,
      }));
    }
  }, [pathname]);

  const toggleSection = (section: string) => {
    if (collapsed) {
      setCollapsed(false);
      setOpenSections((current) => ({ ...current, [section]: true }));
      return;
    }
    setOpenSections((current) => ({ ...current, [section]: !current[section] }));
  };

  const toggleGroup = (section: string, group: string) => {
    const key = `${section}:${group}`;
    if (collapsed) {
      setCollapsed(false);
      setOpenGroups((current) => ({ ...current, [key]: true }));
      setOpenSections((current) => ({ ...current, [section]: true }));
      return;
    }
    setOpenGroups((current) => ({ ...current, [key]: !current[key] }));
  };

  const renderEntry = (entry: NavigationEntry, section: string, depth = 0) => {
    if (entry.children) {
      const key = `${section}:${entry.label}`;
      const expanded = Boolean(openGroups[key]);
      const groupActive = entry.children.some((child) => isPathActive(pathname, child.href));
      const Icon = iconByName[entry.icon ?? ''] ?? Building2;

      return (
        <div key={key} className={depth ? 'ml-2' : undefined}>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => toggleGroup(section, entry.label)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors ${
              groupActive
                ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{entry.label}</span>}
            </span>
            {!collapsed &&
              (expanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              ))}
          </button>
          {expanded && !collapsed && (
            <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-700">
              {entry.children.map((child) => renderEntry(child, section, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!entry.href) return null;

    const Icon = iconByName[entry.icon ?? ''] ?? LayoutDashboard;
    const active = isPathActive(pathname, entry.href);

    return (
      <Link
        key={entry.href}
        href={entry.href}
        onClick={() => setMobileOpen(false)}
        title={collapsed ? entry.label : undefined}
        aria-current={active ? 'page' : undefined}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors ${
          active
            ? 'bg-indigo-600 font-semibold text-white shadow-sm shadow-indigo-600/20'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        {depth === 0 && <Icon className="h-4 w-4 shrink-0" />}
        {!collapsed && <span className="truncate">{entry.label}</span>}
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-800 shadow-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 lg:shadow-none ${
          collapsed ? 'w-[76px]' : 'w-[288px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">
              A
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
                  AWSFISHUB
                </span>
                <span className="block truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  Business workspace
                </span>
              </span>
            )}
          </Link>
        </div>

        {!collapsed && currentUser && (
          <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {currentUser.name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">
                {currentUser.name}
              </span>
              <span className="block truncate text-[10px] text-slate-500 dark:text-slate-400">
                Demo preview · {currentUser.role.replace('_', ' ')}
              </span>
            </span>
          </div>
        )}

        <nav aria-label="Main navigation" className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          {navigationSections.map((section) => {
            const expanded = Boolean(openSections[section.label]);
            const sectionActive = section.entries.some((entry) => {
              if (isPathActive(pathname, entry.href)) return true;
              return entry.children?.some((child) => isPathActive(pathname, child.href)) ?? false;
            });

            return (
              <section key={section.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => toggleSection(section.label)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left ${
                    sectionActive
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {!collapsed && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em]">
                      {section.label}
                    </span>
                  )}
                  {collapsed ? (
                    <span className="mx-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  ) : expanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                {expanded && (
                  <div className="mt-1 space-y-0.5">
                    {section.entries.map((entry) => renderEntry(entry, section.label))}
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-3 py-3 dark:border-slate-800">
          {!collapsed && (
            <span className="text-[10px] font-medium text-slate-400">AWSFISHUB · UI preview</span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
          </button>
        </div>
      </aside>
    </>
  );
}
