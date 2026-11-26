'use client';

import React, { useState } from 'react';
import { Radio, BarChart2, Mic, Film, CheckCircle2, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useApp } from '@/context/AppContext';
import { PodcastEpisode, ReelItem } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

const REEL_STAGES: ReelItem['stage'][] = ['Assigned', 'Editing', 'Review', 'Approved', 'Posted'];

export default function MediaPage() {
  const { socialMetrics, podcasts, reels, updatePodcastStage, updateReelStage } = useApp();
  const [tab, setTab] = useState<'SOCIAL' | 'PODCAST' | 'REELS'>('SOCIAL');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Department Workspace"
        subtitle="Social media engagement analytics, MindLyft Leaders podcast guest pipeline, and reel editing Kanban."
        icon={Radio}
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button onClick={() => setTab('SOCIAL')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${tab === 'SOCIAL' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}>
              <BarChart2 className="w-3.5 h-3.5" /> Social Media
            </button>
            <button onClick={() => setTab('PODCAST')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${tab === 'PODCAST' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}>
              <Mic className="w-3.5 h-3.5" /> Podcasts
            </button>
            <button onClick={() => setTab('REELS')} className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 ${tab === 'REELS' ? 'bg-white dark:bg-slate-900 text-rose-600 shadow-sm' : 'text-slate-500'}`}>
              <Film className="w-3.5 h-3.5" /> Reel Kanban
            </button>
          </div>
        }
      />

      {tab === 'SOCIAL' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Platform Reach & Views</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={socialMetrics}>
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="reach" name="Reach" fill="#e11d48" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="views" name="Views" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Platform & Type</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reach</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4">Likes / Comments / Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {socialMetrics.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 px-4 font-bold">{m.platform} • {m.contentType}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{m.title}</td>
                    <td className="py-3 px-4 text-slate-500">{m.publishDate}</td>
                    <td className="py-3 px-4 font-bold">{m.reach.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{m.views.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-slate-500">{m.likes} / {m.comments} / {m.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'PODCAST' && (
        <div className="space-y-4">
          {podcasts.map((pod) => (
            <div key={pod.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-rose-600">{pod.id} • Recording: {pod.recordingDate}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{pod.topic}</h3>
                  <p className="text-xs text-slate-500">
                    Guest: <b>{pod.guestName}</b> ({pod.guestContact}) • Presenter: {pod.presenter}
                  </p>
                </div>
                <select
                  value={pod.stage}
                  onChange={(e) => updatePodcastStage(pod.id, e.target.value as PodcastEpisode['stage'])}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* 6-step guest timeline */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {pod.guestTimeline.map((step) => (
                  <div key={step.step} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px]">
                    <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                      {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      <span className="truncate">{step.step}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'REELS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {REEL_STAGES.map((stage) => {
            const items = reels.filter((r) => r.stage === stage);
            return (
              <div key={stage} className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-h-[340px] space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                  <StatusBadge label={String(items.length)} />
                </div>
                {items.map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">{r.title}</p>
                    <p className="text-[10px] text-slate-500">Editor: {r.editorName} • {r.submissionDate}</p>
                    <p className="text-[10px] text-slate-400 italic">{r.reviewComments}</p>
                    <select
                      value={r.stage}
                      onChange={(e) => updateReelStage(r.id, e.target.value as ReelItem['stage'])}
                      className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold"
                    >
                      {REEL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
