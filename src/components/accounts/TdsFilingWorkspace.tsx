'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { FileCheck2, Search, ShieldCheck, UserPlus, LogOut, History, Plus, X, Users, Building2, IndianRupee, ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';

type Employee = { id: string; employeeId: string; name: string; role?: string };
type Client = { id: string; code?: string | null; name: string };
type Filing = {
  id: string; deducteeName: string; deducteeNameKey: string; deducteeCategory: string; deducteeReference?: string | null;
  deducteeEmployeeId?: string | null; deducteeEmployee?: Employee | null; deducteeCollegeId?: string | null; deducteeCollege?: Client | null;
  panNumber?: string | null; tanNumber?: string | null; financialYear: string; quarter: string; returnType: string; revision: number;
  correctionReason?: string | null; correctionOfId?: string | null; correctionOf?: { id: string; revision: number } | null;
  tdsAmount: number; status: string; filingStatus?: string; dueDate?: string | null; filingDate?: string | null; acknowledgementRef?: string | null;
  assignedToId?: string | null; assignedTo?: Employee | null; assignedAt?: string | null; responsibilityStatus: string;
  responsibilityRemarks?: string | null; completedAt?: string | null; remarks?: string | null;
};
type Session = { permission: 'ADMIN' | 'VIEW' | 'MANAGE'; employee: Employee };
type AssignmentEvent = { id: string; fromStatus?: string | null; toStatus: string; remarks?: string | null; createdAt: string; actor: Employee; assignedTo?: Employee | null; fromAssignedTo?: Employee | null };
type FilingEvent = { id: string; action: string; fromStatus?: string | null; toStatus?: string | null; details?: string | null; createdAt: string; actor: Employee };
type Summary = { total: number; filed: number; pending: number; inProgress: number; overdue: number; amount?: number; assigned?: number; completed?: number; unassigned?: number };

const inputClass = 'w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2.5 text-xs text-slate-800 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-rose-950';
const categories = [['CLIENT', 'Client'], ['EMPLOYEE', 'Employee'], ['VENDOR', 'Vendor']];
const filingStatuses = ['PENDING', 'IN_PROGRESS', 'FILED'];
const responsibilityStatuses = ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'UNASSIGNED'];

export default function TdsFilingWorkspace() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState<'deductees' | 'responsibilities'>('deductees');
  const [records, setRecords] = useState<Filing[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, filed: 0, pending: 0, inProgress: 0, overdue: 0, amount: 0 });
  const [responsibilityRows, setResponsibilityRows] = useState<Filing[]>([]);
  const [responsibilitySummary, setResponsibilitySummary] = useState<Summary>({ total: 0, filed: 0, pending: 0, inProgress: 0, overdue: 0, assigned: 0, completed: 0, unassigned: 0 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', financialYear: '', quarter: '', status: '', from: '', to: '', dueFrom: '', dueTo: '' });
  const [staffSearch, setStaffSearch] = useState('');
  const [staffFilters, setStaffFilters] = useState({ staffId: '', responsibilityStatus: '', filingStatus: '', category: '', financialYear: '', quarter: '', assignedFrom: '', assignedTo: '', filingFrom: '', filingTo: '', dueFrom: '', dueTo: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Filing | null>(null);
  const [correctionBase, setCorrectionBase] = useState<Filing | null>(null);
  const [assignmentRecord, setAssignmentRecord] = useState<Filing | null>(null);
  const [detailRecord, setDetailRecord] = useState<Filing | null>(null);
  const [filingHistory, setFilingHistory] = useState<FilingEvent[]>([]);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentEvent[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [enrollEmployee, setEnrollEmployee] = useState('');
  const [enrollmentToken, setEnrollmentToken] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [setupEmployeeId, setSetupEmployeeId] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [grants, setGrants] = useState<Array<{ employee: Employee; permission: string; grantedBy: { name: string } }>>([]);
  const [grantEmployeeId, setGrantEmployeeId] = useState('');
  const [grantPermission, setGrantPermission] = useState('VIEW');
  const [formCategory, setFormCategory] = useState('CLIENT');

  const loadSession = useCallback(async () => {
    setAuthLoading(true);
    const response = await fetch('/api/accounts/tds/auth/session', { cache: 'no-store' });
    if (response.ok) {
      const data = await response.json();
      if (data.authorized) { setSession(data); setError(''); }
      else { setSession(null); setError('Your account does not have TDS Filing access. Ask the Accounts administrator for access.'); }
    } else if (response.status !== 401) setError('Unable to verify TDS access.');
    setAuthLoading(false);
  }, []);

  const loadRecords = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    const response = await fetch(`/api/accounts/tds/records?${params}`, { cache: 'no-store' });
    if (response.ok) { const data = await response.json(); setRecords(data.records); setSummary(data.summary); }
    else setError('Unable to load deductee filing records.');
  }, [filters, search]);

  const loadResponsibilities = useCallback(async () => {
    const params = new URLSearchParams();
    if (staffSearch) params.set('q', staffSearch);
    Object.entries(staffFilters).forEach(([key, value]) => { if (value) params.set(key, value); });
    const response = await fetch(`/api/accounts/tds/responsibilities?${params}`, { cache: 'no-store' });
    if (response.ok) { const data = await response.json(); setResponsibilityRows(data.records); setResponsibilitySummary(data.summary); }
    else setError('Unable to load staff responsibility records.');
  }, [staffFilters, staffSearch]);

  useEffect(() => { void loadSession(); }, [loadSession]);
  useEffect(() => {
    if (!session) return;
    void loadRecords(); void loadResponsibilities();
    void fetch('/api/accounts/tds/deductees').then(async (response) => { if (response.ok) { const data = await response.json(); setEmployees(data.employees); setClients(data.clients); } });
    if (session.permission === 'ADMIN') void fetch('/api/accounts/tds/access').then(async (response) => { if (response.ok) { const data = await response.json(); setGrants(data.grants); } });
  }, [session, loadRecords, loadResponsibilities]);

  async function login(event: FormEvent) {
    event.preventDefault(); setError('');
    const response = await fetch('/api/accounts/tds/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPassword }) });
    if (!response.ok) { setError('Sign-in failed. Check your credentials or contact the TDS administrator.'); return; }
    setLoginPassword(''); await loadSession();
  }
  async function logout() {
    await fetch('/api/accounts/tds/auth/logout', { method: 'POST' });
    setSession(null); setRecords([]); setResponsibilityRows([]); setGrants([]);
  }
  function startNewRecord() { setEditing(null); setCorrectionBase(null); setFormCategory('CLIENT'); setFormOpen(true); }
  function startCorrection(record: Filing) { setEditing(null); setCorrectionBase(record); setFormCategory(record.deducteeCategory); setFormOpen(true); setDetailRecord(null); }
  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    const data = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(data.entries());
    payload.tdsAmount = Number(payload.tdsAmount);
    if (correctionBase) { payload.revision = correctionBase.revision + 1; payload.correctionOfId = correctionBase.id; }
    const response = await fetch(editing ? `/api/accounts/tds/records/${editing.id}` : '/api/accounts/tds/records', {
      method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!response.ok) { const body = await response.json(); setError(body.error || 'Could not save filing record.'); return; }
    setFormOpen(false); setEditing(null); setCorrectionBase(null); setNotice('Filing record saved.'); await Promise.all([loadRecords(), loadResponsibilities()]);
  }
  async function showDetails(record: Filing) {
    const [recordResponse, historyResponse] = await Promise.all([
      fetch(`/api/accounts/tds/records/${record.id}`, { cache: 'no-store' }),
      fetch(`/api/accounts/tds/records/${record.id}/history`, { cache: 'no-store' }),
    ]);
    if (recordResponse.ok && historyResponse.ok) {
      setDetailRecord(await recordResponse.json()); const data = await historyResponse.json();
      setFilingHistory(data.filingHistory); setAssignmentHistory(data.assignmentHistory);
    } else setError('Unable to load filing details and history.');
  }
  async function saveResponsibility(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!assignmentRecord) return;
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/accounts/tds/responsibilities/${assignmentRecord.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(data.entries())) });
    if (!response.ok) { const result = await response.json(); setError(result.error || 'Unable to update responsibility.'); return; }
    setAssignmentRecord(null); setNotice('Responsibility updated and logged.'); await Promise.all([loadResponsibilities(), loadRecords()]);
  }
  async function createEnrollment(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/accounts/tds/auth/enrollment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: enrollEmployee }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Unable to create enrollment.'); return; }
    setEnrollmentToken(data.token); setNotice('One-time setup token created. Share it securely with this employee.');
  }
  async function completeEnrollment(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/accounts/tds/auth/enrollment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: setupEmployeeId, token: setupToken, password: setupPassword }) });
    if (!response.ok) { const data = await response.json(); setError(data.error || 'Unable to set password.'); return; }
    setSetupToken(''); setSetupPassword(''); setNotice('TDS password set. You can now sign in.');
  }
  async function updateGrant(event: FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/accounts/tds/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: grantEmployeeId, permission: grantPermission }) });
    if (!response.ok) { setError('Unable to update TDS access.'); return; }
    const data = await response.json();
    setGrants((current) => [...current.filter((item) => item.employee.id !== data.employeeId), { employee: employees.find((item) => item.id === data.employeeId)!, permission: data.permission, grantedBy: { name: session?.employee.name || '' } }]);
  }
  async function revokeGrant(employeeId: string) {
    const response = await fetch(`/api/accounts/tds/access?employeeId=${encodeURIComponent(employeeId)}`, { method: 'DELETE' });
    if (response.ok) setGrants((items) => items.filter((item) => item.employee.id !== employeeId));
  }

  if (authLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">Verifying TDS access…</div>;
  if (!session) return <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center gap-3"><span className="rounded-xl bg-rose-50 p-2.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Sign in to TDS Filing</h2><p className="text-xs text-slate-500">Use your individual TDS credentials</p></div></div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}
    <form onSubmit={login} className="grid gap-3"><input required type="email" autoComplete="username" className={inputClass} placeholder="Work email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} /><input required type="password" autoComplete="current-password" className={inputClass} placeholder="Password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} /><button className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700">Sign in</button></form>
    <details className="border-t border-slate-100 pt-3 text-xs dark:border-slate-800"><summary className="cursor-pointer text-slate-500">Have an administrator setup token?</summary><form onSubmit={completeEnrollment} className="mt-3 grid gap-2"><input required className={inputClass} placeholder="Employee ID" value={setupEmployeeId} onChange={(event) => setSetupEmployeeId(event.target.value)} /><input required className={inputClass} placeholder="One-time setup token" value={setupToken} onChange={(event) => setSetupToken(event.target.value)} /><input required minLength={12} type="password" autoComplete="new-password" className={inputClass} placeholder="New password (12+ characters)" value={setupPassword} onChange={(event) => setSetupPassword(event.target.value)} /><button className="rounded-xl border px-3 py-2 font-medium">Set password</button></form></details>
  </div>;

  const metric = (label: string, value: number | string, icon: typeof FileCheck2) => { const MetricIcon = icon; return <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="text-[11px] font-medium text-slate-500">{label}</span><MetricIcon className="h-4 w-4 text-rose-600" /></div><p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p></div>; };
  const filterClass = `${inputClass} min-w-0`;

  return <section className="space-y-4" aria-labelledby="tds-filing-title">
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><span className="rounded-xl bg-rose-50 p-2.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><FileCheck2 className="h-5 w-5" /></span><div><h2 id="tds-filing-title" className="text-base font-semibold text-slate-900 dark:text-white">TDS Filing Management</h2><p className="mt-1 text-xs text-slate-500">Signed in as {session.employee.name} · {session.permission}</p></div></div>
      <div className="flex flex-wrap gap-2">{session.permission !== 'VIEW' && <button onClick={startNewRecord} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-violet-700"><Plus className="h-4 w-4" /> Add filing</button>}<button onClick={logout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs dark:border-slate-700"><LogOut className="h-4 w-4" /> Sign out</button></div>
    </div>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800 dark:bg-rose-950/30 dark:text-rose-200">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{notice}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{[
      metric('Total filings', summary.total, FileCheck2), metric('Filed', summary.filed, FileCheck2), metric('Pending', summary.pending, ClipboardList), metric('In progress', summary.inProgress, ClipboardList), metric('Overdue', summary.overdue, ClipboardList),
    ]}</div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[metric('Total TDS amount', `₹${(summary.amount || 0).toLocaleString('en-IN')}`, IndianRupee), metric('Assigned staff work', responsibilitySummary.assigned || 0, Users), metric('Completed assignments', responsibilitySummary.completed || 0, ShieldCheck)]}</div>

    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900" role="tablist" aria-label="TDS work views">
      <button role="tab" aria-selected={view === 'deductees'} onClick={() => setView('deductees')} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${view === 'deductees' ? 'bg-rose-700 text-white' : 'text-slate-600 dark:text-slate-300'}`}><Building2 className="h-4 w-4" /> Deductee filings</button>
      <button role="tab" aria-selected={view === 'responsibilities'} onClick={() => setView('responsibilities')} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold ${view === 'responsibilities' ? 'bg-rose-700 text-white' : 'text-slate-600 dark:text-slate-300'}`}><Users className="h-4 w-4" /> Staff responsibility</button>
    </div>

    {view === 'deductees' ? <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={`${filterClass} pl-9`} placeholder="Search deductee or responsible staff" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8"><select className={filterClass} value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className={filterClass} placeholder="Financial year" value={filters.financialYear} onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })} /><select className={filterClass} value={filters.quarter} onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}><option value="">All quarters</option>{['Q1', 'Q2', 'Q3', 'Q4'].map((q) => <option key={q}>{q}</option>)}</select><select className={filterClass} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}><option value="">All filing statuses</option>{[...filingStatuses, 'OVERDUE'].map((value) => <option key={value}>{value}</option>)}</select>{[['from', 'Filing from'], ['to', 'Filing to'], ['dueFrom', 'Due from'], ['dueTo', 'Due to']].map(([key, label]) => <input key={key} aria-label={label} title={label} type="date" className={filterClass} value={filters[key as keyof typeof filters]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })} />)}</div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[1150px] text-left text-xs"><thead className="border-b bg-slate-50 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/60"><tr>{['Deductee', 'Type / Reference', 'Tax period', 'Amount', 'Responsible staff', 'Responsibility', 'Filing status', 'Filing date', ''].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{records.map((record) => <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"><td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{record.deducteeName}<span className="mt-1 block text-[10px] text-slate-500">PAN {record.panNumber || '—'}</span></td><td className="px-4 py-3">{record.deducteeCategory}<span className="mt-1 block text-[10px] text-slate-500">{record.deducteeReference || record.deducteeEmployee?.employeeId || record.deducteeCollege?.code || 'No reference'}</span></td><td className="px-4 py-3">FY {record.financialYear} · {record.quarter}<span className="mt-1 block text-[10px] text-slate-500">{record.returnType} · revision {record.revision}</span></td><td className="px-4 py-3 tabular-nums">₹{record.tdsAmount.toLocaleString('en-IN')}</td><td className="px-4 py-3">{record.assignedTo?.name || 'Unassigned'}<span className="mt-1 block text-[10px] text-slate-500">{record.assignedTo?.employeeId || '—'}</span></td><td className="px-4 py-3"><StatusBadge label={record.responsibilityStatus.replace('_', ' ')} variant={record.responsibilityStatus === 'COMPLETED' ? 'success' : record.responsibilityStatus === 'UNASSIGNED' ? 'danger' : 'info'} /></td><td className="px-4 py-3"><StatusBadge label={record.status.replace('_', ' ')} variant={record.status === 'FILED' ? 'success' : record.status === 'OVERDUE' ? 'danger' : 'warning'} /></td><td className="px-4 py-3">{record.filingDate ? new Date(record.filingDate).toLocaleDateString('en-IN') : '—'}</td><td className="px-4 py-3"><div className="flex gap-2"><button title="View details and history" onClick={() => void showDetails(record)} className="rounded-lg border p-2 dark:border-slate-700"><History className="h-3.5 w-3.5" /></button>{session.permission !== 'VIEW' && <><button onClick={() => { setEditing(record); setCorrectionBase(null); setFormCategory(record.deducteeCategory); setFormOpen(true); }} className="rounded-lg border px-2 py-1.5 text-[11px] dark:border-slate-700">Edit</button><button onClick={() => startCorrection(record)} className="rounded-lg border px-2 py-1.5 text-[11px] dark:border-slate-700">Correct</button></>}</div></td></tr>)}{!records.length && <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-500">No deductee filings match these filters.</td></tr>}</tbody></table></div>
    </div> : <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{metric('Total responsibility records', responsibilitySummary.total, ClipboardList)}{metric('Assigned', responsibilitySummary.assigned || 0, Users)}{metric('In progress', responsibilitySummary.inProgress, ClipboardList)}{metric('Overdue filings', responsibilitySummary.overdue, ClipboardList)}</div>
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input className={`${filterClass} pl-9`} placeholder="Search staff or deductee" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} /></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8"><select className={filterClass} value={staffFilters.staffId} onChange={(e) => setStaffFilters({ ...staffFilters, staffId: e.target.value })}><option value="">All staff</option>{employees.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select><select className={filterClass} value={staffFilters.responsibilityStatus} onChange={(e) => setStaffFilters({ ...staffFilters, responsibilityStatus: e.target.value })}><option value="">All responsibility states</option>{responsibilityStatuses.map((value) => <option key={value}>{value}</option>)}</select><select className={filterClass} value={staffFilters.category} onChange={(e) => setStaffFilters({ ...staffFilters, category: e.target.value })}><option value="">All deductee types</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input className={filterClass} placeholder="Financial year" value={staffFilters.financialYear} onChange={(e) => setStaffFilters({ ...staffFilters, financialYear: e.target.value })} /><select className={filterClass} value={staffFilters.quarter} onChange={(e) => setStaffFilters({ ...staffFilters, quarter: e.target.value })}><option value="">All quarters</option>{['Q1', 'Q2', 'Q3', 'Q4'].map((q) => <option key={q}>{q}</option>)}</select><select className={filterClass} value={staffFilters.filingStatus} onChange={(e) => setStaffFilters({ ...staffFilters, filingStatus: e.target.value })}><option value="">All filing states</option>{[...filingStatuses, 'OVERDUE'].map((value) => <option key={value}>{value}</option>)}</select><input aria-label="Assigned from" type="date" className={filterClass} value={staffFilters.assignedFrom} onChange={(e) => setStaffFilters({ ...staffFilters, assignedFrom: e.target.value })} /><input aria-label="Assigned to" type="date" className={filterClass} value={staffFilters.assignedTo} onChange={(e) => setStaffFilters({ ...staffFilters, assignedTo: e.target.value })} /><input aria-label="Filing date from" type="date" className={filterClass} value={staffFilters.filingFrom} onChange={(e) => setStaffFilters({ ...staffFilters, filingFrom: e.target.value })} /><input aria-label="Filing date to" type="date" className={filterClass} value={staffFilters.filingTo} onChange={(e) => setStaffFilters({ ...staffFilters, filingTo: e.target.value })} /><input aria-label="Due date from" type="date" className={filterClass} value={staffFilters.dueFrom} onChange={(e) => setStaffFilters({ ...staffFilters, dueFrom: e.target.value })} /><input aria-label="Due date to" type="date" className={filterClass} value={staffFilters.dueTo} onChange={(e) => setStaffFilters({ ...staffFilters, dueTo: e.target.value })} /></div></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><table className="w-full min-w-[1050px] text-left text-xs"><thead className="border-b bg-slate-50 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/60"><tr>{['Responsible staff', 'Deductee', 'Filing period', 'Assigned date', 'Due date', 'Responsibility', 'Filing status', ''].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{responsibilityRows.map((record) => { const derivedStatus = record.filingStatus || record.status; return <tr key={record.id}><td className="px-4 py-3 font-medium">{record.assignedTo?.name || 'Unassigned'}<span className="mt-1 block text-[10px] text-slate-500">{record.assignedTo?.employeeId || '—'}</span></td><td className="px-4 py-3">{record.deducteeName}<span className="mt-1 block text-[10px] text-slate-500">{record.deducteeCategory} · {record.deducteeReference || '—'}</span></td><td className="px-4 py-3">FY {record.financialYear} · {record.quarter}<span className="mt-1 block text-[10px] text-slate-500">₹{record.tdsAmount.toLocaleString('en-IN')}</span></td><td className="px-4 py-3">{record.assignedAt ? new Date(record.assignedAt).toLocaleDateString('en-IN') : '—'}</td><td className="px-4 py-3">{record.dueDate ? new Date(record.dueDate).toLocaleDateString('en-IN') : '—'}</td><td className="px-4 py-3"><StatusBadge label={record.responsibilityStatus.replace('_', ' ')} variant={record.responsibilityStatus === 'COMPLETED' ? 'success' : 'info'} /></td><td className="px-4 py-3"><StatusBadge label={derivedStatus.replace('_', ' ')} variant={derivedStatus === 'FILED' ? 'success' : derivedStatus === 'OVERDUE' ? 'danger' : 'warning'} /></td><td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => void showDetails(record)} title="View assignment history" className="rounded-lg border p-2 dark:border-slate-700"><History className="h-3.5 w-3.5" /></button>{session.permission !== 'VIEW' && <button onClick={() => setAssignmentRecord(record)} className="rounded-lg border px-2 py-1.5 text-[11px] dark:border-slate-700">Assign / update</button>}</div></td></tr>; })}{!responsibilityRows.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No responsibility records match these filters.</td></tr>}</tbody></table></div>
    </div>}

    {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={saveRecord} className="max-h-[92vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900" aria-label="TDS filing form"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-slate-900 dark:text-white">{correctionBase ? 'File a correction' : editing ? 'Edit filing' : 'New TDS filing'}</h3><p className="mt-1 text-[11px] text-slate-500">Deductee identity and staff responsibility are recorded separately.</p></div><button type="button" onClick={() => setFormOpen(false)} aria-label="Close"><X className="h-4 w-4" /></button></div>
      <div><h4 className="mb-2 text-xs font-semibold text-rose-800 dark:text-rose-300">Deductee information</h4><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><select name="deducteeCategory" required value={formCategory} onChange={(e) => setFormCategory(e.target.value)} disabled={!!correctionBase} className={inputClass}>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{correctionBase && <input type="hidden" name="deducteeCategory" value={formCategory} />}{formCategory === 'EMPLOYEE' ? <select name="deducteeEmployeeId" required defaultValue={editing?.deducteeEmployeeId || correctionBase?.deducteeEmployeeId || ''} className={inputClass}><option value="">Choose existing employee</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.employeeId}</option>)}</select> : <input name="deducteeName" required defaultValue={correctionBase?.deducteeName || editing?.deducteeName} placeholder={`${formCategory === 'CLIENT' ? 'Client' : 'Vendor'} name`} className={inputClass} />}{formCategory === 'CLIENT' && <select name="deducteeCollegeId" defaultValue={editing?.deducteeCollegeId || correctionBase?.deducteeCollegeId || ''} className={inputClass}><option value="">External client / no linked record</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.code ? ` · ${client.code}` : ''}</option>)}</select>}{formCategory === 'EMPLOYEE' && <input type="hidden" name="deducteeName" value={employees.find((item) => item.id === (editing?.deducteeEmployeeId || correctionBase?.deducteeEmployeeId))?.name || 'Employee deductee'} /> }<input name="deducteeReference" defaultValue={editing?.deducteeReference || correctionBase?.deducteeReference || ''} placeholder="Deductee reference (optional)" className={inputClass} /><input name="panNumber" defaultValue={editing?.panNumber || correctionBase?.panNumber || ''} placeholder="PAN (optional)" className={inputClass} /><input name="tanNumber" defaultValue={editing?.tanNumber || correctionBase?.tanNumber || ''} placeholder="TAN (optional)" className={inputClass} /></div></div>
      <div><h4 className="mb-2 text-xs font-semibold text-rose-800 dark:text-rose-300">Filing details and responsibility</h4><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><input name="financialYear" required defaultValue={editing?.financialYear || correctionBase?.financialYear} placeholder="Financial year e.g. 2026-27" className={inputClass} /><select name="quarter" required defaultValue={editing?.quarter || correctionBase?.quarter || 'Q1'} className={inputClass}>{['Q1', 'Q2', 'Q3', 'Q4'].map((q) => <option key={q}>{q}</option>)}</select><select name="returnType" defaultValue={editing?.returnType || correctionBase?.returnType || 'OTHER'} className={inputClass}>{['OTHER', '24Q', '26Q', '27Q', '27EQ'].map((type) => <option key={type}>{type}</option>)}</select><input name="tdsAmount" type="number" min="0" step="0.01" required defaultValue={editing?.tdsAmount || correctionBase?.tdsAmount} placeholder="TDS amount" className={inputClass} /><select name="status" defaultValue={editing?.status || correctionBase?.status || 'PENDING'} className={inputClass}>{filingStatuses.map((status) => <option key={status}>{status}</option>)}</select><input name="dueDate" type="date" defaultValue={editing?.dueDate?.slice(0, 10) || correctionBase?.dueDate?.slice(0, 10)} className={inputClass} /><input name="filingDate" type="date" defaultValue={editing?.filingDate?.slice(0, 10)} className={inputClass} /><input name="acknowledgementRef" defaultValue={editing?.acknowledgementRef || ''} placeholder="Acknowledgement / filing reference" className={inputClass} />{!editing && <select name="assignedToId" required defaultValue=""><option value="">Assign responsible staff</option>{employees.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.employeeId}</option>)}</select>}{!editing && <select name="responsibilityStatus" defaultValue="ASSIGNED" className={inputClass}>{responsibilityStatuses.filter((status) => status !== 'UNASSIGNED').map((status) => <option key={status}>{status}</option>)}</select>}{!editing && <input name="responsibilityRemarks" placeholder="Assignment note (optional)" className={inputClass} />}{correctionBase && <input name="correctionReason" required placeholder="Correction reason" className={`${inputClass} sm:col-span-2`} />}<textarea name="remarks" defaultValue={editing?.remarks || ''} placeholder="Filing remarks" className={`${inputClass} sm:col-span-2 lg:col-span-3`} /></div></div>
      {correctionBase && <p className="text-[11px] text-slate-500">Correction of {correctionBase.id}; revision {correctionBase.revision + 1} will be linked to its original filing.</p>}<p className="text-[11px] text-slate-500">Your verified account and timestamp will be written to the relevant filing history.</p><button className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">Save filing</button></form></div>}

    {assignmentRecord && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={saveResponsibility} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"><div className="flex justify-between"><div><h3 className="font-semibold">Staff responsibility</h3><p className="mt-1 text-xs text-slate-500">{assignmentRecord.deducteeName} · {assignmentRecord.financialYear} {assignmentRecord.quarter}</p></div><button type="button" onClick={() => setAssignmentRecord(null)} aria-label="Close"><X className="h-4 w-4" /></button></div><label className="block text-xs font-medium">Responsible staff<select name="assignedToId" defaultValue={assignmentRecord.assignedToId || ''} className={`${inputClass} mt-1`}><option value="">Unassigned</option>{employees.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.employeeId}</option>)}</select></label><label className="block text-xs font-medium">Assignment status<select name="responsibilityStatus" defaultValue={assignmentRecord.responsibilityStatus} className={`${inputClass} mt-1`}>{responsibilityStatuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="block text-xs font-medium">Responsibility note<textarea name="remarks" defaultValue={assignmentRecord.responsibilityRemarks || ''} className={`${inputClass} mt-1`} /></label><button className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">Save responsibility</button></form></div>}

    {detailRecord && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"><div className="flex items-start justify-between"><div><h3 className="font-semibold">{detailRecord.deducteeName}</h3><p className="mt-1 text-xs text-slate-500">{detailRecord.deducteeCategory} · FY {detailRecord.financialYear} · {detailRecord.quarter} · {detailRecord.returnType} · revision {detailRecord.revision}</p></div><button onClick={() => setDetailRecord(null)} aria-label="Close details"><X className="h-4 w-4" /></button></div>{session.permission !== 'VIEW' && <button onClick={() => startCorrection(detailRecord)} className="mt-3 rounded-lg border px-3 py-2 text-xs">Create correction</button>}<dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-800 sm:grid-cols-3">{[['Deductee reference', detailRecord.deducteeReference || detailRecord.deducteeEmployee?.employeeId || detailRecord.deducteeCollege?.code || '—'], ['PAN', detailRecord.panNumber || '—'], ['TAN', detailRecord.tanNumber || '—'], ['TDS amount', `₹${detailRecord.tdsAmount.toLocaleString('en-IN')}`], ['Filing status', detailRecord.status], ['Due date', detailRecord.dueDate ? new Date(detailRecord.dueDate).toLocaleDateString('en-IN') : '—'], ['Filing date', detailRecord.filingDate ? new Date(detailRecord.filingDate).toLocaleDateString('en-IN') : '—'], ['Acknowledgement', detailRecord.acknowledgementRef || '—'], ['Responsible staff', detailRecord.assignedTo?.name || 'Unassigned'], ['Staff ID', detailRecord.assignedTo?.employeeId || '—'], ['Assigned date', detailRecord.assignedAt ? new Date(detailRecord.assignedAt).toLocaleDateString('en-IN') : '—'], ['Responsibility', detailRecord.responsibilityStatus], ['Filing completed', detailRecord.completedAt ? new Date(detailRecord.completedAt).toLocaleDateString('en-IN') : '—']].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}<div className="col-span-2 sm:col-span-3"><dt className="text-slate-500">Responsibility notes</dt><dd className="mt-1">{detailRecord.responsibilityRemarks || '—'}</dd><dt className="mt-2 text-slate-500">Filing remarks</dt><dd className="mt-1">{detailRecord.remarks || '—'}</dd></div></dl><div className="mt-5 grid gap-6 md:grid-cols-2"><div><h4 className="text-xs font-semibold">Filing status history</h4><div className="mt-3 space-y-3">{filingHistory.map((item) => <div key={item.id} className="border-l-2 border-rose-200 pl-3"><p className="text-xs font-semibold">{item.action.replace('_', ' ')} · {item.actor.name} ({item.actor.employeeId})</p><p className="mt-1 text-[11px] text-slate-500">{item.fromStatus || '—'} → {item.toStatus || '—'} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>{item.details && <p className="text-[11px] text-slate-500">{item.details}</p>}</div>)}</div></div><div><h4 className="text-xs font-semibold">Staff assignment history</h4><div className="mt-3 space-y-3">{assignmentHistory.map((item) => <div key={item.id} className="border-l-2 border-blue-200 pl-3"><p className="text-xs font-semibold">{item.fromAssignedTo?.name || 'Unassigned'} → {item.assignedTo?.name || 'Unassigned'}</p><p className="mt-1 text-[11px] text-slate-500">{item.fromStatus || '—'} → {item.toStatus} · {item.actor.name} · {new Date(item.createdAt).toLocaleString('en-IN')}</p>{item.remarks && <p className="text-[11px] text-slate-500">{item.remarks}</p>}</div>)}</div></div></div></div></div>}

    {session.permission === 'ADMIN' && <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><h3 className="flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4" /> TDS access and enrollment</h3><form onSubmit={updateGrant} className="mt-3 flex flex-wrap gap-2"><select required value={grantEmployeeId} onChange={(e) => setGrantEmployeeId(e.target.value)} className={`${inputClass} min-w-48 flex-1`}><option value="">Choose employee</option>{employees.filter((person) => person.role !== 'FOUNDER').map((person) => <option key={person.id} value={person.id}>{person.name} · {person.employeeId}</option>)}</select><select value={grantPermission} onChange={(e) => setGrantPermission(e.target.value)} className={inputClass}><option>VIEW</option><option>MANAGE</option></select><button className="rounded-xl border px-3 py-2 text-xs">Grant</button></form><form onSubmit={createEnrollment} className="mt-3 flex flex-wrap gap-2"><select required value={enrollEmployee} onChange={(e) => setEnrollEmployee(e.target.value)} className={`${inputClass} min-w-48 flex-1`}><option value="">Enroll/reset employee</option>{employees.filter((person) => person.role !== 'FOUNDER').map((person) => <option key={person.id} value={person.id}>{person.name} · {person.employeeId}</option>)}</select><button className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-white dark:bg-slate-700">Create setup token</button></form>{enrollmentToken && <div className="mt-2 break-all rounded-lg bg-amber-50 p-2 text-[11px] text-amber-900">One-time token (shown once): {enrollmentToken}</div>}{grants.map((grant) => <div key={grant.employee.id} className="mt-3 flex items-center justify-between border-t pt-2 text-xs"><span>{grant.employee.name} · {grant.permission}</span><button onClick={() => void revokeGrant(grant.employee.id)} className="text-rose-600">Revoke</button></div>)}</div>}
  </section>;
}

