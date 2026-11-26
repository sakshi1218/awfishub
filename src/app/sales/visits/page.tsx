'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  X,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CollegeVisitsPage() {
  const { currentUser, isFounder, isDirector, isSalesRole } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterOutcome, setFilterOutcome] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  // Form State
  const [visitForm, setVisitForm] = useState({
    collegeId: '',
    visitDate: '2026-11-25',
    contactPersonName: '',
    contactDesignation: '',
    contactPhone: '',
    contactEmail: '',
    purpose: 'Campus Training & MoU Discussion',
    discussionDetails: '',
    outcome: 'POSITIVE',
    interestLevel: 'HIGH',
    nextFollowupDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [vRes, cRes, eRes] = await Promise.all([
        fetch('/api/sales/visits'),
        fetch('/api/sales/colleges'),
        fetch('/api/employees'),
      ]);
      if (vRes.ok) setVisits(await vRes.json());
      if (cRes.ok) setColleges(await cRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const res = await fetch('/api/sales/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visitForm,
          visitedById: currentUser.id,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setVisitForm({
          collegeId: '',
          visitDate: '2026-11-25',
          contactPersonName: '',
          contactDesignation: '',
          contactPhone: '',
          contactEmail: '',
          purpose: 'Campus Training & MoU Discussion',
          discussionDetails: '',
          outcome: 'POSITIVE',
          interestLevel: 'HIGH',
          nextFollowupDate: '',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredVisits = visits.filter((v) => {
    const matchesSearch =
      v.college.name.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPersonName.toLowerCase().includes(search.toLowerCase()) ||
      v.visitedBy.name.toLowerCase().includes(search.toLowerCase());
    const matchesOutcome = filterOutcome === 'ALL' || v.outcome === filterOutcome;
    return matchesSearch && matchesOutcome;
  });

  // KPI Counters
  const totalVisits = visits.length;
  const positiveVisits = visits.filter((v) => v.outcome === 'POSITIVE').length;
  const followupPending = visits.filter((v) => v.outcome === 'FOLLOWUP_REQUIRED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Sales: College Campus Visits
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track all in-person dean, principal, and institutional meetings across engineering & management colleges
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log College Visit
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total College Visits
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalVisits}
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              Field Activity
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Positive Outcome Visits
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {positiveVisits}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              High Conversion
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Follow-Up Action Pending
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {followupPending}
            </span>
            <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by college, contact, executive..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          />
        </div>

        <select
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
        >
          <option value="ALL">All Outcomes</option>
          <option value="POSITIVE">Positive</option>
          <option value="FOLLOWUP_REQUIRED">Follow-up Required</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="CLOSED">Closed Deal</option>
        </select>
      </div>

      {/* Visits Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredVisits.map((visit) => (
          <div
            key={visit.id}
            onClick={() => setSelectedVisit(visit)}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono">
                  {new Date(visit.visitDate).toLocaleDateString()}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    visit.outcome === 'POSITIVE'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {visit.outcome.replace(/_/g, ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {visit.college.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" />
                {visit.college.city}, {visit.college.state}
              </p>

              {/* Purpose & discussion */}
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold block text-slate-900 dark:text-white mb-0.5">
                  {visit.purpose}
                </span>
                <p className="line-clamp-2 text-slate-600 dark:text-slate-400">
                  {visit.discussionDetails}
                </p>
              </div>

              {/* Contact person details */}
              <div className="mt-3 text-xs space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Contact: {visit.contactPersonName} ({visit.contactDesignation})
                </p>
                {visit.contactPhone && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {visit.contactPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom info */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Visited by: {visit.visitedBy.name}
              </span>
              {visit.nextFollowupDate && (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Followup: {new Date(visit.nextFollowupDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Log Visit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log College Campus Visit
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select College
                  </label>
                  <select
                    required
                    value={visitForm.collegeId}
                    onChange={(e) => setVisitForm({ ...visitForm, collegeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Select College</option>
                    {colleges.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name} ({col.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={visitForm.nextFollowupDate}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, nextFollowupDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Mahajan"
                    value={visitForm.contactPersonName}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, contactPersonName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Designation
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dean of Academics / TPO"
                    value={visitForm.contactDesignation}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, contactDesignation: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98200 00000"
                    value={visitForm.contactPhone}
                    onChange={(e) =>
                      setVisitForm({ ...visitForm, contactPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Outcome
                  </label>
                  <select
                    value={visitForm.outcome}
                    onChange={(e) => setVisitForm({ ...visitForm, outcome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="POSITIVE">Positive (High Chance)</option>
                    <option value="FOLLOWUP_REQUIRED">Follow-up Required</option>
                    <option value="NEUTRAL">Neutral</option>
                    <option value="CLOSED">Closed Deal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose of Visit
                </label>
                <input
                  type="text"
                  required
                  value={visitForm.purpose}
                  onChange={(e) => setVisitForm({ ...visitForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discussion Details & Next Steps
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail discussions, student batch size, pricing expectations, commitments..."
                  value={visitForm.discussionDetails}
                  onChange={(e) =>
                    setVisitForm({ ...visitForm, discussionDetails: e.target.value })
                  }
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
                  Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
