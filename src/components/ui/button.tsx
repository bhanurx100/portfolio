import * as React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'subtle';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none';

    const variantStyles = {
      default:
        'bg-slate-900 text-white dark:bg-blue-600 dark:text-white hover:bg-slate-800 dark:hover:bg-blue-500 shadow-sm active:bg-slate-950 dark:active:bg-blue-700',
      secondary:
        'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-2xs',
      outline:
        'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs',
      ghost:
        'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
      link: 'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline p-0 h-auto',
      subtle:
        'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800',
    };

    const sizeStyles = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 rounded-lg px-3 text-xs font-medium',
      lg: 'h-12 rounded-xl px-6 text-base font-semibold',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
