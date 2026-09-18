import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, error, icon, ...props }, ref) => {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center justify-center">
          {icon}
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 hover:bg-slate-50 focus:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:focus:bg-slate-900 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:opacity-90 shadow-2xs transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50',
          icon ? 'pl-10 pr-3.5' : 'px-3.5',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
