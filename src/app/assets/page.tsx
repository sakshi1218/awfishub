'use client';

import React, { useState } from 'react';
import { HardDrive, Lock, ArrowRightLeft, RotateCcw } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { CompanyAsset } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';

export default function AssetsPage() {
  const { assets, employees, currentEmployee, isChairperson, assignAsset, returnAsset } = useApp();
  const [assignTarget, setAssignTarget] = useState<CompanyAsset | null>(null);
  const [assignEmpId, setAssignEmpId] = useState(employees[0]?.id || '');

  // Chairperson sees full company-wide inventory & purchase prices; other employees see ONLY their own assigned assets
  const visibleAssets = isChairperson
    ? assets
    : assets.filter((a) => a.assignedToId === currentEmployee.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isChairperson ? 'Company Asset Inventory (Chairperson Full View)' : 'My Assigned Company Assets'}
        subtitle={
          isChairperson
            ? 'Lifecycle: Available → Assigned → In Use → Return Pending → Returned • Includes purchase references & custody history.'
            : 'Personal view of company hardware, SIM cards, and software seats assigned to you.'
        }
        icon={HardDrive}
        badge={isChairperson ? `${assets.length} Total Assets` : `${visibleAssets.length} Assigned to You`}
      />

      {!isChairperson && (
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500 shrink-0" />
          Company-wide asset inventory and purchase prices are visible only in the Chairperson interface.
        </div>
      )}

      {visibleAssets.length === 0 ? (
        <EmptyState
          title="No Assets Currently Assigned"
          description="You do not have any company laptops, cameras, SIM cards, or hardware assigned in your custody."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAssets.map((asset) => (
            <div key={asset.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-600">{asset.id} • {asset.category}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{asset.name}</h3>
                </div>
                <StatusBadge
                  label={asset.status}
                  variant={asset.status === 'Available' ? 'success' : asset.status === 'Return Pending' ? 'danger' : 'info'}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p>Serial: <span className="font-mono">{asset.serialNumber}</span></p>
                <p>Condition: <b>{asset.condition}</b></p>
                <p>Custody: <b>{asset.assignedToName || 'Unassigned (Available)'}</b></p>
                {asset.issueDate && <p className="text-slate-400">Issued: {asset.issueDate}</p>}
                {isChairperson && (
                  <p className="text-emerald-600 font-bold pt-1">
                    Purchase Value: ₹{asset.purchaseValue.toLocaleString('en-IN')} ({asset.purchaseRef})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {isChairperson && asset.status === 'Available' && (
                  <button
                    onClick={() => setAssignTarget(asset)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-1"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Assign Asset
                  </button>
                )}
                {asset.status !== 'Available' && (
                  <button
                    onClick={() => returnAsset(asset.id, isChairperson ? 'Available' : 'Return Pending')}
                    className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> {isChairperson ? 'Mark Returned' : 'Initiate Return'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {assignTarget && isChairperson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Asset: {assignTarget.name}</h3>
            <select value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.permanentId})</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignTarget(null)} className="px-3 py-1.5 text-slate-500">Cancel</button>
              <button
                onClick={() => {
                  assignAsset(assignTarget.id, assignEmpId);
                  setAssignTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
