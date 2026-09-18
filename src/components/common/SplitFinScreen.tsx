/**
 * SplitFin app screen — authored at true phone scale (363pt inside
 * DeviceFrame). Group ledger, split engine, settlement sheet.
 */

import React, { useMemo, useState } from 'react';
import { ArrowRight, Users, ShieldCheck, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

function useSurface() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return {
    isDark,
    line: `1px solid var(--line${isDark ? '-dark' : ''})`,
    card: {
      background: isDark ? 'var(--surface-1)' : '#fff',
      border: `1px solid var(--line${isDark ? '-dark' : ''})`,
      borderRadius: 18,
    } as React.CSSProperties,
    sheet: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 40,
      padding: 16,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      background: isDark ? 'var(--surface-1)' : '#fff',
      border: `1px solid var(--line${isDark ? '-dark' : ''})`,
      boxShadow: isDark ? 'var(--shadow-3-dark)' : 'var(--shadow-3)',
    },
  };
}

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: strong ? 15 : 13.5, color: 'var(--text-1)', padding: '4px 0' }}>
    <span style={{ color: strong ? 'var(--text-1)' : 'var(--text-3)', fontWeight: strong ? 800 : 400 }}>{label}</span>
    <span style={{ fontWeight: strong ? 800 : 600 }}>{value}</span>
  </div>
);

const TabBar: React.FC<{
  tabs: { id: string; label: string; icon: React.ComponentType<{ size?: number | string; color?: string }> }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => {
  const { isDark, line } = useSurface();
  return (
    <div className="shrink-0 flex items-stretch" style={{ height: 62, borderTop: line, background: isDark ? 'var(--surface-2)' : '#fff' }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        const color = isActive ? 'var(--ok)' : 'var(--text-3)';
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 3, fontSize: 11, fontWeight: isActive ? 700 : 500, color,
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
};

export const SplitFinScreen: React.FC = () => {
  const { isDark, line, card, sheet } = useSurface();
  const [tab, setTab] = useState('groups');
  const [locked, setLocked] = useState(false);
  const [total, setTotal] = useState(3840);
  const [showSheet, setShowSheet] = useState(false);

  const members = useMemo(
    () => [
      { id: 'a', name: 'Aditi', owes: total / 4 },
      { id: 'b', name: 'Ravi', owes: total / 4 },
      { id: 'c', name: 'Meera', owes: total / 4 },
    ],
    [total],
  );

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pb-2" style={{ paddingTop: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="tech-label" style={{ color: 'var(--ok)' }}>SplitFin</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>Goa trip · 4 people</div>
          </div>
          <button
            onClick={() => setLocked(!locked)}
            style={{
              height: 36, padding: '0 12px', borderRadius: 999,
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              border: line, background: isDark ? 'var(--surface-1)' : '#fff', color: 'var(--text-2)',
            }}
          >
            {locked ? <Lock size={14} color="var(--text-2)" /> : <ShieldCheck size={14} color="var(--text-2)" />}
            {locked ? 'Hidden' : 'Face ID'}
          </button>
        </div>
      </div>

      {tab === 'groups' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3">
          {/* Balance */}
          <div style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>You are owed</div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)', marginTop: 2 }}>
              {locked ? '••••••' : `₹${Math.round(total - total / 4).toLocaleString()}`}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>3 friends · dinner + stay</div>
          </div>

          {/* Expense */}
          <div style={{ ...card, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' }}>Beach house · 3 nights</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>You paid · split 4 ways</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-1)' }}>₹{total.toLocaleString()}</div>
          </div>

          <button
            onClick={() => setTab('split')}
            style={{
              width: '100%', height: 48, borderRadius: 14, marginTop: 12,
              border: 'none', cursor: 'pointer',
              background: 'var(--ok)', color: '#fff', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            Split a new bill <ArrowRight size={17} color="#fff" />
          </button>
        </div>
      )}

      {tab === 'split' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 6 }}>
          <div style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Bill total</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-1)', marginTop: 2 }}>₹{total.toLocaleString()}</div>

            <input
              type="range" min={500} max={10000} step={20} value={total}
              onChange={(e) => setTotal(Number(e.target.value))}
              style={{ width: '100%', margin: '14px 0 6px', accentColor: 'var(--ok)' }}
              aria-label="Adjust bill total"
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              {members.map((m) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14.5, color: 'var(--text-2)' }}>
                  <span>{m.name} owes you</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-1)' }}>₹{Math.round(m.owes).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSheet(true)}
              style={{
                width: '100%', height: 46, borderRadius: 13, marginTop: 14,
                border: 'none', cursor: 'pointer',
                background: 'var(--ok)', color: '#fff', fontSize: 15, fontWeight: 700,
              }}
            >
              Settle up
            </button>
          </div>
        </div>
      )}

      {/* Settlement sheet */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={sheet}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--line)', margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>Settle with 3 friends</div>
              <X size={20} color="var(--text-3)" onClick={() => setShowSheet(false)} />
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-3)', margin: '6px 0 14px' }}>
              You'll receive ₹{Math.round(total - total / 4).toLocaleString()} across 3 payment requests.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowSheet(false)}
                style={{
                  flex: 1, height: 46, borderRadius: 13, cursor: 'pointer',
                  background: 'none', border: line, color: 'var(--text-2)', fontSize: 15, fontWeight: 600,
                }}
              >
                Later
              </button>
              <button
                onClick={() => { setShowSheet(false); setTab('groups'); }}
                style={{
                  flex: 1, height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
                  background: 'var(--ok)', color: '#fff', fontSize: 15, fontWeight: 700,
                }}
              >
                Request all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar
        tabs={[
          { id: 'groups', label: 'Groups', icon: Users },
          { id: 'split', label: 'Split', icon: ArrowRight },
        ]}
        active={tab}
        onChange={setTab}
      />
    </div>
  );
};
