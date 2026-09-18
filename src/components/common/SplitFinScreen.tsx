/**
 * SplitFin app screen — authored at true phone scale (363pt inside
 * DeviceFrame). Cashflow-first: an orbit of who owes you, a donut of where
 * money went, a real transaction feed, and a split composer with live math.
 */

import React, { useMemo, useState } from 'react';
import { ArrowRight, Home, ReceiptText, Users, X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { devicePalette, type DevicePalette } from './deviceTheme';

const IN = 25380;

const CATS = [
  { id: 'stay', label: 'Stay', amount: 9800 },
  { id: 'travel', label: 'Travel', amount: 6150 },
  { id: 'food', label: 'Food', amount: 4240 },
  { id: 'other', label: 'Other', amount: 2310 },
] as const;

type CatId = (typeof CATS)[number]['id'];

const SEGMENTS: Record<CatId, { dark: string; light: string }> = {
  stay: { dark: '#A78BFA', light: '#7C3AED' },
  travel: { dark: '#22D3EE', light: '#0891B2' },
  food: { dark: '#3B82F6', light: '#2563EB' },
  other: { dark: '#64748B', light: '#94A3B8' },
};

const OUT = CATS.reduce((s, c) => s + c.amount, 0);
const NET = IN - OUT;

const MEMBERS = [
  { id: 'a', name: 'Aditi', color: '#3B82F6' },
  { id: 'b', name: 'Ravi', color: '#22D3EE' },
  { id: 'c', name: 'Meera', color: '#A78BFA' },
] as const;

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
  { id: 't3', name: 'Aditi paid back', cat: 'other', date: 'May 10', amount: 2400 },
  { id: 't4', name: 'Seafood dinner · 4', cat: 'food', date: 'May 9', amount: -2860 },
  { id: 't5', name: 'Scooter rental', cat: 'travel', date: 'May 8', amount: -1800 },
  { id: 't6', name: 'Ravi paid back', cat: 'other', date: 'May 7', amount: 1960 },
  { id: 't7', name: 'Brunch + coffee', cat: 'food', date: 'May 6', amount: -1380 },
];

const inr = (n: number) => `₹${Math.abs(Math.round(n)).toLocaleString()}`;

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
      const color = isActive ? pal.brand : pal.faint;
      return (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, fontSize: 12, fontWeight: isActive ? 700 : 500, color,
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

/* Orbit — the three people who owe you, ringed around the net. */
const OrbitHeader: React.FC<{ pal: DevicePalette }> = ({ pal }) => {
  const pts = MEMBERS.map((m, i) => {
    const a = ((-90 + i * 120) * Math.PI) / 180;
    return { ...m, x: 50 + 40 * Math.cos(a), y: 50 + 40 * Math.sin(a) };
  });
  return (
    <div style={{ position: 'relative', width: 224, height: 188, margin: '0 auto' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <ellipse cx={50} cy={50} rx={40} ry={40} fill="none" stroke={pal.track} strokeWidth={1.5} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        {pts.map((p) => (
          <line key={p.id} x1={50} y1={50} x2={p.x} y2={p.y} stroke={pal.track} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {pts.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `calc(${p.x}% - 19px)`,
            top: `calc(${p.y}% - 19px)`,
            width: 38, height: 38, borderRadius: 999,
            background: p.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800,
            border: `2.5px solid ${pal.card}`,
            boxShadow: `0 0 0 1px ${pal.cardBorder}`,
          }}
        >
          {p.name[0]}
        </div>
      ))}
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: pal.faint }}>YOU GET</div>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.02em', color: pal.ink, marginTop: 1 }}>
          +{inr(NET)}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: pal.sub, marginTop: 1 }}>3 friends · May</div>
      </div>
    </div>
  );
};

/* Donut — where the money went, tap a segment to inspect. */
const Donut: React.FC<{ pal: DevicePalette; isDark: boolean }> = ({ pal, isDark }) => {
  const [active, setActive] = useState<CatId | null>(null);
  const size = 148;
  const stroke = 17;
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
    <div style={{ background: pal.card, border: `1px solid ${pal.cardBorder}`, borderRadius: 18, padding: 14 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <button
          onClick={() => setActive(null)}
          aria-label="Cashflow breakdown"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
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
                  strokeDasharray={`${Math.max(s.frac * C - 3, 1)} ${C}`}
                  strokeDashoffset={-s.start * C}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  opacity={dim ? 0.3 : 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(active === s.id ? null : s.id);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: pal.faint }}>
            {shown ? shown.label.toUpperCase() : 'MAY NET'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', color: pal.ink, marginTop: 1 }}>
            {shown ? inr(shown.amount) : `+${inr(NET)}`}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: pal.sub, marginTop: 2 }}>
            {shown
              ? `${Math.round((shown.amount / OUT) * 100)}% of spending`
              : `${inr(IN)} in · ${inr(OUT)} out`}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
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
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: isActive ? 700 : 500, color: isActive ? pal.ink : pal.sub }}>
                {c.label}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, color: pal.ink }}>{inr(c.amount)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

export const SplitFinScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pal = devicePalette(isDark);
  const [tab, setTab] = useState('home');
  const [filter, setFilter] = useState<'all' | CatId>('all');

  /* Split composer state */
  const [total, setTotal] = useState(2400);
  const [equal, setEqual] = useState(true);
  const [custom, setCustom] = useState<number[]>([800, 800, 800]);
  const [showSheet, setShowSheet] = useState(false);

  const shares = useMemo(() => {
    if (equal) {
      const each = Math.floor(total / 3);
      return [total - each * 2, each, each];
    }
    return custom;
  }, [equal, total, custom]);
  const remaining = total - shares.reduce((s, n) => s + n, 0);
  const canRequest = remaining === 0 && total > 0;

  const bump = (i: number, d: number) =>
    setCustom((prev) => prev.map((v, j) => (j === i ? Math.max(0, v + d) : v)));

  const txns = TXNS.filter((t) => filter === 'all' || t.cat === filter);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pb-1" style={{ paddingTop: 6 }}>
        <div className="tech-label" style={{ color: pal.brand }}>SplitFin</div>
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.02em', color: pal.ink }}>
          {tab === 'home' ? 'May cashflow' : tab === 'activity' ? 'Transactions' : 'Split a bill'}
        </div>
      </div>

      {tab === 'home' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 2 }}>
          <OrbitHeader pal={pal} />
          <Donut pal={pal} isDark={isDark} />
          <button
            onClick={() => setTab('split')}
            style={{
              width: '100%', height: 48, borderRadius: 14, marginTop: 10,
              border: 'none', cursor: 'pointer',
              background: pal.brand, color: pal.brandInk, fontSize: 15.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Split a new bill <ArrowRight size={17} />
          </button>
        </div>
      )}

      {tab === 'activity' && (
        <div className="flex-1 min-h-0 flex flex-col px-4 pb-3" style={{ paddingTop: 4 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {(['all', ...CATS.map((c) => c.id)] as const).map((f) => {
              const on = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    height: 32, padding: '0 12px', borderRadius: 999,
                    fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer',
                    border: `1px solid ${on ? pal.brand : pal.cardBorder}`,
                    background: on ? pal.chip : 'transparent',
                    color: on ? pal.brand : pal.sub,
                  }}
                >
                  {f === 'all' ? 'All' : CATS.find((c) => c.id === f)!.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {txns.map((t) => {
              const color = isDark ? SEGMENTS[t.cat].dark : SEGMENTS[t.cat].light;
              const positive = t.amount > 0;
              return (
                <div
                  key={t.id}
                  style={{
                    background: pal.card, border: `1px solid ${pal.cardBorder}`,
                    borderRadius: 14, padding: '10px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <span style={{ width: 9, height: 36, borderRadius: 4, background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: pal.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: pal.sub, marginTop: 1 }}>
                      {CATS.find((c) => c.id === t.cat)!.label} · {t.date}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: positive ? pal.green : pal.ink }}>
                    {positive ? '+' : '−'}{inr(t.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'split' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 4 }}>
          <div style={{ background: pal.card, border: `1px solid ${pal.cardBorder}`, borderRadius: 18, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: pal.sub }}>Bill total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: pal.ink }}>{inr(total)}</span>
            </div>
            <input
              type="range" min={300} max={9000} step={60} value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              style={{ width: '100%', margin: '10px 0 2px', accentColor: pal.brand }}
              aria-label="Adjust bill total"
            />
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {[960, 2400, 4800].map((p) => (
                <button
                  key={p}
                  onClick={() => setTotal(p)}
                  style={{
                    flex: 1, height: 34, borderRadius: 10, cursor: 'pointer',
                    fontSize: 13.5, fontWeight: 700,
                    border: `1px solid ${total === p ? pal.brand : pal.cardBorder}`,
                    background: total === p ? pal.chip : 'transparent',
                    color: total === p ? pal.brand : pal.sub,
                  }}
                >
                  {inr(p)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              {(['equal', 'custom'] as const).map((m) => {
                const on = (m === 'equal') === equal;
                return (
                  <button
                    key={m}
                    onClick={() => setEqual(m === 'equal')}
                    style={{
                      flex: 1, height: 34, borderRadius: 10, cursor: 'pointer',
                      fontSize: 13.5, fontWeight: 700, textTransform: 'capitalize',
                      border: `1px solid ${on ? pal.brand : pal.cardBorder}`,
                      background: on ? pal.brand : 'transparent',
                      color: on ? pal.brandInk : pal.sub,
                    }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {MEMBERS.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 32, height: 32, borderRadius: 999, flexShrink: 0,
                      background: m.color, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800,
                    }}
                  >
                    {m.name[0]}
                  </span>
                  <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: pal.ink }}>{m.name}</span>
                  {!equal && (
                    <button
                      onClick={() => bump(i, -40)}
                      aria-label={`Decrease ${m.name}'s share`}
                      style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${pal.cardBorder}`, background: 'transparent', color: pal.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={14} />
                    </button>
                  )}
                  <span style={{ minWidth: 58, textAlign: 'right', fontSize: 15, fontWeight: 800, color: pal.ink }}>
                    {inr(shares[i])}
                  </span>
                  {!equal && (
                    <button
                      onClick={() => bump(i, 40)}
                      aria-label={`Increase ${m.name}'s share`}
                      style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${pal.cardBorder}`, background: 'transparent', color: pal.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!equal && (
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10, color: remaining === 0 ? pal.green : pal.amber }}>
                {remaining === 0 ? 'Split adds up ✓' : `${inr(remaining)} left to assign`}
              </div>
            )}

            <button
              onClick={() => canRequest && setShowSheet(true)}
              style={{
                width: '100%', height: 46, borderRadius: 13, marginTop: 12,
                border: 'none', cursor: canRequest ? 'pointer' : 'not-allowed',
                background: canRequest ? pal.brand : pal.track,
                color: canRequest ? pal.brandInk : pal.faint,
                fontSize: 15.5, fontWeight: 700, opacity: canRequest ? 1 : 0.8,
              }}
            >
              Request {inr(total)}
            </button>
          </div>
        </div>
      )}

      {/* Request sheet */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
              padding: 16, borderTopLeftRadius: 22, borderTopRightRadius: 22,
              background: pal.card, border: `1px solid ${pal.cardBorder}`,
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: pal.track, margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: pal.ink }}>Request {inr(total)}</div>
              <button onClick={() => setShowSheet(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={20} color={pal.faint} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0 14px' }}>
              {MEMBERS.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, color: pal.sub }}>
                  <span>{m.name}</span>
                  <span style={{ fontWeight: 700, color: pal.ink }}>{inr(shares[i])}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowSheet(false); setTab('home'); }}
              style={{
                width: '100%', height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
                background: pal.brand, color: pal.brandInk, fontSize: 15.5, fontWeight: 700,
              }}
            >
              Send 3 requests
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar
        pal={pal}
        tabs={[
          { id: 'home', label: 'Home', icon: Home },
          { id: 'activity', label: 'Activity', icon: ReceiptText },
          { id: 'split', label: 'Split', icon: Users },
        ]}
        active={tab}
        onChange={setTab}
      />
    </div>
  );
};
