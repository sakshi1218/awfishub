'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RoleType,
  DepartmentType,
  Employee,
  RoleSeat,
  PermissionMatrixRow,
  TaskItem,
  TaskLifecycleStatus,
  TaskPriority,
  DirectorPriority,
  FollowUpItem,
  DailyWorkReport,
  CampaignWorkspace,
  SocialMediaMetric,
  PodcastEpisode,
  ReelItem,
  CRMLead,
  CRMPipelineStage,
  CollegePartner,
  ExpertProfile,
  OpenMarketLead,
  TeleCallerRecord,
  CallOutcome,
  CounselingSession,
  TechnicalBug,
  CourseCatalogItem,
  BatchItem,
  StudentRecord,
  CompanyEvent,
  CompanyAsset,
  AssetLifecycleStatus,
  ExpenseClaim,
  RecurringBill,
  GSTRecord,
  DocumentRecord,
  NotificationItem,
} from '@/types';
import { INITIAL_PERMISSION_MATRIX } from '@/data/constants/roles';
import { MOCK_EMPLOYEES, MOCK_ROLE_SEATS } from '@/data/mock/employees';
import { MOCK_TASKS, MOCK_FOLLOWUPS, MOCK_DAILY_REPORTS } from '@/data/mock/tasks';
import {
  MOCK_CAMPAIGNS,
  MOCK_SOCIAL_METRICS,
  MOCK_PODCASTS,
  MOCK_REELS,
  MOCK_COUNSELING_SESSIONS,
  MOCK_TECHNICAL_BUGS,
  MOCK_EVENTS,
  MOCK_DOCUMENTS,
  MOCK_NOTIFICATIONS,
} from '@/data/mock/operations';
import {
  MOCK_CRM_LEADS,
  MOCK_COLLEGES,
  MOCK_EXPERTS,
  MOCK_OPEN_MARKET_LEADS,
  MOCK_TELECALLER_RECORDS,
} from '@/data/mock/crm';
import { MOCK_COURSES, MOCK_BATCHES, MOCK_STUDENTS } from '@/data/mock/education';
import {
  MOCK_ASSETS,
  MOCK_EXPENSE_CLAIMS,
  MOCK_RECURRING_BILLS,
  MOCK_GST_RECORDS,
} from '@/data/mock/financeAssets';

interface AppContextType {
  // Active Role & Theme
  currentRole: RoleType;
  currentEmployee: Employee;
  switchRole: (role: RoleType, employeeId?: string) => void;
  switchEmployee: (employeeId: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Role helpers
  isChairperson: boolean;
  isDirector: boolean;
  isOperationHead: boolean;
  isTeamLead: boolean;
  isFaculty: boolean;
  isStaff: boolean;
  isIntern: boolean;

  // Division scoping helper for Directors (prevents seeing other Directors' divisions)
  getDirectorAllowedDepartments: (directorId: string) => DepartmentType[];
  getVisibleTasksForCurrentUser: () => TaskItem[];
  getPriorityConflicts: () => Array<{
    employeeId: string;
    employeeName: string;
    tasks: TaskItem[];
    escalated: boolean;
  }>;
  directorPriorityOrder: string;
  setDirectorPriorityOrder: (order: string) => void;

  // Collections
  employees: Employee[];
  roleSeats: RoleSeat[];
  permissionMatrix: PermissionMatrixRow[];
  tasks: TaskItem[];
  followUps: FollowUpItem[];
  dailyReports: DailyWorkReport[];
  campaigns: CampaignWorkspace[];
  socialMetrics: SocialMediaMetric[];
  podcasts: PodcastEpisode[];
  reels: ReelItem[];
  crmLeads: CRMLead[];
  colleges: CollegePartner[];
  experts: ExpertProfile[];
  openMarketLeads: OpenMarketLead[];
  telecallerRecords: TeleCallerRecord[];
  counselingSessions: CounselingSession[];
  technicalBugs: TechnicalBug[];
  courses: CourseCatalogItem[];
  batches: BatchItem[];
  students: StudentRecord[];
  events: CompanyEvent[];
  assets: CompanyAsset[];
  expenseClaims: ExpenseClaim[];
  recurringBills: RecurringBill[];
  gstRecords: GSTRecord[];
  documents: DocumentRecord[];
  notifications: NotificationItem[];

  // Actions
  addEmployee: (emp: Omit<Employee, 'id' | 'permanentId' | 'activityHistory'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  transferEmployeeDepartment: (id: string, dept: DepartmentType, seatId: string) => void;
  updateOffboardingChecklist: (
    id: string,
    key: keyof NonNullable<Employee['offboardingChecklist']>,
    val: boolean
  ) => void;
  togglePermission: (
    moduleName: string,
    role: RoleType,
    field: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'
  ) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'transferHistory' | 'priorityHistory' | 'comments'>) => void;
  updateTaskStatus: (taskId: string, status: TaskLifecycleStatus, progressPct?: number) => void;
  transferTask: (taskId: string, newAssigneeId: string, reason: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  escalatePriorityConflict: (taskIds: string[]) => void;
  founderOverridePriority: (
    taskId: string,
    newPriority: TaskPriority,
    newDirectorPriority: DirectorPriority,
    newDueDate: string,
    decisionNote: string
  ) => void;
  submitDailyReport: (report: Omit<DailyWorkReport, 'id' | 'status'>) => void;
  reviewDailyReport: (reportId: string, status: 'Reviewed' | 'Changes Requested') => void;
  addCampaign: (campaign: Omit<CampaignWorkspace, 'id'>) => void;
  updatePodcastStage: (id: string, stage: PodcastEpisode['stage']) => void;
  updateReelStage: (id: string, stage: ReelItem['stage']) => void;
  updateCRMStage: (id: string, stage: CRMPipelineStage) => void;
  addCRMLead: (lead: Omit<CRMLead, 'id' | 'interactionHistory'>) => void;
  updateOpenMarketStage: (id: string, stage: CRMPipelineStage) => void;
  updateCollegeWorkshop: (id: string, status: CollegePartner['workshopStatus']) => void;
  addTeleCallerRecord: (rec: Omit<TeleCallerRecord, 'id'>) => void;
  updateTeleCallerOutcome: (id: string, outcome: CallOutcome, notes?: string) => void;
  updateBugStatus: (id: string, status: TechnicalBug['status']) => void;
  addStudent: (student: Omit<StudentRecord, 'id'>) => void;
  bulkImportStudents: (rows: Omit<StudentRecord, 'id'>[]) => void;
  updateStudentAttendance: (studentId: string, present: boolean) => void;
  addBatch: (batch: Omit<BatchItem, 'id'>) => void;
  assignAsset: (assetId: string, employeeId: string) => void;
  returnAsset: (assetId: string, status: AssetLifecycleStatus) => void;
  submitExpenseClaim: (claim: Omit<ExpenseClaim, 'id' | 'status'>) => void;
  updateExpenseClaimStatus: (claimId: string, status: ExpenseClaim['status']) => void;
  markBillPaid: (billId: string) => void;
  addDocument: (doc: Omit<DocumentRecord, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getDefaultEmployee(role: RoleType, list: Employee[]): Employee {
  const map: Record<RoleType, string> = {
    CHAIRPERSON: 'AWF-EMP-001',
    DIRECTOR: 'AWF-EMP-002',
    OPERATION_HEAD: 'AWF-EMP-005',
    TEAM_LEAD: 'AWF-EMP-008',
    FACULTY: 'AWF-EMP-011',
    STAFF: 'AWF-EMP-013',
    INTERN: 'AWF-INT-001',
  };
  return list.find((e) => e.id === map[role]) || list[0];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [roleSeats] = useState<RoleSeat[]>(MOCK_ROLE_SEATS);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrixRow[]>(INITIAL_PERMISSION_MATRIX);
  const [tasks, setTasks] = useState<TaskItem[]>(MOCK_TASKS);
  const [followUps] = useState<FollowUpItem[]>(MOCK_FOLLOWUPS);
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>(MOCK_DAILY_REPORTS);
  const [campaigns, setCampaigns] = useState<CampaignWorkspace[]>(MOCK_CAMPAIGNS);
  const [socialMetrics] = useState<SocialMediaMetric[]>(MOCK_SOCIAL_METRICS);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>(MOCK_PODCASTS);
  const [reels, setReels] = useState<ReelItem[]>(MOCK_REELS);
  const [crmLeads, setCrmLeads] = useState<CRMLead[]>(MOCK_CRM_LEADS);
  const [colleges, setColleges] = useState<CollegePartner[]>(MOCK_COLLEGES);
  const [experts] = useState<ExpertProfile[]>(MOCK_EXPERTS);
  const [openMarketLeads, setOpenMarketLeads] = useState<OpenMarketLead[]>(MOCK_OPEN_MARKET_LEADS);
  const [telecallerRecords, setTelecallerRecords] = useState<TeleCallerRecord[]>(MOCK_TELECALLER_RECORDS);
  const [counselingSessions] = useState<CounselingSession[]>(MOCK_COUNSELING_SESSIONS);
  const [technicalBugs, setTechnicalBugs] = useState<TechnicalBug[]>(MOCK_TECHNICAL_BUGS);
  const [courses] = useState<CourseCatalogItem[]>(MOCK_COURSES);
  const [batches, setBatches] = useState<BatchItem[]>(MOCK_BATCHES);
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [events] = useState<CompanyEvent[]>(MOCK_EVENTS);
  const [assets, setAssets] = useState<CompanyAsset[]>(MOCK_ASSETS);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(MOCK_EXPENSE_CLAIMS);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(MOCK_RECURRING_BILLS);
  const [gstRecords] = useState<GSTRecord[]>(MOCK_GST_RECORDS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCUMENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [currentRole, setCurrentRole] = useState<RoleType>('CHAIRPERSON');
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(() =>
    getDefaultEmployee('CHAIRPERSON', MOCK_EMPLOYEES)
  );
  const [directorPriorityOrder, setDirectorPriorityOrder] = useState<string>(
    'Equal Authority (Founder Resolves Conflicts)'
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const switchRole = (role: RoleType, employeeId?: string) => {
    setCurrentRole(role);
    if (employeeId) {
      const target = employees.find((e) => e.id === employeeId);
      if (target) {
        setCurrentEmployee(target);
        return;
      }
    }
    setCurrentEmployee(getDefaultEmployee(role, employees));
  };

  const switchEmployee = (employeeId: string) => {
    const target = employees.find((e) => e.id === employeeId);
    if (target) {
      setCurrentEmployee(target);
      setCurrentRole(target.role);
    }
  };

  const getDirectorAllowedDepartments = (directorId: string): DepartmentType[] => {
    if (directorId === 'AWF-EMP-002') return ['Sales Department', 'TeleCaller', 'Counselor'];
    if (directorId === 'AWF-EMP-003') return ['Technical Team', 'Trainer'];
    if (directorId === 'AWF-EMP-004') return ['Media', 'Operation Team', 'Interns'];
    return [];
  };

  const getVisibleTasksForCurrentUser = (): TaskItem[] => {
    if (currentRole === 'CHAIRPERSON' || currentRole === 'OPERATION_HEAD') return tasks;
    if (currentRole === 'DIRECTOR') {
      const allowed = getDirectorAllowedDepartments(currentEmployee.id);
      return tasks.filter((t) => {
        // Cannot see Founder's private tasks or other Directors' private tasks
        if (t.isPrivate && t.assignedById !== currentEmployee.id && t.assignedToId !== currentEmployee.id) {
          return false;
        }
        return (
          t.assigningDirectorId === currentEmployee.id ||
          t.assignedById === currentEmployee.id ||
          t.assignedToId === currentEmployee.id ||
          allowed.includes(t.department)
        );
      });
    }
    if (currentRole === 'TEAM_LEAD') {
      return tasks.filter(
        (t) =>
          !t.isPrivate &&
          (t.department === currentEmployee.department || t.assignedToId === currentEmployee.id)
      );
    }
    // Employee / Faculty / Staff / Intern: own assigned tasks + authorized collaborative tasks (never private tasks of others)
    return tasks.filter(
      (t) =>
        t.assignedToId === currentEmployee.id ||
        (!t.isPrivate && t.visibility === 'Collaborative' && t.department === currentEmployee.department)
    );
  };

  const getPriorityConflicts = () => {
    const byEmployee = new Map<string, TaskItem[]>();
    tasks.forEach((t) => {
      if (t.status === 'Approved') return;
      if (!t.assigningDirectorId) return;
      if (t.priority !== 'Critical' && t.priority !== 'High' && t.directorPriority !== 'Priority 1') return;
      const list = byEmployee.get(t.assignedToId) || [];
      list.push(t);
      byEmployee.set(t.assignedToId, list);
    });

    const conflicts: Array<{
      employeeId: string;
      employeeName: string;
      tasks: TaskItem[];
      escalated: boolean;
    }> = [];

    byEmployee.forEach((empTasks, employeeId) => {
      const uniqueDirectors = new Set(empTasks.map((t) => t.assigningDirectorId));
      if (uniqueDirectors.size >= 2) {
        conflicts.push({
          employeeId,
          employeeName: empTasks[0].assignedToName,
          tasks: empTasks,
          escalated: empTasks.some((t) => Boolean(t.conflictEscalated)),
        });
      }
    });

    return conflicts;
  };

  // Actions
  const addEmployee = (emp: Omit<Employee, 'id' | 'permanentId' | 'activityHistory'>) => {
    const num = employees.length + 1;
    const prefix = emp.role === 'INTERN' ? 'AWF-INT-' : 'AWF-EMP-';
    const id = `${prefix}${String(num).padStart(3, '0')}`;
    setEmployees((prev) => [
      {
        ...emp,
        id,
        permanentId: id,
        activityHistory: [{ date: new Date().toISOString().split('T')[0], action: 'Onboarded to AWFIS HUB' }],
      },
      ...prev,
    ]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    if (currentEmployee.id === id) setCurrentEmployee((prev) => ({ ...prev, ...updates }));
  };

  const transferEmployeeDepartment = (id: string, dept: DepartmentType, seatId: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              department: dept,
              roleSeatId: seatId,
              activityHistory: [
                { date: new Date().toISOString().split('T')[0], action: `Transferred to ${dept} (${seatId})` },
                ...e.activityHistory,
              ],
            }
          : e
      )
    );
  };

  const updateOffboardingChecklist = (
    id: string,
    key: keyof NonNullable<Employee['offboardingChecklist']>,
    val: boolean
  ) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const curr = e.offboardingChecklist || {
          assetsReturned: false,
          knowledgeHandoverDone: false,
          credentialsRevoked: false,
          exitInterviewCompleted: false,
          financialSettlementDone: false,
        };
        const next = { ...curr, [key]: val };
        const done = Object.values(next).every(Boolean);
        return { ...e, employmentStatus: done ? 'Offboarded' : 'Notice Period', offboardingChecklist: next };
      })
    );
  };

  const togglePermission = (
    moduleName: string,
    role: RoleType,
    field: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export'
  ) => {
    setPermissionMatrix((prev) =>
      prev.map((row) =>
        row.module === moduleName
          ? {
              ...row,
              rolePermissions: {
                ...row.rolePermissions,
                [role]: {
                  ...row.rolePermissions[role],
                  [field]: !row.rolePermissions[role][field],
                },
              },
            }
          : row
      )
    );
  };

  const addTask = (task: Omit<TaskItem, 'id' | 'transferHistory' | 'priorityHistory' | 'comments'>) => {
    const id = `TSK-${Math.floor(115 + Math.random() * 880)}`;
    setTasks((prev) => [
      {
        ...task,
        id,
        transferHistory: [],
        priorityHistory: [
          {
            id: `PH-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            actorName: task.assigningDirectorName || currentEmployee.name,
            actorRole: currentRole,
            action: 'Initial Priority Assigned',
            newPriority: task.priority,
            newDirectorPriority: task.directorPriority,
            note: task.reasonForUrgency || 'Task created',
          },
        ],
        comments: [],
      },
      ...prev,
    ]);
  };

  const escalatePriorityConflict = (taskIds: string[]) => {
    setTasks((prev) =>
      prev.map((t) => (taskIds.includes(t.id) ? { ...t, conflictEscalated: true } : t))
    );
  };

  const founderOverridePriority = (
    taskId: string,
    newPriority: TaskPriority,
    newDirectorPriority: DirectorPriority,
    newDueDate: string,
    decisionNote: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          priority: newPriority,
          directorPriority: newDirectorPriority,
          dueDate: newDueDate,
          conflictEscalated: false,
          priorityHistory: [
            {
              id: `PH-${Date.now()}`,
              date: today,
              actorName: currentEmployee.name,
              actorRole: 'Founder / Chairperson',
              action: 'Founder Priority Override',
              previousPriority: t.priority,
              newPriority,
              previousDirectorPriority: t.directorPriority,
              newDirectorPriority,
              note: decisionNote,
            },
            ...t.priorityHistory,
          ],
        };
      })
    );
  };

  const updateTaskStatus = (taskId: string, status: TaskLifecycleStatus, progressPct?: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              progressPct: progressPct !== undefined ? progressPct : status === 'Approved' ? 100 : t.progressPct,
              completionDate: status === 'Approved' ? new Date().toISOString().split('T')[0] : t.completionDate,
            }
          : t
      )
    );
  };

  const transferTask = (taskId: string, newAssigneeId: string, reason: string) => {
    const newAssignee = employees.find((e) => e.id === newAssigneeId);
    if (!newAssignee) return;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          assignedToId: newAssignee.id,
          assignedToName: newAssignee.name,
          department: newAssignee.department,
          transferHistory: [
            {
              id: `TR-${Date.now()}`,
              originalAssignee: t.assignedToName,
              newAssignee: newAssignee.name,
              originalAssigner: t.assignedByName,
              transferInitiator: currentEmployee.name,
              reason,
              transferDate: new Date().toISOString().split('T')[0],
              newReportingManager: newAssignee.reportingManagerName,
              acceptanceStatus: 'Accepted',
            },
            ...t.transferHistory,
          ],
        };
      })
    );
  };

  const addTaskComment = (taskId: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [
                ...t.comments,
                {
                  id: `CMT-${Date.now()}`,
                  author: currentEmployee.name,
                  role: currentEmployee.designation,
                  text,
                  timestamp: 'Just now',
                },
              ],
            }
          : t
      )
    );
  };

  const submitDailyReport = (report: Omit<DailyWorkReport, 'id' | 'status'>) => {
    setDailyReports((prev) => [{ ...report, id: `DWR-${Date.now()}`, status: 'Submitted' }, ...prev]);
  };

  const reviewDailyReport = (reportId: string, status: 'Reviewed' | 'Changes Requested') => {
    setDailyReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
  };

  const addCampaign = (campaign: Omit<CampaignWorkspace, 'id'>) => {
    setCampaigns((prev) => [{ ...campaign, id: `CMP-${prev.length + 201}` }, ...prev]);
  };

  const updatePodcastStage = (id: string, stage: PodcastEpisode['stage']) => {
    setPodcasts((prev) => prev.map((p) => (p.id === id ? { ...p, stage } : p)));
  };

  const updateReelStage = (id: string, stage: ReelItem['stage']) => {
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, stage } : r)));
  };

  const updateCRMStage = (id: string, stage: CRMPipelineStage) => {
    setCrmLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const addCRMLead = (lead: Omit<CRMLead, 'id' | 'interactionHistory'>) => {
    setCrmLeads((prev) => [{ ...lead, id: `CRM-${Date.now()}`, interactionHistory: [] }, ...prev]);
  };

  const updateOpenMarketStage = (id: string, stage: CRMPipelineStage) => {
    setOpenMarketLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const updateCollegeWorkshop = (id: string, workshopStatus: CollegePartner['workshopStatus']) => {
    setColleges((prev) => prev.map((c) => (c.id === id ? { ...c, workshopStatus } : c)));
  };

  const addTeleCallerRecord = (rec: Omit<TeleCallerRecord, 'id'>) => {
    setTelecallerRecords((prev) => [{ ...rec, id: `TC-${Date.now()}` }, ...prev]);
  };

  const updateTeleCallerOutcome = (id: string, callOutcome: CallOutcome, notes?: string) => {
    setTelecallerRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              callOutcome,
              conversionStatus: callOutcome === 'Converted' ? 'Converted' : callOutcome === 'Not Interested' ? 'Dropped' : 'Open',
              notes: notes ?? r.notes,
            }
          : r
      )
    );
  };

  const updateBugStatus = (id: string, status: TechnicalBug['status']) => {
    setTechnicalBugs((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const addStudent = (student: Omit<StudentRecord, 'id'>) => {
    setStudents((prev) => [{ ...student, id: `STU-${String(prev.length + 1).padStart(3, '0')}` }, ...prev]);
  };

  const bulkImportStudents = (rows: Omit<StudentRecord, 'id'>[]) => {
    setStudents((prev) => [
      ...rows.map((r, idx) => ({ ...r, id: `STU-${String(prev.length + idx + 1).padStart(3, '0')}` })),
      ...prev,
    ]);
  };

  const updateStudentAttendance = (studentId: string, present: boolean) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const next = Math.min(100, Math.max(0, Number((s.attendancePct + (present ? 1.5 : -2.0)).toFixed(1))));
        return { ...s, attendancePct: next, status: next < 75 ? 'At Risk' : 'Active' };
      })
    );
  };

  const addBatch = (batch: Omit<BatchItem, 'id'>) => {
    setBatches((prev) => [{ ...batch, id: `BATCH-${Date.now()}` }, ...prev]);
  };

  const assignAsset = (assetId: string, employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    const today = new Date().toISOString().split('T')[0];
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              assignedToId: emp.id,
              assignedToName: emp.name,
              issueDate: today,
              status: 'Assigned',
              custodyHistory: [{ employeeName: emp.name, issued: today }, ...a.custodyHistory],
            }
          : a
      )
    );
  };

  const returnAsset = (assetId: string, status: AssetLifecycleStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status,
              actualReturnDate: status === 'Returned' || status === 'Available' ? today : a.actualReturnDate,
              assignedToId: status === 'Available' ? null : a.assignedToId,
              assignedToName: status === 'Available' ? null : a.assignedToName,
            }
          : a
      )
    );
  };

  const submitExpenseClaim = (claim: Omit<ExpenseClaim, 'id' | 'status'>) => {
    setExpenseClaims((prev) => [{ ...claim, id: `EXP-CLM-${prev.length + 1}`, status: 'Submitted' }, ...prev]);
  };

  const updateExpenseClaimStatus = (claimId: string, status: ExpenseClaim['status']) => {
    setExpenseClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, status } : c)));
  };

  const markBillPaid = (billId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setRecurringBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, paymentStatus: 'Paid', paymentDate: today, reminderBadge: undefined } : b
      )
    );
  };

  const addDocument = (doc: Omit<DocumentRecord, 'id'>) => {
    setDocuments((prev) => [{ ...doc, id: `DOC-${prev.length + 1}` }, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        currentEmployee,
        switchRole,
        switchEmployee,
        darkMode,
        toggleDarkMode,
        isChairperson: currentRole === 'CHAIRPERSON',
        isDirector: currentRole === 'DIRECTOR',
        isOperationHead: currentRole === 'OPERATION_HEAD',
        isTeamLead: currentRole === 'TEAM_LEAD',
        isFaculty: currentRole === 'FACULTY',
        isStaff: currentRole === 'STAFF',
        isIntern: currentRole === 'INTERN',
        getDirectorAllowedDepartments,
        getVisibleTasksForCurrentUser,
        getPriorityConflicts,
        directorPriorityOrder,
        setDirectorPriorityOrder,
        employees,
        roleSeats,
        permissionMatrix,
        tasks,
        followUps,
        dailyReports,
        campaigns,
        socialMetrics,
        podcasts,
        reels,
        crmLeads,
        colleges,
        experts,
        openMarketLeads,
        telecallerRecords,
        counselingSessions,
        technicalBugs,
        courses,
        batches,
        students,
        events,
        assets,
        expenseClaims,
        recurringBills,
        gstRecords,
        documents,
        notifications,
        addEmployee,
        updateEmployee,
        transferEmployeeDepartment,
        updateOffboardingChecklist,
        togglePermission,
        addTask,
        updateTaskStatus,
        transferTask,
        addTaskComment,
        escalatePriorityConflict,
        founderOverridePriority,
        submitDailyReport,
        reviewDailyReport,
        addCampaign,
        updatePodcastStage,
        updateReelStage,
        updateCRMStage,
        addCRMLead,
        updateOpenMarketStage,
        updateCollegeWorkshop,
        addTeleCallerRecord,
        updateTeleCallerOutcome,
        updateBugStatus,
        addStudent,
        bulkImportStudents,
        updateStudentAttendance,
        addBatch,
        assignAsset,
        returnAsset,
        submitExpenseClaim,
        updateExpenseClaimStatus,
        markBillPaid,
        addDocument,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
