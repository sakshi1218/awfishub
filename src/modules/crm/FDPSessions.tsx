'use client';

import { useState, useMemo } from 'react';
import { mockFDPSessions, FDPSession, FDPStatus } from '@/data/mock/salesCRM';
import { CompanyAsset } from '@/types';
import { useApp } from '@/context/AppContext';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<FDPStatus, { label: string; cls: string }> = {
  'Not Started':         { label: 'Not Started',          cls: 'bg-slate-100   text-slate-600   border-slate-200'   },
  'Proposal Prepared':   { label: 'Proposal Prepared',    cls: 'bg-blue-100    text-blue-700    border-blue-200'    },
  'Proposal Sent':       { label: 'Proposal Sent',        cls: 'bg-indigo-100  text-indigo-700  border-indigo-200'  },
  'Meeting Scheduled':   { label: 'Meeting Scheduled',    cls: 'bg-violet-100  text-violet-700  border-violet-200'  },
  'Discussion Ongoing':  { label: 'Discussion Ongoing',   cls: 'bg-purple-100  text-purple-700  border-purple-200'  },
  'Negotiation':         { label: 'Negotiation',          cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  'Approved':            { label: 'Approved',             cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'Rejected':            { label: 'Rejected',             cls: 'bg-rose-100    text-rose-700    border-rose-200'    },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as FDPStatus[];

const SESSION_TYPES = ['Workshop', 'Seminar', 'Training', 'Certification', 'Other'] as const;
type SessionType = typeof SESSION_TYPES[number];

const EMPLOYEES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Gupta', 'Vikram Nair',
];

type TabFilter = 'All' | 'Active' | 'Approved' | 'Pending' | 'Rejected';
const TABS: TabFilter[] = ['All', 'Active', 'Approved', 'Pending', 'Rejected'];

function tabStatuses(tab: TabFilter): FDPStatus[] | null {
  switch (tab) {
    case 'All':      return null;
    case 'Active':   return ['Discussion Ongoing', 'Meeting Scheduled', 'Negotiation', 'Proposal Sent'];
    case 'Approved': return ['Approved'];
    case 'Pending':  return ['Not Started', 'Proposal Prepared', 'Proposal Sent'];
    case 'Rejected': return ['Rejected'];
    default:         return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Empty form ───────────────────────────────────────────────────────────────
function emptyFDP(): Omit<FDPSession, 'id'> {
  return {
    collegeId: '',
    collegeName: '',
    sessionTitle: '',
    sessionType: 'Workshop',
    proposedDate: '',
    actualDate: '',
    assignedEmployee: '',
    assignedEmployeeId: 'AWF-EMP-002',
    tpoContact: '',
    facultyDetails: '',
    proposedOffering: '',
    expectedParticipants: 0,
    meetingDetails: '',
    discussionNotes: '',
    followUpDate: '',
    proposalDoc: '',
    supportingDocs: [],
    status: 'Not Started',
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: FDPStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function SessionTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Workshop:      'bg-cyan-100 text-cyan-700',
    Seminar:       'bg-teal-100 text-teal-700',
    Training:      'bg-orange-100 text-orange-700',
    Certification: 'bg-blue-100 text-blue-700',
    Other:         'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${colors[type] || colors.Other}`}>
      {type}
    </span>
  );
}

// ─── Add / Edit Drawer ────────────────────────────────────────────────────────
function AddEditDrawer({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<FDPSession> | null;
  onSave: (data: Omit<FDPSession, 'id'>) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<Omit<FDPSession, 'id'>>({
    ...emptyFDP(),
    ...(initial ? { ...initial } : {}),
  });

  function set<K extends keyof Omit<FDPSession, 'id'>>(field: K, value: Omit<FDPSession, 'id'>[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white placeholder-slate-400';
  const labelCls = 'block text-xs font-medium text-slate-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-purple-600">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit FDP Session' : 'Add FDP Session'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>College Name *</label>
              <input required className={inputCls} placeholder="College / University" value={form.collegeName} onChange={e => set('collegeName', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Session Title *</label>
              <input required className={inputCls} placeholder="FDP session title" value={form.sessionTitle} onChange={e => set('sessionTitle', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Session Type</label>
              <select className={inputCls} value={form.sessionType} onChange={e => set('sessionType', e.target.value as SessionType)}>
                {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value as FDPStatus)}>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Proposed Date</label>
              <input type="date" className={inputCls} value={form.proposedDate || ''} onChange={e => set('proposedDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Actual Date</label>
              <input type="date" className={inputCls} value={form.actualDate || ''} onChange={e => set('actualDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Assigned Employee *</label>
              <select required className={inputCls} value={form.assignedEmployee} onChange={e => set('assignedEmployee', e.target.value)}>
                <option value="">Select employee</option>
                {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Expected Participants</label>
              <input type="number" min={0} className={inputCls} value={form.expectedParticipants || ''} onChange={e => set('expectedParticipants', parseInt(e.target.value) || 0)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>TPO Contact</label>
              <input className={inputCls} placeholder="TPO name / phone" value={form.tpoContact || ''} onChange={e => set('tpoContact', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Faculty Details</label>
              <textarea rows={2} className={`${inputCls} resize-none`} placeholder="Faculty / speaker information" value={form.facultyDetails || ''} onChange={e => set('facultyDetails', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Proposed Offering</label>
              <textarea rows={2} className={`${inputCls} resize-none`} placeholder="What AWFIS is proposing…" value={form.proposedOffering || ''} onChange={e => set('proposedOffering', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Meeting Details</label>
              <textarea rows={2} className={`${inputCls} resize-none`} placeholder="Meeting notes / agenda" value={form.meetingDetails || ''} onChange={e => set('meetingDetails', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Discussion Notes</label>
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Key discussion points…" value={form.discussionNotes || ''} onChange={e => set('discussionNotes', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Date</label>
              <input type="date" className={inputCls} value={form.followUpDate || ''} onChange={e => set('followUpDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Proposal Document</label>
              <input className={inputCls} placeholder="Document file name" value={form.proposalDoc || ''} onChange={e => set('proposalDoc', e.target.value)} />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {isEdit ? 'Save Changes' : 'Add FDP'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FDP Card ─────────────────────────────────────────────────────────────────
function FDPCard({
  session,
  onView,
  onEdit,
  onViewCollege,
}: {
  session: FDPSession;
  onView: (s: FDPSession) => void;
  onEdit: (s: FDPSession) => void;
  onViewCollege: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-violet-200 group flex flex-col overflow-hidden">
      {/* Card top accent */}
      <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* College + status */}
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => onViewCollege(session.id)}
            className="font-bold text-slate-800 hover:text-violet-700 text-left leading-tight text-sm"
          >
            {session.collegeName}
          </button>
          <StatusBadge status={session.status} />
        </div>

        {/* Session title */}
        <p className="text-xs font-semibold text-violet-700 leading-snug">{session.sessionTitle}</p>

        {/* Type badge */}
        <div className="flex items-center gap-2">
          <SessionTypeBadge type={session.sessionType} />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-slate-400">Proposed</p>
            <p className="text-slate-600 font-medium">{fmtDate(session.proposedDate)}</p>
          </div>
          <div>
            <p className="text-slate-400">Actual</p>
            <p className="text-slate-600 font-medium">{fmtDate(session.actualDate)}</p>
          </div>
        </div>

        {/* Employee + participants */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session.assignedEmployee.charAt(0)}
            </div>
            <span className="text-xs text-slate-600 truncate">{session.assignedEmployee}</span>
          </div>
          {session.expectedParticipants > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {session.expectedParticipants}
            </span>
          )}
          {session.proposalDoc && (
            <span className="text-slate-400" title={session.proposalDoc}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-slate-50">
        <button
          onClick={() => onView(session)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-violet-700 hover:bg-violet-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </button>
        <div className="w-px bg-slate-50" />
        <button
          onClick={() => onEdit(session)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ session, assets, onClose }: { session: FDPSession; assets: CompanyAsset[]; onClose: () => void }) {
  const assignedAssets = assets.filter((asset) => asset.assignedToId === session.assignedEmployeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-purple-600">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{session.sessionTitle}</h2>
            <p className="text-violet-200 text-sm mt-0.5">{session.collegeName}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <StatusBadge status={session.status} />
            <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Session Type',          value: <SessionTypeBadge type={session.sessionType} /> },
              { label: 'Assigned Employee',      value: session.assignedEmployee },
              { label: 'Proposed Date',          value: fmtDate(session.proposedDate) },
              { label: 'Actual Date',            value: fmtDate(session.actualDate) },
              { label: 'Expected Participants',  value: session.expectedParticipants || '—' },
              { label: 'TPO Contact',            value: session.tpoContact || '—' },
              { label: 'Follow-up Date',         value: fmtDate(session.followUpDate) },
              { label: 'Proposal Document',      value: session.proposalDoc ? (
                <span className="inline-flex items-center gap-1 text-violet-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  {session.proposalDoc}
                </span>
              ) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <div className="text-sm font-medium text-slate-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Text fields */}
          {[
            { label: 'Faculty Details',      value: session.facultyDetails },
            { label: 'Proposed Offering',    value: session.proposedOffering },
            { label: 'Meeting Details',      value: session.meetingDetails },
            { label: 'Discussion Notes',     value: session.discussionNotes },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2">{label}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{value}</p>
            </div>
          ))}

          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-amber-900">Company assets for this session</p>
                <p className="mt-1 text-[11px] text-amber-800/80">
                  Assets currently assigned to {session.assignedEmployee} for the FDP visit.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                {assignedAssets.length} {assignedAssets.length === 1 ? 'asset' : 'assets'}
              </span>
            </div>
            {assignedAssets.length ? (
              <div className="mt-3 space-y-2">
                {assignedAssets.map((asset) => (
                  <div key={asset.id} className="rounded-lg border border-amber-100 bg-white p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{asset.name}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{asset.category} · {asset.id} · Serial: {asset.serialNumber}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{asset.status}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-600">
                      Condition: {asset.condition}{asset.issueDate ? ` · Issued ${fmtDate(asset.issueDate)}` : ''}{asset.expectedReturnDate ? ` · Return by ${fmtDate(asset.expectedReturnDate)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-lg border border-dashed border-amber-200 bg-white/70 p-3 text-xs italic text-amber-900/70">
                No company assets are currently assigned to this session coordinator.
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FDPSessions({ onViewCollege }: { onViewCollege: (collegeId: string) => void }) {
  const { assets } = useApp();
  const [sessions, setSessions] = useState<FDPSession[]>(mockFDPSessions);
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<FDPStatus | ''>('');
  const [dateFilter, setDateFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState<FDPSession | null>(null);
  const [viewingSession, setViewingSession] = useState<FDPSession | null>(null);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const tabStatList = tabStatuses(activeTab);
    return sessions.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.collegeName.toLowerCase().includes(q) || s.sessionTitle.toLowerCase().includes(q) || s.assignedEmployee.toLowerCase().includes(q);
      const matchCollege = !collegeFilter || s.collegeName.toLowerCase().includes(collegeFilter.toLowerCase());
      const matchEmployee = !employeeFilter || s.assignedEmployee === employeeFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;
      const matchDate = !dateFilter || (s.proposedDate || '').startsWith(dateFilter);
      const matchTab = !tabStatList || tabStatList.includes(s.status);
      return matchSearch && matchCollege && matchEmployee && matchStatus && matchDate && matchTab;
    });
  }, [sessions, activeTab, search, collegeFilter, employeeFilter, statusFilter, dateFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    sessions.length,
    approved: sessions.filter(s => s.status === 'Approved').length,
    ongoing:  sessions.filter(s => ['Discussion Ongoing', 'Meeting Scheduled', 'Negotiation'].includes(s.status)).length,
    rejected: sessions.filter(s => s.status === 'Rejected').length,
  }), [sessions]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  function handleSave(data: Omit<FDPSession, 'id'>) {
    if (editingSession) {
      setSessions(ss => ss.map(s => s.id === editingSession.id ? { ...data, id: editingSession.id } : s));
    } else {
      setSessions(ss => [{ ...data, id: `fdp-${Date.now()}` }, ...ss]);
    }
    setShowAddModal(false);
    setEditingSession(null);
  }

  function handleEdit(s: FDPSession) {
    setEditingSession(s);
    setShowAddModal(true);
  }

  // ── Tab counts ───────────────────────────────────────────────────────────
  function tabCount(tab: TabFilter) {
    const list = tabStatuses(tab);
    if (!list) return sessions.length;
    return sessions.filter(s => list.includes(s.status)).length;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">FDP Sessions</h1>
            <p className="text-xs text-slate-500">Faculty Development Programs management</p>
          </div>
          <span className="ml-2 px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
            {sessions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Card view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => { setEditingSession(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add FDP
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        {[
          { label: 'Total FDPs',  value: stats.total,    color: 'text-violet-700', bg: 'bg-violet-50', icon: '🎯' },
          { label: 'Approved',    value: stats.approved, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '✅' },
          { label: 'Ongoing',     value: stats.ongoing,  color: 'text-purple-700', bg: 'bg-purple-50', icon: '🔄' },
          { label: 'Rejected',    value: stats.rejected, color: 'text-rose-700',   bg: 'bg-rose-50',  icon: '❌' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 flex items-center gap-3`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 px-6 pb-2 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap gap-3 px-6 pb-4">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-slate-400"
            placeholder="Search by college, session, employee…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as FDPStatus | '')}
        >
          <option value="">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={employeeFilter}
          onChange={e => setEmployeeFilter(e.target.value)}
        >
          <option value="">All Employees</option>
          {EMPLOYEES.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <input
          type="month"
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />
        {(search || statusFilter || employeeFilter || dateFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setEmployeeFilter(''); setDateFilter(''); }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto px-6 pb-6 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <span className="text-5xl mb-3">🔍</span>
            <p className="font-medium">No FDP sessions found</p>
            <p className="text-sm">Try adjusting your filters or add a new session</p>
          </div>
        ) : viewMode === 'card' ? (
          /* ── Card Grid ── */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(session => (
              <FDPCard
                key={session.id}
                session={session}
                onView={setViewingSession}
                onEdit={handleEdit}
                onViewCollege={onViewCollege}
              />
            ))}
          </div>
        ) : (
          /* ── Table View ── */
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['College', 'Session Title', 'Type', 'Status', 'Proposed Date', 'Employee', 'Participants', 'Doc', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(session => (
                    <tr key={session.id} className="hover:bg-violet-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onViewCollege(session.id)}
                          className="font-semibold text-violet-700 hover:text-violet-900 hover:underline text-left text-xs"
                        >
                          {session.collegeName}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[180px]">
                        <p className="truncate text-xs" title={session.sessionTitle}>{session.sessionTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <SessionTypeBadge type={session.sessionType} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={session.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap text-xs">{fmtDate(session.proposedDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {session.assignedEmployee.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-700 whitespace-nowrap">{session.assignedEmployee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-600">{session.expectedParticipants || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {session.proposalDoc ? (
                          <span className="text-violet-500" title={session.proposalDoc}>
                            <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewingSession(session)}
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleEdit(session)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-50">
              <p className="text-xs text-slate-500">Showing {filtered.length} of {sessions.length} sessions</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddEditDrawer
          initial={editingSession}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingSession(null); }}
        />
      )}
      {viewingSession && (
        <ViewModal session={viewingSession} assets={assets} onClose={() => setViewingSession(null)} />
      )}
    </div>
  );
}
