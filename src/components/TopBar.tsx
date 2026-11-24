import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Moon, PanelLeftOpen, Sparkles, Sun, User } from 'lucide-react';
import { NavView, NotificationItem, ThemeMode } from '../types';
import { LogoMark } from './LogoMark';

interface TopBarProps {
  activeView: NavView;
  selectedProjectName: string | null;
  selectedTag: string | null;
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  notifications: NotificationItem[];
  onToggleTheme: () => void;
  onExpandSidebar: () => void;
  onMarkAllNotificationsRead: () => void;
  onClickNotification: (taskId?: string) => void;
  onOpenQuietRitual: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  selectedProjectName,
  selectedTag,
  theme,
  sidebarCollapsed,
  notifications,
  onToggleTheme,
  onExpandSidebar,
  onMarkAllNotificationsRead,
  onClickNotification,
  onOpenQuietRitual,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [notifOpen]);

  const viewLabel = selectedProjectName
    ? selectedProjectName.toUpperCase()
    : selectedTag
    ? `#${selectedTag.toUpperCase()}`
    : activeView.toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-14 px-4 lg:px-8 flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-[#0D0B12]/90 backdrop-blur-md transition-colors duration-200">
      {/* Left Brand / Mobile Subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={onExpandSidebar}
            aria-label="Open sidebar"
            title="Open sidebar"
            className="hidden lg:inline-flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <LogoMark variant="square" />
          <div className="leading-tight min-w-0">
            <div className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              FocusFlow
            </div>
            <div className="lg:hidden text-[10px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 truncate">
              {viewLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Quiet Ritual, Notifications, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Explicit Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200/90 dark:border-white/[0.09] bg-slate-50/90 dark:bg-[#181520] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#211D2C] text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-violet-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Quiet Ritual quick trigger on desktop */}
        <button
          type="button"
          onClick={onOpenQuietRitual}
          title="Evening Quiet Ritual"
          className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200/90 dark:border-white/[0.09] bg-white dark:bg-[#181520] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#211D2C] text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-300" />
          <span>Quiet Ritual</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative w-9 h-9 inline-flex items-center justify-center rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/[0.07] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 ring-2 ring-white dark:ring-[#0D0B12]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-[#17151F] shadow-xl shadow-slate-900/10 dark:shadow-black/50 p-2 z-50">
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-300 hover:underline"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-1 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.05]">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClickNotification(item.taskId);
                      setNotifOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex items-start gap-2.5"
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        item.read ? 'bg-transparent' : 'bg-violet-600 dark:bg-violet-400'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] text-slate-800 dark:text-slate-200 leading-snug">
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <button
          type="button"
          onClick={onOpenQuietRitual}
          aria-label="Alex profile"
          title="Alex — Open Quiet Ritual"
          className="w-9 h-9 rounded-full bg-[#D0BCFF] dark:bg-[#D0BCFF] text-[#1D1631] flex items-center justify-center font-semibold text-xs ring-1 ring-black/5 dark:ring-white/10 hover:opacity-90 transition-opacity shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
