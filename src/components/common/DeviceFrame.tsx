/**
 * Device Presentation System — the single source of truth for showing a
 * real mobile product inside the portfolio.
 *
 * Model: the screen is designed at true phone scale (393 × 852 logical
 * points, iPhone 15 Pro) and the whole shell is rendered as a proportional
 * replica via CSS transform. App content is therefore authored at real
 * mobile density — 15–16px body text, 44px touch targets — exactly as it
 * would ship, and every physical pixel stays in correct proportion.
 *
 * Rules:
 *  - One device at a time; the caller picks the device that communicates
 *    the project best.
 *  - Real chrome only: dynamic island, time, abstract signal bars, home
 *    indicator. No fake radios, battery rituals, or 5G cosplay.
 *  - This file never knows about specific apps; screens come from AppScreens.
 */

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/* ------------------------------------------------------------------ */
/* Design-space constants (logical points)                             */
/* ------------------------------------------------------------------ */

export const DEVICE_W = 393;
export const DEVICE_H = 852;

const SHELL_PAD = 11;      // titanium rail thickness (pt)
const BEZEL_PAD = 4;       // black bezel (pt)
const SCREEN_W = DEVICE_W - (SHELL_PAD + BEZEL_PAD) * 2; // 363
const SCREEN_H = DEVICE_H - (SHELL_PAD + BEZEL_PAD) * 2; // 822

interface DeviceFrameProps {
  /** Rendered width of the shell in CSS px. Height derives proportionally. */
  width?: number;
  /** App content, authored at 393pt design width. */
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  width = 250,
  children,
  className = '',
  ariaLabel = 'App preview in a phone frame',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const height = Math.round(width * (DEVICE_H / DEVICE_W));
  const scale = width / DEVICE_W;

  return (
    <div className={`relative select-none ${className}`} style={{ width, height }} role="img" aria-label={ariaLabel}>
      {/* Scaled replica of the 393pt shell */}
      <div
        style={{
          width: DEVICE_W,
          height: DEVICE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Titanium rail */}
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: SHELL_PAD,
            borderRadius: 58,
            background: isDark
              ? 'linear-gradient(160deg, #3d4654 0%, #1a2231 45%, #0d131f 100%)'
              : 'linear-gradient(160deg, #e9ecf1 0%, #c9d0da 45%, #98a3b3 100%)',
            boxShadow: isDark ? 'var(--shadow-3-dark)' : 'var(--shadow-3)',
          }}
        >
          {/* Black bezel */}
          <div style={{ width: '100%', height: '100%', padding: BEZEL_PAD, borderRadius: 48, background: '#05070c' }}>
            {/* Screen — authored at 363pt wide */}
            <div
              className="relative flex flex-col overflow-hidden"
              style={{
                width: SCREEN_W,
                height: SCREEN_H,
                borderRadius: 44,
                background: isDark ? '#0A0F1B' : '#F4F6FA',
                color: 'var(--text-1)',
              }}
            >
              {/* ---- Chrome: status bar + island ---- */}
              <div
                className="relative shrink-0 flex items-center justify-between"
                style={{ height: 54, padding: '0 26px', marginTop: 8 }}
              >
                <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>9:41</span>

                {/* Dynamic island */}
                <div
                  className="absolute left-1/2"
                  style={{
                    top: 6,
                    transform: 'translateX(-50%)',
                    width: 108,
                    height: 30,
                    borderRadius: 999,
                    background: '#000',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 10,
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: '#0d1017',
                      boxShadow: 'inset 0 0 0 1px rgba(80,90,120,0.35)',
                    }}
                  />
                </div>

                {/* Abstract signal — four bars, honest abstraction */}
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
                  <rect x="0" y="7.5" width="3" height="4.5" rx="1" fill="currentColor" opacity="0.95" />
                  <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" opacity="0.95" />
                  <rect x="10" y="2.5" width="3" height="9.5" rx="1" fill="currentColor" opacity="0.95" />
                  <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.3" />
                </svg>
              </div>

              {/* ---- App viewport ---- */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>

              {/* ---- Home indicator ---- */}
              <div className="shrink-0 flex items-center justify-center" style={{ height: 26 }}>
                <div
                  style={{
                    width: 128,
                    height: 5,
                    borderRadius: 999,
                    background: isDark ? 'rgba(241,245,249,0.4)' : 'rgba(15,23,42,0.35)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
