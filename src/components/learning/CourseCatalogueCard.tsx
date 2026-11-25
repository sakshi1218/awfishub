import Link from 'next/link';
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import type { allCourses } from '@/lib/course-catalogue';

type CatalogueCourse = (typeof allCourses)[number];

export default function CourseCatalogueCard({ course }: { course: CatalogueCourse }) {
  const isMindLyft = course.provider === 'MindLyftAI';
  const providerLabel = isMindLyft ? 'MindLyft AI Programme' : `${course.provider} Programme`;

  return (
    <Link
      href={`/learning/courses/${course.slug}`}
      className="group relative flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pl-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-5 sm:pl-6"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${
          isMindLyft ? 'from-violet-500 to-blue-500' : 'from-blue-500 to-violet-500'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700 dark:text-violet-300">
              {providerLabel}
            </span>
            <span className="mt-1 block truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
              {course.programme}
            </span>
          </span>
        </div>
        <span className="shrink-0 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Course
          </span>
          <span className="mt-0.5 block text-[9px] font-medium uppercase tracking-wide text-slate-400">
            Catalogue
          </span>
        </span>
      </div>

      <h2 className="mt-4 text-base font-bold leading-5 text-slate-950 dark:text-white sm:text-lg">
        {course.course}
      </h2>
      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
        Listed under the <span className="font-semibold text-slate-800 dark:text-slate-100">{course.programme}</span> programme.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {[course.provider, course.programme].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2.5 dark:border-violet-900/50 dark:bg-violet-950/30">
          <p className="flex items-center gap-1.5 text-[10px] font-bold text-violet-800 dark:text-violet-300">
            <Sparkles className="h-3 w-3" />
            Course information
          </p>
          <p className="mt-1 text-[11px] leading-4 text-slate-600 dark:text-slate-300">
            Duration, topic tags, and highlights are not included in the supplied catalogue yet.
          </p>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 group-hover:text-blue-700 dark:text-violet-300 dark:group-hover:text-blue-300">
          View course details <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
