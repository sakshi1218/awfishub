'use client';

import React, { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function MeetingsPage() {
  const { currentEmployee } = useApp();
  const [meetings, setMeetings] = useState([
    { id: 'MTG-01', title: 'Q4 Executive Review & Expo Readiness', type: 'Chairperson Review', time: '2026-11-25 11:00 AM', organizer: 'Pooja Ahire', location: 'Boardroom A / Google Meet' },
    { id: 'MTG-02', title: 'LMS Assessment Engine v2.4 Architecture Sync', type: 'Technical Sync', time: '2026-11-25 03:00 PM', organizer: 'Rutuja Botre', location: 'Zoom Engineering Room' },
    { id: 'MTG-03', title: 'Campus MoU & TeleCaller Conversion Review', type: 'Sales Directorate', time: '2026-11-26 10:30 AM', organizer: 'Anchal Agawane', location: 'Google Meet' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings & Review Sessions"
        subtitle="Scheduled review meetings, technical syncs, and department standups."
        icon={CalendarDays}
        actions={
          <button onClick={() => setShowAdd(true)} className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Schedule Meeting
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meetings.map((m) => (
          <div key={m.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
            <StatusBadge label={m.type} variant="info" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{m.title}</h3>
            <p className="text-slate-500">{m.time}</p>
            <p className="text-slate-500">Organizer: <b>{m.organizer}</b></p>
            <p className="text-blue-600 font-semibold">{m.location}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Review Session</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setMeetings([{ id: `MTG-${meetings.length + 1}`, title, type: 'Department Sync', time: '2026-11-27 02:00 PM', organizer: currentEmployee.name, location: 'Google Meet' }, ...meetings]);
                setTitle('');
                setShowAdd(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <input required placeholder="Meeting Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-bold">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
