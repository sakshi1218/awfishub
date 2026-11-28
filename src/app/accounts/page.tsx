'use client';

import React, { useState } from 'react';
import {
  BadgeDollarSign,
  FileCheck2,
  Receipt,
  Download,
  Search,
  TrendingUp,
  Wallet,
  PiggyBank,
  Landmark,
  Clock3,
  CircleAlert,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import FinanceWorkflowSections from '@/components/accounts/FinanceWorkflowSections';
import TdsFilingWorkspace from '@/components/accounts/TdsFilingWorkspace';

export default function AccountsAndFinancePage() {
  const {
    isChairperson,
    currentEmployee,
    employees,
    expenseClaims,
    recurringBills,
    gstRecords,
    submitExpenseClaim,
    updateExpenseClaimStatus,
    markBillPaid,
  } = useApp();

  const [tab, setTab] = useState<'OVERVIEW' | 'CLAIMS' | 'BILLS' | 'GST' | 'TDS' | 'BUDGETS' | 'PURCHASES' | 'ALLOWANCES' | 'RENT_GST' | 'REPORTS' | 'APPROVALS'>('OVERVIEW');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimStatus, setClaimStatus] = useState('All statuses');
  const [claimCategory, setClaimCategory] = useState('All categories');
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const recordedClaims = expenseClaims.filter((claim) => claim.status === 'Paid');
  const paidBills = recurringBills.filter((bill) => bill.paymentStatus === 'Paid');
  const recordedExpenditure = recordedClaims.reduce((total, claim) => total + claim.amount, 0)
    + paidBills.reduce((total, bill) => total + bill.amount, 0);
  const outstandingExpenditure = expenseClaims
    .filter((claim) => claim.status === 'Approved')
    .reduce((total, claim) => total + claim.amount, 0)
    + recurringBills.filter((bill) => bill.paymentStatus !== 'Paid').reduce((total, bill) => total + bill.amount, 0);
  const pendingApprovalCount = expenseClaims.filter((claim) => claim.status === 'Submitted' || claim.status === 'Under Review').length;
  const overdueBillCount = recurringBills.filter((bill) => bill.paymentStatus === 'Overdue').length;
  const filteredClaims = expenseClaims.filter((claim) => {
    const matchesSearch = `${claim.id} ${claim.claimantName} ${claim.claimantId} ${claim.description}`.toLowerCase().includes(claimSearch.toLowerCase());
    const matchesStatus = claimStatus === 'All statuses' || claim.status === claimStatus;
    const matchesCategory = claimCategory === 'All categories' || claim.category === claimCategory;
    const matchesFrom = !dateFrom || claim.date >= dateFrom;
    const matchesTo = !dateTo || claim.date <= dateTo;
    return matchesSearch && matchesStatus && matchesCategory && matchesFrom && matchesTo;
  });
  const departmentTotals = new Map<string, number>();
  const categoryTotals = new Map<string, number>();
  recordedClaims.forEach((claim) => {
    const department = employees.find((employee) => employee.id === claim.claimantId)?.department || 'Unassigned';
    departmentTotals.set(department, (departmentTotals.get(department) || 0) + claim.amount);
    categoryTotals.set(claim.category, (categoryTotals.get(claim.category) || 0) + claim.amount);
  });
  paidBills.forEach((bill) => {
    departmentTotals.set('Company-wide bills', (departmentTotals.get('Company-wide bills') || 0) + bill.amount);
    categoryTotals.set(bill.category, (categoryTotals.get(bill.category) || 0) + bill.amount);
  });
  const departmentSpending = Array.from(departmentTotals, ([department, expenditure]) => ({ department, expenditure }));
  const categorySpending = Array.from(categoryTotals, ([name, value]) => ({ name, value }));

  if (!isChairperson) {
    return (
      <div className="accounts-workspace space-y-5 text-slate-700 dark:text-slate-200">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-rose-50 p-2.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><FileCheck2 className="h-5 w-5" /></span>
            <div><h1 className="text-lg font-semibold text-slate-900 dark:text-white">TDS Filing</h1><p className="text-xs text-slate-500">Secure filing records workspace</p></div>
          </div>
        </div>
        <TdsFilingWorkspace />
      </div>
    );
  }

  const chartColors = ['#4f46e5', '#0f9f9a', '#f59e0b', '#e76f51', '#3182ce', '#7c3aed'];

  const exportFinanceExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseClaims), 'Expense Claims');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recurringBills), 'Recurring Bills');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gstRecords), 'GST Repository');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(departmentSpending), 'Recorded Expenditure');
    XLSX.writeFile(wb, 'AWFIS_HUB_Finance_Report_Prototype.xlsx');
  };

  const addClaim = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    submitExpenseClaim({
      claimantId: currentEmployee.id,
      claimantName: currentEmployee.name,
      category: String(data.get('category')),
      description: String(data.get('description')),
      amount: Number(data.get('amount')),
      date: String(data.get('date')),
      receiptFile: String(data.get('receiptFile') || 'No receipt reference'),
    });
    form.reset();
    setShowClaimForm(false);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <div className="accounts-workspace space-y-6 text-slate-700 dark:text-slate-200">
      <PageHeader
        title="Accounts & Finance Interface (Chairperson Only)"
        subtitle="Finance overview from available prototype records — income, approved budgets and bank balances are not present in the source data."
        icon={BadgeDollarSign}
        badge="Mock Finance Prototype"
        actions={
          <>
            <button onClick={exportFinanceExcel} className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </>
        }
      />

      <div className="flex max-w-full flex-nowrap gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        {(
          [
            ['OVERVIEW', 'Executive Overview'],
            ['BUDGETS', 'Department Budgets'],
            ['PURCHASES', 'Purchases & Costing'],
            ['ALLOWANCES', 'Employee Allowances'],
            ['RENT_GST', 'Rent & GST'],
            ['CLAIMS', `Expense Claims (${expenseClaims.length})`],
            ['BILLS', `Recurring Bills (${recurringBills.length})`],
            ['APPROVALS', 'Approvals'],
            ['REPORTS', 'Reports'],
            ['GST', 'GST Repository'],
            ['TDS', 'TDS Filing'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === id
                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {id === 'TDS' && <FileCheck2 className="mr-1 inline h-3.5 w-3.5" />}{label}
          </button>
        ))}
      </div>

      {tab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">
            Prototype data only. Figures below are derived from existing mock records; income, approved budgets and cash/bank balances are unavailable and are intentionally not estimated.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2 min-h-28 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Welcome back, CFO</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Here&apos;s your financial overview for today.</p>
              </div>
              <div className="relative w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/60 dark:to-indigo-950/60 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-violet-600 dark:text-violet-300" />
                <BadgeDollarSign className="absolute -bottom-1 -right-1 w-7 h-7 p-1 rounded-full bg-violet-600 text-white" />
              </div>
            </div>
            <DashboardMetricCard label="Total Income" value="Unavailable" subtext="No income records" icon={BadgeDollarSign} tone="blue" />
            <DashboardMetricCard label="Net Profit" value="Unavailable" subtext="Requires income data" icon={TrendingUp} tone="emerald" />
            <DashboardMetricCard label="Total Expenditure" value={formatCurrency(recordedExpenditure)} subtext="Paid claims and bills" icon={Receipt} tone="rose" />
            <DashboardMetricCard label="Cash Balance" value="Unavailable" subtext="No bank balance records" icon={Wallet} tone="purple" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <DashboardMetricCard label="Total Company Budget" value="Unavailable" subtext="No approved budget records" icon={Wallet} tone="purple" />
            <DashboardMetricCard label="Remaining Budget" value="Unavailable" subtext="Requires an approved budget" icon={PiggyBank} tone="indigo" />
            <DashboardMetricCard label="Outstanding Payables" value={formatCurrency(outstandingExpenditure)} subtext="Approved claims and unpaid bills" icon={Landmark} tone="blue" />
            <DashboardMetricCard label="Pending Approvals" value={pendingApprovalCount.toLocaleString('en-IN')} subtext="Expense claims awaiting review" icon={Clock3} tone="amber" />
            <DashboardMetricCard label="Overdue Bills" value={overdueBillCount.toLocaleString('en-IN')} subtext="Unpaid bills past due" icon={CircleAlert} tone="rose" />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold mb-1">Recorded Expenditure by Department</h3>
              <p className="text-[10px] text-slate-500 mb-3">Calculated from paid claims and bills in the available mock records.</p>
              {departmentSpending.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={departmentSpending} margin={{ left: 8, right: 8, bottom: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="department" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" interval={0} /><YAxis tick={{ fontSize: 10 }} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="expenditure" radius={[5, 5, 0, 0]}>{departmentSpending.map((item, index) => <Cell key={item.department} fill={chartColors[index % chartColors.length]} />)}</Bar></BarChart></ResponsiveContainer></div> : <p className="py-16 text-center text-xs text-slate-500">No paid expenditure records.</p>}
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold mb-1">Recorded Spend by Category</h3>
              <p className="text-[10px] text-slate-500 mb-3">Unpaid claims and bills are excluded from actual spend.</p>
              {categorySpending.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categorySpending} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name }) => name}>{categorySpending.map((item, index) => <Cell key={item.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value) => formatCurrency(Number(value))} /></PieChart></ResponsiveContainer></div> : <p className="py-16 text-center text-xs text-slate-500">No paid expenditure records.</p>}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center gap-3 mb-3"><h3 className="text-xs font-bold">Outstanding Items</h3><span className="text-[10px] text-slate-500">Approval or payment action required</span></div>
            <div className="space-y-2">
              {expenseClaims.filter((claim) => claim.status === 'Approved').map((claim) => <div key={claim.id} className="flex justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"><span>{claim.claimantName} · {claim.category}</span><b>{formatCurrency(claim.amount)}</b></div>)}
              {recurringBills.filter((bill) => bill.paymentStatus !== 'Paid').map((bill) => <div key={bill.id} className="flex justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"><span>{bill.vendor} · due {bill.dueDate}</span><b>{formatCurrency(bill.amount)}</b></div>)}
              {!outstandingExpenditure && <p className="py-5 text-center text-xs text-slate-500">No outstanding items.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'CLAIMS' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">Expense records are prototype data. The receipt field stores a reference name only; it does not upload a file.</div>
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1 min-w-48"><Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" /><input value={claimSearch} onChange={(event) => setClaimSearch(event.target.value)} placeholder="Search claimant, claim ID or description" className="w-full pl-8 pr-3 py-2 rounded-lg border text-xs bg-transparent" /></div>
            <select value={claimStatus} onChange={(event) => setClaimStatus(event.target.value)} className="p-2 rounded-lg border text-xs bg-transparent"><option>All statuses</option>{['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'].map((status) => <option key={status}>{status}</option>)}</select>
            <select value={claimCategory} onChange={(event) => setClaimCategory(event.target.value)} className="p-2 rounded-lg border text-xs bg-transparent"><option>All categories</option>{Array.from(new Set(expenseClaims.map((claim) => claim.category))).map((category) => <option key={category}>{category}</option>)}</select>
            <input aria-label="From date" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="p-2 rounded-lg border text-xs bg-transparent" />
            <input aria-label="To date" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="p-2 rounded-lg border text-xs bg-transparent" />
            <button onClick={() => setShowClaimForm(!showClaimForm)} className="px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-bold">New Claim</button>
          </div>
          {showClaimForm && <form onSubmit={addClaim} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><input name="category" required placeholder="Expense category" className="p-2 rounded-lg border text-xs bg-transparent" /><input name="amount" type="number" min="1" required placeholder="Amount (₹)" className="p-2 rounded-lg border text-xs bg-transparent" /><input name="date" type="date" required className="p-2 rounded-lg border text-xs bg-transparent" /><input name="description" required placeholder="Description" className="p-2 rounded-lg border text-xs bg-transparent" /><input name="receiptFile" placeholder="Receipt reference (optional)" className="p-2 rounded-lg border text-xs bg-transparent" />          <button className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold">Submit claim</button></form>}
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap justify-between items-center gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {claim.id} • {claim.claimantName} ({claim.claimantId}) — ₹{claim.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-slate-500">{claim.category}: {claim.description} • Receipt: {claim.receiptFile}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={claim.status}
                  variant={claim.status === 'Paid' || claim.status === 'Approved' ? 'success' : claim.status === 'Rejected' ? 'danger' : 'warning'}
                />
                {(claim.status === 'Submitted' || claim.status === 'Under Review') && (
                  <>
                    <button onClick={() => updateExpenseClaimStatus(claim.id, 'Approved')} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">Approve</button>
                    <button onClick={() => updateExpenseClaimStatus(claim.id, 'Rejected')} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold">Reject</button>
                  </>
                )}
                {claim.status === 'Approved' && (
                  <button onClick={() => updateExpenseClaimStatus(claim.id, 'Paid')} className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">Mark Paid</button>
                )}
              </div>
            </div>
          ))}
          {!filteredClaims.length && <p className="py-10 text-center text-xs text-slate-500">No claims match these filters.</p>}
        </div>
      )}

      {tab === 'BILLS' && (
        <div className="space-y-3">
          {recurringBills.map((bill) => (
            <div key={bill.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap justify-between items-center gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{bill.category} — {bill.vendor}</p>
                <p className="text-[11px] text-slate-500">₹{bill.amount.toLocaleString('en-IN')} • Due: {bill.dueDate} ({bill.frequency}) • Ref: {bill.documentRef}</p>
              </div>
              <div className="flex items-center gap-2">
                {bill.reminderBadge && (
                  <StatusBadge label={bill.reminderBadge} variant={bill.reminderBadge === 'Overdue' ? 'danger' : 'warning'} />
                )}
                <StatusBadge label={bill.paymentStatus} variant={bill.paymentStatus === 'Paid' ? 'success' : 'info'} />
                {bill.paymentStatus !== 'Paid' && (
                  <button onClick={() => markBillPaid(bill.id)} className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold">Mark Paid</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'GST' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">File Reference</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {gstRecords.map((g) => (
                <tr key={g.id}>
                  <td className="py-3 px-4 font-bold">{g.period}</td>
                  <td className="py-3 px-4">{g.category}</td>
                  <td className="py-3 px-4 font-mono text-blue-600">{g.fileRef}</td>
                  <td className="py-3 px-4 text-slate-500">{g.uploadDate}</td>
                  <td className="py-3 px-4"><StatusBadge label={g.complianceStatus} variant={g.complianceStatus === 'Pending' ? 'warning' : 'success'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'TDS' && <TdsFilingWorkspace />}
      {(['BUDGETS', 'PURCHASES', 'ALLOWANCES', 'RENT_GST', 'REPORTS', 'APPROVALS'] as const).map((section) => (
        <FinanceWorkflowSections key={section} activeSection={section} active={tab === section} departmentSpending={departmentSpending} />
      ))}
    </div>
  );
}

