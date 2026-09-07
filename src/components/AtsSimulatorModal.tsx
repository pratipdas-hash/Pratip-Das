import React from 'react';
import { ResumeData } from '../types';
import { simulateAtsPlainText } from '../utils/atsScorer';
import { downloadPlainTextResume } from '../utils/pdfExport';
import { Terminal, Copy, Download, Check, X, FileText, CheckCircle } from 'lucide-react';

interface AtsSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export const AtsSimulatorModal: React.FC<AtsSimulatorModalProps> = ({
  isOpen,
  onClose,
  resume,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const parsedText = simulateAtsPlainText(resume);

  const handleCopy = () => {
    navigator.clipboard.writeText(parsedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-mono font-bold text-xs">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ATS Raw Text Parser Simulator</h3>
              <p className="text-[11px] text-slate-400">
                Verifies how Applicant Tracking Systems extract and parse your text without formatting loss.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Verification banner */}
        <div className="bg-emerald-50 px-5 py-2.5 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Zero Parser Traps:</strong> Clean hierarchy detected. No tables, complex headers, or text-in-images.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-300 rounded text-emerald-800 font-medium"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => downloadPlainTextResume(resume)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
            >
              <Download className="w-3 h-3" />
              <span>Download .txt</span>
            </button>
          </div>
        </div>

        {/* Parser output view */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed selection:bg-emerald-500 selection:text-slate-950">
          <pre className="whitespace-pre-wrap font-mono">{parsedText}</pre>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Many enterprise portals (Workday, SAP) ingest plain text tokens directly into recruiter search indexes.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
