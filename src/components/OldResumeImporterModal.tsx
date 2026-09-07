import React, { useState, useRef, useEffect } from 'react';
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
  History,
  FileImage,
  FileCode,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileType,
} from 'lucide-react';

interface OldResumeImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedResume: ResumeData) => void;
}

interface UploadedFileInfo {
  file: File;
  name: string;
  size: number;
  type: string;
  base64: string;
  formatType: 'pdf' | 'docx' | 'doc';
  extractedText?: string;
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
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<UploadedFileInfo | null>(null);
  const [extractingText, setExtractingText] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Progressive loading status messages
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (!isOpen) return null;

  const getFormatType = (fileName: string, mimeType: string): 'pdf' | 'docx' | 'doc' | null => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf') || mimeType === 'application/pdf') return 'pdf';
    if (lower.endsWith('.docx') || mimeType.includes('wordprocessingml')) return 'docx';
    if (lower.endsWith('.doc') || mimeType.includes('msword')) return 'doc';
    return null;
  };

  const processSelectedFile = async (file: File) => {
    setError(null);
    setParsedPreview(null);

    const lower = file.name.toLowerCase();

    // Explicitly reject JSON files
    if (lower.endsWith('.json') || file.type === 'application/json' || file.type.includes('json')) {
      setError('JSON files are not supported. Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format only.');
      return;
    }

    // Strictly validate format
    const formatType = getFormatType(file.name, file.type);
    if (!formatType) {
      setError('Unsupported file format. Please upload your resume in PDF (.pdf) or Word (.docx, .doc) format only.');
      return;
    }

    // File size limit check (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('File is too large. Please upload a resume file under 25MB.');
      return;
    }

    // Read as Base64
    const reader = new FileReader();
    reader.onerror = () => {
      setError('Failed to read the selected file. Please try another file.');
    };

    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl.split(',')[1];

      const fileInfo: UploadedFileInfo = {
        file,
        name: file.name,
        size: file.size,
        type: file.type || (formatType === 'pdf' ? 'application/pdf' : 'application/octet-stream'),
        base64: base64Data,
        formatType,
      };

      setSelectedFile(fileInfo);

      // For PDF and Word documents, extract text immediately for preview & high-accuracy parsing
      if (formatType === 'docx' || formatType === 'doc' || formatType === 'pdf') {
        setExtractingText(true);
        try {
          const res = await fetch('/api/ai/extract-file-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType: file.type || (formatType === 'pdf' ? 'application/pdf' : undefined),
              fileName: file.name,
            }),
          });
          const resData = await res.json();
          if (res.ok && resData.text) {
            setSelectedFile((prev) => (prev ? { ...prev, extractedText: resData.text } : null));
          }
        } catch (err) {
          console.warn('Text preview extraction failed:', err);
        } finally {
          setExtractingText(false);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setShowExtractedText(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    setActiveTab('paste');
    setInputText(sampleOldResumeText);
    setSelectedFile(null);
    setParsedPreview(null);
    setError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleParse = async () => {
    const hasFile = !!selectedFile;
    const hasText = !!inputText.trim() && inputText.trim().length >= 20;

    if (!hasFile && !hasText) {
      setError('Please upload a resume file (PDF, Word, Scan, TXT) or paste resume text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = hasFile
        ? {
            fileBase64: selectedFile.base64,
            mimeType: selectedFile.type,
            fileName: selectedFile.name,
            oldResumeText: selectedFile.extractedText || inputText.trim() || undefined,
          }
        : {
            oldResumeText: inputText.trim(),
          };

      const res = await fetch('/api/ai/parse-old-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      setError(err.message || 'Error occurred while analyzing resume.');
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

  const loadingStepsText = [
    'Analyzing document structure, multi-column layout, and contact data...',
    'Extracting career history, dates, responsibilities & quantitative achievements...',
    'Synthesizing ATS skill categories, education credentials & certifications...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Import & Migrate Past Resume
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  PDF & Word Only
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Upload your existing resume in PDF (.pdf) or Word (.docx / .doc) format only. JSON files are not supported.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 pb-0 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2 px-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Document (PDF / Word)</span>
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2 px-2 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'paste'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text / Markdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleLoadSample}
              className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline inline-flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample Resume</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: File Upload (PDF or Word only) */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {!selectedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <p className="font-bold text-slate-800 text-sm mb-1">
                    Drag & Drop your resume here, or <span className="text-blue-600 underline">browse files</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mb-3 max-w-md mx-auto">
                    Upload your resume in PDF or Word format. JSON and other file types are not accepted.
                  </p>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      PDF (.pdf)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold text-[11px] border border-blue-200 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Word (.docx / .doc)
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 font-medium text-[10px] border border-slate-200">
                      No JSON accepted
                    </span>
                  </div>
                </div>
              ) : (
                /* File Selected Card */
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          selectedFile.formatType === 'pdf'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs truncate max-w-sm">
                          {selectedFile.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="uppercase font-semibold text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {selectedFile.formatType}
                          </span>
                          <span>{formatFileSize(selectedFile.size)}</span>
                          {extractingText && (
                            <span className="text-blue-600 flex items-center gap-1 font-medium">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Extracting text preview...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg text-[11px] font-medium"
                      >
                        Change File
                      </button>
                      <button
                        onClick={handleRemoveFile}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Format Intelligence Note */}
                  <div className="p-2.5 bg-white border border-slate-200/80 rounded-lg text-[11px] text-slate-600 flex items-center gap-2">
                    <FileType className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      {selectedFile.formatType === 'pdf'
                        ? 'High-precision PDF parsing active. AI extracts text, roles, skills, metrics, and multi-column hierarchy.'
                        : 'Word document extracted. All headings, bullet lists, dates, and experience blocks are primed for migration.'}
                    </span>
                  </div>

                  {/* Optional Text Preview Accordion for Word / Text Files */}
                  {selectedFile.extractedText && (
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setShowExtractedText(!showExtractedText)}
                        className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 flex items-center justify-between text-[11px] text-slate-700 font-medium transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            Extracted Document Text ({selectedFile.extractedText.split(/\s+/).filter(Boolean).length} words)
                          </span>
                        </span>
                        {showExtractedText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {showExtractedText && (
                        <div className="p-2.5 max-h-40 overflow-y-auto font-mono text-[10px] text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 border-t border-slate-200">
                          {selectedFile.extractedText}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Direct Text / Markdown Paste */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700">Paste Existing Resume Content:</label>
                <span className="text-[11px] text-slate-500">
                  {inputText ? `${inputText.split(/\s+/).filter(Boolean).length} words` : 'Empty'}
                </span>
              </div>

              <textarea
                rows={8}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setParsedPreview(null);
                }}
                placeholder="Paste your existing resume content here (e.g. copied from LinkedIn, Word, Google Docs, or text file)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-mono"
              />
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex justify-between items-center pt-2">
            <div className="text-[11px] text-slate-500">
              {selectedFile
                ? `Ready to process ${selectedFile.name}`
                : inputText
                ? `${inputText.split(/\s+/).filter(Boolean).length} words detected`
                : 'Upload a file or paste text to proceed'}
            </div>
            <button
              onClick={handleParse}
              disabled={loading || (!selectedFile && !inputText.trim())}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting past roles & achievements...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedFile
                      ? `Extract & Structure ${selectedFile.formatType.toUpperCase()} With AI`
                      : 'Extract & Structure With AI'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Loading Progress State */}
          {loading && (
            <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>AI Resume Extraction in Progress</span>
                </span>
                <span className="text-[11px] text-blue-600">Step {loadingStep + 1} of 3</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 transition-all duration-700 rounded-full"
                  style={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-700 italic">
                {loadingStepsText[loadingStep]}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              {error.includes('GEMINI_API_KEY') && (
                <p className="text-[11px] text-red-600 pl-6">
                  Open the <strong>Settings</strong> menu in AI Studio to add your Gemini API Key.
                </p>
              )}
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedPreview && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-900 text-xs block">
                        Extraction Successful! Ready to transfer into your template.
                      </span>
                      <span className="text-[10px] text-emerald-700">
                        Candidate profile, past experience, metrics, and skill categories parsed.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleApplyToTemplate}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <span>Transfer & Start Editing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Candidate</div>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {parsedPreview.personalInfo.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {parsedPreview.personalInfo.title || 'Extracted'}
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Roles Found</div>
                    <div className="font-bold text-slate-900 text-xs">
                      {parsedPreview.experiences.length} positions
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {parsedPreview.experiences.reduce((acc: number, e: any) => acc + (e.bullets?.length || 0), 0)} bullets
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Skill Groups</div>
                    <div className="font-bold text-slate-900 text-xs">
                      {parsedPreview.skills.length} categories
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {parsedPreview.skills.reduce((acc: number, s: any) => acc + (s.skills?.length || 0), 0)} skills
                    </div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Education</div>
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {parsedPreview.education[0]?.degree || 'Extracted'}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {parsedPreview.education[0]?.school || ''}
                    </div>
                  </div>
                </div>

                {/* Extracted preview detail */}
                <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-2 max-h-48 overflow-y-auto">
                  <div className="font-semibold text-slate-800 text-xs">Past Positions & Achievements Extracted:</div>
                  <div className="space-y-2">
                    {parsedPreview.experiences.map((exp: any, i: number) => (
                      <div key={i} className="text-[11px] text-slate-600 border-l-2 border-emerald-400 pl-2">
                        <span className="font-bold text-slate-800">{exp.role}</span> at {exp.company}{' '}
                        <span className="text-slate-400">({exp.startDate} – {exp.endDate})</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {exp.bullets?.length || 0} bullet points extracted
                          {exp.bullets?.[0]?.text && (
                            <span className="block text-slate-600 italic truncate mt-0.5">
                              "{exp.bullets[0].text}"
                            </span>
                          )}
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
            Supports PDF (.pdf) and Word (.docx, .doc) resumes. All parsed data is fully editable after import.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
