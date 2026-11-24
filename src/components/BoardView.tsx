import React from 'react';
import { DueBucket, Project, Task } from '../types';
import { TaskCard } from './TaskCard';

interface BoardViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onCyclePriority: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

const COLUMNS: { id: DueBucket; title: string; accentClass: string }[] = [
  { id: 'overdue', title: 'Overdue', accentClass: 'text-rose-600 dark:text-[#F29B8F]' },
  { id: 'today', title: 'Today', accentClass: 'text-violet-600 dark:text-violet-300' },
  { id: 'tomorrow', title: 'Tomorrow', accentClass: 'text-slate-700 dark:text-slate-300' },
  { id: 'later', title: 'Later', accentClass: 'text-slate-500 dark:text-slate-400' },
];

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onCyclePriority,
  onSelectTask,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.dueBucket === col.id);
        return (
          <div
            key={col.id}
            className="rounded-2xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#12101A]/90 p-3"
          >
            <div className="flex items-center justify-between px-1 mb-3">
              <span className={`text-xs font-bold tracking-wider uppercase ${col.accentClass}`}>
                {col.title}
              </span>
              <span className="font-mono-tabular text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.05]">
                {colTasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {colTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/[0.07] py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    project={projects.find((p) => p.id === task.projectId)}
                    onToggleComplete={onToggleComplete}
                    onCyclePriority={onCyclePriority}
                    onSelectTask={onSelectTask}
                    compact
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
