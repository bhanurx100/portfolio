import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const GlobalBackground: React.FC = () => {
  const { theme } = useTheme();
  const [mousePos, setMousePos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    let timeoutId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY, visible: true });
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setMousePos((prev) => ({ ...prev, visible: false }));
      }, 3000);
    };

    const handleMouseLeave = () => {
      setMousePos((prev) => ({ ...prev, visible: false }));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500">
      {/* Base Canvas */}
      <div
        className={`absolute inset-0 transition-colors duration-300 ${
          isDark ? 'bg-[#0E1626]' : 'bg-[#EEF2F6]'
        }`}
      />

      {/* Subtle Top Ambient Lighting */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1200px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent opacity-90'
            : 'bg-gradient-to-b from-blue-500/12 via-indigo-500/8 to-transparent opacity-80'
        }`}
      />

      {/* Subtle Restrained Hairline Grid Texture with Radial Fade */}
      <div
        className={`absolute inset-0 pointer-events-none [mask-image:radial-gradient(ellipse_80%_70%_at_50%_25%,#000_60%,transparent_100%)] ${
          isDark
            ? 'bg-[linear-gradient(to_right,color-mix(in_srgb,var(--line-strong)_19%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--line-strong)_19%,transparent)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]'
            : 'bg-[linear-gradient(to_right,color-mix(in_srgb,var(--text-4)_15%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--text-4)_15%,transparent)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]'
        }`}
      />

      {/* Smooth Cursor Spotlight (Subtle cursor response) */}
      {mousePos.visible && (
        <div
          className={`absolute rounded-full pointer-events-none blur-[100px] transition-opacity duration-500 will-change-transform ${
            isDark ? 'bg-blue-500/06' : 'bg-slate-400/08'
          }`}
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            width: '380px',
            height: '380px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};

