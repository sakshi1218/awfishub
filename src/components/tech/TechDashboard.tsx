'use client';

import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bug,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Code2,
  FolderKanban,
  ListTodo,
  Rocket,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
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
import { techPanelClass } from './styles';

const budgetMetrics = [
  { label: 'ALLOCATED TECH BUDGET', value: '₹10,00,000', note: 'Q4 2026', icon: CircleDollarSign },
  { label: 'ACTUAL EXPENDITURE', value: '₹2,45,000', note: '24% utilized', icon: Activity },
  { label: 'REMAINING BUDGET', value: '₹7,55,000', note: 'Approved spending only', icon: CircleDollarSign },
  { label: 'PENDING APPROVALS', value: '3', note: '1 request pending', icon: AlertTriangle },
];

const operationsMetrics = [
  { label: 'ACTIVE PROJECTS', value: '4', note: 'In development', icon: FolderKanban },
  { label: 'OPEN TASKS', value: '18', note: 'Across all projects', icon: ListTodo },
  { label: 'UPCOMING DEADLINES', value: '3', note: 'Next 30 days', icon: CalendarClock },
  { label: 'COMPLETED PROJECTS', value: '2', note: 'Delivered / deployed', icon: CheckCircle2 },
];

const technologyMetrics = [
  { label: 'TOTAL TEAM MEMBERS', value: '8', note: 'Developers, designers, QA', icon: UsersRound },
  { label: 'BUGS OPEN', value: '6', note: '2 high priority', icon: Bug },
  { label: 'DEPLOYMENTS THIS MONTH', value: '5', note: 'Production + staging', icon: Rocket },
  { label: 'SERVER / CLOUD COST', value: '₹32,000', note: 'This month', icon: Cloud },
];

const expenditure = [
  { month: 'August', amount: 40000 },
  { month: 'September', amount: 65000 },
  { month: 'October', amount: 90000 },
  { month: 'November', amount: 50000 },
];

const projectActivity = [
  { name: 'Frontend', tasks: 45 },
  { name: 'Backend', tasks: 38 },
  { name: 'AI/ML', tasks: 25 },
  { name: 'DevOps', tasks: 15 },
];

const budgetBreakdown = [
  { name: 'Salaries', value: 150000, color: '#4f46e5' },
  { name: 'Cloud / Hosting', value: 45000, color: '#7c3aed' },
  { name: 'Tools & Licenses', value: 30000, color: '#a78bfa' },
  { name: 'Miscellaneous', value: 20000, color: '#cbd5e1' },
];

const activities = [
  { text: 'AI Chatbot deployed to staging', time: '20 minutes ago', icon: Rocket },
  { text: 'Bug #124 fixed', time: '1 hour ago', icon: Bug },
  { text: 'New project request approved', time: '3 hours ago', icon: BadgeCheck },
  { text: 'Backend API updated', time: '5 hours ago', icon: Code2 },
  { text: 'Database backup completed', time: 'Yesterday', icon: CheckCircle2 },
];

const chartTooltipStyle = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  color: 'var(--foreground)',
  fontSize: 12,
};

function MetricRow({ metrics }: { metrics: { label: string; value: string; note: string; icon: LucideIcon }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <article key={metric.label} className={`${techPanelClass} flex min-h-[142px] flex-col p-4 sm:p-5`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase leading-4 tracking-[0.1em] text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{metric.note}</p>
          </article>
        );
      })}
    </div>
  );
}

function ChartHeading({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>;
}

export default function TechDashboard() {
  return (
    <div className="space-y-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
      <MetricRow metrics={budgetMetrics} />
      <MetricRow metrics={operationsMetrics} />
      <MetricRow metrics={technologyMetrics} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${techPanelClass} p-4 sm:p-5`}>
          <ChartHeading title="Monthly Tech Expenditure" />
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenditure} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `₹${value / 1000}k`}
                  width={52}
                />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Expenditure']} />
                <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className={`${techPanelClass} p-4 sm:p-5`}>
          <ChartHeading title="Project Progress & Activity" />
          <div className="mt-4 grid grid-cols-3 gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            {[
              { label: 'Total Commits', value: '1,240' },
              { label: 'Bugs Fixed', value: '86' },
              { label: 'Deployments', value: '24' },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectActivity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="tasks" fill="#7c3aed" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${techPanelClass} p-4 sm:p-5`}>
          <ChartHeading title="Budget Breakdown" />
          <div className="mt-3 grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(150px,1fr)]">
            <div className="h-56 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetBreakdown} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={3}>
                    {budgetBreakdown.map((item) => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-3">
              {budgetBreakdown.map((item) => (
                <li key={item.name} className="flex items-start gap-2.5">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">₹{item.value.toLocaleString('en-IN')}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${techPanelClass} p-4 sm:p-5`}>
          <ChartHeading title="Recent Activity" />
          <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <li key={activity.text} className="flex items-start gap-3 py-3 first:pt-1">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium leading-5 text-slate-800 dark:text-slate-100">{activity.text}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">{activity.time}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
