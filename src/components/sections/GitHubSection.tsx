import React from 'react';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import { personalInfo } from '../../data/portfolio-data';
import { useTheme } from '../../context/ThemeContext';
import { GitHubContributionGraph } from './GitHubContributionGraph';

export const GitHubSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="github"
      aria-label="GitHub Open Source & Verified Activity"
      className={`py-12 sm:py-20 border-b transition-colors duration-500 relative overflow-hidden ${
        isDark ? 'bg-transparent text-white border-slate-800/80' : 'bg-transparent text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 relative z-10">
        
        {/* Section Header — editorial */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-3 text-left">
            <p className="tech-label" style={{ color: 'var(--accent)' }}>Built in public</p>

            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
              Code is the evidence.
            </h2>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>
              Real contribution activity and repositories for{' '}
              <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>@{personalInfo.githubUsername}</span>
              . No fabricated metrics — everything here is live.
            </p>
          </div>

          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-md shadow-blue-600/20 transition active:scale-95 shrink-0"
          >
            <Github className="w-4 h-4" />
            <span>View GitHub →</span>
          </a>
        </div>

        {/* Real GitHub Contribution Graph & Activity */}
        <GitHubContributionGraph />

      </div>
    </section>
  );
};
