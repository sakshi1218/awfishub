import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MindLyft AWFIS HUB database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.salesTarget.deleteMany();
  await prisma.salesFollowup.deleteMany();
  await prisma.salesLead.deleteMany();
  await prisma.collegeAgreement.deleteMany();
  await prisma.fDPSession.deleteMany();
  await prisma.collegeVisit.deleteMany();
  await prisma.collegeContact.deleteMany();
  await prisma.college.deleteMany();
  await prisma.meetingActionItem.deleteMany();
  await prisma.meetingParticipant.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.reportingHistory.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  const deptSales = await prisma.department.create({
    data: {
      name: 'Sales & Business Development',
      code: 'SALES_BD',
      description: 'Institutional partnerships, college tie-ups, FDPs, and revenue generation.',
    },
  });

  const deptTech = await prisma.department.create({
    data: {
      name: 'Technology & Development',
      code: 'TECH_DEV',
      description: 'Platform development, EdTech infrastructure, LMS, and internal tools.',
    },
  });

  const deptOps = await prisma.department.create({
    data: {
      name: 'Operations',
      code: 'OPS',
      description: 'Campus program logistics, bootcamps execution, and venue coordination.',
    },
  });

  const deptHR = await prisma.department.create({
    data: {
      name: 'HR & Administration',
      code: 'HR_ADMIN',
      description: 'Talent acquisition, organizational culture, employee benefits, and policy compliance.',
    },
  });

  const deptMktg = await prisma.department.create({
    data: {
      name: 'Marketing',
      code: 'MKTG',
      description: 'Brand awareness, digital campaigns, social media, and college ambassador programs.',
    },
  });

  const deptFin = await prisma.department.create({
    data: {
      name: 'Finance & Accounts',
      code: 'FIN_ACC',
      description: 'Invoicing, institutional agreements billing, payroll, and fiscal audits.',
    },
  });

  const deptTraining = await prisma.department.create({
    data: {
      name: 'Training & Education',
      code: 'TRAIN_EDU',
      description: 'Curriculum design, masterclass delivery, pedagogical research, and faculty upskilling.',
    },
  });

  // 3. Create Employees (Founder -> Directors -> Managers -> Employees)
  
  // FOUNDER
  const founder = await prisma.employee.create({
    data: {
      employeeId: 'ML-F01',
      name: 'Dr. Arvind Sharma',
      email: 'arvind.sharma@mindlyft.in',
      phone: '+91 98200 11001',
      designation: 'Founder & Managing Director',
      role: 'FOUNDER',
      joiningDate: new Date('2022-01-10'),
      status: 'ACTIVE',
      responsibilities: 'Visionary leadership, strategic partnerships, overall company governance and investor relations.',
    },
  });

  // DIRECTORS
  const dirSales = await prisma.employee.create({
    data: {
      employeeId: 'ML-D01',
      name: 'Rajesh Varma',
      email: 'rajesh.varma@mindlyft.in',
      phone: '+91 98200 22002',
      designation: 'Director of Sales & Partnerships',
      role: 'SALES_DIRECTOR',
      departmentId: deptSales.id,
      reportingDirectorId: founder.id,
      joiningDate: new Date('2022-03-01'),
      status: 'ACTIVE',
      responsibilities: 'Driving university MoUs, national college outreach, FDP contracts, and executive revenue pipeline.',
    },
  });

  const dirTech = await prisma.employee.create({
    data: {
      employeeId: 'ML-D02',
      name: 'Priya Nair',
      email: 'priya.nair@mindlyft.in',
      phone: '+91 98200 33003',
      designation: 'Director of Technology & Product',
      role: 'DIRECTOR',
      departmentId: deptTech.id,
      reportingDirectorId: founder.id,
      joiningDate: new Date('2022-04-15'),
      status: 'ACTIVE',
      responsibilities: 'Overseeing engineering teams, scalable cloud infrastructure, AI education platform, and data security.',
    },
  });

  const dirOps = await prisma.employee.create({
    data: {
      employeeId: 'ML-D03',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@mindlyft.in',
      phone: '+91 98200 44004',
      designation: 'Director of Operations & People',
      role: 'DIRECTOR',
      departmentId: deptOps.id,
      reportingDirectorId: founder.id,
      joiningDate: new Date('2022-06-01'),
      status: 'ACTIVE',
      responsibilities: 'Operational excellence, vendor coordination, HR governance, and cross-departmental delivery.',
    },
  });

  // MANAGERS
  const mgrSales = await prisma.employee.create({
    data: {
      employeeId: 'ML-M01',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@mindlyft.in',
      phone: '+91 98200 55005',
      designation: 'Senior Sales Manager',
      role: 'MANAGER',
      departmentId: deptSales.id,
      reportingManagerId: dirSales.id,
      reportingDirectorId: dirSales.id,
      joiningDate: new Date('2023-01-15'),
      status: 'ACTIVE',
      responsibilities: 'Managing West & South zone college sales teams, lead assignments, daily review meetings, and MoUs closure.',
    },
  });

  const mgrTech = await prisma.employee.create({
    data: {
      employeeId: 'ML-M02',
      name: 'Rohit Verma',
      email: 'rohit.verma@mindlyft.in',
      phone: '+91 98200 66006',
      designation: 'Engineering Manager & Tech Lead',
      role: 'MANAGER',
      departmentId: deptTech.id,
      reportingManagerId: dirTech.id,
      reportingDirectorId: dirTech.id,
      joiningDate: new Date('2023-02-10'),
      status: 'ACTIVE',
      responsibilities: 'Sprint planning, code review standards, tech mentoring, and product release architecture.',
    },
  });

  const mgrHR = await prisma.employee.create({
    data: {
      employeeId: 'ML-M03',
      name: 'Sneha Kapoor',
      email: 'sneha.kapoor@mindlyft.in',
      phone: '+91 98200 77007',
      designation: 'HR & Administrative Manager',
      role: 'MANAGER',
      departmentId: deptHR.id,
      reportingManagerId: dirOps.id,
      reportingDirectorId: dirOps.id,
      joiningDate: new Date('2023-03-01'),
      status: 'ACTIVE',
      responsibilities: 'Talent management, leave tracking, monthly payroll approvals, employee satisfaction, and onboarding.',
    },
  });

  // EMPLOYEES
  const empSales1 = await prisma.employee.create({
    data: {
      employeeId: 'ML-E01',
      name: 'Amit Patel',
      email: 'amit.patel@mindlyft.in',
      phone: '+91 98200 88008',
      designation: 'Senior Business Development Executive',
      role: 'SALES_EMPLOYEE',
      departmentId: deptSales.id,
      reportingManagerId: mgrSales.id,
      reportingDirectorId: dirSales.id,
      joiningDate: new Date('2023-06-15'),
      status: 'ACTIVE',
      responsibilities: 'Direct campus visits, institutional Dean meetings, FDP scheduling, and CRM pipeline progression.',
    },
  });

  const empSales2 = await prisma.employee.create({
    data: {
      employeeId: 'ML-E02',
      name: 'Rohan Sen',
      email: 'rohan.sen@mindlyft.in',
      phone: '+91 98200 88009',
      designation: 'Institutional Sales Associate',
      role: 'SALES_EMPLOYEE',
      departmentId: deptSales.id,
      reportingManagerId: mgrSales.id,
      reportingDirectorId: dirSales.id,
      joiningDate: new Date('2023-08-01'),
      status: 'ACTIVE',
      responsibilities: 'Lead prospecting, cold outreach to colleges in Maharashtra & Gujarat, visit follow-ups, and documentation.',
    },
  });

  const empTech1 = await prisma.employee.create({
    data: {
      employeeId: 'ML-E03',
      name: 'Neha Gupta',
      email: 'neha.gupta@mindlyft.in',
      phone: '+91 98200 88010',
      designation: 'Full Stack Software Engineer',
      role: 'EMPLOYEE',
      departmentId: deptTech.id,
      reportingManagerId: mgrTech.id,
      reportingDirectorId: dirTech.id,
      joiningDate: new Date('2023-07-01'),
      status: 'ACTIVE',
      responsibilities: 'Frontend Next.js modules, Prisma database queries, REST API development, and UI responsiveness.',
    },
  });

  const empOps1 = await prisma.employee.create({
    data: {
      employeeId: 'ML-E04',
      name: 'Devanshi Shah',
      email: 'devanshi.shah@mindlyft.in',
      phone: '+91 98200 88011',
      designation: 'Operations & Event Specialist',
      role: 'EMPLOYEE',
      departmentId: deptOps.id,
      reportingManagerId: dirOps.id,
      reportingDirectorId: dirOps.id,
      joiningDate: new Date('2023-09-15'),
      status: 'ACTIVE',
      responsibilities: 'Bootcamp schedule tracking, college lab hardware logistics, trainer travel, and student certificate issuance.',
    },
  });

  const empTrain1 = await prisma.employee.create({
    data: {
      employeeId: 'ML-E05',
      name: 'Tanmay Joshi',
      email: 'tanmay.joshi@mindlyft.in',
      phone: '+91 98200 88012',
      designation: 'Senior Lead Trainer & Curriculum Specialist',
      role: 'EMPLOYEE',
      departmentId: deptTraining.id,
      reportingManagerId: dirSales.id,
      reportingDirectorId: dirSales.id,
      joiningDate: new Date('2023-05-10'),
      status: 'ACTIVE',
      responsibilities: 'Conducting high-impact Faculty Development Programs (FDPs), Python/AI student masterclasses, and syllabus design.',
    },
  });

  // 4. Create Colleges
  const colVJTI = await prisma.college.create({
    data: {
      name: 'Veermata Jijabai Technological Institute (VJTI)',
      code: 'VJTI-MUM',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'H. R. Mahajani Rd, Matunga, Mumbai, Maharashtra 400019',
      website: 'https://vjti.ac.in',
      tier: 'TIER_1',
      type: 'ENGINEERING',
      status: 'ACTIVE',
      notes: 'Prestigious engineering institute. High interest in advanced AI & Full Stack curriculum integration.',
      contacts: {
        create: [
          {
            name: 'Dr. Sudhir Agashe',
            designation: 'Dean - Academic Affairs',
            department: 'Computer Science',
            phone: '+91 98111 22334',
            email: 'dean.acad@vjti.ac.in',
            isPrimary: true,
          },
          {
            name: 'Prof. Ramesh Kulkarni',
            designation: 'Head of Training & Placement Cell',
            department: 'Placements',
            phone: '+91 98111 22335',
            email: 'tpc@vjti.ac.in',
            isPrimary: false,
          },
        ],
      },
    },
  });

  const colCOEP = await prisma.college.create({
    data: {
      name: 'COEP Technological University',
      code: 'COEP-PUN',
      state: 'Maharashtra',
      city: 'Pune',
      address: 'Wellesley Rd, Shivajinagar, Pune, Maharashtra 411005',
      website: 'https://coeptech.ac.in',
      tier: 'TIER_1',
      type: 'ENGINEERING',
      status: 'ACTIVE',
      notes: 'Autonomous unitary state university. Existing active training partner since Jan 2025.',
      contacts: {
        create: [
          {
            name: 'Dr. Sunita Jahagirdar',
            designation: 'Director of Industry Relations',
            department: 'Corporate Relations',
            phone: '+91 98222 33445',
            email: 'industry.liaison@coep.ac.in',
            isPrimary: true,
          },
        ],
      },
    },
  });

  const colNMIMS = await prisma.college.create({
    data: {
      name: 'NMIMS Mukesh Patel School of Technology (MPSTME)',
      code: 'NMIMS-MPSTME',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'V. L. Mehta Road, Vile Parle West, Mumbai 400056',
      website: 'https://engineering.nmims.edu',
      tier: 'TIER_1',
      type: 'ENGINEERING',
      status: 'ACTIVE',
      notes: 'Interested in AI/ML corporate certification programs for 3rd and 4th year B.Tech students.',
      contacts: {
        create: [
          {
            name: 'Dr. Alka Mahajan',
            designation: 'Dean & Professor',
            department: 'Executive Office',
            phone: '+91 98333 44556',
            email: 'dean.mpstme@nmims.edu',
            isPrimary: true,
          },
        ],
      },
    },
  });

  const colSPIT = await prisma.college.create({
    data: {
      name: 'Sardar Patel Institute of Technology (SPIT)',
      code: 'SPIT-MUM',
      state: 'Maharashtra',
      city: 'Mumbai',
      address: 'Bhavans Campus, Munshi Nagar, Andheri West, Mumbai 400058',
      website: 'https://spit.ac.in',
      tier: 'TIER_1',
      type: 'ENGINEERING',
      status: 'ACTIVE',
      notes: 'High faculty engagement in technical upskilling. FDP session scheduled.',
      contacts: {
        create: [
          {
            name: 'Dr. Bhalchandra Chaudhari',
            designation: 'Principal',
            department: 'Administration',
            phone: '+91 98444 55667',
            email: 'principal@spit.ac.in',
            isPrimary: true,
          },
        ],
      },
    },
  });

  const colMITWPU = await prisma.college.create({
    data: {
      name: 'MIT World Peace University (MIT-WPU)',
      code: 'MIT-PUN',
      state: 'Maharashtra',
      city: 'Pune',
      address: 'Paud Road, Kothrud, Pune, Maharashtra 411038',
      website: 'https://mitwpu.edu.in',
      tier: 'TIER_2',
      type: 'UNIVERSITY',
      status: 'ACTIVE',
      notes: 'Signed FDP agreement expiring in 15 days. Need renewal discussion.',
      contacts: {
        create: [
          {
            name: 'Prof. Milind Pande',
            designation: 'Pro Vice Chancellor',
            department: 'Academic Partnerships',
            phone: '+91 98555 66778',
            email: 'provost@mitwpu.edu.in',
            isPrimary: true,
          },
        ],
      },
    },
  });

  // 5. College Visits
  await prisma.collegeVisit.create({
    data: {
      collegeId: colVJTI.id,
      visitedById: empSales1.id,
      visitDate: new Date('2026-11-20'),
      contactPersonName: 'Dr. Sudhir Agashe',
      contactDesignation: 'Dean - Academic Affairs',
      contactPhone: '+91 98111 22334',
      contactEmail: 'dean.acad@vjti.ac.in',
      purpose: 'MoU Discussion for 2026 Campus Training Program & Faculty Upskilling',
      discussionDetails: 'Presented MindLyft curriculum on Generative AI, Cloud Native Engineering, and Cyber Defense. Dean was very positive about enrolling 240 computer and IT engineering students.',
      outcome: 'POSITIVE',
      interestLevel: 'HIGH',
      nextFollowupDate: new Date('2026-11-28'),
      status: 'COMPLETED',
    },
  });

  await prisma.collegeVisit.create({
    data: {
      collegeId: colNMIMS.id,
      visitedById: empSales2.id,
      visitDate: new Date('2026-11-22'),
      contactPersonName: 'Dr. Alka Mahajan',
      contactDesignation: 'Dean & Professor',
      contactPhone: '+91 98333 44556',
      contactEmail: 'dean.mpstme@nmims.edu',
      purpose: 'Pitch MindLyft Industry 4.0 Lab Setup and Certifications',
      discussionDetails: 'Shared brochure and sample case studies. They requested a formal financial commercial proposal for 180 seats.',
      outcome: 'FOLLOWUP_REQUIRED',
      interestLevel: 'HIGH',
      nextFollowupDate: new Date('2026-11-29'),
      status: 'COMPLETED',
    },
  });

  await prisma.collegeVisit.create({
    data: {
      collegeId: colSPIT.id,
      visitedById: empSales1.id,
      visitDate: new Date('2026-11-24'),
      contactPersonName: 'Dr. Bhalchandra Chaudhari',
      contactDesignation: 'Principal',
      contactPhone: '+91 98444 55667',
      contactEmail: 'principal@spit.ac.in',
      purpose: 'FDP Schedule Confirmation and Hands-on Lab Environment Verification',
      discussionDetails: 'Verified college computer center with 75 terminals. Internet bandwidth test passed. Finalized dates for next week.',
      outcome: 'POSITIVE',
      interestLevel: 'HIGH',
      nextFollowupDate: new Date('2026-12-02'),
      status: 'COMPLETED',
    },
  });

  // 6. FDP Sessions
  await prisma.fDPSession.create({
    data: {
      collegeId: colVJTI.id,
      topic: 'Hands-on Generative AI & LLM Architecture for Engineering Faculty',
      sessionDate: new Date('2026-11-15'),
      trainerName: 'Tanmay Joshi',
      trainerEmployeeId: empTrain1.id,
      participantsCount: 65,
      durationHours: 6.0,
      attendanceDetails: '65 faculty members attended across CS, IT, and Electronics departments.',
      feedbackSummary: 'Rated 4.85/5.0. Praised practical prompt engineering and fine-tuning exercises.',
      certificatesIssuedCount: 65,
      status: 'COMPLETED',
    },
  });

  await prisma.fDPSession.create({
    data: {
      collegeId: colCOEP.id,
      topic: 'Cloud Microservices, Kubernetes & CI/CD Pipelines in Production',
      sessionDate: new Date('2026-11-10'),
      trainerName: 'Tanmay Joshi',
      trainerEmployeeId: empTrain1.id,
      participantsCount: 48,
      durationHours: 5.0,
      attendanceDetails: '48 participants attended including 5 department heads.',
      feedbackSummary: 'Rated 4.9/5.0. Requested an advanced 2-day workshop next semester.',
      certificatesIssuedCount: 48,
      status: 'COMPLETED',
    },
  });

  await prisma.fDPSession.create({
    data: {
      collegeId: colSPIT.id,
      topic: 'Modern Web Frameworks & Full-Stack Cloud Architecture',
      sessionDate: new Date('2026-12-04'),
      trainerName: 'Tanmay Joshi',
      trainerEmployeeId: empTrain1.id,
      participantsCount: 60,
      durationHours: 4.0,
      status: 'PLANNED',
    },
  });

  // 7. College Agreements (with expiry tracking)
  await prisma.collegeAgreement.create({
    data: {
      collegeId: colCOEP.id,
      agreementType: 'TRAINING_PARTNERSHIP',
      signingDate: new Date('2025-01-15'),
      validityMonths: 24,
      expiryDate: new Date('2027-01-14'),
      authorizedSignatoryMindLyft: 'Dr. Arvind Sharma (Founder)',
      authorizedSignatoryCollege: 'Dr. Sunita Jahagirdar',
      agreementStatus: 'ACTIVE',
      documentUrl: '/agreements/COEP_MindLyft_Partnership_2025.pdf',
      notes: 'Active institutional partner. Comprehensive student training contract.',
    },
  });

  await prisma.collegeAgreement.create({
    data: {
      collegeId: colVJTI.id,
      agreementType: 'MOU',
      signingDate: new Date('2025-11-20'),
      validityMonths: 12,
      expiryDate: new Date('2026-11-19'), // Expired recently or renewal
      authorizedSignatoryMindLyft: 'Rajesh Varma (Director)',
      authorizedSignatoryCollege: 'Dr. Sudhir Agashe',
      agreementStatus: 'RENEWED',
      documentUrl: '/agreements/VJTI_MoU_Renewed_2026.pdf',
      renewalDate: new Date('2026-11-20'),
      notes: 'Renewal under processing following successful FDP program.',
    },
  });

  await prisma.collegeAgreement.create({
    data: {
      collegeId: colMITWPU.id,
      agreementType: 'FDP_AGREEMENT',
      signingDate: new Date('2025-12-10'),
      validityMonths: 12,
      expiryDate: new Date('2026-12-10'), // Expiring in 15 days!
      authorizedSignatoryMindLyft: 'Rajesh Varma (Director)',
      authorizedSignatoryCollege: 'Prof. Milind Pande',
      agreementStatus: 'EXPIRING_SOON',
      documentUrl: '/agreements/MIT_WPU_FDP_2025.pdf',
      notes: 'Expires in less than 3 weeks. Urgent renewal notice sent by Sales Team.',
    },
  });

  // 8. CRM Leads & Pipeline (8 Stages)
  await prisma.salesLead.create({
    data: {
      collegeId: colNMIMS.id,
      clientName: 'NMIMS MPSTME Mumbai',
      contactPerson: 'Dr. Alka Mahajan',
      phone: '+91 98333 44556',
      email: 'dean.mpstme@nmims.edu',
      interestedService: 'CAMPUS_TRAINING',
      leadSource: 'COLLEGE_VISIT',
      assignedToId: empSales2.id,
      interestLevel: 'HIGH',
      estimatedDealValue: 750000,
      currentStage: 'PROPOSAL_SENT',
      notes: 'Proposal sent for 180 seats @ Rs. 4,166/student. Awaiting finance committee approval.',
      followups: {
        create: [
          {
            conductedById: empSales2.id,
            followupDate: new Date('2026-11-23'),
            interactionType: 'EMAIL',
            summary: 'Submitted customized proposal with detailed weekly syllabus breakdown.',
            outcome: 'POSITIVE',
            nextFollowupDate: new Date('2026-11-29'),
          },
        ],
      },
    },
  });

  await prisma.salesLead.create({
    data: {
      collegeId: colVJTI.id,
      clientName: 'VJTI Computer Science Dept',
      contactPerson: 'Dr. Sudhir Agashe',
      phone: '+91 98111 22334',
      email: 'dean.acad@vjti.ac.in',
      interestedService: 'WORKSHOPS',
      leadSource: 'REFERRAL',
      assignedToId: empSales1.id,
      interestLevel: 'HIGH',
      estimatedDealValue: 480000,
      currentStage: 'NEGOTIATION',
      notes: 'Negotiating final trainer schedule and hardware prerequisites.',
      followups: {
        create: [
          {
            conductedById: empSales1.id,
            followupDate: new Date('2026-11-21'),
            interactionType: 'IN_PERSON',
            summary: 'Met HOD to finalize dates and batch distribution (3 batches of 40 students).',
            outcome: 'POSITIVE',
            nextFollowupDate: new Date('2026-11-28'),
          },
        ],
      },
    },
  });

  await prisma.salesLead.create({
    data: {
      clientName: 'Symbiosis Institute of Technology (SIT Pune)',
      contactPerson: 'Dr. Ketan Kotecha',
      phone: '+91 98230 77889',
      email: 'director@sitpune.edu.in',
      interestedService: 'FDP',
      leadSource: 'COLD_CALL',
      assignedToId: empSales1.id,
      interestLevel: 'MEDIUM',
      estimatedDealValue: 320000,
      currentStage: 'MEETING_SCHEDULED',
      nextFollowupDate: new Date('2026-11-27'),
      notes: 'Online demo meeting booked for Friday 3 PM with Academic Council.',
    },
  });

  await prisma.salesLead.create({
    data: {
      collegeId: colCOEP.id,
      clientName: 'COEP Tech University 2026 Batch',
      contactPerson: 'Dr. Sunita Jahagirdar',
      phone: '+91 98222 33445',
      email: 'industry.liaison@coep.ac.in',
      interestedService: 'CAMPUS_TRAINING',
      leadSource: 'COLLEGE_VISIT',
      assignedToId: empSales1.id,
      interestLevel: 'HIGH',
      estimatedDealValue: 1200000,
      currentStage: 'CONVERTED',
      notes: 'Deal closed! Training starts Jan 2027.',
    },
  });

  await prisma.salesLead.create({
    data: {
      clientName: 'D. Y. Patil International University',
      contactPerson: 'Prof. Sandeep Shinde',
      phone: '+91 98900 12345',
      email: 'placements@dypiu.ac.in',
      interestedService: 'CERTIFICATION',
      leadSource: 'WEBSITE',
      assignedToId: empSales2.id,
      interestLevel: 'LOW',
      estimatedDealValue: 250000,
      currentStage: 'LOST',
      lostReason: 'Budget constraints; deferred to next academic year.',
      notes: 'Kept on warm nurturing list for March 2027.',
    },
  });

  // 9. Sales Targets
  await prisma.salesTarget.create({
    data: {
      departmentId: deptSales.id,
      month: 11,
      year: 2026,
      targetVisits: 30,
      achievedVisits: 22,
      targetFDPs: 6,
      achievedFDPs: 4,
      targetAgreements: 5,
      achievedAgreements: 3,
      targetRevenue: 1500000,
      achievedRevenue: 1120000,
    },
  });

  await prisma.salesTarget.create({
    data: {
      employeeId: empSales1.id,
      month: 11,
      year: 2026,
      targetVisits: 15,
      achievedVisits: 12,
      targetFDPs: 3,
      achievedFDPs: 2,
      targetAgreements: 3,
      achievedAgreements: 2,
      targetRevenue: 800000,
      achievedRevenue: 650000,
    },
  });

  // 10. Tasks Management
  const task1 = await prisma.task.create({
    data: {
      taskId: 'TSK-1001',
      title: 'Finalize and Sign MoU with VJTI Mumbai for 2026 AI Campus Training',
      description: 'Review legal terms, verify indemnity clauses, and ensure signatories schedule for MoU signing ceremony.',
      departmentId: deptSales.id,
      assignedById: dirSales.id,
      assignedToId: empSales1.id,
      priority: 'CRITICAL',
      startDate: new Date('2026-11-18'),
      deadline: new Date('2026-11-28'),
      status: 'IN_PROGRESS',
      progressPercentage: 70,
      approvalStatus: 'PENDING',
      comments: {
        create: [
          {
            authorId: dirSales.id,
            content: 'Please ensure Dean Agashe has approved the lab schedule before the final sign-off.',
          },
          {
            authorId: empSales1.id,
            content: 'Lab schedule is verified and stamped. Proceeding with draft contract printout.',
          },
        ],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      taskId: 'TSK-1002',
      title: 'Implement Interactive Organizational Hierarchy Tree in AWFIS HUB',
      description: 'Build responsive zoomable node tree visualization mapping Founder down to Employees with profile peek flyout.',
      departmentId: deptTech.id,
      assignedById: mgrTech.id,
      assignedToId: empTech1.id,
      priority: 'HIGH',
      startDate: new Date('2026-11-20'),
      deadline: new Date('2026-11-26'),
      status: 'SUBMITTED_FOR_REVIEW',
      progressPercentage: 90,
      approvalStatus: 'PENDING',
      comments: {
        create: [
          {
            authorId: empTech1.id,
            content: 'Tree hierarchy with responsive SVG connectors and role badge indicators is ready for QA review.',
          },
        ],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      taskId: 'TSK-1003',
      title: 'Prepare FDP Training Kit & Jupyter Notebooks for Pune Engineering Colleges',
      description: 'Package containerized Colab links, sample datasets, and step-by-step slides for Faculty Development Program.',
      departmentId: deptTraining.id,
      assignedById: dirSales.id,
      assignedToId: empTrain1.id,
      priority: 'HIGH',
      startDate: new Date('2026-11-15'),
      deadline: new Date('2026-11-22'),
      status: 'COMPLETED',
      progressPercentage: 100,
      approvalStatus: 'APPROVED',
      completedAt: new Date('2026-11-22'),
      approvalComments: 'Excellent work. Comprehensive notebooks with zero dependencies.',
    },
  });

  const task4 = await prisma.task.create({
    data: {
      taskId: 'TSK-1004',
      title: 'Company-Wide Performance Appraisal Review Form Rollout',
      description: 'Set up Q4 appraisal criteria, self-evaluation rubric, and manager 360-feedback deadlines.',
      departmentId: deptHR.id,
      assignedById: founder.id,
      assignedToId: mgrHR.id,
      priority: 'MEDIUM',
      startDate: new Date('2026-11-22'),
      deadline: new Date('2026-12-05'),
      status: 'IN_PROGRESS',
      progressPercentage: 40,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      taskId: 'TSK-1005',
      title: 'Coordinate Logistics & Hardware Lab for SPIT Hands-on Session',
      description: 'Confirm projector setup, WiFi credentials for 75 systems, and participant badge lanyards.',
      departmentId: deptOps.id,
      assignedById: dirOps.id,
      assignedToId: empOps1.id,
      priority: 'HIGH',
      startDate: new Date('2026-11-23'),
      deadline: new Date('2026-12-01'),
      status: 'IN_PROGRESS',
      progressPercentage: 50,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      taskId: 'TSK-1006',
      title: 'Prepare Strategic University Expansion Pitch Deck for Board Meeting',
      description: 'Consolidate 2026 revenue projections, top 20 target engineering colleges, and unit economics.',
      departmentId: deptSales.id,
      assignedById: dirSales.id,
      assignedToId: dirSales.id, // Self-assigned task by Director!
      priority: 'CRITICAL',
      startDate: new Date('2026-11-24'),
      deadline: new Date('2026-11-30'),
      status: 'IN_PROGRESS',
      progressPercentage: 60,
    },
  });

  // 11. Daily Work Reports
  const todayStr = '2026-11-25';
  const yesterdayStr = '2026-11-24';

  await prisma.dailyReport.create({
    data: {
      employeeId: empSales1.id,
      reportDate: todayStr,
      tasksWorkedOn: JSON.stringify(['TSK-1001: VJTI MoU Finalization', 'Follow-up calls with SPIT Principal']),
      tasksCompleted: JSON.stringify(['Verified lab hardware specs with VJTI IT Dept']),
      tasksPending: JSON.stringify(['Physical agreement signing pending Dean schedule']),
      timeSpentHours: 8.5,
      workDescription: 'Conducted morning conference call with VJTI Academic Dean. Verified all 5 annexures of the MoU. Prepared pricing breakdown for 3 batches. Logged visit details in CRM.',
      challengesFaced: 'College legal counsel requested a minor clause tweak on intellectual property rights for student capstones.',
      planForTomorrow: 'Deliver signed hardcopy to VJTI campus and follow up with SIT Pune for Friday demo.',
      status: 'SUBMITTED',
    },
  });

  await prisma.dailyReport.create({
    data: {
      employeeId: empTech1.id,
      reportDate: todayStr,
      tasksWorkedOn: JSON.stringify(['TSK-1002: Hierarchy Tree & Role Dashboards']),
      tasksCompleted: JSON.stringify(['Integrated Prisma SQLite models and REST API endpoints']),
      tasksPending: JSON.stringify(['Mobile responsive test on smaller tablet screens']),
      timeSpentHours: 8.0,
      workDescription: 'Implemented interactive company hierarchy viewer with drill-down modals, department filters, and seamless role switcher.',
      challengesFaced: 'SVG curve rendering on dynamic hierarchy resizing needed responsive SVG bounding boxes.',
      planForTomorrow: 'Add PDF export generator and wire up real-time in-app notification toasts.',
      status: 'REVIEWED',
      reviewComments: 'Great velocity! Clean code structure.',
      reviewedById: mgrTech.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.dailyReport.create({
    data: {
      employeeId: empOps1.id,
      reportDate: todayStr,
      tasksWorkedOn: JSON.stringify(['TSK-1005: SPIT Logistics & Event badges']),
      tasksCompleted: JSON.stringify(['Printed 75 participant badges and certificates']),
      tasksPending: JSON.stringify(['Courier tracking for hardware microcontroller kits']),
      timeSpentHours: 7.5,
      workDescription: 'Coordinated with courier partner for timely dispatch of 15 IoT experiment kits to SPIT Mumbai campus.',
      challengesFaced: 'None today.',
      planForTomorrow: 'Receive lab confirmation from SPIT lab technician.',
      status: 'SUBMITTED',
    },
  });

  // Yesterday's reports for historical trends
  await prisma.dailyReport.create({
    data: {
      employeeId: empSales1.id,
      reportDate: yesterdayStr,
      tasksWorkedOn: JSON.stringify(['In-person visit to SPIT Mumbai']),
      tasksCompleted: JSON.stringify(['Completed campus visit & inspected computer lab']),
      tasksPending: JSON.stringify(['Submit visit report']),
      timeSpentHours: 9.0,
      workDescription: 'Visited SPIT Andheri campus. Had productive 45 min discussion with Principal Dr. Bhalchandra Chaudhari.',
      planForTomorrow: 'Draft MoU for VJTI and follow up with NMIMS.',
      status: 'REVIEWED',
      reviewComments: 'Good outcome. Follow up actively on next steps.',
      reviewedById: mgrSales.id,
      reviewedAt: new Date('2026-11-24T18:30:00'),
    },
  });

  // 12. Meetings & Sessions
  const meetFounder = await prisma.meeting.create({
    data: {
      title: 'MindLyft Monthly Leadership & Executive Review',
      meetingType: 'FOUNDER_REVIEW',
      agenda: 'Review Q4 growth metrics, department KPIs, institutional pipeline expansion, and 2027 hiring roadmap.',
      scheduledAt: new Date('2026-11-25T15:00:00'),
      durationMinutes: 60,
      locationOrLink: 'Executive Boardroom & Zoom',
      hostId: founder.id,
      status: 'SCHEDULED',
      participants: {
        create: [
          { employeeId: founder.id, attendanceStatus: 'ATTENDED' },
          { employeeId: dirSales.id, attendanceStatus: 'INVITED' },
          { employeeId: dirTech.id, attendanceStatus: 'INVITED' },
          { employeeId: dirOps.id, attendanceStatus: 'INVITED' },
        ],
      },
      actionItems: {
        create: [
          {
            title: 'Prepare updated college conversion forecast for West Zone',
            assignedToId: dirSales.id,
            deadline: new Date('2026-11-28'),
            status: 'IN_PROGRESS',
          },
          {
            title: 'Benchmark server infrastructure costs for 10,000 concurrent LMS users',
            assignedToId: dirTech.id,
            deadline: new Date('2026-11-30'),
            status: 'PENDING',
          },
        ],
      },
    },
  });

  const meetSalesSync = await prisma.meeting.create({
    data: {
      title: 'Sales & College Partnerships Weekly Review',
      meetingType: 'DIRECTOR_REVIEW',
      agenda: 'Review campus visits from past 7 days, MoU pending sign-offs, and upcoming FDP sessions.',
      scheduledAt: new Date('2026-11-25T11:00:00'),
      durationMinutes: 45,
      locationOrLink: 'Sales Meeting Room 201',
      hostId: dirSales.id,
      status: 'COMPLETED',
      notes: 'Reviewed 5 active college leads. VJTI MoU close to completion. MIT-WPU agreement renewal requires urgent follow-up before expiry.',
      decisions: '1. Fast-track VJTI MoU.\n2. Rohan Sen to contact MIT-WPU Academic office tomorrow morning.',
      participants: {
        create: [
          { employeeId: dirSales.id, attendanceStatus: 'ATTENDED' },
          { employeeId: mgrSales.id, attendanceStatus: 'ATTENDED' },
          { employeeId: empSales1.id, attendanceStatus: 'ATTENDED' },
          { employeeId: empSales2.id, attendanceStatus: 'ATTENDED' },
        ],
      },
    },
  });

  // 13. Attendance & Leave
  const employeesList = [founder, dirSales, dirTech, dirOps, mgrSales, mgrTech, mgrHR, empSales1, empSales2, empTech1, empOps1, empTrain1];
  
  for (const emp of employeesList) {
    await prisma.attendance.create({
      data: {
        employeeId: emp.id,
        date: todayStr,
        checkInTime: new Date('2026-11-25T09:15:00'),
        status: emp.employeeId === 'ML-E02' ? 'LATE' : 'PRESENT',
        workHours: 8.5,
        location: 'MindLyft Corporate HQ, Mumbai',
      },
    });
  }

  // Leave Request
  await prisma.leaveRequest.create({
    data: {
      leaveNumber: 'LV-2026-008',
      employeeId: empTech1.id,
      leaveType: 'CASUAL',
      startDate: new Date('2026-11-28'),
      endDate: new Date('2026-11-29'),
      totalDays: 2,
      reason: 'Attending family wedding ceremony in Ahmedabad.',
      status: 'PENDING',
    },
  });

  await prisma.leaveRequest.create({
    data: {
      leaveNumber: 'LV-2026-004',
      employeeId: empSales2.id,
      leaveType: 'SICK',
      startDate: new Date('2026-11-12'),
      endDate: new Date('2026-11-12'),
      totalDays: 1,
      reason: 'Fever and viral infection.',
      status: 'APPROVED',
      approvedById: mgrSales.id,
      approvedAt: new Date('2026-11-12T10:00:00'),
    },
  });

  // 14. Notifications
  await prisma.notification.create({
    data: {
      recipientId: founder.id,
      title: 'Executive Leadership Review at 3:00 PM',
      message: 'Monthly leadership review meeting with Directors is scheduled today at 3:00 PM.',
      type: 'MEETING',
      linkUrl: '/meetings',
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: dirSales.id,
      title: 'Urgent: MIT-WPU Agreement Expiring in 15 Days',
      message: 'The FDP Agreement with MIT World Peace University expires on 10 Dec 2026. Action required for renewal.',
      type: 'AGREEMENT',
      linkUrl: '/sales/agreements',
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: empSales1.id,
      title: 'New Task Assignment: TSK-1001',
      message: 'Rajesh Varma assigned you a critical task: Finalize and Sign MoU with VJTI Mumbai.',
      type: 'TASK',
      linkUrl: '/tasks',
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: mgrSales.id,
      title: 'Daily Report Submitted by Amit Patel',
      message: 'Amit Patel has submitted his daily work report for 25 Nov 2026.',
      type: 'REPORT',
      linkUrl: '/daily-reports',
    },
  });

  await prisma.notification.create({
    data: {
      recipientId: mgrHR.id,
      title: 'New Leave Request from Neha Gupta',
      message: 'Neha Gupta applied for 2 days Casual Leave (28-29 Nov). Pending approval.',
      type: 'LEAVE',
      linkUrl: '/attendance',
    },
  });

  console.log('Seeding completed successfully with rich MindLyft operational data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
