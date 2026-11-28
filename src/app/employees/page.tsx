'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, RotateCcw, UserRound, X, UserPlus, Download, CalendarDays, BarChart3, Package, FileText, ClipboardCheck } from 'lucide-react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MOCK_LEAVE_HISTORY } from '@/data/mock/leave-history';
import { MOCK_ASSETS } from '@/data/mock/financeAssets';
import { MOCK_DAILY_REPORTS } from '@/data/mock/tasks';

const DEMO_EMPLOYEES: EmployeeRow[] = [
  { id: 'demo-counselor', employeeId: 'DEMO-C01', name: 'Meera Kulkarni', email: 'meera.kulkarni@mindlyft.in', designation: 'Student Counselor', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-counselor-dept', name: 'Counselor' }, reportingManager: null },
  { id: 'demo-counselor-2', employeeId: 'DEMO-C02', name: 'Priya Nair', email: 'priya.nair@mindlyft.in', designation: 'Career Counselor', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-counselor-dept', name: 'Counselor' }, reportingManager: null },
  { id: 'demo-trainer', employeeId: 'DEMO-TN01', name: 'Amit Verma', email: 'amit.verma@mindlyft.in', designation: 'Technical Trainer', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-trainer-dept', name: 'Trainer' }, reportingManager: null },
  { id: 'demo-trainer-2', employeeId: 'DEMO-TN02', name: 'Pooja Verma', email: 'pooja.verma@mindlyft.in', designation: 'Senior Trainer', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-trainer-dept', name: 'Trainer' }, reportingManager: null },
  { id: 'demo-media', employeeId: 'DEMO-M01', name: 'Ishita Roy', email: 'ishita.roy@mindlyft.in', designation: 'Content Producer', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-media-dept', name: 'Media' }, reportingManager: null },
  { id: 'demo-telecaller', employeeId: 'DEMO-T01', name: 'Gaurav Kulkarni', email: 'gaurav.kulkarni@mindlyft.in', designation: 'TeleCaller Executive', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-telecaller-dept', name: 'TeleCaller' }, reportingManager: null },
  { id: 'demo-telecaller-2', employeeId: 'DEMO-T02', name: 'Sneha Pawar', email: 'sneha.pawar@mindlyft.in', designation: 'TeleCaller Executive', role: 'EMPLOYEE', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-telecaller-dept', name: 'TeleCaller' }, reportingManager: null },
  { id: 'demo-intern', employeeId: 'DEMO-I01', name: 'Aarav Sharma', email: 'aarav.sharma@mindlyft.in', designation: 'Technology Intern', role: 'INTERN', status: 'ACTIVE', avatarUrl: null, department: { id: 'demo-intern-dept', name: 'Interns' }, reportingManager: null },
];

type EmployeeRow = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  avatarUrl: string | null;
  department: { id: string; name: string } | null;
  reportingManager: { id: string; name: string; designation: string } | null;
};

type EmployeeDetails = EmployeeRow & {
  joiningDate?: string;
  reportingDirector?: { id: string; name: string; designation: string } | null;
  subordinates?: Array<{ id: string; employeeId: string; name: string; designation: string; status: string }>;
  directorSubordinates?: Array<{ id: string; employeeId: string; name: string; designation: string; status: string }>;
  tasksAssigned?: Array<{ id: string; taskId: string; title: string; status: string; priority?: string; deadline?: string; progressPercentage?: number; createdAt: string }>;
  tasksReceived?: Array<{ id: string; taskId: string; title: string; status: string; priority?: string; deadline?: string; progressPercentage?: number; createdAt: string }>;
  dailyReports?: Array<{ id: string; reportDate: string; status: string; tasksWorkedOn?: string; tasksCompleted?: string; tasksPending?: string; timeSpentHours?: number; workDescription?: string }>;
  reportingHistory?: Array<{ id: string; changeDate: string; reason: string; previousManagerId?: string | null; newManagerId?: string | null }>;
};

type EmployeeTask = NonNullable<EmployeeDetails['tasksReceived']>[number];

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'];
const EMPLOYEE_GROUPS = [
  { name: 'Counselors', description: 'Student guidance and career counseling', accent: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200 hover:border-emerald-400', matches: (employee: EmployeeRow) => employee.department?.name === 'Counselor' },
  { name: 'Trainers', description: 'Faculty, training and learning delivery', accent: 'bg-violet-100 text-violet-700', border: 'border-violet-200 hover:border-violet-400', matches: (employee: EmployeeRow) => employee.department?.name === 'Trainer' && employee.role !== 'DIRECTOR' },
  { name: 'TeleCallers', description: 'Student outreach and follow-ups', accent: 'bg-orange-100 text-orange-700', border: 'border-orange-200 hover:border-orange-400', matches: (employee: EmployeeRow) => employee.department?.name === 'TeleCaller' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [designation, setDesignation] = useState('ALL');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const employeeDirectoryRef = React.useRef<HTMLDivElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRow | null>(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [taskDateFilter, setTaskDateFilter] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([fetch('/api/employees'), fetch('/api/departments')])
      .then(async ([employeeResponse, departmentResponse]) => {
        if (!employeeResponse.ok) throw new Error('Could not load employees. Check the database connection and try again.');
        const employeeData = await employeeResponse.json();
        const departmentData = departmentResponse.ok ? await departmentResponse.json() : [];
        if (active) {
          const existingEmployeeIds = new Set(employeeData.map((employee: EmployeeRow) => employee.employeeId));
          setEmployees([...employeeData, ...DEMO_EMPLOYEES.filter((employee) => !existingEmployeeIds.has(employee.employeeId))]);
          setDepartments(departmentData.filter((d: { isActive?: boolean }) => d.isActive !== false));
        }
      })
      .catch((e: Error) => {
        if (!active) return;
        setEmployees(DEMO_EMPLOYEES);
        setDepartments([
          { id: 'demo-counselor-dept', name: 'Counselor' },
          { id: 'demo-trainer-dept', name: 'Trainer' },
          { id: 'demo-telecaller-dept', name: 'TeleCaller' },
        ]);
        setError(`${e.message} Showing demo employee data.`);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedEmployeeDetails(null);
      return;
    }
    let active = true;
    setDetailsLoading(true);
    fetch(`/api/employees/${selectedEmployee.id}`)
      .then(async (response) => response.ok ? response.json() : null)
      .then((details) => { if (active) setSelectedEmployeeDetails(details); })
      .catch(() => { if (active) setSelectedEmployeeDetails(null); })
      .finally(() => { if (active) setDetailsLoading(false); });
    return () => { active = false; };
  }, [selectedEmployee]);

  const designations = useMemo(() => Array.from(new Set(employees.map((e) => e.designation).filter(Boolean))).sort(), [employees]);
  const filtered = useMemo(() => employees.filter((e) => {
    const q = search.trim().toLowerCase();
    return (!q || [e.name, e.email, e.employeeId, e.designation, e.department?.name, e.reportingManager?.name].some((v) => v?.toLowerCase().includes(q)))
      && (department === 'ALL' || e.department?.id === department)
      && (designation === 'ALL' || e.designation === designation)
      && (role === 'ALL' || e.role === role)
      && (status === 'ALL' || e.status === status)
      && (!selectedGroup || EMPLOYEE_GROUPS.find((group) => group.name === selectedGroup)?.matches(e));
  }), [employees, search, department, designation, role, status, selectedGroup]);
  const clearFilters = () => { setSearch(''); setDepartment('ALL'); setDesignation('ALL'); setRole('ALL'); setStatus('ALL'); setSelectedGroup(null); };
  const employeeLeaveRecords = selectedEmployee ? MOCK_LEAVE_HISTORY[selectedEmployee.employeeId] || [] : [];

  const profile: EmployeeDetails | null = selectedEmployeeDetails || (selectedEmployee ? selectedEmployee : null);
  const employeeTasks = profile?.tasksReceived || [];
  const currentTasks = employeeTasks.filter((task) =>
    ['IN_PROGRESS', 'ON_HOLD', 'SUBMITTED_FOR_REVIEW', 'CHANGES_REQUESTED'].includes(task.status) &&
    (!taskDateFilter || task.deadline?.slice(0, 10) === taskDateFilter)
  );
  const pendingTasks = employeeTasks.filter((task) => task.status === 'NOT_STARTED');
  const groupTasks = (tasks: EmployeeTask[]) => {
    const groups: Record<string, EmployeeTask[]> = {};
    tasks.forEach((task) => {
    const sourceDate = task.deadline || task.createdAt;
    const date = new Date(sourceDate);
    const key = date.toLocaleDateString();
    (groups[key] ||= []).push(task);
    });
    return groups;
  };
  const currentTaskGroups = groupTasks(currentTasks);
  const pendingTaskGroups = groupTasks(pendingTasks);
  const assignedAssets = selectedEmployee ? MOCK_ASSETS.filter((asset) => asset.assignedToId === selectedEmployee.employeeId) : [];
  const employeeReports = profile?.dailyReports?.length ? profile.dailyReports : selectedEmployee ? MOCK_DAILY_REPORTS.filter((report) => report.employeeId === selectedEmployee.employeeId).map((report) => ({ id: report.id, reportDate: report.date, status: report.status, tasksWorkedOn: report.tasksWorkedOn.join(', '), tasksCompleted: report.tasksCompleted.join(', '), tasksPending: report.tasksPending.join(', '), timeSpentHours: report.timeSpentHours, workDescription: report.workDescription })) : [];
  const activeTaskCount = currentTasks.length + pendingTasks.length;
  const workloadPercentage = Math.min(100, activeTaskCount * 20);
  const lastReport = employeeReports[0];
  const approvedLeaveDays = employeeLeaveRecords.filter((record) => record.status === 'Approved').reduce((sum, record) => sum + record.totalDays, 0);
  const leaveBalance = Math.max(0, 18 - approvedLeaveDays);
  const attendanceDays = employeeReports.filter((report) => report.status === 'Reviewed' || report.status === 'Submitted').length;
  const attendancePercentage = Math.min(100, Math.round((attendanceDays / 22) * 100));

  const downloadEmployeeReport = () => {
    if (!profile) return;
    const escapeCsv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows: string[][] = [
      ['Employee report', ''],
      ['Name', profile.name],
      ['Employee ID', profile.employeeId],
      ['Department', profile.department?.name || ''],
      ['Designation', profile.designation || ''],
      ['Email', profile.email || ''],
      [],
      ['Task ID', 'Title', 'Status', 'Priority', 'Due date', 'Progress'],
      ...employeeTasks.map((task) => [task.taskId, task.title, task.status, task.priority || '', task.deadline || '', String(task.progressPercentage || 0)]),
      [],
      ['Report date', 'Report status', 'Hours', 'Work description', 'Tasks completed', 'Tasks pending'],
      ...employeeReports.map((report) => [report.reportDate, report.status, String(report.timeSpentHours || 0), report.workDescription || '', report.tasksCompleted || '', report.tasksPending || '']),
      [],
      ['Assigned assets', 'Category', 'Status', 'Condition', 'Expected return'],
      ...assignedAssets.map((asset) => [asset.name, asset.category, asset.status, asset.condition, asset.expectedReturnDate || '']),
      [],
      ['Leave balance', `${leaveBalance} days remaining`],
      ['Attendance summary', `${attendancePercentage}% report attendance`],
    ];
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.employeeId}-employee-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
    <PageHeader
      title="Employee Management"
      subtitle="Directory, reporting assignments, historical transitions, and profile records"
      icon={Users}
      badge={`${employees.length} Employees`}
      actions={<button type="button" disabled title="Administrator authentication is required" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white opacity-60"><UserPlus className="h-4 w-4" />Add New Employee</button>}
    />
    <section aria-label="Employee groups" className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Browse by team</h2>
          <p className="text-xs text-slate-500 mt-0.5">Choose a group to view its employees.</p>
        </div>
        {selectedGroup && <button type="button" onClick={() => setSelectedGroup(null)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Show all employees</button>}
      </div>
      <div role="tablist" aria-label="Employee team filters" className="flex w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {EMPLOYEE_GROUPS.map((group) => {
          const count = employees.filter(group.matches).length;
          const selected = selectedGroup === group.name;
          return (
            <button
              key={group.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => { setSelectedGroup(group.name); window.setTimeout(() => employeeDirectoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }}
              className={`flex min-w-[220px] flex-1 items-center justify-between gap-3 border-r border-slate-200 px-5 py-4 text-left transition-colors last:border-r-0 dark:border-slate-800 ${selected ? 'bg-blue-50/70 dark:bg-blue-950/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${group.accent}`}><Users className="h-4 w-4" /></span>
                <span className={`truncate text-sm font-semibold ${selected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-300'}`}>{group.name}</span>
              </span>
              <span className="shrink-0 text-lg font-bold tabular-nums text-slate-900 dark:text-white">{count}</span>
            </button>
          );
        })}
      </div>
    </section>
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
        <label className="relative"><Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, manager…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"/></label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"><option value="ALL">All departments</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"><option value="ALL">All designations</option>{designations.map((d) => <option key={d} value={d}>{d}</option>)}</select>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"><option value="ALL">All system roles</option>{Array.from(new Set([...SYSTEM_ROLES, ...employees.map((e) => e.role)])).sort().map((r) => <option key={r}>{r}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
      </div>
      <button onClick={clearFilters} className="inline-flex gap-1.5 items-center text-xs text-blue-700 dark:text-blue-300"><RotateCcw className="w-3.5 h-3.5"/>Clear filters</button>
    </section>
    {error && <div role="alert" className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm">{error}</div>}
    {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading team members…</div> : <div ref={employeeDirectoryRef} className="scroll-mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-500"><tr>{['Team member', 'Designation', 'System role', 'Department', 'Email', 'Reporting manager', 'Status'].map((h) => <th className="py-3 px-4 font-bold" key={h}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((employee) => <tr key={employee.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
          <td className="py-3 px-4"><button type="button" onClick={() => setSelectedEmployee(employee)} className="group flex items-center gap-3 text-left"><div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center overflow-hidden shrink-0">{employee.avatarUrl ? <Image src={employee.avatarUrl} alt="" width={36} height={36} unoptimized className="w-full h-full object-cover"/> : <UserRound className="w-4 h-4"/>}</div><span><span className="block font-bold text-slate-900 group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">{employee.name}</span><span className="block text-[10px] text-slate-500">{employee.employeeId}</span><span className="mt-1 block text-[10px] font-semibold text-blue-600 opacity-80 group-hover:opacity-100">View profile →</span></span></button></td>
          <td className="py-3 px-4">{employee.designation || '—'}</td><td className="py-3 px-4"><span className="font-mono text-[10px]">{employee.role}</span></td><td className="py-3 px-4">{employee.department?.name || '—'}</td><td className="py-3 px-4"><a className="text-blue-700 dark:text-blue-300 hover:underline" href={`mailto:${employee.email}`}>{employee.email}</a></td><td className="py-3 px-4">{employee.reportingManager?.name || '—'}</td><td className="py-3 px-4"><StatusBadge label={employee.status === 'ACTIVE' ? 'Active' : 'Inactive'} variant={employee.status === 'ACTIVE' ? 'success' : 'danger'}/></td>
        </tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-500">No team members match these filters.</td></tr>}</tbody>
      </table>
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">Showing {filtered.length} of {employees.length} employees</div>
    </div>}
    {selectedEmployee && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedEmployee(null)}>
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="employee-profile-title"
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="employee-profile-title" className="text-lg font-bold text-slate-900 dark:text-white">{profile?.name || selectedEmployee.name}</h2>
              <p className="text-xs text-slate-500">{profile?.employeeId || selectedEmployee.employeeId} · {profile?.designation || 'No designation'}</p>
              {detailsLoading && <p className="mt-1 text-[10px] text-blue-600">Loading complete employee profile…</p>}
            </div>
            <button type="button" aria-label="Close employee profile" onClick={() => setSelectedEmployee(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            <button type="button" onClick={downloadEmployeeReport} disabled={!profile || detailsLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-3.5 w-3.5" />Download report</button>
          </div>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Email', profile?.email || 'Not provided'],
              ['Department', profile?.department?.name || 'Not assigned'],
              ['Reporting manager', profile?.reportingManager?.name || 'Not assigned'],
              ['Joining date', profile?.joiningDate ? new Date(profile.joiningDate).toLocaleDateString() : 'Not provided'],
              ['Status', profile?.status || 'Not specified'],
            ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3"><dt className="text-[10px] uppercase text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</dd></div>)}
          </dl>
          {profile && <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Employee summary"><div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3"><BarChart3 className="h-4 w-4 text-blue-700" /><p className="mt-2 text-[10px] uppercase text-slate-500">Workload</p><p className="text-lg font-bold text-slate-900">{workloadPercentage}%</p><p className="text-[10px] text-slate-500">{activeTaskCount} open tasks</p></div><div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3"><ClipboardCheck className="h-4 w-4 text-emerald-700" /><p className="mt-2 text-[10px] uppercase text-slate-500">Attendance</p><p className="text-lg font-bold text-slate-900">{attendancePercentage}%</p><p className="text-[10px] text-slate-500">report days logged</p></div><div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3"><CalendarDays className="h-4 w-4 text-amber-700" /><p className="mt-2 text-[10px] uppercase text-slate-500">Leave balance</p><p className="text-lg font-bold text-slate-900">{leaveBalance} days</p><p className="text-[10px] text-slate-500">of 18 annual days</p></div><div className="rounded-xl border border-violet-200 bg-violet-50/70 p-3"><FileText className="h-4 w-4 text-violet-700" /><p className="mt-2 text-[10px] uppercase text-slate-500">Last report</p><p className="text-sm font-bold text-slate-900">{lastReport?.reportDate ? new Date(lastReport.reportDate).toLocaleDateString() : 'Not submitted'}</p><p className="text-[10px] text-slate-500">{lastReport?.status || 'No report yet'}</p></div></section>}
          {profile && <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Manager approval</h3><p className="mt-1 text-[11px] text-slate-500">Latest daily report review status.</p></div><ClipboardCheck className="h-5 w-5 text-blue-600" /></div><p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{lastReport?.status === 'Reviewed' ? 'Approved by manager' : lastReport?.status === 'Submitted' ? 'Waiting for manager review' : 'No report submitted'}</p><p className="mt-1 text-xs text-slate-500">Manager: {profile.reportingManager?.name || 'Not assigned'}</p></div><div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Assets assigned</h3><p className="mt-1 text-[11px] text-slate-500">Company property currently in custody.</p></div><Package className="h-5 w-5 text-amber-600" /></div>{assignedAssets.length ? <div className="mt-3 space-y-2">{assignedAssets.map((asset) => <div key={asset.id} className="flex items-center justify-between gap-2 text-xs"><span className="truncate text-slate-700 dark:text-slate-300">{asset.name}</span><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">{asset.status}</span></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No company assets assigned.</p>}</div></section>}
          {profile && (
            <section className="mt-5 space-y-4">
              {[
                { title: 'Current tasks', description: 'Tasks currently being worked on or awaiting review.', tasks: currentTasks, tone: 'blue' },
                { title: 'Pending tasks', description: 'Tasks assigned but not started yet.', tasks: pendingTasks, tone: 'amber' },
              ].map(({ title, description, tasks, tone }) => (
                <div key={title} className={`rounded-2xl border p-4 ${tone === 'blue' ? 'border-blue-200 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/20' : 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">{description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {title === 'Current tasks' && <label className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900" title="Filter current tasks by due date"><CalendarDays className="h-3.5 w-3.5 text-blue-600" /><input type="date" value={taskDateFilter} onChange={(event) => setTaskDateFilter(event.target.value)} aria-label="Filter current tasks by due date" className="bg-transparent text-[10px] font-semibold text-slate-600 outline-none dark:text-slate-300" />{taskDateFilter && <button type="button" onClick={() => setTaskDateFilter('')} aria-label="Clear task date" className="ml-1 text-slate-400 hover:text-slate-700">×</button>}</label>}
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">{tasks.length}</span>
                    </div>
                  </div>
                  {tasks.length ? (
                    <div className="mt-3 space-y-4">
                      {Object.entries(title === 'Current tasks' ? currentTaskGroups : pendingTaskGroups).map(([group, groupedTasks]) => (
                        <div key={group}>
                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Due {group}</h4>
                          <div className="space-y-2">
                            {groupedTasks.map((task) => <div key={task.id} className="rounded-xl border border-white/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">{task.title}</p>
                              <p className="mt-1 text-[10px] text-slate-500">{task.taskId}{task.deadline ? ` · Due ${new Date(task.deadline).toLocaleDateString()}` : ''}</p>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.priority?.toUpperCase() === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>{task.priority ? 'Priority' : task.status.replace(/_/g, ' ')}</span>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full ${tone === 'blue' ? 'bg-blue-600' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, Math.max(0, task.progressPercentage || 0))}%` }} /></div>
                            <span className="w-8 text-right text-[10px] text-slate-500">{task.progressPercentage || 0}%</span>
                          </div>
                            </div>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs italic text-slate-500 dark:border-slate-700 dark:bg-slate-900/50">No {title.toLowerCase()} for this employee.</p>}
                </div>
              ))}
            </section>
          )}
          <section className="mt-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leave history</h3>
            {employeeLeaveRecords.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">No leave history is available for this employee.</p>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500"><tr>{['Dates', 'Type', 'Days', 'Status', 'Reason'].map((label) => <th key={label} className="px-3 py-2 font-semibold">{label}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeLeaveRecords.map((record) => <tr key={record.id}><td className="px-3 py-2">{record.startDate}{record.startDate !== record.endDate ? ` – ${record.endDate}` : ''}</td><td className="px-3 py-2">{record.leaveType}</td><td className="px-3 py-2">{record.totalDays}</td><td className="px-3 py-2">{record.status}</td><td className="px-3 py-2">{record.reason}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="mt-5"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily reports</h3>{employeeReports.length ? <div className="mt-2 space-y-2">{employeeReports.slice(0, 3).map((report) => <div key={report.id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><div className="flex justify-between gap-2 text-xs"><b>{new Date(report.reportDate).toLocaleDateString()}</b><span className="text-slate-500">{report.status} · {report.timeSpentHours || 0}h</span></div><p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{report.workDescription || 'No description provided.'}</p></div>)}</div> : <p className="mt-2 text-xs text-slate-500">No daily reports available.</p>}</section>
        </section>
      </div>
    )}
  </div>;
}
