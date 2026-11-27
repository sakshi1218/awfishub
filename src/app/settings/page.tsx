'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, AlertCircle, Sun, Moon } from 'lucide-react';
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
  const { permissionMatrix, togglePermission, currentRole, darkMode, toggleDarkMode } = useApp();
  const [selectedRole, setSelectedRole] = useState<RoleType>(currentRole);

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

      {/* Role Selector */}
      <div className="flex flex-wrap gap-2">
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

      {/* Permission Matrix Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Permissions for: {ROLE_CONFIGS[selectedRole].title}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">{ROLE_CONFIGS[selectedRole].description}</span>
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
              const p = row.rolePermissions[selectedRole];
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
                        onChange={() => togglePermission(row.module, selectedRole, field)}
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
