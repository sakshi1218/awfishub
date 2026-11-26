'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BadgeDollarSign,
  ShieldAlert,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardMetricCard } from '@/components/shared/DashboardMetricCard';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function AccountsAndFinancePage() {
  const {
    isChairperson,
    expenseClaims,
    recurringBills,
    gstRecords,
    updateExpenseClaimStatus,
    markBillPaid,
  } = useApp();

  const [tab, setTab] = useState<'OVERVIEW' | 'CLAIMS' | 'BILLS' | 'GST' | 'TDS'>('OVERVIEW');
  const [tdsAmount, setTdsAmount] = useState(50000);
  const [tdsRate, setTdsRate] = useState(10);

  if (!isChairperson) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-lg mx-auto my-12 space-y-3">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chairperson Finance UI Only</h2>
        <p className="text-xs text-slate-500">
          All finance, GST, TDS, and company expenditure modules appear only in the Chairperson role simulation.
        </p>
        <Link href="/dashboard" className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const deduction = Math.round((tdsAmount * tdsRate) / 100);
  const netPayable = tdsAmount - deduction;

  const exportFinanceExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseClaims), 'Expense Claims');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(recurringBills), 'Recurring Bills');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gstRecords), 'GST Repository');
    XLSX.writeFile(wb, 'AWFIS_HUB_Finance_Report_Prototype.xlsx');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounts & Finance Interface (Chairperson Only)"
        subtitle="Frontend demonstration using fictional mock data — Income, Expenditure, Expense Claims, Recurring Bills, GST & TDS UI."
        icon={BadgeDollarSign}
        badge="Mock Finance Prototype"
        actions={
          <>
            <button onClick={exportFinanceExcel} className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['OVERVIEW', 'Finance Dashboard'],
            ['CLAIMS', `Expense Claims (${expenseClaims.length})`],
            ['BILLS', `Recurring Bills (${recurringBills.length})`],
            ['GST', 'GST Repository'],
            ['TDS', 'TDS Interface'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
              tab === id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'OVERVIEW' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DashboardMetricCard label="Monthly Income" value="₹34.50L" subtext="Institutional & Direct" icon={BadgeDollarSign} tone="emerald" />
          <DashboardMetricCard label="Monthly Expenditure" value="₹19.80L" subtext="Payroll, Events & Ops" icon={Receipt} tone="amber" />
          <DashboardMetricCard label="Budget Utilization" value="78.4%" subtext="Within Q4 allocation" icon={FileSpreadsheet} tone="blue" />
          <DashboardMetricCard label="Net Operating Margin" value="42.6%" subtext="+₹14.70L surplus" icon={BadgeDollarSign} tone="indigo" />
        </div>
      )}

      {tab === 'CLAIMS' && (
        <div className="space-y-3">
          {expenseClaims.map((claim) => (
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

      {tab === 'TDS' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Calculator className="w-4 h-4 text-emerald-600" /> TDS Deduction Interface (UI Prototype)
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl">
            Disclaimer: This is a frontend UI prototype for display demonstration, not a validated tax calculation system.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Taxable Amount (₹)</label>
              <input type="number" value={tdsAmount} onChange={(e) => setTdsAmount(Number(e.target.value) || 0)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
            <div>
              <label className="font-semibold block mb-1">Configurable %</label>
              <input type="number" value={tdsRate} onChange={(e) => setTdsRate(Number(e.target.value) || 0)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
            <div className="flex justify-between"><span>Deduction Amount:</span><b className="text-rose-600">₹{deduction.toLocaleString('en-IN')}</b></div>
            <div className="flex justify-between text-sm"><span>Net Payable Amount:</span><b className="text-emerald-600">₹{netPayable.toLocaleString('en-IN')}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
