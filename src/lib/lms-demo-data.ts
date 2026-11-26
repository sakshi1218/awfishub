import { slugifyCourse } from '@/lib/course-catalogue';

export type LearningStatus = 'Active' | 'Upcoming' | 'Completed' | 'At risk';

export interface LearningBatch {
  id: string;
  name: string;
  course: string;
  courseSlug: string;
  provider: string;
  startDate: string;
  endDate: string;
  facultyId: string;
  delivery: string;
  status: LearningStatus;
  capacity: number;
}

export interface LearningStudent {
  id: string;
  name: string;
  email: string;
  batchId: string;
  progress: number;
  attendance: number;
  status: LearningStatus;
}

export interface LearningFaculty {
  id: string;
  name: string;
  email: string;
  designation: string;
  expertise: string;
  assignedBatches: number;
  status: 'Available' | 'Assigned';
}

export interface LearningAssessment {
  id: string;
  title: string;
  course: string;
  batchId: string;
  dueDate: string;
  submissions: number;
  status: 'Draft' | 'Scheduled' | 'Reviewing' | 'Completed';
}

export const demoBatches: LearningBatch[] = [
  {
    id: 'LMS-101',
    name: 'AI Engineering · Winter 2026',
    course: 'AI Engineering, LLM, RAG & Production AI',
    courseSlug: slugifyCourse('AI Engineering, LLM, RAG & Production AI'),
    provider: 'MindLyftAI',
    startDate: '2026-10-12',
    endDate: '2027-01-30',
    facultyId: 'FAC-01',
    delivery: 'Hybrid',
    status: 'Active',
    capacity: 30,
  },
  {
    id: 'LMS-102',
    name: 'Data Analytics · Winter 2026',
    course: 'AI-Powered Data Analytics',
    courseSlug: slugifyCourse('AI-Powered Data Analytics'),
    provider: 'MindLyftAI',
    startDate: '2026-11-30',
    endDate: '2027-02-20',
    facultyId: 'FAC-02',
    delivery: 'Online',
    status: 'Upcoming',
    capacity: 25,
  },
  {
    id: 'LMS-103',
    name: 'Capsule ML · Autumn 2026',
    course: 'Machine Learning with AI',
    courseSlug: slugifyCourse('Machine Learning with AI'),
    provider: 'Capsule',
    startDate: '2026-08-03',
    endDate: '2026-11-28',
    facultyId: 'FAC-03',
    delivery: 'On campus',
    status: 'Completed',
    capacity: 24,
  },
];

export const demoFaculty: LearningFaculty[] = [
  {
    id: 'FAC-01',
    name: 'Dr. Kavita Rao',
    email: 'kavita.rao@example.demo',
    designation: 'Lead Faculty',
    expertise: 'AI Engineering',
    assignedBatches: 1,
    status: 'Assigned',
  },
  {
    id: 'FAC-02',
    name: 'Arjun Desai',
    email: 'arjun.desai@example.demo',
    designation: 'Faculty',
    expertise: 'Data Analytics',
    assignedBatches: 1,
    status: 'Assigned',
  },
  {
    id: 'FAC-03',
    name: 'Meera Nair',
    email: 'meera.nair@example.demo',
    designation: 'Senior Faculty',
    expertise: 'Machine Learning',
    assignedBatches: 1,
    status: 'Assigned',
  },
  {
    id: 'FAC-04',
    name: 'Rahul Kulkarni',
    email: 'rahul.kulkarni@example.demo',
    designation: 'Faculty',
    expertise: 'Cloud Computing',
    assignedBatches: 0,
    status: 'Available',
  },
];

export const demoStudents: LearningStudent[] = [
  { id: 'STU-2401', name: 'Aarav Mehta', email: 'aarav.mehta@example.demo', batchId: 'LMS-101', progress: 72, attendance: 94, status: 'Active' },
  { id: 'STU-2402', name: 'Isha Kulkarni', email: 'isha.kulkarni@example.demo', batchId: 'LMS-101', progress: 58, attendance: 88, status: 'Active' },
  { id: 'STU-2403', name: 'Kabir Shah', email: 'kabir.shah@example.demo', batchId: 'LMS-101', progress: 41, attendance: 70, status: 'At risk' },
  { id: 'STU-2404', name: 'Ananya Rao', email: 'ananya.rao@example.demo', batchId: 'LMS-101', progress: 84, attendance: 97, status: 'Active' },
  { id: 'STU-2405', name: 'Vivaan Joshi', email: 'vivaan.joshi@example.demo', batchId: 'LMS-102', progress: 0, attendance: 0, status: 'Upcoming' },
  { id: 'STU-2406', name: 'Sara Fernandes', email: 'sara.fernandes@example.demo', batchId: 'LMS-102', progress: 0, attendance: 0, status: 'Upcoming' },
  { id: 'STU-2407', name: 'Reyansh Patil', email: 'reyansh.patil@example.demo', batchId: 'LMS-103', progress: 100, attendance: 92, status: 'Completed' },
  { id: 'STU-2408', name: 'Diya Menon', email: 'diya.menon@example.demo', batchId: 'LMS-103', progress: 100, attendance: 96, status: 'Completed' },
];

export const demoAssessments: LearningAssessment[] = [
  {
    id: 'ASM-301',
    title: 'RAG Application Review',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    dueDate: '2026-12-02',
    submissions: 18,
    status: 'Reviewing',
  },
  {
    id: 'ASM-302',
    title: 'Analytics Case Study',
    course: 'AI-Powered Data Analytics',
    batchId: 'LMS-102',
    dueDate: '2026-12-18',
    submissions: 0,
    status: 'Scheduled',
  },
  {
    id: 'ASM-303',
    title: 'Final Project',
    course: 'Machine Learning with AI',
    batchId: 'LMS-103',
    dueDate: '2026-11-20',
    submissions: 21,
    status: 'Completed',
  },
];

export const demoEnrollmentTrend = [
  { month: 'Jun', students: 18 },
  { month: 'Jul', students: 26 },
  { month: 'Aug', students: 22 },
  { month: 'Sep', students: 34 },
  { month: 'Oct', students: 29 },
  { month: 'Nov', students: 41 },
];

export const demoLearningOutcomes = [
  { label: 'On track', value: 68 },
  { label: 'Needs attention', value: 22 },
  { label: 'Completed', value: 10 },
];
