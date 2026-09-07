import React, { useState, useMemo, useRef } from 'react';
import {
  ResumeData,
  TemplateSettings,
  SectionId,
  RealtimeAtsFeedback,
  RoleTemplateConfig,
} from './types';
import {
  initialResume,
  defaultTemplateSettings,
  sampleJobDescription,
} from './data/sampleResumes';
import { evaluateResumeATS, extractKeywordsFromText } from './utils/atsScorer';
import { exportResumeToPdf, printResume, downloadPlainTextResume, downloadJsonResume } from './utils/pdfExport';
import { ResumePreview } from './components/ResumePreview';
import { ResumeFormEditor } from './components/ResumeFormEditor';
import { TemplateControls } from './components/TemplateControls';
import { SectionManager } from './components/SectionManager';
import { AiAssistantModal } from './components/AiAssistantModal';
import { JobMatcherModal } from './components/JobMatcherModal';
import { AtsSimulatorModal } from './components/AtsSimulatorModal';
import { OldResumeImporterModal } from './components/OldResumeImporterModal';
import { SavedTemplatesModal } from './components/SavedTemplatesModal';
import { SavedResumesModal } from './components/SavedResumesModal';
import { RoleTemplateModal } from './components/RoleTemplateModal';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Target,
  Terminal,
  Layers,
  Palette,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCode,
  Upload,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Eye,
  Save,
  Clock,
  Bookmark,
  History,
  Check,
  Briefcase,
} from 'lucide-react';

export default function App() {
  // State
  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('ats_resume_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialResume;
  });

  const [settings, setSettings] = useState<TemplateSettings>(() => {
    const saved = localStorage.getItem('ats_template_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return defaultTemplateSettings;
  });

  const [jobDescription, setJobDescription] = useState<string>(() => {
    return localStorage.getItem('ats_target_jd') || sampleJobDescription;
  });

  // UI state
  const [activeMainTab, setActiveMainTab] = useState<'content' | 'template' | 'layout' | 'audit'>('content');
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState<boolean>(false);

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'bullet' | 'summary'>('bullet');
  const [aiModalText, setAiModalText] = useState('');
  const [aiModalApplyCallback, setAiModalApplyCallback] = useState<((text: string) => void) | null>(null);
  const [jobMatcherOpen, setJobMatcherOpen] = useState(false);
  const [atsSimulatorOpen, setAtsSimulatorOpen] = useState(false);
  const [oldResumeImporterOpen, setOldResumeImporterOpen] = useState(false);
  const [savedTemplatesModalOpen, setSavedTemplatesModalOpen] = useState(false);
  const [savedResumesModalOpen, setSavedResumesModalOpen] = useState(false);
  const [roleTemplateModalOpen, setRoleTemplateModalOpen] = useState(false);

  // Auto-save & notification state
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-save to localStorage on every change
  React.useEffect(() => {
    localStorage.setItem('ats_resume_data', JSON.stringify(resume));
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [resume]);

  React.useEffect(() => {
    localStorage.setItem('ats_template_settings', JSON.stringify(settings));
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [settings]);

  React.useEffect(() => {
    localStorage.setItem('ats_target_jd', jobDescription);
  }, [jobDescription]);

  // Manual save trigger
  const handleManualSave = () => {
    localStorage.setItem('ats_resume_data', JSON.stringify(resume));
    localStorage.setItem('ats_template_settings', JSON.stringify(settings));
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSavedTime(now);
    setSaveToast('Resume & template saved successfully!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleLoadResumeSnapshot = (loadedResume: ResumeData, loadedSettings?: TemplateSettings) => {
    setResume(loadedResume);
    if (loadedSettings) {
      setSettings(loadedSettings);
    }
    setSaveToast('Saved version restored!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleImportOldResumeComplete = (importedResume: ResumeData) => {
    setResume(importedResume);
    setActiveMainTab('content');
    setSaveToast('Past resume imported into your template!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Apply Role-Tailored Template (adapts typography, colors, gaps, and section order)
  const handleApplyRoleTemplate = (config: RoleTemplateConfig, reorderSections: boolean) => {
    setSettings((prev) => ({
      ...prev,
      ...config.settings,
      appliedRoleName: config.roleTitle,
    }));

    if (reorderSections && config.recommendedSectionOrder && config.recommendedSectionOrder.length > 0) {
      const existingSections = resume.sectionOrder || ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
      const ordered = [...config.recommendedSectionOrder];
      existingSections.forEach((s) => {
        if (!ordered.includes(s)) ordered.push(s);
      });
      setResume((prev) => ({
        ...prev,
        sectionOrder: ordered,
      }));
    }

    setSaveToast(`Template adapted for ${config.roleTitle}!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Real-time ATS Evaluation
  const atsFeedback: RealtimeAtsFeedback = useMemo(() => {
    return evaluateResumeATS(resume, jobDescription);
  }, [resume, jobDescription]);

  // Extract JD Keywords for live highlighting
  const jdKeywords = useMemo(() => {
    return extractKeywordsFromText(jobDescription);
  }, [jobDescription]);

  // Triggers
  const handleOpenAiEnhanceBullet = (
    bulletText: string,
    onApply: (enhanced: string) => void
  ) => {
    setAiModalMode('bullet');
    setAiModalText(bulletText);
    setAiModalApplyCallback(() => onApply);
    setAiModalOpen(true);
  };

  const handleOpenAiSummary = () => {
    setAiModalMode('summary');
    setAiModalText(resume.summary);
    setAiModalApplyCallback(() => (newSummary: string) => {
      setResume((prev) => ({ ...prev, summary: newSummary }));
    });
    setAiModalOpen(true);
  };

  const handleApplyAiResult = (text: string) => {
    if (aiModalApplyCallback) {
      aiModalApplyCallback(text);
    }
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    const fileName = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    await exportResumeToPdf('resume-document', fileName, settings);
    setIsExporting(false);
  };

  const handleAddMissingSkill = (skillName: string) => {
    // Add to first skills category or create a target category
    setResume((prev) => {
      const skills = [...prev.skills];
      if (skills.length > 0) {
        if (!skills[0].skills.includes(skillName)) {
          skills[0] = {
            ...skills[0],
            skills: [...skills[0].skills, skillName],
          };
        }
      } else {
        skills.push({
          id: `skill-${Date.now()}`,
          category: 'Key Technologies',
          skills: [skillName],
        });
      }
      return { ...prev, skills };
    });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.resume) {
          setResume(parsed.resume);
          if (parsed.settings) setSettings(parsed.settings);
        } else if (parsed.personalInfo) {
          setResume(parsed);
        }
      } catch (err) {
        alert('Invalid JSON resume format.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const resetToBaseline = () => {
    setSettings(defaultTemplateSettings);
  };

  const loadSample = () => {
    setResume(initialResume);
    setSettings(defaultTemplateSettings);
    setJobDescription(sampleJobDescription);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Top Application Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  ATS Resume Builder
                </h1>
                <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                  AI Optimizer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Real-time JD scoring • Google XYZ formula • Drag & Drop template builder
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges & Auto-Save */}
          <div className="flex items-center gap-2">
            {/* Auto-save live indicator */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-saved {lastSavedTime}</span>
            </div>

            {/* Realtime ATS Score Pill */}
            <button
              onClick={() => setActiveMainTab('audit')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                atsFeedback.overallScore >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : atsFeedback.overallScore >= 60
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view ATS audit checklist"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  atsFeedback.overallScore >= 80
                    ? 'bg-emerald-500'
                    : atsFeedback.overallScore >= 60
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
              />
              <span>ATS Score: {atsFeedback.overallScore}/100</span>
            </button>

            {/* Role-Based Template Adapt Trigger */}
            <button
              onClick={() => setRoleTemplateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-800 border border-blue-200 rounded-full text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              title="Change template styling as per any job role"
            >
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline text-slate-500 font-normal">Role:</span>
              <span className="font-bold text-blue-950 truncate max-w-[140px]">
                {settings.appliedRoleName || resume.personalInfo.title || 'Tech / Engineering'}
              </span>
              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
            </button>

            {/* Job Description Match Trigger */}
            <button
              onClick={() => setJobMatcherOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold transition-colors"
              title="Target Job Description Matcher"
            >
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Match Job Description</span>
            </button>

            {/* Import Past Resume */}
            <button
              onClick={() => setOldResumeImporterOpen(true)}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
              title="Import past resume to migrate into this template"
            >
              <History className="w-3.5 h-3.5" />
              <span>Import Old Resume</span>
            </button>

            {/* Saved Templates */}
            <button
              onClick={() => setSavedTemplatesModalOpen(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
              title="Save or load customized template designs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Templates</span>
            </button>
          </div>

          {/* Action & Save Buttons */}
          <div className="flex items-center gap-2">
            {/* Manual Save Button */}
            <button
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              title="Save current resume state"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span>Save</span>
            </button>

            {/* Saved Versions Snapshot Modal Trigger */}
            <button
              onClick={() => setSavedResumesModalOpen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
              title="View saved versions & drafts"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Download high-resolution PDF"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={printResume}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200"
              title="Print / Save to Browser PDF"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Backup & Sample options */}
            <div className="relative group">
              <button
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
                title="Backup and Sample Options"
              >
                More ▾
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 text-xs hidden group-hover:block z-50">
                <button
                  onClick={() => setOldResumeImporterOpen(true)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import Old Resume</span>
                </button>
                <button
                  onClick={() => setSavedTemplatesModalOpen(true)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Saved Templates</span>
                </button>
                <button
                  onClick={() => setSavedResumesModalOpen(true)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Saved Versions</span>
                </button>
                <button
                  onClick={() => setAtsSimulatorOpen(true)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>ATS Plain Text</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() => downloadPlainTextResume(resume)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export ATS .txt</span>
                </button>
                <button
                  onClick={() => downloadJsonResume(resume, settings)}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Backup JSON</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Import JSON</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={loadSample}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Load Tech Sample</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="no-print fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Workspace: 2-Column Split View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Controls, Form, Templates, Drag-and-drop (Hidden when Fullscreen Preview is toggled) */}
        {!isFullScreenPreview && (
          <div className="no-print lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col max-h-[calc(100vh-5rem)] sticky top-16 overflow-hidden">
            {/* Main Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs">
              <button
                onClick={() => setActiveMainTab('content')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeMainTab === 'content'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Content</span>
              </button>

              <button
                onClick={() => setActiveMainTab('template')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeMainTab === 'template'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Template</span>
              </button>

              <button
                onClick={() => setActiveMainTab('layout')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeMainTab === 'layout'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layout & D&D</span>
              </button>

              <button
                onClick={() => setActiveMainTab('audit')}
                className={`flex-1 py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeMainTab === 'audit'
                    ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ATS Audit</span>
              </button>
            </div>

            {/* Tab Panes */}
            <div className="p-4 overflow-y-auto flex-1 text-xs">
              {activeMainTab === 'content' && (
                <ResumeFormEditor
                  resume={resume}
                  onChange={setResume}
                  activeSectionId={activeSectionId}
                  onOpenAiEnhanceBullet={handleOpenAiEnhanceBullet}
                  onOpenAiSummary={handleOpenAiSummary}
                  onOpenImportOldResume={() => setOldResumeImporterOpen(true)}
                  onOpenRoleTemplateModal={() => setRoleTemplateModalOpen(true)}
                />
              )}

              {activeMainTab === 'template' && (
                <TemplateControls
                  settings={settings}
                  onChange={setSettings}
                  onResetToBaseline={resetToBaseline}
                  onOpenSavedTemplates={() => setSavedTemplatesModalOpen(true)}
                  onOpenRoleTemplateModal={() => setRoleTemplateModalOpen(true)}
                  currentTitle={resume.personalInfo.title}
                  onApplyRoleTemplate={handleApplyRoleTemplate}
                />
              )}

              {activeMainTab === 'layout' && (
                <SectionManager
                  resume={resume}
                  onChange={setResume}
                  activeSectionId={activeSectionId}
                  onSelectSection={(id) => {
                    setActiveSectionId(id);
                    setActiveMainTab('content');
                  }}
                />
              )}

              {activeMainTab === 'audit' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm">Real-time ATS Compliance</span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-xs text-white ${
                          atsFeedback.overallScore >= 80
                            ? 'bg-emerald-600'
                            : atsFeedback.overallScore >= 60
                            ? 'bg-blue-600'
                            : 'bg-amber-600'
                        }`}
                      >
                        {atsFeedback.overallScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-slate-600 text-[11px]">
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500">Quantified Bullets</div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">
                          {atsFeedback.metricsRatio}% (Goal: 60%+)
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500">Strong Action Verbs</div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">
                          {atsFeedback.actionVerbScore}% (Goal: 70%+)
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500">Total Word Count</div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">
                          {atsFeedback.totalWords} words
                        </div>
                      </div>
                      <div className="p-2 bg-white rounded border border-slate-200">
                        <div className="text-slate-500">Contact Info</div>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">
                          {atsFeedback.contactCompleteness}% Complete
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {atsFeedback.warnings.length > 0 && (
                    <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Actionable ATS Improvements ({atsFeedback.warnings.length})</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 text-[11px] list-disc ml-4">
                        {atsFeedback.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {atsFeedback.strengths.length > 0 && (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ATS Strengths</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 text-[11px] list-disc ml-4">
                        {atsFeedback.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quick JD Matcher Call to action */}
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-900 text-xs">Target Job Optimization</div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Compare against your target job posting to catch missing hard skills.
                      </p>
                    </div>
                    <button
                      onClick={() => setJobMatcherOpen(true)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shrink-0 ml-2"
                    >
                      Analyze Fit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Side: Live Resume Document Preview Canvas */}
        <div
          id="resume-document-container"
          className={`${
            isFullScreenPreview ? 'lg:col-span-12' : 'lg:col-span-7'
          } w-full flex flex-col transition-all`}
        >
          {/* Document Canvas Toolbar */}
          <div className="no-print mb-2.5 flex items-center justify-between gap-2 px-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Live Preview</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                {settings.paperSize === 'letter' ? 'US Letter' : 'A4'}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-500">{settings.preset}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Zoom Controls */}
              <button
                onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                className="p-1 rounded hover:bg-white text-slate-600 border border-transparent hover:border-slate-200"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((prev) => Math.min(140, prev + 10))}
                className="p-1 rounded hover:bg-white text-slate-600 border border-transparent hover:border-slate-200"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <span className="text-slate-300 mx-0.5">|</span>

              {/* Toggle Highlight Keywords */}
              <button
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    highlightKeywords: !prev.highlightKeywords,
                  }))
                }
                className={`px-2 py-1 rounded text-[11px] font-medium border flex items-center gap-1 ${
                  settings.highlightKeywords
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Highlight JD Keywords on the resume"
              >
                <Eye className="w-3 h-3" />
                <span>Keywords</span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullScreenPreview(!isFullScreenPreview)}
                className="p-1 rounded hover:bg-white text-slate-600 border border-transparent hover:border-slate-200"
                title={isFullScreenPreview ? 'Exit Full Screen' : 'Full Screen Preview'}
              >
                {isFullScreenPreview ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Document Sheet Canvas */}
          <div className="overflow-x-auto pb-8 flex justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="shadow-xl rounded-sm border border-slate-200 bg-white"
            >
              <ResumePreview
                resume={resume}
                settings={settings}
                highlightWords={settings.highlightKeywords ? jdKeywords : []}
              />
            </div>
          </div>
        </div>
      </main>

      {/* AI Assistant Modal (Bullet & Summary Enhancer) */}
      <AiAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        mode={aiModalMode}
        initialText={aiModalText}
        targetRole={resume.personalInfo.title}
        jobDescription={jobDescription}
        resumeData={resume}
        onApply={handleApplyAiResult}
      />

      {/* Job Description Matcher Modal */}
      <JobMatcherModal
        isOpen={jobMatcherOpen}
        onClose={() => setJobMatcherOpen(false)}
        resume={resume}
        jobDescription={jobDescription}
        onUpdateJobDescription={setJobDescription}
        onAddSkill={handleAddMissingSkill}
      />

      {/* ATS Parser Simulator Modal */}
      <AtsSimulatorModal
        isOpen={atsSimulatorOpen}
        onClose={() => setAtsSimulatorOpen(false)}
        resume={resume}
      />

      {/* Old Resume Importer Modal */}
      <OldResumeImporterModal
        isOpen={oldResumeImporterOpen}
        onClose={() => setOldResumeImporterOpen(false)}
        onImportComplete={handleImportOldResumeComplete}
      />

      {/* Saved Templates Gallery & Custom Style Manager Modal */}
      <SavedTemplatesModal
        isOpen={savedTemplatesModalOpen}
        onClose={() => setSavedTemplatesModalOpen(false)}
        currentSettings={settings}
        onApplyTemplate={(newSettings) => {
          setSettings(newSettings);
          setSaveToast('Template style applied to resume!');
          setTimeout(() => setSaveToast(null), 3000);
        }}
      />

      {/* Saved Resumes & Version Snapshots Modal */}
      <SavedResumesModal
        isOpen={savedResumesModalOpen}
        onClose={() => setSavedResumesModalOpen(false)}
        currentResume={resume}
        currentSettings={settings}
        onLoadResumeSnapshot={handleLoadResumeSnapshot}
      />

      {/* Role-Based ATS Template Engine Modal */}
      <RoleTemplateModal
        isOpen={roleTemplateModalOpen}
        onClose={() => setRoleTemplateModalOpen(false)}
        currentSettings={settings}
        currentTitle={resume.personalInfo.title}
        onApplyRoleTemplate={handleApplyRoleTemplate}
      />
    </div>
  );
}
