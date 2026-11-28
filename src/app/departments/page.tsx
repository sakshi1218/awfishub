'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Building2, CheckSquare, Lock, ArrowRight, Activity, CalendarDays, Flag } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DailyWorkReport, DepartmentType, Employee, TaskItem } from '@/types';
import { MOCK_LEAVE_HISTORY } from '@/data/mock/leave-history';

const departmentWorkflows: Record<DepartmentType, string[]> = {
  Media: [
    'Reach, views, likes, comments, shares and engagement by platform, content type and publication date.',
    'Podcast topic, guest/contact, presenter, recording, greeting, editing, publishing and guest timeline.',
    'Reel workflow: Assigned, Editing, Review, Approved and Posted, with editor feedback and publication.',
  ],
  'Sales Department': [
    'College visits, TPO contacts, visit notes, follow-ups, pitches, FDP proposals and agreements.',
    'Central client directory, ownership and interaction history.',
    'Lead pipeline from New through Won or Lost, including lost reason and competitor details.',
    'CRM analytics for active, converted and lost leads, conversion rate, source and pipeline.',
  ],
  TeleCaller: [
    'Student contact, call date, assigned telecaller, course interest and technical background.',
    'Call outcomes, follow-up date, counseling status and conversion status.',
  ],
  Trainer: [
    'Assigned batches, session schedules, student attendance, progress and course completion.',
  ],
  Counselor: [
    'Student profiles, counseling sessions, interests, guidance, follow-ups and enrollment outcomes.',
    'Sensitive counseling notes are not shown in this department overview.',
  ],
  'Technical Team': [
    'Technical tasks, internal projects, bug reports, developer assignment, priority and deadlines.',
    'Resolution status and supporting documentation.',
  ],
  Interns: [
    'Assigned tasks, daily work reports, weekly progress and mentor assignment.',
    'Mentor feedback and task completion history.',
  ],
  'Operation Team': [
    'Cross-department coordination, campaign execution and event logistics.',
    'Operational tasks, workload, pending activities and daily/weekly reports.',
  ],
};

const formatNumber = (value: number) => new Intl.NumberFormat('en-IN').format(value);
const formatDate = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString();

function DepartmentEmployeeProfile({
  employee,
  employeeDirectory,
  tasks,
  dailyReports,
}: {
  employee: Employee;
  employeeDirectory: Employee[];
  tasks: TaskItem[];
  dailyReports: DailyWorkReport[];
}) {
  const completedTasks = tasks.filter((task) => task.status === 'Approved');
  const pendingTasks = tasks.filter((task) => task.status !== 'Approved');
  const priorityTasks = tasks
    .filter((task) => task.status !== 'Approved' && (task.priority === 'Critical' || task.priority === 'High'))
    .sort((a, b) => {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || a.dueDate.localeCompare(b.dueDate);
    });
  const leaveHistory = MOCK_LEAVE_HISTORY[employee.permanentId] || [];
  const recentReports = [...dailyReports]
    .filter((report) => report.employeeId === employee.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const reportingDirector =
    employeeDirectory.find((person) => person.id === employee.reportingDirectorId)?.name ||
    employee.reportingDirectorId ||
    'Not assigned';

  const profileFields = [
    ['Unique employee ID', employee.permanentId],
    ['Full name', employee.name],
    ['Email', employee.email || 'Not provided'],
    ['Contact number', employee.phone || 'Not provided'],
    ['Designation', employee.designation],
    ['Department', employee.department],
    ['Team', employee.team],
    ['Employment type', employee.employmentType],
    ['Joining date', formatDate(employee.joiningDate)],
    ['Reporting manager', employee.reportingManagerName || 'Not assigned'],
    ['Reporting director', reportingDirector],
    ['Assigned role', employee.role.replace(/_/g, ' ')],
    ['Role seat', employee.roleSeatId],
    ['Employment status', employee.employmentStatus],
  ];

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white">
        <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${employee.avatarColor} text-lg font-bold`}>
          {employee.avatarInitials}
          {employee.avatarUrl && (
            <Image
              src={employee.avatarUrl}
              alt={`${employee.name} profile`}
              fill
              sizes="56px"
              unoptimized
              className="object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-lg font-bold">{employee.name}</h4>
          <p className="text-xs text-blue-100">{employee.designation} · {employee.role.replace(/_/g, ' ')}</p>
          <p className="font-mono text-[11px] text-blue-100">{employee.permanentId}</p>
        </div>
        <StatusBadge label={employee.employmentStatus} variant={employee.employmentStatus === 'Active' ? 'success' : 'warning'} />
      </section>

      <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-900/70 dark:from-rose-950/30 dark:to-slate-900">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
              <Flag className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">Priority tasks</h4>
              <p className="text-[10px] text-slate-500">Critical and high-priority assignments</p>
            </div>
          </div>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
            {priorityTasks.length} {priorityTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
        {priorityTasks.length ? (
          <div className="mt-3 space-y-2">
            {priorityTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-rose-100 bg-white/90 p-3 dark:border-rose-900/50 dark:bg-slate-900/70">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{task.id} · Due {formatDate(task.dueDate)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <StatusBadge label={task.priority} variant={task.priority === 'Critical' ? 'danger' : 'warning'} />
                    <StatusBadge label={task.status} variant="info" />
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-slate-600 dark:text-slate-300">{task.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className={`h-full rounded-full ${task.priority === 'Critical' ? 'bg-rose-600' : 'bg-amber-500'}`} style={{ width: `${task.progressPct}%` }} />
                  </div>
                  <span className="w-9 text-right text-[10px] font-semibold text-slate-500">{task.progressPct}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="mt-3 rounded-xl border border-dashed border-rose-200 p-3 text-xs italic text-slate-500 dark:border-rose-900/50">No priority tasks are assigned.</p>}
      </section>

      <section>
        <h4 className="mb-2 font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
          Employee profile
        </h4>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {profileFields.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <span className="text-[10px] font-bold uppercase text-slate-400">{label}</span>
              <p className="mt-0.5 break-words font-semibold text-slate-800 dark:text-slate-200">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
          <span className="text-[10px] font-bold uppercase text-slate-400">Profile</span>
          <p className="mt-0.5 text-slate-700 dark:text-slate-300">{employee.bio || 'No profile summary provided.'}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Responsibilities</span>
              {employee.responsibilities.length ? (
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-600 dark:text-slate-300">
                  {employee.responsibilities.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : <p className="mt-1 text-slate-400">Not listed</p>}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Skills</span>
              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {employee.skills.length ? employee.skills.join(', ') : 'Not listed'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-600" />
          <div>
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">Leave history</h4>
            <p className="mt-1 text-[10px] text-slate-500">Leave requests recorded for this employee.</p>
          </div>
        </div>
        {leaveHistory.length ? (
          <div className="mt-3 space-y-2">
            {leaveHistory.map((record) => (
              <div key={record.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/50">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{record.leaveType} leave · {record.totalDays} day{record.totalDays === 1 ? '' : 's'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{formatDate(record.startDate)}{record.startDate !== record.endDate ? ` – ${formatDate(record.endDate)}` : ''} · {record.reason}</p>
                </div>
                <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${record.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : record.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{record.status}</span>
              </div>
            ))}
          </div>
        ) : <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs italic text-slate-500 dark:bg-slate-800/50">No leave history recorded for this employee.</p>}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">Assigned tasks</h4>
          <span className="text-[10px] text-slate-500">{completedTasks.length} complete · {pendingTasks.length} pending</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { title: 'In progress / pending', items: pendingTasks },
            { title: 'Completed', items: completedTasks },
          ].map(({ title, items }) => (
            <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
              <h5 className="mb-2 font-bold text-slate-700 dark:text-slate-300">{title} ({items.length})</h5>
              {items.length ? (
                <ul className="space-y-2">
                  {items.map((task) => (
                    <li key={task.id} className="border-t border-slate-200 pt-2 first:border-0 first:pt-0 dark:border-slate-700">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</span>
                        <StatusBadge label={task.status} variant={task.status === 'Approved' ? 'success' : 'info'} />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {task.id} · {task.project} · Due {formatDate(task.dueDate)} · {task.progressPct}% complete
                      </p>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-400 italic">No {title.toLowerCase()}.</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-2 font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
          Daily work reports
        </h4>
        {recentReports.length ? (
          <div className="space-y-2">
            {recentReports.map((report) => (
              <div key={report.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(report.date)}</span>
                  <span className="text-slate-500">{report.timeSpentHours} hrs · {report.status}</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{report.workDescription}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-slate-400 italic">No daily work reports submitted.</p>}
      </section>

      <section>
        <h4 className="mb-2 font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
          Activity and profile update history
        </h4>
        {employee.activityHistory.length ? (
          <ul className="space-y-2">
            {employee.activityHistory.slice(0, 5).map((activity, index) => (
              <li key={`${activity.date}-${index}`} className="rounded-lg bg-slate-50 p-2.5 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                <span className="font-semibold">{formatDate(activity.date)}</span> · {activity.action}
              </li>
            ))}
          </ul>
        ) : <p className="text-slate-400 italic">No activity history available.</p>}
      </section>
    </div>
  );
}

export default function DepartmentsPage() {
  const router = useRouter();
  const {
    employees,
    dailyReports,
    campaigns,
    socialMetrics,
    podcasts,
    reels,
    crmLeads,
    colleges,
    openMarketLeads,
    telecallerRecords,
    counselingSessions,
    technicalBugs,
    batches,
    students,
    events,
    currentRole,
    currentEmployee,
    getDirectorAllowedDepartments,
    getVisibleTasksForCurrentUser,
    getPriorityConflicts,
  } = useApp();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const departmentRoutes: Partial<Record<DepartmentType, string>> = {
    Media: '/media',
    'Sales Department': '/sales',
    TeleCaller: '/telecaller',
    Trainer: '/trainer/dashboard',
    Counselor: '/counselor/dashboard',
    'Technical Team': '/technical/dashboard',
  };

  const allowedDirectorDepts =
    currentRole === 'DIRECTOR' ? getDirectorAllowedDepartments(currentEmployee.id) : null;

  const visibleDepartments = (allowedDirectorDepts
    ? PERMANENT_DEPARTMENTS.filter((d) => allowedDirectorDepts.includes(d.name))
    : PERMANENT_DEPARTMENTS
  ).filter((department) => department.name !== 'Interns' && department.name !== 'Operation Team');

  const visibleTasks = getVisibleTasksForCurrentUser();
  const allConflicts = getPriorityConflicts();
  const selectedMember = employees.find((employee) => employee.id === selectedMemberId) || null;
  const selectedMemberTasks = selectedMember
    ? visibleTasks.filter((task) => task.assignedToId === selectedMember.id)
    : [];

  const getDepartmentSnapshot = (departmentName: DepartmentType) => {
    const departmentTasks = visibleTasks.filter((task) => task.department === departmentName);

    switch (departmentName) {
      case 'Media': {
        const totalReach = socialMetrics.reduce((total, item) => total + item.reach, 0);
        const interactions = socialMetrics.reduce(
          (total, item) => total + item.likes + item.comments + item.shares,
          0
        );
        const engagementRate = totalReach === 0 ? 0 : (interactions / totalReach) * 100;
        return [
          { label: 'Social reach', value: formatNumber(totalReach) },
          { label: 'Total interactions', value: formatNumber(interactions) },
          { label: 'Engagement rate', value: `${engagementRate.toFixed(1)}%` },
          { label: 'Podcast episodes', value: String(podcasts.length) },
          { label: 'Reels in review', value: String(reels.filter((reel) => reel.stage === 'Review').length) },
        ];
      }
      case 'Sales Department': {
        const leads = [...crmLeads, ...openMarketLeads];
        const wonLeads = leads.filter((lead) => lead.stage === 'Won').length;
        const lostLeads = leads.filter((lead) => lead.stage === 'Lost').length;
        const activeLeads = leads.length - wonLeads - lostLeads;
        const conversionRate = leads.length === 0 ? 0 : (wonLeads / leads.length) * 100;
        return [
          { label: 'Pipeline leads', value: String(leads.length) },
          { label: 'Active', value: String(activeLeads) },
          { label: 'Won / Lost', value: `${wonLeads} / ${lostLeads}` },
          { label: 'Conversion rate', value: `${conversionRate.toFixed(1)}%` },
          { label: 'College visits', value: formatNumber(colleges.reduce((total, college) => total + college.visitCount, 0)) },
        ];
      }
      case 'TeleCaller':
        return [
          { label: 'Student records', value: String(telecallerRecords.length) },
          { label: 'Interested', value: String(telecallerRecords.filter((record) => record.callOutcome === 'Interested').length) },
          { label: 'Callbacks', value: String(telecallerRecords.filter((record) => record.callOutcome === 'Call Back').length) },
          { label: 'Converted', value: String(telecallerRecords.filter((record) => record.conversionStatus === 'Converted').length) },
        ];
      case 'Trainer': {
        const activeBatches = batches.filter((batch) => batch.batchStatus === 'Ongoing');
        const activeBatchIds = new Set(activeBatches.map((batch) => batch.id));
        return [
          { label: 'Active batches', value: String(activeBatches.length) },
          { label: 'Students in active batches', value: formatNumber(activeBatches.reduce((total, batch) => total + batch.studentCount, 0)) },
          { label: 'At-risk students', value: String(students.filter((student) => student.status === 'At Risk' && activeBatchIds.has(student.batchId)).length) },
          { label: 'Sessions completed', value: `${activeBatches.reduce((total, batch) => total + batch.completedSessions, 0)} / ${activeBatches.reduce((total, batch) => total + batch.totalSessions, 0)}` },
        ];
      }
      case 'Counselor':
        return [
          { label: 'Counseling sessions', value: String(counselingSessions.length) },
          { label: 'Enrolled', value: String(counselingSessions.filter((session) => session.outcome === 'Enrolled').length) },
          { label: 'Follow-up needed', value: String(counselingSessions.filter((session) => session.outcome === 'Follow-up Needed').length) },
          { label: 'Restricted notes', value: String(counselingSessions.filter((session) => session.restrictedSensitiveNote).length) },
        ];
      case 'Technical Team':
        return [
          { label: 'Open issues', value: String(technicalBugs.filter((bug) => bug.status !== 'Resolved').length) },
          { label: 'Critical issues', value: String(technicalBugs.filter((bug) => bug.priority === 'Critical' && bug.status !== 'Resolved').length) },
          { label: 'Resolved', value: String(technicalBugs.filter((bug) => bug.status === 'Resolved').length) },
          { label: 'Department tasks', value: String(departmentTasks.length) },
        ];
      case 'Interns': {
        const internIds = new Set(employees.filter((employee) => employee.department === 'Interns').map((employee) => employee.id));
        const internTasks = departmentTasks.filter((task) => internIds.has(task.assignedToId));
        return [
          { label: 'Interns', value: String(internIds.size) },
          { label: 'Assigned tasks', value: String(internTasks.length) },
          { label: 'Completed tasks', value: String(internTasks.filter((task) => task.status === 'Approved').length) },
          { label: 'Daily reports', value: String(dailyReports.filter((report) => internIds.has(report.employeeId)).length) },
        ];
      }
      case 'Operation Team': {
        const activeEvents = events.filter(
          (event) => event.participatingDepartments.includes('Operation Team') && event.status !== 'Completed'
        );
        const activeCampaigns = campaigns.filter(
          (campaign) => campaign.participatingDepartments.includes('Operation Team') && campaign.status !== 'Completed'
        );
        return [
          { label: 'Active events', value: String(activeEvents.length) },
          { label: 'Active campaigns', value: String(activeCampaigns.length) },
          { label: 'Pending tasks', value: String(departmentTasks.filter((task) => task.status !== 'Approved').length) },
          { label: 'Daily reports', value: String(dailyReports.filter((report) => report.department === 'Operation Team').length) },
        ];
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Dashboard"
        subtitle="Select a department to view its current work, workflows and team members without leaving this dashboard."
        icon={Building2}
        badge={`${visibleDepartments.length} Authorized Units`}
      />

      {currentRole === 'DIRECTOR' && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-purple-500 shrink-0" />
          Showing only departments assigned to <b>{currentEmployee.name}</b>. Other Directors&apos; departments and private metrics are hidden.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleDepartments.map((department) => (
            <button
              type="button"
              key={department.id}
              onClick={() => {
                const route = departmentRoutes[department.name];
                if (route) {
                  router.push(route);
                  return;
                }
                setSelectedMemberId(null);
                setSelectedDept(department.name);
              }}
              aria-label={`Open ${department.name} workspace`}
              className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`h-1.5 bg-gradient-to-r ${department.color}`} />
              <div className="flex min-h-32 items-start gap-4 bg-gradient-to-br from-white via-white to-slate-50 px-5 py-6 transition group-hover:from-violet-50 group-hover:to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:group-hover:from-slate-800 dark:group-hover:to-indigo-950">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${department.accent} transition duration-200 group-hover:scale-105`}>
                  <Building2 className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black tracking-tight text-slate-800 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-200">
                    {department.name}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-slate-500 line-clamp-3 dark:text-slate-400">
                    {department.description}
                  </span>
                </span>
              </div>
            </button>
        ))}
      </div>

      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-xs shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex shrink-0 items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-4 dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-indigo-950">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-md">
                  {selectedMember ? selectedMember.avatarInitials : <Building2 className="h-5 w-5" />}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedMember ? (
                    <>
                      {selectedMember.name}
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                        Employee profile · {selectedMember.designation}
                      </span>
                    </>
                  ) : (
                    <>
                      {selectedDept} Department
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">
                        Current work · workflows · team
                      </span>
                    </>
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedMember && (
                  <button
                    onClick={() => setSelectedMemberId(null)}
                    className="whitespace-nowrap rounded-xl border border-violet-200 bg-white px-3 py-2 font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-800 dark:text-violet-200 dark:hover:bg-slate-700"
                  >
                    Back to department
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    setSelectedMemberId(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/30"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {selectedMember ? (
                <DepartmentEmployeeProfile
                  employee={selectedMember}
                  employeeDirectory={employees}
                  tasks={selectedMemberTasks}
                  dailyReports={dailyReports}
                />
              ) : (() => {
              const department = PERMANENT_DEPARTMENTS.find((item) => item.name === selectedDept);
              if (!department) return null;
              const departmentTasks = visibleTasks.filter((task) => task.department === department.name);
              const activeTasks = departmentTasks.filter((task) => task.status !== 'Approved');
              const completedDepartmentTasks = departmentTasks.filter((task) => task.status === 'Approved');
              const orderedTasks = [...activeTasks, ...completedDepartmentTasks];
              const taskAssigneeIds = new Set(departmentTasks.map((task) => task.assignedToId));
              const departmentMembers = employees.filter(
                (employee) => employee.department === department.name || taskAssigneeIds.has(employee.id)
              );

              return (
                <>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {getDepartmentSnapshot(department.name).map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/80 p-4 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-indigo-950/40">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{metric.label}</p>
                        <p className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <h4 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                          <Activity className="h-4 w-4" />
                        </span>
                        Department workflows
                      </h4>
                      <ul className="space-y-2.5 text-slate-600 dark:text-slate-300">
                        {departmentWorkflows[department.name].map((workflow) => (
                          <li key={workflow} className="flex gap-2.5 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/70">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">✓</span>
                            <span className="leading-relaxed">{workflow}</span>
                          </li>
                        ))}
                      </ul>
                      {department.name === 'Counselor' && (
                        <p className="flex items-center gap-1.5 mt-3 text-amber-700 dark:text-amber-300">
                          <Lock className="w-3.5 h-3.5" />
                          Restricted counseling notes are not displayed in this overview.
                        </p>
                      )}
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-900 dark:text-white">Team members & contributors</h4>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {departmentMembers.length} members
                        </span>
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {departmentMembers.map((employee) => {
                          const employeeTasks = departmentTasks.filter((task) => task.assignedToId === employee.id);
                          const hasConflict = allConflicts.some((conflict) => conflict.employeeId === employee.id);
                          return (
                            <button
                              key={employee.id}
                              type="button"
                              onClick={() => setSelectedMemberId(employee.id)}
                              aria-label={`View profile for ${employee.name}`}
                              className="group/member flex w-full items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-violet-800 dark:hover:bg-violet-950/30"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${employee.avatarColor} text-[10px] font-bold text-white`}>
                                  {employee.avatarInitials}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate font-bold text-slate-900 dark:text-white">{employee.name}</span>
                                  <span className="block truncate text-[10px] text-slate-500">{employee.designation} · {employee.department}</span>
                                </span>
                              </div>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {hasConflict && <StatusBadge label="Conflict" variant="danger" />}
                                <span className="hidden text-[10px] text-slate-500 sm:inline">{employeeTasks.length} tasks</span>
                                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover/member:translate-x-0.5 group-hover/member:text-violet-600" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          <CheckSquare className="h-4 w-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">What {department.name} is working on</h4>
                          <p className="mt-0.5 text-slate-500">{activeTasks.length} active · {completedDepartmentTasks.length} completed</p>
                        </div>
                      </div>
                      <StatusBadge label={`${departmentTasks.length} total tasks`} variant="info" />
                    </div>
                    {orderedTasks.length ? (
                      <div className="space-y-2">
                        {orderedTasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-3 transition hover:border-blue-100 hover:shadow-sm dark:border-slate-800 dark:from-slate-800/70 dark:to-slate-900 dark:hover:border-blue-900">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
                                <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-300">{task.description}</p>
                                <p className="mt-1 flex flex-wrap items-center gap-x-1 text-[10px] text-slate-500">
                                  <span>{task.project} ·</span>
                                  {employees.some((employee) => employee.id === task.assignedToId) ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMemberId(task.assignedToId)}
                                      className="inline-flex items-center gap-0.5 font-bold text-violet-600 hover:text-violet-800 dark:text-violet-300 dark:hover:text-violet-200"
                                    >
                                      {task.assignedToName}
                                      <ArrowRight className="h-3 w-3" />
                                    </button>
                                  ) : (
                                    <span>{task.assignedToName}</span>
                                  )}
                                  <span>· Due {formatDate(task.dueDate)}</span>
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                <StatusBadge label={task.status} variant={task.status === 'Approved' ? 'success' : 'info'} />
                                <StatusBadge label={task.priority} variant={task.priority === 'Critical' ? 'danger' : 'warning'} />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                                <div className="h-full rounded-full bg-violet-600" style={{ width: `${task.progressPct}%` }} />
                              </div>
                              <span className="w-9 text-right text-[10px] text-slate-500">{task.progressPct}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No department tasks are currently assigned.</p>
                    )}
                  </section>

                </>
              );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
