'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  ListTodo,
  Users,
  GitFork,
  Megaphone,
  Film,
  BookOpen,
  Building2,
  CalendarDays,
  BriefcaseBusiness,
  Code2,
  HardDrive,
  BadgeDollarSign,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  showBusinessPillarsSidebar: boolean;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  showBusinessPillarsSidebar,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentEmployee, isChairperson, isDirector, isOperationHead, notifications } = useApp();
  const unreadCount = notifications.filter(
    (n) => (!n.userId || n.userId === currentEmployee.id) && !n.isRead
  ).length;

  const navItems = [
    { label: 'Business Pillars', href: '/overview', icon: LayoutDashboard, visible: true },
    { label: 'My Tasks', href: '/my-tasks', icon: ListTodo, visible: !isChairperson },
    { label: 'Task Management', href: '/tasks', icon: CheckSquare, visible: isChairperson || isDirector || isOperationHead },
    { label: 'Employees', href: '/employees', icon: Users, visible: true },
    { label: 'Department Dashboard', href: '/departments', icon: Building2, visible: true },
    { label: 'Organization Chart', href: '/organization', icon: GitFork, visible: true },
    { label: 'Workshops', href: '/campaigns', icon: Megaphone, visible: true },
    { label: 'LMS Dashboard', href: '/learning/dashboard', icon: BookOpen, visible: true },
    { label: 'Placement Drives', href: '/placement-drives', icon: BriefcaseBusiness, visible: isChairperson },
    { label: 'Colleges & Experts', href: '/colleges', icon: Building2, visible: true },
    { label: 'Events & Expos', href: '/events', icon: CalendarDays, visible: true },
    {
      label: 'Assets',
      href: '/assets',
      icon: HardDrive,
      badge: isChairperson ? 'Full' : 'My Assets',
      visible: true,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
      visible: true,
    },
    { label: 'Settings & Roles', href: '/settings', icon: Settings, visible: true },
  ];
  const overviewNavItems: typeof navItems = [
    { label: 'Business Pillars', href: '/overview', icon: LayoutDashboard, visible: true },
    { label: 'Media', href: '/media', icon: Film, visible: true },
    { label: 'Sales', href: '/sales', icon: BadgeDollarSign, visible: true },
    { label: 'Technical Team', href: '/technical/dashboard', icon: Code2, visible: true },
    { label: 'Overall Employees', href: '/overall-employees', icon: Users, visible: true },
    {
      label: 'Accounts',
      href: '/accounts',
      icon: BadgeDollarSign,
      visible: isChairperson || currentEmployee.id === 'AWF-EMP-004',
    },
  ];
  const displayedNavItems = showBusinessPillarsSidebar ? overviewNavItems : navItems;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#1a1033] border-r border-slate-200 dark:border-purple-900/40 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-purple-900/40 shrink-0">
          {!collapsed ? (
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-blue-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-fuchsia-500/30">
                A
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white flex items-center gap-1.5">
                  AWFIS HUB
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-fuchsia-500/20 text-violet-600 dark:text-pink-200 border border-violet-200 dark:border-fuchsia-400/30">
                    MindLyft
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 dark:text-purple-300 block">Enterprise UI Prototype</span>
              </div>
            </Link>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-blue-500 flex items-center justify-center font-black text-white text-sm">
              A
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-slate-800 dark:hover:text-violet-300"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav List */}
        <nav className="flex-1 overflow-y-auto px-3 py-1.5 space-y-0.5 custom-scrollbar">
          {displayedNavItems
            .filter((item) => item.visible)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/overview'
                  ? pathname === '/' || pathname === '/dashboard' || pathname === '/overview'
                  : pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onFocus={() => router.prefetch(item.href)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-purple-900/30'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-violet-100 dark:bg-slate-800 text-violet-600 dark:text-blue-400 border border-violet-200 dark:border-blue-500/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
        </nav>

        {!collapsed && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>MindLyft • Mock UI State</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
