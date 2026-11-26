import {
  CampaignWorkspace,
  SocialMediaMetric,
  PodcastEpisode,
  ReelItem,
  CounselingSession,
  TechnicalBug,
  CompanyEvent,
  DocumentRecord,
  NotificationItem,
} from '@/types';

export const MOCK_CAMPAIGNS: CampaignWorkspace[] = [
  {
    id: 'CMP-201',
    title: 'MindlyftAI Winter Masterclass & Admissions Drive',
    objective: 'Generate 1,500+ qualified engineering student leads and 120 cohort enrollments across Maharashtra & Karnataka.',
    participatingDepartments: ['Media', 'TeleCaller', 'Counselor', 'Sales Department'],
    assignedEmployees: ['Rohan Kulkarni', 'Priya Sharma', 'Neha Gupta', 'Ritesh Deshmukh'],
    leadManager: 'Anchal Agawane',
    startDate: '2026-11-01',
    deadline: '2026-12-15',
    status: 'Active',
    leadsGenerated: 1420,
    budgetRef: 250000,
    spentRef: 184500,
    milestones: [
      { title: 'LinkedIn & Instagram Ad Creatives Launch', due: '2026-11-05', done: true },
      { title: 'Live AI Architecture Masterclass Webinar', due: '2026-11-20', done: true },
      { title: 'TeleCaller & Counselor Conversion Sprint', due: '2026-12-10', done: false },
    ],
    documents: ['Winter_Campaign_Brief.pdf', 'Ad_Creative_Kit.zip'],
  },
  {
    id: 'CMP-202',
    title: 'National EdTech Expo & Campus Roadshow 2026',
    objective: 'Showcase MindLyft LMS & Capsule programs to 3,500+ students and 40+ college deans.',
    participatingDepartments: ['Operation Team', 'Sales Department', 'Media', 'Technical Team'],
    assignedEmployees: ['Vikram Deshmukh', 'Kavita Nair', 'Ritesh Deshmukh', 'Tanvi Patil'],
    leadManager: 'Shubham Jadhav',
    startDate: '2026-11-10',
    deadline: '2026-12-20',
    status: 'Active',
    leadsGenerated: 890,
    budgetRef: 480000,
    spentRef: 310000,
    milestones: [
      { title: 'Expo Stall Design & AV Booking', due: '2026-11-22', done: true },
      { title: 'Live LMS Kiosk Demo Build', due: '2026-12-01', done: false },
      { title: 'Post-Expo Lead Import & Follow-up', due: '2026-12-18', done: false },
    ],
    documents: ['Pragati_Maidan_Booth_Specs.pdf'],
  },
];

export const MOCK_SOCIAL_METRICS: SocialMediaMetric[] = [
  { id: 'SOC-1', platform: 'Instagram', contentType: 'Reel', title: 'How LLMs Predict the Next Token in 45s', publishDate: '2026-11-24', reach: 42500, views: 38400, likes: 3120, comments: 145, shares: 680 },
  { id: 'SOC-2', platform: 'LinkedIn', contentType: 'Carousel', title: 'Top 7 Cloud Architecture Patterns for CDAC Grads', publishDate: '2026-11-22', reach: 28900, views: 21400, likes: 1840, comments: 92, shares: 410 },
  { id: 'SOC-3', platform: 'YouTube', contentType: 'Podcast Clip', title: 'MindLyft Leaders Ep 11: Kubernetes at Scale', publishDate: '2026-11-19', reach: 19200, views: 14820, likes: 980, comments: 64, shares: 215 },
  { id: 'SOC-4', platform: 'X', contentType: 'Article', title: 'Why Campus Hands-on Labs Beat Static Theory', publishDate: '2026-11-15', reach: 11400, views: 8900, likes: 430, comments: 31, shares: 120 },
];

export const MOCK_PODCASTS: PodcastEpisode[] = [
  {
    id: 'POD-11',
    topic: 'Scaling Cloud Architecture with Kubernetes',
    guestName: 'Kunal Shah (Principal Architect)',
    guestContact: 'kunal.shah@cloudscale.io',
    presenter: 'Rohan Kulkarni',
    recordingDate: '2026-11-14',
    stage: 'Done',
    greetingStatus: 'Confirmed',
    editingStatus: 'Mastered',
    publicationStatus: 'Published',
    guestTimeline: [
      { step: 'Invitation', done: true, date: '2026-11-01' },
      { step: 'Confirmation', done: true, date: '2026-11-03' },
      { step: 'Reminder', done: true, date: '2026-11-12' },
      { step: 'Greeting Communication', done: true, date: '2026-11-13' },
      { step: 'Recording Schedule', done: true, date: '2026-11-14' },
      { step: 'Follow-up', done: true, date: '2026-11-19' },
    ],
  },
  {
    id: 'POD-12',
    topic: 'Next-Gen Generative AI in Higher Education',
    guestName: 'Dr. Alok Verma (Dean, IIT Research)',
    guestContact: 'alok.verma@research.edu',
    presenter: 'Rohan Kulkarni',
    recordingDate: '2026-11-23',
    stage: 'Ongoing',
    greetingStatus: 'Sent',
    editingStatus: 'In Progress',
    publicationStatus: 'Scheduled',
    guestTimeline: [
      { step: 'Invitation', done: true, date: '2026-11-08' },
      { step: 'Confirmation', done: true, date: '2026-11-10' },
      { step: 'Reminder', done: true, date: '2026-11-21' },
      { step: 'Greeting Communication', done: true, date: '2026-11-22' },
      { step: 'Recording Schedule', done: true, date: '2026-11-23' },
      { step: 'Follow-up', done: false, date: '2026-11-28' },
    ],
  },
  {
    id: 'POD-13',
    topic: 'Breaking into Enterprise Cybersecurity',
    guestName: 'Meera Joshi (CISO, FinShield)',
    guestContact: 'meera.j@finshield.in',
    presenter: 'Rohan Kulkarni',
    recordingDate: '2026-12-04',
    stage: 'Upcoming',
    greetingStatus: 'Pending',
    editingStatus: 'Not Started',
    publicationStatus: 'Draft',
    guestTimeline: [
      { step: 'Invitation', done: true, date: '2026-11-20' },
      { step: 'Confirmation', done: true, date: '2026-11-24' },
      { step: 'Reminder', done: false, date: '2026-12-02' },
      { step: 'Greeting Communication', done: false, date: '2026-12-03' },
      { step: 'Recording Schedule', done: false, date: '2026-12-04' },
      { step: 'Follow-up', done: false, date: '2026-12-08' },
    ],
  },
];

export const MOCK_REELS: ReelItem[] = [
  { id: 'REL-01', title: 'Campus Hackathon 2026 Teaser', editorName: 'Ishita Roy', submissionDate: '2026-11-24', stage: 'Review', reviewComments: 'Boost background music by +2dB on outro.' },
  { id: 'REL-02', title: 'CDAC vs Capsule: Which Suits You?', editorName: 'Ishita Roy', submissionDate: '2026-11-22', stage: 'Approved', reviewComments: 'Captions verified and crisp.', publicationDate: '2026-11-26' },
  { id: 'REL-03', title: 'Student Placement Story: 24 LPA', editorName: 'Rohan Kulkarni', submissionDate: '2026-11-18', stage: 'Posted', reviewComments: 'Published across IG & YouTube Shorts.', publicationDate: '2026-11-19' },
  { id: 'REL-04', title: '5 Python Tricks for Technical Interviews', editorName: 'Ishita Roy', submissionDate: '2026-11-25', stage: 'Editing', reviewComments: 'Adding code overlay animations.' },
  { id: 'REL-05', title: 'Behind the Scenes at MindLyft Studio', editorName: 'Ishita Roy', submissionDate: '2026-11-27', stage: 'Assigned', reviewComments: 'Raw footage uploaded to Studio NAS.' },
];

export const MOCK_COUNSELING_SESSIONS: CounselingSession[] = [
  {
    id: 'CNS-101',
    studentName: 'Aakash Verma',
    phone: '+91 98221 00411',
    counselorName: 'Neha Gupta',
    sessionDate: '2026-11-25',
    interests: ['MindlyftAI', 'Generative AI'],
    guidanceNotes: 'Strong Python fundamentals; recommended MindlyftAI Cohort 8.',
    restrictedSensitiveNote: false,
    followUpDate: '2026-11-28',
    outcome: 'Enrolled',
  },
  {
    id: 'CNS-102',
    studentName: 'Divya Nair',
    phone: '+91 98450 44211',
    counselorName: 'Neha Gupta',
    sessionDate: '2026-11-24',
    interests: ['CDAC', 'Full Stack'],
    guidanceNotes: '[Restricted Note] Student facing personal scheduling constraints; advised flexible weekend lab option & EMI.',
    restrictedSensitiveNote: true,
    followUpDate: '2026-11-27',
    outcome: 'Follow-up Needed',
  },
];

export const MOCK_TECHNICAL_BUGS: TechnicalBug[] = [
  { id: 'BUG-401', title: 'Docker runner timeout on multi-file Java submissions', project: 'LMS Assessment Engine', assignedDeveloper: 'Tanvi Patil', priority: 'Critical', deadline: '2026-11-27', status: 'In Progress', description: 'Timeout threshold needs dynamic scaling when Maven dependencies cache misses.' },
  { id: 'BUG-402', title: 'Attendance CSV export drops UTF-8 student names', project: 'Faculty Portal', assignedDeveloper: 'Sneha Shinde', priority: 'High', deadline: '2026-11-28', status: 'Testing', description: 'Add UTF-8 BOM header to exported CSV blobs.' },
  { id: 'BUG-403', title: 'Dark mode badge contrast on Safari iOS', project: 'AWFIS HUB UI', assignedDeveloper: 'Aarav Sharma', priority: 'Medium', deadline: '2026-11-29', status: 'Assigned', description: 'Adjust Tailwind ring opacity for iOS WebKit.' },
  { id: 'BUG-404', title: 'Quiz timer drift when browser tab is backgrounded', project: 'Student Exam Portal', assignedDeveloper: 'Sneha Shinde', priority: 'High', deadline: '2026-11-22', status: 'Resolved', description: 'Switched to server-synced UTC end timestamp.' },
];

export const MOCK_EVENTS: CompanyEvent[] = [
  { id: 'EVT-401', name: 'National EdTech Expo & Career Summit 2026', eventType: 'Expo', date: '2026-12-10', venue: 'Pragati Maidan, New Delhi • Hall 5', organizer: 'Vikram Deshmukh', participatingDepartments: ['Operation Team', 'Sales Department', 'Media'], boothDetails: 'Stall A-14 (Corner 6x6m Island Booth)', leadsCollected: 410, qualifiedLeads: 185, conversions: 24, expenseRef: 850000, status: 'Ongoing' },
  { id: 'EVT-402', name: 'MindLyft Pan-India Agentic AI Hackathon', eventType: 'Campaign', date: '2026-12-22', venue: 'MindLyft Innovation Centre, Pune', organizer: 'Tanvi Patil', participatingDepartments: ['Technical Team', 'Trainer', 'Interns'], leadsCollected: 620, qualifiedLeads: 290, conversions: 42, expenseRef: 450000, status: 'Upcoming' },
  { id: 'EVT-403', name: 'Deans & Academic Leadership Conclave', eventType: 'FDP', date: '2026-11-12', venue: 'JW Marriott, Pune', organizer: 'Anchal Agawane', participatingDepartments: ['Sales Department', 'Trainer'], leadsCollected: 85, qualifiedLeads: 64, conversions: 14, expenseRef: 320000, status: 'Completed' },
  { id: 'EVT-404', name: 'COEP Campus Full-Stack & AI Workshop', eventType: 'College Workshop', date: '2026-11-18', venue: 'COEP Auditorium, Pune', organizer: 'Ritesh Deshmukh', participatingDepartments: ['Sales Department', 'Trainer', 'Counselor'], leadsCollected: 340, qualifiedLeads: 140, conversions: 31, expenseRef: 95000, status: 'Completed' },
];

export const MOCK_DOCUMENTS: DocumentRecord[] = [
  { id: 'DOC-01', name: 'COEP_Institutional_MoU_2026_2027.pdf', category: 'MoUs', owner: 'Anchal Agawane', relatedModule: 'Colleges & Sales', uploadDate: '2026-10-15', classification: 'Department Only', version: 'v2.1', fileType: 'PDF' },
  { id: 'DOC-02', name: 'MindlyftAI_Cohort8_Curriculum_Syllabus.pdf', category: 'Course documents', owner: 'Rutuja Botre', relatedModule: 'Education', uploadDate: '2026-11-01', classification: 'Public Internal', version: 'v3.0', fileType: 'PDF' },
  { id: 'DOC-03', name: 'Q3_FY26_GSTR3B_Compliance_Filing.xlsx', category: 'GST files', owner: 'Pooja Ahire', relatedModule: 'Accounts & Finance', uploadDate: '2026-11-18', classification: 'Chairperson Confidential', version: 'v1.0', fileType: 'XLSX' },
  { id: 'DOC-04', name: 'National_Expo_Booth_Vendor_Contract.pdf', category: 'Event documents', owner: 'Vikram Deshmukh', relatedModule: 'Events & Expos', uploadDate: '2026-11-20', classification: 'Department Only', version: 'v1.2', fileType: 'PDF' },
  { id: 'DOC-05', name: 'Aarav_Sharma_Internship_Exit_Clearance.docx', category: 'Employee documents', owner: 'Tanvi Patil', relatedModule: 'Employees', uploadDate: '2026-11-24', classification: 'Private', version: 'v1.0', fileType: 'DOCX' },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'NTF-01', title: 'Deliverable Submitted for Review', message: 'Rohan Kulkarni submitted TSK-103 (Podcast Episode 12 Master Cut).', category: 'Approval', timestamp: '10 mins ago', isRead: false, targetUrl: '/tasks' },
  { id: 'NTF-02', title: 'Task Transferred to You', message: 'TSK-102 (Code Assessment Runner v2.4) transferred from Sneha Shinde.', category: 'Task Transfer', timestamp: '1 hour ago', isRead: false, targetUrl: '/tasks' },
  { id: 'NTF-03', title: 'Recurring Bill Due Today', message: 'Airtel Enterprise Fiber Wi-Fi bill (₹18,500) is due today.', category: 'Finance', timestamp: '2 hours ago', isRead: false, targetUrl: '/accounts' },
  { id: 'NTF-04', title: 'Asset Return Pending', message: 'Aarav Sharma (AWF-INT-001) MacBook Air return pending offboarding.', category: 'Asset', timestamp: 'Yesterday', isRead: true, targetUrl: '/assets' },
  { id: 'NTF-05', title: 'Follow-up Escalated', message: 'TeleCaller lead Gaurav Kulkarni escalated for scholarship approval.', category: 'Follow-up', timestamp: 'Yesterday', isRead: true, targetUrl: '/telecaller' },
];
