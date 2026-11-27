'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';
import {
  CompanyPillar,
  VerticalDirector,
  VerticalEmployee,
  VerticalProject,
} from '@/data/mock/founderPillars';

interface VerticalDetailViewProps {
  pillar: CompanyPillar;
  onBack: () => void;
}

export default function VerticalDetailView({ pillar, onBack }: VerticalDetailViewProps) {
  const [selectedDirector, setSelectedDirector] = useState<VerticalDirector | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<VerticalEmployee | null>(null);
  const [selectedProject, setSelectedProject] = useState<VerticalProject | null>(null);

  const activeProjects = pillar.projects.filter((p) => p.status === 'Active');
  const completedProjects = pillar.projects.filter((p) => p.status === 'Completed');
  const pendingTasks = pillar.tasks.filter((t) => t.status === 'Pending' || t.status === 'In Progress');
  const overdueTasks = pillar.tasks.filter((t) => t.status === 'Overdue');

  return (
    <div className="space-y-7 pb-12">
      {/* Top Navigation Bar: Back link */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#181c25] border border-purple-200 dark:border-purple-900/50 text-sm font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Company Overview</span>
        </button>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Founder Vertical Command
        </span>
      </div>

      {/* Vertical Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#181c25] border border-purple-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md ${pillar.accentColor.badgeBg} ${pillar.accentColor.badgeText}`}>
                Company Pillar
              </span>
              <span className="text-xs text-slate-400 font-medium">{pillar.subtitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2">
              {pillar.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {pillar.description}
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 shrink-0">
            {pillar.stats.map((st) => (
              <div
                key={st.label}
                className="p-3.5 rounded-2xl bg-[#faf8ff] dark:bg-[#120d22] border border-purple-100 dark:border-purple-900/30 text-center"
              >
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {st.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {st.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned Director Details (Interactive Card) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181c25] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Assigned Vertical Director
            </h2>
          </div>
          <button
            onClick={() => setSelectedDirector(pillar.director)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
          >
            View Full Director Profile →
          </button>
        </div>

        <div
          onClick={() => setSelectedDirector(pillar.director)}
          className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/60 via-slate-50 to-white dark:from-purple-950/20 dark:via-slate-900 dark:to-[#181c25] border border-purple-200/70 dark:border-purple-900/40 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-5"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              {pillar.director.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {pillar.director.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {pillar.director.id}
                </span>
              </div>
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-0.5">
                {pillar.director.role} • {pillar.director.department}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl line-clamp-2">
                {pillar.director.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-purple-100 dark:border-purple-900/30">
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{pillar.director.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{pillar.director.phone}</span>
              </div>
            </div>
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
            >
              Direct Message
            </button>
          </div>
        </div>
      </div>

      {/* Projects Section: Active & Completed with Progress & Milestones */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181c25] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              Vertical Projects & Milestones ({pillar.projects.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeProjects.length} Active in flight • {completedProjects.length} Successfully completed
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Click any project to inspect milestones & team</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillar.projects.map((proj) => {
            const isCompleted = proj.status === 'Completed';
            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProject(proj)}
                className="p-5 rounded-2xl bg-[#faf8ff] dark:bg-[#120d22] border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer flex flex-col justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                      {proj.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-slate-900 dark:text-white font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-purple-600'
                        }`}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-purple-100 dark:border-purple-900/30">
                    <span>
                      Lead: <strong className="text-slate-700 dark:text-slate-200">{proj.lead}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {proj.deadline}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Grid: Employees & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members / Employees */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#181c25] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Team Members ({pillar.employees.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Click any employee to see workload and details</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              All Active
            </span>
          </div>

          <div className="space-y-2.5">
            {pillar.employees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="p-3.5 rounded-2xl bg-[#faf8ff] dark:bg-[#120d22] border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {emp.name}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">({emp.id})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {emp.role} • {emp.team}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {emp.activeTasks} open tasks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks & Priorities */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#181c25] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Tasks & Urgent Priorities ({pillar.tasks.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pendingTasks.length} Pending • {overdueTasks.length} Overdue
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {pillar.tasks.map((task) => {
              const isOverdue = task.status === 'Overdue';
              const isCrit = task.priority === 'Critical';
              return (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      : 'bg-[#faf8ff] dark:bg-[#120d22] border-purple-100 dark:border-purple-900/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {task.id}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            isCrit
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-600 text-white flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                        {task.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-purple-100/60 dark:border-purple-900/20">
                    <span>
                      Assigned: <strong className="text-slate-700 dark:text-slate-200">{task.assignedTo}</strong>
                    </span>
                    <span>Due: <b>{task.dueDate}</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Team Activities */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#181c25] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Recent Vertical Activity Stream
        </h2>
        <div className="divide-y divide-purple-100 dark:divide-purple-900/30">
          {pillar.activities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">{act.user}</strong> {act.action}{' '}
                  <strong className="text-purple-700 dark:text-purple-300">{act.target}</strong>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DIRECTOR DETAIL MODAL */}
      {selectedDirector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#181c25] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDirector(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-lg">
                {selectedDirector.avatar}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedDirector.name}
                </h3>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {selectedDirector.role}
                </p>
                <p className="text-xs text-slate-400">{selectedDirector.department}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Director Biography</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-[#faf8ff] dark:bg-[#120d22] p-3.5 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  {selectedDirector.bio}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Operational Responsibilities</span>
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                  {selectedDirector.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Email</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedDirector.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Direct Line</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedDirector.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedDirector(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE DETAIL MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#181c25] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                {selectedEmployee.id}
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                {selectedEmployee.name}
              </h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {selectedEmployee.role} • {selectedEmployee.team}
              </p>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#faf8ff] dark:bg-[#120d22] border border-purple-100 dark:border-purple-900/30 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="font-bold text-emerald-600">{selectedEmployee.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Tasks Assigned</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedEmployee.activeTasks} Tasks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Pillar Division</span>
                <span className="font-bold text-purple-600">{pillar.name}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT DETAIL MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#181c25] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                  {selectedProject.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {selectedProject.status}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedProject.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#faf8ff] dark:bg-[#120d22] border border-purple-100 dark:border-purple-900/30 text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Progress</span>
                <span className="font-extrabold text-purple-600 text-sm">{selectedProject.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: `${selectedProject.progress}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-100 dark:border-purple-900/20 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Project Lead</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedProject.lead}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Target Deadline</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedProject.deadline}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Milestones & Deliverables
              </span>
              <div className="space-y-1.5">
                {selectedProject.milestones.map((ms, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{ms.name}</span>
                    {ms.completed ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] font-semibold">In Progress</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
