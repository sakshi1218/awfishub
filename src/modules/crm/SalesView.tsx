'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Handshake,
  Users,
  FileCheck2,
  CalendarClock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import SalesDashboard from './SalesDashboard';
import CollegeVisits from './CollegeVisits';
import FDPSessions from './FDPSessions';
import Tieups from './Tieups';
import InterestedClients from './InterestedClients';
import Agreements from './Agreements';
import FollowUps from './FollowUps';
import SalesAnalytics from './SalesAnalytics';
import CollegeProfile from './CollegeProfile';

export type SalesTabType =
  | 'DASHBOARD'
  | 'VISITS'
  | 'FDP'
  | 'TIEUPS'
  | 'CRM'
  | 'AGREEMENTS'
  | 'FOLLOWUPS'
  | 'PERFORMANCE'
  | 'COLLEGE';

const TAB_MAP: Record<string, SalesTabType> = {
  dashboard: 'DASHBOARD',
  visits: 'VISITS',
  fdp: 'FDP',
  tieups: 'TIEUPS',
  clients: 'CRM',
  agreements: 'AGREEMENTS',
  followups: 'FOLLOWUPS',
  analytics: 'PERFORMANCE',
  college: 'COLLEGE',
};

export function SalesView({ defaultTab = 'DASHBOARD' }: { defaultTab?: SalesTabType }) {
  const [activeTab, setActiveTab] = useState<SalesTabType>(defaultTab);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  const handleNavigate = (section: string, collegeId?: string) => {
    if (section === 'college' && collegeId) {
      setSelectedCollegeId(collegeId);
      setActiveTab('COLLEGE');
      return;
    }
    const mapped = TAB_MAP[section.toLowerCase()];
    if (mapped) {
      setActiveTab(mapped);
    }
  };

  const handleViewCollege = (collegeId: string) => {
    setSelectedCollegeId(collegeId);
    setActiveTab('COLLEGE');
  };

  const navButtons: { id: SalesTabType; label: string; icon: React.ElementType }[] = [
    { id: 'DASHBOARD', label: 'Sales Dashboard', icon: LayoutDashboard },
    { id: 'VISITS', label: 'College Visits', icon: Building2 },
    { id: 'FDP', label: 'FDP Sessions', icon: GraduationCap },
    { id: 'TIEUPS', label: 'Tie-ups', icon: Handshake },
    { id: 'CRM', label: 'Interested Clients', icon: Users },
    { id: 'AGREEMENTS', label: 'Agreements', icon: FileCheck2 },
    { id: 'FOLLOWUPS', label: 'Follow-ups', icon: CalendarClock },
    { id: 'PERFORMANCE', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Department CRM"
        subtitle="Unified institutional sales workspace — College Visits, FDP Pitches, Tie-ups, Interested Clients, Agreements & Follow-ups."
        icon={TrendingUp}
        badge="Sales CRM"
      />

      {/* Right-screen horizontal box navigation (no dropdowns, no sidebar submenus) */}
      <div className="flex flex-wrap gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {navButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-slate-800 hover:text-violet-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {activeTab === 'DASHBOARD' && <SalesDashboard onNavigate={handleNavigate} />}
      {activeTab === 'VISITS' && <CollegeVisits onViewCollege={handleViewCollege} />}
      {activeTab === 'FDP' && <FDPSessions onViewCollege={handleViewCollege} />}
      {activeTab === 'TIEUPS' && <Tieups onViewCollege={handleViewCollege} />}
      {activeTab === 'CRM' && <InterestedClients onViewCollege={handleViewCollege} />}
      {activeTab === 'AGREEMENTS' && <Agreements onViewCollege={handleViewCollege} />}
      {activeTab === 'FOLLOWUPS' && <FollowUps />}
      {activeTab === 'PERFORMANCE' && <SalesAnalytics />}
      {activeTab === 'COLLEGE' && selectedCollegeId && (
        <CollegeProfile
          collegeId={selectedCollegeId}
          onBack={() => setActiveTab('DASHBOARD')}
        />
      )}
    </div>
  );
}
