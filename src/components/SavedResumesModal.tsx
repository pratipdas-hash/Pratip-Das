import React, { useState } from 'react';
import { ResumeData, TemplateSettings, SavedResumeSnapshot } from '../types';
import { Save, Clock, Trash2, ArrowRight, X, Plus, Check, FileText } from 'lucide-react';

interface SavedResumesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResume: ResumeData;
  currentSettings: TemplateSettings;
  onLoadResumeSnapshot: (resume: ResumeData, settings?: TemplateSettings) => void;
}

const STORAGE_KEY = 'ats_saved_resume_snapshots';

export const SavedResumesModal: React.FC<SavedResumesModalProps> = ({
  isOpen,
  onClose,
  currentResume,
  currentSettings,
  onLoadResumeSnapshot,
}) => {
  const [snapshots, setSnapshots] = useState<SavedResumeSnapshot[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'snap-default',
        title: 'Software Engineering Master Version',
        savedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        resume: currentResume,
        settings: currentSettings,
      },
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTitle.trim() || `${currentResume.personalInfo.fullName || 'My'} Resume (${new Date().toLocaleDateString()})`;

    const newSnapshot: SavedResumeSnapshot = {
      id: `snap-${Date.now()}`,
      title,
      savedAt: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      resume: JSON.parse(JSON.stringify(currentResume)),
      settings: JSON.parse(JSON.stringify(currentSettings)),
    };

    const updated = [newSnapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setNewTitle('');
    setSuccessMessage(`Saved snapshot "${newSnapshot.title}" successfully!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter((s) => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Saved Resumes & Version Snapshots</h3>
              <p className="text-[11px] text-slate-500">
                Keep multiple tailored versions for different job applications and switch between them anytime.
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
          {/* Create New Snapshot Form */}
          <form
            onSubmit={handleSaveSnapshot}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
          >
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Save Current Resume as a New Version
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Version Name (e.g. Google Cloud App, Lead Architect 2026)"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Version</span>
              </button>
            </div>

            {successMessage && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>

          {/* Snapshots List */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-700 text-xs flex items-center justify-between">
              <span>Saved Versions ({snapshots.length})</span>
              <span className="text-[11px] text-slate-400">Click Load to restore any version</span>
            </div>

            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{snap.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Saved {snap.savedAt}</span>
                        <span className="text-slate-300">•</span>
                        <span>{snap.resume.experiences?.length || 0} positions</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onLoadResumeSnapshot(snap.resume, snap.settings);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span>Load</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete version"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Auto-save is active continuously. Snapshots let you bookmark specific drafts.
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
