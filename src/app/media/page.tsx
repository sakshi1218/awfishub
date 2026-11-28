'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Radio, BarChart2, Mic, Film, CheckCircle2, Clock, LayoutDashboard, Wallet, Target, CalendarDays, Camera, BriefcaseBusiness, CirclePlay, AtSign, Heart, MessageCircle, Share2, Eye, X } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '@/context/AppContext';
import { PodcastEpisode, ReelItem } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import MediaManagementSections, { type MediaTab } from '@/components/media/MediaManagementSections';

const REEL_STAGES: ReelItem['stage'][] = ['Assigned', 'Editing', 'Review', 'Approved', 'Posted'];

function MediaPageContent() {
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
  const [socialPlatform, setSocialPlatform] = useState('All platforms');
  const [socialDateFrom, setSocialDateFrom] = useState('');
  const [socialDateTo, setSocialDateTo] = useState('');
  const tabButtonClass = (active: boolean) => `shrink-0 px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${active ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200' : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`;

  const platformStats = useMemo(() => {
    const grouped = new Map<string, { platform: string; posts: number; reach: number; views: number; engagements: number }>();
    socialMetrics.forEach((metric) => {
      const current = grouped.get(metric.platform) || { platform: metric.platform, posts: 0, reach: 0, views: 0, engagements: 0 };
      current.posts += 1;
      current.reach += metric.reach;
      current.views += metric.views;
      current.engagements += metric.likes + metric.comments + metric.shares;
      grouped.set(metric.platform, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.reach - a.reach);
  }, [socialMetrics]);
  const visiblePosts = useMemo(() => socialMetrics
    .filter((metric) => (socialPlatform === 'All platforms' || metric.platform === socialPlatform)
      && (!socialDateFrom || metric.publishDate >= socialDateFrom)
      && (!socialDateTo || metric.publishDate <= socialDateTo))
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate)),
  [socialMetrics, socialPlatform, socialDateFrom, socialDateTo]);
  const rankedPosts = useMemo(() => [...visiblePosts].sort((a, b) =>
    (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares)), [visiblePosts]);
  const postEngagementTrend = useMemo(() => [...visiblePosts].sort((a, b) => a.publishDate.localeCompare(b.publishDate)).map((post) => ({
    date: new Date(`${post.publishDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    title: post.title,
    engagements: post.likes + post.comments + post.shares,
  })), [visiblePosts]);
  const engagementMix = useMemo(() => [
    { name: 'Likes', value: visiblePosts.reduce((sum, post) => sum + post.likes, 0), color: '#be123c' },
    { name: 'Comments', value: visiblePosts.reduce((sum, post) => sum + post.comments, 0), color: '#64748b' },
    { name: 'Shares', value: visiblePosts.reduce((sum, post) => sum + post.shares, 0), color: '#cbd5e1' },
  ].filter((entry) => entry.value > 0), [visiblePosts]);
  const visiblePlatformStats = useMemo(() => {
    const grouped = new Map<string, { platform: string; posts: number; reach: number; views: number; engagements: number }>();
    visiblePosts.forEach((metric) => {
      const current = grouped.get(metric.platform) || { platform: metric.platform, posts: 0, reach: 0, views: 0, engagements: 0 };
      current.posts += 1;
      current.reach += metric.reach;
      current.views += metric.views;
      current.engagements += metric.likes + metric.comments + metric.shares;
      grouped.set(metric.platform, current);
    });
    return Array.from(grouped.values()).sort((a, b) => b.reach - a.reach);
  }, [visiblePosts]);
  const clearSocialFilters = () => { setSocialPlatform('All platforms'); setSocialDateFrom(''); setSocialDateTo(''); };

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40"><Radio className="h-4 w-4" /></span>
              Media workspace
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Content, campaigns and audience</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">Social performance, podcast production and short-form video in one working view.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid grid-cols-3 gap-0 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="px-4 py-3"><p className="text-[11px] text-slate-500">Social records</p><p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{socialMetrics.length}</p></div>
            <div className="px-4 py-3"><p className="text-[11px] text-slate-500">Episodes</p><p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{podcasts.length}</p></div>
            <div className="px-4 py-3"><p className="text-[11px] text-slate-500">Reels</p><p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white">{reels.length}</p></div>
          </div>
          <Link href="/departments" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-rose-900 dark:hover:bg-rose-950/30"><ArrowLeft className="h-4 w-4" /> Back to departments</Link>
          </div>
        </div>
      </header>

      <nav aria-label="Media workspace sections" className="max-w-full overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        <div className="flex w-max items-center gap-1 py-1 text-xs">
          <button aria-pressed={tab === 'OVERVIEW'} onClick={() => setTab('OVERVIEW')} className={tabButtonClass(tab === 'OVERVIEW')}>
            <LayoutDashboard className="w-3.5 h-3.5" /> Executive Overview
          </button>
          <button aria-pressed={tab === 'SOCIAL'} onClick={() => setTab('SOCIAL')} className={tabButtonClass(tab === 'SOCIAL')}>
            <BarChart2 className="w-3.5 h-3.5" /> Social Media
          </button>
          <button aria-pressed={tab === 'PODCAST'} onClick={() => setTab('PODCAST')} className={tabButtonClass(tab === 'PODCAST')}>
            <Mic className="w-3.5 h-3.5" /> Podcasts
          </button>
          <button aria-pressed={tab === 'REELS'} onClick={() => setTab('REELS')} className={tabButtonClass(tab === 'REELS')}>
            <Film className="w-3.5 h-3.5" /> Reels
          </button>
          <button aria-pressed={tab === 'FUNDS'} onClick={() => setTab('FUNDS')} className={tabButtonClass(tab === 'FUNDS')}>
            <Wallet className="w-3.5 h-3.5" /> Funds
          </button>
          <button aria-pressed={tab === 'STRATEGIES'} onClick={() => setTab('STRATEGIES')} className={tabButtonClass(tab === 'STRATEGIES')}>
            <Target className="w-3.5 h-3.5" /> Strategies
          </button>
          <button aria-pressed={tab === 'SCHEDULE'} onClick={() => setTab('SCHEDULE')} className={tabButtonClass(tab === 'SCHEDULE')}>
            <CalendarDays className="w-3.5 h-3.5" /> Schedule
          </button>
        </div>
      </nav>

      {tab === 'SOCIAL' && (
        <section className="space-y-6" aria-label="Social media analytics">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">Published content</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Social performance</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Reach, views and interactions from the available post records.</p>
            </div>
            <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Platform
                <select value={socialPlatform} onChange={(event) => setSocialPlatform(event.target.value)} className="mt-1 block min-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option>All platforms</option>{platformStats.map((item) => <option key={item.platform}>{item.platform}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">From
                <input type="date" aria-label="Published from date" value={socialDateFrom} onChange={(event) => setSocialDateFrom(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">To
                <input type="date" aria-label="Published to date" value={socialDateTo} onChange={(event) => setSocialDateTo(event.target.value)} className="mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              {(socialPlatform !== 'All platforms' || socialDateFrom || socialDateTo) && <button type="button" onClick={clearSocialFilters} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><X className="h-3.5 w-3.5" /> Clear</button>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {visiblePlatformStats.map((item) => <PlatformCard key={item.platform} platform={item.platform} posts={item.posts} reach={item.reach} views={item.views} engagements={item.engagements} />)}
            {!platformStats.length && <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">No social platform records are available.</div>}
            {platformStats.length > 0 && !visiblePlatformStats.length && <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">No platforms match the selected filters.</div>}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 xl:col-span-7">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div><p className="text-xs font-medium text-rose-800 dark:text-rose-300">Interactions per published post</p><h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">Engagement sequence</h3></div>
                <span className="text-xs tabular-nums text-slate-500">{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</span>
              </div>
              <div className="h-72 px-3 py-4 sm:px-5">
                {postEngagementTrend.length ? <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={postEngagementTrend} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={42} />
                    <Tooltip formatter={(value) => [Number(value).toLocaleString('en-IN'), 'Interactions']} labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''} />
                    <Line type="monotone" dataKey="engagements" name="Interactions" stroke="#be123c" strokeWidth={2.5} dot={{ r: 4, fill: '#be123c', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer> : <ChartEmpty text="No posts match these filters." />}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:col-span-5">
              <div><p className="text-xs font-medium text-slate-500">Interaction mix</p><h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">Likes, comments and shares</h3></div>
              {engagementMix.length ? <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_140px] xl:grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_140px]">
                <div className="h-52 min-w-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={engagementMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={54} outerRadius={78} paddingAngle={2} stroke="none">{engagementMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value) => Number(value).toLocaleString('en-IN')} /></PieChart></ResponsiveContainer></div>
                <div className="space-y-3">{engagementMix.map((entry) => <div key={entry.name} className="flex items-center justify-between gap-3 text-sm"><span className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />{entry.name}</span><span className="font-semibold tabular-nums text-slate-900 dark:text-white">{entry.value.toLocaleString('en-IN')}</span></div>)}</div>
              </div> : <ChartEmpty text="No interactions are available for these filters." />}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800"><div><p className="text-xs font-medium text-slate-500">Post records</p><h3 className="mt-1 text-base font-semibold text-slate-950 dark:text-white">Content performance</h3></div><p className="text-xs text-slate-500">Highest total interactions highlighted</p></div>
            {visiblePosts.length ? <div className="grid grid-cols-1 gap-px bg-slate-100 md:grid-cols-2 dark:bg-slate-800">{rankedPosts.map((post, index) => {
              const interactions = post.likes + post.comments + post.shares;
              const engagementRate = post.reach ? interactions / post.reach * 100 : 0;
              return <article key={post.id} className="bg-white p-5 transition-colors hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-800/50">
                <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><PlatformMark platform={post.platform} /><div className="min-w-0"><p className="text-xs font-medium text-slate-600 dark:text-slate-400">{post.platform} · {post.contentType}</p><p className="mt-1 text-xs text-slate-500">Published {post.publishDate}</p></div></div>{index === 0 && <span className="shrink-0 rounded-md bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">Top interactions</span>}</div>
                <h4 className="mt-4 min-h-12 text-sm font-semibold leading-6 text-slate-950 dark:text-white">{post.title}</h4>
                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"><PostMetric icon={Heart} label="Likes" value={post.likes} /><PostMetric icon={MessageCircle} label="Comments" value={post.comments} /><PostMetric icon={Share2} label="Shares" value={post.shares} /><PostMetric icon={Eye} label="Reach" value={post.reach} /></div>
                <p className="mt-3 text-xs text-slate-500">{interactions.toLocaleString('en-IN')} interactions <span className="px-1">·</span> {engagementRate.toFixed(2)}% of reach</p>
              </article>;
            })}</div> : <div className="p-10"><ChartEmpty text="No posts match these filters." /></div>}
            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">Engagement rate is calculated as (likes + comments + shares) ÷ reach. No post image assets are available in these records.</div>
          </section>
        </section>
      )}

      {tab === 'PODCAST' && (
        <div className="space-y-4">
          {podcasts.map((pod) => (
            <div key={pod.id} className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900 space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {REEL_STAGES.map((stage) => {
            const items = reels.filter((r) => r.stage === stage);
            return (
              <div key={stage} className="min-h-[340px] space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{stage}</span>
                  <StatusBadge label={String(items.length)} />
                </div>
                {items.map((r) => (
                  <div key={r.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-xs transition-colors hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900">
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


function PlatformMark({ platform }: { platform: string }) {
  const icons: Record<string, React.ElementType> = { Instagram: Camera, LinkedIn: BriefcaseBusiness, YouTube: CirclePlay, X: AtSign };
  const Icon = icons[platform] || BarChart2;
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" aria-hidden="true"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>;
}

function PlatformCard({ platform, posts, reach, views, engagements }: { platform: string; posts: number; reach: number; views: number; engagements: number }) {
  const rate = reach ? engagements / reach * 100 : 0;
  return <article className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-rose-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-900">
    <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><PlatformMark platform={platform} /><div><h3 className="text-sm font-semibold text-slate-900 dark:text-white">{platform}</h3><p className="mt-0.5 text-xs text-slate-500">{posts} {posts === 1 ? 'post' : 'posts'}</p></div></div><span className="text-[11px] font-medium tabular-nums text-rose-800 dark:text-rose-300">{rate.toFixed(2)}%</span></div>
    <div className="mt-4 grid grid-cols-2 gap-y-3 border-t border-slate-100 pt-3 dark:border-slate-800"><div><p className="text-[11px] text-slate-500">Reach</p><p className="mt-1 text-base font-semibold tabular-nums text-slate-900 dark:text-white">{reach.toLocaleString('en-IN')}</p></div><div><p className="text-[11px] text-slate-500">Views</p><p className="mt-1 text-base font-semibold tabular-nums text-slate-900 dark:text-white">{views.toLocaleString('en-IN')}</p></div><div className="col-span-2 flex items-center justify-between text-xs"><span className="text-slate-500">Interactions</span><span className="font-medium tabular-nums text-slate-800 dark:text-slate-200">{engagements.toLocaleString('en-IN')}</span></div></div>
  </article>;
}

function PostMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return <div className="min-w-0"><span className="flex items-center gap-1.5 text-[10px] text-slate-500"><Icon className="h-3 w-3" />{label}</span><p className="mt-1 text-xs font-semibold tabular-nums text-slate-800 dark:text-slate-200">{value.toLocaleString('en-IN')}</p></div>;
}

function ChartEmpty({ text }: { text: string }) {
  return <div className="flex h-full min-h-32 items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-sm text-slate-500 dark:bg-slate-800/60">{text}</div>;
}

export default function MediaPage() {
  return <MediaPageContent />;
}

