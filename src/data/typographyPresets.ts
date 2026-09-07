import { FontFamily, HeadingTracking, HeadingWeight, HeadingScale, BodyFontWeight } from '../types';

export interface FontMetadata {
  family: FontFamily;
  category: 'Sans-Serif' | 'Serif' | 'Monospace';
  cssFamily: string;
  tagline: string;
  bestFor: string;
  specimen: string;
  atsRating: '100% Guaranteed' | 'Recommended' | 'ATS Certified';
}

export interface FontPairingPreset {
  id: string;
  name: string;
  category: string;
  headingFont: FontFamily;
  bodyFont: FontFamily;
  description: string;
  rationale: string;
}

export const FONT_CATALOG: FontMetadata[] = [
  // Modern Clean Sans-Serif
  {
    family: 'Inter',
    category: 'Sans-Serif',
    cssFamily: '"Inter", sans-serif',
    tagline: 'Standard Universal Sans',
    bestFor: 'Tech, Product, Startups, General',
    specimen: 'Principal Software Architect & Lead Developer',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Plus Jakarta Sans',
    category: 'Sans-Serif',
    cssFamily: '"Plus Jakarta Sans", sans-serif',
    tagline: 'Crisp Tech & High Readability',
    bestFor: 'SaaS, Engineering, Data Science',
    specimen: 'Machine Learning & Deep Neural Systems',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Outfit',
    category: 'Sans-Serif',
    cssFamily: '"Outfit", sans-serif',
    tagline: 'Contemporary Geometric Clean',
    bestFor: 'Product Design, Marketing, Creative Tech',
    specimen: 'Senior Design Systems & UI/UX Director',
    atsRating: 'ATS Certified',
  },
  {
    family: 'Roboto',
    category: 'Sans-Serif',
    cssFamily: '"Roboto", sans-serif',
    tagline: 'Google & Workday Neutral Benchmark',
    bestFor: 'Enterprise, IT, Healthcare, Government',
    specimen: 'Enterprise Systems & Cloud Migration Manager',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Open Sans',
    category: 'Sans-Serif',
    cssFamily: '"Open Sans", sans-serif',
    tagline: 'Warm, Highly Legible & Balanced',
    bestFor: 'HR, Operations, Customer Success, Non-Profit',
    specimen: 'Director of People Operations & Talent Growth',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Lato',
    category: 'Sans-Serif',
    cssFamily: '"Lato", sans-serif',
    tagline: 'Corporate Warmth & Stability',
    bestFor: 'Consulting, Finance, Corporate Strategy',
    specimen: 'Strategic Management Consultant & Engagement Lead',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Poppins',
    category: 'Sans-Serif',
    cssFamily: '"Poppins", sans-serif',
    tagline: 'Geometric Modern Display',
    bestFor: 'Sales, Growth, Brand Strategy, Media',
    specimen: 'VP of Global Enterprise Revenue & Partnerships',
    atsRating: 'ATS Certified',
  },

  // Prestigious & Editorial Serifs
  {
    family: 'Merriweather',
    category: 'Serif',
    cssFamily: '"Merriweather", serif',
    tagline: 'Editorial Density & Screen Contrast',
    bestFor: 'Wall Street, Accounting, Academic, Editorial',
    specimen: 'Senior Investment Banker & Private Equity Associate',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Lora',
    category: 'Serif',
    cssFamily: '"Lora", serif',
    tagline: 'Contemporary Literary Elegance',
    bestFor: 'Publishing, Journalism, Research, Policy',
    specimen: 'Senior Policy Analyst & Investigative Fellow',
    atsRating: 'ATS Certified',
  },
  {
    family: 'Playfair Display',
    category: 'Serif',
    cssFamily: '"Playfair Display", serif',
    tagline: 'Executive Luxury & Boardroom Polish',
    bestFor: 'C-Suite, Luxury Brands, Creative Direction',
    specimen: 'Chief Executive Officer & Board Member',
    atsRating: 'Recommended',
  },
  {
    family: 'EB Garamond',
    category: 'Serif',
    cssFamily: '"EB Garamond", serif',
    tagline: 'Timeless Classical Judicial Gravitas',
    bestFor: 'Law Firms, Judicial Clerks, Philosophy, History',
    specimen: 'Senior Corporate Counsel & Compliance Officer',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Libre Baskerville',
    category: 'Serif',
    cssFamily: '"Libre Baskerville", serif',
    tagline: 'Traditional Ivy League & Banking Print',
    bestFor: 'Financial Services, Legal, Think Tanks',
    specimen: 'Managing Director of Quantitative Asset Strategy',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Cinzel',
    category: 'Serif',
    cssFamily: '"Cinzel", serif',
    tagline: 'Classical Roman Inscription Capital',
    bestFor: 'Executive Headings, Heritage Finance, Legal Honors',
    specimen: 'FOUNDING PARTNER & CHIEF INVESTMENT OFFICER',
    atsRating: 'Recommended',
  },

  // Technical & Monospaced
  {
    family: 'JetBrains Mono',
    category: 'Monospace',
    cssFamily: '"JetBrains Mono", monospace',
    tagline: 'Developer-Engineered Optical Monospace',
    bestFor: 'DevOps, Systems Engineering, Security, Web3',
    specimen: 'Staff Site Reliability & Infrastructure Engineer',
    atsRating: '100% Guaranteed',
  },
  {
    family: 'Fira Code',
    category: 'Monospace',
    cssFamily: '"Fira Code", monospace',
    tagline: 'Technical Terminal Precision',
    bestFor: 'Kernel Developers, Cryptography, Backend Data',
    specimen: 'High-Throughput Distributed Systems Engineer',
    atsRating: 'ATS Certified',
  },
];

export const CURATED_FONT_PAIRINGS: FontPairingPreset[] = [
  {
    id: 'tech-modern',
    name: 'Modern Tech Stack',
    category: 'Tech & Engineering',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    description: 'Crisp sans headings paired with standard high-density body copy.',
    rationale: 'Perfect optical scanability for engineering hiring managers and automated parsers.',
  },
  {
    id: 'wall-street',
    name: 'Wall Street Traditional',
    category: 'Finance & Banking',
    headingFont: 'Merriweather',
    bodyFont: 'Lato',
    description: 'Authoritative serif headings with clean structured corporate body.',
    rationale: 'Communicates financial rigor, deal-flow maturity, and traditional prestige.',
  },
  {
    id: 'legal-counsel',
    name: 'Judicial & Legal Prestige',
    category: 'Legal & Policy',
    headingFont: 'EB Garamond',
    bodyFont: 'EB Garamond',
    description: 'Unified classical serif throughout candidate details and case experience.',
    rationale: 'Matches Supreme Court and top-tier corporate legal styling expectations.',
  },
  {
    id: 'executive-board',
    name: 'Executive & C-Suite Polish',
    category: 'Leadership',
    headingFont: 'Playfair Display',
    bodyFont: 'Plus Jakarta Sans',
    description: 'High-contrast luxury serif display heading paired with modern body text.',
    rationale: 'Commands immediate visual attention on the candidate name while maintaining clean scanability.',
  },
  {
    id: 'contemporary-design',
    name: 'Creative & Product Design',
    category: 'Design & Creative',
    headingFont: 'Outfit',
    bodyFont: 'Open Sans',
    description: 'Modern geometric titles with friendly, open-aperture body text.',
    rationale: 'Demonstrates typographic taste and visual hierarchy balance for UX/UI designers.',
  },
  {
    id: 'developer-terminal',
    name: 'DevOps & Systems Specialist',
    category: 'Tech & Engineering',
    headingFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    description: 'Subtle technical monospace header accents with clean sans body text.',
    rationale: 'Instant recognition of engineering DNA without sacrificing dense line counts.',
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar & Fellow',
    category: 'Academic & Research',
    headingFont: 'Libre Baskerville',
    bodyFont: 'Lora',
    description: 'Classic university press typography ideal for publication listings.',
    rationale: 'Mirrors prestigious academic journals and research grant formatting.',
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Universal',
    category: 'Corporate & Ops',
    headingFont: 'Roboto',
    bodyFont: 'Roboto',
    description: 'The standard ATS corporate staple used across Fortune 500 portals.',
    rationale: 'Zero rendering discrepancies on any device or legacy ATS parser.',
  },
];

export function getFontFamilyCss(family?: FontFamily): string {
  if (!family) return '"Inter", sans-serif';
  const found = FONT_CATALOG.find((f) => f.family === family);
  return found ? found.cssFamily : '"Inter", sans-serif';
}

export function getHeadingTrackingStyle(tracking?: HeadingTracking): string {
  switch (tracking) {
    case 'tight':
      return '-0.025em';
    case 'wide':
      return '0.05em';
    case 'wider':
      return '0.1em';
    case 'normal':
    default:
      return '0em';
  }
}

export function getHeadingWeightValue(weight?: HeadingWeight): number {
  switch (weight) {
    case 'medium':
      return 500;
    case 'semibold':
      return 600;
    case 'extrabold':
      return 800;
    case 'bold':
    default:
      return 700;
  }
}

export function getHeadingScaleMultiplier(scale?: HeadingScale): number {
  switch (scale) {
    case 'compact':
      return 1.12; // Subtle hierarchy, saves vertical space
    case 'prominent':
      return 1.35; // Bold clear separation
    case 'balanced':
    default:
      return 1.22;
  }
}

export function getBodyFontWeightValue(weight?: BodyFontWeight): number {
  switch (weight) {
    case 'light':
      return 300;
    case 'medium':
      return 500;
    case 'normal':
    default:
      return 400;
  }
}
