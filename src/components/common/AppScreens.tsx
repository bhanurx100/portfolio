/**
 * App Screens — StayEase & SplitFin, authored at true phone scale.
 *
 * Screen width is 363pt (inside DeviceFrame). Body text 15–16px, controls are
 * 44pt touch targets, and each app demonstrates one real product behavior:
 * StayEase — search → property → booking sheet; SplitFin — split engine →
 * settlement. Replaces the legacy DeviceMockup.
 */

import React, { useMemo, useState } from 'react';
import {
  Search, MapPin, Star, X, ArrowRight, Users, CalendarDays, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { devicePalette } from './deviceTheme';

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function useSurface() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pal = devicePalette(isDark);
  return {
    isDark,
    pal,
    line: `1px solid ${pal.cardBorder}`,
    card: {
      background: pal.card,
      border: `1px solid ${pal.cardBorder}`,
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
      background: pal.card,
      border: `1px solid ${pal.cardBorder}`,
      boxShadow: isDark ? 'var(--shadow-3-dark)' : 'var(--shadow-3)',
    },
  };
}

const Row: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => {
  const { pal } = useSurface();
  return (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: strong ? 15 : 13.5,
      fontWeight: strong ? 800 : 400,
      color: 'var(--text-1)',
      padding: '4px 0',
    }}
  >
    <span style={{ color: strong ? pal.ink : pal.sub, fontWeight: strong ? 800 : 500 }}>{label}</span>
    <span style={{ fontWeight: strong ? 800 : 600 }}>{value}</span>
  </div>
  );
};

const TabBar: React.FC<{
  tabs: { id: string; label: string; icon: React.ComponentType<{ size?: number | string; color?: string }> }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => {
  const { pal, line } = useSurface();
  return (
    <div
      className="shrink-0 flex items-stretch"
      style={{ height: 62, borderTop: line, background: pal.tabBg }}
    >
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        const color = isActive ? pal.brand : pal.faint;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              color,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
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

const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative flex-1 min-h-0 flex flex-col">{children}</div>
);

const STAYS = [
  { id: 'h1', title: 'Azure Grand Hotel', location: 'MG Road, Bangalore', price: 4200, per: 'night' as const, rating: 4.6, tag: 'Hotels', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { id: 'v1', title: 'The Glass Villa', location: 'Candolim Beach, Goa', price: 14500, per: 'night' as const, rating: 4.9, tag: 'Villas', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80' },
  { id: 'a1', title: 'Indiranagar Serviced Apartment', location: 'Bangalore', price: 3200, per: 'night' as const, rating: 4.8, tag: 'Apartments', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80' },
  { id: 'hs1', title: 'Coffee Estate Homestay', location: 'Madikeri, Coorg', price: 2800, per: 'night' as const, rating: 4.9, tag: 'Homestays', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' },
  { id: 'p1', title: 'Sunrise Student PG', location: 'Koramangala, Bangalore', price: 11000, per: 'month' as const, rating: 4.5, tag: 'PGs', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80' },
];

const STAY_TYPES = ['All', 'Hotels', 'Villas', 'Apartments', 'Homestays', 'PGs'] as const;

function matchesQuery(s: (typeof STAYS)[number], q: string): boolean {
  if (!q.trim()) return true;
  const t = q.toLowerCase();
  return s.title.toLowerCase().includes(t) || s.location.toLowerCase().includes(t) || s.tag.toLowerCase().includes(t);
}

/* ------------------------------------------------------------------ */
/* StayEase                                                            */
/* ------------------------------------------------------------------ */

export const StayEaseScreen: React.FC = () => {
  const { pal, line, card, sheet } = useSurface();
  const [tab, setTab] = useState('explore');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<(typeof STAY_TYPES)[number]>('All');
  const [sheetStay, setSheetStay] = useState<(typeof STAYS)[number] | null>(null);
  const [trip, setTrip] = useState<(typeof STAYS)[number] | null>(null);

  return (
    <Screen>
      {/* Header */}
      <div className="shrink-0 px-4 pb-2" style={{ paddingTop: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="tech-label" style={{ color: 'var(--accent)' }}>StayEase</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-1)' }}>Find your stay</div>
          </div>
          <div
            style={{
              width: 40, height: 40, borderRadius: 999,
              background: pal.chip,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: pal.sub,
            }}
          >
            BL
          </div>
        </div>
      </div>

      {tab === 'explore' && (
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3">
          {/* Search */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              height: 46, padding: '0 14px',
              borderRadius: 14, border: line,
              background: pal.card,
              marginBottom: 10,
            }}
          >
            <Search size={18} color={pal.sub} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search villas, apartments, PGs…"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--text-1)' }}
            />
            {query && <X size={16} color={pal.sub} onClick={() => setQuery('')} />}
          </div>

          {/* Accommodation-type filter — the broader product model */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4, marginBottom: 8 }}>
            {STAY_TYPES.map((t) => {
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    flexShrink: 0,
                    height: 32, padding: '0 13px', borderRadius: 999,
                    fontSize: 12.5, fontWeight: active ? 700 : 500,
                    border: `1px solid ${active ? pal.brand : pal.cardBorder}`,
                    background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                    color: active ? 'var(--accent)' : pal.sub,
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Property cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {STAYS.filter((s) => matchesQuery(s, query) && (typeFilter === 'All' || s.tag === typeFilter)).map((s) => (
              <div key={s.id} style={card}>
                <div style={{ height: 120, background: '#0f1626', position: 'relative' }}>
                  <img src={s.image} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" referrerPolicy="no-referrer" />
                  <span
                    style={{
                      position: 'absolute', top: 10, left: 10,
                      fontSize: 11, fontWeight: 700, color: '#fff',
                      padding: '3px 8px', borderRadius: 999,
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.25 }}>{s.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                      <Star size={13} color="var(--warn)" fill="var(--warn)" /> {s.rating}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: pal.sub, marginTop: 3 }}>
                    <MapPin size={12} /> {s.location}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>₹{s.price.toLocaleString()}</span>
                      <span style={{ fontSize: 12.5, color: pal.sub }}> / {s.per}</span>
                    </div>
                    <button
                      onClick={() => setSheetStay(s)}
                      style={{
                        height: 38, padding: '0 16px', borderRadius: 12,
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                      }}
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'trips' && <TripsScreen trip={trip} />}

      {/* Booking sheet */}
      <AnimatePresence>
        {sheetStay && (
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={sheet}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: pal.track, margin: '0 auto 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)' }}>{sheetStay.title}</div>
                <div style={{ fontSize: 13, color: pal.sub }}>{sheetStay.location}</div>
              </div>
              <X size={20} color={pal.sub} onClick={() => setSheetStay(null)} />
            </div>

            <div style={{ margin: '12px 0', padding: 12, borderRadius: 14, background: pal.chip }}>
              {sheetStay.per === 'month' ? (
                <Row label="Monthly rent" value={`₹${sheetStay.price.toLocaleString()}`} />
              ) : (
                <>
                  <Row label={`4 nights × ₹${sheetStay.price.toLocaleString()}`} value={`₹${(sheetStay.price * 4).toLocaleString()}`} />
                  <Row label="Taxes & fees (est.)" value={`₹${Math.round(sheetStay.price * 4 * 0.18).toLocaleString()}`} />
                </>
              )}
              <div style={{ borderTop: line, margin: '8px 0', paddingTop: 8 }}>
                <Row
                  label="Total"
                  value={
                    sheetStay.per === 'month'
                      ? `₹${sheetStay.price.toLocaleString()}`
                      : `₹${Math.round(sheetStay.price * 4 * 1.18).toLocaleString()}`
                  }
                  strong
                />
              </div>
            </div>

            <button
              onClick={() => { setTrip(sheetStay); setSheetStay(null); setTab('trips'); }}
              style={{
                width: '100%', height: 48, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: 'var(--accent)', color: '#fff', fontSize: 16, fontWeight: 800,
              }}
            >
              Reserve · Stripe checkout
            </button>
            <div style={{ fontSize: 11.5, color: pal.sub, textAlign: 'center', marginTop: 8 }}>
              Demo preview — payments not processed here
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TabBar
        tabs={[
          { id: 'explore', label: 'Explore', icon: Search },
          { id: 'trips', label: 'Trips', icon: CalendarDays },
        ]}
        active={tab}
        onChange={setTab}
      />
    </Screen>
  );
};

/* ------------------------------------------------------------------ */
/* StayEase sub-screens                                                */
/* ------------------------------------------------------------------ */

const TripsScreen: React.FC<{ trip: (typeof STAYS)[number] | null }> = ({ trip }) => {
  const { card, pal } = useSurface();
  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-4 pb-3" style={{ paddingTop: 6 }}>
      {trip ? (
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
            <span style={{ color: pal.green }}>CONFIRMED</span>
            <span style={{ color: pal.sub }}>Oct 14–18</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)', margin: '4px 0' }}>{trip.title}</div>
          <Row label="Guests" value="2 adults" />
          <Row
            label="Total"
            value={trip.per === 'month' ? `₹${trip.price.toLocaleString()}/mo` : `₹${Math.round(trip.price * 4 * 1.18).toLocaleString()}`}
          />
        </div>
      ) : (
        <div
          style={{
            ...card, padding: 20,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            textAlign: 'center',
          }}
        >
          <CalendarDays size={22} color={pal.sub} />
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-1)' }}>No trips yet</div>
          <div style={{ fontSize: 12.5, color: pal.sub }}>
            Reserve a stay and your confirmation will appear here.
          </div>
        </div>
      )}
    </div>
  );
};

export { STAYS };
