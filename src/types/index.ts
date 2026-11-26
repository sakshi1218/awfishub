// ============================================================================
// AWFIS HUB — Enterprise Frontend Types (MindLyft)
// ============================================================================

export type RoleType =
  | 'CHAIRPERSON'
  | 'DIRECTOR'
  | 'OPERATION_HEAD'
  | 'TEAM_LEAD'
  | 'FACULTY'
  | 'STAFF'
  | 'INTERN';

export type DepartmentType =
  | 'Media'
  | 'Trainer'
  | 'Counselor'
  | 'TeleCaller'
  | 'Technical Team'
  | 'Sales Department'
  | 'Interns'
  | 'Operation Team';

export type EmploymentStatus = 'Active' | 'Notice Period' | 'Offboarded';
export type EmploymentType = 'Full-time' | 'Contract' | 'Part-time' | 'Internship';

export interface Employee {
  id: string;
  permanentId: string; // e.g., AWF-EMP-001, AWF-INT-001
  name: string;
  email: string;
  phone: string;
  designation: string;
  role: RoleType;
  department: DepartmentType;
  team: string;
  employmentType: EmploymentType;
  joiningDate: string;
  reportingManagerId: string | null;
  reportingManagerName: string;
  reportingDirectorId: string | null;
  roleSeatId: string;
  employmentStatus: EmploymentStatus;
  avatarInitials: string;
  avatarColor: string;
  bio: string;
  responsibilities: string[];
  skills: string[];
  activityHistory: { date: string; action: string }[];
  offboardingChecklist?: {
    assetsReturned: boolean;
    knowledgeHandoverDone: boolean;
    credentialsRevoked: boolean;
    exitInterviewCompleted: boolean;
    financialSettlementDone: boolean;
  };
}

export interface RoleSeat {
  id: string; // e.g. SEAT-DIR-SALES
  seatTitle: string;
  department: DepartmentType;
  currentEmployeeId: string | null;
  previousHolders: { employeeId: string; name: string; tenure: string }[];
  handoverStatus: 'Stable' | 'In Handover' | 'Vacant';
  handoverDetails?: {
    previousEmployee: string;
    replacementEmployee: string;
    pendingTasksCount: number;
    handoverDocs: string[];
    approvedHistoricalScope: string;
  };
}

export interface PermissionMatrixRow {
  module: string;
  rolePermissions: Record<
    RoleType,
    {
      view: boolean;
      create: boolean;
      edit: boolean;
      delete: boolean;
      approve: boolean;
      export: boolean;
      scope: 'Company' | 'Division' | 'Department' | 'Team' | 'Assigned Batches' | 'Personal' | 'None';
    }
  >;
}

// ============================================================================
// TASK MANAGEMENT ENGINE
// ============================================================================
export type TaskCategory =
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Custom Deadline'
  | 'Project-Based'
  | 'Campaign-Based';

export type TaskVisibility = 'Personal' | 'Team' | 'Collaborative';
export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type DirectorPriority = 'Priority 1' | 'Priority 2' | 'Priority 3';
export type TaskLifecycleStatus = 'Assigned' | 'In Progress' | 'Submitted' | 'Approved' | 'Returned';

export interface PriorityHistoryEntry {
  id: string;
  date: string;
  actorName: string;
  actorRole: string;
  action: string;
  previousPriority?: TaskPriority;
  newPriority?: TaskPriority;
  previousDirectorPriority?: DirectorPriority;
  newDirectorPriority?: DirectorPriority;
  note: string;
}

export interface TaskTransferHistory {
  id: string;
  originalAssignee: string;
  newAssignee: string;
  originalAssigner: string;
  transferInitiator: string;
  reason: string;
  transferDate: string;
  newReportingManager: string;
  acceptanceStatus: 'Accepted' | 'Pending' | 'Declined';
}

export interface TaskComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface TaskItem {
  id: string; // TSK-101
  title: string;
  description: string;
  assignedById: string;
  assignedByName: string;
  assigningDirectorId?: string;
  assigningDirectorName?: string;
  assignedToId: string;
  assignedToName: string;
  department: DepartmentType;
  team: string;
  project: string;
  category: TaskCategory;
  visibility: TaskVisibility;
  priority: TaskPriority;
  directorPriority: DirectorPriority;
  startDate: string;
  dueDate: string;
  expectedCompletionDate?: string;
  reasonForUrgency?: string;
  completionDate?: string;
  status: TaskLifecycleStatus;
  progressPct: number;
  highlighted?: boolean;
  isPrivate?: boolean;
  conflictEscalated?: boolean;
  employeeResponse?: {
    status: 'Pending' | 'Accepted' | 'Reschedule Requested' | 'Declined';
    reason?: string;
    respondedAt?: string;
  };
  attachments: string[];
  completionEvidence?: {
    workCompleted: string;
    notes: string;
    supportingDocs: string[];
    submittedAt: string;
    reviewStatus: 'Pending' | 'Approved' | 'Returned';
  };
  transferHistory: TaskTransferHistory[];
  priorityHistory: PriorityHistoryEntry[];
  comments: TaskComment[];
}

export interface FollowUpItem {
  id: string;
  date: string;
  ownerId: string;
  ownerName: string;
  department: DepartmentType;
  description: string;
  reminder: string;
  status: 'Scheduled' | 'Completed' | 'Escalated';
  escalationNote?: string;
  closureNotes?: string;
}

export interface DailyWorkReport {
  id: string;
  employeeId: string;
  employeeName: string;
  department: DepartmentType;
  date: string;
  tasksWorkedOn: string[];
  tasksCompleted: string[];
  tasksPending: string[];
  timeSpentHours: number;
  workDescription: string;
  challengesFaced: string;
  planForTomorrow: string;
  status: 'Submitted' | 'Reviewed' | 'Changes Requested';
}

// ============================================================================
// CAMPAIGNS & MEDIA
// ============================================================================
export interface CampaignWorkspace {
  id: string;
  title: string;
  objective: string;
  participatingDepartments: DepartmentType[];
  assignedEmployees: string[];
  leadManager: string;
  startDate: string;
  deadline: string;
  status: 'Active' | 'Planning' | 'Completed';
  leadsGenerated: number;
  budgetRef: number; // Chairperson only display for exact financial figures
  spentRef: number;
  milestones: { title: string; due: string; done: boolean }[];
  documents: string[];
}

export interface SocialMediaMetric {
  id: string;
  platform: 'LinkedIn' | 'Instagram' | 'YouTube' | 'X';
  contentType: 'Reel' | 'Carousel' | 'Podcast Clip' | 'Article';
  title: string;
  publishDate: string;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface PodcastEpisode {
  id: string;
  topic: string;
  guestName: string;
  guestContact: string;
  presenter: string;
  recordingDate: string;
  stage: 'Upcoming' | 'Ongoing' | 'Done';
  greetingStatus: 'Sent' | 'Pending' | 'Confirmed';
  editingStatus: 'Not Started' | 'In Progress' | 'Mastered';
  publicationStatus: 'Scheduled' | 'Published' | 'Draft';
  guestTimeline: { step: string; done: boolean; date: string }[];
}

export interface ReelItem {
  id: string;
  title: string;
  editorName: string;
  submissionDate: string;
  stage: 'Assigned' | 'Editing' | 'Review' | 'Approved' | 'Posted';
  reviewComments: string;
  publicationDate?: string;
}

// ============================================================================
// SALES, CRM, COLLEGES, EXPERTS & OPEN MARKET
// ============================================================================
export type CRMPipelineStage =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Pitched'
  | 'Negotiation'
  | 'Agreement'
  | 'Won'
  | 'Lost';

export interface CRMLead {
  id: string;
  name: string;
  organization: string;
  contactPerson: string;
  phone: string;
  email: string;
  assignedSalespersonId: string;
  assignedSalespersonName: string;
  leadSource: 'College Visit' | 'FDP' | 'LinkedIn' | 'Expo' | 'Referral';
  interestLevel: 'Hot' | 'Warm' | 'Cold';
  expectedOpportunity: number;
  followUpDate: string;
  stage: CRMPipelineStage;
  interactionHistory: { date: string; note: string }[];
  lostReason?: string;
  competitorInfo?: string;
}

export interface CollegePartner {
  id: string;
  name: string;
  location: string;
  address: string;
  tpoName: string;
  tpoPhone: string;
  tpoEmail: string;
  assignedSalesperson: string;
  workshopStatus: 'Not Taken' | 'Assigned' | 'Conducted';
  agreementStatus: 'Active' | 'Expiring Soon' | 'In Discussion' | 'Expired';
  validUntil: string;
  visitCount: number;
  fdpCount: number;
  sdfSigned: boolean;
  dealValue: number;
  recentVisits: { date: string; notes: string; outcome: string }[];
}

export interface ExpertProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  expertise: string[];
  topics: string[];
  associatedEventOrCollege: string;
  sessionsCount: number;
  feedbackRating: number;
  honorariumAmount: number; // Visible ONLY in Chairperson finance/view
}

export interface OpenMarketLead {
  id: string;
  leadName: string;
  organization: string;
  category:
    | 'Direct B2C'
    | 'Corporate Clients'
    | 'External Organizations'
    | 'Workshop Opportunities'
    | 'Training Opportunities'
    | 'Other Outside Sales';
  contactPerson: string;
  phone: string;
  source: string;
  originatingEvent?: string;
  assignedSalesperson: string;
  interestLevel: 'Hot' | 'Warm' | 'Cold';
  requirement: string;
  followUpDate: string;
  expectedOpportunity: number;
  stage: CRMPipelineStage;
}

// ============================================================================
// TELECALLER, COUNSELOR & TECHNICAL TEAM
// ============================================================================
export type CallOutcome = 'Interested' | 'Not Interested' | 'Call Back' | 'Not Reachable' | 'Converted';

export interface TeleCallerRecord {
  id: string;
  studentName: string;
  phone: string;
  callDate: string;
  assignedTelecallerId: string;
  assignedTelecallerName: string;
  callOutcome: CallOutcome;
  interestedCourse: 'Capsule' | 'CDAC' | 'C3RIHub' | 'MindlyftAI';
  technicalBackground: string;
  followUpDate: string;
  counselingStatus: 'Pending' | 'Scheduled' | 'Completed';
  conversionStatus: 'Open' | 'Converted' | 'Dropped';
  notes: string;
}

export interface CounselingSession {
  id: string;
  studentName: string;
  phone: string;
  counselorName: string;
  sessionDate: string;
  interests: string[];
  guidanceNotes: string;
  restrictedSensitiveNote: boolean;
  followUpDate: string;
  outcome: 'Enrolled' | 'Considering' | 'Follow-up Needed';
}

export interface TechnicalBug {
  id: string;
  title: string;
  project: string;
  assignedDeveloper: string;
  priority: TaskPriority;
  deadline: string;
  status: 'Reported' | 'Assigned' | 'In Progress' | 'Testing' | 'Resolved';
  description: string;
}

// ============================================================================
// EDUCATION (COURSES, BATCHES, STUDENTS)
// ============================================================================
export interface CourseCatalogItem {
  id: string;
  name: 'Capsule' | 'CDAC' | 'C3RIHub' | 'MindlyftAI';
  category: string;
  duration: string;
  assignedFaculty: string;
  totalBatches: number;
  totalStudents: number;
  status: 'Active' | 'Upcoming' | 'Archived';
  description: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  batchId: string;
  attendancePct: number;
  progressPct: number;
  status: 'Active' | 'Completed' | 'At Risk';
}

export interface BatchItem {
  id: string;
  course: 'Capsule' | 'CDAC' | 'C3RIHub' | 'MindlyftAI';
  batchName: string;
  startDate: string;
  endDate: string;
  assignedFacultyId: string;
  assignedFacultyName: string;
  studentCount: number;
  enrollmentStatus: 'Open' | 'Full' | 'Closed';
  batchStatus: 'Ongoing' | 'Upcoming' | 'Completed';
  completedSessions: number;
  totalSessions: number;
  attendanceAvgPct: number;
  schedule: string;
}

// ============================================================================
// EVENTS & EXPOS
// ============================================================================
export interface CompanyEvent {
  id: string;
  name: string;
  eventType: 'Campaign' | 'Expo' | 'College Workshop' | 'FDP' | 'Podcast' | 'External Event';
  date: string;
  venue: string;
  organizer: string;
  participatingDepartments: DepartmentType[];
  boothDetails?: string;
  leadsCollected: number;
  qualifiedLeads: number;
  conversions: number;
  expenseRef: number; // Restricted in non-Chairperson views
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

// ============================================================================
// ASSETS & ACCOUNTS (CHAIRPERSON RESTRICTED)
// ============================================================================
export type AssetLifecycleStatus =
  | 'Available'
  | 'Assigned'
  | 'In Use'
  | 'Return Pending'
  | 'Returned';

export interface CompanyAsset {
  id: string;
  name: string;
  category:
    | 'Laptops'
    | 'Mobile phones'
    | 'SIM cards'
    | 'Cameras'
    | 'Accessories'
    | 'Software licenses'
    | 'Email accounts'
    | 'Other company property';
  serialNumber: string;
  purchaseRef: string;
  purchaseValue: number; // Chairperson only
  condition: 'Excellent' | 'Good' | 'Needs Service';
  assignedToId: string | null;
  assignedToName: string | null;
  issueDate?: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssetLifecycleStatus;
  custodyHistory: { employeeName: string; issued: string; returned?: string }[];
}

export interface ExpenseClaim {
  id: string;
  claimantId: string;
  claimantName: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  relatedEventOrCampaign?: string;
  receiptFile: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Paid';
}

export interface RecurringBill {
  id: string;
  category: 'Rental' | 'Wi-Fi' | 'SIM cards' | 'Electricity' | 'Other utilities';
  vendor: string;
  amount: number;
  dueDate: string;
  frequency: 'Monthly' | 'Quarterly' | 'Annual';
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  reminderBadge?: '5 days before due date' | 'Due today' | 'Overdue';
  paymentDate?: string;
  documentRef: string;
}

export interface GSTRecord {
  id: string;
  period: string;
  category: string;
  uploadDate: string;
  fileRef: string;
  complianceStatus: 'Filed' | 'Pending' | 'Verified';
}

export interface DocumentRecord {
  id: string;
  name: string;
  category:
    | 'Employee documents'
    | 'College agreements'
    | 'MoUs'
    | 'Event documents'
    | 'Campaign documents'
    | 'GST files'
    | 'Expense receipts'
    | 'Asset records'
    | 'Course documents';
  owner: string;
  relatedModule: string;
  uploadDate: string;
  classification: 'Public Internal' | 'Department Only' | 'Private' | 'Chairperson Confidential';
  version: string;
  fileType: 'PDF' | 'XLSX' | 'DOCX' | 'PNG';
}

export interface NotificationItem {
  id: string;
  userId?: string;
  taskId?: string;
  type?: string;
  title: string;
  message: string;
  category:
    | 'Task Assignment'
    | 'Task Transfer'
    | 'Approval'
    | 'Follow-up'
    | 'Event'
    | 'Finance'
    | 'Asset';
  createdBy?: string;
  createdAt?: string;
  priority?: TaskPriority;
  dueDate?: string;
  timestamp: string;
  isRead: boolean;
  targetUrl: string;
}
