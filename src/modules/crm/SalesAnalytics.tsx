'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Building2,
  GraduationCap,
  Handshake,
  Users,
  FileCheck2,
  CalendarClock,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  mockColleges,
  mockCollegeVisits,
  mockFDPSessions,
  mockTieups,
  mockInterestedClients,
  mockAgreements,
  mockSalesFollowUps,
} from '@/data/mock/salesCRM';

const PIE_COLORS = ['#7c3aed', '#d946ef', '#2563eb', '#059669', '#d97706', '#e11d48'];

export default function SalesAnalytics() {
  const [employeeFilter, setEmployeeFilter] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('2026');

  const employees = useMemo(() => {
    const names = new Set<string>();
    mockCollegeVisits.forEach((v) => names.add(v.assignedEmployee));
    mockFDPSessions.forEach((f) => names.add(f.assignedEmployee));
    mockInterestedClients.forEach((c) => names.add(c.assignedSalesperson));
    return ['All', ...Array.from(names)];
  }, []);

  const filteredVisits = useMemo(() => {
    return mockCollegeVisits.filter((v) => {
      const empOk = employeeFilter === 'All' || v.assignedEmployee === employeeFilter;
      const dateOk = dateRange === 'All' || v.visitDate.startsWith(dateRange === 'Q4' ? '2026-1' : '2026');
      return empOk && dateOk;
    });
  }, [employeeFilter, dateRange]);

  const filteredFDPs = useMemo(
    () => mockFDPSessions.filter((f) => employeeFilter === 'All' || f.assignedEmployee === employeeFilter),
    [employeeFilter]
  );

  const filteredClients = useMemo(
    () => mockInterestedClients.filter((c) => employeeFilter === 'All' || c.assignedSalesperson === employeeFilter),
    [employeeFilter]
  );

  const wonClients = filteredClients.filter((c) => c.stage === 'Won').length;
  const conversionRate = filteredClients.length > 0 ? Math.round((wonClients / filteredClients.length) * 100) : 0;

  const monthlyVisitsData = useMemo(() => {
    const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const map: Record<string, number> = { '07': 0, '08': 0, '09': 0, '10': 0, '11': 0 };
    filteredVisits.forEach((v) => {
      const m = v.visitDate.slice(5, 7);
      if (map[m] !== undefined) map[m] += 1;
    });
    return months.map((label, idx) => ({
      month: label,
      visits: map[String(idx + 7).padStart(2, '0')] || (idx === 4 ? filteredVisits.length : 1),
    }));
  }, [filteredVisits]);

  const outcomePieData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisits.forEach((v) => {
      counts[v.outcome] = (counts[v.outcome] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVisits]);

  const visitsByEmployeeData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCollegeVisits.forEach((v) => {
      counts[v.assignedEmployee] = (counts[v.assignedEmployee] || 0) + 1;
    });
    return Object.entries(counts).map(([name, visits]) => ({ name: name.split(' ')[0], visits }));
  }, []);

  const pipelineData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredClients.forEach((c) => {
      counts[c.stage] = (counts[c.stage] || 0) + 1;
    });
    return Object.entries(counts).map(([stage, count]) => ({ stage, count }));
  }, [filteredClients]);

  const collegeEngagement = useMemo(() => {
    return mockColleges.map((c) => ({
      id: c.id,
      name: c.name,
      visits: mockCollegeVisits.filter((v) => v.collegeId === c.id).length,
      fdps: mockFDPSessions.filter((f) => f.collegeId === c.id).length,
      agreements: mockAgreements.filter((a) => a.collegeId === c.id).length,
      tieups: mockTieups.filter((t) => t.collegeId === c.id).length,
    }));
  }, []);

  const expiringAgreements = mockAgreements.filter((a) => a.status === 'Expiring Soon');
  const overdueFollowUps = mockSalesFollowUps.filter((f) => f.status === 'Overdue' || f.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Sales Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track college engagement, employee visit activity, FDP conversions, and agreement renewals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            <option value="2026">FY 2026</option>
            <option value="Q4">Q4 (Oct–Nov 2026)</option>
            <option value="All">All Time</option>
          </select>
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
          >
            {employees.map((emp) => (
              <option key={emp} value={emp}>
                {emp === 'All' ? 'All Sales Employees' : emp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Building2 className="w-4 h-4 text-violet-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{filteredVisits.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold">College Visits</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <GraduationCap className="w-4 h-4 text-blue-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{filteredFDPs.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold">FDP Proposals</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Handshake className="w-4 h-4 text-emerald-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {mockTieups.filter((t) => t.status === 'Active' || t.status === 'Signed').length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">Active Tie-ups</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Users className="w-4 h-4 text-amber-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{conversionRate}%</p>
          <p className="text-[11px] text-slate-500 font-semibold">Lead Conversion</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <FileCheck2 className="w-4 h-4 text-rose-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{mockAgreements.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold">Agreements</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CalendarClock className="w-4 h-4 text-indigo-600 mb-1.5" />
          <p className="text-xl font-black text-slate-900 dark:text-white">{overdueFollowUps.length}</p>
          <p className="text-[11px] text-slate-500 font-semibold">Pending Follow-ups</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Monthly Sales Visit Activity</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyVisitsData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="visits" fill="#7c3aed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Visit Outcomes Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={outcomePieData} dataKey="value" nameKey="name" outerRadius={85} label>
                  {outcomePieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Visits by Sales Employee</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitsByEmployeeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="visits" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">CRM Pipeline Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <XAxis dataKey="stage" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#d946ef" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* College Engagement Table + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">College-wise Engagement Matrix</h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2 pr-3">College</th>
                <th className="py-2 px-3 text-center">Visits</th>
                <th className="py-2 px-3 text-center">FDPs</th>
                <th className="py-2 px-3 text-center">Tie-ups</th>
                <th className="py-2 pl-3 text-center">Agreements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {collegeEngagement.map((row) => (
                <tr key={row.id}>
                  <td className="py-2.5 pr-3 font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">{row.visits}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">{row.fdps}</td>
                  <td className="py-2.5 px-3 text-center font-semibold">{row.tieups}</td>
                  <td className="py-2.5 pl-3 text-center font-semibold text-violet-600">{row.agreements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Expiring Agreements & Overdue
          </h3>
          <div className="space-y-2">
            {expiringAgreements.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 text-xs">
                <p className="font-bold text-orange-800 dark:text-orange-300">{a.title}</p>
                <p className="text-[11px] text-orange-600">{a.collegeName} • Expires {a.expiryDate}</p>
              </div>
            ))}
            {overdueFollowUps
              .filter((f) => f.status === 'Overdue')
              .map((f) => (
                <div key={f.id} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-xs">
                  <p className="font-bold text-rose-800 dark:text-rose-300">{f.title}</p>
                  <p className="text-[11px] text-rose-600">{f.relatedCollege} • Due {f.followUpDate}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
