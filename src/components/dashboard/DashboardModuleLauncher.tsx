'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  GitFork,
  Users,
  Building2,
  ShieldCheck,
  CheckSquare,
  ListTodo,
  FileSpreadsheet,
  CalendarDays,
  Clock,
  Layers,
  Radio,
  Megaphone,
  TrendingUp,
  Briefcase,
  GraduationCap,
  FileCheck2,
  PhoneCall,
  PieChart,
  Globe,
  HardDrive,
  BadgeDollarSign,
  FileText,
  Bell,
  BarChart3,
  Settings,
  ArrowUpRight,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RoleType } from '@/types';

interface ModuleCardItem {
  id: string;
  title: string;
  description: string;
  href: string;
  category:
    | 'Organization'
    | 'Task Management'
    | 'Workspaces'
    | 'Sales & CRM'
    | 'Education'
    | 'Events & Network'
    | 'Administration'
    | 'Reports & Analytics';
  icon: LucideIcon;
  accent: string;
  countLabel?: string;
  roles: RoleType[];
  directorDepts?: string[];
}

export default function DashboardModuleLauncher() {
  const {
    currentRole,
    currentEmployee,
    getDirectorAllowedDepartments,
    employees,
    tasks,
    dailyReports,
    campaigns,
    crmLeads,
    colleges,
    experts,
    openMarketLeads,
    telecallerRecords,
    batches,
    events,
    assets,
    expenseClaims,
    documents,
    notifications,
  } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const allowedDirectorDepts =
    currentRole === 'DIRECTOR' ? getDirectorAllowedDepartments(currentEmployee.id) : [];

  const allModules: ModuleCardItem[] = useMemo(
    () => [
      // 1. Organization
      {
        id: 'org-chart',
        title: 'Organization Chart',
        description: 'Interactive hierarchy tree, department view, and reporting relationships.',
        href: '/organization',
        category: 'Organization',
        icon: GitFork,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: `${employees.length} Members`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF'],
      },
      {
        id: 'employees',
        title: 'Employees & Role Seats',
        description: 'Permanent IDs, role seat handover history, transfers, and offboarding.',
        href: '/employees',
        category: 'Organization',
        icon: Users,
        accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        countLabel: `${employees.filter((e) => e.employmentStatus === 'Active').length} Active`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
      },
      {
        id: 'departments',
        title: 'Eight Departments',
        description: 'Media, Trainer, Counselor, TeleCaller, Tech, Sales, Interns, and Ops.',
        href: '/departments',
        category: 'Organization',
        icon: Building2,
        accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        countLabel: '8 Permanent Units',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
      },
      {
        id: 'permissions',
        title: 'Roles & Permissions',
        description: 'Visual role-based permission matrix and scope simulation settings.',
        href: '/settings',
        category: 'Organization',
        icon: ShieldCheck,
        accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        countLabel: '7 Roles',
        roles: ['CHAIRPERSON', 'OPERATION_HEAD'],
      },

      // 2. Task Management
      {
        id: 'my-tasks',
        title: 'My Tasks',
        description: 'Personal deliverables, deadlines, progress updates, and submissions.',
        href: '/my-tasks',
        category: 'Task Management',
        icon: ListTodo,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: `${tasks.filter((t) => t.assignedToId === currentEmployee.id).length} Assigned`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },
      {
        id: 'task-board',
        title: 'Task Management Board',
        description: 'Kanban, List, Timeline, Task Transfers, and Follow-up Tracker.',
        href: '/tasks',
        category: 'Task Management',
        icon: CheckSquare,
        accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        countLabel: `${tasks.length} Total Tasks`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF'],
      },
      {
        id: 'daily-reports',
        title: 'Daily Work Reports',
        description: 'Submit daily activity logs, blockers, and supervisor reviews.',
        href: '/daily-reports',
        category: 'Task Management',
        icon: FileSpreadsheet,
        accent: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        countLabel: `${dailyReports.length} Today`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },
      {
        id: 'meetings',
        title: 'Meetings & Reviews',
        description: 'Scheduled review sessions, standups, and action items.',
        href: '/meetings',
        category: 'Task Management',
        icon: CalendarDays,
        accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        countLabel: '3 Upcoming',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF'],
      },
      {
        id: 'attendance',
        title: 'Attendance & Check-In',
        description: 'Daily workforce check-in log and active presence tracker.',
        href: '/attendance',
        category: 'Task Management',
        icon: Clock,
        accent: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        countLabel: 'Live Check-In',
        roles: ['CHAIRPERSON', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF', 'INTERN'],
      },

      // 3. Workspaces
      {
        id: 'workspaces',
        title: 'Department Workspaces',
        description: 'Dedicated hubs for all 8 departments, docs, and department tools.',
        href: '/workspaces',
        category: 'Workspaces',
        icon: Layers,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: '8 Workspaces',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },
      {
        id: 'media',
        title: 'Media & Podcasts',
        description: 'Social analytics, Podcast guest timeline, and Reel editing Kanban.',
        href: '/media',
        category: 'Workspaces',
        icon: Radio,
        accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        countLabel: 'Podcasts & Reels',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF', 'INTERN'],
        directorDepts: ['Media', 'Operation Team', 'Interns'],
      },
      {
        id: 'campaigns',
        title: 'Campaign Workspaces',
        description: 'Cross-department campaign objectives, milestones, and lead goals.',
        href: '/campaigns',
        category: 'Workspaces',
        icon: Megaphone,
        accent: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
        countLabel: `${campaigns.length} Active`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
      },

      // 4. Sales & CRM
      {
        id: 'sales-crm',
        title: 'CRM & Clients Pipeline',
        description: '7-stage visual CRM Kanban from New Lead to Agreement and Won/Lost.',
        href: '/sales/leads',
        category: 'Sales & CRM',
        icon: TrendingUp,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: `${crmLeads.length} Deals`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF'],
        directorDepts: ['Sales Department'],
      },
      {
        id: 'sales-visits',
        title: 'College Visits',
        description: 'Track campus visits, TPO discussions, follow-ups, and outcomes.',
        href: '/sales/visits',
        category: 'Sales & CRM',
        icon: Briefcase,
        accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        countLabel: `${colleges.length} Institutes`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF'],
        directorDepts: ['Sales Department'],
      },
      {
        id: 'sales-fdp',
        title: 'FDP Sessions',
        description: 'Faculty development pitches, workshop proposals, and TPO engagement.',
        href: '/sales/fdp',
        category: 'Sales & CRM',
        icon: GraduationCap,
        accent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        countLabel: 'FDP Pitches',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
        directorDepts: ['Sales Department'],
      },
      {
        id: 'sales-agreements',
        title: 'College Agreements',
        description: 'Institutional MoUs, SDF status, deal values, and renewal alerts.',
        href: '/sales/agreements',
        category: 'Sales & CRM',
        icon: FileCheck2,
        accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        countLabel: `${colleges.filter((c) => c.agreementStatus === 'Active').length} Active MoUs`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
        directorDepts: ['Sales Department'],
      },
      {
        id: 'sales-perf',
        title: 'Sales Performance',
        description: 'Conversion ratios, pipeline distribution, and revenue charts.',
        href: '/sales/performance',
        category: 'Sales & CRM',
        icon: PieChart,
        accent: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
        countLabel: 'CRM Metrics',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
        directorDepts: ['Sales Department'],
      },
      {
        id: 'telecaller',
        title: 'TeleCaller Operations',
        description: 'Student calling queue, call outcomes, and follow-up calendar.',
        href: '/telecaller',
        category: 'Sales & CRM',
        icon: PhoneCall,
        accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        countLabel: `${telecallerRecords.length} Call Logs`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF'],
        directorDepts: ['TeleCaller', 'Sales Department', 'Counselor'],
      },
      {
        id: 'open-market',
        title: 'Open Market',
        description: 'Direct B2C, corporate clients, and event-originating sales leads.',
        href: '/open-market',
        category: 'Sales & CRM',
        icon: Globe,
        accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
        countLabel: `${openMarketLeads.length} Leads`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD'],
        directorDepts: ['Sales Department'],
      },

      // 5. Education
      {
        id: 'education',
        title: 'Courses & Batches',
        description: 'Capsule, CDAC, C3RIHub, MindlyftAI cohorts, attendance & Excel import.',
        href: '/education',
        category: 'Education',
        icon: GraduationCap,
        accent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        countLabel: `${batches.length} Active Batches`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY'],
        directorDepts: ['Technical Team', 'Trainer'],
      },

      // 6. Events & Network
      {
        id: 'events',
        title: 'Events & Expos',
        description: 'National Expos, Hackathons, stall logistics, and post-event ROI.',
        href: '/events',
        category: 'Events & Network',
        icon: CalendarDays,
        accent: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        countLabel: `${events.length} Events`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'STAFF'],
      },
      {
        id: 'colleges-experts',
        title: 'Colleges & Experts',
        description: 'College partnership directory, workshop statuses, and guest experts.',
        href: '/colleges',
        category: 'Events & Network',
        icon: Building2,
        accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        countLabel: `${colleges.length} Colleges • ${experts.length} Experts`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY'],
      },

      // 7. Administration
      {
        id: 'assets',
        title: currentRole === 'CHAIRPERSON' ? 'Company Asset Inventory' : 'My Assigned Assets',
        description:
          currentRole === 'CHAIRPERSON'
            ? 'Full hardware inventory, serials, custody history, and purchase values.'
            : 'View your assigned company laptops, SIMs, and return status.',
        href: '/assets',
        category: 'Administration',
        icon: HardDrive,
        accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        countLabel:
          currentRole === 'CHAIRPERSON'
            ? `${assets.length} Total Assets`
            : `${assets.filter((a) => a.assignedToId === currentEmployee.id).length} Assigned`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },
      {
        id: 'accounts',
        title: 'Accounts & Finance',
        description: 'Income, expenditure, expense claims, recurring bills, GST, and TDS UI.',
        href: '/accounts',
        category: 'Administration',
        icon: BadgeDollarSign,
        accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        countLabel: `${expenseClaims.length} Claims • Chairperson`,
        roles: ['CHAIRPERSON'],
      },
      {
        id: 'documents',
        title: 'Document Management',
        description: 'Agreements, MoUs, course files, and versioned mock previews.',
        href: '/documents',
        category: 'Administration',
        icon: FileText,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: `${documents.length} Files`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF'],
      },
      {
        id: 'notifications',
        title: 'Notification Center',
        description: 'Task updates, transfers, approvals, and bill reminders.',
        href: '/notifications',
        category: 'Administration',
        icon: Bell,
        accent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        countLabel: `${notifications.filter((n) => !n.isRead).length} Unread`,
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },

      // 8. Reports & Analytics
      {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'Role-scoped Executive, Department, CRM, and Excel analytics.',
        href: '/reports',
        category: 'Reports & Analytics',
        icon: BarChart3,
        accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        countLabel: 'Excel Export',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY'],
      },
      {
        id: 'my-reports',
        title: 'My Performance Reports',
        description: 'Personal task completion metrics and activity summary.',
        href: '/my-reports',
        category: 'Reports & Analytics',
        icon: Settings,
        accent: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        countLabel: 'Personal View',
        roles: ['CHAIRPERSON', 'DIRECTOR', 'OPERATION_HEAD', 'TEAM_LEAD', 'FACULTY', 'STAFF', 'INTERN'],
      },
    ],
    [
      currentRole,
      currentEmployee.id,
      employees,
      tasks,
      dailyReports,
      campaigns,
      crmLeads,
      colleges,
      experts,
      openMarketLeads,
      telecallerRecords,
      batches,
      events,
      assets,
      expenseClaims,
      documents,
      notifications,
    ]
  );

  // Filter by current role, director division scope, search query, and category
  const authorizedModules = useMemo(() => {
    return allModules.filter((mod) => {
      if (!mod.roles.includes(currentRole)) return false;
      if (currentRole === 'DIRECTOR' && mod.directorDepts) {
        const hasOverlap = mod.directorDepts.some((d) => allowedDirectorDepts.includes(d as never));
        if (!hasOverlap) return false;
      }
      if (selectedCategory !== 'ALL' && mod.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return `${mod.title} ${mod.description} ${mod.category}`.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allModules, currentRole, allowedDirectorDepts, selectedCategory, search]);

  const categories = [
    'Organization',
    'Task Management',
    'Workspaces',
    'Sales & CRM',
    'Education',
    'Events & Network',
    'Administration',
    'Reports & Analytics',
  ] as const;

  const visibleCategories = categories.filter((cat) =>
    authorizedModules.some((m) => m.category === cat)
  );

  return (
    <section className="space-y-5 pt-2">
      {/* Launcher Header & Search */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Module Launcher & Quick Navigation
              </h2>
              <p className="text-xs text-slate-500">
                Click any card to open its workspace — showing {authorizedModules.length} authorized modules for{' '}
                <b>{currentEmployee.name}</b> ({currentRole.replace('_', ' ')}).
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search modules by name, category..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 text-white shadow-sm'
                : 'bg-purple-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 text-white shadow-sm'
                  : 'bg-purple-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Category Grids */}
      {visibleCategories.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          No authorized modules match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((cat) => {
            const items = authorizedModules.filter((m) => m.category === cat);
            return (
              <div key={cat} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {cat} ({items.length})
                  </h3>
                </div>

                {/* Responsive Grid: Mobile 1-2, Tablet 2-3, Desktop 3-4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {items.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <Link
                        key={mod.id}
                        href={mod.href}
                        className="group h-full p-4 rounded-2xl bg-white dark:bg-[#130d26] border border-purple-200/80 dark:border-purple-900/50 hover:border-fuchsia-500 dark:hover:border-fuchsia-400 hover:shadow-md hover:shadow-purple-500/10 transition-all flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`p-2.5 rounded-xl ${mod.accent}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {mod.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {mod.countLabel && (
                          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {mod.countLabel}
                            </span>
                            <span className="text-[11px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              Open →
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
