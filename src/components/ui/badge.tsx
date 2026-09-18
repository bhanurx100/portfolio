import * as React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'mono' | 'tech';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  const baseStyles =
    'inline-flex items-center rounded-full text-xs font-medium transition-colors px-2.5 py-0.5 whitespace-nowrap select-none';

  const variantStyles = {
    default: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
    secondary:
      'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-2xs',
    outline:
      'border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-transparent',
    success:
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    warning:
      'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
    mono: 'font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700',
    tech: 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-mono text-[11px] px-2 py-0.5 rounded-md shadow-2xs',
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
};
