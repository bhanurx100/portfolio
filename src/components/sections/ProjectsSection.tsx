import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ProjectCardDesktop, ProjectShowcaseItem } from './projects/ProjectCardDesktop';
import { ProjectReelMobile } from './projects/ProjectReelMobile';

interface ProjectsSectionProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const showcaseProjects: ProjectShowcaseItem[] = [
  {
    id: 'stayease',
    name: 'StayEase',
    category: 'Hospitality · Native app (Expo · React Native)',
    tagline: 'A native stay-booking app — search hotels, villas, apartments and PGs, browse stays live on a PostGIS map, book offline, and manage inventory from owner-facing portals.',
    why: 'Booking apps are usually CRUD over a seeded database. StayEase is a native Expo/React Native product with real stay inventory on a PostGIS map, offline-ready searches, and genuinely distinct guest / owner / admin surfaces over one Supabase core.',
    whatIBuilt: 'The native app: Expo SDK 52 + React Native client, offline-first local state, Supabase realtime + PostGIS map embedding, Stripe checkout, a Maestro UI suite, and web admin surfaces where dashboards earn their place.',
    technologies: ['Expo SDK 52', 'React Native', 'TypeScript', 'Supabase · PostGIS', 'Realtime map', 'Stripe', 'Maestro'],
    githubUrl: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
    liveUrl: 'https://stayease-hotel-booking-platform.vercel.app/',
    themeColor: 'blue',
  },
  {
    id: 'splitfin',
    name: 'SplitFin',
    category: 'Fintech · Native app (Expo · React Native)',
    tagline: 'Personal accounts, category intelligence and group expense settlement in one native, offline-first product.',
    why: 'Money is shared constantly, but tools split the job: banking apps for balances, spreadsheets for budgets, splitting apps for groups. SplitFin unifies all three in a native app that works offline and syncs live with your group.',
    whatIBuilt: 'The native app: Expo SDK 52 + React Native client, offline-first MMKV + SQLite storage, Supabase WebSockets for live group presence and settlement, typed ledger logic, and a Maestro UI test pass.',
    technologies: ['Expo SDK 52', 'React Native', 'MMKV + SQLite', 'Supabase · realtime', 'TypeScript', 'Maestro'],
    githubUrl: 'https://github.com/bhanurx100/splitfin-expense-platform',
    liveUrl: 'https://splitfinai.vercel.app/',
    themeColor: 'emerald',
  },
];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenCaseStudy }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section
      id="work"
      className="py-20 sm:py-28 border-b"
      style={{ borderColor: line }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header — open composition, no pill */}
        <div className="max-w-2xl space-y-4 mb-6 sm:mb-10">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Selected work</p>
          <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Two products, built end to end.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2)' }}>
            Both are real, shipped apps — designed, engineered and iterated by one person.
            Open a case study to see how each system works, what it cost, and what I'd do differently.
          </p>
        </div>

        {/* Desktop: staggered editorial rows · Mobile: vertical story stack */}
        <div className="hidden lg:block divide-y" style={{ borderColor: line }}>
          {showcaseProjects.map((project, index) => (
            <ProjectCardDesktop
              key={project.id}
              project={project}
              index={index}
              onOpenCaseStudy={onOpenCaseStudy}
            />
          ))}
        </div>

        <div className="block lg:hidden">
          <ProjectReelMobile projects={showcaseProjects} onOpenCaseStudy={onOpenCaseStudy} />
        </div>
      </div>
    </section>
  );
};
