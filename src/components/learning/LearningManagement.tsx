'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { allCourses, courseCatalogue, slugifyCourse } from '@/lib/course-catalogue';
import CourseCatalogueCard from '@/components/learning/CourseCatalogueCard';
import {
  demoAssessments,
  demoBatches,
  demoEnrollmentTrend,
  demoFaculty,
  demoLearningOutcomes,
  demoStudents,
  type LearningAssessment,
  type LearningBatch,
  type LearningFaculty,
  type LearningStudent,
} from '@/lib/lms-demo-data';

type ModalName = 'batch' | 'student' | 'assessment' | 'faculty' | null;
type StudentSortKey = 'name' | 'progress' | 'attendance';

const pageDetails: Record<string, { title: string; description: string }> = {
  dashboard: {
    title: 'LMS Dashboard',
    description: 'A snapshot of programmes, batches, faculty, and learner activity.',
  },
  programmes: {
    title: 'Programmes',
    description: 'Browse programme providers and open a programme to see its supplied courses.',
  },
  courses: {
    title: 'Courses',
    description: 'Browse the supplied course catalogue by provider or programme.',
  },
  batches: {
    title: 'Batches',
    description: 'Review learning cohorts and their current schedules.',
  },
  faculty: {
    title: 'Faculty',
    description: 'Review faculty profiles and preview batch assignments.',
  },
  students: {
    title: 'Students',
    description: 'Search the demo learner directory and review course progress.',
  },
  enrollment: {
    title: 'Enrollment',
    description: 'Preview the student enrollment interface using temporary demo state.',
  },
  attendance: {
    title: 'Batch Attendance',
    description: 'Review and simulate attendance for a selected demo batch.',
  },
  assessments: {
    title: 'Assessments',
    description: 'Preview assessment schedules, submissions, and review status.',
  },
  progress: {
    title: 'Student Progress',
    description: 'Monitor demo learner progress across batches.',
  },
  'completion-reports': {
    title: 'Completion Reports',
    description: 'Review a sample completion overview for learning programmes.',
  },
};

const statusStyles: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
  Upcoming: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-950/40 dark:text-blue-300',
  Completed: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300',
  'At risk': 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-300',
  Draft: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-800 dark:text-slate-300',
  Scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-950/40 dark:text-blue-300',
  Reviewing: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-950/40 dark:text-violet-300',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
  Assigned: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-950/40 dark:text-violet-300',
  Present: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
  Absent: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-950/40 dark:text-rose-300',
};

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50';
const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800';
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-950';

function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${
        statusStyles[value] ?? statusStyles.Draft
      }`}
    >
      {value}
    </span>
  );
}

function DemoLabel() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-violet-700 dark:border-violet-800 dark:bg-slate-900/80 dark:text-violet-300">
      <Sparkles className="h-3 w-3" />
      Demo data · UI prototype
    </span>
  );
}

function LmsShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="relative isolate overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-5 shadow-sm dark:border-slate-800 dark:from-violet-950/50 dark:via-slate-900 dark:to-blue-950/30 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-violet-100/60 dark:border-violet-900/20" />
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-violet-700 dark:hover:text-violet-300">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/learning/dashboard" className="hover:text-violet-700 dark:hover:text-violet-300">Learning Management</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-800 dark:text-slate-200">{title}</span>
        </nav>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-3xl">
            <DemoLabel />
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-violet-950 dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Preview interactions are temporary and reset when this page is refreshed.
            </p>
          </div>
          {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'violet',
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Users;
  tone?: 'violet' | 'blue' | 'emerald' | 'amber';
}) {
  const tones = {
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>
    </article>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
        <CircleHelp className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        className={`${inputClass} pl-9`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}

function DemoDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-labelledby="learning-dialog-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-violet-600 dark:text-violet-300">Temporary prototype action</p>
            <h2 id="learning-dialog-title" className="mt-1 text-base font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function LearningManagement({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const routeProvider = searchParams.get('provider');
  const routeProgramme = searchParams.get('programme');
  const [batches, setBatches] = useState(demoBatches);
  const [students, setStudents] = useState(demoStudents);
  const [faculty, setFaculty] = useState(demoFaculty);
  const [assessments, setAssessments] = useState(demoAssessments);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState(routeProvider ?? 'All providers');
  const [programmeFilter, setProgrammeFilter] = useState(routeProgramme ?? '');
  const [batchFilter, setBatchFilter] = useState('All batches');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [sortKey, setSortKey] = useState<StudentSortKey>('name');
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalName>(null);
  const [toast, setToast] = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculty[0]?.id ?? '');
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ?? '');
  const [attendanceDate, setAttendanceDate] = useState('2026-11-25');
  const [activeBatchTab, setActiveBatchTab] = useState('Overview');
  const [reportPreview, setReportPreview] = useState(false);

  useEffect(() => {
    const selectedProvider = courseCatalogue.find((provider) => provider.name === routeProvider);
    const selectedProgramme = selectedProvider?.programmes.find((programme) => programme.name === routeProgramme);
    setProviderFilter(selectedProvider?.name ?? 'All providers');
    setProgrammeFilter(selectedProgramme?.name ?? '');
    setPage(1);
  }, [pathname, routeProgramme, routeProvider]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const segments = pathname.split('/').filter(Boolean);
  const leaf = segments[1] ?? 'dashboard';
  const detailSlug = segments[2];
  const detailCourse = leaf === 'courses' && detailSlug
    ? allCourses.find((item) => item.slug === detailSlug)
    : undefined;
  const detailBatch = leaf === 'batches' && detailSlug
    ? batches.find((batch) => batch.id.toLowerCase() === detailSlug.toLowerCase())
    : undefined;
  const pageTitle = detailCourse?.course ?? detailBatch?.name ?? pageDetails[leaf]?.title ?? 'Learning Management';
  const pageDescription = detailCourse
    ? `${detailCourse.provider} · ${detailCourse.programme}. Course detail preview with no live batch or enrollment records.`
    : detailBatch
      ? `${detailBatch.course} · ${detailBatch.provider}. Batch details below are demo data.`
      : pageDetails[leaf]?.description ?? 'Learning management screens and workflows.';

  const showToast = (message: string) => setToast(`${message} This change is temporary and will not be saved.`);

  const visibleCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allCourses.filter((course) => {
      const matchesProvider = providerFilter === 'All providers' || course.provider === providerFilter;
      const matchesProgramme = !programmeFilter || course.programme === programmeFilter;
      const matchesQuery =
        !normalized ||
        `${course.course} ${course.provider} ${course.programme}`.toLowerCase().includes(normalized);
      return matchesProvider && matchesProgramme && matchesQuery;
    });
  }, [programmeFilter, providerFilter, query]);

  const filteredBatches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return batches.filter((batch) => {
      const matchesProvider = providerFilter === 'All providers' || batch.provider === providerFilter;
      const matchesStatus = statusFilter === 'All statuses' || batch.status === statusFilter;
      const matchesQuery = !normalized || `${batch.name} ${batch.course} ${batch.id}`.toLowerCase().includes(normalized);
      return matchesProvider && matchesStatus && matchesQuery;
    });
  }, [batches, providerFilter, query, statusFilter]);

  const filteredStudents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = students.filter((student) => {
      const matchesBatch = batchFilter === 'All batches' || student.batchId === batchFilter;
      const matchesStatus = statusFilter === 'All statuses' || student.status === statusFilter;
      const matchesQuery = !normalized || `${student.name} ${student.email} ${student.id}`.toLowerCase().includes(normalized);
      return matchesBatch && matchesStatus && matchesQuery;
    });
    result.sort((a, b) => {
      const compare = sortKey === 'name'
        ? a.name.localeCompare(b.name)
        : a[sortKey] - b[sortKey];
      return sortAscending ? compare : -compare;
    });
    return result;
  }, [batchFilter, query, sortAscending, sortKey, statusFilter, students]);

  const filteredFaculty = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return faculty.filter((member) =>
      !normalized || `${member.name} ${member.email} ${member.expertise}`.toLowerCase().includes(normalized)
    );
  }, [faculty, query]);

  const filteredAssessments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const matchesBatch = batchFilter === 'All batches' || assessment.batchId === batchFilter;
      const matchesStatus = statusFilter === 'All statuses' || assessment.status === statusFilter;
      const matchesQuery = !normalized || `${assessment.title} ${assessment.course}`.toLowerCase().includes(normalized);
      return matchesBatch && matchesStatus && matchesQuery;
    });
  }, [assessments, batchFilter, query, statusFilter]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const openStudentDialog = () => setModal('student');
  const openBatchDialog = () => setModal('batch');
  const openAssessmentDialog = () => setModal('assessment');
  const openFacultyDialog = (facultyId?: string, batchId?: string) => {
    if (facultyId) setSelectedFacultyId(facultyId);
    if (batchId) setSelectedBatchId(batchId);
    setModal('faculty');
  };

  const addBatch = (draft: { name: string; courseSlug: string; facultyId: string; startDate: string; endDate: string; delivery: string }) => {
    const course = allCourses.find((item) => item.slug === draft.courseSlug);
    if (!course) return;
    const batch: LearningBatch = {
      id: `LMS-${104 + batches.length - demoBatches.length}`,
      name: draft.name,
      course: course.course,
      courseSlug: course.slug,
      provider: course.provider,
      startDate: draft.startDate,
      endDate: draft.endDate,
      facultyId: draft.facultyId,
      delivery: draft.delivery,
      status: 'Upcoming',
      capacity: 25,
    };
    setBatches((current) => [...current, batch]);
    setSelectedBatchId(batch.id);
    setModal(null);
    showToast('Demo batch added.');
  };

  const addStudent = (draft: { name: string; email: string; batchId: string }) => {
    const batch = batches.find((item) => item.id === draft.batchId);
    const student: LearningStudent = {
      id: `STU-${2401 + students.length}`,
      name: draft.name,
      email: draft.email,
      batchId: draft.batchId,
      progress: 0,
      attendance: 0,
      status: batch?.status === 'Active' ? 'Active' : 'Upcoming',
    };
    setStudents((current) => [...current, student]);
    setModal(null);
    setPage(1);
    showToast('Demo student enrolled.');
  };

  const addAssessment = (draft: { title: string; batchId: string; dueDate: string }) => {
    const batch = batches.find((item) => item.id === draft.batchId);
    const assessment: LearningAssessment = {
      id: `ASM-${301 + assessments.length}`,
      title: draft.title,
      course: batch?.course ?? '',
      batchId: draft.batchId,
      dueDate: draft.dueDate,
      submissions: 0,
      status: 'Draft',
    };
    setAssessments((current) => [...current, assessment]);
    setModal(null);
    showToast('Demo assessment created.');
  };

  const saveFacultyAssignment = () => {
    const updatedBatches = batches.map((batch) =>
      batch.id === selectedBatchId ? { ...batch, facultyId: selectedFacultyId } : batch
    );
    setBatches(updatedBatches);
    setFaculty((current) =>
      current.map((member) => {
        const assignedBatches = updatedBatches.filter((batch) => batch.facultyId === member.id).length;
        return {
          ...member,
          assignedBatches,
          status: assignedBatches > 0 ? 'Assigned' : 'Available',
        };
      })
    );
    setModal(null);
    showToast('Demo faculty assignment updated.');
  };

  const toggleStudentSort = (key: StudentSortKey) => {
    if (sortKey === key) setSortAscending((current) => !current);
    else {
      setSortKey(key);
      setSortAscending(true);
    }
  };

  const providers = ['All providers', ...courseCatalogue.map((provider) => provider.name)];
  const batchOptions = ['All batches', ...batches.map((batch) => batch.id)];
  const studentStatuses = ['All statuses', 'Active', 'Upcoming', 'Completed', 'At risk'];
  const assessmentStatuses = ['All statuses', 'Draft', 'Scheduled', 'Reviewing', 'Completed'];
  const selectedAttendanceBatch = batches.find((batch) => batch.id === selectedBatchId) ?? batches[0];
  const selectedBatchStudents = students.filter((student) => student.batchId === selectedAttendanceBatch?.id);

  function filterControls(showProvider = false, showBatch = false, statuses: string[] = []) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBox value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search demo records..." />
        {showProvider && (
          <label className="relative">
            <span className="sr-only">Filter by provider</span>
            <select className={`${inputClass} pr-8 sm:w-48`} value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
              {providers.map((provider) => <option key={provider}>{provider}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </label>
        )}
        {showBatch && (
          <label className="relative">
            <span className="sr-only">Filter by batch</span>
            <select className={`${inputClass} pr-8 sm:w-48`} value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
              {batchOptions.map((option) => <option key={option} value={option}>{option === 'All batches' ? option : `${option} · ${batches.find((batch) => batch.id === option)?.name ?? ''}`}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </label>
        )}
        {statuses.length > 0 && (
          <label className="relative">
            <span className="sr-only">Filter by status</span>
            <select className={`${inputClass} pr-8 sm:w-40`} value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
              {statuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </label>
        )}
      </div>
    );
  }

  function renderDashboard() {
    const activeCount = batches.filter((batch) => batch.status === 'Active').length;
    const averageProgress = students.length
      ? Math.round(students.reduce((total, student) => total + student.progress, 0) / students.length)
      : 0;
    const upcomingAssessments = assessments.filter((assessment) => assessment.status !== 'Completed').length;

    return (
      <LmsShell title="LMS Dashboard" description={pageDetails.dashboard.description}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Programmes" value={courseCatalogue.reduce((total, provider) => total + provider.programmes.length, 0)} detail="Across listed providers · demo catalogue" icon={BookOpen} />
          <MetricCard label="Active batches" value={activeCount} detail={`${batches.length} sample batches shown`} icon={CalendarDays} tone="blue" />
          <MetricCard label="Demo students" value={students.length} detail="Sample learner records only" icon={Users} tone="emerald" />
          <MetricCard label="Average progress" value={`${averageProgress}%`} detail={`${upcomingAssessments} assessments not completed`} icon={Target} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
          <Panel title="Enrollment trend" subtitle="Illustrative monthly enrollment · demo data">
            <div className="h-72 p-3 sm:p-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoEnrollmentTrend} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lmsEnrollmentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="students" name="Demo learners" stroke="#7c3aed" strokeWidth={2.5} fill="url(#lmsEnrollmentFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Learning outcomes" subtitle="Sample progress distribution">
            <div className="grid items-center gap-2 p-4 sm:grid-cols-[1fr_1fr]">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={demoLearningOutcomes} dataKey="value" nameKey="label" innerRadius={52} outerRadius={78} paddingAngle={4}>
                      {demoLearningOutcomes.map((item, index) => (
                        <Cell key={item.label} fill={['#7c3aed', '#f59e0b', '#10b981'][index]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {demoLearningOutcomes.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ['#7c3aed', '#f59e0b', '#10b981'][index] }} />
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
                <p className="pt-2 text-[10px] leading-4 text-slate-400">Illustrative percentages, not live student results.</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel
            title="Upcoming batches"
            subtitle="Schedule preview"
            action={<Link className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300" href="/learning/batches">View batches <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>}
          >
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {batches.slice(0, 3).map((batch) => (
                <Link key={batch.id} href={`/learning/batches/${batch.id}`} className="flex items-center justify-between gap-4 px-4 py-3.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:px-5">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{batch.name}</span>
                    <span className="mt-1 block truncate text-[10px] text-slate-500 dark:text-slate-400">{batch.course}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <StatusBadge value={batch.status} />
                    <span className="mt-1 block text-[10px] text-slate-500">{new Date(`${batch.startDate}T00:00:00`).toLocaleDateString()}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel title="Learning shortcuts" subtitle="Open an LMS workspace">
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {[
                { title: 'Programme catalogue', href: '/learning/programmes', icon: BookOpen },
                { title: 'Student directory', href: '/learning/students', icon: Users },
                { title: 'Batch attendance', href: '/learning/attendance', icon: ClipboardCheck },
                { title: 'Completion reports', href: '/learning/completion-reports', icon: Download },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-800 dark:hover:border-violet-800 dark:hover:bg-violet-950/30">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300"><Icon className="h-4 w-4" /></span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{item.title}</span>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </LmsShell>
    );
  }

  function renderProgrammes() {
    return (
      <LmsShell title="Programmes" description={pageDetails.programmes.description}>
        <div className="grid gap-4 xl:grid-cols-2">
          {courseCatalogue.map((provider, index) => (
            <article key={provider.name} className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${index % 2 === 0 ? 'border-l-violet-500' : 'border-l-blue-500'}`}>
              <div className={`flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 ${index === 0 ? 'bg-violet-50/80 dark:bg-violet-950/30' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><GraduationCap className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Programme provider</p>
                    <h2 className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{provider.name}</h2>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {provider.programmes.length ? `${provider.programmes.reduce((total, programme) => total + programme.courses.length, 0)} courses` : 'Catalogue pending'}
                </span>
              </div>
              {provider.programmes.length ? (
                <div className="space-y-4 p-5">
                  {provider.programmes.map((programme) => (
                    <div key={programme.name}>
                      <div className="mb-2 flex items-center gap-2">
                        <BookOpen className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        <Link
                          href={{ pathname: '/learning/courses', query: { provider: provider.name, programme: programme.name } }}
                          className="text-xs font-semibold text-slate-800 hover:text-violet-700 dark:text-slate-100 dark:hover:text-violet-300"
                        >
                          {programme.name}
                        </Link>
                      </div>
                      <ul className="space-y-2 pl-5">
                        {programme.courses.map((course) => {
                          const item = allCourses.find((entry) => entry.course === course);
                          return (
                            <li key={course} className="list-disc text-xs leading-5 text-slate-600 marker:text-violet-400 dark:text-slate-300">
                              <Link href={`/learning/courses/${item?.slug ?? slugifyCourse(course)}`} className="hover:text-violet-700 dark:hover:text-violet-300">{course}</Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5">
                  <EmptyState title="Course catalogue is not available yet" description="CDAC course information will be added when it is provided." />
                </div>
              )}
            </article>
          ))}
        </div>
      </LmsShell>
    );
  }

  function renderCourses() {
    return (
      <LmsShell title="Courses" description={pageDetails.courses.description}>
        <Panel title="Course catalogue" subtitle={`${visibleCourses.length} supplied courses · demo catalogue`}>
          <div className="space-y-3 p-4 sm:px-5">
            <SearchBox value={query} onChange={setQuery} placeholder="Search courses or programmes..." />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter courses by provider">
              {providers.map((provider) => (
                <button
                  key={provider}
                  type="button"
                  aria-pressed={providerFilter === provider}
                  onClick={() => {
                    setProviderFilter(provider);
                    setProgrammeFilter('');
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    providerFilter === provider
                      ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-violet-800 dark:hover:bg-violet-950/40 dark:hover:text-violet-300'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
            {programmeFilter && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span>Programme: <span className="font-semibold">{programmeFilter}</span></span>
                <button
                  type="button"
                  onClick={() => setProgrammeFilter('')}
                  className="font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300"
                >
                  Clear programme filter
                </button>
              </div>
            )}
          </div>
          {visibleCourses.length ? (
            <div className="grid gap-4 border-t border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2 sm:p-5">
              {visibleCourses.map((item) => (
                <CourseCatalogueCard key={item.slug} course={item} />
              ))}
            </div>
          ) : (
            <div className="p-4">
              {providerFilter === 'CDAC' ? (
                <EmptyState title="CDAC course catalogue is pending" description="Course details will be added when they are provided." />
              ) : (
                <EmptyState title="No courses match these filters" description="Try a different search, provider, or programme." />
              )}
            </div>
          )}
        </Panel>
      </LmsShell>
    );
  }

  function renderCourseDetails() {
    if (!detailCourse) return <LmsShell title="Course not found" description="This course is not part of the supplied demo catalogue."><EmptyState title="Course not found" description="Return to the course catalogue to select a listed course." /></LmsShell>;
    const courseBatches = batches.filter((batch) => batch.courseSlug === detailCourse.slug);
    return (
      <LmsShell
        title={detailCourse.course}
        description={`${detailCourse.provider} · ${detailCourse.programme}. Course detail preview; additional course information will be defined in a later phase.`}
        action={<Link href="/learning/courses" className={secondaryButtonClass}><ArrowLeft className="h-3.5 w-3.5" /> Course catalogue</Link>}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Provider" value={detailCourse.provider} detail="Supplied catalogue category" icon={GraduationCap} />
          <MetricCard label="Programme" value={detailCourse.programme} detail="Supplied programme category" icon={BookOpen} tone="blue" />
          <MetricCard label="Demo batches" value={courseBatches.length} detail="Temporary sample records only" icon={CalendarDays} tone="emerald" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <Panel title="Course overview" subtitle="Catalogue information">
            <div className="space-y-4 p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Provider</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{detailCourse.provider}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Programme / specialization</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{detailCourse.programme}</p>
              </div>
              <p className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                This screen contains only the supplied catalogue details. Syllabus, pricing, delivery commitments, and enrollment rules are not represented.
              </p>
            </div>
          </Panel>
          <Panel title="Available batches" subtitle="Sample batch links">
            {courseBatches.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {courseBatches.map((batch) => (
                  <Link key={batch.id} href={`/learning/batches/${batch.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span>
                      <span className="block text-xs font-semibold text-slate-900 dark:text-white">{batch.name}</span>
                      <span className="mt-1 block text-[10px] text-slate-500">{batch.id} · {batch.delivery}</span>
                    </span>
                    <StatusBadge value={batch.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-5"><EmptyState title="No demo batches" description="There are no sample batches linked to this course yet." /></div>
            )}
          </Panel>
        </div>
      </LmsShell>
    );
  }

  function renderBatches() {
    return (
      <LmsShell title="Batches" description={pageDetails.batches.description} action={<button type="button" className={buttonClass} onClick={openBatchDialog}><Plus className="h-4 w-4" /> Create demo batch</button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Total batches" value={batches.length} detail="Sample cohorts in this preview" icon={CalendarDays} />
          <MetricCard label="Active" value={batches.filter((batch) => batch.status === 'Active').length} detail="Current sample cohorts" icon={CheckCircle2} tone="emerald" />
          <MetricCard label="Upcoming" value={batches.filter((batch) => batch.status === 'Upcoming').length} detail="Scheduled sample cohorts" icon={Clock3} tone="blue" />
        </div>
        <Panel title="Batch directory" subtitle={`${filteredBatches.length} matching demo batches`}>
          <div className="p-4 sm:px-5">{filterControls(true, false, ['All statuses', 'Active', 'Upcoming', 'Completed'])}</div>
          <div className="grid gap-3 border-t border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBatches.map((batch) => {
              const enrolled = students.filter((student) => student.batchId === batch.id).length;
              const batchFaculty = faculty.find((member) => member.id === batch.facultyId);
              return (
                <article key={batch.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">{batch.id} · {batch.provider}</span>
                      <span className="mt-1 block text-sm font-bold leading-5 text-slate-900 dark:text-white">{batch.name}</span>
                    </span>
                    <StatusBadge value={batch.status} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{batch.course}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-[10px] dark:border-slate-800">
                    <span className="text-slate-500">Start date<strong className="mt-1 block text-slate-800 dark:text-slate-200">{new Date(`${batch.startDate}T00:00:00`).toLocaleDateString()}</strong></span>
                    <span className="text-slate-500">Enrollment<strong className="mt-1 block text-slate-800 dark:text-slate-200">{enrolled} / {batch.capacity}</strong></span>
                    <span className="text-slate-500">Faculty<strong className="mt-1 block truncate text-slate-800 dark:text-slate-200">{batchFaculty?.name ?? 'Unassigned'}</strong></span>
                    <span className="text-slate-500">Delivery<strong className="mt-1 block text-slate-800 dark:text-slate-200">{batch.delivery}</strong></span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button type="button" className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300" onClick={() => openFacultyDialog(batch.facultyId, batch.id)}>Assign faculty</button>
                    <Link href={`/learning/batches/${batch.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-violet-700 dark:text-slate-200 dark:hover:text-violet-300">View details <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </div>
                </article>
              );
            })}
            {!filteredBatches.length && <div className="sm:col-span-2 xl:col-span-3"><EmptyState title="No batches found" description="Adjust the search, provider, or status filter." /></div>}
          </div>
        </Panel>
      </LmsShell>
    );
  }

  function renderBatchDetails() {
    if (!detailBatch) return <LmsShell title="Batch not found" description="This batch is not available in the sample records."><EmptyState title="Batch not found" description="Return to the batch list to select a demo batch." /></LmsShell>;
    const batchStudents = students.filter((student) => student.batchId === detailBatch.id);
    const batchAssessments = assessments.filter((assessment) => assessment.batchId === detailBatch.id);
    const assignedFaculty = faculty.find((member) => member.id === detailBatch.facultyId);
    const tabs = ['Overview', 'Students', 'Faculty', 'Attendance', 'Progress', 'Assessments'];

    return (
      <LmsShell
        title={detailBatch.name}
        description={`${detailBatch.course} · ${detailBatch.provider}`}
        action={<Link href="/learning/batches" className={secondaryButtonClass}><ArrowLeft className="h-3.5 w-3.5" /> All batches</Link>}
      >
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2 dark:border-slate-800">
            {tabs.map((tab) => (
              <button key={tab} type="button" onClick={() => setActiveBatchTab(tab)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${activeBatchTab === tab ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>{tab}</button>
            ))}
          </div>
          <div className="p-4 sm:p-5">
            {activeBatchTab === 'Overview' && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Learners" value={`${batchStudents.length} / ${detailBatch.capacity}`} detail="Demo enrollment" icon={Users} />
                <MetricCard label="Batch status" value={detailBatch.status} detail="Temporary sample status" icon={CheckCircle2} tone="emerald" />
                <MetricCard label="Start date" value={new Date(`${detailBatch.startDate}T00:00:00`).toLocaleDateString()} detail="Sample schedule" icon={CalendarDays} tone="blue" />
                <MetricCard label="Delivery" value={detailBatch.delivery} detail="Sample format" icon={BookOpen} tone="amber" />
              </div>
            )}
            {activeBatchTab === 'Students' && <StudentTable rows={batchStudents} onSort={toggleStudentSort} sortKey={sortKey} ascending={sortAscending} onStudentClick={(id) => showToast(`Opened learner ${id}.`)} />}
            {activeBatchTab === 'Faculty' && (
              <div className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{assignedFaculty?.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                  <span><span className="block text-sm font-semibold text-slate-900 dark:text-white">{assignedFaculty?.name ?? 'Faculty not assigned'}</span><span className="block text-xs text-slate-500">{assignedFaculty?.designation ?? 'Choose a faculty member'}</span></span>
                </div>
                <button type="button" className={secondaryButtonClass} onClick={() => openFacultyDialog(detailBatch.facultyId, detailBatch.id)}>Change assignment</button>
              </div>
            )}
            {activeBatchTab === 'Attendance' && (
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Batch attendance preview</h3><p className="mt-1 text-xs text-slate-500">Attendance marks are temporary demo state.</p></div>
                <Link href="/learning/attendance" className={secondaryButtonClass}>Open attendance <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            )}
            {activeBatchTab === 'Progress' && <ProgressList rows={batchStudents} />}
            {activeBatchTab === 'Assessments' && (
              <div className="space-y-3">
                {batchAssessments.length ? batchAssessments.map((assessment) => <AssessmentRow key={assessment.id} assessment={assessment} onAction={() => showToast(`Opened ${assessment.title}.`)} />) : <EmptyState title="No assessments" description="No demo assessments are linked to this batch yet." />}
                <Link href="/learning/assessments" className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 dark:text-violet-300">View all assessments <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            )}
          </div>
        </div>
      </LmsShell>
    );
  }

  function renderFaculty() {
    return (
      <LmsShell title="Faculty" description={pageDetails.faculty.description} action={<button type="button" className={buttonClass} onClick={() => openFacultyDialog()}><Plus className="h-4 w-4" /> Assign faculty</button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Faculty profiles" value={faculty.length} detail="Sample directory entries" icon={Users} />
          <MetricCard label="Assigned" value={faculty.filter((member) => member.status === 'Assigned').length} detail="At least one demo batch" icon={ClipboardCheck} tone="blue" />
          <MetricCard label="Available" value={faculty.filter((member) => member.status === 'Available').length} detail="No current sample assignment" icon={CheckCircle2} tone="emerald" />
        </div>
        <Panel title="Faculty directory" subtitle={`${filteredFaculty.length} demo profiles`}>
          <div className="p-4 sm:px-5"><SearchBox value={query} onChange={setQuery} placeholder="Search name or expertise..." /></div>
          {filteredFaculty.length ? (
            <div className="grid gap-3 border-t border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-3">
              {filteredFaculty.map((member) => (
                <article key={member.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>
                    <StatusBadge value={member.status} />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{member.designation}</p>
                  <p className="mt-3 text-[11px] text-slate-600 dark:text-slate-300">Expertise · {member.expertise}</p>
                  <p className="mt-1 truncate text-[10px] text-slate-500">{member.email}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500">{member.assignedBatches} assigned batches</span>
                    <button type="button" className="text-xs font-semibold text-violet-700 hover:text-violet-900 dark:text-violet-300" onClick={() => openFacultyDialog(member.id)}>Assign</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="p-4"><EmptyState title="No faculty found" description="Try another search." /></div>}
        </Panel>
      </LmsShell>
    );
  }

  function renderStudents() {
    return (
      <LmsShell title="Students" description={pageDetails.students.description} action={<button type="button" className={buttonClass} onClick={openStudentDialog}><Plus className="h-4 w-4" /> Enroll demo student</button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Learners" value={students.length} detail="Sample learner records" icon={Users} />
          <MetricCard label="Active learners" value={students.filter((student) => student.status === 'Active').length} detail="Assigned to active demo batches" icon={CheckCircle2} tone="emerald" />
          <MetricCard label="Needs attention" value={students.filter((student) => student.status === 'At risk').length} detail="Illustrative status only" icon={Target} tone="amber" />
        </div>
        <Panel title="Student directory" subtitle={`${filteredStudents.length} matching demo learners`}>
          <div className="p-4 sm:px-5">{filterControls(false, true, studentStatuses)}</div>
          <StudentTable rows={pagedStudents} onSort={toggleStudentSort} sortKey={sortKey} ascending={sortAscending} onStudentClick={(id) => showToast(`Opened learner ${id}.`)} />
          <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:px-5">
            <p className="text-[11px] text-slate-500">Page {page} of {pageCount} · {filteredStudents.length} demo records</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className={secondaryButtonClass}><ChevronLeft className="h-3.5 w-3.5" /> Previous</button>
              <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className={secondaryButtonClass}>Next <ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </Panel>
      </LmsShell>
    );
  }

  function renderEnrollment() {
    const enrolledByBatch = batches.map((batch) => ({
      batch,
      count: students.filter((student) => student.batchId === batch.id).length,
    }));
    return (
      <LmsShell title="Enrollment" description={pageDetails.enrollment.description} action={<button type="button" className={buttonClass} onClick={openStudentDialog}><Plus className="h-4 w-4" /> Add demo enrollment</button>}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel title="Enrollment overview" subtitle="Sample counts by batch">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrolledByBatch.map(({ batch, count }) => (
                <div key={batch.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{batch.name}</span><span className="mt-1 block text-[10px] text-slate-500">{batch.id} · {batch.provider}</span></span>
                  <span className="shrink-0 text-right"><strong className="block text-sm text-slate-900 dark:text-white">{count} / {batch.capacity}</strong><span className="text-[10px] text-slate-500">demo learners</span></span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Enrollment preview" subtitle="No actual enrollment records are created">
            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 dark:border-violet-900/50 dark:bg-violet-950/30">
                <h3 className="text-xs font-bold text-violet-900 dark:text-violet-200">Frontend enrollment form</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">Add a temporary student row to preview how an enrollment workflow could appear. The demo state resets on refresh.</p>
              </div>
              <button type="button" className={buttonClass} onClick={openStudentDialog}><Plus className="h-4 w-4" /> Open enrollment form</button>
              <Link href="/learning/students" className="ml-3 text-xs font-semibold text-violet-700 dark:text-violet-300">Go to students <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
            </div>
          </Panel>
        </div>
      </LmsShell>
    );
  }

  function renderAttendance() {
    const activeStudents = selectedBatchStudents.filter((student) => student.status !== 'Upcoming');
    return (
      <LmsShell title="Batch Attendance" description={pageDetails.attendance.description}>
        <Panel
          title="Attendance register"
          subtitle="Toggle a row to simulate present or absent; changes are not persisted."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <select aria-label="Select batch" className={`${inputClass} sm:w-48`} value={selectedBatchId} onChange={(event) => setSelectedBatchId(event.target.value)}>
                {batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.id} · {batch.name}</option>)}
              </select>
              <input aria-label="Attendance date" className={`${inputClass} sm:w-40`} type="date" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
            </div>
          }
        >
          <div className="flex flex-wrap gap-4 border-b border-slate-100 px-5 py-3 text-[11px] dark:border-slate-800">
            <span className="text-slate-500">Batch <strong className="ml-1 text-slate-800 dark:text-slate-200">{selectedAttendanceBatch?.name ?? '—'}</strong></span>
            <span className="text-slate-500">Roster <strong className="ml-1 text-slate-800 dark:text-slate-200">{activeStudents.length} demo learners</strong></span>
          </div>
          {activeStudents.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
                  <tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Student ID</th><th className="px-5 py-3">Recorded attendance</th><th className="px-5 py-3 text-right">Today · {new Date(`${attendanceDate}T00:00:00`).toLocaleDateString()}</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeStudents.map((student) => {
                    const key = `${selectedBatchId}:${student.id}`;
                    const present = attendanceMarks[key] ?? student.status !== 'Upcoming';
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-3.5"><span className="font-semibold text-slate-900 dark:text-white">{student.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{student.email}</span></td>
                        <td className="px-5 py-3.5 text-slate-500">{student.id}</td>
                        <td className="px-5 py-3.5"><span className="text-slate-700 dark:text-slate-200">{student.attendance}%</span></td>
                        <td className="px-5 py-3.5 text-right"><button type="button" onClick={() => setAttendanceMarks((current) => ({ ...current, [key]: !present }))}><StatusBadge value={present ? 'Present' : 'Absent'} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5"><EmptyState title="No active roster for this batch" description="Upcoming batches do not have an attendance roster in this preview." /></div>
          )}
        </Panel>
      </LmsShell>
    );
  }

  function renderAssessments() {
    return (
      <LmsShell title="Assessments" description={pageDetails.assessments.description} action={<button type="button" className={buttonClass} onClick={openAssessmentDialog}><Plus className="h-4 w-4" /> Create assessment</button>}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Assessments" value={assessments.length} detail="Sample assessment entries" icon={ClipboardCheck} />
          <MetricCard label="To review" value={assessments.filter((item) => item.status === 'Reviewing').length} detail="Illustrative pending review" icon={Clock3} tone="amber" />
          <MetricCard label="Scheduled" value={assessments.filter((item) => item.status === 'Scheduled').length} detail="Sample upcoming assessments" icon={CalendarDays} tone="blue" />
        </div>
        <Panel title="Assessment register" subtitle={`${filteredAssessments.length} matching demo assessments`}>
          <div className="p-4 sm:px-5">{filterControls(false, true, assessmentStatuses)}</div>
          <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
            {filteredAssessments.map((assessment) => (
              <AssessmentRow key={assessment.id} assessment={assessment} onAction={() => {
                if (assessment.status === 'Reviewing') {
                  setAssessments((current) => current.map((item) => item.id === assessment.id ? { ...item, status: 'Completed' } : item));
                  showToast('Assessment marked complete.');
                } else {
                  showToast(`Opened ${assessment.title}.`);
                }
              }} />
            ))}
            {!filteredAssessments.length && <EmptyState title="No assessments found" description="Adjust the search, batch, or status filter." />}
          </div>
        </Panel>
      </LmsShell>
    );
  }

  function renderProgress() {
    const progressStudents = students.filter((student) =>
      (batchFilter === 'All batches' || student.batchId === batchFilter) &&
      (statusFilter === 'All statuses' || student.status === statusFilter) &&
      (!query || `${student.name} ${student.id}`.toLowerCase().includes(query.trim().toLowerCase()))
    );
    const average = progressStudents.length ? Math.round(progressStudents.reduce((total, student) => total + student.progress, 0) / progressStudents.length) : 0;
    return (
      <LmsShell title="Student Progress" description={pageDetails.progress.description}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Average progress" value={`${average}%`} detail="Current filter · demo data" icon={Target} />
          <MetricCard label="On track" value={progressStudents.filter((student) => student.progress >= 60).length} detail="60% or higher progress" icon={CheckCircle2} tone="emerald" />
          <MetricCard label="Needs attention" value={progressStudents.filter((student) => student.status === 'At risk').length} detail="Illustrative risk status" icon={Clock3} tone="amber" />
        </div>
        <Panel title="Learner progress" subtitle="Filter by batch and learner status">
          <div className="p-4 sm:px-5">{filterControls(false, true, studentStatuses)}</div>
          <div className="space-y-1 border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">
            {progressStudents.length ? <ProgressList rows={progressStudents} /> : <EmptyState title="No progress records found" description="Try a different search or filter." />}
          </div>
        </Panel>
      </LmsShell>
    );
  }

  function renderCompletionReports() {
    const completed = students.filter((student) => student.status === 'Completed').length;
    const completionRate = students.length ? Math.round((completed / students.length) * 100) : 0;
    return (
      <LmsShell
        title="Completion Reports"
        description={pageDetails['completion-reports'].description}
        action={<button type="button" className={secondaryButtonClass} onClick={() => { setReportPreview(true); showToast('Completion report preview generated.'); }}><Download className="h-3.5 w-3.5" /> Generate preview</button>}
      >
        {reportPreview && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">Demo report preview ready. No file was generated or saved.</div>}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Learners completed" value={completed} detail="Sample records only" icon={GraduationCap} tone="emerald" />
          <MetricCard label="Completion rate" value={`${completionRate}%`} detail="Based on visible demo records" icon={Target} />
          <MetricCard label="Batches with completions" value={batches.filter((batch) => batch.status === 'Completed').length} detail="Sample cohort status" icon={CheckCircle2} tone="blue" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Progress by batch" subtitle="Average completion percentage · demo data">
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={batches.map((batch) => {
                  const rows = students.filter((student) => student.batchId === batch.id);
                  return { name: batch.id, progress: rows.length ? Math.round(rows.reduce((total, student) => total + student.progress, 0) / rows.length) : 0 };
                })} margin={{ left: -18, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="progress" name="Average progress" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
          <Panel title="Completion summary" subtitle="Sample batch outcomes">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {batches.map((batch) => {
                const rows = students.filter((student) => student.batchId === batch.id);
                const completions = rows.filter((student) => student.status === 'Completed').length;
                return (
                  <Link key={batch.id} href={`/learning/batches/${batch.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span><span className="block text-xs font-semibold text-slate-900 dark:text-white">{batch.name}</span><span className="mt-1 block text-[10px] text-slate-500">{batch.id} · {rows.length} learners</span></span>
                    <span className="text-right"><strong className="block text-sm text-slate-900 dark:text-white">{completions}</strong><span className="text-[10px] text-slate-500">completed</span></span>
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>
      </LmsShell>
    );
  }

  function renderFallback() {
    return (
      <LmsShell title={pageTitle} description={pageDescription}>
        <EmptyState title="Learning workspace" description="This page is ready for its detailed workflow. Use the Learning Management menu to explore the current programme, batch, faculty, and student previews." />
      </LmsShell>
    );
  }

  const renderPage = () => {
    if (detailCourse) return renderCourseDetails();
    if (detailBatch) return renderBatchDetails();
    switch (leaf) {
      case 'dashboard': return renderDashboard();
      case 'programmes': return renderProgrammes();
      case 'courses': return renderCourses();
      case 'batches': return renderBatches();
      case 'faculty': return renderFaculty();
      case 'students': return renderStudents();
      case 'enrollment': return renderEnrollment();
      case 'attendance': return renderAttendance();
      case 'assessments': return renderAssessments();
      case 'progress': return renderProgress();
      case 'completion-reports': return renderCompletionReports();
      default: return renderFallback();
    }
  };

  return (
    <>
      {renderPage()}
      {toast && (
        <div role="status" className="fixed bottom-5 right-5 z-[80] flex max-w-sm items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{toast}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {modal === 'batch' && <AddBatchDialog faculty={faculty} onCancel={() => setModal(null)} onSave={addBatch} />}
      {modal === 'student' && <EnrollStudentDialog batches={batches} onCancel={() => setModal(null)} onSave={addStudent} />}
      {modal === 'assessment' && <AddAssessmentDialog batches={batches} onCancel={() => setModal(null)} onSave={addAssessment} />}
      {modal === 'faculty' && (
        <AssignFacultyDialog
          batches={batches}
          faculty={faculty}
          selectedBatchId={selectedBatchId}
          selectedFacultyId={selectedFacultyId}
          onBatchChange={setSelectedBatchId}
          onFacultyChange={setSelectedFacultyId}
          onCancel={() => setModal(null)}
          onSave={saveFacultyAssignment}
        />
      )}
    </>
  );
}

function StudentTable({
  rows,
  onSort,
  sortKey,
  ascending,
  onStudentClick,
}: {
  rows: LearningStudent[];
  onSort: (key: StudentSortKey) => void;
  sortKey: StudentSortKey;
  ascending: boolean;
  onStudentClick: (id: string) => void;
}) {
  const sortIcon = (key: StudentSortKey) => sortKey === key ? (ascending ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />) : <SlidersHorizontal className="inline h-3 w-3 opacity-40" />;

  return (
    <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
      {rows.length ? (
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-5 py-3"><button type="button" onClick={() => onSort('name')}>Student {sortIcon('name')}</button></th>
              <th className="px-5 py-3">Batch</th>
              <th className="px-5 py-3"><button type="button" onClick={() => onSort('progress')}>Progress {sortIcon('progress')}</button></th>
              <th className="px-5 py-3"><button type="button" onClick={() => onSort('attendance')}>Attendance {sortIcon('attendance')}</button></th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                <td className="px-5 py-3.5"><span className="font-semibold text-slate-900 dark:text-white">{student.name}</span><span className="mt-0.5 block text-[10px] text-slate-500">{student.id} · {student.email}</span></td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{student.batchId}</td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2"><span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><span className="block h-full rounded-full bg-violet-600" style={{ width: `${student.progress}%` }} /></span><span className="text-[10px] text-slate-600 dark:text-slate-300">{student.progress}%</span></span>
                </td>
                <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">{student.attendance}%</td>
                <td className="px-5 py-3.5"><StatusBadge value={student.status} /></td>
                <td className="px-5 py-3.5 text-right"><button type="button" onClick={() => onStudentClick(student.id)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={`More actions for ${student.name}`}><MoreHorizontal className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-4"><EmptyState title="No students found" description="Change the current search or filters to see demo learners." /></div>
      )}
    </div>
  );
}

function ProgressList({ rows }: { rows: LearningStudent[] }) {
  return (
    <div className="space-y-3">
      {rows.map((student) => (
        <article key={student.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <h3 className="truncate text-xs font-semibold text-slate-900 dark:text-white">{student.name}</h3>
              <p className="mt-1 text-[10px] text-slate-500">{student.id} · {student.batchId}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge value={student.status} />
              <span className="w-12 text-right text-xs font-bold text-slate-800 dark:text-slate-200">{student.progress}%</span>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${student.status === 'At risk' ? 'bg-amber-500' : student.progress === 100 ? 'bg-emerald-500' : 'bg-violet-600'}`} style={{ width: `${student.progress}%` }} />
          </div>
        </article>
      ))}
    </div>
  );
}

function AssessmentRow({ assessment, onAction }: { assessment: LearningAssessment; onAction: () => void }) {
  return (
    <article className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-semibold text-slate-900 dark:text-white">{assessment.title}</h3><StatusBadge value={assessment.status} /></div>
        <p className="mt-1 text-[10px] text-slate-500">{assessment.course} · {assessment.batchId}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-right text-[10px] text-slate-500"><strong className="block text-xs text-slate-800 dark:text-slate-200">{assessment.submissions}</strong>submissions · due {new Date(`${assessment.dueDate}T00:00:00`).toLocaleDateString()}</span>
        <button type="button" onClick={onAction} className={secondaryButtonClass}>{assessment.status === 'Reviewing' ? 'Mark complete' : 'Open'} <ArrowRight className="h-3.5 w-3.5" /></button>
      </div>
    </article>
  );
}

function AddBatchDialog({
  faculty,
  onCancel,
  onSave,
}: {
  faculty: LearningFaculty[];
  onCancel: () => void;
  onSave: (draft: { name: string; courseSlug: string; facultyId: string; startDate: string; endDate: string; delivery: string }) => void;
}) {
  const [name, setName] = useState('');
  const [courseSlug, setCourseSlug] = useState(allCourses[0]?.slug ?? '');
  const [facultyId, setFacultyId] = useState(faculty[0]?.id ?? '');
  const [startDate, setStartDate] = useState('2027-01-15');
  const [endDate, setEndDate] = useState('2027-04-15');
  const [delivery, setDelivery] = useState('Online');

  return (
    <DemoDialog title="Create demo batch" onClose={onCancel}>
      <form className="space-y-4" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave({ name, courseSlug, facultyId, startDate, endDate, delivery }); }}>
        <p className="text-xs leading-5 text-slate-500">This creates a temporary row in the current browser session only. Existing records are demo data.</p>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Batch name<input className={`${inputClass} mt-1.5`} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Programme · Spring 2027" /></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Course<select className={`${inputClass} mt-1.5`} value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)}>{allCourses.map((course) => <option key={course.slug} value={course.slug}>{course.course}</option>)}</select></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Start date<input className={`${inputClass} mt-1.5`} type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">End date<input className={`${inputClass} mt-1.5`} type="date" required value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Faculty<select className={`${inputClass} mt-1.5`} value={facultyId} onChange={(event) => setFacultyId(event.target.value)}>{faculty.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Delivery<select className={`${inputClass} mt-1.5`} value={delivery} onChange={(event) => setDelivery(event.target.value)}><option>Online</option><option>Hybrid</option><option>On campus</option></select></label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button>
          <button type="submit" className={buttonClass}><Plus className="h-3.5 w-3.5" /> Add batch</button>
        </div>
      </form>
    </DemoDialog>
  );
}

function EnrollStudentDialog({
  batches,
  onCancel,
  onSave,
}: {
  batches: LearningBatch[];
  onCancel: () => void;
  onSave: (draft: { name: string; email: string; batchId: string }) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [batchId, setBatchId] = useState(batches[0]?.id ?? '');

  return (
    <DemoDialog title="Enroll demo student" onClose={onCancel}>
      <form className="space-y-4" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave({ name, email, batchId }); }}>
        <p className="text-xs leading-5 text-slate-500">Use fictional demo details. No real student profile or enrollment is created.</p>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Student name<input className={`${inputClass} mt-1.5`} required value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Email<input className={`${inputClass} mt-1.5`} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Batch<select className={`${inputClass} mt-1.5`} required value={batchId} onChange={(event) => setBatchId(event.target.value)}>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.id} · {batch.name}</option>)}</select></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button>
          <button type="submit" className={buttonClass}><Check className="h-3.5 w-3.5" /> Add demo enrollment</button>
        </div>
      </form>
    </DemoDialog>
  );
}

function AddAssessmentDialog({
  batches,
  onCancel,
  onSave,
}: {
  batches: LearningBatch[];
  onCancel: () => void;
  onSave: (draft: { title: string; batchId: string; dueDate: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [batchId, setBatchId] = useState(batches[0]?.id ?? '');
  const [dueDate, setDueDate] = useState('2026-12-20');

  return (
    <DemoDialog title="Create demo assessment" onClose={onCancel}>
      <form className="space-y-4" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); onSave({ title, batchId, dueDate }); }}>
        <p className="text-xs leading-5 text-slate-500">This adds a temporary assessment card for interface preview only.</p>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Assessment title<input className={`${inputClass} mt-1.5`} required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Batch<select className={`${inputClass} mt-1.5`} required value={batchId} onChange={(event) => setBatchId(event.target.value)}>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.id} · {batch.name}</option>)}</select></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Due date<input className={`${inputClass} mt-1.5`} type="date" required value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button>
          <button type="submit" className={buttonClass}><Plus className="h-3.5 w-3.5" /> Create assessment</button>
        </div>
      </form>
    </DemoDialog>
  );
}

function AssignFacultyDialog({
  batches,
  faculty,
  selectedBatchId,
  selectedFacultyId,
  onBatchChange,
  onFacultyChange,
  onCancel,
  onSave,
}: {
  batches: LearningBatch[];
  faculty: LearningFaculty[];
  selectedBatchId: string;
  selectedFacultyId: string;
  onBatchChange: (value: string) => void;
  onFacultyChange: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <DemoDialog title="Assign faculty to batch" onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-xs leading-5 text-slate-500">The assignment updates this page&apos;s temporary demo view and is reset on refresh.</p>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Batch<select className={`${inputClass} mt-1.5`} value={selectedBatchId} onChange={(event) => onBatchChange(event.target.value)}>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.id} · {batch.name}</option>)}</select></label>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">Faculty<select className={`${inputClass} mt-1.5`} value={selectedFacultyId} onChange={(event) => onFacultyChange(event.target.value)}>{faculty.map((member) => <option key={member.id} value={member.id}>{member.name} · {member.expertise}</option>)}</select></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <button type="button" className={secondaryButtonClass} onClick={onCancel}>Cancel</button>
          <button type="button" className={buttonClass} onClick={onSave}><Check className="h-3.5 w-3.5" /> Save preview assignment</button>
        </div>
      </div>
    </DemoDialog>
  );
}

export default LearningManagement;
