import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[120px] w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/70 hover:bg-slate-50 focus:bg-white dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:focus:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:opacity-90 shadow-2xs transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
