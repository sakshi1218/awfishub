'use client';

import React, { useState } from 'react';
import { PhoneCall, Plus, Search, Calendar, CheckCircle2 } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CallOutcome, TeleCallerRecord } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function TeleCallerPage() {
  const { telecallerRecords, addTeleCallerRecord, updateTeleCallerOutcome, currentEmployee } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    studentName: '',
    phone: '',
    interestedCourse: 'MindlyftAI' as TeleCallerRecord['interestedCourse'],
    technicalBackground: '',
    followUpDate: '2026-11-28',
    notes: '',
  });

  const filtered = telecallerRecords.filter(
    (r) =>
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.interestedCourse.toLowerCase().includes(search.toLowerCase()) ||
      r.callOutcome.toLowerCase().includes(search.toLowerCase())
  );

  const convertedCount = telecallerRecords.filter((r) => r.callOutcome === 'Converted').length;
  const interestedCount = telecallerRecords.filter((r) => r.callOutcome === 'Interested').length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addTeleCallerRecord({
      ...form,
      callDate: '2026-11-25',
      assignedTelecallerId: currentEmployee.id,
      assignedTelecallerName: currentEmployee.name,
      callOutcome: 'Interested',
      counselingStatus: 'Pending',
      conversionStatus: 'Open',
    });
    setShowAdd(false);
    setForm({ studentName: '', phone: '', interestedCourse: 'MindlyftAI', technicalBackground: '', followUpDate: '2026-11-28', notes: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="TeleCaller Operations Workspace"
        subtitle="Student calling list, call outcomes (Interested, Not Interested, Call Back, Not Reachable, Converted), and follow-up calendar."
        icon={PhoneCall}
        actions={
          <div className="flex flex-wrap gap-2"><Link href="/departments" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><ArrowLeft className="h-4 w-4" /> Back</Link><button onClick={() => setShowAdd(true)} className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Call Record
          </button></div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardMetricCard label="Total Calls Logged" value={telecallerRecords.length} icon={PhoneCall} tone="blue" />
        <DashboardMetricCard label="Interested" value={interestedCount} icon={CheckCircle2} tone="amber" />
        <DashboardMetricCard label="Converted" value={convertedCount} icon={CheckCircle2} tone="emerald" />
        <DashboardMetricCard label="Follow-ups Due" value={telecallerRecords.filter((r) => r.conversionStatus === 'Open').length} icon={Calendar} tone="purple" />
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student, course, or outcome..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">Student & Background</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">TeleCaller</th>
              <th className="py-3 px-4">Follow-up</th>
              <th className="py-3 px-4">Counseling</th>
              <th className="py-3 px-4">Call Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((rec) => (
              <tr key={rec.id}>
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900 dark:text-white">{rec.studentName}</p>
                  <p className="text-[11px] text-slate-500">{rec.phone} • {rec.technicalBackground}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{rec.notes}</p>
                </td>
                <td className="py-3 px-4 font-bold text-blue-600">{rec.interestedCourse}</td>
                <td className="py-3 px-4">{rec.assignedTelecallerName}</td>
                <td className="py-3 px-4 text-slate-500">{rec.followUpDate}</td>
                <td className="py-3 px-4">
                  <StatusBadge label={rec.counselingStatus} variant={rec.counselingStatus === 'Completed' ? 'success' : 'info'} />
                </td>
                <td className="py-3 px-4">
                  <select
                    value={rec.callOutcome}
                    onChange={(e) => updateTeleCallerOutcome(rec.id, e.target.value as CallOutcome)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  >
                    {(['Interested', 'Not Interested', 'Call Back', 'Not Reachable', 'Converted'] as CallOutcome[]).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Log New Student Call</h3>
            <form onSubmit={handleAdd} className="mt-4 space-y-3 text-xs">
              <input required placeholder="Student Name" value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <select value={form.interestedCourse} onChange={(e) => setForm({ ...form, interestedCourse: e.target.value as TeleCallerRecord['interestedCourse'] })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <option value="Capsule">Capsule</option>
                <option value="CDAC">CDAC</option>
                <option value="C3RIHub">C3RIHub</option>
                <option value="MindlyftAI">MindlyftAI</option>
              </select>
              <input placeholder="Technical Background" value={form.technicalBackground} onChange={(e) => setForm({ ...form, technicalBackground: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <textarea rows={2} placeholder="Call notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-amber-600 text-white font-bold">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
