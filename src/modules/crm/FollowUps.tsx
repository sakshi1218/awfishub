'use client';

import React, { useState, useMemo } from 'react';
import { mockSalesFollowUps } from '@/data/mock/salesCRM';

type FollowUpStatus = 'Pending' | 'Completed' | 'Rescheduled' | 'Overdue';
type Priority = 'High' | 'Medium' | 'Low';
type ActivityType = 'Visit' | 'FDP' | 'Tieup' | 'Client' | 'Agreement';

interface FollowUp {
  id: string;
  title: string;
  collegeName?: string;
  clientName?: string;
  activityType: ActivityType;
  assignedTo: string;
  dueDate: string;
  priority: Priority;
  status: FollowUpStatus;
  notes?: string;
  collegeId?: string;
}

type TabFilter = 'All' | FollowUpStatus;
type DateFilter = 'Today' | 'This Week' | 'This Month' | 'All';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Rescheduled: 'bg-amber-100 text-amber-700 border-amber-200',
  Overdue: 'bg-rose-100 text-rose-700 border-rose-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const ACTIVITY_COLORS: Record<string, string> = {
  Visit: 'bg-violet-100 text-violet-700 border-violet-200',
  FDP: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  Tieup: 'bg-blue-100 text-blue-700 border-blue-200',
  Client: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Agreement: 'bg-amber-100 text-amber-700 border-amber-200',
};

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

function getDueDateColor(dueDate: string, status: string): string {
  if (status === 'Completed') return 'text-gray-400';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 'text-rose-600 font-semibold';
  if (due.getTime() === today.getTime()) return 'text-amber-600 font-semibold';
  return 'text-emerald-700';
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(f: FollowUp): boolean {
  if (f.status === 'Completed' || f.status === 'Rescheduled') return false;
  return new Date(f.dueDate) < new Date();
}

function normalizeFollowUps(raw: any[]): FollowUp[] {
  return raw.map((f, i) => {
    const dueDate = f.dueDate || f.date || f.followUpDate || '';
    const overdue = (f.status === 'Pending' || !f.status) && dueDate && new Date(dueDate) < new Date();
    return {
      id: f.id || String(i),
      title: f.title || f.subject || `Follow-up #${i + 1}`,
      collegeName: f.collegeName || f.college || undefined,
      clientName: f.clientName || f.client || undefined,
      activityType: f.activityType || f.type || 'Visit',
      assignedTo: f.assignedTo || f.employee || '—',
      dueDate,
      priority: f.priority || 'Medium',
      status: overdue ? 'Overdue' : f.status || 'Pending',
      notes: f.notes || f.remarks || '',
      collegeId: f.collegeId,
    } as FollowUp;
  });
}

const EMPTY_FORM: Partial<FollowUp> = {
  title: '',
  collegeName: '',
  clientName: '',
  activityType: 'Visit',
  assignedTo: '',
  dueDate: '',
  priority: 'Medium',
  status: 'Pending',
  notes: '',
};

export default function FollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => normalizeFollowUps(mockSalesFollowUps));
  const [tabFilter, setTabFilter] = useState<TabFilter>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<FollowUp | null>(null);
  const [form, setForm] = useState<Partial<FollowUp>>(EMPTY_FORM);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const overdueCount = useMemo(() => followUps.filter((f) => f.status === 'Overdue').length, [followUps]);

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let list = followUps.filter((f) => {
      if (tabFilter !== 'All' && f.status !== tabFilter) return false;
      if (dateFilter === 'Today') {
        const d = new Date(f.dueDate);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() !== today.getTime()) return false;
      } else if (dateFilter === 'This Week') {
        const d = new Date(f.dueDate);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        if (d < startOfWeek || d > endOfWeek) return false;
      } else if (dateFilter === 'This Month') {
        const d = new Date(f.dueDate);
        if (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) return false;
      }
      return true;
    });

    // Sort: Overdue first, then by date ascending
    list = list.sort((a, b) => {
      if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
      if (b.status === 'Overdue' && a.status !== 'Overdue') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    return list;
  }, [followUps, tabFilter, dateFilter]);

  function handleMarkComplete(id: string) {
    setFollowUps((prev) => prev.map((f) => f.id === id ? { ...f, status: 'Completed' } : f));
  }

  function handleReschedule(id: string) {
    setRescheduleId(id);
    setRescheduleDate('');
  }

  function confirmReschedule() {
    if (!rescheduleDate || !rescheduleId) return;
    setFollowUps((prev) =>
      prev.map((f) => f.id === rescheduleId ? { ...f, status: 'Rescheduled', dueDate: rescheduleDate } : f)
    );
    setRescheduleId(null);
  }

  function openAdd() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(f: FollowUp) {
    setEditItem(f);
    setForm({ ...f });
    setShowModal(true);
  }

  function handleSave() {
    if (!form.title || !form.dueDate) return;
    const dueDate = form.dueDate!;
    const overdue = (form.status === 'Pending') && new Date(dueDate) < new Date();
    const newItem: FollowUp = {
      id: editItem?.id || String(Date.now()),
      title: form.title!,
      collegeName: form.collegeName,
      clientName: form.clientName,
      activityType: form.activityType as ActivityType || 'Visit',
      assignedTo: form.assignedTo || '—',
      dueDate,
      priority: form.priority as Priority || 'Medium',
      status: overdue ? 'Overdue' : (form.status as FollowUpStatus) || 'Pending',
      notes: form.notes || '',
    };
    if (editItem) {
      setFollowUps((prev) => prev.map((f) => f.id === editItem.id ? newItem : f));
    } else {
      setFollowUps((prev) => [newItem, ...prev]);
    }
    setShowModal(false);
  }

  const TAB_FILTERS: TabFilter[] = ['All', 'Pending', 'Overdue', 'Completed', 'Rescheduled'];
  const DATE_FILTERS: DateFilter[] = ['Today', 'This Week', 'This Month', 'All'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Follow-up Tracker</h1>
            <p className="text-sm text-gray-500 mt-0.5">{followUps.length} total follow-ups</p>
          </div>
          <button
            onClick={openAdd}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-medium text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Follow-up
          </button>
        </div>

        {/* Alert strip */}
        {overdueCount > 0 && (
          <div className="mb-5 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-5 py-3">
            <span className="text-rose-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-rose-700">
                {overdueCount} Overdue Follow-up{overdueCount !== 1 ? 's' : ''}!
              </p>
              <p className="text-xs text-rose-500">These require immediate attention.</p>
            </div>
            <button
              onClick={() => setTabFilter('Overdue')}
              className="ml-auto text-xs font-medium text-rose-600 hover:underline"
            >
              View Overdue →
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Tab filter */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg flex-wrap">
            {TAB_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTabFilter(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tabFilter === t ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
                {t !== 'All' && (
                  <span className="ml-1.5 text-xs text-gray-400">
                    ({followUps.filter((f) => f.status === t).length})
                  </span>
                )}
                {t === 'All' && <span className="ml-1.5 text-xs text-gray-400">({followUps.length})</span>}
              </button>
            ))}
          </div>

          {/* Date filter */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg ml-auto">
            {DATE_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateFilter === d ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No follow-ups found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => (
              <div
                key={f.id}
                className={`bg-white rounded-xl border shadow-sm transition-shadow hover:shadow-md ${
                  f.status === 'Overdue' ? 'border-rose-200' : 'border-gray-200'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Activity type badge */}
                    <div className="mt-0.5 flex-shrink-0">
                      <Badge label={f.activityType} className={ACTIVITY_COLORS[f.activityType] || ACTIVITY_COLORS.Visit} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-800 text-sm">{f.title}</h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge label={f.priority} className={PRIORITY_COLORS[f.priority]} />
                          <Badge label={f.status} className={STATUS_COLORS[f.status]} />
                        </div>
                      </div>

                      {/* Related entity */}
                      {(f.collegeName || f.clientName) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {f.collegeName && <span>🏛 {f.collegeName}</span>}
                          {f.collegeName && f.clientName && <span className="mx-1">·</span>}
                          {f.clientName && <span>👤 {f.clientName}</span>}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>👤 {f.assignedTo}</span>
                        <span>
                          📅 Due:{' '}
                          <span className={getDueDateColor(f.dueDate, f.status)}>
                            {formatDate(f.dueDate)}
                          </span>
                        </span>
                      </div>

                      {f.notes && (
                        <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{f.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {f.status !== 'Completed' && (
                      <button
                        onClick={() => handleMarkComplete(f.id)}
                        className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                    {f.status !== 'Completed' && (
                      <button
                        onClick={() => handleReschedule(f.id)}
                        className="px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        📅 Reschedule
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(f)}
                      className="px-3 py-1 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editItem ? 'Edit Follow-up' : 'Add Follow-up'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.title || ''}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Follow-up title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.collegeName || ''}
                    onChange={(e) => setForm((p) => ({ ...p, collegeName: e.target.value }))}
                    placeholder="College name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.clientName || ''}
                    onChange={(e) => setForm((p) => ({ ...p, clientName: e.target.value }))}
                    placeholder="Client name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.activityType || 'Visit'}
                    onChange={(e) => setForm((p) => ({ ...p, activityType: e.target.value as ActivityType }))}
                  >
                    {(['Visit', 'FDP', 'Tieup', 'Client', 'Agreement'] as ActivityType[]).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.priority || 'Medium'}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
                  >
                    {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.dueDate || ''}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={form.status || 'Pending'}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FollowUpStatus }))}
                  >
                    {(['Pending', 'Completed', 'Rescheduled'] as FollowUpStatus[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.assignedTo || ''}
                  onChange={(e) => setForm((p) => ({ ...p, assignedTo: e.target.value }))}
                  placeholder="Employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  value={form.notes || ''}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Add notes..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.dueDate}
                className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editItem ? 'Update' : 'Add Follow-up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Follow-up</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Due Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setRescheduleId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!rescheduleDate}
                className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
