'use client';

import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';

export function ReportsView({ defaultPersonal = false }: { defaultPersonal?: boolean }) {
  const {
    employees,
    tasks,
    crmLeads,
    batches,
    events,
    isChairperson,
    currentEmployee,
    currentRole,
    getDirectorAllowedDepartments,
  } = useApp();

  const [reportScope, setReportScope] = useState<'EXEC' | 'DEPT' | 'PERSONAL' | 'CRM' | 'FINANCE'>(
    defaultPersonal ? 'PERSONAL' : 'EXEC'
  );

  // Director isolation: Director only sees their own divisions
  const allowedTasks =
    currentRole === 'DIRECTOR'
      ? tasks.filter((t) => getDirectorAllowedDepartments(currentEmployee.id).includes(t.department))
      : tasks;

  const deptData = PERMANENT_DEPARTMENTS.filter(
    (d) => currentRole !== 'DIRECTOR' || getDirectorAllowedDepartments(currentEmployee.id).includes(d.name)
  ).map((d) => ({
    name: d.code,
    tasks: allowedTasks.filter((t) => t.department === d.name).length,
    kpi: d.kpiRate,
  }));

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(allowedTasks), 'Tasks');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(crmLeads), 'CRM Pipeline');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(batches), 'Batches');
    XLSX.writeFile(wb, `AWFIS_HUB_Analytics_${reportScope}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={defaultPersonal ? 'My Reports & Personal Performance' : 'Reporting & Analytics Center'}
        subtitle="Role-specific Executive, Department, Personal, CRM, and Chairperson-only Financial reports."
        icon={BarChart3}
        actions={
          <button onClick={exportExcel} className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['EXEC', 'Executive Reports'],
            ['DEPT', 'Department Reports'],
            ['PERSONAL', 'Personal Reports'],
            ['CRM', 'CRM Reports'],
            ...(isChairperson ? ([['FINANCE', 'Financial Reports (Chairperson)']] as const) : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setReportScope(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
              reportScope === id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="Employees" value={employees.length} icon={FileSpreadsheet} tone="blue" />
        <DashboardMetricCard label="Authorized Tasks" value={allowedTasks.length} icon={FileSpreadsheet} tone="emerald" />
        <DashboardMetricCard label="CRM Opportunities" value={crmLeads.length} icon={FileSpreadsheet} tone="indigo" />
        <DashboardMetricCard label="Events Tracked" value={events.length} icon={FileSpreadsheet} tone="purple" />
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          {reportScope === 'PERSONAL'
            ? `Personal Task Completion (${currentEmployee.name})`
            : 'Departmental KPI & Task Volume'}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="kpi" name="KPI %" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="tasks" name="Tasks" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return <ReportsView />;
}
