'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCw,
  FileText,
  Download,
  Building,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CollegeAgreementsPage() {
  const { currentUser, isFounder, isDirector, isSalesRole } = useAuth();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    collegeId: '',
    agreementType: 'MOU',
    signingDate: '2026-01-15',
    validityMonths: 12,
    expiryDate: '2027-01-14',
    authorizedSignatoryMindLyft: 'Dr. Arvind Sharma (Founder)',
    authorizedSignatoryCollege: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [agrRes, colRes] = await Promise.all([
        fetch('/api/sales/agreements'),
        fetch('/api/sales/colleges'),
      ]);
      if (agrRes.ok) setAgreements(await agrRes.json());
      if (colRes.ok) setColleges(await colRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRenewAgreement = async (id: string) => {
    const renewalMonths = prompt('Enter renewal validity in months (e.g. 12 or 24):', '12');
    if (!renewalMonths) return;

    try {
      const res = await fetch('/api/sales/agreements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          agreementStatus: 'RENEWED',
          renewalDate: new Date(),
          notes: `Renewed for an additional ${renewalMonths} months on ${new Date().toLocaleDateString()}`,
        }),
      });
      if (res.ok) {
        alert('Agreement marked as RENEWED!');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = agreements.filter((a) => a.dynamicStatus === 'ACTIVE').length;
  const expiringSoonCount = agreements.filter((a) => a.dynamicStatus === 'EXPIRING_SOON').length;
  const expiredCount = agreements.filter((a) => a.dynamicStatus === 'EXPIRED').length;

  const filtered = agreements.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.dynamicStatus === filterStatus || a.agreementStatus === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                College Agreements & MoUs
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional partnerships database with automated 30-day expiry notifications & renewal pipeline
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Agreement
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Agreements
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {agreements.length}
            </span>
            <span className="text-xs font-bold text-blue-600">On Record</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active MoUs
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/20 shadow-sm">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
            Expiring Within 30 Days
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {expiringSoonCount}
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Action Alert
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Expired / Renewal Due
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {expiredCount}
            </span>
            <span className="text-xs font-bold text-rose-600">Lapsed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'RENEWED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Agreements Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((agr) => {
          const isExpiring = agr.dynamicStatus === 'EXPIRING_SOON';
          const isExpired = agr.dynamicStatus === 'EXPIRED';

          return (
            <div
              key={agr.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border shadow-sm flex flex-col justify-between ${
                isExpiring
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20'
                  : isExpired
                  ? 'border-rose-300 dark:border-rose-800'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                    {agr.agreementType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                      isExpiring
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse'
                        : isExpired
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpiring && <AlertTriangle className="w-3 h-3" />}
                    {agr.dynamicStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {agr.college.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{agr.notes}</p>

                {/* Validity and expiry countdown */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Signing Date
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                      {new Date(agr.signingDate).toLocaleDateString()} ({agr.validityMonths} Mo)
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Expiry Date
                    </span>
                    <p
                      className={`font-semibold mt-0.5 ${
                        isExpiring
                          ? 'text-amber-600 dark:text-amber-400 font-bold'
                          : isExpired
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {new Date(agr.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Signatories */}
                <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                  <p>
                    <span className="text-slate-400">MindLyft Signatory:</span>{' '}
                    {agr.authorizedSignatoryMindLyft}
                  </p>
                  <p>
                    <span className="text-slate-400">College Signatory:</span>{' '}
                    {agr.authorizedSignatoryCollege}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">
                  {agr.daysToExpiry > 0
                    ? `${agr.daysToExpiry} days remaining`
                    : `Expired ${Math.abs(agr.daysToExpiry)} days ago`}
                </span>

                <button
                  onClick={() => handleRenewAgreement(agr.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Process Renewal
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Agreement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register New College Agreement / MoU
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgreement} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select College
                  </label>
                  <select
                    required
                    value={form.collegeId}
                    onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Select College</option>
                    {colleges.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Agreement Type
                  </label>
                  <select
                    value={form.agreementType}
                    onChange={(e) => setForm({ ...form, agreementType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="MOU">Memorandum of Understanding (MoU)</option>
                    <option value="TRAINING_PARTNERSHIP">Training Partnership Agreement</option>
                    <option value="PLACEMENT_ASSISTANCE">Placement Assistance Tie-up</option>
                    <option value="FDP_AGREEMENT">FDP Masterclass Agreement</option>
                    <option value="INSTITUTIONAL_SUBSCRIPTION">Campus Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Validity (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={form.validityMonths}
                    onChange={(e) =>
                      setForm({ ...form, validityMonths: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Signing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.signingDate}
                    onChange={(e) => setForm({ ...form, signingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MindLyft Signatory
                  </label>
                  <input
                    type="text"
                    required
                    value={form.authorizedSignatoryMindLyft}
                    onChange={(e) =>
                      setForm({ ...form, authorizedSignatoryMindLyft: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    College Signatory
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sudhir Agashe, Dean"
                    value={form.authorizedSignatoryCollege}
                    onChange={(e) =>
                      setForm({ ...form, authorizedSignatoryCollege: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agreement Notes & Commercial Scope
                </label>
                <textarea
                  rows={3}
                  placeholder="Student batches covered, commercial terms, revenue share, lab setup requirements..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Register Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
