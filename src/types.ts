export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type DueBucket = 'overdue' | 'today' | 'tomorrow' | 'later';

export type NavView = 'inbox' | 'today' | 'upcoming' | 'completed' | 'projects';

export type StatusFilter = 'all' | 'active' | 'completed';

export type SortBy = 'dueDate' | 'priority' | 'title' | 'project';

export type LayoutMode = 'list' | 'board';

export type ThemeMode = 'light' | 'dark';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: 'violet' | 'blue' | 'amber' | 'rose' | 'emerald';
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  dueBucket: DueBucket;
  dueLabel: string;
  dueTime?: string;
  duration?: string;
  priority: Priority;
  projectId: string;
  tags: string[];
  subtasks: Subtask[];
  assigneeGroup?: string;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  taskId?: string;
}
