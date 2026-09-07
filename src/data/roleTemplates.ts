import { RoleTemplateConfig, TemplateSettings, SectionId } from '../types';

export const ROLE_CATEGORIES = [
  'Tech & Software',
  'Finance & Banking',
  'Healthcare & Medicine',
  'Legal & Compliance',
  'Creative & Design',
  'Product & Project',
  'Sales & Marketing',
  'Executive & Leadership',
  'Academic & Research',
  'Operations & Logistics',
  'Entry-Level & Students',
] as const;

export const PRESET_ROLE_TEMPLATES: RoleTemplateConfig[] = [
  {
    roleTitle: 'Software & DevOps Engineer',
    category: 'Tech & Software',
    description: 'High technical data density with prominent tech stack highlighting and left-accent section dividers.',
    rationale:
      'Engineering screeners and ATS parsers scan for programming languages and frameworks within the first 6 seconds. Clean sans-serif typography with high contrast and structured skill categorization ensures 100% keyword parsing.',
    keyTips: [
      'Position technical skills and GitHub / live project links near the top for rapid recruiter indexing.',
      'Use quantitative engineering metrics (e.g., latency reduction, test coverage %, throughput).',
      'Format bullets using the XYZ framework: Accomplished [X] measured by [Y] by doing [Z].',
    ],
    recommendedSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Inter',
      baseFontSize: 12.5,
      lineHeight: 1.4,
      pageMargin: 13,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#0f766e', // Tech Teal
      textColor: '#0f172a',
      headerStyle: 'left-accent',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Software & DevOps Engineer',
    },
  },
  {
    roleTitle: 'Data Scientist & AI / ML Engineer',
    category: 'Tech & Software',
    description: 'Analytical layout emphasizing modeling libraries, algorithms, quantitative experiments, and research projects.',
    rationale:
      'AI and Data Science hiring managers evaluate both production engineering and mathematical rigor. Monospace-touched sans typography with structured project outcomes showcases model accuracy and business impact.',
    keyTips: [
      'Group skills into Machine Learning, Big Data, Cloud / MLOps, and Programming.',
      'Cite quantifiable metrics: AUC-ROC improvements, cost reductions, model inference latency, and revenue uplift.',
      'Link your Kaggle, ArXiv papers, or GitHub repositories directly.',
    ],
    recommendedSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Plus Jakarta Sans',
      baseFontSize: 12.5,
      lineHeight: 1.42,
      pageMargin: 14,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#1d4ed8', // AI Cobalt
      textColor: '#0f172a',
      headerStyle: 'left-accent',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Data Scientist & AI / ML Engineer',
    },
  },
  {
    roleTitle: 'Investment Banker & Private Equity',
    category: 'Finance & Banking',
    description: 'Conservative Wall Street aesthetic with compact data density, formal serif typography, and strict chronological deal flow.',
    rationale:
      'Top financial institutions and private equity firms adhere to rigid, high-density single-column standards. Traditional serif typography with deep charcoal/navy accents communicates discipline, prestige, and financial rigor.',
    keyTips: [
      'Lead with deal sizes ($M / $B), EBITDA multiples, transaction structuring, and financial modeling metrics.',
      'Maintain compact margins (11-13mm) to fit comprehensive deal experience on a pristine single page.',
      'Place Education prominently if from target institutions or honors (summa cum laude, Dean’s list).',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
    settings: {
      preset: 'compact-dense',
      fontFamily: 'Merriweather',
      baseFontSize: 11.5,
      lineHeight: 1.3,
      pageMargin: 11,
      sectionGap: 11,
      itemGap: 7,
      primaryColor: '#0f172a', // Wall Street Charcoal Slate
      textColor: '#09090b',
      headerStyle: 'underline',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: false,
      appliedRoleName: 'Investment Banker & Private Equity',
    },
  },
  {
    roleTitle: 'Financial Analyst & Accountant',
    category: 'Finance & Banking',
    description: 'Clean numerical balance with deep burgundy accents, standard ATS dividers, and certification visibility.',
    rationale:
      'Accounting and corporate finance leaders prioritize precision and verified credentials (CPA, CFA). Classic underline headers with high-contrast text ensure error-free ATS table extraction.',
    keyTips: [
      'List CPA / CFA or relevant state licenses immediately in your title or certifications.',
      'Highlight GAAP/IFRS compliance, audit oversight, tax optimization, and variance analysis.',
      'Quantify budget portfolios managed, cost optimizations achieved, and audit accuracy.',
    ],
    recommendedSectionOrder: ['summary', 'certifications', 'experience', 'education', 'skills', 'projects'],
    settings: {
      preset: 'classic-executive',
      fontFamily: 'Inter',
      baseFontSize: 12.5,
      lineHeight: 1.38,
      pageMargin: 13,
      sectionGap: 13,
      itemGap: 8,
      primaryColor: '#701a75', // Executive Burgundy
      textColor: '#0f172a',
      headerStyle: 'underline',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Financial Analyst & Accountant',
    },
  },
  {
    roleTitle: 'Registered Nurse & Clinical Healthcare',
    category: 'Healthcare & Medicine',
    description: 'Clinical trust palette with verified licenses and credentials placed at the highest priority.',
    rationale:
      'Hospital ATS systems and nurse recruiters discard applications missing explicit state licensure (RN, BSN, BLS, ACLS). Placing certifications and clinical unit hours directly beneath the summary guarantees immediate qualification confirmation.',
    keyTips: [
      'State your active Nursing License number, compact state status, and expiration date clearly.',
      'Specify clinical care units (e.g., ICU, Med-Surg, ER, NICU, Telemetry) and nurse-to-patient ratios.',
      'Quantify patient volume, compliance audit scores, and EHR software proficiency (Epic, Cerner).',
    ],
    recommendedSectionOrder: ['summary', 'certifications', 'experience', 'education', 'skills', 'projects'],
    settings: {
      preset: 'classic-executive',
      fontFamily: 'Plus Jakarta Sans',
      baseFontSize: 12.5,
      lineHeight: 1.4,
      pageMargin: 14,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#0369a1', // Clinical Ocean Blue
      textColor: '#0f172a',
      headerStyle: 'border-box',
      bulletStyle: 'square',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Registered Nurse & Clinical Healthcare',
    },
  },
  {
    roleTitle: 'Corporate Lawyer & Legal Counsel',
    category: 'Legal & Compliance',
    description: 'Authoritative, refined serif typography with understated dividers and formal judicial gravitas.',
    rationale:
      'Law firms, general counsels, and judicial clerks expect conservative elegance. Merriweather serif with minimal dividers conveys intellectual discipline, contractual precision, and professional decorum.',
    keyTips: [
      'Highlight bar admissions, state jurisdictions, and federal court credentials at the top.',
      'Detail transactional contract values, litigation settlement figures, or regulatory compliance audits.',
      'Avoid flashy graphics, icons, or multi-column gimmicks that legal recruiting partners frown upon.',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
    settings: {
      preset: 'classic-executive',
      fontFamily: 'Merriweather',
      baseFontSize: 12,
      lineHeight: 1.45,
      pageMargin: 16,
      sectionGap: 16,
      itemGap: 10,
      primaryColor: '#1e293b', // Formal Navy Slate
      textColor: '#0f172a',
      headerStyle: 'minimal-divider',
      bulletStyle: 'hyphen',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: false,
      appliedRoleName: 'Corporate Lawyer & Legal Counsel',
    },
  },
  {
    roleTitle: 'Product Designer & UI/UX Specialist',
    category: 'Creative & Design',
    description: 'Modern aesthetic balance with Outfit display typography, prominent portfolio links, and design system emphasis.',
    rationale:
      'Design hiring managers evaluate visual hierarchy, typography pairings, and portfolio accessibility instantly. Elegant subtle-fill badges and generous line-height demonstrate sophisticated craft while remaining 100% machine-readable.',
    keyTips: [
      'Feature your portfolio URL and password (if applicable) prominently in the header.',
      'Anchor case studies with user research insights, usability metrics, and conversion uplifts.',
      'List design systems (Figma, tokens, auto-layout) and interaction prototyping tools.',
    ],
    recommendedSectionOrder: ['summary', 'projects', 'skills', 'experience', 'education', 'certifications'],
    settings: {
      preset: 'creative-hybrid',
      fontFamily: 'Outfit',
      baseFontSize: 13,
      lineHeight: 1.45,
      pageMargin: 14,
      sectionGap: 15,
      itemGap: 10,
      primaryColor: '#7c3aed', // Creative Violet
      textColor: '#18181b',
      headerStyle: 'subtle-fill',
      bulletStyle: 'arrow',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: false,
      showDividers: false,
      highlightKeywords: true,
      appliedRoleName: 'Product Designer & UI/UX Specialist',
    },
  },
  {
    roleTitle: 'Product Manager & Technical Lead',
    category: 'Product & Project',
    description: 'Balanced outcome-focused hierarchy highlighting roadmap execution, feature launches, and cross-functional KPIs.',
    rationale:
      'Product leaders bridge engineering, design, and business metrics. Clean modern typography with Royal Blue left-accent headings highlights strategic vision and quantifiable OKR attainment.',
    keyTips: [
      'Highlight specific product metrics: MAU/DAU growth, feature adoption %, churn reduction, and ARR impact.',
      'Detail agile methodology, discovery sprints, PRD authorship, and stakeholder leadership.',
      'Showcase technical fluency alongside customer empathy.',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Plus Jakarta Sans',
      baseFontSize: 13,
      lineHeight: 1.42,
      pageMargin: 14,
      sectionGap: 15,
      itemGap: 10,
      primaryColor: '#2563eb', // PM Royal Blue
      textColor: '#0f172a',
      headerStyle: 'left-accent',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Product Manager & Technical Lead',
    },
  },
  {
    roleTitle: 'Account Executive & Sales Leader',
    category: 'Sales & Marketing',
    description: 'High-energy, quota-centric layout with crisp pill section markers and direct revenue achievement focus.',
    rationale:
      'VP of Sales and recruiting heads scan for quota percentages and total pipeline generated within seconds. Pill headings with energetic cobalt accents immediately draw attention to performance numbers.',
    keyTips: [
      'Bold your quota attainment percentages (e.g., "145% of annual quota, President’s Club recipient").',
      'Specify deal cycle velocity, average contract value (ACV), and net new ARR generated.',
      'List CRM and sales engagement tech stacks (Salesforce, HubSpot, Gong, Outreach).',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Inter',
      baseFontSize: 13,
      lineHeight: 1.4,
      pageMargin: 14,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#0284c7', // Sales Sky Blue
      textColor: '#0f172a',
      headerStyle: 'pill',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Account Executive & Sales Leader',
    },
  },
  {
    roleTitle: 'Marketing Director & Growth Strategist',
    category: 'Sales & Marketing',
    description: 'Dynamic presentation showcasing multi-channel campaign ROI, CAC/LTV improvements, and brand reach.',
    rationale:
      'Marketing executives must showcase storytelling ability and rigorous data accountability. Outfit typography with fuchsia/plum accents delivers contemporary polish without sacrificing ATS parsability.',
    keyTips: [
      'Detail paid acquisition CAC, organic traffic expansion %, ROAS, and pipeline attribution.',
      'Highlight cross-channel mastery (SEO, SEM, Performance, Content, Influencer, Lifecycle).',
      'Include team management scale and global marketing budget sizes.',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'skills', 'projects', 'education', 'certifications'],
    settings: {
      preset: 'creative-hybrid',
      fontFamily: 'Outfit',
      baseFontSize: 12.8,
      lineHeight: 1.45,
      pageMargin: 14,
      sectionGap: 15,
      itemGap: 9,
      primaryColor: '#c026d3', // Growth Magenta
      textColor: '#0f172a',
      headerStyle: 'pill',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: false,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Marketing Director & Growth Strategist',
    },
  },
  {
    roleTitle: 'Executive / VP & Chief of Staff',
    category: 'Executive & Leadership',
    description: 'Commanding corporate layout with classic serif-touch typography, P&L responsibility, and organizational restructuring.',
    rationale:
      'Board members and executive search partners expect gravitas, strategic breadth, and clear governance impact. Clean classic typography with deep navy/charcoal styling communicates senior executive maturity.',
    keyTips: [
      'Highlight enterprise P&L scale ($10M - $500M+), global headcount, and EBITDA turnaround.',
      'Detail M&A acquisitions, post-merger integration, and board governance leadership.',
      'Keep formatting spacious, mature, and unencumbered by superficial decorative elements.',
    ],
    recommendedSectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
    settings: {
      preset: 'classic-executive',
      fontFamily: 'Inter',
      baseFontSize: 13,
      lineHeight: 1.42,
      pageMargin: 16,
      sectionGap: 16,
      itemGap: 11,
      primaryColor: '#1e3a8a', // Executive Navy
      textColor: '#0f172a',
      headerStyle: 'underline',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: false,
      appliedRoleName: 'Executive / VP & Chief of Staff',
    },
  },
  {
    roleTitle: 'Academic Researcher & University Professor',
    category: 'Academic & Research',
    description: 'Scholarly structure emphasizing doctoral education, peer-reviewed publications, and grant funding.',
    rationale:
      'Academic search committees demand education and published scholarship at the forefront. Minimalist monochrome dividers and Merriweather serif reflect traditional academic publication standards.',
    keyTips: [
      'Lead with terminal degrees (Ph.D., M.D.), dissertations, advisors, and fellowships.',
      'Detail total grant funding secured (NIH, NSF, private foundations) and citation metrics (h-index).',
      'List teaching pedagogy, course evaluations, and peer-reviewed journal papers.',
    ],
    recommendedSectionOrder: ['summary', 'education', 'experience', 'projects', 'certifications', 'skills'],
    settings: {
      preset: 'classic-executive',
      fontFamily: 'Merriweather',
      baseFontSize: 12,
      lineHeight: 1.48,
      pageMargin: 18,
      sectionGap: 18,
      itemGap: 11,
      primaryColor: '#18181b', // Academic Black
      textColor: '#18181b',
      headerStyle: 'minimal-divider',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: false,
      appliedRoleName: 'Academic Researcher & University Professor',
    },
  },
  {
    roleTitle: 'Supply Chain & Operations Manager',
    category: 'Operations & Logistics',
    description: 'High-efficiency industrial layout with Six Sigma certification emphasis and throughput metrics.',
    rationale:
      'Operations directors value process efficiency, lean logistics, and safety compliance. Amber/slate border-box headers highlight continuous improvement metrics and global logistics mastery.',
    keyTips: [
      'Prominently highlight certifications (Lean Six Sigma Black Belt, APICS CSCP, PMP).',
      'Quantify throughput improvements, inventory reduction %, freight cost savings, and on-time delivery (OTD).',
      'Showcase warehouse management systems (WMS, SAP, Oracle ERP, TMS).',
    ],
    recommendedSectionOrder: ['summary', 'certifications', 'experience', 'skills', 'education', 'projects'],
    settings: {
      preset: 'minimal-sharp',
      fontFamily: 'Inter',
      baseFontSize: 12.5,
      lineHeight: 1.4,
      pageMargin: 14,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#d97706', // Industrial Amber
      textColor: '#0f172a',
      headerStyle: 'border-box',
      bulletStyle: 'square',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'Supply Chain & Operations Manager',
    },
  },
  {
    roleTitle: 'College Graduate & Entry-Level Candidate',
    category: 'Entry-Level & Students',
    description: 'Youthful, highly readable layout prioritizing university GPA, academic honors, capstone projects, and campus leadership.',
    rationale:
      'When candidates have limited full-time work experience, academic achievements and hands-on capstone projects prove capability. Blue left-accent dividers signal ambition and modern rigor.',
    keyTips: [
      'Position Education and Capstone Projects before Experience if your degree is your primary asset.',
      'Include relevant coursework, Dean’s List honors, scholarship awards, and GPA (if >= 3.5).',
      'Highlight internships, student organization leadership, and hackathons.',
    ],
    recommendedSectionOrder: ['summary', 'education', 'projects', 'skills', 'experience', 'certifications'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Plus Jakarta Sans',
      baseFontSize: 13,
      lineHeight: 1.45,
      pageMargin: 15,
      sectionGap: 15,
      itemGap: 10,
      primaryColor: '#3b82f6', // Bright Horizon Blue
      textColor: '#0f172a',
      headerStyle: 'left-accent',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: 'College Graduate & Entry-Level Candidate',
    },
  },
];

/**
 * Smart instant client-side role matcher with keyword weighting
 */
export function matchRoleTemplate(query: string): RoleTemplateConfig {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    return PRESET_ROLE_TEMPLATES[0]; // Default to Software & DevOps
  }

  // Exact match
  const exact = PRESET_ROLE_TEMPLATES.find(
    (t) => t.roleTitle.toLowerCase() === q || t.category.toLowerCase() === q
  );
  if (exact) return exact;

  // Keyword rules
  if (
    q.includes('soft') ||
    q.includes('dev') ||
    q.includes('engineer') ||
    q.includes('code') ||
    q.includes('fullstack') ||
    q.includes('frontend') ||
    q.includes('backend') ||
    q.includes('react') ||
    q.includes('node') ||
    q.includes('python') ||
    q.includes('cloud') ||
    q.includes('aws') ||
    q.includes('cyber') ||
    q.includes('security')
  ) {
    return PRESET_ROLE_TEMPLATES[0];
  }

  if (
    q.includes('data') ||
    q.includes('ai') ||
    q.includes('ml') ||
    q.includes('machine learning') ||
    q.includes('statistic') ||
    q.includes('analyst') ||
    q.includes('deep learning')
  ) {
    return PRESET_ROLE_TEMPLATES[1];
  }

  if (
    q.includes('bank') ||
    q.includes('invest') ||
    q.includes('equity') ||
    q.includes('wall street') ||
    q.includes('venture') ||
    q.includes('hedge') ||
    q.includes('quant') ||
    q.includes('consult')
  ) {
    return PRESET_ROLE_TEMPLATES[2];
  }

  if (
    q.includes('account') ||
    q.includes('tax') ||
    q.includes('audit') ||
    q.includes('cpa') ||
    q.includes('finance') ||
    q.includes('cfa')
  ) {
    return PRESET_ROLE_TEMPLATES[3];
  }

  if (
    q.includes('nurse') ||
    q.includes('rn') ||
    q.includes('health') ||
    q.includes('medic') ||
    q.includes('doctor') ||
    q.includes('clinic') ||
    q.includes('hospital') ||
    q.includes('pharma') ||
    q.includes('therap')
  ) {
    return PRESET_ROLE_TEMPLATES[4];
  }

  if (
    q.includes('law') ||
    q.includes('legal') ||
    q.includes('attorney') ||
    q.includes('counsel') ||
    q.includes('paralegal') ||
    q.includes('compliance') ||
    q.includes('policy')
  ) {
    return PRESET_ROLE_TEMPLATES[5];
  }

  if (
    q.includes('design') ||
    q.includes('ux') ||
    q.includes('ui') ||
    q.includes('product designer') ||
    q.includes('art') ||
    q.includes('graphic') ||
    q.includes('creative') ||
    q.includes('visual')
  ) {
    return PRESET_ROLE_TEMPLATES[6];
  }

  if (
    q.includes('product manager') ||
    q.includes('pm') ||
    q.includes('scrum') ||
    q.includes('agile') ||
    q.includes('program manager')
  ) {
    return PRESET_ROLE_TEMPLATES[7];
  }

  if (
    q.includes('sales') ||
    q.includes('account executive') ||
    q.includes('ae') ||
    q.includes('bdr') ||
    q.includes('sdr') ||
    q.includes('business development') ||
    q.includes('client') ||
    q.includes('customer success')
  ) {
    return PRESET_ROLE_TEMPLATES[8];
  }

  if (
    q.includes('market') ||
    q.includes('growth') ||
    q.includes('seo') ||
    q.includes('brand') ||
    q.includes('content') ||
    q.includes('social') ||
    q.includes('pr')
  ) {
    return PRESET_ROLE_TEMPLATES[9];
  }

  if (
    q.includes('executive') ||
    q.includes('vp') ||
    q.includes('director') ||
    q.includes('chief') ||
    q.includes('ceo') ||
    q.includes('coo') ||
    q.includes('cfo') ||
    q.includes('president') ||
    q.includes('general manager')
  ) {
    return PRESET_ROLE_TEMPLATES[10];
  }

  if (
    q.includes('prof') ||
    q.includes('academ') ||
    q.includes('teach') ||
    q.includes('research') ||
    q.includes('phd') ||
    q.includes('postdoc') ||
    q.includes('school') ||
    q.includes('educat')
  ) {
    return PRESET_ROLE_TEMPLATES[11];
  }

  if (
    q.includes('supply') ||
    q.includes('logistic') ||
    q.includes('warehouse') ||
    q.includes('civil') ||
    q.includes('manufactur') ||
    q.includes('construct') ||
    q.includes('plant') ||
    q.includes('mechanic')
  ) {
    return PRESET_ROLE_TEMPLATES[12];
  }

  if (
    q.includes('intern') ||
    q.includes('grad') ||
    q.includes('entry') ||
    q.includes('student') ||
    q.includes('fresh') ||
    q.includes('junior')
  ) {
    return PRESET_ROLE_TEMPLATES[13];
  }

  // Fallback: Dynamically generate a tailored config for the custom role query!
  return {
    roleTitle: query,
    category: 'Custom Role',
    description: `Tailored modern ATS layout optimized for ${query} recruiters and hiring screening workflows.`,
    rationale: `This layout combines high-contrast modern typography with subtle accents to present ${query} qualifications clearly to both applicant tracking algorithms and hiring executives.`,
    keyTips: [
      `Incorporate top industry keywords and standardized certifications for ${query}.`,
      'Emphasize quantifiable achievements with clear metrics and scope of responsibility.',
      'Organize relevant technical skills and tools near the top for fast screening.',
    ],
    recommendedSectionOrder: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
    settings: {
      preset: 'modern-tech',
      fontFamily: 'Inter',
      baseFontSize: 12.8,
      lineHeight: 1.42,
      pageMargin: 14,
      sectionGap: 14,
      itemGap: 9,
      primaryColor: '#1e40af', // Royal Blue
      textColor: '#0f172a',
      headerStyle: 'left-accent',
      bulletStyle: 'disc',
      columnLayout: 'single',
      paperSize: 'letter',
      uppercaseHeadings: true,
      showDividers: true,
      highlightKeywords: true,
      appliedRoleName: query,
    },
  };
}
