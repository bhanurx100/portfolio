/**
 * Device palette — high-contrast ink for app screens rendered inside
 * DeviceFrame.
 *
 * Site tokens (`--text-3/4`) are tuned for full-size page prose; at the
 * ~0.64 device scale they read dull (light) or vanish (dark). Screens use
 * this palette instead: brighter secondary text, vivid semantics in dark
 * mode, deeper ink in light mode. Derived from the demo.png reference —
 * near-black canvas, blue/cyan neon accents.
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
        ink: '#F1F5F9',
        sub: '#C6D2E2',
        faint: '#8EA0B8',
        card: '#101A2C',
        cardBorder: '#223148',
        chip: '#16223A',
        brand: '#3B82F6',
        brandInk: '#FFFFFF',
        green: '#34D399',
        red: '#F87171',
        amber: '#FBBF24',
        track: '#223148',
        tabBg: '#0E1626',
      }
    : {
        ink: '#0B1220',
        sub: '#3D4A61',
        faint: '#68778F',
        card: '#FFFFFF',
        cardBorder: '#D8E0EC',
        chip: '#EDF1F7',
        brand: '#1D4ED8',
        brandInk: '#FFFFFF',
        green: '#047857',
        red: '#DC2626',
        amber: '#B45309',
        track: '#E2E8F2',
        tabBg: '#FFFFFF',
      };
}
