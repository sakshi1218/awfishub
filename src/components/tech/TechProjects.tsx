'use client';

import { useState, type FormEvent } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import TechModal from './TechModal';
import { techInputClass, techPanelClass, techPrimaryButtonClass } from './styles';

type ProjectStatus = 'In Progress' | 'Planning' | 'Completed';

interface TechProject {
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  members: string[];
  deadline: string;
}

const initialProjects: TechProject[] = [
  { name: 'Website Redesign', description: 'Refresh the public website experience and page structure.', status: 'In Progress', progress: 75, members: ['AS', 'RP', 'KV'], deadline: '15 December 2026' },
  { name: 'AI Chatbot', description: 'Build a conversational assistant for common user questions.', status: 'Planning', progress: 20, members: ['AV', 'NK'], deadline: '20 December 2026' },
  { name: 'Mobile App', description: 'Create a mobile app experience for learners.', status: 'In Progress', progress: 55, members: ['SJ', 'RM', 'AS', 'DM'], deadline: '10 January 2027' },
  { name: 'CRM Integration', description: 'Connect CRM workflows with existing business tools.', status: 'Completed', progress: 100, members: ['KS', 'RP', 'KV'], deadline: '30 November 2026' },
];

const statusClasses: Record<ProjectStatus, string> = {
  'In Progress': 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  Planning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
};

export default function TechProjects() {
  const [projects, setProjects] = useState<TechProject[]>(initialProjects);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const addProject = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    if (!name) return;
    setProjects((current) => [
      {
        name,
        description: String(formData.get('description') ?? '').trim() || 'New demo project.',
        status: 'Planning',
        progress: 0,
        members: ['TM'],
        deadline: String(formData.get('deadline') ?? '') || 'Not set',
      },
      ...current,
    ]);
    setNewProjectOpen(false);
    setNotice('Demo project added in this session only.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tech Projects</h2>
        </div>
        <button type="button" onClick={() => setNewProjectOpen(true)} className={techPrimaryButtonClass}>
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {notice && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.name} className={`${techPanelClass} flex h-full flex-col p-4 sm:p-5`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                <FolderKanban className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{project.name}</h3>
                <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClasses[project.status]}`}>
                  {project.status}
                </span>
              </div>
            </div>
            <p className="mt-4 min-h-10 text-xs leading-5 text-slate-600 dark:text-slate-300">{project.description}</p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium text-slate-600 dark:text-slate-300">Progress</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{project.progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label={`${project.name} progress`} aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2" aria-label={`${project.members.length} team members`}>
                  {project.members.map((member, index) => (
                    <span key={`${member}-${index}`} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[9px] font-bold text-violet-800 dark:border-slate-900 dark:bg-violet-950 dark:text-violet-200">
                      {member}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{project.members.length} members</span>
              </div>
              <span className="text-right text-[11px] text-slate-500 dark:text-slate-400">Due {project.deadline}</span>
            </div>
          </article>
        ))}
      </div>

      {newProjectOpen && (
        <TechModal title="New demo project" onClose={() => setNewProjectOpen(false)}>
          <form onSubmit={addProject} className="space-y-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">This creates a temporary demo card in this browser session only.</p>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Project name
              <input name="name" required className={techInputClass} placeholder="Enter project name" />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Short description
              <textarea name="description" rows={3} className={techInputClass} placeholder="Describe the demo project" />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Deadline
              <input name="deadline" type="date" className={techInputClass} />
            </label>
            <div className="flex justify-end">
              <button type="submit" className={techPrimaryButtonClass}><Plus className="h-4 w-4" /> Add demo project</button>
            </div>
          </form>
        </TechModal>
      )}
    </div>
  );
}
