'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  UserCheck,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { flatNavigation } from '@/lib/navigation';

interface NavbarProps {
  onMenuClick: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  message: string;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { currentUser, allUsers, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];

    return flatNavigation
      .filter((entry) =>
        `${entry.label} ${entry.section} ${entry.parent ?? ''} ${entry.description ?? ''}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 7);
  }, [search]);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data: NotificationItem[] = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((notification) => !notification.isRead).length);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={onMenuClick}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block">
          <div className="flex w-64 items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-100 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-400">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setSearch('');
                  setSearchOpen(false);
                }
              }}
              placeholder="Search AWSFISHUB modules..."
              aria-label="Search navigation"
              className="w-full border-none bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
            />
          </div>
          {searchOpen && search.trim() && (
            <div className="absolute left-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {searchResults.length ? (
                searchResults.map((result) => (
                  <Link
                    key={result.href}
                    href={result.href ?? '/'}
                    onClick={() => {
                      setSearch('');
                      setSearchOpen(false);
                    }}
                    className="block rounded-lg px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                  >
                    <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                      {result.label}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {result.section}{result.parent ? ` / ${result.parent}` : ''}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="px-3 py-4 text-xs text-slate-500">No matching modules.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right controls: Role switcher & profile */}
      <div className="flex items-center gap-3">
        {/* Dynamic Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 text-slate-800 dark:text-slate-200 text-xs font-medium hover:border-blue-400 transition-all shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400 hidden md:inline">Demo preview:</span>
            <span className="font-bold text-blue-700 dark:text-blue-400 truncate max-w-[140px]">
              {currentUser?.name || 'Select User'}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-600 text-white shrink-0">
              {currentUser?.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Switcher Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Demo Role Preview
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Not Real Authentication · Preview interface only
                  </p>
                </div>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>

              <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {allUsers.map((user) => {
                  const isSelected = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {user.name}
                          </p>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {user.designation}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              user.role === 'FOUNDER'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 dark:text-amber-400'
                                : user.role.includes('DIRECTOR')
                                ? 'bg-purple-500/10 text-purple-600 border border-purple-500/30 dark:text-purple-400'
                                : user.role === 'MANAGER'
                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30 dark:text-blue-400'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:text-emerald-400'
                            }`}
                          >
                            {user.role.replace('_', ' ')}
                          </span>
                          {user.department && (
                            <span className="text-[9px] text-slate-400 truncate">
                              • {user.department.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-400">
                    No notifications right now
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.linkUrl || '/notifications'}
                      onClick={() => setNotificationsOpen(false)}
                      className={`block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !notif.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {notif.title}
                        </p>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {notif.message}
                      </p>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all in Notifications Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Product preview indicator */}
        <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-900 dark:text-white">AWSFISHUB</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
              UI prototype
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
