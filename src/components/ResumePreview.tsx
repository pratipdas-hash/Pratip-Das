import React from 'react';
import { ResumeData, TemplateSettings, SectionId } from '../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, ExternalLink } from 'lucide-react';
import {
  getFontFamilyCss,
  getHeadingTrackingStyle,
  getHeadingWeightValue,
  getHeadingScaleMultiplier,
  getBodyFontWeightValue,
} from '../data/typographyPresets';

interface ResumePreviewProps {
  resume: ResumeData;
  settings: TemplateSettings;
  highlightWords?: string[];
  isPrintMode?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  resume,
  settings,
  highlightWords = [],
  isPrintMode = false,
}) => {
  const { personalInfo } = resume;

  // Highlight helper for ATS keywords
  const renderHighlighted = (text: string) => {
    if (!settings.highlightKeywords || highlightWords.length === 0 || !text) {
      return text;
    }
    const escaped = highlightWords
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    if (!escaped) return text;
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const isMatch = highlightWords.some((w) => w.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <mark key={i} className="bg-amber-100 text-amber-900 px-0.5 rounded font-medium">
          {part}
        </mark>
      ) : (
        part
      );
    });
  };

  const getFontFamilyClass = (family: string) => {
    switch (family) {
      case 'Plus Jakarta Sans':
        return 'font-["Plus_Jakarta_Sans",sans-serif]';
      case 'Outfit':
        return 'font-["Outfit",sans-serif]';
      case 'Merriweather':
        return 'font-["Merriweather",serif]';
      case 'JetBrains Mono':
        return 'font-["JetBrains_Mono",monospace]';
      case 'Inter':
      default:
        return 'font-["Inter",sans-serif]';
    }
  };

  const getBulletClass = (bullet: string) => {
    switch (bullet) {
      case 'square':
        return 'list-[square]';
      case 'hyphen':
        return 'list-none'; // we can render custom hyphen
      case 'arrow':
        return 'list-none';
      case 'disc':
      default:
        return 'list-disc';
    }
  };

  const renderHeader = (title: string) => {
    const uppercase = settings.uppercaseHeadings ? 'uppercase' : '';
    const style = settings.headerStyle;

    const headingFontFamily = settings.headingFontFamily || settings.fontFamily;
    const headingScaleMult = getHeadingScaleMultiplier(settings.headingScale);
    const headingFontSize = Math.round(settings.baseFontSize * headingScaleMult);
    const headingWeight = getHeadingWeightValue(settings.headingWeight);
    const headingTracking = getHeadingTrackingStyle(settings.headingTracking);
    const headingFontCss = getFontFamilyCss(headingFontFamily);

    const headingTextStyle: React.CSSProperties = {
      color: settings.primaryColor,
      fontFamily: headingFontCss,
      fontWeight: headingWeight,
      letterSpacing: headingTracking,
      fontSize: `${headingFontSize}px`,
      lineHeight: 1.25,
    };

    switch (style) {
      case 'underline':
        return (
          <div className="border-b pb-1 mb-2.5 flex items-center justify-between" style={{ borderColor: settings.primaryColor }}>
            <h2 className={`${uppercase}`} style={headingTextStyle}>
              {title}
            </h2>
          </div>
        );
      case 'pill':
        return (
          <div className="mb-2.5">
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-white ${uppercase}`}
              style={{
                ...headingTextStyle,
                backgroundColor: settings.primaryColor,
                color: '#ffffff',
                fontSize: `${Math.max(10, headingFontSize - 1.5)}px`,
              }}
            >
              {title}
            </span>
          </div>
        );
      case 'left-accent':
        return (
          <div className="mb-2.5 border-l-4 pl-2.5 py-0.5" style={{ borderColor: settings.primaryColor }}>
            <h2 className={`${uppercase}`} style={headingTextStyle}>
              {title}
            </h2>
          </div>
        );
      case 'subtle-fill':
        return (
          <div
            className="px-2.5 py-1 rounded mb-2.5"
            style={{ backgroundColor: `${settings.primaryColor}18` }}
          >
            <h2 className={`${uppercase}`} style={headingTextStyle}>
              {title}
            </h2>
          </div>
        );
      case 'minimal-divider':
      default:
        return (
          <div className="flex items-center gap-3 mb-2.5">
            <h2 className={`shrink-0 ${uppercase}`} style={headingTextStyle}>
              {title}
            </h2>
            {settings.showDividers && (
              <div className="h-px w-full bg-slate-200" />
            )}
          </div>
        );
    }
  };

  const renderSectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case 'summary':
        if (!resume.summary) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Professional Summary')}
            <p className="leading-relaxed text-justify text-slate-700">
              {renderHighlighted(resume.summary)}
            </p>
          </section>
        );

      case 'skills':
        if (!resume.skills || resume.skills.length === 0) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Core Competencies & Skills')}
            <div className="space-y-1.5">
              {resume.skills.map((cat) => (
                <div key={cat.id} className="text-xs leading-relaxed">
                  <span className="font-semibold text-slate-900 mr-2">{cat.category}:</span>
                  <span className="text-slate-700">
                    {cat.skills.map((s, idx) => (
                      <React.Fragment key={idx}>
                        {renderHighlighted(s)}
                        {idx < cat.skills.length - 1 ? ' • ' : ''}
                      </React.Fragment>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'experience':
        if (!resume.experiences || resume.experiences.length === 0) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Professional Experience')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.itemGap}px` }}>
              {resume.experiences.map((exp) => (
                <div key={exp.id} className="page-break-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                    <div>
                      <h3 className="font-bold text-slate-900 inline-block text-xs">
                        {renderHighlighted(exp.role)}
                      </h3>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {renderHighlighted(exp.company)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600">
                      <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      {exp.location && <span className="ml-2 text-slate-500">• {exp.location}</span>}
                    </div>
                  </div>
                  <ul className={`ml-4 space-y-1 mt-1 text-slate-700 ${getBulletClass(settings.bulletStyle)}`}>
                    {exp.bullets.map((bullet) => (
                      <li key={bullet.id} className="leading-snug pl-0.5">
                        {settings.bulletStyle === 'hyphen' && <span className="mr-1.5 text-slate-400">–</span>}
                        {settings.bulletStyle === 'arrow' && <span className="mr-1 text-slate-400">›</span>}
                        {renderHighlighted(bullet.text)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (!resume.projects || resume.projects.length === 0) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Key Projects & Technical Works')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.itemGap}px` }}>
              {resume.projects.map((proj) => (
                <div key={proj.id} className="page-break-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 text-xs">{proj.name}</h3>
                      {proj.role && <span className="text-xs text-slate-600">({proj.role})</span>}
                      {proj.link && (
                        <span className="text-[11px] text-blue-700 inline-flex items-center gap-0.5 underline">
                          {proj.link}
                        </span>
                      )}
                    </div>
                    {(proj.startDate || proj.endDate) && (
                      <div className="text-xs text-slate-500">
                        {proj.startDate} {proj.endDate ? `– ${proj.endDate}` : ''}
                      </div>
                    )}
                  </div>
                  {proj.techStack && (
                    <div className="text-[11px] text-slate-600 italic mb-1">
                      Technologies: {renderHighlighted(proj.techStack)}
                    </div>
                  )}
                  <ul className={`ml-4 space-y-1 text-slate-700 ${getBulletClass(settings.bulletStyle)}`}>
                    {proj.bullets.map((bullet) => (
                      <li key={bullet.id} className="leading-snug pl-0.5">
                        {settings.bulletStyle === 'hyphen' && <span className="mr-1.5 text-slate-400">–</span>}
                        {settings.bulletStyle === 'arrow' && <span className="mr-1 text-slate-400">›</span>}
                        {renderHighlighted(bullet.text)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (!resume.education || resume.education.length === 0) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Education')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.itemGap}px` }}>
              {resume.education.map((edu) => (
                <div key={edu.id} className="page-break-avoid flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs">{edu.degree}</h3>
                    <div className="text-slate-700 text-xs font-medium">{edu.school}</div>
                    {(edu.gpa || edu.honors) && (
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {edu.gpa && <span>GPA: {edu.gpa}</span>}
                        {edu.gpa && edu.honors && <span> • </span>}
                        {edu.honors && <span>{edu.honors}</span>}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 text-right shrink-0">
                    <div>{edu.startDate} – {edu.endDate}</div>
                    {edu.location && <div className="text-slate-500">{edu.location}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (!resume.certifications || resume.certifications.length === 0) return null;
        return (
          <section className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader('Certifications & Credentials')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {resume.certifications.map((cert) => (
                <div key={cert.id} className="page-break-avoid border-l-2 border-slate-300 pl-2">
                  <div className="font-bold text-slate-900">{cert.name}</div>
                  <div className="text-slate-600 flex items-center justify-between mt-0.5">
                    <span>{cert.issuer}</span>
                    <span className="text-slate-500">{cert.issueDate}</span>
                  </div>
                  {cert.credentialId && (
                    <div className="text-[10px] text-slate-400">ID: {cert.credentialId}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      default:
        // Handle custom user-created sections
        const customSec = resume.customSections.find((cs) => cs.id === sectionId);
        if (!customSec) return null;
        return (
          <section key={customSec.id} className="page-break-avoid" style={{ marginBottom: `${settings.sectionGap}px` }}>
            {renderHeader(customSec.title)}
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${settings.itemGap}px` }}>
              {customSec.items.map((item) => (
                <div key={item.id} className="page-break-avoid">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-bold text-slate-900 text-xs">{item.title}</h3>
                    {item.date && <span className="text-xs text-slate-500">{item.date}</span>}
                  </div>
                  {item.subtitle && <div className="text-xs text-slate-700 italic">{item.subtitle}</div>}
                  {item.description && <p className="text-xs text-slate-700 mt-1">{item.description}</p>}
                  {item.bullets && item.bullets.length > 0 && (
                    <ul className={`ml-4 space-y-1 mt-1 text-slate-700 ${getBulletClass(settings.bulletStyle)}`}>
                      {item.bullets.map((b) => (
                        <li key={b.id} className="leading-snug text-xs">{renderHighlighted(b.text)}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
    }
  };

  const isLetter = settings.paperSize === 'letter';
  // 8.5in x 11in (215.9mm x 279.4mm) or A4 (210mm x 297mm)
  const minHeightStyle = isLetter ? '279.4mm' : '297mm';

  return (
    <div
      id="resume-document"
      className="resume-sheet bg-white text-slate-800 transition-all mx-auto"
      style={{
        padding: `${settings.pageMargin}mm`,
        fontSize: `${settings.baseFontSize}px`,
        lineHeight: settings.lineHeight,
        minHeight: isPrintMode ? 'auto' : minHeightStyle,
        color: settings.textColor,
        maxWidth: '850px',
        fontFamily: getFontFamilyCss(settings.fontFamily),
        fontWeight: getBodyFontWeightValue(settings.bodyFontWeight),
      }}
    >
      {/* Header / Personal Info */}
      <header className="border-b pb-3 mb-3 border-slate-200 text-center">
        <h1
          className="tracking-tight"
          style={{
            color: settings.primaryColor,
            fontFamily: getFontFamilyCss(settings.headingFontFamily || settings.fontFamily),
            fontSize: `${settings.nameFontSize || 26}px`,
            fontWeight: getHeadingWeightValue(settings.headingWeight) >= 700 ? 800 : 700,
            letterSpacing: getHeadingTrackingStyle(settings.headingTracking),
            lineHeight: 1.15,
          }}
        >
          {personalInfo.fullName || 'Your Full Name'}
        </h1>
        {personalInfo.title && (
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mt-1">
            {personalInfo.title}
          </p>
        )}

        {/* Contact Links & Items (ATS compatible pipe/bullet inline structure) */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600">
          {personalInfo.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.email}</span>
            </span>
          )}
          {personalInfo.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.phone}</span>
            </span>
          )}
          {personalInfo.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.location}</span>
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="inline-flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.linkedin}</span>
            </span>
          )}
          {personalInfo.github && (
            <span className="inline-flex items-center gap-1">
              <Github className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.github}</span>
            </span>
          )}
          {personalInfo.website && (
            <span className="inline-flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400 no-print" />
              <span>{personalInfo.website}</span>
            </span>
          )}
        </div>
      </header>

      {/* Dynamic Sections in User-Specified Order */}
      {settings.columnLayout === 'two-column-hybrid' ? (
        // Hybrid two-column layout: Left column for Skills, Education, Certs; Right column for Summary, Experience, Projects
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1 border-r pr-4 border-slate-200">
            {renderSectionContent('skills')}
            {renderSectionContent('education')}
            {renderSectionContent('certifications')}
          </div>
          <div className="md:col-span-2">
            {renderSectionContent('summary')}
            {renderSectionContent('experience')}
            {renderSectionContent('projects')}
            {resume.sectionOrder
              .filter((id) => !['skills', 'education', 'certifications', 'summary', 'experience', 'projects'].includes(id))
              .map((id) => (
                <React.Fragment key={id}>{renderSectionContent(id)}</React.Fragment>
              ))}
          </div>
        </div>
      ) : (
        // Single-Column Layout: 100% Guaranteed Standard for ATS Parsers (Workday, Greenhouse, Taleo)
        <div>
          {resume.sectionOrder.map((sectionId) => (
            <React.Fragment key={sectionId}>
              {renderSectionContent(sectionId)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
