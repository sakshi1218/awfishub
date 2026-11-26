export interface NavigationEntry {
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  children?: NavigationEntry[];
}

export interface NavigationSection {
  label: string;
  entries: NavigationEntry[];
}

export const navigationSections: NavigationSection[] = [
  {
    label: 'Overview',
    entries: [
      { label: 'Main Dashboard', href: '/', description: 'Organization-wide overview and activity.', icon: 'dashboard' },
      { label: 'My Workspace', href: '/workspace', description: 'Your personal AWSFISHUB workspace.', icon: 'workspace' },
      { label: 'My Tasks', href: '/my-tasks', description: 'A personal view of assigned tasks.', icon: 'tasks' },
      { label: 'My Reports', href: '/my-reports', description: 'Your submitted reports and updates.', icon: 'reports' },
      { label: 'Notifications', href: '/notifications', description: 'Updates and reminders from across the platform.', icon: 'notifications' },
    ],
  },
  {
    label: 'Organization',
    entries: [
      { label: 'Employees', href: '/employees', description: 'Employee directory and profiles.', icon: 'people' },
      { label: 'Departments', href: '/departments', description: 'Department directory and overview.', icon: 'organization' },
      { label: 'Teams', href: '/teams', description: 'Team directory and workgroup overview.', icon: 'people' },
      { label: 'Designations', href: '/designations', description: 'Organization designations and role titles.', icon: 'organization' },
      { label: 'Organization Hierarchy', href: '/hierarchy', description: 'Explore the organization structure.', icon: 'hierarchy' },
    ],
  },
  {
    label: 'Operations',
    entries: [
      { label: 'Tasks', href: '/tasks', description: 'Task board and work queue.', icon: 'tasks' },
      { label: 'Projects', href: '/projects', description: 'Project portfolio and progress overview.', icon: 'projects' },
      { label: 'Workspaces', href: '/workspaces', description: 'Department and team workspaces.', icon: 'workspace' },
      { label: 'Task Handover', href: '/task-handover', description: 'Frontend preview for task transitions.', icon: 'tasks' },
      { label: 'Meetings', href: '/meetings', description: 'Meetings, reviews, and sessions.', icon: 'meetings' },
      { label: 'Daily Reports', href: '/daily-reports', description: 'Daily work updates and reports.', icon: 'reports' },
      { label: 'Attendance', href: '/attendance', description: 'Attendance overview and check-in interface.', icon: 'attendance' },
      { label: 'Leave Management', href: '/leave', description: 'Leave requests and balances overview.', icon: 'leave' },
    ],
  },
  {
    label: 'Department Workspaces',
    entries: [
      {
        label: 'Media',
        icon: 'media',
        children: [
          { label: 'Media Dashboard', href: '/media/dashboard', description: 'Media workspace overview.' },
          { label: 'Content Calendar', href: '/media/content-calendar', description: 'Content calendar page.' },
          { label: 'Content Production', href: '/media/content-production', description: 'Content production page.' },
          { label: 'Creative Requests', href: '/media/creative-requests', description: 'Creative request queue.' },
          { label: 'Campaign Management', href: '/media/campaigns', description: 'Campaign overview.' },
          { label: 'Media Reports', href: '/media/reports', description: 'Media reporting overview.' },
        ],
      },
      {
        label: 'Trainer',
        icon: 'learning',
        children: [
          { label: 'Trainer Dashboard', href: '/trainer/dashboard', description: 'Trainer workspace overview.' },
          { label: 'Faculty Management', href: '/trainer/faculty', description: 'Faculty directory and overview.' },
          { label: 'Assigned Batches', href: '/trainer/assigned-batches', description: 'Trainer batch assignments.' },
          { label: 'Session Management', href: '/trainer/sessions', description: 'Training session overview.' },
          { label: 'Training Schedule', href: '/trainer/schedule', description: 'Training schedule page.' },
          { label: 'Student Progress', href: '/trainer/student-progress', description: 'Student progress overview.' },
          { label: 'Trainer Reports', href: '/trainer/reports', description: 'Trainer reporting overview.' },
        ],
      },
      {
        label: 'Counselor',
        icon: 'people',
        children: [
          { label: 'Counselor Dashboard', href: '/counselor/dashboard', description: 'Counselor workspace overview.' },
          { label: 'Student Enquiries', href: '/counselor/enquiries', description: 'Student enquiry overview.' },
          { label: 'Counselling Sessions', href: '/counselor/counselling-sessions', description: 'Counselling session overview.' },
          { label: 'Follow-ups', href: '/counselor/follow-ups', description: 'Counselor follow-up overview.' },
          { label: 'Student Applications', href: '/counselor/applications', description: 'Student application overview.' },
          { label: 'Conversion Tracking', href: '/counselor/conversion', description: 'Conversion tracking overview.' },
          { label: 'Counselor Reports', href: '/counselor/reports', description: 'Counselor reporting overview.' },
        ],
      },
      {
        label: 'TeleCaller',
        icon: 'calls',
        children: [
          { label: 'TeleCaller Dashboard', href: '/telecaller/dashboard', description: 'TeleCaller workspace overview.' },
          { label: 'Call Assignments', href: '/telecaller/call-assignments', description: 'Call assignment overview.' },
          { label: 'Call Logs', href: '/telecaller/call-logs', description: 'Call log overview.' },
          { label: 'Follow-ups', href: '/telecaller/follow-ups', description: 'TeleCaller follow-up overview.' },
          { label: 'Lead Management', href: '/telecaller/leads', description: 'TeleCaller lead overview.' },
          { label: 'Call Performance', href: '/telecaller/performance', description: 'Call performance overview.' },
          { label: 'TeleCaller Reports', href: '/telecaller/reports', description: 'TeleCaller reporting overview.' },
        ],
      },
      { label: 'Technical Team', href: '/technical/dashboard', description: 'Technical workspace overview.', icon: 'technical' },
      {
        label: 'Sales Department',
        icon: 'sales',
        children: [
          { label: 'Sales Dashboard', href: '/sales', description: 'Sales workspace overview.' },
          { label: 'College Visits', href: '/sales/visits', description: 'College visits and outcomes.' },
          { label: 'FDP Sessions', href: '/sales/fdp', description: 'Faculty development program sessions.' },
          { label: 'College Agreements', href: '/sales/agreements', description: 'College agreements and renewals.' },
          { label: 'CRM Leads', href: '/sales/leads', description: 'CRM lead pipeline.' },
          { label: 'Sales Follow-ups', href: '/sales/follow-ups', description: 'Sales follow-up overview.' },
          { label: 'Sales Targets', href: '/sales/targets', description: 'Sales target overview.' },
          { label: 'Sales Performance', href: '/sales/performance', description: 'Sales performance overview.' },
          { label: 'Sales Reports', href: '/sales/reports', description: 'Sales reporting overview.' },
        ],
      },
      {
        label: 'Interns',
        icon: 'people',
        children: [
          { label: 'Intern Dashboard', href: '/interns/dashboard', description: 'Intern workspace overview.' },
          { label: 'Assigned Tasks', href: '/interns/assigned-tasks', description: 'Intern task assignments.' },
          { label: 'Daily Reports', href: '/interns/daily-reports', description: 'Intern daily reports.' },
          { label: 'Mentor Details', href: '/interns/mentor', description: 'Mentor information overview.' },
          { label: 'Feedback', href: '/interns/feedback', description: 'Intern feedback overview.' },
          { label: 'Attendance', href: '/interns/attendance', description: 'Intern attendance overview.' },
          { label: 'Performance', href: '/interns/performance', description: 'Intern performance overview.' },
        ],
      },
      {
        label: 'Operation Team',
        icon: 'operations',
        children: [
          { label: 'Operations Dashboard', href: '/operations/dashboard', description: 'Operations workspace overview.' },
          { label: 'Operational Tasks', href: '/operations/tasks', description: 'Operational task overview.' },
          { label: 'Resource Allocation', href: '/operations/resources', description: 'Resource allocation overview.' },
          { label: 'Process Tracking', href: '/operations/process-tracking', description: 'Process tracking overview.' },
          { label: 'Event Coordination', href: '/operations/event-coordination', description: 'Event coordination overview.' },
          { label: 'Operations Reports', href: '/operations/reports', description: 'Operations reporting overview.' },
        ],
      },
    ],
  },
  {
    label: 'Learning Management',
    entries: [
      { label: 'LMS Dashboard', href: '/learning/dashboard', description: 'Learning management overview.', icon: 'learning' },
      { label: 'Programmes', href: '/learning/programmes', description: 'Browse programme providers and catalogue.', icon: 'learning' },
      { label: 'Courses', href: '/learning/courses', description: 'Course catalogue and course detail entry points.', icon: 'learning' },
      { label: 'Batches', href: '/learning/batches', description: 'Batch overview and management entry point.', icon: 'learning' },
      { label: 'Faculty', href: '/learning/faculty', description: 'Faculty overview and assignment entry point.', icon: 'people' },
      { label: 'Students', href: '/learning/students', description: 'Student directory and learning overview.', icon: 'people' },
      { label: 'Enrollment', href: '/learning/enrollment', description: 'Enrollment overview.', icon: 'people' },
      { label: 'Batch Attendance', href: '/learning/attendance', description: 'Batch attendance overview.', icon: 'attendance' },
      { label: 'Assessments', href: '/learning/assessments', description: 'Assessment overview.', icon: 'tasks' },
      { label: 'Student Progress', href: '/learning/progress', description: 'Student progress overview.', icon: 'reports' },
      { label: 'Completion Reports', href: '/learning/completion-reports', description: 'Course and batch completion reports.', icon: 'reports' },
    ],
  },
  {
    label: 'Events & Network',
    entries: [
      { label: 'Events', href: '/events', description: 'Events and planning overview.', icon: 'events' },
      { label: 'Expos', href: '/expos', description: 'Expo participation overview.', icon: 'events' },
      { label: 'Colleges', href: '/colleges', description: 'College directory and partnership overview.', icon: 'organization' },
      { label: 'Experts Directory', href: '/experts', description: 'Expert profiles and availability overview.', icon: 'people' },
    ],
  },
  {
    label: 'Administration',
    entries: [
      { label: 'Finance', href: '/finance', description: 'Finance module overview.', icon: 'finance' },
      { label: 'Expense Claims', href: '/expenses', description: 'Expense claim interface preview.', icon: 'finance' },
      { label: 'Physical Assets', href: '/assets', description: 'Physical asset inventory overview.', icon: 'assets' },
      { label: 'Documents', href: '/documents', description: 'Document library and upload prototype.', icon: 'documents' },
      { label: 'Reports & Analytics', href: '/reports', description: 'Reports and analytics overview.', icon: 'reports' },
      { label: 'Settings', href: '/settings', description: 'Application preferences and settings.', icon: 'settings' },
    ],
  },
];

export interface FlatNavigationEntry extends NavigationEntry {
  section: string;
  parent?: string;
}

export const flatNavigation: FlatNavigationEntry[] = navigationSections.flatMap((section) =>
  section.entries.flatMap((entry) => {
    if (entry.children) {
      return entry.children.map((child) => ({
        ...child,
        section: section.label,
        parent: entry.label,
      }));
    }

    return [{ ...entry, section: section.label }];
  })
);

export function getNavigationEntry(path: string): FlatNavigationEntry | undefined {
  return flatNavigation.find((entry) => entry.href === path);
}

export function getNavigationAncestors(path: string): FlatNavigationEntry[] {
  return flatNavigation
    .filter((entry) => entry.href && path.startsWith(`${entry.href}/`))
    .sort((a, b) => (a.href?.length ?? 0) - (b.href?.length ?? 0));
}
