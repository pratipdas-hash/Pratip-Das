import { ResumeData, TemplateSettings } from '../types';

export const initialResume: ResumeData = {
  id: 'resume-default',
  title: 'Senior Software Engineer Resume',
  lastModified: new Date().toISOString(),
  personalInfo: {
    fullName: 'Alexander Wright',
    title: 'Senior Full Stack & Distributed Systems Engineer',
    email: 'alex.wright.dev@email.com',
    phone: '+1 (415) 890-2411',
    location: 'San Francisco, CA (Open to Remote)',
    linkedin: 'linkedin.com/in/alexander-wright',
    github: 'github.com/alexwright',
    website: 'alexwright.codes',
  },
  summary:
    'Results-driven Senior Full Stack Engineer with 7+ years of experience architecting resilient cloud-native platforms, microservices, and high-throughput distributed systems. Spearheaded architectural transformation reducing API response latencies by 42% across 12M monthly active users. Passionate about automated CI/CD pipelines, high ATS keyword precision, and cross-functional team mentorship.',
  experiences: [
    {
      id: 'exp-1',
      role: 'Staff Software Engineer',
      company: 'Apex Cloud Systems',
      location: 'San Francisco, CA',
      startDate: 'Mar 2022',
      endDate: 'Present',
      current: true,
      bullets: [
        {
          id: 'b-1',
          text: 'Architected event-driven microservices architecture using Go, Kafka, and Kubernetes, scaling backend throughput to 45,000 requests/sec with 99.99% uptime SLA.',
        },
        {
          id: 'b-2',
          text: 'Engineered automated multi-region PostgreSQL failover mechanism, reducing mean time to recovery (MTTR) by 68% and mitigating $350K in downtime risk.',
        },
        {
          id: 'b-3',
          text: 'Spearheaded migration of legacy monolith to containerized Docker workloads on AWS EKS, slashing infrastructure cloud expenditures by $140,000 annually.',
        },
        {
          id: 'b-4',
          text: 'Mentored cohort of 8 mid-level engineers in distributed debugging, asynchronous design patterns, and unit test coverage, boosting sprint velocity by 28%.',
        },
      ],
    },
    {
      id: 'exp-2',
      role: 'Senior Full Stack Developer',
      company: 'OmniVerve Analytics',
      location: 'San Jose, CA',
      startDate: 'Jan 2019',
      endDate: 'Feb 2022',
      current: false,
      bullets: [
        {
          id: 'b-5',
          text: 'Developed high-performance telemetry dashboard utilizing React, TypeScript, and WebGL, rendering real-time streaming time-series graphs for 250+ enterprise clients.',
        },
        {
          id: 'b-6',
          text: 'Implemented Redis multi-layer caching layer across critical GraphQL query endpoints, slashing p99 latency from 850ms to 92ms.',
        },
        {
          id: 'b-7',
          text: 'Orchestrated end-to-end CI/CD deployment automation using GitHub Actions and Terraform, accelerating delivery cycles from bi-weekly releases to multiple daily deployments.',
        },
      ],
    },
    {
      id: 'exp-3',
      role: 'Software Engineer',
      company: 'NovaCore Technologies',
      location: 'Austin, TX',
      startDate: 'Jun 2017',
      endDate: 'Dec 2018',
      current: false,
      bullets: [
        {
          id: 'b-8',
          text: 'Built RESTful microservices in Node.js and PostgreSQL processing over $4M daily transaction volume across secure payment processing gateways.',
        },
        {
          id: 'b-9',
          text: 'Authored unit and integration test suites achieving 94% test coverage, cutting production bug incidents by 37% over a 12-month period.',
        },
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science & Applied Mathematics',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2013',
      endDate: '2017',
      gpa: '3.82 / 4.0',
      honors: 'Dean’s Honors List (6 consecutive semesters)',
    },
  ],
  skills: [
    {
      id: 'skill-1',
      category: 'Languages & Runtimes',
      skills: ['TypeScript', 'JavaScript (ES6+)', 'Go (Golang)', 'Python', 'Node.js', 'SQL', 'HTML5/CSS3'],
    },
    {
      id: 'skill-2',
      category: 'Frameworks & Frontend',
      skills: ['React', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL', 'REST APIs', 'Vite'],
    },
    {
      id: 'skill-3',
      category: 'Cloud, DevOps & Databases',
      skills: ['AWS (ECS, EKS, Lambda, S3)', 'Docker', 'Kubernetes', 'Terraform', 'PostgreSQL', 'Redis', 'Kafka', 'CI/CD Pipelines'],
    },
    {
      id: 'skill-4',
      category: 'Architecture & Practices',
      skills: ['Distributed Systems', 'Microservices', 'System Design', 'Agile/Scrum', 'Test-Driven Development (TDD)', 'Site Reliability Engineering'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Chronos Distributed Task Scheduler',
      role: 'Lead Architect & Creator',
      link: 'github.com/alexwright/chronos-scheduler',
      startDate: '2023',
      endDate: '2023',
      techStack: 'Go, Raft Consensus, Redis, gRPC, Docker',
      bullets: [
        {
          id: 'b-10',
          text: 'Engineered fault-tolerant distributed cron scheduler with Raft consensus handling over 100,000 scheduled tasks per minute across clustered nodes.',
        },
        {
          id: 'b-11',
          text: 'Published open-source library featured on GitHub Trending, gathering 1,800+ stars and utilized in production by 35+ tech organizations.',
        },
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: 'Sep 2023',
      credentialId: 'AWS-PSA-99412',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: 'Feb 2022',
    },
  ],
  customSections: [],
  sectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
};

export const sampleJobDescription = `Job Title: Senior / Staff Full Stack Software Engineer (Cloud Infrastructure)
Company: NextGen Financial Cloud
Location: Remote (US)

About the Role:
We are looking for a Senior / Staff Full Stack Software Engineer to build scalable distributed systems and high-impact fintech applications. You will collaborate with product and infrastructure teams to design, build, and deploy resilient cloud-native microservices processing millions of daily transactions.

Requirements & Qualifications:
- 5+ years of software engineering experience building scalable backend microservices and high-performance web applications.
- Strong proficiency in TypeScript, Go (Golang), or Node.js.
- Demonstrated hands-on experience with modern cloud infrastructure: AWS (EKS, Lambda, S3), Docker, and Kubernetes.
- Deep expertise in relational databases (PostgreSQL) and caching strategies (Redis).
- Proven track record with asynchronous event streaming (Apache Kafka or RabbitMQ).
- Solid understanding of CI/CD automation pipelines (GitHub Actions, Terraform, Infrastructure as Code).
- Familiarity with modern frontend development (React, TypeScript, state management).
- Experience leading architectural initiatives, reducing latency, and mentoring junior engineers.
- Strong communication and cross-functional leadership in agile environments.`;

export const defaultTemplateSettings: TemplateSettings = {
  preset: 'classic-executive',
  fontFamily: 'Inter',
  baseFontSize: 13,
  lineHeight: 1.4,
  pageMargin: 15, // mm
  sectionGap: 14, // px
  itemGap: 10, // px
  primaryColor: '#0f172a', // deep navy slate
  textColor: '#1e293b',
  headerStyle: 'underline',
  bulletStyle: 'disc',
  columnLayout: 'single',
  paperSize: 'letter',
  uppercaseHeadings: true,
  showDividers: true,
  highlightKeywords: false,
};
