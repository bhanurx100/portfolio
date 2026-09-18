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
    category: 'Hospitality · Full-stack web platform',
    tagline: 'Hotel booking with live worldwide inventory, multi-source hotel enrichment, and Customer/Owner/Admin portals.',
    why: 'Booking demos are usually CRUD over a seeded database. StayEase merges live Booking.com inventory with on-platform hotels, enriches each one from Google Places, Tripadvisor and Expedia, and treats customer, owner and admin as genuinely different products.',
    whatIBuilt: 'The full codebase: React 18 + Vite client, Express + TypeScript service layer, MongoDB, Stripe PaymentIntent bookings, the multi-source enrichment pipeline with caching, an AI hotel assistant, JWT + Google OAuth auth, and a Playwright E2E suite.',
    technologies: ['React 18', 'Express · TypeScript', 'MongoDB', 'Stripe', 'Booking.com RapidAPI', 'Playwright'],
    githubUrl: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
    liveUrl: 'https://stayease-hotel-booking-platform.vercel.app/',
    themeColor: 'blue',
  },
  {
    id: 'splitfin',
    name: 'SplitFin',
    category: 'Fintech · Mobile-first web platform',
    tagline: 'Personal accounts, category intelligence and group expense settlement in one mobile-first product.',
    why: 'Money is shared constantly, but tools split the job: banking apps for balances, spreadsheets for budgets, splitting apps for groups. SplitFin unifies all three behind one typed, layered codebase.',
    whatIBuilt: 'The full codebase: Next.js + Hono typed backend with service/repository layers, Drizzle + PostgreSQL, a single aggregation pass powering every headline number, SplitPay group settlement, and a Three.js account carousel with a 2D fallback.',
    technologies: ['Next.js', 'Hono', 'Drizzle ORM', 'PostgreSQL', 'React Query', 'Three.js'],
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
            Both are real, shipped codebases — designed, engineered and iterated by one person.
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
