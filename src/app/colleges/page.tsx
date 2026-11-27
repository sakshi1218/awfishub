'use client';

import React, { useState } from 'react';
import { Building2, Award, Lock, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CollegePartner } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function CollegesAndExpertsPage() {
  const { colleges, experts, updateCollegeWorkshop, isChairperson } = useApp();
  const [tab, setTab] = useState<'COLLEGES' | 'EXPERTS'>('COLLEGES');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colleges & Experts Directory"
        subtitle="College TPO partnerships, Workshop statuses (Not Taken, Assigned, Conducted), MoUs, and Guest Experts."
        icon={Building2}
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button onClick={() => setTab('COLLEGES')} className={`px-3 py-1.5 rounded-lg font-bold ${tab === 'COLLEGES' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              Colleges ({colleges.length})
            </button>
            <button onClick={() => setTab('EXPERTS')} className={`px-3 py-1.5 rounded-lg font-bold ${tab === 'EXPERTS' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              Experts ({experts.length})
            </button>
          </div>
        }
      />

      {tab === 'COLLEGES' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleges.map((col) => (
            <div key={col.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-[10px] text-blue-600 font-bold">{col.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{col.name}</h3>
                  <p className="text-[11px] text-slate-500">{col.address}</p>
                </div>
                <StatusBadge label={col.agreementStatus} variant={col.agreementStatus === 'Active' ? 'success' : 'warning'} />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p>TPO: <b>{col.tpoName}</b></p>
                <p className="text-slate-500">{col.tpoPhone} • {col.tpoEmail}</p>
                <p>Visits: <b>{col.visitCount}</b> • FDPs: <b>{col.fdpCount}</b> • SDF: <b>{col.sdfSigned ? 'Yes' : 'No'}</b></p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300">Workshop Status:</span>
                <select
                  value={col.workshopStatus}
                  onChange={(e) => updateCollegeWorkshop(col.id, e.target.value as CollegePartner['workshopStatus'])}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                >
                  <option value="Not Taken">Not Taken</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Conducted">Conducted</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experts.map((exp) => (
            <div key={exp.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> {exp.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{exp.email} • {exp.phone}</p>
                </div>
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" /> {exp.feedbackRating}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {exp.expertise.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                    {skill}
                  </span>
                ))}
              </div>

              <p className="text-[11px] text-slate-500">Associated: <b>{exp.associatedEventOrCollege}</b> ({exp.sessionsCount} Sessions)</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Honorarium:</span>
                {isChairperson ? (
                  <span className="font-bold text-emerald-600">₹{exp.honorariumAmount.toLocaleString('en-IN')} / session</span>
                ) : (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Chairperson Finance Only
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
