import React, { useState } from 'react';
import { Calendar, Check, Clock, Flag, Folder, Hash, Plus, Trash2, X } from 'lucide-react';
import { DueBucket, Priority, Project, Task } from '../types';
import { getDueLabelForBucket, getPriorityLabel, getTagBadgeClass } from '../utils/styles';

interface TaskDetailModalProps {
  task: Task | null;
  projects: Project[];
  availableTags: string[];
  onClose: () => void;
  onUpdateTask: (updated: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  projects,
  availableTags,
  onClose,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [newSubtask, setNewSubtask] = useState('');

  if (!task) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    onUpdateTask({
      ...task,
      subtasks: [
        ...task.subtasks,
        { id: `st-${Date.now()}`, title: trimmed, completed: false },
      ],
    });
    setNewSubtask('');
  };

  const toggleSubtask = (subId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.map((s) =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const removeSubtask = (subId: string) => {
    onUpdateTask({
      ...task,
      subtasks: task.subtasks.filter((s) => s.id !== subId),
    });
  };

  const toggleTag = (tag: string) => {
    const exists = task.tags.includes(tag);
    onUpdateTask({
      ...task,
      tags: exists ? task.tags.filter((t) => t !== tag) : [...task.tags, tag],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end bg-black/45 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-md max-h-[90vh] md:max-h-full overflow-y-auto rounded-t-3xl md:rounded-none md:border-l border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#15131C] p-6 shadow-2xl flex flex-col"
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() =>
              onUpdateTask({
                ...task,
                completed: !task.completed,
                completedAt: !task.completed
                  ? new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                  : undefined,
              })
            }
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
              task.completed
                ? 'bg-violet-600 text-white border-violet-600 dark:bg-[#B69DF8] dark:text-[#141022] dark:border-[#B69DF8]'
                : 'bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/[0.1] hover:border-violet-400'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{task.completed ? 'Completed' : 'Mark Complete'}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onDeleteTask(task.id);
                onClose();
              }}
              aria-label="Delete task"
              title="Delete task"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-300 dark:hover:bg-rose-500/15 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.07] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Notes */}
        <div className="mt-5 space-y-4">
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdateTask({ ...task, title: e.target.value })}
            aria-label="Task title"
            className="w-full text-lg font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent focus:border-violet-500 focus:outline-none pb-1"
          />

          <textarea
            rows={3}
            value={task.notes || ''}
            onChange={(e) => onUpdateTask({ ...task, notes: e.target.value })}
            placeholder="Add context, links, or focus notes..."
            className="w-full rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#1B1825] px-3 py-2.5 text-[13.5px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 resize-none"
          />

          {/* Metadata Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="block">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" /> Schedule
              </span>
              <select
                value={task.dueBucket}
                onChange={(e) => {
                  const bucket = e.target.value as DueBucket;
                  onUpdateTask({
                    ...task,
                    dueBucket: bucket,
                    dueLabel: getDueLabelForBucket(bucket),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#1B1825] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="overdue">Overdue (Yesterday)</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow (Fri, Oct 25)</option>
                <option value="later">Later (Next week)</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Flag className="w-3.5 h-3.5" /> Priority
              </span>
              <select
                value={task.priority}
                onChange={(e) =>
                  onUpdateTask({ ...task, priority: e.target.value as Priority })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#1B1825] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                  <option key={p} value={p}>
                    {getPriorityLabel(p)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Folder className="w-3.5 h-3.5" /> Project
              </span>
              <select
                value={task.projectId || ''}
                onChange={(e) => onUpdateTask({ ...task, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#1B1825] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" /> Time / Duration
              </span>
              <input
                type="text"
                value={task.dueTime || task.duration || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(':')) {
                    onUpdateTask({ ...task, dueTime: val, duration: undefined });
                  } else {
                    onUpdateTask({ ...task, duration: val || undefined, dueTime: undefined });
                  }
                }}
                placeholder="e.g. 4:00 PM or 45m"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#1B1825] text-xs font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              />
            </label>
          </div>

          {/* Tags */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Hash className="w-3.5 h-3.5" /> Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const active = task.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${getTagBadgeClass(
                      tag,
                      active
                    )}`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtasks */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Subtasks
              </span>
              <span className="font-mono-tabular text-[11px] text-slate-400">
                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
              </span>
            </div>

            <div className="space-y-1.5">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05]"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubtask(sub.id)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                  >
                    <span
                      className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                        sub.completed
                          ? 'bg-violet-600 border-violet-600 dark:bg-violet-400 dark:border-violet-400 text-white dark:text-[#141022]'
                          : 'border-slate-300 dark:border-white/25'
                      }`}
                    >
                      {sub.completed && <Check className="w-3 h-3 stroke-[2.75]" />}
                    </span>
                    <span
                      className={`text-[13px] truncate ${
                        sub.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSubtask(sub.id)}
                    aria-label="Remove subtask"
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#1B1825] text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.07] dark:hover:bg-white/[0.12] text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
