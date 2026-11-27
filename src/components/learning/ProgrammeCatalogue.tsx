import Link from 'next/link';
import { ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react';
import ModulePage from '@/components/ui/ModulePage';
import { allCourses, courseCatalogue } from '@/lib/course-catalogue';

interface ProgrammeCatalogueProps {
  pathname: '/learning/programmes' | '/learning/courses';
}

export default function ProgrammeCatalogue({ pathname }: ProgrammeCatalogueProps) {
  const isProgrammeView = pathname === '/learning/programmes';

  if (isProgrammeView) {
    return (
      <ModulePage
        pathname={pathname}
        title="Programmes"
        description="Programme providers, specializations, and the approved course catalogue. Course listings are provided for UI structure only."
      >
        <div className="space-y-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Programme catalogue</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Provider and programme names shown as supplied. No batch or enrollment data is connected.
              </p>
            </div>
            <Link
              href="/learning/courses"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Browse courses <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {courseCatalogue.map((provider, index) => {
              const providerCourseCount = provider.programmes.reduce(
                (count, programme) => count + programme.courses.length,
                0
              );

              return (
                <article
                  key={provider.name}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className={`flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 ${index === 0 ? 'bg-indigo-50/80 dark:bg-indigo-950/30' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Programme provider</p>
                        <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      {provider.programmes.length ? `${providerCourseCount} courses` : 'Catalogue pending'}
                    </span>
                  </div>

                  {provider.programmes.length ? (
                    <div className="space-y-4 p-5">
                      {provider.programmes.map((programme) => (
                        <div key={programme.name}>
                          <div className="mb-2 flex items-center gap-2">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{programme.name}</h4>
                          </div>
                          <ul className="space-y-2 pl-5">
                            {programme.courses.map((course) => (
                              <li key={course} className="list-disc text-xs leading-5 text-slate-600 marker:text-indigo-400 dark:text-slate-300">
                                {course}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <Link
                        href="/learning/specializations"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 dark:text-indigo-300"
                      >
                        View specializations <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="p-5">
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-800/40">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Course catalogue is not available yet</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          CDAC course information will be added when it is provided.
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </ModulePage>
    );
  }

  return (
    <ModulePage
      pathname={pathname}
      title="Courses"
      description="Browse the supplied course catalogue and open an initial course detail page. Course and provider information is not connected to a live system."
    >
      <div>
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Available course catalogue</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {allCourses.length} listed courses · Demo catalogue, not enrollment data
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allCourses.map((item) => (
            <Link
              key={item.slug}
              href={`/learning/courses/${item.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <BookOpen className="h-4 w-4" />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-indigo-600" />
              </span>
              <span className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                {item.provider}
              </span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-slate-900 dark:text-white">
                {item.course}
              </span>
              <span className="mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
                Programme: {item.programme}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ModulePage>
  );
}
