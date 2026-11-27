import { allCourses } from '@/lib/course-catalogue';

export const TELECALLER_DEMO_TODAY = '2026-11-26';

export const telecallerProgrammes = Array.from(
  new Set(allCourses.map((course) => course.programme))
);

export interface TeleCallerProfile {
  id: string;
  name: string;
  active: boolean;
  targetCalls: number;
  workingStatus: 'Available' | 'On call' | 'Break' | 'Offline';
}

export type LeadQualificationStatus =
  | 'New'
  | 'Not Contacted'
  | 'Contacted'
  | 'Interested'
  | 'Not Interested'
  | 'Callback Required'
  | 'Qualified'
  | 'Unreachable'
  | 'Invalid Number';

export interface TeleCallerLead {
  id: string;
  studentName: string;
  emailMasked: string;
  phoneMasked: string;
  programme: string;
  educationBackground: string;
  source: string;
  telecallerId: string;
  assignedDate: string;
  interestLevel: 'High' | 'Medium' | 'Low';
  qualificationStatus: LeadQualificationStatus;
  priority: 'High' | 'Medium' | 'Low';
  callsMade: number;
  lastCallDate?: string;
  nextCallbackDate?: string;
  notes: string;
}

export type HandoverStatus =
  | 'Pending Acceptance'
  | 'Accepted'
  | 'Returned for Clarification'
  | 'Rejected';

export interface TeleCallerHandover {
  id: string;
  leadId: string;
  telecallerId: string;
  counselorId?: string;
  programme: string;
  handoverDate: string;
  status: HandoverStatus;
  callNotes: string;
  counselorNote?: string;
}

export interface TeleCallerCallback {
  id: string;
  leadId: string;
  telecallerId: string;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Awaiting Response' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  note: string;
}

export interface TeleCallerCallActivity {
  date: string;
  telecallerId: string;
  programme: string;
  calls: number;
  connected: number;
  interested: number;
  qualified: number;
  handovers: number;
  acceptedHandovers: number;
  counsellingStarted: number;
  returnedHandovers: number;
  unreachable: number;
  pendingCallbacks: number;
  talkSeconds: number;
}

export interface TeleCallerTaskTransfer {
  id: string;
  taskId: string;
  title: string;
  category: string;
  originalTelecallerId: string;
  newTelecallerId: string;
  transferredBy: string;
  transferDate: string;
  dueDate: string;
  reason: string;
  status: 'Pending Acceptance' | 'Accepted' | 'Completed' | 'Rejected';
}

export interface TeleCallerCompletionReport {
  id: string;
  taskId: string;
  title: string;
  telecallerId: string;
  completedAt: string;
  dueDate: string;
  workSummary: string;
  outcome: string;
  bottleneck: string;
  founderReviewStatus: 'Awaiting Review' | 'Reviewed';
}

export const demoTelecallers: TeleCallerProfile[] = [
  { id: 'TLC-01', name: 'Demo Caller A', active: true, targetCalls: 150, workingStatus: 'On call' },
  { id: 'TLC-02', name: 'Demo Caller B', active: true, targetCalls: 145, workingStatus: 'Available' },
  { id: 'TLC-03', name: 'Demo Caller C', active: true, targetCalls: 150, workingStatus: 'On call' },
  { id: 'TLC-04', name: 'Demo Caller D', active: true, targetCalls: 140, workingStatus: 'Available' },
  { id: 'TLC-05', name: 'Demo Caller E', active: true, targetCalls: 135, workingStatus: 'Break' },
  { id: 'TLC-06', name: 'Demo Caller F', active: true, targetCalls: 130, workingStatus: 'On call' },
  { id: 'TLC-07', name: 'Demo Caller G', active: true, targetCalls: 125, workingStatus: 'Available' },
  { id: 'TLC-08', name: 'Demo Caller H', active: true, targetCalls: 120, workingStatus: 'Available' },
  { id: 'TLC-09', name: 'Demo Caller I', active: true, targetCalls: 115, workingStatus: 'Offline' },
  { id: 'TLC-10', name: 'Demo Caller J', active: true, targetCalls: 110, workingStatus: 'On call' },
];

export const demoTelecallerLeads: TeleCallerLead[] = [
  {
    id: 'ENQ-2401',
    studentName: 'Demo Student 01',
    emailMasked: 's***01@example.demo',
    phoneMasked: '+91 •••••• 2401',
    programme: 'AI, GenAI & Agentic AI',
    educationBackground: 'B.Tech, final year',
    source: 'Website',
    telecallerId: 'TLC-01',
    assignedDate: '2026-11-26',
    interestLevel: 'High',
    qualificationStatus: 'Not Contacted',
    priority: 'High',
    callsMade: 0,
    nextCallbackDate: '2026-11-26',
    notes: 'New demo enquiry; initial outreach is still due.',
  },
  {
    id: 'ENQ-2402',
    studentName: 'Demo Student 02',
    emailMasked: 's***02@example.demo',
    phoneMasked: '+91 •••••• 2402',
    programme: 'Data Analytics',
    educationBackground: 'B.Com graduate',
    source: 'Referral',
    telecallerId: 'TLC-02',
    assignedDate: '2026-11-24',
    interestLevel: 'Medium',
    qualificationStatus: 'Qualified',
    priority: 'Medium',
    callsMade: 2,
    lastCallDate: '2026-11-25',
    notes: 'Asked for schedule and programme details; handover accepted in the demo.',
  },
  {
    id: 'ENQ-2403',
    studentName: 'Demo Student 03',
    emailMasked: 's***03@example.demo',
    phoneMasked: '+91 •••••• 2403',
    programme: 'Cybersecurity',
    educationBackground: 'B.Sc. IT graduate',
    source: 'Webinar',
    telecallerId: 'TLC-03',
    assignedDate: '2026-11-07',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'High',
    callsMade: 4,
    lastCallDate: '2026-11-24',
    notes: 'Requested a technical-track counselling discussion.',
  },
  {
    id: 'ENQ-2404',
    studentName: 'Demo Student 04',
    emailMasked: 's***04@example.demo',
    phoneMasked: '+91 •••••• 2404',
    programme: 'Capsule Programmes',
    educationBackground: 'Working professional, BBA',
    source: 'Campus event',
    telecallerId: 'TLC-04',
    assignedDate: '2026-11-20',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'High',
    callsMade: 3,
    lastCallDate: '2026-11-25',
    notes: 'Interested in a short-format programme and weekend schedule.',
  },
  {
    id: 'ENQ-2405',
    studentName: 'Demo Student 05',
    emailMasked: 's***05@example.demo',
    phoneMasked: '+91 •••••• 2405',
    programme: 'Data Analytics',
    educationBackground: 'B.Com graduate',
    source: 'Website',
    telecallerId: 'TLC-05',
    assignedDate: '2026-11-15',
    interestLevel: 'Medium',
    qualificationStatus: 'Qualified',
    priority: 'Medium',
    callsMade: 2,
    lastCallDate: '2026-11-18',
    notes: 'Asked about career outcomes and agreed to speak with a counselor.',
  },
  {
    id: 'ENQ-2406',
    studentName: 'Demo Student 06',
    emailMasked: 's***06@example.demo',
    phoneMasked: '+91 •••••• 2406',
    programme: 'AI, GenAI & Agentic AI',
    educationBackground: 'B.Tech graduate',
    source: 'Referral',
    telecallerId: 'TLC-06',
    assignedDate: '2026-11-12',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'High',
    callsMade: 3,
    lastCallDate: '2026-11-24',
    notes: 'Interested in applied AI and has been referred for counselling.',
  },
  {
    id: 'ENQ-2407',
    studentName: 'Demo Student 07',
    emailMasked: 's***07@example.demo',
    phoneMasked: '+91 •••••• 2407',
    programme: 'Data Analytics',
    educationBackground: 'B.Sc. Mathematics graduate',
    source: 'Campus event',
    telecallerId: 'TLC-07',
    assignedDate: '2026-11-10',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'Medium',
    callsMade: 2,
    lastCallDate: '2026-11-20',
    notes: 'Counselor handover is accepted in the demo journey.',
  },
  {
    id: 'ENQ-2408',
    studentName: 'Demo Student 08',
    emailMasked: 's***08@example.demo',
    phoneMasked: '+91 •••••• 2408',
    programme: 'Cloud Computing & DevOps',
    educationBackground: 'Diploma in Computer Engineering',
    source: 'Social media',
    telecallerId: 'TLC-08',
    assignedDate: '2026-11-09',
    interestLevel: 'Low',
    qualificationStatus: 'Not Interested',
    priority: 'Low',
    callsMade: 2,
    lastCallDate: '2026-11-15',
    notes: 'Prospect declined further follow-up in the sample record.',
  },
  {
    id: 'ENQ-2409',
    studentName: 'Demo Student 09',
    emailMasked: 's***09@example.demo',
    phoneMasked: '+91 •••••• 2409',
    programme: 'AI, GenAI & Agentic AI',
    educationBackground: 'BCA graduate',
    source: 'Website',
    telecallerId: 'TLC-09',
    assignedDate: '2026-11-01',
    interestLevel: 'Medium',
    qualificationStatus: 'Callback Required',
    priority: 'High',
    callsMade: 5,
    lastCallDate: '2026-11-10',
    nextCallbackDate: '2026-11-20',
    notes: 'Repeated attempts have not reached the prospect; callback is overdue.',
  },
  {
    id: 'ENQ-2410',
    studentName: 'Demo Student 10',
    emailMasked: 's***10@example.demo',
    phoneMasked: '+91 •••••• 2410',
    programme: 'Data Analytics',
    educationBackground: 'BBA graduate',
    source: 'Referral',
    telecallerId: 'TLC-10',
    assignedDate: '2026-10-30',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'High',
    callsMade: 3,
    lastCallDate: '2026-11-24',
    notes: 'Lead qualified and referred to the Counselor team.',
  },
  {
    id: 'ENQ-2411',
    studentName: 'Demo Student 11',
    emailMasked: 's***11@example.demo',
    phoneMasked: '+91 •••••• 2411',
    programme: 'Cybersecurity',
    educationBackground: 'B.Tech, third year',
    source: 'Partner referral',
    telecallerId: 'TLC-02',
    assignedDate: '2026-11-02',
    interestLevel: 'Medium',
    qualificationStatus: 'Unreachable',
    priority: 'Medium',
    callsMade: 6,
    lastCallDate: '2026-11-18',
    nextCallbackDate: '2026-11-25',
    notes: 'No successful connection after repeated demo attempts.',
  },
  {
    id: 'ENQ-2412',
    studentName: 'Demo Student 12',
    emailMasked: 's***12@example.demo',
    phoneMasked: '+91 •••••• 2412',
    programme: 'Data Science, Machine Learning & Deep Learning',
    educationBackground: 'M.Sc. Statistics',
    source: 'Webinar',
    telecallerId: 'TLC-03',
    assignedDate: '2026-11-22',
    interestLevel: 'High',
    qualificationStatus: 'Interested',
    priority: 'High',
    callsMade: 2,
    lastCallDate: '2026-11-24',
    nextCallbackDate: '2026-11-27',
    notes: 'Interested; requested a follow-up before qualifying the lead.',
  },
  {
    id: 'ENQ-2413',
    studentName: 'Demo Student 13',
    emailMasked: 's***13@example.demo',
    phoneMasked: '+91 •••••• 2413',
    programme: 'Cloud Computing & DevOps',
    educationBackground: 'BCA, final year',
    source: 'Website',
    telecallerId: 'TLC-04',
    assignedDate: '2026-11-23',
    interestLevel: 'Low',
    qualificationStatus: 'Invalid Number',
    priority: 'Low',
    callsMade: 1,
    lastCallDate: '2026-11-23',
    notes: 'Demo contact record needs verification; no contact attempt is planned.',
  },
  {
    id: 'ENQ-2414',
    studentName: 'Demo Student 14',
    emailMasked: 's***14@example.demo',
    phoneMasked: '+91 •••••• 2414',
    programme: 'Data Analytics',
    educationBackground: 'B.Com, final year',
    source: 'Campus event',
    telecallerId: 'TLC-05',
    assignedDate: '2026-11-26',
    interestLevel: 'Medium',
    qualificationStatus: 'New',
    priority: 'Medium',
    callsMade: 0,
    nextCallbackDate: '2026-11-27',
    notes: 'Recently assigned; first outreach is not yet due.',
  },
  {
    id: 'ENQ-2415',
    studentName: 'Demo Student 15',
    emailMasked: 's***15@example.demo',
    phoneMasked: '+91 •••••• 2415',
    programme: 'Data Analytics',
    educationBackground: 'B.Sc. Economics graduate',
    source: 'Partner referral',
    telecallerId: 'TLC-06',
    assignedDate: '2026-11-23',
    interestLevel: 'High',
    qualificationStatus: 'Qualified',
    priority: 'High',
    callsMade: 3,
    lastCallDate: '2026-11-25',
    notes: 'Qualification is complete; counselor referral has not yet been created in this sample.',
  },
];

export const demoTelecallerHandovers: TeleCallerHandover[] = [
  { id: 'TH-701', leadId: 'ENQ-2401', telecallerId: 'TLC-01', programme: 'AI, GenAI & Agentic AI', handoverDate: '2026-11-26', status: 'Pending Acceptance', callNotes: 'High interest; requested an initial career-guidance discussion.' },
  { id: 'TH-702', leadId: 'ENQ-2402', telecallerId: 'TLC-02', counselorId: 'CNS-01', programme: 'Data Analytics', handoverDate: '2026-11-25', status: 'Accepted', callNotes: 'Requested a programme schedule and career outcome discussion.', counselorNote: 'Accepted for counselling follow-up.' },
  { id: 'TH-703', leadId: 'ENQ-2403', telecallerId: 'TLC-03', counselorId: 'CNS-01', programme: 'Cybersecurity', handoverDate: '2026-11-24', status: 'Accepted', callNotes: 'Interested in the technical track and entry requirements.', counselorNote: 'Accepted; counselling is in progress.' },
  { id: 'TH-704', leadId: 'ENQ-2404', telecallerId: 'TLC-04', counselorId: 'CNS-01', programme: 'Capsule Programmes', handoverDate: '2026-11-25', status: 'Accepted', callNotes: 'Interested in weekend delivery and short-format learning.', counselorNote: 'Accepted for programme-fit discussion.' },
  { id: 'TH-705', leadId: 'ENQ-2405', telecallerId: 'TLC-05', counselorId: 'CNS-02', programme: 'Data Analytics', handoverDate: '2026-11-18', status: 'Accepted', callNotes: 'Requested advice on choosing between analytics tracks.', counselorNote: 'Accepted; counselling outcome recorded.' },
  { id: 'TH-706', leadId: 'ENQ-2406', telecallerId: 'TLC-06', counselorId: 'CNS-02', programme: 'AI, GenAI & Agentic AI', handoverDate: '2026-11-24', status: 'Accepted', callNotes: 'Qualified for an applied AI career discussion.', counselorNote: 'Accepted for admission guidance.' },
  { id: 'TH-707', leadId: 'ENQ-2407', telecallerId: 'TLC-07', counselorId: 'CNS-03', programme: 'Data Analytics', handoverDate: '2026-11-20', status: 'Accepted', callNotes: 'Confirmed intent and readiness to discuss admission steps.', counselorNote: 'Accepted; sample journey shows admission completed.' },
  { id: 'TH-708', leadId: 'ENQ-2408', telecallerId: 'TLC-08', counselorId: 'CNS-03', programme: 'Cloud Computing & DevOps', handoverDate: '2026-11-16', status: 'Returned for Clarification', callNotes: 'Initial interest was unclear; a second qualification check is recommended.', counselorNote: 'Please confirm availability and programme intent before reassigning.' },
  { id: 'TH-709', leadId: 'ENQ-2410', telecallerId: 'TLC-10', counselorId: 'CNS-02', programme: 'Data Analytics', handoverDate: '2026-11-24', status: 'Accepted', callNotes: 'Qualified prospect asked for an admission checklist review.', counselorNote: 'Accepted for admission follow-up.' },
  { id: 'TH-710', leadId: 'ENQ-2412', telecallerId: 'TLC-03', programme: 'Data Science, Machine Learning & Deep Learning', handoverDate: '2026-11-25', status: 'Pending Acceptance', callNotes: 'Interested prospect; next callback confirmed before counselling.' },
];

export const demoTelecallerCallbacks: TeleCallerCallback[] = [
  { id: 'CB-801', leadId: 'ENQ-2401', telecallerId: 'TLC-01', dueDate: '2026-11-26', status: 'Pending', priority: 'High', note: 'First outreach attempt.' },
  { id: 'CB-802', leadId: 'ENQ-2402', telecallerId: 'TLC-02', dueDate: '2026-11-27', status: 'Awaiting Response', priority: 'Medium', note: 'Check whether the requested programme information was received.' },
  { id: 'CB-803', leadId: 'ENQ-2404', telecallerId: 'TLC-04', dueDate: '2026-11-27', status: 'Pending', priority: 'High', note: 'Confirm preferred counselling time.' },
  { id: 'CB-804', leadId: 'ENQ-2409', telecallerId: 'TLC-09', dueDate: '2026-11-20', status: 'Pending', priority: 'High', note: 'Overdue callback after unsuccessful attempts.' },
  { id: 'CB-805', leadId: 'ENQ-2411', telecallerId: 'TLC-02', dueDate: '2026-11-25', status: 'Pending', priority: 'Medium', note: 'Try the prospect once more within the permitted calling window.' },
  { id: 'CB-806', leadId: 'ENQ-2412', telecallerId: 'TLC-03', dueDate: '2026-11-27', status: 'Pending', priority: 'High', note: 'Complete qualification before counselor handover.' },
  { id: 'CB-807', leadId: 'ENQ-2405', telecallerId: 'TLC-05', dueDate: '2026-11-22', status: 'Completed', priority: 'Medium', note: 'Completed demo callback; lead was referred to counselling.' },
  { id: 'CB-808', leadId: 'ENQ-2414', telecallerId: 'TLC-05', dueDate: '2026-11-27', status: 'Pending', priority: 'Medium', note: 'Initial call after assignment.' },
  { id: 'CB-809', leadId: 'ENQ-2403', telecallerId: 'TLC-03', dueDate: '2026-11-25', status: 'Completed', priority: 'High', note: 'Call completed and qualified lead handed over.' },
  { id: 'CB-810', leadId: 'ENQ-2408', telecallerId: 'TLC-08', dueDate: '2026-11-16', status: 'Cancelled', priority: 'Low', note: 'Callback stopped after the prospect declined further contact.' },
];

function allocate(total: number, weights: number[]) {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const exact = weights.map((weight) => (total * weight) / weightTotal);
  const values = exact.map(Math.floor);
  const remainder = total - values.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - values[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < remainder; index += 1) {
    values[order[index].index] += 1;
  }
  return values;
}

const dayCount = 90;
const dailyRecords = Array.from({ length: dayCount }, (_, dayIndex) => {
  const date = new Date(`${TELECALLER_DEMO_TODAY}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (dayCount - dayIndex - 1));
  return demoTelecallers.flatMap((telecaller, callerIndex) => ({
    date: date.toISOString().slice(0, 10),
    telecallerId: telecaller.id,
    programme: telecallerProgrammes[(dayIndex + callerIndex) % telecallerProgrammes.length],
    weight: (1 + callerIndex) * (8 + ((dayIndex + callerIndex) % 7)),
    talkRateSeconds: 150 + callerIndex * 12 + (dayIndex % 25),
  }));
}).flat();

const callCounts = allocate(1240, dailyRecords.map((record) => record.weight));
const connectedCounts = allocate(840, callCounts);
const interestedCounts = allocate(186, connectedCounts);
const qualifiedCounts = allocate(150, interestedCounts);
const handoverCounts = allocate(124, qualifiedCounts);
const acceptedHandoverCounts = allocate(110, handoverCounts);
const counsellingStartedCounts = allocate(84, acceptedHandoverCounts);
const returnedHandoverCounts = allocate(5, handoverCounts);
const unreachableCounts = allocate(74, callCounts);
const pendingCallbackCounts = allocate(96, callCounts);

export const demoTelecallerCallActivity: TeleCallerCallActivity[] = dailyRecords.map(
  (record, index) => ({
    date: record.date,
    telecallerId: record.telecallerId,
    programme: record.programme,
    calls: callCounts[index],
    connected: connectedCounts[index],
    interested: interestedCounts[index],
    qualified: qualifiedCounts[index],
    handovers: handoverCounts[index],
    acceptedHandovers: acceptedHandoverCounts[index],
    counsellingStarted: counsellingStartedCounts[index],
    returnedHandovers: returnedHandoverCounts[index],
    unreachable: unreachableCounts[index],
    pendingCallbacks: pendingCallbackCounts[index],
    talkSeconds: connectedCounts[index] * record.talkRateSeconds,
  })
);

export const demoTelecallerTaskTransfers: TeleCallerTaskTransfer[] = [
  { id: 'TT-901', taskId: 'TC-301', title: 'Recontact high-intent AI programme leads', category: 'Lead follow-up', originalTelecallerId: 'TLC-01', newTelecallerId: 'TLC-03', transferredBy: 'Department Lead', transferDate: '2026-11-25', dueDate: '2026-11-26', reason: 'Shift coverage changed before the scheduled callbacks.', status: 'Pending Acceptance' },
  { id: 'TT-902', taskId: 'TC-302', title: 'Complete webinar callback campaign', category: 'Calling campaign', originalTelecallerId: 'TLC-04', newTelecallerId: 'TLC-06', transferredBy: 'Department Lead', transferDate: '2026-11-22', dueDate: '2026-11-25', reason: 'Rebalanced workload for the event follow-up queue.', status: 'Accepted' },
  { id: 'TT-903', taskId: 'TC-303', title: 'Verify duplicate referral contacts', category: 'Data quality', originalTelecallerId: 'TLC-08', newTelecallerId: 'TLC-02', transferredBy: 'Operations Lead', transferDate: '2026-11-21', dueDate: '2026-11-24', reason: 'Second review requested for invalid contact records.', status: 'Completed' },
  { id: 'TT-904', taskId: 'TC-301', title: 'Recontact high-intent AI programme leads', category: 'Lead follow-up', originalTelecallerId: 'TLC-03', newTelecallerId: 'TLC-09', transferredBy: 'Department Lead', transferDate: '2026-11-24', dueDate: '2026-11-25', reason: 'Handover awaiting action after a second shift adjustment.', status: 'Accepted' },
  { id: 'TT-905', taskId: 'TC-305', title: 'Close unanswered campus-event call list', category: 'Calling campaign', originalTelecallerId: 'TLC-07', newTelecallerId: 'TLC-10', transferredBy: 'Operations Lead', transferDate: '2026-11-26', dueDate: '2026-11-28', reason: 'Provide backup coverage for newly assigned callbacks.', status: 'Pending Acceptance' },
];

export const demoTelecallerCompletionReports: TeleCallerCompletionReport[] = [
  { id: 'TAR-401', taskId: 'TC-302', title: 'Webinar callback campaign', telecallerId: 'TLC-06', completedAt: '2026-11-25', dueDate: '2026-11-25', workSummary: 'Completed the scheduled sample callbacks and tagged interested prospects for qualification.', outcome: 'Campaign marked complete; 18 sample leads advanced for review.', bottleneck: 'Several prospects requested a later callback window.', founderReviewStatus: 'Awaiting Review' },
  { id: 'TAR-402', taskId: 'TC-303', title: 'Referral contact verification', telecallerId: 'TLC-02', completedAt: '2026-11-24', dueDate: '2026-11-24', workSummary: 'Reviewed masked referral records and marked records requiring contact verification.', outcome: 'Duplicate and invalid-number examples were flagged for review.', bottleneck: 'Source records did not consistently include a preferred contact time.', founderReviewStatus: 'Reviewed' },
  { id: 'TAR-403', taskId: 'TC-306', title: 'High-intent lead handover summary', telecallerId: 'TLC-03', completedAt: '2026-11-23', dueDate: '2026-11-22', workSummary: 'Summarized programme interest and contact preferences for qualified demo prospects.', outcome: 'Counselor handover notes were prepared for the sample cohort.', bottleneck: 'Two handovers were still awaiting counselor acceptance in the sample data.', founderReviewStatus: 'Awaiting Review' },
  { id: 'TAR-404', taskId: 'TC-307', title: 'Weekly calling target review', telecallerId: 'TLC-01', completedAt: '2026-11-20', dueDate: '2026-11-21', workSummary: 'Compared illustrative call volume, connection outcomes and qualification counts.', outcome: 'Summary highlights productivity and lead-quality measures, not raw calls alone.', bottleneck: 'A lower connection rate appeared in the webinar list sample.', founderReviewStatus: 'Reviewed' },
];

export const demoTelecallerProgrammeCohort = [
  { programme: 'AI, GenAI & Agentic AI', leads: 160, interested: 65, qualified: 52 },
  { programme: 'Data Analytics', leads: 120, interested: 48, qualified: 38 },
  { programme: 'Cybersecurity', leads: 90, interested: 35, qualified: 28 },
  { programme: 'Cloud Computing & DevOps', leads: 75, interested: 25, qualified: 20 },
  { programme: 'Data Science, Machine Learning & Deep Learning', leads: 35, interested: 8, qualified: 7 },
  { programme: 'Capsule Programmes', leads: 20, interested: 5, qualified: 5 },
];
