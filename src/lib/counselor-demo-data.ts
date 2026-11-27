import { allCourses } from '@/lib/course-catalogue';

export const COUNSELOR_DEMO_TODAY = '2026-11-26';

export const counselorProgrammes = Array.from(
  new Set(allCourses.map((course) => course.programme))
);

export interface CounselorProfile {
  id: string;
  name: string;
  title: string;
  active: boolean;
}

export type CounselorEnquiryStage =
  | 'New Enquiry'
  | 'Contacted'
  | 'Interested'
  | 'Counselling Scheduled'
  | 'Counselling Completed'
  | 'Admission in Progress'
  | 'Admitted'
  | 'Not Interested / Lost';

export type EnquiryPriority = 'Low' | 'Medium' | 'High';

export interface EnquiryHistoryEvent {
  date: string;
  title: string;
  detail: string;
}

export interface CounselorEnquiry {
  id: string;
  studentName: string;
  emailMasked: string;
  phoneMasked: string;
  programme: string;
  source: string;
  counselorId: string;
  enquiryDate: string;
  stage: CounselorEnquiryStage;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  priority: EnquiryPriority;
  history: EnquiryHistoryEvent[];
}

export type CounsellingSessionStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled';

export type CounsellingOutcome =
  | 'Interested'
  | 'Needs Follow-up'
  | 'Admission Likely'
  | 'Not Interested'
  | 'Further Guidance Required'
  | 'Awaiting Decision';

export interface CounselorSession {
  id: string;
  enquiryId: string;
  counselorId: string;
  programme: string;
  sessionDate: string;
  sessionTime: string;
  mode: 'Online' | 'Offline';
  status: CounsellingSessionStatus;
  outcome?: CounsellingOutcome;
  outcomeReported: boolean;
  rescheduledTo?: string;
}

export interface CounselorAdmission {
  id: string;
  enquiryId: string;
  counselorId: string;
  programme: string;
  status: 'In Progress' | 'Decision Pending' | 'Admitted';
  createdAt: string;
  lastUpdatedAt: string;
}

export interface CounselorTaskTransfer {
  id: string;
  taskId: string;
  enquiryId?: string;
  title: string;
  category: string;
  originalCounselorId: string;
  newCounselorId: string;
  transferredBy: string;
  transferDate: string;
  reason: string;
  priority: EnquiryPriority;
  dueDate: string;
  status: 'Pending Acceptance' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled';
}

export interface CounselorCompletionReport {
  id: string;
  taskId: string;
  taskTitle: string;
  counselorId: string;
  category: string;
  priority: EnquiryPriority;
  dueDate: string;
  completedAt: string;
  enquiryId: string;
  sessionId?: string;
  workSummary: string;
  completionNotes: string;
  outcome: string;
  issuesAndBlockers: string;
  qualityAssessment: string;
  recommendations: string;
  overallAnalysis: string;
  founderReviewStatus: 'Awaiting Review' | 'Reviewed';
  requiresFurtherAction: boolean;
}

export const demoCounselors: CounselorProfile[] = [
  { id: 'CNS-01', name: 'Aanya Sharma', title: 'Senior Counselor', active: true },
  { id: 'CNS-02', name: 'Karan Mehta', title: 'Admissions Counselor', active: true },
  { id: 'CNS-03', name: 'Riya Iyer', title: 'Programme Counselor', active: true },
];

export const demoCounselorEnquiries: CounselorEnquiry[] = [
  {
    id: 'ENQ-2401',
    studentName: 'Demo Student 01',
    emailMasked: 's***01@example.demo',
    phoneMasked: '+91 •••••• 2401',
    programme: 'AI, GenAI & Agentic AI',
    source: 'Website',
    counselorId: 'CNS-01',
    enquiryDate: '2026-11-26',
    stage: 'New Enquiry',
    nextFollowUpDate: '2026-11-26',
    priority: 'High',
    history: [
      { date: '2026-11-26', title: 'Enquiry received', detail: 'Website enquiry received; first contact is still pending.' },
    ],
  },
  {
    id: 'ENQ-2402',
    studentName: 'Demo Student 02',
    emailMasked: 's***02@example.demo',
    phoneMasked: '+91 •••••• 2402',
    programme: 'Data Analytics',
    source: 'Referral',
    counselorId: 'CNS-01',
    enquiryDate: '2026-11-24',
    stage: 'Contacted',
    lastContactDate: '2026-11-24',
    nextFollowUpDate: '2026-11-27',
    priority: 'Medium',
    history: [
      { date: '2026-11-24', title: 'Enquiry received', detail: 'Referred enquiry created.' },
      { date: '2026-11-24', title: 'Initial contact', detail: 'Programme outline shared; follow-up requested.' },
    ],
  },
  {
    id: 'ENQ-2403',
    studentName: 'Demo Student 03',
    emailMasked: 's***03@example.demo',
    phoneMasked: '+91 •••••• 2403',
    programme: 'Cybersecurity',
    source: 'Webinar',
    counselorId: 'CNS-01',
    enquiryDate: '2026-11-07',
    stage: 'Interested',
    lastContactDate: '2026-11-10',
    nextFollowUpDate: '2026-11-20',
    priority: 'High',
    history: [
      { date: '2026-11-07', title: 'Enquiry received', detail: 'Enquiry submitted after a programme webinar.' },
      { date: '2026-11-10', title: 'Programme discussion', detail: 'Requested detailed course and schedule information.' },
    ],
  },
  {
    id: 'ENQ-2404',
    studentName: 'Demo Student 04',
    emailMasked: 's***04@example.demo',
    phoneMasked: '+91 •••••• 2404',
    programme: 'Capsule Programmes',
    source: 'Campus event',
    counselorId: 'CNS-01',
    enquiryDate: '2026-11-20',
    stage: 'Counselling Scheduled',
    lastContactDate: '2026-11-25',
    nextFollowUpDate: '2026-11-27',
    priority: 'High',
    history: [
      { date: '2026-11-20', title: 'Enquiry received', detail: 'Campus event enquiry created.' },
      { date: '2026-11-25', title: 'Counselling booked', detail: 'Online counselling session scheduled.' },
    ],
  },
  {
    id: 'ENQ-2405',
    studentName: 'Demo Student 05',
    emailMasked: 's***05@example.demo',
    phoneMasked: '+91 •••••• 2405',
    programme: 'Data Analytics',
    source: 'Website',
    counselorId: 'CNS-02',
    enquiryDate: '2026-11-15',
    stage: 'Counselling Completed',
    lastContactDate: '2026-11-22',
    nextFollowUpDate: '2026-11-28',
    priority: 'Medium',
    history: [
      { date: '2026-11-15', title: 'Enquiry received', detail: 'Website enquiry created.' },
      { date: '2026-11-18', title: 'Counselling completed', detail: 'Programme fit discussed; decision follow-up agreed.' },
    ],
  },
  {
    id: 'ENQ-2406',
    studentName: 'Demo Student 06',
    emailMasked: 's***06@example.demo',
    phoneMasked: '+91 •••••• 2406',
    programme: 'AI, GenAI & Agentic AI',
    source: 'Referral',
    counselorId: 'CNS-02',
    enquiryDate: '2026-11-12',
    stage: 'Admission in Progress',
    lastContactDate: '2026-11-24',
    nextFollowUpDate: '2026-11-27',
    priority: 'High',
    history: [
      { date: '2026-11-12', title: 'Enquiry received', detail: 'Referral enquiry created.' },
      { date: '2026-11-22', title: 'Admission started', detail: 'Admission checklist shared with the prospective student.' },
    ],
  },
  {
    id: 'ENQ-2407',
    studentName: 'Demo Student 07',
    emailMasked: 's***07@example.demo',
    phoneMasked: '+91 •••••• 2407',
    programme: 'Data Analytics',
    source: 'Campus event',
    counselorId: 'CNS-03',
    enquiryDate: '2026-11-10',
    stage: 'Admitted',
    lastContactDate: '2026-11-20',
    priority: 'High',
    history: [
      { date: '2026-11-10', title: 'Enquiry received', detail: 'Campus event enquiry created.' },
      { date: '2026-11-12', title: 'Counselling completed', detail: 'Programme and learning schedule reviewed.' },
      { date: '2026-11-15', title: 'Admission confirmed', detail: 'Demo admission marked as confirmed.' },
    ],
  },
  {
    id: 'ENQ-2408',
    studentName: 'Demo Student 08',
    emailMasked: 's***08@example.demo',
    phoneMasked: '+91 •••••• 2408',
    programme: 'Cloud Computing & DevOps',
    source: 'Social media',
    counselorId: 'CNS-03',
    enquiryDate: '2026-11-09',
    stage: 'Not Interested / Lost',
    lastContactDate: '2026-11-15',
    priority: 'Low',
    history: [
      { date: '2026-11-09', title: 'Enquiry received', detail: 'Social media enquiry created.' },
      { date: '2026-11-15', title: 'Enquiry closed', detail: 'Prospect decided not to continue at this time.' },
    ],
  },
  {
    id: 'ENQ-2409',
    studentName: 'Demo Student 09',
    emailMasked: 's***09@example.demo',
    phoneMasked: '+91 •••••• 2409',
    programme: 'AI, GenAI & Agentic AI',
    source: 'Website',
    counselorId: 'CNS-03',
    enquiryDate: '2026-11-01',
    stage: 'Counselling Completed',
    lastContactDate: '2026-11-10',
    nextFollowUpDate: '2026-11-20',
    priority: 'Medium',
    history: [
      { date: '2026-11-01', title: 'Enquiry received', detail: 'Website enquiry created.' },
      { date: '2026-11-05', title: 'Counselling completed', detail: 'Programme fit discussed; decision remains pending.' },
    ],
  },
  {
    id: 'ENQ-2410',
    studentName: 'Demo Student 10',
    emailMasked: 's***10@example.demo',
    phoneMasked: '+91 •••••• 2410',
    programme: 'Data Analytics',
    source: 'Referral',
    counselorId: 'CNS-02',
    enquiryDate: '2026-10-30',
    stage: 'Admitted',
    lastContactDate: '2026-11-24',
    priority: 'High',
    history: [
      { date: '2026-10-30', title: 'Enquiry received', detail: 'Referral enquiry created.' },
      { date: '2026-11-21', title: 'Admission confirmed', detail: 'Demo admission marked as confirmed.' },
    ],
  },
  {
    id: 'ENQ-2411',
    studentName: 'Demo Student 11',
    emailMasked: 's***11@example.demo',
    phoneMasked: '+91 •••••• 2411',
    programme: 'Cybersecurity',
    source: 'Partner referral',
    counselorId: 'CNS-02',
    enquiryDate: '2026-11-02',
    stage: 'Contacted',
    lastContactDate: '2026-11-03',
    nextFollowUpDate: '2026-11-18',
    priority: 'Medium',
    history: [
      { date: '2026-11-02', title: 'Enquiry received', detail: 'Partner referral created.' },
      { date: '2026-11-03', title: 'Initial contact', detail: 'Programme information sent; response is pending.' },
    ],
  },
];

export const demoCounselorSessions: CounselorSession[] = [
  { id: 'CS-901', enquiryId: 'ENQ-2403', counselorId: 'CNS-01', programme: 'Cybersecurity', sessionDate: '2026-11-10', sessionTime: '10:00 AM', mode: 'Online', status: 'Completed', outcome: 'Needs Follow-up', outcomeReported: true },
  { id: 'CS-902', enquiryId: 'ENQ-2404', counselorId: 'CNS-01', programme: 'Capsule Programmes', sessionDate: '2026-11-28', sessionTime: '11:30 AM', mode: 'Online', status: 'Scheduled', outcome: 'Awaiting Decision', outcomeReported: false },
  { id: 'CS-903', enquiryId: 'ENQ-2405', counselorId: 'CNS-02', programme: 'Data Analytics', sessionDate: '2026-11-18', sessionTime: '02:00 PM', mode: 'Offline', status: 'Completed', outcome: 'Admission Likely', outcomeReported: true },
  { id: 'CS-904', enquiryId: 'ENQ-2406', counselorId: 'CNS-02', programme: 'AI, GenAI & Agentic AI', sessionDate: '2026-11-26', sessionTime: '11:00 AM', mode: 'Online', status: 'In Progress', outcome: 'Further Guidance Required', outcomeReported: false },
  { id: 'CS-905', enquiryId: 'ENQ-2407', counselorId: 'CNS-03', programme: 'Data Analytics', sessionDate: '2026-11-12', sessionTime: '04:00 PM', mode: 'Offline', status: 'Completed', outcome: 'Admission Likely', outcomeReported: true },
  { id: 'CS-906', enquiryId: 'ENQ-2408', counselorId: 'CNS-03', programme: 'Cloud Computing & DevOps', sessionDate: '2026-11-15', sessionTime: '12:00 PM', mode: 'Online', status: 'Cancelled', outcome: 'Not Interested', outcomeReported: false },
  { id: 'CS-907', enquiryId: 'ENQ-2409', counselorId: 'CNS-03', programme: 'AI, GenAI & Agentic AI', sessionDate: '2026-11-20', sessionTime: '03:00 PM', mode: 'Online', status: 'Rescheduled', outcome: 'Awaiting Decision', outcomeReported: false, rescheduledTo: '2026-11-29' },
  { id: 'CS-908', enquiryId: 'ENQ-2410', counselorId: 'CNS-02', programme: 'Data Analytics', sessionDate: '2026-11-20', sessionTime: '10:30 AM', mode: 'Offline', status: 'Completed', outcome: 'Interested', outcomeReported: false },
  { id: 'CS-909', enquiryId: 'ENQ-2411', counselorId: 'CNS-02', programme: 'Cybersecurity', sessionDate: '2026-11-29', sessionTime: '01:00 PM', mode: 'Online', status: 'Scheduled', outcome: 'Awaiting Decision', outcomeReported: false },
  { id: 'CS-910', enquiryId: 'ENQ-2402', counselorId: 'CNS-01', programme: 'Data Analytics', sessionDate: '2026-11-25', sessionTime: '09:30 AM', mode: 'Online', status: 'Completed', outcome: 'Further Guidance Required', outcomeReported: true },
];

export const demoCounselorAdmissions: CounselorAdmission[] = [
  { id: 'ADM-701', enquiryId: 'ENQ-2406', counselorId: 'CNS-02', programme: 'AI, GenAI & Agentic AI', status: 'In Progress', createdAt: '2026-11-22', lastUpdatedAt: '2026-11-24' },
  { id: 'ADM-702', enquiryId: 'ENQ-2407', counselorId: 'CNS-03', programme: 'Data Analytics', status: 'Admitted', createdAt: '2026-11-12', lastUpdatedAt: '2026-11-15' },
  { id: 'ADM-703', enquiryId: 'ENQ-2409', counselorId: 'CNS-03', programme: 'AI, GenAI & Agentic AI', status: 'Decision Pending', createdAt: '2026-11-05', lastUpdatedAt: '2026-11-10' },
  { id: 'ADM-704', enquiryId: 'ENQ-2410', counselorId: 'CNS-02', programme: 'Data Analytics', status: 'Admitted', createdAt: '2026-11-19', lastUpdatedAt: '2026-11-21' },
];

export const demoCounselorTaskTransfers: CounselorTaskTransfer[] = [
  {
    id: 'TRF-401',
    taskId: 'CT-601',
    enquiryId: 'ENQ-2403',
    title: 'High-priority programme follow-up',
    category: 'Student follow-up',
    originalCounselorId: 'CNS-01',
    newCounselorId: 'CNS-02',
    transferredBy: 'Aanya Sharma',
    transferDate: '2026-11-20',
    reason: 'Original assignee was unavailable during the follow-up window.',
    priority: 'High',
    dueDate: '2026-11-24',
    status: 'Accepted',
  },
  {
    id: 'TRF-402',
    taskId: 'CT-601',
    enquiryId: 'ENQ-2403',
    title: 'High-priority programme follow-up',
    category: 'Student follow-up',
    originalCounselorId: 'CNS-02',
    newCounselorId: 'CNS-03',
    transferredBy: 'Karan Mehta',
    transferDate: '2026-11-22',
    reason: 'Reassigned for programme-specialist guidance; acceptance is still pending.',
    priority: 'High',
    dueDate: '2026-11-25',
    status: 'Pending Acceptance',
  },
  {
    id: 'TRF-403',
    taskId: 'CT-602',
    enquiryId: 'ENQ-2406',
    title: 'Admission document assistance',
    category: 'Admission assistance',
    originalCounselorId: 'CNS-02',
    newCounselorId: 'CNS-03',
    transferredBy: 'Karan Mehta',
    transferDate: '2026-11-18',
    reason: 'Coverage handoff during the original counselor’s scheduled leave.',
    priority: 'Medium',
    dueDate: '2026-11-24',
    status: 'Completed',
  },
  {
    id: 'TRF-404',
    taskId: 'CT-603',
    enquiryId: 'ENQ-2401',
    title: 'Resolve admission checklist questions',
    category: 'Admission assistance',
    originalCounselorId: 'CNS-03',
    newCounselorId: 'CNS-01',
    transferredBy: 'Riya Iyer',
    transferDate: '2026-11-25',
    reason: 'Workload balancing for a time-sensitive student question.',
    priority: 'Medium',
    dueDate: '2026-11-28',
    status: 'Accepted',
  },
];

export const demoCounselorCompletionReports: CounselorCompletionReport[] = [
  {
    id: 'AIR-301',
    taskId: 'CT-501',
    taskTitle: 'High-priority student follow-up',
    counselorId: 'CNS-01',
    category: 'Student follow-up',
    priority: 'High',
    dueDate: '2026-11-08',
    completedAt: '2026-11-10',
    enquiryId: 'ENQ-2403',
    sessionId: 'CS-901',
    workSummary: 'Follow-up was completed after the learner requested additional programme details.',
    completionNotes: 'The counselor recorded a follow-up discussion and agreed to share the next-step information.',
    outcome: 'A further guidance discussion was requested.',
    issuesAndBlockers: 'The learner needed more time to compare programme options.',
    qualityAssessment: 'Simulated review: completion notes include a clear next step but do not include a verified response confirmation.',
    recommendations: 'Set a dated follow-up and record whether the requested material was received.',
    overallAnalysis: 'Simulated demo analysis based only on the completion notes shown here; it does not verify external work.',
    founderReviewStatus: 'Awaiting Review',
    requiresFurtherAction: true,
  },
  {
    id: 'AIR-302',
    taskId: 'CT-502',
    taskTitle: 'Complete counselling outcome record',
    counselorId: 'CNS-02',
    category: 'Counselling session completion',
    priority: 'Medium',
    dueDate: '2026-11-18',
    completedAt: '2026-11-18',
    enquiryId: 'ENQ-2405',
    sessionId: 'CS-903',
    workSummary: 'Counselling notes were entered for the Data Analytics discussion.',
    completionNotes: 'Programme fit and next steps were summarized in the demo completion record.',
    outcome: 'Admission is likely; a decision follow-up remains scheduled.',
    issuesAndBlockers: 'No blocker recorded in the supplied demo notes.',
    qualityAssessment: 'Simulated review: the outcome and a next step are present in the demo completion information.',
    recommendations: 'Confirm the planned follow-up and update the enquiry stage when a decision is recorded.',
    overallAnalysis: 'Simulated demo analysis based only on the completion notes shown here; it does not verify external work.',
    founderReviewStatus: 'Reviewed',
    requiresFurtherAction: false,
  },
  {
    id: 'AIR-303',
    taskId: 'CT-503',
    taskTitle: 'Support admission checklist completion',
    counselorId: 'CNS-03',
    category: 'Admission assistance',
    priority: 'High',
    dueDate: '2026-11-16',
    completedAt: '2026-11-15',
    enquiryId: 'ENQ-2407',
    sessionId: 'CS-905',
    workSummary: 'Admission checklist support was recorded for the prospective student.',
    completionNotes: 'The demo record notes that required next steps were explained.',
    outcome: 'Admission was marked confirmed in the linked demo enquiry.',
    issuesAndBlockers: 'No blocker recorded in the supplied demo notes.',
    qualityAssessment: 'Simulated review: the linked enquiry is in the admitted stage and the task notes describe support provided.',
    recommendations: 'Retain the outcome and ensure the enquiry timeline reflects the final admission milestone.',
    overallAnalysis: 'Simulated demo analysis based only on the completion notes shown here; it does not verify external work.',
    founderReviewStatus: 'Awaiting Review',
    requiresFurtherAction: false,
  },
];
