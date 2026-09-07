import React, { useState } from 'react';
import { ResumeData, SectionId } from '../types';
import {
  FileUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
  UploadCloud,
  Layers,
  History,
} from 'lucide-react';

interface OldResumeImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedResume: ResumeData) => void;
}

const sampleOldResumeText = `Alex M. Morgan
Senior Software Engineer | New York, NY
Email: alex.morgan.dev@gmail.com | Phone: (555) 234-8901
LinkedIn: linkedin.com/in/alexmorgan | GitHub: github.com/alexmorgan

PROFESSIONAL SUMMARY
Senior Full-Stack Engineer with 6+ years of experience engineering high-scale distributed systems and responsive web applications. Proven track record reducing API latency by 45% and leading cross-functional teams of 8 developers.

WORK EXPERIENCE
Staff / Lead Software Engineer | FinTech Cloud Inc. | New York, NY | March 2022 - Present
- Architected and deployed microservices backend in Go and Node.js serving 15M+ daily API requests with 99.99% uptime.
- Optimized database indexing and Redis cache, lowering average response times from 340ms to 85ms across global endpoints.
- Mentored 6 junior engineers and spearheaded automated CI/CD pipelines reducing deployment failure rate by 30%.

Full Stack Developer | NexaTech Systems | Boston, MA | June 2018 - February 2022
- Developed core user-facing analytics dashboard using React, TypeScript, and GraphQL, increasing user engagement by 28%.
- Integrated Stripe payment workflows and automated subscription billing for over 120,000 active paid subscribers.
- Collaborated with product design teams to refactor component library, cutting page bundle weight by 35%.

SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5/CSS3
Frameworks & Libraries: React, Node.js, Next.js, Express, Tailwind CSS, GraphQL
Cloud & Infrastructure: AWS (ECS, S3, RDS, Lambda), Docker, Kubernetes, CI/CD, Redis
Tools: Git, PostgreSQL, MongoDB, JIRA, Jest

EDUCATION
B.S. in Computer Science | Boston University, Boston, MA | 2014 - 2018 | GPA: 3.8 / 4.0

PROJECTS
OpenSource Query Engine | Lead Creator | github.com/alexmorgan/fast-query
- High-performance streaming data engine built in Go with 2,500+ GitHub stars.`;

export const OldResumeImporterModal: React.FC<OldResumeImporterModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      setParsedPreview(null);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setInputText(sampleOldResumeText);
    setParsedPreview(null);
    setError(null);
  };

  const handleParse = async () => {
    if (!inputText.trim() || inputText.trim().length < 30) {
      setError('Please paste or upload your old resume text (at least a few sentences).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/parse-old-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldResumeText: inputText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse resume.');

      // Format into complete ResumeData
      const structuredResume: ResumeData = {
        id: `resume-${Date.now()}`,
        title: `${data.personalInfo?.fullName || 'Imported'} Resume`,
        lastModified: new Date().toLocaleDateString(),
        personalInfo: {
          fullName: data.personalInfo?.fullName || 'Full Name',
          title: data.personalInfo?.title || 'Professional Title',
          email: data.personalInfo?.email || '',
          phone: data.personalInfo?.phone || '',
          location: data.personalInfo?.location || '',
          linkedin: data.personalInfo?.linkedin || '',
          github: data.personalInfo?.github || '',
          website: data.personalInfo?.website || '',
        },
        summary: data.summary || '',
        experiences: (data.experiences || []).map((exp: any, idx: number) => ({
          id: `exp-import-${Date.now()}-${idx}`,
          role: exp.role || 'Job Title',
          company: exp.company || 'Company',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: !!exp.current,
          bullets: (exp.bullets || []).map((b: string, bIdx: number) => ({
            id: `b-import-${Date.now()}-${idx}-${bIdx}`,
            text: b,
          })),
        })),
        education: (data.education || []).map((edu: any, idx: number) => ({
          id: `edu-import-${Date.now()}-${idx}`,
          degree: edu.degree || 'Degree',
          school: edu.school || 'University',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || '',
          honors: edu.honors || '',
        })),
        skills: (data.skills || []).map((cat: any, idx: number) => ({
          id: `skill-import-${Date.now()}-${idx}`,
          category: cat.category || 'Skills',
          skills: Array.isArray(cat.skills) ? cat.skills : [],
        })),
        projects: (data.projects || []).map((proj: any, idx: number) => ({
          id: `proj-import-${Date.now()}-${idx}`,
          name: proj.name || 'Project Name',
          role: proj.role || '',
          link: proj.link || '',
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          techStack: proj.techStack || '',
          bullets: (proj.bullets || []).map((b: string, bIdx: number) => ({
            id: `pb-import-${Date.now()}-${idx}-${bIdx}`,
            text: b,
          })),
        })),
        certifications: (data.certifications || []).map((cert: any, idx: number) => ({
          id: `cert-import-${Date.now()}-${idx}`,
          name: cert.name || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || '',
          credentialId: cert.credentialId || '',
        })),
        customSections: [],
        sectionOrder: [
          'summary',
          'skills',
          'experience',
          'projects',
          'education',
          'certifications',
        ] as SectionId[],
      };

      setParsedPreview(structuredResume);
    } catch (err: any) {
      setError(err.message || 'Error occurred while analyzing past resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTemplate = () => {
    if (parsedPreview) {
      onImportComplete(parsedPreview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Import & Migrate Old Resume
              </h3>
              <p className="text-[11px] text-slate-500">
                Paste your past resume or CV. AI extracts your work history, metrics, and skills into your new template.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* File Upload or Text Paste */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Paste Old Resume Text or Upload File:</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadSample}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Load Sample Old Resume
                </button>
                <label className="cursor-pointer text-[11px] inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload .txt / .md</span>
                  <input
                    type="file"
                    accept=".txt,.md,.rtf,.doc"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setParsedPreview(null);
              }}
              placeholder="Paste your existing resume content here (experience, education, summary, skills)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-500">
              {inputText ? `${inputText.split(/\s+/).filter(Boolean).length} words detected` : 'No text entered'}
            </span>
            <button
              onClick={handleParse}
              disabled={loading || !inputText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting past roles & achievements...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract & Structure With AI</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedPreview && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-xs">
                      Extraction Successful! Ready to transfer into your template.
                    </span>
                  </div>
                  <button
                    onClick={handleApplyToTemplate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                  >
                    <span>Transfer & Start Editing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Candidate</div>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {parsedPreview.personalInfo.fullName}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Roles Extracted</div>
                    <div className="font-bold text-slate-900 text-xs">
                      {parsedPreview.experiences.length} positions
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Skill Categories</div>
                    <div className="font-bold text-slate-900 text-xs">
                      {parsedPreview.skills.length} categories
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Education</div>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {parsedPreview.education[0]?.degree || 'Extracted'}
                    </div>
                  </div>
                </div>

                {/* Extracted preview detail */}
                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-semibold text-slate-800 text-xs">Past Positions Found:</div>
                  <div className="space-y-1.5">
                    {parsedPreview.experiences.map((exp: any, i: number) => (
                      <div key={i} className="text-[11px] text-slate-600 border-l-2 border-emerald-400 pl-2">
                        <span className="font-bold text-slate-800">{exp.role}</span> at {exp.company}{' '}
                        <span className="text-slate-400">({exp.startDate} – {exp.endDate})</span>
                        <div className="text-[10px] text-slate-500">
                          {exp.bullets?.length || 0} bullet points extracted
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Your existing data will be populated into the active ATS template. You can edit all text freely.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
