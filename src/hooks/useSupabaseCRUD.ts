/**
 * useSupabaseCRUD
 *
 * Provides async helpers that sync tasks & projects with Supabase.
 * When Supabase is not configured (missing env vars) every function
 * is a no-op and the app falls back to plain localStorage — no changes
 * to the existing in-memory/localStorage behaviour.
 */

import { useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Project, Task } from '../types';

// ─── Row shapes (snake_case columns) ─────────────────────────────────────────

interface ProjectRow {
  id: string;
  name: string;
  color: Project['color'];
}

interface TaskRow {
  id: string;
  title: string;
  notes?: string | null;
  completed: boolean;
  completed_at?: string | null;
  due_bucket: Task['dueBucket'];
  due_label: string;
  due_time?: string | null;
  duration?: string | null;
  priority: Task['priority'];
  project_id?: string | null;
  tags: string[];
  subtasks: Task['subtasks'];
  assignee_group?: string | null;
  created_at: number;
}

// ─── Conversion helpers ───────────────────────────────────────────────────────

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? undefined,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    dueBucket: row.due_bucket,
    dueLabel: row.due_label,
    dueTime: row.due_time ?? undefined,
    duration: row.duration ?? undefined,
    priority: row.priority,
    projectId: row.project_id ?? '',
    tags: row.tags ?? [],
    subtasks: row.subtasks ?? [],
    assigneeGroup: row.assignee_group ?? undefined,
    createdAt: row.created_at,
  };
}

function taskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    notes: task.notes ?? null,
    completed: task.completed,
    completed_at: task.completedAt ?? null,
    due_bucket: task.dueBucket,
    due_label: task.dueLabel,
    due_time: task.dueTime ?? null,
    duration: task.duration ?? null,
    priority: task.priority,
    project_id: task.projectId && task.projectId.trim() !== '' ? task.projectId : null,
    tags: task.tags,
    subtasks: task.subtasks,
    assignee_group: task.assigneeGroup ?? null,
    created_at: task.createdAt,
  };
}

function rowToProject(row: ProjectRow): Project {
  return { id: row.id, name: row.name, color: row.color };
}

function projectToRow(p: Project): ProjectRow {
  return { id: p.id, name: p.name, color: p.color };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSupabaseCRUD() {
  // ── Projects ────────────────────────────────────────────────────────────────

  const fetchProjects = useCallback(async (): Promise<Project[] | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { console.error('[Tasklight] fetchProjects:', error.message); return null; }
    return (data as ProjectRow[]).map(rowToProject);
  }, []);

  const upsertProject = useCallback(async (project: Project): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase
      .from('projects')
      .upsert(projectToRow(project), { onConflict: 'id' });
    if (error) console.error('[Tasklight] upsertProject:', error.message);
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    // Set project_id to null on any linked tasks first to avoid FK constraint errors
    await supabase.from('tasks').update({ project_id: null }).eq('project_id', projectId);
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) console.error('[Tasklight] deleteProject:', error.message);
  }, []);

  // ── Tasks ───────────────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async (): Promise<Task[] | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) { console.error('[Tasklight] fetchTasks:', error.message); return null; }
    return (data as TaskRow[]).map(rowToTask);
  }, []);

  const insertTask = useCallback(async (task: Task): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('tasks').insert(taskToRow(task));
    if (error) console.error('[Tasklight] insertTask:', error.message);
  }, []);

  const updateTask = useCallback(async (task: Task): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase
      .from('tasks')
      .update(taskToRow(task))
      .eq('id', task.id);
    if (error) console.error('[Tasklight] updateTask:', error.message);
  }, []);

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) console.error('[Tasklight] deleteTask:', error.message);
  }, []);

  return {
    // Projects
    fetchProjects,
    upsertProject,
    deleteProject,
    // Tasks
    fetchTasks,
    insertTask,
    updateTask,
    deleteTask,
    // Status
    isSupabaseConfigured,
  };
}

