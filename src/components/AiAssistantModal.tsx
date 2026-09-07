import React, { useState } from 'react';
import { Sparkles, X, Check, RefreshCw, ArrowRight, Wand2, Lightbulb } from 'lucide-react';
import { ResumeData } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'bullet' | 'summary';
  initialText: string;
  targetRole?: string;
  jobDescription?: string;
  resumeData?: ResumeData;
  onApply: (text: string) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialText,
  targetRole,
  jobDescription,
  resumeData,
  onApply,
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [tone, setTone] = useState<'impactful' | 'metric-focused' | 'concise' | 'executive'>('impactful');
  const [loading, setLoading] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string>('');
  const [variations, setVariations] = useState<string[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setInputText(initialText);
    setEnhancedResult('');
    setVariations([]);
    setInsights('');
    setError(null);
  }, [initialText, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'bullet') {
        const res = await fetch('/api/ai/enhance-bullet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bullet: inputText,
            targetRole: targetRole || resumeData?.personalInfo?.title,
            jobDescription,
            tone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to enhance bullet.');
        setEnhancedResult(data.enhanced);
        setVariations(data.variations || []);
        setInsights(data.improvementsMade || '');
      } else {
        const res = await fetch('/api/ai/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData,
            jobDescription,
            tone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate summary.');
        setEnhancedResult(data.summary);
        setVariations([]);
        setInsights(data.atsTip || '');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during AI processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'bullet' ? 'AI Bullet Enhancer (Google XYZ Formula)' : 'AI Professional Summary Tailor'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'bullet'
                  ? 'Turns passive descriptions into quantifiable achievements with strong action verbs.'
                  : 'Tailors your summary with top ATS keywords from the job description.'}
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

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Tone Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Optimization Tone & Focus:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'impactful', label: 'Impactful' },
                { id: 'metric-focused', label: 'Metric Heavy' },
                { id: 'concise', label: 'Concise' },
                { id: 'executive', label: 'Executive' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id as any)}
                  className={`py-1.5 px-2 rounded-lg border text-center font-medium transition-all ${
                    tone === t.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">
                {mode === 'bullet' ? 'Original Bullet Point:' : 'Base Details / Notes:'}
              </label>
              {jobDescription && (
                <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                  Target Job Description Attached
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                mode === 'bullet'
                  ? 'e.g. Worked on the API and reduced latency...'
                  : 'Input any background notes or leave empty to auto-extract from your resume experience.'
              }
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || (mode === 'bullet' && !inputText.trim())}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Optimizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>{mode === 'bullet' ? 'Enhance Achievement' : 'Generate Optimized Summary'}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Results Area */}
          {enhancedResult && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Recommended ATS Version
                  </span>
                  <button
                    onClick={() => {
                      onApply(enhancedResult);
                      onClose();
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                  >
                    Apply to Resume
                  </button>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-lg border border-emerald-100">
                  {enhancedResult}
                </p>
                {insights && (
                  <div className="text-[11px] text-emerald-800 flex items-start gap-1.5 pt-1">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{insights}</span>
                  </div>
                )}
              </div>

              {/* Variations */}
              {variations.length > 0 && (
                <div className="space-y-2">
                  <div className="font-semibold text-slate-700 text-xs">Alternative Variations:</div>
                  {variations.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3 hover:border-slate-300"
                    >
                      <p className="text-slate-700 leading-relaxed text-xs flex-1">{v}</p>
                      <button
                        onClick={() => {
                          onApply(v);
                          onClose();
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 bg-white border border-blue-200 rounded shadow-2xs shrink-0"
                      >
                        Use this
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Google XYZ Formula: Action Verb + Measurable Metric + Context</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
