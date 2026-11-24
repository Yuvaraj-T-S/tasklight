import React from 'react';

interface LogoMarkProps {
  variant?: 'square' | 'circle';
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ variant = 'square', className = '' }) => {
  if (variant === 'circle') {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 dark:bg-violet-500 text-white shrink-0 ${className}`}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 8.2L6.8 11L12 5.4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#181424] dark:bg-[#1E1A2B] border border-violet-500/20 text-violet-300 shadow-xs shrink-0 ${className}`}
      aria-hidden="true"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="4.5" r="1.35" fill="currentColor" opacity="0.45" />
        <circle cx="8" cy="6.2" r="1.35" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="6.2" r="1.35" fill="currentColor" opacity="0.7" />
        <circle cx="5.2" cy="10" r="1.35" fill="currentColor" opacity="0.65" />
        <circle cx="9.8" cy="10" r="1.45" fill="currentColor" />
        <circle cx="14.2" cy="10" r="1.45" fill="currentColor" />
        <circle cx="18.8" cy="10" r="1.35" fill="currentColor" opacity="0.65" />
        <circle cx="5.2" cy="14" r="1.35" fill="currentColor" opacity="0.65" />
        <circle cx="9.8" cy="14" r="1.45" fill="currentColor" />
        <circle cx="14.2" cy="14" r="1.45" fill="currentColor" />
        <circle cx="18.8" cy="14" r="1.35" fill="currentColor" opacity="0.65" />
        <circle cx="8" cy="17.8" r="1.35" fill="currentColor" opacity="0.7" />
        <circle cx="16" cy="17.8" r="1.35" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="19.5" r="1.35" fill="currentColor" opacity="0.45" />
      </svg>
    </span>
  );
};
