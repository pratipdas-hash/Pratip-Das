import React, { useState } from 'react';
import { ResumeData, SectionId, CustomSection } from '../types';
import { GripVertical, Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Check } from 'lucide-react';

interface SectionManagerProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  activeSectionId: SectionId | null;
  onSelectSection: (id: SectionId) => void;
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Professional Summary',
  skills: 'Core Competencies & Skills',
  experience: 'Work Experience',
  projects: 'Key Projects',
  education: 'Education',
  certifications: 'Certifications',
};

export const SectionManager: React.FC<SectionManagerProps> = ({
  resume,
  onChange,
  activeSectionId,
  onSelectSection,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // All known section IDs
  const allAvailableSections = [
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    ...resume.customSections.map((cs) => cs.id),
  ];

  // Active section order
  const sectionOrder = resume.sectionOrder;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    onChange({
      ...resume,
      sectionOrder: newOrder,
    });
    setDraggedIndex(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    onChange({
      ...resume,
      sectionOrder: newOrder,
    });
  };

  const toggleSection = (id: SectionId) => {
    const exists = sectionOrder.includes(id);
    let newOrder: SectionId[];
    if (exists) {
      newOrder = sectionOrder.filter((item) => item !== id);
    } else {
      newOrder = [...sectionOrder, id];
    }
    onChange({
      ...resume,
      sectionOrder: newOrder,
    });
  };

  const addCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newCustomSec: CustomSection = {
      id: newId,
      title: newSectionTitle.trim(),
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'Section Item Title',
          subtitle: 'Organization / Role',
          date: '2024',
          description: 'Key accomplishment or detail relevant to target job.',
        },
      ],
    };

    onChange({
      ...resume,
      customSections: [...resume.customSections, newCustomSec],
      sectionOrder: [...resume.sectionOrder, newId],
    });

    setNewSectionTitle('');
    setShowAddModal(false);
    onSelectSection(newId);
  };

  const removeCustomSection = (id: string) => {
    onChange({
      ...resume,
      customSections: resume.customSections.filter((cs) => cs.id !== id),
      sectionOrder: resume.sectionOrder.filter((s) => s !== id),
    });
  };

  const getSectionTitle = (id: string) => {
    if (SECTION_LABELS[id]) return SECTION_LABELS[id];
    const found = resume.customSections.find((cs) => cs.id === id);
    return found ? found.title : id;
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Resume Section Architecture</h3>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Drag to reorder sections. Standard ATS order: Summary → Skills → Experience → Education.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom Section
        </button>
      </div>

      {/* Add Custom Section Box */}
      {showAddModal && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2.5">
          <label className="block font-semibold text-blue-900">
            Create Custom Section (e.g. Publications, Volunteer Work, Languages)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Volunteer Experience or Honors"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSection()}
              className="flex-1 bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={addCustomSection}
              className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reorderable Section List */}
      <div className="space-y-1.5">
        {sectionOrder.map((sectionId, idx) => {
          const isCustom = sectionId.startsWith('custom-');
          const isSelected = activeSectionId === sectionId;

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onClick={() => onSelectSection(sectionId)}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                draggedIndex === idx ? 'opacity-40 border-blue-400 bg-blue-50' : 'opacity-100'
              } ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 ring-1 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-0.5"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <span>{getSectionTitle(sectionId)}</span>
                  {isCustom && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-normal">
                      Custom
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, 'up');
                  }}
                  disabled={idx === 0}
                  className="p-1 hover:text-slate-800 disabled:opacity-25"
                  title="Move Up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, 'down');
                  }}
                  disabled={idx === sectionOrder.length - 1}
                  className="p-1 hover:text-slate-800 disabled:opacity-25"
                  title="Move Down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(sectionId);
                  }}
                  className="p-1 hover:text-red-600"
                  title="Hide Section"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                </button>
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCustomSection(sectionId);
                    }}
                    className="p-1 hover:text-red-600"
                    title="Delete Custom Section"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden Sections to enable back */}
      {allAvailableSections.some((s) => !sectionOrder.includes(s)) && (
        <div className="pt-2 border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Hidden Sections:</div>
          <div className="flex flex-wrap gap-1.5">
            {allAvailableSections
              .filter((s) => !sectionOrder.includes(s))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSection(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs"
                >
                  <Plus className="w-3 h-3 text-slate-500" />
                  <span>{getSectionTitle(s)}</span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
