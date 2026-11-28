export interface VerticalDirector {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  responsibilities: string[];
}

export interface VerticalEmployee {
  id: string;
  name: string;
  role: string;
  team: string;
  status: 'Active' | 'On Leave';
  activeTasks: number;
}

export interface VerticalProject {
  id: string;
  title: string;
  status: 'Active' | 'Completed' | 'In Review';
  progress: number;
  lead: string;
  leadId: string;
  teamCount: number;
  deadline: string;
  milestones: { name: string; completed: boolean }[];
  description: string;
  quotation?: {
    reference: string;
    amount: string;
    status: 'Draft' | 'Sent' | 'Approved' | 'Accepted';
  };
  agreement?: {
    reference: string;
    status: 'Draft' | 'Pending signature' | 'Signed';
    signedDate?: string;
  };
}

export interface VerticalTask {
  id: string;
  title: string;
  assignedTo: string;
  priority: 'Critical' | 'High' | 'Medium';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Overdue';
}

export interface VerticalActivity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface CompanyPillar {
  id: 'education' | 'innovation' | 'ai-it-solutions';
  name: string;
  subtitle: string;
  description: string;
  stats: {
    label: string;
    value: string | number;
  }[];
  director: VerticalDirector;
  employees: VerticalEmployee[];
  projects: VerticalProject[];
  tasks: VerticalTask[];
  activities: VerticalActivity[];
  accentColor: {
    badgeBg: string;
    badgeText: string;
    cardBorder: string;
    cardTint: string;
    buttonColor: string;
    progressBar: string;
  };
}

export const FOUNDER_PILLARS: Record<string, CompanyPillar> = {
  education: {
    id: 'education',
    name: 'EDUCATION',
    subtitle: 'Training & Academic Operations',
    description: 'Manage education, training and learning operations.',
    stats: [
      { label: 'Total Courses', value: 12 },
      { label: 'Active Batches', value: 8 },
      { label: 'Total Students', value: 240 },
      { label: 'Faculty Members', value: 18 },
      { label: 'Ongoing Projects', value: 6 },
    ],
    director: {
      id: 'AWF-EMP-002',
      name: 'Anchal Agawane',
      role: 'Director of Education',
      department: 'Academic & Training Division',
      email: 'anchal.agawane@awfishub.in',
      phone: '+91 98230 44521',
      avatar: 'AA',
      bio: 'Leading all educational curriculums, faculty development programs, institutional partnerships, and student placement training pipelines across campus hubs.',
      responsibilities: [
        'Curriculum modernization & industry alignment',
        'Faculty recruitment, review & performance standards',
        'Student batch progress & certification delivery',
        'Institutional tie-ups with partner universities',
      ],
    },
    employees: [
      { id: 'AWF-EMP-011', name: 'Dr. Kunal More', role: 'Head Faculty (Full Stack)', team: 'Academic Faculty', status: 'Active', activeTasks: 3 },
      { id: 'AWF-EMP-015', name: 'Pooja Verma', role: 'Senior Trainer (Cloud & DevOps)', team: 'Academic Faculty', status: 'Active', activeTasks: 2 },
      { id: 'AWF-EMP-016', name: 'Rahul Joshi', role: 'Lead Counselor', team: 'Student Success', status: 'Active', activeTasks: 4 },
      { id: 'AWF-EMP-017', name: 'Megha Kulkarni', role: 'TeleCaller Lead', team: 'Admissions & Outreach', status: 'Active', activeTasks: 5 },
      { id: 'AWF-EMP-018', name: 'Akshay Nair', role: 'Curriculum Developer', team: 'Course Content', status: 'Active', activeTasks: 2 },
      { id: 'AWF-EMP-019', name: 'Sunita Deshmukh', role: 'Faculty Coordinator', team: 'Operations', status: 'Active', activeTasks: 1 },
    ],
    projects: [
      {
        id: 'PRJ-EDU-101',
        title: 'Full Stack Web Engineering Diploma 2026',
        status: 'Active',
        progress: 75,
        lead: 'Dr. Kunal More',
        leadId: 'AWF-EMP-011',
        teamCount: 6,
        deadline: '15 Jan 2027',
        description: 'Comprehensive 6-month hands-on curriculum encompassing React, Next.js, Node.js, and cloud deployments for 120 college undergraduates.',
        milestones: [
          { name: 'Core Foundation & JavaScript ES6+', completed: true },
          { name: 'Frontend React Architecture & Tailwind', completed: true },
          { name: 'Backend API Development & Microservices', completed: true },
          { name: 'Capstone Industry Projects', completed: false },
          { name: 'Mock Interviews & Placement Drives', completed: false },
        ],
      },
      {
        id: 'PRJ-EDU-102',
        title: 'Campus Faculty Development Program (FDP)',
        status: 'Active',
        progress: 88,
        lead: 'Pooja Verma',
        leadId: 'AWF-EMP-015',
        teamCount: 4,
        deadline: '20 Dec 2026',
        description: 'Institutional upskilling workshops for engineering college professors across 11 partner campuses in Maharashtra.',
        milestones: [
          { name: 'Curriculum syllabus approval from Academic Council', completed: true },
          { name: 'Training modules & slide decks finalized', completed: true },
          { name: 'College webinar series execution (7/11 delivered)', completed: true },
          { name: 'Faculty certification distribution', completed: false },
        ],
      },
      {
        id: 'PRJ-EDU-103',
        title: 'Online LMS & Video Lecture Portal Upgrade',
        status: 'Active',
        progress: 60,
        lead: 'Akshay Nair',
        leadId: 'AWF-EMP-018',
        teamCount: 5,
        deadline: '28 Feb 2027',
        description: 'Migrating student learning portal to high-performance video streaming with quizzes and automated assignment grading.',
        milestones: [
          { name: 'Student feedback survey analysis', completed: true },
          { name: 'Video CDN and storage integration', completed: true },
          { name: 'Automated MCQ assessment engine', completed: false },
          { name: 'Mobile-first responsive student app', completed: false },
        ],
      },
      {
        id: 'PRJ-EDU-104',
        title: 'Data Science & AI Bootcamps (Spring 2026)',
        status: 'Completed',
        progress: 100,
        lead: 'Dr. Kunal More',
        leadId: 'AWF-EMP-011',
        teamCount: 5,
        deadline: '15 Oct 2026',
        description: 'Intensive 8-week bootcamp covering Python, Pandas, Machine Learning basics, and real-world datasets.',
        milestones: [
          { name: 'Cohort admissions & orientation (85 students)', completed: true },
          { name: 'Hands-on practical notebook labs', completed: true },
          { name: 'Hackathon & project showcase day', completed: true },
          { name: 'Final certification and hiring partner introductions', completed: true },
        ],
      },
    ],
    tasks: [
      { id: 'TSK-EDU-01', title: 'Publish Semester 2 batch timetable & mentor assignments', assignedTo: 'Dr. Kunal More', priority: 'Critical', dueDate: 'Today', status: 'Pending' },
      { id: 'TSK-EDU-02', title: 'Complete performance reviews for 14 visiting faculty members', assignedTo: 'Anchal Agawane', priority: 'High', dueDate: 'Tomorrow', status: 'In Progress' },
      { id: 'TSK-EDU-03', title: 'Resolve syllabus gap in Advanced Cloud Architecture module', assignedTo: 'Pooja Verma', priority: 'Medium', dueDate: '29 Nov 2026', status: 'Pending' },
      { id: 'TSK-EDU-04', title: 'Submit quarterly placement summary report to Chairperson', assignedTo: 'Rahul Joshi', priority: 'Critical', dueDate: '25 Nov 2026', status: 'Overdue' },
    ],
    activities: [
      { id: 'ACT-EDU-1', user: 'Anchal Agawane', action: 'approved new syllabus for', target: 'AI & Data Engineering Batch #04', timestamp: '2 hours ago' },
      { id: 'ACT-EDU-2', user: 'Dr. Kunal More', action: 'published midterm evaluation results for', target: 'Full Stack Batch #02', timestamp: '5 hours ago' },
      { id: 'ACT-EDU-3', user: 'Pooja Verma', action: 'scheduled college workshop with', target: 'COEP Engineering Pune', timestamp: 'Yesterday' },
      { id: 'ACT-EDU-4', user: 'Rahul Joshi', action: 'onboarded 18 new scholarship students into', target: 'Cybersecurity Diploma', timestamp: '2 days ago' },
    ],
    accentColor: {
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      cardBorder: 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600',
      cardTint: 'bg-white dark:bg-[#141822]',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900',
      progressBar: 'bg-slate-900 dark:bg-blue-500',
    },
  },

  innovation: {
    id: 'innovation',
    name: 'INNOVATION',
    subtitle: 'R&D, Patents & Venture Incubation',
    description: 'Manage innovation projects, research and development activities.',
    stats: [
      { label: 'Total Projects', value: 14 },
      { label: 'Active Projects', value: 9 },
      { label: 'Total Employees', value: 24 },
      { label: 'Research Initiatives', value: 5 },
      { label: 'Completed Projects', value: 11 },
    ],
    director: {
      id: 'AWF-EMP-003',
      name: 'Rutuja Botre',
      role: 'Director of Innovation',
      department: 'R&D, Sales & Innovation Hub',
      email: 'rutuja.botre@awfishub.in',
      phone: '+91 97654 33219',
      avatar: 'RB',
      bio: 'Leading intellectual property incubation, college incubation partnerships, applied research labs, and emerging commercial technology POCs.',
      responsibilities: [
        'Incubation pipeline and prototype grant allocation',
        'Patent filings and research IP documentation',
        'University R&D consortium tie-ups and MoUs',
        'Product-market fit testing for internal ventures',
      ],
    },
    employees: [
      { id: 'AWF-EMP-020', name: 'Nikhil Patil', role: 'Head of R&D Engineering', team: 'Applied Labs', status: 'Active', activeTasks: 4 },
      { id: 'AWF-EMP-021', name: 'Devendra Shinde', role: 'Hardware & IoT Lead', team: 'Hardware Prototyping', status: 'Active', activeTasks: 3 },
      { id: 'AWF-EMP-022', name: 'Sayali Mane', role: 'Patent & IP Specialist', team: 'Legal & Technology', status: 'Active', activeTasks: 2 },
      { id: 'AWF-EMP-023', name: 'Karthik Rao', role: 'Product Researcher', team: 'Venture Studio', status: 'Active', activeTasks: 5 },
      { id: 'AWF-EMP-024', name: 'Priyanka Jadhav', role: 'Field Test Coordinator', team: 'Testing & Validation', status: 'Active', activeTasks: 3 },
    ],
    projects: [
      {
        id: 'PRJ-INN-201',
        title: 'Project Agrismart: Edge-AI Soil Sensor',
        status: 'Active',
        progress: 82,
        lead: 'Devendra Shinde',
        leadId: 'AWF-EMP-021',
        teamCount: 6,
        deadline: '10 Feb 2027',
        description: 'Low-cost solar IoT probe measuring NPK soil nutrients and predicting irrigation schedules via offline edge inference.',
        milestones: [
          { name: 'Hardware PCB prototype revision 2.1 completed', completed: true },
          { name: 'LoRaWAN field mesh test on 50-acre grape vineyard', completed: true },
          { name: 'Provisional patent specification draft filed', completed: true },
          { name: 'Commercial manufacturing vendor negotiation', completed: false },
        ],
      },
      {
        id: 'PRJ-INN-202',
        title: 'Decentralized Academic Credential Verification (DID)',
        status: 'Active',
        progress: 68,
        lead: 'Nikhil Patil',
        leadId: 'AWF-EMP-020',
        teamCount: 5,
        deadline: '30 Mar 2027',
        description: 'Tamper-proof verifiable credential system allowing instant employer verification of student degrees without registrar bottlenecks.',
        milestones: [
          { name: 'Cryptographic architecture and schema design', completed: true },
          { name: 'Smart contract registry benchmark on Polygon testnet', completed: true },
          { name: 'College admin signing dashboard beta release', completed: false },
          { name: 'Third-party HR background check API integration', completed: false },
        ],
      },
      {
        id: 'PRJ-INN-203',
        title: 'Acoustic Fault Detection for CNC Machines',
        status: 'Active',
        progress: 90,
        lead: 'Karthik Rao',
        leadId: 'AWF-EMP-023',
        teamCount: 4,
        deadline: '15 Dec 2026',
        description: 'Microphone sensor array paired with deep learning to detect spindle wear in manufacturing plants before catastrophic failure.',
        milestones: [
          { name: 'Audio dataset recording across 40 industrial lathes', completed: true },
          { name: 'Convolutional neural network 94.8% anomaly accuracy', completed: true },
          { name: 'Industrial pilot deployment at Bosch partner unit', completed: true },
          { name: 'Production firmware release and commercial rollout', completed: false },
        ],
      },
      {
        id: 'PRJ-INN-204',
        title: 'Biometric Attendance & Campus Access Device',
        status: 'Completed',
        progress: 100,
        lead: 'Devendra Shinde',
        leadId: 'AWF-EMP-021',
        teamCount: 4,
        deadline: '15 Sep 2026',
        description: 'Sub-second RFID + Facial recognition terminal deployed across 3 educational campuses with 10,000+ daily clock-ins.',
        milestones: [
          { name: 'Enclosure 3D modeling and thermal validation', completed: true },
          { name: 'Local offline neural engine for facial embeddings', completed: true },
          { name: 'Campus installation and live synchronization', completed: true },
          { name: 'Handover to facilities operations team', completed: true },
        ],
      },
    ],
    tasks: [
      { id: 'TSK-INN-01', title: 'Review Agrismart patent examination report with legal team', assignedTo: 'Sayali Mane', priority: 'Critical', dueDate: 'Today', status: 'Pending' },
      { id: 'TSK-INN-02', title: 'Bench test 20 IoT prototypes in environmental thermal chamber', assignedTo: 'Devendra Shinde', priority: 'High', dueDate: 'Tomorrow', status: 'In Progress' },
      { id: 'TSK-INN-03', title: 'Prepare demonstration deck for Maharashtra Innovation Society', assignedTo: 'Rutuja Botre', priority: 'High', dueDate: '02 Dec 2026', status: 'Pending' },
      { id: 'TSK-INN-04', title: 'Finalize university laboratory equipment grant expenditure', assignedTo: 'Nikhil Patil', priority: 'Medium', dueDate: '26 Nov 2026', status: 'Overdue' },
    ],
    activities: [
      { id: 'ACT-INN-1', user: 'Rutuja Botre', action: 'signed innovation collaboration MoU with', target: 'VNIT Nagpur Research Park', timestamp: '3 hours ago' },
      { id: 'ACT-INN-2', user: 'Devendra Shinde', action: 'completed hardware test cycle on', target: 'Agrismart Sensor Revision 2.1', timestamp: '6 hours ago' },
      { id: 'ACT-INN-3', user: 'Sayali Mane', action: 'submitted formal application for', target: 'Indian Patent Registry #2026-IN-449', timestamp: 'Yesterday' },
      { id: 'ACT-INN-4', user: 'Nikhil Patil', action: 'published whitepaper on', target: 'Zero-Knowledge Educational Credentials', timestamp: '3 days ago' },
    ],
    accentColor: {
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      cardBorder: 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600',
      cardTint: 'bg-white dark:bg-[#141822]',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900',
      progressBar: 'bg-slate-900 dark:bg-blue-500',
    },
  },

  'ai-it-solutions': {
    id: 'ai-it-solutions',
    name: 'AI IT SOLUTIONS',
    subtitle: 'Enterprise Software & Applied AI Systems',
    description: 'Manage AI solutions, software development and technology projects.',
    stats: [
      { label: 'Total Solutions', value: 16 },
      { label: 'Active Projects', value: 10 },
      { label: 'Technical Employees', value: 32 },
      { label: 'Clients', value: 15 },
      { label: 'Completed Solutions', value: 22 },
    ],
    director: {
      id: 'AWF-EMP-004',
      name: 'Shubham Jadhav',
      role: 'Director of Technology & Accounts',
      department: 'Technical Engineering & Commercial IT',
      email: 'shubham.jadhav@awfishub.in',
      phone: '+91 99870 11928',
      avatar: 'SJ',
      bio: 'Directing full-cycle enterprise software development, proprietary AI agent pipelines, cloud infrastructure scalability, and technology revenue delivery.',
      responsibilities: [
        'Enterprise architecture & multi-tenant cloud infrastructure',
        'Large Language Model fine-tuning & agentic workflows',
        'Client SLA delivery & technology commercial contracts',
        'Technical hiring, code quality governance & security compliance',
      ],
    },
    employees: [
      { id: 'AWF-EMP-008', name: 'Tanvi Patil', role: 'Lead Software Architect', team: 'Core Platform', status: 'Active', activeTasks: 3 },
      { id: 'AWF-EMP-013', name: 'Sneha Shinde', role: 'Full Stack Engineer', team: 'Web Apps', status: 'Active', activeTasks: 4 },
      { id: 'AWF-EMP-025', name: 'Rohan Mehta', role: 'AI / ML Research Engineer', team: 'Intelligence Lab', status: 'Active', activeTasks: 5 },
      { id: 'AWF-EMP-026', name: 'Gaurav Kulkarni', role: 'DevOps & SRE Specialist', team: 'Cloud Infrastructure', status: 'Active', activeTasks: 2 },
      { id: 'AWF-EMP-027', name: 'Ananya Sen', role: 'UI/UX Design Systems Lead', team: 'Product Experience', status: 'Active', activeTasks: 3 },
      { id: 'AWF-EMP-028', name: 'Vikram Rajput', role: 'Senior Backend Engineer', team: 'API Services', status: 'Active', activeTasks: 4 },
    ],
    projects: [
      {
        id: 'PRJ-AIT-301',
        title: 'MindLyft Enterprise ERP 2.0 & AWFIS HUB Core',
        status: 'Active',
        progress: 88,
        lead: 'Tanvi Patil',
        leadId: 'AWF-EMP-008',
        teamCount: 8,
        deadline: '31 Jan 2027',
        description: 'Unified operational workspace with role isolation, automated task allocation, real-time workload telemetry, and financial ledger integration.',
        quotation: { reference: 'QT-AIT-301', amount: '₹12,50,000', status: 'Draft' },
        agreement: { reference: 'AG-AIT-301', status: 'Draft' },
        milestones: [
          { name: 'Core authentication & role-based security layer', completed: true },
          { name: 'Task delegation and workload capacity engine', completed: true },
          { name: 'Founder three-pillar executive command center', completed: true },
          { name: 'Multi-tenant database shard migration', completed: false },
        ],
      },
      {
        id: 'PRJ-AIT-302',
        title: 'OmniChannel AI Support Agent (Client: Apex Health)',
        status: 'Active',
        progress: 92,
        lead: 'Rohan Mehta',
        leadId: 'AWF-EMP-025',
        teamCount: 5,
        deadline: '20 Dec 2026',
        description: 'Autonomous voice and WhatsApp AI agent capable of scheduling appointments, triage intake, and CRM synchronizations for healthcare chains.',
        quotation: { reference: 'QT-AIT-302', amount: '₹8,40,000', status: 'Sent' },
        agreement: { reference: 'AG-AIT-302', status: 'Pending signature' },
        milestones: [
          { name: 'HIPAA-compliant vector knowledge base configuration', completed: true },
          { name: 'Hindi and Marathi bilingual speech recognition model', completed: true },
          { name: 'Live pilot across 4 hospital reception desks', completed: true },
          { name: 'Client sign-off and enterprise retainer agreement', completed: false },
        ],
      },
      {
        id: 'PRJ-AIT-303',
        title: 'Automated Financial Reconciliation & Invoice OCR',
        status: 'Active',
        progress: 70,
        lead: 'Vikram Rajput',
        leadId: 'AWF-EMP-028',
        teamCount: 4,
        deadline: '15 Feb 2027',
        description: 'Document intelligence pipeline processing supplier invoices, matching bank ledger entries, and generating audit-ready balance sheets.',
        quotation: { reference: 'QT-AIT-303', amount: '₹5,60,000', status: 'Approved' },
        agreement: { reference: 'AG-AIT-303', status: 'Signed', signedDate: '12 Nov 2026' },
        milestones: [
          { name: 'Multimodal OCR pipeline with 99.2% key field accuracy', completed: true },
          { name: 'Integration with ICICI Bank corporate webhook APIs', completed: true },
          { name: 'Discrepancy flagger and founder approval workflow', completed: false },
          { name: 'Export to Tally & SAP compliant formats', completed: false },
        ],
      },
      {
        id: 'PRJ-AIT-304',
        title: 'Intelligent Video Proctoring Engine for Online Exams',
        status: 'Completed',
        progress: 100,
        lead: 'Tanvi Patil',
        leadId: 'AWF-EMP-008',
        teamCount: 6,
        deadline: '05 Nov 2026',
        description: 'Browser-based real-time anomaly detection identifying gaze diversion, secondary devices, and audio chatter during university tests.',
        quotation: { reference: 'QT-AIT-304', amount: '₹9,20,000', status: 'Accepted' },
        agreement: { reference: 'AG-AIT-304', status: 'Signed', signedDate: '06 Nov 2026' },
        milestones: [
          { name: 'WebAssembly computer vision model running 45 FPS in browser', completed: true },
          { name: 'Zero-latency websocket alert feed for exam invigilators', completed: true },
          { name: 'Successfully proctored 35,000 engineering student exams', completed: true },
          { name: 'White-label licensing agreement delivered', completed: true },
        ],
      },
    ],
    tasks: [
      { id: 'TSK-AIT-01', title: 'Deploy zero-downtime database migration for CRM tables', assignedTo: 'Gaurav Kulkarni', priority: 'Critical', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-02', title: 'Conduct penetration test on public client API endpoints', assignedTo: 'Sneha Shinde', priority: 'High', dueDate: 'Tomorrow', status: 'In Progress' },
      { id: 'TSK-AIT-03', title: 'Optimize RAG latency for Apex Health clinical search queries', assignedTo: 'Rohan Mehta', priority: 'High', dueDate: '30 Nov 2026', status: 'In Progress' },
      { id: 'TSK-AIT-04', title: 'Submit AWS cloud infrastructure cost optimization audit', assignedTo: 'Gaurav Kulkarni', priority: 'Critical', dueDate: '24 Nov 2026', status: 'Overdue' },
      { id: 'TSK-AIT-05', title: 'Review platform architecture decisions for ERP 2.0', assignedTo: 'Tanvi Patil', priority: 'Critical', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-06', title: 'Approve service boundary changes for core platform', assignedTo: 'Tanvi Patil', priority: 'High', dueDate: '29 Nov 2026', status: 'In Progress' },
      { id: 'TSK-AIT-07', title: 'Prepare engineering release checklist for Core Platform', assignedTo: 'Tanvi Patil', priority: 'Medium', dueDate: '02 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-08', title: 'Harden API gateway authentication and rate limits', assignedTo: 'Sneha Shinde', priority: 'Critical', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-09', title: 'Build client onboarding workflow screens', assignedTo: 'Sneha Shinde', priority: 'Medium', dueDate: '01 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-10', title: 'Resolve regression in learner progress API', assignedTo: 'Sneha Shinde', priority: 'High', dueDate: '03 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-11', title: 'Fine-tune clinical intent classification model', assignedTo: 'Rohan Mehta', priority: 'Critical', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-12', title: 'Evaluate Marathi voice transcription accuracy', assignedTo: 'Rohan Mehta', priority: 'High', dueDate: '29 Nov 2026', status: 'In Progress' },
      { id: 'TSK-AIT-13', title: 'Document model monitoring and drift alerts', assignedTo: 'Rohan Mehta', priority: 'Medium', dueDate: '02 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-14', title: 'Prepare Apex Health pilot performance report', assignedTo: 'Rohan Mehta', priority: 'High', dueDate: '04 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-15', title: 'Create Kubernetes autoscaling runbook', assignedTo: 'Gaurav Kulkarni', priority: 'High', dueDate: '30 Nov 2026', status: 'In Progress' },
      { id: 'TSK-AIT-16', title: 'Refresh observability dashboards for production', assignedTo: 'Ananya Sen', priority: 'High', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-17', title: 'Design accessible settings flow for admin console', assignedTo: 'Ananya Sen', priority: 'Medium', dueDate: '01 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-18', title: 'Review component tokens with product team', assignedTo: 'Ananya Sen', priority: 'Medium', dueDate: '03 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-19', title: 'Implement invoice reconciliation matching rules', assignedTo: 'Vikram Rajput', priority: 'Critical', dueDate: 'Today', status: 'In Progress' },
      { id: 'TSK-AIT-20', title: 'Integrate supplier payment webhook events', assignedTo: 'Vikram Rajput', priority: 'High', dueDate: '30 Nov 2026', status: 'In Progress' },
      { id: 'TSK-AIT-21', title: 'Validate OCR exceptions against finance ledger', assignedTo: 'Vikram Rajput', priority: 'Medium', dueDate: '02 Dec 2026', status: 'In Progress' },
      { id: 'TSK-AIT-22', title: 'Prepare audit export mapping for SAP format', assignedTo: 'Vikram Rajput', priority: 'High', dueDate: '05 Dec 2026', status: 'In Progress' },
    ],
    activities: [
      { id: 'ACT-AIT-1', user: 'Shubham Jadhav', action: 'signed enterprise software retainer with', target: 'Apex Healthcare Systems', timestamp: '1 hour ago' },
      { id: 'ACT-AIT-2', user: 'Tanvi Patil', action: 'merged pull request into staging for', target: 'Founder Pillar Navigation v2.0', timestamp: '4 hours ago' },
      { id: 'ACT-AIT-3', user: 'Rohan Mehta', action: 'achieved 120ms token latency milestone on', target: 'Voice Assistant Speech Pipeline', timestamp: 'Yesterday' },
      { id: 'ACT-AIT-4', user: 'Gaurav Kulkarni', action: 'scaled Kubernetes production cluster to', target: '12 high-memory nodes', timestamp: '2 days ago' },
    ],
    accentColor: {
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeText: 'text-slate-700 dark:text-slate-300',
      cardBorder: 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600',
      cardTint: 'bg-white dark:bg-[#141822]',
      buttonColor: 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900',
      progressBar: 'bg-slate-900 dark:bg-blue-500',
    },
  },
};
