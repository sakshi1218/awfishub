'use client';

import React, { useState, useMemo } from 'react';
import {
  InterestedClient,
  CRMStage,
  Interaction,
  mockInterestedClients,
} from '@/data/mock/salesCRM';

// ─── Helpers ────────────────────────────────────────────────────────────────

const stageColors: Record<CRMStage, { bg: string; text: string; border: string; header: string }> = {
  New: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', header: 'bg-slate-200 text-slate-700' },
  Contacted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', header: 'bg-blue-200 text-blue-800' },
  Interested: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', header: 'bg-indigo-200 text-indigo-800' },
  'Meeting Scheduled': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', header: 'bg-violet-200 text-violet-800' },
  'Proposal Sent': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', header: 'bg-purple-200 text-purple-800' },
  Negotiation: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', header: 'bg-amber-200 text-amber-800' },
  Won: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', header: 'bg-emerald-200 text-emerald-800' },
  Lost: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', header: 'bg-rose-200 text-rose-800' },
};

const CRM_STAGES: CRMStage[] = [
  'New',
  'Contacted',
  'Interested',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

function fmtOpp(val?: number) {
  if (!val) return '—';
  return '₹' + (val / 100000).toFixed(1) + 'L';
}

function fmt(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const emptyClient = (): Partial<InterestedClient> => ({
  clientName: '',
  orgType: '',
  contactPerson: '',
  email: '',
  phone: '',
  stage: 'New',
  assignedSalesperson: '',
  estimatedOpportunity: 0,
  notes: '',
  interactions: [],
});

const emptyInteraction = (): Partial<Interaction> => ({
  type: 'Call',
  date: new Date().toISOString().split('T')[0],
  summary: '',
  by: '',
});

// ─── Interaction Timeline ─────────────────────────────────────────────────────

function InteractionTimeline({ interactions }: { interactions: Interaction[] }) {
  const sorted = [...interactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const typeIcon: Record<string, string> = {
    Call: '📞',
    Email: '✉️',
    Visit: '🏢',
    Meeting: '🤝',
    Other: '📝',
  };

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic py-4">No interactions logged yet.</p>
    );
  }

  return (
    <div className="relative pl-5">
      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200" />
      {sorted.map((i, idx) => (
        <div key={i.id ?? idx} className="relative mb-4 last:mb-0">
          <div className="absolute -left-3 top-1 w-5 h-5 bg-white border-2 border-indigo-400 rounded-full flex items-center justify-center text-xs">
            {typeIcon[i.type] ?? '📝'}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 ml-3 border border-gray-200">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-700">{i.type}</span>
              <span className="text-xs text-gray-400">{fmt(i.date)}</span>
            </div>
            <p className="text-sm text-gray-700">{i.summary}</p>
            {i.by && (
              <p className="text-xs text-gray-400 mt-1">By: {i.by}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Stage Stepper ────────────────────────────────────────────────────────────

function StageStepper({ current }: { current: CRMStage }) {
  const steps = CRM_STAGES.filter((s) => s !== 'Lost');
  const idx = (steps as CRMStage[]).indexOf(current);

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {steps.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  current === 'Lost'
                    ? 'bg-rose-200 text-rose-700'
                    : active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className="text-[9px] mt-0.5 text-gray-500 whitespace-nowrap max-w-[52px] text-center leading-tight">
                {stage}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[8px] mx-0.5 ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Client Detail Drawer ─────────────────────────────────────────────────────

function ClientDrawer({
  client,
  onClose,
  onEdit,
  onLogInteraction,
}: {
  client: InterestedClient;
  onClose: () => void;
  onEdit: () => void;
  onLogInteraction: (clientId: string, interaction: Partial<Interaction>) => void;
}) {
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState<Partial<Interaction>>(emptyInteraction());
  const colors = stageColors[client.stage];

  function submitLog() {
    if (!logForm.summary) return;
    onLogInteraction(client.id, {
      ...logForm,
      id: `int-${Date.now()}`,
    });
    setLogOpen(false);
    setLogForm(emptyInteraction());
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative z-10 bg-white w-full sm:w-[480px] h-full overflow-y-auto shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className={`px-6 py-5 ${colors.bg} border-b ${colors.border}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{client.clientName}</h2>
              <p className="text-sm text-gray-500">{client.orgType}</p>
              {client.contactPerson && (
                <p className="text-xs text-gray-500 mt-1">👤 {client.contactPerson}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none mt-1">×</button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-600">
            {client.phone && <span>📱 {client.phone}</span>}
            {client.email && <span>✉️ {client.email}</span>}
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
              {client.stage}
            </span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 flex-1">
          {/* Stage Stepper */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Stage Progress</p>
            <StageStepper current={client.stage} />
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Opportunity</p>
              <p className="text-sm font-bold text-emerald-600">{fmtOpp(client.estimatedOpportunity)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400">Assigned To</p>
              <p className="text-sm font-semibold text-gray-700">{client.assignedSalesperson}</p>
            </div>
            {client.nextFollowUpDate && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400">Next Follow-up</p>
                <p className="text-sm font-semibold text-indigo-600">{fmt(client.nextFollowUpDate)}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Notes</p>
              <p className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                {client.notes}
              </p>
            </div>
          )}

          {/* Interaction Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase">Interaction History</p>
              <button
                onClick={() => setLogOpen(true)}
                className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 font-medium"
              >
                + Log Interaction
              </button>
            </div>
            <InteractionTimeline interactions={client.interactions ?? []} />
          </div>

          {/* Log Interaction Mini Form */}
          {logOpen && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-semibold text-indigo-700">Log New Interaction</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Type</label>
                  <select
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={logForm.type}
                    onChange={(e) => setLogForm((f) => ({ ...f, type: e.target.value as Interaction['type'] }))}
                  >
                    {['Call', 'Email', 'Visit', 'Meeting', 'Other'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600">Date</label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={logForm.date}
                    onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Conducted By</label>
                <input
                  type="text"
                  placeholder="Employee name"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={logForm.by ?? ''}
                  onChange={(e) => setLogForm((f) => ({ ...f, by: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Summary</label>
                <textarea
                  rows={3}
                  placeholder="Describe what happened..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  value={logForm.summary ?? ''}
                  onChange={(e) => setLogForm((f) => ({ ...f, summary: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setLogOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitLog}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Edit Client Info
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Client Modal ─────────────────────────────────────────────────────────────

function ClientModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Partial<InterestedClient>;
  onClose: () => void;
  onSave: (c: Partial<InterestedClient>) => void;
}) {
  const [form, setForm] = useState<Partial<InterestedClient>>(initial);

  const field = (label: string, key: keyof InterestedClient, type = 'text', opts?: string[]) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {opts ? (
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={(form[key] as string) ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        >
          {opts.map((o) => <option key={o}>{o}</option>)}
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
          value={(form[key] as string | number) ?? ''}
          onChange={(e) => setForm((f) => ({
            ...f,
            [key]: type === 'number' ? Number(e.target.value) : e.target.value,
          }))}
        />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial.id ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('Full Name', 'clientName')}
          {field('Organization Type', 'orgType')}
          {field('Contact Person', 'contactPerson')}
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
          {field('Stage', 'stage', 'text', CRM_STAGES)}
          {field('Assigned Salesperson', 'assignedSalesperson')}
          {field('Estimated Opportunity (₹)', 'estimatedOpportunity', 'number')}
          {field('Next Follow-up', 'nextFollowUpDate', 'date')}
          <div className="sm:col-span-2">{field('Notes', 'notes', 'textarea')}</div>
        </div>
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

function KanbanCard({ client, onClick }: { client: InterestedClient; onClick: () => void }) {
  const colors = stageColors[client.stage];
  return (
    <div
      onClick={onClick}
      className={`${colors.bg} border ${colors.border} rounded-xl p-3 cursor-pointer hover:shadow-md transition-shadow mb-2`}
    >
      <p className="text-sm font-semibold text-gray-800 leading-tight">{client.clientName}</p>
      <p className="text-xs text-gray-500 mt-0.5">{client.orgType}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">👤 {client.assignedSalesperson}</span>
        <span className="text-xs font-bold text-emerald-600">{fmtOpp(client.estimatedOpportunity)}</span>
      </div>
      {client.nextFollowUpDate && (
        <p className="text-xs text-indigo-500 mt-1.5">📅 {fmt(client.nextFollowUpDate)}</p>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InterestedClients({
  onViewCollege,
}: {
  onViewCollege: (collegeId: string) => void;
}) {
  const [clients, setClients] = useState<InterestedClient[]>(mockInterestedClients);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedClient, setSelectedClient] = useState<InterestedClient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Partial<InterestedClient> | null>(null);
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<CRMStage | 'All'>('All');

  // Filtered for table
  const tableData = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        !search ||
        c.clientName.toLowerCase().includes(search.toLowerCase()) ||
        (c.contactPerson ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.orgType ?? '').toLowerCase().includes(search.toLowerCase());
      const matchStage = filterStage === 'All' || c.stage === filterStage;
      return matchSearch && matchStage;
    });
  }, [clients, search, filterStage]);

  function openAdd() {
    setEditTarget(emptyClient());
    setModalOpen(true);
  }

  function openEdit(c: InterestedClient) {
    setEditTarget(c);
    setModalOpen(true);
    setSelectedClient(null);
  }

  function handleSave(form: Partial<InterestedClient>) {
    if (form.id) {
      setClients((prev) => prev.map((c) => (c.id === form.id ? { ...c, ...form } as InterestedClient : c)));
      if (selectedClient?.id === form.id) {
        setSelectedClient((prev) => prev ? { ...prev, ...form } as InterestedClient : null);
      }
    } else {
      const nc: InterestedClient = {
        ...form,
        id: `cl-${Date.now()}`,
        collegeId: '',
        interactions: [],
      } as InterestedClient;
      setClients((prev) => [nc, ...prev]);
    }
    setModalOpen(false);
    setEditTarget(null);
  }

  function handleLogInteraction(clientId: string, interaction: Partial<Interaction>) {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return { ...c, interactions: [...(c.interactions ?? []), interaction as Interaction] };
      })
    );
    if (selectedClient?.id === clientId) {
      setSelectedClient((prev) =>
        prev ? { ...prev, interactions: [...(prev.interactions ?? []), interaction as Interaction] } : null
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interested Clients</h1>
            <p className="text-sm text-gray-500 mt-0.5">{clients.length} clients in pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-sm flex items-center gap-1.5 ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 4a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h3a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zm7-1a1 1 0 00-1 1v12a1 1 0 001 1h2a1 1 0 001-1V4a1 1 0 00-1-1h-2z" />
                </svg>
                Kanban
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
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm"
            >
              <span className="text-lg leading-none">+</span> Add Client
            </button>
          </div>
        </div>

        {/* ── Kanban ── */}
        {viewMode === 'kanban' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {CRM_STAGES.map((stage) => {
                const stageClients = clients.filter((c) => c.stage === stage);
                const colors = stageColors[stage];
                return (
                  <div key={stage} className="w-56 flex-shrink-0 flex flex-col">
                    {/* Column Header */}
                    <div className={`${colors.header} rounded-t-xl px-3 py-2 flex items-center justify-between mb-2`}>
                      <span className="text-xs font-bold">{stage}</span>
                      <span className="text-xs bg-white/60 px-1.5 py-0.5 rounded-full font-semibold">
                        {stageClients.length}
                      </span>
                    </div>
                    {/* Cards */}
                    <div className="flex-1 min-h-[200px] bg-white/50 rounded-b-xl rounded-tr-xl border border-gray-200 p-2">
                      {stageClients.length === 0 ? (
                        <p className="text-xs text-gray-300 text-center py-6">No clients</p>
                      ) : (
                        stageClients.map((c) => (
                          <KanbanCard
                            key={c.id}
                            client={c}
                            onClick={() => setSelectedClient(c)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Table ── */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as CRMStage | 'All')}
              >
                <option value="All">All Stages</option>
                {CRM_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Client', 'Org Type', 'Contact', 'Stage', 'Opportunity', 'Salesperson', 'Next Follow-up', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                        No clients found.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((c) => {
                      const colors = stageColors[c.stage];
                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <button
                              className="font-medium text-sm text-indigo-700 hover:underline text-left"
                              onClick={() => setSelectedClient(c)}
                            >
                              {c.clientName}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.orgType}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.contactPerson}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                              {c.stage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600">{fmtOpp(c.estimatedOpportunity)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{c.assignedSalesperson}</td>
                          <td className="px-4 py-3 text-sm text-indigo-500">{fmt(c.nextFollowUpDate)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedClient(c)}
                                className="text-xs px-3 py-1 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              >
                                View
                              </button>
                              <button
                                onClick={() => openEdit(c)}
                                className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Drawer ── */}
      {selectedClient && (
        <ClientDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onEdit={() => openEdit(selectedClient)}
          onLogInteraction={handleLogInteraction}
        />
      )}

      {/* ── Modal ── */}
      {modalOpen && editTarget && (
        <ClientModal
          initial={editTarget}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
