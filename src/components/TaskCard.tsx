import React from 'react';
import { Calendar, Check, Clock, Flag, ListChecks, Users } from 'lucide-react';
import { Priority, Project, Task } from '../types';
import {
  getPriorityFlagClass,
  getPriorityLabel,
  getTagBadgeClass,
  PROJECT_DOT_CLASSES,
} from '../utils/styles';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onToggleComplete: (taskId: string) => void;
  onCyclePriority: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  project,
  onToggleComplete,
  onCyclePriority,
  onSelectTask,
  compact = false,
}) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const isOverdue = task.dueBucket === 'overdue' && !task.completed;
  const hasTodayTime = task.dueBucket === 'today' && Boolean(task.dueTime) && !task.completed;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelectTask(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectTask(task);
        }
      }}
      className={`group relative flex items-start justify-between gap-3 rounded-2xl border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
        compact ? 'px-3.5 py-3' : 'px-4 py-3.5'
      } ${
        task.completed
          ? 'bg-[#F8F8FA] dark:bg-[#14121B]/80 border-slate-200/70 dark:border-white/[0.04] opacity-75 hover:opacity-95'
          : 'bg-white dark:bg-[#17151F] border-slate-200/90 dark:border-white/[0.06] hover:border-violet-300/80 dark:hover:border-violet-400/25 shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Completion Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          aria-label={task.completed ? `Mark "${task.title}" active` : `Complete "${task.title}"`}
          className="relative -m-2 p-2 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-full"
        >
          <span
            className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border transition-all duration-150 ${
              task.completed
                ? 'bg-[#A78BFA] border-[#A78BFA] dark:bg-[#B69DF8] dark:border-[#B69DF8] text-white dark:text-[#141022]'
                : 'border-slate-300 dark:border-white/20 bg-slate-50/70 dark:bg-white/[0.06] group-hover:border-violet-500 dark:group-hover:border-violet-400'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.75]" />}
          </span>
        </button>

        {/* Title & Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className={`text-[14.5px] leading-snug font-medium transition-colors truncate ${
                task.completed
                  ? 'line-through text-slate-400 dark:text-slate-500'
                  : 'text-slate-900 dark:text-[#F4F3F8]'
              }`}
            >
              {task.title}
            </h3>

            {hasTodayTime && (
              <span className="sm:hidden text-[11.5px] font-medium tabular-nums text-amber-600 dark:text-[#E2A878] shrink-0">
                {task.dueTime}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12px]">
            {/* Completed timestamp or Due Date */}
            {task.completed && task.completedAt ? (
              <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-400 tabular-nums">
                <Check className="w-3 h-3" />
                <span>Completed at {task.completedAt}</span>
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 font-medium tabular-nums ${
                  isOverdue
                    ? 'text-rose-600 dark:text-[#F29B8F]'
                    : hasTodayTime
                    ? 'text-violet-600 dark:text-violet-300'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {task.dueLabel}
                  {task.dueTime ? ` · ${task.dueTime}` : ''}
                </span>
              </span>
            )}

            {/* Project */}
            {project && (
              <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    task.completed ? 'bg-slate-300 dark:bg-slate-600' : PROJECT_DOT_CLASSES[project.color]
                  }`}
                />
                <span className="truncate">{project.name}</span>
              </span>
            )}

            {/* Tags */}
            {!task.completed &&
              task.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${getTagBadgeClass(
                    tag
                  )}`}
                >
                  #{tag}
                </span>
              ))}

            {/* Duration */}
            {task.duration && !task.completed && (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 tabular-nums">
                <Clock className="w-3 h-3" />
                <span>{task.duration}</span>
              </span>
            )}

            {/* Assignee Group */}
            {task.assigneeGroup && !task.completed && (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Users className="w-3 h-3" />
                <span>{task.assigneeGroup}</span>
              </span>
            )}

            {/* Subtask Count */}
            {totalSubtasks > 0 && !task.completed && (
              <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono-tabular text-[11.5px]">
                <ListChecks className="w-3.5 h-3.5" />
                <span>
                  {completedSubtasks}/{totalSubtasks}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Priority Flag */}
      {!compact && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCyclePriority(task.id);
          }}
          title={`Priority: ${getPriorityLabel(task.priority)} (click to change)`}
          aria-label={`Priority ${getPriorityLabel(task.priority)}, click to cycle`}
          className={`shrink-0 p-1.5 -mr-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${getPriorityFlagClass(
            task.priority,
            task.completed
          )}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
