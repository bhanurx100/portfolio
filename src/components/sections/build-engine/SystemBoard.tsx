/**
 * Builder Lab — System Orbit Console.
 *
 * One screen, no scrolling, almost no reading: the system as an orbit —
 * stages ring a live hub, traffic marches the ring, tap any stage for the
 * full story in the inspector. Depth comes from parallax layers and glow.
 * Tabs stay compact; every paragraph is clamped or moved behind a tap.
 */

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  User,
  LayoutDashboard,
  Cpu,
  Database,
  Plug,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import type {
  GeneratedSystem,
  PositionedNode,
  SystemEdge,
  SystemNodeKind,
  TraceHop,
} from '../../../data/build-engine/types';

const KIND_ICON: Record<SystemNodeKind, React.ComponentType<{ size?: number | string; color?: string; className?: string }>> = {
  actor: User,
  interface: LayoutDashboard,
  automation: Cpu,
  data: Database,
  integration: Plug,
};

const TONE_BASE: Record<string, string> = {
  blue: '#3b82f6',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#0ea5e9',
  slate: '#64748b',
};

const KIND_TEXT: Record<SystemNodeKind, { dark: string; light: string }> = {
  actor: { dark: '#60a5fa', light: '#2563eb' },
  interface: { dark: '#60a5fa', light: '#2563eb' },
  automation: { dark: '#34d399', light: '#059669' },
  data: { dark: '#38bdf8', light: '#0284c7' },
  integration: { dark: '#22d3ee', light: '#0891b2' },
};

const KIND_LABEL: Record<SystemNodeKind, string> = {
  actor: 'Actor',
  interface: 'Interface',
  automation: 'Automation',
  data: 'Data',
  integration: 'Integration',
};

/* Design lanes — architecture reads top-down: clients call services,
   services read and write data, anything may reach out to externals. */
type DesignLane = 'clients' | 'services' | 'data' | 'external';
const LANES: { id: DesignLane; label: string }[] = [
  { id: 'clients', label: 'Clients' },
  { id: 'services', label: 'Services' },
  { id: 'data', label: 'Data' },
  { id: 'external', label: 'External' },
];
const LANE_OF: Record<SystemNodeKind, DesignLane> = {
  actor: 'clients',
  interface: 'clients',
  automation: 'services',
  data: 'data',
  integration: 'external',
};

/* Edge flow language — direction, dependency and data movement. */
const FLOW_COLOR: Record<string, { dark: string; light: string }> = {
  signal: { dark: '#60A5FA', light: '#2563EB' },
  data: { dark: '#38BDF8', light: '#0284C7' },
  action: { dark: '#34D399', light: '#047857' },
  approval: { dark: '#FBBF24', light: '#B45309' },
  escalation: { dark: '#FB7185', light: '#BE123C' },
};

type BoardTab = 'flow' | 'product' | 'architecture' | 'evidence';
const TABS: { id: BoardTab; label: string }[] = [
  { id: 'flow', label: 'Architecture' },
  { id: 'product', label: 'Context' },
  { id: 'architecture', label: 'Composition' },
  { id: 'evidence', label: 'Evidence' },
];

interface SystemBoardProps {
  system: GeneratedSystem;
  nodes: PositionedNode[];
  edges: SystemEdge[];
  activeEdgeIds: Set<string>;
  lensEmphasis: Set<string>;
  /** Annotation text per node id under the active lens (shown in the caption). */
  lensAnnotations?: Record<string, string>;
  /** Question the active lens answers (shown in the board header). */
  lensQuestion?: string;
  decisionHighlights: Set<string>;
  selectedNodeId: string | null;
  starvedIds: Set<string>;
  simState: 'idle' | 'running' | 'paused' | 'gate' | 'done';
  /** Design-time request trace (derived from the simulation's main line). */
  traceHops?: TraceHop[];
  /** Active hop index — enables trace emphasis; null shows the full system. */
  traceStep?: number | null;
  onSelectNode: (id: string | null) => void;
  onRemoveNode: (id: string) => void;
}

export const SystemBoard: React.FC<SystemBoardProps> = ({
  system,
  nodes,
  edges,
  activeEdgeIds,
  lensEmphasis,
  lensAnnotations,
  lensQuestion,
  decisionHighlights,
  selectedNodeId,
  starvedIds,
  simState,
  traceHops,
  traceStep,
  onSelectNode,
  onRemoveNode,
}) => {
  void onRemoveNode;
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();
  const isMobile =
    typeof window !== 'undefined' && window.matchMedia
      ? !window.matchMedia('(min-width: 640px)').matches
      : false;
  const [tab, setTab] = useState<BoardTab>('flow');

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

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

  /* Present (both endpoints on canvas), used by the edge layer + product tab. */
  const presentEdges = useMemo(
    () => edges.filter((e) => nodes.some((n) => n.id === e.from) && nodes.some((n) => n.id === e.to)),
    [edges, nodes],
  );

  const starvedCount = useMemo(
    () => stages.filter((n) => starvedIds.has(n.id) || n.starved).length,
    [stages, starvedIds],
  );

  /* Build-order number per node id (the badge on each node). */
  const stageIndex = useMemo(() => new Map(stages.map((s, i) => [s.id, i])), [stages]);

  /* Caption focus: selected, else first live stage, else the intake. */
  const focus = useMemo(() => {
    const sel = stages.find((s) => s.id === selectedNodeId);
    if (sel) return sel;
    const liveOne = stages.find((s) => activeNodeIds.has(s.id));
    return liveOne ?? stages[0] ?? null;
  }, [stages, selectedNodeId, activeNodeIds]);

  /* Lanes group the present nodes by design layer; empty lanes collapse. */
  const lanes = useMemo(() => {
    const groups = new Map<DesignLane, PositionedNode[]>();
    for (const l of LANES) groups.set(l.id, []);
    for (const nd of nodes) groups.get(LANE_OF[nd.kind])?.push(nd);
    return LANES.map((l) => ({ ...l, items: groups.get(l.id) ?? [] })).filter((l) => l.items.length > 0);
  }, [nodes]);

  /* Lane positions in the 100x100 stage space: left gutter holds the
     lane labels, the bottom strip holds the focus caption. */
  const lanePos = useMemo(() => {
    const GUTTER = 15;
    const TOP = 15;
    const BOTTOM = 9;
    const usable = 100 - TOP - BOTTOM;
    const h = lanes.length > 0 ? usable / lanes.length : usable;
    const m = new Map<string, { x: number; y: number; lane: DesignLane }>();
    lanes.forEach((l, li) => {
      const y = TOP + h * (li + 0.5);
      l.items.forEach((nd, i) => {
        const x = l.items.length === 1 ? (GUTTER + 100) / 2 : GUTTER + ((100 - GUTTER - 4) * i) / (l.items.length - 1);
        m.set(nd.id, { x, y, lane: l.id });
      });
    });
    return m;
  }, [lanes]);

  const laneCenterY = useMemo(() => {
    const m = new Map<DesignLane, number>();
    for (const l of lanes) {
      const p = l.items.length > 0 ? lanePos.get(l.items[0].id) : undefined;
      if (p) m.set(l.id, p.y);
    }
    return m;
  }, [lanes, lanePos]);

  /* Edge geometry in the 100x100 stage space. */
  const edgeGeom = useMemo(
    () =>
      presentEdges
        .map((e) => {
          const f = lanePos.get(e.from);
          const t = lanePos.get(e.to);
          if (!f || !t) return null;
          const mx = (f.x + t.x) / 2;
          const my = (f.y + t.y) / 2;
          const active = activeEdgeIds.has(e.id);
          return { e, f, t, mx, my, active };
        })
        .filter((g): g is NonNullable<typeof g> => g !== null),
    [presentEdges, lanePos, activeEdgeIds],
  );

  /* Trace emphasis — derived from the design-time request trace. Only
     on while a hop is stepped; otherwise the full system stays visible. */
  const tracing = traceStep != null && (traceHops?.length ?? 0) > 0;
  const traceNodeIds = useMemo(() => new Set((traceHops ?? []).map((hh) => hh.nodeId)), [traceHops]);
  const traceStepNodeId = tracing && traceHops ? traceHops[traceStep ?? 0]?.nodeId ?? null : null;
  const traceEdgeOrder = useMemo(() => {
    const order = new Map<string, number>();
    if (!traceHops) return order;
    for (let i = 1; i < traceHops.length; i++) {
      const from = traceHops[i - 1].nodeId;
      const to = traceHops[i].nodeId;
      if (from === to) continue;
      const e = presentEdges.find((x) => x.from === from && x.to === to);
      if (e && !order.has(e.id)) order.set(e.id, i);
    }
    return order;
  }, [traceHops, presentEdges]);

  const running = simState === 'running' || simState === 'gate';
  const similar = system.projectEvidence[0];

  const status = starvedCount > 0
    ? { label: `▲ ${starvedCount} STARVED`, color: '#FBBF24' }
    : simState === 'done'
    ? { label: '■ COMPLETE', color: '#34D399' }
    : running
    ? { label: `● LIVE · ${activeNodeIds.size}/${stages.length}`, color: '#60A5FA' }
    : { label: `${stages.length} STAGES`, color: isDark ? '#7C8DB0' : '#64748B' };

  return (
    <div>
      {/* Slim header */}
      <div className="flex items-center gap-3">
        <span
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', boxShadow: '0 8px 22px -8px rgba(59,130,246,0.7)', borderRadius: 10 }}
        >
          <Sparkles size={17} color="#fff" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-[15px] sm:text-[18px]" style={{ fontWeight: 800, letterSpacing: '-0.02em', color: isDark ? '#F8FAFC' : '#0B1220' }}>
            {system.title}
          </h3>
          <div className="font-mono text-[9.5px] sm:text-[11px]" style={{ fontWeight: 700, letterSpacing: '0.06em', color: status.color }}>
            {status.label}
          </div>
        </div>
        <a
          href={similar?.url ?? '#work'}
          target={similar?.url ? '_blank' : undefined}
          rel="noreferrer"
          aria-label="See similar project"
          className="shrink-0 flex items-center justify-center rounded-full border transition w-[30px] h-[30px] sm:w-9 sm:h-9"
          style={{ borderColor: isDark ? '#2E3E5B' : '#D8E0EC', color: isDark ? '#B6C2D6' : '#3D4A61', background: 'transparent' }}
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Compact tabs */}
      <div className="flex items-center gap-1 rounded-full border overflow-x-auto scrollbar-none" style={{ marginTop: 10, padding: 3, borderColor: isDark ? '#2E3E5B' : '#D8E0EC', background: isDark ? 'rgba(2,6,16,0.5)' : 'rgba(248,250,252,0.8)' }} role="tablist" aria-label="System detail">
        {TABS.map((t) => {
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.id)}
              className="rounded-full transition-all shrink-0 px-[11px] py-1.5 sm:px-[15px] sm:py-[7px]"
              style={{
                fontSize: 12.5, fontWeight: 700,
                color: on ? '#fff' : isDark ? '#8EA0B8' : '#5B6B85',
                background: on ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)' : 'transparent',
                border: 'none', cursor: 'pointer',
                boxShadow: on ? '0 4px 14px -4px rgba(59,130,246,0.7)' : 'none',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Lens reveal — the active perspective, stated once */}
      {tab === 'flow' && lensQuestion && (
        <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
          <span className="font-mono rounded-full shrink-0" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '3px 9px', color: isDark ? '#93C5FD' : '#1D4ED8', background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)', border: '1px solid color-mix(in srgb, #3B82F6 35%, transparent)' }}>
            LENS
          </span>
          <span className="truncate" style={{ fontSize: 12, color: isDark ? '#8EA0B8' : '#5B6B85' }}>{lensQuestion}</span>
        </div>
      )}

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${system.id}-${tab}`}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: 10 }}
        >
          {tab === 'flow' && (
            <div>
            <div
              className="relative select-none h-[320px] sm:h-[380px]"
              style={{ touchAction: 'pan-y' }}
            >
              {/* Lane labels — the architecture's reading order */}
              {lanes.map((l) => (
                <span
                  key={l.id}
                  className="absolute font-mono"
                  style={{
                    left: 0, top: `${laneCenterY.get(l.id) ?? 50}%`, transform: 'translateY(-50%)',
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
                    color: isDark ? '#7C8DB0' : '#64748B',
                  }}
                  aria-hidden
                >
                  {l.label.toUpperCase()}
                </span>
              ))}

              {/* Edge layer — real dependencies made visible */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none"
                aria-hidden
              >
                {/* Lane dividers */}
                {lanes.slice(1).map((l) => {
                  const y = (laneCenterY.get(l.id) ?? 0) - ((100 - 15 - 9) / Math.max(lanes.length, 1)) / 2;
                  return (
                    <line key={l.id} x1={14} y1={y} x2={100} y2={y} stroke={isDark ? '#1B2740' : '#E2E8F0'} strokeWidth={0.4} vectorEffect="non-scaling-stroke" strokeDasharray="1.5 1.5" />
                  );
                })}
                {edgeGeom.map(({ e, f, t, mx, my, active }) => {
                  const c = isDark ? FLOW_COLOR[e.flow].dark : FLOW_COLOR[e.flow].light;
                  const traceHop = traceEdgeOrder.get(e.id);
                  const onTrace = traceHop !== undefined;
                  const lensDim = lensEmphasis.size > 0 && !lensEmphasis.has(e.from) && !lensEmphasis.has(e.to);
                  const dimmed = tracing ? !onTrace && !active : lensDim;
                  const stroke = onTrace ? '#3B82F6' : c;
                  return (
                    <g key={e.id} opacity={active ? 1 : dimmed ? 0.15 : 0.5}>
                      <line
                        x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                        stroke={stroke}
                        strokeWidth={active || onTrace ? (isMobile ? 1.4 : 1.8) : isMobile ? 0.9 : 1.1}
                        strokeDasharray={active ? '5 6' : undefined}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                      />
                      {active && (
                        <text x={mx} y={my - 1.6} textAnchor="middle" fontSize={2.8} fontWeight={700} fill={c} letterSpacing="0.15" opacity={running ? 0.85 : 0.5}>
                          {e.flow.toUpperCase()}
                        </text>
                      )}
                      {onTrace && (
                        <g>
                          <circle cx={mx} cy={my} r={2.1} fill="#3B82F6" stroke={isDark ? '#0A0F1B' : '#fff'} strokeWidth={0.5} />
                          <text x={mx} y={my + 1.1} textAnchor="middle" fontSize={2.6} fontWeight={800} fill="#fff">
                            {traceHop}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes — one per design lane, labels always visible */}
              <div className="absolute inset-0">
                {lanes.flatMap((l) => l.items).map((nitem) => {
                  const p = lanePos.get(nitem.id);
                  if (!p) return null;
                  const i = stageIndex.get(nitem.id) ?? 0;
                  const toneBase = TONE_BASE[nitem.tone] ?? '#64748b';
                  const kindColor = isDark ? KIND_TEXT[nitem.kind].dark : KIND_TEXT[nitem.kind].light;
                  const Icon = KIND_ICON[nitem.kind];
                  const isActive = activeNodeIds.has(nitem.id);
                  const isSelected = selectedNodeId === nitem.id;
                  const isStepped = traceStepNodeId === nitem.id;
                  const isStarved = starvedIds.has(nitem.id) || nitem.starved;
                  const isDecision = decisionHighlights.has(nitem.id);
                  const dimmed = tracing ? !traceNodeIds.has(nitem.id) : lensEmphasis.size > 0 && !lensEmphasis.has(nitem.id);
                  const ring = isStarved ? '#F59E0B' : isStepped ? '#3B82F6' : isSelected || isDecision ? toneBase : isDark ? '#2E3E5B' : '#CBD5E1';
                  const glow = isActive || isSelected || isStepped;
                  return (
                    <button
                      key={nitem.id}
                      onClick={() => onSelectNode(isSelected ? null : nitem.id)}
                      aria-label={`${i + 1}. ${nitem.label} — ${nitem.role}`}
                      className="absolute flex flex-col items-center"
                      style={{
                        left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        opacity: dimmed ? 0.3 : 1, zIndex: glow ? 5 : 1,
                      }}
                    >
                      <span
                        className={`relative flex items-center justify-center rounded-full ${
                          glow ? 'w-[26px] h-[26px] sm:w-[46px] sm:h-[46px]' : 'w-[22px] h-[22px] sm:w-10 sm:h-10'
                        }`}
                        style={{
                          background: isDark ? 'rgba(16,26,44,0.95)' : '#fff',
                          border: `${isMobile ? 1.5 : 2}px solid ${ring}`,
                          boxShadow: glow
                            ? `0 0 0 2px color-mix(in srgb, ${isStepped ? '#3B82F6' : toneBase} 45%, transparent), 0 0 18px ${isStepped ? '#3B82F6' : toneBase}`
                            : isDark ? '0 8px 20px -8px rgba(0,0,0,0.8)' : '0 8px 18px -10px rgba(15,23,42,0.35)',
                          transition: 'width 0.25s, height 0.25s, box-shadow 0.25s',
                        }}
                      >
                        <Icon size={14} color={isStarved ? '#FBBF24' : kindColor} />
                        <span
                          className="absolute font-mono flex items-center justify-center rounded-full w-[11px] h-[11px] sm:w-[18px] sm:h-[18px] text-[6px] sm:text-[9.5px]"
                          style={{
                            top: -5, right: -5,
                            fontWeight: 800,
                            background: isActive ? toneBase : isStepped ? '#3B82F6' : isDark ? '#1B2740' : '#E2E8F0',
                            color: isActive || isStepped ? '#fff' : isDark ? '#8EA0B8' : '#5B6B85',
                            border: `1px solid ${isDark ? '#0A0F1B' : '#fff'}`,
                          }}
                        >
                          {i + 1}
                        </span>
                      </span>
                      {/* Labels always visible — lanes keep them apart */}
                      <span
                        className="font-mono text-center rounded-full text-[7.5px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 mt-0.5 max-w-[76px] sm:max-w-[128px] whitespace-nowrap overflow-hidden"
                        style={{
                          textOverflow: 'ellipsis',
                          fontWeight: 700,
                          color: isDark ? '#F1F5F9' : '#0B1220',
                          background: isDark ? 'rgba(10,15,27,0.92)' : 'rgba(255,255,255,0.95)',
                          border: `1px solid ${glow ? ring : isDark ? '#223148' : '#E2E8F0'}`,
                        }}
                      >
                        {nitem.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

              {/* Focus caption + status — in-flow below the canvas, never overlapping */}
              <div className="flex items-center gap-2 font-mono text-[10.5px] sm:text-[11.5px]" style={{ marginTop: 8 }}>
                {focus && (
                  <>
                    <span
                      className="shrink-0 rounded-full"
                      style={{ padding: '2px 8px', fontWeight: 800, color: isDark ? '#F1F5F9' : '#0B1220', background: isDark ? 'rgba(59,130,246,0.16)' : 'rgba(37,99,235,0.1)', border: '1px solid color-mix(in srgb, #3B82F6 40%, transparent)' }}
                    >
                      {stages.indexOf(focus) + 1} · {focus.label}
                    </span>
                    <span className="flex-1 min-w-0 truncate" style={{ color: isDark ? '#8EA0B8' : '#5B6B85' }}>
                      {lensAnnotations?.[focus.id] ?? focus.role}
                    </span>
                  </>
                )}
                <span className="shrink-0 text-[10px] sm:text-[11.5px]" style={{ color: starvedCount > 0 ? '#FBBF24' : simState === 'done' ? '#34D399' : running ? '#60A5FA' : isDark ? '#7C8DB0' : '#68778F' }}>
                  {starvedCount > 0 ? `▲ ${starvedCount}` : simState === 'done' ? '■ ready' : running ? '● live' : '○ idle'}
                </span>
              </div>
            </div>
          )}

          {tab === 'product' && (
            <div style={{ minHeight: 300 }}>
              <p className="line-clamp-2" style={{ fontSize: 14, lineHeight: 1.6, color: isDark ? '#E2E8F0' : '#0F172A' }}>
                {system.problem}
              </p>
              <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
                {system.actors.map((a) => (
                  <span key={a} className="rounded-full font-semibold" style={{ fontSize: 11.5, padding: '4px 11px', background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(37,99,235,0.08)', color: isDark ? '#93C5FD' : '#1D4ED8', border: '1px solid color-mix(in srgb, #3B82F6 30%, transparent)' }}>
                    {a}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2" style={{ marginTop: 12 }}>
                {[
                  { k: 'Stages', v: stages.length },
                  { k: 'Links', v: presentEdges.length },
                  { k: 'Decisions', v: system.decisions.length },
                  { k: 'Add-ons', v: system.addOns.length },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl border text-center px-1 py-1.5 sm:px-1.5 sm:py-2.5" style={{ borderColor: isDark ? '#2E3E5B' : '#D8E0EC', background: isDark ? 'rgba(2,6,16,0.4)' : '#F6F8FB' }}>
                    <div className="font-mono text-base sm:text-[20px]" style={{ fontWeight: 700, color: isDark ? '#F8FAFC' : '#0B1220', fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                    <div className="font-mono uppercase text-[8px] sm:text-[9px]" style={{ letterSpacing: '0.06em', color: isDark ? '#7C8DB0' : '#68778F' }}>{s.k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'architecture' && (
            <div className="space-y-2.5" style={{ minHeight: 300 }}>
              {(Object.keys(KIND_LABEL) as SystemNodeKind[]).map((k) => {
                const list = nodes.filter((nn) => nn.kind === k);
                if (list.length === 0) return null;
                const Icon = KIND_ICON[k];
                const c = isDark ? KIND_TEXT[k].dark : KIND_TEXT[k].light;
                const pct = Math.round((list.length / Math.max(nodes.length, 1)) * 100);
                return (
                  <div key={k}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                      <Icon size={13} color={c} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#E2E8F0' : '#0F172A' }}>{KIND_LABEL[k]}</span>
                      <span style={{ flex: 1 }} />
                      <span className="font-mono" style={{ fontSize: 11, color: c }}>×{list.length} · {pct}%</span>
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
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'evidence' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-none" style={{ minHeight: 300, paddingBottom: 4 }}>
              {system.projectEvidence.map((ev) => (
                <a
                  key={ev.projectId}
                  href={ev.url ?? '#work'}
                  target={ev.url ? '_blank' : undefined}
                  rel="noreferrer"
                  className="shrink-0 rounded-2xl border"
                  style={{ width: 228, padding: '13px 14px', background: isDark ? 'rgba(21,31,51,0.72)' : '#fff', borderColor: isDark ? '#2E3E5B' : '#D8E0EC', textDecoration: 'none' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate" style={{ fontSize: 13.5, fontWeight: 800, color: isDark ? '#F1F5F9' : '#0B1220' }}>{ev.name}</span>
                    <span className="font-mono rounded-full shrink-0" style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.06em', padding: '3px 8px', background: ev.tag === 'BUILT' || ev.tag === 'ACTIVE' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: ev.tag === 'BUILT' || ev.tag === 'ACTIVE' ? '#34D399' : '#FBBF24' }}>
                      {ev.tag}
                    </span>
                  </div>
                  <p className="line-clamp-3" style={{ fontSize: 12, lineHeight: 1.55, color: isDark ? '#AEBBCE' : '#3D4A61', marginTop: 6 }}>{ev.relevance}</p>
                  <span className="font-mono inline-flex items-center gap-1" style={{ fontSize: 10.5, fontWeight: 700, color: isDark ? '#60A5FA' : '#2563EB', marginTop: 8 }}>
                    Open <ExternalLink size={11} />
                  </span>
                </a>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
