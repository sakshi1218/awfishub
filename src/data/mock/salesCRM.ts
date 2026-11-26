// Sales CRM Mock Data for AWFIS HUB
// Realistic Indian data for Pune/Maharashtra colleges

export type VisitOutcome =
  | 'Interested'
  | 'Follow-up Required'
  | 'Meeting Scheduled'
  | 'Proposal Requested'
  | 'Tie-up in Discussion'
  | 'Tie-up Completed'
  | 'Not Interested';

export type FDPStatus =
  | 'Not Started'
  | 'Proposal Prepared'
  | 'Proposal Sent'
  | 'Meeting Scheduled'
  | 'Discussion Ongoing'
  | 'Negotiation'
  | 'Approved'
  | 'Rejected';

export type PartnershipStatus =
  | 'Initial Discussion'
  | 'Interested'
  | 'Proposal Shared'
  | 'Under Negotiation'
  | 'Agreement Pending'
  | 'Signed'
  | 'Active'
  | 'Expired'
  | 'Terminated';

export type CRMStage =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type AgreementType =
  | 'MoU'
  | 'College Tie-up Agreement'
  | 'FDP Agreement'
  | 'Training Agreement'
  | 'Service Agreement'
  | 'Partnership Agreement'
  | 'Other';

export type AgreementStatus =
  | 'Draft'
  | 'Under Review'
  | 'Pending Signature'
  | 'Signed'
  | 'Active'
  | 'Expiring Soon'
  | 'Expired'
  | 'Terminated';

export type FollowUpStatus = 'Pending' | 'Completed' | 'Rescheduled' | 'Overdue';

export interface CollegeVisit {
  id: string;
  collegeName: string;
  location: string;
  address: string;
  visitDate: string;
  tpoName: string;
  tpoContact: string;
  tpoEmail: string;
  assignedEmployee: string;
  assignedEmployeeId: string;
  purpose: string;
  discussionNotes: string;
  requirements: string;
  followUpDate: string;
  followUpOwner: string;
  outcome: VisitOutcome;
  attachments: string[];
  createdAt: string;
  collegeId: string;
}

export interface FDPSession {
  id: string;
  collegeName: string;
  collegeId: string;
  sessionTitle: string;
  sessionType: string;
  proposedDate: string;
  actualDate?: string;
  assignedEmployee: string;
  assignedEmployeeId: string;
  tpoContact: string;
  facultyDetails: string;
  proposedOffering: string;
  expectedParticipants: number;
  meetingDetails: string;
  discussionNotes: string;
  followUpDate: string;
  proposalDoc?: string;
  supportingDocs: string[];
  status: FDPStatus;
  createdAt: string;
}

export interface Tieup {
  id: string;
  collegeName: string;
  collegeId: string;
  location: string;
  tpoContact: string;
  assignedEmployee: string;
  assignedEmployeeId: string;
  partnershipType: string;
  initialDiscussionDate: string;
  tieupInitiationDate?: string;
  agreementSigningDate?: string;
  validityStartDate?: string;
  expiryDate?: string;
  status: PartnershipStatus;
  scopeOfCollaboration: string;
  notes: string;
  nextFollowUpDate?: string;
  createdAt: string;
}

export interface InterestedClient {
  id: string;
  clientName: string;
  collegeId?: string;
  orgType: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  interestedServices: string[];
  requirementDetails: string;
  leadSource: string;
  assignedSalesperson: string;
  assignedSalespersonId: string;
  dateAdded: string;
  estimatedOpportunity: number;
  stage: CRMStage;
  nextFollowUpDate: string;
  interactions: Interaction[];
  notes: string;
}

export interface Interaction {
  id: string;
  date: string;
  type: 'Call' | 'Visit' | 'Meeting' | 'Email' | 'Proposal' | 'Follow-up';
  summary: string;
  by: string;
}

export interface Agreement {
  id: string;
  title: string;
  collegeName: string;
  collegeId: string;
  relatedTieupId?: string;
  agreementType: AgreementType;
  referenceNumber: string;
  signingDate?: string;
  effectiveDate?: string;
  expiryDate?: string;
  assignedEmployee: string;
  assignedEmployeeId: string;
  authorizedSignatory: string;
  status: AgreementStatus;
  uploadedDoc?: string;
  supportingDocs: string[];
  description: string;
  notes: string;
  history: AgreementHistoryEntry[];
  createdAt: string;
}

export interface AgreementHistoryEntry {
  date: string;
  action: string;
  by: string;
}

export interface FollowUp {
  id: string;
  title: string;
  relatedCollege: string;
  collegeId?: string;
  relatedActivity: string;
  relatedActivityType: 'Visit' | 'FDP' | 'Tieup' | 'Client' | 'Agreement';
  assignedEmployee: string;
  followUpDate: string;
  priority: 'High' | 'Medium' | 'Low';
  notes: string;
  status: FollowUpStatus;
}

export interface CollegeProfile {
  id: string;
  name: string;
  location: string;
  address: string;
  type: string;
  affiliation: string;
  tpoName: string;
  tpoContact: string;
  tpoEmail: string;
  principalName?: string;
  website?: string;
  studentStrength?: number;
  createdAt: string;
}

// ─── College Profiles ───────────────────────────────────────────────────────

export const mockColleges: CollegeProfile[] = [
  {
    id: 'CLG-001',
    name: 'Pune Institute of Computer Technology',
    location: 'Pune',
    address: 'Survey No. 27, Near Trimurti Chowk, Dhankawadi, Pune - 411043',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Dr. Suhas Patil',
    tpoContact: '+91-9823456701',
    tpoEmail: 'tpo@pict.edu',
    principalName: 'Dr. Bharat Tidke',
    website: 'https://pict.edu',
    studentStrength: 4800,
    createdAt: '2024-01-10',
  },
  {
    id: 'CLG-002',
    name: 'College of Engineering Pune',
    location: 'Pune',
    address: 'Wellesley Rd, Shivajinagar, Pune - 411005',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Prof. Ashok Deshpande',
    tpoContact: '+91-9823456702',
    tpoEmail: 'tpo@coep.ac.in',
    principalName: 'Dr. Hemant Abhyankar',
    website: 'https://coep.org.in',
    studentStrength: 6200,
    createdAt: '2024-01-12',
  },
  {
    id: 'CLG-003',
    name: 'Symbiosis Institute of Technology',
    location: 'Pune',
    address: 'Gram: Lavale, Tal: Mulshi, Pune - 412115',
    type: 'Engineering',
    affiliation: 'Symbiosis International University',
    tpoName: 'Ms. Priyanka Joshi',
    tpoContact: '+91-9823456703',
    tpoEmail: 'tpo@sitpune.edu.in',
    principalName: 'Dr. Vinod Pachghare',
    website: 'https://sitpune.edu.in',
    studentStrength: 3500,
    createdAt: '2024-01-15',
  },
  {
    id: 'CLG-004',
    name: 'MIT College of Engineering',
    location: 'Pune',
    address: 'Survey No. 124, Paud Rd, Kothrud, Pune - 411038',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Mr. Rajesh Kulkarni',
    tpoContact: '+91-9823456704',
    tpoEmail: 'tpo@mitcoe.edu.in',
    principalName: 'Dr. Milind Pande',
    website: 'https://mitcoe.edu.in',
    studentStrength: 5100,
    createdAt: '2024-01-18',
  },
  {
    id: 'CLG-005',
    name: 'Indira College of Engineering and Management',
    location: 'Pune',
    address: 'Parandwadi, Pune-Nashik Highway, Pune - 410506',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Mrs. Sneha Thorat',
    tpoContact: '+91-9823456705',
    tpoEmail: 'tpo@indiraengg.com',
    principalName: 'Dr. Yogesh Dandawate',
    website: 'https://indiraengg.com',
    studentStrength: 2800,
    createdAt: '2024-02-01',
  },
  {
    id: 'CLG-006',
    name: 'Savitribai Phule Pune University - MBA Department',
    location: 'Pune',
    address: 'Ganeshkhind Rd, Pune - 411007',
    type: 'Management',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Dr. Meena Waghmare',
    tpoContact: '+91-9823456706',
    tpoEmail: 'mba.tpo@unipune.ac.in',
    principalName: 'Dr. Nitin Karmalkar',
    website: 'https://unipune.ac.in',
    studentStrength: 1200,
    createdAt: '2024-02-05',
  },
  {
    id: 'CLG-007',
    name: 'DY Patil College of Engineering',
    location: 'Pune',
    address: 'Survey No. 124, Akurdi, Pune - 411044',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Mr. Sandesh More',
    tpoContact: '+91-9823456707',
    tpoEmail: 'tpo@dypatilpune.ac.in',
    principalName: 'Dr. Avinash Deshpande',
    website: 'https://dypatilpune.ac.in',
    studentStrength: 4200,
    createdAt: '2024-02-10',
  },
  {
    id: 'CLG-008',
    name: 'Vishwakarma Institute of Technology',
    location: 'Pune',
    address: '666, Upper Indiranagar, Bibwewadi, Pune - 411037',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Dr. Deepak Bhoir',
    tpoContact: '+91-9823456708',
    tpoEmail: 'tpo@vit.edu',
    principalName: 'Dr. R.K. Bhavsar',
    website: 'https://vit.edu',
    studentStrength: 3900,
    createdAt: '2024-02-14',
  },
  {
    id: 'CLG-009',
    name: 'Bharati Vidyapeeth College of Engineering',
    location: 'Pune',
    address: 'Dhankawadi, Pune-Satara Rd, Pune - 411043',
    type: 'Engineering',
    affiliation: 'Bharati Vidyapeeth Deemed University',
    tpoName: 'Mrs. Lata Shinde',
    tpoContact: '+91-9823456709',
    tpoEmail: 'tpo@bvcoepune.edu.in',
    principalName: 'Dr. Suresh Gharpure',
    website: 'https://bvcoepune.edu.in',
    studentStrength: 3600,
    createdAt: '2024-02-20',
  },
  {
    id: 'CLG-010',
    name: 'Zeal College of Engineering and Research',
    location: 'Pune',
    address: 'Narhe, Pune - 411041',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Mr. Vikas Jadhav',
    tpoContact: '+91-9823456710',
    tpoEmail: 'tpo@zealpune.com',
    principalName: 'Dr. Anand Kulkarni',
    website: 'https://zealpune.com',
    studentStrength: 2400,
    createdAt: '2024-03-01',
  },
  {
    id: 'CLG-011',
    name: 'Sinhgad College of Engineering',
    location: 'Pune',
    address: '44/1, Vadgaon (BK), Off. Sinhgad Rd, Pune - 411041',
    type: 'Engineering',
    affiliation: 'Savitribai Phule Pune University',
    tpoName: 'Mr. Amol Pawar',
    tpoContact: '+91-9823456711',
    tpoEmail: 'tpo@sinhgad.edu',
    principalName: 'Dr. Suresh Magar',
    website: 'https://sinhgad.edu',
    studentStrength: 5500,
    createdAt: '2024-03-05',
  },
];

// ─── College Visits ──────────────────────────────────────────────────────────

export const mockCollegeVisits: CollegeVisit[] = [
  {
    id: 'VIS-001',
    collegeName: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    location: 'Pune',
    address: 'Survey No. 27, Near Trimurti Chowk, Dhankawadi, Pune - 411043',
    visitDate: '2024-11-05',
    tpoName: 'Dr. Suhas Patil',
    tpoContact: '+91-9823456701',
    tpoEmail: 'tpo@pict.edu',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    purpose: 'Initial introduction of AWFIS HUB training programs and co-working services',
    discussionNotes: 'TPO was very receptive. Showed interest in placement-linked training modules. Discussed customized Data Science bootcamp for final year students.',
    requirements: 'Short-term intensive courses for placement preparation, 2-3 days FDP for faculty',
    followUpDate: '2024-11-19',
    followUpOwner: 'Pooja Ahire',
    outcome: 'Interested',
    attachments: ['PICT_visit_report.pdf', 'company_profile.pdf'],
    createdAt: '2024-11-05',
  },
  {
    id: 'VIS-002',
    collegeName: 'College of Engineering Pune',
    collegeId: 'CLG-002',
    location: 'Pune',
    address: 'Wellesley Rd, Shivajinagar, Pune - 411005',
    visitDate: '2024-11-08',
    tpoName: 'Prof. Ashok Deshpande',
    tpoContact: '+91-9823456702',
    tpoEmail: 'tpo@coep.ac.in',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    purpose: 'Discuss MoU for placement support and co-working space usage',
    discussionNotes: 'Prof. Deshpande requested detailed proposal for MoU. Interested in co-working day passes for students doing project work. Tie-up discussion initiated.',
    requirements: 'Co-working day passes for students, seminar sessions on emerging tech',
    followUpDate: '2024-11-22',
    followUpOwner: 'Anchal Agawane',
    outcome: 'Tie-up in Discussion',
    attachments: ['COEP_visit_notes.pdf'],
    createdAt: '2024-11-08',
  },
  {
    id: 'VIS-003',
    collegeName: 'Symbiosis Institute of Technology',
    collegeId: 'CLG-003',
    location: 'Pune',
    address: 'Gram: Lavale, Tal: Mulshi, Pune - 412115',
    visitDate: '2024-11-12',
    tpoName: 'Ms. Priyanka Joshi',
    tpoContact: '+91-9823456703',
    tpoEmail: 'tpo@sitpune.edu.in',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    purpose: 'FDP proposal discussion and industry collaboration for final year projects',
    discussionNotes: 'Ms. Joshi confirmed interest in Faculty Development Program on AI & ML. Requested proposal document with schedule and pricing. Mentioned budget cycle starts December.',
    requirements: 'FDP on AI/ML (3 days), cloud computing workshops for students',
    followUpDate: '2024-11-26',
    followUpOwner: 'Rutuja Botre',
    outcome: 'Proposal Requested',
    attachments: ['SIT_requirements.pdf'],
    createdAt: '2024-11-12',
  },
  {
    id: 'VIS-004',
    collegeName: 'MIT College of Engineering',
    collegeId: 'CLG-004',
    location: 'Pune',
    address: 'Survey No. 124, Paud Rd, Kothrud, Pune - 411038',
    visitDate: '2024-11-15',
    tpoName: 'Mr. Rajesh Kulkarni',
    tpoContact: '+91-9823456704',
    tpoEmail: 'tpo@mitcoe.edu.in',
    assignedEmployee: 'Shubham Jadhav',
    assignedEmployeeId: 'AWF-EMP-004',
    purpose: 'Explore tie-up opportunities for internship and training programs',
    discussionNotes: 'Positive discussion. Mr. Kulkarni expressed interest in long-term tie-up. Wants to include AWFIS HUB as preferred training partner. Dean also joined briefly and approved in-principle.',
    requirements: 'Internship facilitation, placement-linked training, lab infrastructure access',
    followUpDate: '2024-11-29',
    followUpOwner: 'Shubham Jadhav',
    outcome: 'Meeting Scheduled',
    attachments: ['MITCOE_visit_minutes.pdf', 'presentation_deck.pdf'],
    createdAt: '2024-11-15',
  },
  {
    id: 'VIS-005',
    collegeName: 'Indira College of Engineering and Management',
    collegeId: 'CLG-005',
    location: 'Pune',
    address: 'Parandwadi, Pune-Nashik Highway, Pune - 410506',
    visitDate: '2024-11-18',
    tpoName: 'Mrs. Sneha Thorat',
    tpoContact: '+91-9823456705',
    tpoEmail: 'tpo@indiraengg.com',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    purpose: 'Cold visit to introduce AWFIS HUB services',
    discussionNotes: 'Mrs. Thorat was busy but spared 20 minutes. College currently tied up with another training partner. Asked to visit again after January.',
    requirements: 'No immediate requirement stated',
    followUpDate: '2025-01-10',
    followUpOwner: 'Pooja Ahire',
    outcome: 'Follow-up Required',
    attachments: [],
    createdAt: '2024-11-18',
  },
  {
    id: 'VIS-006',
    collegeName: 'DY Patil College of Engineering',
    collegeId: 'CLG-007',
    location: 'Pune',
    address: 'Survey No. 124, Akurdi, Pune - 411044',
    visitDate: '2024-11-20',
    tpoName: 'Mr. Sandesh More',
    tpoContact: '+91-9823456707',
    tpoEmail: 'tpo@dypatilpune.ac.in',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    purpose: 'Follow-up visit after initial email contact. Discuss training partnership.',
    discussionNotes: 'Mr. More is enthusiastic about the tie-up. Shortlisted AWFIS HUB for Data Analytics and Full Stack web development training. Requested MoU draft.',
    requirements: 'Full-stack web dev training (batch of 60), data analytics workshop',
    followUpDate: '2024-12-04',
    followUpOwner: 'Anchal Agawane',
    outcome: 'Tie-up in Discussion',
    attachments: ['DYPCOE_requirements.pdf'],
    createdAt: '2024-11-20',
  },
  {
    id: 'VIS-007',
    collegeName: 'Vishwakarma Institute of Technology',
    collegeId: 'CLG-008',
    location: 'Pune',
    address: '666, Upper Indiranagar, Bibwewadi, Pune - 411037',
    visitDate: '2024-11-22',
    tpoName: 'Dr. Deepak Bhoir',
    tpoContact: '+91-9823456708',
    tpoEmail: 'tpo@vit.edu',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    purpose: 'Proposal submission for FDP and student bootcamp',
    discussionNotes: 'Dr. Bhoir reviewed the proposal. The committee is meeting on Nov 30th to approve. Very positive signals. Might convert to agreement by December.',
    requirements: 'FDP (2 days), Bootcamp for 100 students in Data Science',
    followUpDate: '2024-12-02',
    followUpOwner: 'Rutuja Botre',
    outcome: 'Meeting Scheduled',
    attachments: ['VIT_proposal_v2.pdf'],
    createdAt: '2024-11-22',
  },
  {
    id: 'VIS-008',
    collegeName: 'Bharati Vidyapeeth College of Engineering',
    collegeId: 'CLG-009',
    location: 'Pune',
    address: 'Dhankawadi, Pune-Satara Rd, Pune - 411043',
    visitDate: '2024-11-25',
    tpoName: 'Mrs. Lata Shinde',
    tpoContact: '+91-9823456709',
    tpoEmail: 'tpo@bvcoepune.edu.in',
    assignedEmployee: 'Shubham Jadhav',
    assignedEmployeeId: 'AWF-EMP-004',
    purpose: 'Initial meeting - introduction and service showcase',
    discussionNotes: 'Mrs. Shinde was not interested at the moment. College has in-house placement cell that handles all training. Politely declined.',
    requirements: 'None',
    followUpDate: '2025-03-01',
    followUpOwner: 'Shubham Jadhav',
    outcome: 'Not Interested',
    attachments: [],
    createdAt: '2024-11-25',
  },
  {
    id: 'VIS-009',
    collegeName: 'Zeal College of Engineering and Research',
    collegeId: 'CLG-010',
    location: 'Pune',
    address: 'Narhe, Pune - 411041',
    visitDate: '2024-11-26',
    tpoName: 'Mr. Vikas Jadhav',
    tpoContact: '+91-9823456710',
    tpoEmail: 'tpo@zealpune.com',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    purpose: 'Discuss placement training partnership for 2025 batch',
    discussionNotes: 'Productive visit. Mr. Jadhav keen on aptitude + soft skills training package. Requested demo session for a batch of 30 students before final decision.',
    requirements: 'Aptitude training, soft skills, mock interviews',
    followUpDate: '2024-12-10',
    followUpOwner: 'Pooja Ahire',
    outcome: 'Proposal Requested',
    attachments: ['Zeal_visit_notes.pdf'],
    createdAt: '2024-11-26',
  },
  {
    id: 'VIS-010',
    collegeName: 'Sinhgad College of Engineering',
    collegeId: 'CLG-011',
    location: 'Pune',
    address: '44/1, Vadgaon (BK), Off. Sinhgad Rd, Pune - 411041',
    visitDate: '2024-11-27',
    tpoName: 'Mr. Amol Pawar',
    tpoContact: '+91-9823456711',
    tpoEmail: 'tpo@sinhgad.edu',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    purpose: 'Relationship building visit + pitch for college tie-up',
    discussionNotes: 'Tie-up completed successfully! MoU signed today. Mr. Pawar confirmed batch of 200 students for training in Q1 2025. Great outcome.',
    requirements: 'Full placement training cycle, 5-day bootcamp, mock interviews',
    followUpDate: '2024-12-15',
    followUpOwner: 'Anchal Agawane',
    outcome: 'Tie-up Completed',
    attachments: ['Sinhgad_MoU_signed.pdf', 'training_schedule.pdf'],
    createdAt: '2024-11-27',
  },
  {
    id: 'VIS-011',
    collegeName: 'Savitribai Phule Pune University - MBA Department',
    collegeId: 'CLG-006',
    location: 'Pune',
    address: 'Ganeshkhind Rd, Pune - 411007',
    visitDate: '2024-11-28',
    tpoName: 'Dr. Meena Waghmare',
    tpoContact: '+91-9823456706',
    tpoEmail: 'mba.tpo@unipune.ac.in',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    purpose: 'Industry collaboration for MBA students - live projects and internships',
    discussionNotes: 'Dr. Waghmare discussed live project facilitation for MBA batch. AWFIS HUB to provide startup mentorship for 50 students. MoU discussion started.',
    requirements: 'Industry mentorship, live projects, co-working access for students',
    followUpDate: '2024-12-12',
    followUpOwner: 'Rutuja Botre',
    outcome: 'Tie-up in Discussion',
    attachments: ['SPPU_MBA_discussion.pdf'],
    createdAt: '2024-11-28',
  },
];

// ─── FDP Sessions ────────────────────────────────────────────────────────────

export const mockFDPSessions: FDPSession[] = [
  {
    id: 'FDP-001',
    collegeName: 'Symbiosis Institute of Technology',
    collegeId: 'CLG-003',
    sessionTitle: 'AI & Machine Learning for Engineering Faculty',
    sessionType: 'Faculty Development Program',
    proposedDate: '2024-12-15',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    tpoContact: 'Ms. Priyanka Joshi - +91-9823456703',
    facultyDetails: '25 faculty members from CS and IT department',
    proposedOffering: '3-day intensive FDP covering ML fundamentals, Python for AI, hands-on with scikit-learn and TensorFlow basics',
    expectedParticipants: 25,
    meetingDetails: 'Meeting with academic committee on Dec 1, 2024 at 11:00 AM',
    discussionNotes: 'FDP proposed for mid-December. College has allocated budget of ₹1.2L. Certificate to be issued jointly.',
    followUpDate: '2024-12-01',
    proposalDoc: 'SIT_FDP_Proposal_AIml.pdf',
    supportingDocs: ['FDP_brochure.pdf', 'trainer_profiles.pdf'],
    status: 'Proposal Sent',
    createdAt: '2024-11-13',
  },
  {
    id: 'FDP-002',
    collegeName: 'Vishwakarma Institute of Technology',
    collegeId: 'CLG-008',
    sessionTitle: 'Full Stack Web Development - Industry Practices',
    sessionType: 'Faculty Development Program',
    proposedDate: '2024-12-20',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    tpoContact: 'Dr. Deepak Bhoir - +91-9823456708',
    facultyDetails: '20 faculty members from CS, IT and E&TC departments',
    proposedOffering: '2-day FDP on React.js, Node.js, MongoDB, REST APIs with real project walkthrough',
    expectedParticipants: 20,
    meetingDetails: 'Committee review scheduled Dec 2nd',
    discussionNotes: 'Positive response from VIT faculty. Session date to be confirmed post committee approval on Dec 2.',
    followUpDate: '2024-12-02',
    proposalDoc: 'VIT_FDP_FullStack.pdf',
    supportingDocs: ['VIT_requirements.pdf'],
    status: 'Meeting Scheduled',
    createdAt: '2024-11-22',
  },
  {
    id: 'FDP-003',
    collegeName: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    sessionTitle: 'Cloud Computing and DevOps for Educators',
    sessionType: 'Faculty Development Program',
    proposedDate: '2025-01-10',
    actualDate: '2025-01-10',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    tpoContact: 'Dr. Suhas Patil - +91-9823456701',
    facultyDetails: '30 faculty members from CS and IT',
    proposedOffering: '3-day FDP on AWS fundamentals, Docker, Kubernetes, CI/CD pipelines',
    expectedParticipants: 30,
    meetingDetails: 'Program finalized and confirmed for January 10-12, 2025',
    discussionNotes: 'Program approved and scheduled. PICT has shared lab access credentials. Participants pre-registered.',
    followUpDate: '2025-01-05',
    proposalDoc: 'PICT_FDP_Cloud_Approved.pdf',
    supportingDocs: ['lab_setup_guide.pdf', 'participant_list.pdf'],
    status: 'Approved',
    createdAt: '2024-11-06',
  },
  {
    id: 'FDP-004',
    collegeName: 'College of Engineering Pune',
    collegeId: 'CLG-002',
    sessionTitle: 'Data Analytics and Business Intelligence',
    sessionType: 'Faculty Development Program',
    proposedDate: '2025-01-20',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    tpoContact: 'Prof. Ashok Deshpande - +91-9823456702',
    facultyDetails: '18 faculty from CS, IT and Management departments',
    proposedOffering: '2-day FDP covering Power BI, Tableau, SQL analytics, case studies',
    expectedParticipants: 18,
    meetingDetails: 'Proposal under internal review by COEP academic committee',
    discussionNotes: 'COEP is evaluating the proposal. Budget approval pending. Expected decision by Dec 15.',
    followUpDate: '2024-12-15',
    proposalDoc: 'COEP_FDP_DataAnalytics.pdf',
    supportingDocs: [],
    status: 'Proposal Prepared',
    createdAt: '2024-11-09',
  },
  {
    id: 'FDP-005',
    collegeName: 'MIT College of Engineering',
    collegeId: 'CLG-004',
    sessionTitle: 'Cybersecurity Fundamentals for Engineering Faculty',
    sessionType: 'Faculty Development Program',
    proposedDate: '2025-02-05',
    assignedEmployee: 'Shubham Jadhav',
    assignedEmployeeId: 'AWF-EMP-004',
    tpoContact: 'Mr. Rajesh Kulkarni - +91-9823456704',
    facultyDetails: '22 faculty from CS, IT, E&TC departments',
    proposedOffering: '2-day FDP on network security, ethical hacking basics, threat analysis, security tools',
    expectedParticipants: 22,
    meetingDetails: 'Follow-up meeting scheduled Nov 29 with Dean and TPO',
    discussionNotes: 'Included as part of broader tie-up discussion. MIT keen on cybersecurity being first FDP.',
    followUpDate: '2024-11-29',
    proposalDoc: undefined,
    supportingDocs: [],
    status: 'Not Started',
    createdAt: '2024-11-16',
  },
  {
    id: 'FDP-006',
    collegeName: 'DY Patil College of Engineering',
    collegeId: 'CLG-007',
    sessionTitle: 'IoT and Embedded Systems Workshop',
    sessionType: 'Faculty Development Program',
    proposedDate: '2024-12-28',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    tpoContact: 'Mr. Sandesh More - +91-9823456707',
    facultyDetails: '15 faculty from E&TC and mechanical departments',
    proposedOffering: '1-day hands-on workshop on IoT with Arduino, Raspberry Pi, sensor integration',
    expectedParticipants: 15,
    meetingDetails: 'Negotiation on pricing – college wants ₹8K per participant, AWFIS quoted ₹12K',
    discussionNotes: 'Price negotiation ongoing. College budget is tight. Exploring co-branding to reduce cost.',
    followUpDate: '2024-12-05',
    proposalDoc: 'DYPCOE_FDP_IoT.pdf',
    supportingDocs: ['cost_breakdown.pdf'],
    status: 'Negotiation',
    createdAt: '2024-11-21',
  },
  {
    id: 'FDP-007',
    collegeName: 'Sinhgad College of Engineering',
    collegeId: 'CLG-011',
    sessionTitle: 'Agile and Project Management for Engineers',
    sessionType: 'Faculty Development Program',
    proposedDate: '2025-01-25',
    actualDate: undefined,
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    tpoContact: 'Mr. Amol Pawar - +91-9823456711',
    facultyDetails: '35 faculty members across all departments',
    proposedOffering: '2-day FDP on Agile methodology, Scrum, Jira, project management tools',
    expectedParticipants: 35,
    meetingDetails: 'Part of the signed MoU deliverables for Q1 2025',
    discussionNotes: 'FDP approved as part of Sinhgad tie-up. Schedule to be coordinated with admin.',
    followUpDate: '2024-12-20',
    proposalDoc: 'Sinhgad_FDP_Agile.pdf',
    supportingDocs: ['Sinhgad_MoU_signed.pdf'],
    status: 'Approved',
    createdAt: '2024-11-27',
  },
  {
    id: 'FDP-008',
    collegeName: 'Zeal College of Engineering and Research',
    collegeId: 'CLG-010',
    sessionTitle: 'Communication Skills and Professional Development',
    sessionType: 'Soft Skills Faculty Development',
    proposedDate: '2025-02-15',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    tpoContact: 'Mr. Vikas Jadhav - +91-9823456710',
    facultyDetails: '20 faculty members',
    proposedOffering: '1-day program on effective communication, presentation skills, industry interaction',
    expectedParticipants: 20,
    meetingDetails: 'Demo session scheduled Dec 10 for 30 students as pilot',
    discussionNotes: 'Linked to the demo session outcome. If demo goes well, full FDP for faculty to follow.',
    followUpDate: '2024-12-10',
    proposalDoc: undefined,
    supportingDocs: [],
    status: 'Discussion Ongoing',
    createdAt: '2024-11-26',
  },
];

// ─── Tie-ups ─────────────────────────────────────────────────────────────────

export const mockTieups: Tieup[] = [
  {
    id: 'TIE-001',
    collegeName: 'Sinhgad College of Engineering',
    collegeId: 'CLG-011',
    location: 'Pune',
    tpoContact: 'Mr. Amol Pawar - +91-9823456711',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    partnershipType: 'Full Placement Training Partner',
    initialDiscussionDate: '2024-10-15',
    tieupInitiationDate: '2024-11-01',
    agreementSigningDate: '2024-11-27',
    validityStartDate: '2024-12-01',
    expiryDate: '2025-11-30',
    status: 'Active',
    scopeOfCollaboration: 'Exclusive placement training partner for 2024-25 batch. Covers aptitude, soft skills, technical training, mock interviews, and FDP for faculty.',
    notes: 'MoU signed. Training to begin in December for 200+ students. Joint certificate to be issued.',
    nextFollowUpDate: '2024-12-15',
    createdAt: '2024-10-15',
  },
  {
    id: 'TIE-002',
    collegeName: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    location: 'Pune',
    tpoContact: 'Dr. Suhas Patil - +91-9823456701',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    partnershipType: 'Training and FDP Partner',
    initialDiscussionDate: '2024-11-05',
    tieupInitiationDate: '2024-11-20',
    agreementSigningDate: undefined,
    validityStartDate: undefined,
    expiryDate: undefined,
    status: 'Agreement Pending',
    scopeOfCollaboration: 'Cloud Computing and AI/ML training for students + FDP for faculty quarterly',
    notes: 'MoU draft shared. Under legal review at PICT side. Signing expected by Dec 10.',
    nextFollowUpDate: '2024-12-10',
    createdAt: '2024-11-05',
  },
  {
    id: 'TIE-003',
    collegeName: 'College of Engineering Pune',
    collegeId: 'CLG-002',
    location: 'Pune',
    tpoContact: 'Prof. Ashok Deshpande - +91-9823456702',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    partnershipType: 'Co-working and Knowledge Partner',
    initialDiscussionDate: '2024-11-08',
    tieupInitiationDate: '2024-11-22',
    agreementSigningDate: undefined,
    validityStartDate: undefined,
    expiryDate: undefined,
    status: 'Under Negotiation',
    scopeOfCollaboration: 'Co-working day passes for students doing final year projects, seminar speakers from AWFIS HUB network, joint workshops',
    notes: 'Price negotiation ongoing. COEP committee review on Nov 30.',
    nextFollowUpDate: '2024-11-30',
    createdAt: '2024-11-08',
  },
  {
    id: 'TIE-004',
    collegeName: 'MIT College of Engineering',
    collegeId: 'CLG-004',
    location: 'Pune',
    tpoContact: 'Mr. Rajesh Kulkarni - +91-9823456704',
    assignedEmployee: 'Shubham Jadhav',
    assignedEmployeeId: 'AWF-EMP-004',
    partnershipType: 'Preferred Training and Internship Partner',
    initialDiscussionDate: '2024-11-15',
    tieupInitiationDate: undefined,
    agreementSigningDate: undefined,
    validityStartDate: undefined,
    expiryDate: undefined,
    status: 'Proposal Shared',
    scopeOfCollaboration: 'Training programs, internship facilitation, FDP, hackathon support',
    notes: 'Dean approved in-principle. Formal proposal shared. Meeting on Nov 29 with committee.',
    nextFollowUpDate: '2024-11-29',
    createdAt: '2024-11-15',
  },
  {
    id: 'TIE-005',
    collegeName: 'DY Patil College of Engineering',
    collegeId: 'CLG-007',
    location: 'Pune',
    tpoContact: 'Mr. Sandesh More - +91-9823456707',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    partnershipType: 'Training Partner',
    initialDiscussionDate: '2024-11-20',
    tieupInitiationDate: '2024-11-25',
    agreementSigningDate: undefined,
    validityStartDate: undefined,
    expiryDate: undefined,
    status: 'Interested',
    scopeOfCollaboration: 'Full-stack training, data analytics workshop, IoT FDP',
    notes: 'College very interested. Waiting for MoU draft review by their legal team.',
    nextFollowUpDate: '2024-12-04',
    createdAt: '2024-11-20',
  },
  {
    id: 'TIE-006',
    collegeName: 'Savitribai Phule Pune University - MBA Department',
    collegeId: 'CLG-006',
    location: 'Pune',
    tpoContact: 'Dr. Meena Waghmare - +91-9823456706',
    assignedEmployee: 'Rutuja Botre',
    assignedEmployeeId: 'AWF-EMP-003',
    partnershipType: 'Industry Collaboration and Mentorship Partner',
    initialDiscussionDate: '2024-11-28',
    tieupInitiationDate: undefined,
    agreementSigningDate: undefined,
    validityStartDate: undefined,
    expiryDate: undefined,
    status: 'Initial Discussion',
    scopeOfCollaboration: 'Industry mentorship for MBA students, live projects, co-working access, speaker series',
    notes: 'First meeting held. Dr. Waghmare to present to academic council in December.',
    nextFollowUpDate: '2024-12-12',
    createdAt: '2024-11-28',
  },
];

// ─── Interested Clients ──────────────────────────────────────────────────────

export const mockInterestedClients: InterestedClient[] = [
  {
    id: 'CLI-001',
    clientName: 'TechNova Solutions Pvt Ltd',
    orgType: 'IT Company',
    location: 'Hinjewadi, Pune',
    contactPerson: 'Mr. Amit Sharma',
    phone: '+91-9876543201',
    email: 'amit.sharma@technovasolutions.in',
    interestedServices: ['Co-working Space', 'Private Cabin', 'Meeting Room'],
    requirementDetails: 'Looking for 15-seater private cabin on monthly basis. Team is a product startup that recently got seed funding.',
    leadSource: 'Website Inquiry',
    assignedSalesperson: 'Pooja Ahire',
    assignedSalespersonId: 'AWF-EMP-001',
    dateAdded: '2024-11-10',
    estimatedOpportunity: 180000,
    stage: 'Proposal Sent',
    nextFollowUpDate: '2024-12-02',
    interactions: [
      { id: 'INT-001a', date: '2024-11-10', type: 'Call', summary: 'Initial inquiry call. Understood requirements. 15-seater private cabin needed.', by: 'Pooja Ahire' },
      { id: 'INT-001b', date: '2024-11-14', type: 'Visit', summary: 'Site visit arranged. Client toured cabin and co-working area. Very impressed.', by: 'Pooja Ahire' },
      { id: 'INT-001c', date: '2024-11-18', type: 'Proposal', summary: 'Sent pricing proposal for 12-month contract. ₹1.5L/month for dedicated cabin.', by: 'Pooja Ahire' },
    ],
    notes: 'High-potential lead. Startup with 15 employees. Likely to convert. Decision by Dec 5.',
  },
  {
    id: 'CLI-002',
    clientName: 'Greenfield Edutech Pvt Ltd',
    orgType: 'EdTech Startup',
    location: 'Baner, Pune',
    contactPerson: 'Ms. Kavya Reddy',
    phone: '+91-9876543202',
    email: 'kavya@greenfieldedulab.com',
    interestedServices: ['Training Room', 'Co-working Space', 'Virtual Office'],
    requirementDetails: 'EdTech company looking for training room on ad-hoc basis and co-working desks for 5 employees.',
    leadSource: 'Referral - Sinhgad College',
    assignedSalesperson: 'Shubham Jadhav',
    assignedSalespersonId: 'AWF-EMP-004',
    dateAdded: '2024-11-12',
    estimatedOpportunity: 75000,
    stage: 'Meeting Scheduled',
    nextFollowUpDate: '2024-11-30',
    interactions: [
      { id: 'INT-002a', date: '2024-11-12', type: 'Email', summary: 'Introductory email sent with brochure.', by: 'Shubham Jadhav' },
      { id: 'INT-002b', date: '2024-11-20', type: 'Call', summary: 'Follow-up call. Meeting scheduled for Nov 30 for site visit.', by: 'Shubham Jadhav' },
    ],
    notes: 'Warm lead from college referral. Smaller budget but recurring potential.',
  },
  {
    id: 'CLI-003',
    clientName: 'Infosys BPM Ltd (Training Division)',
    orgType: 'Large Enterprise',
    location: 'Magarpatta, Pune',
    contactPerson: 'Mr. Rahul Verma',
    phone: '+91-9876543203',
    email: 'rahul.verma@infosysbpm.com',
    interestedServices: ['Large Training Hall', 'AV Setup', 'Catering'],
    requirementDetails: 'Looking for large training hall (100+ capacity) for quarterly employee training programs.',
    leadSource: 'Cold Outreach',
    assignedSalesperson: 'Anchal Agawane',
    assignedSalespersonId: 'AWF-EMP-002',
    dateAdded: '2024-11-15',
    estimatedOpportunity: 400000,
    stage: 'Negotiation',
    nextFollowUpDate: '2024-12-05',
    interactions: [
      { id: 'INT-003a', date: '2024-11-15', type: 'Email', summary: 'Cold email sent with capability deck.', by: 'Anchal Agawane' },
      { id: 'INT-003b', date: '2024-11-19', type: 'Call', summary: 'Call with HR training manager. Requirement confirmed for Q1 2025.', by: 'Anchal Agawane' },
      { id: 'INT-003c', date: '2024-11-25', type: 'Meeting', summary: 'On-site meeting at Infosys. Presented venue options. Negotiating bulk pricing.', by: 'Anchal Agawane' },
    ],
    notes: 'High-value enterprise account. Negotiation on 10% discount for annual contract.',
  },
  {
    id: 'CLI-004',
    clientName: 'PuneConnect Coworking (Franchise)',
    orgType: 'Franchise Partner Prospect',
    location: 'Wakad, Pune',
    contactPerson: 'Mr. Deepak Joshi',
    phone: '+91-9876543204',
    email: 'deepak@puneconnect.in',
    interestedServices: ['Franchise Partnership', 'Brand License'],
    requirementDetails: 'Interested in franchise model for AWFIS HUB. Owns 4000 sq ft commercial space in Wakad.',
    leadSource: 'LinkedIn',
    assignedSalesperson: 'Rutuja Botre',
    assignedSalespersonId: 'AWF-EMP-003',
    dateAdded: '2024-11-18',
    estimatedOpportunity: 1200000,
    stage: 'Interested',
    nextFollowUpDate: '2024-12-08',
    interactions: [
      { id: 'INT-004a', date: '2024-11-18', type: 'Call', summary: 'LinkedIn connection led to call. Franchise model discussed at high level.', by: 'Rutuja Botre' },
      { id: 'INT-004b', date: '2024-11-24', type: 'Meeting', summary: 'Detailed meeting on franchise terms, revenue sharing, brand guidelines.', by: 'Rutuja Botre' },
    ],
    notes: 'High potential franchise lead. Due diligence ongoing. Formal franchise docs to be shared.',
  },
  {
    id: 'CLI-005',
    clientName: 'SkillBridge Academy',
    orgType: 'Training Institute',
    location: 'Viman Nagar, Pune',
    contactPerson: 'Ms. Nisha Kulkarni',
    phone: '+91-9876543205',
    email: 'nisha@skillbridge.in',
    interestedServices: ['Classroom Rental', 'Co-working Desks'],
    requirementDetails: 'Training institute looking for 30-seat classroom 3 days/week and 5 co-working desks.',
    leadSource: 'Google Ads',
    assignedSalesperson: 'Pooja Ahire',
    assignedSalespersonId: 'AWF-EMP-001',
    dateAdded: '2024-11-20',
    estimatedOpportunity: 95000,
    stage: 'Contacted',
    nextFollowUpDate: '2024-11-30',
    interactions: [
      { id: 'INT-005a', date: '2024-11-20', type: 'Call', summary: 'Inquiry call. Requirement noted. Site visit to be scheduled.', by: 'Pooja Ahire' },
    ],
    notes: 'Good recurring potential if classroom availability matches schedule.',
  },
  {
    id: 'CLI-006',
    clientName: 'Maharashtra Startup Hub (Govt Initiative)',
    orgType: 'Government',
    location: 'Shivajinagar, Pune',
    contactPerson: 'Mr. Prakash Desai',
    phone: '+91-9876543206',
    email: 'prakash.desai@msh.gov.in',
    interestedServices: ['Incubation Space', 'Mentorship Program', 'Event Space'],
    requirementDetails: 'Government startup initiative looking for incubation space for 20 startups + quarterly demo days.',
    leadSource: 'Government Tender',
    assignedSalesperson: 'Rutuja Botre',
    assignedSalespersonId: 'AWF-EMP-003',
    dateAdded: '2024-11-22',
    estimatedOpportunity: 2500000,
    stage: 'Proposal Sent',
    nextFollowUpDate: '2024-12-15',
    interactions: [
      { id: 'INT-006a', date: '2024-11-22', type: 'Meeting', summary: 'Government officials visited AWFIS HUB for preliminary survey.', by: 'Rutuja Botre' },
      { id: 'INT-006b', date: '2024-11-26', type: 'Proposal', summary: 'Formal proposal submitted with incubation space plan and pricing.', by: 'Rutuja Botre' },
    ],
    notes: 'High-value government contract. Long procurement cycle expected. Due Dec 31.',
  },
  {
    id: 'CLI-007',
    clientName: 'DigitalFirst Marketing Agency',
    orgType: 'Agency',
    location: 'Koregaon Park, Pune',
    contactPerson: 'Ms. Ananya Singh',
    phone: '+91-9876543207',
    email: 'ananya@digitalfirst.agency',
    interestedServices: ['Hot Desks', 'Meeting Rooms', 'Virtual Office'],
    requirementDetails: 'Digital marketing agency with 8 remote employees looking for flexible hot desk plan + meeting rooms.',
    leadSource: 'Walk-in',
    assignedSalesperson: 'Shubham Jadhav',
    assignedSalespersonId: 'AWF-EMP-004',
    dateAdded: '2024-11-24',
    estimatedOpportunity: 55000,
    stage: 'Won',
    nextFollowUpDate: '2024-12-24',
    interactions: [
      { id: 'INT-007a', date: '2024-11-24', type: 'Visit', summary: 'Walk-in visit. Toured the facility. Very happy with ambiance.', by: 'Shubham Jadhav' },
      { id: 'INT-007b', date: '2024-11-25', type: 'Call', summary: 'Follow-up call. Client confirmed they want to proceed with 8 hot desks + 10 meeting room hours/month.', by: 'Shubham Jadhav' },
      { id: 'INT-007c', date: '2024-11-26', type: 'Follow-up', summary: 'Agreement signed. First month payment received. Onboarded successfully.', by: 'Shubham Jadhav' },
    ],
    notes: 'Converted! Signed 6-month flexible plan. First client from walk-in this month.',
  },
  {
    id: 'CLI-008',
    clientName: 'Pune Robotics Club',
    orgType: 'Non-Profit',
    location: 'Aundh, Pune',
    contactPerson: 'Mr. Tejas Mane',
    phone: '+91-9876543208',
    email: 'tejas@puneroboticsclub.org',
    interestedServices: ['Maker Space', 'Workshop Hall', 'Event Space'],
    requirementDetails: 'Robotics club looking for maker space access on weekends and event hall for monthly meetups.',
    leadSource: 'Community Event',
    assignedSalesperson: 'Pooja Ahire',
    assignedSalespersonId: 'AWF-EMP-001',
    dateAdded: '2024-11-26',
    estimatedOpportunity: 30000,
    stage: 'New',
    nextFollowUpDate: '2024-12-03',
    interactions: [
      { id: 'INT-008a', date: '2024-11-26', type: 'Meeting', summary: 'Met at community tech event. Discussed weekend maker space availability.', by: 'Pooja Ahire' },
    ],
    notes: 'Lower revenue but good for community presence and brand visibility.',
  },
];

// ─── Agreements ──────────────────────────────────────────────────────────────

export const mockAgreements: Agreement[] = [
  {
    id: 'AGR-001',
    title: 'MoU - Sinhgad College of Engineering',
    collegeName: 'Sinhgad College of Engineering',
    collegeId: 'CLG-011',
    relatedTieupId: 'TIE-001',
    agreementType: 'MoU',
    referenceNumber: 'AWFIS/MOU/2024/001',
    signingDate: '2024-11-27',
    effectiveDate: '2024-12-01',
    expiryDate: '2025-11-30',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    authorizedSignatory: 'Mr. Amol Pawar (TPO) & Dr. Suresh Magar (Principal)',
    status: 'Active',
    uploadedDoc: 'Sinhgad_MoU_Signed_Nov2024.pdf',
    supportingDocs: ['Sinhgad_training_schedule.pdf', 'payment_terms.pdf'],
    description: 'Memorandum of Understanding for exclusive placement training partnership for academic year 2024-25.',
    notes: 'First MoU signed this quarter. Covers 200+ students. Training to begin December 2024.',
    history: [
      { date: '2024-11-01', action: 'Draft prepared', by: 'Anchal Agawane' },
      { date: '2024-11-15', action: 'Draft shared with college', by: 'Anchal Agawane' },
      { date: '2024-11-22', action: 'Revisions received from college', by: 'Mr. Amol Pawar' },
      { date: '2024-11-25', action: 'Final draft approved', by: 'Anchal Agawane' },
      { date: '2024-11-27', action: 'Agreement signed', by: 'Mr. Amol Pawar & Dr. Suresh Magar' },
    ],
    createdAt: '2024-11-01',
  },
  {
    id: 'AGR-002',
    title: 'FDP Agreement - PICT Cloud Computing',
    collegeName: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    relatedTieupId: undefined,
    agreementType: 'FDP Agreement',
    referenceNumber: 'AWFIS/FDP/2024/001',
    signingDate: '2024-11-20',
    effectiveDate: '2025-01-10',
    expiryDate: '2025-01-12',
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    authorizedSignatory: 'Dr. Suhas Patil (TPO)',
    status: 'Signed',
    uploadedDoc: 'PICT_FDP_Agreement_Cloud.pdf',
    supportingDocs: ['PICT_FDP_Cloud_Approved.pdf'],
    description: 'FDP Agreement for 3-day Cloud Computing and DevOps program for 30 faculty members in January 2025.',
    notes: 'Signed and confirmed. Lab setup to be arranged by Jan 5.',
    history: [
      { date: '2024-11-10', action: 'FDP proposal submitted', by: 'Pooja Ahire' },
      { date: '2024-11-15', action: 'Proposal approved by academic committee', by: 'Dr. Suhas Patil' },
      { date: '2024-11-20', action: 'Agreement signed', by: 'Dr. Suhas Patil' },
    ],
    createdAt: '2024-11-10',
  },
  {
    id: 'AGR-003',
    title: 'FDP Agreement - Sinhgad Agile Program',
    collegeName: 'Sinhgad College of Engineering',
    collegeId: 'CLG-011',
    relatedTieupId: 'TIE-001',
    agreementType: 'FDP Agreement',
    referenceNumber: 'AWFIS/FDP/2024/002',
    signingDate: '2024-11-27',
    effectiveDate: '2025-01-25',
    expiryDate: '2025-01-26',
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    authorizedSignatory: 'Mr. Amol Pawar (TPO)',
    status: 'Active',
    uploadedDoc: 'Sinhgad_FDP_Agile_Agreement.pdf',
    supportingDocs: ['Sinhgad_MoU_Signed_Nov2024.pdf'],
    description: 'FDP Agreement for 2-day Agile and Project Management program for 35 Sinhgad faculty. Part of MoU deliverables.',
    notes: 'Covered under MoU. No separate fees. Part of partnership commitment.',
    history: [
      { date: '2024-11-27', action: 'Agreement signed as part of MoU', by: 'Anchal Agawane' },
    ],
    createdAt: '2024-11-27',
  },
  {
    id: 'AGR-004',
    title: 'Training Agreement - Full Stack Dev - DY Patil',
    collegeName: 'DY Patil College of Engineering',
    collegeId: 'CLG-007',
    relatedTieupId: 'TIE-005',
    agreementType: 'Training Agreement',
    referenceNumber: 'AWFIS/TRN/2024/001',
    signingDate: undefined,
    effectiveDate: undefined,
    expiryDate: undefined,
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    authorizedSignatory: 'Mr. Sandesh More (TPO)',
    status: 'Under Review',
    uploadedDoc: undefined,
    supportingDocs: ['DYPCOE_requirements.pdf'],
    description: 'Training agreement for Full Stack Web Development program for a batch of 60 students at DY Patil.',
    notes: 'Under legal review by DY Patil. Expected to be signed by Dec 15.',
    history: [
      { date: '2024-11-21', action: 'Draft agreement prepared', by: 'Anchal Agawane' },
      { date: '2024-11-24', action: 'Draft shared for review', by: 'Anchal Agawane' },
    ],
    createdAt: '2024-11-21',
  },
  {
    id: 'AGR-005',
    title: 'MoU Draft - College of Engineering Pune',
    collegeName: 'College of Engineering Pune',
    collegeId: 'CLG-002',
    relatedTieupId: 'TIE-003',
    agreementType: 'MoU',
    referenceNumber: 'AWFIS/MOU/2024/002',
    signingDate: undefined,
    effectiveDate: undefined,
    expiryDate: undefined,
    assignedEmployee: 'Anchal Agawane',
    assignedEmployeeId: 'AWF-EMP-002',
    authorizedSignatory: 'Prof. Ashok Deshpande (TPO)',
    status: 'Draft',
    uploadedDoc: undefined,
    supportingDocs: ['COEP_requirements_doc.pdf'],
    description: 'Draft MoU for co-working and knowledge partnership with College of Engineering Pune.',
    notes: 'Draft in preparation. Awaiting committee review outcome on Nov 30 before finalizing.',
    history: [
      { date: '2024-11-22', action: 'Draft preparation started', by: 'Anchal Agawane' },
    ],
    createdAt: '2024-11-22',
  },
  {
    id: 'AGR-006',
    title: 'Partnership Agreement - PICT Training Tie-up',
    collegeName: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    relatedTieupId: 'TIE-002',
    agreementType: 'Partnership Agreement',
    referenceNumber: 'AWFIS/PART/2024/001',
    signingDate: undefined,
    effectiveDate: undefined,
    expiryDate: undefined,
    assignedEmployee: 'Pooja Ahire',
    assignedEmployeeId: 'AWF-EMP-001',
    authorizedSignatory: 'Dr. Bharat Tidke (Principal) & Dr. Suhas Patil (TPO)',
    status: 'Pending Signature',
    uploadedDoc: 'PICT_Partnership_Agreement_Draft_v2.pdf',
    supportingDocs: [],
    description: 'Long-term partnership agreement for AWFIS HUB to be official Training and FDP partner for PICT.',
    notes: 'Final draft sent. Waiting for principal signature. Expected Dec 10.',
    history: [
      { date: '2024-11-10', action: 'Initial discussion started', by: 'Pooja Ahire' },
      { date: '2024-11-20', action: 'Draft v1 shared', by: 'Pooja Ahire' },
      { date: '2024-11-28', action: 'Revised draft v2 sent for signature', by: 'Pooja Ahire' },
    ],
    createdAt: '2024-11-10',
  },
];

// ─── Follow-ups ──────────────────────────────────────────────────────────────

export const mockSalesFollowUps: FollowUp[] = [
  {
    id: 'FUP-001',
    title: 'Follow up on PICT Partnership Agreement signature',
    relatedCollege: 'Pune Institute of Computer Technology',
    collegeId: 'CLG-001',
    relatedActivity: 'AGR-006',
    relatedActivityType: 'Agreement',
    assignedEmployee: 'Pooja Ahire',
    followUpDate: '2024-12-10',
    priority: 'High',
    notes: 'Principal needs to sign the partnership agreement. Email reminder sent. Call on Dec 10 if no response.',
    status: 'Pending',
  },
  {
    id: 'FUP-002',
    title: 'COEP committee review outcome follow-up',
    relatedCollege: 'College of Engineering Pune',
    collegeId: 'CLG-002',
    relatedActivity: 'TIE-003',
    relatedActivityType: 'Tieup',
    assignedEmployee: 'Anchal Agawane',
    followUpDate: '2024-11-30',
    priority: 'High',
    notes: 'Committee reviewing the tie-up proposal on Nov 30. Call Prof. Deshpande after the meeting for outcome.',
    status: 'Pending',
  },
  {
    id: 'FUP-003',
    title: 'MIT meeting follow-up with Dean and TPO',
    relatedCollege: 'MIT College of Engineering',
    collegeId: 'CLG-004',
    relatedActivity: 'TIE-004',
    relatedActivityType: 'Tieup',
    assignedEmployee: 'Shubham Jadhav',
    followUpDate: '2024-11-29',
    priority: 'High',
    notes: 'Joint meeting with Dean and TPO on Nov 29. Bring updated proposal and terms of partnership.',
    status: 'Pending',
  },
  {
    id: 'FUP-004',
    title: 'VIT committee approval follow-up for FDP',
    relatedCollege: 'Vishwakarma Institute of Technology',
    collegeId: 'CLG-008',
    relatedActivity: 'FDP-002',
    relatedActivityType: 'FDP',
    assignedEmployee: 'Rutuja Botre',
    followUpDate: '2024-12-02',
    priority: 'Medium',
    notes: 'VIT committee reviewing FDP and tie-up proposal on Dec 2. Follow up with Dr. Bhoir after meeting.',
    status: 'Pending',
  },
  {
    id: 'FUP-005',
    title: 'DY Patil FDP pricing negotiation resolution',
    relatedCollege: 'DY Patil College of Engineering',
    collegeId: 'CLG-007',
    relatedActivity: 'FDP-006',
    relatedActivityType: 'FDP',
    assignedEmployee: 'Anchal Agawane',
    followUpDate: '2024-12-05',
    priority: 'Medium',
    notes: 'Resolve the ₹8K vs ₹12K per participant negotiation. Consider co-branding discount model.',
    status: 'Pending',
  },
  {
    id: 'FUP-006',
    title: 'TechNova Solutions - proposal decision follow-up',
    relatedCollege: 'TechNova Solutions (Client)',
    collegeId: undefined,
    relatedActivity: 'CLI-001',
    relatedActivityType: 'Client',
    assignedEmployee: 'Pooja Ahire',
    followUpDate: '2024-12-02',
    priority: 'High',
    notes: 'Follow up on the ₹1.5L/month cabin proposal. Decision expected by Dec 5. High conversion probability.',
    status: 'Pending',
  },
  {
    id: 'FUP-007',
    title: 'Zeal College demo session preparation',
    relatedCollege: 'Zeal College of Engineering and Research',
    collegeId: 'CLG-010',
    relatedActivity: 'VIS-009',
    relatedActivityType: 'Visit',
    assignedEmployee: 'Pooja Ahire',
    followUpDate: '2024-12-10',
    priority: 'Medium',
    notes: 'Prepare demo session materials for aptitude + soft skills for 30 students. Confirm faculty from AWFIS HUB.',
    status: 'Pending',
  },
  {
    id: 'FUP-008',
    title: 'Indira College revisit after January',
    relatedCollege: 'Indira College of Engineering and Management',
    collegeId: 'CLG-005',
    relatedActivity: 'VIS-005',
    relatedActivityType: 'Visit',
    assignedEmployee: 'Pooja Ahire',
    followUpDate: '2025-01-10',
    priority: 'Low',
    notes: 'College asked to revisit after January. Set reminder and prepare updated offerings.',
    status: 'Pending',
  },
  {
    id: 'FUP-009',
    title: 'SPPU MBA department - academic council presentation',
    relatedCollege: 'Savitribai Phule Pune University - MBA Department',
    collegeId: 'CLG-006',
    relatedActivity: 'TIE-006',
    relatedActivityType: 'Tieup',
    assignedEmployee: 'Rutuja Botre',
    followUpDate: '2024-12-12',
    priority: 'Medium',
    notes: 'Dr. Waghmare to present our tie-up proposal to academic council in December. Follow up for outcome.',
    status: 'Pending',
  },
  {
    id: 'FUP-010',
    title: 'SIT FDP - confirm date post Dec budget cycle',
    relatedCollege: 'Symbiosis Institute of Technology',
    collegeId: 'CLG-003',
    relatedActivity: 'FDP-001',
    relatedActivityType: 'FDP',
    assignedEmployee: 'Rutuja Botre',
    followUpDate: '2024-12-01',
    priority: 'High',
    notes: 'SIT budget cycle starts December. Follow up on Dec 1 to confirm the AI/ML FDP date and payment.',
    status: 'Overdue',
  },
];
