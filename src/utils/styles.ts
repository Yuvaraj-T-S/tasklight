import { DueBucket, Priority, Project } from '../types';

export const PROJECT_DOT_CLASSES: Record<Project['color'], string> = {
  violet: 'bg-violet-500 dark:bg-violet-400',
  blue: 'bg-blue-500 dark:bg-blue-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
  emerald: 'bg-emerald-500 dark:bg-emerald-400',
};

export function getTagBadgeClass(tag: string, active = false): string {
  if (tag === 'urgent') {
    return active
      ? 'bg-rose-600 text-white border-rose-600 dark:bg-rose-500 dark:text-white dark:border-rose-500'
      : 'bg-rose-50 text-rose-600 border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/25';
  }
  if (tag === 'review') {
    return active
      ? 'bg-amber-600 text-white border-amber-600 dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
      : 'bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/25';
  }
  if (tag === 'deep-work') {
    return active
      ? 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:text-white dark:border-violet-500'
      : 'bg-violet-50 text-violet-700 border-violet-200/70 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/25';
  }
  return active
    ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:border-slate-200'
    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/8 dark:text-slate-300 dark:border-white/10';
}

export function getPriorityFlagClass(priority: Priority, completed: boolean): string {
  if (completed) {
    return 'text-slate-300 dark:text-slate-600';
  }
  switch (priority) {
    case 'urgent':
      return 'text-rose-500 dark:text-[#F29B8F]';
    case 'high':
      return 'text-amber-500 dark:text-amber-400';
    case 'medium':
      return 'text-blue-500 dark:text-blue-400';
    case 'low':
    default:
      return 'text-slate-400 dark:text-slate-500';
  }
}

export function getPriorityLabel(priority: Priority): string {
  switch (priority) {
    case 'urgent':
      return 'Urgent';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
    default:
      return 'Low';
  }
}

export function getDueLabelForBucket(bucket: DueBucket): string {
  switch (bucket) {
    case 'overdue':
      return 'Yesterday';
    case 'today':
      return 'Today';
    case 'tomorrow':
      return 'Fri, Oct 25';
    case 'later':
    default:
      return 'Next week';
  }
}
