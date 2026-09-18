/**
 * Builder Lab — Graph Derivation Engine
 *
 * Pure functions: no React, no timers. Takes a GeneratedSystem plus the
 * current manipulation state (removed nodes, applied add-ons, forming
 * progress) and derives exactly what the canvas renders. Keeping this
 * side-effect-free makes the system graph trivially testable and lets the
 * reducer stay tiny.
 *
 * Layout is responsive: wide viewports get the two-row landscape spine;
 * narrow viewports (mobile) get a portrait layout — one major idea per
 * viewport height, no horizontal squeeze.
 */

import type {
  AddOnDefinition,
  DerivedEdge,
  GeneratedSystem,
  PositionedNode,
  RemoveEffect,
  SystemNode,
} from './types';

/* ------------------------------------------------------------------ */
/* Layout — responsive, landscape or portrait                          */
/* ------------------------------------------------------------------ */

const LANDSCAPE_W = 1000;
const LANDSCAPE_H = 620;
const PORTRAIT_W = 640;
const PORTRAIT_H = 920;

/**
 * Lay out the present nodes. `variant` is chosen by the canvas component
 * from its measured width (ResizeObserver), not a UA string.
 */
export function layoutSystem(
  system: GeneratedSystem,
  presentIds: Set<string>,
  variant: 'landscape' | 'portrait' = 'landscape',
): PositionedNode[] {
  const W = variant === 'portrait' ? PORTRAIT_W : LANDSCAPE_W;
  const H = variant === 'portrait' ? PORTRAIT_H : LANDSCAPE_H;

  const anchors = system.nodes.filter((n) => n.anchor);
  const satellites = system.nodes.filter((n) => !n.anchor);

  const problem = anchors.find((n) => n.locked) ?? anchors[0];
  const others = anchors.filter((n) => n.id !== problem.id);

  const positions = new Map<string, { x: number; y: number }>();

  if (variant === 'portrait') {
    /* Portrait: problem core top-center, remaining anchors in a vertical spine. */
    positions.set(problem.id, { x: W / 2, y: 78 });

    const spine = others;
    const top = 210;
    const bottom = H - 90;
    const step = spine.length > 1 ? (bottom - top) / (spine.length - 1) : 0;
    spine.forEach((node, i) => {
      const stagger = i % 2 === 0 ? -W * 0.17 : W * 0.17; // alternating zig-zag for readable edges
      positions.set(node.id, {
        x: W / 2 + stagger,
        y: spine.length > 1 ? top + i * step : (top + bottom) / 2,
      });
    });
  } else {
    /* Landscape: problem core center, anchors on two horizontal rows. */
    positions.set(problem.id, { x: W * 0.5, y: H * 0.5 });

    const rowCapacity = Math.max(2, Math.ceil(others.length / 2));
    others.forEach((node, i) => {
      const row = i < rowCapacity ? 0 : 1;
      const inRow = i < rowCapacity ? i : i - rowCapacity;
      const count = i < rowCapacity ? Math.min(rowCapacity, others.length) : others.length - rowCapacity;
      const step = (W - 130 * 2) / Math.max(1, count - 1 || 1);
      positions.set(node.id, {
        x: count === 1 ? W / 2 : 130 + inRow * step,
        y: row === 0 ? 150 : 470,
      });
    });
  }

  /* Satellites orbit their parent (both variants). */
  const satellitesPerParent = new Map<string, number>();
  for (const sat of satellites) {
    const parentPos = sat.parent ? positions.get(sat.parent) : undefined;
    const idx = satellitesPerParent.get(sat.parent ?? '') ?? 0;
    satellitesPerParent.set(sat.parent ?? '', idx + 1);
    const offsets: [number, number][] = variant === 'portrait'
      ? [[0, -64], [0, 64], [-W * 0.28, 0], [W * 0.28, 0]]
      : [[0, -78], [96, 0], [0, 78], [-96, 0]];
    const [dx, dy] = offsets[idx % offsets.length];
    positions.set(sat.id, parentPos
      ? { x: clampX(parentPos.x + dx, W), y: clampY(parentPos.y + dy, H) }
      : { x: W / 2, y: variant === 'portrait' ? 40 : H * 0.2 });
  }

  return system.nodes
    .filter((n) => presentIds.has(n.id))
    .map((n) => ({
      ...n,
      ...(positions.get(n.id) ?? { x: W / 2, y: H / 2 }),
      appeared: false,
      starved: false,
    }));
}

const clampX = (x: number, w: number) => Math.min(w - 70, Math.max(70, x));
const clampY = (y: number, h: number) => Math.min(h - 46, Math.max(46, y));

/* ------------------------------------------------------------------ */
/* Canvas dimensions (exported for the SVG viewBox)                    */
/* ------------------------------------------------------------------ */

export const CANVAS_DIMS = {
  landscape: { w: LANDSCAPE_W, h: LANDSCAPE_H },
  portrait: { w: PORTRAIT_W, h: PORTRAIT_H },
} as const;

export type CanvasVariant = keyof typeof CANVAS_DIMS;

/* ------------------------------------------------------------------ */
/* Reachability — which nodes are fed by flow                          */
/* ------------------------------------------------------------------ */

/**
 * Nodes reachable from intake via directed edges.
 *
 * A present node is a legitimate flow root only if it has no incoming edges
 * in the FULL graph (e.g. the problem core, or a vendor portal that is itself
 * an entry surface). Nodes that merely lost their upstream to a removal do
 * NOT become roots — they starve. That distinction is what makes removal
 * feel like a real system consequence.
 */
export function reachableFromIntake(
  system: GeneratedSystem,
  edges: { id: string; from: string; to: string }[],
  presentIds: Set<string>,
): Set<string> {
  const adjacency = new Map<string, string[]>();
  const hasIncoming = new Set<string>();
  for (const e of system.edges) {
    hasIncoming.add(e.to);
  }
  for (const e of edges) {
    if (!presentIds.has(e.from) || !presentIds.has(e.to)) continue;
    adjacency.set(e.from, [...(adjacency.get(e.from) ?? []), e.to]);
  }

  const reached = new Set<string>();
  const queue: string[] = [];

  if (presentIds.has(system.intakeId)) {
    reached.add(system.intakeId);
    queue.push(system.intakeId);
  }
  for (const id of presentIds) {
    if (!hasIncoming.has(id) && !reached.has(id)) {
      reached.add(id);
      queue.push(id);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (!reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
    }
  }
  return reached;
}

/* ------------------------------------------------------------------ */
/* Removal — cascade + starvation analysis                             */
/* ------------------------------------------------------------------ */

/**
 * Compute the effect of removing a node.
 *
 * Semantics: satellites (non-anchor nodes) die with their parent — they were
 * orbiting it. Anchor nodes never cascade away; instead they become
 * "starved": still on the canvas, visibly cut off from flow. The problem
 * node and locked nodes can never be removed.
 */
export function computeRemoveEffect(
  system: GeneratedSystem,
  alreadyRemoved: Set<string>,
  targetId: string,
): RemoveEffect | null {
  const target = system.nodes.find((n) => n.id === targetId);
  if (!target || target.locked || alreadyRemoved.has(targetId)) return null;

  const removedNodes = new Set<string>([targetId]);

  // Satellites cascade with their parent (recursively — satellite of a satellite).
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of system.nodes) {
      if (removedNodes.has(node.id) || node.anchor) continue;
      if (node.parent && removedNodes.has(node.parent)) {
        removedNodes.add(node.id);
        changed = true;
      }
    }
  }

  const presentFinal = new Set(
    system.nodes.map((n) => n.id).filter((id) => !alreadyRemoved.has(id) && !removedNodes.has(id)),
  );

  // Anchors cut off from flow are starved, not removed.
  const stillReachable = reachableFromIntake(system, system.edges, presentFinal);
  const starvedNodeIds = [...presentFinal].filter(
    (id) => !stillReachable.has(id) && id !== system.intakeId,
  );

  const removedEdges = system.edges
    .filter((e) => removedNodes.has(e.from) || removedNodes.has(e.to))
    .map((e) => e.id);

  return {
    message: starvedNodeIds.length > 0
      ? `${target.label} removed — ${starvedNodeIds.length} downstream node${starvedIds_length_placeholder(starvedNodeIds)} starved of input.`
      : `${target.label} removed. Workflows re-routed around it.`,
    removedNodes: [...removedNodes],
    removedEdges,
    starvedNodeIds,
  };
}

const starvedIds_length_placeholder = (ids: string[]) => (ids.length > 1 ? 's' : '');

/* ------------------------------------------------------------------ */
/* Add-ons — data-driven graph extension                               */
/* ------------------------------------------------------------------ */

export function getAddOn(system: GeneratedSystem, addOnId: string): AddOnDefinition | undefined {
  return system.addOns.find((a) => a.id === addOnId);
}

/** Merge an add-on's node + edges (including rewires) into graph copies. */
export function applyAddOnToGraph(
  system: GeneratedSystem,
  nodes: SystemNode[],
  edges: GeneratedSystem['edges'],
  addOn: AddOnDefinition,
): { nodes: SystemNode[]; edges: GeneratedSystem['edges'] } {
  const removeIds = new Set(addOn.rewireRemoveEdgeIds ?? []);
  const nextEdges = [
    ...edges.filter((e) => !removeIds.has(e.id)),
    ...addOn.edges,
    ...(addOn.rewireAddEdges ?? []),
  ];
  const nextNodes = nodes.some((n) => n.id === addOn.node.id) ? nodes : [...nodes, addOn.node];
  return { nodes: nextNodes, edges: nextEdges };
}
