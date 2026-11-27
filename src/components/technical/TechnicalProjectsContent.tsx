'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const projects = [
  {
    name: 'CalibiUpx',
    category: 'Placement Assessment Software',
    description: 'Online assessments that measure student skills and readiness for placement.',
    members: ['Aarav Sharma', 'Meera Patel'],
    features: [
      '1.1 Timed aptitude, technical and coding tests',
      '1.2 Question bank and test creation',
      '1.3 Automatic evaluation and scoring',
      '1.4 Rankings and detailed performance analysis',
      '1.5 Dashboards for colleges and trainers',
    ],
  },
  {
    name: 'Emellos',
    category: 'Email Campaigning & Newsletter Marketing Software',
    description: 'A platform for institutes and companies to design newsletters, send email campaigns to their own subscribers, and see exactly what works.',
    members: ['Riya Kapoor', 'Arjun Mehta', 'Neha Singh'],
    features: [
      '2.1 Visual newsletter editor with ready-made templates',
      '2.2 Live preview',
      '2.3 Subscriber lists, CSV import and unsubscribe links',
      '2.4 Send immediately or schedule campaigns',
      '2.5 Analytics: open rate, click rate, bounces and top-clicked links',
    ],
  },
  {
    name: 'Awficio',
    category: 'Human Resource Management System (HRMS)',
    description: 'Handles employee records and day-to-day HR work in one system.',
    members: ['Kabir Verma', 'Ananya Rao'],
    features: [
      '3.1 Employee profiles and documents',
      '3.2 Attendance and leave management',
      '3.3 Payroll and payslips',
      '3.4 Employee onboarding',
      '3.5 Employee self-service portal',
    ],
  },
  {
    name: 'MindLyft Finance',
    category: 'Finance Management Platform',
    description: 'Streamlines everyday financial operations, helping businesses manage transactions, invoices and financial reporting efficiently.',
    members: ['Ishaan Gupta', 'Diya Nair', 'Vihaan Joshi'],
    features: [
      '4.1 Invoice and receipt management',
      '4.2 Automatic transaction categorisation',
      '4.3 Bank reconciliation and tracking',
      '4.4 Financial statements and reports',
      '4.5 Payment reminders and AI finance assistant',
    ],
  },
  {
    name: 'Placement Assistance Software',
    category: 'Placement Management Software',
    description: 'Manages the whole placement process, from student profiles to job offers.',
    members: ['Aarav Sharma', 'Kavya Iyer'],
    features: [
      '5.1 Student profiles and resumes',
      '5.2 Company and drive management',
      '5.3 Applications and shortlisting tracker',
      '5.4 Interview scheduling and notifications',
      '5.5 Placement statistics and reports',
    ],
  },
  {
    name: 'AI Recruitment',
    category: 'AI-Powered Recruitment Platform',
    description: 'Helps recruiters find and shortlist the right candidates faster with AI.',
    members: ['Meera Patel', 'Rohan Das', 'Ananya Rao'],
    features: [
      '6.1 Job posting and application pipeline',
      '6.2 AI resume screening and candidate ranking',
      '6.3 Interview scheduling',
      '6.4 Candidate communication',
      '6.5 Hiring analytics',
    ],
  },
  {
    name: 'MindLyft CRM',
    category: 'Customer Relationship Management (CRM)',
    description: 'Captures every lead and follows it up until it becomes an admission, using automation and messaging.',
    members: ['Neha Singh', 'Kabir Verma'],
    features: [
      '7.1 Lead capture from Meta Ads, website forms, walk-ins and CSV imports',
      '7.2 Smart assignment to the least-loaded counsellor or telecaller',
      '7.3 Follow-ups with reminders and missed follow-up lists',
      '7.4 Bulk SMS, email and WhatsApp messaging',
      '7.5 Click-to-call through phone or company IVR',
    ],
  },
  {
    name: 'MindLyft ERP',
    category: 'Enterprise Resource Planning (ERP) for Institutes',
    description: 'Runs the institute after admission: students, fees, courses and attendance in one place.',
    members: ['Arjun Mehta', 'Diya Nair', 'Rohan Das'],
    features: [
      '8.1 Admissions and student management',
      '8.2 Fee collection and GST invoices',
      '8.3 Courses and batches',
      '8.4 One-tap attendance, flagging students below 75%',
      '8.5 Super Admin console for client institutes and packages',
    ],
  },
];

export default function TechnicalProjectsContent() {
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[number] | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedProject]);

  return (
    <>
      <section aria-label="Technical Team projects" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <button
            key={project.name}
            type="button"
            onClick={() => setSelectedProject(project)}
            aria-haspopup="dialog"
            aria-label={`View details for ${project.name}`}
            className="flex h-full w-full flex-col items-stretch justify-start rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-800 dark:hover:bg-violet-950/20 dark:focus-visible:ring-offset-slate-950 sm:p-6"
          >
            <h2 className="break-words text-base font-semibold leading-6 tracking-tight text-slate-900 dark:text-white">
              {project.name}
            </h2>
            <p className="mt-1.5 break-words text-xs font-medium leading-5 text-violet-700 dark:text-violet-300">
              {project.category}
            </p>
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                Team members
              </p>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <span
                    key={member}
                    className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50/80 px-2.5 py-1 text-[11px] font-medium leading-4 text-slate-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-slate-200"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </section>

      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedProject(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-violet-100 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-violet-100 pb-5 dark:border-slate-800">
              <div className="min-w-0">
                <h2 id="project-dialog-title" className="break-words text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {selectedProject.name}
                </h2>
                <p className="mt-2 text-sm font-medium leading-5 text-violet-700 dark:text-violet-300">
                  {selectedProject.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-violet-50 hover:text-violet-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-violet-950/50 dark:hover:text-violet-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <section className="pt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Project overview
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {selectedProject.description}
              </p>
            </section>
            <section className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Project features
              </h3>
            <ul className="mt-3 space-y-2.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {selectedProject.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span aria-hidden="true">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            </section>
            <section className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Team members
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedProject.members.map((member) => (
                  <span
                    key={member}
                    className="inline-flex items-center rounded-full border border-violet-100 bg-violet-50/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-slate-200"
                  >
                    {member}
                  </span>
                ))}
              </div>
            </section>
          </section>
        </div>
      )}
    </>
  );
}
