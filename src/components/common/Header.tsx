import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { personalInfo } from '../../data/portfolio-data';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ activeSection }) => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Work', href: '#work', id: 'work' },
    { name: 'Builder Lab', href: '#builder-lab', id: 'builder-lab' },
    { name: 'Experience', href: '#experience', id: 'experience' },
    { name: 'GitHub', href: '#github', id: 'github' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${isScrolled
          ? isDark
            ? 'py-3 bg-[#0E1626]/90 backdrop-blur-md border-b border-slate-800 shadow-sm'
            : 'py-3 bg-white/90 backdrop-blur-md border-b border-slate-300/80 shadow-xs'
          : 'py-4 sm:py-5 bg-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo / Brand */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            className="group flex items-center gap-2.5 focus:outline-hidden"
            aria-label="Bhanuprasad L Portfolio"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs tracking-tight transition ${isDark
              ? 'bg-slate-800 text-white border border-slate-700/80 group-hover:border-slate-600'
              : 'bg-slate-900 text-white group-hover:bg-slate-800'
              }`}>
              BL
            </div>
            <div className="flex flex-col">
              <span className={`font-semibold text-sm tracking-tight transition leading-none ${isDark ? 'text-white group-hover:text-slate-200' : 'text-slate-900 group-hover:text-slate-700'
                }`}>
                {personalInfo.name}
              </span>
              <span className={`text-[11px] mt-1 tracking-tight ${isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                Product Engineer
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className={`hidden md:flex items-center gap-0.5 px-2 py-1 rounded-full border transition ${isDark
            ? 'bg-slate-900/60 border-slate-800/80 backdrop-blur-md'
            : 'bg-slate-100/80 border-slate-200/80 backdrop-blur-md'
            }`}>
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${isActive
                    ? isDark
                      ? 'text-white'
                      : 'text-slate-900'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className={`absolute inset-0 rounded-full ${isDark ? 'bg-slate-800' : 'bg-white shadow-2xs border border-slate-200/60'
                        }`}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Section */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition ${isDark
                ? 'bg-slate-900/60 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                }`}
              title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
              aria-label="Toggle color theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* Primary Action Button */}
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${isDark
                ? 'bg-white text-slate-900 hover:bg-slate-100 font-semibold'
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xs font-semibold'
                }`}
            >
              <span>Get in Touch</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg border transition ${isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
                }`}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed inset-x-0 top-[56px] z-30 border-b backdrop-blur-xl p-5 md:hidden space-y-3 shadow-lg ${isDark
              ? 'bg-[#0E1626]/98 border-slate-800'
              : 'bg-white/98 border-slate-300 text-slate-900'
              }`}
          >
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-between ${activeSection === link.id
                    ? isDark
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-900 font-semibold'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </a>
              ))}
            </nav>

            <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-mono ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
              <span className="min-w-0 truncate">{personalInfo.email}</span>
              <span className="text-emerald-500 font-medium shrink-0">Available</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

