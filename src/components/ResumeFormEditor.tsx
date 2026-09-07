import React, { useState } from 'react';
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  SectionId,
} from '../types';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  History,
} from 'lucide-react';

interface ResumeFormEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  activeSectionId: SectionId | null;
  onOpenAiEnhanceBullet: (bulletText: string, onApply: (enhanced: string) => void) => void;
  onOpenAiSummary: () => void;
  onOpenImportOldResume?: () => void;
  onOpenRoleTemplateModal?: () => void;
}

export const ResumeFormEditor: React.FC<ResumeFormEditorProps> = ({
  resume,
  onChange,
  activeSectionId,
  onOpenAiEnhanceBullet,
  onOpenAiSummary,
  onOpenImportOldResume,
  onOpenRoleTemplateModal,
}) => {
  const [activeTab, setActiveTab] = useState<string>(activeSectionId || 'personal');

  // Sync tab when activeSectionId changes from outside
  React.useEffect(() => {
    if (activeSectionId) {
      setActiveTab(activeSectionId);
    }
  }, [activeSectionId]);

  // Update Personal Info
  const handlePersonalInfoChange = (field: keyof typeof resume.personalInfo, value: string) => {
    onChange({
      ...resume,
      personalInfo: {
        ...resume.personalInfo,
        [field]: value,
      },
    });
  };

  // Add & Update Experience
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: 'Software Engineer',
      company: 'Company Name',
      location: 'City, State',
      startDate: 'Jan 2023',
      endDate: 'Present',
      current: true,
      bullets: [
        {
          id: `b-${Date.now()}-1`,
          text: 'Spearheaded development of high-throughput service, scaling request capacity by 40% across distributed nodes.',
        },
      ],
    };
    onChange({
      ...resume,
      experiences: [newExp, ...resume.experiences],
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.filter((exp) => exp.id !== id),
    });
  };

  const addExperienceBullet = (expId: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: [
            ...exp.bullets,
            {
              id: `b-${Date.now()}`,
              text: 'Engineered scalable solution that improved performance by 25%.',
            },
          ],
        };
      }),
    });
  };

  const updateExperienceBullet = (expId: string, bulletId: string, text: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
        };
      }),
    });
  };

  const removeExperienceBullet = (expId: string, bulletId: string) => {
    onChange({
      ...resume,
      experiences: resume.experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return {
          ...exp,
          bullets: exp.bullets.filter((b) => b.id !== bulletId),
        };
      }),
    });
  };

  // Skills
  const addSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: 'New Category',
      skills: ['Skill 1', 'Skill 2'],
    };
    onChange({
      ...resume,
      skills: [...resume.skills, newCat],
    });
  };

  const updateSkillCategory = (id: string, category: string, skillsStr: string) => {
    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({
      ...resume,
      skills: resume.skills.map((cat) =>
        cat.id === id ? { ...cat, category, skills } : cat
      ),
    });
  };

  const removeSkillCategory = (id: string) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((cat) => cat.id !== id),
    });
  };

  // Education
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: 'B.S. in Computer Science',
      school: 'University Name',
      location: 'City, State',
      startDate: '2018',
      endDate: '2022',
      gpa: '3.8',
    };
    onChange({
      ...resume,
      education: [...resume.education, newEdu],
    });
  };

  const updateEducation = (id: string, field: keyof EducationItem, value: any) => {
    onChange({
      ...resume,
      education: resume.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resume,
      education: resume.education.filter((edu) => edu.id !== id),
    });
  };

  // Projects
  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: 'Key Project Name',
      role: 'Lead Developer',
      techStack: 'React, TypeScript, Node.js',
      bullets: [
        {
          id: `pb-${Date.now()}`,
          text: 'Architected and deployed open-source project with 1,000+ active users.',
        },
      ],
    };
    onChange({
      ...resume,
      projects: [...resume.projects, newProj],
    });
  };

  const updateProject = (id: string, field: keyof ProjectItem, value: any) => {
    onChange({
      ...resume,
      projects: resume.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...resume,
      projects: resume.projects.filter((p) => p.id !== id),
    });
  };

  // Certifications
  const addCert = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
    };
    onChange({
      ...resume,
      certifications: [...resume.certifications, newCert],
    });
  };

  const updateCert = (id: string, field: keyof CertificationItem, value: any) => {
    onChange({
      ...resume,
      certifications: resume.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    });
  };

  const removeCert = (id: string) => {
    onChange({
      ...resume,
      certifications: resume.certifications.filter((c) => c.id !== id),
    });
  };

  const tabs = [
    { id: 'personal', label: 'Contact', icon: User },
    { id: 'summary', label: 'Summary', icon: Sparkles },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Certs', icon: Award },
    ...resume.customSections.map((cs) => ({
      id: cs.id,
      label: cs.title,
      icon: Layers,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Quick Action: Import Old Resume */}
      {onOpenImportOldResume && (
        <div className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-[11px]">Have an existing resume?</span>
              <p className="text-[10px] text-slate-500">Paste your past CV to auto-extract into this template</p>
            </div>
          </div>
          <button
            onClick={onOpenImportOldResume}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 rounded-lg text-[11px] font-semibold transition-colors shadow-2xs whitespace-nowrap"
          >
            Import Past Resume
          </button>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200 text-xs scrollbar-thin">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-lg font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Personal Contact Info */}
      {activeTab === 'personal' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Personal & Contact Information</h3>
            <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
              ATS Contact Compliant
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={resume.personalInfo.fullName}
                onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-medium">Target Professional Title</label>
                {resume.personalInfo.title && onOpenRoleTemplateModal && (
                  <button
                    type="button"
                    onClick={onOpenRoleTemplateModal}
                    className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    title="Adapt ATS template styling and hierarchy to this title"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                    <span>Tailor Template to Role</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={resume.personalInfo.title}
                onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer, ICU Nurse, Lawyer..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Email Address *</label>
              <input
                type="email"
                value={resume.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                placeholder="e.g. john.doe@email.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                value={resume.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                placeholder="e.g. +1 (555) 019-2834"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Location / Relocation</label>
              <input
                type="text"
                value={resume.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                placeholder="e.g. New York, NY (Open to Remote)"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={resume.personalInfo.linkedin}
                onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">GitHub / Portfolio URL</label>
              <input
                type="text"
                value={resume.personalInfo.github}
                onChange={(e) => handlePersonalInfoChange('github', e.target.value)}
                placeholder="github.com/username"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Personal Website</label>
              <input
                type="text"
                value={resume.personalInfo.website}
                onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                placeholder="alexcodes.dev"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Professional Summary</h3>
              <p className="text-slate-500 text-[11px]">
                A 3-4 sentence pitch tailored to the target role with primary ATS keywords.
              </p>
            </div>
            <button
              onClick={onOpenAiSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Tailor Summary
            </button>
          </div>

          <textarea
            rows={5}
            value={resume.summary}
            onChange={(e) => onChange({ ...resume, summary: e.target.value })}
            placeholder="Write your professional summary or click AI Tailor Summary to generate one from your target job description..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Word count: {resume.summary.split(/\s+/).filter(Boolean).length} words</span>
            <span>Recommended: 40 - 75 words</span>
          </div>
        </div>
      )}

      {/* 3. Skills */}
      {activeTab === 'skills' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Core Skills & Competencies</h3>
              <p className="text-slate-500 text-[11px]">
                Organized by category so ATS algorithms parse hard skills and tools accurately.
              </p>
            </div>
            <button
              onClick={addSkillCategory}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          </div>

          <div className="space-y-3">
            {resume.skills.map((cat) => (
              <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cat.category}
                    onChange={(e) =>
                      updateSkillCategory(cat.id, e.target.value, cat.skills.join(', '))
                    }
                    placeholder="e.g. Languages & Frameworks"
                    className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden text-xs px-1"
                  />
                  <button
                    onClick={() => removeSkillCategory(cat.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Remove Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Skills (separated by comma):
                  </label>
                  <input
                    type="text"
                    value={cat.skills.join(', ')}
                    onChange={(e) => updateSkillCategory(cat.id, cat.category, e.target.value)}
                    placeholder="React, TypeScript, Go, Docker, AWS"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Experience */}
      {activeTab === 'experience' && (
        <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Work Experience</h3>
              <p className="text-slate-500 text-[11px]">
                Quantifiable achievements structured with Google's XYZ formula.
              </p>
            </div>
            <button
              onClick={addExperience}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Position
            </button>
          </div>

          <div className="space-y-4">
            {resume.experiences.map((exp, expIdx) => (
              <div key={exp.id} className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      {expIdx + 1}
                    </span>
                    <span>{exp.role || 'New Role'}</span>
                    <span className="text-slate-400 font-normal">at</span>
                    <span className="font-semibold text-slate-700">{exp.company || 'Company'}</span>
                  </div>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                    title="Delete Position"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">Dates</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          placeholder="Mar 2022"
                          className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs"
                        />
                        <span className="text-slate-400">–</span>
                        <input
                          type="text"
                          value={exp.current ? 'Present' : exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="w-1/2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs disabled:bg-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    I currently work here
                  </label>
                </div>

                {/* Bullets with AI Enhancer */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 text-[11px]">
                      Bullet Points & Key Results
                    </label>
                    <button
                      onClick={() => addExperienceBullet(exp.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      Add Bullet
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bullet.id} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-slate-400 mt-2 text-xs font-mono">•</span>
                      <textarea
                        rows={2}
                        value={bullet.text}
                        onChange={(e) => updateExperienceBullet(exp.id, bullet.id, e.target.value)}
                        placeholder="Accomplished [X] as measured by [Y] by doing [Z]..."
                        className="flex-1 bg-transparent border-none text-xs focus:ring-0 resize-none p-0.5 leading-relaxed text-slate-800"
                      />
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={() =>
                            onOpenAiEnhanceBullet(bullet.text, (enhanced) =>
                              updateExperienceBullet(exp.id, bullet.id, enhanced)
                            )
                          }
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-[11px] font-semibold inline-flex items-center gap-1"
                          title="Enhance with AI using Google XYZ formula"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>AI Fix</span>
                        </button>
                        <button
                          onClick={() => removeExperienceBullet(exp.id, bullet.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Projects */}
      {activeTab === 'projects' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Key Projects</h3>
              <p className="text-slate-500 text-[11px]">
                Highlight high-impact repositories, tools, or products with tech stack tags.
              </p>
            </div>
            <button
              onClick={addProject}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    placeholder="Project Name"
                    className="font-bold text-slate-900 bg-transparent text-xs px-1 border-b border-transparent focus:border-blue-500"
                  />
                  <button
                    onClick={() => removeProject(proj.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Role / Contribution</label>
                    <input
                      type="text"
                      value={proj.role || ''}
                      onChange={(e) => updateProject(proj.id, 'role', e.target.value)}
                      placeholder="e.g. Lead Architect"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Link / Repository</label>
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                      placeholder="github.com/user/project"
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Tech Stack</label>
                  <input
                    type="text"
                    value={proj.techStack || ''}
                    onChange={(e) => updateProject(proj.id, 'techStack', e.target.value)}
                    placeholder="e.g. Go, Kafka, Docker, Kubernetes"
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-1.5 pt-1">
                  {proj.bullets.map((bullet) => (
                    <div key={bullet.id} className="flex items-center gap-1.5 bg-white p-1.5 rounded border border-slate-200">
                      <input
                        type="text"
                        value={bullet.text}
                        onChange={(e) => {
                          const newBullets = proj.bullets.map((b) =>
                            b.id === bullet.id ? { ...b, text: e.target.value } : b
                          );
                          updateProject(proj.id, 'bullets', newBullets);
                        }}
                        className="flex-1 bg-transparent border-none text-xs focus:ring-0 p-0 text-slate-800"
                      />
                      <button
                        onClick={() =>
                          onOpenAiEnhanceBullet(bullet.text, (enhanced) => {
                            const newBullets = proj.bullets.map((b) =>
                              b.id === bullet.id ? { ...b, text: enhanced } : b
                            );
                            updateProject(proj.id, 'bullets', newBullets);
                          })
                        }
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded"
                      >
                        AI Fix
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Education */}
      {activeTab === 'education' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Education</h3>
              <p className="text-slate-500 text-[11px]">Degrees, institutions, honors, and graduation dates.</p>
            </div>
            <button
              onClick={addEducation}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          </div>

          <div className="space-y-3">
            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{edu.degree || 'Degree'}</span>
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Degree & Major</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">School / University</label>
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Dates (e.g. 2017 - 2021)</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        className="w-1/2 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                      <span>–</span>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        className="w-1/2 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">GPA or Honors (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      placeholder="e.g. 3.8 / 4.0, Magna Cum Laude"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Certifications */}
      {activeTab === 'certifications' && (
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Certifications & Licenses</h3>
              <p className="text-slate-500 text-[11px]">Accredited industry certifications (AWS, GCP, CKA, PMP).</p>
            </div>
            <button
              onClick={addCert}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          <div className="space-y-2.5">
            {resume.certifications.map((cert) => (
              <div key={cert.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCert(cert.id, 'name', e.target.value)}
                    placeholder="Certification Name"
                    className="font-bold text-slate-900 bg-transparent text-xs px-1 border-b border-transparent focus:border-blue-500"
                  />
                  <button onClick={() => removeCert(cert.id)} className="text-slate-400 hover:text-red-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuing Organization"
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    value={cert.issueDate}
                    onChange={(e) => updateCert(cert.id, 'issueDate', e.target.value)}
                    placeholder="Date or Year (e.g. 2023)"
                    className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Custom Sections Handling */}
      {resume.customSections.map((cs) => {
        if (activeTab !== cs.id) return null;
        return (
          <div key={cs.id} className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{cs.title}</h3>
              <button
                onClick={() => {
                  const updatedSecs = resume.customSections.map((item) => {
                    if (item.id !== cs.id) return item;
                    return {
                      ...item,
                      items: [
                        ...item.items,
                        {
                          id: `item-${Date.now()}`,
                          title: 'New Item',
                          date: '2024',
                          description: 'Description of activity or honor.',
                        },
                      ],
                    };
                  });
                  onChange({ ...resume, customSections: updatedSecs });
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-2.5">
              {cs.items.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const updatedSecs = resume.customSections.map((c) => {
                          if (c.id !== cs.id) return c;
                          return {
                            ...c,
                            items: c.items.map((it) =>
                              it.id === item.id ? { ...it, title: e.target.value } : it
                            ),
                          };
                        });
                        onChange({ ...resume, customSections: updatedSecs });
                      }}
                      className="font-bold text-slate-900 bg-transparent text-xs px-1"
                    />
                    <button
                      onClick={() => {
                        const updatedSecs = resume.customSections.map((c) => {
                          if (c.id !== cs.id) return c;
                          return {
                            ...c,
                            items: c.items.filter((it) => it.id !== item.id),
                          };
                        });
                        onChange({ ...resume, customSections: updatedSecs });
                      }}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => {
                      const updatedSecs = resume.customSections.map((c) => {
                        if (c.id !== cs.id) return c;
                        return {
                          ...c,
                          items: c.items.map((it) =>
                            it.id === item.id ? { ...it, description: e.target.value } : it
                          ),
                        };
                      });
                      onChange({ ...resume, customSections: updatedSecs });
                    }}
                    placeholder="Item details or accomplishments..."
                    className="w-full bg-white border border-slate-300 rounded p-2 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
