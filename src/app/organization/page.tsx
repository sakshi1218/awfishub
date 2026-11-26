'use client';

import React, { useState } from 'react';
import { GitFork, Users, Building2, X, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PERMANENT_DEPARTMENTS } from '@/data/constants/departments';
import { Employee } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function OrganizationPage() {
  const { employees, switchEmployee } = useApp();
  const [viewMode, setViewMode] = useState<'HIERARCHY' | 'DEPARTMENT' | 'DIRECTORY'>('HIERARCHY');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const chairperson = employees.find((e) => e.role === 'CHAIRPERSON');
  const directors = employees.filter((e) => e.role === 'DIRECTOR');
  const opHead = employees.find((e) => e.role === 'OPERATION_HEAD');
  const leads = employees.filter((e) => e.role === 'TEAM_LEAD');
  const members = employees.filter((e) => e.role === 'FACULTY' || e.role === 'STAFF');
  const interns = employees.filter((e) => e.role === 'INTERN');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Structure & Hierarchy"
        subtitle="Chairperson → Director → Operation Head → Department / Team Lead → Team Members → Interns"
        icon={GitFork}
        badge={`${employees.length} Members • 8 Permanent Departments`}
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['HIERARCHY', 'DEPARTMENT', 'DIRECTORY'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === m
                    ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {m === 'HIERARCHY' ? 'Hierarchy Tree' : m === 'DEPARTMENT' ? 'Department View' : 'Directory'}
              </button>
            ))}
          </div>
        }
      />

      {viewMode === 'HIERARCHY' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <div className="min-w-[780px] space-y-6">
            {chairperson && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-amber-600 mb-1.5">Level 1 • Chairperson</span>
                <button
                  onClick={() => setSelectedEmp(chairperson)}
                  className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400 text-center w-72 hover:scale-[1.02] transition-transform"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-600 text-white font-black flex items-center justify-center text-sm">
                    {chairperson.avatarInitials}
                  </div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white mt-2">{chairperson.name}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">{chairperson.designation}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">{chairperson.permanentId} • {chairperson.roleSeatId}</p>
                </button>
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
              </div>
            )}

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-purple-600 mb-1.5">Level 2 • Executive Directors (3)</span>
              <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
                {directors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedEmp(d)}
                    className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-center hover:border-purple-500"
                  >
                    <div className="w-9 h-9 mx-auto rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                      {d.avatarInitials}
                    </div>
                    <p className="font-bold text-xs text-slate-900 dark:text-white mt-1.5">{d.name}</p>
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">{d.designation}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{d.permanentId}</p>
                  </button>
                ))}
              </div>
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
            </div>

            {opHead && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase text-teal-600 mb-1.5">Level 3 • Operation Head</span>
                <button
                  onClick={() => setSelectedEmp(opHead)}
                  className="p-3.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-center w-64 hover:border-teal-500"
                >
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{opHead.name}</p>
                  <p className="text-[11px] text-teal-600 font-medium">{opHead.designation}</p>
                  <p className="text-[10px] font-mono text-slate-400">{opHead.permanentId}</p>
                </button>
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
              </div>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 block text-center mb-2">Level 4 • Department & Team Leads</span>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
                {leads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedEmp(l)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center hover:border-blue-400"
                  >
                    <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{l.name}</p>
                    <p className="text-[10px] text-blue-600 font-semibold truncate">{l.department}</p>
                    <p className="text-[9px] font-mono text-slate-400">{l.permanentId}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-2">Level 5 • Faculty & Staff Members</span>
                <div className="space-y-2">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedEmp(m)}
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-left hover:border-emerald-400"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-[10px] text-slate-500">{m.designation} • Reports to {m.reportingManagerName}</p>
                      </div>
                      <StatusBadge label={m.role} variant={m.role === 'FACULTY' ? 'success' : 'info'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-teal-600 block mb-2">Level 6 • Interns</span>
                <div className="space-y-2">
                  {interns.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setSelectedEmp(i)}
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-left hover:border-teal-400"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{i.name}</p>
                        <p className="text-[10px] text-slate-500">{i.designation} • Mentor: {i.reportingManagerName}</p>
                      </div>
                      <StatusBadge label={i.employmentStatus} variant={i.employmentStatus === 'Active' ? 'success' : 'warning'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'DEPARTMENT' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERMANENT_DEPARTMENTS.map((dept) => {
            const deptMembers = employees.filter((e) => e.department === dept.name);
            return (
              <div key={dept.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 font-bold">{dept.code}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{dept.name}</h3>
                  </div>
                  <StatusBadge label={`${deptMembers.length} Staff`} variant="info" />
                </div>
                <p className="text-[11px] text-slate-500">Lead: {dept.leadName} • Dir: {dept.directorName}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {deptMembers.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedEmp(m)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs flex justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{m.permanentId}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'DIRECTORY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setSelectedEmp(emp)}
              className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm flex items-start gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${emp.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                {emp.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
                  <StatusBadge label={emp.employmentStatus} variant={emp.employmentStatus === 'Active' ? 'success' : 'warning'} />
                </div>
                <p className="text-[11px] text-blue-600 font-semibold truncate">{emp.designation}</p>
                <p className="text-[10px] text-slate-400 mt-1">{emp.department} • Reports to {emp.reportingManagerName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Drawer */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${selectedEmp.avatarColor} text-white font-black flex items-center justify-center`}>
                  {selectedEmp.avatarInitials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmp.name}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{selectedEmp.designation}</p>
                  <p className="text-[10px] font-mono text-slate-400">{selectedEmp.permanentId} • {selectedEmp.roleSeatId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">{selectedEmp.bio}</p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedEmp.email}</p>
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedEmp.phone}</p>
                <p className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {selectedEmp.department} ({selectedEmp.team})</p>
                <p className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-slate-400" /> Reports to: {selectedEmp.reportingManagerName}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">Responsibilities</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  {selectedEmp.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                switchEmployee(selectedEmp.id);
                setSelectedEmp(null);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Preview Platform as {selectedEmp.name}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
