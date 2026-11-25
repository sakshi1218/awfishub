import LearningManagement from '../../../components/learning/LearningManagement';
import { redirect } from 'next/navigation';

interface LearningPageProps {
  params: {
    slug: string[];
  };
}

export default function LearningPage({ params }: LearningPageProps) {
  if (params.slug.length === 1 && params.slug[0] === 'specializations') {
    redirect('/learning/courses');
  }

  return <LearningManagement pathname={`/learning/${params.slug.join('/')}`} />;
}
