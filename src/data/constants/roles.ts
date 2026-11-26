import { RoleType, PermissionMatrixRow } from '@/types';

export interface RoleConfig {
  id: RoleType;
  title: string;
  shortTitle: string;
  hierarchyLevel: number;
  description: string;
  badgeClass: string;
}

export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  CHAIRPERSON: {
    id: 'CHAIRPERSON',
    title: 'Chairperson',
    shortTitle: 'Chairperson',
    hierarchyLevel: 1,
    description: 'Complete company governance, executive approvals, finance, and asset inventory authority.',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
  },
  DIRECTOR: {
    id: 'DIRECTOR',
    title: 'Director',
    shortTitle: 'Director',
    hierarchyLevel: 2,
    description: 'Isolated divisional governance, department performance, approvals, and team workload.',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30',
  },
  OPERATION_HEAD: {
    id: 'OPERATION_HEAD',
    title: 'Operation Head',
    shortTitle: 'Op Head',
    hierarchyLevel: 3,
    description: 'Eight-department orchestration, operational progress, SLA tracking, and daily/weekly reports.',
    badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30',
  },
  TEAM_LEAD: {
    id: 'TEAM_LEAD',
    title: 'Department / Team Lead',
    shortTitle: 'Team Lead',
    hierarchyLevel: 4,
    description: 'Team assignment, sprint tracking, employee workload balancing, and report reviews.',
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30',
  },
  FACULTY: {
    id: 'FACULTY',
    title: 'Faculty Member',
    shortTitle: 'Faculty',
    hierarchyLevel: 5,
    description: 'Full UI permissions for assigned batches, student progress, and live attendance marking.',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
  },
  STAFF: {
    id: 'STAFF',
    title: 'Staff Member',
    shortTitle: 'Staff',
    hierarchyLevel: 6,
    description: 'Personal and collaborative tasks execution, follow-ups, and daily work reports.',
    badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
  },
  INTERN: {
    id: 'INTERN',
    title: 'Intern',
    shortTitle: 'Intern',
    hierarchyLevel: 7,
    description: 'Mentored tasks, daily work logs, weekly progress, and mentor feedback.',
    badgeClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30',
  },
};

export const INITIAL_PERMISSION_MATRIX: PermissionMatrixRow[] = [
  {
    module: 'Organization & Employees',
    rolePermissions: {
      CHAIRPERSON: { view: true, create: true, edit: true, delete: true, approve: true, export: true, scope: 'Company' },
      DIRECTOR: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Division' },
      OPERATION_HEAD: { view: true, create: true, edit: true, delete: false, approve: false, export: true, scope: 'Company' },
      TEAM_LEAD: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Team' },
      FACULTY: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      STAFF: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Department' },
      INTERN: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
    },
  },
  {
    module: 'Task Management & Transfers',
    rolePermissions: {
      CHAIRPERSON: { view: true, create: true, edit: true, delete: true, approve: true, export: true, scope: 'Company' },
      DIRECTOR: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Division' },
      OPERATION_HEAD: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Company' },
      TEAM_LEAD: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Team' },
      FACULTY: { view: true, create: true, edit: true, delete: false, approve: false, export: false, scope: 'Personal' },
      STAFF: { view: true, create: true, edit: true, delete: false, approve: false, export: false, scope: 'Personal' },
      INTERN: { view: true, create: false, edit: true, delete: false, approve: false, export: false, scope: 'Personal' },
    },
  },
  {
    module: 'Courses, Batches & Students',
    rolePermissions: {
      CHAIRPERSON: { view: true, create: true, edit: true, delete: true, approve: true, export: true, scope: 'Company' },
      DIRECTOR: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Division' },
      OPERATION_HEAD: { view: true, create: false, edit: false, delete: false, approve: false, export: true, scope: 'Company' },
      TEAM_LEAD: { view: true, create: true, edit: true, delete: false, approve: false, export: true, scope: 'Department' },
      FACULTY: { view: true, create: true, edit: true, delete: false, approve: true, export: true, scope: 'Assigned Batches' },
      STAFF: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Department' },
      INTERN: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
    },
  },
  {
    module: 'Company Asset Inventory',
    rolePermissions: {
      CHAIRPERSON: { view: true, create: true, edit: true, delete: true, approve: true, export: true, scope: 'Company' },
      DIRECTOR: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      OPERATION_HEAD: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      TEAM_LEAD: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      FACULTY: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      STAFF: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
      INTERN: { view: true, create: false, edit: false, delete: false, approve: false, export: false, scope: 'Personal' },
    },
  },
  {
    module: 'Accounts, Finance, GST & TDS',
    rolePermissions: {
      CHAIRPERSON: { view: true, create: true, edit: true, delete: true, approve: true, export: true, scope: 'Company' },
      DIRECTOR: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
      OPERATION_HEAD: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
      TEAM_LEAD: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
      FACULTY: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
      STAFF: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
      INTERN: { view: false, create: false, edit: false, delete: false, approve: false, export: false, scope: 'None' },
    },
  },
];
