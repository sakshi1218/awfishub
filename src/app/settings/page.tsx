'use client';

import React from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  Key,
  Users,
  Database,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { currentUser, isFounder } = useAuth();

  const permissionMatrix = [
    { module: 'Company Hierarchy & Department Creation', founder: true, director: false, manager: false, employee: false },
    { module: 'Employee Add / Deactivate / Restructure', founder: true, director: true, manager: false, employee: false },
    { module: 'Assign Tasks & Set Deadlines', founder: true, director: true, manager: true, employee: false },
    { module: 'Review & Approve Daily Reports', founder: true, director: true, manager: true, employee: false },
    { module: 'Schedule Review Meetings & Sessions', founder: true, director: true, manager: true, employee: true },
    { module: 'Sales College Visits & FDP Sessions', founder: true, director: true, manager: true, employee: true },
    { module: 'College Agreement Sign-off & Renewals', founder: true, director: true, manager: false, employee: false },
    { module: 'CRM Deals & Pipeline Management', founder: true, director: true, manager: true, employee: true },
    { module: 'Approve Leave Applications', founder: true, director: true, manager: true, employee: false },
    { module: 'Company-Wide Performance & Financials', founder: true, director: true, manager: false, employee: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Settings & Role-Based Permissions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Governance, server-enforced access controls, audit logs, and security parameters
              </p>
            </div>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          Enforced Server-Side via Prisma ORM
        </span>
      </div>

      {/* Role-Based Access Control Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Enterprise RBAC Matrix (Role-Based Access Control)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Founder has absolute oversight; Directors manage assigned divisions; Managers supervise team delivery; Employees access permitted self-service records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">System Capability / Operational Scope</th>
                <th className="px-4 py-3.5 text-center">Founder</th>
                <th className="px-4 py-3.5 text-center">Director</th>
                <th className="px-4 py-3.5 text-center">Manager</th>
                <th className="px-4 py-3.5 text-center">Employee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {permissionMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                    {item.module}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {item.director ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {item.manager ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {item.employee ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
