import Link from 'next/link';
import { ArrowUpRight, BookOpen, GraduationCap } from 'lucide-react';
import ModulePage from '@/components/ui/ModulePage';
import { allCourses, courseCatalogue } from '@/lib/course-catalogue';
import CourseCatalogueCard from '@/components/learning/CourseCatalogueCard';

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
        description="Browse programme providers and open a programme to view its supplied courses."
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
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
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
                  className={`overflow-hidden rounded-2xl border border-slate-200 border-l-4 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${index % 2 === 0 ? 'border-l-violet-500' : 'border-l-blue-500'}`}
                >
                  <div className={`flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800 ${index === 0 ? 'bg-violet-50/80 dark:bg-violet-950/30' : 'bg-slate-50 dark:bg-slate-800/40'}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300">
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
                            <BookOpen className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                            <Link
                              href={{ pathname: '/learning/courses', query: { provider: provider.name, programme: programme.name } }}
                              className="text-xs font-semibold text-slate-800 hover:text-violet-700 dark:text-slate-100 dark:hover:text-violet-300"
                            >
                              {programme.name}
                            </Link>
                          </div>
                          <ul className="space-y-2 pl-5">
                            {programme.courses.map((course) => (
                              <li key={course} className="list-disc text-xs leading-5 text-slate-600 marker:text-violet-400 dark:text-slate-300">
                                {course}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
        <div className="grid gap-4 md:grid-cols-2">
          {allCourses.map((item) => (
            <CourseCatalogueCard key={item.slug} course={item} />
          ))}
        </div>
      </div>
    </ModulePage>
  );
}
