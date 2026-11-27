'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ClipboardList, LoaderCircle, UserRound, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type Employee = {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  status: string;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  responsibilities?: string | null;
  isDemo?: boolean;
};

type Task = { id: string; title: string; description?: string; assignedToId: string; status: string; priority?: string; deadline?: string };
type DemoTask = { title: string; description: string; status: string; priority: string; deadline?: string };

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';

const demoEmployees: Employee[] = [
  { id: 'demo-employee-aarav', employeeId: 'TECH-D01', name: 'Aarav Sharma', designation: 'Tech Lead', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'Website Redesign', isDemo: true },
  { id: 'demo-employee-riya', employeeId: 'TECH-D02', name: 'Riya Patel', designation: 'Frontend Developer', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'Website Redesign', isDemo: true },
  { id: 'demo-employee-aditya', employeeId: 'TECH-D03', name: 'Aditya Verma', designation: 'Backend Developer', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'AI Chatbot', isDemo: true },
  { id: 'demo-employee-neha', employeeId: 'TECH-D04', name: 'Neha Kulkarni', designation: 'AI/ML Engineer', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'AI Chatbot', isDemo: true },
  { id: 'demo-employee-karan', employeeId: 'TECH-D05', name: 'Karan Shah', designation: 'Full Stack Developer', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'CRM Integration', isDemo: true },
  { id: 'demo-employee-sneha', employeeId: 'TECH-D06', name: 'Sneha Joshi', designation: 'UI/UX Designer', status: 'ACTIVE', department: { id: 'demo-tech', name: 'Technology', code: 'TECH' }, responsibilities: 'Mobile App', isDemo: true },
];

export default function TechnicalEmployeesContent() {
  const { currentUser, isFounder } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsEmployee, setDetailsEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [demoAssignedTasks, setDemoAssignedTasks] = useState<Record<string, DemoTask[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', deadline: '', priority: 'MEDIUM' });

  const loadData = async () => {
    try {
      const [employeeResponse, taskResponse] = await Promise.all([fetch('/api/employees'), fetch('/api/tasks')]);
      if (employeeResponse.ok) setEmployees(await employeeResponse.json());
      if (taskResponse.ok) setTasks(await taskResponse.json());
    } catch {
      setError('Unable to load employee and task details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const technicalEmployees = useMemo(
    () => employees.filter((employee) => /tech/i.test(`${employee.department?.name ?? ''} ${employee.department?.code ?? ''}`)),
    [employees],
  );
  const visibleEmployees = technicalEmployees.length > 0
    ? technicalEmployees
    : employees.filter((employee) => employee.status === 'ACTIVE').length > 0
      ? employees.filter((employee) => employee.status === 'ACTIVE')
      : demoEmployees;
  const demoProjects = ['Website Redesign', 'AI Chatbot', 'CRM Integration', 'Mobile App'];
const demoTasks: DemoTask[] = [
  { title: 'Review sprint backlog', description: 'Review open sprint items, confirm priorities, and identify blockers for the team.', status: 'In progress', priority: 'High' },
  { title: 'Update technical documentation', description: 'Update the setup guide and document the latest API and deployment changes.', status: 'Not started', priority: 'Medium' },
  { title: 'Complete code review', description: 'Review open pull requests for correctness, readability, and test coverage.', status: 'In progress', priority: 'High' },
  { title: 'Verify release checklist', description: 'Check release notes, deployment steps, and post-release monitoring items.', status: 'Not started', priority: 'Medium' },
];

  const assignTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedEmployee) return;
    if (selectedEmployee.isDemo) {
      setDemoAssignedTasks((existing) => ({
        ...existing,
        [selectedEmployee.id]: [{ ...form, status: 'Not started' }, ...(existing[selectedEmployee.id] ?? [])],
      }));
      setSelectedEmployee(null);
      setForm({ title: '', description: '', deadline: '', priority: 'MEDIUM' });
      return;
    }
    if (!currentUser || !isFounder) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          departmentId: selectedEmployee.departmentId,
          assignedById: currentUser.id,
          assignedToId: selectedEmployee.id,
          startDate: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Task assignment failed. Check the details and try again.');
      setSelectedEmployee(null);
      setForm({ title: '', description: '', deadline: '', priority: 'MEDIUM' });
      await loadData();
    } catch (assignmentError) {
      setError(assignmentError instanceof Error ? assignmentError.message : 'Task assignment failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="technical-employees-heading">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">TECHNICAL TEAM</p>
        <h2 id="technical-employees-heading" className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Employees</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Employee details, assigned tasks, and project assignment notes.</p>
        {!loading && visibleEmployees.some((employee) => employee.isDemo) && <p className="mt-2 text-xs text-violet-700 dark:text-violet-300">Demo employee data is shown because no active employees were returned. Tasks assigned here stay in this demo view.</p>}
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Employee</th>
                <th className="px-5 py-3.5 font-semibold">Employee task</th>
                <th className="px-5 py-3.5 font-semibold">Project assigned</th>
                <th className="px-5 py-3.5 text-right font-semibold">Task assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />Loading technical employees…</td></tr>
              ) : visibleEmployees.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">No employee data is available.</td></tr>
              ) : visibleEmployees.map((employee, index) => {
                const employeeTasks = tasks.filter((task) => task.assignedToId === employee.id);
                const demoTasksForEmployee = demoAssignedTasks[employee.id] ?? [];
                const canOpenDetails = isFounder || (!currentUser && employee.isDemo);
                return (
                  <tr
                    key={employee.id}
                    tabIndex={canOpenDetails ? 0 : undefined}
                    onClick={() => { if (canOpenDetails) setDetailsEmployee(employee); }}
                    onKeyDown={(event) => {
                      if (canOpenDetails && (event.key === 'Enter' || event.key === ' ')) {
                        event.preventDefault();
                        setDetailsEmployee(employee);
                      }
                    }}
                    className={`align-top ${canOpenDetails ? 'cursor-pointer transition-colors active:bg-violet-100 focus:bg-violet-50/60 focus:outline-none dark:active:bg-violet-950/50 dark:focus:bg-violet-950/20' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><UserRound className="h-4 w-4" /></span>
                        <span className="min-w-0">
                          <strong className="block font-semibold text-slate-900 dark:text-white">{employee.name}</strong>
                          <button type="button" onClick={(event) => { event.stopPropagation(); setDetailsEmployee(employee); }} className="mt-1 text-xs font-medium text-violet-700 underline-offset-2 hover:underline focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300">View profile</button>
                        </span>
                      </div>
                    </td>
                    <td className="max-w-sm px-5 py-4">
                      <span className="inline-flex items-start gap-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300"><ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0" />{[...demoTasksForEmployee.map((task) => task.title), ...employeeTasks.slice(0, 3).map((task) => task.title)].join(', ') || demoTasks[index % demoTasks.length].title}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">{employee.responsibilities?.trim() || demoProjects[index % demoProjects.length]}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" disabled={!isFounder && !(employee.isDemo && !currentUser)} onClick={(event) => { event.stopPropagation(); setError(''); setSelectedEmployee(employee); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-slate-900">Assign Task</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailsEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsEmployee(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="employee-task-details-heading" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-300">Employee profile</p>
                <h3 id="employee-task-details-heading" className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{detailsEmployee.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detailsEmployee.designation} · {detailsEmployee.employeeId}</p>
              </div>
              <button type="button" onClick={() => setDetailsEmployee(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Close</button>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee tasks</h4>
                <div className="mt-2 space-y-3">
                  {[
                    ...(demoAssignedTasks[detailsEmployee.id] ?? []),
                    ...tasks.filter((task) => task.assignedToId === detailsEmployee.id),
                  ].length > 0 ? [
                    ...(demoAssignedTasks[detailsEmployee.id] ?? []),
                    ...tasks.filter((task) => task.assignedToId === detailsEmployee.id),
                  ].map((task, index) => (
                    <article key={`${task.title}-${index}`} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                      <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</h5>
                      <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{task.description || 'No additional task description provided.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">Status: {task.status.replace(/_/g, ' ')}</span>
                        {task.priority && <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">Priority: {task.priority}</span>}
                        {task.deadline && <span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">Due: {new Date(task.deadline).toLocaleDateString()}</span>}
                      </div>
                    </article>
                  )) : (() => {
                    const demoTask = demoTasks[Math.max(0, visibleEmployees.findIndex((employee) => employee.id === detailsEmployee.id)) % demoTasks.length];
                    return (
                      <article className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
                        <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{demoTask.title}</h5>
                        <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{demoTask.description}</p>
                        <div className="mt-3 flex gap-2 text-xs text-slate-500 dark:text-slate-400"><span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">Status: {demoTask.status}</span><span className="rounded-full bg-white px-2.5 py-1 dark:bg-slate-900">Priority: {demoTask.priority}</span></div>
                      </article>
                    );
                  })()}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Project assigned</h4>
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">{detailsEmployee.responsibilities?.trim() || demoProjects[visibleEmployees.findIndex((employee) => employee.id === detailsEmployee.id) % demoProjects.length]}</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setSelectedEmployee(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="assign-technical-task-heading" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4"><div><h3 id="assign-technical-task-heading" className="text-lg font-bold text-slate-900 dark:text-white">Assign task</h3><p className="mt-1 text-sm text-slate-500">Assigning to {selectedEmployee.name}</p></div><button type="button" aria-label="Close" disabled={saving} onClick={() => setSelectedEmployee(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button></div>
            <form onSubmit={assignTask} className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Task title<input required maxLength={120} className={`${inputClass} mt-1.5`} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Description<textarea required rows={3} className={`${inputClass} mt-1.5`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Deadline<input required type="date" min={new Date().toISOString().slice(0, 10)} className={`${inputClass} mt-1.5`} value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></label>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Priority<select className={`${inputClass} mt-1.5`} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"><button type="button" disabled={saving} onClick={() => setSelectedEmployee(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}Assign task</button></div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
