import React from 'react';
import { Calendar, CalendarClock, Folder, Inbox, Plus } from 'lucide-react';
import { NavView } from '../types';

interface MobileBottomNavProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  onOpenAddModal: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onSelectView,
  onOpenAddModal,
}) => {
  const items: { id: NavView; label: string; icon: React.ReactNode }[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="w-5 h-5" /> },
    { id: 'today', label: 'Today', icon: <Calendar className="w-5 h-5" /> },
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 'projects', label: 'Projects', icon: <Folder className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Floating Action Button (+) */}
      <button
        type="button"
        onClick={onOpenAddModal}
        aria-label="Add new task"
        className="lg:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 dark:bg-[#D0BCFF] dark:hover:bg-[#C3A8FF] text-white dark:text-[#1A132B] shadow-lg shadow-violet-900/25 dark:shadow-black/50 flex items-center justify-center active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
      >
        <Plus className="w-6 h-6 stroke-[2.25]" />
      </button>

      {/* Bottom Tab Bar */}
      <nav
        aria-label="Mobile navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 grid grid-cols-4 border-t border-slate-200/85 dark:border-white/[0.07] bg-white/95 dark:bg-[#12101A]/95 backdrop-blur-md"
      >
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors focus:outline-none ${
                isActive
                  ? 'text-violet-600 dark:text-[#D0BCFF] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              {item.icon}
              <span className="text-[11px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
