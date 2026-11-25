'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CheckSquare,
  FileSpreadsheet,
  CalendarDays,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Briefcase,
  GraduationCap,
  FileCheck2,
  PhoneCall,
  Crown,
  ShieldCheck,
  UserCheck,
  User,
  Plus,
  Send,
  Eye,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MasterDashboardPage() {
  const { currentUser, isFounder, isDirector, isManager, isSalesRole } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [dailyReports, setDailyReports] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [salesSummary, setSalesSummary] = useState<any | null>(null);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Allow manual dashboard view override if user wants to preview other role perspectives
  const [activeRoleView, setActiveRoleView] = useState<string>('AUTO');

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      const [empRes, deptRes, tskRes, repRes, meetRes, salesRes, agrRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
        fetch('/api/tasks'),
        fetch('/api/daily-reports?date=2026-11-25'),
        fetch('/api/meetings'),
        fetch('/api/sales/performance'),
        fetch('/api/sales/agreements'),
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (tskRes.ok) setTasks(await tskRes.json());
      if (repRes.ok) {
        const d = await repRes.json();
        setDailyReports(d.reports);
      }
      if (meetRes.ok) setMeetings(await meetRes.json());
      if (salesRes.ok) setSalesSummary(await salesRes.json());
      if (agrRes.ok) setAgreements(await agrRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const effectiveRole =
    activeRoleView === 'AUTO'
      ? currentUser?.role || 'FOUNDER'
      : activeRoleView;

  // Aggregate metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
  const totalDirectors = employees.filter(
    (e) => e.role === 'DIRECTOR' || e.role === 'SALES_DIRECTOR'
  ).length;
  const totalManagers = employees.filter((e) => e.role === 'MANAGER').length;
  const totalTeamEmployees = employees.filter(
    (e) => e.role === 'EMPLOYEE' || e.role === 'SALES_EMPLOYEE'
  ).length;

  const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;
  const tasksInProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const tasksPendingReview = tasks.filter((t) => t.status === 'SUBMITTED_FOR_REVIEW').length;
  const tasksOverdue = tasks.filter(
    (t) => new Date(t.deadline) < new Date('2026-11-25') && t.status !== 'COMPLETED'
  ).length;

  // User specific
  const myTasks = tasks.filter((t) => t.assignedToId === currentUser?.id);
  const myAssignedTasks = tasks.filter((t) => t.assignedById === currentUser?.id);
  const myReport = dailyReports.find((r) => r.employeeId === currentUser?.id);

  // Expiring agreements alert count
  const expiringAgreements = agreements.filter((a) => a.dynamicStatus === 'EXPIRING_SOON');

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                AWFIS HUB Central Operating System
              </span>
              <span className="text-xs text-slate-400 font-mono">MindLyft EdTech</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.name || 'Pooja Ahire'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {effectiveRole === 'FOUNDER' &&
                'Founder Command Dashboard: Complete company-wide operational visibility, team performance, daily activities, and institutional sales analytics.'}
              {effectiveRole.includes('DIRECTOR') &&
                'Director Operational View: Manage your division, team hierarchy, review daily submissions, verify deliverables, and monitor MoUs.'}
              {effectiveRole === 'MANAGER' &&
                'Manager Work Hub: Track team task progress, review daily logs, provide mentorship feedback, and meet project milestones.'}
              {(effectiveRole === 'EMPLOYEE' || effectiveRole === 'SALES_EMPLOYEE') &&
                'Employee Workspace: Access your assigned deliverables, submit daily work reports, schedule meetings, and review your performance.'}
            </p>
          </div>

          {/* Quick Perspective Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1.5">
              Role Perspective
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'AUTO', label: 'My Role' },
                { id: 'FOUNDER', label: 'Founder' },
                { id: 'DIRECTOR', label: 'Director' },
                { id: 'MANAGER', label: 'Manager' },
                { id: 'EMPLOYEE', label: 'Employee' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setActiveRoleView(opt.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    activeRoleView === opt.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar if agreements expiring */}
      {expiringAgreements.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Attention Required:</span>{' '}
              {expiringAgreements.length} College Agreement(s) (including{' '}
              {expiringAgreements[0].college.name}) are expiring in under 30 days!
            </div>
          </div>
          <Link
            href="/sales/agreements"
            className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
          >
            Review Agreements →
          </Link>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3A. FOUNDER DASHBOARD VIEW */}
      {/* ========================================================== */}
      {effectiveRole === 'FOUNDER' && (
        <div className="space-y-6">
          {/* Company-Wide High Level Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Total Workforce</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalEmployees}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-600 font-bold">{activeEmployees} Active</span>
                <span>•</span>
                <span>{totalDirectors} Dir, {totalManagers} Mgr, {totalTeamEmployees} Staff</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Departments</span>
                <Building2 className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {departments.length}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-2">
                Sales, Tech, Ops, HR, Training, Mktg, Finance
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Company Tasks</span>
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {tasks.length}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-600 font-bold">{tasksCompleted} Done</span>
                <span>•</span>
                <span className="text-blue-600 font-bold">{tasksInProgress} In Progress</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                <span>Sales Revenue Pipeline</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                ₹{((salesSummary?.summary?.pipelineRevenue || 0) / 100000).toFixed(1)}L
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                <span className="text-emerald-600 font-bold">
                  ₹{((salesSummary?.summary?.closedRevenue || 0) / 100000).toFixed(1)}L Closed
                </span>
                <span>•</span>
                <span>{salesSummary?.summary?.totalVisits || 0} Visits</span>
              </div>
            </div>
          </div>

          {/* Department-Wise Grid & Today's Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Breakdown */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  Departmental Strength & Delivery Health
                </h3>
                <Link href="/departments" className="text-xs font-semibold text-blue-600 hover:underline">
                  Manage →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => {
                  const deptTasks = tasks.filter((t) => t.departmentId === dept.id);
                  const deptDone = deptTasks.filter((t) => t.status === 'COMPLETED').length;
                  const rate = deptTasks.length > 0 ? Math.round((deptDone / deptTasks.length) * 100) : 0;

                  return (
                    <div
                      key={dept.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {dept.name}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {dept.employees?.length || 0} Staff
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>Tasks: {deptDone}/{deptTasks.length}</span>
                        <span className="font-bold text-blue-600">{rate}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Daily Work Reports Tracker */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  Today's Daily Activity
                </h3>
                <Link href="/daily-reports" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  <span className="text-xs font-semibold">Reports Submitted Today</span>
                  <span className="text-base font-black">{dailyReports.length}</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-56 overflow-y-auto">
                  {dailyReports.slice(0, 4).map((r) => (
                    <div key={r.id} className="py-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {r.employee?.name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {r.timeSpentHours} hrs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {r.workDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3B. DIRECTOR DASHBOARD VIEW */}
      {/* ========================================================== */}
      {effectiveRole.includes('DIRECTOR') && effectiveRole !== 'FOUNDER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Division</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {currentUser?.department?.name || 'Sales & BD'}
              </p>
              <span className="text-[11px] text-blue-600 font-bold">Executive Authority</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Team Tasks</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {tasks.filter((t) => t.departmentId === currentUser?.departmentId).length}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold">Active Deliverables</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Approval</span>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {tasksPendingReview}
              </p>
              <span className="text-[11px] text-purple-600 font-bold">Submitted for Review</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Self Tasks</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {myTasks.length}
              </p>
              <span className="text-[11px] text-slate-500 font-bold">Director Deliverables</span>
            </div>
          </div>

          {/* Director Actions & Review Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Deliverables Awaiting Review ({tasksPendingReview})
                </h3>
                <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                  Task Board →
                </Link>
              </div>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === 'SUBMITTED_FOR_REVIEW')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-600">
                          {task.taskId}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Submitted by {task.assignedTo.name} ({task.assignedTo.designation})
                        </p>
                      </div>
                      <Link
                        href="/tasks"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold shrink-0"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            {/* Department Hierarchy Peek */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Direct Division Team
                </h3>
                <Link href="/hierarchy" className="text-xs font-semibold text-blue-600 hover:underline">
                  Full Tree →
                </Link>
              </div>

              <div className="space-y-2">
                {employees
                  .filter((e) => e.reportingDirectorId === currentUser?.id || e.departmentId === currentUser?.departmentId)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {member.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{member.designation}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3C. MANAGER DASHBOARD VIEW */}
      {/* ========================================================== */}
      {effectiveRole === 'MANAGER' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Team</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {employees.filter((e) => e.reportingManagerId === currentUser?.id).length}
              </p>
              <span className="text-[11px] text-blue-600 font-bold">Direct Supervised</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Team Tasks</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {tasks.filter((t) => t.assignedById === currentUser?.id).length}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold">Assigned by You</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Pending Review</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {tasksPendingReview}
              </p>
              <span className="text-[11px] text-amber-600 font-bold">Deliverables</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Today's Reports</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {dailyReports.length}
              </p>
              <span className="text-[11px] text-slate-500 font-bold">Submitted</span>
            </div>
          </div>

          {/* Quick Assign & Review Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Assigned Team Members
                </h3>
                <Link href="/employees" className="text-xs font-semibold text-blue-600 hover:underline">
                  Directory →
                </Link>
              </div>

              <div className="space-y-3">
                {employees
                  .filter((e) => e.reportingManagerId === currentUser?.id)
                  .map((mem) => {
                    const memTasks = tasks.filter((t) => t.assignedToId === mem.id);
                    const memDone = memTasks.filter((t) => t.status === 'COMPLETED').length;

                    return (
                      <div
                        key={mem.id}
                        className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {mem.name}
                          </p>
                          <p className="text-[11px] text-slate-500">{mem.designation}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-blue-600">
                            {memDone}/{memTasks.length} Done
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {mem.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Manager Quick Operations
                </h3>
                <p className="text-xs text-slate-500">
                  Assign work to team members, inspect daily work descriptions, schedule team sync meetings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/tasks"
                  className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex flex-col gap-1 hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  Assign New Task
                </Link>

                <Link
                  href="/daily-reports"
                  className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex flex-col gap-1 hover:bg-emerald-100 transition-colors"
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Review Team Reports
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3D. EMPLOYEE DASHBOARD VIEW */}
      {/* ========================================================== */}
      {(effectiveRole === 'EMPLOYEE' || effectiveRole === 'SALES_EMPLOYEE') && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">My Active Tasks</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {myTasks.length}
              </p>
              <span className="text-[11px] text-slate-500 font-bold">Assigned to You</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Today's Daily Report</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {myReport ? myReport.status : 'Pending'}
              </p>
              <span
                className={`text-[11px] font-bold ${
                  myReport ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {myReport ? 'Submitted on time' : 'Not submitted yet'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Completed Tasks</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {myTasks.filter((t) => t.status === 'COMPLETED').length}
              </p>
              <span className="text-[11px] text-emerald-600 font-bold">100% Approved</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase">Leave Balance</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {currentUser?.leaveBalanceCasual || 12}
              </p>
              <span className="text-[11px] text-slate-500 font-bold">Casual Days Available</span>
            </div>
          </div>

          {/* My Tasks Board */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                My Assigned Deliverables & Deadlines
              </h3>
              <Link href="/tasks" className="text-xs font-semibold text-blue-600 hover:underline">
                View Task Workspace →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {task.taskId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase">
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progress</span>
                      <span>{task.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${task.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    <span>Assigned by {task.assignedBy?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Today's Meetings & Quick Links Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              Scheduled Review Sessions
            </h3>
            <Link href="/meetings" className="text-xs font-semibold text-blue-600 hover:underline">
              Calendar →
            </Link>
          </div>

          <div className="space-y-3">
            {meetings.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600">
                    {m.meetingType.replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {m.locationOrLink}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0">
                  {m.durationMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Performance Widget */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Institutional Outreach & College Partnerships
            </h3>
            <Link href="/sales/performance" className="text-xs font-semibold text-blue-600 hover:underline">
              Sales Dashboard →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase">
                Active College MoUs
              </span>
              <p className="text-xl font-black text-blue-700 dark:text-blue-400 mt-1">
                {agreements.filter((a) => a.dynamicStatus === 'ACTIVE').length}
              </p>
              <span className="text-[10px] text-slate-500">Institutional Partners</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
              <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase">
                Faculty FDPs Done
              </span>
              <p className="text-xl font-black text-purple-700 dark:text-purple-400 mt-1">
                {salesSummary?.summary?.totalFDPs || 0}
              </p>
              <span className="text-[10px] text-slate-500">Masterclasses</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total In-Person Visits Logged
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {salesSummary?.summary?.totalVisits || 0} Campus Visits
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
