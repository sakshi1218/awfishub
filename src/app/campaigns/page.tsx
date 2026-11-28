'use client';

import React, { useState } from 'react';
import { Megaphone, Plus, CheckCircle2, Clock, Lock, LayoutDashboard, Users, ExternalLink } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DepartmentType } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

type WorkshopTab = 'all' | 'internal' | 'external';

export default function CampaignsPage() {
  const { campaigns, addCampaign, isChairperson, currentEmployee } = useApp();
  const [activeTab, setActiveTab] = useState<WorkshopTab>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [deadline, setDeadline] = useState('2026-12-31');

  const isExternalWorkshop = (camp: (typeof campaigns)[number]) => {
    if (/mindlyft\s*ai/i.test(camp.title)) return false;
    return /\b(student|college|campus|expo|admission|roadshow|client|public|partner)\b/i.test(`${camp.title} ${camp.objective}`);
  };
  const visibleWorkshops = campaigns.filter((camp) =>
    activeTab === 'all' || (activeTab === 'external' ? isExternalWorkshop(camp) : !isExternalWorkshop(camp))
  );
  const demoTrainers: Record<string, string> = {
    'CMP-201': 'Amit Verma',
    'CMP-202': 'Pooja Verma',
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addCampaign({
      title,
      objective,
      participatingDepartments: ['Media', 'Sales Department', 'TeleCaller'] as DepartmentType[],
      assignedEmployees: [currentEmployee.name],
      leadManager: currentEmployee.name,
      startDate: '2026-11-25',
      deadline,
      status: 'Planning',
      leadsGenerated: 0,
      budgetRef: 150000,
      spentRef: 0,
      milestones: [{ title: 'Campaign Kickoff & Asset Prep', due: deadline, done: false }],
      documents: ['Campaign_Charter.pdf'],
    });
    setShowCreate(false);
    setTitle('');
    setObjective('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workshop Management"
        subtitle="Manage internal and external workshops, participating teams, milestones, and outcomes."
        icon={Megaphone}
        badge={`${campaigns.length} Workshops`}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Workshop
          </button>
        }
      />

      <div role="tablist" aria-label="Workshop categories" className="flex w-full gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {([
          { id: 'all', label: 'All Workshops', icon: LayoutDashboard },
          { id: 'internal', label: 'Internal Workshops', icon: Users },
          { id: 'external', label: 'External Workshops', icon: ExternalLink },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${selected ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleWorkshops.map((camp) => (
          <div key={camp.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-orange-600">{camp.id}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{camp.title}</h3>
              </div>
              <StatusBadge label={camp.status} variant={camp.status === 'Active' ? 'success' : 'info'} />
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">{camp.objective}</p>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              Trainer: <span className="font-semibold text-slate-900 dark:text-white">{demoTrainers[camp.id] || 'To be assigned'}</span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Milestones</span>
              {camp.milestones.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    {m.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                    {m.title}
                  </span>
                  <span className="text-[10px] font-mono">{m.due}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span>Leads Generated: <b>{camp.leadsGenerated}</b></span>
              {isChairperson ? (
                <span className="font-bold text-emerald-600">
                  Budget: ₹{(camp.spentRef / 1000).toFixed(0)}k / ₹{(camp.budgetRef / 1000).toFixed(0)}k
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Financial figures restricted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {visibleWorkshops.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          No {activeTab} workshops yet.
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Workshop</h3>
            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <input required placeholder="Workshop Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <textarea required rows={3} placeholder="Workshop Objectives" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-orange-600 text-white font-bold">Launch Workspace</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
