'use client';

import React from 'react';
import {
  Building2,
  GraduationCap,
  Handshake,
  Users,
  FileCheck2,
  CalendarClock,
  ArrowRight,
  MapPin,
  Clock,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import {
  mockColleges,
  mockCollegeVisits,
  mockFDPSessions,
  mockTieups,
  mockInterestedClients,
  mockAgreements,
  mockSalesFollowUps,
} from '@/data/mock/salesCRM';

interface SalesDashboardProps {
  onNavigate: (section: string, collegeId?: string) => void;
}

export default function SalesDashboard({ onNavigate }: SalesDashboardProps) {
  const activeTieupsCount = mockTieups.filter(
    (t) => t.status === 'Active' || t.status === 'Signed'
  ).length;
  const agreementsSignedCount = mockAgreements.filter(
    (a) => a.status === 'Active' || a.status === 'Signed'
  ).length;
  const pendingFollowUpsCount = mockSalesFollowUps.filter(
    (f) => f.status === 'Pending' || f.status === 'Overdue'
  ).length;
  const overdueFollowUpsCount = mockSalesFollowUps.filter(
    (f) => f.status === 'Overdue'
  ).length;

  const topStats = [
    {
      label: 'Total Colleges',
      value: mockColleges.length,
      sub: 'Unified Profiles',
      icon: Building2,
      color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40 dark:text-violet-300',
    },
    {
      label: 'Total College Visits',
      value: mockCollegeVisits.length,
      sub: 'Logged Field Visits',
      icon: MapPin,
      color: 'text-fuchsia-600 bg-fuchsia-100 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
    },
    {
      label: 'FDP Sessions',
      value: mockFDPSessions.length,
      sub: `${mockFDPSessions.filter((f) => f.status === 'Approved').length} Approved`,
      icon: GraduationCap,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300',
    },
    {
      label: 'Active Tie-ups',
      value: activeTieupsCount,
      sub: `${mockTieups.length} Total Partnerships`,
      icon: Handshake,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    {
      label: 'Interested Clients',
      value: mockInterestedClients.length,
      sub: 'Active CRM Pipeline',
      icon: Users,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300',
    },
    {
      label: 'Agreements Signed',
      value: agreementsSignedCount,
      sub: `${mockAgreements.filter((a) => a.status === 'Expiring Soon').length} Expiring Soon`,
      icon: FileCheck2,
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/40 dark:text-rose-300',
    },
    {
      label: 'Follow-ups Pending',
      value: pendingFollowUpsCount,
      sub: `${overdueFollowUpsCount} Overdue`,
      icon: CalendarClock,
      color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300',
    },
  ];

  const navCards = [
    {
      id: 'visits',
      title: 'College Visits',
      description: 'Schedule and track college visits, TPO discussions, requirements, and follow-ups.',
      count: `${mockCollegeVisits.length} Visits`,
      icon: Building2,
      iconBg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300',
      borderHover: 'hover:border-violet-400 dark:hover:border-violet-600',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800',
    },
    {
      id: 'fdp',
      title: 'FDP Sessions',
      description: 'Manage Faculty Development Programs (FDPs), institutional proposals, pitches, and outcomes.',
      count: `${mockFDPSessions.length} Sessions`,
      icon: GraduationCap,
      iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
      borderHover: 'hover:border-blue-400 dark:hover:border-blue-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    },
    {
      id: 'tieups',
      title: 'Tie-ups',
      description: 'Track college partnerships, MoUs, collaborations, validity dates, and negotiation status.',
      count: `${mockTieups.length} Tie-ups`,
      icon: Handshake,
      iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
      borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
      id: 'clients',
      title: 'Interested Clients',
      description: 'Manage potential clients, enquiries, pipeline stages (Kanban & Table), and interaction timelines.',
      count: `${mockInterestedClients.length} Clients`,
      icon: Users,
      iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
      borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    },
    {
      id: 'agreements',
      title: 'Agreements',
      description: 'Upload, preview, and manage signed MoUs, training agreements, versions, and expiry alerts.',
      count: `${mockAgreements.length} Agreements`,
      icon: FileCheck2,
      iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300',
      borderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    },
  ];

  // Outcome breakdown bars
  const outcomeGroups = [
    { label: 'Interested', count: mockCollegeVisits.filter((v) => v.outcome === 'Interested').length, color: 'bg-emerald-500' },
    { label: 'Tie-up in Discussion / Completed', count: mockCollegeVisits.filter((v) => v.outcome === 'Tie-up in Discussion' || v.outcome === 'Tie-up Completed').length, color: 'bg-violet-500' },
    { label: 'Proposal / Meeting', count: mockCollegeVisits.filter((v) => v.outcome === 'Proposal Requested' || v.outcome === 'Meeting Scheduled').length, color: 'bg-blue-500' },
    { label: 'Follow-up Required', count: mockCollegeVisits.filter((v) => v.outcome === 'Follow-up Required').length, color: 'bg-amber-500' },
    { label: 'Not Interested', count: mockCollegeVisits.filter((v) => v.outcome === 'Not Interested').length, color: 'bg-rose-500' },
  ];
  const maxOutcome = Math.max(1, ...outcomeGroups.map((g) => g.count));

  const recentVisits = [...mockCollegeVisits]
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate))
    .slice(0, 5);

  const pendingFollowUps = [...mockSalesFollowUps]
    .filter((f) => f.status === 'Pending' || f.status === 'Overdue')
    .sort((a, b) => (a.status === 'Overdue' ? -1 : b.status === 'Overdue' ? 1 : a.followUpDate.localeCompare(b.followUpDate)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {topStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</p>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">{stat.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Box-Based Navigation */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Sales Department Modules</h2>
            <p className="text-xs text-slate-500">Click any module card to open its workspace directly</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('followups')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              Follow-ups ({pendingFollowUpsCount})
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className="px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-bold flex items-center gap-1.5 hover:bg-violet-100 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics & Reports
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`group text-left p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${card.borderHover} shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                    {card.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-center justify-between">
                    {card.title}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-violet-600" />
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity + Mini Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent College Visits */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-600" />
              Recent College Visits
            </h3>
            <button onClick={() => onNavigate('visits')} className="text-xs font-bold text-violet-600 hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-2.5">
            {recentVisits.map((visit) => (
              <div
                key={visit.id}
                onClick={() => onNavigate('college', visit.collegeId)}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-violet-300 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{visit.collegeName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 shrink-0">
                    {visit.outcome}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                  <span>{visit.assignedEmployee}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {visit.visitDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending & Overdue Follow-ups */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-500" />
              Pending & Overdue Follow-ups
            </h3>
            <button onClick={() => onNavigate('followups')} className="text-xs font-bold text-violet-600 hover:underline">
              Open Tracker
            </button>
          </div>
          <div className="space-y-2.5">
            {pendingFollowUps.map((fu) => (
              <div
                key={fu.id}
                onClick={() => fu.collegeId && onNavigate('college', fu.collegeId)}
                className={`p-3 rounded-xl border transition-colors ${
                  fu.status === 'Overdue'
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                } ${fu.collegeId ? 'cursor-pointer hover:border-violet-300' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{fu.title}</p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                      fu.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}
                  >
                    {fu.status === 'Overdue' ? <AlertCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {fu.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                  <span className="truncate">{fu.relatedCollege} • {fu.assignedEmployee}</span>
                  <span className="font-semibold shrink-0">{fu.followUpDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Analytics: Visits by Outcome */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Visits by Outcome
            </h3>
            <button onClick={() => onNavigate('analytics')} className="text-xs font-bold text-violet-600 hover:underline">
              Full Report
            </button>
          </div>
          <div className="space-y-3">
            {outcomeGroups.map((g) => (
              <div key={g.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{g.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{g.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${g.color}`}
                    style={{ width: `${Math.round((g.count / maxOutcome) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-bold text-slate-500 mb-2">Quick College Profiles</p>
            <div className="flex flex-wrap gap-1.5">
              {mockColleges.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => onNavigate('college', c.id)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 border border-violet-200 dark:border-violet-800 transition-colors"
                >
                  {c.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
