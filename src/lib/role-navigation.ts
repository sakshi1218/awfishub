import type { CurrentEmployee } from '@/context/AuthContext';
import {
  flatNavigation,
  navigationSections,
  type FlatNavigationEntry,
  type NavigationEntry,
  type NavigationSection,
} from '@/lib/navigation';

type PreviewPersona = 'founder' | 'director' | 'teamLead' | 'faculty' | 'intern' | 'operationHead' | 'employee';
type PreviewUser = Pick<CurrentEmployee, 'role' | 'designation' | 'department' | 'responsibilities'>;

function getUserContext(user: PreviewUser) {
  const department = `${user.department?.name ?? ''} ${user.department?.code ?? ''}`.toLowerCase();
  const responsibilities = `${user.designation} ${user.responsibilities ?? ''} ${department}`.toLowerCase();
  return { department, responsibilities };
}

function getPersona(user: PreviewUser): PreviewPersona {
  const { department, responsibilities } = getUserContext(user);

  if (user.role === 'FOUNDER') return 'founder';
  if (/intern/.test(responsibilities)) return 'intern';
  if (
    /faculty|trainer|instructor|lecturer/.test(responsibilities) ||
    (user.role === 'EMPLOYEE' && /training|education/.test(department))
  ) {
    return 'faculty';
  }
  if (
    /operations?/.test(department) &&
    (user.role === 'DIRECTOR' || user.role === 'MANAGER' || /operations? head/.test(responsibilities))
  ) {
    return 'operationHead';
  }
  if (user.role === 'DIRECTOR' || user.role === 'SALES_DIRECTOR') return 'director';
  if (user.role === 'MANAGER') return 'teamLead';
  return 'employee';
}

function getDepartmentWorkspace(user: PreviewUser): string | undefined {
  const { department, responsibilities } = getUserContext(user);
  const designation = user.designation.toLowerCase();

  if (user.role === 'SALES_DIRECTOR' || user.role === 'SALES_EMPLOYEE' || /sales|business development|partnership/.test(department)) {
    return 'Sales Department';
  }
  if (/intern/.test(designation) || /intern/.test(department)) return 'Interns';
  if (/faculty|trainer|instructor|lecturer/.test(designation) || /training|education/.test(department)) return 'Trainer';
  if (/technology|development|technical/.test(department)) return 'Technical Team';
  if (/operations?|ops/.test(department)) return 'Operation Team';
  if (/counsel/.test(department)) return 'Counselor';
  if (/tele.?caller/.test(department)) return 'TeleCaller';
  if (/media|marketing/.test(department)) return 'Media';
  if (/intern/.test(responsibilities)) return 'Interns';
  if (/faculty|trainer|instructor|lecturer/.test(responsibilities)) return 'Trainer';
  if (/technology|development|technical/.test(responsibilities)) return 'Technical Team';
  if (/operations?|ops/.test(responsibilities)) return 'Operation Team';
  if (/counsel/.test(responsibilities)) return 'Counselor';
  if (/tele.?caller/.test(responsibilities)) return 'TeleCaller';
  if (/media|marketing/.test(responsibilities)) return 'Media';
  return undefined;
}

function getAllowedWorkspaceItems(persona: PreviewPersona, workspace: string): string[] | undefined {
  if (persona === 'faculty' && workspace === 'Trainer') {
    return ['Trainer Dashboard', 'Assigned Batches', 'Session Management', 'Training Schedule', 'Student Progress', 'Trainer Reports'];
  }
  if (persona === 'intern' && workspace === 'Interns') {
    return ['Intern Dashboard', 'Assigned Tasks', 'Daily Reports', 'Mentor Details', 'Feedback', 'Attendance'];
  }
  if (persona === 'employee') {
    const employeeItems: Record<string, string[]> = {
      Media: ['Media Dashboard', 'Content Calendar', 'Content Production', 'Creative Requests', 'Campaign Management'],
      Counselor: ['Counselor Dashboard', 'Student Enquiries', 'Counselling Sessions', 'Follow-ups', 'Student Applications'],
      TeleCaller: ['TeleCaller Dashboard', 'Call Assignments', 'Call Logs', 'Follow-ups', 'Lead Management'],
      'Technical Team': ['Technical Dashboard', 'Development Tasks', 'Projects', 'Bug Tracking', 'Technical Documentation'],
      'Sales Department': ['Sales Dashboard', 'College Visits', 'CRM Leads', 'Sales Follow-ups'],
      'Operation Team': ['Operational Tasks', 'Process Tracking', 'Event Coordination'],
    };
    return employeeItems[workspace] ?? [];
  }
  return undefined;
}

function allowedLabelsForSection(
  section: NavigationSection,
  persona: PreviewPersona,
  user: PreviewUser,
  departmentWorkspace?: string
): string[] {
  const { responsibilities } = getUserContext(user);

  switch (section.label) {
    case 'Overview':
      if (persona === 'founder' || persona === 'director' || persona === 'teamLead' || persona === 'operationHead' || persona === 'faculty') {
        return ['Main Dashboard', 'My Workspace', 'My Tasks', 'My Reports', 'Notifications'];
      }
      return ['My Workspace', 'My Tasks', 'My Reports', 'Notifications'];
    case 'Organization':
      return persona === 'director' || persona === 'teamLead' || persona === 'operationHead'
        ? ['Employees', 'Departments', 'Teams']
        : [];
    case 'Operations':
      if (persona === 'founder' || persona === 'director' || persona === 'teamLead' || persona === 'operationHead') {
        return section.entries.map((entry) => entry.label);
      }
      if (persona === 'faculty') return ['Tasks', 'Meetings', 'Daily Reports', 'Attendance', 'Leave Management'];
      if (persona === 'intern') return ['Tasks', 'Daily Reports', 'Attendance'];
      return ['Tasks', 'Projects', 'Meetings', 'Daily Reports', 'Attendance', 'Leave Management'];
    case 'Department Workspaces':
      return departmentWorkspace ? [departmentWorkspace] : [];
    case 'Learning Management':
      if (persona === 'founder') return section.entries.map((entry) => entry.label);
      if (persona === 'faculty') {
        return ['LMS Dashboard', 'Courses', 'Batches', 'Students', 'Batch Attendance', 'Assessments', 'Student Progress', 'Completion Reports'];
      }
      if (/learning|education|training|lms/.test(responsibilities)) {
        return ['LMS Dashboard', 'Programmes', 'Courses', 'Batches', 'Faculty', 'Students', 'Enrollment', 'Batch Attendance', 'Assessments', 'Student Progress', 'Completion Reports'];
      }
      return persona === 'employee' || persona === 'intern' ? ['Courses'] : [];
    case 'Events & Network':
      if (persona === 'founder') return section.entries.map((entry) => entry.label);
      if (departmentWorkspace === 'Sales Department') return section.entries.map((entry) => entry.label);
      return persona === 'operationHead' ? ['Events', 'Expos'] : [];
    case 'Administration': {
      if (persona === 'founder') return section.entries.map((entry) => entry.label);

      const entries = persona === 'director' || persona === 'operationHead'
        ? ['Documents', 'Reports & Analytics']
        : [];
      if (/finance|financial|accounts/.test(responsibilities)) {
        entries.push('Finance', 'Expense Claims');
      }
      if (/asset|facilit|maintenance/.test(responsibilities)) {
        entries.push('Physical Assets');
      }
      return entries;
    }
    default:
      return [];
  }
}

export function getRoleNavigationSections(user: CurrentEmployee | null): NavigationSection[] {
  if (!user || user.role === 'FOUNDER') return navigationSections;

  const persona = getPersona(user);
  const departmentWorkspace = getDepartmentWorkspace(user);

  return navigationSections.flatMap((section) => {
    const allowedLabels = allowedLabelsForSection(section, persona, user, departmentWorkspace);
    const entries = section.entries.flatMap((entry): NavigationEntry[] => {
      if (section.label === 'Department Workspaces') {
        if (entry.label !== departmentWorkspace || !entry.children) return [];
        const allowedChildren = getAllowedWorkspaceItems(persona, entry.label);
        const children = allowedChildren
          ? entry.children.filter((child) => allowedChildren.includes(child.label))
          : entry.children;
        return children.length ? [{ ...entry, children }] : [];
      }
      return allowedLabels.includes(entry.label) ? [entry] : [];
    });

    return entries.length ? [{ ...section, entries }] : [];
  });
}

export function countNavigationEntries(sections: NavigationSection[]): number {
  return sections.reduce(
    (count, section) =>
      count + section.entries.reduce((entryCount, entry) => entryCount + 1 + (entry.children?.length ?? 0), 0),
    0
  );
}

export function getRoleNavigationEntries(user: CurrentEmployee | null): FlatNavigationEntry[] {
  const sections = getRoleNavigationSections(user);
  const visibleHrefs = new Set(
    sections.flatMap((section) =>
      section.entries.flatMap((entry) => [
        ...(entry.href ? [entry.href] : []),
        ...(entry.children?.flatMap((child) => child.href ? [child.href] : []) ?? []),
      ])
    )
  );
  return flatNavigation.filter((entry) => entry.href && visibleHrefs.has(entry.href));
}
