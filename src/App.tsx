import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Columns3,
  List,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { AddProjectModal } from './components/AddProjectModal';
import { BoardView } from './components/BoardView';
import { CommandPalette } from './components/CommandPalette';
import { MobileBottomNav } from './components/MobileBottomNav';
import { QuietRitualModal } from './components/QuietRitualModal';
import { Sidebar } from './components/Sidebar';
import { TaskCard } from './components/TaskCard';
import { MobileAddTaskSheet, TaskComposer } from './components/TaskComposer';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TopBar } from './components/TopBar';
import {
  AVAILABLE_TAGS,
  INITIAL_NOTIFICATIONS,
} from './data/initialTasks';
import {
  DueBucket,
  LayoutMode,
  NavView,
  NotificationItem,
  Priority,
  Project,
  SortBy,
  StatusFilter,
  Task,
  ThemeMode,
} from './types';
import { PROJECT_DOT_CLASSES } from './utils/styles';
import { useSupabaseCRUD } from './hooks/useSupabaseCRUD';

const STORAGE_TASKS_KEY = 'tasklight-tasks-v1';
const STORAGE_PROJECTS_KEY = 'tasklight-projects-v1';
const STORAGE_THEME_KEY = 'tasklight-theme';
const STORAGE_REFLECTION_KEY = 'tasklight-reflection-v1';

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const DUE_WEIGHT: Record<DueBucket, number> = {
  overdue: 0,
  today: 1,
  tomorrow: 2,
  later: 3,
};

export default function App() {
  const {
    fetchTasks,
    insertTask: dbInsertTask,
    updateTask: dbUpdateTask,
    deleteTask: dbDeleteTask,
    fetchProjects,
    upsertProject: dbUpsertProject,
    deleteProject: dbDeleteProject,
    isSupabaseConfigured,
  } = useSupabaseCRUD();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    // Start empty — Supabase will populate on mount.
    // localStorage is used only when Supabase is not configured.
    if (isSupabaseConfigured) return [];
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    // Start empty — Supabase will populate on mount.
    if (isSupabaseConfigured) return [];
    try {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [reflectionNote, setReflectionNote] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_REFLECTION_KEY) || '';
    } catch {
      return '';
    }
  });

  // ── Supabase bootstrap: load tasks & projects from DB on mount ──────────────
  const [dbLoading, setDbLoading] = useState(isSupabaseConfigured);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let cancelled = false;
    setDbLoading(true);

    (async () => {
      try {
        const [dbProjects, dbTasks] = await Promise.all([
          fetchProjects(),
          fetchTasks(),
        ]);

        if (cancelled) return;

        // Load whatever is in the DB — no seeding, no fallback test data
        if (dbProjects !== null) setProjects(dbProjects);
        if (dbTasks !== null) setTasks(dbTasks);
      } catch (err) {
        if (!cancelled) {
          setDbError('Could not reach Supabase. Check your .env credentials.');
          console.error('[Tasklight] DB bootstrap error:', err);
        }
      } finally {
        if (!cancelled) setDbLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeView, setActiveView] = useState<NavView>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('list');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [collapsedSections, setCollapsedSections] = useState<Record<DueBucket, boolean>>({
    overdue: false,
    today: false,
    tomorrow: false,
    later: false,
  });

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const [quietRitualOpen, setQuietRitualOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [undoState, setUndoState] = useState<{
    message: string;
    previousTasks: Task[];
  } | null>(null);

  const composerInputRef = useRef<HTMLInputElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  // Sync theme to documentElement & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage failures
    }
  }, [theme]);

  // Persist tasks & projects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    } catch {
      // Ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // Ignore
    }
  }, [projects]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    if (sortMenuOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [sortMenuOpen]);

  // Global keyboard shortcuts (Cmd/Ctrl+K, N, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setCommandOpen(false);
        setMobileAddOpen(false);
        setQuietRitualOpen(false);
        setAddProjectOpen(false);
        setEditingTaskId(null);
        setSortMenuOpen(false);
        return;
      }

      if (!isInput && !commandOpen && !editingTaskId && !quietRitualOpen && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileAddOpen(true);
        } else {
          composerInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen, editingTaskId, quietRitualOpen]);

  const showUndoToast = useCallback((message: string, previousTasks: Task[]) => {
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
    setUndoState({ message, previousTasks });
    undoTimerRef.current = window.setTimeout(() => {
      setUndoState(null);
    }, 5000);
  }, []);

  const handleUndo = () => {
    if (!undoState) return;
    setTasks(undoState.previousTasks);
    setUndoState(null);
    if (undoTimerRef.current) {
      window.clearTimeout(undoTimerRef.current);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleComplete = (taskId: string) => {
    const prevSnapshot = tasks;
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: nextCompleted,
              completedAt: nextCompleted ? nowTime : undefined,
            }
          : t
      )
    );

    // Persist to Supabase
    const updated = {
      ...target,
      completed: nextCompleted,
      completedAt: nextCompleted ? nowTime : undefined,
    };
    dbUpdateTask(updated);

    showUndoToast(
      nextCompleted ? 'Task completed' : 'Task reopened',
      prevSnapshot
    );
  };

  const handleCyclePriority = (taskId: string) => {
    const order: Priority[] = ['low', 'medium', 'high', 'urgent'];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextIdx = (order.indexOf(t.priority) + 1) % order.length;
        const updated = { ...t, priority: order[nextIdx] };
        // Persist to Supabase
        dbUpdateTask(updated);
        return updated;
      })
    );
  };

  const handleAddTask = (payload: {
    title: string;
    dueBucket: DueBucket;
    dueLabel: string;
    priority: Priority;
    projectId: string;
    tags: string[];
    duration?: string;
  }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: payload.title,
      completed: false,
      dueBucket: payload.dueBucket,
      dueLabel: payload.dueLabel,
      priority: payload.priority,
      projectId: payload.projectId,
      tags: payload.tags,
      duration: payload.duration,
      subtasks: [],
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
    // Persist to Supabase
    dbInsertTask(newTask);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    // Persist to Supabase
    dbUpdateTask(updated);
  };

  const handleDeleteTask = (taskId: string) => {
    const prevSnapshot = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showUndoToast('Task deleted', prevSnapshot);
    // Persist to Supabase
    dbDeleteTask(taskId);
  };

  const handleMoveToTomorrow = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, dueBucket: 'tomorrow', dueLabel: 'Fri, Oct 25', dueTime: undefined }
          : t
      )
    );
  };

  const handleAddProject = (name: string, color: Project['color']) => {
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const newProject: Project = { id, name, color };
    setProjects((prev) => [...prev, newProject]);
    setSelectedProjectId(id);
    // Persist to Supabase
    dbUpsertProject(newProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
    // Any tasks with this projectId have it cleared locally
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: '' } : t))
    );
    // Delete in Supabase
    dbDeleteProject(projectId);
  };

  const handleSaveReflection = (note: string) => {
    setReflectionNote(note);
    try {
      localStorage.setItem(STORAGE_REFLECTION_KEY, note);
    } catch {
      // Ignore
    }
  };

  // Daily Progress metrics across all tasks
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter & Sort tasks based on view, project, tag, status, sort
  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (selectedProjectId) {
      list = list.filter((t) => t.projectId === selectedProjectId);
    } else if (selectedTag) {
      list = list.filter((t) => t.tags.includes(selectedTag));
    } else if (activeView === 'upcoming') {
      list = list.filter((t) => t.dueBucket === 'tomorrow' || t.dueBucket === 'later');
    } else if (activeView === 'completed') {
      list = list.filter((t) => t.completed);
    } else if (activeView === 'inbox') {
      // Inbox displays all tasks cleanly
    }

    if (activeView !== 'completed') {
      if (statusFilter === 'active') {
        list = list.filter((t) => !t.completed);
      } else if (statusFilter === 'completed') {
        list = list.filter((t) => t.completed);
      }
    }

    list.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const dueDiff = DUE_WEIGHT[a.dueBucket] - DUE_WEIGHT[b.dueBucket];
        if (dueDiff !== 0) return dueDiff;
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      if (sortBy === 'priority') {
        return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'project') {
        return a.projectId.localeCompare(b.projectId);
      }
      return 0;
    });

    return list;
  }, [tasks, selectedProjectId, selectedTag, activeView, statusFilter, sortBy]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || null;
  const editingTask = tasks.find((t) => t.id === editingTaskId) || null;

  const sections: {
    id: DueBucket;
    title: string;
    mobileRightLabel: string;
    icon: React.ReactNode;
    titleClass: string;
  }[] = [
    {
      id: 'overdue',
      title: 'OVERDUE',
      mobileRightLabel: 'Yesterday',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-[#F29B8F]" />,
      titleClass: 'text-rose-600 dark:text-[#F29B8F]',
    },
    {
      id: 'today',
      title: 'TODAY',
      mobileRightLabel: `${filteredTasks.filter((t) => t.dueBucket === 'today').length} Tasks`,
      icon: <span className="w-2.5 h-2.5 rounded-full border-2 border-violet-500 dark:border-violet-400" />,
      titleClass: 'text-slate-700 dark:text-slate-200',
    },
    {
      id: 'tomorrow',
      title: 'TOMORROW',
      mobileRightLabel: 'Fri, Oct 25',
      icon: <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />,
      titleClass: 'text-slate-600 dark:text-slate-300',
    },
    {
      id: 'later',
      title: 'LATER',
      mobileRightLabel: 'Next week',
      icon: <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />,
      titleClass: 'text-slate-500 dark:text-slate-400',
    },
  ];

  // Progress ring math (radius 19 for desktop, 18 for mobile)
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  const sortLabels: Record<SortBy, string> = {
    dueDate: 'Due date',
    priority: 'Priority',
    title: 'Title',
    project: 'Project',
  };

  const heroHeading = selectedProject
    ? selectedProject.name
    : selectedTag
    ? `#${selectedTag}`
    : activeView === 'inbox'
    ? 'Inbox'
    : activeView === 'upcoming'
    ? 'Upcoming'
    : activeView === 'completed'
    ? 'Completed'
    : activeView === 'projects'
    ? 'Projects'
    : 'Good evening, Alex';

  return (
    <div className="min-h-screen flex bg-[#FAFAFC] dark:bg-[#0D0B12] text-slate-900 dark:text-[#F4F3F8] transition-colors duration-200">
      {/* Supabase status banners */}
      {dbLoading && (
        <div className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 py-1.5 px-4 bg-violet-600 text-white text-xs font-medium">
          <span className="animate-pulse">●</span>
          <span>Syncing with Tasklight cloud…</span>
        </div>
      )}
      {dbError && !dbLoading && (
        <div className="fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 py-1.5 px-4 bg-amber-500 text-white text-xs font-medium">
          <span>⚠ {dbError}</span>
          <button
            type="button"
            onClick={() => setDbError(null)}
            className="ml-2 underline underline-offset-2 hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeView={activeView}
        selectedProjectId={selectedProjectId}
        selectedTag={selectedTag}
        projects={projects}
        tags={AVAILABLE_TAGS}
        theme={theme}
        collapsed={sidebarCollapsed}
        onSelectView={(v) => {
          setActiveView(v);
          setSelectedProjectId(null);
          setSelectedTag(null);
        }}
        onSelectProject={(pid) => {
          setSelectedProjectId(pid);
          setSelectedTag(null);
        }}
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          setSelectedProjectId(null);
        }}
        onToggleTheme={toggleTheme}
        onToggleCollapse={() => setSidebarCollapsed(true)}
        onOpenCommandPalette={() => setCommandOpen(true)}
        onOpenAddProject={() => setAddProjectOpen(true)}
        onDeleteProject={handleDeleteProject}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          activeView={activeView}
          selectedProjectName={selectedProject?.name || null}
          selectedTag={selectedTag}
          theme={theme}
          sidebarCollapsed={sidebarCollapsed}
          notifications={notifications}
          onToggleTheme={toggleTheme}
          onExpandSidebar={() => setSidebarCollapsed(false)}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onClickNotification={(taskId) => {
            if (taskId) setEditingTaskId(taskId);
          }}
          onOpenQuietRitual={() => setQuietRitualOpen(true)}
        />

        {/* Scrollable Workspace Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 pt-6 pb-28 lg:pb-16 max-w-5xl w-full mx-auto">
          {/* Greeting & Daily Progress Header */}
          <section className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[11.5px] font-bold tracking-wider uppercase text-violet-600 dark:text-[#E2A878]">
                <span>THURSDAY, OCT 24</span>
                <span className="hidden sm:inline text-slate-300 dark:text-white/20">•</span>
                <span className="hidden sm:inline text-slate-400 dark:text-slate-500">WEEK 43</span>
              </div>

              <div className="mt-1 flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  {heroHeading}
                </h1>
                {(selectedProject || selectedTag) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(null);
                      setSelectedTag(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/70 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.14]"
                  >
                    <X className="w-3 h-3" /> Clear filter
                  </button>
                )}
              </div>

              <p className="mt-1 text-[13.5px] text-slate-500 dark:text-slate-400">
                <span className="hidden sm:inline">
                  Quiet focus.{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {activeCount} {activeCount === 1 ? 'task' : 'tasks'}
                  </span>{' '}
                  remaining for today.
                </span>
                <span className="sm:hidden tabular-nums">
                  {completedCount} focus {completedCount === 1 ? 'block' : 'blocks'} completed today
                </span>
              </p>
            </div>

            {/* Mobile Compact Ring */}
            <div
              className="sm:hidden relative w-14 h-14 shrink-0 flex items-center justify-center"
              aria-label={`${completedCount} of ${totalCount} tasks completed`}
            >
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-slate-200 dark:text-white/[0.08]"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-violet-600 dark:text-[#B69DF8] transition-all duration-300"
                />
              </svg>
              <span className="absolute font-mono-tabular text-[12px] font-bold text-slate-900 dark:text-white">
                {completedCount}/{totalCount}
              </span>
            </div>

            {/* Desktop Daily Progress Card */}
            <div className="hidden sm:flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#17151F] shadow-2xs shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    className="text-slate-100 dark:text-white/[0.08]"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-violet-600 dark:text-[#B69DF8] transition-all duration-300"
                  />
                </svg>
                <span className="absolute font-mono-tabular text-[11px] font-bold text-slate-900 dark:text-white">
                  {progressPct}%
                </span>
              </div>
              <div>
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-tight">
                  Daily Progress
                </div>
                <div className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                  {completedCount} of {totalCount} completed
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Projects Directory View when "Projects" tab is active */}
          {activeView === 'projects' && !selectedProjectId ? (
            <section className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Your Projects
                </h2>
                <button
                  type="button"
                  onClick={() => setAddProjectOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-300"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => {
                  const projTasks = tasks.filter((t) => t.projectId === proj.id);
                  const openProj = projTasks.filter((t) => !t.completed).length;
                  return (
                    <div
                      key={proj.id}
                      className="group flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#17151F] text-left hover:border-violet-300 dark:hover:border-violet-400/30 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProjectId(proj.id)}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <span className={`w-3 h-3 rounded-full ${PROJECT_DOT_CLASSES[proj.color]}`} />
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {proj.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                            {openProj} active · {projTasks.length} total
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete project "${proj.name}"?`)) {
                              handleDeleteProject(proj.id);
                            }
                          }}
                          aria-label={`Delete ${proj.name}`}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <>
              {/* Desktop Inline Quick Add Composer */}
              <div className="mt-6">
                <TaskComposer
                  projects={projects}
                  availableTags={AVAILABLE_TAGS}
                  defaultProjectId={selectedProjectId}
                  inputRef={composerInputRef}
                  onOpenAddProject={() => setAddProjectOpen(true)}
                  onAddTask={handleAddTask}
                />
              </div>

              {/* Filter Tabs, Sort & Layout Switcher */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {/* Segmented Status Filter */}
                <div className="inline-flex items-center p-1 rounded-full sm:rounded-xl bg-slate-200/75 dark:bg-[#181520] border border-slate-200/80 dark:border-white/[0.06]">
                  {(
                    [
                      { id: 'all', label: 'All', count: activeCount },
                      { id: 'active', label: 'Active' },
                      { id: 'completed', label: 'Completed' },
                    ] as { id: StatusFilter; label: string; count?: number }[]
                  ).map((tab) => {
                    const isActive = statusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full sm:rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                          isActive
                            ? 'bg-white text-slate-900 shadow-2xs dark:bg-[#B69DF8] dark:text-[#141022]'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span
                            className={`sm:hidden inline-flex items-center justify-center px-1.5 py-0.2 rounded-full text-[10.5px] font-mono-tabular ${
                              isActive
                                ? 'bg-violet-100 text-violet-700 dark:bg-black/20 dark:text-[#141022]'
                                : 'bg-slate-300/60 dark:bg-white/10'
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Controls: Sort + List/Board Toggle */}
                <div className="hidden sm:flex items-center gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative" ref={sortMenuRef}>
                    <button
                      type="button"
                      onClick={() => setSortMenuOpen((p) => !p)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#17151F] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors whitespace-nowrap"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>Sort: {sortLabels[sortBy]}</span>
                    </button>

                    {sortMenuOpen && (
                      <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#1E1B28] shadow-lg p-1 z-30">
                        {(Object.keys(sortLabels) as SortBy[]).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setSortBy(key);
                              setSortMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              sortBy === key
                                ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                            }`}
                          >
                            {sortLabels[key]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* List / Board Switcher */}
                  <div className="inline-flex items-center p-0.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#17151F]">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('list')}
                      aria-label="List view"
                      title="List view"
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'list'
                          ? 'bg-slate-100 dark:bg-white/[0.1] text-slate-900 dark:text-white'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('board')}
                      aria-label="Board view"
                      title="Board view"
                      className={`p-1.5 rounded-lg transition-colors ${
                        layoutMode === 'board'
                          ? 'bg-slate-100 dark:bg-white/[0.1] text-slate-900 dark:text-white'
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      <Columns3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tasks Content */}
              <div className="mt-6">
                {filteredTasks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.08] bg-white/60 dark:bg-[#17151F]/60 py-14 px-6 text-center">
                    <CheckCircle2 className="w-9 h-9 mx-auto text-violet-500/70 dark:text-violet-300/70" />
                    <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                      All clear in this view
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Add a new task or adjust your active filters to see more items.
                    </p>
                  </div>
                ) : layoutMode === 'board' ? (
                  <BoardView
                    tasks={filteredTasks}
                    projects={projects}
                    onToggleComplete={handleToggleComplete}
                    onCyclePriority={handleCyclePriority}
                    onSelectTask={(t) => setEditingTaskId(t.id)}
                  />
                ) : (
                  <div className="space-y-6">
                    {sections.map((section) => {
                      const sectionTasks = filteredTasks.filter(
                        (t) => t.dueBucket === section.id
                      );
                      if (sectionTasks.length === 0) return null;
                      const isCollapsed = collapsedSections[section.id];

                      return (
                        <section key={section.id}>
                          {/* Section Header */}
                          <button
                            type="button"
                            onClick={() =>
                              setCollapsedSections((prev) => ({
                                ...prev,
                                [section.id]: !prev[section.id],
                              }))
                            }
                            className="w-full flex items-center justify-between py-1.5 mb-2.5 group focus:outline-none"
                          >
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:inline-flex text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                {isCollapsed ? (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <span className="sm:hidden inline-flex items-center">
                                {section.icon}
                              </span>
                              <span
                                className={`text-[11.5px] font-bold tracking-wider uppercase ${section.titleClass}`}
                              >
                                {section.title}
                              </span>
                              <span
                                className={`hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 rounded-md font-mono-tabular text-[11px] font-bold ${
                                  section.id === 'overdue'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-[#F29B8F]'
                                    : section.id === 'today'
                                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                                    : 'bg-slate-200/75 text-slate-600 dark:bg-white/[0.08] dark:text-slate-300'
                                }`}
                              >
                                {sectionTasks.length}
                              </span>
                            </div>

                            <span
                              className={`sm:hidden text-[11.5px] font-medium ${
                                section.id === 'overdue'
                                  ? 'text-rose-500 dark:text-[#F29B8F]'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {section.mobileRightLabel}
                            </span>
                          </button>

                          {/* Task Cards */}
                          {!isCollapsed && (
                            <div className="space-y-2.5">
                              {sectionTasks.map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  project={projects.find((p) => p.id === task.projectId)}
                                  onToggleComplete={handleToggleComplete}
                                  onCyclePriority={handleCyclePriority}
                                  onSelectTask={(t) => setEditingTaskId(t.id)}
                                />
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quiet Ritual Card (Mobile & Compact Focus Footer) */}
              <section className="mt-7 lg:hidden">
                <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#17151F] p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider uppercase text-amber-600 dark:text-[#E2A878]">
                      <Sparkles className="w-3 h-3" />
                      <span>QUIET RITUAL</span>
                    </div>
                    <p className="mt-1 text-[13px] text-slate-700 dark:text-slate-200 leading-snug">
                      Ready to wind down? Plan tomorrow in 2 mins.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuietRitualOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#262331] dark:hover:bg-[#312D3F] text-xs font-semibold text-slate-900 dark:text-white shrink-0 transition-colors"
                  >
                    Reflect
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Desktop Bottom Floating Shortcut Hint Bar */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 -translate-x-1/2 z-30 items-center gap-3 px-4 py-2 rounded-full border border-slate-200/90 dark:border-white/[0.09] bg-white/95 dark:bg-[#17151F]/95 backdrop-blur-md shadow-sm text-[12px] text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
        >
          <kbd className="font-mono-tabular text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            ⌘K
          </kbd>
          <span>Command Palette</span>
        </button>
        <span aria-hidden="true" className="text-slate-300 dark:text-white/15">
          ·
        </span>
        <button
          type="button"
          onClick={() => composerInputRef.current?.focus()}
          className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
        >
          <kbd className="font-mono-tabular text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            N
          </kbd>
          <span>New Task</span>
        </button>
      </div>

      {/* Undo Toast */}
      {undoState && (
        <div
          role="status"
          className="fixed bottom-20 lg:bottom-5 right-4 lg:right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#16131F] dark:bg-[#231E30] text-white border border-white/[0.1] shadow-xl text-xs font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
          <span>{undoState.message}</span>
          <span className="text-white/25">·</span>
          <button
            type="button"
            onClick={handleUndo}
            className="font-semibold text-violet-300 hover:text-violet-200 underline underline-offset-2"
          >
            Undo
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation + FAB */}
      <MobileBottomNav
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          setSelectedProjectId(null);
          setSelectedTag(null);
        }}
        onOpenAddModal={() => setMobileAddOpen(true)}
      />

      {/* Modals & Drawers */}
      <TaskDetailModal
        task={editingTask}
        projects={projects}
        availableTags={AVAILABLE_TAGS}
        onClose={() => setEditingTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />

      <MobileAddTaskSheet
        open={mobileAddOpen}
        projects={projects}
        availableTags={AVAILABLE_TAGS}
        onClose={() => setMobileAddOpen(false)}
        onAddTask={handleAddTask}
      />

      <CommandPalette
        open={commandOpen}
        tasks={tasks}
        projects={projects}
        theme={theme}
        onClose={() => setCommandOpen(false)}
        onSelectTask={(t) => setEditingTaskId(t.id)}
        onSelectView={(v) => {
          setActiveView(v);
          setSelectedProjectId(null);
          setSelectedTag(null);
        }}
        onSelectProject={(pid) => {
          setSelectedProjectId(pid);
          setSelectedTag(null);
        }}
        onToggleTheme={toggleTheme}
        onOpenNewTask={() => {
          if (window.innerWidth < 768) {
            setMobileAddOpen(true);
          } else {
            composerInputRef.current?.focus();
          }
        }}
        onOpenQuietRitual={() => setQuietRitualOpen(true)}
      />

      <QuietRitualModal
        open={quietRitualOpen}
        tasks={tasks}
        reflectionNote={reflectionNote}
        onSaveReflection={handleSaveReflection}
        onMoveToTomorrow={handleMoveToTomorrow}
        onClose={() => setQuietRitualOpen(false)}
      />

      <AddProjectModal
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}
