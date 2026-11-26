'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  Plus,
  Search,
  Filter,
  DollarSign,
  User,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SalesCRMPage() {
  const { currentUser, isFounder, isDirector, isSalesRole } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [salesEmployees, setSalesEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newFollowupText, setNewFollowupText] = useState('');

  // Create Lead form
  const [leadForm, setLeadForm] = useState({
    collegeId: '',
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    interestedService: 'CAMPUS_TRAINING',
    leadSource: 'COLLEGE_VISIT',
    assignedToId: '',
    interestLevel: 'HIGH',
    estimatedDealValue: 500000,
    currentStage: 'NEW_LEAD',
    notes: '',
  });

  const pipelineStages = [
    { id: 'NEW_LEAD', title: 'New Lead' },
    { id: 'CONTACTED', title: 'Contacted' },
    { id: 'INTERESTED', title: 'Interested' },
    { id: 'MEETING_SCHEDULED', title: 'Meeting Scheduled' },
    { id: 'PROPOSAL_SENT', title: 'Proposal Sent' },
    { id: 'NEGOTIATION', title: 'Negotiation' },
    { id: 'CONVERTED', title: 'Converted' },
    { id: 'LOST', title: 'Lost' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lRes, cRes, eRes] = await Promise.all([
        fetch('/api/sales/leads'),
        fetch('/api/sales/colleges'),
        fetch('/api/employees'),
      ]);
      if (lRes.ok) setLeads(await lRes.json());
      if (cRes.ok) setColleges(await cRes.json());
      if (eRes.ok) {
        const emps = await eRes.json();
        setSalesEmployees(
          emps.filter(
            (e: any) =>
              e.role === 'SALES_EMPLOYEE' ||
              e.role === 'SALES_DIRECTOR' ||
              e.role === 'MANAGER'
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          assignedToId: leadForm.assignedToId || currentUser?.id,
        }),
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStage = async (leadId: string, stage: string) => {
    try {
      const res = await fetch('/api/sales/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, currentStage: stage }),
      });
      if (res.ok) {
        loadData();
        if (selectedLead?.id === leadId) {
          setSelectedLead({ ...selectedLead, currentStage: stage });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollowupText.trim() || !selectedLead || !currentUser) return;
    try {
      const res = await fetch('/api/sales/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLead.id,
          conductedById: currentUser.id,
          newFollowup: {
            summary: newFollowupText,
            interactionType: 'CALL',
            outcome: 'POSITIVE',
          },
        }),
      });
      if (res.ok) {
        setNewFollowupText('');
        loadData();
        const updatedList = await (await fetch('/api/sales/leads')).json();
        setSelectedLead(updatedList.find((l: any) => l.id === selectedLead.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalPipelineValue = leads
    .filter((l) => l.currentStage !== 'LOST')
    .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

  const closedValue = leads
    .filter((l) => l.currentStage === 'CONVERTED')
    .reduce((sum, l) => sum + (l.estimatedDealValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Interested Clients & CRM Pipeline
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track leads through 8 stages: New Lead → Contacted → Interested → Meeting → Proposal → Negotiation → Converted / Lost
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Sales Lead
        </button>
      </div>

      {/* Revenue Header Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Active Pipeline Value
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              ₹{(totalPipelineValue / 100000).toFixed(1)} Lakhs
            </span>
            <span className="text-xs font-bold text-slate-500">
              {leads.filter((l) => l.currentStage !== 'LOST').length} Active Leads
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Closed Converted Revenue
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{(closedValue / 100000).toFixed(1)} Lakhs
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Booked
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Conversion Rate
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {leads.length > 0
                ? (
                    (leads.filter((l) => l.currentStage === 'CONVERTED').length / leads.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
            <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Win Rate
            </span>
          </div>
        </div>
      </div>

      {/* 8-Stage Horizontal Pipeline Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
        {pipelineStages.map((stage) => {
          const stageLeads = leads.filter((l) => l.currentStage === stage.id);
          const stageTotal = stageLeads.reduce((s, l) => s + (l.estimatedDealValue || 0), 0);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[550px]"
            >
              {/* Stage Header */}
              <div className="pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {stage.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ₹{(stageTotal / 1000).toFixed(0)}k • {stageLeads.length} leads
                  </span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead cards */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {lead.interestedService.replace(/_/g, ' ')}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{(lead.estimatedDealValue / 1000).toFixed(0)}k
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {lead.clientName}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lead.contactPerson} ({lead.phone})
                    </p>

                    {/* Progress stage selector */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate max-w-[120px] font-medium">
                        Rep: {lead.assignedTo?.name || 'Unassigned'}
                      </span>
                      <select
                        value={lead.currentStage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                        className="text-[10px] font-semibold px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 border-none outline-none"
                      >
                        {pipelineStages.map((st) => (
                          <option key={st.id} value={st.id}>
                            Move to {st.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Details & Follow-up History Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase">
                  {selectedLead.currentStage.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedLead.clientName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Estimated Deal: ₹{selectedLead.estimatedDealValue.toLocaleString()} • Rep:{' '}
                  {selectedLead.assignedTo?.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Contact</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedLead.contactPerson}
                  </p>
                  <p className="text-[11px] text-slate-500">{selectedLead.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Interested Service
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedLead.interestedService.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] text-slate-500">Source: {selectedLead.leadSource}</p>
                </div>
              </div>

              {/* Followup logs timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Communication & Follow-up History ({selectedLead.followups?.length || 0})
                </h4>

                <form onSubmit={handleAddFollowup} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Log client call summary or outcome..."
                    value={newFollowupText}
                    onChange={(e) => setNewFollowupText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                  >
                    Log Follow-up
                  </button>
                </form>

                <div className="space-y-2">
                  {selectedLead.followups?.map((f: any) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {f.conductedBy.name} ({f.interactionType})
                        </span>
                        <span>{new Date(f.followupDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{f.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lead Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Create New Interested Client / Sales Lead
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client / College Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cummins College of Engineering for Women"
                    value={leadForm.clientName}
                    onChange={(e) => setLeadForm({ ...leadForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Madhuri Khambete"
                    value={leadForm.contactPerson}
                    onChange={(e) => setLeadForm({ ...leadForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 12345"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@college.edu.in"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Deal Value (INR)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    value={leadForm.estimatedDealValue}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, estimatedDealValue: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Interested Service
                  </label>
                  <select
                    value={leadForm.interestedService}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, interestedService: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="CAMPUS_TRAINING">Campus Training & Bootcamps</option>
                    <option value="FDP">Faculty Development Program (FDP)</option>
                    <option value="INTERNSHIPS">Student Internships & Projects</option>
                    <option value="WORKSHOPS">Hands-on Weekend Workshops</option>
                    <option value="CERTIFICATION">Industry AI Certifications</option>
                    <option value="SOFTWARE_LICENSING">MindLyft LMS Software License</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Source
                  </label>
                  <select
                    value={leadForm.leadSource}
                    onChange={(e) => setLeadForm({ ...leadForm, leadSource: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="COLLEGE_VISIT">College Campus Visit</option>
                    <option value="REFERRAL">Institutional Referral</option>
                    <option value="COLD_CALL">Outbound Sales Outreach</option>
                    <option value="WEBSITE">Website Inbound</option>
                    <option value="EVENT">EdTech Summit / Event</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Sales Representative
                  </label>
                  <select
                    value={leadForm.assignedToId}
                    onChange={(e) => setLeadForm({ ...leadForm, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Self / Current User</option>
                    {salesEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Key discussion points, expected batch size, syllabus requirements..."
                  value={leadForm.notes}
                  onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
