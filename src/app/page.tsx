'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import FounderDashboard from '@/modules/founder-dashboard/FounderDashboard';
import DirectorDashboard from '@/components/dashboard/DirectorDashboard';
import OperationHeadDashboard from '@/components/dashboard/OperationHeadDashboard';
import TeamLeadDashboard from '@/components/dashboard/TeamLeadDashboard';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import InternDashboard from '@/components/dashboard/InternDashboard';
import DashboardModuleLauncher from '@/components/dashboard/DashboardModuleLauncher';

export default function MasterDashboardPage() {
  const { currentRole } = useApp();

  if (currentRole === 'CHAIRPERSON') {
    return <FounderDashboard />;
  }

  const renderRoleOverview = () => {
    switch (currentRole) {
      case 'DIRECTOR':
        return <DirectorDashboard />;
      case 'OPERATION_HEAD':
        return <OperationHeadDashboard />;
      case 'TEAM_LEAD':
        return <TeamLeadDashboard />;
      case 'FACULTY':
        return <FacultyDashboard />;
      case 'STAFF':
        return <StaffDashboard />;
      case 'INTERN':
        return <InternDashboard />;
      default:
        return <DirectorDashboard />;
    }
  };

  return (
    <div className="space-y-8">
      {renderRoleOverview()}
      <DashboardModuleLauncher />
    </div>
  );
}
