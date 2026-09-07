import React, { useState } from 'react';
import { TemplateSettings, SavedCustomTemplate } from '../types';
import { Bookmark, Palette, Trash2, Check, Sparkles, X, Plus, Eye, ArrowRight, LayoutTemplate } from 'lucide-react';

interface SavedTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: TemplateSettings;
  onApplyTemplate: (settings: TemplateSettings) => void;
}

const STORAGE_KEY = 'ats_saved_custom_templates';

export const SavedTemplatesModal: React.FC<SavedTemplatesModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onApplyTemplate,
}) => {
  const [savedTemplates, setSavedTemplates] = useState<SavedCustomTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'tpl-sample-1',
        name: 'Silicon Valley Minimal Tech',
        description: 'Clean JetBrains Mono accent, dark slate tones, left-accent headers',
        savedAt: new Date().toLocaleDateString(),
        settings: {
          ...currentSettings,
          preset: 'modern-tech',
          fontFamily: 'Inter',
          primaryColor: '#0f766e',
          headerStyle: 'left-accent',
          pageMargin: 15,
          lineHeight: 1.4,
        },
      },
      {
        id: 'tpl-sample-2',
        name: 'Executive Ivy League Serif',
        description: 'Sophisticated Merriweather serif with elegant divider lines for leadership roles',
        savedAt: new Date().toLocaleDateString(),
        settings: {
          ...currentSettings,
          preset: 'classic-executive',
          fontFamily: 'Merriweather',
          primaryColor: '#1e293b',
          headerStyle: 'minimal-divider',
          pageMargin: 18,
          lineHeight: 1.5,
        },
      },
    ];
  });

  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;

    const newTemplate: SavedCustomTemplate = {
      id: `tpl-${Date.now()}`,
      name: templateName.trim(),
      description: templateDesc.trim() || `Custom ${currentSettings.fontFamily} design`,
      savedAt: new Date().toLocaleDateString(),
      settings: { ...currentSettings },
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setTemplateName('');
    setTemplateDesc('');
    setSuccessMessage(`"${newTemplate.name}" saved to your template library!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Custom Template Library</h3>
              <p className="text-[11px] text-slate-500">
                Save your custom designed templates with fonts, colors, and margins. Preview & apply them anytime.
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
          {/* Save Current Design Box */}
          <form
            onSubmit={handleSaveCurrent}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                Save Current Design Configuration
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  style={{ backgroundColor: currentSettings.primaryColor }}
                  title="Primary Color"
                />
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentSettings.fontFamily} • {currentSettings.headerStyle}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template Name (e.g. My Modern Blue Tech)"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Short description / notes (optional)"
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to My Templates</span>
              </button>
            </div>

            {successMessage && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>

          {/* Saved Templates List */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-700 text-xs flex items-center justify-between">
              <span>Saved Templates ({savedTemplates.length})</span>
              <span className="text-[11px] text-slate-400">Click Apply to load any style</span>
            </div>

            {savedTemplates.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                No custom templates saved yet. Customize fonts, colors, and margins, then save above!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedTemplates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {item.name}
                        </div>
                        <button
                          onClick={() => handleDeleteTemplate(item.id)}
                          className="text-slate-400 hover:text-red-600 p-0.5"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Meta & Spec Badges */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: item.settings.primaryColor }}
                        />
                        <span className="text-[10px] text-slate-600 font-mono truncate">
                          {item.settings.fontFamily} • {item.settings.headerStyle}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onApplyTemplate(item.settings);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition-colors"
                      >
                        <span>Apply</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Applying a template updates fonts, colors, and spacing without altering your resume text.
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
