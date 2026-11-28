'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Plus,
  Target,
  Wallet,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  CampaignWorkspace,
  CompanyEvent,
  Employee,
  PodcastEpisode,
  ReelItem,
  SocialMediaMetric,
} from '@/types';

export type MediaTab = 'OVERVIEW' | 'SOCIAL' | 'PODCAST' | 'REELS' | 'FUNDS' | 'STRATEGIES' | 'SCHEDULE';

type Props = {
  activeTab: MediaTab;
  campaigns: CampaignWorkspace[];
  socialMetrics: SocialMediaMetric[];
  podcasts: PodcastEpisode[];
  reels: ReelItem[];
  events: CompanyEvent[];
  employees: Employee[];
  currentEmployee: Employee;
};

type ExpenseStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
type StrategyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'REJECTED';
type ScheduleStatus = 'PLANNED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED' | 'OVERDUE';
type MediaExpense = {
  id: string;
  title: string;
  category: string;
  campaignId: string;
  description: string;
  amount: number;
  expenseDate: string;
  submitterId: string;
  receiptName: string;
  status: ExpenseStatus;
  createdBy: string;
};
type MediaStrategy = {
  id: string;
  name: string;
  campaignId: string;
  description: string;
  objective: string;
  audience: string;
  platforms: string[];
  activities: string;
  outcomes: string;
  targetReach: number;
  targetEngagement: number;
  targetLeads: number;
  estimatedBudget: number;
  startDate: string;
  endDate: string;
  ownerId: string;
  teamIds: string[];
  priority: string;
  status: StrategyStatus;
  actualReach: number;
  actualEngagement: number;
  actualLeads: number;
  actualSpend: number;
  history: string[];
};
type MediaActivity = {
  id: string;
  title: string;
  description: string;
  type: string;
  platform: string;
  campaignId: string;
  employeeId: string;
  startAt: string;
  endAt: string;
  deadline: string;
  priority: string;
  status: ScheduleStatus;
  source: 'existing' | 'local';
};
type ProjectBudget = { campaignId: string; amount: number };

const EXPENSE_CATEGORIES = [
  'Social Media Advertising',
  'Content Creation',
  'Video Production',
  'Photography',
  'Influencer Marketing',
  'Podcast Production',
  'Event Promotions',
  'Software & Subscriptions',
  'Other',
];
const PLATFORMS = ['Instagram', 'LinkedIn', 'Facebook', 'YouTube', 'X', 'Podcast'];
const ACTIVITY_TYPES = [
  'Social post',
  'Reel',
  'YouTube video',
  'Podcast recording',
  'Podcast publishing',
  'Photography session',
  'Video shoot',
  'Editing deadline',
  'Campaign launch',
  'Marketing meeting',
  'Content review',
];
const SCHEDULE_STATUSES: ScheduleStatus[] = ['PLANNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'PUBLISHED', 'CANCELLED', 'OVERDUE'];
const PALETTE = ['#7c3aed', '#2563eb', '#0d9488', '#f59e0b', '#e11d48', '#6366f1'];
const INPUT_CLASS = 'w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs';

const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date(Number.NaN);
};
const todayKey = () => dateKey(new Date());
const isUpcomingStatus = (status: ScheduleStatus) => !['COMPLETED', 'PUBLISHED', 'CANCELLED'].includes(status);

function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const keys = Object.keys(rows[0] || {});
  const csv = [
    keys.join(','),
    ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h2>
          <button type="button" onClick={onClose} className="px-2 py-1 rounded-lg border text-xs text-slate-500">Close</button>
        </div>
        {children}
      </section>
    </div>
  );
}

function Metric({ label, value, helper, icon: Icon, tone = 'violet' }: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone?: 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';
}) {
  const tones = {
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  };
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`p-1.5 rounded-lg ${tones[tone]}`}><Icon className="w-4 h-4" /></span>
      </div>
      <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
    </div>
  );
}

function OverviewMetric({ label, value, helper, icon: Icon, tone = 'neutral' }: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone?: 'neutral' | 'emerald' | 'amber' | 'rose' | 'violet';
}) {
  const accents = {
    neutral: 'text-slate-500 dark:text-slate-400',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
    rose: 'text-rose-700 dark:text-rose-300',
    violet: 'text-violet-700 dark:text-violet-300',
  };
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{label}</p>
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${accents[tone]}`} aria-hidden="true" />
      </div>
      <p className="mt-3 truncate text-xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' {
  if (['APPROVED', 'COMPLETED', 'PUBLISHED'].includes(status)) return 'success';
  if (['REJECTED', 'OVERDUE'].includes(status)) return 'danger';
  if (['PENDING_APPROVAL', 'PENDING_REVIEW', 'IN_PROGRESS'].includes(status)) return 'warning';
  if (['DRAFT', 'PLANNED'].includes(status)) return 'purple';
  return 'default';
}

function buildExistingActivities(
  campaigns: CampaignWorkspace[],
  socialMetrics: SocialMediaMetric[],
  podcasts: PodcastEpisode[],
  reels: ReelItem[],
  events: CompanyEvent[],
  employees: Employee[],
): MediaActivity[] {
  const employeeIdFor = (name: string) => employees.find((employee) => employee.name === name)?.permanentId || '';
  const campaignFor = (title: string) => campaigns.find((campaign) => campaign.title === title)?.id || '';
  const activities: MediaActivity[] = [
    ...socialMetrics.map((metric) => ({
      id: `social-${metric.id}`,
      title: metric.title,
      description: `${metric.contentType} published on ${metric.platform}`,
      type: metric.contentType === 'Podcast Clip' ? 'Podcast publishing' : 'Social post',
      platform: metric.platform,
      campaignId: '',
      employeeId: '',
      startAt: `${metric.publishDate}T09:00`,
      endAt: `${metric.publishDate}T10:00`,
      deadline: '',
      priority: 'MEDIUM',
      status: 'PUBLISHED' as ScheduleStatus,
      source: 'existing' as const,
    })),
    ...podcasts.map((podcast) => ({
      id: `podcast-${podcast.id}`,
      title: podcast.topic,
      description: `Recording with ${podcast.guestName}`,
      type: 'Podcast recording',
      platform: 'Podcast',
      campaignId: '',
      employeeId: employeeIdFor(podcast.presenter),
      startAt: `${podcast.recordingDate}T10:00`,
      endAt: `${podcast.recordingDate}T11:00`,
      deadline: '',
      priority: 'MEDIUM',
      status: (podcast.stage === 'Done' ? 'COMPLETED' : podcast.stage === 'Ongoing' ? 'IN_PROGRESS' : 'PLANNED') as ScheduleStatus,
      source: 'existing' as const,
    })),
    ...reels.filter((reel) => reel.publicationDate).map((reel) => ({
      id: `reel-${reel.id}`,
      title: reel.title,
      description: reel.reviewComments,
      type: 'Reel',
      platform: 'Instagram / YouTube',
      campaignId: '',
      employeeId: employeeIdFor(reel.editorName),
      startAt: `${reel.publicationDate}T12:00`,
      endAt: `${reel.publicationDate}T13:00`,
      deadline: '',
      priority: 'MEDIUM',
      status: (reel.stage === 'Posted' ? 'PUBLISHED' : reel.stage === 'Approved' ? 'PENDING_REVIEW' : 'PLANNED') as ScheduleStatus,
      source: 'existing' as const,
    })),
    ...campaigns.flatMap((campaign) => campaign.milestones.map((milestone, index) => ({
      id: `milestone-${campaign.id}-${index}`,
      title: milestone.title,
      description: campaign.title,
      type: 'Campaign milestone',
      platform: 'Campaign',
      campaignId: campaign.id,
      employeeId: employeeIdFor(campaign.leadManager),
      startAt: `${milestone.due}T09:00`,
      endAt: `${milestone.due}T10:00`,
      deadline: milestone.due,
      priority: 'MEDIUM',
      status: (milestone.done ? 'COMPLETED' : 'PLANNED') as ScheduleStatus,
      source: 'existing' as const,
    }))),
    ...events.filter((event) => event.participatingDepartments.includes('Media')).map((event) => ({
      id: `event-${event.id}`,
      title: event.name,
      description: `${event.eventType} · ${event.venue}`,
      type: event.eventType,
      platform: 'Event',
      campaignId: campaignFor(event.name),
      employeeId: employeeIdFor(event.organizer),
      startAt: `${event.date}T09:00`,
      endAt: `${event.date}T17:00`,
      deadline: event.date,
      priority: 'MEDIUM',
      status: (event.status === 'Completed' ? 'COMPLETED' : event.status === 'Ongoing' ? 'IN_PROGRESS' : 'PLANNED') as ScheduleStatus,
      source: 'existing' as const,
    })),
  ];
  return activities;
}

export default function MediaManagementSections(props: Props) {
  const { activeTab, campaigns, socialMetrics, podcasts, reels, events, employees, currentEmployee } = props;
  const mediaCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.participatingDepartments.includes('Media')),
    [campaigns],
  );
  const mediaEmployees = useMemo(() => employees.filter((employee) => employee.department === 'Media'), [employees]);
  const existingActivities = useMemo(
    () => buildExistingActivities(mediaCampaigns, socialMetrics, podcasts, reels, events, employees),
    [mediaCampaigns, socialMetrics, podcasts, reels, events, employees],
  );

  const [expenses, setExpenses] = useState<MediaExpense[]>([]);
  const [strategies, setStrategies] = useState<MediaStrategy[]>([]);
  const [activities, setActivities] = useState<MediaActivity[]>([]);
  const [activityStatuses, setActivityStatuses] = useState<Record<string, ScheduleStatus>>({});
  const [projectBudgets, setProjectBudgets] = useState<ProjectBudget[]>([]);
  const [overallBudget, setOverallBudget] = useState<number | null>(null);
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showExpenseDetails, setShowExpenseDetails] = useState<MediaExpense | null>(null);
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingStrategyId, setEditingStrategyId] = useState<string | null>(null);
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All categories');
  const [expenseCampaignFilter, setExpenseCampaignFilter] = useState('All campaigns');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('All statuses');
  const [expenseDateFrom, setExpenseDateFrom] = useState('');
  const [expenseDateTo, setExpenseDateTo] = useState('');
  const [calendarView, setCalendarView] = useState<'MONTH' | 'WEEK' | 'AGENDA'>('MONTH');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [scheduleEmployeeFilter, setScheduleEmployeeFilter] = useState('All employees');
  const [schedulePlatformFilter, setSchedulePlatformFilter] = useState('All platforms');
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState('All activity types');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('All statuses');
  const [scheduleFrom, setScheduleFrom] = useState('');
  const [scheduleTo, setScheduleTo] = useState('');

  const campaignById = (id: string) => mediaCampaigns.find((campaign) => campaign.id === id);
  const employeeById = (id: string) => employees.find((employee) => employee.permanentId === id);
  const baseAllocated = mediaCampaigns.reduce((sum, campaign) => {
    const override = projectBudgets.find((entry) => entry.campaignId === campaign.id)?.amount;
    return sum + (override ?? campaign.budgetRef);
  }, 0);
  const allocatedBudget = overallBudget ?? baseAllocated;
  const approvedExpenseTotal = expenses
    .filter((expense) => expense.status === 'APPROVED')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const baseActual = mediaCampaigns.reduce((sum, campaign) => sum + campaign.spentRef, 0);
  const actualSpend = baseActual + approvedExpenseTotal;
  const pendingExpenseTotal = expenses
    .filter((expense) => expense.status === 'PENDING_APPROVAL')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = allocatedBudget - actualSpend;
  const utilization = allocatedBudget > 0 ? actualSpend / allocatedBudget * 100 : 0;
  const actualToday = todayKey();
  const derivedActivities = useMemo(() => {
    const localIds = new Set(activities.map((activity) => activity.id));
    return [
      ...existingActivities.filter((activity) => !localIds.has(activity.id)),
      ...activities,
    ].map((activity) => {
      const selectedStatus = activityStatuses[activity.id] || activity.status;
      const date = dateKey(parseDate(activity.startAt));
      const effectiveStatus = isUpcomingStatus(selectedStatus) && date < actualToday ? 'OVERDUE' : selectedStatus;
      return { ...activity, status: effectiveStatus };
    }).sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [existingActivities, activities, activityStatuses, actualToday]);
  const upcomingActivities = derivedActivities.filter(
    (activity) => dateKey(parseDate(activity.startAt)) >= actualToday && isUpcomingStatus(activity.status),
  );
  const overdueActivities = derivedActivities.filter((activity) => activity.status === 'OVERDUE');
  const filteredExpenses = expenses.filter((expense) => {
    return (expenseCategoryFilter === 'All categories' || expense.category === expenseCategoryFilter)
      && (expenseCampaignFilter === 'All campaigns' || expense.campaignId === expenseCampaignFilter)
      && (expenseStatusFilter === 'All statuses' || expense.status === expenseStatusFilter)
      && (!expenseDateFrom || expense.expenseDate >= expenseDateFrom)
      && (!expenseDateTo || expense.expenseDate <= expenseDateTo);
  });
  const filteredActivities = derivedActivities.filter((activity) => {
    const activityDate = dateKey(parseDate(activity.startAt));
    return (scheduleEmployeeFilter === 'All employees' || activity.employeeId === scheduleEmployeeFilter)
      && (schedulePlatformFilter === 'All platforms' || activity.platform === schedulePlatformFilter)
      && (scheduleTypeFilter === 'All activity types' || activity.type === scheduleTypeFilter)
      && (scheduleStatusFilter === 'All statuses' || activity.status === scheduleStatusFilter)
      && (!scheduleFrom || activityDate >= scheduleFrom)
      && (!scheduleTo || activityDate <= scheduleTo);
  });
  const audienceByPlatform = Array.from(
    socialMetrics.reduce((totals, metric) => {
      const current = totals.get(metric.platform) || { platform: metric.platform, reach: 0, views: 0, engagement: 0 };
      current.reach += metric.reach;
      current.views += metric.views;
      current.engagement += metric.likes + metric.comments + metric.shares;
      totals.set(metric.platform, current);
      return totals;
    }, new Map<string, { platform: string; reach: number; views: number; engagement: number }>()),
  ).map(([, value]) => value).sort((a, b) => b.reach - a.reach);
  const audienceScaleMax = Math.max(1, ...audienceByPlatform.map((platform) => platform.reach));
  const expenseByCategory = EXPENSE_CATEGORIES
    .map((category) => ({
      name: category,
      value: expenses.filter((expense) => expense.category === category && expense.status === 'APPROVED')
        .reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((entry) => entry.value > 0);
  const budgetChartData = mediaCampaigns.map((campaign) => ({
    project: campaign.title.length > 22 ? `${campaign.title.slice(0, 20)}…` : campaign.title,
    budget: projectBudgets.find((entry) => entry.campaignId === campaign.id)?.amount ?? campaign.budgetRef,
    actual: campaign.spentRef + expenses
      .filter((expense) => expense.campaignId === campaign.id && expense.status === 'APPROVED')
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const monthlySpend = Array.from(new Map(
    expenses.filter((expense) => expense.status === 'APPROVED').map((expense) => {
      const month = expense.expenseDate.slice(0, 7);
      return [month, (expenses.filter((item) => item.expenseDate.slice(0, 7) === month && item.status === 'APPROVED')
        .reduce((sum, item) => sum + item.amount, 0))];
    }),
  ), ([month, amount]) => ({ month, amount }));
  const activeCampaignCount = mediaCampaigns.filter((campaign) => campaign.status === 'Active').length;
  const activeStrategyCount = strategies.filter((strategy) => ['APPROVED', 'IN_PROGRESS'].includes(strategy.status)).length;
  const pendingStrategyCount = strategies.filter((strategy) => strategy.status === 'PENDING_APPROVAL').length;
  const engagementTotal = socialMetrics.reduce((sum, metric) => sum + metric.likes + metric.comments + metric.shares, 0);
  const reachTotal = socialMetrics.reduce((sum, metric) => sum + metric.reach, 0);
  const viewsTotal = socialMetrics.reduce((sum, metric) => sum + metric.views, 0);
  const completedContent = socialMetrics.length + reels.filter((reel) => reel.stage === 'Posted').length;
  const scheduleAdherence = derivedActivities.length
    ? Math.round(derivedActivities.filter((activity) => ['COMPLETED', 'PUBLISHED'].includes(activity.status)).length / derivedActivities.length * 100)
    : 0;

  const saveBudget = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const amount = Number(data.get('overallBudget'));
    setOverallBudget(amount > 0 ? amount : null);
    mediaCampaigns.forEach((campaign) => {
      const value = Number(data.get(`budget-${campaign.id}`));
      if (value > 0) setProjectBudgets((items) => {
        const next = items.filter((item) => item.campaignId !== campaign.id);
        return [...next, { campaignId: campaign.id, amount: value }];
      });
    });
    setShowBudgetForm(false);
  };

  const saveExpense = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const receipt = data.get('receipt');
    const current = expenses.find((expense) => expense.id === editingExpenseId);
    const nextExpense: MediaExpense = {
      id: editingExpenseId || `MEDIA-EXP-${Date.now()}`,
      title: String(data.get('title')),
      category: String(data.get('category')),
      campaignId: String(data.get('campaignId') || ''),
      description: String(data.get('description')),
      amount: Number(data.get('amount')),
      expenseDate: String(data.get('expenseDate')),
      submitterId: current?.submitterId || currentEmployee.permanentId,
      receiptName: receipt instanceof File && receipt.name ? receipt.name : current?.receiptName || '',
      status: current?.status || (data.get('saveAsDraft') ? 'DRAFT' : 'PENDING_APPROVAL'),
      createdBy: current?.createdBy || currentEmployee.name,
    };
    setExpenses((items) => current ? items.map((item) => item.id === current.id ? nextExpense : item) : [nextExpense, ...items]);
    form.reset();
    setEditingExpenseId(null);
    setShowExpenseForm(false);
  };

  const saveStrategy = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const current = strategies.find((strategy) => strategy.id === editingStrategyId);
    const status = String(data.get('submission')) as 'DRAFT' | 'PENDING_APPROVAL';
    const name = String(data.get('name'));
    const item: MediaStrategy = {
      id: editingStrategyId || `MEDIA-STR-${Date.now()}`,
      name,
      campaignId: String(data.get('campaignId') || ''),
      description: String(data.get('description')),
      objective: String(data.get('objective')),
      audience: String(data.get('audience')),
      platforms: data.getAll('platforms').map(String),
      activities: String(data.get('activities')),
      outcomes: String(data.get('outcomes')),
      targetReach: Number(data.get('targetReach')),
      targetEngagement: Number(data.get('targetEngagement')),
      targetLeads: Number(data.get('targetLeads')),
      estimatedBudget: Number(data.get('estimatedBudget')),
      startDate: String(data.get('startDate')),
      endDate: String(data.get('endDate')),
      ownerId: String(data.get('ownerId') || currentEmployee.permanentId),
      teamIds: data.getAll('teamIds').map(String),
      priority: String(data.get('priority')),
      status: current?.status === 'IN_PROGRESS' || current?.status === 'COMPLETED' ? current.status : status,
      actualReach: Number(data.get('actualReach')),
      actualEngagement: Number(data.get('actualEngagement')),
      actualLeads: Number(data.get('actualLeads')),
      actualSpend: Number(data.get('actualSpend')),
      history: [...(current?.history || []), `${new Date().toLocaleString()}: ${status === 'PENDING_APPROVAL' ? 'submitted for approval' : current ? 'updated' : 'created as draft'}`],
    };
    setStrategies((items) => current ? items.map((strategy) => strategy.id === current.id ? item : strategy) : [item, ...items]);
    form.reset();
    setEditingStrategyId(null);
    setShowStrategyForm(false);
  };

  const saveActivity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const startDate = String(data.get('startDate'));
    const startTime = String(data.get('startTime'));
    const activity: MediaActivity = {
      id: `MEDIA-ACT-${Date.now()}`,
      title: String(data.get('title')),
      description: String(data.get('description')),
      type: String(data.get('type')),
      platform: String(data.get('platform') || 'Internal'),
      campaignId: String(data.get('campaignId') || ''),
      employeeId: String(data.get('employeeId') || ''),
      startAt: `${startDate}T${startTime || '09:00'}`,
      endAt: `${String(data.get('endDate') || startDate)}T${String(data.get('endTime') || startTime || '10:00')}`,
      deadline: String(data.get('deadline') || ''),
      priority: String(data.get('priority')),
      status: 'PLANNED',
      source: 'local',
    };
    setActivities((items) => [activity, ...items]);
    form.reset();
    setShowScheduleForm(false);
  };

  const startOfWeek = (date: Date) => {
    const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
    return result;
  };
  const calendarDays = (() => {
    if (calendarView === 'WEEK') {
      const first = startOfWeek(calendarDate);
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(first);
        date.setDate(first.getDate() + index);
        return date;
      });
    }
    const first = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - offset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  })();
  const calendarActivities = (key: string) => filteredActivities.filter((activity) => dateKey(parseDate(activity.startAt)) === key);
  const changeActivityStatus = (id: string, status: ScheduleStatus) => {
    setActivityStatuses((current) => ({ ...current, [id]: status }));
  };

  if (!['OVERVIEW', 'FUNDS', 'STRATEGIES', 'SCHEDULE'].includes(activeTab)) return null;

  return (
    <div className="media-workspace space-y-4">
      <div className="p-3 rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-900 text-[11px] text-violet-800 dark:text-violet-200">
        UI preview: new entries are temporary and reset on refresh. Receipt fields keep a filename only; social publishing and approval actions are not connected.
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Media performance</h2><p className="mt-1 text-sm text-slate-500">Campaign investment, audience activity, and upcoming work</p></div>
            <span className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-700">Current tracked data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <OverviewMetric label="Allocated campaign budget" value={formatCurrency(allocatedBudget)} helper="Existing campaign references" icon={Wallet} />
            <OverviewMetric label="Actual expenditure" value={formatCurrency(actualSpend)} helper="Campaign spend and approved entries" icon={BarChart3} />
            <OverviewMetric label="Remaining budget" value={formatCurrency(remainingBudget)} helper={`${utilization.toFixed(1)}% utilized`} icon={Target} tone={utilization > 100 ? 'rose' : 'emerald'} />
            <OverviewMetric label="Budget utilization" value={`${utilization.toFixed(1)}%`} helper="Against tracked allocation" icon={BarChart3} tone={utilization >= 80 ? 'amber' : 'violet'} />
            <OverviewMetric label="Active strategies" value={activeStrategyCount.toLocaleString('en-IN')} helper="Approved or in progress" icon={Target} />
            <OverviewMetric label="Active campaigns" value={activeCampaignCount.toLocaleString('en-IN')} helper="Campaigns including Media" icon={CheckCircle2} />
            <OverviewMetric label="Upcoming activities" value={upcomingActivities.length.toLocaleString('en-IN')} helper="Existing dates and scheduled items" icon={CalendarDays} />
            <OverviewMetric label="Pending expense approvals" value={expenses.filter((expense) => expense.status === 'PENDING_APPROVAL').length.toLocaleString('en-IN')} helper={formatCurrency(pendingExpenseTotal)} icon={Clock3} tone="amber" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <section className="rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mb-4"><h3 className="text-base font-semibold text-slate-900 dark:text-white">Campaign budget vs actual</h3><p className="mt-1 text-xs text-slate-500">Existing campaigns that include Media</p></div>
              {budgetChartData.length ? <div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={budgetChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.22} /><XAxis dataKey="project" tick={{ fontSize: 10 }} interval={0} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="budget" name="Allocated" fill="#be123c" radius={[4, 4, 0, 0]} maxBarSize={36} /><Bar dataKey="actual" name="Actual" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={36} /></BarChart></ResponsiveContainer></div> : <EmptyState text="No Media campaign budget references available." />}
              {budgetChartData.length > 0 && <div className="mt-2 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-rose-700" />Allocated</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-slate-400" />Actual</span></div>}
            </section>
            <section className="rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mb-4"><h3 className="text-base font-semibold text-slate-900 dark:text-white">Audience by platform</h3><p className="mt-1 text-xs text-slate-500">Reach and views from existing social content</p></div>
              {audienceByPlatform.length ? (
                <div className="space-y-5 pt-1" role="group" aria-label="Reach and views compared across social platforms">
                  {audienceByPlatform.map((platform) => (
                    <div key={platform.platform} className="space-y-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{platform.platform}</span>
                        <span className="text-[11px] text-slate-500">{platform.engagement.toLocaleString('en-IN')} interactions</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-11 shrink-0 text-[11px] text-slate-500">Reach</span>
                          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={`${platform.platform} reach`} aria-valuemin={0} aria-valuemax={audienceScaleMax} aria-valuenow={platform.reach}>
                            <div className="h-full rounded-full bg-rose-700" style={{ width: `${platform.reach / audienceScaleMax * 100}%` }} />
                          </div>
                          <span className="w-[4.5rem] shrink-0 text-right text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">{platform.reach.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-11 shrink-0 text-[11px] text-slate-500">Views</span>
                          <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={`${platform.platform} views`} aria-valuemin={0} aria-valuemax={audienceScaleMax} aria-valuenow={platform.views}>
                            <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500" style={{ width: `${platform.views / audienceScaleMax * 100}%` }} />
                          </div>
                          <span className="w-[4.5rem] shrink-0 text-right text-xs font-medium tabular-nums text-slate-700 dark:text-slate-300">{platform.views.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800">Bars share one scale, set by the platform with the highest reach</p>
                </div>
              ) : <EmptyState text="No social media metrics available." />}
            </section>
            <section className="rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mb-4"><h3 className="text-base font-semibold text-slate-900 dark:text-white">Monthly expenditure</h3><p className="mt-1 text-xs text-slate-500">Dated approved expense entries in this session</p></div>
              {monthlySpend.length ? <div className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlySpend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.22} /><XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Line type="monotone" dataKey="amount" name="Approved expense" stroke="#be123c" strokeWidth={2.5} dot={{ r: 3, fill: '#be123c' }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div> : <EmptyState text="No dated approved expense entries yet." />}
            </section>
            <section className="rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="mb-4"><h3 className="text-base font-semibold text-slate-900 dark:text-white">Management insights</h3><p className="mt-1 text-xs text-slate-500">Current activity across content and campaigns</p></div>
              <div className="grid grid-cols-2 gap-2">
                <Insight label="Total Reach" value={reachTotal.toLocaleString('en-IN')} />
                <Insight label="Total Views" value={viewsTotal.toLocaleString('en-IN')} />
                <Insight label="Engagement" value={engagementTotal.toLocaleString('en-IN')} />
                <Insight label="Completed Content" value={completedContent.toLocaleString('en-IN')} />
                <Insight label="Overdue Activities" value={overdueActivities.length.toLocaleString('en-IN')} />
                <Insight label="Schedule Adherence" value={`${scheduleAdherence}%`} />
              </div>
            </section>
          </div>

          <section className="rounded-2xl bg-white p-5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4"><h3 className="text-base font-semibold text-slate-900 dark:text-white">Management alerts</h3><p className="mt-1 text-xs text-slate-500">Items that may need follow-up</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {utilization >= 80 && <Alert text={`Media campaign budget utilization is ${utilization.toFixed(1)}%.`} danger={utilization >= 100} />}
              {utilization > 100 && <Alert text="Tracked spending exceeds allocated campaign references." danger />}
              {pendingStrategyCount > 0 && <Alert text={`${pendingStrategyCount} strategy awaiting approval.`} />}
              {overdueActivities.length > 0 && <Alert text={`${overdueActivities.length} scheduled activities are overdue.`} danger />}
              {expenses.some((expense) => expense.status === 'PENDING_APPROVAL') && <Alert text={`${expenses.filter((expense) => expense.status === 'PENDING_APPROVAL').length} expense entries awaiting approval.`} />}
              {utilization < 80 && pendingStrategyCount === 0 && overdueActivities.length === 0 && !expenses.some((expense) => expense.status === 'PENDING_APPROVAL') && <p className="col-span-full text-xs text-slate-500">No active management alerts.</p>}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'FUNDS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <Metric label="Allocated Funds" value={formatCurrency(allocatedBudget)} helper="Tracked Media campaign budgets" icon={Wallet} />
            <Metric label="Tracked Actual Spending" value={formatCurrency(actualSpend)} helper="Existing campaign spend + approved UI entries" icon={CheckCircle2} tone="emerald" />
            <Metric label="Pending Expenses" value={formatCurrency(pendingExpenseTotal)} helper="Awaiting review" icon={Clock3} tone="amber" />
            <Metric label="Available Funds" value={formatCurrency(remainingBudget)} helper="Allocated less approved spend" icon={Target} tone={remainingBudget < 0 ? 'rose' : 'blue'} />
            <Metric label="Utilization" value={`${utilization.toFixed(1)}%`} helper="Tracked campaign budget usage" icon={BarChart3} tone={utilization >= 80 ? 'amber' : 'violet'} />
          </div>

          <div className="flex flex-wrap justify-between items-center gap-2">
            <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Media Funds</h2><p className="text-[10px] text-slate-500">Campaign-specific budget references only; company Accounts data is not displayed.</p></div>
            <div className="flex gap-2">
              <button onClick={() => setShowBudgetForm(true)} className="px-3 py-2 rounded-xl border border-violet-200 text-violet-700 dark:text-violet-300 text-xs font-bold">Edit budgets</button>
              <button onClick={() => { setEditingExpenseId(null); setShowExpenseForm(true); }} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add expense</button>
              <button onClick={() => exportCsv('media-expenses.csv', filteredExpenses.map((expense) => ({ ...expense, campaign: campaignById(expense.campaignId)?.title || '' })))} className="px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1"><Download className="w-3.5 h-3.5" /> Export CSV</button>
            </div>
          </div>

          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800"><h3 className="text-xs font-bold">Project / Campaign Budget Utilization</h3></div>
            <table className="w-full text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase text-slate-500"><tr><th className="p-3 text-left">Campaign</th><th className="p-3 text-right">Allocated</th><th className="p-3 text-right">Actual spend</th><th className="p-3 text-right">Remaining</th><th className="p-3">Utilization</th><th className="p-3">Alert</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {budgetChartData.map((item, index) => {
                  const campaign = mediaCampaigns[index];
                  const percentage = item.budget ? item.actual / item.budget * 100 : 0;
                  return <tr key={campaign.id}><td className="p-3 font-semibold">{campaign.title}</td><td className="p-3 text-right">{formatCurrency(item.budget)}</td><td className="p-3 text-right">{formatCurrency(item.actual)}</td><td className="p-3 text-right">{formatCurrency(item.budget - item.actual)}</td><td className="p-3 min-w-36"><div className="flex items-center gap-2"><div className="h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-2 rounded-full ${percentage >= 100 ? 'bg-rose-500' : percentage >= 80 ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} /></div><span className="text-[10px]">{percentage.toFixed(0)}%</span></div></td><td className="p-3">{percentage >= 100 ? <StatusBadge label="Exceeded" variant="danger" /> : percentage >= 80 ? <StatusBadge label="80%+ used" variant="warning" /> : <StatusBadge label="On track" variant="success" />}</td></tr>;
                })}
                {!budgetChartData.length && <tr><td className="p-8 text-center text-slate-500" colSpan={6}>No Media campaign budget references available.</td></tr>}
              </tbody>
            </table>
          </section>

          <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold">Category-wise Approved Expenses</h3>
            <p className="text-[10px] text-slate-500 mb-3">Based on expenses approved in this temporary UI preview.</p>
            {expenseByCategory.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" outerRadius={90}>
                      {expenseByCategory.map((entry, index) => <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <EmptyState text="No approved expenses to report by category." />}
          </section>

          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between gap-2 items-center">
              <div><h3 className="text-xs font-bold">Expense Management</h3><p className="text-[10px] text-slate-500">New entries are page-local; approvals are not enabled in this UI-only preview.</p></div>
              <div className="flex flex-wrap gap-2">
                <select value={expenseCategoryFilter} onChange={(event) => setExpenseCategoryFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All categories</option>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select>
                <select value={expenseCampaignFilter} onChange={(event) => setExpenseCampaignFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All campaigns</option>{mediaCampaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select>
                <select value={expenseStatusFilter} onChange={(event) => setExpenseStatusFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All statuses</option>{['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED'].map((status) => <option key={status}>{status}</option>)}</select>
                <input type="date" aria-label="Expense from date" value={expenseDateFrom} onChange={(event) => setExpenseDateFrom(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent" />
                <input type="date" aria-label="Expense to date" value={expenseDateTo} onChange={(event) => setExpenseDateTo(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent" />
              </div>
            </div>
            <table className="w-full text-xs min-w-[850px]">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase text-slate-500"><tr><th className="p-3 text-left">Expense</th><th className="p-3">Category</th><th className="p-3">Campaign</th><th className="p-3 text-right">Amount</th><th className="p-3">Date / submitter</th><th className="p-3">Receipt</th><th className="p-3">Approval</th><th className="p-3">Actions</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((expense) => <tr key={expense.id}>
                  <td className="p-3"><b>{expense.title}</b><p className="text-[10px] text-slate-500">{expense.description}</p></td>
                  <td className="p-3">{expense.category}</td><td className="p-3">{campaignById(expense.campaignId)?.title || '—'}</td>
                  <td className="p-3 text-right font-bold">{formatCurrency(expense.amount)}</td>
                  <td className="p-3">{expense.expenseDate}<p className="text-[10px] text-slate-500">{employeeById(expense.submitterId)?.name || expense.createdBy}</p></td>
                  <td className="p-3">{expense.receiptName || '—'}</td>
                  <td className="p-3"><StatusBadge label={expense.status} variant={statusVariant(expense.status)} /></td>
                  <td className="p-3"><div className="flex gap-1"><button onClick={() => setShowExpenseDetails(expense)} className="px-2 py-1 rounded-md border text-[10px]">View</button>{expense.status === 'DRAFT' && <><button onClick={() => { setEditingExpenseId(expense.id); setShowExpenseForm(true); }} className="px-2 py-1 rounded-md border text-[10px]">Edit</button><button onClick={() => setExpenses((items) => items.filter((item) => item.id !== expense.id))} className="px-2 py-1 rounded-md border text-[10px] text-rose-600">Cancel</button></>}</div></td>
                </tr>)}
                {!filteredExpenses.length && <tr><td className="p-8 text-center text-slate-500" colSpan={8}>No matching expense entries. Add an expense to start a local preview.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {activeTab === 'STRATEGIES' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2"><div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Media Strategies</h2><p className="text-[10px] text-slate-500">Plan campaign outcomes and compare manually entered targets with actuals.</p></div><button onClick={() => { setEditingStrategyId(null); setShowStrategyForm(true); }} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New strategy</button></div>
          {strategies.map((strategy) => {
            const campaign = campaignById(strategy.campaignId);
            const progress = (actual: number, target: number) => target ? Math.min(100, actual / target * 100) : 0;
            return <article key={strategy.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex flex-wrap justify-between gap-3">
                <div><div className="flex items-center gap-2"><h3 className="text-sm font-bold">{strategy.name}</h3><StatusBadge label={strategy.status} variant={statusVariant(strategy.status)} /></div><p className="text-[10px] text-slate-500 mt-1">{campaign?.title || 'No linked campaign'} · Owner: {employeeById(strategy.ownerId)?.name || currentEmployee.name} · {strategy.startDate} – {strategy.endDate}</p></div>
                <div className="flex gap-2"><button onClick={() => { setEditingStrategyId(strategy.id); setShowStrategyForm(true); }} className="px-2.5 py-1.5 rounded-lg border text-[10px]">Edit</button>{strategy.status === 'DRAFT' && <button onClick={() => setStrategies((items) => items.filter((item) => item.id !== strategy.id))} className="px-2.5 py-1.5 rounded-lg border text-[10px] text-rose-600">Delete draft</button>}</div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{strategy.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ProgressItem label="Reach" actual={strategy.actualReach} target={strategy.targetReach} percent={progress(strategy.actualReach, strategy.targetReach)} />
                <ProgressItem label="Engagement" actual={strategy.actualEngagement} target={strategy.targetEngagement} percent={progress(strategy.actualEngagement, strategy.targetEngagement)} />
                <ProgressItem label="Leads" actual={strategy.actualLeads} target={strategy.targetLeads} percent={progress(strategy.actualLeads, strategy.targetLeads)} />
                <ProgressItem label="Budget spend" actual={strategy.actualSpend} target={strategy.estimatedBudget} percent={progress(strategy.actualSpend, strategy.estimatedBudget)} currency />
              </div>
              <div className="flex flex-wrap justify-between gap-2 text-[10px] text-slate-500"><span>Platforms: {strategy.platforms.join(', ') || '—'}</span><span>Target leads: {strategy.targetLeads.toLocaleString('en-IN')}</span><span>{strategy.history.length} history entries</span></div>
              <details className="text-[10px] text-slate-500"><summary className="cursor-pointer">Strategy history</summary><ul className="list-disc ml-4 mt-2 space-y-1">{strategy.history.map((entry, index) => <li key={`${strategy.id}-${index}`}>{entry}</li>)}</ul></details>
            </article>;
          })}
          {!strategies.length && <EmptyPanel title="No strategies yet" text="Create a draft strategy to track goals, audience, platform mix and results." />}
          {strategies.some((strategy) => strategy.status === 'PENDING_APPROVAL') && <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">Strategy approval controls are not enabled in this UI-only preview. Server-side identity and approval permissions must be connected first.</div>}
        </div>
      )}

      {activeTab === 'SCHEDULE' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-sm font-bold text-slate-900 dark:text-white">Media Schedule</h2><p className="text-[10px] text-slate-500">Existing podcast, campaign, event and published-content dates plus local schedule entries.</p></div>
            <div className="flex gap-2"><div className="flex rounded-xl border bg-white dark:bg-slate-900 p-1">{(['MONTH', 'WEEK', 'AGENDA'] as const).map((view) => <button key={view} onClick={() => setCalendarView(view)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold ${calendarView === view ? 'bg-violet-600 text-white' : 'text-slate-500'}`}>{view === 'MONTH' ? 'Month' : view === 'WEEK' ? 'Week' : 'Agenda'}</button>)}</div><button onClick={() => setShowScheduleForm(true)} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add activity</button></div>
          </div>

          <section className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
            <select value={scheduleEmployeeFilter} onChange={(event) => setScheduleEmployeeFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All employees</option>{employees.filter((employee) => employee.department === 'Media').map((employee) => <option key={employee.permanentId} value={employee.permanentId}>{employee.name}</option>)}</select>
            <select value={schedulePlatformFilter} onChange={(event) => setSchedulePlatformFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All platforms</option>{Array.from(new Set(derivedActivities.map((activity) => activity.platform))).filter(Boolean).map((platform) => <option key={platform}>{platform}</option>)}</select>
            <select value={scheduleTypeFilter} onChange={(event) => setScheduleTypeFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All activity types</option>{Array.from(new Set(derivedActivities.map((activity) => activity.type))).filter(Boolean).map((type) => <option key={type}>{type}</option>)}</select>
            <select value={scheduleStatusFilter} onChange={(event) => setScheduleStatusFilter(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent"><option>All statuses</option>{SCHEDULE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
            <input type="date" aria-label="Schedule from date" value={scheduleFrom} onChange={(event) => setScheduleFrom(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent" />
            <input type="date" aria-label="Schedule to date" value={scheduleTo} onChange={(event) => setScheduleTo(event.target.value)} className="p-2 rounded-lg border text-[10px] bg-transparent" />
          </section>

          {calendarView === 'AGENDA' ? (
            <ActivityTable activities={filteredActivities} campaigns={mediaCampaigns} employees={employees} onStatusChange={changeActivityStatus} onDelete={(id) => setActivities((items) => items.filter((item) => item.id !== id))} />
          ) : (
            <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="px-2.5 py-1.5 rounded-lg border text-xs">Previous</button>
                <h3 className="text-xs font-bold">{calendarView === 'WEEK' ? `Week of ${dateKey(startOfWeek(calendarDate))}` : calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="px-2.5 py-1.5 rounded-lg border text-xs">Next</button>
              </div>
              <div className="grid grid-cols-7 border-l border-t border-slate-200 dark:border-slate-700">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="p-2 border-r border-b bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-center">{day}</div>)}
                {calendarDays.map((date) => {
                  const key = dateKey(date);
                  const inMonth = date.getMonth() === calendarDate.getMonth() || calendarView === 'WEEK';
                  const dayActivities = calendarActivities(key);
                  return <div key={key} className={`min-h-24 p-1.5 border-r border-b border-slate-200 dark:border-slate-700 ${inMonth ? '' : 'bg-slate-50/70 dark:bg-slate-800/40'}`}>
                    <span className={`text-[10px] ${key === actualToday ? 'px-1.5 py-0.5 rounded-full bg-violet-600 text-white' : inMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>{date.getDate()}</span>
                    <div className="mt-1 space-y-1">{dayActivities.slice(0, 2).map((activity) => <div key={activity.id} title={activity.title} className="truncate rounded px-1 py-0.5 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-200 text-[9px]">{activity.title}</div>)}{dayActivities.length > 2 && <span className="text-[9px] text-slate-500">+{dayActivities.length - 2} more</span>}</div>
                  </div>;
                })}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Metric label="Upcoming activities" value={upcomingActivities.length.toLocaleString('en-IN')} helper="Scheduled dates ahead" icon={CalendarDays} />
            <Metric label="Overdue activities" value={overdueActivities.length.toLocaleString('en-IN')} helper="Past due, not completed" icon={AlertTriangle} tone="rose" />
            <Metric label="Completed / published" value={derivedActivities.filter((activity) => ['COMPLETED', 'PUBLISHED'].includes(activity.status)).length.toLocaleString('en-IN')} helper="From existing content records" icon={CheckCircle2} tone="emerald" />
          </div>

          <section className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold mb-3">Schedule Reminders</h3>
            {[...overdueActivities, ...upcomingActivities].slice(0, 6).length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...overdueActivities, ...upcomingActivities].slice(0, 6).map((activity) => (
                  <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
                    <div><p className="font-semibold">{activity.title}</p><p className="text-[10px] text-slate-500">{activity.type} · {activity.startAt.replace('T', ' ')}</p></div>
                    <StatusBadge label={activity.status} variant={statusVariant(activity.status)} />
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-slate-500">No upcoming or overdue activities.</p>}
          </section>
        </div>
      )}

      {showBudgetForm && activeTab === 'FUNDS' && <Modal title="Set Media Budget References" onClose={() => setShowBudgetForm(false)}>
        <form onSubmit={saveBudget} className="space-y-3">
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-[10px] text-violet-700 dark:text-violet-200">Temporary UI values only. Existing campaign records are not changed.</div>
          <label className="block text-xs font-semibold">Overall Media budget (optional)<input name="overallBudget" type="number" min="0" defaultValue={overallBudget ?? ''} placeholder={formatCurrency(baseAllocated)} className={`${INPUT_CLASS} mt-1`} /></label>
          <div className="space-y-2">{mediaCampaigns.map((campaign) => <label key={campaign.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center text-xs"><span>{campaign.title}<small className="block text-[10px] text-slate-500">Current: {formatCurrency(projectBudgets.find((item) => item.campaignId === campaign.id)?.amount ?? campaign.budgetRef)}</small></span><input name={`budget-${campaign.id}`} type="number" min="0" placeholder="Keep current reference" className={INPUT_CLASS} /></label>)}</div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowBudgetForm(false)} className="px-3 py-2 rounded-lg border text-xs">Cancel</button><button className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold">Save temporary values</button></div>
        </form>
      </Modal>}

      {showExpenseForm && activeTab === 'FUNDS' && <Modal title={editingExpenseId ? 'Edit Draft Expense' : 'Add Media Expense'} onClose={() => { setShowExpenseForm(false); setEditingExpenseId(null); }}>
        <ExpenseForm
          expense={expenses.find((expense) => expense.id === editingExpenseId)}
          campaigns={mediaCampaigns}
          onSubmit={saveExpense}
          onCancel={() => { setShowExpenseForm(false); setEditingExpenseId(null); }}
        />
      </Modal>}

      {showExpenseDetails && activeTab === 'FUNDS' && <Modal title="Expense Details" onClose={() => setShowExpenseDetails(null)}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Detail label="Title" value={showExpenseDetails.title} /><Detail label="Category" value={showExpenseDetails.category} />
          <Detail label="Campaign" value={campaignById(showExpenseDetails.campaignId)?.title || '—'} /><Detail label="Amount" value={formatCurrency(showExpenseDetails.amount)} />
          <Detail label="Expense date" value={showExpenseDetails.expenseDate} /><Detail label="Submitted by" value={employeeById(showExpenseDetails.submitterId)?.name || showExpenseDetails.createdBy} />
          <Detail label="Receipt filename" value={showExpenseDetails.receiptName || 'No file selected'} /><Detail label="Status" value={showExpenseDetails.status} />
          <div className="sm:col-span-2"><Detail label="Description" value={showExpenseDetails.description} /></div>
        </dl>
      </Modal>}

      {showStrategyForm && activeTab === 'STRATEGIES' && <Modal title={editingStrategyId ? 'Edit Strategy' : 'Create Media Strategy'} onClose={() => { setShowStrategyForm(false); setEditingStrategyId(null); }}>
        <StrategyForm
          strategy={strategies.find((strategy) => strategy.id === editingStrategyId)}
          campaigns={mediaCampaigns}
          employees={mediaEmployees}
          currentEmployee={currentEmployee}
          onSubmit={saveStrategy}
          onCancel={() => { setShowStrategyForm(false); setEditingStrategyId(null); }}
        />
      </Modal>}

      {showScheduleForm && activeTab === 'SCHEDULE' && <Modal title="Schedule Media Activity" onClose={() => setShowScheduleForm(false)}>
        <ScheduleForm campaigns={mediaCampaigns} employees={mediaEmployees} onSubmit={saveActivity} onCancel={() => setShowScheduleForm(false)} />
      </Modal>}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="h-56 flex items-center justify-center text-xs text-slate-500">{text}</div>;
}

function EmptyPanel({ title, text }: { title: string; text: string }) {
  return <div className="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center"><h3 className="text-sm font-bold">{title}</h3><p className="text-xs text-slate-500 mt-1">{text}</p></div>;
}

function Insight({ label, value }: { label: string; value: string }) {
  return <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><p className="text-[10px] uppercase text-slate-500">{label}</p><p className="text-base font-bold mt-1">{value}</p></div>;
}

function Alert({ text, danger = false }: { text: string; danger?: boolean }) {
  return <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${danger ? 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-200' : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200'}`}><AlertTriangle className="w-4 h-4 shrink-0" />{text}</div>;
}

function ProgressItem({ label, actual, target, percent, currency = false }: { label: string; actual: number; target: number; percent: number; currency?: boolean }) {
  const display = (amount: number) => currency ? formatCurrency(amount) : amount.toLocaleString('en-IN');
  return <div><div className="flex justify-between gap-2 text-[10px] mb-1"><span className="text-slate-500">{label}</span><span className="font-semibold">{display(actual)} / {display(target)}</span></div><div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${percent}%` }} /></div></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] uppercase text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{value}</dd></div>;
}

function ExpenseForm({ expense, campaigns, onSubmit, onCancel }: {
  expense?: MediaExpense;
  campaigns: CampaignWorkspace[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <label className="text-xs font-semibold">Expense title<input name="title" required defaultValue={expense?.title} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Category<select name="category" required defaultValue={expense?.category} className={`${INPUT_CLASS} mt-1`}>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
    <label className="text-xs font-semibold sm:col-span-2">Related campaign<select name="campaignId" defaultValue={expense?.campaignId || ''} className={`${INPUT_CLASS} mt-1`}><option value="">Company-wide Media</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label>
    <label className="text-xs font-semibold">Amount<input name="amount" type="number" min="0.01" step="0.01" required defaultValue={expense?.amount} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Expense date<input name="expenseDate" type="date" required defaultValue={expense?.expenseDate} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Description<textarea name="description" rows={2} defaultValue={expense?.description} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Receipt / bill filename<input name="receipt" type="file" accept=".pdf,.png,.jpg,.jpeg" className={`${INPUT_CLASS} mt-1`} /></label>
    <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border text-xs">Cancel</button>{!expense && <button name="saveAsDraft" value="true" className="px-3 py-2 rounded-lg border text-xs font-bold">Save draft</button>}<button className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold">{expense ? 'Save draft' : 'Submit expense'}</button></div>
  </form>;
}

function StrategyForm({ strategy, campaigns, employees, currentEmployee, onSubmit, onCancel }: {
  strategy?: MediaStrategy;
  campaigns: CampaignWorkspace[];
  employees: Employee[];
  currentEmployee: Employee;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <label className="text-xs font-semibold">Strategy name<input name="name" required defaultValue={strategy?.name} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Campaign<select name="campaignId" defaultValue={strategy?.campaignId || ''} className={`${INPUT_CLASS} mt-1`}><option value="">Select campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label>
    <label className="text-xs font-semibold">Business objective<input name="objective" defaultValue={strategy?.objective} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Target audience<input name="audience" defaultValue={strategy?.audience} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Description<textarea name="description" rows={2} required defaultValue={strategy?.description} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Planned activities<textarea name="activities" rows={2} defaultValue={strategy?.activities} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Expected outcomes<textarea name="outcomes" rows={2} defaultValue={strategy?.outcomes} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Platforms<select name="platforms" multiple defaultValue={strategy?.platforms || []} className={`${INPUT_CLASS} mt-1 h-24`}>{PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
    <label className="text-xs font-semibold">Responsible team members<select name="teamIds" multiple defaultValue={strategy?.teamIds || []} className={`${INPUT_CLASS} mt-1 h-24`}>{employees.map((employee) => <option key={employee.permanentId} value={employee.permanentId}>{employee.name}</option>)}</select></label>
    <label className="text-xs font-semibold">Strategy owner<select name="ownerId" defaultValue={strategy?.ownerId || currentEmployee.permanentId} className={`${INPUT_CLASS} mt-1`}>{employees.map((employee) => <option key={employee.permanentId} value={employee.permanentId}>{employee.name}</option>)}</select></label>
    <label className="text-xs font-semibold">Priority<select name="priority" defaultValue={strategy?.priority || 'MEDIUM'} className={`${INPUT_CLASS} mt-1`}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
    <label className="text-xs font-semibold">Start date<input name="startDate" type="date" required defaultValue={strategy?.startDate} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">End date<input name="endDate" type="date" required defaultValue={strategy?.endDate} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Target reach<input name="targetReach" type="number" min="0" defaultValue={strategy?.targetReach ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Target engagement<input name="targetEngagement" type="number" min="0" defaultValue={strategy?.targetEngagement ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Target leads<input name="targetLeads" type="number" min="0" defaultValue={strategy?.targetLeads ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Estimated budget<input name="estimatedBudget" type="number" min="0" defaultValue={strategy?.estimatedBudget ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Actual reach<input name="actualReach" type="number" min="0" defaultValue={strategy?.actualReach ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Actual engagement<input name="actualEngagement" type="number" min="0" defaultValue={strategy?.actualEngagement ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Actual leads<input name="actualLeads" type="number" min="0" defaultValue={strategy?.actualLeads ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Actual spend<input name="actualSpend" type="number" min="0" defaultValue={strategy?.actualSpend ?? 0} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Initial status<select name="submission" defaultValue={strategy?.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'DRAFT'} className={`${INPUT_CLASS} mt-1`}><option value="DRAFT">Save as draft</option><option value="PENDING_APPROVAL">Submit for approval</option></select></label>
    <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border text-xs">Cancel</button><button className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold">Save strategy</button></div>
  </form>;
}

function ScheduleForm({ campaigns, employees, onSubmit, onCancel }: {
  campaigns: CampaignWorkspace[];
  employees: Employee[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <label className="text-xs font-semibold sm:col-span-2">Activity title<input name="title" required className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Activity type<select name="type" className={`${INPUT_CLASS} mt-1`}>{ACTIVITY_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label className="text-xs font-semibold">Platform<select name="platform" className={`${INPUT_CLASS} mt-1`}><option>Internal</option>{PLATFORMS.map((platform) => <option key={platform}>{platform}</option>)}</select></label>
    <label className="text-xs font-semibold sm:col-span-2">Related campaign<select name="campaignId" className={`${INPUT_CLASS} mt-1`}><option value="">No linked campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.title}</option>)}</select></label>
    <label className="text-xs font-semibold">Assigned employee<select name="employeeId" className={`${INPUT_CLASS} mt-1`}><option value="">Unassigned</option>{employees.map((employee) => <option key={employee.permanentId} value={employee.permanentId}>{employee.name}</option>)}</select></label>
    <label className="text-xs font-semibold">Priority<select name="priority" defaultValue="MEDIUM" className={`${INPUT_CLASS} mt-1`}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
    <label className="text-xs font-semibold">Start date<input name="startDate" type="date" required defaultValue={todayKey()} className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Start time<input name="startTime" type="time" defaultValue="09:00" className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">End date<input name="endDate" type="date" className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">End time<input name="endTime" type="time" defaultValue="10:00" className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold">Deadline<input name="deadline" type="date" className={`${INPUT_CLASS} mt-1`} /></label>
    <label className="text-xs font-semibold sm:col-span-2">Description<textarea name="description" rows={2} className={`${INPUT_CLASS} mt-1`} /></label>
    <div className="sm:col-span-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500">Activities are scheduled locally. Publishing is manual; no social platform is connected.</div>
    <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-3 py-2 rounded-lg border text-xs">Cancel</button><button className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold">Add to schedule</button></div>
  </form>;
}

function ActivityTable({ activities, campaigns, employees, onStatusChange, onDelete }: {
  activities: MediaActivity[];
  campaigns: CampaignWorkspace[];
  employees: Employee[];
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onDelete: (id: string) => void;
}) {
  const campaignName = (id: string) => campaigns.find((campaign) => campaign.id === id)?.title || '—';
  const employeeName = (id: string) => employees.find((employee) => employee.permanentId === id)?.name || '—';
  return <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
    <table className="w-full min-w-[780px] text-xs">
      <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase text-slate-500"><tr><th className="p-3 text-left">Activity</th><th className="p-3">Type / platform</th><th className="p-3">Campaign / owner</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Update</th><th className="p-3">Action</th></tr></thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {activities.map((activity) => <tr key={activity.id}>
          <td className="p-3"><b>{activity.title}</b><p className="text-[10px] text-slate-500">{activity.description}</p></td>
          <td className="p-3">{activity.type}<p className="text-[10px] text-slate-500">{activity.platform}</p></td>
          <td className="p-3">{campaignName(activity.campaignId)}<p className="text-[10px] text-slate-500">{employeeName(activity.employeeId)}</p></td>
          <td className="p-3">{activity.startAt.replace('T', ' ')}</td>
          <td className="p-3"><StatusBadge label={activity.status} variant={statusVariant(activity.status)} /></td>
          <td className="p-3">{activity.source === 'local' ? <select value={activity.status} onChange={(event) => onStatusChange(activity.id, event.target.value as ScheduleStatus)} className="p-1.5 rounded-lg border text-[10px] bg-transparent">{SCHEDULE_STATUSES.filter((status) => status !== 'OVERDUE').map((status) => <option key={status}>{status}</option>)}</select> : <span className="text-[10px] text-slate-400">From existing data</span>}</td>
          <td className="p-3">{activity.source === 'local' && <button onClick={() => onDelete(activity.id)} className="px-2 py-1 rounded-lg border text-[10px] text-rose-600">Delete</button>}</td>
        </tr>)}
        {!activities.length && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No activities match the selected filters.</td></tr>}
      </tbody>
    </table>
  </section>;
}

