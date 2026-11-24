import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Flag, Folder, Hash, Plus, X } from 'lucide-react';
import { DueBucket, Priority, Project } from '../types';
import { getDueLabelForBucket, getPriorityLabel, PROJECT_DOT_CLASSES } from '../utils/styles';

interface TaskComposerProps {
  projects: Project[];
  availableTags: string[];
  defaultDueBucket?: DueBucket;
  defaultProjectId?: string | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onAddTask: (payload: {
    title: string;
    dueBucket: DueBucket;
    dueLabel: string;
    priority: Priority;
    projectId: string;
    tags: string[];
    duration?: string;
  }) => void;
}

export const TaskComposer: React.FC<TaskComposerProps> = ({
  projects,
  availableTags,
  defaultDueBucket = 'today',
  defaultProjectId = null,
  inputRef,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [dueBucket, setDueBucket] = useState<DueBucket>(defaultDueBucket);
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || 'product-launch');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [openPicker, setOpenPicker] = useState<'due' | 'priority' | 'project' | 'tag' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPicker(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask({
      title: trimmed,
      dueBucket,
      dueLabel: getDueLabelForBucket(dueBucket),
      priority,
      projectId,
      tags: selectedTag ? [selectedTag] : [],
    });
    setTitle('');
    setOpenPicker(null);
  };

  return (
    <div
      ref={containerRef}
      className="hidden md:block rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#17151F] p-3.5 shadow-xs transition-colors"
    >
      <form onSubmit={handleSubmit}>
        {/* Input Row */}
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-full border border-violet-500/70 dark:border-violet-400/70 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Plus className="w-4 h-4" />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
            aria-label="Add a task"
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-200/90 dark:border-white/[0.09] bg-transparent text-[14.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-violet-500 dark:focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15"
          />

          <span className="hidden xl:inline-flex items-center px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.06] text-[11.5px] text-slate-400 dark:text-slate-500 whitespace-nowrap shrink-0">
            Press Enter to add, N for new task
          </span>
        </div>

        {/* Bottom Metadata Pill Selectors & Submit */}
        <div className="mt-3 pt-1 flex flex-wrap items-center justify-between gap-2 pl-10">
          <div className="flex flex-wrap items-center gap-2 relative">
            {/* Due Date Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'due' ? null : 'due')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] text-[12px] font-medium text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                <Calendar className="w-3.5 h-3.5 text-violet-600 dark:text-violet-300" />
                <span>Due Date: {dueBucket === 'today' ? 'Today' : getDueLabelForBucket(dueBucket)}</span>
              </button>

              {openPicker === 'due' && (
                <div className="absolute left-0 mt-1.5 w-40 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] shadow-lg p-1 z-30">
                  {(['today', 'tomorrow', 'later'] as DueBucket[]).map((bucket) => (
                    <button
                      key={bucket}
                      type="button"
                      onClick={() => {
                        setDueBucket(bucket);
                        setOpenPicker(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dueBucket === bucket
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {bucket === 'today' ? 'Today' : bucket === 'tomorrow' ? 'Tomorrow (Fri)' : 'Next week'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'priority' ? null : 'priority')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] text-[12px] font-medium text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                <Flag className="w-3.5 h-3.5 text-amber-500" />
                <span>{priority === 'medium' ? 'Priority' : `Priority: ${getPriorityLabel(priority)}`}</span>
              </button>

              {openPicker === 'priority' && (
                <div className="absolute left-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] shadow-lg p-1 z-30">
                  {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPriority(p);
                        setOpenPicker(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        priority === p
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      {getPriorityLabel(p)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Project Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'project' ? null : 'project')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] text-[12px] font-medium text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentProject ? PROJECT_DOT_CLASSES[currentProject.color] : 'bg-violet-500'
                  }`}
                />
                <span>{currentProject ? currentProject.name : 'Project'}</span>
              </button>

              {openPicker === 'project' && (
                <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] shadow-lg p-1 z-30">
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        setProjectId(proj.id);
                        setOpenPicker(null);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        projectId === proj.id
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${PROJECT_DOT_CLASSES[proj.color]}`} />
                      <span className="truncate">{proj.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tag Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenPicker(openPicker === 'tag' ? null : 'tag')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] text-[12px] font-medium text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap"
              >
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedTag ? selectedTag : 'Tag'}</span>
              </button>

              {openPicker === 'tag' && (
                <div className="absolute left-0 mt-1.5 w-36 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] shadow-lg p-1 z-30">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTag('');
                      setOpenPicker(null);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                  >
                    None
                  </button>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setOpenPicker(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400 text-white dark:text-[#120E1D] text-[12.5px] font-semibold transition-colors whitespace-nowrap shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

interface MobileAddTaskSheetProps {
  open: boolean;
  projects: Project[];
  availableTags: string[];
  onClose: () => void;
  onAddTask: TaskComposerProps['onAddTask'];
}

export const MobileAddTaskSheet: React.FC<MobileAddTaskSheetProps> = ({
  open,
  projects,
  availableTags,
  onClose,
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [dueBucket, setDueBucket] = useState<DueBucket>('today');
  const [priority, setPriority] = useState<Priority>('medium');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || 'product-launch');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask({
      title: trimmed,
      dueBucket,
      dueLabel: getDueLabelForBucket(dueBucket),
      priority,
      projectId,
      tags: selectedTag ? [selectedTag] : [],
      duration: duration.trim() || undefined,
    });
    setTitle('');
    setDuration('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-t-3xl md:rounded-2xl bg-white dark:bg-[#17151F] border border-slate-200 dark:border-white/[0.08] p-5 shadow-2xl">
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto mb-4 md:hidden" />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">New Task</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs your focus?"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#110F17] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" /> Due
              </span>
              <select
                value={dueBucket}
                onChange={(e) => setDueBucket(e.target.value as DueBucket)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="later">Next week</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Flag className="w-3 h-3" /> Priority
              </span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Folder className="w-3 h-3" /> Project
              </span>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3" /> Tag
              </span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <option value="">None</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Focus block duration (optional, e.g. 45m)"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-slate-50 dark:bg-[#110F17] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
          />

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-700 dark:bg-[#D0BCFF] dark:hover:bg-[#C3A8FF] text-white dark:text-[#191229] text-sm font-semibold transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};
