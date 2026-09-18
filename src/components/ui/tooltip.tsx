import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayDuration?: number;
}

function Tooltip({ content, children, side = 'top', className, delayDuration = 100 }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-flex" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-medium text-white shadow-md dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 animate-in fade-in-0 zoom-in-95 duration-150',
            positionStyles[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
