'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { DailyReport, Department, LeaveRequest, Prisma, ReportingHistory, Task } from '@prisma/client';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Eye,
  History,
  X,
  Save,
  ChevronRight,
  Flag,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type EmployeeSummary = Prisma.EmployeeGetPayload<{
  include: {
    department: true;
    reportingManager: { select: { id: true; name: true; designation: true } };
    reportingDirector: { select: { id: true; name: true; designation: true } };
  };
}>;

type EmployeeRecord = EmployeeSummary & {
  reportingHistory?: ReportingHistory[];
  profileUpdateHistory?: Array<{
    id: string;
    createdAt: Date | string;
    details: string | null;
    user: { name: string } | null;
  }>;
  tasksReceived?: Task[];
  dailyReports?: DailyReport[];
  leaveRequests?: LeaveRequest[];
};

const EMPLOYEE_GROUPS = [
  {
    name: 'Counselors',
    description: 'Student guidance and career counseling',
    matches: (employee: EmployeeSummary) =>
      employee.department?.name.toLowerCase().includes('counsel') ||
      employee.designation.toLowerCase().includes('counsel'),
    accent: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    border: 'border-emerald-200 hover:border-emerald-400 dark:border-emerald-900',
  },
  {
    name: 'Directors',
    description: 'Company and department leadership',
    matches: (employee: EmployeeSummary) =>
      employee.role.includes('DIRECTOR') || employee.role === 'FOUNDER',
    accent: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    border: 'border-indigo-200 hover:border-indigo-400 dark:border-indigo-900',
  },
  {
    name: 'Trainers',
    description: 'Faculty, training and learning delivery',
    matches: (employee: EmployeeSummary) =>
      /training|education|trainer/i.test(employee.department?.name || '') ||
      /trainer|faculty|instructor/i.test(employee.designation),
    accent: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    border: 'border-violet-200 hover:border-violet-400 dark:border-violet-900',
  },
  {
    name: 'Media Team',
    description: 'Content, podcast and social media',
    matches: (employee: EmployeeSummary) =>
      /media|marketing/i.test(employee.department?.name || '') ||
      /media|content|podcast/i.test(employee.designation),
    accent: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    border: 'border-rose-200 hover:border-rose-400 dark:border-rose-900',
  },
  {
    name: 'Interns',
    description: 'Internship cohorts and apprentices',
    matches: (employee: EmployeeSummary) =>
      employee.role.includes('INTERN') || /intern/i.test(employee.designation),
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    border: 'border-amber-200 hover:border-amber-400 dark:border-amber-900',
  },
  {
    name: 'TeleCallers',
    description: 'Student outreach and follow-ups',
    matches: (employee: EmployeeSummary) =>
      /tele.?caller|calling/i.test(employee.department?.name || '') ||
      /tele.?caller/i.test(employee.designation),
    accent: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    border: 'border-orange-200 hover:border-orange-400 dark:border-orange-900',
  },
  {
    name: 'Operation Team',
    description: 'Coordination, logistics and operations',
    matches: (employee: EmployeeSummary) =>
      /operation/i.test(employee.department?.name || '') ||
      /operation/i.test(employee.designation),
    accent: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    border: 'border-slate-300 hover:border-slate-500 dark:border-slate-700',
  },
];

type LeaveGrouping = 'date' | 'month' | 'year';

function parseReportItems(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
    }
    return value.trim() ? [value] : [];
  } catch {
    return value.trim() ? [value] : [];
  }
}

export default function EmployeesPage() {
  const { currentUser, isFounder, isDirector, refreshUsers } = useAuth();
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [leaveGrouping, setLeaveGrouping] = useState<LeaveGrouping>('date');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSelfEditOpen, setIsSelfEditOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeRecord | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
  });

  // Form state
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'EMPLOYEE',
    departmentId: '',
    reportingManagerId: '',
    reportingDirectorId: '',
    status: 'ACTIVE',
    responsibilities: '',
    reasonForChange: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/departments'),
      ]);
      if (empRes.ok) setEmployees(await empRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    const nextId = `ML-E0${employees.length + 1}`;
    setFormData({
      employeeId: nextId,
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: 'EMPLOYEE',
      departmentId: departments[0]?.id || '',
      reportingManagerId: '',
      reportingDirectorId: '',
      status: 'ACTIVE',
      responsibilities: '',
      reasonForChange: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeSummary) => {
    setSelectedEmp(emp);
    setFormData({
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      designation: emp.designation,
      role: emp.role,
      departmentId: emp.departmentId || '',
      reportingManagerId: emp.reportingManagerId || '',
      reportingDirectorId: emp.reportingDirectorId || '',
      status: emp.status,
      responsibilities: emp.responsibilities || '',
      reasonForChange: '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (emp: EmployeeSummary) => {
    try {
      const res = await fetch(`/api/employees/${emp.id}`);
      if (res.ok) {
        setSelectedEmp(await res.json());
        setIsSelfEditOpen(false);
        setIsViewModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenSelfEdit = () => {
    if (!selectedEmp || currentUser?.id !== selectedEmp.id) return;
    setProfileForm({
      name: selectedEmp.name,
      email: selectedEmp.email,
      phone: selectedEmp.phone || '',
      avatarUrl: selectedEmp.avatarUrl || '',
    });
    setIsSelfEditOpen(true);
  };

  const handleSaveSelfEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || currentUser?.id !== selectedEmp.id) return;

    try {
      const res = await fetch(`/api/employees/${selectedEmp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileForm, currentUserId: currentUser.id }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to update profile');
        return;
      }

      setIsSelfEditOpen(false);
      await Promise.all([loadData(), refreshUsers()]);
      await handleOpenView(selectedEmp);
    } catch (error) {
      console.error(error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedEmp.id }),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update employee');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to set this employee to INACTIVE?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const searchTerm = search.trim().toLocaleLowerCase();
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchTerm ||
      [emp.name, emp.employeeId, emp.designation, emp.email, emp.role?.replace(/_/g, ' ')]
        .some((value) => String(value ?? '').toLocaleLowerCase().includes(searchTerm));

    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesDept = deptFilter === 'ALL' || emp.departmentId === deptFilter;
    const activeGroup = EMPLOYEE_GROUPS.find((group) => group.name === selectedGroup);
    const matchesGroup = !activeGroup || activeGroup.matches(emp);

    return matchesSearch && matchesRole && matchesDept && matchesGroup;
  });

  const managersList = employees.filter(
    (e) => e.role === 'MANAGER' || e.role.includes('DIRECTOR') || e.role === 'FOUNDER'
  );
  const directorsList = employees.filter(
    (e) => e.role.includes('DIRECTOR') || e.role === 'FOUNDER'
  );
  const employeeTasks = selectedEmp?.tasksReceived || [];
  const completedTasks = employeeTasks.filter((task) => task.status === 'COMPLETED');
  const pendingTasks = employeeTasks.filter(
    (task) => task.status !== 'COMPLETED' && task.status !== 'CANCELLED'
  );
  const priorityTasks = employeeTasks
    .filter((task) => task.status !== 'CANCELLED' && ['CRITICAL', 'HIGH'].includes(task.priority.toUpperCase()))
    .sort((a, b) => {
      const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (priorityOrder[a.priority.toUpperCase()] ?? 4)
        - (priorityOrder[b.priority.toUpperCase()] ?? 4)
        || new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  const leaveRequests = selectedEmp?.leaveRequests || [];
  const groupedLeaveRequests = leaveRequests.reduce<{ label: string; records: LeaveRequest[] }[]>((groups, record) => {
    const date = new Date(record.startDate);
    const label = leaveGrouping === 'date'
      ? date.toLocaleDateString()
      : leaveGrouping === 'month'
        ? date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        : String(date.getFullYear());
    const group = groups.find((item) => item.label === label);
    if (group) group.records.push(record);
    else groups.push({ label, records: [record] });
    return groups;
  }, []);
  const employmentType = selectedEmp
    ? selectedEmp.designation.toLowerCase().includes('intern')
      ? 'Intern'
      : 'Not specified'
    : 'Not specified';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Employee Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directory, reporting assignments, historical transitions, and profile records
              </p>
            </div>
          </div>
        </div>

        {(isFounder || isDirector) && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add New Employee
          </button>
        )}
      </div>

      <section aria-label="Employee groups" className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Browse by team</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose a group to view its employees and profiles.</p>
          </div>
          {selectedGroup && (
            <button
              type="button"
              onClick={() => setSelectedGroup(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Show all employees
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {EMPLOYEE_GROUPS.map((group) => {
            const count = employees.filter(group.matches).length;
            const selected = selectedGroup === group.name;
            return (
              <button
                key={group.name}
                type="button"
                onClick={() => {
                  setSelectedGroup(selected ? null : group.name);
                  setSearch('');
                  setRoleFilter('ALL');
                  setDeptFilter('ALL');
                }}
                aria-pressed={selected}
                className={`rounded-2xl border p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  selected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/30'
                    : `bg-white dark:bg-slate-900 ${group.border}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${group.accent}`}>
                    <Users className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {count}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{group.name}</h3>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{group.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, role, designation, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="FOUNDER">Founder</option>
            <option value="DIRECTOR">Director</option>
            <option value="SALES_DIRECTOR">Sales Director</option>
            <option value="MANAGER">Manager</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="SALES_EMPLOYEE">Sales Employee</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedGroup ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{selectedGroup}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{filteredEmployees.length} matching employees</p>
          </div>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
              Loading employees...
            </div>
          ) : filteredEmployees.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredEmployees.map((employee) => (
                <button
                  key={employee.id}
                  type="button"
                  onClick={() => handleOpenView(employee)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {employee.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{employee.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">{employee.designation}</span>
                    <span className="mt-1 block truncate text-[10px] font-mono text-blue-600">{employee.employeeId} · {employee.department?.name || 'Leadership Office'}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 dark:border-slate-700">
              No employees match the current search and filters.
            </div>
          )}
        </section>
      ) : (
      <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Role & Designation</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Reporting Lines</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No employees match your search.
                  </td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                        <p className="text-[11px] text-slate-400">{emp.email}</p>
                        <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
                          {emp.employeeId}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {emp.designation}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        emp.role === 'FOUNDER'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : emp.role.includes('DIRECTOR')
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : emp.role === 'MANAGER'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {emp.role.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {emp.department?.name || 'Leadership Office'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-[11px] space-y-0.5">
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400">Mgr:</span>{' '}
                        {emp.reportingManager?.name || '—'}
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        <span className="text-slate-400">Dir:</span>{' '}
                        {emp.reportingDirector?.name || 'Founder'}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                      {emp.status}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenView(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {(isFounder || isDirector) && (
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Profile & Reporting Structure"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {isFounder && emp.role !== 'FOUNDER' && (
                        <button
                          onClick={() => handleDeactivate(emp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Deactivate Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Add / Edit Employee Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAddModalOpen ? 'Add New Employee' : `Edit Employee: ${formData.name}`}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isEditModalOpen}
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="SALES_EMPLOYEE">Sales Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="DIRECTOR">Director</option>
                    <option value="SALES_DIRECTOR">Sales Director</option>
                    {isFounder && <option value="FOUNDER">Founder</option>}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Executive Leadership Office</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Employment Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Manager
                  </label>
                  <select
                    value={formData.reportingManagerId}
                    onChange={(e) => setFormData({ ...formData, reportingManagerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">None / Reports to Director directly</option>
                    {managersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reporting Director
                  </label>
                  <select
                    value={formData.reportingDirectorId}
                    onChange={(e) => setFormData({ ...formData, reportingDirectorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">None / Reports to Founder</option>
                    {directorsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditModalOpen && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Reporting Change (Recorded in Historical Audit)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Promotion, Department restructuring, Reassignment"
                    value={formData.reasonForChange}
                    onChange={(e) => setFormData({ ...formData, reasonForChange: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Responsibilities & Key Result Areas (KRAs)
                </label>
                <textarea
                  rows={3}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="Outline key day-to-day deliverables, goals, and accountabilities..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  Save Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Profile Modal */}
      {isViewModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsSelfEditOpen(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Close employee profile"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-white text-blue-700 text-2xl font-black flex items-center justify-center shadow-lg overflow-hidden">
                  <span>{selectedEmp.name.charAt(0)}</span>
                  {selectedEmp.avatarUrl && (
                    <Image
                      src={selectedEmp.avatarUrl}
                      alt={`${selectedEmp.name} profile`}
                      fill
                      sizes="64px"
                      unoptimized
                      className="object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedEmp.name}</h3>
                  <p className="text-xs text-blue-100 font-medium">{selectedEmp.designation}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                      {selectedEmp.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-blue-200">
                      Employee ID: {selectedEmp.employeeId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                      {selectedEmp.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
              <section>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                  Employee Identification & Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.name}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Unique Employee ID</span>
                    <p className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.employeeId}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 break-all">{selectedEmp.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.phone || 'Not provided'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department / Team</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.department?.name || 'Executive Leadership'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Designation / Role Seat</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.designation}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Employment Type</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{employmentType}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{new Date(selectedEmp.joiningDate).toLocaleDateString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Role</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.role.replace(/_/g, ' ')}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Employment Status</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmp.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </section>

              <section className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[11px]">
                      Permitted Self-Service Profile Fields
                    </h4>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      Employees can update their own full name, email, contact number, and profile photo.
                    </p>
                  </div>
                  {currentUser?.id === selectedEmp.id && !isSelfEditOpen && (
                    <button
                      onClick={handleOpenSelfEdit}
                      className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                    >
                      Edit My Profile
                    </button>
                  )}
                </div>
                {isSelfEditOpen && currentUser?.id === selectedEmp.id && (
                  <form onSubmit={handleSaveSelfEdit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Full name
                      <input
                        required
                        maxLength={120}
                        value={profileForm.name}
                        onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </label>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Email
                      <input
                        required
                        type="email"
                        maxLength={254}
                        value={profileForm.email}
                        onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </label>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Contact number
                      <input
                        maxLength={40}
                        value={profileForm.phone}
                        onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </label>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Profile photo URL
                      <input
                        type="url"
                        value={profileForm.avatarUrl}
                        onChange={(event) => setProfileForm({ ...profileForm, avatarUrl: event.target.value })}
                        placeholder="https://example.com/photo.jpg"
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </label>
                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsSelfEditOpen(false)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                      >
                        Save Profile
                      </button>
                    </div>
                  </form>
                )}
              </section>

              {/* Reporting Hierarchy */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs uppercase tracking-wider mb-2">
                  Reporting Hierarchy
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500">Reporting Manager</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedEmp.reportingManager?.name || 'None (Direct Report / Founder)'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {selectedEmp.reportingManager?.designation}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Reporting Director</span>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {selectedEmp.reportingDirector?.name || 'Founder'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {selectedEmp.reportingDirector?.designation}
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-4 dark:border-rose-900/70 dark:from-rose-950/30 dark:to-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                      <Flag className="h-4 w-4" />
                    </span>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
                        Priority Tasks
                      </h4>
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p>
                            <p className="mt-0.5 text-[10px] text-slate-500">
                              {task.taskId} · Due {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-1.5">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              task.priority.toUpperCase() === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {task.priority}
                            </span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {task.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-[10px] text-slate-600 dark:text-slate-300">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                            <div
                              className={`h-full rounded-full ${task.priority.toUpperCase() === 'CRITICAL' ? 'bg-rose-600' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(100, Math.max(0, task.progressPercentage))}%` }}
                            />
                          </div>
                          <span className="w-9 text-right text-[10px] font-semibold text-slate-500">
                            {Math.min(100, Math.max(0, task.progressPercentage))}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-rose-200 p-3 text-xs italic text-slate-500 dark:border-rose-900/50">
                    No priority tasks are assigned to this employee.
                  </p>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Assigned Tasks
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {completedTasks.length} completed · {pendingTasks.length} pending
                  </span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {[
                    { title: 'Completed Tasks', tasks: completedTasks },
                    { title: 'Pending Tasks', tasks: pendingTasks },
                  ].map(({ title, tasks }) => (
                    <div key={title} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300 mb-2">{title} ({tasks.length})</h5>
                      {tasks.length ? (
                        <ul className="space-y-2">
                          {tasks.map((task) => (
                            <li key={task.id} className="border-t border-slate-200 dark:border-slate-700 pt-2 first:border-0 first:pt-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                              <p className="text-[10px] text-slate-500">
                                {task.taskId} · {task.status.replace(/_/g, ' ')} · Due {new Date(task.deadline).toLocaleDateString()}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic">No {title.toLowerCase()}.</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-indigo-600" />
                      <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-800 dark:text-slate-200">
                        Leave History
                      </h4>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500">Leave requests recorded for this employee.</p>
                  </div>
                  <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800" aria-label="Group leave history">
                    {([
                      ['date', 'Date'],
                      ['month', 'Month'],
                      ['year', 'Year'],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLeaveGrouping(value)}
                        aria-pressed={leaveGrouping === value}
                        className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
                          leaveGrouping === value
                            ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-900 dark:text-blue-300'
                            : 'text-slate-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                {groupedLeaveRequests.length ? (
                  <div className="mt-3 space-y-3">
                    {groupedLeaveRequests.map(({ label, records }) => (
                      <div key={label}>
                        <h5 className="mb-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">{label}</h5>
                        <div className="space-y-2">
                          {records.map((record) => (
                            <div
                              key={record.id}
                              className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-800/50"
                            >
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {record.leaveType.replace(/_/g, ' ')} leave · {record.totalDays} day{record.totalDays === 1 ? '' : 's'}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-500">
                                  {new Date(record.startDate).toLocaleDateString()}
                                  {new Date(record.startDate).toDateString() !== new Date(record.endDate).toDateString() &&
                                    ` – ${new Date(record.endDate).toLocaleDateString()}`}
                                  {' · '}{record.reason}
                                  {record.rejectionReason && ` · Rejection: ${record.rejectionReason}`}
                                </p>
                              </div>
                              <span className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                record.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : record.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}>
                                {record.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs italic text-slate-500 dark:bg-slate-800/50">
                    No leave history recorded for this employee.
                  </p>
                )}
              </section>

              <section>
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
                  Daily Tasks & Reports
                </h4>
                {selectedEmp.dailyReports?.length ? (
                  <div className="space-y-3">
                    {selectedEmp.dailyReports.map((report) => (
                      <div key={report.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {new Date(`${report.reportDate}T00:00:00`).toLocaleDateString()}
                          </span>
                          <span className="text-slate-500">{report.timeSpentHours} hours · {report.status.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">{report.workDescription}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                          {[
                            { label: 'Worked on', value: report.tasksWorkedOn },
                            { label: 'Completed', value: report.tasksCompleted },
                            { label: 'Pending', value: report.tasksPending },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <h6 className="font-semibold text-slate-500 mb-1">{label}</h6>
                              {parseReportItems(value).length ? (
                                <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                                  {parseReportItems(value).map((item, index) => <li key={`${label}-${index}`}>{item}</li>)}
                                </ul>
                              ) : (
                                <p className="text-slate-400">None listed</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No daily reports submitted.</p>
                )}
              </section>

              {/* Responsibilities */}
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] mb-1">
                  Responsibilities
                </h4>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedEmp.responsibilities || 'No specific responsibilities listed.'}
                </p>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Profile Update History
                  </h4>
                </div>
                {selectedEmp.profileUpdateHistory?.length ? (
                  <div className="space-y-2">
                    {selectedEmp.profileUpdateHistory.map((entry) => (
                      <div key={entry.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap justify-between gap-2 text-[10px] text-slate-400">
                          <span>{new Date(entry.createdAt).toLocaleString()}</span>
                          <span>{entry.user?.name || selectedEmp.name}</span>
                        </div>
                        <p className="mt-1">{entry.details?.replace('Self-service profile updated: ', '')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">No profile updates recorded.</p>
                )}
              </section>

              {/* Historical Reporting Changes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Reporting Hierarchy History
                  </h4>
                </div>
                {selectedEmp.reportingHistory && selectedEmp.reportingHistory.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmp.reportingHistory.map((h) => (
                      <div
                        key={h.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{new Date(h.changeDate).toLocaleString()}</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            Structure Updated
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                          Reason: {h.reason || 'Restructuring'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic">
                    No historical reporting changes recorded. Current structure is original.
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsSelfEditOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
