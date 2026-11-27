'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  Handshake,
  History,
  Mail,
  Phone,
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
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  COUNSELOR_DEMO_TODAY,
  counselorProgrammes,
  demoCounselorAdmissions,
  demoCounselorCompletionReports,
  demoCounselorEnquiries,
  demoCounselorSessions,
  demoCounselorTaskTransfers,
  demoCounselors,
  type CounselorCompletionReport,
  type CounselorEnquiry,
  type CounselorSession,
  type CounselorTaskTransfer,
} from '@/lib/counselor-demo-data';

type DateRange = 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'All time';
type DrawerSelection =
  | { type: 'enquiry'; id: string }
  | { type: 'counselor'; id: string }
  | { type: 'transfer'; id: string }
  | { type: 'report'; id: string }
  | null;
type AttentionItem = {
  id: string;
  type: 'enquiry' | 'session' | 'admission' | 'transfer';
  recordId: string;
  title: string;
  detail: string;
  reasons: string[];
  priority: 'High' | 'Medium';
};

const pipelineStages = [
  'New Enquiry',
  'Contacted',
  'Interested',
  'Counselling Scheduled',
  'Counselling Completed',
  'Admission in Progress',
  'Admitted',
  'Not Interested / Lost',
] as const;
const dashboardTabs = [
  { id: 'overview', label: 'Overview', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: CalendarDays },
  { id: 'admissions', label: 'Admissions', icon: GraduationCap },
  { id: 'enquiries', label: 'Enquiries', icon: Search },
  { id: 'tasks', label: 'Tasks & Reports', icon: Sparkles },
  { id: 'attention', label: 'Attention Required', icon: Clock3 },
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

function isActiveEnquiry(enquiry: CounselorEnquiry) {
  return enquiry.stage !== 'Admitted' && enquiry.stage !== 'Not Interested / Lost';
}

function getCounselorName(id: string) {
  return demoCounselors.find((counselor) => counselor.id === id)?.name ?? 'Unassigned';
}

function statusTone(value: string) {
  if (['Admitted', 'Completed', 'Reviewed', 'Accepted', 'Interested'].includes(value)) {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  if (['In Progress', 'Counselling Scheduled', 'Decision Pending', 'Rescheduled', 'Needs Follow-up'].includes(value)) {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  }
  if (['High', 'Cancelled', 'Not Interested / Lost', 'Rejected'].includes(value)) {
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
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-7 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-[13px] font-semibold leading-4 text-slate-800 dark:text-slate-100">{label}</p>
      <p className="mt-1 text-xs leading-4 text-slate-500 dark:text-slate-400">{detail}</p>
    </>
  );
  const className = "group flex min-h-[190px] w-full flex-col rounded-3xl border border-[#e7e2ef] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-900";

  if (onClick) return <button type="button" onClick={onClick} className={className}>{content}</button>;
  return <a href={href} className={className}>{content}</a>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-xs text-slate-500">{children}</p>;
}

function SessionTableRow({
  session,
  onOpenEnquiry,
}: {
  session: CounselorSession;
  onOpenEnquiry: (id: string) => void;
}) {
  const enquiry = demoCounselorEnquiries.find((item) => item.id === session.enquiryId);
  return (
    <tr className="border-t border-slate-100 text-[10px] dark:border-slate-800">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onOpenEnquiry(session.enquiryId)} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">
          {session.enquiryId}
        </button>
      </td>
      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{session.programme}</td>
      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{getCounselorName(session.counselorId)}</td>
      <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(session.sessionDate)} · {session.sessionTime}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{session.mode}</td>
      <td className="px-4 py-3"><Badge>{session.status}</Badge>{session.rescheduledTo && <p className="mt-1 text-[9px] text-amber-700 dark:text-amber-300">To {formatDate(session.rescheduledTo)}</p>}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{session.outcome ?? 'Awaiting outcome'}</td>
      <td className="px-4 py-3">{session.status === 'Completed' ? <Badge tone={session.outcomeReported ? undefined : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'}>{session.outcomeReported ? 'Reported' : 'Pending report'}</Badge> : <span className="text-slate-400">Not due</span>}</td>
      <td className="px-4 py-3 text-slate-500">{enquiry?.studentName}</td>
    </tr>
  );
}

function TransferTableRow({
  transfer,
  onOpen,
}: {
  transfer: CounselorTaskTransfer;
  onOpen: (id: string) => void;
}) {
  const overdue =
    transfer.dueDate < COUNSELOR_DEMO_TODAY &&
    transfer.status !== 'Completed' &&
    transfer.status !== 'Cancelled' &&
    transfer.status !== 'Rejected';
  return (
    <tr className="border-t border-slate-100 text-[10px] dark:border-slate-800">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onOpen(transfer.id)} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">
          {transfer.taskId}
        </button>
      </td>
      <td className="min-w-52 px-4 py-3 text-slate-800 dark:text-slate-200">{transfer.title}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{getCounselorName(transfer.originalCounselorId)} → {getCounselorName(transfer.newCounselorId)}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(transfer.transferDate)}</td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(transfer.dueDate)}</td>
      <td className="px-4 py-3"><Badge>{transfer.status}</Badge>{overdue && <p className="mt-1 text-[9px] font-semibold text-rose-600">Overdue</p>}</td>
    </tr>
  );
}

export default function CounselorDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('Last 90 days');
  const [activeDashboardTab, setActiveDashboardTab] = useState('overview');
  const [programmeFilter, setProgrammeFilter] = useState('All programmes');
  const [counselorFilter, setCounselorFilter] = useState('All counselors');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All stages');
  const [priorityFilter, setPriorityFilter] = useState('All priorities');
  const [sortBy, setSortBy] = useState('Newest enquiry');
  const [drawer, setDrawer] = useState<DrawerSelection>(null);

  const rangeStart = useMemo(() => {
    const days: Record<Exclude<DateRange, 'All time'>, number> = {
      'Last 7 days': 7,
      'Last 30 days': 30,
      'Last 90 days': 90,
    };
    return dateRange === 'All time' ? undefined : addDays(COUNSELOR_DEMO_TODAY, -days[dateRange]);
  }, [dateRange]);

  const matchesRange = (date: string) => !rangeStart || date >= rangeStart;
  const filteredEnquiries = demoCounselorEnquiries.filter((enquiry) =>
    matchesRange(enquiry.enquiryDate) &&
    (programmeFilter === 'All programmes' || enquiry.programme === programmeFilter) &&
    (counselorFilter === 'All counselors' || enquiry.counselorId === counselorFilter)
  );
  const filteredEnquiryIds = new Set(filteredEnquiries.map((enquiry) => enquiry.id));
  const filteredSessions = demoCounselorSessions.filter((session) =>
    matchesRange(session.sessionDate) &&
    (programmeFilter === 'All programmes' || session.programme === programmeFilter) &&
    (counselorFilter === 'All counselors' || session.counselorId === counselorFilter)
  );
  const filteredAdmissions = demoCounselorAdmissions.filter((admission) =>
    filteredEnquiryIds.has(admission.enquiryId)
  );
  const filteredTransfers = demoCounselorTaskTransfers.filter((transfer) => {
    const linkedEnquiry = transfer.enquiryId
      ? demoCounselorEnquiries.find((enquiry) => enquiry.id === transfer.enquiryId)
      : undefined;
    return (
      matchesRange(transfer.transferDate) &&
      (counselorFilter === 'All counselors' ||
        transfer.originalCounselorId === counselorFilter ||
        transfer.newCounselorId === counselorFilter) &&
      (programmeFilter === 'All programmes' || linkedEnquiry?.programme === programmeFilter)
    );
  });
  const filteredReports = demoCounselorCompletionReports.filter((report) => {
    const linkedEnquiry = demoCounselorEnquiries.find((enquiry) => enquiry.id === report.enquiryId);
    return (
      matchesRange(report.completedAt) &&
      filteredEnquiryIds.has(report.enquiryId) &&
      (programmeFilter === 'All programmes' || linkedEnquiry?.programme === programmeFilter)
    );
  });

  const filteredCounselors = demoCounselors.filter(
    (counselor) => counselorFilter === 'All counselors' || counselor.id === counselorFilter
  );
  const activeEnquiries = filteredEnquiries.filter(isActiveEnquiry);
  const newEnquiries = filteredEnquiries.filter((enquiry) => enquiry.stage === 'New Enquiry');
  const followUpsPending = activeEnquiries.filter(
    (enquiry) => enquiry.nextFollowUpDate && enquiry.nextFollowUpDate >= COUNSELOR_DEMO_TODAY
  );
  const overdueFollowUps = activeEnquiries.filter(
    (enquiry) => enquiry.nextFollowUpDate && enquiry.nextFollowUpDate < COUNSELOR_DEMO_TODAY
  );
  const inactiveEnquiries = activeEnquiries.filter(
    (enquiry) => enquiry.lastContactDate && enquiry.lastContactDate < addDays(COUNSELOR_DEMO_TODAY, -14)
  );
  const completedSessions = filteredSessions.filter((session) => session.status === 'Completed');
  const upcomingSessions = filteredSessions.filter(
    (session) =>
      (session.status === 'Scheduled' && session.sessionDate >= COUNSELOR_DEMO_TODAY) ||
      (session.status === 'Rescheduled' &&
        (session.rescheduledTo ?? session.sessionDate) >= COUNSELOR_DEMO_TODAY)
  );
  const cancelledOrRescheduled = filteredSessions.filter(
    (session) => session.status === 'Cancelled' || session.status === 'Rescheduled'
  );
  const sessionsAwaitingReports = completedSessions.filter((session) => !session.outcomeReported);
  const admittedRecords = filteredAdmissions.filter((admission) => admission.status === 'Admitted');
  const admissionsInProgress = filteredAdmissions.filter((admission) => admission.status === 'In Progress');
  const admissionDecisionsPending = filteredAdmissions.filter(
    (admission) => admission.status === 'Decision Pending'
  );
  const conversionRate = filteredEnquiries.length
    ? (admittedRecords.length / filteredEnquiries.length) * 100
    : 0;
  const programmeAnalytics = counselorProgrammes.map((programme) => {
    const enquiries = filteredEnquiries.filter((enquiry) => enquiry.programme === programme);
    const sessions = filteredSessions.filter((session) => session.programme === programme);
    const admissions = admittedRecords.filter((admission) => admission.programme === programme);
    return {
      programme,
      enquiries: enquiries.length,
      sessions: sessions.length,
      admissions: admissions.length,
      conversion: enquiries.length ? Math.round((admissions.length / enquiries.length) * 100) : 0,
    };
  });
  const topProgramme = [...programmeAnalytics].sort(
    (a, b) => b.admissions - a.admissions || a.programme.localeCompare(b.programme)
  )[0];
  const counselorMetrics = filteredCounselors.map((counselor) => {
    const enquiries = filteredEnquiries.filter((enquiry) => enquiry.counselorId === counselor.id);
    const sessions = filteredSessions.filter((session) => session.counselorId === counselor.id);
    const admissions = admittedRecords.filter((admission) => admission.counselorId === counselor.id);
    const pending = enquiries.filter(
      (enquiry) => isActiveEnquiry(enquiry) && enquiry.nextFollowUpDate && enquiry.nextFollowUpDate >= COUNSELOR_DEMO_TODAY
    );
    const overdue = enquiries.filter(
      (enquiry) => isActiveEnquiry(enquiry) && enquiry.nextFollowUpDate && enquiry.nextFollowUpDate < COUNSELOR_DEMO_TODAY
    );
    const upcoming = sessions.filter(
      (session) =>
        (session.status === 'Scheduled' && session.sessionDate >= COUNSELOR_DEMO_TODAY) ||
        (session.status === 'Rescheduled' &&
          (session.rescheduledTo ?? session.sessionDate) >= COUNSELOR_DEMO_TODAY)
    );
    const workloadScore = Math.min(
      100,
      enquiries.filter(isActiveEnquiry).length * 7 +
        upcoming.length * 12 +
        overdue.length * 18 +
        enquiries.filter((enquiry) => enquiry.priority === 'High' && !enquiry.lastContactDate).length * 10
    );
    return {
      counselor,
      enquiries,
      sessions,
      admissions,
      completed: sessions.filter((session) => session.status === 'Completed'),
      pending,
      overdue,
      upcoming,
      workloadScore,
      conversion: enquiries.length ? (admissions.length / enquiries.length) * 100 : 0,
    };
  });
  const highestConversionCounselor = [...counselorMetrics]
    .filter((metrics) => metrics.enquiries.length > 0)
    .sort((a, b) => b.conversion - a.conversion || b.admissions.length - a.admissions.length)[0];

  const searchedEnquiries = filteredEnquiries
    .filter((enquiry) => {
      const counselorName = getCounselorName(enquiry.counselorId);
      const searchText = `${enquiry.id} ${enquiry.studentName} ${enquiry.programme} ${enquiry.source} ${counselorName}`
        .toLowerCase();
      return (
        searchText.includes(enquirySearch.toLowerCase()) &&
        (stageFilter === 'All stages' || enquiry.stage === stageFilter) &&
        (priorityFilter === 'All priorities' || enquiry.priority === priorityFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'Highest priority') {
        const order = { High: 3, Medium: 2, Low: 1 };
        return order[b.priority] - order[a.priority] || b.enquiryDate.localeCompare(a.enquiryDate);
      }
      if (sortBy === 'Follow-up soon') {
        return (a.nextFollowUpDate ?? '9999-12-31').localeCompare(b.nextFollowUpDate ?? '9999-12-31');
      }
      return b.enquiryDate.localeCompare(a.enquiryDate);
    });

  const pendingTransfers = filteredTransfers.filter((transfer) => transfer.status === 'Pending Acceptance');
  const acceptedTransfers = filteredTransfers.filter((transfer) => transfer.status === 'Accepted');
  const completedTransfers = filteredTransfers.filter((transfer) => transfer.status === 'Completed');
  const overdueTransfers = filteredTransfers.filter(
    (transfer) =>
      transfer.dueDate < COUNSELOR_DEMO_TODAY &&
      transfer.status !== 'Completed' &&
      transfer.status !== 'Cancelled' &&
      transfer.status !== 'Rejected'
  );
  const awaitingFounderReview = filteredReports.filter(
    (report) => report.founderReviewStatus === 'Awaiting Review'
  );
  const lateCompletionReports = filteredReports.filter((report) => report.completedAt > report.dueDate);
  const furtherActionReports = filteredReports.filter((report) => report.requiresFurtherAction);
  const repeatedTaskIds = new Set(
    filteredTransfers
      .filter((transfer, index, list) => list.findIndex((other) => other.taskId === transfer.taskId) !== index)
      .map((transfer) => transfer.taskId)
  );

  const attentionItems: AttentionItem[] = [
    ...filteredEnquiries.flatMap((enquiry) => {
      const reasons = [
        ...(enquiry.priority === 'High' && !enquiry.lastContactDate ? ['High priority · no contact recorded'] : []),
        ...(enquiry.nextFollowUpDate && enquiry.nextFollowUpDate < COUNSELOR_DEMO_TODAY ? ['Follow-up overdue'] : []),
        ...(isActiveEnquiry(enquiry) &&
          enquiry.lastContactDate &&
          enquiry.lastContactDate < addDays(COUNSELOR_DEMO_TODAY, -14)
          ? ['No recent contact · over 14 days']
          : []),
      ];
      return reasons.length
        ? [{
            id: `enquiry-${enquiry.id}`,
            type: 'enquiry' as const,
            recordId: enquiry.id,
            title: `${enquiry.id} · ${enquiry.studentName}`,
            detail: `${enquiry.programme} · ${getCounselorName(enquiry.counselorId)}`,
            reasons,
            priority: enquiry.priority === 'High' ? 'High' as const : 'Medium' as const,
          }]
        : [];
    }),
    ...sessionsAwaitingReports.map((session) => ({
      id: `session-${session.id}`,
      type: 'session' as const,
      recordId: session.enquiryId,
      title: `Outcome report missing · ${session.id}`,
      detail: `${session.programme} · ${getCounselorName(session.counselorId)} · completed ${formatDate(session.sessionDate)}`,
      reasons: ['Counselling outcome not recorded'],
      priority: 'High' as const,
    })),
    ...admissionDecisionsPending
      .filter((admission) => admission.lastUpdatedAt < addDays(COUNSELOR_DEMO_TODAY, -7))
      .map((admission) => ({
        id: `admission-${admission.id}`,
        type: 'admission' as const,
        recordId: admission.enquiryId,
        title: `Admission decision pending · ${admission.id}`,
        detail: `${admission.programme} · no update since ${formatDate(admission.lastUpdatedAt)}`,
        reasons: ['Decision pending over 7 days'],
        priority: 'High' as const,
      })),
    ...overdueTransfers.map((transfer) => ({
      id: `transfer-${transfer.id}`,
      type: 'transfer' as const,
      recordId: transfer.id,
      title: `Transferred task awaiting action · ${transfer.taskId}`,
      detail: `${getCounselorName(transfer.newCounselorId)} · due ${formatDate(transfer.dueDate)}`,
      reasons: ['Transfer is overdue'],
      priority: 'High' as const,
    })),
  ];

  const selectedEnquiry =
    drawer?.type === 'enquiry'
      ? demoCounselorEnquiries.find((enquiry) => enquiry.id === drawer.id)
      : undefined;
  const selectedCounselor =
    drawer?.type === 'counselor'
      ? demoCounselors.find((counselor) => counselor.id === drawer.id)
      : undefined;
  const selectedTransfer =
    drawer?.type === 'transfer'
      ? demoCounselorTaskTransfers.find((transfer) => transfer.id === drawer.id)
      : undefined;
  const selectedReport =
    drawer?.type === 'report'
      ? demoCounselorCompletionReports.find((report) => report.id === drawer.id)
      : undefined;

  const resetFilters = () => {
    setDateRange('Last 90 days');
    setProgrammeFilter('All programmes');
    setCounselorFilter('All counselors');
    setEnquirySearch('');
    setStageFilter('All stages');
    setPriorityFilter('All priorities');
    setSortBy('Newest enquiry');
  };

  const openAttentionItem = (item: AttentionItem) => {
    if (item.type === 'transfer') setDrawer({ type: 'transfer', id: item.recordId });
    else setDrawer({ type: 'enquiry', id: item.recordId });
  };

  return (
    <div className="-m-4 min-h-full space-y-6 bg-[#f8f7ff] p-4 sm:p-6 lg:-m-8 lg:p-8 dark:bg-slate-950">
      <header className="relative isolate overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5 shadow-sm dark:border-slate-800 dark:from-violet-950/50 dark:via-slate-900 dark:to-blue-950/30 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-violet-100/60 dark:border-violet-900/20" />
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-700 dark:border-violet-800 dark:bg-slate-900/80 dark:text-violet-300">
              <Users className="h-3 w-3" /> Founder view · Illustrative demo data
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-violet-950 dark:text-white sm:text-3xl">Counselor Department Overview</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Review counselling activity, admission conversion and prospective-student follow-through.
            </p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Prototype only. All people, enquiries, outcomes and analysis shown are sample records.
            </p>
          </div>
          <button type="button" onClick={resetFilters} className="inline-flex w-fit items-center gap-2 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300 dark:hover:bg-violet-950/40">
            <History className="h-4 w-4" /> Reset filters
          </button>
        </div>
        <div className="mt-6 grid gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[10px] font-semibold text-slate-500">Date range
            <select value={dateRange} onChange={(event) => setDateRange(event.target.value as DateRange)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>All time</option>
            </select>
          </label>
          <label className="text-[10px] font-semibold text-slate-500">Programme
            <select value={programmeFilter} onChange={(event) => setProgrammeFilter(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option>All programmes</option>{counselorProgrammes.map((programme) => <option key={programme}>{programme}</option>)}
            </select>
          </label>
          <label className="text-[10px] font-semibold text-slate-500">Counselor
            <select value={counselorFilter} onChange={(event) => setCounselorFilter(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="All counselors">All counselors</option>{demoCounselors.map((counselor) => <option key={counselor.id} value={counselor.id}>{counselor.name}</option>)}
            </select>
          </label>
          <div className="flex items-end text-[10px] leading-4 text-slate-500">
            Current demo date: <strong className="ml-1 text-slate-700 dark:text-slate-200">{formatDate(COUNSELOR_DEMO_TODAY)}</strong>
          </div>
        </div>
      </header>

      <DashboardTabs id="counselor-dashboard" ariaLabel="Counselor dashboard sections" tabs={dashboardTabs} value={activeDashboardTab} onChange={setActiveDashboardTab}>
      {activeDashboardTab === 'overview' && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" id="department-summary">
        <MetricCard label="Active Counselors" value={filteredCounselors.filter((counselor) => counselor.active).length} detail="Counselors included by current filter" icon={Users} tone="violet" href="#counselor-summary" />
        <MetricCard label="Student Enquiries" value={filteredEnquiries.length} detail="Current date and programme selection" icon={Search} tone="blue" onClick={() => setActiveDashboardTab('enquiries')} />
        <MetricCard label="Admission Conversion" value={`${conversionRate.toFixed(1)}%`} detail={`${admittedRecords.length} admitted / ${filteredEnquiries.length} enquiries`} icon={ArrowUpRight} tone="emerald" onClick={() => setActiveDashboardTab('admissions')} />
        <MetricCard label="Founder Attention" value={attentionItems.length} detail="Illustrative follow-up and reporting signals" icon={Clock3} tone="amber" onClick={() => setActiveDashboardTab('attention')} />
      </div>
      <Panel title="Counselling activity" subtitle="Session volume, delivery status and counselor follow-through." id="counselor-activity">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Active Counselors" value={filteredCounselors.filter((counselor) => counselor.active).length} detail="Across selected counselor scope" icon={Users} tone="violet" href="#counselor-summary" />
          <MetricCard label="Total Counselling Sessions" value={filteredSessions.length} detail="Sessions in selected date range" icon={CalendarDays} tone="blue" onClick={() => setActiveDashboardTab('sessions')} />
          <MetricCard label="Sessions Completed" value={completedSessions.length} detail="Completed outcomes only" icon={CheckCircle2} tone="emerald" onClick={() => setActiveDashboardTab('sessions')} />
          <MetricCard label="Upcoming Sessions" value={upcomingSessions.length} detail="Scheduled or rescheduled into the future" icon={Clock3} tone="amber" onClick={() => setActiveDashboardTab('sessions')} />
          <MetricCard label="Cancelled / Rescheduled" value={cancelledOrRescheduled.length} detail="Shown separately from completed sessions" icon={CalendarDays} tone="rose" onClick={() => setActiveDashboardTab('sessions')} />
          <MetricCard label="Sessions Awaiting Outcome Reports" value={sessionsAwaitingReports.length} detail="Completed sessions missing recorded outcome" icon={FileCheck2} tone="amber" onClick={() => setActiveDashboardTab('sessions')} />
        </div>
        <div className="px-4 pb-5 sm:px-5">
          <div className="mb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Counselor activity summary</h3>
            <p className="mt-1 text-[10px] text-slate-500">Workload combines active enquiries, upcoming sessions and overdue follow-ups.</p>
          </div>
          <div id="counselor-summary" className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[880px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr>
                <th className="px-4 py-3">Counselor</th><th className="px-3 py-3">Assigned enquiries</th><th className="px-3 py-3">Sessions completed</th><th className="px-3 py-3">Upcoming sessions</th><th className="px-3 py-3">Pending follow-ups</th><th className="px-3 py-3">Overdue work</th><th className="px-3 py-3">Workload</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {counselorMetrics.map((metrics) => (
                  <tr key={metrics.counselor.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-950/20">
                    <td className="px-4 py-3"><button type="button" onClick={() => setDrawer({ type: 'counselor', id: metrics.counselor.id })} className="text-left"><span className="block font-bold text-violet-700 dark:text-violet-300">{metrics.counselor.name}</span><span className="mt-1 block text-slate-500">{metrics.counselor.title}</span></button></td>
                    <td className="px-3 py-3">{metrics.enquiries.length}</td><td className="px-3 py-3">{metrics.completed.length}</td><td className="px-3 py-3">{metrics.upcoming.length}</td><td className="px-3 py-3">{metrics.pending.length}</td>
                    <td className="px-3 py-3">{metrics.overdue.length ? <Badge tone="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{metrics.overdue.length} overdue</Badge> : '0'}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><Badge tone={metrics.workloadScore >= 70 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : metrics.workloadScore >= 40 ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}>{metrics.workloadScore >= 70 ? 'High' : metrics.workloadScore >= 40 ? 'Busy' : 'Balanced'}</Badge><span className="text-slate-500">{metrics.workloadScore}%</span></div></td>
                  </tr>
                ))}
                {!counselorMetrics.length && <tr><td colSpan={7} className="p-5 text-center text-slate-500">No counselors match the current filter.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
      </>}

      {activeDashboardTab === 'sessions' && <Panel title="Counselling sessions" subtitle="Scheduled and rescheduled sessions are shown separately from completed outcomes." id="counseling-sessions-panel">
        <div>
          <div className="px-4 py-4 sm:px-5"><h3 className="text-xs font-bold text-slate-900 dark:text-white">Counselling sessions overview</h3><p className="mt-1 text-[10px] text-slate-500">A scheduled or rescheduled session is never counted as completed.</p></div>
          <div id="session-table" className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-slate-50 text-[10px] text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Student / Enquiry ID</th><th className="px-4 py-3">Interested programme</th><th className="px-4 py-3">Assigned counselor</th><th className="px-4 py-3">Session date & time</th><th className="px-4 py-3">Mode</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Outcome</th><th className="px-4 py-3">Outcome report</th><th className="px-4 py-3">Demo student</th></tr></thead>
              <tbody>
                {filteredSessions.map((session) => <SessionTableRow key={session.id} session={session} onOpenEnquiry={(id) => setDrawer({ type: 'enquiry', id })} />)}
                {!filteredSessions.length && <tr><td colSpan={9}><EmptyState>No sessions match the selected date, programme and counselor filters.</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
      }

      {activeDashboardTab === 'admissions' && <Panel title="Admission conversion" subtitle="Conversion denominator: admitted enquiry records divided by all enquiries in the selected cohort. A single enquiry counts once." id="conversion">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total Admissions" value={admittedRecords.length} detail="Enquiries in Admitted stage" icon={GraduationCap} tone="emerald" href="#pipeline" />
          <MetricCard label="Admission Conversion Rate" value={`${conversionRate.toFixed(1)}%`} detail={`${admittedRecords.length} / ${filteredEnquiries.length} selected enquiries`} icon={ArrowUpRight} tone="violet" href="#pipeline" />
          <MetricCard label="Admissions in Progress" value={admissionsInProgress.length} detail="Admission checklist underway" icon={Clock3} tone="blue" href="#pipeline" />
          <MetricCard label="Pending Admission Decisions" value={admissionDecisionsPending.length} detail="Awaiting a recorded decision" icon={FileCheck2} tone="amber" href="#pipeline" />
          <MetricCard label="Programme with Highest Admissions" value={topProgramme?.admissions ? topProgramme.programme : '—'} detail={`${topProgramme?.admissions ?? 0} admissions in the selected cohort`} icon={GraduationCap} tone="blue" href="#programme-analytics" />
          <MetricCard label="Counselor with Highest Conversion" value={highestConversionCounselor?.counselor.name ?? '—'} detail={highestConversionCounselor ? `${highestConversionCounselor.conversion.toFixed(1)}% · ${highestConversionCounselor.admissions.length}/${highestConversionCounselor.enquiries.length} enquiries` : 'No conversion data'} icon={UserRoundCheck} tone="violet" href="#counselor-conversion" />
        </div>
        <div className="grid gap-4 p-4 pt-0 xl:grid-cols-2">
          <div id="pipeline" className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Enquiry-to-admission pipeline</h3>
            <p className="mt-1 text-[10px] text-slate-500">Exclusive current stage per enquiry · stage counts total {filteredEnquiries.length}.</p>
            <div className="mt-4 space-y-3">
              {pipelineStages.map((stage, index) => {
                const count = filteredEnquiries.filter((enquiry) => enquiry.stage === stage).length;
                const percentage = filteredEnquiries.length ? (count / filteredEnquiries.length) * 100 : 0;
                return <div key={stage}><div className="mb-1 flex justify-between gap-3 text-[10px]"><span className="text-slate-600 dark:text-slate-300">{index + 1}. {stage}</span><span className="font-semibold text-slate-800 dark:text-slate-200">{count} · {percentage.toFixed(0)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600" style={{ width: `${percentage}%` }} /></div></div>;
              })}
            </div>
          </div>
          <div id="programme-analytics" className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">Programme-wise admission analytics</h3>
            <p className="mt-1 text-[10px] text-slate-500">Enquiries and admitted records by catalogue programme.</p>
            <div className="h-[320px] w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={programmeAnalytics.filter((row) => row.enquiries > 0)} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="programme" width={145} tick={{ fontSize: 9 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="enquiries" name="Enquiries" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="admissions" name="Admissions" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">{programmeAnalytics.filter((row) => row.enquiries > 0).map((row) => <span key={row.programme}>{row.programme}: {row.conversion}% conversion</span>)}</div>
          </div>
        </div>
        <div id="counselor-conversion" className="px-4 pb-5 sm:px-5">
          <h3 className="mb-3 text-xs font-bold text-slate-900 dark:text-white">Counselor-wise conversion</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[720px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Counselor</th><th className="px-3 py-3">Enquiries assigned</th><th className="px-3 py-3">Sessions completed</th><th className="px-3 py-3">Admissions generated</th><th className="px-3 py-3">Conversion rate</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{counselorMetrics.map((metrics) => <tr key={metrics.counselor.id}><td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{metrics.counselor.name}</td><td className="px-3 py-3">{metrics.enquiries.length}</td><td className="px-3 py-3">{metrics.completed.length}</td><td className="px-3 py-3">{metrics.admissions.length}</td><td className="px-3 py-3"><strong>{metrics.conversion.toFixed(1)}%</strong><span className="ml-2 text-slate-500">({metrics.admissions.length}/{metrics.enquiries.length})</span></td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Conversion rate per counselor = admitted enquiries assigned to that counselor ÷ all filtered enquiries assigned to that counselor.</p>
        </div>
      </Panel>}

      {activeDashboardTab === 'enquiries' && <Panel title="Student enquiry management" subtitle="Search and sort prospective students using masked demo contact details. Click an enquiry to view its history, sessions and follow-up timeline." id="enquiries">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Total Enquiries" value={filteredEnquiries.length} detail="Current filtered cohort" icon={Search} tone="violet" href="#enquiry-table" />
          <MetricCard label="New Enquiries" value={newEnquiries.length} detail="Awaiting first meaningful contact" icon={Users} tone="blue" href="#enquiry-table" />
          <MetricCard label="Active Enquiries" value={activeEnquiries.length} detail="Excludes admitted and lost records" icon={UserRoundCheck} tone="emerald" href="#enquiry-table" />
          <MetricCard label="Follow-ups Pending" value={followUpsPending.length} detail="Open follow-ups due today or later" icon={Clock3} tone="amber" href="#enquiry-table" />
          <MetricCard label="Overdue Follow-ups" value={overdueFollowUps.length} detail="Open follow-ups past their due date" icon={CalendarDays} tone="rose" href="#enquiry-table" />
          <MetricCard label="Inactive Enquiries" value={inactiveEnquiries.length} detail="Active records with no contact for over 14 days" icon={Users} tone="amber" href="#enquiry-table" />
        </div>
        <div id="enquiry-table" className="border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col gap-3 p-4 sm:px-5">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={enquirySearch} onChange={(event) => setEnquirySearch(event.target.value)} placeholder="Search enquiry ID, student, programme or counselor" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-violet-950" />
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              <select aria-label="Filter enquiries by stage" value={stageFilter} onChange={(event) => setStageFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All stages</option>{pipelineStages.map((stage) => <option key={stage}>{stage}</option>)}</select>
              <select aria-label="Filter enquiries by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs dark:border-slate-700 dark:bg-slate-950"><option>All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 dark:border-slate-700"><ArrowDownWideNarrow className="h-4 w-4 text-slate-400" /><select aria-label="Sort enquiries" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="w-full bg-transparent py-2.5 text-xs outline-none"><option>Newest enquiry</option><option>Follow-up soon</option><option>Highest priority</option></select></label>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Enquiry ID</th><th className="px-4 py-3">Student / masked contact</th><th className="px-4 py-3">Interested programme</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Assigned counselor</th><th className="px-4 py-3">Enquiry date</th><th className="px-4 py-3">Current stage</th><th className="px-4 py-3">Last contact</th><th className="px-4 py-3">Next follow-up</th><th className="px-4 py-3">Priority</th></tr></thead>
              <tbody>
                {searchedEnquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3"><button type="button" aria-label={`Open ${enquiry.id} enquiry details`} onClick={() => setDrawer({ type: 'enquiry', id: enquiry.id })} className="font-bold text-violet-700 hover:underline dark:text-violet-300">{enquiry.id}</button></td>
                    <td className="px-4 py-3"><span className="block font-semibold text-slate-800 dark:text-slate-200">{enquiry.studentName}</span><span className="mt-1 flex items-center gap-1 text-slate-500"><Mail className="h-3 w-3" />{enquiry.emailMasked}</span><span className="mt-1 flex items-center gap-1 text-slate-500"><Phone className="h-3 w-3" />{enquiry.phoneMasked}</span></td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{enquiry.programme}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{enquiry.source}</td><td className="px-4 py-3 text-slate-600 dark:text-slate-300">{getCounselorName(enquiry.counselorId)}</td><td className="whitespace-nowrap px-4 py-3">{formatDate(enquiry.enquiryDate)}</td><td className="px-4 py-3"><Badge>{enquiry.stage}</Badge></td><td className="whitespace-nowrap px-4 py-3">{formatDate(enquiry.lastContactDate)}</td><td className="whitespace-nowrap px-4 py-3">{formatDate(enquiry.nextFollowUpDate)}</td><td className="px-4 py-3"><Badge>{enquiry.priority}</Badge></td>
                  </tr>
                ))}
                {!searchedEnquiries.length && <tr><td colSpan={10}><EmptyState>No enquiries match the current search and filters.</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-3 text-[10px] text-slate-500 sm:px-5">Showing {searchedEnquiries.length} illustrative enquiries · contacts are masked · sorting and filters apply only to this demo view.</p>
        </div>
      </Panel>}

      {activeDashboardTab === 'tasks' && <>
      <Panel title="Task transfer & delegation" subtitle="Illustrative transfer history only. Handoffs are shown for management visibility; this dashboard does not change shared task assignments." id="task-transfers">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Transferred Tasks" value={filteredTransfers.length} detail="Transfer history entries" icon={History} tone="violet" href="#transfer-history" />
          <MetricCard label="Pending Acceptance" value={pendingTransfers.length} detail="Waiting for receiving counselor" icon={Clock3} tone="amber" href="#transfer-history" />
          <MetricCard label="Accepted Transfers" value={acceptedTransfers.length} detail="Received by the new assignee" icon={BadgeCheck} tone="blue" href="#transfer-history" />
          <MetricCard label="Overdue Transfers" value={overdueTransfers.length} detail="Open handoffs past due date" icon={CalendarDays} tone="rose" href="#transfer-history" />
          <MetricCard label="Completed Transfers" value={completedTransfers.length} detail="Transfer work marked complete" icon={CheckCircle2} tone="emerald" href="#transfer-history" />
        </div>
        <div className="px-4 pb-5 sm:px-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-xs font-bold text-slate-900 dark:text-white">Recent transfer history</h3><p className="mt-1 text-[10px] text-slate-500">Repeated task IDs indicate that the same work item has changed assignee more than once.</p></div><Badge tone="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{repeatedTaskIds.size} repeatedly transferred task(s)</Badge></div>
          <div id="transfer-history" className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[900px] text-left"><thead className="bg-slate-50 text-[10px] text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Task ID</th><th className="px-4 py-3">Task</th><th className="px-4 py-3">Original → new assignee</th><th className="px-4 py-3">Transfer date</th><th className="px-4 py-3">Due date</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{[...filteredTransfers].sort((a, b) => b.transferDate.localeCompare(a.transferDate)).map((transfer) => <TransferTableRow key={transfer.id} transfer={transfer} onOpen={(id) => setDrawer({ type: 'transfer', id })} />)}{!filteredTransfers.length && <tr><td colSpan={6}><EmptyState>No task transfers match the current filters.</EmptyState></td></tr>}</tbody></table>
          </div>
        </div>
      </Panel>

      <Panel title="AI-based task completion reports" subtitle="Simulated AI/demo analysis based only on the completion notes shown; no AI model is running and no external work is verified." id="ai-reports">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Recent Reports" value={filteredReports.length} detail="Reports linked to completed demo tasks" icon={Sparkles} tone="violet" href="#report-list" />
          <MetricCard label="Awaiting Founder Review" value={awaitingFounderReview.length} detail="Review status is illustrative" icon={FileCheck2} tone="amber" href="#report-list" />
          <MetricCard label="Tasks Completed Late" value={lateCompletionReports.length} detail="Completion date is after due date" icon={Clock3} tone="rose" href="#report-list" />
          <MetricCard label="Require Further Action" value={furtherActionReports.length} detail="Based on the example report fields" icon={ArrowRight} tone="blue" href="#report-list" />
          <MetricCard label="Repeated Handoffs" value={repeatedTaskIds.size} detail="Repeated task IDs in transfer log" icon={Handshake} tone="amber" href="#task-transfers" />
        </div>
        <div className="px-4 pb-5 sm:px-5">
          <div className="mb-3 rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-[10px] leading-5 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-200">
            <strong>Simulated AI report workflow:</strong> Task completion notes → illustrative analysis → founder review. Reports are examples, not model-generated findings.
          </div>
          <div id="report-list" className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[900px] text-left text-[10px]">
              <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/50"><tr><th className="px-4 py-3">Report / task</th><th className="px-4 py-3">Counselor</th><th className="px-4 py-3">Completed</th><th className="px-4 py-3">Timeliness</th><th className="px-4 py-3">Founder review</th><th className="px-4 py-3">Next action</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...filteredReports].sort((a, b) => b.completedAt.localeCompare(a.completedAt)).map((report) => {
                  const late = report.completedAt > report.dueDate;
                  return <tr key={report.id}><td className="px-4 py-3"><button type="button" onClick={() => setDrawer({ type: 'report', id: report.id })} className="text-left"><span className="block font-bold text-violet-700 dark:text-violet-300">{report.id} · {report.taskId}</span><span className="mt-1 block text-slate-600 dark:text-slate-300">{report.taskTitle}</span></button></td><td className="px-4 py-3">{getCounselorName(report.counselorId)}</td><td className="px-4 py-3">{formatDate(report.completedAt)}</td><td className="px-4 py-3"><Badge tone={late ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}>{late ? 'Completed late' : 'On time'}</Badge></td><td className="px-4 py-3"><Badge>{report.founderReviewStatus}</Badge></td><td className="px-4 py-3">{report.requiresFurtherAction ? <Badge tone="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">Follow-up recommended</Badge> : <span className="text-slate-500">No further action flagged</span>}</td></tr>;
                })}
                {!filteredReports.length && <tr><td colSpan={6}><EmptyState>No completion reports match the current filters.</EmptyState></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </Panel>
      </>}

      {activeDashboardTab === 'attention' && <Panel title="Founder attention required" subtitle="Illustrative rules surface records for review; they do not represent verified student or counselor performance." id="attention">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {attentionItems.map((item) => (
            <button key={item.id} type="button" onClick={() => openAttentionItem(item)} className="flex w-full flex-col justify-between gap-3 px-4 py-4 text-left transition hover:bg-violet-50/50 dark:hover:bg-violet-950/20 sm:flex-row sm:items-center sm:px-5">
              <span className="min-w-0"><span className="block text-xs font-semibold text-slate-900 dark:text-white">{item.title}</span><span className="mt-1 block text-[10px] text-slate-500">{item.detail}</span></span>
              <span className="flex flex-wrap gap-2">{item.reasons.map((reason) => <Badge key={reason} tone={item.priority === 'High' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}>{reason}</Badge>)}</span>
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
            </button>
          ))}
          {!attentionItems.length && <EmptyState>No illustrative attention indicators match these filters.</EmptyState>}
        </div>
      </Panel>}
      </DashboardTabs>

      {drawer && (
        <div className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawer(null); }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="counselor-drawer-title" className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">Founder review · Demo record</p>
                <h2 id="counselor-drawer-title" className="mt-1 truncate text-base font-bold text-slate-900 dark:text-white">
                  {selectedEnquiry?.id ?? selectedCounselor?.name ?? selectedTransfer?.taskId ?? selectedReport?.id ?? 'Details'}
                </h2>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {selectedEnquiry?.studentName ?? selectedCounselor?.title ?? selectedTransfer?.title ?? selectedReport?.taskTitle}
                </p>
              </div>
              <button type="button" aria-label="Close detail drawer" onClick={() => setDrawer(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {selectedEnquiry && <EnquiryDetail enquiry={selectedEnquiry} onOpenCounselor={(id) => setDrawer({ type: 'counselor', id })} />}
              {selectedCounselor && <CounselorDetail counselorId={selectedCounselor.id} onOpenEnquiry={(id) => setDrawer({ type: 'enquiry', id })} />}
              {selectedTransfer && <TransferDetail transfer={selectedTransfer} />}
              {selectedReport && <CompletionReportDetail report={selectedReport} />}
            </div>
            <footer className="border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-6">
              <p className="text-[10px] text-slate-500">Illustrative demo information only · no records are saved or changed.</p>
            </footer>
          </aside>
        </div>
      )}
    </div>
  );
}

function EnquiryDetail({
  enquiry,
  onOpenCounselor,
}: {
  enquiry: CounselorEnquiry;
  onOpenCounselor: (id: string) => void;
}) {
  const sessions = demoCounselorSessions.filter((session) => session.enquiryId === enquiry.id);
  const admissions = demoCounselorAdmissions.filter((admission) => admission.enquiryId === enquiry.id);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Student" value={enquiry.studentName} />
        <DetailField label="Enquiry stage" value={<Badge>{enquiry.stage}</Badge>} />
        <DetailField label="Email (masked)" value={enquiry.emailMasked} />
        <DetailField label="Phone (masked)" value={enquiry.phoneMasked} />
        <DetailField label="Interested programme" value={enquiry.programme} />
        <DetailField label="Source / priority" value={`${enquiry.source} · ${enquiry.priority}`} />
        <DetailField label="Enquiry date" value={formatDate(enquiry.enquiryDate)} />
        <DetailField label="Assigned counselor" value={<button type="button" onClick={() => onOpenCounselor(enquiry.counselorId)} className="font-semibold text-violet-700 hover:underline dark:text-violet-300">{getCounselorName(enquiry.counselorId)}</button>} />
        <DetailField label="Last contact" value={formatDate(enquiry.lastContactDate)} />
        <DetailField label="Next follow-up" value={formatDate(enquiry.nextFollowUpDate)} />
      </div>
      <div>
        <h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Enquiry and follow-up timeline</h3>
        <ol className="space-y-3 border-l border-violet-200 pl-4 dark:border-violet-900">
          {[...enquiry.history].sort((a, b) => a.date.localeCompare(b.date)).map((event, index) => <li key={`${event.date}-${event.title}-${index}`} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500 dark:border-slate-900" /><p className="text-[10px] font-semibold text-slate-700 dark:text-slate-200">{formatDate(event.date)} · {event.title}</p><p className="mt-1 text-[10px] leading-5 text-slate-500">{event.detail}</p></li>)}
          {enquiry.nextFollowUpDate && <li className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500 dark:border-slate-900" /><p className="text-[10px] font-semibold text-amber-700 dark:text-amber-300">Next follow-up · {formatDate(enquiry.nextFollowUpDate)}</p><p className="mt-1 text-[10px] text-slate-500">Planned follow-up date from the illustrative enquiry record.</p></li>}
        </ol>
      </div>
      <div>
        <h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Counselling sessions</h3>
        {sessions.length ? <div className="space-y-2">{sessions.map((session) => <div key={session.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[10px] font-semibold">{formatDate(session.sessionDate)} · {session.sessionTime} · {session.mode}</p><Badge>{session.status}</Badge></div><p className="mt-1 text-[10px] text-slate-500">{session.programme} · {session.outcome ?? 'Outcome not recorded'}</p>{session.rescheduledTo && <p className="mt-1 text-[10px] text-amber-700 dark:text-amber-300">Rescheduled to {formatDate(session.rescheduledTo)}</p>}</div>)}</div> : <EmptyState>No counselling sessions are linked to this enquiry.</EmptyState>}
      </div>
      {admissions.length > 0 && <div><h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Admission records</h3>{admissions.map((admission) => <div key={admission.id} className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="text-[10px] text-slate-600 dark:text-slate-300">{admission.id} · updated {formatDate(admission.lastUpdatedAt)}</span><Badge>{admission.status}</Badge></div>)}</div>}
    </div>
  );
}

function CounselorDetail({
  counselorId,
  onOpenEnquiry,
}: {
  counselorId: string;
  onOpenEnquiry: (id: string) => void;
}) {
  const counselor = demoCounselors.find((item) => item.id === counselorId);
  const enquiries = demoCounselorEnquiries.filter((enquiry) => enquiry.counselorId === counselorId);
  const sessions = demoCounselorSessions.filter((session) => session.counselorId === counselorId);
  const transfers = demoCounselorTaskTransfers.filter(
    (transfer) => transfer.originalCounselorId === counselorId || transfer.newCounselorId === counselorId
  );
  const activeCount = enquiries.filter(isActiveEnquiry).length;
  const overdueCount = enquiries.filter(
    (enquiry) => isActiveEnquiry(enquiry) && enquiry.nextFollowUpDate && enquiry.nextFollowUpDate < COUNSELOR_DEMO_TODAY
  ).length;
  const completedCount = sessions.filter((session) => session.status === 'Completed').length;
  const upcomingCount = sessions.filter(
    (session) => session.status === 'Scheduled' || session.status === 'Rescheduled'
  ).length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Assigned enquiries" value={enquiries.length} />
        <StatTile label="Active enquiries" value={activeCount} />
        <StatTile label="Sessions completed" value={completedCount} />
        <StatTile label="Upcoming sessions" value={upcomingCount} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Role" value={counselor?.title ?? 'Counselor'} />
        <DetailField label="Workload" value={`${Math.min(100, activeCount * 7 + upcomingCount * 12 + overdueCount * 18 + enquiries.filter((item) => item.priority === 'High' && !item.lastContactDate).length * 10)}% illustrative utilization`} />
        <DetailField label="Pending follow-ups" value={enquiries.filter((item) => isActiveEnquiry(item) && item.nextFollowUpDate && item.nextFollowUpDate >= COUNSELOR_DEMO_TODAY).length} />
        <DetailField label="Overdue work" value={overdueCount} />
      </div>
      <div><h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Assigned enquiries</h3><div className="space-y-2">{enquiries.map((enquiry) => <button key={enquiry.id} type="button" onClick={() => onOpenEnquiry(enquiry.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-violet-300 dark:border-slate-800"><span><span className="block text-[10px] font-semibold">{enquiry.id} · {enquiry.studentName}</span><span className="mt-1 block text-[10px] text-slate-500">{enquiry.programme} · {enquiry.stage}</span></span><ArrowRight className="h-4 w-4 text-violet-600" /></button>)}</div></div>
      <div><h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Task transfer involvement</h3>{transfers.length ? transfers.map((transfer) => <div key={transfer.id} className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="text-[10px]">{transfer.taskId} · {transfer.title}</span><Badge>{transfer.status}</Badge></div>) : <p className="text-[10px] text-slate-500">No illustrative task transfers.</p>}</div>
    </div>
  );
}

function TransferDetail({ transfer }: { transfer: CounselorTaskTransfer }) {
  const chain = demoCounselorTaskTransfers
    .filter((item) => item.taskId === transfer.taskId)
    .sort((a, b) => a.transferDate.localeCompare(b.transferDate));
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Task ID / category" value={`${transfer.taskId} · ${transfer.category}`} />
        <DetailField label="Priority / status" value={<span className="flex flex-wrap gap-2"><Badge>{transfer.priority}</Badge><Badge>{transfer.status}</Badge></span>} />
        <DetailField label="Original assignee" value={getCounselorName(transfer.originalCounselorId)} />
        <DetailField label="Receiving counselor" value={getCounselorName(transfer.newCounselorId)} />
        <DetailField label="Transferred by / date" value={`${transfer.transferredBy} · ${formatDate(transfer.transferDate)}`} />
        <DetailField label="Due date" value={formatDate(transfer.dueDate)} />
        <DetailField label="Transfer reason" value={transfer.reason} />
      </div>
      <div><h3 className="mb-2 text-xs font-bold text-slate-900 dark:text-white">Transfer history for {transfer.taskId}</h3><ol className="space-y-3 border-l border-violet-200 pl-4 dark:border-violet-900">{chain.map((entry) => <li key={entry.id} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-violet-500 dark:border-slate-900" /><p className="text-[10px] font-semibold">{formatDate(entry.transferDate)} · {getCounselorName(entry.originalCounselorId)} → {getCounselorName(entry.newCounselorId)}</p><p className="mt-1 text-[10px] text-slate-500">{entry.reason}</p><Badge>{entry.status}</Badge></li>)}</ol></div>
    </div>
  );
}

function CompletionReportDetail({ report }: { report: CounselorCompletionReport }) {
  const late = report.completedAt > report.dueDate;
  const sections = [
    ['Task Summary', `${report.taskId} · ${report.taskTitle}`],
    ['Work Performed', report.workSummary],
    ['Completion Outcome', report.outcome],
    ['Completion Timeliness', `Due ${formatDate(report.dueDate)} · completed ${formatDate(report.completedAt)} · ${late ? 'Late' : 'On time'}`],
    ['Quality Assessment', report.qualityAssessment],
    ['Issues and Blockers', report.issuesAndBlockers],
    ['Improvement Recommendations', report.recommendations],
    ['Overall AI Analysis', report.overallAnalysis],
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2"><Badge tone="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">Simulated AI / Demo</Badge><Badge>{report.founderReviewStatus}</Badge>{report.requiresFurtherAction && <Badge tone="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">Further action flagged</Badge>}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailField label="Assigned counselor" value={getCounselorName(report.counselorId)} />
        <DetailField label="Task category / priority" value={`${report.category} · ${report.priority}`} />
        <DetailField label="Linked enquiry" value={report.enquiryId} />
        <DetailField label="Linked session" value={report.sessionId ?? 'No linked session'} />
      </div>
      {sections.map(([title, detail]) => <section key={title} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h3 className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-700 dark:text-slate-200">{detail}</p></section>)}
      <p className="rounded-xl bg-amber-50 p-3 text-[10px] leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">This is fixed illustrative report content. It is not generated by a live AI model and does not verify work beyond the demo notes.</p>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p><div className="mt-1 break-words text-[11px] font-medium text-slate-800 dark:text-slate-200">{value}</div></div>;
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-950/30"><p className="text-[9px] text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{value}</p></div>;
}
