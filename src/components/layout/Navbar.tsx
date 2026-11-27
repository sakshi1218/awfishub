'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Check,
  Sun,
  Moon,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RoleType } from '@/types';

interface NavbarProps {
  onMenuClick: () => void;
  isFounderLanding?: boolean;
}

const QUICK_ROUTES = [
  { label: 'Overview Dashboard', href: '/dashboard', section: 'Overview' },
  { label: 'My Tasks', href: '/my-tasks', section: 'Overview' },
  { label: 'Task Management & Transfers', href: '/tasks', section: 'Operations' },
  { label: 'Department Workspaces', href: '/workspaces', section: 'Workspaces' },
  { label: 'Employees & Role Seats', href: '/employees', section: 'Organization' },
  { label: 'Organization Chart', href: '/organization', section: 'Organization' },
  { label: 'Campaigns', href: '/campaigns', section: 'Growth' },
  { label: 'Media & Podcasts', href: '/media', section: 'Media' },
  { label: 'Sales & CRM', href: '/sales', section: 'Sales' },
  { label: 'TeleCaller', href: '/telecaller', section: 'Outreach' },
  { label: 'Courses & Batches', href: '/education', section: 'Education' },
  { label: 'Colleges & Experts', href: '/colleges', section: 'Partners' },
  { label: 'Open Market', href: '/open-market', section: 'Sales' },
  { label: 'Events & Expos', href: '/events', section: 'Events' },
  { label: 'Company Assets', href: '/assets', section: 'Administration' },
  { label: 'Accounts & Finance (Chairperson)', href: '/accounts', section: 'Finance' },
  { label: 'Documents', href: '/documents', section: 'Administration' },
  { label: 'Reports & Analytics', href: '/reports', section: 'Analytics' },
  { label: 'Settings & Permissions', href: '/settings', section: 'System' },
];

export default function Navbar({ onMenuClick, isFounderLanding }: NavbarProps) {
  const {
    currentRole,
    currentEmployee,
    switchRole,
    darkMode,
    toggleDarkMode,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    activeToast,
    dismissToast,
    isChairperson,
  } = useApp();

  const userNotifications = useMemo(
    () => notifications.filter((n) => !n.userId || n.userId === currentEmployee.id),
    [notifications, currentEmployee.id]
  );

  const [roleOpen, setRoleOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return QUICK_ROUTES.filter(
      (r) =>
        (r.href !== '/accounts' || isChairperson) &&
        `${r.label} ${r.section}`.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [search, isChairperson]);

  const roleOptions: {
    role: RoleType;
    label: string;
    name: string;
    empId: string;
    dept: string;
  }[] = [
    { role: 'CHAIRPERSON', label: 'Chairperson', name: 'Pooja Ahire', empId: 'AWF-EMP-001', dept: 'Executive Board' },
    { role: 'DIRECTOR', label: 'Education Director', name: 'Anchal Agawane', empId: 'AWF-EMP-002', dept: 'Trainer, Counselor, TeleCaller' },
    { role: 'DIRECTOR', label: 'Innovation Director', name: 'Rutuja Botre', empId: 'AWF-EMP-003', dept: 'Sales, Media, Interns' },
    { role: 'DIRECTOR', label: 'Director (Tech & Accounts)', name: 'Shubham Jadhav', empId: 'AWF-EMP-004', dept: 'Technical Team & Accounts' },
    { role: 'OPERATION_HEAD', label: 'Operation Head', name: 'Jayendra Walunj', empId: 'AWF-EMP-005', dept: 'Operation Team' },
    { role: 'TEAM_LEAD', label: 'Team Lead', name: 'Tanvi Patil', empId: 'AWF-EMP-008', dept: 'Technical Team' },
    { role: 'FACULTY', label: 'Faculty', name: 'Dr. Kunal More', empId: 'AWF-EMP-011', dept: 'Assigned Batches Only' },
    { role: 'STAFF', label: 'Staff Member', name: 'Sneha Shinde', empId: 'AWF-EMP-013', dept: 'Technical Team' },
    { role: 'INTERN', label: 'Intern', name: 'Aarav Sharma', empId: 'AWF-INT-001', dept: 'Interns' },
  ];

  // Enforce Director isolation in the switcher: when viewing as a Director, hide other Directors
  const visibleRoleOptions = roleOptions.filter(
    (opt) => !(currentRole === 'DIRECTOR' && opt.role === 'DIRECTOR' && opt.empId !== currentEmployee.id)
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white dark:bg-[#111622] border-b border-slate-200 dark:border-slate-800">
      {/* Left: Menu / Logo + Search */}
      <div className="flex items-center gap-3">
        {isFounderLanding ? (
          <Link href="/" className="flex items-center gap-2.5 mr-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-sm">
              A
            </div>
            <div className="leading-tight hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                AWFIS HUB
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Founder
                </span>
              </span>
            </div>
          </Link>
        ) : (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 w-64 md:w-72">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
              placeholder="Jump to module..."
              className="bg-transparent border-none outline-none w-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
          {searchOpen && search.trim() && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1.5 z-50">
              {searchResults.length > 0 ? (
                searchResults.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="block px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 text-xs"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">{r.label}</p>
                    <p className="text-[10px] text-slate-400">{r.section}</p>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-3 text-xs text-slate-400">No matching module found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, Notifications, Role Simulation Switcher */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications ({unreadCount} unread)
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {userNotifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.isRead ? 'bg-violet-50/60 dark:bg-violet-950/20' : ''
                    }`}
                  >
                    <Link
                      href={n.targetUrl}
                      onClick={() => {
                        markNotificationRead(n.id);
                        setNotifOpen(false);
                      }}
                      className="block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        {n.createdBy && <span>By: <strong className="text-slate-600 dark:text-slate-300">{n.createdBy}</strong></span>}
                        {n.priority && (
                          <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-bold">
                            {n.priority}
                          </span>
                        )}
                        {n.dueDate && <span>Due: {n.dueDate}</span>}
                        <span>{n.createdAt || n.timestamp}</span>
                      </div>
                    </Link>
                    {!n.isRead && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="mt-1.5 text-[10px] font-bold text-violet-600 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Open Notification Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
              {currentEmployee.name}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {currentRole.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 dark:text-white uppercase">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Mock Role Simulation
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Visual UI role preview only (not real backend security). Directors are isolated from viewing each other.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {visibleRoleOptions.map((opt) => {
                  const selected = currentEmployee.id === opt.empId;
                  return (
                    <button
                      key={opt.empId}
                      onClick={() => {
                        switchRole(opt.role, opt.empId);
                        setRoleOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                        selected ? 'bg-blue-50/70 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {opt.name}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {opt.dept} • {opt.empId}
                        </p>
                      </div>
                      {selected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-extrabold text-slate-900 dark:text-white truncate">{activeToast.title}</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{activeToast.message}</p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href={activeToast.targetUrl}
                onClick={() => {
                  markNotificationRead(activeToast.id);
                  dismissToast();
                }}
                className="text-[11px] font-bold text-violet-600 hover:underline"
              >
                Open Task →
              </Link>
              <button
                onClick={dismissToast}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={dismissToast} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </header>
  );
}
