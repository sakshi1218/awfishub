import { CheckCircle2, Circle, Clock3, ListTodo } from 'lucide-react';
import { techPanelClass } from './styles';

const taskGroups = [
  { title: 'To Do', icon: Circle, color: 'text-slate-500 dark:text-slate-400', tasks: ['Improve document search', 'Add API validation', 'Update project filters'] },
  { title: 'In Progress', icon: Clock3, color: 'text-violet-600 dark:text-violet-300', tasks: ['Dashboard responsive improvements', 'Backend API optimization'] },
  { title: 'Done', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-300', tasks: ['Authentication improvements', 'Fixed report modal', 'Updated navigation icons'] },
];

export default function TechSprints() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tech Sprints</h2>
      </div>

      <section className={`${techPanelClass} p-4 sm:p-5`}>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-violet-700 dark:text-violet-300">Sprint 08</p>
            <h3 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">Sprint 08 — Platform Improvements</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">16 November 2026 – 30 November 2026</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
            <ListTodo className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-300">Sprint progress</span>
            <span className="font-semibold text-slate-900 dark:text-white">65%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-label="Sprint progress" aria-valuenow={65} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-violet-600" style={{ width: '65%' }} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3 dark:divide-slate-700 dark:bg-slate-800/60">
          {[
            { label: 'Total tasks', value: '20' },
            { label: 'Completed', value: '13' },
            { label: 'Remaining', value: '7' },
          ].map((item) => (
            <div key={item.label} className="px-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid items-stretch gap-4 md:grid-cols-3">
        {taskGroups.map((group) => {
          const Icon = group.icon;
          return (
            <section key={group.title} className={`${techPanelClass} h-full p-4 sm:p-5`}>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Icon className={`h-4 w-4 ${group.color}`} /> {group.title}
                <span className="ml-auto text-[11px] font-medium text-slate-400">{group.tasks.length}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {group.tasks.map((task) => (
                  <li key={task} className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                    {task}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
