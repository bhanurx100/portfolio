/**
 * Device palette — native iOS aesthetic for app screens rendered inside
 * DeviceFrame.
 *
 * Follows Apple's Human Interface Guidelines: system Blue for actions,
 * system Green/Red/Orange for semantics, grouped backgrounds with white
 * (light) / elevated (dark) cells, hairline separators, and the San
 * Francisco stack (see `.ios-screen`). One accent, quiet surfaces —
 * no neon, no glow.
 */

export interface DevicePalette {
  ink: string;
  sub: string;
  faint: string;
  card: string;
  cardBorder: string;
  chip: string;
  brand: string;
  brandInk: string;
  green: string;
  red: string;
  amber: string;
  track: string;
  tabBg: string;
}

export function devicePalette(isDark: boolean): DevicePalette {
  return isDark
    ? {
        ink: '#F2F2F7',
        sub: '#A7AEBB',
        faint: '#70788C',
        card: '#232D49',
        cardBorder: '#34415F',
        chip: '#1B2440',
        brand: '#0A84FF',
        brandInk: '#FFFFFF',
        green: '#30D158',
        red: '#FF453A',
        amber: '#FF9F0A',
        track: '#2E3B58',
        tabBg: 'rgba(29, 39, 64, 0.85)',
      }
    : {
        ink: '#101014',
        sub: '#515156',
        faint: '#8E8E93',
        card: '#FFFFFF',
        cardBorder: '#D1D1D6',
        chip: '#F2F2F7',
        brand: '#007AFF',
        brandInk: '#FFFFFF',
        green: '#34C759',
        red: '#FF3B30',
        amber: '#FF9500',
        track: '#E5E5EA',
        tabBg: 'rgba(249, 249, 249, 0.88)',
      };
}
