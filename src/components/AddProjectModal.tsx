import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';
import { PROJECT_DOT_CLASSES } from '../utils/styles';

interface AddProjectModalProps {
  open: boolean;
  onClose: () => void;
  onAddProject: (name: string, color: Project['color']) => void;
}

const COLORS: Project['color'][] = ['violet', 'blue', 'amber', 'rose', 'emerald'];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  open,
  onClose,
  onAddProject,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<Project['color']>('violet');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddProject(trimmed, color);
    setName('');
    setColor('violet');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New project"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#17151F] p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">New Project</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.07]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              Project name
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Growth"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#110F17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
              Color marker
            </span>
            <div className="flex items-center gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Select ${c} color`}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform ${
                    color === c
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${PROJECT_DOT_CLASSES[c]}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-[#D0BCFF] dark:hover:bg-[#C3A8FF] text-white dark:text-[#181227] text-xs font-semibold transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
