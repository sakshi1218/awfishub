'use client';

import React, { useState } from 'react';
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  MOCK_PLACEMENT_DRIVES,
  MOCK_RECRUITMENT_CANDIDATES,
} from '@/data/mock/placementDrives';

type PlacementTab = 'drives' | 'students';

const statusVariant = (status: string) => {
  if (status === 'Open' || status === 'Ready to shortlist') return 'success';
  if (status === 'Screening' || status === 'Interviewing') return 'warning';
  if (status === 'Offer received') return 'info';
  return 'default';
};

export default function PlacementDrivesPage() {
  const [activeTab, setActiveTab] = useState<PlacementTab>('drives');
  const activeDrives = MOCK_PLACEMENT_DRIVES.filter((drive) => drive.status !== 'Completed').length;
  const totalApplicants = MOCK_PLACEMENT_DRIVES.reduce((total, drive) => total + drive.applicants, 0);
  const studentsWithOffers = MOCK_RECRUITMENT_CANDIDATES.filter((candidate) => candidate.status === 'Offer received').length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Placement Drives"
        subtitle="Founder overview of hiring activity, student readiness, and placement outcomes."
        icon={BriefcaseBusiness}
        badge="Founder View"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Active Drives', value: activeDrives, icon: BriefcaseBusiness, detail: 'Open or screening' },
          { label: 'Total Applicants', value: totalApplicants, icon: Users, detail: 'Across all listed drives' },
          { label: 'Offers Received', value: studentsWithOffers, icon: GraduationCap, detail: 'In this sample dataset' },
        ].map(({ label, value, icon: Icon, detail }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">{label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] text-slate-400">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('drives')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'drives'
              ? 'border-violet-600 text-violet-700 dark:text-violet-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-pressed={activeTab === 'drives'}
        >
          All Drives <span className="ml-1 text-[10px] opacity-70">{MOCK_PLACEMENT_DRIVES.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'students'
              ? 'border-violet-600 text-violet-700 dark:text-violet-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
          aria-pressed={activeTab === 'students'}
        >
          Recruit Students <span className="ml-1 text-[10px] opacity-70">{MOCK_RECRUITMENT_CANDIDATES.length}</span>
        </button>
      </div>

      {activeTab === 'drives' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {MOCK_PLACEMENT_DRIVES.map((drive) => (
            <article key={drive.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{drive.company}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{drive.role}</p>
                  </div>
                </div>
                <StatusBadge label={drive.status} variant={statusVariant(drive.status)} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> {drive.location}
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" /> Drive: {drive.driveDate}
                </div>
                <p className="text-slate-600 dark:text-slate-300"><span className="text-slate-400">Package:</span> {drive.package}</p>
                <p className="text-slate-600 dark:text-slate-300"><span className="text-slate-400">Applicants:</span> {drive.applicants} / {drive.openings} openings</p>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Eligible programs · Apply by {drive.applicationDeadline}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {drive.eligiblePrograms.map((program) => (
                    <span key={program} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {program}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Placement-ready students</h2>
            <p className="mt-1 text-xs text-slate-500">Sample candidate pool and recruitment pipeline status.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800/60">
                <tr>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Program & College</th>
                  <th className="px-5 py-3">Skills</th>
                  <th className="px-5 py-3">Readiness</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MOCK_RECRUITMENT_CANDIDATES.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{candidate.name}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">{candidate.id}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">{candidate.program}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{candidate.college}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.map((skill) => (
                          <span key={skill} className="rounded-md bg-slate-100 px-1.5 py-1 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{skill}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${candidate.readiness}%` }} />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{candidate.readiness}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={candidate.status} variant={statusVariant(candidate.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
