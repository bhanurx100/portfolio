/**
 * Case Study — narrative single-scroll.
 *
 * Structure follows how an engineer tells a product story: Project → Why it
 * exists → The interesting problem → How the system works (interactive layers)
 * → Key decisions & tradeoffs → What I built → Evidence. No tabs, no metric
 * grids, no dashboard. Device preview appears once, as the product itself.
 */

import React, { useEffect, useState } from 'react';
import { X, Github, Mail, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { ProjectData } from '../../types';
import { personalInfo } from '../../data/portfolio-data';
import { DeviceFrame } from './DeviceFrame';
import { StayEaseScreen } from './AppScreens';
import { SplitFinScreen } from './SplitFinScreen';
import { useTheme } from '../../context/ThemeContext';

interface CaseStudyModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
  onSwitchProject?: (slug: string) => void;
}

/* ------------------------------------------------------------------ */
/* Project-specific architecture layers (real, verified stacks)        */
/* ------------------------------------------------------------------ */

interface ArchLayer {
  id: string;
  name: string;
  purpose: string;
  dataIn: string;
  dataOut: string;
  tech: string;
  tradeoff: string;
}

const ARCHITECTURE: Record<string, ArchLayer[]> = {
  splitfin: [
    {
      id: 'ui', name: 'Client (Expo SDK 52)', purpose: 'Dashboard, transactions, categories, SplitPay settlement',
      dataIn: 'User intent', dataOut: 'Typed queries', tech: 'Expo SDK 52 · React Native · TypeScript', tradeoff: 'A native app is a product bet, not a responsive afterthought — one RN codebase for iOS and Android',
    },
    {
      id: 'offline', name: 'Local store (offline-first)', purpose: 'Ledger, drafts and splits work with no connection; sync reconciles later',
      dataIn: 'Local writes', dataOut: 'Idempotent ops', tech: 'MMKV · SQLite', tradeoff: 'Offline-first adds reconciliation rules; the payoff is a ledger that never blocks on the network',
    },
    {
      id: 'realtime', name: 'Realtime layer (Supabase)', purpose: 'Live group presence, settlement pushes, multi-device sync',
      dataIn: 'Subscription', dataOut: 'Live events', tech: 'Supabase WebSockets', tradeoff: 'Realtime is additive to the offline queue, so presence updates never fight pending local edits',
    },
    {
      id: 'logic', name: 'Ledger service', purpose: 'Split rules, category intelligence, who-owes-whom',
      dataIn: 'Validated ops', dataOut: 'Ledger updates', tech: 'Typed TypeScript service', tradeoff: 'Settlement UI is decoupled from the debt-simplification math so the solver can evolve without UI churn',
    },
    {
      id: 'db', name: 'Database', purpose: 'Groups, members, transactions, settlement states',
      dataIn: 'SQL writes', dataOut: 'Durable records', tech: 'PostgreSQL · PostGIS', tradeoff: 'Typed schemas shift errors to compile time at the cost of migrations',
    },
  ],
  stayease: [
    {
      id: 'ui', name: 'Client (Expo SDK 52)', purpose: 'Search, map, property detail, booking, role surfaces',
      dataIn: 'User intent', dataOut: 'API calls', tech: 'Expo SDK 52 · React Native · TypeScript', tradeoff: 'Native map + list surfaces need careful image and gesture performance work',
    },
    {
      id: 'offline', name: 'Local stays (offline-first)', purpose: 'Saved stays, search history and draft bookings with no connectivity',
      dataIn: 'Local writes', dataOut: 'Sync queue', tech: 'MMKV · SQLite', tradeoff: 'Offline drafts must reconcile against live availability before confirmation',
    },
    {
      id: 'map', name: 'Realtime map (Supabase)', purpose: 'Stay inventory rendered live from PostGIS; live availability',
      dataIn: 'Map viewport', dataOut: 'Live stays', tech: 'Supabase realtime · PostGIS', tradeoff: 'Streaming the map viewport is cheap; reconciling against bookings is the careful part',
    },
    {
      id: 'api', name: 'Edge services', purpose: 'Booking orchestration, checkout session, owner/admin flows',
      dataIn: 'App calls', dataOut: 'Validated events', tech: 'Supabase Edge Functions', tradeoff: 'Small functions keep trust boundaries explicit but need disciplined test coverage',
    },
    {
      id: 'db', name: 'Database', purpose: 'Stays, users, bookings, availability, reviews',
      dataIn: 'Service writes', dataOut: 'Durable records', tech: 'PostgreSQL · PostGIS', tradeoff: 'PostGIS powers map queries; availability checks keep them consistent with bookings',
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, isOpen, onClose, onSwitchProject }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [layer, setLayer] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLayer(null);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKey);
      };
    }
  }, [isOpen, onClose]);

  if (!project) return null;

  const arch = ARCHITECTURE[project.id] ?? [];
  const isSplitFin = project.id === 'splitfin';
  const accent = isSplitFin ? 'var(--ok)' : 'var(--accent)';
  const accentSoft = `color-mix(in srgb, ${accent} 10%, transparent)`;

  const chapter = (n: string, title: string) => (
    <div className="flex items-baseline gap-3">
      <span className="tech-label" style={{ color: accent }}>{n}</span>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>{title}</h3>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: 'rgba(2, 6, 16, 0.72)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full sm:max-w-3xl sm:rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: isDark ? 'var(--surface-1)' : '#fff',
              border: `1px solid var(--line${isDark ? '-dark' : ''})`,
              maxHeight: '100vh',
              boxShadow: isDark ? 'var(--shadow-3-dark)' : 'var(--shadow-3)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} case study`}
          >
            {/* Header */}
            <div
              className="shrink-0 flex items-center justify-between px-5 sm:px-7"
              style={{ height: 60, borderBottom: `1px solid var(--line${isDark ? '-dark' : ''})` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="tech-label" style={{ color: accent }}>Case study</span>
                <span className="truncate" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{project.name}</span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close case study"
                className="rounded-lg p-1.5"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Narrative scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-5 sm:px-7 py-6 space-y-9">
              {/* 01 — Why it exists */}
              <section className="space-y-3">
                {chapter('01', 'Why it exists')}
                <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-2)' }}>{project.problem}</p>
              </section>

              {/* 02 — The product + device */}
              <section className="space-y-3">
                {chapter('02', 'The product')}
                <p style={{ fontSize: 15.5, lineHeight: 1.7, color: 'var(--text-2)' }}>{project.description}</p>
                <div className="flex justify-center py-3">
                  <DeviceFrame width={244} ariaLabel={`${project.name} interactive preview`}>
                    {isSplitFin ? <SplitFinScreen /> : <StayEaseScreen />}
                  </DeviceFrame>
                </div>
                <p className="text-center tech-label" style={{ textTransform: 'none', letterSpacing: 0 }}>
                  Interactive concept preview of the native app — code access available on request
                </p>
              </section>

              {/* 03 — How the system works */}
              <section className="space-y-4">
                {chapter('03', 'How the system works')}
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-3)' }}>
                  Each layer is real. Select one to see its purpose, data flow and the tradeoff it carries.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {arch.map((l, i) => {
                    const open = layer === l.id;
                    return (
                      <div key={l.id}>
                        <button
                          onClick={() => setLayer(open ? null : l.id)}
                          aria-expanded={open}
                          className="w-full flex items-center justify-between text-left"
                          style={{
                            padding: '13px 4px',
                            borderTop: i === 0 ? `1px solid var(--line${isDark ? '-dark' : ''})` : 'none',
                            borderBottom: `1px solid var(--line${isDark ? '-dark' : ''})`,
                            background: 'transparent',
                            borderLeft: 'none',
                            borderRight: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <span className="flex items-center gap-3">
                            <span className="tech-label" style={{ color: open ? accent : 'var(--text-4)' }}>{String(i + 1).padStart(2, '0')}</span>
                            <span style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-1)' }}>{l.name}</span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="hidden sm:inline" style={{ fontSize: 12.5, color: 'var(--text-3)' }}>{l.tech}</span>
                            <ChevronRight
                              size={16}
                              color="var(--text-3)"
                              style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }}
                            />
                          </span>
                        </button>
                        {open && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div
                              className="grid sm:grid-cols-2 gap-3"
                              style={{
                                background: accentSoft,
                                margin: '0 -14px',
                                padding: '16px 18px',
                              }}
                            >
                              <Detail label="Purpose" value={l.purpose} />
                              <Detail label="Technology" value={l.tech} />
                              <Detail label="Data in" value={l.dataIn} />
                              <Detail label="Data out" value={l.dataOut} />
                              <div className="sm:col-span-2">
                                <Detail label="Tradeoff" value={l.tradeoff} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 04 — Key decisions */}
              {project.keyDecisions.length > 0 && (
                <section className="space-y-3">
                  {chapter('04', 'Key decisions')}
                  <div className="space-y-4">
                    {project.keyDecisions.map((d) => (
                      <div key={d.decision} style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 14 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{d.decision}</div>
                        <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text-2)', marginTop: 3 }}>{d.rationale}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 05 — What I built */}
              <section className="space-y-3">
                {chapter('05', 'What I built')}
                <ul className="space-y-2">
                  {project.capabilities.slice(0, 4).map((c, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="shrink-0 rounded-full" style={{ width: 6, height: 6, marginTop: 8, background: accent }} />
                      <span style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{c}</span>
                    </li>
                  ))}
                </ul>
                {project.challenges.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {project.challenges.map((ch) => (
                      <div key={ch.title} style={{ padding: 14, borderRadius: 14, background: 'var(--surface-2)' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{ch.title}</div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-3)', marginTop: 4 }}>{ch.solution}</div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 06 — Evidence */}
              <section className="space-y-3">
                {chapter('06', 'Evidence')}
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full"
                    style={{
                      fontSize: 12, fontWeight: 800, padding: '5px 12px',
                      color: 'var(--ok)', background: 'color-mix(in srgb, var(--ok) 12%, transparent)',
                    }}
                  >
                    BUILT — full codebase written by me
                  </span>
                  <span style={{ fontSize: 13.5, color: 'var(--text-3)' }}>{project.type}</span>
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl"
                      style={{
                        height: 44, padding: '0 18px', fontSize: 14, fontWeight: 700,
                        background: isDark ? '#F1F5F9' : '#0F172A', color: isDark ? '#0B1120' : '#F8FAFC',
                      }}
                    >
                      <Github size={16} /> View code
                    </a>
                  )}
                  {personalInfo.email && (
                    <a
                      href={personalInfo.emailMailto}
                      className="inline-flex items-center gap-2 rounded-xl"
                      style={{
                        height: 44, padding: '0 18px', fontSize: 14, fontWeight: 600,
                        background: 'transparent', border: `1.5px solid var(--line${isDark ? '-strong-dark' : '-strong'})`, color: 'var(--text-1)',
                      }}
                    >
                      <Mail size={15} /> Contact me
                    </a>
                  )}
                </div>
                {personalInfo.email && (
                  <p className="tech-label" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12.5, paddingTop: 2 }}>
                    Code access available on request — credentials and admin portals gated for teams.
                  </p>
                )}
              </section>
            </div>

            {/* Footer switcher */}
            {onSwitchProject && (
              <div
                className="shrink-0 flex items-center justify-between px-5 sm:px-7"
                style={{ height: 56, borderTop: `1px solid var(--line${isDark ? '-dark' : ''})` }}
              >
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Next case study</span>
                <button
                  onClick={() => onSwitchProject(isSplitFin ? 'stayease' : 'splitfin')}
                  className="inline-flex items-center gap-2 rounded-lg"
                  style={{
                    height: 38, padding: '0 16px', fontSize: 14, fontWeight: 700,
                    background: 'transparent', border: 'none', cursor: 'pointer', color: accent,
                  }}
                >
                  {isSplitFin ? 'StayEase' : 'SplitFin'} <ChevronRight size={15} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="tech-label" style={{ marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)' }}>{value}</div>
  </div>
);
