'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  mockColleges,
  mockCollegeVisits,
  mockFDPSessions,
  mockTieups,
  mockInterestedClients,
  mockAgreements,
  mockSalesFollowUps,
  FollowUp,
} from '@/data/mock/salesCRM';

export type SalesTabType =
  | 'DASHBOARD'
  | 'COLLEGES'
  | 'VISITS'
  | 'FDP'
  | 'TIEUPS'
  | 'CRM'
  | 'AGREEMENTS'
  | 'FOLLOWUPS'
  | 'PERFORMANCE'
  | 'COLLEGE';

type SectionKey = 'COLLEGES' | 'VISITS' | 'FDP' | 'TIEUPS' | 'CRM' | 'AGREEMENTS' | 'FOLLOWUPS';

const STRIPE_COLORS: Record<SectionKey, string> = {
  COLLEGES: 'border-l-violet-600',
  VISITS: 'border-l-pink-500',
  FDP: 'border-l-blue-600',
  TIEUPS: 'border-l-emerald-600',
  CRM: 'border-l-amber-600',
  AGREEMENTS: 'border-l-indigo-600',
  FOLLOWUPS: 'border-l-rose-600',
};

const ACTIVE_OUTLINE: Record<SectionKey, string> = {
  COLLEGES: 'ring-2 ring-violet-600 dark:ring-violet-400',
  VISITS: 'ring-2 ring-pink-500 dark:ring-pink-400',
  FDP: 'ring-2 ring-blue-600 dark:ring-blue-400',
  TIEUPS: 'ring-2 ring-emerald-600 dark:ring-emerald-400',
  CRM: 'ring-2 ring-amber-500 dark:ring-amber-400',
  AGREEMENTS: 'ring-2 ring-indigo-600 dark:ring-indigo-400',
  FOLLOWUPS: 'ring-2 ring-rose-600 dark:ring-rose-400',
};

function getBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (
    s === 'active' ||
    s === 'approved' ||
    s === 'signed' ||
    s === 'interested' ||
    s === 'done' ||
    s === 'completed' ||
    s === 'won' ||
    s === 'tie-up completed'
  ) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
  }
  if (
    s === 'overdue' ||
    s === 'expired' ||
    s === 'terminated' ||
    s === 'rejected' ||
    s === 'lost' ||
    s === 'not interested'
  ) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300';
  }
  if (
    s === 'pitched' ||
    s === 'negotiating' ||
    s === 'under negotiation' ||
    s === 'negotiation' ||
    s === 'meeting scheduled' ||
    s === 'meeting set' ||
    s === 'under review' ||
    s === 'discussion ongoing' ||
    s === 'tie-up in discussion' ||
    s === 'proposal shared'
  ) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300';
  }
  return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
}

function formatDateShort(dateStr?: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface RecordCardItem {
  id: string;
  top: string;
  title: string;
  status: string;
  canMarkDone?: boolean;
  details: [string, string][];
}

export function SalesView({ defaultTab = 'DASHBOARD' }: { defaultTab?: SalesTabType }) {
  const normalizeTab = (t: SalesTabType): 'DASHBOARD' | SectionKey => {
    if (t === 'PERFORMANCE' || t === 'COLLEGE') return 'DASHBOARD';
    return t;
  };

  const [activeView, setActiveView] = useState<'DASHBOARD' | SectionKey>(() => normalizeTab(defaultTab));
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockSalesFollowUps);
  const [search, setSearch] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const markFollowUpDone = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Completed' } : f))
    );
  };

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Live summary counts calculated directly from data
  const approvedFdpCount = mockFDPSessions.filter((f) => f.status === 'Approved').length;
  const activeTieupsCount = mockTieups.filter((t) => t.status === 'Active' || t.status === 'Signed').length;
  const signedAgreementsCount = mockAgreements.filter((a) => a.status === 'Active' || a.status === 'Signed').length;
  const expiringAgreementsCount = mockAgreements.filter((a) => a.status === 'Expiring Soon').length;
  const pendingFollowUps = useMemo(
    () => followUps.filter((f) => f.status === 'Pending' || f.status === 'Overdue' || f.status === 'Rescheduled'),
    [followUps]
  );
  const overdueFollowUpsCount = pendingFollowUps.filter((f) => f.status === 'Overdue').length;

  const summaryBoxes: {
    key: SectionKey;
    label: string;
    value: number;
    sub: string;
    redSub?: boolean;
  }[] = [
    {
      key: 'COLLEGES',
      label: 'Total colleges',
      value: mockColleges.length,
      sub: 'Unified profiles',
    },
    {
      key: 'VISITS',
      label: 'College visits',
      value: mockCollegeVisits.length,
      sub: 'Logged field visits',
    },
    {
      key: 'FDP',
      label: 'FDP sessions',
      value: mockFDPSessions.length,
      sub: `${approvedFdpCount} approved`,
    },
    {
      key: 'TIEUPS',
      label: 'Active tie-ups',
      value: activeTieupsCount,
      sub: `${mockTieups.length} total partnerships`,
    },
    {
      key: 'CRM',
      label: 'Interested clients',
      value: mockInterestedClients.length,
      sub: 'In your pipeline',
    },
    {
      key: 'AGREEMENTS',
      label: 'Agreements signed',
      value: signedAgreementsCount,
      sub: `${expiringAgreementsCount} expiring soon`,
    },
    {
      key: 'FOLLOWUPS',
      label: 'Follow-ups pending',
      value: pendingFollowUps.length,
      sub: `${overdueFollowUpsCount} overdue`,
      redSub: overdueFollowUpsCount > 0,
    },
  ];

  // Next 4 pending follow-ups for dashboard (oldest first)
  const attentionFollowUps = useMemo(() => {
    return [...pendingFollowUps]
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
      .slice(0, 4);
  }, [pendingFollowUps]);

  const sectionData = useMemo((): { title: string; items: RecordCardItem[] } => {
    const q = search.trim().toLowerCase();
    const matches = (...vals: (string | undefined)[]) =>
      !q || vals.some((v) => String(v || '').toLowerCase().includes(q));

    if (activeView === 'COLLEGES') {
      return {
        title: 'Colleges',
        items: mockColleges
          .filter((c) => matches(c.name, c.location, c.tpoName, c.type))
          .map((c) => ({
            id: c.id,
            top: c.location,
            title: c.name,
            status: c.type,
            details: [
              ['City', c.location],
              ['Contact', c.tpoName],
              ['Type', c.type],
              ['Phone', c.tpoContact],
              ['Affiliation', c.affiliation],
            ],
          })),
      };
    }

    if (activeView === 'VISITS') {
      return {
        title: 'College visits',
        items: mockCollegeVisits
          .filter((v) => matches(v.collegeName, v.assignedEmployee, v.outcome, v.tpoName))
          .map((v) => ({
            id: v.id,
            top: formatDateShort(v.visitDate),
            title: v.collegeName,
            status: v.outcome,
            details: [
              ['Date', formatDateShort(v.visitDate)],
              ['Visited by', v.assignedEmployee],
              ['Outcome', v.outcome],
              ['Who they met', v.tpoName],
              ['Notes', v.discussionNotes],
              ['Next step', v.requirements || `Follow up on ${formatDateShort(v.followUpDate)}`],
            ],
          })),
      };
    }

    if (activeView === 'FDP') {
      return {
        title: 'FDP sessions',
        items: mockFDPSessions
          .filter((f) => matches(f.sessionTitle, f.collegeName, f.status, f.assignedEmployee))
          .map((f) => ({
            id: f.id,
            top: f.collegeName,
            title: f.sessionTitle,
            status: f.status,
            details: [
              ['College', f.collegeName],
              ['Date', formatDateShort(f.actualDate || f.proposedDate)],
              ['Status', f.status],
              ['Faculty expected', `${f.expectedParticipants} faculty`],
              ['Coordinator', f.assignedEmployee],
              ['Details', f.meetingDetails || f.proposedOffering],
            ],
          })),
      };
    }

    if (activeView === 'TIEUPS') {
      return {
        title: 'Tie-ups',
        items: mockTieups
          .filter((t) => matches(t.collegeName, t.partnershipType, t.assignedEmployee, t.status))
          .map((t) => ({
            id: t.id,
            top: t.partnershipType,
            title: t.collegeName,
            status: t.status,
            details: [
              ['College', t.collegeName],
              ['Type', t.partnershipType],
              ['Owner', t.assignedEmployee],
              ['Status', t.status],
              ['Validity', t.validityStartDate && t.expiryDate ? `${t.validityStartDate} to ${t.expiryDate}` : 'In discussion'],
              ['Scope', t.scopeOfCollaboration],
              ['Next step', t.notes],
            ],
          })),
      };
    }

    if (activeView === 'CRM') {
      return {
        title: 'Interested clients',
        items: mockInterestedClients
          .filter((c) => matches(c.clientName, c.stage, c.contactPerson, c.location))
          .map((c) => ({
            id: c.id,
            top: c.interestedServices.join(', '),
            title: c.clientName,
            status: c.stage,
            details: [
              ['Organization', `${c.clientName} (${c.location})`],
              ['Stage', c.stage],
              ['Phone', c.phone],
              ['Interested in', c.interestedServices.join(', ')],
              ['Next follow-up', formatDateShort(c.nextFollowUpDate)],
              ['Notes', c.requirementDetails],
            ],
          })),
      };
    }

    if (activeView === 'AGREEMENTS') {
      return {
        title: 'Agreements',
        items: mockAgreements
          .filter((a) => matches(a.title, a.collegeName, a.status, a.referenceNumber))
          .map((a) => ({
            id: a.id,
            top: a.collegeName,
            title: a.title,
            status: a.status,
            details: [
              ['College', a.collegeName],
              ['Signed on', formatDateShort(a.signingDate)],
              ['Valid until', formatDateShort(a.expiryDate)],
              ['Document', a.uploadedDoc || a.referenceNumber],
              ['Notes', a.description],
            ],
          })),
      };
    }

    // FOLLOWUPS
    return {
      title: 'Follow-ups',
      items: [...followUps]
        .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
        .filter((f) => matches(f.title, f.relatedCollege, f.assignedEmployee, f.status))
        .map((f) => {
          const isDone = f.status === 'Completed';
          const badgeLabel = isDone ? 'Done' : f.status;
          return {
            id: f.id,
            top: `${f.relatedCollege} · ${f.status === 'Overdue' ? 'Overdue' : `Due ${formatDateShort(f.followUpDate)}`}`,
            title: f.title,
            status: badgeLabel,
            canMarkDone: !isDone,
            details: [
              ['College', f.relatedCollege],
              ['Due date', f.status === 'Overdue' ? `Overdue (${formatDateShort(f.followUpDate)})` : formatDateShort(f.followUpDate)],
              ['Owner', f.assignedEmployee],
              ['Status', badgeLabel],
              ['Notes', f.notes],
            ],
          };
        }),
    };
  }, [activeView, search, followUps]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Management"
        subtitle="College visits, FDP sessions, tie-ups, clients, agreements and follow-ups in one place."
        icon={TrendingUp}
        badge="Sales CRM"
      />

      {/* Seven Summary Boxes — shown identically on every page */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3" role="navigation" aria-label="Sales summary navigation">
        {summaryBoxes.map((box) => {
          const isActive = activeView === box.key;
          return (
            <button
              key={box.key}
              type="button"
              onClick={() => {
                setActiveView(box.key);
                setSearch('');
              }}
              aria-pressed={isActive}
              className={`text-left p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${STRIPE_COLORS[box.key]} shadow-sm cursor-pointer select-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2 ${
                isActive ? ACTIVE_OUTLINE[box.key] : ''
              }`}
            >
              <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                {box.label}
              </span>
              <span className="block text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {box.value}
              </span>
              <span
                className={`block text-[11px] mt-0.5 ${
                  box.redSub
                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {box.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* DASHBOARD VIEW */}
      {activeView === 'DASHBOARD' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Needs your attention</h2>

          {attentionFollowUps.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500">
              All caught up. No pending follow-ups.
            </div>
          ) : (
            <div className="space-y-3">
              {attentionFollowUps.map((f) => {
                const overdue = f.status === 'Overdue';
                return (
                  <div
                    key={f.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-600 shadow-sm flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">{f.relatedCollege}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{f.title}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}>
                          {overdue ? 'Overdue' : `Due ${formatDateShort(f.followUpDate)}`}
                        </span>
                        <span>Owner: {f.assignedEmployee}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => markFollowUpDone(f.id)}
                      className="min-h-[40px] px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                    >
                      Mark done
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => {
                setActiveView('FOLLOWUPS');
                setSearch('');
              }}
              className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-sm font-semibold text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
            >
              See all follow-ups
            </button>
          </div>
        </div>
      )}

      {/* SECTION LIST VIEW */}
      {activeView !== 'DASHBOARD' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveView('DASHBOARD');
                  setSearch('');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to dashboard
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{sectionData.title}</h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                aria-label="Search records"
                className="w-full min-h-[44px] pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
            </div>
          </div>

          {sectionData.items.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-sm text-slate-500">
              No records match your search.
            </div>
          ) : (
            <div className="space-y-3">
              {sectionData.items.map((item) => {
                const isOpen = Boolean(openIds[item.id]);
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${STRIPE_COLORS[activeView]} shadow-sm overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleOpen(item.id)}
                      aria-expanded={isOpen}
                      className="w-full min-h-[64px] p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-600"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.top}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                          {item.details.map(([label, value]) => (
                            <div key={label}>
                              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                {label}
                              </span>
                              <span className="text-slate-800 dark:text-slate-200">{value}</span>
                            </div>
                          ))}
                        </div>
                        {item.canMarkDone && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => markFollowUpDone(item.id)}
                              className="min-h-[40px] px-4 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                            >
                              Mark done
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
