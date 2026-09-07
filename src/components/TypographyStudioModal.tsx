import React, { useState } from 'react';
import {
  TemplateSettings,
  FontFamily,
  HeadingWeight,
  HeadingTracking,
  HeadingScale,
  BodyFontWeight,
} from '../types';
import {
  FONT_CATALOG,
  CURATED_FONT_PAIRINGS,
  FontMetadata,
  FontPairingPreset,
  getFontFamilyCss,
  getHeadingTrackingStyle,
  getHeadingWeightValue,
  getHeadingScaleMultiplier,
  getBodyFontWeightValue,
} from '../data/typographyPresets';
import {
  Type,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Sliders,
  Eye,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface TypographyStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TemplateSettings;
  onChange: (newSettings: TemplateSettings) => void;
}

type StudioTab = 'catalog' | 'pairings' | 'hierarchy';

export const TypographyStudioModal: React.FC<TypographyStudioModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('catalog');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'Sans-Serif' | 'Serif' | 'Monospace'>('all');
  const [specimenText, setSpecimenText] = useState<string>('Staff Full Stack Architect & Distributed Systems Engineer');

  if (!isOpen) return null;

  const updateSetting = <K extends keyof TemplateSettings>(key: K, value: TemplateSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const applyPairing = (pairing: FontPairingPreset) => {
    onChange({
      ...settings,
      fontFamily: pairing.bodyFont,
      headingFontFamily: pairing.headingFont,
    });
  };

  const filteredFonts = FONT_CATALOG.filter((f) => {
    if (categoryFilter === 'all') return true;
    return f.category === categoryFilter;
  });

  const headingFont = settings.headingFontFamily || settings.fontFamily;
  const headingScaleMult = getHeadingScaleMultiplier(settings.headingScale);
  const headingCalculatedSize = Math.round(settings.baseFontSize * headingScaleMult);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Typography & Font Studio</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  15 ATS-Certified Fonts
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Curated typefaces, custom heading-to-body pairings, and fine-tuned optical scales.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'catalog'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Font Catalog & Specimens ({FONT_CATALOG.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('pairings')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'pairings'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Curated Font Duos ({CURATED_FONT_PAIRINGS.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'hierarchy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Optical Scale & Hierarchy</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="hidden sm:inline">Active:</span>
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              H: {headingFont}
            </span>
            <span>+</span>
            <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              Body: {settings.fontFamily}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Pane (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* TAB 1: CATALOG */}
            {activeTab === 'catalog' && (
              <div className="space-y-4">
                {/* Filter and Sample Text Input */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {(['all', 'Sans-Serif', 'Serif', 'Monospace'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                          categoryFilter === cat
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {cat === 'all' ? 'All Types' : cat}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={specimenText}
                    onChange={(e) => setSpecimenText(e.target.value)}
                    placeholder="Type custom preview text..."
                    className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 w-full sm:w-60 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    title="Live preview text"
                  />
                </div>

                {/* Font List */}
                <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1.5">
                  {filteredFonts.map((font) => {
                    const isCurrentBody = settings.fontFamily === font.family;
                    const isCurrentHeading = (settings.headingFontFamily || settings.fontFamily) === font.family;

                    return (
                      <div
                        key={font.family}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isCurrentBody && isCurrentHeading
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                            : isCurrentBody
                            ? 'border-blue-500 bg-blue-50/40'
                            : isCurrentHeading
                            ? 'border-purple-500 bg-purple-50/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold text-sm text-slate-900"
                              style={{ fontFamily: font.cssFamily }}
                            >
                              {font.family}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {font.category}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                              {font.atsRating}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateSetting('fontFamily', font.family)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                isCurrentBody
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title="Set as standard body font"
                            >
                              {isCurrentBody && <Check className="w-3 h-3" />}
                              Body Font
                            </button>
                            <button
                              onClick={() => updateSetting('headingFontFamily', font.family)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                                isCurrentHeading
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                              title="Set as section headers and candidate name font"
                            >
                              {isCurrentHeading && <Check className="w-3 h-3" />}
                              Heading Font
                            </button>
                          </div>
                        </div>

                        {/* Specimen Preview */}
                        <div
                          className="text-slate-800 text-sm sm:text-base py-1.5 px-2.5 bg-slate-50 rounded-lg border border-slate-100 leading-snug break-words"
                          style={{ fontFamily: font.cssFamily }}
                        >
                          {specimenText || font.specimen}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span>{font.tagline}</span>
                          <span className="font-medium text-slate-600">Best For: {font.bestFor}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: PAIRINGS */}
            {activeTab === 'pairings' && (
              <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1.5">
                <p className="text-xs text-slate-600 mb-2">
                  Curated typography duos tested for high visual contrast while preserving 100% ATS readability score across Workday, Taleo, and Greenhouse.
                </p>

                {CURATED_FONT_PAIRINGS.map((pairing) => {
                  const isActive =
                    settings.fontFamily === pairing.bodyFont &&
                    (settings.headingFontFamily || settings.fontFamily) === pairing.headingFont;

                  return (
                    <div
                      key={pairing.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{pairing.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                              {pairing.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{pairing.description}</p>
                        </div>

                        <button
                          onClick={() => applyPairing(pairing)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Active Duo</span>
                            </>
                          ) : (
                            <>
                              <span>Apply Duo</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Mini Specimen Box */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1.5">
                        <div
                          className="text-sm font-bold text-slate-900"
                          style={{ fontFamily: getFontFamilyCss(pairing.headingFont) }}
                        >
                          Heading: {pairing.headingFont} — Senior Technology Leader
                        </div>
                        <div
                          className="text-xs text-slate-700 leading-relaxed"
                          style={{ fontFamily: getFontFamilyCss(pairing.bodyFont) }}
                        >
                          Body: {pairing.bodyFont} — Spearheaded cloud transformation, migrating 40+ microservices to Kubernetes clusters with 99.99% availability.
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-2 italic">
                        Why it works: {pairing.rationale}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: HIERARCHY */}
            {activeTab === 'hierarchy' && (
              <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1.5">
                {/* Heading & Body font select pairing box */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    Font Allocation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Body Font (Paragraphs, Bullets, Dates)
                      </label>
                      <select
                        value={settings.fontFamily}
                        onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamily)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        {FONT_CATALOG.map((f) => (
                          <option key={f.family} value={f.family}>
                            {f.family} ({f.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-700">
                          Heading Font (Name & Sections)
                        </label>
                        {settings.headingFontFamily && settings.headingFontFamily !== settings.fontFamily && (
                          <button
                            onClick={() => updateSetting('headingFontFamily', undefined)}
                            className="text-[10px] text-indigo-600 hover:underline"
                          >
                            Sync with body
                          </button>
                        )}
                      </div>
                      <select
                        value={settings.headingFontFamily || settings.fontFamily}
                        onChange={(e) => updateSetting('headingFontFamily', e.target.value as FontFamily)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      >
                        {FONT_CATALOG.map((f) => (
                          <option key={f.family} value={f.family}>
                            {f.family} ({f.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Candidate Name & Heading Scales */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-blue-600" />
                    Heading Scales & Weight
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Candidate Name Size */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-700 mb-1">
                        <span>Candidate Name Size</span>
                        <span className="font-bold text-indigo-600">{settings.nameFontSize || 26}px</span>
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

                    {/* Section Heading Scale */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Section Heading Scale
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'compact', name: 'Compact', desc: '1.12x' },
                          { id: 'balanced', name: 'Balanced', desc: '1.22x' },
                          { id: 'prominent', name: 'Prominent', desc: '1.35x' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => updateSetting('headingScale', item.id as HeadingScale)}
                            className={`p-1.5 rounded-lg border text-center text-xs transition-colors ${
                              (settings.headingScale || 'balanced') === item.id
                                ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div>{item.name}</div>
                            <div className="text-[10px] opacity-80">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Heading Weight */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Heading Font Weight
                      </label>
                      <select
                        value={settings.headingWeight || 'bold'}
                        onChange={(e) => updateSetting('headingWeight', e.target.value as HeadingWeight)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      >
                        <option value="medium">Medium (500)</option>
                        <option value="semibold">Semi-Bold (600)</option>
                        <option value="bold">Bold (700)</option>
                        <option value="extrabold">Extra Bold (800)</option>
                      </select>
                    </div>

                    {/* Heading Letter Spacing */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Heading Letter Spacing (Tracking)
                      </label>
                      <select
                        value={settings.headingTracking || 'normal'}
                        onChange={(e) => updateSetting('headingTracking', e.target.value as HeadingTracking)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                      >
                        <option value="tight">Tight (-0.025em)</option>
                        <option value="normal">Normal (0em)</option>
                        <option value="wide">Wide (+0.05em)</option>
                        <option value="wider">Wider (+0.1em)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.uppercaseHeadings}
                        onChange={(e) => updateSetting('uppercaseHeadings', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Uppercase Section Headings (EXPERIENCE vs Experience)</span>
                    </label>
                  </div>
                </div>

                {/* Body Font Fine-Tuning */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-emerald-600" />
                    Body Copy Density
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-700 mb-1">
                        <span>Base Font Size</span>
                        <span className="font-bold text-slate-900">{settings.baseFontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="11"
                        max="15"
                        step="0.5"
                        value={settings.baseFontSize}
                        onChange={(e) => updateSetting('baseFontSize', parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-700 mb-1">
                        <span>Line Height</span>
                        <span className="font-bold text-slate-900">{settings.lineHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="1.25"
                        max="1.65"
                        step="0.05"
                        value={settings.lineHeight}
                        onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                        className="w-full accent-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Body Weight
                      </label>
                      <select
                        value={settings.bodyFontWeight || 'normal'}
                        onChange={(e) => updateSetting('bodyFontWeight', e.target.value as BodyFontWeight)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        <option value="light">Light (300)</option>
                        <option value="normal">Normal (400)</option>
                        <option value="medium">Medium (500)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Document Specimen Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-100/80 p-4 rounded-xl border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                Live Document Specimen
              </div>
              <button
                onClick={() => {
                  onChange({
                    ...settings,
                    fontFamily: 'Inter',
                    headingFontFamily: undefined,
                    headingWeight: 'bold',
                    headingTracking: 'normal',
                    headingScale: 'balanced',
                    nameFontSize: 26,
                    bodyFontWeight: 'normal',
                    baseFontSize: 13,
                    lineHeight: 1.4,
                  });
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 underline"
                title="Reset typography to safe baseline"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Baseline
              </button>
            </div>

            {/* Rendered Sample Paper */}
            <div
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex-1 overflow-hidden"
              style={{
                fontFamily: getFontFamilyCss(settings.fontFamily),
                fontWeight: getBodyFontWeightValue(settings.bodyFontWeight),
                fontSize: `${settings.baseFontSize}px`,
                lineHeight: settings.lineHeight,
                color: settings.textColor,
              }}
            >
              {/* Candidate Name Header */}
              <div className="text-center pb-3 mb-3 border-b border-slate-200">
                <h3
                  style={{
                    color: settings.primaryColor,
                    fontFamily: getFontFamilyCss(headingFont),
                    fontSize: `${settings.nameFontSize || 26}px`,
                    fontWeight: getHeadingWeightValue(settings.headingWeight) >= 700 ? 800 : 700,
                    letterSpacing: getHeadingTrackingStyle(settings.headingTracking),
                    lineHeight: 1.15,
                  }}
                >
                  Alex M. Wright
                </h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                  Senior Staff Infrastructure & Cloud Architect
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  San Francisco, CA • alex.wright@email.com • linkedin.com/in/alexwright
                </p>
              </div>

              {/* Sample Section Header */}
              <div className="mb-3">
                <div
                  className="border-b pb-1 mb-2 flex items-center justify-between"
                  style={{ borderColor: settings.primaryColor }}
                >
                  <h4
                    className={settings.uppercaseHeadings ? 'uppercase' : ''}
                    style={{
                      color: settings.primaryColor,
                      fontFamily: getFontFamilyCss(headingFont),
                      fontSize: `${headingCalculatedSize}px`,
                      fontWeight: getHeadingWeightValue(settings.headingWeight),
                      letterSpacing: getHeadingTrackingStyle(settings.headingTracking),
                      lineHeight: 1.25,
                    }}
                  >
                    Professional Experience
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs font-semibold">
                    <span className="text-slate-900">Lead Cloud Systems Architect</span>
                    <span className="text-slate-500 text-[10px]">2021 – Present</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Datastream Technologies • San Francisco, CA
                  </div>
                  <ul className="list-disc pl-4 text-xs text-slate-700 space-y-1 mt-1">
                    <li>
                      Architected high-throughput distributed ingestion pipelines handling 850M+ daily events.
                    </li>
                    <li>
                      Reduced infrastructure operational cloud expenses by 38% via automated pod rightsizing.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Sample Skills Section */}
              <div>
                <div
                  className="border-b pb-1 mb-2 flex items-center justify-between"
                  style={{ borderColor: settings.primaryColor }}
                >
                  <h4
                    className={settings.uppercaseHeadings ? 'uppercase' : ''}
                    style={{
                      color: settings.primaryColor,
                      fontFamily: getFontFamilyCss(headingFont),
                      fontSize: `${headingCalculatedSize}px`,
                      fontWeight: getHeadingWeightValue(settings.headingWeight),
                      letterSpacing: getHeadingTrackingStyle(settings.headingTracking),
                      lineHeight: 1.25,
                    }}
                  >
                    Technical Competencies
                  </h4>
                </div>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Core:</span> Go, TypeScript, React, Docker, Kubernetes, AWS, PostgreSQL, Terraform
                </p>
              </div>
            </div>

            {/* Footer Summary Chips */}
            <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Workday & Taleo Compliant
              </span>
              <span>
                Heading: <strong>{headingFont}</strong> ({headingCalculatedSize}px)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Tip: Paired typography establishes executive presence without risking ATS parsing failure.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            Apply & Close Studio
          </button>
        </div>

      </div>
    </div>
  );
};
