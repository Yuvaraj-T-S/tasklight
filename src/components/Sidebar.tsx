import React from 'react';
import {
  Calendar,
  CalendarClock,
  CheckCircle2,
  Inbox,
  Moon,
  PanelLeftClose,
  Plus,
  Search,
  Sun,
} from 'lucide-react';
import { NavView, Project, ThemeMode } from '../types';
import { PROJECT_DOT_CLASSES } from '../utils/styles';
import { LogoMark } from './LogoMark';

interface SidebarProps {
  activeView: NavView;
  selectedProjectId: string | null;
  selectedTag: string | null;
  projects: Project[];
  tags: string[];
  theme: ThemeMode;
  collapsed: boolean;
  onSelectView: (view: NavView) => void;
  onSelectProject: (projectId: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onToggleTheme: () => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  onOpenAddProject: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  selectedProjectId,
  selectedTag,
  projects,
  tags,
  theme,
  collapsed,
  onSelectView,
  onSelectProject,
  onSelectTag,
  onToggleTheme,
  onToggleCollapse,
  onOpenCommandPalette,
  onOpenAddProject,
}) => {
  if (collapsed) {
    return null;
  }

  const navItems: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'today', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarClock className="w-4 h-4" /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <aside
      aria-label="Workspace navigation"
      className="hidden lg:flex flex-col w-[256px] shrink-0 border-r border-slate-200/85 dark:border-white/[0.07] bg-[#F7F7FA] dark:bg-[#12101A] min-h-screen select-none transition-colors duration-200"
    >
      {/* Top Brand Row */}
      <div className="flex items-center justify-between px-4 h-14">
        <button
          type="button"
          onClick={() => {
            onSelectView('today');
            onSelectProject(null);
            onSelectTag(null);
          }}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg py-1 pr-2"
        >
          <LogoMark variant="circle" />
          <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            FocusFlow
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Search */}
      <div className="px-3.5 pb-3 pt-1">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#191622] text-slate-400 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/[0.15] transition-colors text-[13px] shadow-2xs focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Quick search...</span>
          </span>
          <kbd className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.07] text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-white/[0.06] shrink-0">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Primary Views */}
      <nav className="px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id && !selectedProjectId && !selectedTag;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectView(item.id);
                onSelectProject(null);
                onSelectTag(null);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                isActive
                  ? 'bg-violet-500/12 text-violet-700 dark:bg-violet-500/18 dark:text-violet-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.05] font-medium'
              }`}
            >
              <span className={isActive ? 'text-violet-600 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Projects */}
      <div className="mt-6 px-3">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Projects
          </span>
          <button
            type="button"
            onClick={onOpenAddProject}
            aria-label="Add project"
            title="New project"
            className="w-5 h-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          {projects.map((project) => {
            const isSelected = selectedProjectId === project.id;
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(isSelected ? null : project.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-[13.5px] transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isSelected
                    ? 'bg-violet-500/12 text-violet-700 dark:bg-violet-500/18 dark:text-violet-300 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.05] font-medium'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${PROJECT_DOT_CLASSES[project.color]}`} />
                <span className="truncate">{project.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6 px-3 flex-1">
        <div className="px-3 mb-2.5">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Tags
          </span>
        </div>
        <div className="px-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => {
            const isSelected = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-[12px] font-medium border transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-600 dark:bg-violet-500 dark:border-violet-500'
                    : 'bg-white dark:bg-[#191622] text-slate-600 dark:text-slate-300 border-slate-200/90 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16]'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* User & Theme Toggle Footer */}
      <div className="mt-auto px-3.5 py-3 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-500/25 text-violet-700 dark:text-violet-200 text-xs font-semibold flex items-center justify-center shrink-0">
            A
          </span>
          <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200 truncate">
            Alex
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
