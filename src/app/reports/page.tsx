'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Filter,
  Calendar,
  Building,
  User,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/context/AuthContext';

export default function ReportsAnalyticsPage() {
  const { isFounder, isDirector, isManager } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState('ALL');

  useEffect(() => {
    loadData();
  }, [selectedDept, selectedEmp]);

  const loadData = async () => {
    try {
      const url = `/api/reports?${selectedDept !== 'ALL' ? `departmentId=${selectedDept}&` : ''}${
        selectedEmp !== 'ALL' ? `employeeId=${selectedEmp}` : ''
      }`;
      const [repRes, deptRes, empRes] = await Promise.all([
        fetch(url),
        fetch('/api/departments'),
        fetch('/api/employees'),
      ]);
      if (repRes.ok) setData(await repRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel using XLSX
  const handleExportExcel = () => {
    if (!data) return;

    const workbook = XLSX.utils.book_new();

    // Tasks Sheet
    const tasksData = data.tasks.map((t: any) => ({
      'Task ID': t.taskId,
      Title: t.title,
      Department: t.department?.name || 'General',
      'Assigned To': t.assignedTo?.name,
      'Assigned By': t.assignedBy?.name,
      Priority: t.priority,
      Status: t.status,
      'Progress %': t.progressPercentage,
      Deadline: new Date(t.deadline).toLocaleDateString(),
    }));
    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');

    // Daily Reports Sheet
    const reportsData = data.reports.map((r: any) => ({
      Employee: r.employee?.name,
      Date: r.reportDate,
      'Hours Spent': r.timeSpentHours,
      Work: r.workDescription,
      Status: r.status,
    }));
    const reportsSheet = XLSX.utils.json_to_sheet(reportsData);
    XLSX.utils.book_append_sheet(workbook, reportsSheet, 'Daily Reports');

    // College Visits Sheet
    const visitsData = data.visits.map((v: any) => ({
      College: v.college?.name,
      Date: new Date(v.visitDate).toLocaleDateString(),
      'Contact Person': v.contactPersonName,
      Outcome: v.outcome,
      Executive: v.visitedBy?.name,
    }));
    const visitsSheet = XLSX.utils.json_to_sheet(visitsData);
    XLSX.utils.book_append_sheet(workbook, visitsSheet, 'College Visits');

    // Download file
    XLSX.writeFile(workbook, `AWfisHub_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tasksCompleted = data.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const tasksPending = data.tasks.filter((t: any) => t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Reports & Analytics Hub
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Company-wide operational metrics, task completion rates, daily activity, and Excel/PDF export
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Export to Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm no-print">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <Filter className="w-4 h-4" /> Filter By:
        </span>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedEmp}
          onChange={(e) => setSelectedEmp(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="ALL">All Employees</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name} ({e.designation})
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tasks Completed
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {tasksCompleted}
            </span>
            <span className="text-xs font-bold text-slate-400 font-mono">
              / {data.tasks.length} Total
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Daily Reports Logged
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {data.reports.length}
            </span>
            <span className="text-xs font-bold text-blue-600">Reports</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Campus Visits Recorded
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {data.visits.length}
            </span>
            <span className="text-xs font-bold text-purple-600">Field Logs</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Signed MoUs & Ties
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {data.agreements.length}
            </span>
            <span className="text-xs font-bold text-indigo-600">Agreements</span>
          </div>
        </div>
      </div>

      {/* Detailed Tasks Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Task Execution & Delivery Audit
          </h3>
          <span className="text-xs text-slate-400">{data.tasks.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Task ID & Title</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Assigned To</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Progress</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {data.tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                    <span className="font-mono text-blue-600 mr-2">{task.taskId}</span>
                    {task.title}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                    {task.department?.name || 'General'}
                  </td>
                  <td className="px-4 py-3.5 font-medium">{task.assignedTo.name}</td>
                  <td className="px-4 py-3.5 font-bold uppercase text-[10px]">
                    {task.priority}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-blue-600">
                    {task.progressPercentage}%
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-500">
                    {new Date(task.deadline).toLocaleDateString()}
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
