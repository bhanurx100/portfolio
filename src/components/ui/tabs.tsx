import * as React from 'react';
import { cn } from '../../lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  className,
  children,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'pills' | 'segmented';
  className?: string;
  children?: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className, variant = 'default', children, ...props }) => {
  const variantStyles = {
    default:
      'inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 p-1 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 backdrop-blur-sm',
    pills: 'inline-flex flex-wrap items-center gap-1.5 p-1',
    segmented:
      'inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-slate-700 dark:text-slate-300',
  };

  return (
    <div className={cn(variantStyles[variant], className)} role="tablist" {...props}>
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ className, value, children, ...props }) => {
  const { value: activeValue, onValueChange } = useTabs();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-50 select-none',
        isActive
          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-slate-800/40',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  children?: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ className, value, children, ...props }) => {
  const { value: activeValue } = useTabs();
  if (activeValue !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('mt-3 focus-visible:outline-none animate-in fade-in-50 duration-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};
