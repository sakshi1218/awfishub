'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  Send,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DailyReportsPage() {
  const { currentUser, isFounder, isDirector, isManager } = useAuth();
  const [selectedDate, setSelectedDate] = useState('2026-11-25');
  const [reports, setReports] = useState<any[]>([]);
  const [missingEmployees, setMissingEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<any | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Submit form state
  const [reportForm, setReportForm] = useState({
    tasksWorkedOn: '',
    tasksCompleted: '',
    tasksPending: '',
    timeSpentHours: 8.0,
    workDescription: '',
    challengesFaced: '',
    planForTomorrow: '',
  });

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/daily-reports?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setMissingEmployees(data.missingEmployees);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: currentUser.id,
          reportDate: selectedDate,
          tasksWorkedOn: reportForm.tasksWorkedOn.split('\n').filter(Boolean),
          tasksCompleted: reportForm.tasksCompleted.split('\n').filter(Boolean),
          tasksPending: reportForm.tasksPending.split('\n').filter(Boolean),
          timeSpentHours: Number(reportForm.timeSpentHours),
          workDescription: reportForm.workDescription,
          challengesFaced: reportForm.challengesFaced,
          planForTomorrow: reportForm.planForTomorrow,
        }),
      });
      if (res.ok) {
        setIsSubmitModalOpen(false);
        setReportForm({
          tasksWorkedOn: '',
          tasksCompleted: '',
          tasksPending: '',
          timeSpentHours: 8.0,
          workDescription: '',
          challengesFaced: '',
          planForTomorrow: '',
        });
        loadReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReviewAction = async (status: 'REVIEWED' | 'CHANGES_REQUESTED') => {
    if (!selectedReportForReview || !currentUser) return;
    try {
      const res = await fetch('/api/daily-reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedReportForReview.id,
          status,
          reviewComments: reviewComment,
          reviewedById: currentUser.id,
        }),
      });
      if (res.ok) {
        setSelectedReportForReview(null);
        setReviewComment('');
        loadReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Has current user submitted for selectedDate?
  const currentUserReport = reports.find((r) => r.employeeId === currentUser?.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Daily Work Reporting
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily deliverables tracking, challenges log, tomorrow's plan, and supervisor review
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs">
            <Calendar className="w-4 h-4 text-blue-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white outline-none font-semibold"
            />
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            {currentUserReport ? "Update Today's Report" : "Submit Today's Report"}
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reports Submitted
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {reports.length}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              On Record
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pending Submissions
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {missingEmployees.length}
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Pending
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Status for {selectedDate}
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span
              className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                currentUserReport
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {currentUserReport ? `Submitted (${currentUserReport.status})` : 'Not Submitted'}
            </span>
            {currentUserReport && (
              <span className="text-xs text-slate-400 font-mono">
                {currentUserReport.timeSpentHours} hrs logged
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Missing Submissions Alert Section if Founder/Director/Manager */}
      {(isFounder || isDirector || isManager) && missingEmployees.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
              Missing Daily Reports for {selectedDate} ({missingEmployees.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingEmployees.map((emp) => (
              <span
                key={emp.id}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              >
                {emp.name} ({emp.department?.code || 'Executive'})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Submitted Reports Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Submitted Reports for {selectedDate}
        </h3>

        {reports.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              No daily reports submitted for this date yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => {
              const tasksWorked = JSON.parse(report.tasksWorkedOn || '[]');
              const tasksDone = JSON.parse(report.tasksCompleted || '[]');
              const tasksPending = JSON.parse(report.tasksPending || '[]');

              return (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow">
                          {report.employee.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {report.employee.name}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {report.employee.designation} • {report.employee.department?.name}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          report.status === 'REVIEWED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : report.status === 'CHANGES_REQUESTED'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {report.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Time spent */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        {report.timeSpentHours} Hours Logged
                      </span>
                      <span>•</span>
                      <span>
                        Reporting Manager: {report.employee.reportingManager?.name || 'Director'}
                      </span>
                    </div>

                    {/* Work description */}
                    <div className="mt-3">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Work Summary
                      </h5>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        {report.workDescription}
                      </p>
                    </div>

                    {/* Tasks Worked On Tags */}
                    {tasksWorked.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Tasks & Activities
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tasksWorked.map((t: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Challenges Faced */}
                    {report.challengesFaced && (
                      <div className="mt-3 text-[11px]">
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          Challenges Faced:
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">
                          {report.challengesFaced}
                        </span>
                      </div>
                    )}

                    {/* Tomorrow's Plan */}
                    {report.planForTomorrow && (
                      <div className="mt-2 text-[11px]">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">
                          Tomorrow's Plan:
                        </span>{' '}
                        <span className="text-slate-600 dark:text-slate-300">
                          {report.planForTomorrow}
                        </span>
                      </div>
                    )}

                    {/* Supervisor Review Notes */}
                    {report.reviewComments && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Review Note ({report.reviewedBy?.name}):
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                          {report.reviewComments}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Review Action Button for Manager / Director */}
                  {(isDirector || isManager || isFounder) && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setSelectedReportForReview(report);
                          setReviewComment(report.reviewComments || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review & Leave Feedback
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Report Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Daily Work Report — {selectedDate}
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Time Spent Today (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  required
                  value={reportForm.timeSpentHours}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, timeSpentHours: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Description & Accomplishments
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize key tasks, calls, code deliverables, or meetings handled today..."
                  value={reportForm.workDescription}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, workDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tasks Worked On (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. TSK-1001: VJTI MoU draft review"
                  value={reportForm.tasksWorkedOn}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, tasksWorkedOn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Challenges Faced / Blockers (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Waiting on partner feedback, hardware shortage"
                  value={reportForm.challengesFaced}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, challengesFaced: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Plan for Tomorrow
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deliver signed agreement, schedule review meeting"
                  value={reportForm.planForTomorrow}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, planForTomorrow: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Submit Daily Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Report Drawer Modal */}
      {selectedReportForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Review Daily Report: {selectedReportForReview.employee.name}
              </h3>
              <button
                onClick={() => setSelectedReportForReview(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedReportForReview.workDescription}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {selectedReportForReview.timeSpentHours} hours logged on{' '}
                  {selectedReportForReview.reportDate}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manager / Director Feedback Note
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Add feedback, guidance, or clarifications..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('CHANGES_REQUESTED')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                >
                  Request Clarifications
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('REVIEWED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  Approve Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
