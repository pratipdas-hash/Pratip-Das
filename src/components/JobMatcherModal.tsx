import React, { useState } from 'react';
import { ResumeData, AtsMatchAnalysis } from '../types';
import { Target, Sparkles, AlertTriangle, CheckCircle2, X, Plus, RefreshCw, ArrowRight } from 'lucide-react';
import { sampleJobDescription } from '../data/sampleResumes';

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
  jobDescription: string;
  onUpdateJobDescription: (jd: string) => void;
  onAddSkill: (skill: string) => void;
}

export const JobMatcherModal: React.FC<JobMatcherModalProps> = ({
  isOpen,
  onClose,
  resume,
  jobDescription,
  onUpdateJobDescription,
  onAddSkill,
}) => {
  const [analysis, setAnalysis] = useState<AtsMatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter or paste a job description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/analyze-job-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData: resume,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze job fit.');
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJD = () => {
    onUpdateJobDescription(sampleJobDescription);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Job Description Matcher & ATS Keyword Optimizer
              </h3>
              <p className="text-[11px] text-slate-500">
                Simulates real-world ATS screening algorithms (Greenhouse, Workday, Lever) to match qualifications.
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Input Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700">Paste Target Job Description (JD):</label>
              <button
                onClick={loadSampleJD}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Load Sample Tech Role JD
              </button>
            </div>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => onUpdateJobDescription(e.target.value)}
              placeholder="Paste the full job posting text here (responsibilities, requirements, technical stack)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-500">
                {jobDescription ? `${jobDescription.split(/\s+/).filter(Boolean).length} words` : 'No JD loaded'}
              </span>
              <button
                onClick={handleRunAnalysis}
                disabled={loading || !jobDescription.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing ATS Alignment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Deep ATS Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4 pt-3 border-t border-slate-200">
              {/* Top Score Banner */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    ATS Match Score
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                    {analysis.matchScore}
                    <span className="text-base font-normal text-slate-500"> / 100</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {analysis.matchScore >= 80
                      ? 'High probability of passing automated screening filters.'
                      : analysis.matchScore >= 60
                      ? 'Moderate fit. Incorporate suggested missing keywords to increase ranking.'
                      : 'Low alignment. Add missing hard skills and tailor bullet points.'}
                  </div>
                </div>

                <div className="w-20 h-20 relative flex items-center justify-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${
                      analysis.matchScore >= 80
                        ? 'bg-emerald-600'
                        : analysis.matchScore >= 60
                        ? 'bg-blue-600'
                        : 'bg-amber-600'
                    }`}
                  >
                    {analysis.matchScore}%
                  </div>
                </div>
              </div>

              {/* Skills breakdown: Found vs Missing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Missing Hard Skills */}
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Missing Hard Skills (Critical)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingHardSkills.length > 0 ? (
                      analysis.missingHardSkills.map((skill, i) => (
                        <button
                          key={i}
                          onClick={() => onAddSkill(skill)}
                          className="group inline-flex items-center gap-1 px-2 py-0.5 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-md text-[11px] transition-colors"
                          title="Click to add to Resume Skills"
                        >
                          <span>{skill}</span>
                          <Plus className="w-3 h-3 text-rose-500 group-hover:scale-125 transition-transform" />
                        </button>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[11px]">All core hard skills detected!</span>
                    )}
                  </div>
                  <p className="text-[10px] text-rose-700">
                    Tip: Click any missing skill above to instantly add it to your resume.
                  </p>
                </div>

                {/* Found Hard Skills */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Matched Hard Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.foundHardSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-white text-emerald-800 border border-emerald-300 rounded-md text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keyword Placement Suggestions */}
              {analysis.keywordSuggestions && analysis.keywordSuggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-xs">
                    Recommended Keyword Placements:
                  </div>
                  <div className="space-y-1.5">
                    {analysis.keywordSuggestions.map((item, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5"
                      >
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded text-[11px] shrink-0">
                          {item.keyword}
                        </span>
                        <div className="flex-1 text-[11px]">
                          <span className="font-semibold text-slate-700 mr-1.5">
                            Target Section: {item.recommendedSection}
                          </span>
                          <span className="text-slate-600">{item.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High Impact Fixes */}
              {analysis.highImpactFixes && analysis.highImpactFixes.length > 0 && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                  <div className="font-bold text-blue-900 text-xs">Top 3 High-Impact Fixes:</div>
                  <ul className="space-y-1 text-slate-700 text-[11px] list-disc ml-4">
                    {analysis.highImpactFixes.map((fix, i) => (
                      <li key={i}>{fix}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Real-time keyword matching updates dynamically as you update your resume.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
