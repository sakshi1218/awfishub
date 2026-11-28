'use client';

import React, { useMemo, useState } from 'react';
import './accounts-workspaces.css';
import { Radio, BarChart2, Mic, Film, CheckCircle2, Clock, LayoutDashboard, Wallet, Target, CalendarDays, Eye, Heart, MessageCircle, Share2, Trophy } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useApp } from '@/context/AppContext';
import { PodcastEpisode, ReelItem } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import MediaManagementSections, { type MediaTab } from '@/components/media/MediaManagementSections';

const REEL_STAGES: ReelItem['stage'][] = ['Assigned', 'Editing', 'Review', 'Approved', 'Posted'];

export default function MediaPage() {
  const {
    socialMetrics,
    podcasts,
    reels,
    campaigns,
    events,
    employees,
    currentEmployee,
    updatePodcastStage,
    updateReelStage,
  } = useApp();
  const [tab, setTab] = useState<MediaTab>('SOCIAL');
  const socialByPlatform = useMemo(() => Array.from(socialMetrics.reduce((groups, metric) => {
    const current = groups.get(metric.platform) || { platform: metric.platform, posts: 0, reach: 0, views: 0, likes: 0, comments: 0, shares: 0 };
    current.posts += 1;
    current.reach += metric.reach;
    current.views += metric.views;
    current.likes += metric.likes;
    current.comments += metric.comments;
    current.shares += metric.shares;
    groups.set(metric.platform, current);
    return groups;
  }, new Map<string, { platform: string; posts: number; reach: number; views: number; likes: number; comments: number; shares: number }>()).values()), [socialMetrics]);
  const socialTotals = useMemo(() => socialMetrics.reduce((totals, metric) => ({
    reach: totals.reach + metric.reach,
    views: totals.views + metric.views,
    engagement: totals.engagement + metric.likes + metric.comments + metric.shares,
  }), { reach: 0, views: 0, engagement: 0 }), [socialMetrics]);
  const topPost = socialMetrics.reduce<typeof socialMetrics[number] | null>((best, metric) => !best || metric.reach > best.reach ? metric : best, null);
  const platformMarkClass: Record<string, string> = {
    Instagram: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-300',
    LinkedIn: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    YouTube: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    X: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  };
  const tabButtonClass = (active: boolean) => `shrink-0 px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${active ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-rose-600 shadow-sm' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/70 dark:hover:bg-slate-900/70 hover:border-slate-200 dark:hover:border-slate-700'}`;

  return (
    <div className="media-workspace space-y-6 text-slate-700 dark:text-slate-200">
      <PageHeader
        title="Media Department Workspace"
        subtitle="Social media engagement analytics, MindLyft Leaders podcast guest pipeline, and reel editing Kanban."
        icon={Radio}
      />

      <nav aria-label="Media workspace sections" className="max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex w-max items-center gap-1.5 py-0.5 text-xs">
          <button onClick={() => setTab('OVERVIEW')} className={tabButtonClass(tab === 'OVERVIEW')}>
            <LayoutDashboard className="w-3.5 h-3.5" /> Executive Overview
          </button>
          <button onClick={() => setTab('SOCIAL')} className={tabButtonClass(tab === 'SOCIAL')}>
            <BarChart2 className="w-3.5 h-3.5" /> Social Media
          </button>
          <button onClick={() => setTab('PODCAST')} className={tabButtonClass(tab === 'PODCAST')}>
            <Mic className="w-3.5 h-3.5" /> Podcasts
          </button>
          <button onClick={() => setTab('REELS')} className={tabButtonClass(tab === 'REELS')}>
            <Film className="w-3.5 h-3.5" /> Reels 
          </button>
          <button onClick={() => setTab('FUNDS')} className={tabButtonClass(tab === 'FUNDS')}>
            <Wallet className="w-3.5 h-3.5" /> Funds
          </button>
          <button onClick={() => setTab('STRATEGIES')} className={tabButtonClass(tab === 'STRATEGIES')}>
            <Target className="w-3.5 h-3.5" /> Strategies
          </button>
          <button onClick={() => setTab('SCHEDULE')} className={tabButtonClass(tab === 'SCHEDULE')}>
            <CalendarDays className="w-3.5 h-3.5" /> Schedule
          </button>
        </div>
      </nav>

      {tab === 'SOCIAL' && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Social media totals">
            {[
              { label: 'Total reach', value: socialTotals.reach, icon: Eye },
              { label: 'Total views', value: socialTotals.views, icon: BarChart2 },
              { label: 'Engagement actions', value: socialTotals.engagement, icon: Heart },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"><span>{label}</span><Icon className="h-4 w-4" aria-hidden="true" /></div>
                <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">{value.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-xs text-slate-500">Across {socialMetrics.length} published posts</p>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-label="Platform performance">
            {socialByPlatform.map((platform) => (
              <article key={platform.platform} className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${platformMarkClass[platform.platform] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`} aria-hidden="true">{platform.platform === 'YouTube' ? '▶' : platform.platform.slice(0, 1)}</span>
                    <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{platform.platform}</h3><p className="text-xs text-slate-500">{platform.posts} {platform.posts === 1 ? 'post' : 'posts'}</p></div>
                  </div>
                  {topPost && topPost.platform === platform.platform && <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"><Trophy className="h-3 w-3" /> Top reach</span>}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <div><p className="text-[11px] text-slate-500">Reach</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{platform.reach.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-[11px] text-slate-500">Views</p><p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">{platform.views.toLocaleString('en-IN')}</p></div>
                  <div className="col-span-2"><p className="text-[11px] text-slate-500">Likes · comments · shares</p><p className="mt-0.5 text-sm tabular-nums text-slate-700 dark:text-slate-300">{platform.likes.toLocaleString('en-IN')} · {platform.comments.toLocaleString('en-IN')} · {platform.shares.toLocaleString('en-IN')}</p></div>
                </div>
              </article>
            ))}
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-base font-semibold text-slate-900 dark:text-white">Post performance</h2><p className="mt-1 text-xs text-slate-500">Published content ranked by reach</p></div><span className="text-xs text-slate-500">{socialMetrics.length} posts</span></div>
              <div className="h-64 min-h-[240px]">
                {socialMetrics.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={[...socialMetrics].sort((a, b) => b.reach - a.reach)} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={48} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                  <Tooltip formatter={(value) => Number(value).toLocaleString('en-IN')} cursor={{ fill: 'rgba(100,116,139,0.08)' }} />
                  <Bar dataKey="reach" name="Reach" fill="#be123c" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="views" name="Views" fill="#94a3b8" radius={[5, 5, 0, 0]} maxBarSize={40} />
                </BarChart></ResponsiveContainer> : <p className="grid h-full place-items-center text-sm text-slate-500">No social media metrics available</p>}
              </div>
              {socialMetrics.length > 0 && <div className="mt-3 flex gap-4 text-xs text-slate-500"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-rose-700" />Reach</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-slate-400" />Views</span></div>}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4"><h2 className="text-base font-semibold text-slate-900 dark:text-white">Published content</h2><p className="mt-1 text-xs text-slate-500">Post details and engagement actions</p></div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...socialMetrics].sort((a, b) => b.reach - a.reach).map((post, index) => (
                  <article key={post.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-semibold ${platformMarkClass[post.platform] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`} aria-hidden="true">{post.platform === 'YouTube' ? '▶' : post.platform.slice(0, 1)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-xs font-medium text-slate-700 dark:text-slate-200">{post.platform}</span><span className="text-xs text-slate-400">{post.contentType}</span>{index === 0 && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">Top reach</span>}</div>
                        <h3 className="mt-1 text-sm font-medium leading-5 text-slate-900 dark:text-white">{post.title}</h3>
                        <p className="mt-1 text-xs text-slate-500">{new Date(`${post.publishDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.reach.toLocaleString('en-IN')} reach</span>
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes.toLocaleString('en-IN')}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post.comments.toLocaleString('en-IN')}</span>
                          <span className="flex items-center gap-1"><Share2 className="h-3 w-3" />{post.shares.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
                {!socialMetrics.length && <p className="py-8 text-center text-sm text-slate-500">No published content available</p>}
              </div>
            </section>
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

      <MediaManagementSections
        activeTab={tab}
        campaigns={campaigns}
        socialMetrics={socialMetrics}
        podcasts={podcasts}
        reels={reels}
        events={events}
        employees={employees}
        currentEmployee={currentEmployee}
      />
    </div>
  );
}
