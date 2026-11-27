'use client';

import { useState, useMemo } from 'react';
import { mockCollegeVisits, mockColleges, CollegeVisit, VisitOutcome, CollegeProfile } from '@/data/mock/salesCRM';

// ─── Outcome badge config ────────────────────────────────────────────────────
const OUTCOME_CONFIG: Record<VisitOutcome, { label: string; cls: string }> = {
  Interested:            { label: 'Interested',            cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'Follow-up Required':  { label: 'Follow-up Required',    cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  'Meeting Scheduled':   { label: 'Meeting Scheduled',     cls: 'bg-blue-100    text-blue-700    border-blue-200'    },
  'Proposal Requested':  { label: 'Proposal Requested',    cls: 'bg-violet-100  text-violet-700  border-violet-200'  },
  'Tie-up in Discussion':{ label: 'Tie-up in Discussion',  cls: 'bg-purple-100  text-purple-700  border-purple-200'  },
  'Tie-up Completed':    { label: 'Tie-up Completed',      cls: 'bg-green-500   text-white       border-green-600'   },
  'Not Interested':      { label: 'Not Interested',        cls: 'bg-rose-100    text-rose-700    border-rose-200'    },
};

const OUTCOMES = Object.keys(OUTCOME_CONFIG) as VisitOutcome[];

const EMPLOYEES = [
  'Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Neha Gupta', 'Vikram Nair',
];

// ─── Empty form ───────────────────────────────────────────────────────────────
function emptyForm(): Omit<CollegeVisit, 'id'> {
  return {
    collegeId: '',
    collegeName: '',
    location: '',
    address: '',
    visitDate: new Date().toISOString().slice(0, 10),
    tpoName: '',
    tpoContact: '',
    tpoEmail: '',
    assignedEmployee: '',
    assignedEmployeeId: 'AWF-EMP-002',
    purpose: '',
    discussionNotes: '',
    requirements: '',
    followUpDate: '',
    followUpOwner: '',
    outcome: 'Interested',
    attachments: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function OutcomeBadge({ outcome }: { outcome: VisitOutcome }) {
  const cfg = OUTCOME_CONFIG[outcome];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── View Detail Modal ────────────────────────────────────────────────────────
function ViewModal({ visit, onClose }: { visit: CollegeVisit; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'notes' | 'followup'>('info');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">{visit.collegeName}</h2>
            <p className="text-violet-200 text-sm mt-0.5">{visit.location}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          {(['info', 'notes', 'followup'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors capitalize ${
                tab === t ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'followup' ? 'Follow-up' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'info' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Visit Date', value: fmtDate(visit.visitDate) },
                { label: 'Outcome', value: <OutcomeBadge outcome={visit.outcome} /> },
                { label: 'Assigned Employee', value: visit.assignedEmployee },
                { label: 'TPO Name', value: visit.tpoName },
                { label: 'TPO Contact', value: visit.tpoContact },
                { label: 'TPO Email', value: visit.tpoEmail || '—' },
                { label: 'Address', value: visit.address || '—' },
                { label: 'Purpose', value: visit.purpose || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <div className="text-sm font-medium text-slate-800">{value}</div>
                </div>
              ))}
            </div>
          )}
          {tab === 'notes' && (
            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Discussion Notes</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{visit.discussionNotes || 'No notes recorded.'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-2">Requirements</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{visit.requirements || 'None specified.'}</p>
              </div>
              {visit.attachments && visit.attachments.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {visit.attachments.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 'followup' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Follow-up Date', value: fmtDate(visit.followUpDate) },
                { label: 'Follow-up Owner', value: visit.followUpOwner || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{label}</p>
                  <p className="text-sm font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
          )}
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

// ─── Add / Edit Drawer ────────────────────────────────────────────────────────
function AddEditDrawer({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<CollegeVisit> | null;
  onSave: (data: Omit<CollegeVisit, 'id'>) => void;
  onClose: () => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<Omit<CollegeVisit, 'id'>>({
    ...emptyForm(),
    ...(initial ? { ...initial } : {}),
  });
  const [attachmentName, setAttachmentName] = useState('');

  function set(field: keyof Omit<CollegeVisit, 'id'>, value: string | string[]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleAttachment() {
    if (attachmentName.trim()) {
      setForm(f => ({ ...f, attachments: [...(f.attachments || []), attachmentName.trim()] }));
      setAttachmentName('');
    }
  }

  function removeAttachment(i: number) {
    setForm(f => ({ ...f, attachments: f.attachments?.filter((_, idx) => idx !== i) }));
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
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-purple-600">
          <h2 className="text-lg font-bold text-white">{isEdit ? 'Edit Visit' : 'Add College Visit'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>College Name *</label>
              <input required className={inputCls} placeholder="e.g. IIT Delhi" value={form.collegeName} onChange={e => set('collegeName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Location *</label>
              <input required className={inputCls} placeholder="City, State" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Visit Date *</label>
              <input required type="date" className={inputCls} value={form.visitDate} onChange={e => set('visitDate', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Address</label>
              <input className={inputCls} placeholder="Full address" value={form.address || ''} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>TPO Name *</label>
              <input required className={inputCls} placeholder="Name of TPO" value={form.tpoName} onChange={e => set('tpoName', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>TPO Contact *</label>
              <input required className={inputCls} placeholder="+91 XXXXX XXXXX" value={form.tpoContact} onChange={e => set('tpoContact', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>TPO Email</label>
              <input type="email" className={inputCls} placeholder="tpo@college.edu" value={form.tpoEmail || ''} onChange={e => set('tpoEmail', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Assigned Employee *</label>
              <select required className={inputCls} value={form.assignedEmployee} onChange={e => set('assignedEmployee', e.target.value)}>
                <option value="">Select employee</option>
                {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Outcome</label>
              <select className={inputCls} value={form.outcome} onChange={e => set('outcome', e.target.value as VisitOutcome)}>
                {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Purpose of Visit</label>
              <input className={inputCls} placeholder="Purpose / agenda" value={form.purpose || ''} onChange={e => set('purpose', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Discussion Notes</label>
              <textarea rows={3} className={`${inputCls} resize-none`} placeholder="Key points discussed…" value={form.discussionNotes || ''} onChange={e => set('discussionNotes', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Requirements</label>
              <textarea rows={2} className={`${inputCls} resize-none`} placeholder="Requirements expressed by college…" value={form.requirements || ''} onChange={e => set('requirements', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Date</label>
              <input type="date" className={inputCls} value={form.followUpDate || ''} onChange={e => set('followUpDate', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Follow-up Owner</label>
              <select className={inputCls} value={form.followUpOwner || ''} onChange={e => set('followUpOwner', e.target.value)}>
                <option value="">Select employee</option>
                {EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>
            {/* Simulated attachment upload */}
            <div className="col-span-2">
              <label className={labelCls}>Attachments</label>
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="Enter file name and press Add"
                  value={attachmentName}
                  onChange={e => setAttachmentName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAttachment())}
                />
                <button type="button" onClick={handleAttachment} className="px-3 py-2 bg-violet-100 text-violet-700 rounded-xl text-sm font-medium hover:bg-violet-200 transition-colors whitespace-nowrap">
                  + Add
                </button>
              </div>
              {form.attachments && form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.attachments.map((a, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs">
                      {a}
                      <button type="button" onClick={() => removeAttachment(i)} className="ml-1 hover:text-rose-500">×</button>
                    </span>
                  ))}
                </div>
              )}
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
            form="college-visit-form"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {isEdit ? 'Save Changes' : 'Add Visit'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CollegeVisits({ onViewCollege }: { onViewCollege: (collegeId: string) => void }) {
  const [visits, setVisits] = useState<CollegeVisit[]>(mockCollegeVisits);
  const [search, setSearch] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<VisitOutcome | ''>('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<CollegeVisit | null>(null);
  const [viewingVisit, setViewingVisit] = useState<CollegeVisit | null>(null);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return visits.filter(v => {
      const q = search.toLowerCase();
      const matchSearch = !q || v.collegeName.toLowerCase().includes(q) || v.location.toLowerCase().includes(q) || v.assignedEmployee.toLowerCase().includes(q) || v.tpoName.toLowerCase().includes(q);
      const matchOutcome = !outcomeFilter || v.outcome === outcomeFilter;
      const matchEmployee = !employeeFilter || v.assignedEmployee === employeeFilter;
      const matchDate = !dateFilter || v.visitDate.startsWith(dateFilter);
      return matchSearch && matchOutcome && matchEmployee && matchDate;
    });
  }, [visits, search, outcomeFilter, employeeFilter, dateFilter]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: visits.length,
    interested: visits.filter(v => v.outcome === 'Interested').length,
    followups: visits.filter(v => v.followUpDate && new Date(v.followUpDate) >= new Date()).length,
    tieups: visits.filter(v => v.outcome === 'Tie-up Completed').length,
  }), [visits]);

  // ── CRUD ─────────────────────────────────────────────────────────────────
  function handleSave(data: Omit<CollegeVisit, 'id'>) {
    if (editingVisit) {
      setVisits(vs => vs.map(v => v.id === editingVisit.id ? { ...data, id: editingVisit.id } : v));
    } else {
      const newVisit: CollegeVisit = { ...data, id: `visit-${Date.now()}` };
      setVisits(vs => [newVisit, ...vs]);
    }
    setShowAddModal(false);
    setEditingVisit(null);
  }

  function handleEdit(visit: CollegeVisit) {
    setEditingVisit(visit);
    setShowAddModal(true);
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-0">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-xl">
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">College Visits</h1>
            <p className="text-xs text-slate-500">Track campus visits and TPO engagement</p>
          </div>
          <span className="ml-2 px-2.5 py-0.5 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
            {visits.length}
          </span>
        </div>
        <button
          onClick={() => { setEditingVisit(null); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Visit
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4">
        {[
          { label: 'Total Visits',       value: stats.total,     color: 'text-violet-700', bg: 'bg-violet-50', icon: '🏫' },
          { label: 'Interested',         value: stats.interested, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: '✅' },
          { label: 'Follow-ups Due',     value: stats.followups,  color: 'text-amber-700',  bg: 'bg-amber-50',  icon: '🔔' },
          { label: 'Tie-ups Completed',  value: stats.tieups,     color: 'text-green-700',  bg: 'bg-green-50',  icon: '🎓' },
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

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap gap-3 px-6 pb-4">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400 placeholder-slate-400"
            placeholder="Search by college, location, employee…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value as VisitOutcome | '')}
        >
          <option value="">All Outcomes</option>
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
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
        {(search || outcomeFilter || employeeFilter || dateFilter) && (
          <button
            onClick={() => { setSearch(''); setOutcomeFilter(''); setEmployeeFilter(''); setDateFilter(''); }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 pb-6 min-h-0">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['College Name', 'Location', 'Visit Date', 'Employee', 'TPO Contact', 'Outcome', 'Next Follow-up', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🔍</span>
                        <p className="font-medium">No visits found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(visit => (
                  <tr key={visit.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onViewCollege(visit.collegeId || visit.id)}
                        className="font-semibold text-violet-700 hover:text-violet-900 hover:underline text-left"
                      >
                        {visit.collegeName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{visit.location}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(visit.visitDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {visit.assignedEmployee.charAt(0)}
                        </div>
                        <span className="text-slate-700 whitespace-nowrap">{visit.assignedEmployee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-700 font-medium">{visit.tpoName}</p>
                        <p className="text-xs text-slate-500">{visit.tpoContact}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <OutcomeBadge outcome={visit.outcome} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {visit.followUpDate ? (
                        <span className={new Date(visit.followUpDate) < new Date() ? 'text-rose-600 font-medium' : ''}>
                          {fmtDate(visit.followUpDate)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingVisit(visit)}
                          className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(visit)}
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

          {/* Footer row count */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">Showing {filtered.length} of {visits.length} visits</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddEditDrawer
          initial={editingVisit}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingVisit(null); }}
        />
      )}
      {viewingVisit && (
        <ViewModal visit={viewingVisit} onClose={() => setViewingVisit(null)} />
      )}
    </div>
  );
}
