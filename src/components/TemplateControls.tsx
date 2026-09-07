import React, { useState } from 'react';
import {
  TemplateSettings,
  TemplatePreset,
  FontFamily,
  HeaderStyle,
  BulletStyle,
  RoleTemplateConfig,
  HeadingWeight,
  HeadingTracking,
  HeadingScale,
} from '../types';
import {
  Palette,
  Sliders,
  Layout,
  Type,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Wand2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { RoleTemplateSelector } from './RoleTemplateSelector';
import { TypographyStudioModal } from './TypographyStudioModal';
import { FONT_CATALOG, CURATED_FONT_PAIRINGS } from '../data/typographyPresets';

interface TemplateControlsProps {
  settings: TemplateSettings;
  onChange: (newSettings: TemplateSettings) => void;
  onResetToBaseline: () => void;
  onOpenSavedTemplates?: () => void;
  onOpenRoleTemplateModal?: () => void;
  currentTitle?: string;
  onApplyRoleTemplate?: (config: RoleTemplateConfig, reorderSections: boolean) => void;
}

const COLOR_PRESETS = [
  { name: 'Slate Deep', hex: '#0f172a' },
  { name: 'Navy Corporate', hex: '#1e3a8a' },
  { name: 'Forest Green', hex: '#064e3b' },
  { name: 'Charcoal Black', hex: '#18181b' },
  { name: 'Burgundy Executive', hex: '#701a75' },
  { name: 'Steel Indigo', hex: '#312e81' },
  { name: 'Teal Modern', hex: '#115e59' },
];

export const TemplateControls: React.FC<TemplateControlsProps> = ({
  settings,
  onChange,
  onResetToBaseline,
  onOpenSavedTemplates,
  onOpenRoleTemplateModal,
  currentTitle = '',
  onApplyRoleTemplate,
}) => {
  const [showInlineRoleSelector, setShowInlineRoleSelector] = useState<boolean>(false);
  const [showTypographyStudio, setShowTypographyStudio] = useState<boolean>(false);

  const applyPreset = (preset: TemplatePreset) => {
    let updated: Partial<TemplateSettings> = { preset };

    switch (preset) {
      case 'classic-executive':
        updated = {
          preset,
          fontFamily: 'Inter',
          baseFontSize: 13,
          lineHeight: 1.4,
          pageMargin: 15,
          sectionGap: 14,
          itemGap: 10,
          primaryColor: '#0f172a',
          headerStyle: 'underline',
          bulletStyle: 'disc',
          columnLayout: 'single',
          uppercaseHeadings: true,
          showDividers: true,
        };
        break;
      case 'modern-tech':
        updated = {
          preset,
          fontFamily: 'Plus Jakarta Sans',
          baseFontSize: 13,
          lineHeight: 1.45,
          pageMargin: 14,
          sectionGap: 16,
          itemGap: 10,
          primaryColor: '#1e40af',
          headerStyle: 'left-accent',
          bulletStyle: 'disc',
          columnLayout: 'single',
          uppercaseHeadings: true,
          showDividers: true,
        };
        break;
      case 'creative-hybrid':
        updated = {
          preset,
          fontFamily: 'Outfit',
          baseFontSize: 13,
          lineHeight: 1.45,
          pageMargin: 14,
          sectionGap: 14,
          itemGap: 10,
          primaryColor: '#0f766e',
          headerStyle: 'subtle-fill',
          bulletStyle: 'arrow',
          columnLayout: 'two-column-hybrid',
          uppercaseHeadings: false,
          showDividers: false,
        };
        break;
      case 'minimal-sharp':
        updated = {
          preset,
          fontFamily: 'Inter',
          baseFontSize: 12.5,
          lineHeight: 1.5,
          pageMargin: 18,
          sectionGap: 18,
          itemGap: 12,
          primaryColor: '#18181b',
          headerStyle: 'minimal-divider',
          bulletStyle: 'hyphen',
          columnLayout: 'single',
          uppercaseHeadings: true,
          showDividers: true,
        };
        break;
      case 'compact-dense':
        updated = {
          preset,
          fontFamily: 'Inter',
          baseFontSize: 11.5,
          lineHeight: 1.3,
          pageMargin: 11,
          sectionGap: 10,
          itemGap: 7,
          primaryColor: '#0f172a',
          headerStyle: 'underline',
          bulletStyle: 'disc',
          columnLayout: 'single',
          uppercaseHeadings: true,
          showDividers: true,
        };
        break;
      case 'custom-scratch':
        updated = {
          preset: 'custom-scratch',
        };
        break;
    }

    onChange({ ...settings, ...updated });
  };

  const updateSetting = <K extends keyof TemplateSettings>(key: K, value: TemplateSettings[K]) => {
    onChange({
      ...settings,
      preset: 'custom-scratch', // user customized a property
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Role-Based ATS Template Card */}
      <div className="p-3.5 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-white rounded-xl border border-blue-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs">Role-Tailored Template</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Adaptive
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Active: <strong className="text-slate-800 font-semibold">{settings.appliedRoleName || 'General Professional'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenRoleTemplateModal && (
              <button
                onClick={onOpenRoleTemplateModal}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Open Role Template Studio"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Browse Roles</span>
              </button>
            )}
            <button
              onClick={() => setShowInlineRoleSelector(!showInlineRoleSelector)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white/80 rounded-lg transition-colors border border-slate-200/60"
              title={showInlineRoleSelector ? 'Collapse Role Selector' : 'Change Job Role'}
            >
              {showInlineRoleSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {showInlineRoleSelector && onApplyRoleTemplate && (
          <div className="pt-2 border-t border-blue-200/60 animate-in fade-in">
            <RoleTemplateSelector
              currentSettings={settings}
              currentTitle={currentTitle}
              onApplyRoleTemplate={(config, reorder) => {
                onApplyRoleTemplate(config, reorder);
                setShowInlineRoleSelector(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Preset Picker */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-blue-600" />
            Template Presets
          </label>
          <div className="flex items-center gap-2">
            {onOpenSavedTemplates && (
              <button
                onClick={onOpenSavedTemplates}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200"
                title="Save current design or load past templates"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>My Saved Templates</span>
              </button>
            )}
            <button
              onClick={onResetToBaseline}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
              title="Reset to safe default"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Baseline
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'classic-executive', name: 'Classic Executive', desc: '100% ATS Safe' },
            { id: 'modern-tech', name: 'Modern Tech', desc: 'Clean Left Accent' },
            { id: 'creative-hybrid', name: 'Creative Hybrid', desc: 'Modern & Compliant' },
            { id: 'minimal-sharp', name: 'Minimal Sharp', desc: 'High Whitespace' },
            { id: 'compact-dense', name: 'Compact Dense', desc: '1-Page Max Fit' },
            { id: 'custom-scratch', name: 'Edit From Scratch', desc: 'Custom Designer' },
          ].map((item) => {
            const active = settings.preset === item.id;
            return (
              <button
                key={item.id}
                onClick={() => applyPreset(item.id as TemplatePreset)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-semibold text-xs">{item.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography Controls */}
      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-600" />
            Typography & Hierarchy
          </h4>
          <button
            onClick={() => setShowTypographyStudio(true)}
            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 transition-colors"
            title="Browse all 15 ATS fonts, specimens, and curated pairings"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Font Studio (15 Fonts)</span>
          </button>
        </div>

        {/* Quick Curated Duo Chips */}
        <div>
          <div className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Quick Curated Duos
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { name: 'Modern Tech', head: 'Plus Jakarta Sans', body: 'Inter' },
              { name: 'Wall Street', head: 'Merriweather', body: 'Lato' },
              { name: 'Executive Luxury', head: 'Playfair Display', body: 'Plus Jakarta Sans' },
              { name: 'Universal ATS', head: 'Roboto', body: 'Roboto' },
            ].map((duo) => {
              const isActive =
                settings.fontFamily === duo.body &&
                (settings.headingFontFamily || settings.fontFamily) === duo.head;
              return (
                <button
                  key={duo.name}
                  onClick={() =>
                    onChange({
                      ...settings,
                      fontFamily: duo.body as FontFamily,
                      headingFontFamily: duo.head as FontFamily,
                    })
                  }
                  className={`px-2 py-1.5 rounded-lg border text-left text-[11px] transition-colors ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs truncate">{duo.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {duo.head} + {duo.body}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Body Font Family */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-700">
              Primary Body Font (100% ATS Safe)
            </label>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
              ATS Verified
            </span>
          </div>
          <select
            value={settings.fontFamily}
            onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamily)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <optgroup label="Modern Sans-Serif">
              <option value="Inter">Inter (Clean Modern Sans)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Crisp Tech & High Readability)</option>
              <option value="Outfit">Outfit (Contemporary Geometric)</option>
              <option value="Roboto">Roboto (Google / Enterprise ATS Neutral)</option>
              <option value="Open Sans">Open Sans (Warm & Accessible)</option>
              <option value="Lato">Lato (Balanced Corporate Sans)</option>
              <option value="Poppins">Poppins (Modern Precision Geometric)</option>
            </optgroup>
            <optgroup label="Prestigious & Editorial Serifs">
              <option value="Merriweather">Merriweather (Classic Editorial Serif)</option>
              <option value="Lora">Lora (Contemporary Literary Serif)</option>
              <option value="Playfair Display">Playfair Display (Executive Display Serif)</option>
              <option value="EB Garamond">EB Garamond (Timeless Classical Judicial)</option>
              <option value="Libre Baskerville">Libre Baskerville (Ivy League & Banking Print)</option>
              <option value="Cinzel">Cinzel (Classical Roman Serif)</option>
            </optgroup>
            <optgroup label="Technical Monospaced">
              <option value="JetBrains Mono">JetBrains Mono (Developer / Systems)</option>
              <option value="Fira Code">Fira Code (Technical Code Monospace)</option>
            </optgroup>
          </select>
        </div>

        {/* Dedicated Heading Font Pairing Toggle & Select */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.headingFontFamily && settings.headingFontFamily !== settings.fontFamily)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateSetting('headingFontFamily', settings.fontFamily === 'Inter' ? 'Plus Jakarta Sans' : 'Inter');
                  } else {
                    updateSetting('headingFontFamily', undefined);
                  }
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Pair Distinct Heading Font</span>
            </label>
            {settings.headingFontFamily && settings.headingFontFamily !== settings.fontFamily && (
              <span className="text-[10px] text-indigo-600 font-medium">Active Pairing</span>
            )}
          </div>

          {settings.headingFontFamily && settings.headingFontFamily !== settings.fontFamily && (
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Heading Typeface (Candidate Name & Sections)
              </label>
              <select
                value={settings.headingFontFamily}
                onChange={(e) => updateSetting('headingFontFamily', e.target.value as FontFamily)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <optgroup label="Modern Sans-Serif">
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Outfit">Outfit</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                </optgroup>
                <optgroup label="Prestigious Serifs">
                  <option value="Playfair Display">Playfair Display (Executive Display)</option>
                  <option value="Merriweather">Merriweather (Classic Editorial)</option>
                  <option value="Lora">Lora (Contemporary Literary)</option>
                  <option value="EB Garamond">EB Garamond (Judicial & Legal)</option>
                  <option value="Libre Baskerville">Libre Baskerville (Banking)</option>
                  <option value="Cinzel">Cinzel (Roman Inscription)</option>
                </optgroup>
                <optgroup label="Technical Monospaced">
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                </optgroup>
              </select>
            </div>
          )}
        </div>

        {/* Candidate Name Size & Heading Scale */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Name Size</span>
              <span className="font-semibold">{settings.nameFontSize || 26}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="34"
              step="1"
              value={settings.nameFontSize || 26}
              onChange={(e) => updateSetting('nameFontSize', parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Heading Scale</span>
              <span className="font-semibold capitalize">{settings.headingScale || 'balanced'}</span>
            </div>
            <select
              value={settings.headingScale || 'balanced'}
              onChange={(e) => updateSetting('headingScale', e.target.value as HeadingScale)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800"
            >
              <option value="compact">Compact (1.12x)</option>
              <option value="balanced">Balanced (1.22x)</option>
              <option value="prominent">Prominent (1.35x)</option>
            </select>
          </div>
        </div>

        {/* Heading Weight & Tracking */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Heading Weight
            </label>
            <select
              value={settings.headingWeight || 'bold'}
              onChange={(e) => updateSetting('headingWeight', e.target.value as HeadingWeight)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800"
            >
              <option value="medium">Medium (500)</option>
              <option value="semibold">Semi-Bold (600)</option>
              <option value="bold">Bold (700)</option>
              <option value="extrabold">Extra Bold (800)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Heading Tracking
            </label>
            <select
              value={settings.headingTracking || 'normal'}
              onChange={(e) => updateSetting('headingTracking', e.target.value as HeadingTracking)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
              <option value="wider">Expanded</option>
            </select>
          </div>
        </div>

        {/* Font Size & Line Height */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Base Body Size</span>
              <span className="font-semibold">{settings.baseFontSize}px</span>
            </div>
            <input
              type="range"
              min="11"
              max="15"
              step="0.5"
              value={settings.baseFontSize}
              onChange={(e) => updateSetting('baseFontSize', parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Line Height</span>
              <span className="font-semibold">{settings.lineHeight}</span>
            </div>
            <input
              type="range"
              min="1.25"
              max="1.65"
              step="0.05"
              value={settings.lineHeight}
              onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Spacing & Page Margins */}
      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          Spacing & Density
        </h4>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Margins</span>
              <span className="font-semibold">{settings.pageMargin}mm</span>
            </div>
            <input
              type="range"
              min="10"
              max="24"
              step="1"
              value={settings.pageMargin}
              onChange={(e) => updateSetting('pageMargin', parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Section Gap</span>
              <span className="font-semibold">{settings.sectionGap}px</span>
            </div>
            <input
              type="range"
              min="8"
              max="26"
              step="2"
              value={settings.sectionGap}
              onChange={(e) => updateSetting('sectionGap', parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-600 mb-1">
              <span>Item Gap</span>
              <span className="font-semibold">{settings.itemGap}px</span>
            </div>
            <input
              type="range"
              min="6"
              max="18"
              step="1"
              value={settings.itemGap}
              onChange={(e) => updateSetting('itemGap', parseInt(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Accent Colors & Heading Style */}
      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-600" />
          Color & Section Styling
        </h4>

        {/* Color swatches */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Primary Accent Color
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.hex}
                onClick={() => updateSetting('primaryColor', color.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  settings.primaryColor === color.hex
                    ? 'border-blue-600 scale-110 shadow-sm'
                    : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => updateSetting('primaryColor', e.target.value)}
              className="w-7 h-7 p-0 border border-slate-300 rounded cursor-pointer ml-1"
              title="Custom Hex Color"
            />
          </div>
        </div>

        {/* Heading Style */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Heading Style
            </label>
            <select
              value={settings.headerStyle}
              onChange={(e) => updateSetting('headerStyle', e.target.value as HeaderStyle)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="underline">Underline Divider</option>
              <option value="minimal-divider">Minimal Divider Line</option>
              <option value="left-accent">Thick Left Accent</option>
              <option value="subtle-fill">Subtle Tinted Banner</option>
              <option value="pill">Rounded Pill Badge</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bullet Style
            </label>
            <select
              value={settings.bulletStyle}
              onChange={(e) => updateSetting('bulletStyle', e.target.value as BulletStyle)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="disc">Standard Circle (•)</option>
              <option value="square">Modern Square (■)</option>
              <option value="hyphen">Minimalist Hyphen (–)</option>
              <option value="arrow">Refined Arrow (›)</option>
            </select>
          </div>
        </div>

        {/* Layout & Paper format */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Column Architecture
            </label>
            <select
              value={settings.columnLayout}
              onChange={(e) => updateSetting('columnLayout', e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="single">Single Column (100% ATS Safe)</option>
              <option value="two-column-hybrid">Hybrid 2-Col (Creative)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Paper Format
            </label>
            <select
              value={settings.paperSize}
              onChange={(e) => updateSetting('paperSize', e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="letter">US Letter (8.5 × 11 in)</option>
              <option value="a4">Standard A4 (210 × 297 mm)</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <label className="text-xs text-slate-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.uppercaseHeadings}
              onChange={(e) => updateSetting('uppercaseHeadings', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Uppercase Section Titles
          </label>

          <label className="text-xs text-slate-700 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.highlightKeywords}
              onChange={(e) => updateSetting('highlightKeywords', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Highlight Matched Keywords
          </label>
        </div>
      </div>

      {/* Full-Screen Typography & Font Studio Modal */}
      <TypographyStudioModal
        isOpen={showTypographyStudio}
        onClose={() => setShowTypographyStudio(false)}
        settings={settings}
        onChange={onChange}
      />
    </div>
  );
};
