export interface CourseProgramme {
  name: string;
  courses: string[];
}

export interface CourseProvider {
  name: string;
  programmes: CourseProgramme[];
}

export const courseCatalogue: CourseProvider[] = [
  {
    name: 'MindLyftAI',
    programmes: [
      {
        name: 'AI, GenAI & Agentic AI',
        courses: [
          'AI Engineering, LLM, RAG & Production AI',
          'Advanced Certification in Agentic AI and Intelligent Automation',
        ],
      },
      {
        name: 'Data Analytics',
        courses: [
          'AI-Powered Data Analytics',
          'Advanced Certification in Data Analytics with AI',
        ],
      },
      {
        name: 'Data Science, Machine Learning & Deep Learning',
        courses: [
          'Data Science with AI',
          'Python, Machine Learning & Applied Data Science',
          'Deep Learning & Neural Network Applications',
        ],
      },
      {
        name: 'Cloud Computing & DevOps',
        courses: [
          'Cloud Computing & DevOps',
          'Advanced Certification in Cloud Computing',
        ],
      },
    ],
  },
  {
    name: 'Cybersecurity × C3iHub, IIT Kanpur',
    programmes: [
      {
        name: 'Cybersecurity',
        courses: [
          'Certification Program on AI in CyberSecurity: Track A – Technical',
          'Certification Program on AI in CyberSecurity: Track B – Non-Technical',
          'AI-Powered CyberSecurity Professional Certification Program',
        ],
      },
    ],
  },
  {
    name: 'Capsule',
    programmes: [
      {
        name: 'Capsule Programmes',
        courses: [
          'Fundamentals of Data Analytics',
          'Data Analytics with AI',
          'AI Tools, Prompt Engineering & Automation for Everyone',
          'Machine Learning with AI',
        ],
      },
    ],
  },
  {
    name: 'CDAC',
    programmes: [],
  },
];

export function slugifyCourse(course: string) {
  return course
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const allCourses = courseCatalogue.flatMap((provider) =>
  provider.programmes.flatMap((programme) =>
    programme.courses.map((course) => ({
      course,
      provider: provider.name,
      programme: programme.name,
      slug: slugifyCourse(course),
    }))
  )
);
