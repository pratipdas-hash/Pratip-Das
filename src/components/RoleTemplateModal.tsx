import React from 'react';
import { TemplateSettings, RoleTemplateConfig } from '../types';
import { RoleTemplateSelector } from './RoleTemplateSelector';
import { X, Briefcase, Sparkles, ShieldCheck } from 'lucide-react';

interface RoleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: TemplateSettings;
  currentTitle?: string;
  onApplyRoleTemplate: (config: RoleTemplateConfig, reorderSections: boolean) => void;
}

export const RoleTemplateModal: React.FC<RoleTemplateModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  currentTitle = '',
  onApplyRoleTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Role-Based ATS Template Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Any Job Role
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Instantly tailor typography, accents, and section hierarchy to your specific industry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Every generated template maintains 100% single-column ATS parsability while matching the aesthetic expectations of industry recruiters.
            </span>
          </div>

          <RoleTemplateSelector
            currentSettings={currentSettings}
            currentTitle={currentTitle}
            onApplyRoleTemplate={(config, reorderSections) => {
              onApplyRoleTemplate(config, reorderSections);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
