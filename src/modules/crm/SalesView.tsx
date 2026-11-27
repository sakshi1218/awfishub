'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  LayoutGrid,
  Building2,
  MapPin,
  GraduationCap,
  Link2,
  Users,
  FileCheck2,
  Clock,
  ChevronDown,
} from 'lucide-react';
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

type ViewKey = 'home' | 'colleges' | 'visits' | 'fdp' | 'ties' | 'clients' | 'agree' | 'follow';

const SECTIONS: {
  key: Exclude<ViewKey, 'home'>;
  label: string;
  desc: string;
  icon: React.ElementType;
  tintBg: string;
  tintText: string;
  hoverBorder: string;
}[] = [
  {
    key: 'colleges',
    label: 'Colleges',
    desc: 'Colleges we work with',
    icon: Building2,
    tintBg: 'bg-[#6d3fe0]/15 dark:bg-[#a98bff]/15',
    tintText: 'text-[#6d3fe0] dark:text-[#a98bff]',
    hoverBorder: 'hover:border-[#6d3fe0] dark:hover:border-[#a98bff]',
  },
  {
    key: 'visits',
    label: 'Visits',
    desc: 'Times we visited a college',
    icon: MapPin,
    tintBg: 'bg-[#c026d3]/15 dark:bg-[#e879f9]/15',
    tintText: 'text-[#c026d3] dark:text-[#e879f9]',
    hoverBorder: 'hover:border-[#c026d3] dark:hover:border-[#e879f9]',
  },
  {
    key: 'fdp',
    label: 'FDP sessions',
    desc: 'Training sessions for faculty',
    icon: GraduationCap,
    tintBg: 'bg-[#2f6fed]/15 dark:bg-[#7aa5ff]/15',
    tintText: 'text-[#2f6fed] dark:text-[#7aa5ff]',
    hoverBorder: 'hover:border-[#2f6fed] dark:hover:border-[#7aa5ff]',
  },
  {
    key: 'ties',
    label: 'Tie-ups',
    desc: 'Partnerships with colleges',
    icon: Link2,
    tintBg: 'bg-[#0f8f55]/15 dark:bg-[#47cd89]/15',
    tintText: 'text-[#0f8f55] dark:text-[#47cd89]',
    hoverBorder: 'hover:border-[#0f8f55] dark:hover:border-[#47cd89]',
  },
  {
    key: 'clients',
    label: 'Clients',
    desc: 'People who want to know more',
    icon: Users,
    tintBg: 'bg-[#c27803]/15 dark:bg-[#fdb022]/15',
    tintText: 'text-[#c27803] dark:text-[#fdb022]',
    hoverBorder: 'hover:border-[#c27803] dark:hover:border-[#fdb022]',
  },
  {
    key: 'agree',
    label: 'Agreements',
    desc: 'Signed MoUs and end dates',
    icon: FileCheck2,
    tintBg: 'bg-[#4f46e5]/15 dark:bg-[#a5a0ff]/15',
    tintText: 'text-[#4f46e5] dark:text-[#a5a0ff]',
    hoverBorder: 'hover:border-[#4f46e5] dark:hover:border-[#a5a0ff]',
  },
  {
    key: 'follow',
    label: 'Follow-ups',
    desc: 'Tasks to do next',
    icon: Clock,
    tintBg: 'bg-[#d9382b]/15 dark:bg-[#ff8a80]/15',
    tintText: 'text-[#d9382b] dark:text-[#ff8a80]',
    hoverBorder: 'hover:border-[#d9382b] dark:hover:border-[#ff8a80]',
  },
];

function getPillClass(status: string): string {
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
    return 'bg-[#dcfae6] text-[#067647] dark:bg-[#0b3a27] dark:text-[#47cd89]';
  }
  if (
    s === 'overdue' ||
    s === 'expired' ||
    s === 'terminated' ||
    s === 'rejected' ||
    s === 'lost' ||
    s === 'not interested'
  ) {
    return 'bg-[#fee4e2] text-[#d92d20] dark:bg-[#4a1d1a] dark:text-[#ff8a80]';
  }
  if (
    s === 'pitched' ||
    s === 'negotiating' ||
    s === 'under negotiation' ||
    s === 'negotiation' ||
    s === 'meeting set' ||
    s === 'meeting scheduled' ||
    s === 'pitch requested' ||
    s === 'proposal requested' ||
    s === 'tie-up in discussion' ||
    s === 'discussion ongoing'
  ) {
    return 'bg-[#d1e9ff] text-[#175cd3] dark:bg-[#15304f] dark:text-[#84caff]';
  }
  return 'bg-[#fef0c7] text-[#b54708] dark:bg-[#47310b] dark:text-[#fdb022]';
}

function formatDateShort(dateStr?: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface CardRecord {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  canMarkDone?: boolean;
  details: [string, string][];
}

export function SalesView({ defaultTab = 'DASHBOARD' }: { defaultTab?: SalesTabType }) {
  const mapInitialView = (t: SalesTabType): ViewKey => {
    if (t === 'COLLEGES') return 'colleges';
    if (t === 'VISITS') return 'visits';
    if (t === 'FDP') return 'fdp';
    if (t === 'TIEUPS') return 'ties';
    if (t === 'CRM') return 'clients';
    if (t === 'AGREEMENTS') return 'agree';
    if (t === 'FOLLOWUPS') return 'follow';
    return 'home';
  };

  const [view, setView] = useState<ViewKey>(() => mapInitialView(defaultTab));
  const [query, setQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [followUps, setFollowUps] = useState<FollowUp[]>(mockSalesFollowUps);

  const today = '2026-11-26';

  const isFollowUpOverdue = (f: FollowUp) =>
    f.status !== 'Completed' && (f.status === 'Overdue' || f.followUpDate < today);

  const pendingFollowUps = useMemo(
    () => followUps.filter((f) => f.status !== 'Completed'),
    [followUps]
  );

  const overdueCount = useMemo(
    () => pendingFollowUps.filter((f) => isFollowUpOverdue(f)).length,
    [pendingFollowUps]
  );

  const nextThreeFollowUps = useMemo(() => {
    return [...pendingFollowUps]
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))
      .slice(0, 3);
  }, [pendingFollowUps]);

  const markDone = (id: string) => {
    setFollowUps((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'Completed' } : f))
    );
  };

  const toggleCard = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getCount = (key: Exclude<ViewKey, 'home'>): number => {
    if (key === 'colleges') return mockColleges.length;
    if (key === 'visits') return mockCollegeVisits.length;
    if (key === 'fdp') return mockFDPSessions.length;
    if (key === 'ties') return mockTieups.length;
    if (key === 'clients') return mockInterestedClients.length;
    if (key === 'agree') return mockAgreements.length;
    return pendingFollowUps.length;
  };

  const activeSectionMeta = SECTIONS.find((s) => s.key === view);

  const sectionRecords = useMemo((): CardRecord[] => {
    const q = query.trim().toLowerCase();
    const match = (...vals: (string | undefined)[]) =>
      !q || vals.some((v) => String(v || '').toLowerCase().includes(q));

    if (view === 'colleges') {
      return mockColleges
        .filter((c) => match(c.name, c.location, c.tpoName, c.type))
        .map((c) => ({
          id: c.id,
          title: c.name,
          subtitle: c.location,
          status: c.type,
          details: [
            ['City', c.location],
            ['Contact', c.tpoName],
            ['Stage', c.type],
            ['Phone', c.tpoContact],
            ['Notes', `${c.affiliation}${c.principalName ? ` · Principal: ${c.principalName}` : ''}`],
          ],
        }));
    }

    if (view === 'visits') {
      return mockCollegeVisits
        .filter((v) => match(v.collegeName, v.assignedEmployee, v.outcome, v.tpoName))
        .map((v) => ({
          id: v.id,
          title: v.collegeName,
          subtitle: formatDateShort(v.visitDate),
          status: v.outcome,
          details: [
            ['Date', formatDateShort(v.visitDate)],
            ['Visited by', v.assignedEmployee],
            ['Outcome', v.outcome],
            ['Met with', v.tpoName],
            ['Notes', v.discussionNotes],
            ['Next step', v.requirements || `Follow up on ${formatDateShort(v.followUpDate)}`],
          ],
        }));
    }

    if (view === 'fdp') {
      return mockFDPSessions
        .filter((f) => match(f.sessionTitle, f.collegeName, f.status, f.assignedEmployee))
        .map((f) => ({
          id: f.id,
          title: f.collegeName,
          subtitle: f.sessionTitle,
          status: f.status,
          details: [
            ['Topic', f.sessionTitle],
            ['Date', formatDateShort(f.actualDate || f.proposedDate)],
            ['Status', f.status],
            ['Faculty expected', String(f.expectedParticipants)],
            ['Coordinator', f.assignedEmployee],
            ['Venue', f.meetingDetails || 'College seminar hall'],
          ],
        }));
    }

    if (view === 'ties') {
      return mockTieups
        .filter((t) => match(t.collegeName, t.partnershipType, t.assignedEmployee, t.status))
        .map((t) => ({
          id: t.id,
          title: t.collegeName,
          subtitle: t.partnershipType,
          status: t.status,
          details: [
            ['Type', t.partnershipType],
            ['Owner', t.assignedEmployee],
            ['Status', t.status],
            ['Duration', t.validityStartDate && t.expiryDate ? `${t.validityStartDate} to ${t.expiryDate}` : '1 year'],
            ['Students covered', t.scopeOfCollaboration],
            ['Next step', t.notes],
          ],
        }));
    }

    if (view === 'clients') {
      return mockInterestedClients
        .filter((c) => match(c.contactPerson, c.clientName, c.stage, c.interestedServices.join(' ')))
        .map((c) => ({
          id: c.id,
          title: c.contactPerson,
          subtitle: c.clientName,
          status: c.stage,
          details: [
            ['College', c.clientName],
            ['Stage', c.stage],
            ['Phone', c.phone],
            ['Interested in', c.interestedServices.join(', ')],
            ['Last contact', formatDateShort(c.dateAdded)],
          ],
        }));
    }

    if (view === 'agree') {
      return mockAgreements
        .filter((a) => match(a.collegeName, a.title, a.status, a.uploadedDoc))
        .map((a) => ({
          id: a.id,
          title: a.collegeName,
          subtitle: formatDateShort(a.signingDate),
          status: a.status,
          details: [
            ['Signed on', formatDateShort(a.signingDate)],
            ['Valid until', formatDateShort(a.expiryDate)],
            ['Document', a.uploadedDoc || a.referenceNumber],
            ['Renewal reminder', a.notes || 'Reminder 60 days before expiry'],
          ],
        }));
    }

    // follow-ups
    return [...followUps]
      .sort((a, b) => {
        const aDone = a.status === 'Completed' ? 1 : 0;
        const bDone = b.status === 'Completed' ? 1 : 0;
        return aDone - bDone || a.followUpDate.localeCompare(b.followUpDate);
      })
      .filter((f) => match(f.title, f.relatedCollege, f.assignedEmployee, f.status))
      .map((f) => {
        const isDone = f.status === 'Completed';
        const overdue = isFollowUpOverdue(f);
        const statusLabel = isDone ? 'Done' : overdue ? 'Overdue' : 'Pending';
        return {
          id: f.id,
          title: f.title,
          subtitle: f.relatedCollege,
          status: statusLabel,
          canMarkDone: !isDone,
          details: [
            ['Task', f.title],
            ['College', f.relatedCollege],
            ['Due date', formatDateShort(f.followUpDate)],
            ['Owner', f.assignedEmployee],
            ['Status', statusLabel],
            ['Notes', f.notes],
          ],
        };
      });
  }, [view, query, followUps]);

  const navigateTo = (nextView: ViewKey) => {
    setView(nextView);
    setQuery('');
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-[#e4e7ec] dark:border-[#2a3040] bg-[#f6f7fb] dark:bg-[#0f1218]">
      {/* Horizontal Top Bar */}
      <header className="bg-white dark:bg-[#181c25] border-b border-[#e4e7ec] dark:border-[#2a3040] px-5 py-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5b3df5] text-white grid place-items-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <b className="block text-base font-bold text-[#101828] dark:text-[#eef0f5]">Sales Management</b>
              <small className="text-xs text-[#667085] dark:text-[#98a2b3]">Colleges and clients</small>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-1.5" aria-label="Sections">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            aria-current={view === 'home' ? 'page' : undefined}
            className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b3df5] ${
              view === 'home'
                ? 'bg-[#efecff] text-[#5b3df5] dark:bg-[#26224a] dark:text-[#a99bff]'
                : 'text-[#667085] dark:text-[#98a2b3] hover:bg-[#f6f7fb] dark:hover:bg-[#0f1218] hover:text-[#101828] dark:hover:text-[#eef0f5]'
            }`}
          >
            <LayoutGrid className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isCurrent = view === s.key;
            const countVal = getCount(s.key);
            const showLateBadge = s.key === 'follow' && overdueCount > 0;

            return (
              <button
                key={s.key}
                type="button"
                onClick={() => navigateTo(s.key)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b3df5] ${
                  isCurrent
                    ? 'bg-[#efecff] text-[#5b3df5] dark:bg-[#26224a] dark:text-[#a99bff]'
                    : 'text-[#667085] dark:text-[#98a2b3] hover:bg-[#f6f7fb] dark:hover:bg-[#0f1218] hover:text-[#101828] dark:hover:text-[#eef0f5]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{s.label}</span>
                <span
                  className={`text-xs font-semibold shrink-0 ${
                    showLateBadge
                      ? 'bg-[#fee4e2] text-[#d92d20] dark:bg-[#4a1d1a] dark:text-[#ff8a80] rounded-full px-2 py-0.5'
                      : 'opacity-80'
                  }`}
                >
                  {showLateBadge ? `${overdueCount} overdue` : countVal}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main Content */}
      <main className="p-5 sm:p-7 w-full">
        {/* OVERVIEW PAGE */}
        {view === 'home' && (
          <div>
            <header>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#101828] dark:text-[#eef0f5]">
                Overview
              </h1>
              <p className="text-sm text-[#667085] dark:text-[#98a2b3] mt-1">
                A quick look at your sales work. Start with the purple card.
              </p>
            </header>

            {/* Purple Start Here Card */}
            <section className="mt-5 flex flex-wrap items-center justify-between gap-4 p-6 rounded-[18px] bg-gradient-to-br from-[#5b3df5] to-[#8a5cf6] text-white">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">Start here</span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  {pendingFollowUps.length
                    ? `You have ${pendingFollowUps.length} follow-up${pendingFollowUps.length === 1 ? '' : 's'} to do`
                    : 'You’re all caught up'}
                </h2>
                <p className="text-sm opacity-90 mt-1">
                  {overdueCount
                    ? `${overdueCount === 1 ? '1 is' : `${overdueCount} are`} overdue. Do ${overdueCount === 1 ? 'that one' : 'those'} first.`
                    : 'Nothing is overdue.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('follow')}
                className="min-h-[44px] px-5 rounded-xl bg-white text-[#4a2fd6] font-semibold text-sm hover:bg-purple-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Open follow-ups
              </button>
            </section>

            {/* Next Up (3 most urgent pending follow-ups) */}
            <h3 className="text-base font-bold text-[#101828] dark:text-[#eef0f5] mt-7 mb-3">Next up</h3>
            <div className="grid gap-2.5">
              {nextThreeFollowUps.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-white dark:bg-[#181c25] border border-[#e4e7ec] dark:border-[#2a3040] text-sm text-[#667085] dark:text-[#98a2b3]">
                  Nothing waiting. Nice work.
                </div>
              ) : (
                nextThreeFollowUps.map((f) => {
                  const late = isFollowUpOverdue(f);
                  return (
                    <div
                      key={f.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#181c25] border border-[#e4e7ec] dark:border-[#2a3040] shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#101828] dark:text-[#eef0f5]">{f.title}</p>
                        <p className="text-xs text-[#667085] dark:text-[#98a2b3] mt-0.5">
                          {f.relatedCollege} · {f.assignedEmployee}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-xs ${
                            late
                              ? 'text-[#d92d20] dark:text-[#ff8a80] font-semibold'
                              : 'text-[#667085] dark:text-[#98a2b3]'
                          }`}
                        >
                          {late ? 'Overdue · ' : 'Due '}
                          {formatDateShort(f.followUpDate)}
                        </span>
                        <button
                          type="button"
                          onClick={() => markDone(f.id)}
                          className="min-h-[38px] px-3.5 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181c25] hover:border-[#5b3df5] hover:text-[#5b3df5] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b3df5]"
                        >
                          Mark done
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Browse by Topic (6 clickable tiles) */}
            <h3 className="text-base font-bold text-[#101828] dark:text-[#eef0f5] mt-7 mb-3">Browse by topic</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SECTIONS.filter((s) => s.key !== 'follow').map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => navigateTo(s.key)}
                    className={`text-left p-4.5 p-5 rounded-2xl bg-white dark:bg-[#181c25] border border-[#e4e7ec] dark:border-[#2a3040] ${s.hoverBorder} shadow-sm hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b3df5]`}
                  >
                    <span className={`w-10 h-10 rounded-xl grid place-items-center ${s.tintBg} ${s.tintText}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <strong className="block text-[30px] leading-tight font-bold text-[#101828] dark:text-[#eef0f5] mt-3.5 mb-0.5">
                      {getCount(s.key)}
                    </strong>
                    <b className="block text-sm font-bold text-[#101828] dark:text-[#eef0f5]">{s.label}</b>
                    <small className="block text-xs text-[#667085] dark:text-[#98a2b3] mt-0.5">{s.desc}</small>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION PAGES (all 7 share identical structure) */}
        {view !== 'home' && activeSectionMeta && (
          <div>
            <header className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#101828] dark:text-[#eef0f5]">
                  {activeSectionMeta.label}
                </h1>
                <p className="text-sm text-[#667085] dark:text-[#98a2b3] mt-1">
                  {activeSectionMeta.desc}. Click a card to see its details.
                </p>
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${activeSectionMeta.label.toLowerCase()}`}
                aria-label="Search"
                className="w-full sm:w-64 min-h-[42px] px-3.5 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181c25] text-sm focus:outline-none focus:ring-2 focus:ring-[#5b3df5]"
              />
            </header>

            {sectionRecords.length === 0 ? (
              <div className="p-7 text-center rounded-2xl bg-white dark:bg-[#181c25] border border-[#e4e7ec] dark:border-[#2a3040] text-sm text-[#667085] dark:text-[#98a2b3]">
                Nothing matches your search.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
                {sectionRecords.map((item) => {
                  const Icon = activeSectionMeta.icon;
                  const isOpen = Boolean(openIds[item.id]);
                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl bg-white dark:bg-[#181c25] border border-[#e4e7ec] dark:border-[#2a3040] ${activeSectionMeta.hoverBorder} shadow-sm overflow-hidden`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleCard(item.id)}
                        aria-expanded={isOpen}
                        className="w-full min-h-[64px] p-3.5 text-left flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5b3df5]"
                      >
                        <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${activeSectionMeta.tintBg} ${activeSectionMeta.tintText}`}>
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <b className="block text-sm font-bold text-[#101828] dark:text-[#eef0f5] leading-snug truncate">
                            {item.title}
                          </b>
                          <small className="block text-xs text-[#667085] dark:text-[#98a2b3] truncate">
                            {item.subtitle}
                          </small>
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${getPillClass(item.status)}`}>
                          {item.status}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#667085] dark:text-[#98a2b3] shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-3 border-t border-[#e4e7ec] dark:border-[#2a3040] text-xs">
                          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                            {item.details.map(([dt, dd]) => (
                              <React.Fragment key={dt}>
                                <dt className="text-[#667085] dark:text-[#98a2b3] font-medium">{dt}</dt>
                                <dd className="text-[#101828] dark:text-[#eef0f5] m-0">{dd}</dd>
                              </React.Fragment>
                            ))}
                          </dl>
                          {item.canMarkDone && (
                            <div className="mt-3.5">
                              <button
                                type="button"
                                onClick={() => markDone(item.id)}
                                className="min-h-[38px] px-3.5 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181c25] hover:border-[#5b3df5] hover:text-[#5b3df5] text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b3df5]"
                              >
                                Mark done
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
