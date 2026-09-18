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
      className={`py-8 sm:py-12 border-t transition-colors duration-500 ${
        isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Main Footer Row */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          
          {/* Identity & Short Portfolio Note */}
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {personalInfo.name}
              </span>
              <span className="text-xs font-mono text-slate-500">/</span>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Full-Stack Software Engineer
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Designed & built with TypeScript, React 19, and Tailwind CSS.
            </p>
          </div>

          {/* Navigation Links & Social Channels */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono">
            <a
              href="#work"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              Work
            </a>
            <a
              href="#how-i-build"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              How I Build
            </a>
            <a
              href="#experience"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              Experience
            </a>
            <a
              href="#github"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              GitHub
            </a>
            <a
              href="#builder-lab"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              Builder Lab
            </a>
            <a
              href="#contact"
              className={isDark ? 'hover:text-white transition' : 'hover:text-blue-600 transition'}
            >
              Contact
            </a>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50 dark:border-slate-800 border-slate-300">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-lg transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-300 shadow-2xs'
                }`}
                aria-label="GitHub Profile"
              >
                <Github className="w-3.5 h-3.5" />
              </a>

              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-lg transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-300 shadow-2xs'
                }`}
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>

              <a
                href={`mailto:${personalInfo.email}`}
                className={`p-1.5 rounded-lg transition border ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                    : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-300 shadow-2xs'
                }`}
                aria-label="Send Email"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Micro Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} Bhanuprasad L. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition border cursor-pointer ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                : 'bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-950 border-slate-300 shadow-2xs'
            }`}
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>

      </div>
    </footer>
  );
};
