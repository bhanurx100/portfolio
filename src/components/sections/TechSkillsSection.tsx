import React from 'react';

interface Tech {
  name: string;
  category: string;
}

const TECH_STACK: Tech[] = [
  // Core
  { name: 'TypeScript', category: 'Core' },
  { name: 'JavaScript', category: 'Core' },

  // Frontend
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'React Router', category: 'Frontend' },
  { name: 'Vite', category: 'Frontend' },

  // Mobile
  { name: 'React Native', category: 'Mobile' },
  { name: 'Expo', category: 'Mobile' },

  // UI
  { name: 'Tailwind CSS', category: 'UI' },
  { name: 'shadcn/ui', category: 'UI' },
  { name: 'Material UI', category: 'UI' },
  { name: 'Chakra UI', category: 'UI' },
  { name: 'CSS Modules', category: 'UI' },
  { name: 'Styled Components', category: 'UI' },

  // State / Data
  { name: 'Context API', category: 'State' },
  { name: 'Redux Toolkit', category: 'State' },
  { name: 'Zustand', category: 'State' },
  { name: 'TanStack Query', category: 'Data' },
  { name: 'React Hook Form', category: 'Forms' },
  { name: 'Zod', category: 'Validation' },

  // Backend
  { name: 'Node.js', category: 'Backend' },
  { name: 'Express', category: 'Backend' },
  { name: 'REST APIs', category: 'Backend' },
  { name: 'JWT', category: 'Backend' },
  { name: 'Middleware', category: 'Backend' },

  // Database
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Mongoose', category: 'Database' },
  { name: 'Redis', category: 'Database' },

  // Engineering
  { name: 'Git', category: 'Engineering' },
  { name: 'Docker', category: 'Engineering' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'CI/CD', category: 'Engineering' },
  { name: 'Testing', category: 'Quality' },
  { name: 'Figma', category: 'Design' },
];

/**
 * Duplicate the list so the marquee can loop continuously
 * without a visible jump.
 */
const MARQUEE_STACK = [...TECH_STACK, ...TECH_STACK];

export const TechSkillsSection: React.FC = () => {
  return (
    <section
      id="tech-skills"
      className="py-8 sm:py-10 lg:py-12 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Compact heading */}
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p
              className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--accent)' }}
            >
              Technology
            </p>

            <h2
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{ color: 'var(--text-1)' }}
            >
              The stack behind the products.
            </h2>
          </div>

          <span
            className="hidden text-[10px] sm:block"
            style={{ color: 'var(--text-3)' }}
          >
            Full-stack · Web · Mobile
          </span>
        </div>

        {/* Marquee */}
        <div
          className="relative overflow-hidden rounded-xl py-3"
          style={{
            background:
              'var(--surface-2, rgba(255,255,255,0.03))',
            border:
              '1px solid var(--border, rgba(128,128,128,0.12))',
          }}
        >
          {/* Left fade */}
          <div
            className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-20"
            style={{
              background:
                'linear-gradient(to right, var(--bg-1, transparent), transparent)',
            }}
          />

          {/* Right fade */}
          <div
            className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-20"
            style={{
              background:
                'linear-gradient(to left, var(--bg-1, transparent), transparent)',
            }}
          />

          <div className="tech-marquee">
            {MARQUEE_STACK.map((tech, index) => (
              <div
                key={`${tech.name}-${index}`}
                className="group flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 transition-transform duration-200 hover:-translate-y-0.5 sm:px-4 sm:py-2"
                title={`${tech.name} · ${tech.category}`}
                style={{
                  background:
                    'var(--surface-1, rgba(128,128,128,0.08))',
                  border:
                    '1px solid var(--border, rgba(128,128,128,0.14))',
                }}
              >
                {/* tiny accent dot */}
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: 'var(--accent)',
                  }}
                />

                <span
                  className="whitespace-nowrap text-[10px] font-semibold sm:text-xs"
                  style={{
                    color: 'var(--text-2)',
                  }}
                >
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Small supporting line */}
        <p
          className="mt-3 text-[10px]"
          style={{ color: 'var(--text-3)' }}
        >
          Technologies are selected around the product, architecture and
          constraints — not simply added to a list.
        </p>
      </div>

      {/* Marquee animation */}
      <style>{`
        .tech-marquee {
          display: flex;
          width: max-content;
          gap: 8px;
          padding: 0 12px;
          animation: tech-scroll 38s linear infinite;
        }

        .tech-marquee:hover {
          animation-play-state: paused;
        }

        @keyframes tech-scroll {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(calc(-50% - 4px));
          }
        }

        @media (max-width: 640px) {
          .tech-marquee {
            gap: 6px;
            padding: 0 8px;
            animation-duration: 28s;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tech-marquee {
            animation: none;
            overflow-x: auto;
            width: 100%;
            scrollbar-width: none;
          }

          .tech-marquee::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};