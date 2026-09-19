/**
 * SplitFin app screen — authored at true phone scale (363pt inside
 * DeviceFrame). A futuristic cashflow command center:
 *
 *   Home   — balance hero, weekly in/out cashflow, tap-to-inspect donut,
 *            rotating group orbit (who owes whom), quick actions.
 *   Bills  — budget ring, per-category budgets, recurring bills with
 *            auto-pay toggles and one-tap pay.
 *   Split  — split engine: bill total, GST toggle, paid-by, equal/custom
 *            shares with live math, request sheet.
 *   Feed   — searchable, filterable activity feed with group settlement.
 */

import React, { useId, useMemo, useState } from 'react';
import {
  ArrowRight, Activity, Bell, CalendarClock, Check,
  Dumbbell, HandCoins, Home, Minus, Plane, Plus, Receipt, ReceiptText,
  Search, Send, ShieldCheck, Smartphone, Sparkles, Split, TrendingDown,
  TrendingUp, Users, Wifi, Wallet, X, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { devicePalette, type DevicePalette } from './deviceTheme';

/* ------------------------------------------------------------------ */
/* Data                                                                 */
/* ------------------------------------------------------------------ */

const IN = 30000;
const OUT = 22500;
const NET = IN - OUT;

const CATS = [
  { id: 'stay', label: 'Stay', amount: 9800 },
  { id: 'travel', label: 'Travel', amount: 4950 },
  { id: 'food', label: 'Food', amount: 4240 },
  { id: 'shop', label: 'Shopping', amount: 1550 },
  { id: 'other', label: 'Other', amount: 1960 },
] as const;

type CatId = (typeof CATS)[number]['id'];

const CAT_ICON: Record<CatId, React.ComponentType<{ size?: number | string; color?: string }>> = {
  stay: Home,
  travel: Plane,
  food: Receipt,
  shop: Zap,
  other: Activity,
};

const SEGMENTS: Record<CatId, { dark: string; light: string }> = {
  stay: { dark: '#A78BFA', light: '#7C3AED' },
  travel: { dark: '#22D3EE', light: '#0891B2' },
  food: { dark: '#FB923C', light: '#EA580C' },
  shop: { dark: '#F472B6', light: '#DB2777' },
  other: { dark: '#94A3B8', light: '#64748B' },
};

const ORBIT = [
  { id: 'a', name: 'Aditi', color: '#3B82F6', delta: 2400 },
  { id: 'b', name: 'Ravi', color: '#22D3EE', delta: 2800 },
  { id: 'c', name: 'Meera', color: '#A78BFA', delta: -1200 },
] as const;

const OWED = ORBIT.reduce((s, m) => s + Math.max(m.delta, 0), 0);
const OWE = ORBIT.reduce((s, m) => s + Math.abs(Math.min(m.delta, 0)), 0);

interface Txn {
  id: string;
  name: string;
  cat: CatId;
  date: string;
  amount: number; // negative = spent
}

const TXNS: Txn[] = [
  { id: 't1', name: 'Beach house · 3 nights', cat: 'stay', date: 'May 12', amount: -9800 },
  { id: 't2', name: 'Goa ferry tickets', cat: 'travel', date: 'May 11', amount: -3150 },
  { id: 't3', name: 'Beach shirts · 2', cat: 'shop', date: 'May 11', amount: -1550 },
  { id: 't4', name: 'Aditi repaid dinner', cat: 'other', date: 'May 10', amount: 2400 },
  { id: 't5', name: 'Seafood dinner · 4', cat: 'food', date: 'May 9', amount: -2860 },
  { id: 't6', name: 'Scooter rental', cat: 'travel', date: 'May 8', amount: -1800 },
  { id: 't7', name: 'Ravi repaid ferry', cat: 'other', date: 'May 7', amount: 2800 },
  { id: 't8', name: 'Brunch + coffee', cat: 'food', date: 'May 6', amount: -1380 },
];

const WEEK = [
  { day: 'M', in: 5200, out: 2600 },
  { day: 'T', in: 2400, out: 3100 },
  { day: 'W', in: 1800, out: 1800 },
  { day: 'T', in: 1600, out: 900 },
  { day: 'F', in: 5200, out: 4800 },
  { day: 'S', in: 3100, out: 5400 },
  { day: 'S', in: 2600, out: 2100 },
];

interface Bill {
  id: string;
  name: string;
  amount: number;
  due: string;
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
  color: string;
  auto?: boolean;
}

const BILLS: Bill[] = [
  { id: 'b1', name: 'Rent · Goa crew', amount: 12000, due: 'May 1 · paid', icon: Home, color: '#A78BFA' },
  { id: 'b2', name: 'Electricity', amount: 2340, due: 'May 14', icon: Zap, color: '#FBBF24', auto: true },
  { id: 'b3', name: 'Internet', amount: 1199, due: 'May 16', icon: Wifi, color: '#22D3EE', auto: true },
  { id: 'b4', name: 'Netflix', amount: 649, due: 'May 18', icon: Smartphone, color: '#F87171' },
  { id: 'b5', name: 'Gym', amount: 2500, due: 'May 28', icon: Dumbbell, color: '#34D399' },
];

const BUDGETS: { id: CatId; cap: number }[] = [
  { id: 'stay', cap: 14000 },
  { id: 'travel', cap: 8000 },
  { id: 'food', cap: 6000 },
  { id: 'shop', cap: 3000 },
  { id: 'other', cap: 3000 },
];

const SPLITTERS = [
  { id: 'you', name: 'You', color: '#34D399' },
  { id: 'a', name: 'Aditi', color: '#3B82F6' },
  { id: 'b', name: 'Ravi', color: '#22D3EE' },
  { id: 'c', name: 'Meera', color: '#A78BFA' },
] as const;

const inr = (n: number) => `₹${Math.abs(Math.round(n)).toLocaleString()}`;
const soft = (hex: string, alpha: number) => `color-mix(in srgb, ${hex} ${alpha * 100}%, transparent)`;
const inkOn = (isDark: boolean) => (isDark ? 'var(--text-1)' : 'var(--surface-1)');

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const TabBar: React.FC<{
  pal: DevicePalette;
  tabs: { id: string; label: string; icon: React.ComponentType<{ size?: number | string; color?: string }> }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ pal, tabs, active, onChange }) => (
  <div className="shrink-0 flex items-stretch" style={{ height: 62, borderTop: `1px solid ${pal.cardBorder}`, background: pal.tabBg }}>
    {tabs.map((t) => {
      const Icon = t.icon;
      const isActive = active === t.id;
      const color = isActive ? 'var(--accent)' : 'var(--text-3)';
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, fontSize: 11.5, fontWeight: isActive ? 700 : 500, color,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <Icon size={22} color={color} />
          {t.label}
        </button>
      );
    })}
  </div>
);

const Box: React.FC<React.PropsWithChildren<{ pal: DevicePalette; pad?: number; style?: React.CSSProperties }>> = ({
  pal, pad = 14, style, children,
}) => (
  <div
    style={{
      background: pal.card, border: `1px solid ${pal.cardBorder}`, borderRadius: 20,
      padding: pad, boxShadow: `0 10px 30px -18px ${soft(pal.brand, 0.35)}`, ...style,
    }}
  >
    {children}
  </div>
);

const BoxHead: React.FC<{ pal: DevicePalette; title: string; right?: React.ReactNode }> = ({ pal, title, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <span className="tech-label" style={{ letterSpacing: '0.09em', color: 'var(--text-3)' }}>{title}</span>
    {right}
  </div>
);

const Pill: React.FC<{ color: string; bg: string; children: React.ReactNode }> = ({ color, bg, children }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, height: 22, padding: '0 9px',
      borderRadius: 999, fontSize: 11, fontWeight: 800, color, background: bg,
    }}
  >
    {children}
  </span>
);

const Switch: React.FC<{ on: boolean; onChange: () => void; pal: DevicePalette }> = ({ on, onChange, pal }) => (
  <button
    onClick={onChange}
    aria-pressed={on}
    aria-label="Toggle auto-pay"
    style={{
      width: 38, height: 22, borderRadius: 999, padding: 0, border: 'none', cursor: 'pointer',
      background: on ? 'var(--ok)' : pal.track, position: 'relative', flexShrink: 0,
      transition: 'background .2s ease',
    }}
  >
    <span
      style={{
        position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: 999,
        background: on ? '#0B1220' : '#fff', transition: 'left .2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,.35)',
      }}
    />
  </button>
);

/* ------------------------------------------------------------------ */
/* Home — balance hero                                                 */
/* ------------------------------------------------------------------ */

const BalanceHero: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  void isDark;
  return (
    <div
      style={{
        borderRadius: 22, padding: 18,
        background: pal.card, border: `1px solid ${pal.cardBorder}`,
        boxShadow: '0 12px 28px -18px rgba(15,23,42,.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: pal.faint }}>TOTAL BALANCE</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: pal.green }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: pal.green, display: 'inline-block' }} />
          LIVE
        </span>
      </div>
      <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', color: pal.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {inr(124500)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: pal.green }}>+{inr(NET)} this month</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: pal.faint }}>May · 2025</span>
      </div>
      <div style={{ display: 'flex', gap: 22, marginTop: 13, paddingTop: 12, borderTop: `1px solid ${pal.cardBorder}` }}>
        {[
          { label: 'Money in', value: `+${inr(IN)}` },
          { label: 'Money out', value: `−${inr(OUT)}` },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: pal.faint }}>{s.label}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: pal.ink, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          </div>
        ))}
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 3, paddingBottom: 2 }}>
          {WEEK.slice().reverse().map((w, i) => {
            const h = (w.in - w.out) / 5400;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 30, gap: 1 }}>
                <div style={{ width: 5, borderRadius: 999, height: Math.max(h, 0) / 0.6 * 30, background: h >= 0 ? pal.brand : pal.track }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Home — weekly cashflow chart (grouped bars)                         */
/* ------------------------------------------------------------------ */

const CashflowCard: React.FC<{ pal: DevicePalette }> = ({ pal }) => {
  /* Unique gradient ids per mount — hero + modal mount this screen
     simultaneously (one hidden), and duplicate ids break url() refs. */
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const inId = `sfin${uid}`;
  const outId = `sfout${uid}`;
  const inColor = 'var(--ok)';
  const outColor = 'var(--accent)';
  const max = Math.max(...WEEK.flatMap((w) => [w.in, w.out]));
  const net = WEEK.reduce((s, w) => s + w.in - w.out, 0);
  const scale = 44 / max;
  return (
    <Box pal={pal}>
      <BoxHead
        pal={pal}
        title="CASHFLOW · THIS WEEK"
        right={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: inColor }} /> IN
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--text-2)' }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: outColor }} /> OUT
            </span>
          </div>
        }
      />
      <svg viewBox="0 0 100 62" preserveAspectRatio="none" style={{ width: '100%', height: 108, display: 'block' }}>
        <defs>
          <linearGradient id={inId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={inColor} stopOpacity="1" />
            <stop offset="100%" stopColor={inColor} stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id={outId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={outColor} stopOpacity="1" />
            <stop offset="100%" stopColor={outColor} stopOpacity="0.45" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((g) => (
          <line key={g} x1="0" x2="100" y1={14 + g * 17} y2={14 + g * 17} stroke={pal.track} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}
        {WEEK.map((w, i) => {
          const cx = 4 + i * (92 / 7) + 92 / 14;
          const inH = w.in * scale;
          const outH = w.out * scale;
          return (
            <g key={i}>
              <rect x={cx - 3.6} y={58 - inH} width={3.2} height={inH} rx={1.6} fill={`url(#${inId})`} />
              <rect x={cx + 0.4} y={58 - outH} width={3.2} height={outH} rx={1.6} fill={`url(#${outId})`} />
              <text x={cx} y={61.5} textAnchor="middle" fontSize={5} fontWeight={700} fill="var(--text-3)">{w.day}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>7 days · team trips &amp; personal</span>
        <Pill color={net >= 0 ? 'var(--ok)' : 'var(--err)'} bg={soft(net >= 0 ? 'var(--ok)' : 'var(--err)', 0.14)}>
          <ShieldCheck size={12} /> saved {inr(net)}
        </Pill>
      </div>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Home — spending donut (tap to inspect)                              */
/* ------------------------------------------------------------------ */

const Donut: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const [active, setActive] = useState<CatId | null>(null);
  const size = 132;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segs = CATS.map((c) => {
    const frac = c.amount / OUT;
    const s = { ...c, start: acc, frac };
    acc += frac;
    return s;
  });
  const shown = active ? CATS.find((c) => c.id === active)! : null;

  return (
    <Box pal={pal}>
      <BoxHead
        pal={pal}
        title="WHERE MONEY WENT"
        right={<Pill color="var(--text-2)" bg={pal.chip}>{inr(OUT)} total</Pill>}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          onClick={() => setActive(null)}
          aria-label="Cashflow breakdown"
          style={{ position: 'relative', background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pal.track} strokeWidth={stroke} />
            {segs.map((s) => {
              const color = isDark ? SEGMENTS[s.id].dark : SEGMENTS[s.id].light;
              const dim = active && active !== s.id;
              return (
                <circle
                  key={s.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth={active === s.id ? stroke + 3 : stroke}
                  strokeDasharray={`${Math.max(s.frac * C - 2.5, 1)} ${C}`}
                  strokeDashoffset={-s.start * C}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  opacity={dim ? 0.28 : 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(active === s.id ? null : s.id);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-3)' }}>
              {shown ? shown.label.toUpperCase() : 'OUT'}
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{inr(shown?.amount ?? OUT)}</span>
            {shown && (
              <span style={{ fontSize: 10, fontWeight: 700, color: isDark ? SEGMENTS[shown.id].dark : SEGMENTS[shown.id].light, marginTop: 1 }}>
                {Math.round((shown.amount / OUT) * 100)}% of spend
              </span>
            )}
          </div>
        </button>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)' }}>
            {shown ? 'Selected category' : 'May spending'}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-3)', lineHeight: 1.45 }}>
            {shown
              ? `${shown.label} came to ${inr(shown.amount)} across the Goa trip.`
              : `${inr(IN)} in · ${inr(OUT)} out · net +${inr(NET)} this month. Tap a segment to inspect.`}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
        {CATS.map((c) => {
          const color = isDark ? SEGMENTS[c.id].dark : SEGMENTS[c.id].light;
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActive(isActive ? null : c.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: isActive ? pal.chip : 'none',
                border: 'none', borderRadius: 10, padding: isActive ? '6px 8px' : '2px 0',
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--text-1)' : 'var(--text-2)' }}>
                {c.label}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-3)' }}>{Math.round((c.amount / OUT) * 100)}%</span>
              <span style={{ width: 62, textAlign: 'right', fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{inr(c.amount)}</span>
            </button>
          );
        })}
      </div>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Home — group orbit (who owes whom)                                  */
/* ------------------------------------------------------------------ */

const Orbit: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const C = 116;
  const R = 82;
  const pts = ORBIT.map((m, i) => {
    const a = ((-90 + i * 120) * Math.PI) / 180;
    return { ...m, x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
  });
  const net = ORBIT.reduce((s, m) => s + m.delta, 0);
  return (
    <Box pal={pal}>
      <BoxHead
        pal={pal}
        title="GROUP ORBIT"
        right={
          <Pill color={net >= 0 ? 'var(--ok)' : 'var(--err)'} bg={soft(net >= 0 ? 'var(--ok)' : 'var(--err)', 0.14)}>
            net +{inr(net)}
          </Pill>
        }
      />
      <div style={{ position: 'relative', width: 232, height: 232, margin: '0 auto' }}>
        <svg viewBox="0 0 232 232" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <circle cx={C} cy={C} r={R} fill="none" stroke={pal.track} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          <ellipse
            cx={C} cy={C} rx={R} ry={R}
            fill="none" stroke={pal.faint} strokeWidth={1} strokeDasharray="2 7"
            className="lab-spin" vectorEffect="non-scaling-stroke"
            opacity={0.7}
          />
          {pts.map((p) => (
            <line key={p.id} x1={C} y1={C} x2={p.x} y2={p.y} stroke={pal.track} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        {pts.map((p) => (
          <div key={p.id} style={{ position: 'absolute', left: p.x - 30, top: p.y + 21, width: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)' }}>{p.name}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: p.delta >= 0 ? 'var(--ok)' : 'var(--err)' }}>
              {p.delta >= 0 ? `+${inr(p.delta)}` : `−${inr(p.delta)}`}
            </div>
          </div>
        ))}
        {pts.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute', left: p.x - 18, top: p.y - 18,
              width: 36, height: 36, borderRadius: 999,
              background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`, color: inkOn(isDark),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800,
              border: `2.5px solid ${pal.card}`,
              boxShadow: `0 0 0 1px ${pal.cardBorder}, 0 6px 16px -6px ${soft(p.color, 0.6)}`,
            }}
          >
            {p.name[0]}
            <span
              style={{
                position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: 999,
                background: pal.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 999, background: p.delta >= 0 ? 'var(--ok)' : 'var(--err)' }} />
            </span>
          </div>
        ))}
        <div style={{ position: 'absolute', left: C - 52, top: C - 46, width: 104, textAlign: 'center' }}>
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-3)' }}>YOU GET</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)', marginTop: 1 }}>+{inr(net)}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', marginTop: 1 }}>3 friends · May</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <Pill color="var(--ok)" bg={soft('var(--ok)', 0.14)}>owed +{inr(OWED)}</Pill>
        <Pill color="var(--err)" bg={soft('var(--err)', 0.14)}>you owe {inr(OWE)}</Pill>
        <Pill color="var(--text-3)" bg={pal.chip}>settled live</Pill>
      </div>
    </Box>
  );
};

/* ------------------------------------------------------------------ */
/* Home — quick actions + split CTA                                    */
/* ------------------------------------------------------------------ */

const QuickActions: React.FC<{ pal: DevicePalette; go: (t: string) => void }> = ({ pal, go }) => {
  const items: { id: string; label: string; icon: React.ComponentType<{ size?: number | string; color?: string }>; color: string; tab: string }[] = [
    { id: 'q1', label: 'Split', icon: Split, color: 'var(--accent)', tab: 'split' },
    { id: 'q2', label: 'Bills', icon: CalendarClock, color: 'var(--accent)', tab: 'bills' },
    { id: 'q3', label: 'Insights', icon: Sparkles, color: 'var(--warn)', tab: 'home' },
    { id: 'q4', label: 'Pay', icon: HandCoins, color: 'var(--ok)', tab: 'split' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, paddingTop: 2 }}>
      {items.map((it) => (
        <button key={it.id} onClick={() => go(it.tab)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
          <span
            style={{
              width: 50, height: 50, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: soft(it.color, 0.14), color: it.color, border: `1px solid ${soft(it.color, 0.4)}`,
              transition: 'transform .15s ease',
            }}
          >
            <it.icon size={21} color={it.color} />
          </span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-2)' }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Bills — budget ring + recurring bills                               */
/* ------------------------------------------------------------------ */

const BudgetRing: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const cap = 40000;
  const frac = OUT / cap;
  const size = 74;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.round(frac * 100);
  return (
    <Box pal={pal}>
      <BoxHead pal={pal} title="MAY BUDGET" right={<Pill color="var(--accent)" bg={soft('var(--accent)', 0.14)}>₹40,000 cap</Pill>} />
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pal.track} strokeWidth={stroke} />
            <circle
              cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={pct > 85 ? 'var(--err)' : 'var(--accent)'} strokeWidth={stroke}
              strokeDasharray={`${Math.max(frac * C - 2, 1)} ${C}`}
              strokeDashoffset={0} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{pct}%</span>
            <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-3)' }}>USED</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>
            {inr(OUT)}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-3)' }}> / {inr(cap)}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>
            {inr(cap - OUT)} left · {pct > 80 ? 'tight, slow down' : 'on track'} for May
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Pill color="var(--ok)" bg={soft('var(--ok)', 0.14)}><Sparkles size={11} /> AI cashflow OK</Pill>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 13 }}>
        {BUDGETS.map((b) => {
          const cat = CATS.find((c) => c.id === b.id)!;
          const color = isDark ? SEGMENTS[b.id].dark : SEGMENTS[b.id].light;
          const used = cat.amount / b.cap;
          return (
            <div key={b.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-2)' }}>{cat.label}</span>
                <span style={{ color: 'var(--text-1)', fontWeight: 700 }}>{inr(cat.amount)} <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>of {inr(b.cap)}</span></span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: pal.track, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(used * 100, 100)}%`, height: '100%', borderRadius: 999, background: used > 0.85 ? 'var(--err)' : color }} />
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

const BillsList: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const [automatic, setAutomatic] = useState<Set<string>>(new Set(['b2', 'b3']));
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const toggleAuto = (id: string) =>
    setAutomatic((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const pay = (id: string) => setPaidIds((prev) => new Set(prev).add(id));
  const due = BILLS.filter((b) => !paidIds.has(b.id) && b.due !== 'May 1 · paid');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingTop: 2 }}>
        <span className="tech-label" style={{ letterSpacing: '0.09em', color: 'var(--text-3)' }}>RECURRING BILLS</span>
        {due.length > 0 && (
          <Pill color="var(--warn)" bg={soft('var(--warn)', 0.14)}>{due.length} due · {inr(due.reduce((s, b) => s + b.amount, 0))}</Pill>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BILLS.map((b) => {
          const paid = b.due === 'May 1 · paid' || paidIds.has(b.id);
          const auto = automatic.has(b.id);
          const Icon = b.icon;
          return (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span
                style={{
                  width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: soft(b.color, 0.15), color: b.color, border: `1px solid ${soft(b.color, 0.4)}`,
                }}
              >
                <Icon size={18} color={b.color} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{b.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: paid ? 'var(--ok)' : 'var(--text-2)' }}>
                  {paid ? 'Paid ✓' : `Due ${b.due}${auto ? ' · auto-pay' : ''}`}
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: paid ? 'var(--text-3)' : 'var(--text-1)' }}>{inr(b.amount)}</div>
              {paid ? (
                <span style={{ width: 34, display: 'flex', justifyContent: 'center' }}>
                  <Check size={18} color="var(--ok)" />
                </span>
              ) : b.auto ? (
                <Switch on={auto} onChange={() => toggleAuto(b.id)} pal={pal} />
              ) : (
                <button
                  onClick={() => pay(b.id)}
                  style={{
                    height: 30, padding: '0 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: pal.brand, color: inkOn(isDark), fontSize: 12.5, fontWeight: 700,
                  }}
                >
                  Pay
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 9, marginTop: 12, padding: 11, borderRadius: 14,
          background: soft('var(--accent)', 0.1), border: `1px solid ${soft('var(--accent)', 0.3)}`,
        }}
      >
        <ShieldCheck size={17} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', lineHeight: 1.45 }}>
          Auto-pay drafts from your SplitFin wallet only when all group splits land.
        </span>
      </div>
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Split engine                                                        */
/* ------------------------------------------------------------------ */

const SplitPane: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const [total, setTotal] = useState(2400);
  const [tax, setTax] = useState(true);
  const [equal, setEqual] = useState(true);
  const [custom, setCustom] = useState<number[]>([600, 600, 600, 600]);
  const [paidBy, setPaidBy] = useState('you');
  const [showSheet, setShowSheet] = useState(false);

  const gross = tax ? Math.round(total * 1.18) : total;
  const taxAmt = gross - total;

  const equalShares = useMemo(() => {
    const each = Math.floor(gross / SPLITTERS.length);
    return [gross - each * (SPLITTERS.length - 1), ...Array(SPLITTERS.length - 1).fill(each)];
  }, [gross]);

  const setMode = (mode: 'equal' | 'custom') => {
    setEqual(mode === 'equal');
    if (mode === 'custom') setCustom(equalShares);
  };

  const shares = equal ? equalShares : custom;
  const remaining = gross - shares.reduce((s, n) => s + n, 0);
  const canRequest = remaining === 0 && gross > 0;

  const bump = (i: number, d: number) =>
    setCustom((prev) => {
      const next = [...prev];
      next[i] = Math.max(0, next[i] + d);
      return next;
    });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 4 }}>
      <Box pal={pal}>
        <BoxHead
          pal={pal}
          title="NEW SPLIT"
          right={
            <button
              onClick={() => setTax((v) => !v)}
              style={{
                height: 26, padding: '0 11px', borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${tax ? 'var(--accent)' : pal.cardBorder}`,
                background: tax ? soft('var(--accent)', 0.14) : 'transparent',
                color: tax ? 'var(--accent)' : 'var(--text-2)', fontSize: 11.5, fontWeight: 700,
              }}
            >
              {tax ? '18% GST on' : 'Add 18% GST'}
            </button>
          }
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Bill total</span>
          <span style={{ fontSize: 25, fontWeight: 800, color: 'var(--text-1)' }}>{inr(gross)}</span>
        </div>
        {tax ? (
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textAlign: 'right', marginTop: 1 }}>
            {inr(total)} + GST {inr(taxAmt)}
          </div>
        ) : null}
        <input
          type="range" min={300} max={12000} step={60} value={total}
          onChange={(e) => setTotal(Number(e.target.value))}
          style={{ width: '100%', margin: '8px 0 2px', accentColor: 'var(--accent)' }}
          aria-label="Adjust bill total"
        />
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[720, 2400, 4800, 9600].map((p) => (
            <button
              key={p}
              onClick={() => setTotal(p)}
              style={{
                flex: 1, height: 34, borderRadius: 10, cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                border: `1px solid ${total === p ? 'var(--accent)' : pal.cardBorder}`,
                background: total === p ? pal.chip : 'transparent',
                color: total === p ? 'var(--accent)' : 'var(--text-2)',
              }}
            >
              {inr(p)}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', margin: '14px 0 8px' }}>PAID BY</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SPLITTERS.map((m) => {
            const on = paidBy === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPaidBy(m.id)}
                style={{
                  flex: 1, height: 44, borderRadius: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  border: `1px solid ${on ? m.color : pal.cardBorder}`,
                  background: on ? soft(m.color, 0.15) : 'transparent',
                }}
              >
                <span
                  style={{
                    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
                    background: m.color, color: inkOn(isDark),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800,
                  }}
                >
                  {m.name[0]}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: on ? 'var(--text-1)' : 'var(--text-2)' }}>{m.name}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
          {(['equal', 'custom'] as const).map((mode) => {
            const on = (mode === 'equal') === equal;
            return (
              <button
                key={mode}
                onClick={() => setMode(mode)}
                style={{
                  flex: 1, height: 36, borderRadius: 11, cursor: 'pointer',
                  fontSize: 13.5, fontWeight: 700, textTransform: 'capitalize',
                  border: `1px solid ${on ? 'var(--accent)' : pal.cardBorder}`,
                  background: on ? 'var(--accent)' : 'transparent',
                  color: on ? inkOn(isDark) : 'var(--text-2)',
                }}
              >
                Split {mode}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 12 }}>
          {SPLITTERS.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                  background: m.color, color: inkOn(isDark),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800,
                }}
              >
                {m.name[0]}
              </span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--text-1)' }}>
                {m.name}{paidBy === m.id ? <span style={{ color: 'var(--ok)', fontSize: 12, fontWeight: 700 }}> · paid</span> : null}
              </span>
              {!equal && (
                <button onClick={() => bump(i, -40)} aria-label={`Decrease ${m.name}'s share`} style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${pal.cardBorder}`, background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Minus size={14} />
                </button>
              )}
              <span style={{ minWidth: 58, textAlign: 'right', fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>{inr(shares[i])}</span>
              {!equal && (
                <button onClick={() => bump(i, 40)} aria-label={`Increase ${m.name}'s share`} style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${pal.cardBorder}`, background: 'transparent', color: 'var(--text-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 11 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: remaining === 0 ? 'var(--ok)' : 'var(--warn)' }}>
            {remaining === 0 ? 'Split adds up ✓' : `${inr(remaining)} left to assign`}
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-3)' }}>
            {SPLITTERS.length} ways · seat {inr(gross)}
          </span>
        </div>
      </Box>

      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 9, marginTop: 10, padding: 11, borderRadius: 14,
          background: soft('var(--accent)', 0.09), border: `1px solid ${soft('var(--accent)', 0.28)}`,
        }}
      >
        <Sparkles size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', lineHeight: 1.45 }}>
          Smart-split suggests seat maths on every tap and auto-rounds splits like restaurant bills.
        </span>
      </div>

      <button
        onClick={() => canRequest && setShowSheet(true)}
        style={{
          width: '100%', height: 48, borderRadius: 15, marginTop: 12,
          border: 'none', cursor: canRequest ? 'pointer' : 'not-allowed',
          background: canRequest ? pal.brand : pal.track,
          color: canRequest ? inkOn(isDark) : 'var(--text-3)',
          fontSize: 15.5, fontWeight: 700, opacity: canRequest ? 1 : 0.8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: canRequest ? `0 14px 30px -14px ${soft(pal.brand, 0.7)}` : 'none',
        }}
      >
        {paidBy === 'you' ? 'Request' : 'Send splits'} {inr(gross)} <Send size={17} />
      </button>

      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
              padding: 16, borderTopLeftRadius: 22, borderTopRightRadius: 22,
              background: pal.card, border: `1px solid ${pal.cardBorder}`,
              boxShadow: isDark ? '0 -18px 48px rgba(0,0,0,.55)' : '0 -18px 48px rgba(15,23,42,.18)',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: pal.track, margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>Split confirmed</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-2)', marginTop: 2 }}>
                  Paid by {SPLITTERS.find((m) => m.id === paidBy)!.name} · {inr(gross)}{tax ? ` incl. GST ${inr(taxAmt)}` : ''}
                </div>
              </div>
              <button onClick={() => setShowSheet(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={20} color="var(--text-3)" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0 14px' }}>
              {SPLITTERS.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, color: 'var(--text-2)' }}>
                  <span>
                    {m.name}{m.id === paidBy ? <span style={{ color: 'var(--ok)', fontWeight: 700 }}> · pays seat</span> : ' receives seat'}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>{inr(shares[i])}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowSheet(false); }}
              style={{
                width: '100%', height: 47, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: pal.brand, color: inkOn(isDark), fontSize: 15.5, fontWeight: 700,
              }}
            >
              Send {SPLITTERS.length} settlements
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Feed — activity with search + filters                               */
/* ------------------------------------------------------------------ */

const FeedPane: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | CatId>('all');

  const filtered = TXNS.filter(
    (t) =>
      (filter === 'all' || t.cat === filter) &&
      (query.trim() === '' || `${t.name} ${t.date} ${CATS.find((c) => c.id === t.cat)!.label}`.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col px-4 pb-3" style={{ paddingTop: 4 }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 44, padding: '0 13px', borderRadius: 14,
          border: `1px solid ${pal.cardBorder}`, background: pal.card, marginBottom: 8,
        }}
      >
        <Search size={17} color="var(--text-2)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bills, people, dates…"
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14.5, color: 'var(--text-1)' }}
        />
        {query && <X size={15} color="var(--text-2)" onClick={() => setQuery('')} style={{ cursor: 'pointer' }} />}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {(['all', ...CATS.map((c) => c.id)] as const).map((f) => {
          const on = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                height: 32, padding: '0 12px', borderRadius: 999,
                fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: 'pointer',
                border: `1px solid ${on ? 'var(--accent)' : pal.cardBorder}`,
                background: on ? pal.chip : 'transparent',
                color: on ? 'var(--accent)' : 'var(--text-2)',
              }}
            >
              {f === 'all' ? 'All' : CATS.find((c) => c.id === f)!.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Pill color="var(--ok)" bg={soft('var(--ok)', 0.14)}>owed +{inr(OWED)}</Pill>
        <Pill color="var(--err)" bg={soft('var(--err)', 0.14)}>you owe {inr(OWE)}</Pill>
        <Pill color="var(--text-2)" bg={pal.chip}>{filtered.length} entries</Pill>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '34px 0', fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>
            Nothing matches — try clearing the filters.
          </div>
        )}
        {filtered.map((t) => {
          const cat = CATS.find((c) => c.id === t.cat)!;
          const color = isDark ? SEGMENTS[t.cat].dark : SEGMENTS[t.cat].light;
          const positive = t.amount > 0;
          const Icon = CAT_ICON[t.cat];
          return (
            <div
              key={t.id}
              style={{
                background: pal.card, border: `1px solid ${pal.cardBorder}`,
                borderRadius: 15, padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span
                style={{
                  width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: soft(color, 0.15), border: `1px solid ${soft(color, 0.4)}`,
                }}
              >
                <Icon size={17} color={color} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', marginTop: 1 }}>{cat.label} · {t.date}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: positive ? 'var(--ok)' : 'var(--text-1)' }}>
                {positive ? '+' : '−'}{inr(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Home pane                                                           */
/* ------------------------------------------------------------------ */

const TITLES: Record<string, string> = {
  home: 'Cashflow HQ',
  bills: 'Bills & budgets',
  split: 'Split a bill',
  feed: 'Activity feed',
};

export const SplitFinScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pal = devicePalette(isDark);
  const [tab, setTab] = useState('home');
  const [notif, setNotif] = useState(2);

  const go = (t: string) => setTab(t);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pb-1" style={{ paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="tech-label" style={{ color: 'var(--accent)' }}>SplitFin</div>
          <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>{TITLES[tab]}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setNotif(0)}
            aria-label="Notifications"
            style={{ position: 'relative', width: 38, height: 38, borderRadius: 12, border: `1px solid ${pal.cardBorder}`, background: pal.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Bell size={18} color={notif > 0 ? 'var(--accent)' : 'var(--text-2)'} />
            {notif > 0 && (
              <span
                style={{
                  position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 999,
                  background: 'var(--err)', color: inkOn(isDark), fontSize: 9.5, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                  border: `2px solid ${isDark ? '#0A0F1B' : '#F4F6FA'}`,
                }}
              >
                {notif}
              </span>
            )}
          </button>
          <span
            style={{
              width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: pal.brand, color: inkOn(isDark), fontSize: 14, fontWeight: 800,
            }}
          >
            Y
          </span>
        </div>
      </div>

      {/* Tab panes */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            className="absolute inset-0 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
          >
            {tab === 'home' && (
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 2 }}>
                <BalanceHero pal={pal} isDark={isDark} />
                <div style={{ height: 10 }} />
                <CashflowCard pal={pal} />
                <div style={{ height: 10 }} />
                <Donut pal={pal} isDark={isDark} />
                <div style={{ height: 10 }} />
                <Orbit pal={pal} isDark={isDark} />
                <div style={{ height: 12 }} />
                <QuickActions pal={pal} go={go} />
                <button
                  onClick={() => go('split')}
                  style={{
                    width: '100%', height: 50, borderRadius: 15, marginTop: 12,
                    border: 'none', cursor: 'pointer',
                    background: pal.brand, color: inkOn(isDark),
                    fontSize: 15.5, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: `0 14px 30px -14px ${soft(pal.brand, 0.7)}`,
                  }}
                >
                  Split a new bill <ArrowRight size={17} />
                </button>
              </div>
            )}
            {tab === 'bills' && (
              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 2 }}>
                <Box pal={pal} pad={0} style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }}>
                  <Pill color="var(--ok)" bg={soft('var(--ok)', 0.14)}><ShieldCheck size={12} /> 2 of 5 bills on auto-pay</Pill>
                </Box>
                <div style={{ height: 10 }} />
                <BudgetRing pal={pal} isDark={isDark} />
                <div style={{ height: 10 }} />
                <BillsList pal={pal} isDark={isDark} />
              </div>
            )}
            {tab === 'split' && <SplitPane pal={pal} isDark={isDark} />}
            {tab === 'feed' && <FeedPane pal={pal} isDark={isDark} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <TabBar
        pal={pal}
        tabs={[
          { id: 'home', label: 'Home', icon: Wallet },
          { id: 'bills', label: 'Bills', icon: ReceiptText },
          { id: 'split', label: 'Split', icon: Split },
          { id: 'feed', label: 'Feed', icon: Users },
        ]}
        active={tab}
        onChange={setTab}
      />
    </div>
  );
};