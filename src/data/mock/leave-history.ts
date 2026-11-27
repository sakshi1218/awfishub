export interface LeaveRecord {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  leaveType: 'Casual' | 'Sick' | 'Privilege' | 'Unpaid';
  status: 'Approved' | 'Pending' | 'Rejected';
  reason: string;
}

export const MOCK_LEAVE_HISTORY: Record<string, LeaveRecord[]> = {
  'AWF-EMP-002': [
    {
      id: 'LV-DEMO-001',
      startDate: '2026-10-12',
      endDate: '2026-10-12',
      totalDays: 1,
      leaveType: 'Sick',
      status: 'Approved',
      reason: 'Medical appointment',
    },
    {
      id: 'LV-DEMO-002',
      startDate: '2025-12-24',
      endDate: '2025-12-26',
      totalDays: 3,
      leaveType: 'Casual',
      status: 'Approved',
      reason: 'Personal time off',
    },
  ],
  'AWF-EMP-003': [
    {
      id: 'LV-DEMO-003',
      startDate: '2026-08-03',
      endDate: '2026-08-04',
      totalDays: 2,
      leaveType: 'Privilege',
      status: 'Approved',
      reason: 'Personal commitments',
    },
  ],
  'AWF-EMP-004': [
    {
      id: 'LV-DEMO-004',
      startDate: '2026-07-17',
      endDate: '2026-07-17',
      totalDays: 1,
      leaveType: 'Casual',
      status: 'Approved',
      reason: 'Personal work',
    },
  ],
  'AWF-EMP-005': [
    {
      id: 'LV-DEMO-005',
      startDate: '2026-06-22',
      endDate: '2026-06-23',
      totalDays: 2,
      leaveType: 'Sick',
      status: 'Approved',
      reason: 'Recovery from seasonal illness',
    },
  ],
  'AWF-EMP-006': [
    {
      id: 'LV-DEMO-006',
      startDate: '2026-09-11',
      endDate: '2026-09-11',
      totalDays: 1,
      leaveType: 'Casual',
      status: 'Pending',
      reason: 'Personal work',
    },
  ],
  'AWF-EMP-007': [
    {
      id: 'LV-DEMO-007',
      startDate: '2026-05-04',
      endDate: '2026-05-05',
      totalDays: 2,
      leaveType: 'Privilege',
      status: 'Approved',
      reason: 'Family event',
    },
  ],
  'AWF-EMP-010': [
    {
      id: 'LV-DEMO-008',
      startDate: '2026-04-15',
      endDate: '2026-04-15',
      totalDays: 1,
      leaveType: 'Casual',
      status: 'Approved',
      reason: 'Personal work',
    },
  ],
  'AWF-EMP-011': [
    {
      id: 'LV-DEMO-009',
      startDate: '2025-11-06',
      endDate: '2025-11-07',
      totalDays: 2,
      leaveType: 'Sick',
      status: 'Approved',
      reason: 'Seasonal illness',
    },
  ],
  'AWF-EMP-012': [
    {
      id: 'LV-DEMO-010',
      startDate: '2026-03-19',
      endDate: '2026-03-19',
      totalDays: 1,
      leaveType: 'Casual',
      status: 'Approved',
      reason: 'Personal work',
    },
  ],
  'AWF-EMP-014': [
    {
      id: 'LV-DEMO-011',
      startDate: '2026-02-02',
      endDate: '2026-02-02',
      totalDays: 1,
      leaveType: 'Unpaid',
      status: 'Rejected',
      reason: 'Insufficient notice',
    },
  ],
  'AWF-EMP-016': [
    {
      id: 'LV-DEMO-012',
      startDate: '2025-10-20',
      endDate: '2025-10-21',
      totalDays: 2,
      leaveType: 'Privilege',
      status: 'Approved',
      reason: 'Family commitments',
    },
  ],
  'AWF-INT-001': [
    {
      id: 'LV-DEMO-013',
      startDate: '2026-09-21',
      endDate: '2026-09-21',
      totalDays: 1,
      leaveType: 'Casual',
      status: 'Approved',
      reason: 'College examination',
    },
  ],
  'AWF-INT-002': [
    {
      id: 'LV-DEMO-014',
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      totalDays: 1,
      leaveType: 'Sick',
      status: 'Approved',
      reason: 'Not feeling well',
    },
  ],
};
