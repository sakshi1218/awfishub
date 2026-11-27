'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Users, RotateCcw, UserRound } from 'lucide-react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

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

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'DEPARTMENT_MANAGER', 'TEAM_LEADER', 'EMPLOYEE'];

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

  useEffect(() => {
    let active = true;
    Promise.all([fetch('/api/employees'), fetch('/api/departments')])
      .then(async ([employeeResponse, departmentResponse]) => {
        if (!employeeResponse.ok) throw new Error('Could not load employees. Check the database connection and try again.');
        const employeeData = await employeeResponse.json();
        const departmentData = departmentResponse.ok ? await departmentResponse.json() : [];
        if (active) {
          setEmployees(employeeData);
          setDepartments(departmentData.filter((d: { isActive?: boolean }) => d.isActive !== false));
        }
      })
      .catch((e: Error) => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const designations = useMemo(() => Array.from(new Set(employees.map((e) => e.designation).filter(Boolean))).sort(), [employees]);
  const filtered = useMemo(() => employees.filter((e) => {
    const q = search.trim().toLowerCase();
    return (!q || [e.name, e.email, e.employeeId, e.designation, e.department?.name, e.reportingManager?.name].some((v) => v?.toLowerCase().includes(q)))
      && (department === 'ALL' || e.department?.id === department)
      && (designation === 'ALL' || e.designation === designation)
      && (role === 'ALL' || e.role === role)
      && (status === 'ALL' || e.status === status);
  }), [employees, search, department, designation, role, status]);
  const activeCount = employees.filter((e) => e.status === 'ACTIVE').length;
  const inactiveCount = employees.filter((e) => e.status !== 'ACTIVE').length;
  const departmentCounts = departments.map((d) => ({ ...d, count: employees.filter((e) => e.department?.id === d.id).length }));
  const clearFilters = () => { setSearch(''); setDepartment('ALL'); setDesignation('ALL'); setRole('ALL'); setStatus('ALL'); };

  return <div className="space-y-6">
    <PageHeader title="Team Members" subtitle="Employee directory from the company database, including reporting lines and account status." icon={Users} badge={`${employees.length} Employees`} />
    <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">Directory is read only until server-side administrator authentication and profile image storage are configured.</div>
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[['Total employees', employees.length], ['Active', activeCount], ['Inactive', inactiveCount]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>)}
    </section>
    {departmentCounts.length > 0 && <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">{departmentCounts.map((d) => <div key={d.id} className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3"><p className="text-[11px] text-slate-500 truncate">{d.name}</p><p className="text-lg font-bold mt-1">{d.count}</p></div>)}</section>}
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
    {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading team members…</div> : !error && <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-500"><tr>{['Team member', 'Designation', 'System role', 'Department', 'Email', 'Reporting manager', 'Status'].map((h) => <th className="py-3 px-4 font-bold" key={h}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map((employee) => <tr key={employee.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
          <td className="py-3 px-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center overflow-hidden shrink-0">{employee.avatarUrl ? <Image src={employee.avatarUrl} alt="" width={36} height={36} unoptimized className="w-full h-full object-cover"/> : <UserRound className="w-4 h-4"/>}</div><div><p className="font-bold text-slate-900 dark:text-white">{employee.name}</p><p className="text-[10px] text-slate-500">{employee.employeeId}</p></div></div></td>
          <td className="py-3 px-4">{employee.designation || '—'}</td><td className="py-3 px-4"><span className="font-mono text-[10px]">{employee.role}</span></td><td className="py-3 px-4">{employee.department?.name || '—'}</td><td className="py-3 px-4"><a className="text-blue-700 dark:text-blue-300 hover:underline" href={`mailto:${employee.email}`}>{employee.email}</a></td><td className="py-3 px-4">{employee.reportingManager?.name || '—'}</td><td className="py-3 px-4"><StatusBadge label={employee.status === 'ACTIVE' ? 'Active' : 'Inactive'} variant={employee.status === 'ACTIVE' ? 'success' : 'danger'}/></td>
        </tr>)}{filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-slate-500">No team members match these filters.</td></tr>}</tbody>
      </table>
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">Showing {filtered.length} of {employees.length} employees</div>
    </div>}
  </div>;
}
