import { ProjectData, ExperienceItem } from '../types';

export const personalInfo = {
  name: 'Bhanuprasad L',
  shortName: 'Bhanu',
  title: 'Full-Stack Software Engineer',
  phone: '+91 9948515012',
  phoneTel: 'tel:+919948515012',
  email: 'bhanuprasad.0921@gmail.com',
  emailMailto: 'mailto:bhanuprasad.0921@gmail.com',
  linkedin: 'https://linkedin.com/in/bhanurx100',
  linkedinDisplay: 'linkedin.com/in/bhanurx100',
  github: 'https://github.com/bhanurx100',
  githubUsername: 'bhanurx100',
  location: 'Bengaluru, India',
  positioning: 'Software Engineer with 2+ years building native mobile products with applied AI — React Native + Expo clients, Supabase/Postgres data layers, realtime sync, and AI features that earn their place in the flow.',
  headline: 'Designing and shipping native mobile products with applied AI.',
  supporting: 'Product-minded full-stack engineering: mobile-first UX, typed data layers, realtime collaboration, and AI features integrated where they measurably help — not bolted on.',
  availability: 'Available for Full-Stack & Frontend Engineering Roles',
  resumeUrl: '#contact',
};

export const projectsData: Record<string, ProjectData> = {
  splitfin: {
    id: 'splitfin',
    slug: 'splitfin',
    name: 'SplitFin – Personal Finance & Expense Sharing',
    category: 'Mobile-first Web Platform (Next.js · Typed Backend)',
    type: 'Next.js, TypeScript, Hono API routes, Drizzle ORM, PostgreSQL, React Query, Three.js',
    period: '2025',
    role: 'Full-Stack Software Engineer',
    tagline: 'Personal accounts, category intelligence and group expense settlement in one mobile-first product.',
    description: 'A mobile-first personal finance platform that unifies what most tools split apart: a dashboard across bank/card/wallet/cash accounts, category-level spending analysis, and per-group expense settlement with a "who owes whom" view. Built as a typed, layered full-stack app — Next.js client, Hono API routes, service/repository layers, PostgreSQL via Drizzle ORM.',
    highlightStat: {
      value: 'SplitPay',
      label: 'Group ledgers with a simplified who-owes-whom settlement view'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built a unified account dashboard aggregating bank, credit card, wallet and cash balances behind one net-worth view, with a Three.js account carousel (momentum drag physics, spring-snap centering) and a 2D fallback for reduced-motion / no-WebGL contexts.',
      'Implemented SplitPay group settlement: per-group ledgers with SplitGroup/SplitMember models tracking you-owe / you-are-owed / settled states, intentionally decoupled from the debt-simplification math so the solver can evolve without UI changes.',
      'Engineered the financial summary layer as a single aggregation pass — three parallel Postgres aggregate queries (totals, categories, daily cash flow) scoped by a shared period clause, so every screen reads from one computed source instead of drifting client-side math.',
      'Built the transaction timeline as an auditable ledger: month grouping, income/expense/transfer/refund filters, and server-side date-range resolution with sane 30-day defaults.',
      'Designed category intelligence views — an orbital spend-share visualization with SVG donut fallback and client-side needs/wants/lifestyle grouping that avoids redundant network round-trips.'
    ],
    techStack: [
      'Next.js',
      'TypeScript',
      'Hono',
      'Drizzle ORM',
      'PostgreSQL',
      'React Query',
      'Three.js',
      'Tailwind CSS'
    ],
    githubUrl: 'https://github.com/bhanurx100/splitfin-expense-platform',
    liveUrl: 'https://splitfinai.vercel.app/',
    themeColor: '#10b981',
    accentColor: '#34d399',
    problem: 'Money is shared constantly — rent with roommates, trips with friends, dinners with colleagues — but existing tools force you to bounce between a banking app, a spreadsheet and a separate bill-splitting app to reconcile all of it. Personal-finance apps assume money is a solitary problem; splitting apps ignore accounts and budgets.',
    solution: 'Collapsed the three surfaces into one mobile-first product (~430px app shell): a unified account dashboard, category-level spending narrative, and per-group settlement. The settlement UI is deliberately decoupled from the debt-simplification math, and every headline number flows from a single server-side aggregation pass so views never disagree.',
    architecture: {
      title: 'Typed Layered Architecture (Next.js → Hono → Drizzle → Postgres)',
      description: 'Every feature follows the same vertical path with typed contracts at each boundary.',
      components: [
        'Client: Next.js + TypeScript + React Query; mobile-first app shell (~430px) with Three.js visualization where it adds value and static SVG fallbacks where it does not.',
        'API: Hono routes mounted under /api — accounts, transactions, summary — with query-param validation and server-side defaults.',
        'Services: feature services (account-service, transaction-service) own business rules and period logic.',
        'Repositories: account-repository / summary-repository encapsulate all SQL — summary runs three aggregate queries in parallel via Promise.all.',
        'Database: PostgreSQL through Drizzle ORM with typed schemas (accounts, transactions, categories, split groups/members).'
      ]
    },
    keyDecisions: [
      {
        decision: 'Layered service/repository backend instead of route-level SQL',
        rationale: 'Keeps business rules testable and swappable — the data source can change without touching API routes, and every number has exactly one computed source.'
      },
      {
        decision: 'Single aggregation pass for all headline numbers',
        rationale: 'The dashboard card, cash-flow chart and category donut all read from one computed summary — consistent numbers across screens instead of drifting independent calculations.'
      },
      {
        decision: 'Settlement UI decoupled from debt-simplification math',
        rationale: 'SimplifiedDebt is a typed contract, not a hard-wired algorithm — the current greedy solver can be replaced with a minimum-transaction-count solver without touching components.'
      },
      {
        decision: '3D only where it earns its place',
        rationale: 'The account carousel uses Three.js with a maintained 2D fallback for reduced-motion and no-WebGL contexts; the category view uses plain SVG.'
      }
    ],
    challenges: [
      {
        title: 'Debt simplification that survives algorithm changes',
        challenge: 'Naive per-pair settlement creates an O(N²) web of transfers; but hard-coding a solver into the UI makes improving it painful.',
        solution: 'Defined SimplifiedDebt as the contract between math and UI. The greedy graph solver ships behind that contract; a proper minimum-transaction-count solver is the next step and slots in without UI changes.'
      },
      {
        title: 'Consistent numbers across every screen',
        challenge: 'Dashboard totals, charts and donut breakdowns computed independently always drift apart — the fastest way to lose trust in a finance product.',
        solution: 'One summary engine: three parallel Postgres aggregates scoped by a shared period WHERE clause, compared against an equal-length prior period via date-fns.'
      }
    ]
  },
  stayease: {
    id: 'stayease',
    slug: 'stayease',
    name: 'StayEase – Hotel Booking Platform',
    category: 'Full-Stack Web Platform (MERN · Multi-Source Data)',
    type: 'React 18, TypeScript, Vite, Express, MongoDB, Stripe, Booking.com RapidAPI, Playwright',
    period: '2025',
    role: 'Full-Stack Software Engineer',
    tagline: 'Full-stack booking ecosystem with live worldwide inventory, multi-source hotel enrichment, and role-based dashboards.',
    description: 'A production-grade hotel booking platform combining live worldwide inventory (Booking.com RapidAPI), on-platform property management, and multi-source enrichment (Google Places + Tripadvisor + Expedia merged per hotel). React 18 + Vite client, Express + TypeScript backend with a service layer, MongoDB, Stripe PaymentIntent bookings, and role-based Customer/Owner/Admin portals.',
    highlightStat: {
      value: 'Live inventory + enrichment',
      label: 'Booking.com stock merged with on-platform hotels, enriched from three external sources'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built the multi-source enrichment pipeline: per-hotel merges of Google Places, Tripadvisor and Expedia data with deduplication and a 10-minute in-memory cache, behind a typed service layer.',
      'Implemented full-text hotel search with real-time filters (star rating, hotel type, facilities, max price), sorting, and live worldwide results merged with on-platform DB hotels.',
      'Shipped role-based portals with distinct UIs — Customer (booking history, upcoming stays), Owner (property management, per-hotel revenue stats), Admin (platform-wide analytics).',
      'Integrated Stripe PaymentIntent bookings with live price calculation, plus a currency system that keeps DB hotels in ₹ and external hotels in their API-native currency with user-selectable display conversion.',
      'Built an AI hotel assistant with a custom NLP intent extractor (destination, price, star rating, guest count), locale-aware ₹/£ thresholds, and parallel DB + external search with unified results.',
      'Covered auth, hotel management, search and the full booking flow with a Playwright end-to-end suite; containerized the backend with a multi-stage Dockerfile and health checks.'
    ],
    techStack: [
      'React 18',
      'TypeScript',
      'Vite',
      'Express',
      'MongoDB',
      'Stripe',
      'Booking.com RapidAPI',
      'Google Places',
      'React Query',
      'Playwright',
      'Docker'
    ],
    githubUrl: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
    liveUrl: 'https://stayease-hotel-booking-platform.vercel.app/',
    themeColor: '#3b82f6',
    accentColor: '#60a5fa',
    problem: 'Hotel booking demos are usually CRUD over a seeded database — a fixed list of properties, no real inventory, no external data, and an owner/admin story bolted on. A platform comparable to industry booking sites needs live inventory, data from sources that disagree, and three different users with three different products.',
    solution: 'Combined live Booking.com inventory with on-platform properties, enriched every hotel from Google Places, Tripadvisor and Expedia through a cached multi-source merge, and gave Customer, Owner and Admin genuinely distinct dashboards. Stripe PaymentIntent handles bookings; a currency layer keeps ₹ for DB hotels and API-native currency for external ones.',
    architecture: {
      title: 'MERN with a Service Layer and External Data Pipeline',
      description: 'Browser client → Express API → service layer → MongoDB, with external enrichment services at the edge.',
      components: [
        'Client: React 18 + TypeScript + Vite + Tailwind; Axios + React Query data layer; currency selector and sticky tab bars on detail pages.',
        'API: Express + TypeScript routes — /auth, /hotels, /search, /my-hotels, /bookings, /my-bookings — with JWT dual-auth (httpOnly cookie + Bearer header).',
        'Service Layer: aggregatorService, externalHotelService, googlePlacesService, tripadvisorService, expediaService — merging and deduplicating external data per hotel.',
        'Database: MongoDB/Mongoose — User, Hotel, Booking, Review, Analytics models.',
        'External Data: Booking.com RapidAPI (live inventory), Google Places, Tripadvisor, Expedia; 10-minute in-memory cache on enrichment.'
      ]
    },
    keyDecisions: [
      {
        decision: 'Service layer between routes and database',
        rationale: 'External data from four sources disagrees constantly — merging, deduplicating and caching belongs in services, not route handlers, so the enrichment pipeline stays testable.'
      },
      {
        decision: 'On-platform and external hotels unified but never conflated',
        rationale: 'DB hotels stay in ₹ and are bookable directly; external hotels keep their API-native currency and flow through the same UI with explicit data-source handling.'
      },
      {
        decision: 'Role-based dashboards as separate products',
        rationale: 'Customer, Owner and Admin have genuinely different jobs — booking stays, managing inventory and revenue, platform oversight — so each gets its own portal rather than role-gated widgets on one screen.'
      },
      {
        decision: 'Playwright E2E from day one',
        rationale: 'Auth, add-hotel, search and booking are multi-step flows across two user roles; E2E coverage catches the cross-flow regressions unit tests miss.'
      }
    ],
    challenges: [
      {
        title: 'Merging four data sources that disagree',
        challenge: 'The same hotel arrives with different image sets, amenity lists and review formats from Google Places, Tripadvisor, Expedia and the local database.',
        solution: 'A typed enrichment service merges and deduplicates images, amenities and reviews per hotel, backed by a 10-minute in-memory cache so detail pages stay fast without hammering rate-limited APIs.'
      },
      {
        title: 'One pricing system, two currencies',
        challenge: 'On-platform hotels are priced in ₹ while live Booking.com inventory returns API-native currencies — displaying both naively produces nonsense prices.',
        solution: 'formatINR() renders DB hotels always in ₹, formatExternal() uses the API-native currency code, and a user-selectable display currency converts on top without touching stored prices.'
      }
    ]
  }
};



export const experienceData: ExperienceItem[] = [
  {
    id: 'cynosure',
    role: 'Software Engineer',
    company: 'Cynosure Software Solutions Pvt Ltd',
    location: 'Bengaluru, India (Remote)',
    period: 'Dec 2023 – Present',
    isCurrent: true,
    type: 'Full-time • Remote',
    summary: 'Remote Full-Stack Software Engineer building modern web applications, scalable frontend architectures, REST APIs, and database-driven features.',
    points: [
      'Built and shipped product features using React.js, Next.js, TypeScript, and API-driven workflows — developed shared UI components and reusable integration patterns across multiple product surfaces, cutting repeated implementation work and easing onboarding onto new features.',
      'Managed client/server data flows with TanStack Query and REST APIs, implementing request deduplication, mutation handling, targeted cache invalidation, and refresh behavior so dashboard views remain synchronized after create, update, and delete operations.',
      'Improved application behavior with code splitting, lazy loading, targeted memoization, and more deliberate request handling, reducing unnecessary rendering and network work on data-heavy views without relying on unsupported performance percentages or benchmark claims.',
      'Fixed recurring production bugs across frontend and API integration flows — async race conditions, stale React closures, REST endpoint mismatches, and inconsistent error handling — improving stability and making failures easier to trace across affected product workflows.',
      'Contributed to REST API workflows for application features with Node.js and Express.js where required, using request validation, authentication checks, and predictable response structures to support frontend integration and reduce ambiguity between client and server behavior.'
    ],
    technologies: ['React.js', 'Next.js', 'TypeScript', 'TanStack Query', 'Node.js', 'Express.js', 'PostgreSQL', 'Tailwind CSS', 'Git']
  },
  {
    id: 'webbers',
    role: 'Web Development Intern',
    company: 'Webbers',
    location: 'Hyderabad, India',
    period: 'May 2023 – Nov 2023',
    isCurrent: false,
    type: 'Internship',
    summary: 'Frontend & Web Development Intern contributing to responsive UI engineering, cross-browser compatibility, REST API integration, and component modularity.',
    points: [
      'Built responsive, accessible web interfaces and reusable UI modules using React.js, JavaScript (ES6+), HTML5, and Tailwind CSS, translating Figma wireframes into pixel-perfect components.',
      'Integrated frontend client views with backend RESTful APIs, handling dynamic data rendering, form state validation, asynchronous error handling, and client-side routing.',
      'Assisted in optimizing web assets, image loading strategies, and client bundle size to enhance core web vitals, page load speeds, and cross-device performance.',
      'Collaborated with engineering leads in agile sprints to troubleshoot cross-browser layout inconsistencies and refactor legacy components into clean, modular React code.'
    ],
    technologies: ['React.js', 'JavaScript (ES6+)', 'HTML5', 'Tailwind CSS', 'REST APIs', 'Git', 'Figma']
  }
];
