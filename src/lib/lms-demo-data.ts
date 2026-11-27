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
  assessmentCompletion?: number;
}

export interface LearningStudent {
  id: string;
  name: string;
  email: string;
  batchId: string;
  progress: number;
  attendance: number;
  status: LearningStatus;
  assessmentScore?: number;
  evaluationPending?: boolean;
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

export interface LearningTrainerWorkItem {
  id: string;
  facultyId: string;
  title: string;
  category: 'Session preparation' | 'Assessment review' | 'Learner support';
  batchId: string;
  dueDate: string;
  sessionDate?: string;
  sessionTime?: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'Not started' | 'In progress' | 'Completed';
}

export type LearningTrainerSessionStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled';

export interface LearningTrainerSession {
  id: string;
  facultyId: string;
  title: string;
  type: string;
  course: string;
  batchId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location: string;
  mode: 'Online' | 'On campus' | 'Hybrid';
  status: LearningTrainerSessionStatus;
  attendanceSubmitted: boolean;
  reportSubmitted: boolean;
  durationHours: number;
  rescheduledTo?: string;
}

export const DEMO_TODAY = '2026-11-26';

export type PlacementRoundStatus = 'Cleared' | 'Not cleared' | 'In progress' | 'Scheduled';

export interface LearningPlacementRound {
  name: string;
  date: string;
  status: PlacementRoundStatus;
  note: string;
}

export interface LearningPlacementApplication {
  id: string;
  studentId: string;
  batchId: string;
  company: string;
  role: string;
  source: 'Campus placement drive' | 'Direct application';
  appliedOn: string;
  status: 'Applied' | 'In progress' | 'Offer received' | 'Not selected';
  rounds: LearningPlacementRound[];
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
    assessmentCompletion: 68,
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
    assessmentCompletion: 0,
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
    assessmentCompletion: 100,
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

export const demoTrainerWorkItems: LearningTrainerWorkItem[] = [
  {
    id: 'TRW-101',
    facultyId: 'FAC-01',
    title: 'Prepare Prompt Engineering Lab',
    category: 'Session preparation',
    batchId: 'LMS-101',
    dueDate: '2026-11-26',
    sessionDate: '2026-11-26',
    sessionTime: '10:00 AM',
    priority: 'High',
    status: 'Scheduled',
  },
  {
    id: 'TRW-102',
    facultyId: 'FAC-01',
    title: 'Review RAG application submissions',
    category: 'Assessment review',
    batchId: 'LMS-101',
    dueDate: '2026-12-02',
    priority: 'High',
    status: 'In progress',
  },
  {
    id: 'TRW-103',
    facultyId: 'FAC-01',
    title: 'Follow up with at-risk learners',
    category: 'Learner support',
    batchId: 'LMS-101',
    dueDate: '2026-11-27',
    priority: 'High',
    status: 'In progress',
  },
  {
    id: 'TRW-104',
    facultyId: 'FAC-02',
    title: 'Prepare Data Analytics batch material',
    category: 'Session preparation',
    batchId: 'LMS-102',
    dueDate: '2026-11-29',
    sessionDate: '2026-11-30',
    sessionTime: '10:00 AM',
    priority: 'Medium',
    status: 'In progress',
  },
  {
    id: 'TRW-105',
    facultyId: 'FAC-02',
    title: 'Set up Analytics Case Study review',
    category: 'Assessment review',
    batchId: 'LMS-102',
    dueDate: '2026-12-18',
    priority: 'Medium',
    status: 'Scheduled',
  },
  {
    id: 'TRW-106',
    facultyId: 'FAC-03',
    title: 'Provide final project feedback',
    category: 'Assessment review',
    batchId: 'LMS-103',
    dueDate: '2026-11-28',
    priority: 'Low',
    status: 'In progress',
  },
  {
    id: 'TRW-107',
    facultyId: 'FAC-03',
    title: 'Submit final batch outcome report',
    category: 'Session preparation',
    batchId: 'LMS-103',
    dueDate: '2026-11-24',
    priority: 'Medium',
    status: 'Completed',
  },
  {
    id: 'TRW-108',
    facultyId: 'FAC-01',
    title: 'Submit learner progress notes',
    category: 'Learner support',
    batchId: 'LMS-101',
    dueDate: '2026-11-25',
    priority: 'Medium',
    status: 'In progress',
  },
];

export const demoTrainerSessions: LearningTrainerSession[] = [
  {
    id: 'SES-101',
    facultyId: 'FAC-01',
    title: 'Prompt Engineering Lab',
    type: 'Live session',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    sessionDate: DEMO_TODAY,
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'Completed',
    attendanceSubmitted: true,
    reportSubmitted: true,
    durationHours: 1.5,
  },
  {
    id: 'SES-102',
    facultyId: 'FAC-01',
    title: 'Project Clinic & Q&A',
    type: 'Office hours',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    sessionDate: DEMO_TODAY,
    startTime: '02:30 PM',
    endTime: '03:30 PM',
    location: 'Training Room 2',
    mode: 'On campus',
    status: 'Scheduled',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1,
  },
  {
    id: 'SES-103',
    facultyId: 'FAC-03',
    title: 'Final Project Mentoring',
    type: 'Mentoring',
    course: 'Machine Learning with AI',
    batchId: 'LMS-103',
    sessionDate: DEMO_TODAY,
    startTime: '11:00 AM',
    endTime: '12:30 PM',
    location: 'Training Room 1',
    mode: 'On campus',
    status: 'Completed',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1.5,
  },
  {
    id: 'SES-108',
    facultyId: 'FAC-01',
    title: 'RAG Application Support Clinic',
    type: 'Office hours',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    sessionDate: DEMO_TODAY,
    startTime: '12:00 PM',
    endTime: '01:00 PM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'In Progress',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1,
  },
  {
    id: 'SES-104',
    facultyId: 'FAC-01',
    title: 'RAG Architecture Workshop',
    type: 'Workshop',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    sessionDate: DEMO_TODAY,
    startTime: '04:00 PM',
    endTime: '05:00 PM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'Cancelled',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1,
  },
  {
    id: 'SES-105',
    facultyId: 'FAC-02',
    title: 'Data Analytics Batch Kickoff',
    type: 'Live session',
    course: 'AI-Powered Data Analytics',
    batchId: 'LMS-102',
    sessionDate: DEMO_TODAY,
    startTime: '03:00 PM',
    endTime: '04:00 PM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'Rescheduled',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1,
    rescheduledTo: '2026-11-30',
  },
  {
    id: 'SES-106',
    facultyId: 'FAC-02',
    title: 'Data Analytics Batch Kickoff',
    type: 'Live session',
    course: 'AI-Powered Data Analytics',
    batchId: 'LMS-102',
    sessionDate: '2026-11-30',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'Scheduled',
    attendanceSubmitted: false,
    reportSubmitted: false,
    durationHours: 1,
  },
  {
    id: 'SES-107',
    facultyId: 'FAC-01',
    title: 'RAG Application Review',
    type: 'Evaluation',
    course: 'AI Engineering, LLM, RAG & Production AI',
    batchId: 'LMS-101',
    sessionDate: '2026-11-24',
    startTime: '01:00 PM',
    endTime: '02:00 PM',
    location: 'Google Meet',
    mode: 'Online',
    status: 'Completed',
    attendanceSubmitted: true,
    reportSubmitted: false,
    durationHours: 1,
  },
];

export const demoAttendanceTrend = [
  { week: 'Oct 20', attendance: 82 },
  { week: 'Oct 27', attendance: 86 },
  { week: 'Nov 03', attendance: 84 },
  { week: 'Nov 10', attendance: 89 },
  { week: 'Nov 17', attendance: 87 },
  { week: 'Nov 24', attendance: 91 },
];

export const demoAssessmentEvaluationProgress = [
  { trainer: 'Dr. Kavita Rao', assigned: 24, evaluated: 18 },
  { trainer: 'Arjun Desai', assigned: 16, evaluated: 9 },
  { trainer: 'Meera Nair', assigned: 20, evaluated: 20 },
];

export const demoStudents: LearningStudent[] = [
  { id: 'STU-2401', name: 'Aarav Mehta', email: 'aarav.mehta@example.demo', batchId: 'LMS-101', progress: 72, attendance: 94, status: 'Active', assessmentScore: 82 },
  { id: 'STU-2402', name: 'Isha Kulkarni', email: 'isha.kulkarni@example.demo', batchId: 'LMS-101', progress: 58, attendance: 88, status: 'Active', assessmentScore: 56 },
  { id: 'STU-2403', name: 'Kabir Shah', email: 'kabir.shah@example.demo', batchId: 'LMS-101', progress: 41, attendance: 70, status: 'At risk', assessmentScore: 48, evaluationPending: true },
  { id: 'STU-2404', name: 'Ananya Rao', email: 'ananya.rao@example.demo', batchId: 'LMS-101', progress: 84, attendance: 97, status: 'Active', assessmentScore: 91 },
  { id: 'STU-2405', name: 'Vivaan Joshi', email: 'vivaan.joshi@example.demo', batchId: 'LMS-102', progress: 0, attendance: 0, status: 'Upcoming', assessmentScore: undefined },
  { id: 'STU-2406', name: 'Sara Fernandes', email: 'sara.fernandes@example.demo', batchId: 'LMS-102', progress: 0, attendance: 0, status: 'Upcoming', assessmentScore: undefined },
  { id: 'STU-2407', name: 'Reyansh Patil', email: 'reyansh.patil@example.demo', batchId: 'LMS-103', progress: 100, attendance: 92, status: 'Completed', assessmentScore: 88 },
  { id: 'STU-2408', name: 'Diya Menon', email: 'diya.menon@example.demo', batchId: 'LMS-103', progress: 100, attendance: 96, status: 'Completed', assessmentScore: 94 },
];

export const demoPlacementApplications: LearningPlacementApplication[] = [
  {
    id: 'PLC-101',
    studentId: 'STU-2401',
    batchId: 'LMS-101',
    company: 'CloudNova',
    role: 'AI Engineer Intern',
    source: 'Campus placement drive',
    appliedOn: '2026-10-19',
    status: 'In progress',
    rounds: [
      { name: 'Resume screening', date: '2026-10-20', status: 'Cleared', note: 'Profile shortlisted' },
      { name: 'Aptitude assessment', date: '2026-10-22', status: 'Cleared', note: 'Assessment passed' },
      { name: 'Technical interview', date: '2026-10-25', status: 'Cleared', note: 'Moved to final round' },
      { name: 'HR interview', date: '2026-11-29', status: 'Scheduled', note: 'Next scheduled round' },
    ],
  },
  {
    id: 'PLC-102',
    studentId: 'STU-2402',
    batchId: 'LMS-101',
    company: 'TechAxis Solutions',
    role: 'Data Analyst',
    source: 'Direct application',
    appliedOn: '2026-10-18',
    status: 'Not selected',
    rounds: [
      { name: 'Resume screening', date: '2026-10-19', status: 'Cleared', note: 'Profile shortlisted' },
      { name: 'Technical interview', date: '2026-10-24', status: 'Not cleared', note: 'Process ended at this round' },
    ],
  },
  {
    id: 'PLC-103',
    studentId: 'STU-2403',
    batchId: 'LMS-101',
    company: 'BrightPath Analytics',
    role: 'Junior Data Scientist',
    source: 'Campus placement drive',
    appliedOn: '2026-11-02',
    status: 'In progress',
    rounds: [
      { name: 'Resume screening', date: '2026-11-03', status: 'Cleared', note: 'Profile shortlisted' },
      { name: 'Technical interview', date: '2026-11-28', status: 'Scheduled', note: 'Interview scheduled' },
    ],
  },
  {
    id: 'PLC-104',
    studentId: 'STU-2407',
    batchId: 'LMS-103',
    company: 'NexaWorks',
    role: 'Machine Learning Associate',
    source: 'Campus placement drive',
    appliedOn: '2026-09-12',
    status: 'Offer received',
    rounds: [
      { name: 'Resume screening', date: '2026-09-14', status: 'Cleared', note: 'Profile shortlisted' },
      { name: 'Case study', date: '2026-09-20', status: 'Cleared', note: 'Case study passed' },
      { name: 'Final interview', date: '2026-09-25', status: 'Cleared', note: 'Offer approved' },
    ],
  },
  {
    id: 'PLC-105',
    studentId: 'STU-2408',
    batchId: 'LMS-103',
    company: 'Vertex Digital',
    role: 'Machine Learning Trainee',
    source: 'Direct application',
    appliedOn: '2026-09-16',
    status: 'Not selected',
    rounds: [
      { name: 'Resume screening', date: '2026-09-17', status: 'Cleared', note: 'Profile shortlisted' },
      { name: 'Technical interview', date: '2026-09-23', status: 'Not cleared', note: 'Process ended at this round' },
    ],
  },
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
