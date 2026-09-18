import React, { useState, useEffect } from 'react';
import { Search, Terminal, Code, Cpu, Briefcase, Mail, Github, ExternalLink, X, Compass, Sparkles } from 'lucide-react';
import { personalInfo } from '../../data/portfolio-data';
import { useTheme } from '../../context/ThemeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCaseStudy: (slug: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenCaseStudy,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [query, setQuery] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'commands' | 'terminal'>('commands');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLogs = [...terminalLogs, `$ ${cmd}`];

    if (trimmed === 'help') {
      newLogs.push('Available commands:');
      newLogs.push('  stayease     -> Inspect StayEase case study & architecture');
      newLogs.push('  splitfin     -> Inspect SplitFin fintech breakdown');
      newLogs.push('  skills       -> List full engineering capabilities');
      newLogs.push('  contact      -> Get direct email and booking endpoint');
      newLogs.push('  clear        -> Wipe terminal logs');
    } else if (trimmed === 'stayease') {
      newLogs.push('>> Launching StayEase case study overlay...');
      onOpenCaseStudy('stayease');
      onClose();
    } else if (trimmed === 'splitfin') {
      newLogs.push('>> Launching SplitFin case study overlay...');
      onOpenCaseStudy('splitfin');
      onClose();
    } else if (trimmed === 'clear') {
      setTerminalLogs([]);
      setQuery('');
      return;
    } else if (trimmed === 'contact') {
      newLogs.push(`>> Direct Email: ${personalInfo.email}`);
      newLogs.push(`>> LinkedIn: ${personalInfo.linkedin}`);
    } else {
      newLogs.push(`Command not recognized: '${trimmed}'. Type 'help' for options.`);
    }

    setTerminalLogs(newLogs);
    setQuery('');
  };

  const navActions = [
    {
      id: 'builderlab',
      title: 'Enter Builder Lab — describe a problem, watch the system form',
      category: 'Interactive Experience',
      icon: Sparkles,
      action: () => {
        window.location.hash = '#builder-lab';
        onClose();
      },
    },
    {
      id: 'stayease',
      title: 'Inspect StayEase (Travel & Booking Engine)',
      category: 'Product & System',
      icon: Sparkles,
      action: () => {
        onOpenCaseStudy('stayease');
        onClose();
      },
    },
    {
      id: 'splitfin',
      title: 'Inspect SplitFin (Fintech & Group Ledger Engine)',
      category: 'Product & System',
      icon: Cpu,
      action: () => {
        onOpenCaseStudy('splitfin');
        onClose();
      },
    },
    {
      id: 'work',
      title: 'Go to Selected Work — StayEase & SplitFin case studies',
      category: 'Navigation',
      icon: Code,
      action: () => {
        window.location.hash = '#work';
        onClose();
      },
    },
    {
      id: 'how-i-build',
      title: 'Go to How I Build — the process, stage by stage',
      category: 'Navigation',
      icon: Code,
      action: () => {
        window.location.hash = '#how-i-build';
        onClose();
      },
    },
    {
      id: 'experience',
      title: 'Jump to Career Timeline & Production Roles',
      category: 'Career',
      icon: Briefcase,
      action: () => {
        window.location.hash = '#experience';
        onClose();
      },
    },
    {
      id: 'github',
      title: 'Jump to Live GitHub Telemetry & Real Repos',
      category: 'Open Source',
      icon: Github,
      action: () => {
        window.location.hash = '#github';
        onClose();
      },
    },
    {
      id: 'email',
      title: `Send Email to ${personalInfo.email}`,
      category: 'Contact',
      icon: Mail,
      action: () => {
        window.location.href = `mailto:${personalInfo.email}`;
        onClose();
      },
    },
  ];

  const filteredActions = navActions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] ${
        isDark ? 'bg-slate-900 border-slate-700/80 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header Search Input */}
        <div className={`flex items-center px-4 py-3.5 border-b ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <Search className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                if (activeTab === 'terminal') {
                  handleCommand(query);
                } else if (filteredActions.length > 0) {
                  filteredActions[0].action();
                }
              }
            }}
            placeholder={activeTab === 'commands' ? "Type a command or search sections... (e.g. 'stayease', 'github')" : "Execute CLI command (type 'help')..."}
            className={`w-full bg-transparent border-none outline-hidden text-sm font-mono ${
              isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
            }`}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'commands' ? 'terminal' : 'commands')}
              className={`text-xs px-2.5 py-1 rounded-md font-mono border transition flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? isDark ? 'bg-blue-600/30 text-blue-300 border-blue-500/50' : 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' : 'bg-slate-100 text-slate-700 border-slate-200 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{activeTab === 'commands' ? 'CLI Mode' : 'Quick Menu'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-1 rounded-md transition ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Close Command Palette"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content View */}
        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          {activeTab === 'commands' ? (
            <div>
              <div className={`text-[11px] font-mono px-3 py-1 uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Quick Navigation & Workflows
              </div>
              {filteredActions.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No matching action for &quot;{query}&quot;. Switch to CLI mode or type &apos;stayease&apos;.
                </div>
              ) : (
                filteredActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left group border ${
                        isDark 
                          ? 'hover:bg-slate-800/80 border-transparent hover:border-slate-700/60' 
                          : 'hover:bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                          isDark 
                            ? 'bg-slate-800 group-hover:bg-blue-600/20 text-slate-300 group-hover:text-blue-400 border-slate-700/50 group-hover:border-blue-500/30' 
                            : 'bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 border-slate-200 group-hover:border-blue-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-sm font-semibold transition ${
                            isDark ? 'text-white group-hover:text-blue-300' : 'text-slate-900 group-hover:text-blue-600'
                          }`}>
                            {item.title}
                          </div>
                          <div className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-mono ${
                        isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'
                      }`}>
                        Jump ↵
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-3 font-mono text-xs text-emerald-400 space-y-2 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-slate-400">
                Bhanuprasad Interactive Shell v3.4 [WebAssembly Virtualized]
                <br />
                Type &apos;<span className="text-blue-400 font-bold">help</span>&apos; to view system commands.
              </div>
              {terminalLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith('$') ? 'text-blue-400' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-2 text-slate-400 pt-2">
                <span className="text-blue-400">$</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className={`px-4 py-2.5 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center gap-3">
            <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>↑↓</kbd> Navigate</span>
            <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>↵</kbd> Select</span>
            <span><kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>ESC</kbd> Close</span>
          </div>
          <span className="text-blue-600 dark:text-blue-400 font-medium">Bhanuprasad Portfolio OS</span>
        </div>

      </div>
    </div>
  );
};
