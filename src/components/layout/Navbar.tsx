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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RoleType } from '@/types';

interface NavbarProps {
  onMenuClick: () => void;
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

export default function Navbar({ onMenuClick }: NavbarProps) {
  const {
    currentRole,
    currentEmployee,
    switchRole,
    darkMode,
    toggleDarkMode,
    notifications,
    markAllNotificationsRead,
    isChairperson,
  } = useApp();

  const [roleOpen, setRoleOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    { role: 'OPERATION_HEAD', label: 'Operation Head', name: 'Vikram Deshmukh', empId: 'AWF-EMP-005', dept: 'Operation Team' },
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/95 dark:bg-[#130d26]/95 backdrop-blur-md border-b border-purple-200/80 dark:border-purple-900/50">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

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
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.slice(0, 5).map((n) => (
                  <Link
                    key={n.id}
                    href={n.targetUrl}
                    onClick={() => setNotifOpen(false)}
                    className={`block p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                      !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                  </Link>
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-50 via-fuchsia-50 to-blue-50 dark:from-purple-950/60 dark:to-blue-950/60 border border-purple-200 dark:border-purple-700 text-xs font-medium hover:border-fuchsia-400 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-fuchsia-500" />
            <span className="font-bold text-violet-700 dark:text-violet-300 truncate max-w-[130px]">
              {currentEmployee.name}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
              {currentRole.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
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
    </header>
  );
}
