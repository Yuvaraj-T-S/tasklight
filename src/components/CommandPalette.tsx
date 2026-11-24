import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Inbox, Moon, Plus, Search, Sparkles, Sun, X } from 'lucide-react';
import { NavView, Project, Task, ThemeMode } from '../types';
import { PROJECT_DOT_CLASSES } from '../utils/styles';

interface CommandPaletteProps {
  open: boolean;
  tasks: Task[];
  projects: Project[];
  theme: ThemeMode;
  onClose: () => void;
  onSelectTask: (task: Task) => void;
  onSelectView: (view: NavView) => void;
  onSelectProject: (projectId: string) => void;
  onToggleTheme: () => void;
  onOpenNewTask: () => void;
  onOpenQuietRitual: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  tasks,
  projects,
  theme,
  onClose,
  onSelectTask,
  onSelectView,
  onSelectProject,
  onToggleTheme,
  onOpenNewTask,
  onOpenQuietRitual,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks.slice(0, 5);
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query, tasks]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/45 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#17151F] shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/[0.06]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, projects, or actions..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command palette"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Quick Actions */}
          <div>
            <div className="px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Actions
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewTask();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Plus className="w-4 h-4" /> Create new task
                </span>
                <kbd className="font-mono-tabular text-[11px] text-slate-400">N</kbd>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} theme
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQuietRitual();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" /> Open Evening Quiet Ritual
                </span>
              </button>
            </div>
          </div>

          {/* Views */}
          {!query && (
            <div>
              <div className="px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Views & Projects
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('inbox');
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                >
                  <Inbox className="w-3.5 h-3.5" /> Inbox
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectView('today');
                    onClose();
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                >
                  <Calendar className="w-3.5 h-3.5" /> Today
                </button>
                {projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                  >
                    <span className={`w-2 h-2 rounded-full ${PROJECT_DOT_CLASSES[p.color]}`} />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matching Tasks */}
          <div>
            <div className="px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tasks
            </div>
            {filteredTasks.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-slate-400">
                No matching tasks found.
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => {
                      onSelectTask(task);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          task.completed ? 'text-violet-500' : 'text-slate-400'
                        }`}
                      />
                      <span
                        className={`text-[13px] truncate ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                      {task.dueLabel}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
