'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Phone,
  PhoneCall,
  Search,
  Sparkles,
  Users,
  UserRoundCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import DashboardTabs from '@/components/shared/DashboardTabs';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  TELECALLER_DEMO_TODAY,
  demoTelecallerCallbacks,
  demoTelecallerCallActivity,
  demoTelecallerCompletionReports,
  demoTelecallerHandovers,
  demoTelecallerLeads,
  demoTelecallers,
  demoTelecallerTaskTransfers,
  demoTelecallerProgrammeCohort,
  telecallerProgrammes,
  type TeleCallerCallback,
  type TeleCallerCompletionReport,
  type TeleCallerHandover,
  type TeleCallerLead,
  type TeleCallerTaskTransfer,
} from '@/lib/telecaller-demo-data';
import { demoCounselors } from '@/lib/counselor-demo-data';

type DateRange = 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'All time';
type DrawerSelection =
  | { type: 'lead'; id: string }
  | { type: 'handover'; id: string }
  | { type: 'transfer'; id: string }
  | { type: 'report'; id: string }
  | null;
type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  priority: 'High' | 'Medium';
  type: 'lead' | 'handover' | 'transfer' | 'report';
  recordId: string;
};

const qualificationStatuses = [
  'New',
  'Not Contacted',
  'Contacted',
  'Interested',
  'Not Interested',
  'Callback Required',
  'Qualified',
  'Unreachable',
  'Invalid Number',
] as const;
const chartColors = ['#7c3aed', '#2563eb', '#0d9488', '#f59e0b', '#e11d48', '#64748b'];
const dashboardTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'leads', label: 'Lead Qualification' },
  { id: 'handovers', label: 'Counselor Handover' },
  { id: 'callbacks', label: 'Follow-ups' },
  { id: 'analytics', label: 'Programme Analytics' },
  { id: 'tasks', label: 'Tasks & Reports' },
  { id: 'attention', label: 'Attention Required' },
] as const;

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function callerName(id: string) {
  return demoTelecallers.find((caller) => caller.id === id)?.name ?? 'Unassigned';
}

function counselorName(id?: string) {
  return demoCounselors.find((counselor) => counselor.id === id)?.name ?? 'Awaiting assignment';
}

function leadFor(id: string) {
  return demoTelecallerLeads.find((lead) => lead.id === id);
}

function statusTone(value: string) {
  if (['Accepted', 'Completed', 'Qualified', 'Interested', 'Available', 'Reviewed'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  if (['Pending', 'Pending Acceptance', 'Awaiting Response', 'Callback Required', 'On call', 'Returned for Clarification'].includes(value)) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  }
  if (['High', 'Rejected', 'Unreachable', 'Invalid Number', 'Offline', 'Not Interested'].includes(value)) {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
  }
  return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone ?? statusTone(String(children))}`}>
      {children}
    </span>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border border-[#ece9f4] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:px-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  href,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
  href?: string;
  onClick?: () => void;
}) {
  const toneClass = {
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  }[tone];
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase leading-4 tracking-[0.12em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{detail}</p>
    </>
  );
  const className = "group min-w-0 rounded-2xl border border-[#ece9f4] bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-900 sm:p-4";

  if (onClick) return <button type="button" onClick={onClick} className={className}>{content}</button>;
  return <a href={href} className={className}>{content}</a>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-xs text-slate-500">{children}</p>;
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1 break-words text-[11px] font-medium text-slate-800 dark:text-slate-200">{value}</div>
    </div>
  );
}

function CallbackRow({ callback, onOpen }: { callback: TeleCallerCallback; onOpen: (leadId: string) => void }) {
  const lead = leadFor(callback.leadId);
  const overdue = callback.status === 'Pending' && callback.dueDate < TELECALLER_DEMO_TODAY;
  return (
    <tr className="border-t border-slate-100 text-[10px] dark:border-slate-800">
      <td className="px-4 py-3"><button type="button" aria-label={`Open ${callback.leadId} callback details`} onClick={() => onOpen(callback.leadId)} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">{callback.leadId}</button></td>
      <td className="px-4 py-3">{lead?.studentName ?? 'Unknown demo lead'}</td>
      <td className="px-4 py-3">{callerName(callback.telecallerId)}</td>
      <td className="px-4 py-3">{formatDate(callback.dueDate)}</td>
      <td className="px-4 py-3"><Badge>{callback.status}</Badge>{overdue && <p className="mt-1 font-semibold text-rose-600">Overdue</p>}</td>
      <td className="px-4 py-3">{callback.note}</td>
    </tr>
  );
}

export default function TeleCallerDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('Last 90 days');
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
  const [programmeFilter, setProgrammeFilter] = useState('All programmes');
  const [callerFilter, setCallerFilter] = useState('All TeleCallers');
  const [leadSearch, setLeadSearch] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('All statuses');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [sortBy, setSortBy] = useState('Newest assignment');
  const [drawer, setDrawer] = useState<DrawerSelection>(null);

  const selectedDays = dateRange === 'Last 7 days' ? 7 : dateRange === 'Last 30 days' ? 30 : 90;
  const rangeStart = dateRange === 'All time' ? undefined : addDays(TELECALLER_DEMO_TODAY, -(selectedDays - 1));
  const inRange = (date: string) => !rangeStart || date >= rangeStart;

  const filteredActivity = demoTelecallerCallActivity.filter((item) =>
      inRange(item.date) &&
      (callerFilter === 'All TeleCallers' || item.telecallerId === callerFilter) &&
      (programmeFilter === 'All programmes' || item.programme === programmeFilter)
  );
  const totals = filteredActivity.reduce(
    (result, item) => ({
      calls: result.calls + item.calls,
      connected: result.connected + item.connected,
      interested: result.interested + item.interested,
      qualified: result.qualified + item.qualified,
      handovers: result.handovers + item.handovers,
      accepted: result.accepted + item.acceptedHandovers,
      counsellingStarted: result.counsellingStarted + item.counsellingStarted,
      returned: result.returned + item.returnedHandovers,
      unreachable: result.unreachable + item.unreachable,
      callbacks: result.callbacks + item.pendingCallbacks,
      talkSeconds: result.talkSeconds + item.talkSeconds,
    }),
    { calls: 0, connected: 0, interested: 0, qualified: 0, handovers: 0, accepted: 0, counsellingStarted: 0, returned: 0, unreachable: 0, callbacks: 0, talkSeconds: 0 }
  );

  const filteredLeads = demoTelecallerLeads.filter((lead) =>
    inRange(lead.assignedDate) &&
    (programmeFilter === 'All programmes' || lead.programme === programmeFilter) &&
    (callerFilter === 'All TeleCallers' || lead.telecallerId === callerFilter)
  );
  const visibleLeads = filteredLeads
    .filter((lead) => qualificationFilter === 'All statuses' || lead.qualificationStatus === qualificationFilter)
    .filter((lead) => priorityFilter === 'All priorities' || lead.priority === priorityFilter)
    .filter((lead) => {
      const query = leadSearch.trim().toLowerCase();
      return !query || [lead.id, lead.studentName, lead.programme, lead.source, callerName(lead.telecallerId)]
        .some((value) => value.toLowerCase().includes(query));
    })
    .sort((a, b) => sortBy === 'Highest priority'
      ? ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority)
      : sortBy === 'Callback soon'
        ? (a.nextCallbackDate ?? '9999-12-31').localeCompare(b.nextCallbackDate ?? '9999-12-31')
        : b.assignedDate.localeCompare(a.assignedDate));

  const filteredHandovers = demoTelecallerHandovers.filter((item) =>
    inRange(item.handoverDate) &&
    (programmeFilter === 'All programmes' || item.programme === programmeFilter) &&
    (callerFilter === 'All TeleCallers' || item.telecallerId === callerFilter)
  );
  const filteredCallbacks = demoTelecallerCallbacks.filter((item) => {
    const lead = leadFor(item.leadId);
    return inRange(item.dueDate) &&
      (callerFilter === 'All TeleCallers' || item.telecallerId === callerFilter) &&
      (programmeFilter === 'All programmes' || lead?.programme === programmeFilter);
  });
  const filteredTransfers = demoTelecallerTaskTransfers.filter((item) =>
    inRange(item.transferDate) &&
    (callerFilter === 'All TeleCallers' || item.originalTelecallerId === callerFilter || item.newTelecallerId === callerFilter)
  );
  const filteredReports = demoTelecallerCompletionReports.filter((item) =>
    inRange(item.completedAt) &&
    (callerFilter === 'All TeleCallers' || item.telecallerId === callerFilter)
  );

  const callerMetrics = demoTelecallers
    .filter((caller) => callerFilter === 'All TeleCallers' || caller.id === callerFilter)
    .map((caller) => {
      const activity = filteredActivity.filter((item) => item.telecallerId === caller.id);
      const calls = activity.reduce((sum, item) => sum + item.calls, 0);
      const connected = activity.reduce((sum, item) => sum + item.connected, 0);
      const interested = activity.reduce((sum, item) => sum + item.interested, 0);
      const qualified = activity.reduce((sum, item) => sum + item.qualified, 0);
      const talkSeconds = activity.reduce((sum, item) => sum + item.talkSeconds, 0);
      const pendingCallbacks = activity.reduce((sum, item) => sum + item.pendingCallbacks, 0);
      const cohortSize = demoTelecallerProgrammeCohort.reduce((sum, item) => sum + item.leads, 0);
      const programmeShare = programmeFilter === 'All programmes'
        ? 1
        : (demoTelecallerProgrammeCohort.find((item) => item.programme === programmeFilter)?.leads ?? 0) / cohortSize;
      const target = Math.round(caller.targetCalls * selectedDays / 90 * programmeShare);
      return {
        caller,
        calls,
        connected,
        interested,
        qualified,
        talkSeconds,
        pendingCallbacks,
        target,
        achievement: target ? Math.round((calls / target) * 100) : 0,
      };
    });

  const dailyTrend = filteredActivity.reduce<Record<string, { date: string; calls: number; connected: number }>>((result, item) => {
    const row = result[item.date] ?? { date: item.date, calls: 0, connected: 0 };
    row.calls += item.calls;
    row.connected += item.connected;
    result[item.date] = row;
    return result;
  }, {});
  const trendData = Object.values(dailyTrend).sort((a, b) => a.date.localeCompare(b.date));
  const uniqueContacted = filteredLeads.filter((lead) => lead.lastCallDate && inRange(lead.lastCallDate)).length;
  const averageDurationSeconds = totals.connected ? Math.round(totals.talkSeconds / totals.connected) : 0;
  const averageDuration = `${Math.floor(averageDurationSeconds / 60)}m ${averageDurationSeconds % 60}s`;
  const acceptanceRate = totals.handovers ? Math.round((totals.accepted / totals.handovers) * 100) : 0;
  const pendingAcceptance = Math.max(0, totals.handovers - totals.accepted - totals.returned);
  const callbacksToday = filteredCallbacks.filter((item) => item.status === 'Pending' && item.dueDate === TELECALLER_DEMO_TODAY);
  const upcomingCallbacks = filteredCallbacks.filter((item) => item.status === 'Pending' && item.dueDate > TELECALLER_DEMO_TODAY);
  const overdueCallbacks = filteredCallbacks.filter((item) => item.status === 'Pending' && item.dueDate < TELECALLER_DEMO_TODAY);
  const completedCallbacks = filteredCallbacks.filter((item) => item.status === 'Completed');
  const acceptedHandovers = filteredHandovers.filter((item) => item.status === 'Accepted');
  const returnedHandovers = filteredHandovers.filter((item) => item.status === 'Returned for Clarification' || item.status === 'Rejected');
  const qualifiedWithoutHandover = filteredLeads.filter((lead) =>
    lead.qualificationStatus === 'Qualified' &&
    !filteredHandovers.some((handover) => handover.leadId === lead.id)
  );
  const programmeCohort = demoTelecallerProgrammeCohort.filter(
    (item) => programmeFilter === 'All programmes' || item.programme === programmeFilter
  );
  const sourceDistribution = filteredLeads.reduce<Record<string, number>>((result, lead) => {
    result[lead.source] = (result[lead.source] ?? 0) + 1;
    return result;
  }, {});

  const attentionItems: AttentionItem[] = [
    ...filteredLeads
      .filter((lead) => lead.priority === 'High' && !lead.lastCallDate)
      .map((lead) => ({ id: `no-call-${lead.id}`, title: `High-priority lead not contacted · ${lead.id}`, detail: `${lead.studentName} · ${lead.programme} · ${callerName(lead.telecallerId)}`, priority: 'High' as const, type: 'lead' as const, recordId: lead.id })),
    ...overdueCallbacks.map((callback) => ({ id: callback.id, title: `Overdue callback · ${callback.leadId}`, detail: `${leadFor(callback.leadId)?.studentName ?? 'Demo lead'} · due ${formatDate(callback.dueDate)} · ${callerName(callback.telecallerId)}`, priority: callback.priority === 'High' ? 'High' as const : 'Medium' as const, type: 'lead' as const, recordId: callback.leadId })),
    ...qualifiedWithoutHandover.map((lead) => ({ id: `no-handover-${lead.id}`, title: `Qualified lead awaiting handover · ${lead.id}`, detail: `${lead.studentName} · ${lead.programme} · ${callerName(lead.telecallerId)}`, priority: 'High' as const, type: 'lead' as const, recordId: lead.id })),
    ...filteredHandovers.filter((item) => item.status === 'Pending Acceptance').map((item) => ({ id: item.id, title: `Counselor handover awaiting acceptance · ${item.leadId}`, detail: `${item.programme} · referred ${formatDate(item.handoverDate)}`, priority: 'High' as const, type: 'handover' as const, recordId: item.id })),
    ...filteredHandovers.filter((item) => item.status === 'Returned for Clarification').map((item) => ({ id: `returned-${item.id}`, title: `Handover returned for clarification · ${item.leadId}`, detail: item.counselorNote ?? item.callNotes, priority: 'Medium' as const, type: 'handover' as const, recordId: item.id })),
    ...filteredLeads.filter((lead) => lead.qualificationStatus === 'Invalid Number').map((lead) => ({ id: `invalid-${lead.id}`, title: `Invalid contact record · ${lead.id}`, detail: `${lead.studentName} · ${callerName(lead.telecallerId)} · verify before further calls`, priority: 'Medium' as const, type: 'lead' as const, recordId: lead.id })),
    ...callerMetrics.filter((item) => item.calls > 40 && item.connected / item.calls < 0.6).map((item) => ({ id: `connections-${item.caller.id}`, title: `High unsuccessful-call share · ${item.caller.name}`, detail: `${item.calls - item.connected} of ${item.calls} calls were not connected in the selected range.`, priority: 'Medium' as const, type: 'lead' as const, recordId: filteredLeads.find((lead) => lead.telecallerId === item.caller.id)?.id ?? '' })).filter((item) => item.recordId),
    ...callerMetrics.filter((item) => item.interested >= 10 && item.qualified / item.interested < 0.7).map((item) => ({ id: `qualification-${item.caller.id}`, title: `Lead qualification rate needs review · ${item.caller.name}`, detail: `${item.qualified} qualified from ${item.interested} interested sample outcomes.`, priority: 'Medium' as const, type: 'lead' as const, recordId: filteredLeads.find((lead) => lead.telecallerId === item.caller.id)?.id ?? '' })).filter((item) => item.recordId),
    ...callerMetrics.filter((item) => item.achievement > 125).map((item) => ({ id: `workload-${item.caller.id}`, title: `Calling target workload unusually high · ${item.caller.name}`, detail: `${item.achievement}% of illustrative target · ${item.calls} calls in selected range`, priority: 'Medium' as const, type: 'lead' as const, recordId: filteredLeads.find((lead) => lead.telecallerId === item.caller.id)?.id ?? '' })).filter((item) => item.recordId),
  ];

  const resetFilters = () => {
    setDateRange('Last 90 days');
    setProgrammeFilter('All programmes');
    setCallerFilter('All TeleCallers');
    setLeadSearch('');
    setQualificationFilter('All statuses');
    setPriorityFilter('All priorities');
    setSortBy('Newest assignment');
  };
  const openAttentionItem = (item: AttentionItem) => setDrawer({ type: item.type, id: item.recordId });

  return (
    <div className="-m-4 min-h-full min-w-0 space-y-6 bg-[#f8f7ff] p-4 sm:p-6 lg:-m-8 lg:p-8 dark:bg-slate-950">
      <header className="relative isolate overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5 shadow-sm dark:border-slate-800 dark:from-violet-950/50 dark:via-slate-900 dark:to-blue-950/30 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-violet-100/60 dark:border-violet-900/20" />
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-700 dark:border-violet-800 dark:bg-slate-900/80 dark:text-violet-300">
              <Phone className="h-3 w-3" /> Founder view · Illustrative demo data
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-violet-950 dark:text-white sm:text-3xl">TeleCaller Department Overview</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Review calling productivity, qualified lead generation and counselor handovers across the prospective-student journey.</p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">Frontend prototype only. All people, calls, leads and outcomes are illustrative sample records; no live telephony, AI or backend data is connected.</p>
          </div>
          <button type="button" onClick={resetFilters} className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/40">
            <History className="h-4 w-4" /> Reset filters
          </button>
        </div>
        <div className="mt-6 grid min-w-0 gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0 text-[10px] font-semibold text-slate-500">Date range
            <select aria-label="Date range" value={dateRange} onChange={(event) => setDateRange(event.target.value as DateRange)} className="mt-1.5 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>All time</option>
            </select>
          </label>
          <label className="min-w-0 text-[10px] font-semibold text-slate-500">Programme
            <select aria-label="Programme" value={programmeFilter} onChange={(event) => setProgrammeFilter(event.target.value)} className="mt-1.5 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option>All programmes</option>{telecallerProgrammes.map((programme) => <option key={programme}>{programme}</option>)}
            </select>
          </label>
          <label className="min-w-0 text-[10px] font-semibold text-slate-500">TeleCaller
            <select aria-label="TeleCaller" value={callerFilter} onChange={(event) => setCallerFilter(event.target.value)} className="mt-1.5 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="All TeleCallers">All TeleCallers</option>{demoTelecallers.map((caller) => <option key={caller.id} value={caller.id}>{caller.name}</option>)}
            </select>
          </label>
          <div className="flex items-end text-[10px] leading-4 text-slate-500">Current demo date: <strong className="ml-1 text-slate-700 dark:text-slate-200">{formatDate(TELECALLER_DEMO_TODAY)}</strong></div>
        </div>
      </header>

      <DashboardTabs id="telecaller-dashboard" ariaLabel="TeleCaller dashboard sections" tabs={dashboardTabs} value={activeDashboardTab} onChange={setActiveDashboardTab}>
      {activeDashboardTab === 'overview' && <>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8" id="department-summary">
        <MetricCard label="Active TeleCallers" value={demoTelecallers.filter((caller) => caller.active && (callerFilter === 'All TeleCallers' || caller.id === callerFilter)).length} detail="Currently active demo profiles" icon={Users} tone="violet" href="#calling-activity" />
        <MetricCard label="Total Calls" value={totals.calls.toLocaleString('en-IN')} detail="Call activity in selected range" icon={Phone} tone="blue" href="#calling-trends" />
        <MetricCard label="Successful Connections" value={totals.connected.toLocaleString('en-IN')} detail="Calls answered in the demo log" icon={PhoneCall} tone="emerald" href="#calling-trends" />
        <MetricCard label="Interested Leads" value={totals.interested.toLocaleString('en-IN')} detail="Illustrative positive call outcomes" icon={UserRoundCheck} tone="violet" onClick={() => setActiveDashboardTab('leads')} />
        <MetricCard label="Counselor Handover" value={totals.handovers.toLocaleString('en-IN')} detail="Qualified referrals in selected period" icon={ArrowRight} tone="blue" onClick={() => setActiveDashboardTab('handovers')} />
        <MetricCard label="Follow-ups Pending" value={totals.callbacks.toLocaleString('en-IN')} detail="Callbacks assigned in selected period" icon={CalendarDays} tone="amber" onClick={() => setActiveDashboardTab('callbacks')} />
        <MetricCard label="Unreachable Leads" value={totals.unreachable.toLocaleString('en-IN')} detail="Unsuccessful contact outcomes" icon={Phone} tone="rose" onClick={() => setActiveDashboardTab('leads')} />
        <MetricCard label="Handover Acceptance" value={`${acceptanceRate}%`} detail={`${totals.accepted} accepted of ${totals.handovers} referrals`} icon={BadgeCheck} tone="emerald" onClick={() => setActiveDashboardTab('handovers')} />
      </div>
      <Panel title="Calling activity" subtitle="Volume, connection outcomes, average duration and caller-level target progress." id="calling-activity">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Missed / Unanswered" value={Math.max(0, totals.calls - totals.connected)} detail="Calls not marked connected" icon={Phone} tone="rose" href="#calling-trends" />
          <MetricCard label="Average Call Duration" value={averageDuration} detail="Talk time per connected call" icon={Clock3} tone="blue" href="#calling-trends" />
          <MetricCard label="Unique Prospects Contacted" value={uniqueContacted} detail="Unique leads represented in the filtered demo list" icon={Users} tone="violet" onClick={() => setActiveDashboardTab('leads')} />
          <MetricCard label="Lead Qualification Rate" value={`${totals.interested ? Math.round((totals.qualified / totals.interested) * 100) : 0}%`} detail={`${totals.qualified} qualified of ${totals.interested} interested outcomes`} icon={CheckCircle2} tone="emerald" onClick={() => setActiveDashboardTab('leads')} />
        </div>
        <div className="grid min-w-0 gap-4 p-4 pt-0 xl:grid-cols-2">
          <div id="calling-trends" className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Daily calling trend</h3>
            <p className="mt-1 text-[10px] text-slate-500">Calls made versus successful connections for the selected period.</p>
            <div className="mt-3 h-[280px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 9 }} interval="preserveStartEnd" minTickGap={24} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                  <Tooltip labelFormatter={(value) => formatDate(String(value))} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="calls" name="Calls" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="connected" name="Connected" fill="#2563eb" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4"><h3 className="text-xs font-bold text-slate-900 dark:text-white">TeleCaller activity and workload</h3><p className="mt-1 text-[10px] text-slate-500">Target achievement is normalized to the selected date range.</p></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-[10px]">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">TeleCaller</th><th className="px-3 py-3">Calls</th><th className="px-3 py-3">Connected</th><th className="px-3 py-3">Interested</th><th className="px-3 py-3">Qualified</th><th className="px-3 py-3">Pending callbacks</th><th className="px-3 py-3">Avg. duration</th><th className="px-3 py-3">Working status</th><th className="px-3 py-3">Target</th></tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {callerMetrics.map((item) => {
                    const duration = item.connected ? Math.round(item.talkSeconds / item.connected) : 0;
                    return <tr key={item.caller.id}>
                      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{item.caller.name}</td>
                      <td className="px-3 py-3">{item.calls}</td><td className="px-3 py-3">{item.connected}</td><td className="px-3 py-3">{item.interested}</td><td className="px-3 py-3">{item.qualified}</td><td className="px-3 py-3">{item.pendingCallbacks}</td>
                      <td className="px-3 py-3">{Math.floor(duration / 60)}m {duration % 60}s</td>
                      <td className="px-3 py-3"><Badge>{item.caller.workingStatus}</Badge></td>
                      <td className="px-3 py-3"><span className="font-semibold">{item.achievement}%</span><span className="ml-1 text-slate-500">({item.calls}/{item.target})</span></td>
                    </tr>;
                  })}
                  {!callerMetrics.length && <tr><td colSpan={9}><EmptyState>No TeleCallers match the current filters.</EmptyState></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Panel>
      </>}

      {activeDashboardTab === 'leads' && <Panel title="Lead generation and qualification" subtitle="Lead quality and readiness matter more than raw call volume. Contact details and backgrounds below are masked illustrative records." id="lead-generation">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="New Leads Assigned" value={500} detail="Fixed illustrative cohort, independent of call-activity KPIs" icon={Users} tone="violet" href="#lead-pipeline" />
          <MetricCard label="Calls Attempted" value={420} detail="Attempted in the same illustrative cohort" icon={Phone} tone="blue" href="#lead-pipeline" />
          <MetricCard label="Successfully Connected" value={310} detail="Connected within the sample cohort" icon={PhoneCall} tone="emerald" href="#lead-pipeline" />
          <MetricCard label="Interested Prospects" value={186} detail="Positive interest in the sample cohort" icon={UserRoundCheck} tone="violet" href="#lead-pipeline" />
          <MetricCard label="Qualified Leads" value={150} detail="Qualification criteria met in the sample cohort" icon={CheckCircle2} tone="blue" href="#lead-pipeline" />
          <MetricCard label="Ready for Counselor" value={124} detail="Qualified and ready for referral in the sample cohort" icon={ArrowRight} tone="emerald" onClick={() => setActiveDashboardTab('handovers')} />
        </div>
        <div id="lead-pipeline" className="mx-4 mb-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:mx-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Illustrative lead funnel</h3>
          <p className="mt-1 text-[10px] text-slate-500">A common sample cohort, not necessarily the selected activity-period totals. Counts are intentionally separate from calling KPIs above.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
            {[
              ['New leads assigned', 500],
              ['Calls attempted', 420],
              ['Successfully connected', 310],
              ['Interested prospects', 186],
              ['Qualified leads', 150],
              ['Ready for Counselor', 124],
            ].map(([label, count], index) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
                <p className="text-[10px] text-slate-500">{index + 1}. {label}</p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{count}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600" style={{ width: `${(Number(count) / 500) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 p-4 pt-0 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Leads in filtered sample list" value={filteredLeads.length} detail="Assigned date, programme and caller filters applied" icon={Search} tone="violet" href="#lead-table" />
          <MetricCard label="Qualified in filtered sample list" value={filteredLeads.filter((lead) => lead.qualificationStatus === 'Qualified').length} detail="Sample lead records marked qualified" icon={BadgeCheck} tone="emerald" href="#lead-table" />
          <MetricCard label="Invalid contact records" value={filteredLeads.filter((lead) => lead.qualificationStatus === 'Invalid Number').length} detail="Verify before further calling" icon={Phone} tone="rose" href="#lead-table" />
        </div>
        <div id="lead-table" className="border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-3 p-4 sm:px-5">
            <div><h3 className="text-xs font-bold text-slate-900 dark:text-white">Lead qualification details</h3><p className="mt-1 text-[10px] text-slate-500">Search, filter or open a masked demo lead to see call history and qualification notes.</p></div>
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input aria-label="Search demo leads" value={leadSearch} onChange={(event) => setLeadSearch(event.target.value)} placeholder="Search enquiry ID, student, programme, source or TeleCaller" className="w-full min-w-0 rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-violet-950" />
            </label>
            <div className="grid min-w-0 gap-2 sm:grid-cols-3">
              <select aria-label="Filter leads by qualification status" value={qualificationFilter} onChange={(event) => setQualificationFilter(event.target.value)} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All statuses</option>{qualificationStatuses.map((status) => <option key={status}>{status}</option>)}</select>
              <select aria-label="Filter leads by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
              <label className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700"><ArrowDownWideNarrow className="h-4 w-4 shrink-0 text-slate-400" /><select aria-label="Sort demo leads" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full min-w-0 bg-transparent py-2.5 text-xs outline-none"><option>Newest assignment</option><option>Callback soon</option><option>Highest priority</option></select></label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Student / Enquiry ID</th><th className="px-4 py-3">Masked contact</th><th className="px-4 py-3">Programme / education</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">TeleCaller</th><th className="px-4 py-3">Interest</th><th className="px-4 py-3">Qualification status</th><th className="px-4 py-3">Last call</th><th className="px-4 py-3">Next callback</th><th className="px-4 py-3">Priority</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleLeads.map((lead) => <tr key={lead.id}>
                  <td className="px-4 py-3"><button type="button" aria-label={`Open ${lead.id} lead details`} onClick={() => setDrawer({ type: 'lead', id: lead.id })} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">{lead.id}<span className="mt-1 block font-normal text-slate-600 dark:text-slate-300">{lead.studentName}</span></button></td>
                  <td className="px-4 py-3">{lead.emailMasked}<span className="mt-1 block text-slate-500">{lead.phoneMasked}</span></td>
                  <td className="px-4 py-3">{lead.programme}<span className="mt-1 block text-slate-500">{lead.educationBackground}</span></td>
                  <td className="px-4 py-3">{lead.source}</td><td className="px-4 py-3">{callerName(lead.telecallerId)}</td><td className="px-4 py-3"><Badge>{lead.interestLevel}</Badge></td><td className="px-4 py-3"><Badge>{lead.qualificationStatus}</Badge></td><td className="px-4 py-3">{formatDate(lead.lastCallDate)}</td><td className="px-4 py-3">{formatDate(lead.nextCallbackDate)}</td><td className="px-4 py-3"><Badge>{lead.priority}</Badge></td>
                </tr>)}
                {!visibleLeads.length && <tr><td colSpan={10}><EmptyState>No leads match the selected filters.</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>}

      {activeDashboardTab === 'handovers' && <Panel title="Counselor handover" subtitle="Track qualified prospects across the department boundary and surface leads that have not yet been accepted." id="counselor-handover">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Qualified leads" value={totals.qualified} detail="Selected activity period" icon={CheckCircle2} tone="violet" onClick={() => setActiveDashboardTab('leads')} />
          <MetricCard label="Ready for handover" value={totals.handovers} detail="Qualified leads referred" icon={ArrowRight} tone="blue" href="#handover-table" />
          <MetricCard label="Accepted by Counselor" value={totals.accepted} detail={`${acceptanceRate}% of referrals in this activity period`} icon={BadgeCheck} tone="emerald" href="#handover-table" />
          <MetricCard label="Pending acceptance" value={pendingAcceptance} detail="Still between departments" icon={Clock3} tone="amber" href="#handover-table" />
          <MetricCard label="Returned / rejected" value={totals.returned} detail="Requires clarification or re-qualification" icon={History} tone="rose" href="#handover-table" />
        </div>
        <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-[10px] text-slate-500">Handover-to-counselling conversion</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{totals.accepted ? Math.round((totals.counsellingStarted / totals.accepted) * 100) : 0}%</p><p className="mt-1 text-[10px] text-slate-500">{totals.counsellingStarted} of {totals.accepted} accepted handovers progressed to counselling in the illustrative cohort.</p></div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-[10px] text-slate-500">Sample table handover outcomes</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{acceptedHandovers.length} accepted · {pendingAcceptance} pending aggregate</p><p className="mt-1 text-[10px] text-slate-500">{returnedHandovers.length} returned / rejected examples among {filteredHandovers.length} rows shown. Aggregate counts use the generated call-activity cohort.</p></div>
        </div>
        <div id="handover-table" className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          <table className="w-full min-w-[1150px] text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Prospect / enquiry</th><th className="px-4 py-3">Programme</th><th className="px-4 py-3">TeleCaller</th><th className="px-4 py-3">Counselor</th><th className="px-4 py-3">Handover date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Call notes / counselor response</th></tr></thead>
            <tbody>{filteredHandovers.map((item) => {
              const lead = leadFor(item.leadId);
              return <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3"><button type="button" aria-label={`Open ${item.id} handover details`} onClick={() => setDrawer({ type: 'handover', id: item.id })} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">{lead?.studentName ?? item.leadId}<span className="mt-1 block text-slate-500">{item.leadId}</span></button></td>
                <td className="px-4 py-3">{item.programme}</td><td className="px-4 py-3">{callerName(item.telecallerId)}</td><td className="px-4 py-3">{counselorName(item.counselorId)}</td><td className="px-4 py-3">{formatDate(item.handoverDate)}</td><td className="px-4 py-3"><Badge>{item.status}</Badge></td><td className="max-w-sm px-4 py-3">{item.counselorNote ?? item.callNotes}</td>
              </tr>;
            })}{!filteredHandovers.length && <tr><td colSpan={7}><EmptyState>No handovers match the selected filters.</EmptyState></td></tr>}</tbody>
          </table>
        </div>
      </Panel>}

      {activeDashboardTab === 'callbacks' && <Panel title="Follow-up management" subtitle="TeleCaller callbacks are for initial outreach and qualification; they are separate from Counselor career-guidance and admission follow-ups." id="follow-ups">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Today's callbacks" value={callbacksToday.length} detail="Sample callbacks due today" icon={CalendarDays} tone="blue" href="#callback-table" />
          <MetricCard label="Upcoming callbacks" value={upcomingCallbacks.length} detail="Pending sample callbacks after today" icon={Clock3} tone="violet" href="#callback-table" />
          <MetricCard label="Overdue callbacks" value={overdueCallbacks.length} detail="Pending callbacks past their due date" icon={Phone} tone="rose" href="#callback-table" />
          <MetricCard label="Follow-ups completed" value={completedCallbacks.length} detail="Completed callback examples" icon={CheckCircle2} tone="emerald" href="#callback-table" />
        </div>
        <div id="callback-table" className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Enquiry ID</th><th className="px-4 py-3">Prospect</th><th className="px-4 py-3">TeleCaller</th><th className="px-4 py-3">Callback date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Callback note</th></tr></thead>
            <tbody>{filteredCallbacks.map((callback) => <CallbackRow key={callback.id} callback={callback} onOpen={(id) => setDrawer({ type: 'lead', id })} />)}{!filteredCallbacks.length && <tr><td colSpan={6}><EmptyState>No callbacks match the selected filters.</EmptyState></td></tr>}</tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">Prospects awaiting a response</h3>
          <div className="mt-3 flex flex-wrap gap-2">{filteredLeads.filter((lead) => lead.qualificationStatus === 'Callback Required' || (lead.nextCallbackDate && lead.nextCallbackDate >= TELECALLER_DEMO_TODAY)).slice(0, 8).map((lead) => <button key={lead.id} type="button" onClick={() => setDrawer({ type: 'lead', id: lead.id })} className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-violet-700 hover:border-violet-300 dark:border-slate-700 dark:text-violet-300">{lead.id} · {lead.studentName}</button>)}</div>
        </div>
      </Panel>}

      {activeDashboardTab === 'analytics' && <Panel title="Programme-wise lead analytics" subtitle="Illustrative lead cohort grouped by official programme-catalogue names. Source mix uses the filtered sample lead records." id="programme-analytics">
        <div className="grid min-w-0 gap-4 p-4 xl:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Leads, interested prospects and qualified leads</h3>
            <p className="mt-1 text-[10px] text-slate-500">Programme totals are an independent illustrative cohort.</p>
            <div className="mt-3 h-[330px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programmeCohort} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="programme" width={155} tick={{ fontSize: 8 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="leads" name="Leads" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="interested" name="Interested" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="qualified" name="Qualified" fill="#0d9488" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Lead source distribution</h3>
            <p className="mt-1 text-[10px] text-slate-500">Distribution of visible illustrative lead records.</p>
            <div className="h-[270px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={Object.entries(sourceDistribution).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={88} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {Object.keys(sourceDistribution).map((source, index) => <Cell key={source} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 9 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          <table className="w-full min-w-[820px] text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Programme</th><th className="px-4 py-3">Leads</th><th className="px-4 py-3">Interested</th><th className="px-4 py-3">Qualified</th><th className="px-4 py-3">Qualification rate</th></tr></thead>
            <tbody>{programmeCohort.map((item) => <tr key={item.programme} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 font-medium">{item.programme}</td><td className="px-4 py-3">{item.leads}</td><td className="px-4 py-3">{item.interested}</td><td className="px-4 py-3">{item.qualified}</td><td className="px-4 py-3">{Math.round((item.qualified / item.leads) * 100)}%</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>}

      {activeDashboardTab === 'tasks' && <Panel title="Task transfers and simulated AI reports" subtitle="Management-level work examples only. Transfer records and reports are illustrative; no live AI processing or external task service is connected." id="task-transfers">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Task transfers" value={filteredTransfers.length} detail="Transfer examples in the selected range" icon={History} tone="violet" href="#transfer-history" />
          <MetricCard label="Pending acceptance" value={filteredTransfers.filter((item) => item.status === 'Pending Acceptance').length} detail="Transferred work awaiting a caller response" icon={Clock3} tone="amber" href="#transfer-history" />
          <MetricCard label="Overdue transferred tasks" value={filteredTransfers.filter((item) => item.dueDate < TELECALLER_DEMO_TODAY && item.status !== 'Completed' && item.status !== 'Rejected').length} detail="Open transfers past their due date" icon={CalendarDays} tone="rose" href="#transfer-history" />
          <MetricCard label="Simulated AI reports" value={filteredReports.length} detail="Management summaries for sample work" icon={Sparkles} tone="blue" href="#report-list" />
        </div>
        <div className="grid min-w-0 gap-4 p-4 pt-0 xl:grid-cols-2">
          <div id="transfer-history" className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4"><h3 className="text-xs font-bold text-slate-900 dark:text-white">Task transfer history</h3><p className="mt-1 text-[10px] text-slate-500">Repeated task IDs indicate a second assignment handoff.</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Task</th><th className="px-4 py-3">Original → new</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>{filteredTransfers.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3"><button type="button" aria-label={`Open ${item.taskId} transfer details`} onClick={() => setDrawer({ type: 'transfer', id: item.id })} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">{item.taskId}<span className="mt-1 block font-normal text-slate-700 dark:text-slate-200">{item.title}</span></button></td>
                <td className="px-4 py-3">{callerName(item.originalTelecallerId)} → {callerName(item.newTelecallerId)}</td><td className="px-4 py-3">{formatDate(item.dueDate)}</td><td className="px-4 py-3"><Badge>{item.status}</Badge></td>
              </tr>)}</tbody>
            </table></div>
          </div>
          <div id="report-list" className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4"><h3 className="text-xs font-bold text-slate-900 dark:text-white">Simulated AI task reports</h3><p className="mt-1 text-[10px] text-slate-500">Generated sample summaries; not live model output or verified performance evidence.</p></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Report / task</th><th className="px-4 py-3">TeleCaller</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Review</th></tr></thead>
              <tbody>{filteredReports.map((item) => <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-3"><button type="button" aria-label={`Open ${item.id} simulated report`} onClick={() => setDrawer({ type: 'report', id: item.id })} className="text-left font-semibold text-violet-700 hover:underline dark:text-violet-300">{item.id} · {item.title}</button><p className="mt-1 text-slate-500">{item.taskId}</p></td>
                <td className="px-4 py-3">{callerName(item.telecallerId)}</td><td className="px-4 py-3">{formatDate(item.completedAt)}{item.completedAt > item.dueDate && <span className="mt-1 block text-rose-600">Completed late</span>}</td><td className="px-4 py-3"><Badge>{item.founderReviewStatus}</Badge></td>
              </tr>)}</tbody>
            </table></div>
          </div>
        </div>
      </Panel>}

      {activeDashboardTab === 'attention' && <Panel title="Founder attention required" subtitle="Illustrative rules surface records for follow-up and operational review; they do not represent verified employee or student performance." id="attention">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {attentionItems.map((item) => <button key={item.id} type="button" onClick={() => openAttentionItem(item)} className="flex w-full flex-col justify-between gap-3 px-4 py-4 text-left transition hover:bg-violet-50/50 dark:hover:bg-violet-950/20 sm:flex-row sm:items-center sm:px-5">
            <span className="min-w-0"><span className="block text-xs font-semibold text-slate-900 dark:text-white">{item.title}</span><span className="mt-1 block text-[10px] text-slate-500">{item.detail}</span></span>
            <Badge tone={item.priority === 'High' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}>{item.priority} attention</Badge>
          </button>)}
          {!attentionItems.length && <EmptyState>No founder-attention signals match the current selection.</EmptyState>}
        </div>
      </Panel>}
      </DashboardTabs>

      {drawer && <TeleCallerDrawer selection={drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}

function TeleCallerDrawer({ selection, onClose }: { selection: Exclude<DrawerSelection, null>; onClose: () => void }) {
  const lead = selection.type === 'lead' ? leadFor(selection.id) : undefined;
  const handover: TeleCallerHandover | undefined = selection.type === 'handover' ? demoTelecallerHandovers.find((item) => item.id === selection.id) : undefined;
  const transfer: TeleCallerTaskTransfer | undefined = selection.type === 'transfer' ? demoTelecallerTaskTransfers.find((item) => item.id === selection.id) : undefined;
  const report: TeleCallerCompletionReport | undefined = selection.type === 'report' ? demoTelecallerCompletionReports.find((item) => item.id === selection.id) : undefined;
  const title = lead ? `${lead.id} · ${lead.studentName}` : handover ? `Handover ${handover.id}` : transfer ? `Task transfer ${transfer.taskId}` : report ? `Simulated report ${report.id}` : 'Demo details';

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="telecaller-drawer-title" className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-300">Illustrative demo details</p><h2 id="telecaller-drawer-title" className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{title}</h2></div>
          <button type="button" aria-label="Close detail drawer" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {lead && <LeadDetails lead={lead} />}
          {handover && <HandoverDetails handover={handover} />}
          {transfer && <TransferDetails transfer={transfer} />}
          {report && <ReportDetails report={report} />}
          {!lead && !handover && !transfer && !report && <EmptyState>This example record is no longer available.</EmptyState>}
        </div>
      </aside>
    </div>
  );
}

function LeadDetails({ lead }: { lead: TeleCallerLead }) {
  const handovers = demoTelecallerHandovers.filter((item) => item.leadId === lead.id);
  const callbacks = demoTelecallerCallbacks.filter((item) => item.leadId === lead.id);
  return <>
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailField label="Qualification status" value={<Badge>{lead.qualificationStatus}</Badge>} />
      <DetailField label="Interest / priority" value={`${lead.interestLevel} · ${lead.priority}`} />
      <DetailField label="Masked email / phone" value={<>{lead.emailMasked}<br />{lead.phoneMasked}</>} />
      <DetailField label="Programme" value={lead.programme} />
      <DetailField label="Education background" value={lead.educationBackground} />
      <DetailField label="Lead source" value={lead.source} />
      <DetailField label="Assigned TeleCaller" value={callerName(lead.telecallerId)} />
      <DetailField label="Assigned / last call" value={`${formatDate(lead.assignedDate)} · ${formatDate(lead.lastCallDate)}`} />
      <DetailField label="Calls made / next callback" value={`${lead.callsMade} · ${formatDate(lead.nextCallbackDate)}`} />
      <DetailField label="Qualification notes" value={lead.notes} />
    </div>
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Counselor handover journey</h3>
      {handovers.length ? <div className="mt-3 space-y-2">{handovers.map((item) => <div key={item.id} className="rounded-lg bg-slate-50 p-3 text-[10px] dark:bg-slate-950/60"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.id} · {counselorName(item.counselorId)}</strong><Badge>{item.status}</Badge></div><p className="mt-2 text-slate-500">{formatDate(item.handoverDate)} · {item.callNotes}</p></div>)}</div> : <p className="mt-2 text-[10px] text-slate-500">No counselor handover is recorded for this sample lead.</p>}
    </div>
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white">TeleCaller callback history</h3>
      {callbacks.length ? <div className="mt-3 space-y-2">{callbacks.map((item) => <p key={item.id} className="text-[10px] text-slate-600 dark:text-slate-300">{formatDate(item.dueDate)} · {item.status} · {item.note}</p>)}</div> : <p className="mt-2 text-[10px] text-slate-500">No callback record is linked to this lead.</p>}
    </div>
  </>;
}

function HandoverDetails({ handover }: { handover: TeleCallerHandover }) {
  const lead = leadFor(handover.leadId);
  return <div className="grid gap-3 sm:grid-cols-2">
    <DetailField label="Prospect / enquiry" value={`${lead?.studentName ?? 'Demo lead'} · ${handover.leadId}`} />
    <DetailField label="Programme" value={handover.programme} />
    <DetailField label="TeleCaller" value={callerName(handover.telecallerId)} />
    <DetailField label="Counselor" value={counselorName(handover.counselorId)} />
    <DetailField label="Status / handover date" value={<>{handover.status}<br />{formatDate(handover.handoverDate)}</>} />
    <DetailField label="Call notes" value={handover.callNotes} />
    <div className="sm:col-span-2"><DetailField label="Counselor response" value={handover.counselorNote ?? 'No response recorded; acceptance is pending in this demo.'} /></div>
  </div>;
}

function TransferDetails({ transfer }: { transfer: TeleCallerTaskTransfer }) {
  return <div className="grid gap-3 sm:grid-cols-2">
    <DetailField label="Task / category" value={`${transfer.taskId} · ${transfer.category}`} />
    <DetailField label="Status" value={<Badge>{transfer.status}</Badge>} />
    <DetailField label="Task" value={transfer.title} />
    <DetailField label="Original → new assignee" value={`${callerName(transfer.originalTelecallerId)} → ${callerName(transfer.newTelecallerId)}`} />
    <DetailField label="Transferred by / date" value={`${transfer.transferredBy} · ${formatDate(transfer.transferDate)}`} />
    <DetailField label="Due date" value={formatDate(transfer.dueDate)} />
    <div className="sm:col-span-2"><DetailField label="Transfer reason" value={transfer.reason} /></div>
  </div>;
}

function ReportDetails({ report }: { report: TeleCallerCompletionReport }) {
  return <>
    <div className="flex flex-wrap gap-2"><Badge tone="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">Simulated AI / Demo</Badge><Badge>{report.founderReviewStatus}</Badge></div>
    <div className="grid gap-3 sm:grid-cols-2">
      <DetailField label="Task" value={`${report.taskId} · ${report.title}`} />
      <DetailField label="TeleCaller / completion" value={`${callerName(report.telecallerId)} · ${formatDate(report.completedAt)}`} />
      <DetailField label="Due date" value={formatDate(report.dueDate)} />
      <DetailField label="Work summary" value={report.workSummary} />
      <DetailField label="Outcome" value={report.outcome} />
      <DetailField label="Operational bottleneck" value={report.bottleneck} />
    </div>
    <p className="rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">This is static illustrative report text for the prototype. It is not generated by a live AI model and is not verified evidence of work.</p>
  </>;
}
