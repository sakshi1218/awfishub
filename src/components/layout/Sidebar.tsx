'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitFork,
  Users,
  Building2,
  CheckSquare,
  FileSpreadsheet,
  CalendarDays,
  TrendingUp,
  Clock,
  BarChart3,
  Bell,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Briefcase,
  GraduationCap,
  FileCheck2,
  PhoneCall,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isFounder, isDirector, isManager, isSalesRole } = useAuth();
  const [salesOpen, setSalesOpen] = useState(pathname.startsWith('/sales'));

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
      visible: true,
    },
    {
      label: 'Org & Hierarchy',
      href: '/hierarchy',
      icon: GitFork,
      badge: null,
      visible: true,
    },
    {
      label: 'Employee Management',
      href: '/employees',
      icon: Users,
      badge: null,
      visible: isFounder || isDirector || isManager,
    },
    {
      label: 'Department Management',
      href: '/departments',
      icon: Building2,
      badge: null,
      visible: isFounder || isDirector,
    },
    {
      label: 'Task Management',
      href: '/tasks',
      icon: CheckSquare,
      badge: 'Live',
      visible: true,
    },
    {
      label: 'Daily Work Reports',
      href: '/daily-reports',
      icon: FileSpreadsheet,
      badge: null,
      visible: true,
    },
    {
      label: 'Meetings & Sessions',
      href: '/meetings',
      icon: CalendarDays,
      badge: null,
      visible: true,
    },
    {
      label: 'Sales Management',
      isGroup: true,
      icon: TrendingUp,
      visible: isSalesRole || isFounder,
      subItems: [
        { label: 'College Visits', href: '/sales/visits', icon: Briefcase },
        { label: 'FDP Sessions', href: '/sales/fdp', icon: GraduationCap },
        { label: 'College Agreements', href: '/sales/agreements', icon: FileCheck2 },
        { label: 'CRM & Clients', href: '/sales/leads', icon: PhoneCall },
        { label: 'Sales Performance', href: '/sales/performance', icon: PieChart },
      ],
    },
    {
      label: 'Attendance & Leave',
      href: '/attendance',
      icon: Clock,
      badge: null,
      visible: true,
    },
    {
      label: 'Reports & Analytics',
      href: '/reports',
      icon: BarChart3,
      badge: null,
      visible: isFounder || isDirector || isManager,
    },
    {
      label: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: '3',
      visible: true,
    },
    {
      label: 'Documents Vault',
      href: '/documents',
      icon: FileText,
      badge: null,
      visible: true,
    },
    {
      label: 'Settings & Security',
      href: '/settings',
      icon: Settings,
      badge: null,
      visible: isFounder,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/60">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-xl shadow-lg shadow-blue-500/20 shrink-0">
              M
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 truncate">
                  AWFIS HUB
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Pro
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-medium truncate">MindLyft Operating OS</span>
              </div>
            )}
          </Link>
        </div>

        {/* User Mini Profile Badge */}
        {!collapsed && currentUser && (
          <div className="px-4 py-3 mx-3 my-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{currentUser.designation}</p>
              <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] rounded font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems
            .filter((item) => item.visible)
            .map((item, idx) => {
              if (item.isGroup && item.subItems) {
                const isGroupActive = item.subItems.some((s) => pathname.startsWith(s.href));
                return (
                  <div key={idx} className="pt-1">
                    <button
                      onClick={() => setSalesOpen(!salesOpen)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                        isGroupActive
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 shrink-0 text-slate-400" />
                        {!collapsed && <span>{item.label}</span>}
                      </div>
                      {!collapsed && (
                        <div>
                          {salesOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu */}
                    {salesOpen && !collapsed && (
                      <div className="mt-1 pl-6 space-y-1 border-l-2 border-slate-800 ml-5">
                        {item.subItems.map((sub, sIdx) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/30'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                              }`}
                            >
                              <sub.icon className="w-4 h-4 shrink-0" />
                              <span className="truncate">{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href || '');

              return (
                <Link
                  key={idx}
                  href={item.href || '#'}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Footer Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          {!collapsed && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span>MindLyft v2.4.0</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors mx-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-90" />}
          </button>
        </div>
      </aside>
    </>
  );
}
