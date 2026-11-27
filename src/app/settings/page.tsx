'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, AlertCircle, Sun, Moon, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RoleType } from '@/types';
import { ROLE_CONFIGS } from '@/data/constants/roles';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

const ROLES: RoleType[] = [
  'CHAIRPERSON',
  'DIRECTOR',
  'OPERATION_HEAD',
  'TEAM_LEAD',
  'FACULTY',
  'STAFF',
  'INTERN',
];

export default function SettingsAndPermissionsPage() {
  const { permissionMatrix, togglePermission, currentRole, darkMode, toggleDarkMode, employees } = useApp();
  const [selectedRole, setSelectedRole] = useState<RoleType>(currentRole);
  const [accessMode, setAccessMode] = useState<'role' | 'employee'>('role');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id ?? '');
  const [employeeOverrides, setEmployeeOverrides] = useState<Record<string, Record<string, Record<string, boolean>>>>({});
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId);
  const employeeRole = selectedEmployee?.role ?? currentRole;

  const toggleEmployeePermission = (moduleName: string, field: string, currentValue: boolean) => {
    if (!selectedEmployee) return;
    setEmployeeOverrides((previous) => ({
      ...previous,
      [selectedEmployee.id]: {
        ...previous[selectedEmployee.id],
        [moduleName]: {
          ...previous[selectedEmployee.id]?.[moduleName],
          [field]: !currentValue,
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role & Permission Simulation Matrix"
        subtitle="Configure visual module permissions (View, Create, Edit, Delete, Approve, Export) and scopes across all 7 roles."
        icon={Settings}
        actions={
          <button
            onClick={toggleDarkMode}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold flex items-center gap-1.5"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
        }
      />

      {/* Explicit Frontend Simulation Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Visual Permission Simulation Only:</span> This matrix demonstrates frontend role-based UI visibility and scopes using mock state. It does not implement server-side authentication or backend security enforcement.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setAccessMode('role')} className={`px-3.5 py-2 rounded-xl text-xs font-bold ${accessMode === 'role' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>Role defaults</button>
        <button onClick={() => setAccessMode('employee')} className={`px-3.5 py-2 rounded-xl text-xs font-bold ${accessMode === 'employee' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>Employee access</button>
      </div>

      {accessMode === 'role' && <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedRole === r
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {ROLE_CONFIGS[r].title}
          </button>
        ))}
      </div>
      }

      {accessMode === 'employee' && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
          <Users className="h-4 w-4 text-blue-600" />
          <label htmlFor="employee-access" className="text-xs font-bold text-slate-700 dark:text-slate-200">Employee</label>
          <select id="employee-access" value={selectedEmployeeId} onChange={(event) => setSelectedEmployeeId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-900 dark:text-white">
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.designation}</option>)}
          </select>
          <span className="text-[11px] text-slate-500">Base role: {employeeRole.replace(/_/g, ' ')}</span>
        </div>
      )}

      {/* Permission Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {accessMode === 'employee' ? `Access for: ${selectedEmployee?.name ?? 'Select an employee'}` : `Permissions for: ${ROLE_CONFIGS[selectedRole].title}`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{accessMode === 'employee' ? 'Employee-specific access overrides' : ROLE_CONFIGS[selectedRole].description}</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">Scope</th>
              <th className="py-3 px-4 text-center">View</th>
              <th className="py-3 px-4 text-center">Create</th>
              <th className="py-3 px-4 text-center">Edit</th>
              <th className="py-3 px-4 text-center">Delete</th>
              <th className="py-3 px-4 text-center">Approve</th>
              <th className="py-3 px-4 text-center">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {permissionMatrix.map((row) => {
              const base = row.rolePermissions[accessMode === 'employee' ? employeeRole : selectedRole];
              const p = accessMode === 'employee' && selectedEmployee
                ? { ...base, ...employeeOverrides[selectedEmployee.id]?.[row.module] }
                : base;
              return (
                <tr key={row.module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{row.module}</td>
                  <td className="py-3 px-4">
                    <StatusBadge label={p.scope} variant={p.scope === 'Company' ? 'success' : p.scope === 'None' ? 'danger' : 'info'} />
                  </td>
                  {(['view', 'create', 'edit', 'delete', 'approve', 'export'] as const).map((field) => (
                    <td key={field} className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={p[field]}
                        onChange={() => accessMode === 'employee' ? toggleEmployeePermission(row.module, field, p[field]) : togglePermission(row.module, selectedRole, field)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
