'use client';

import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Eye,
  Download,
  History,
  Edit3,
  AlertTriangle,
  X,
  Upload,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Trash2,
} from 'lucide-react';
import {
  mockAgreements,
  mockColleges,
  mockTieups,
  Agreement,
  AgreementType,
  AgreementStatus,
} from '@/data/mock/salesCRM';

interface AgreementsProps {
  onViewCollege: (collegeId: string) => void;
}

const AGREEMENT_TYPES: AgreementType[] = [
  'MoU',
  'College Tie-up Agreement',
  'FDP Agreement',
  'Training Agreement',
  'Service Agreement',
  'Partnership Agreement',
  'Other',
];

const AGREEMENT_STATUSES: AgreementStatus[] = [
  'Draft',
  'Under Review',
  'Pending Signature',
  'Signed',
  'Active',
  'Expiring Soon',
  'Expired',
  'Terminated',
];

const STATUS_BADGE: Record<AgreementStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Pending Signature': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Signed: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Expiring Soon': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Expired: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Terminated: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
};

export default function Agreements({ onViewCollege }: AgreementsProps) {
  const [agreements, setAgreements] = useState<Agreement[]>(mockAgreements);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
  const [previewAgreement, setPreviewAgreement] = useState<Agreement | null>(null);
  const [historyAgreement, setHistoryAgreement] = useState<Agreement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Agreement | null>(null);

  // Form state
  const [formState, setFormState] = useState<{
    title: string;
    collegeId: string;
    relatedTieupId: string;
    agreementType: AgreementType;
    referenceNumber: string;
    signingDate: string;
    effectiveDate: string;
    expiryDate: string;
    assignedEmployee: string;
    authorizedSignatory: string;
    status: AgreementStatus;
    uploadedDoc: string;
    description: string;
    notes: string;
  }>({
    title: '',
    collegeId: mockColleges[0]?.id || '',
    relatedTieupId: '',
    agreementType: 'MoU',
    referenceNumber: '',
    signingDate: '',
    effectiveDate: '',
    expiryDate: '',
    assignedEmployee: 'Anchal Agawane',
    authorizedSignatory: '',
    status: 'Draft',
    uploadedDoc: '',
    description: '',
    notes: '',
  });

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const expiringSoonList = useMemo(
    () => agreements.filter((a) => a.status === 'Expiring Soon'),
    [agreements]
  );

  const filtered = useMemo(() => {
    return agreements.filter((a) => {
      const matchesTab = activeTab === 'All' || a.status === activeTab;
      const matchesType = typeFilter === 'All' || a.agreementType === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.collegeName.toLowerCase().includes(q) ||
        a.referenceNumber.toLowerCase().includes(q) ||
        a.assignedEmployee.toLowerCase().includes(q);
      return matchesTab && matchesType && matchesSearch;
    });
  }, [agreements, activeTab, typeFilter, search]);

  const openAdd = () => {
    setEditingAgreement(null);
    setFormState({
      title: '',
      collegeId: mockColleges[0]?.id || '',
      relatedTieupId: '',
      agreementType: 'MoU',
      referenceNumber: `AWF-AGR-2026-0${agreements.length + 1}`,
      signingDate: '2026-11-26',
      effectiveDate: '2026-12-01',
      expiryDate: '2027-11-30',
      assignedEmployee: 'Anchal Agawane',
      authorizedSignatory: '',
      status: 'Draft',
      uploadedDoc: '',
      description: '',
      notes: '',
    });
    setShowFormModal(true);
  };

  const openEdit = (agr: Agreement) => {
    setEditingAgreement(agr);
    setFormState({
      title: agr.title,
      collegeId: agr.collegeId,
      relatedTieupId: agr.relatedTieupId || '',
      agreementType: agr.agreementType,
      referenceNumber: agr.referenceNumber,
      signingDate: agr.signingDate || '',
      effectiveDate: agr.effectiveDate || '',
      expiryDate: agr.expiryDate || '',
      assignedEmployee: agr.assignedEmployee,
      authorizedSignatory: agr.authorizedSignatory,
      status: agr.status,
      uploadedDoc: agr.uploadedDoc || '',
      description: agr.description,
      notes: agr.notes,
    });
    setShowFormModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const col = mockColleges.find((c) => c.id === formState.collegeId);
    const collegeName = col?.name || 'Unknown College';
    const today = '2026-11-26';

    if (editingAgreement) {
      setAgreements((prev) =>
        prev.map((a) =>
          a.id === editingAgreement.id
            ? {
                ...a,
                title: formState.title,
                collegeId: formState.collegeId,
                collegeName,
                relatedTieupId: formState.relatedTieupId || undefined,
                agreementType: formState.agreementType,
                referenceNumber: formState.referenceNumber,
                signingDate: formState.signingDate || undefined,
                effectiveDate: formState.effectiveDate || undefined,
                expiryDate: formState.expiryDate || undefined,
                assignedEmployee: formState.assignedEmployee,
                authorizedSignatory: formState.authorizedSignatory,
                status: formState.status,
                uploadedDoc: formState.uploadedDoc || a.uploadedDoc,
                description: formState.description,
                notes: formState.notes,
                history: [
                  ...a.history,
                  {
                    date: today,
                    action: `Updated agreement details (Status: ${formState.status})`,
                    by: formState.assignedEmployee,
                  },
                ],
              }
            : a
        )
      );
      notify('Agreement updated and new version logged in history.');
    } else {
      const newAgr: Agreement = {
        id: `AGR-${100 + agreements.length + 1}`,
        title: formState.title,
        collegeId: formState.collegeId,
        collegeName,
        relatedTieupId: formState.relatedTieupId || undefined,
        agreementType: formState.agreementType,
        referenceNumber: formState.referenceNumber,
        signingDate: formState.signingDate || undefined,
        effectiveDate: formState.effectiveDate || undefined,
        expiryDate: formState.expiryDate || undefined,
        assignedEmployee: formState.assignedEmployee,
        assignedEmployeeId: 'AWF-EMP-002',
        authorizedSignatory: formState.authorizedSignatory || 'Dr. Principal / TPO',
        status: formState.status,
        uploadedDoc: formState.uploadedDoc || `${formState.referenceNumber}.pdf`,
        supportingDocs: [],
        description: formState.description,
        notes: formState.notes,
        history: [
          {
            date: today,
            action: `Created agreement (${formState.status})`,
            by: formState.assignedEmployee,
          },
        ],
        createdAt: today,
      };
      setAgreements((prev) => [newAgr, ...prev]);
      notify('Agreement added and linked to college profile.');
    }
    setShowFormModal(false);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setAgreements((prev) => prev.filter((a) => a.id !== deleteTarget.id));
    notify(`Removed agreement ${deleteTarget.referenceNumber}.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-violet-600" />
            Agreements & Document Management
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              {agreements.length}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload signed MoUs, track validity & expiry reminders, and link agreements directly to College Profiles.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Agreement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 font-medium">Total Agreements</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{agreements.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/40">
          <p className="text-xs text-emerald-600 font-medium">Active / Signed</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {agreements.filter((a) => a.status === 'Active' || a.status === 'Signed').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-orange-200 dark:border-orange-900/40">
          <p className="text-xs text-orange-600 font-medium">Expiring Soon</p>
          <p className="text-2xl font-black text-orange-600 mt-1">{expiringSoonList.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40">
          <p className="text-xs text-rose-600 font-medium">Expired</p>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {agreements.filter((a) => a.status === 'Expired').length}
          </p>
        </div>
      </div>

      {/* Expiring Soon Alert Banner */}
      {expiringSoonList.length > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-orange-900 dark:text-orange-200">
                Agreement Renewal Alert: {expiringSoonList.length} agreement(s) expiring soon
              </p>
              <p className="text-[11px] text-orange-700 dark:text-orange-300 mt-0.5">
                {expiringSoonList.map((e) => `${e.collegeName} (${e.expiryDate})`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('Expiring Soon')}
            className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold shrink-0"
          >
            View Expiring
          </button>
        </div>
      )}

      {/* Tabs + Search + Type filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'Active', 'Pending Signature', 'Signed', 'Expiring Soon', 'Expired'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, college, ref..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs w-52"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
          >
            <option value="All">All Types</option>
            {AGREEMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Agreements List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No agreements match the current filters.
          </div>
        ) : (
          filtered.map((agr) => (
            <div
              key={agr.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-violet-300 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">{agr.referenceNumber}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[agr.status]}`}>
                    {agr.status}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                    {agr.agreementType}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{agr.title}</h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <button
                    onClick={() => onViewCollege(agr.collegeId)}
                    className="font-bold text-violet-600 hover:underline flex items-center gap-1"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {agr.collegeName}
                  </button>
                  <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{agr.assignedEmployee}</strong></span>
                  <span>Signatory: <strong className="text-slate-700 dark:text-slate-300">{agr.authorizedSignatory}</strong></span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Signed: {agr.signingDate || 'Pending'}
                  </span>
                  <span>Effective: {agr.effectiveDate || '—'}</span>
                  <span className={agr.status === 'Expiring Soon' || agr.status === 'Expired' ? 'text-rose-500 font-bold' : ''}>
                    Expiry: {agr.expiryDate || '—'}
                  </span>
                  {agr.uploadedDoc && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {agr.uploadedDoc}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setPreviewAgreement(agr)}
                  className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center gap-1.5 hover:bg-violet-100"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => notify(`Downloading ${agr.uploadedDoc || agr.referenceNumber + '.pdf'}...`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button
                  onClick={() => setHistoryAgreement(agr)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <History className="w-3.5 h-3.5" /> History ({agr.history.length})
                </button>
                <button
                  onClick={() => openEdit(agr)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(agr)}
                  className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100"
                  title="Delete agreement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingAgreement ? 'Edit Agreement' : 'Add New Agreement'}
              </h3>
              <button onClick={() => setShowFormModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Agreement Title *</label>
                <input
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g., Campus Placement & FDP MoU 2026"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">College / Organization *</label>
                  <select
                    value={formState.collegeId}
                    onChange={(e) => setFormState({ ...formState, collegeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {mockColleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Related Tie-up Record</label>
                  <select
                    value={formState.relatedTieupId}
                    onChange={(e) => setFormState({ ...formState, relatedTieupId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="">None</option>
                    {mockTieups.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} — {t.collegeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Agreement Type</label>
                  <select
                    value={formState.agreementType}
                    onChange={(e) => setFormState({ ...formState, agreementType: e.target.value as AgreementType })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {AGREEMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Reference Number *</label>
                  <input
                    required
                    value={formState.referenceNumber}
                    onChange={(e) => setFormState({ ...formState, referenceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Signing Date</label>
                  <input
                    type="date"
                    value={formState.signingDate}
                    onChange={(e) => setFormState({ ...formState, signingDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={formState.effectiveDate}
                    onChange={(e) => setFormState({ ...formState, effectiveDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formState.expiryDate}
                    onChange={(e) => setFormState({ ...formState, expiryDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Assigned Employee</label>
                  <input
                    value={formState.assignedEmployee}
                    onChange={(e) => setFormState({ ...formState, assignedEmployee: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Authorized Signatory</label>
                  <input
                    value={formState.authorizedSignatory}
                    onChange={(e) => setFormState({ ...formState, authorizedSignatory: e.target.value })}
                    placeholder="e.g., Dr. Principal / Pooja Ahire"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Status</label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as AgreementStatus })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    {AGREEMENT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Signed Document (PDF/DOCX)</label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-violet-300 dark:border-violet-700 bg-violet-50/40 dark:bg-violet-950/20 cursor-pointer">
                    <Upload className="w-4 h-4 text-violet-600" />
                    <span className="truncate">{formState.uploadedDoc || 'Click to attach signed PDF...'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFormState({ ...formState, uploadedDoc: f.name });
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description & Scope</label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={formState.notes}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold">
                  {editingAgreement ? 'Save New Version' : 'Create Agreement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Document Preview: {previewAgreement.uploadedDoc || `${previewAgreement.referenceNumber}.pdf`}
              </h3>
              <button onClick={() => setPreviewAgreement(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{previewAgreement.title}</p>
              <p className="text-slate-500">Reference: {previewAgreement.referenceNumber} • {previewAgreement.agreementType}</p>
              <p><strong>Partner Institution:</strong> {previewAgreement.collegeName}</p>
              <p><strong>Authorized Signatory:</strong> {previewAgreement.authorizedSignatory}</p>
              <p><strong>Validity:</strong> {previewAgreement.effectiveDate || '—'} to {previewAgreement.expiryDate || '—'}</p>
              <p className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {previewAgreement.description}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => notify(`Downloaded ${previewAgreement.uploadedDoc || previewAgreement.referenceNumber + '.pdf'}`)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Version & Activity History ({historyAgreement.referenceNumber})
              </h3>
              <button onClick={() => setHistoryAgreement(null)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {historyAgreement.history.map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-violet-600">{h.by}</span>
                    <span>{h.date}</span>
                  </div>
                  <p className="mt-1 font-medium text-slate-800 dark:text-slate-200">{h.action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-500">
              Remove agreement <strong>{deleteTarget.title}</strong> ({deleteTarget.referenceNumber})?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-bold">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
