'use client';

import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/shared/StatusBadge';

type Section = 'BUDGETS' | 'PURCHASES' | 'ALLOWANCES' | 'RENT_GST' | 'REPORTS' | 'APPROVALS';
type Budget = { id: string; department: string; period: string; amount: number; status: 'Pending' | 'Approved' | 'Rejected' };
type Purchase = { id: string; item: string; vendor: string; department: string; category: string; quantity: number; unitPrice: number; amount: number; date: string; invoice: string; status: 'Pending Approval' | 'Approved' | 'Paid' | 'Rejected' };
type Allowance = { id: string; employeeId: string; employeeName: string; department: string; type: string; amount: number; date: string; remarks: string; document: string; status: 'Pending Approval' | 'Approved' | 'Paid' | 'Rejected' };

const DEPARTMENTS = ['Administration', 'Sales Department', 'Media', 'HR', 'Operation Team', 'Trainer', 'TeleCaller', 'Technical Team', 'Other / Company-wide'];

function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const keys = Object.keys(rows[0] || {});
  const csv = [keys.join(','), ...rows.map((row) => keys.map((key) => `"${String(row[key] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function FinanceWorkflowSections({
  activeSection,
  active,
  departmentSpending,
}: {
  activeSection: Section;
  active: boolean;
  departmentSpending: Array<{ department: string; expenditure: number }>;
}) {
  const { employees, expenseClaims, recurringBills, gstRecords, updateExpenseClaimStatus } = useApp();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const addRecord = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (activeSection === 'BUDGETS') {
      setBudgets((items) => [{
        id: `BUD-${Date.now()}`,
        department: String(data.get('department')),
        period: String(data.get('period')),
        amount: Number(data.get('amount')),
        status: 'Pending',
      }, ...items]);
    } else if (activeSection === 'PURCHASES') {
      const quantity = Number(data.get('quantity'));
      const unitPrice = Number(data.get('unitPrice'));
      setPurchases((items) => [{
        id: `PUR-${Date.now()}`,
        item: String(data.get('item')),
        vendor: String(data.get('vendor')),
        department: String(data.get('department')),
        category: String(data.get('category')),
        quantity,
        unitPrice,
        amount: quantity * unitPrice,
        date: String(data.get('date')),
        invoice: String(data.get('invoice') || ''),
        status: 'Pending Approval',
      }, ...items]);
    } else if (activeSection === 'ALLOWANCES') {
      const employee = employees.find((item) => item.id === String(data.get('employeeId')));
      if (!employee) return;
      setAllowances((items) => [{
        id: `ALW-${Date.now()}`,
        employeeId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        type: String(data.get('type')),
        amount: Number(data.get('amount')),
        date: String(data.get('date')),
        remarks: String(data.get('remarks') || ''),
        document: String(data.get('document') || ''),
        status: 'Pending Approval',
      }, ...items]);
    }
    form.reset();
    setShowForm(false);
  };

  const setBudgetStatus = (id: string, status: Budget['status']) => setBudgets((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  const setPurchaseStatus = (id: string, status: Purchase['status']) => setPurchases((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  const setAllowanceStatus = (id: string, status: Allowance['status']) => setAllowances((items) => items.map((item) => item.id === id ? { ...item, status } : item));

  const reportRows = (title: string): Array<Record<string, string | number>> => {
    if (title === 'Purchase Report') return purchases.map(({ item, vendor, department, category, quantity, unitPrice, amount, date, invoice, status }) => ({ item, vendor, department, category, quantity, unitPrice, amount, date, invoice, status }));
    if (title === 'Employee Allowance Report') return allowances.map(({ employeeName, employeeId, department, type, amount, date, remarks, document, status }) => ({ employeeName, employeeId, department, type, amount, date, remarks, document, status }));
    if (title === 'Vendor Payment Report') return recurringBills.map((bill) => ({ vendor: bill.vendor, category: bill.category, amount: bill.amount, dueDate: bill.dueDate, status: bill.paymentStatus }));
    if (title === 'GST Report') return gstRecords.map((record) => ({ period: record.period, category: record.category, file: record.fileRef, date: record.uploadDate, status: record.complianceStatus }));
    if (title === 'Department-wise Expense Report') return departmentSpending.map((item) => ({ department: item.department, expenditure: item.expenditure }));
    if (title === 'Outstanding Bills Report') return [
      ...expenseClaims.filter((claim) => claim.status === 'Approved').map((claim) => ({ id: claim.id, payee: claim.claimantName, category: claim.category, amount: claim.amount, date: claim.date, status: claim.status })),
      ...recurringBills.filter((bill) => bill.paymentStatus !== 'Paid').map((bill) => ({ id: bill.id, payee: bill.vendor, category: bill.category, amount: bill.amount, date: bill.dueDate, status: bill.paymentStatus })),
    ];
    if (title === 'Expenditure Report') return expenseClaims.filter((claim) => claim.status === 'Approved' || claim.status === 'Paid').map((claim) => ({ id: claim.id, claimant: claim.claimantName, category: claim.category, amount: claim.amount, date: claim.date, status: claim.status }));
    return [{ status: 'Unavailable', note: title.includes('Budget') ? 'No company budget data is available.' : 'Required source records are not available.' }];
  };

  const titles: Record<Section, string> = {
    BUDGETS: 'Department Budgets',
    PURCHASES: 'Purchases & Costing',
    ALLOWANCES: 'Employee Allowances',
    RENT_GST: 'Rent & GST Management',
    REPORTS: 'Financial Reports',
    APPROVALS: 'Financial Approvals',
  };

  return (
    <div className={`accounts-workspace ${active ? 'space-y-4' : 'hidden'}`} aria-hidden={!active}>
      <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">
        <b>Prototype workspace:</b> new records are held in page memory only and clear on refresh. No real payment or approval is made.
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">{titles[activeSection]}</h2>
        <p className="text-[11px] text-slate-500 mt-1">Company-wide finance workspace · UI prototype</p>
      </div>

      {activeSection === 'BUDGETS' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Budget allocations entered by users; no demo amounts are pre-populated.</p><button onClick={() => setShowForm(!showForm)} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex gap-1"><Plus className="w-3.5 h-3.5" /> Allocate</button></div>
          {showForm && <form onSubmit={addRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><select name="department" className="p-2 rounded-lg border text-xs">{DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}</select><select name="period" className="p-2 rounded-lg border text-xs"><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select><input name="amount" type="number" min="1" required placeholder="Budget amount" className="p-2 rounded-lg border text-xs" /><button className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold">Submit for approval</button></form>}
          {budgets.length ? <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-2 text-left">Department</th><th className="p-2">Period</th><th className="p-2 text-right">Budget</th><th className="p-2 text-right">Actual spend</th><th className="p-2">Status</th><th className="p-2 text-right">Remaining / utilization</th></tr></thead><tbody>{budgets.map((budget) => { const spent = departmentSpending.find((row) => row.department === budget.department)?.expenditure || 0; const utilization = Math.round(spent / budget.amount * 100); return <tr key={budget.id} className="border-t"><td className="p-2">{budget.department}</td><td className="p-2 text-center">{budget.period}</td><td className="p-2 text-right">{formatCurrency(budget.amount)}</td><td className="p-2 text-right">{formatCurrency(spent)}</td><td className="p-2"><StatusBadge label={budget.status} variant={budget.status === 'Approved' ? 'success' : budget.status === 'Rejected' ? 'danger' : 'warning'} /></td><td className={`p-2 text-right ${budget.status === 'Approved' && utilization > 100 ? 'text-rose-600 font-bold' : ''}`}>{budget.status === 'Approved' ? `${formatCurrency(budget.amount - spent)} · ${utilization}%` : 'Not approved'}</td></tr>; })}</tbody></table></div> : <p className="py-8 text-center text-xs text-slate-500">No department budget entries yet.</p>}
        </div>
      )}

      {activeSection === 'PURCHASES' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between"><p className="text-xs text-slate-500">Quantity × unit price is calculated automatically.</p><button onClick={() => setShowForm(!showForm)} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex gap-1"><Plus className="w-3.5 h-3.5" /> Add Purchase</button></div>
          {showForm && <form onSubmit={addRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><input name="item" required placeholder="Item or service" className="p-2 rounded-lg border text-xs" /><input name="vendor" required placeholder="Vendor" className="p-2 rounded-lg border text-xs" /><select name="department" className="p-2 rounded-lg border text-xs">{DEPARTMENTS.map((department) => <option key={department}>{department}</option>)}</select><input name="category" required placeholder="Expense category" className="p-2 rounded-lg border text-xs" /><input name="quantity" type="number" min="1" required placeholder="Quantity" className="p-2 rounded-lg border text-xs" /><input name="unitPrice" type="number" min="0.01" step="0.01" required placeholder="Unit price" className="p-2 rounded-lg border text-xs" /><input name="date" type="date" required className="p-2 rounded-lg border text-xs" /><input name="invoice" placeholder="Invoice reference" className="p-2 rounded-lg border text-xs" /><button className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold">Submit purchase</button></form>}
          {purchases.length ? <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-2 text-left">Item / vendor</th><th className="p-2">Department</th><th className="p-2">Quantity × unit price</th><th className="p-2 text-right">Total</th><th className="p-2">Date / invoice</th><th className="p-2">Status</th></tr></thead><tbody>{purchases.map((purchase) => <tr key={purchase.id} className="border-t"><td className="p-2">{purchase.item}<br />{purchase.vendor}</td><td className="p-2">{purchase.department}<br />{purchase.category}</td><td className="p-2">{purchase.quantity} × {formatCurrency(purchase.unitPrice)}</td><td className="p-2 text-right">{formatCurrency(purchase.amount)}</td><td className="p-2">{purchase.date}<br />{purchase.invoice || '—'}</td><td className="p-2"><StatusBadge label={purchase.status} />{purchase.status === 'Approved' && <button onClick={() => setPurchaseStatus(purchase.id, 'Paid')} className="ml-1 text-[10px] text-violet-600">Mark paid</button>}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-xs text-slate-500">No purchases entered.</p>}
        </div>
      )}

      {activeSection === 'ALLOWANCES' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between"><p className="text-xs text-slate-500">Select existing employees; no duplicate employee records are created.</p><button onClick={() => setShowForm(!showForm)} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex gap-1"><Plus className="w-3.5 h-3.5" /> Add Allowance</button></div>
          {showForm && <form onSubmit={addRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><select name="employeeId" required className="p-2 rounded-lg border text-xs"><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.department}</option>)}</select><input name="type" required placeholder="Allowance type" className="p-2 rounded-lg border text-xs" /><input name="amount" type="number" min="1" required placeholder="Amount" className="p-2 rounded-lg border text-xs" /><input name="date" type="date" required className="p-2 rounded-lg border text-xs" /><input name="remarks" placeholder="Remarks" className="p-2 rounded-lg border text-xs" /><input name="document" placeholder="Supporting document reference" className="p-2 rounded-lg border text-xs" /><button className="rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold">Submit allowance</button></form>}
          {allowances.length ? <div className="overflow-x-auto"><table className="w-full text-xs"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-2 text-left">Employee / department</th><th className="p-2">Allowance / remarks</th><th className="p-2">Date</th><th className="p-2 text-right">Amount</th><th className="p-2">Status</th></tr></thead><tbody>{allowances.map((allowance) => <tr key={allowance.id} className="border-t"><td className="p-2">{allowance.employeeName}<br />{allowance.department}</td><td className="p-2">{allowance.type} · {allowance.remarks}<br />{allowance.document}</td><td className="p-2">{allowance.date}</td><td className="p-2 text-right">{formatCurrency(allowance.amount)}</td><td className="p-2"><StatusBadge label={allowance.status} />{allowance.status === 'Approved' && <button onClick={() => setAllowanceStatus(allowance.id, 'Paid')} className="ml-1 text-[10px] text-blue-600">Mark paid</button>}</td></tr>)}</tbody></table></div> : <p className="py-8 text-center text-xs text-slate-500">No allowance requests entered.</p>}
        </div>
      )}

      {activeSection === 'RENT_GST' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold mb-3">Rent & premises bills</h3>{recurringBills.filter((bill) => bill.category === 'Rental').map((bill) => <div key={bill.id} className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex justify-between gap-2"><div><b>{bill.vendor}</b><p className="text-[10px] text-slate-500">Due {bill.dueDate} · {bill.documentRef}</p></div><div className="text-right">{formatCurrency(bill.amount)}<br /><StatusBadge label={bill.paymentStatus} variant={bill.paymentStatus === 'Paid' ? 'success' : 'warning'} /></div></div>)}</div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><h3 className="text-xs font-bold mb-3">GST filing repository</h3>{gstRecords.map((record) => <div key={record.id} className="p-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex justify-between gap-2"><div><b>{record.category}</b><p className="text-[10px] text-slate-500">{record.period} · {record.fileRef}</p></div><StatusBadge label={record.complianceStatus} variant={record.complianceStatus === 'Pending' ? 'warning' : 'success'} /></div>)}<p className="text-[10px] text-slate-500">GST amounts and ITC values are not in the existing records.</p></div>
        </div>
      )}

      {activeSection === 'REPORTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {['Income Report', 'Expenditure Report', 'Profit & Loss Report', 'Department-wise Expense Report', 'Budget Utilization Report', 'Purchase Report', 'Employee Allowance Report', 'Vendor Payment Report', 'Outstanding Bills Report', 'GST Report', 'TDS Report', 'Monthly & Yearly Summary'].map((title) => <div key={title} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex justify-between items-center gap-3"><div><h3 className="text-xs font-bold">{title}</h3><p className="text-[10px] text-slate-500 mt-1">{['Income Report', 'Profit & Loss Report', 'Budget Utilization Report', 'TDS Report', 'Monthly & Yearly Summary'].includes(title) ? 'Source records unavailable' : 'Export available records'}</p></div><button onClick={() => exportCsv(`${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, reportRows(title))} title={`Export ${title} CSV`} className="p-2 rounded-lg border text-slate-600 dark:text-slate-300"><Download className="w-4 h-4" /></button></div>)}
        </div>
      )}

      {activeSection === 'APPROVALS' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-200">Prototype actions only. The app has no authenticated server session; these are not secure approvals.</div>
          {expenseClaims.filter((claim) => claim.status === 'Submitted' || claim.status === 'Under Review').map((claim) => <div key={claim.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border flex flex-wrap items-center justify-between gap-3 text-xs"><div><b>{claim.id} · {claim.claimantName} · {formatCurrency(claim.amount)}</b><p className="text-[10px] text-slate-500">{claim.category}: {claim.description}</p></div><div className="flex gap-2"><button onClick={() => updateExpenseClaimStatus(claim.id, 'Approved')} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold">Approve</button><button onClick={() => updateExpenseClaimStatus(claim.id, 'Rejected')} className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 font-bold">Reject</button></div></div>)}
          {budgets.filter((budget) => budget.status === 'Pending').map((budget) => <div key={budget.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border flex justify-between text-xs"><b>Budget · {budget.department} · {formatCurrency(budget.amount)}</b><div className="flex gap-2"><button onClick={() => setBudgetStatus(budget.id, 'Approved')} className="text-emerald-600 font-bold">Approve</button><button onClick={() => setBudgetStatus(budget.id, 'Rejected')} className="text-rose-600 font-bold">Reject</button></div></div>)}
          {purchases.filter((purchase) => purchase.status === 'Pending Approval').map((purchase) => <div key={purchase.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border flex justify-between text-xs"><b>Purchase · {purchase.item} · {formatCurrency(purchase.amount)}</b><div className="flex gap-2"><button onClick={() => setPurchaseStatus(purchase.id, 'Approved')} className="text-emerald-600 font-bold">Approve</button><button onClick={() => setPurchaseStatus(purchase.id, 'Rejected')} className="text-rose-600 font-bold">Reject</button></div></div>)}
          {allowances.filter((allowance) => allowance.status === 'Pending Approval').map((allowance) => <div key={allowance.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border flex justify-between text-xs"><b>Allowance · {allowance.employeeName} · {formatCurrency(allowance.amount)}</b><div className="flex gap-2"><button onClick={() => setAllowanceStatus(allowance.id, 'Approved')} className="text-emerald-600 font-bold">Approve</button><button onClick={() => setAllowanceStatus(allowance.id, 'Rejected')} className="text-rose-600 font-bold">Reject</button></div></div>)}
        </div>
      )}
    </div>
  );
}

