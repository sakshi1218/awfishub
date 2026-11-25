'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogIn,
  LogOut,
  Plus,
  Search,
  Filter,
  Check,
  X,
  FileText,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AttendancePage() {
  const { currentUser, isFounder, isDirector, isManager } = useAuth();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'LEAVE'>('ATTENDANCE');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    totalDays: 2,
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [attRes, lRes] = await Promise.all([
        fetch('/api/attendance'),
        fetch('/api/leave'),
      ]);
      if (attRes.ok) setAttendances(await attRes.json());
      if (lRes.ok) setLeaveRequests(await lRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInOut = async (type: 'CHECK_IN' | 'CHECK_OUT') => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          type,
        }),
      });
      if (res.ok) {
        alert(type === 'CHECK_IN' ? 'Successfully checked in!' : 'Successfully checked out!');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leaveForm,
          employeeId: currentUser.id,
        }),
      });
      if (res.ok) {
        setIsApplyModalOpen(false);
        setLeaveForm({
          leaveType: 'CASUAL',
          startDate: '2026-11-28',
          endDate: '2026-11-29',
          totalDays: 2,
          reason: '',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!currentUser) return;
    const reason = status === 'REJECTED' ? prompt('Enter reason for rejection:') : undefined;
    try {
      const res = await fetch('/api/leave', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          approvedById: currentUser.id,
          rejectionReason: reason,
        }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const userTodayAttendance = attendances.find((a) => a.employeeId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Attendance & Leave Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily check-ins, monthly work hours, leave requests, and manager approval workflows
              </p>
            </div>
          </div>
        </div>

        {/* Quick Check-in / Check-out button for current user */}
        <div className="flex items-center gap-2">
          {!userTodayAttendance?.checkInTime ? (
            <button
              onClick={() => handleCheckInOut('CHECK_IN')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Check In Today
            </button>
          ) : !userTodayAttendance.checkOutTime ? (
            <button
              onClick={() => handleCheckInOut('CHECK_OUT')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Check Out
            </button>
          ) : (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Day Complete ({userTodayAttendance.workHours} hrs)
            </span>
          )}

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Apply Leave
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ATTENDANCE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Today's Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('LEAVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'LEAVE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Leave Applications & Approvals ({leaveRequests.filter((l) => l.status === 'PENDING').length} Pending)
        </button>
      </div>

      {activeTab === 'ATTENDANCE' ? (
        /* Attendance Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              MindLyft Campus Check-ins — 25 Nov 2026
            </h3>
            <span className="text-xs text-slate-400">
              {attendances.filter((a) => a.status === 'PRESENT').length} Present today
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Check-in Time</th>
                  <th className="px-4 py-3.5">Work Hours</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {attendances.map((att) => (
                  <tr
                    key={att.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {att.employee.name}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {att.employee.designation}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                      {att.employee.department?.name || 'Executive Office'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {att.workHours || 8.5} hrs
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          att.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">
                      {att.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Leave Requests Section */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveRequests.map((leave) => (
              <div
                key={leave.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      {leave.leaveNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        leave.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : leave.status === 'REJECTED'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {leave.employee.name} — {leave.leaveType} Leave ({leave.totalDays} Days)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {leave.employee.designation} • {leave.employee.department?.name}
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{leave.reason}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Dates: {new Date(leave.startDate).toLocaleDateString()} to{' '}
                      {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Manager approval actions */}
                {(isDirector || isManager || isFounder) && leave.status === 'PENDING' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleLeaveDecision(leave.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve Leave
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Apply for Leave
              </h3>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="CASUAL">Casual Leave (Balance: 12)</option>
                  <option value="SICK">Sick Leave (Balance: 10)</option>
                  <option value="PRIVILEGE">Privilege / Earned Leave (Balance: 15)</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total Working Days
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={leaveForm.totalDays}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, totalDays: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Leave Application
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail reason, emergency contact, or handover notes..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
