import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ProjectCardDesktop, ProjectShowcaseItem } from './projects/ProjectCardDesktop';
import { ProjectReelMobile } from './projects/ProjectReelMobile';

interface ProjectsSectionProps {
  onOpenCaseStudy: (slug: string) => void;
}

export const showcaseProjects: ProjectShowcaseItem[] = [
  {
    id: 'splitfin',
    name: 'SplitFin',
    category: 'Personal Finance & Investment · Mobile-first (React Native · Expo)',
    tagline: 'A mobile-first finance platform for managing money, budgets, investments, and financial insights in one experience.',
    why: 'Personal finance involves accounts, transactions, budgets, recurring expenses, investments, and market information that are often presented as disconnected experiences. SplitFin brings these workflows together so everyday spending and longer-term financial activity can be understood in one place.',
    whatIBuilt: 'The mobile-first product experience: React Native + Expo + Expo Router client, TanStack Query API-driven server state, Zod validation, PostgreSQL + Prisma structured data, and Recharts financial visualizations.',
    technologies: ['React Native', 'Expo', 'Expo Router', 'TypeScript', 'PostgreSQL', 'Prisma', 'TanStack Query', 'Zod', 'Recharts'],
    liveUrl: 'https://splitfinai.vercel.app/',
    themeColor: 'emerald',
  },
  {
    id: 'stayease',
    name: 'StayEase',
    category: 'Hospitality & Hotel Booking · Full-stack (React · Node.js)',
    tagline: 'A full-stack hotel discovery and booking platform covering search, properties, rooms, reservations, payments, and media.',
    why: 'Hotel booking is more than a property list. StayEase connects hotel discovery, property and room information, locations, reservations, payments, reviews, and media into one continuous discovery-to-booking experience.',
    whatIBuilt: 'The full-stack platform: React + TypeScript client, Node.js + Express.js REST APIs, MongoDB persistence, JWT role-based auth, Stripe payments, Cloudinary media, and a custom NLP hotel-discovery chatbot.',
    technologies: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Stripe', 'Cloudinary', 'REST APIs'],
    githubUrl: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
    liveUrl: 'https://stayease-hotel-booking-platform.vercel.app/',
    themeColor: 'blue',
  },
];

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenCaseStudy }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const line = isDark ? 'var(--line-dark)' : 'var(--line)';

  return (
    <section
      id="work"
      className="py-12 sm:py-16 border-b"
      style={{ borderColor: line }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial header — open composition, no pill */}
        <div className="max-w-2xl space-y-3 mb-6">
          <p className="tech-label" style={{ color: 'var(--accent)' }}>Selected work</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-1)' }}>
            Two products, built end to end.
          </h2>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>
            A mobile-first finance platform and a full-stack hotel booking platform —
            designed and engineered across responsive interfaces, API-driven workflows,
            authentication, data flows, and integrations. Open a case study for the full breakdown.
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
