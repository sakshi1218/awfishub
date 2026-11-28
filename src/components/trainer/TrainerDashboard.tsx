'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  GraduationCap,
  Search,
  Users,
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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  DEMO_TODAY,
  demoAssessmentEvaluationProgress,
  demoAttendanceTrend,
  demoBatches,
  demoFaculty,
  demoStudents,
  demoTrainerSessions,
  demoTrainerWorkItems,
} from '@/lib/lms-demo-data';

type TrainerTab = 'Overview' | 'Workload' | 'Sessions' | 'Batches' | 'Performance';
type WorkloadFilter = 'All workloads' | 'Balanced' | 'Busy' | 'High';

const trainerTabs: TrainerTab[] = ['Overview', 'Workload', 'Sessions', 'Batches', 'Performance'];
const dashboardTabs = [
  { id: 'team', label: 'Overview', icon: Users },
  { id: 'sessions', label: "Today's Sessions", icon: CalendarDays },
  { id: 'batches', label: 'Batches', icon: BookOpen },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'attention', label: 'Attention Required', icon: ClipboardCheck },
] as const;
const daysToMillis = 24 * 60 * 60 * 1000;

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function getBatchMetrics(batchId: string) {
  const learners = demoStudents.filter(
    (student) => student.batchId === batchId && student.status !== 'Upcoming'
  );
  const average = (selector: (value: (typeof learners)[number]) => number) =>
    learners.length
      ? Math.round(learners.reduce((total, learner) => total + selector(learner), 0) / learners.length)
      : 0;
  const batch = demoBatches.find((item) => item.id === batchId);
  const attendance = average((learner) => learner.attendance);
  const progress = average((learner) => learner.progress);
  const evaluation = batch?.assessmentCompletion ?? 0;
  let health: 'On Track' | 'Needs Attention' | 'At Risk' = 'On Track';

  if (batch?.status === 'Active') {
    if (attendance < 75 || progress < 40 || evaluation < 40) health = 'At Risk';
    else if (attendance < 85 || progress < 60 || evaluation < 70) health = 'Needs Attention';
  }

  return { learners, attendance, progress, evaluation, health };
}

function getTrainerMetrics(facultyId: string) {
  const batches = demoBatches.filter((batch) => batch.facultyId === facultyId);
  const activeBatches = batches.filter((batch) => batch.status === 'Active');
  const students = demoStudents.filter(
    (student) =>
      batches.some((batch) => batch.id === student.batchId) &&
      student.status !== 'Completed'
  );
  const activeLearners = students.filter(
    (student) => student.status === 'Active' || student.status === 'At risk'
  );
  const sessions = demoTrainerSessions.filter((session) => session.facultyId === facultyId);
  const assignedSessions = sessions.filter(
    (session) => session.status !== 'Cancelled' && session.status !== 'Rescheduled'
  );
  const conductedSessions = sessions.filter((session) => session.status === 'Completed');
  const scheduledSessions = sessions.filter(
    (session) => session.status === 'Scheduled' || session.status === 'In Progress'
  );
  const work = demoTrainerWorkItems.filter((item) => item.facultyId === facultyId);
  const pendingWork = work.filter((item) => item.status !== 'Completed');
  const overdueWork = pendingWork.filter((item) => item.dueDate < DEMO_TODAY);
  const priorityPoints = pendingWork.reduce(
    (total, item) => total + (item.priority === 'High' ? 3 : item.priority === 'Medium' ? 2 : 1),
    0
  );
  const nextWeek = new Date(`${DEMO_TODAY}T00:00:00`).getTime() + 7 * daysToMillis;
  const scheduledNextWeek = sessions.filter((session) => {
    const date = new Date(`${session.sessionDate}T00:00:00`).getTime();
    return (
      date >= new Date(`${DEMO_TODAY}T00:00:00`).getTime() &&
      date <= nextWeek &&
      (session.status === 'Scheduled' || session.status === 'In Progress')
    );
  }).length;
  const workloadScore = Math.min(100, activeBatches.length * 20 + scheduledNextWeek * 10 + priorityPoints * 5);
  const workload =
    workloadScore >= 66 ? 'High' : workloadScore >= 36 ? 'Busy' : 'Balanced';
  const reportableSessions = conductedSessions;
  const reportsSubmitted = reportableSessions.filter((session) => session.reportSubmitted).length;
  const evaluations = demoAssessmentEvaluationProgress.find(
    (entry) => entry.trainer === demoFaculty.find((member) => member.id === facultyId)?.name
  );
  const averageProgress = activeLearners.length
    ? Math.round(activeLearners.reduce((total, student) => total + student.progress, 0) / activeLearners.length)
    : 0;

  return {
    batches,
    activeBatches,
    students,
    sessions,
    assignedSessions,
    conductedSessions,
    scheduledSessions,
    pendingWork,
    overdueWork,
    workloadScore,
    workload,
    trainingHours: conductedSessions.reduce((total, session) => total + session.durationHours, 0),
    reportRate: reportableSessions.length
      ? Math.round((reportsSubmitted / reportableSessions.length) * 100)
      : 100,
    evaluationRate: evaluations?.assigned
      ? Math.round((evaluations.evaluated / evaluations.assigned) * 100)
      : 0,
    averageProgress,
  };
}

function statusStyle(status: string) {
  if (status === 'Completed' || status === 'On Track') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
  }
  if (status === 'In Progress' || status === 'Needs Attention' || status === 'Rescheduled') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
  }
  if (status === 'At Risk' || status === 'Cancelled') {
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
  }
  return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone ?? statusStyle(String(children))}`}>
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
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-6 rounded-2xl border border-[#ece9f4] bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:px-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
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
  value: number | string;
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
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold leading-4 text-slate-800 dark:text-slate-100">{label}</p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{detail}</p>
    </>
  );
  const className = "group flex min-h-[120px] w-full flex-col rounded-2xl border border-[#e7e2ef] bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-slate-800 dark:bg-slate-900";

  if (onClick) return <button type="button" onClick={onClick} className={className}>{content}</button>;
  return <a href={href} className={className}>{content}</a>;
}

function SessionRow({ session }: { session: (typeof demoTrainerSessions)[number] }) {
  const trainer = demoFaculty.find((member) => member.id === session.facultyId);
  const sessionNotHeld = session.status === 'Cancelled' || session.status === 'Rescheduled';
  const attendanceStatus = session.attendanceSubmitted
    ? 'submitted'
    : sessionNotHeld
      ? 'not required'
      : session.status === 'Scheduled'
        ? 'not due'
        : 'pending';
  const reportStatus = session.reportSubmitted
    ? 'submitted'
    : sessionNotHeld
      ? 'not required'
      : session.status === 'Completed'
        ? 'pending'
        : 'not due';
  const badgeTone = (value: string) =>
    value === 'submitted'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
      : value === 'pending'
        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  return (
    <article className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] sm:items-center sm:px-5">
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-white">{session.title}</p>
        <p className="mt-1 text-[10px] text-slate-500">{session.course}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {session.batchId} · {trainer?.name ?? 'Trainer unassigned'}
        </p>
      </div>
      <div className="text-[10px] text-slate-600 dark:text-slate-300">
        <p className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{formatDate(session.sessionDate)} · {session.startTime}–{session.endTime}</p>
        <p className="mt-1">{session.location} · {session.mode}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Badge>{session.status}</Badge>
        <Badge tone={badgeTone(attendanceStatus)}>Attendance {attendanceStatus}</Badge>
        <Badge tone={badgeTone(reportStatus)}>Report {reportStatus}</Badge>
        {session.rescheduledTo && (
          <span className="w-full text-right text-[10px] text-amber-700 dark:text-amber-300">
            Rescheduled to {formatDate(session.rescheduledTo)}
          </span>
        )}
      </div>
    </article>
  );
}

function WorkItemRow({ item }: { item: (typeof demoTrainerWorkItems)[number] }) {
  const overdue = item.status !== 'Completed' && item.dueDate < DEMO_TODAY;
  return (
    <article className="flex flex-col justify-between gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center sm:px-5">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          {item.category} · {item.batchId} · due {formatDate(item.dueDate)}
          {item.sessionDate && item.sessionTime && ` · session ${formatDate(item.sessionDate)} at ${item.sessionTime}`}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone={item.priority === 'High'
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            : item.priority === 'Medium'
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>
            {item.priority} priority
          </Badge>
          {overdue && <Badge tone="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200">Overdue</Badge>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge>{item.status}</Badge>
        <Link href={`/learning/batches/${item.batchId}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-violet-700 hover:border-violet-300 dark:border-slate-700 dark:text-violet-300">
          Batch <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}

export default function TrainerDashboard() {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<TrainerTab>('Overview');
  const [activeDashboardTab, setActiveDashboardTab] = useState('team');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [workloadFilter, setWorkloadFilter] = useState<WorkloadFilter>('All workloads');
  const todaySessions = demoTrainerSessions.filter((session) => session.sessionDate === DEMO_TODAY);
  const completedToday = todaySessions.filter((session) => session.status === 'Completed').length;
  const pendingReports = demoTrainerSessions.filter(
    (session) => session.status === 'Completed' && !session.reportSubmitted
  ).length;
  const pendingEvaluations = demoTrainerWorkItems.filter(
    (item) => item.category === 'Assessment review' && item.status !== 'Completed'
  ).length;
  const activeTrainers = demoFaculty.filter((trainer) => trainer.status === 'Assigned').length;
  const activeBatches = demoBatches.filter((batch) => batch.status === 'Active');
  const activeStudents = demoStudents.filter(
    (student) => student.status === 'Active' || student.status === 'At risk'
  );
  const batchMetrics = demoBatches.map((batch) => ({ batch, ...getBatchMetrics(batch.id) }));
  const batchesNeedingAttention = batchMetrics.filter(
    ({ batch, health }) => batch.status === 'Active' && health !== 'On Track'
  ).length;
  const performanceRows = demoFaculty.map((trainer) => ({
    trainer: trainer.name.split(' ')[0],
    assigned: getTrainerMetrics(trainer.id).assignedSessions.length,
    conducted: getTrainerMetrics(trainer.id).conductedSessions.length,
    completion: getTrainerMetrics(trainer.id).assignedSessions.length
      ? Math.round(
          (getTrainerMetrics(trainer.id).conductedSessions.length /
            getTrainerMetrics(trainer.id).assignedSessions.length) *
            100
        )
      : 0,
    workload: getTrainerMetrics(trainer.id).workloadScore,
    progress: getTrainerMetrics(trainer.id).averageProgress,
  }));
  const averageAttendance = activeStudents.length
    ? Math.round(activeStudents.reduce((total, student) => total + student.attendance, 0) / activeStudents.length)
    : 0;
  const averageStudentProgress = activeStudents.length
    ? Math.round(activeStudents.reduce((total, student) => total + student.progress, 0) / activeStudents.length)
    : 0;
  const averageEvaluationRate = demoAssessmentEvaluationProgress.reduce(
    (total, entry) => total + entry.evaluated,
    0
  ) / demoAssessmentEvaluationProgress.reduce((total, entry) => total + entry.assigned, 0);
  const interventions = demoStudents.flatMap((student) => {
    if (student.status === 'Upcoming' || student.status === 'Completed') return [];
    const reasons = [
      ...(student.attendance < 80 ? ['Low attendance'] : []),
      ...(student.assessmentScore !== undefined && student.assessmentScore < 60
        ? ['Low assessment performance']
        : []),
      ...(student.progress < 50 ? ['Delayed course progress'] : []),
      ...(student.evaluationPending ? ['Missing evaluation'] : []),
    ];
    return reasons.length ? [{ student, reasons }] : [];
  });
  const filteredTrainers = useMemo(
    () =>
      demoFaculty.filter((trainer) => {
        const metrics = getTrainerMetrics(trainer.id);
        const searchMatches = `${trainer.name} ${trainer.designation} ${trainer.expertise}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const statusMatches = statusFilter === 'All statuses' || trainer.status === statusFilter;
        const workloadMatches = workloadFilter === 'All workloads' || metrics.workload === workloadFilter;
        return searchMatches && statusMatches && workloadMatches;
      }),
    [search, statusFilter, workloadFilter]
  );
  const selectedTrainer = demoFaculty.find((trainer) => trainer.id === selectedTrainerId);
  const selectedMetrics = selectedTrainer ? getTrainerMetrics(selectedTrainer.id) : undefined;
  const selectedWork = demoTrainerWorkItems.filter((item) => item.facultyId === selectedTrainerId);
  const selectedSessions = demoTrainerSessions.filter((session) => session.facultyId === selectedTrainerId);
  const selectedBatches = demoBatches.filter((batch) => batch.facultyId === selectedTrainerId);

  return (
    <div className="-m-4 min-h-full space-y-6 bg-[#f8f7ff] p-4 sm:p-6 lg:-m-8 lg:p-8 dark:bg-slate-950">
      <header className="relative isolate overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5 shadow-sm dark:border-slate-800 dark:from-violet-950/50 dark:via-slate-900 dark:to-blue-950/30 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-violet-100/60 dark:border-violet-900/20" />
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-violet-700 dark:hover:text-violet-300">Home</Link>
          <span aria-hidden="true">/</span><span>Department Workspaces</span>
          <span aria-hidden="true">/</span><span>Trainer</span>
        </nav>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-700 dark:border-violet-800 dark:bg-slate-900/80 dark:text-violet-300">
              <BookOpen className="h-3 w-3" /> Founder overview · Illustrative demo data
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-violet-950 dark:text-white sm:text-3xl">Trainer Department Overview</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Monitor trainer capacity, training delivery, batch health and learner outcomes.
            </p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Prototype only. Metrics, names and operational signals are illustrative, not live records.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2"><Link href="/departments" className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-violet-700 transition hover:border-violet-400 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300"><ArrowLeft className="h-4 w-4" /> Back to departments</Link><Link href="/trainer/schedule" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"><CalendarDays className="h-4 w-4" /> View schedule</Link></div>
        </div>
      </header>

      <DashboardTabs id="trainer-dashboard" ariaLabel="Trainer dashboard sections" tabs={dashboardTabs} value={activeDashboardTab} onChange={setActiveDashboardTab}>
      {activeDashboardTab === 'team' && <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard label="Active Trainers" value={activeTrainers} detail="In the team" icon={Users} tone="violet" href="#trainer-team" />
        <MetricCard label="Active Batches" value={activeBatches.length} detail="Currently running" icon={BookOpen} tone="blue" onClick={() => setActiveDashboardTab('batches')} />
        <MetricCard label="Learners" value={activeStudents.length} detail="In active batches" icon={GraduationCap} tone="emerald" onClick={() => setActiveDashboardTab('batches')} />
        <MetricCard label="Today" value={todaySessions.length} detail="Sessions scheduled" icon={CalendarDays} tone="amber" onClick={() => setActiveDashboardTab('sessions')} />
        <MetricCard label="Attendance" value={`${averageAttendance}%`} detail="Learner average" icon={CheckCircle2} tone="blue" onClick={() => setActiveDashboardTab('batches')} />
        <MetricCard label="Pending Reports" value={pendingReports} detail="Need submission" icon={ClipboardCheck} tone="rose" onClick={() => setActiveDashboardTab('sessions')} />
      </div>
      <Panel
        title="Trainer Team Sessions"
        subtitle="Today’s training delivery at a glance."
        id="trainer-sessions"
        className="hidden min-h-[320px]"
        action={<button type="button" onClick={() => setActiveDashboardTab('sessions')} className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300">View all sessions <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {todaySessions.length ? todaySessions.map((session) => <SessionRow key={session.id} session={session} />) : <p className="p-10 text-center text-sm text-slate-500">No sessions scheduled today.</p>}
        </div>
      </Panel>
      <Panel
        title="Trainer team"
        subtitle="Workload combines active batches, scheduled sessions and priority-weighted open work—not task count alone."
        id="trainer-team"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trainer, role or expertise" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-violet-950" />
          </label>
          <select aria-label="Filter trainers by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <option>All statuses</option><option>Assigned</option><option>Available</option>
          </select>
          <select aria-label="Filter trainers by workload" value={workloadFilter} onChange={(event) => setWorkloadFilter(event.target.value as WorkloadFilter)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <option>All workloads</option><option>Balanced</option><option>Busy</option><option>High</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[10px]">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950/60">
              <tr>
                <th className="px-4 py-3 font-semibold">Trainer</th><th className="px-3 py-3 font-semibold">Active batches</th>
                <th className="px-3 py-3 font-semibold">Assigned students</th><th className="px-3 py-3 font-semibold">Sessions conducted</th>
                <th className="px-3 py-3 font-semibold">Sessions scheduled</th><th className="px-3 py-3 font-semibold">Pending work</th>
                <th className="px-3 py-3 font-semibold">Overdue</th><th className="px-3 py-3 font-semibold">Workload</th><th className="px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTrainers.map((trainer) => {
                const metrics = getTrainerMetrics(trainer.id);
                return (
                  <tr key={trainer.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-950/20">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => { setSelectedTrainerId(trainer.id); setSelectedTab('Overview'); }} className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500" aria-label={`Open ${trainer.name} details`}>
                        <span className="block font-bold text-slate-900 dark:text-white">{trainer.name}</span>
                        <span className="mt-1 block text-slate-500">{trainer.designation} · {trainer.expertise}</span>
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{metrics.activeBatches.length}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{metrics.students.length}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{metrics.conductedSessions.length}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{metrics.scheduledSessions.length}</td>
                    <td className="px-3 py-3 text-slate-700 dark:text-slate-200">{metrics.pendingWork.length}</td>
                    <td className="px-3 py-3">{metrics.overdueWork.length ? <Badge tone="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{metrics.overdueWork.length} overdue</Badge> : <span className="text-slate-500">0</span>}</td>
                    <td className="px-3 py-3"><div className="flex items-center gap-2"><Badge tone={metrics.workload === 'High' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : metrics.workload === 'Busy' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'}>{metrics.workload}</Badge><span className="text-slate-500">{metrics.workloadScore}%</span></div></td>
                    <td className="px-3 py-3"><Badge tone={trainer.status === 'Assigned' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>{trainer.status}</Badge></td>
                  </tr>
                );
              })}
              {!filteredTrainers.length && <tr><td colSpan={9} className="px-4 py-8 text-center text-xs text-slate-500">No trainers match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="px-4 pb-4 text-[10px] text-slate-500">Workload estimate: active batch (20 points), scheduled sessions in 7 days (10 each), open work by priority (5 points per priority point); capped at 100.</p>
      </Panel>
      <Panel
        title="Trainer Team Sessions"
        subtitle="Today's training delivery at a glance."
        id="trainer-sessions-main"
        className="min-h-[320px]"
        action={<button type="button" onClick={() => setActiveDashboardTab('sessions')} className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300">View all sessions <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button>}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {todaySessions.length ? todaySessions.map((session) => <SessionRow key={session.id} session={session} />) : <p className="p-10 text-center text-sm text-slate-500">No sessions scheduled today.</p>}
        </div>
      </Panel>
      </>}

      {activeDashboardTab === 'sessions' && <Panel title="Today's sessions" subtitle="Delivery status and follow-up are shown separately so scheduled sessions are not counted as completed." id="sessions">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {todaySessions.map((session) => <SessionRow key={session.id} session={session} />)}
        </div>
      </Panel>}

      {activeDashboardTab === 'batches' && <Panel title="Batches overview" subtitle="Illustrative thresholds: On Track ≥85% attendance, ≥60% progress and ≥70% evaluation; At Risk if attendance <75%, progress <40% or evaluation <40%. Other active batches need attention." id="batches">
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {batchMetrics.map(({ batch, learners, attendance, progress, evaluation, health }) => {
            const trainer = demoFaculty.find((member) => member.id === batch.facultyId);
            return (
              <article key={batch.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">{batch.provider} · {batch.id}</p><h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{batch.course}</h3></div>
                  <Badge>{health}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-[10px]">
                  <span className="text-slate-500">Trainer<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{trainer?.name ?? 'Unassigned'}</strong></span>
                  <span className="text-slate-500">Batch status<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{batch.status}</strong></span>
                  <span className="text-slate-500">Active students<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{learners.length} / {batch.capacity}</strong></span>
                  <span className="text-slate-500">Attendance<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{attendance}%</strong></span>
                  <span className="text-slate-500">Course progress<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{progress}%</strong></span>
                  <span className="text-slate-500">Assessment completion<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{evaluation}%</strong></span>
                  <span className="text-slate-500">Start date<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{formatDate(batch.startDate)}</strong></span>
                  <span className="text-slate-500">Expected completion<strong className="mt-1 block text-xs text-slate-800 dark:text-slate-200">{formatDate(batch.endDate)}</strong></span>
                </div>
                <Link href={`/learning/batches/${batch.id}`} className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300">Open batch <ArrowRight className="h-3 w-3" /></Link>
              </article>
            );
          })}
        </div>
      </Panel>}

      {activeDashboardTab === 'performance' && <Panel title="Delivery & outcomes" subtitle="Key trainer performance indicators." id="performance">
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <div className="hidden rounded-xl border border-slate-100 p-3 dark:border-slate-800">
            <h3 className="px-2 pt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">Sessions assigned vs conducted · completion rate</h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceRows} margin={{ top: 8, right: 12, left: -18, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="trainer" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="assigned" name="Sessions assigned" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conducted" name="Sessions conducted" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="px-2 text-[10px] text-slate-500">{performanceRows.map((row) => `${row.trainer}: ${row.completion}%`).join(' · ')}</p>
          </div>
          <div className="hidden rounded-xl border border-slate-100 p-3 dark:border-slate-800">
            <h3 className="px-2 pt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">Attendance trend · weekly</h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demoAttendanceTrend} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                  <Line type="monotone" dataKey="attendance" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="px-2 text-[10px] text-slate-500">Active student attendance average: {averageAttendance}%</p>
          </div>
          <div className="hidden rounded-xl border border-slate-100 p-3 dark:border-slate-800">
            <h3 className="px-2 pt-1 text-xs font-semibold text-slate-800 dark:text-slate-200">Workload distribution · weighted estimate</h3>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceRows} margin={{ top: 8, right: 12, left: -18, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="trainer" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Weighted workload']} />
                  <Bar dataKey="workload" name="Weighted workload" radius={[4, 4, 0, 0]}>
                    {performanceRows.map((row) => <Cell key={row.trainer} fill={row.workload >= 66 ? '#e11d48' : row.workload >= 36 ? '#d97706' : '#7c3aed'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Delivery & outcomes</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950/30"><p className="text-[10px] text-slate-500">Report completion</p><p className="mt-1 text-xl font-bold text-violet-700 dark:text-violet-300">{demoTrainerSessions.filter((session) => session.status === 'Completed' && session.reportSubmitted).length}/{demoTrainerSessions.filter((session) => session.status === 'Completed').length}</p></div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30"><p className="text-[10px] text-slate-500">Evaluation completion</p><p className="mt-1 text-xl font-bold text-blue-700 dark:text-blue-300">{Math.round(averageEvaluationRate * 100)}%</p></div>
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30"><p className="text-[10px] text-slate-500">Average learner progress</p><p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">{averageStudentProgress}%</p></div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30"><p className="text-[10px] text-slate-500">Training hours delivered</p><p className="mt-1 text-xl font-bold text-amber-700 dark:text-amber-300">{demoTrainerSessions.filter((session) => session.status === 'Completed').reduce((total, session) => total + session.durationHours, 0)} hrs</p></div>
            </div>
            <div className="mt-4 space-y-2">
              {demoAssessmentEvaluationProgress.map((row) => {
                const rate = Math.round((row.evaluated / row.assigned) * 100);
                return <div key={row.trainer}><div className="flex justify-between text-[10px] text-slate-500"><span>{row.trainer} · evaluations</span><span>{row.evaluated}/{row.assigned}</span></div><div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${rate}%` }} /></div></div>;
              })}
            </div>
          </div>
        </div>
      </Panel>}

      {activeDashboardTab === 'attention' && <Panel title="Learner intervention indicators" subtitle="Illustrative demo signals only—not actual learner records. Thresholds: attendance <80%, assessment score <60%, progress <50%, or evaluation pending." id="interventions">
        {interventions.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interventions.map(({ student, reasons }) => (
              <div key={student.id} className="flex flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div><p className="text-xs font-semibold text-slate-900 dark:text-white">Demo learner · {student.id}</p><p className="mt-1 text-[10px] text-slate-500">{demoBatches.find((batch) => batch.id === student.batchId)?.name}</p></div>
                <div className="flex flex-wrap gap-2">{reasons.map((reason) => <Badge key={reason} tone="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">{reason}</Badge>)}</div>
                <Link href={`/learning/batches/${student.batchId}`} className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">Review batch <ArrowRight className="h-3 w-3" /></Link>
              </div>
            ))}
          </div>
        ) : <p className="p-5 text-xs text-slate-500">No illustrative intervention indicators.</p>}
      </Panel>}
      </DashboardTabs>

      {selectedTrainer && selectedMetrics && (
        <div className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTrainerId(null); }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="trainer-details-title" className="ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
              <div><p className="text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">Trainer profile</p><h2 id="trainer-details-title" className="mt-1 text-base font-bold text-slate-900 dark:text-white">{selectedTrainer.name}</h2><p className="mt-1 text-xs text-slate-500">{selectedTrainer.designation} · {selectedTrainer.expertise}</p></div>
              <button type="button" aria-label="Close trainer details" onClick={() => setSelectedTrainerId(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
            </header>
            <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-4 dark:border-slate-800 sm:px-6" role="tablist" aria-label="Trainer details">
              {trainerTabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={selectedTab === tab} onClick={() => setSelectedTab(tab)} className={`shrink-0 border-b-2 px-3 py-3 text-[11px] font-semibold ${selectedTab === tab ? 'border-violet-600 text-violet-700 dark:text-violet-300' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}>{tab}</button>)}
            </div>
            <div className="flex-1 overflow-y-auto">
              {selectedTab === 'Overview' && <div className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-violet-50 p-3 dark:bg-violet-950/30"><p className="text-[10px] text-slate-500">Active batches</p><p className="mt-1 text-lg font-bold">{selectedMetrics.activeBatches.length}</p></div>
                  <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30"><p className="text-[10px] text-slate-500">Assigned students</p><p className="mt-1 text-lg font-bold">{selectedMetrics.students.length}</p></div>
                  <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30"><p className="text-[10px] text-slate-500">Sessions conducted</p><p className="mt-1 text-lg font-bold">{selectedMetrics.conductedSessions.length}</p></div>
                  <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30"><p className="text-[10px] text-slate-500">Workload</p><p className="mt-1 text-lg font-bold">{selectedMetrics.workloadScore}%</p></div>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Current work</h3><span className="text-[10px] text-slate-500">{selectedMetrics.pendingWork.length} open · {selectedMetrics.overdueWork.length} overdue</span></div><div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">{selectedWork.slice(0, 3).map((item) => <WorkItemRow key={item.id} item={item} />)}</div>{selectedWork.length > 3 && <button type="button" onClick={() => setSelectedTab('Workload')} className="mt-3 text-[10px] font-semibold text-violet-700 dark:text-violet-300">View all work</button>}</div>
                <div><h3 className="mb-2 text-xs font-bold">Assigned batches</h3>{selectedBatches.length ? selectedBatches.map((batch) => <Link key={batch.id} href={`/learning/batches/${batch.id}`} className="mb-2 flex items-center justify-between rounded-xl border border-slate-200 p-3 text-xs hover:border-violet-300 dark:border-slate-800"><span>{batch.id} · {batch.course}</span><ArrowRight className="h-4 w-4 text-violet-600" /></Link>) : <p className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500 dark:bg-slate-800">No batch currently assigned.</p>}</div>
              </div>}
              {selectedTab === 'Workload' && <div className="p-4 sm:p-6">
                <div className="mb-4 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30"><div className="flex items-center justify-between text-xs"><span>Weighted workload</span><strong>{selectedMetrics.workload} · {selectedMetrics.workloadScore}%</strong></div><div className="mt-2 h-2 rounded-full bg-white dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600" style={{ width: `${selectedMetrics.workloadScore}%` }} /></div><p className="mt-2 text-[10px] text-slate-500">Combines active batches, scheduled sessions and priority-weighted open work.</p></div>
                <div className="mb-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Pending</p><strong className="text-lg">{selectedMetrics.pendingWork.length}</strong></div><div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Overdue</p><strong className="text-lg text-rose-600">{selectedMetrics.overdueWork.length}</strong></div><div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Active batches</p><strong className="text-lg">{selectedMetrics.activeBatches.length}</strong></div></div>
                <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">{selectedWork.length ? selectedWork.map((item) => <WorkItemRow key={item.id} item={item} />) : <p className="p-6 text-center text-xs text-slate-500">No work items assigned.</p>}</div>
              </div>}
              {selectedTab === 'Sessions' && <div className="divide-y divide-slate-100 dark:divide-slate-800">{selectedSessions.length ? selectedSessions.map((session) => <SessionRow key={session.id} session={session} />) : <p className="p-6 text-center text-xs text-slate-500">No sessions assigned.</p>}</div>}
              {selectedTab === 'Batches' && <div className="space-y-3 p-4 sm:p-6">{selectedBatches.length ? selectedBatches.map((batch) => { const metrics = getBatchMetrics(batch.id); return <article key={batch.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><h3 className="text-xs font-bold">{batch.id} · {batch.course}</h3><Badge>{metrics.health}</Badge></div><p className="mt-2 text-[10px] text-slate-500">{metrics.learners.length} active students · {metrics.attendance}% attendance · {metrics.progress}% progress</p><Link href={`/learning/batches/${batch.id}`} className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-violet-700 dark:text-violet-300">Open batch <ArrowRight className="h-3 w-3" /></Link></article>; }) : <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-500 dark:bg-slate-800">No batches assigned.</p>}</div>}
              {selectedTab === 'Performance' && <div className="space-y-4 p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Assigned vs conducted</p><strong className="mt-1 block text-lg">{selectedMetrics.assignedSessions.length} / {selectedMetrics.conductedSessions.length}</strong></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Completion rate</p><strong className="mt-1 block text-lg">{selectedMetrics.assignedSessions.length ? Math.round(selectedMetrics.conductedSessions.length / selectedMetrics.assignedSessions.length * 100) : 0}%</strong></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Training hours</p><strong className="mt-1 block text-lg">{selectedMetrics.trainingHours}</strong></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Reports submitted</p><strong className="mt-1 block text-lg">{selectedMetrics.reportRate}%</strong></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Evaluations completed</p><strong className="mt-1 block text-lg">{selectedMetrics.evaluationRate}%</strong></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><p className="text-[10px] text-slate-500">Student progress</p><strong className="mt-1 block text-lg">{selectedMetrics.averageProgress}%</strong></div></div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><p className="text-xs font-semibold">Completion context</p><p className="mt-2 text-[10px] leading-5 text-slate-500">Session completion uses conducted sessions divided by non-cancelled and non-rescheduled assignments. Training hours count completed sessions only. All displayed values are demo estimates.</p></div>
              </div>}
            </div>
            <footer className="border-t border-slate-100 px-5 py-3 dark:border-slate-800 sm:px-6"><p className="text-[10px] text-slate-500">Illustrative profile and metrics · no live trainer records</p></footer>
          </aside>
        </div>
      )}
    </div>
  );
}
