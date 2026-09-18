/**
 * Builder Lab — System Board.
 *
 * A from-scratch replacement for the node-graph canvas: the generated system
 * presented as structured cards — header dossier, tabbed detail, a living
 * pipeline of stages, and an actions checklist. Every word comes from the
 * engine data (labels, roles, flows, decisions, evidence); nothing invented.
 * Same machine, same interactions (select, inspect, remove, run, decide).
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  LayoutDashboard,
  Cpu,
  Database,
  Plug,
  Check,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import type {
  DerivedEdge,
  GeneratedSystem,
  PositionedNode,
  SystemNodeKind,
} from '../../../data/build-engine/types';

const KIND_ICON: Record<SystemNodeKind, React.ComponentType<{ size?: number | string; color?: string; className?: string }>> = {
  actor: User,
  interface: LayoutDashboard,
  automation: Cpu,
  data: Database,
  integration: Plug,
};

const KIND_LABEL: Record<SystemNodeKind, string> = {
  actor: 'Actor',
  interface: 'Interface',
  automation: 'Automation',
  data: 'Data store',
  integration: 'Integration',
};

const TONE_BASE: Record<string, string> = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  slate: '#64748b',
};

const KIND_TEXT: Record<SystemNodeKind, { dark: string; light: string }> = {
  actor: { dark: '#60a5fa', light: '#2563eb' },
  interface: { dark: '#60a5fa', light: '#2563eb' },
  automation: { dark: '#34d399', light: '#059669' },
  data: { dark: '#a78bfa', light: '#7c3aed' },
  integration: { dark: '#22d3ee', light: '#0891b2' },
};

type BoardTab = 'flow' | 'product' | 'architecture' | 'evidence';
const TABS: { id: BoardTab; label: string }[] = [
  { id: 'flow', label: 'Flow' },
  { id: 'product', label: 'Product' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'evidence', label: 'Evidence' },
];

interface SystemBoardProps {
  system: GeneratedSystem;
  nodes: PositionedNode[];
  edges: DerivedEdge[];
  activeEdgeIds: Set<string>;
  lensEmphasis: Set<string>;
  decisionHighlights: Set<string>;
  selectedNodeId: string | null;
  starvedIds: Set<string>;
  simState: 'idle' | 'running' | 'paused' | 'gate' | 'done';
  onSelectNode: (id: string | null) => void;
  onRemoveNode: (id: string) => void;
}

export const SystemBoard: React.FC<SystemBoardProps> = ({
  system,
  nodes,
  edges,
  activeEdgeIds,
  lensEmphasis,
  decisionHighlights,
  selectedNodeId,
  starvedIds,
  simState,
  onSelectNode,
  onRemoveNode,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [tab, setTab] = useState<BoardTab>('flow');

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  /* Pipeline order = engine build order, then anything bolted on later. */
  const stages = useMemo(() => {
    const ordered: PositionedNode[] = [];
    for (const id of system.buildOrder) {
      const n = byId.get(id);
      if (n) ordered.push(n);
    }
    const seen = new Set(ordered.map((n) => n.id));
    for (const n of [...nodes].sort((a, b) => a.x - b.x)) {
      if (!seen.has(n.id)) ordered.push(n);
    }
    return ordered;
  }, [system.buildOrder, byId, nodes]);

  const incomingFlow = useMemo(() => {
    const m = new Map<string, string>();
    for (const e of edges) {
      if (e.visible && !m.has(e.to)) m.set(e.to, e.flow);
    }
    return m;
  }, [edges]);

  const activeNodeIds = useMemo(() => {
    const s = new Set<string>();
    for (const e of edges) {
      if (activeEdgeIds.has(e.id)) {
        s.add(e.from);
        s.add(e.to);
      }
    }
    return s;
  }, [edges, activeEdgeIds]);

  const actions = useMemo(
    () => nodes.filter((n) => n.kind === 'automation' || n.kind === 'integration'),
    [nodes],
  );
  const starvedCount = starvedIds.size;
  const similar = system.projectEvidence[0];

  const cardBg = isDark ? 'rgba(21,31,51,0.72)' : '#fff';
  const cardBorder = isDark ? '#2E3E5B' : '#D8E0EC';

  return (
    <div>
      {/* Dossier header */}
      <div
        className="rounded-2xl border p-4 sm:p-5"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(30,58,138,0.35), rgba(21,31,51,0.7) 55%, rgba(14,116,144,0.18))'
            : 'linear-gradient(135deg, rgba(29,78,216,0.08), rgba(255,255,255,0.9) 55%, rgba(14,116,144,0.08))',
          borderColor: cardBorder,
        }}
      >
        <div className="flex items-start gap-3.5">
          <span
            className="shrink-0 flex items-center justify-center rounded-2xl"
            style={{
              width: 52, height: 52,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              boxShadow: '0 10px 28px -8px rgba(59,130,246,0.7)',
            }}
          >
            <Sparkles size={24} color="#fff" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#7C8DB0' : '#64748B' }}>
              SYSTEM GENERATED
            </div>
            <h3 style={{ fontSize: 'clamp(18px, 2.4vw, 24px)', fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#F8FAFC' : '#0B1220', marginTop: 2, lineHeight: 1.25 }}>
              {system.title}
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: isDark ? '#B6C2D6' : '#3D4A61', marginTop: 5 }}>
              {system.problem}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 14 }}>
          <div className="flex items-center gap-1 rounded-full border" style={{ borderColor: cardBorder, padding: 3, background: isDark ? 'rgba(2,6,16,0.5)' : 'rgba(248,250,252,0.8)' }} role="tablist" aria-label="System detail">
            {TABS.map((t) => {
              const on = tab === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.id)}
                  className="rounded-full transition-all"
                  style={{
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: on ? '#fff' : isDark ? '#8EA0B8' : '#5B6B85',
                    background: on ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: on ? '0 6px 18px -6px rgba(59,130,246,0.7)' : 'none',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <span className="flex-1" />
          <a
            href={similar?.url ?? '#work'}
            target={similar?.url ? '_blank' : undefined}
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border font-semibold transition"
            style={{ padding: '7px 14px', fontSize: 12, borderColor: cardBorder, color: isDark ? '#E2E8F0' : '#0F172A', background: 'transparent', textDecoration: 'none' }}
          >
            See Similar Project <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Tab body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${system.id}-${tab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{ marginTop: 12 }}
        >
          {tab === 'flow' && (
            <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
              {/* Pipeline */}
              <div>
                {stages.map((n, i) => {
                  const toneBase = TONE_BASE[n.tone] ?? '#64748b';
                  const kindColor = isDark ? KIND_TEXT[n.kind].dark : KIND_TEXT[n.kind].light;
                  const Icon = KIND_ICON[n.kind];
                  const isActive = activeNodeIds.has(n.id);
                  const isSelected = selectedNodeId === n.id;
                  const isStarved = starvedIds.has(n.id) || n.starved;
                  const isDecision = decisionHighlights.has(n.id);
                  const dimmed = lensEmphasis.size > 0 && !lensEmphasis.has(n.id);
                  const flow = incomingFlow.get(n.id);
                  const last = i === stages.length - 1;
                  return (
                    <div key={n.id} className="flex gap-3">
                      {/* Status rail */}
                      <div className="flex flex-col items-center shrink-0" aria-hidden style={{ width: 22 }}>
                        <span
                          className="rounded-full"
                          style={{
                            width: 13, height: 13, marginTop: 16,
                            background: isActive ? toneBase : isStarved ? '#F59E0B' : 'transparent',
                            border: `2px solid ${isActive ? toneBase : isStarved ? '#F59E0B' : isDark ? '#334155' : '#CBD5E1'}`,
                            boxShadow: isActive ? `0 0 10px ${toneBase}` : 'none',
                          }}
                        />
                        {!last && (
                          <span className="flex-1 rounded-full" style={{ width: 2, margin: '4px 0', background: isActive ? `linear-gradient(${toneBase}, transparent)` : isDark ? '#1E293B' : '#E2E8F0', boxShadow: isActive ? `0 0 8px ${toneBase}` : 'none', minHeight: 14 }} />
                        )}
                      </div>

                      {/* Stage card */}
                      <motion.button
                        initial={{ opacity: 0, x: 14 }}
                        animate={{ opacity: dimmed ? 0.4 : 1, x: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                        onClick={() => onSelectNode(isSelected ? null : n.id)}
                        className="flex-1 text-left rounded-2xl border transition-all"
                        style={{
                          marginBottom: last ? 0 : 10,
                          padding: '12px 14px',
                          background: cardBg,
                          borderColor: isSelected || isDecision ? toneBase : isStarved ? '#F59E0B' : cardBorder,
                          boxShadow: isSelected || isActive
                            ? `0 0 0 1px ${toneBase}, 0 12px 32px -12px ${toneBase}66`
                            : isDark ? '0 8px 24px -14px rgba(0,0,0,0.7)' : '0 8px 20px -14px rgba(15,23,42,0.25)',
                          cursor: 'pointer',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="shrink-0 flex items-center justify-center rounded-xl"
                            style={{ width: 36, height: 36, background: `color-mix(in srgb, ${toneBase} 14%, transparent)`, border: `1px solid color-mix(in srgb, ${toneBase} 40%, transparent)` }}
                          >
                            <Icon size={17} color={kindColor} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em', color: isDark ? '#F1F5F9' : '#0B1220', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {n.label}
                            </div>
                            <div className="font-mono" style={{ fontSize: 10.5, color: isDark ? '#7C8DB0' : '#68778F', marginTop: 1 }}>
                              {KIND_LABEL[n.kind]} · {n.layer}
                            </div>
                          </div>
                          {flow && (
                            <span className="font-mono shrink-0 rounded-full" style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', color: kindColor, background: `color-mix(in srgb, ${toneBase} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${toneBase} 35%, transparent)` }}>
                              {flow}
                            </span>
                          )}
                          {!n.locked && (
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label={`Remove ${n.label}`}
                              onClick={(e) => { e.stopPropagation(); onRemoveNode(n.id); }}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onRemoveNode(n.id); } }}
                              className="shrink-0 flex items-center justify-center rounded-lg"
                              style={{ width: 28, height: 28, color: isDark ? '#7C8DB0' : '#94A3B8' }}
                              title="Remove stage — watch the system reroute"
                            >
                              <Trash2 size={14} />
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: isDark ? '#AEBBCE' : '#3D4A61', marginTop: 7 }}>
                          {n.role}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 7 }}>
                          {isActive && (
                            <span className="font-mono rounded-full" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 8px', background: toneBase, color: '#fff' }}>
                              ● LIVE
                            </span>
                          )}
                          {isStarved && (
                            <span className="font-mono rounded-full inline-flex items-center gap-1" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 8px', background: 'rgba(245,158,11,0.15)', color: '#FBBF24' }}>
                              <AlertTriangle size={10} /> STARVED
                            </span>
                          )}
                          {isDecision && (
                            <span className="font-mono rounded-full" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', padding: '2px 8px', background: 'rgba(139,92,246,0.16)', color: '#A78BFA' }}>
                              ◆ DECISION
                            </span>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Actions checklist */}
              <div
                className="rounded-2xl border p-4 h-fit lg:sticky lg:top-4"
                style={{ background: cardBg, borderColor: cardBorder }}
              >
                <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#7C8DB0' : '#68778F', marginBottom: 10 }}>
                  AI ACTIONS
                </div>
                <div className="space-y-2.5">
                  {actions.map((a) => {
                    const done = simState === 'done';
                    const running = simState === 'running' || simState === 'gate';
                    const active = activeNodeIds.has(a.id);
                    return (
                      <div key={a.id} className="flex items-start gap-2.5">
                        <span
                          className="shrink-0 rounded-full flex items-center justify-center"
                          style={{
                            width: 20, height: 20, marginTop: 1,
                            background: done ? '#10B981' : active ? 'color-mix(in srgb, #3B82F6 20%, transparent)' : 'transparent',
                            border: `1.5px solid ${done ? '#10B981' : active ? '#3B82F6' : isDark ? '#334155' : '#CBD5E1'}`,
                            boxShadow: active ? '0 0 10px rgba(59,130,246,0.7)' : 'none',
                          }}
                        >
                          {done ? (
                            <Check size={11} strokeWidth={3.5} color="#fff" />
                          ) : running && active ? (
                            <span className="rounded-full animate-ping" style={{ width: 8, height: 8, background: '#3B82F6' }} />
                          ) : running ? (
                            <span className="rounded-full" style={{ width: 6, height: 6, background: isDark ? '#475569' : '#94A3B8' }} />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#E2E8F0' : '#0F172A' }}>{a.label}</div>
                          <div className="font-mono" style={{ fontSize: 10.5, color: isDark ? '#7C8DB0' : '#68778F' }}>{KIND_LABEL[a.kind]}</div>
                        </div>
                      </div>
                    );
                  })}
                  {actions.length === 0 && (
                    <div style={{ fontSize: 12.5, color: isDark ? '#7C8DB0' : '#68778F' }}>
                      No automated actions in this system — human-operated flow.
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${cardBorder}` }}>
                  {starvedCount > 0 ? (
                    <div className="rounded-xl flex items-center gap-2" style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#FBBF24' }}>
                      <AlertTriangle size={14} /> Fallback — {starvedCount} stage{starvedCount === 1 ? '' : 's'} starved, human review
                    </div>
                  ) : simState === 'done' ? (
                    <div className="rounded-xl flex items-center gap-2" style={{ padding: '9px 12px', fontSize: 12, fontWeight: 700, background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>
                      <Check size={14} strokeWidth={3} /> Complete — end-to-end system ready
                    </div>
                  ) : (
                    <div className="rounded-xl font-mono" style={{ padding: '9px 12px', fontSize: 11, color: isDark ? '#7C8DB0' : '#68778F', background: isDark ? 'rgba(2,6,16,0.5)' : '#F6F8FB' }}>
                      Standby — run the system to execute
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'product' && (
            <div className="rounded-2xl border p-4 sm:p-5 space-y-4" style={{ background: cardBg, borderColor: cardBorder }}>
              <div>
                <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#7C8DB0' : '#68778F', marginBottom: 6 }}>PROBLEM</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: isDark ? '#E2E8F0' : '#0F172A' }}>{system.problem}</p>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#7C8DB0' : '#68778F', marginBottom: 6 }}>ACTORS</div>
                <div className="flex flex-wrap gap-1.5">
                  {system.actors.map((a) => (
                    <span key={a} className="rounded-full font-semibold" style={{ fontSize: 12, padding: '5px 12px', background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)', color: isDark ? '#93C5FD' : '#1D4ED8', border: `1px solid color-mix(in srgb, #3B82F6 30%, transparent)` }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { k: 'Stages', v: stages.length },
                  { k: 'Connections', v: edges.filter((e) => e.visible).length },
                  { k: 'Decisions', v: system.decisions.length },
                  { k: 'Add-ons', v: system.addOns.length },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border text-center" style={{ padding: '10px 6px', borderColor: cardBorder, background: isDark ? 'rgba(2,6,16,0.4)' : '#F6F8FB' }}>
                    <div className="font-mono" style={{ fontSize: 22, fontWeight: 700, color: isDark ? '#F8FAFC' : '#0B1220', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                    <div className="font-mono uppercase" style={{ fontSize: 9.5, letterSpacing: '0.08em', color: isDark ? '#7C8DB0' : '#68778F' }}>{s.k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'architecture' && (
            <div className="rounded-2xl border p-4 sm:p-5 space-y-3" style={{ background: cardBg, borderColor: cardBorder }}>
              <div className="font-mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: isDark ? '#7C8DB0' : '#68778F' }}>COMPOSITION</div>
              {(Object.keys(KIND_LABEL) as SystemNodeKind[]).map((k) => {
                const list = nodes.filter((n) => n.kind === k);
                if (list.length === 0) return null;
                const Icon = KIND_ICON[k];
                const c = isDark ? KIND_TEXT[k].dark : KIND_TEXT[k].light;
                const pct = Math.round((list.length / Math.max(nodes.length, 1)) * 100);
                return (
                  <div key={k}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      <Icon size={14} color={c} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: isDark ? '#E2E8F0' : '#0F172A' }}>{KIND_LABEL[k]}</span>
                      <span className="font-mono" style={{ fontSize: 11, color: isDark ? '#7C8DB0' : '#68778F' }}>×{list.length}</span>
                      <span style={{ flex: 1 }} />
                      <span className="font-mono" style={{ fontSize: 11, color: c }}>{pct}%</span>
                    </div>
                    <div className="rounded-full" style={{ height: 6, background: isDark ? '#1B2740' : '#E2E8F0', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${c}, ${c}88)`, boxShadow: `0 0 10px ${c}66` }}
                      />
                    </div>
                    <div className="font-mono" style={{ fontSize: 10.5, color: isDark ? '#7C8DB0' : '#68778F', marginTop: 3 }}>
                      {list.map((n) => n.label).join(' · ')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'evidence' && (
            <div className="space-y-2">
              {system.projectEvidence.map((ev) => (
                <a
                  key={ev.projectId}
                  href={ev.url ?? '#work'}
                  target={ev.url ? '_blank' : undefined}
                  rel="noreferrer"
                  className="block rounded-2xl border transition group"
                  style={{ padding: '13px 15px', background: cardBg, borderColor: cardBorder, textDecoration: 'none' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#F1F5F9' : '#0B1220' }}>{ev.name}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono rounded-full" style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 9px', background: ev.tag === 'BUILT' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: ev.tag === 'BUILT' ? '#34D399' : '#FBBF24' }}>
                        {ev.tag}
                      </span>
                      <ExternalLink size={13} style={{ color: isDark ? '#7C8DB0' : '#94A3B8' }} />
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.6, color: isDark ? '#AEBBCE' : '#3D4A61', marginTop: 5 }}>{ev.relevance}</p>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
