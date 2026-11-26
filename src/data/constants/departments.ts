import { DepartmentType } from '@/types';

export interface DepartmentMeta {
  id: string;
  name: DepartmentType;
  code: string;
  leadId: string;
  leadName: string;
  directorId: string;
  directorName: string;
  description: string;
  color: string;
  accent: string;
  kpiRate: number;
  monthlyBudget: number;
}

export const PERMANENT_DEPARTMENTS: DepartmentMeta[] = [
  {
    id: 'DEPT-MEDIA',
    name: 'Media',
    code: 'MEDIA',
    leadId: 'AWF-EMP-006',
    leadName: 'Rohan Kulkarni',
    directorId: 'AWF-EMP-004',
    directorName: 'Shubham Jadhav',
    description: 'Podcast production, social media reels, student spotlights, and studio operations.',
    color: 'from-rose-500 to-pink-600',
    accent: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    kpiRate: 91,
    monthlyBudget: 185000,
  },
  {
    id: 'DEPT-TRAINER',
    name: 'Trainer',
    code: 'TRAIN',
    leadId: 'AWF-EMP-010',
    leadName: 'Amit Verma',
    directorId: 'AWF-EMP-003',
    directorName: 'Rutuja Botre',
    description: 'Technical bootcamps, Capsule/CDAC/MindlyftAI cohorts, and faculty instruction.',
    color: 'from-purple-500 to-indigo-600',
    accent: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    kpiRate: 95,
    monthlyBudget: 320000,
  },
  {
    id: 'DEPT-COUNSELOR',
    name: 'Counselor',
    code: 'COUNS',
    leadId: 'AWF-EMP-012',
    leadName: 'Neha Gupta',
    directorId: 'AWF-EMP-002',
    directorName: 'Anchal Agawane',
    description: 'Career mentorship, student pathway counseling, and enrollment conversion guidance.',
    color: 'from-emerald-500 to-teal-600',
    accent: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    kpiRate: 89,
    monthlyBudget: 140000,
  },
  {
    id: 'DEPT-TELECALLER',
    name: 'TeleCaller',
    code: 'TELE',
    leadId: 'AWF-EMP-007',
    leadName: 'Priya Sharma',
    directorId: 'AWF-EMP-002',
    directorName: 'Anchal Agawane',
    description: 'Outbound student outreach, lead qualification, and follow-up scheduling.',
    color: 'from-amber-500 to-orange-600',
    accent: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    kpiRate: 88,
    monthlyBudget: 120000,
  },
  {
    id: 'DEPT-TECH',
    name: 'Technical Team',
    code: 'TECH',
    leadId: 'AWF-EMP-008',
    leadName: 'Tanvi Patil',
    directorId: 'AWF-EMP-003',
    directorName: 'Rutuja Botre',
    description: 'LMS engineering, assessment runners, internal platforms, and bug resolution.',
    color: 'from-blue-500 to-cyan-600',
    accent: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    kpiRate: 96,
    monthlyBudget: 410000,
  },
  {
    id: 'DEPT-SALES',
    name: 'Sales Department',
    code: 'SALES',
    leadId: 'AWF-EMP-009',
    leadName: 'Ritesh Deshmukh',
    directorId: 'AWF-EMP-002',
    directorName: 'Anchal Agawane',
    description: 'Institutional college visits, FDP pitches, MoUs, and Open Market corporate sales.',
    color: 'from-indigo-500 to-blue-600',
    accent: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    kpiRate: 92,
    monthlyBudget: 260000,
  },
  {
    id: 'DEPT-INTERNS',
    name: 'Interns',
    code: 'INTERN',
    leadId: 'AWF-EMP-008',
    leadName: 'Tanvi Patil',
    directorId: 'AWF-EMP-004',
    directorName: 'Shubham Jadhav',
    description: 'Apprenticeship cohorts, mentored sprint deliverables, and talent pipeline.',
    color: 'from-teal-500 to-emerald-600',
    accent: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    kpiRate: 87,
    monthlyBudget: 95000,
  },
  {
    id: 'DEPT-OPS',
    name: 'Operation Team',
    code: 'OPS',
    leadId: 'AWF-EMP-016',
    leadName: 'Kavita Nair',
    directorId: 'AWF-EMP-004',
    directorName: 'Shubham Jadhav',
    description: 'Event & Expo logistics, vendor coordination, hardware dispatch, and daily operations.',
    color: 'from-slate-600 to-slate-800',
    accent: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    kpiRate: 93,
    monthlyBudget: 210000,
  },
];
