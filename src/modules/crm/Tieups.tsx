'use client';

import React, { useState, useMemo } from 'react';
import {
  Tieup,
  PartnershipStatus,
  mockTieups,
} from '@/data/mock/salesCRM';

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusColors: Record<PartnershipStatus, string> = {
  'Initial Discussion': 'bg-slate-100 text-slate-700 border-slate-300',
  Interested: 'bg-blue-100 text-blue-700 border-blue-300',
  'Proposal Shared': 'bg-indigo-100 text-indigo-700 border-indigo-300',
  'Under Negotiation': 'bg-amber-100 text-amber-700 border-amber-300',
  'Agreement Pending': 'bg-orange-100 text-orange-700 border-orange-300',
  Signed: 'bg-violet-100 text-violet-700 border-violet-300',
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  Expired: 'bg-rose-100 text-rose-700 border-rose-300',
  Terminated: 'bg-red-200 text-red-800 border-red-400',
};

const statusDot: Record<PartnershipStatus, string> = {
  'Initial Discussion': 'bg-slate-400',
  Interested: 'bg-blue-500',
  'Proposal Shared': 'bg-indigo-500',
  'Under Negotiation': 'bg-amber-500',
  'Agreement Pending': 'bg-orange-500',
  Signed: 'bg-violet-500',
  Active: 'bg-emerald-500',
  Expired: 'bg-rose-500',
  Terminated: 'bg-red-700',
};

const TAB_FILTERS: { label: string; value: PartnershipStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Signed', value: 'Signed' },
  { label: 'Under Negotiation', value: 'Under Negotiation' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Initial Discussion', value: 'Initial Discussion' },
];

function isNearExpiry(dateStr?: string): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function fmt(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Empty Form ──────────────────────────────────────────────────────────────

const emptyForm = (): Partial<Tieup> => ({
  collegeName: '',
  location: '',
  partnershipType: '',
  status: 'Initial Discussion',
  assignedEmployee: '',
  initialDiscussionDate: '',
  scopeOfCollaboration: '',
});

// ─── Modal ───────────────────────────────────────────────────────────────────

function TieupModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<Tieup>;
  onClose: () => void;
  onSave: (t: Partial<Tieup>) => void;
}) {
  const [form, setForm] = useState<Partial<Tieup>>(initial);

  const field = (
    label: string,
    key: keyof Tieup,
    type = 'text',
    opts?: string[]
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {opts ? (
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={(form[key] as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        >
          {opts.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          rows={3}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          value={(form[key] as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <input
          type={type}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={(form[key] as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial.id ? 'Edit Tie-up' : 'Add New Tie-up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('College Name', 'collegeName')}
          {field('Location', 'location')}
          {field('Partnership Type', 'partnershipType')}
          {field('Status', 'status', 'text', [
            'Initial Discussion',
            'Interested',
            'Proposal Shared',
            'Under Negotiation',
            'Agreement Pending',
            'Signed',
            'Active',
            'Expired',
            'Terminated',
          ] as PartnershipStatus[])}
          {field('Assigned Employee', 'assignedEmployee')}
          {field('Initial Discussion Date', 'initialDiscussionDate', 'date')}
          {field('Agreement Signing Date', 'agreementSigningDate', 'date')}
          {field('Expiry Date', 'expiryDate', 'date')}
          <div className="sm:col-span-2">
            {field('Scope of Collaboration', 'scopeOfCollaboration', 'textarea')}
          </div>
        </div>
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────

function TieupCard({
  tieup,
  onViewCollege,
  onEdit,
}: {
  tieup: Tieup;
  onViewCollege: (id: string) => void;
  onEdit: (t: Tieup) => void;
}) {
  const nearExpiry = isNearExpiry(tieup.expiryDate);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <button
            className="font-bold text-gray-900 text-sm hover:text-indigo-600 text-left leading-snug"
            onClick={() => onViewCollege(tieup.collegeId)}
          >
            {tieup.collegeName}
          </button>
          <p className="text-xs text-gray-500 mt-0.5">{tieup.location}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${statusColors[tieup.status]}`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusDot[tieup.status]}`} />
          {tieup.status}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
          {tieup.partnershipType}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
        <div>
          <span className="text-gray-400">Assigned:</span>{' '}
          <span className="font-medium text-gray-700">{tieup.assignedEmployee}</span>
        </div>
        <div>
          <span className="text-gray-400">Discussion:</span>{' '}
          <span className="font-medium text-gray-700">{fmt(tieup.initialDiscussionDate)}</span>
        </div>
        {tieup.agreementSigningDate && (
          <div>
            <span className="text-gray-400">Signed:</span>{' '}
            <span className="font-medium text-gray-700">{fmt(tieup.agreementSigningDate)}</span>
          </div>
        )}
        {tieup.expiryDate && (
          <div>
            <span className={nearExpiry ? 'text-red-500 font-semibold' : 'text-gray-400'}>
              Expiry:
            </span>{' '}
            <span className={`font-medium ${nearExpiry ? 'text-red-600' : 'text-gray-700'}`}>
              {fmt(tieup.expiryDate)}
              {nearExpiry && ' ⚠️'}
            </span>
          </div>
        )}
      </div>

      {/* Scope */}
      {tieup.scopeOfCollaboration && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {tieup.scopeOfCollaboration}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onViewCollege(tieup.collegeId)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
        >
          View
        </button>
        <button
          onClick={() => onEdit(tieup)}
          className="flex-1 text-xs py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

// ─── Table Row ───────────────────────────────────────────────────────────────

function TieupTableRow({
  tieup,
  onViewCollege,
  onEdit,
}: {
  tieup: Tieup;
  onViewCollege: (id: string) => void;
  onEdit: (t: Tieup) => void;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <button
          className="font-medium text-sm text-indigo-700 hover:underline text-left"
          onClick={() => onViewCollege(tieup.collegeId)}
        >
          {tieup.collegeName}
        </button>
        <div className="text-xs text-gray-400">{tieup.location}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{tieup.partnershipType}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[tieup.status]}`}>
          {tieup.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{tieup.assignedEmployee}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{fmt(tieup.initialDiscussionDate)}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{fmt(tieup.agreementSigningDate)}</td>
      <td className={`px-4 py-3 text-sm font-medium ${isNearExpiry(tieup.expiryDate) ? 'text-red-600' : 'text-gray-600'}`}>
        {fmt(tieup.expiryDate)}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button
            onClick={() => onViewCollege(tieup.collegeId)}
            className="text-xs px-3 py-1 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
          >
            View
          </button>
          <button
            onClick={() => onEdit(tieup)}
            className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Tieups({
  onViewCollege,
}: {
  onViewCollege: (collegeId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<PartnershipStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [tieups, setTieups] = useState<Tieup[]>(mockTieups);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Partial<Tieup> | null>(null);
  const [sortKey, setSortKey] = useState<keyof Tieup>('collegeName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Filtered list
  const filtered = useMemo(() => {
    return tieups.filter((t) =>
      activeTab === 'All' ? true : t.status === activeTab
    );
  }, [tieups, activeTab]);

  // Sorted (table)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = (a[sortKey] ?? '') as string;
      const bv = (b[sortKey] ?? '') as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sortKey, sortDir]);

  // Stats
  const stats = useMemo(() => ({
    active: tieups.filter((t) => t.status === 'Active').length,
    signed: tieups.filter((t) => t.status === 'Signed').length,
    pending: tieups.filter((t) =>
      ['Initial Discussion', 'Interested', 'Proposal Shared', 'Under Negotiation', 'Agreement Pending'].includes(t.status)
    ).length,
    expired: tieups.filter((t) => t.status === 'Expired').length,
  }), [tieups]);

  function openAdd() {
    setEditTarget(emptyForm());
    setModalOpen(true);
  }

  function openEdit(t: Tieup) {
    setEditTarget(t);
    setModalOpen(true);
  }

  function handleSave(form: Partial<Tieup>) {
    if (form.id) {
      setTieups((prev) => prev.map((t) => (t.id === form.id ? { ...t, ...form } as Tieup : t)));
    } else {
      const newTieup: Tieup = {
        ...form,
        id: `tu-${Date.now()}`,
        collegeId: `col-${Date.now()}`,
      } as Tieup;
      setTieups((prev) => [newTieup, ...prev]);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function toggleSort(key: keyof Tieup) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const SortIcon = ({ col }: { col: keyof Tieup }) =>
    sortKey === col ? (
      <span className="ml-1 text-indigo-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-gray-300">↕</span>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tie-ups & Partnerships</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {tieups.length} partnerships total
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Grid
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                </svg>
                Table
              </button>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              <span className="text-lg leading-none">+</span> Add Tie-up
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Partnerships', value: stats.active, color: 'emerald' },
            { label: 'Signed Agreements', value: stats.signed, color: 'violet' },
            { label: 'Pending', value: stats.pending, color: 'amber' },
            { label: 'Expired', value: stats.expired, color: 'rose' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 flex flex-col gap-1"
            >
              <span className="text-xs text-gray-500">{s.label}</span>
              <span className={`text-2xl font-bold text-${s.color}-600`}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {TAB_FILTERS.map((tab) => {
            const count =
              tab.value === 'All'
                ? tieups.length
                : tieups.filter((t) => t.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        {viewMode === 'grid' ? (
          filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              No tie-ups found for "{activeTab}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((t) => (
                <TieupCard
                  key={t.id}
                  tieup={t}
                  onViewCollege={onViewCollege}
                  onEdit={openEdit}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {(
                      [
                        { label: 'College', key: 'collegeName' },
                        { label: 'Type', key: 'partnershipType' },
                        { label: 'Status', key: 'status' },
                        { label: 'Assigned', key: 'assignedEmployee' },
                        { label: 'Discussion Date', key: 'initialDiscussionDate' },
                        { label: 'Signed Date', key: 'agreementSigningDate' },
                        { label: 'Expiry', key: 'expiryDate' },
                        { label: 'Actions', key: null },
                      ] as { label: string; key: keyof Tieup | null }[]
                    ).map((col) => (
                      <th
                        key={col.label}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                        onClick={() => col.key && toggleSort(col.key)}
                      >
                        {col.label}
                        {col.key && <SortIcon col={col.key} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sorted.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    sorted.map((t) => (
                      <TieupTableRow
                        key={t.id}
                        tieup={t}
                        onViewCollege={onViewCollege}
                        onEdit={openEdit}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalOpen && editTarget && (
        <TieupModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
