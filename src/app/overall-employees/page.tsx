'use client';

import React, { useState } from 'react';
import { Building2, CalendarDays, Search, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

type EmployeeStatus = 'Active' | 'On leave' | 'Contract';

type OverallEmployee = {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location: string;
  status: EmployeeStatus;
};

type EmployeeActivity = {
  date: string;
  employeeId: string;
  employeeName: string;
  department: string;
  activity: string;
  status: 'Completed' | 'In progress';
};

const DEMO_OVERALL_EMPLOYEES: OverallEmployee[] = [
  { id: 'ORG-EMP-001', name: 'Isha Kapoor', email: 'isha.kapoor@example.org', title: 'Operations Director', department: 'Executive Office', location: 'Pune', status: 'Active' },
  { id: 'ORG-EMP-002', name: 'Neil Fernandes', email: 'neil.fernandes@example.org', title: 'Brand Strategy Lead', department: 'Marketing', location: 'Mumbai', status: 'Active' },
  { id: 'ORG-EMP-003', name: 'Tara Nair', email: 'tara.nair@example.org', title: 'Content Producer', department: 'Media', location: 'Bengaluru', status: 'Active' },
  { id: 'ORG-EMP-004', name: 'Kabir Sethi', email: 'kabir.sethi@example.org', title: 'Partnerships Manager', department: 'Sales', location: 'Pune', status: 'Active' },
  { id: 'ORG-EMP-005', name: 'Mira Thomas', email: 'mira.thomas@example.org', title: 'Software Engineer', department: 'Technology', location: 'Hyderabad', status: 'Active' },
  { id: 'ORG-EMP-006', name: 'Rohan Bhat', email: 'rohan.bhat@example.org', title: 'Finance Analyst', department: 'Finance', location: 'Mumbai', status: 'On leave' },
  { id: 'ORG-EMP-007', name: 'Zoya Merchant', email: 'zoya.merchant@example.org', title: 'People Operations Partner', department: 'People & Culture', location: 'Pune', status: 'Active' },
  { id: 'ORG-EMP-008', name: 'Arnav Rao', email: 'arnav.rao@example.org', title: 'Business Operations Associate', department: 'Operations', location: 'Delhi', status: 'Contract' },
];

const DEMO_EMPLOYEE_ACTIVITY: EmployeeActivity[] = [
  { date: '2026-11-28', employeeId: 'ORG-EMP-001', employeeName: 'Isha Kapoor', department: 'Executive Office', activity: 'Reviewed the company-wide operations report.', status: 'Completed' },
  { date: '2026-11-28', employeeId: 'ORG-EMP-004', employeeName: 'Kabir Sethi', department: 'Sales', activity: 'Followed up with institutional partners.', status: 'In progress' },
  { date: '2026-11-27', employeeId: 'ORG-EMP-003', employeeName: 'Tara Nair', department: 'Media', activity: 'Prepared the upcoming content calendar.', status: 'Completed' },
  { date: '2026-11-27', employeeId: 'ORG-EMP-005', employeeName: 'Mira Thomas', department: 'Technology', activity: 'Completed an internal dashboard maintenance task.', status: 'Completed' },
  { date: '2026-11-26', employeeId: 'ORG-EMP-007', employeeName: 'Zoya Merchant', department: 'People & Culture', activity: 'Drafted an onboarding plan for a new team member.', status: 'In progress' },
  { date: '2026-11-25', employeeId: 'ORG-EMP-006', employeeName: 'Rohan Bhat', department: 'Finance', activity: 'Reviewed and reconciled monthly expense entries.', status: 'Completed' },
  { date: '2026-11-24', employeeId: 'ORG-EMP-008', employeeName: 'Arnav Rao', department: 'Operations', activity: 'Coordinated the vendor delivery schedule.', status: 'Completed' },
];

const statusVariant: Record<EmployeeStatus, 'success' | 'warning' | 'info'> = {
  Active: 'success',
  'On leave': 'warning',
  Contract: 'info',
};

export default function OverallEmployeesPage() {
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedActivityDate, setSelectedActivityDate] = useState('2026-11-28');

  const departments = Array.from(new Set(DEMO_OVERALL_EMPLOYEES.map((employee) => employee.department)));
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEmployees = DEMO_OVERALL_EMPLOYEES.filter((employee) => {
    const matchesQuery =
      !normalizedQuery ||
      [employee.name, employee.email, employee.title, employee.department, employee.location]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    const matchesDepartment = departmentFilter === 'ALL' || employee.department === departmentFilter;
    return matchesQuery && matchesDepartment;
  });
  const activeCount = DEMO_OVERALL_EMPLOYEES.filter((employee) => employee.status === 'Active').length;
  const dailyActivities = DEMO_EMPLOYEE_ACTIVITY.filter((entry) => entry.date === selectedActivityDate);
  const activityDates = Array.from(new Set(DEMO_EMPLOYEE_ACTIVITY.map((entry) => entry.date))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Overall Employees"
        subtitle="Independent company-wide demo directory, separate from Education employee records."
        icon={Users}
        badge="Demo Data"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { label: 'Total employees', value: DEMO_OVERALL_EMPLOYEES.length, detail: 'In this demo directory', icon: Users },
          { label: 'Active employees', value: activeCount, detail: 'Currently active', icon: Building2 },
        ].map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-slate-400">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Company directory</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredEmployees.length} of {DEMO_OVERALL_EMPLOYEES.length} demo employees
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <label className="flex min-w-56 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-none">
              <Search className="h-4 w-4 text-slate-400" />
              <span className="sr-only">Search employees</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search employees..."
                className="w-full bg-transparent outline-none placeholder:text-slate-400 sm:w-44"
              />
            </label>
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              aria-label="Filter by department"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="ALL">All departments</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3">Employee</th>
                  <th className="px-5 py-3">Department</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{employee.name}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{employee.email}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{employee.id}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200">{employee.department}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{employee.title}</td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{employee.location}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={employee.status} variant={statusVariant[employee.status]} />
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No demo employees match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Daily activity history</h2>
            <p className="mt-1 text-xs text-slate-500">Review independent demo activity records by date.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
            <CalendarDays className="h-4 w-4 text-slate-400" />
            <span className="sr-only">Select activity date</span>
            <input
              type="date"
              value={selectedActivityDate}
              onChange={(event) => setSelectedActivityDate(event.target.value)}
              className="bg-transparent text-slate-700 outline-none dark:text-slate-200"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {dailyActivities.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyActivities.map((entry) => (
                <article key={`${entry.date}-${entry.employeeId}`} className="flex flex-wrap items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{entry.employeeName}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">{entry.employeeId} · {entry.department}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{entry.activity}</p>
                  </div>
                  <StatusBadge
                    label={entry.status}
                    variant={entry.status === 'Completed' ? 'success' : 'warning'}
                  />
                </article>
              ))}
            </div>
          ) : (
            <p className="px-5 py-10 text-center text-xs text-slate-500">
              No demo activity records for this date. Try one of the available dates below.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500">Available demo dates:</span>
          {activityDates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedActivityDate(date)}
              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold ${
                selectedActivityDate === date
                  ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
