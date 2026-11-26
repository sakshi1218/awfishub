import { techPanelClass } from './styles';

const members = [
  { name: 'Aarav Sharma', initials: 'AS', role: 'Tech Lead', project: 'Website Redesign', tasks: 5 },
  { name: 'Riya Patel', initials: 'RP', role: 'Frontend Developer', project: 'Website Redesign', tasks: 4 },
  { name: 'Aditya Verma', initials: 'AV', role: 'Backend Developer', project: 'AI Chatbot', tasks: 6 },
  { name: 'Neha Kulkarni', initials: 'NK', role: 'AI/ML Engineer', project: 'AI Chatbot', tasks: 3 },
  { name: 'Karan Shah', initials: 'KS', role: 'Full Stack Developer', project: 'CRM Integration', tasks: 4 },
  { name: 'Sneha Joshi', initials: 'SJ', role: 'UI/UX Designer', project: 'Mobile App', tasks: 3 },
  { name: 'Rahul Mehta', initials: 'RM', role: 'QA Engineer', project: 'Mobile App', tasks: 5 },
  { name: 'Dev Malhotra', initials: 'DM', role: 'DevOps Engineer', project: 'All Projects', tasks: 2 },
];

export default function TechTeam() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Tech Team</h2>
      </div>
      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {members.map((member) => (
          <article key={member.name} className={`${techPanelClass} flex h-full flex-col p-4 sm:p-5`}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                {member.initials}
              </span>
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{member.role}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-start justify-between gap-3 text-xs">
                <dt className="text-slate-500 dark:text-slate-400">Current project</dt>
                <dd className="text-right font-medium text-slate-700 dark:text-slate-200">{member.project}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <dt className="text-slate-500 dark:text-slate-400">Tasks</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-100">{member.tasks}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
