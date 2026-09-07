import { ResumeData, RealtimeAtsFeedback } from '../types';

const STRONG_ACTION_VERBS = new Set([
  'accelerated', 'achieved', 'administered', 'advocated', 'allocated', 'analyzed',
  'architected', 'automated', 'authored', 'bolstered', 'boosted', 'built',
  'centralized', 'championed', 'coached', 'collaborated', 'conceptualized',
  'consolidated', 'constructed', 'converted', 'coordinated', 'curated',
  'decreased', 'delivered', 'deployed', 'designed', 'developed', 'devised',
  'directed', 'doubled', 'drove', 'eliminated', 'enabled', 'enacted',
  'engineered', 'enhanced', 'established', 'evaluated', 'exceeded', 'executed',
  'expanded', 'expedited', 'formulated', 'fostered', 'generated', 'governed',
  'guided', 'halved', 'harnessed', 'headed', 'identified', 'implemented',
  'improved', 'increased', 'initiated', 'innovated', 'inspected', 'instituted',
  'integrated', 'introduced', 'launched', 'led', 'leveraged', 'managed',
  'maximized', 'mentored', 'migrated', 'minimized', 'modernized', 'negotiated',
  'optimized', 'orchestrated', 'overhauled', 'oversaw', 'pioneered', 'planned',
  'produced', 'programmed', 'published', 'raised', 're-engineered', 'reduced',
  'reformed', 'refactored', 'remodeled', 'resolved', 'restructured', 'revamped',
  'scaled', 'slashed', 'spearheaded', 'standardized', 'streamlined', 'strengthened',
  'surpassed', 'synthesized', 'transformed', 'upgraded', 'validated', 'yielded'
]);

const WEAK_VERBS_REGEX = /\b(responsible for|helped with|assisted in|worked on|duties included|participated in|tasked with|was involved in)\b/i;
const METRIC_REGEX = /(\b\d+(\.\d+)?%|\$\d+(\.\d+)?([KMBkmb])?|\b\d{1,3}(,\d{3})+|\b\d+\+?\s*(users|clients|customers|requests|queries|nodes|servers|engineers|members|projects|days|hours|minutes|seconds|ms|percent|x)\b)/i;

export function evaluateResumeATS(resume: ResumeData, jobDescription?: string): RealtimeAtsFeedback {
  const warnings: string[] = [];
  const strengths: string[] = [];

  // 1. Contact Information Completeness (Weight: 15)
  let contactScore = 0;
  const p = resume.personalInfo;
  if (p.fullName?.trim()) contactScore += 30;
  if (p.email?.includes('@')) contactScore += 30;
  if (p.phone?.trim()) contactScore += 20;
  if (p.location?.trim()) contactScore += 10;
  if (p.linkedin?.trim() || p.github?.trim() || p.website?.trim()) contactScore += 10;

  if (!p.email?.includes('@')) warnings.push('Missing or invalid email address.');
  if (!p.phone?.trim()) warnings.push('Phone number is missing; ATS recruiters often filter by phone.');
  if (!p.location?.trim()) warnings.push('Location/City is recommended for location-based ATS queries.');

  // 2. Bullets Analysis: Action Verbs & Metrics
  const allBullets: string[] = [];
  resume.experiences.forEach((exp) => {
    exp.bullets.forEach((b) => {
      if (b.text?.trim()) allBullets.push(b.text.trim());
    });
  });
  resume.projects.forEach((proj) => {
    proj.bullets.forEach((b) => {
      if (b.text?.trim()) allBullets.push(b.text.trim());
    });
  });

  const bulletCount = allBullets.length;
  let metricsCount = 0;
  let strongVerbCount = 0;
  let weakPhraseCount = 0;

  allBullets.forEach((bullet) => {
    if (METRIC_REGEX.test(bullet)) {
      metricsCount++;
    }
    const firstWord = bullet.replace(/^[•\-\*\s]+/, '').split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
    if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
      strongVerbCount++;
    }
    if (WEAK_VERBS_REGEX.test(bullet)) {
      weakPhraseCount++;
    }
  });

  const metricsRatio = bulletCount > 0 ? Math.round((metricsCount / bulletCount) * 100) : 0;
  const actionVerbScore = bulletCount > 0 ? Math.round((strongVerbCount / bulletCount) * 100) : 0;

  if (metricsRatio < 50) {
    warnings.push(`Only ${metricsRatio}% of bullets have quantifiable numbers (%, $, time, scale). Aim for 60%+ using the XYZ formula.`);
  } else {
    strengths.push(`Excellent quantification: ${metricsRatio}% of bullets contain measurable business results.`);
  }

  if (actionVerbScore < 70) {
    warnings.push(`${100 - actionVerbScore}% of bullet points do not start with a recognized high-impact action verb.`);
  } else {
    strengths.push(`Strong vocabulary: ${actionVerbScore}% of achievements lead with powerful action verbs.`);
  }

  if (weakPhraseCount > 0) {
    warnings.push(`Found ${weakPhraseCount} passive phrases ("responsible for", "helped with"). Use the AI Enhancer to convert these to direct accomplishments.`);
  }

  // 3. Section & Content Completeness
  const fullText = [
    resume.summary,
    ...allBullets,
    resume.skills.flatMap((s) => s.skills).join(' '),
    resume.education.map((e) => `${e.degree} ${e.school}`).join(' '),
  ].join(' ');

  const totalWords = fullText.split(/\s+/).filter(Boolean).length;
  let lengthScore = 100;
  if (totalWords < 250) {
    lengthScore = 60;
    warnings.push('Resume content is quite short (<250 words). Add more quantifiable project and experience details.');
  } else if (totalWords > 950) {
    lengthScore = 80;
    warnings.push('Resume exceeds 950 words. Check if non-essential points can be trimmed for a tight 1 or 2-page fit.');
  } else {
    strengths.push(`Ideal word count (${totalWords} words) suitable for recruiter 6-second scan and ATS ingestion.`);
  }

  if (!resume.summary || resume.summary.length < 50) {
    warnings.push('A concise 3-4 line professional summary is recommended at the top to anchor ATS role matching.');
  } else {
    strengths.push('Professional summary present with career focus keywords.');
  }

  const skillCount = resume.skills.reduce((acc, cat) => acc + cat.skills.length, 0);
  if (skillCount < 6) {
    warnings.push('Fewer than 6 technical/core skills listed. Group skills by category for higher ATS keyword density.');
  } else {
    strengths.push(`Solid skills inventory: ${skillCount} skills organized into distinct categories.`);
  }

  // Calculate Weighted Overall ATS Score
  const contactWeight = (contactScore / 100) * 20;
  const metricsWeight = (metricsRatio / 100) * 30;
  const verbsWeight = (actionVerbScore / 100) * 25;
  const lengthWeight = (lengthScore / 100) * 15;
  const skillsBonus = Math.min(10, (skillCount / 10) * 10);

  const overallScore = Math.min(100, Math.round(contactWeight + metricsWeight + verbsWeight + lengthWeight + skillsBonus));

  return {
    overallScore,
    metricsRatio,
    actionVerbScore,
    lengthScore,
    contactCompleteness: contactScore,
    totalWords,
    bulletCount,
    warnings,
    strengths,
  };
}

// Client-side quick keyword extraction for comparison
export function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  const clean = text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, ' ');
  const words = clean.split(/\s+/).filter((w) => w.length > 2);
  const STOPWORDS = new Set([
    'and', 'the', 'for', 'with', 'you', 'will', 'that', 'this', 'from', 'have',
    'are', 'our', 'who', 'about', 'more', 'can', 'all', 'your', 'role', 'team',
    'work', 'must', 'able', 'years', 'experience', 'looking', 'join', 'opportunity'
  ]);

  const freq: Record<string, number> = {};
  words.forEach((w) => {
    if (!STOPWORDS.has(w) && !/^\d+$/.test(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}

// Simulate ATS plain-text extraction (how a real ATS parser flattens the resume)
export function simulateAtsPlainText(resume: ResumeData): string {
  const lines: string[] = [];
  lines.push(`NAME: ${resume.personalInfo.fullName}`);
  lines.push(`TITLE: ${resume.personalInfo.title}`);
  lines.push(`CONTACT: ${resume.personalInfo.email} | ${resume.personalInfo.phone} | ${resume.personalInfo.location}`);
  if (resume.personalInfo.linkedin) lines.push(`LINKEDIN: ${resume.personalInfo.linkedin}`);
  if (resume.personalInfo.github) lines.push(`GITHUB: ${resume.personalInfo.github}`);
  if (resume.personalInfo.website) lines.push(`WEBSITE: ${resume.personalInfo.website}`);
  lines.push('\n--- PROFESSIONAL SUMMARY ---');
  lines.push(resume.summary || '(None)');

  lines.push('\n--- SKILLS ---');
  resume.skills.forEach((cat) => {
    lines.push(`${cat.category}: ${cat.skills.join(', ')}`);
  });

  lines.push('\n--- WORK EXPERIENCE ---');
  resume.experiences.forEach((exp) => {
    lines.push(`${exp.role} | ${exp.company} | ${exp.location}`);
    lines.push(`DATES: ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`);
    exp.bullets.forEach((b) => lines.push(`• ${b.text}`));
    lines.push('');
  });

  if (resume.projects.length > 0) {
    lines.push('--- PROJECTS ---');
    resume.projects.forEach((proj) => {
      lines.push(`${proj.name} ${proj.role ? `(${proj.role})` : ''} [${proj.startDate || ''} – ${proj.endDate || ''}]`);
      if (proj.techStack) lines.push(`TECH STACK: ${proj.techStack}`);
      proj.bullets.forEach((b) => lines.push(`• ${b.text}`));
      lines.push('');
    });
  }

  lines.push('--- EDUCATION ---');
  resume.education.forEach((edu) => {
    lines.push(`${edu.degree}, ${edu.school}, ${edu.location} (${edu.startDate} – ${edu.endDate})`);
    if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
    if (edu.honors) lines.push(`HONORS: ${edu.honors}`);
  });

  if (resume.certifications.length > 0) {
    lines.push('\n--- CERTIFICATIONS ---');
    resume.certifications.forEach((c) => {
      lines.push(`${c.name} - ${c.issuer} (${c.issueDate})${c.credentialId ? ` [ID: ${c.credentialId}]` : ''}`);
    });
  }

  return lines.join('\n');
}
