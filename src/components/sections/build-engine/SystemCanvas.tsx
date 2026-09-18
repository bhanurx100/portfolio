/**
 * Builder Lab — System Canvas
 *
 * The viewport is the interaction surface: a responsive SVG system graph that
 * forms node-by-node, reacts to lenses, highlights simulation traffic, shows
 * starvation after removals, and pulses on decision highlights. DOM/SVG is a
 * deliberate choice over WebGL: crisp text, cheap on mobile, accessible by
 * default, and every node is a real focusable element.
 */

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Boxes,
  Cpu,
  Database,
  Plug,
  User,
  LayoutDashboard,
  PauseCircle,
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { CANVAS_DIMS, type CanvasVariant } from '../../../data/build-engine/engine';
import type { DerivedEdge, PositionedNode, SystemNodeKind } from '../../../data/build-engine/types';

/* ------------------------------------------------------------------ */
/* Kind visuals                                                        */
/* ------------------------------------------------------------------ */

const KIND_ICON: Record<SystemNodeKind, React.ComponentType<{ className?: string }>> = {
  actor: User,
  interface: LayoutDashboard,
  automation: Cpu,
  data: Database,
  integration: Plug,
};

const TONE = {
  blue: { base: '#3b82f6', soft: 'rgba(59,130,246,0.14)', text: '#60a5fa' },
  emerald: { base: '#10b981', soft: 'rgba(16,185,129,0.14)', text: '#34d399' },
  amber: { base: '#f59e0b', soft: 'rgba(245,158,11,0.14)', text: '#fbbf24' },
  rose: { base: '#f43f5e', soft: 'rgba(244,63,94,0.14)', text: '#fb7185' },
  violet: { base: '#8b5cf6', soft: 'rgba(139,92,246,0.14)', text: '#a78bfa' },
  slate: { base: '#64748b', soft: 'rgba(100,116,139,0.14)', text: '#94a3b8' },
} as const;

/* Light-mode text ramp — the neon brights above wash out on white, so labels
   and icons step down to the same slate-anchored depth GitHub/Contact use. */
const TONE_TEXT_LIGHT: Record<keyof typeof TONE, string> = {
  blue: '#2563eb',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  violet: '#7c3aed',
  slate: '#64748b',
};

const FLOW_DASH: Record<string, string> = {
  signal: '0',
  data: '0',
  action: '0',
  approval: '7 4',
  escalation: '4 4',
};

interface SystemCanvasProps {
  nodes: PositionedNode[];
  edges: DerivedEdge[];
  activeEdgeIds: Set<string>;
  lensEmphasis: Set<string>;
  lensAnnotations: Record<string, string>;
  decisionHighlights: Set<string>;
  selectedNodeId: string | null;
  starvedIds: Set<string>;
  simState: 'idle' | 'running' | 'paused' | 'gate' | 'done';
  variant: CanvasVariant;
  onVariantChange: (v: CanvasVariant) => void;
  onSelectNode: (id: string | null) => void;
}

const SystemCanvasComponent: React.FC<SystemCanvasProps> = ({
  nodes,
  edges,
  activeEdgeIds,
  lensEmphasis,
  lensAnnotations,
  decisionHighlights,
  selectedNodeId,
  starvedIds,
  simState,
  variant,
  onVariantChange,
  onSelectNode,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reduceMotion = useReducedMotion();

  /* Responsive variant: ResizeObserver on the container, not UA strings.
     The variant lives in the machine so layout & viewBox share one source. */
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      onVariantChange(w < 640 ? 'portrait' : 'landscape');
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [onVariantChange]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const dims = CANVAS_DIMS[variant];

  /* Secondary text follows the GitHub/Contact slate ramp: slate-400 on dark,
     slate-500 on light. (This was inverted before — dark text in dark mode.) */
  const mutedText = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(148,163,184,0.05)' : 'rgba(100,116,139,0.07)';

  return (
    <div ref={wrapRef} className="relative w-full min-h-[380px]">
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="w-full"
        style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
        role="img"
        aria-label="Generated system graph"
        onClick={() => onSelectNode(null)}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke={isDark ? '#64748b' : '#94a3b8'} strokeWidth="1.6" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9" fill="none" stroke="#3b82f6" strokeWidth="1.8" />
          </marker>
          <radialGradient id="labvig" cx="50%" cy="42%" r="75%">
            <stop offset="55%" stopColor={isDark ? '#000000' : '#0f172a'} stopOpacity="0" />
            <stop offset="100%" stopColor={isDark ? '#000000' : '#0f172a'} stopOpacity={isDark ? 0.32 : 0.07} />
          </radialGradient>
        </defs>

        {/* Ambient grid — quiet technical texture */}
        <pattern id="labgrid" width="42" height="42" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill={gridColor} />
        </pattern>
        <rect width={dims.w} height={dims.h} fill="url(#labgrid)" />

        {/* Edges */}
        <g>
          {edges.filter((e) => e.visible).map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const isActive = activeEdgeIds.has(edge.id);
            const dimmed =
              lensEmphasis.size > 0 &&
              !lensEmphasis.has(edge.from) &&
              !lensEmphasis.has(edge.to);
            const stroke = isActive ? '#3b82f6' : dimmed ? mutedText : isDark ? '#475569' : '#94a3b8';
            const dash = FLOW_DASH[edge.flow] ?? '0';

            // Curve control point
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2 - 34;
            const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;

            return (
              <g key={edge.id}>
                <motion.path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isActive ? 2 : 1.4}
                  strokeDasharray={isActive ? '7 5' : dash}
                  markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: dimmed ? 0.35 : 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
                >
                  {isActive && !reduceMotion && (
                    <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" repeatCount="indefinite" />
                  )}
                </motion.path>
                {edge.label && !dimmed && (
                  <text
                    x={mx}
                    y={my - 6}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill={isActive ? (isDark ? '#60a5fa' : '#2563eb') : mutedText}
                    className="font-mono"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {nodes.map((node) => {
            const Icon = KIND_ICON[node.kind];
            const tone = TONE[node.tone];
            const toneText = isDark ? tone.text : TONE_TEXT_LIGHT[node.tone];
            const isSelected = selectedNodeId === node.id;
            const isStarved = starvedIds.has(node.id);
            const lensDimmed = lensEmphasis.size > 0 && !lensEmphasis.has(node.id);
            const isDecisionHighlight = decisionHighlights.has(node.id);
            const opacity = lensDimmed ? 0.3 : isStarved ? 0.45 : 1;

            return (
              <motion.g
                key={node.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{ originX: `${node.x}px`, originY: `${node.y}px`, filter: isSelected ? 'drop-shadow(0 0 16px var(--accent))' : undefined }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`${node.label} — ${node.role}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectNode(node.id);
                  }
                }}
              >
                {/* Decision highlight ring */}
                {isDecisionHighlight && (
                  <circle cx={node.x} cy={node.y} r="42" fill="none" stroke={tone.base} strokeWidth="1.6" strokeDasharray="4 4" className="lab-spin" />
                )}

                {/* Sim pulse ring */}
                {simState === 'running' && activeEdgeIds.size > 0 && (
                  <circle cx={node.x} cy={node.y} r="38" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5" className="lab-pulse-ring" />
                )}

                {/* Node card */}
                <g transform={`translate(${node.x - 62}, ${node.y - 34})`}>
                  <rect
                    width="124"
                    height="68"
                    rx="12"
                    fill={isDark ? 'rgba(21,31,51,0.92)' : 'rgba(255,255,255,0.95)'}
                    stroke={isSelected ? tone.base : isDecisionHighlight ? tone.base : isDark ? '#2E3E5B' : '#CBD5E1'}
                    strokeWidth={isSelected || isDecisionHighlight ? 1.8 : 1.2}
                  />
                  <rect x="0" y="0" width="124" height="4" rx="2" fill={tone.base} opacity={isStarved ? 0.3 : 0.85} />

                  <g transform="translate(10, 12)">
                    <Icon className="w-4 h-4" style={{ color: isStarved ? mutedText : toneText }} />
                  </g>
                  <text x="34" y="24" fontSize="12.5" fontWeight="600" fill={isDark ? '#F1F5F9' : '#0F172A'}>
                    {node.label.length > 14 ? `${node.label.slice(0, 13)}…` : node.label}
                  </text>
                  <text x="10" y="45" fontSize="9.5" fill={mutedText} className="font-mono">
                    {node.kind}
                  </text>
                  {isStarved && (
                    <text x="10" y="58" fontSize="9" fill="#f59e0b" className="font-mono">
                      ⚠ starved of input
                    </text>
                  )}
                </g>

                {/* Lens annotation */}
                {lensAnnotations[node.id] && !lensDimmed && (
                  <text x={node.x} y={node.y + 52} textAnchor="middle" fontSize="10" fill={toneText} className="font-mono">
                    {lensAnnotations[node.id].length > 30 ? `${lensAnnotations[node.id].slice(0, 29)}…` : lensAnnotations[node.id]}
                  </text>
                )}
              </motion.g>
            );
          })}
        </g>
        {/* Vignette — depth without a 3D library */}
        <rect width={dims.w} height={dims.h} fill="url(#labvig)" pointerEvents="none" />
      </svg>

      {/* Sim state chip (top-right of canvas) */}
      {simState !== 'idle' && (
        <div
          className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono border ${
            isDark ? 'bg-slate-900/85 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-600'
          }`}
        >
          {simState === 'paused' || simState === 'gate' ? <PauseCircle className="w-3 h-3 text-amber-400" /> : <Boxes className="w-3 h-3 text-blue-400" />}
          {simState === 'running' && 'running'}
          {simState === 'paused' && 'paused'}
          {simState === 'gate' && 'awaiting decision'}
          {simState === 'done' && 'complete'}
        </div>
      )}
    </div>
  );
};

export const SystemCanvas = memo(SystemCanvasComponent);
