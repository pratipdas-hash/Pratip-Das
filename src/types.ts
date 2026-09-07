export type SectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | string;

export interface BulletPoint {
  id: string;
  text: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: BulletPoint[];
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[]; // e.g. "Languages", "Frameworks & Libraries", "Cloud & DevOps"
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  bullets: BulletPoint[];
  techStack?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId?: string;
  link?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: BulletPoint[];
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface SectionMeta {
  id: SectionId;
  name: string;
  enabled: boolean;
  isCustom?: boolean;
}

export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github: string;
}

export interface ResumeData {
  id: string;
  title: string;
  lastModified: string;
  personalInfo: PersonalInfo;
  summary: string;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  sectionOrder: SectionId[]; // Ordered list of enabled and active sections
}

export type TemplatePreset =
  | 'classic-executive'
  | 'modern-tech'
  | 'creative-hybrid'
  | 'minimal-sharp'
  | 'compact-dense'
  | 'custom-scratch';

export type FontFamily =
  | 'Inter'
  | 'Plus Jakarta Sans'
  | 'Outfit'
  | 'Merriweather'
  | 'JetBrains Mono';

export type HeaderStyle = 'underline' | 'pill' | 'minimal-divider' | 'left-accent' | 'border-box' | 'subtle-fill';
export type BulletStyle = 'disc' | 'hyphen' | 'square' | 'arrow';
export type DateFormat = 'MMM YYYY' | 'YYYY' | 'MM/YYYY';

export interface TemplateSettings {
  preset: TemplatePreset;
  fontFamily: FontFamily;
  baseFontSize: number; // e.g. 13px, 14px, 15px
  lineHeight: number; // e.g. 1.35, 1.45, 1.6
  pageMargin: number; // in mm, e.g. 12mm, 16mm, 20mm
  sectionGap: number; // in px or rem
  itemGap: number;
  primaryColor: string; // Hex color for headers / accents
  textColor: string; // Deep slate or black for ATS readability
  headerStyle: HeaderStyle;
  bulletStyle: BulletStyle;
  columnLayout: 'single' | 'two-column-hybrid'; // Single is default 100% ATS safe
  paperSize: 'a4' | 'letter';
  uppercaseHeadings: boolean;
  showDividers: boolean;
  highlightKeywords: boolean;
  appliedRoleName?: string;
}

export interface RoleTemplateConfig {
  roleTitle: string;
  category: string;
  description: string;
  rationale: string;
  keyTips: string[];
  settings: TemplateSettings;
  recommendedSectionOrder: SectionId[];
}

export interface AtsMatchAnalysis {
  matchScore: number;
  foundHardSkills: string[];
  missingHardSkills: string[];
  foundSoftSkills: string[];
  missingSoftSkills: string[];
  keywordSuggestions: Array<{
    keyword: string;
    recommendedSection: string;
    reason: string;
  }>;
  formattingRisks: string[];
  highImpactFixes: string[];
}

export interface RealtimeAtsFeedback {
  overallScore: number;
  metricsRatio: number; // % of bullets with quantifiable numbers
  actionVerbScore: number; // % of bullets starting with strong action verbs
  lengthScore: number;
  contactCompleteness: number;
  totalWords: number;
  bulletCount: number;
  warnings: string[];
  strengths: string[];
}

export interface SavedCustomTemplate {
  id: string;
  name: string;
  description?: string;
  savedAt: string;
  settings: TemplateSettings;
}

export interface SavedResumeSnapshot {
  id: string;
  title: string;
  savedAt: string;
  resume: ResumeData;
  settings?: TemplateSettings;
}
