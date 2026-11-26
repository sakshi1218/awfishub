'use client';

import { useState, type FormEvent } from 'react';
import { Plus, Eye } from 'lucide-react';
import TechModal from './TechModal';
import { techInputClass, techPanelClass, techPrimaryButtonClass, techSecondaryButtonClass } from './styles';

type ReportStatus = 'Completed' | 'Under Review' | 'Pending';
type ReportType = 'Weekly' | 'Monthly' | 'Bug';

interface Report {
  title: string;
  type: ReportType;
  date: string;
  status: ReportStatus;
  project: string;
  completed: string;
  current: string;
  issues: string;
  next: string;
}

const initialReports: Report[] = [
  {
    title: 'Weekly Technical Progress Report',
    type: 'Weekly',
    date: '2026-11-20',
    status: 'Completed',
    project: 'Website Redesign',
    completed: 'Demo update: core page layouts were reviewed.',
    current: 'Responsive layout checks are in progress.',
    issues: 'No issues listed in this sample.',
    next: 'Review the remaining page layouts.',
  },
  {
    title: 'Monthly Project Status Report',
    type: 'Monthly',
    date: '2026-11-18',
    status: 'Under Review',
    project: 'AI Chatbot',
    completed: 'Demo update: conversation flow outline was prepared.',
    current: 'Sample response handling is being reviewed.',
    issues: 'No issues listed in this sample.',
    next: 'Review the sample flow with stakeholders.',
  },
  {
    title: 'API Integration Bug Report',
    type: 'Bug',
    date: '2026-11-14',
    status: 'Pending',
    project: 'CRM Integration',
    completed: 'Demo update: the reported integration case was documented.',
    current: 'A sample validation check is pending review.',
    issues: 'Demo issue: confirm the expected response for an invalid request.',
    next: 'Confirm the expected behavior and update the sample test.',
  },
  {
    title: 'Deployment & Infrastructure Report',
    type: 'Weekly',
    date: '2026-11-12',
    status: 'Completed',
    project: 'All Projects',
    completed: 'Demo update: deployment steps were documented.',
    current: 'Example environment settings are being checked.',
    issues: 'No issues listed in this sample.',
    next: 'Review the deployment checklist.',
  },
];

const statusStyle: Record<ReportStatus, string> = {
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Under Review': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function TechReports() {
  const [reports, setReports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const addReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    if (!title) return;

    const type = String(formData.get('type') ?? 'Weekly') as ReportType;
    const date = String(formData.get('date') ?? new Date().toISOString().slice(0, 10));
    setReports((current) => [
      {
        title,
        type,
        date,
        status: 'Pending',
        project: 'Demo entry',
        completed: 'No update entered.',
        current: 'No update entered.',
        issues: 'No issues entered.',
        next: 'No next step entered.',
      },
      ...current,
    ]);
    setNewReportOpen(false);
    setNotice('Demo report added in this session only.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Technical Reports</h2>
        </div>
        <button type="button" onClick={() => setNewReportOpen(true)} className={techPrimaryButtonClass}>
          <Plus className="h-4 w-4" /> New Report
        </button>
      </div>

      {notice && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}

      <div className={`${techPanelClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                {['Report Name', 'Type', 'Date', 'Status', 'Action'].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-400 sm:px-5">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((report) => (
                <tr key={`${report.title}-${report.date}`} className="align-middle">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-100 sm:px-5">{report.title}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300 sm:px-5">{report.type}</td>
                  <td className="px-4 py-4 text-xs text-slate-600 dark:text-slate-300 sm:px-5">{report.date}</td>
                  <td className="px-4 py-4 sm:px-5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle[report.status]}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 sm:px-5">
                    <button type="button" onClick={() => setSelectedReport(report)} className={techSecondaryButtonClass}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReport && (
        <TechModal title={selectedReport.title} onClose={() => setSelectedReport(null)}>
          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Project:</span> {selectedReport.project}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Type and date:</span> {selectedReport.type} · {selectedReport.date}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Status:</span> {selectedReport.status}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Completed:</span> {selectedReport.completed}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Current work:</span> {selectedReport.current}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Issues:</span> {selectedReport.issues}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Next steps:</span> {selectedReport.next}</p>
          </div>
        </TechModal>
      )}

      {newReportOpen && (
        <TechModal title="New demo report" onClose={() => setNewReportOpen(false)}>
          <form onSubmit={addReport} className="space-y-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">This creates a temporary demo row in this browser session only.</p>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Report name
              <input name="title" required className={techInputClass} placeholder="Enter report name" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                Type
                <select name="type" className={techInputClass}>
                  <option>Weekly</option><option>Monthly</option><option>Bug</option>
                </select>
              </label>
              <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                Date
                <input name="date" type="date" className={techInputClass} />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="submit" className={techPrimaryButtonClass}><Plus className="h-4 w-4" /> Add demo report</button>
            </div>
          </form>
        </TechModal>
      )}
    </div>
  );
}
