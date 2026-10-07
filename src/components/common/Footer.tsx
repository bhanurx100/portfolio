import React from 'react';
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import { personalInfo } from '../../data/portfolio-data';
import { useTheme } from '../../context/ThemeContext';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      aria-label="Portfolio Footer"
      className="py-6 sm:py-12 border-t transition-colors duration-500"
      style={{
        background: 'var(--surface-1)',
        borderColor: isDark ? 'var(--line-dark)' : 'var(--line)',
        color: 'var(--text-3)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
        
        {/* Main Footer Row */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b"
          style={{ borderColor: isDark ? 'var(--line-dark)' : 'var(--line)' }}
        >
          
          {/* Identity & Short Portfolio Note */}
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-1)' }}>
                {personalInfo.name}
              </span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>/</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>
                {personalInfo.title}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Designed & built with TypeScript, React 19, and Tailwind CSS.
            </p>
          </div>

          {/* Navigation Links & Social Channels */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono" style={{ color: 'var(--text-3)' }}>
            <a
              href="#work"
              className="transition hover:underline"
            >
              Work
            </a>
            <a
              href="#experience"
              className="transition hover:underline"
            >
              Experience
            </a>
            <a
              href="#github"
              className="transition hover:underline"
            >
              GitHub
            </a>
            <a
              href="#builder-lab"
              className="transition hover:underline"
            >
              Builder Lab
            </a>
            <a
              href="#contact"
              className="transition hover:underline"
            >
              Contact
            </a>

            {/* Social Icons */}
            <div
              className="flex items-center gap-2 pl-2 border-l"
              style={{ borderColor: isDark ? 'var(--line-dark)' : 'var(--line)' }}
            >
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition"
                style={{ background: 'var(--surface-2)', border: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}`, color: 'var(--text-2)' }}
                aria-label="GitHub Profile"
              >
                <Github className="w-3.5 h-3.5" />
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg transition"
                style={{ background: 'var(--surface-2)', border: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}`, color: 'var(--text-2)' }}
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>

              <a
                href={`mailto:${personalInfo.email}`}
                className="p-1.5 rounded-lg transition"
                style={{ background: 'var(--surface-2)', border: `1px solid ${isDark ? 'var(--line-dark)' : 'var(--line)'}`, color: 'var(--text-2)' }}
                aria-label="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Micro Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          <p>© {new Date().getFullYear()} Bhanuprasad L. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition border cursor-pointer"
            style={{ background: 'var(--surface-2)', borderColor: isDark ? 'var(--line-dark)' : 'var(--line)', color: 'var(--text-2)' }}
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
