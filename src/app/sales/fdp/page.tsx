'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Calendar,
  Users,
  Award,
  Clock,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function FDPSessionsPage() {
  const { currentUser, isFounder, isDirector, isSalesRole } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form
  const [form, setForm] = useState({
    collegeId: '',
    topic: '',
    sessionDate: '2026-11-25',
    trainerName: '',
    trainerEmployeeId: '',
    participantsCount: 50,
    durationHours: 4.0,
    feedbackSummary: 'Rated 4.8/5.0 by attendees',
    certificatesIssuedCount: 50,
    status: 'COMPLETED',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sRes, cRes, eRes] = await Promise.all([
        fetch('/api/sales/fdp'),
        fetch('/api/sales/colleges'),
        fetch('/api/employees'),
      ]);
      if (sRes.ok) setSessions(await sRes.json());
      if (cRes.ok) setColleges(await cRes.json());
      if (eRes.ok) setTrainers(await eRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/sales/fdp', {
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

  const totalParticipants = sessions.reduce((sum, s) => sum + (s.participantsCount || 0), 0);
  const totalCertificates = sessions.reduce((sum, s) => sum + (s.certificatesIssuedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Faculty Development Programs (FDP)
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track faculty upskilling workshops, participants, feedback, and issued credentials
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule FDP Session
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total FDP Sessions
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {sessions.length}
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              Delivered
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Faculty Upskilled
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {totalParticipants}
            </span>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Participants
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Certificates Issued
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {totalCertificates}
            </span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-mono">
                  {new Date(session.sessionDate).toLocaleDateString()}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {session.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {session.topic}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                College: {session.college.name}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Trainer / Speaker
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {session.trainerName}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    Duration & Attendance
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {session.durationHours} hrs • {session.participantsCount} Faculty
                  </p>
                </div>
              </div>

              {session.feedbackSummary && (
                <div className="mt-3 text-xs p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200">
                  <span className="font-bold">Feedback:</span> {session.feedbackSummary}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Award className="w-3.5 h-3.5" />
                {session.certificatesIssuedCount} Certificates Dispatched
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Faculty Development Session
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Host
                </label>
                <select
                  required
                  value={form.collegeId}
                  onChange={(e) => setForm({ ...form, collegeId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                >
                  <option value="">Select College</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  FDP Topic / Masterclass Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Applied Generative AI & Deep Learning for Computer Science Faculty"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Trainer / Resource Person
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanmay Joshi"
                    value={form.trainerName}
                    onChange={(e) => setForm({ ...form, trainerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.sessionDate}
                    onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Participants Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.participantsCount}
                    onChange={(e) =>
                      setForm({ ...form, participantsCount: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={form.durationHours}
                    onChange={(e) =>
                      setForm({ ...form, durationHours: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-500/20"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
