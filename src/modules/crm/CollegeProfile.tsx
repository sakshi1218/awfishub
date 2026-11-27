'use client';

import React, { useState } from 'react';
import {
  mockCollegeVisits,
  mockFDPSessions,
  mockTieups,
  mockInterestedClients,
  mockAgreements,
  mockSalesFollowUps,
} from '@/data/mock/salesCRM';

interface CollegeProfileProps {
  collegeId: string;
  onBack: () => void;
}

const TABS = [
  'Overview',
  'College Visits',
  'FDP Sessions',
  'Tie-ups',
  'Interested Opportunities',
  'Agreements',
  'Follow-ups',
  'Interaction History',
  'Documents',
] as const;

type Tab = (typeof TABS)[number];

function Badge({
  label,
  color,
}: {
  label: string;
  color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'fuchsia' | 'gray';
}) {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    fuchsia: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[color]}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex flex-col gap-0.5 min-w-[110px]">
      <span className="text-2xl font-bold text-violet-700">{value}</span>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

export default function CollegeProfile({ collegeId, onBack }: CollegeProfileProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  // Filter data for this college
  const visits = mockCollegeVisits.filter((v) => v.collegeId === collegeId);
  const fdpSessions = mockFDPSessions.filter((f) => f.collegeId === collegeId);
  const tieups = mockTieups.filter((t) => t.collegeId === collegeId);
  const clients = mockInterestedClients.filter((c) => c.collegeId === collegeId);
  const agreements = mockAgreements.filter((a) => a.collegeId === collegeId);
  const followUps = mockSalesFollowUps.filter((f) => f.collegeId === collegeId);

  // College info from first visit record or mock lookup
  const college = visits[0] || fdpSessions[0] || tieups[0] || null;
  const collegeName = (college as any)?.collegeName || `College #${collegeId}`;
  const location = (college as any)?.location || '—';
  const collegeType = (college as any)?.collegeType || '—';
  const affiliation = (college as any)?.affiliation || '—';
  const tpoName = (college as any)?.tpoName || (college as any)?.contactPerson || '—';
  const tpoEmail = (college as any)?.tpoEmail || (college as any)?.email || '—';
  const tpoPhone = (college as any)?.tpoPhone || (college as any)?.phone || '—';

  const tieupStatus = tieups.length > 0 ? (tieups[0] as any).status || 'Unknown' : 'No Tie-up';
  const tieupColor =
    tieupStatus === 'Active' ? 'emerald' : tieupStatus === 'Pending' ? 'amber' : tieupStatus === 'No Tie-up' ? 'gray' : 'rose';

  // All interactions timeline
  const timeline = [
    ...visits.map((v) => ({
      type: 'Visit',
      date: (v as any).visitDate || (v as any).date || '',
      desc: (v as any).purpose || (v as any).description || 'College Visit',
      person: (v as any).visitedBy || (v as any).employee || '',
    })),
    ...fdpSessions.map((f) => ({
      type: 'FDP',
      date: (f as any).sessionDate || (f as any).date || '',
      desc: (f as any).topic || (f as any).title || 'FDP Session',
      person: (f as any).conductedBy || (f as any).facilitator || '',
    })),
    ...agreements.map((a) => ({
      type: 'Agreement',
      date: (a as any).signedDate || (a as any).startDate || (a as any).date || '',
      desc: `Agreement: ${(a as any).title || (a as any).type || ''}`,
      person: (a as any).signedBy || '',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // All documents
  const allDocs = [
    ...agreements
      .filter((a) => (a as any).documentUrl || (a as any).docLink)
      .map((a) => ({
        name: (a as any).title || 'Agreement Document',
        url: (a as any).documentUrl || (a as any).docLink || '#',
        category: 'Agreement',
      })),
    ...tieups
      .filter((t) => (t as any).documentUrl || (t as any).docLink)
      .map((t) => ({
        name: (t as any).title || 'Tie-up Document',
        url: (t as any).documentUrl || (t as any).docLink || '#',
        category: 'Tie-up',
      })),
  ];

  function formatDate(d: string) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const typeColor = (type: string) => {
    const map: Record<string, 'violet' | 'fuchsia' | 'emerald' | 'blue' | 'amber'> = {
      Visit: 'violet',
      FDP: 'fuchsia',
      Agreement: 'emerald',
      Tie_up: 'blue',
      Client: 'amber',
    };
    return map[type] || 'gray' as any;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="mt-1 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-violet-600 transition-colors"
              title="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{collegeName}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                {location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {location}
                  </span>
                )}
                {collegeType !== '—' && <Badge label={collegeType} color="violet" />}
                {affiliation !== '—' && <span className="text-gray-400">Affiliated: {affiliation}</span>}
              </div>
              {tpoName !== '—' && (
                <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-3">
                  <span>TPO: <span className="text-gray-600 font-medium">{tpoName}</span></span>
                  {tpoEmail !== '—' && <span>✉ {tpoEmail}</span>}
                  {tpoPhone !== '—' && <span>📞 {tpoPhone}</span>}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                label={tieupStatus}
                color={tieupColor as any}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
            <StatCard label="Visits" value={visits.length} />
            <StatCard label="FDP Sessions" value={fdpSessions.length} />
            <StatCard label="Tie-ups" value={tieups.length} sub={tieupStatus} />
            <StatCard label="Agreements" value={agreements.length} />
            <StatCard label="Clients" value={clients.length} />
            <StatCard label="Follow-ups" value={followUps.length} />
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide border-t border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">College Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">Name:</dt><dd className="font-medium text-gray-800">{collegeName}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">Location:</dt><dd className="text-gray-700">{location}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">Type:</dt><dd className="text-gray-700">{collegeType}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">Affiliation:</dt><dd className="text-gray-700">{affiliation}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">TPO Contact:</dt><dd className="text-gray-700">{tpoName}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">TPO Email:</dt><dd className="text-gray-700">{tpoEmail}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500 w-32">TPO Phone:</dt><dd className="text-gray-700">{tpoPhone}</dd></div>
                </dl>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Activity Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Total Visits</span><span className="font-medium text-violet-700">{visits.length}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">FDP Sessions</span><span className="font-medium text-fuchsia-700">{fdpSessions.length}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Tie-up Status</span><Badge label={tieupStatus} color={tieupColor as any} /></div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Agreements</span><span className="font-medium text-emerald-700">{agreements.length}</span></div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100"><span className="text-gray-500">Interested Clients</span><span className="font-medium text-blue-700">{clients.length}</span></div>
                  <div className="flex justify-between py-1.5"><span className="text-gray-500">Pending Follow-ups</span><span className="font-medium text-amber-700">{followUps.filter((f) => (f as any).status === 'Pending').length}</span></div>
                </div>
              </div>
            </div>

            {/* Recent Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Interactions</h3>
              {timeline.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No interactions recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {timeline.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="mt-1">
                        <Badge label={item.type} color={typeColor(item.type)} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{item.desc}</p>
                        {item.person && <p className="text-gray-400 text-xs">{item.person}</p>}
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap">{formatDate(item.date)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COLLEGE VISITS ── */}
        {activeTab === 'College Visits' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">College Visits <span className="text-gray-400 text-sm font-normal">({visits.length})</span></h3>
              <button className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors">+ Add Visit</button>
            </div>
            {visits.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No visits recorded for this college.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Purpose', 'Visited By', 'Outcome', 'Next Action'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visits.map((v: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(v.visitDate || v.date)}</td>
                        <td className="px-4 py-3 text-gray-800">{v.purpose || v.description || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{v.visitedBy || v.employee || '—'}</td>
                        <td className="px-4 py-3"><Badge label={v.outcome || v.status || '—'} color={v.outcome === 'Positive' || v.status === 'Completed' ? 'emerald' : 'amber'} /></td>
                        <td className="px-4 py-3 text-gray-600">{v.nextAction || v.followUp || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── FDP SESSIONS ── */}
        {activeTab === 'FDP Sessions' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">FDP Sessions <span className="text-gray-400 text-sm font-normal">({fdpSessions.length})</span></h3>
              <button className="px-3 py-1.5 bg-fuchsia-600 text-white text-sm rounded-lg hover:bg-fuchsia-700 transition-colors">+ Add FDP</button>
            </div>
            {fdpSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No FDP sessions for this college.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Date', 'Topic', 'Facilitator', 'Participants', 'Status'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {fdpSessions.map((f: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(f.sessionDate || f.date)}</td>
                        <td className="px-4 py-3 text-gray-800">{f.topic || f.title || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{f.conductedBy || f.facilitator || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{f.participants || f.participantCount || '—'}</td>
                        <td className="px-4 py-3"><Badge label={f.status || '—'} color={f.status === 'Completed' ? 'emerald' : f.status === 'Scheduled' ? 'blue' : 'amber'} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TIE-UPS ── */}
        {activeTab === 'Tie-ups' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Tie-ups <span className="text-gray-400 text-sm font-normal">({tieups.length})</span></h3>
              <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">+ Add Tie-up</button>
            </div>
            {tieups.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No tie-ups recorded for this college.</div>
            ) : (
              <div className="p-5 space-y-4">
                {tieups.map((t: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-800">{t.title || t.type || `Tie-up #${i + 1}`}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(t.startDate || t.date)} {t.endDate ? `→ ${formatDate(t.endDate)}` : ''}
                        </p>
                      </div>
                      <Badge label={t.status || '—'} color={t.status === 'Active' ? 'emerald' : t.status === 'Pending' ? 'amber' : 'rose'} />
                    </div>
                    {t.notes && <p className="mt-2 text-sm text-gray-600">{t.notes}</p>}
                    {(t.documentUrl || t.docLink) && (
                      <a href={t.documentUrl || t.docLink} className="mt-2 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        📄 View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INTERESTED OPPORTUNITIES ── */}
        {activeTab === 'Interested Opportunities' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Interested Clients / Opportunities <span className="text-gray-400 text-sm font-normal">({clients.length})</span></h3>
              <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">+ Add Client</button>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No interested clients linked to this college.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Client Name', 'Service Interest', 'Stage', 'Value', 'Assigned To', 'Date'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clients.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{c.clientName || c.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.serviceInterest || c.service || '—'}</td>
                        <td className="px-4 py-3"><Badge label={c.stage || c.status || '—'} color="blue" /></td>
                        <td className="px-4 py-3 text-gray-600">{c.value ? `₹${Number(c.value).toLocaleString('en-IN')}` : '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{c.assignedTo || c.employee || '—'}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(c.date || c.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── AGREEMENTS ── */}
        {activeTab === 'Agreements' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Agreements <span className="text-gray-400 text-sm font-normal">({agreements.length})</span></h3>
              <button className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 transition-colors">+ Add Agreement</button>
            </div>
            {agreements.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No agreements found for this college.</div>
            ) : (
              <div className="p-5 space-y-3">
                {agreements.map((a: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{a.title || a.type || `Agreement #${i + 1}`}</p>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        <span>Signed: {formatDate(a.signedDate || a.startDate)}</span>
                        {a.expiryDate && <span>Expires: {formatDate(a.expiryDate)}</span>}
                        {a.value && <span className="text-emerald-600 font-medium">₹{Number(a.value).toLocaleString('en-IN')}</span>}
                      </div>
                      {a.notes && <p className="text-xs text-gray-500 mt-1">{a.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge label={a.status || '—'} color={a.status === 'Active' ? 'emerald' : a.status === 'Expired' ? 'rose' : 'amber'} />
                      {(a.documentUrl || a.docLink) && (
                        <a href={a.documentUrl || a.docLink} className="text-xs text-violet-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          📄 View Doc
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FOLLOW-UPS ── */}
        {activeTab === 'Follow-ups' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Follow-ups <span className="text-gray-400 text-sm font-normal">({followUps.length})</span></h3>
              <button className="px-3 py-1.5 bg-amber-500 text-white text-sm rounded-lg hover:bg-amber-600 transition-colors">+ Add Follow-up</button>
            </div>
            {followUps.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No follow-ups for this college.</div>
            ) : (
              <div className="p-5 space-y-3">
                {followUps.map((f: any, i: number) => {
                  const isOverdue = f.status === 'Pending' && new Date(f.dueDate || f.date) < new Date();
                  return (
                    <div key={i} className={`border rounded-lg p-4 ${isOverdue ? 'border-rose-200 bg-rose-50' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-800">{f.title || f.subject || '—'}</p>
                        <Badge
                          label={isOverdue ? 'Overdue' : f.status || '—'}
                          color={isOverdue ? 'rose' : f.status === 'Completed' ? 'emerald' : f.status === 'Rescheduled' ? 'amber' : 'blue'}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                        <span>Due: {formatDate(f.dueDate || f.date)}</span>
                        <span>Assigned: {f.assignedTo || f.employee || '—'}</span>
                        {f.priority && <Badge label={f.priority} color={f.priority === 'High' ? 'rose' : f.priority === 'Medium' ? 'amber' : 'gray'} />}
                      </div>
                      {f.notes && <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{f.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── INTERACTION HISTORY ── */}
        {activeTab === 'Interaction History' && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-5">Interaction Timeline</h3>
            {timeline.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No interactions recorded.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6 pl-10">
                  {timeline.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-violet-400 border-2 border-white shadow" />
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge label={item.type} color={typeColor(item.type)} />
                            {item.person && <span className="text-xs text-gray-400">{item.person}</span>}
                          </div>
                          <p className="text-sm text-gray-700">{item.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(item.date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === 'Documents' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Documents <span className="text-gray-400 text-sm font-normal">({allDocs.length})</span></h3>
              <button className="px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">+ Upload Document</button>
            </div>
            {allDocs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No documents uploaded for this college.</div>
            ) : (
              <div className="p-5 space-y-3">
                {allDocs.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 border border-gray-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.category}</p>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-600 hover:underline font-medium"
                    >
                      Download / View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
