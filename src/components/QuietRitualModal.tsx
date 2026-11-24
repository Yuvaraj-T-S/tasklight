import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { Task } from '../types';

interface QuietRitualModalProps {
  open: boolean;
  tasks: Task[];
  reflectionNote: string;
  onSaveReflection: (note: string) => void;
  onMoveToTomorrow: (taskId: string) => void;
  onClose: () => void;
}

export const QuietRitualModal: React.FC<QuietRitualModalProps> = ({
  open,
  tasks,
  reflectionNote,
  onSaveReflection,
  onMoveToTomorrow,
  onClose,
}) => {
  const [draftNote, setDraftNote] = useState(reflectionNote);
  const [savedToast, setSavedToast] = useState(false);

  if (!open) return null;

  const completedToday = tasks.filter((t) => t.completed);
  const openToday = tasks.filter(
    (t) => !t.completed && (t.dueBucket === 'today' || t.dueBucket === 'overdue')
  );

  const handleFinish = () => {
    onSaveReflection(draftNote);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 550);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Evening Quiet Ritual"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#17151F] p-6 shadow-2xl"
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-amber-600 dark:text-[#E2A878]">
              <Sparkles className="w-3.5 h-3.5" /> Quiet Ritual
            </span>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Wind down & plan tomorrow
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Review today&apos;s momentum and clear your head for Fri, Oct 25.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ritual"
            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.07]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.03] p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Completed</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-violet-600 dark:text-violet-300">
              {completedToday.length} {completedToday.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.03] p-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Carryover Open</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {openToday.length} {openToday.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        </div>

        {/* Carryover Reschedule */}
        {openToday.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Move unfinished items to tomorrow?
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {openToday.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#1E1B28]"
                >
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {t.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMoveToTomorrow(t.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 hover:bg-violet-100 dark:bg-violet-500/15 dark:hover:bg-violet-500/25 text-[11px] font-semibold text-violet-700 dark:text-violet-300 shrink-0 transition-colors"
                  >
                    <span>Tomorrow</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflection Input */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            One highlight or thought from today
          </label>
          <textarea
            rows={3}
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            placeholder="Shipped the token audit, ready to finalize Q4 milestones first thing tomorrow..."
            className="w-full rounded-xl border border-slate-200 dark:border-white/[0.09] bg-slate-50/70 dark:bg-[#110F17] px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 resize-none"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-[#D0BCFF] dark:hover:bg-[#C3A8FF] text-white dark:text-[#181227] text-xs font-semibold transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{savedToast ? 'Saved!' : 'Complete Ritual'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
