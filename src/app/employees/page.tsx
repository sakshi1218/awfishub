'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  ArrowRightLeft,
  FileCheck2,
  History,
  X,
  Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Employee, DepartmentType, RoleType } from '@/types';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function EmployeesPage() {
  const {
    employees,
    roleSeats,
    addEmployee,
    transferEmployeeDepartment,
    updateOffboardingChecklist,
  } = useApp();

  const [tab, setTab] = useState<'DIRECTORY' | 'SEATS'>('DIRECTORY');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [showAdd, setShowAdd] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Employee | null>(null);
  const [offboardTarget, setOffboardTarget] = useState<Employee | null>(null);
  const [detailTarget, setDetailTarget] = useState<Employee | null>(null);

  const [newForm, setNewForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    role: 'STAFF' as RoleType,
    department: 'Technical Team' as DepartmentType,
    team: 'Platform Engineering',
    employmentType: 'Full-time' as Employee['employmentType'],
  });

  const [transferDept, setTransferDept] = useState<DepartmentType>('Sales Department');
  const [transferSeat, setTransferSeat] = useState('SEAT-SALES-04');

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.permanentId.toLowerCase().includes(search.toLowerCase()) ||
      e.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || e.department === deptFilter;
    const matchStatus = statusFilter === 'ALL' || e.employmentStatus === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee({
      name: newForm.name,
      email: newForm.email,
      phone: newForm.phone,
      designation: newForm.designation,
      role: newForm.role,
      department: newForm.department,
      team: newForm.team,
      employmentType: newForm.employmentType,
      joiningDate: new Date().toISOString().split('T')[0],
      reportingManagerId: 'AWF-EMP-008',
      reportingManagerName: 'Tanvi Patil',
      reportingDirectorId: 'AWF-EMP-003',
      roleSeatId: `SEAT-${newForm.department.slice(0, 4).toUpperCase()}-NEW`,
      employmentStatus: 'Active',
      avatarInitials: newForm.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      avatarColor: 'bg-blue-600',
      bio: `${newForm.designation} in ${newForm.department}.`,
      responsibilities: ['Core departmental deliverables'],
      skills: ['Collaboration', 'Execution'],
    });
    setShowAdd(false);
    setNewForm({
      name: '',
      email: '',
      phone: '',
      designation: '',
      role: 'STAFF',
      department: 'Technical Team',
      team: 'Platform Engineering',
      employmentType: 'Full-time',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity, Employees & Role Seat Continuity"
        subtitle="Permanent IDs (AWF-EMP / AWF-INT), stable role seats, handover workflows, department transfers & offboarding."
        icon={Users}
        actions={
          <>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTab('DIRECTORY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  tab === 'DIRECTORY' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Employees ({employees.length})
              </button>
              <button
                onClick={() => setTab('SEATS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  tab === 'SEATS' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                Role Seats & Handover ({roleSeats.length})
              </button>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" /> Add Employee
            </button>
          </>
        }
      />

      {tab === 'DIRECTORY' ? (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search permanent ID, name, designation..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
            >
              <option value="ALL">All 8 Departments</option>
              {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Notice Period">Notice Period</option>
              <option value="Offboarded">Offboarded</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Permanent ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Seat</th>
                  <th className="py-3 px-4">Manager</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{emp.permanentId}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{emp.name}</p>
                      <p className="text-[11px] text-slate-500">{emp.designation} • {emp.employmentType}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.department}</p>
                      <p className="text-[10px] font-mono text-slate-400">{emp.roleSeatId}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{emp.reportingManagerName}</td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        label={emp.employmentStatus}
                        variant={emp.employmentStatus === 'Active' ? 'success' : emp.employmentStatus === 'Notice Period' ? 'warning' : 'danger'}
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1">
                        <button onClick={() => setDetailTarget(emp)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Details & History">
                          <Eye className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => { setTransferTarget(emp); setTransferDept(emp.department); }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Department Transfer"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => setOffboardTarget(emp)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Offboarding Checklist"
                        >
                          <FileCheck2 className="w-4 h-4 text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleSeats.map((seat) => {
            const holder = employees.find((e) => e.id === seat.currentEmployeeId);
            return (
              <div key={seat.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600">{seat.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{seat.seatTitle}</h3>
                  </div>
                  <StatusBadge label={seat.handoverStatus} variant={seat.handoverStatus === 'Stable' ? 'success' : 'warning'} />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Seat Holder</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{holder?.name || 'Vacant'}</p>
                  <p className="text-[11px] text-slate-500">{holder?.permanentId} • {seat.department}</p>
                </div>

                {seat.handoverDetails && (
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-[11px] space-y-1">
                    <p className="font-bold text-amber-800 dark:text-amber-300">Replacement Handover Interface</p>
                    <p>Previous: {seat.handoverDetails.previousEmployee}</p>
                    <p>Replacement: {seat.handoverDetails.replacementEmployee}</p>
                    <p>Pending Tasks: {seat.handoverDetails.pendingTasksCount} • Docs: {seat.handoverDetails.handoverDocs.join(', ')}</p>
                    <p className="text-[10px] text-slate-500">Scope: {seat.handoverDetails.approvedHistoricalScope}</p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <History className="w-3.5 h-3.5" /> Historical Continuity
                  </span>
                  {seat.previousHolders.length === 0 ? 'Original seat holder active.' : seat.previousHolders.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{p.name}</span>
                      <span className="font-mono">{p.tenure}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Activity History Modal */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setDetailTarget(null)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{detailTarget.name}</h3>
            <p className="text-xs text-blue-600 font-semibold">{detailTarget.permanentId} • {detailTarget.designation}</p>
            <div className="mt-4 space-y-2 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">Activity History</p>
              {detailTarget.activityHistory.map((act, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between gap-2">
                  <span>{act.action}</span>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">{act.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Department Transfer Modal */}
      {transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Department Transfer</h3>
            <p className="text-xs text-slate-500 mt-1">Transferring {transferTarget.name} ({transferTarget.permanentId})</p>
            <div className="mt-4 space-y-3 text-xs">
              <select
                value={transferDept}
                onChange={(e) => setTransferDept(e.target.value as DepartmentType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <input
                type="text"
                value={transferSeat}
                onChange={(e) => setTransferSeat(e.target.value)}
                placeholder="New Role Seat ID"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setTransferTarget(null)} className="px-3 py-1.5 rounded-lg text-slate-500">Cancel</button>
                <button
                  onClick={() => {
                    transferEmployeeDepartment(transferTarget.id, transferDept, transferSeat);
                    setTransferTarget(null);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offboarding Checklist Modal */}
      {offboardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Employee Offboarding Checklist</h3>
            <p className="text-xs text-slate-500 mt-0.5">{offboardTarget.name} ({offboardTarget.permanentId})</p>
            <div className="mt-4 space-y-2.5 text-xs">
              {(
                [
                  ['assetsReturned', 'Company Assets Returned'],
                  ['knowledgeHandoverDone', 'Knowledge & Docs Handover Completed'],
                  ['credentialsRevoked', 'Credentials & Access Revoked'],
                  ['exitInterviewCompleted', 'Exit Interview Completed'],
                  ['financialSettlementDone', 'Final Settlement Cleared'],
                ] as const
              ).map(([key, label]) => {
                const liveEmp = employees.find((e) => e.id === offboardTarget.id);
                const checked = liveEmp?.offboardingChecklist?.[key] || false;
                return (
                  <label key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => updateOffboardingChecklist(offboardTarget.id, key, e.target.checked)}
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setOffboardTarget(null)} className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Employee</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3 text-xs">
              <input required placeholder="Full Name" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required type="email" placeholder="Email" value={newForm.email} onChange={(e) => setNewForm({ ...newForm, email: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required placeholder="Phone" value={newForm.phone} onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required placeholder="Designation" value={newForm.designation} onChange={(e) => setNewForm({ ...newForm, designation: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="grid grid-cols-2 gap-2">
                <select value={newForm.role} onChange={(e) => setNewForm({ ...newForm, role: e.target.value as RoleType })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <option value="STAFF">Staff Member</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="INTERN">Intern</option>
                </select>
                <select value={newForm.department} onChange={(e) => setNewForm({ ...newForm, department: e.target.value as DepartmentType })} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  {PERMANENT_DEPARTMENTS.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
