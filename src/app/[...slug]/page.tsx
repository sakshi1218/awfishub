import ModulePage from '@/components/ui/ModulePage';
import ProgrammeCatalogue from '@/components/learning/ProgrammeCatalogue';
import CounselorDashboard from '@/components/counselor/CounselorDashboard';
import TeleCallerDashboard from '@/components/telecaller/TeleCallerDashboard';
import TrainerDashboard from '@/components/trainer/TrainerDashboard';
import { allCourses } from '@/lib/course-catalogue';
import { getNavigationEntry } from '@/lib/navigation';

interface CatchAllPageProps {
  params: {
    slug: string[];
  };
}

function humanize(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function CatchAllPage({ params }: CatchAllPageProps) {
  const pathname = `/${params.slug.join('/')}`;

  if (pathname === '/learning/programmes' || pathname === '/learning/courses') {
    return <ProgrammeCatalogue pathname={pathname} />;
  }

  if (pathname === '/trainer/dashboard') {
    return <TrainerDashboard />;
  }

  if (pathname === '/counselor/dashboard') {
    return <CounselorDashboard />;
  }

  if (pathname === '/telecaller/dashboard') {
    return <TeleCallerDashboard />;
  }

  const course = pathname.startsWith('/learning/courses/')
    ? allCourses.find((item) => item.slug === params.slug[params.slug.length - 1])
    : undefined;
  const entry = getNavigationEntry(pathname);

  return (
    <ModulePage
      pathname={pathname}
      title={course?.course ?? entry?.label ?? humanize(params.slug[params.slug.length - 1] ?? 'Module')}
      description={
        course
          ? `${course.provider} · ${course.programme}. This is a course detail page structure for the demo catalogue; batch and enrollment records are not connected.`
          : entry?.description
      }
    />
  );
}
