import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Github,
  Calendar,
  Flame,
  Trophy,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Code2,
  AlertCircle,
  Star,
  GitFork,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { personalInfo } from '../../data/portfolio-data';
import {
  fetchGitHubTelemetry,
  GitHubDataResult,
  GitHubDayContribution
} from '../../services/githubService';

export const GitHubContributionGraph: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [data, setData] = useState<GitHubDataResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
  // Tooltip state strictly restricted to date + actual count
  const [hoveredCell, setHoveredCell] = useState<{
    date: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const username = personalInfo.githubUsername || 'bhanurx100';

    setIsLoading(true);
    fetchGitHubTelemetry(username)
      .then((result) => {
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setData({
            isAvailable: false,
            isLoading: false,
            contributions: [],
            availableYears: [],
            totalContributions: 0,
            currentStreak: 0,
            longestStreak: 0,
            activeDaysCount: 0,
            totalStars: 0,
            languages: [],
          });
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter contributions by selected year or all
  const filteredContributions = useMemo(() => {
    if (!data || !data.contributions || data.contributions.length === 0) return [];
    if (selectedYear === 'all') return data.contributions;
    return data.contributions.filter((c) => c.date.startsWith(selectedYear));
  }, [data, selectedYear]);

  // Organize into columns of weeks (7 days per column, Sunday to Saturday)
  const weeks = useMemo(() => {
    if (!filteredContributions || filteredContributions.length === 0) return [];

    const sorted = [...filteredContributions].sort((a, b) => a.date.localeCompare(b.date));
    const weeksArr: (GitHubDayContribution | null)[][] = [];

    const firstDate = new Date(sorted[0].date);
    const startDayOfWeek = firstDate.getDay(); // 0 = Sun

    let currentWeek: (GitHubDayContribution | null)[] = [];
    // Pad leading days
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }

    sorted.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad trailing days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    return weeksArr;
  }, [filteredContributions]);

  // Month header markers
  const monthLabels = useMemo(() => {
    if (!weeks || weeks.length === 0) return [];

    const labels: { label: string; weekIndex: number }[] = [];
    let lastKey = '';

    weeks.forEach((week, wIndex) => {
      const day = week.find((d) => d !== null);
      if (day) {
        const d = new Date(day.date);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const yr = d.getFullYear().toString().slice(-2);
        const key = selectedYear === 'all' ? `${monthName} '${yr}` : monthName;
        if (key !== lastKey) {
          labels.push({ label: key, weekIndex: wIndex });
          lastKey = key;
        }
      }
    });

    return labels;
  }, [weeks, selectedYear]);

  // Auto-scroll to the latest date (right side) on load and when year selection changes
  useEffect(() => {
    const scrollToLatest = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      }
    };
    scrollToLatest();
    const timer = setTimeout(scrollToLatest, 150);
    return () => clearTimeout(timer);
  }, [weeks]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Restrained, elegant color ramp
  const getCellColor = (level: number, count: number) => {
    if (level === 0 || count === 0) {
      return isDark ? 'bg-slate-800/70 border-slate-700/40' : 'bg-slate-200/80 border-slate-300/50';
    }
    if (level === 1) {
      return isDark ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-emerald-200 border-emerald-300';
    }
    if (level === 2) {
      return isDark ? 'bg-emerald-700 border-emerald-600 text-emerald-200' : 'bg-emerald-400 border-emerald-500';
    }
    if (level === 3) {
      return isDark ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-emerald-500 border-emerald-600';
    }
    return isDark ? 'bg-emerald-400 border-emerald-300 shadow-xs shadow-emerald-400/40' : 'bg-emerald-600 border-emerald-700';
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* PRIMARY TELEMETRY CONTAINER (Glass Card) */}
      <div
        className={`rounded-3xl border p-5 sm:p-7 transition-all duration-300 space-y-6 ${
          isDark
            ? 'bg-slate-800/85 border-slate-700 backdrop-blur-xl shadow-2xl'
            : 'bg-white border-slate-300 shadow-xl shadow-slate-300/30'
        }`}
      >
        
        {/* Real Profile Header Strip */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-4">
            <img
              src={data?.profile?.avatarUrl || `https://github.com/${personalInfo.githubUsername}.png`}
              alt={personalInfo.name}
              className="w-12 h-12 rounded-2xl border border-slate-700/60 object-cover shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {personalInfo.name}
                </h3>
                <span className="text-xs font-mono text-blue-500 font-semibold">
                  @{personalInfo.githubUsername}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {data?.profile?.bio || personalInfo.positioning}
              </p>
            </div>
          </div>

          {/* Simple CTA */}
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-98 shrink-0"
          >
            <span>View GitHub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* LOADING STATE */}
        {isLoading && (
          <div className="py-14 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Retrieving live GitHub telemetry...
            </p>
          </div>
        )}

        {/* GRACEFUL UNAVAILABLE FALLBACK (Zero Fabrication) */}
        {!isLoading && (!data || !data.isAvailable || data.contributions.length === 0) && (
          <div
            className={`py-10 px-6 rounded-2xl border text-center flex flex-col items-center justify-center gap-4 ${
              isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <AlertCircle className="w-7 h-7 text-amber-500" />
            <div className="space-y-1">
              <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                GitHub telemetry is currently unreachable.
              </h4>
              <p className={`text-xs max-w-md ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Real-time activity could not be fetched due to API rate limits or network connectivity. All source repositories and activity remain directly verifiable on GitHub.
              </p>
            </div>
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold transition active:scale-98 shadow-sm"
            >
              <span>View GitHub →</span>
            </a>
          </div>
        )}

        {/* REAL METRICS & CONTRIBUTION GRAPH */}
        {!isLoading && data && data.isAvailable && data.contributions.length > 0 && (
          <>
            {/* Real Metrics Row (Only showing metrics derived from real data) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Total Contributions */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-slate-50 border-slate-300 shadow-2xs'
                }`}
              >
                <div className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Total Commits</span>
                </div>
                <div className={`text-xl font-bold font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {data.totalContributions.toLocaleString()}
                </div>
              </div>

              {/* Public Repos (from real profile) */}
              {data.profile && typeof data.profile.publicRepos === 'number' && (
                <div
                  className={`p-3.5 rounded-2xl border ${
                    isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-slate-50 border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <FolderGit2 className="w-3 h-3 text-emerald-500" />
                    <span>Public Repos</span>
                  </div>
                  <div className={`text-xl font-bold font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {data.profile.publicRepos}
                  </div>
                </div>
              )}

              {/* Current Streak */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-slate-50 border-slate-300 shadow-2xs'
                }`}
              >
                <div className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span>Current Streak</span>
                </div>
                <div className="text-xl font-bold font-mono mt-1 text-amber-500">
                  {data.currentStreak} <span className="text-xs font-normal text-slate-400">days</span>
                </div>
              </div>

              {/* Longest Streak */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-slate-50 border-slate-300 shadow-2xs'
                }`}
              >
                <div className={`text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <Trophy className="w-3 h-3 text-purple-500" />
                  <span>Longest Streak</span>
                </div>
                <div className="text-xl font-bold font-mono mt-1 text-purple-400">
                  {data.longestStreak} <span className="text-xs font-normal text-slate-400">days</span>
                </div>
              </div>

            </div>

            {/* CONTRIBUTION GRAPH CONTROLS & TIMELINE */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Year Selectors */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setSelectedYear('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
                      selectedYear === 'all'
                        ? isDark
                          ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                          : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : isDark
                        ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        : 'bg-white text-slate-700 border-slate-300 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    All History
                  </button>
                  {data.availableYears.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition border ${
                        selectedYear === yr
                          ? isDark
                            ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                            : 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : isDark
                          ? 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                          : 'bg-white text-slate-700 border-slate-300 hover:text-slate-900 shadow-2xs'
                      }`}
                    >
                      {yr}
                    </button>
                  ))}
                </div>

                {/* Horizontal Scroll Arrows */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={scrollLeft}
                    className={`p-1.5 rounded-lg border transition ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                    }`}
                    title="Scroll left"
                    aria-label="Scroll left in contribution graph"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={scrollRight}
                    className={`p-1.5 rounded-lg border transition ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                    }`}
                    title="Scroll right"
                    aria-label="Scroll right in contribution graph"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* HORIZONTALLY SCROLLABLE GRAPH VIEWPORT (Ensuring only this region scrolls) */}
              <div
                ref={scrollContainerRef}
                className={`p-4 sm:p-5 rounded-2xl border overflow-x-auto scrollbar-thin relative select-none ${
                  isDark ? 'bg-[var(--surface-2)] border-slate-700' : 'bg-slate-100/70 border-slate-300'
                }`}
                style={{
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <div className="inline-block min-w-max pb-1">
                  
                  {/* Month / Year Header Row */}
                  <div className="flex pl-7 mb-2 text-[10px] font-mono text-slate-400 relative h-4">
                    {monthLabels.map((lbl, idx) => (
                      <div
                        key={idx}
                        className="absolute whitespace-nowrap"
                        style={{ left: `${lbl.weekIndex * 15 + 28}px` }}
                      >
                        {lbl.label}
                      </div>
                    ))}
                  </div>

                  {/* 7 Days of the Week Grid */}
                  <div className="flex gap-1">
                    
                    {/* Day of Week Labels */}
                    <div className="flex flex-col justify-between py-0.5 text-[9px] font-mono text-slate-500 pr-2 w-5 text-right">
                      <span>Sun</span>
                      <span>Tue</span>
                      <span>Thu</span>
                      <span>Sat</span>
                    </div>

                    {/* Matrix Columns */}
                    <div className="flex gap-[3px]">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-[3px]">
                          {week.map((day, dIdx) => {
                            if (!day) {
                              return (
                                <div
                                  key={dIdx}
                                  className="w-[12px] h-[12px] rounded-[2px] opacity-0"
                                />
                              );
                            }

                            const isHovered = hoveredCell?.date === day.date;

                            return (
                              <div
                                key={dIdx}
                                tabIndex={0}
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredCell({
                                    date: day.date,
                                    count: day.count,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top,
                                  });
                                }}
                                onMouseLeave={() => setHoveredCell(null)}
                                onFocus={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredCell({
                                    date: day.date,
                                    count: day.count,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top,
                                  });
                                }}
                                onBlur={() => setHoveredCell(null)}
                                className={`w-[12px] h-[12px] rounded-[2.5px] border transition-all duration-150 cursor-pointer focus:outline-hidden ${
                                  getCellColor(day.level, day.count)
                                } ${
                                  isHovered
                                    ? 'scale-150 z-20 ring-2 ring-white shadow-md'
                                    : 'hover:scale-125'
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>

                  </div>
                </div>

                {/* EXACT SPEC TOOLTIP: Showing date & actual contribution count ONLY */}
                {hoveredCell && (
                  <div
                    className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 px-3 py-1.5 rounded-xl text-xs font-mono shadow-xl border backdrop-blur-md transition-all duration-100 bg-slate-950 text-white border-slate-700"
                    style={{
                      left: `${hoveredCell.x}px`,
                      top: `${hoveredCell.y - 8}px`,
                    }}
                  >
                    <div className="font-bold text-emerald-400">
                      {hoveredCell.count === 0
                        ? '0 contributions'
                        : `${hoveredCell.count} contribution${hoveredCell.count > 1 ? 's' : ''}`}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatDisplayDate(hoveredCell.date)}
                    </div>
                  </div>
                )}

              </div>

              {/* Legend Strip */}
              <div className="flex flex-wrap items-center justify-between text-xs font-mono pt-1 text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Real Activity Timeline</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] mr-1">Less</span>
                  <div className={`w-3 h-3 rounded-[2.5px] border ${getCellColor(0, 0)}`} />
                  <div className={`w-3 h-3 rounded-[2.5px] border ${getCellColor(1, 1)}`} />
                  <div className={`w-3 h-3 rounded-[2.5px] border ${getCellColor(2, 3)}`} />
                  <div className={`w-3 h-3 rounded-[2.5px] border ${getCellColor(3, 6)}`} />
                  <div className={`w-3 h-3 rounded-[2.5px] border ${getCellColor(4, 10)}`} />
                  <span className="text-[11px] ml-1">More</span>
                </div>
              </div>

            </div>

            {/* REAL LANGUAGES BREAKDOWN (Only rendered if actual repository data exists) */}
            {data.languages && data.languages.length > 0 && (
              <div className="pt-4 border-t border-slate-800/60 dark:border-slate-800/60 border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Repository Language Distribution (Real Data):
                  </span>
                </div>

                {/* Progress bar ratio */}
                <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-800">
                  {data.languages.map((lang) => (
                    <div
                      key={lang.name}
                      style={{
                        width: `${lang.percentage}%`,
                        backgroundColor: lang.color,
                      }}
                      className="h-full"
                      title={`${lang.name}: ${lang.percentage}%`}
                    />
                  ))}
                </div>

                {/* Language Badges */}
                <div className="flex flex-wrap gap-3 text-xs font-mono">
                  {data.languages.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        {lang.name}
                      </span>
                      <span className="text-slate-500 font-normal">
                        {lang.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

    </div>
  );
};
