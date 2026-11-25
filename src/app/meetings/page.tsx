'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  X,
  Sparkles,
  Link as LinkIcon,
  Video,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MeetingsPage() {
  const { currentUser, isFounder, isDirector, isManager } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);

  // Form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    meetingType: 'DEPARTMENT_MEETING',
    agenda: '',
    scheduledAt: '',
    durationMinutes: 45,
    locationOrLink: 'Conference Room 1 / Zoom',
    participantIds: [] as string[],
    actionItemsText: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meetRes, empRes] = await Promise.all([
        fetch('/api/meetings'),
        fetch('/api/employees'),
      ]);
      if (meetRes.ok) setMeetings(await meetRes.json());
      if (empRes.ok) setEmployees(await empRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const actionItems = meetingForm.actionItemsText
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 5);
          return {
            title: line.trim(),
            assignedToId: currentUser.id,
            deadline,
          };
        });

      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...meetingForm,
          hostId: currentUser.id,
          actionItems,
        }),
      });

      if (res.ok) {
        setIsScheduleModalOpen(false);
        setMeetingForm({
          title: '',
          meetingType: 'DEPARTMENT_MEETING',
          agenda: '',
          scheduledAt: '',
          durationMinutes: 45,
          locationOrLink: 'Conference Room 1 / Zoom',
          participantIds: [],
          actionItemsText: '',
        });
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvertActionItemToTask = async (actionItemId: string) => {
    try {
      const res = await fetch('/api/meetings/action-to-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionItemId,
          assignedById: currentUser?.id,
        }),
      });

      if (res.ok) {
        alert('Action item successfully converted into a formal Task!');
        loadData();
        if (selectedMeeting) {
          const updated = await (await fetch('/api/meetings')).json();
          setSelectedMeeting(updated.find((m: any) => m.id === selectedMeeting.id));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Meetings & Sessions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Founder, Director, and Manager review sessions, notes, decisions, and action items
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => setSelectedMeeting(meeting)}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    meeting.meetingType === 'FOUNDER_REVIEW'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : meeting.meetingType === 'DIRECTOR_REVIEW'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {meeting.meetingType.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {meeting.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {meeting.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {meeting.agenda}
              </p>

              {/* Timing & Location */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  {new Date(meeting.scheduledAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  •{' '}
                  {new Date(meeting.scheduledAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {meeting.durationMinutes} mins
                </span>
                <span className="flex items-center gap-1 truncate max-w-[180px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {meeting.locationOrLink}
                </span>
              </div>
            </div>

            {/* Bottom: Participants & Action Items Count */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {meeting.participants?.length || 0} Participants
                </span>
              </div>

              {meeting.actionItems && meeting.actionItems.length > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  {meeting.actionItems.length} Action Items
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Meeting Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Meeting / Review Session
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMeeting} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Pipeline & College MoUs Bi-weekly Sync"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Type
                  </label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, meetingType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="FOUNDER_REVIEW">Founder Review Meeting</option>
                    <option value="DIRECTOR_REVIEW">Director Review Meeting</option>
                    <option value="MANAGER_REVIEW">Manager Review Meeting</option>
                    <option value="ONE_TO_ONE">Employee 1-on-1 Meeting</option>
                    <option value="DEPARTMENT_MEETING">Department Meeting</option>
                    <option value="TASK_REVIEW">Task Review Meeting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={meetingForm.durationMinutes}
                    onChange={(e) =>
                      setMeetingForm({
                        ...meetingForm,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={meetingForm.scheduledAt}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, scheduledAt: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location or Virtual Link
                  </label>
                  <input
                    type="text"
                    value={meetingForm.locationOrLink}
                    onChange={(e) =>
                      setMeetingForm({ ...meetingForm, locationOrLink: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agenda & Key Discussion Topics
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Outline objectives, review goals, KPIs to examine..."
                  value={meetingForm.agenda}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Action Items (One per line - will be created and assignable)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prepare revised MoU pricing table"
                  value={meetingForm.actionItemsText}
                  onChange={(e) =>
                    setMeetingForm({ ...meetingForm, actionItemsText: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Meeting Details Modal (with action items to task converter) */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 uppercase">
                  {selectedMeeting.meetingType.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {selectedMeeting.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hosted by {selectedMeeting.host.name} • {new Date(selectedMeeting.scheduledAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Agenda
                </h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {selectedMeeting.agenda}
                </p>
              </div>

              {selectedMeeting.notes && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Meeting Notes & Decisions
                  </h4>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {selectedMeeting.notes}
                  </div>
                </div>
              )}

              {/* Action Items with Convert to Task Button */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-blue-500" />
                  Action Items & Deliverables ({selectedMeeting.actionItems?.length || 0})
                </h4>

                <div className="space-y-2">
                  {selectedMeeting.actionItems?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Assigned to: {item.assignedTo.name} • Deadline:{' '}
                          {new Date(item.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      {item.convertedTaskId ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Converted to Task
                        </span>
                      ) : (
                        <button
                          onClick={() => handleConvertActionItemToTask(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-sm shrink-0"
                        >
                          Convert to Task
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Participants */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Participants List
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedMeeting.participants?.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {p.employee.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {p.attendanceStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
