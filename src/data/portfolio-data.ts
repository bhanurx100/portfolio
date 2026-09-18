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
  resumeUrl: 'https://drive.google.com/uc?export=download&id=1xLuLnV4ctqlz68ap07AdM1SY2CDc_yY6',
};

export const projectsData: Record<string, ProjectData> = {
  splitfin: {
    id: 'splitfin',
    slug: 'splitfin',
    name: 'SplitFin – Personal Finance & Expense Sharing',
    category: 'Native-first Finance & Expense (Expo SDK 52 · React Native)',
    type: 'Expo SDK 52, React Native, TypeScript, MMKV, SQLite, Supabase (realtime), PostgreSQL, PostGIS, Maestro',
    period: '2025',
    role: 'Product Engineer',
    tagline: 'Personal accounts, category intelligence and group expense settlement in one native, offline-first app.',
    description: 'A native personal finance app that unifies what most tools split apart: a dashboard across bank/card/wallet/cash accounts, category-level spending analysis, and per-group expense settlement with a "who owes whom" view. Offline-first — the ledger works with no signal and reconciles through Supabase WebSockets when you reconnect, so groups stay in sync live.',
    highlightStat: {
      value: 'SplitPay',
      label: 'Group ledgers with a simplified who-owes-whom settlement view'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built the native app around an offline-first ledger: MMKV + SQLite local store for balances, transactions and pending splits, with an idempotent sync queue that reconciles against Supabase when connectivity returns.',
      'Implemented SplitPay group settlement: per-group ledgers with SplitGroup/SplitMember models tracking you-owe / you-are-owed / settled states, deliberately decoupled from the debt-simplification math so the solver can evolve without UI changes.',
      'Engineered live group sync with Supabase WebSockets — new splits, paid markers and settlement pushes appear on every member device in real time, without drifting client-side tallies.',
      'Built the transaction timeline as an auditable ledger: month grouping, income/expense/transfer/refund filters, and date-range resolution with sane 30-day defaults.',
      'Designed category intelligence views — an orbital spend-share visualization with an SVG donut fallback and client-side needs/wants/lifestyle grouping that avoids redundant network round-trips.',
      'Covered the search, split, settle and reconcile flows with a Maestro UI test pass on iOS and Android simulators.'
    ],
    techStack: [
      'Expo SDK 52',
      'React Native',
      'TypeScript',
      'MMKV',
      'SQLite',
      'Supabase (realtime)',
      'PostgreSQL',
      'PostGIS',
      'Maestro'
    ],
    githubUrl: 'https://github.com/bhanurx100/splitfin-expense-platform',
    liveUrl: 'https://splitfinai.vercel.app/',
    themeColor: '#10b981',
    accentColor: '#34d399',
    problem: 'Money is shared constantly — rent with roommates, trips with friends, dinners with colleagues — but existing tools force you to bounce between a banking app, a spreadsheet and a separate bill-splitting app to reconcile all of it. Personal-finance apps assume money is a solitary problem, and most assume a constant connection.',
    solution: 'Collapsed the three surfaces into one native product: a unified account dashboard, category-level spending narrative, and per-group settlement. The ledger is offline-first for a phone that spends its life between networks, and live group sync over Supabase WebSockets keeps split decisions consistent across every member device.',
    architecture: {
      title: 'Native App over a Realtime Core (Expo → Supabase → Postgres)',
      description: 'Every feature follows the same path: native client → local store → realtime sync → Postgres, with a typed ledger service at the boundary.',
      components: [
        'Client: Expo SDK 52 + React Native + TypeScript; one codebase for iOS and Android; offline-first local store for the ledger and pending splits.',
        'Local store: MMKV for hot reads and SQLite for the ledger, with an idempotent sync queue that reconciles against the server.',
        'Realtime: Supabase WebSockets push split and settlement events to every group member device.',
        'Ledger service: typed TypeScript service owns split rules, category intelligence and who-owes-whom.',
        'Database: PostgreSQL with PostGIS, storing groups, members, transactions and settlement states.'
      ]
    },
    keyDecisions: [
      {
        decision: 'Offline-first ledger with an idempotent sync queue',
        rationale: 'A finance app must never block on the network or double-post a split. Local writes are queued and reconciled against Supabase, so a flutter on mobile data cannot corrupt a ledger.'
      },
      {
        decision: 'Single source of truth for every headline number',
        rationale: 'Dashboard totals, cash-flow and category views all read from the ledger and the same aggregate path — consistent numbers across screens instead of drifting independent calculations.'
      },
      {
        decision: 'Settlement UI decoupled from debt-simplification math',
        rationale: 'SimplifiedDebt is a typed contract, not a hard-wired algorithm — the current greedy solver can be replaced with a minimum-transaction-count solver without touching components.'
      },
      {
        decision: 'Realtime as additive to the offline queue',
        rationale: 'Presence and settlement pushes never overwrite pending local edits — the sync layer merges remote events against optimistic local state.'
      }
    ],
    challenges: [
      {
        title: 'Offline edits meeting live, conflicting group state',
        challenge: 'A member schedules a split offline and another settles the same bill online — both must resolve without losing money or trust.',
        solution: 'Every local op is idempotent and versioned; on reconnect the sync queue replays against the realtime state and surfaces only genuine conflicts for manual resolution.'
      },
      {
        title: 'Consistent numbers across every screen',
        challenge: 'Dashboard totals, charts and donut breakdowns computed independently always drift apart — the fastest way to lose trust in a finance product.',
        solution: 'One ledger and one aggregation path feed every headline view, compared against an equal-length prior period for the cash-flow narrative.'
      }
    ]
  },
  stayease: {
    id: 'stayease',
    slug: 'stayease',
    name: 'StayEase – Hotel Booking App',
    category: 'Native-first Hospitality (Expo SDK 52 · React Native)',
    type: 'Expo SDK 52, React Native, TypeScript, Supabase (Postgres · PostGIS), Stripe, Maestro',
    period: '2025',
    role: 'Product Engineer',
    tagline: 'Native stay booking — search hotels, villas, apartments, homestays and PGs, browse inventory live on a PostGIS map, and book offline.',
    description: 'A native stay-booking app that treats inventory as a living map: search across accommodation types, browse stays rendered live from PostGIS, save and draft bookings offline, and check out with Stripe. StayEase keeps guests, hosts and owners on one Supabase core, so live availability and role-based surfaces never disagree.',
    highlightStat: {
      value: 'Live map + offline drafts',
      label: 'PostGIS-backed inventory rendered live, with offline-first search and draft bookings'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built the native Expo/React Native app with a PostGIS-backed stay map — search, filters and property cards stay in sync with live inventory streamed from Supabase.',
      'Implemented offline-first search and booking drafts: MMKV + SQLite local state keeps saved stays and draft bookings usable with no signal, then reconciles against live availability before confirmation.',
      'Built role-based surfaces with distinct UIs — guest (booking history, upcoming stays), host (property management, per-hotel revenue stats), owner (platform-wide analytics) over the same Supabase core.',
      'Integrated Stripe checkout for the reservation flow, plus a currency layer that keeps local pricing and display conversion explicit per property.',
      'Built an AI stay assistant with a rule-based intent extractor (destination, price, stay dates, guest count) that runs a parallel map + list search and merges results into one view.',
      'Covered search, booking and reconciliation flows with a Maestro UI test pass across iOS and Android simulators.'
    ],
    techStack: [
      'Expo SDK 52',
      'React Native',
      'TypeScript',
      'Supabase',
      'PostgreSQL',
      'PostGIS',
      'Stripe',
      'Maestro'
    ],
    githubUrl: 'https://github.com/bhanurx100/stayease-hotel-booking-platform',
    liveUrl: 'https://stayease-hotel-booking-platform.vercel.app/',
    themeColor: '#3b82f6',
    accentColor: '#60a5fa',
    problem: 'Stay-booking demos are usually CRUD over a seeded database — a fixed list of properties, no real inventory, no geography, and an owner/host story bolted on. A product comparable to industry stay apps needs live inventory on a map, search that works on a bad connection, and three different users with three different surfaces.',
    solution: 'Made the map the product: stay inventory lives in PostGIS and streams to the app in real time, guests can search and draft bookings offline, Stripe powers checkout, and guest / host / owner surfaces are genuinely distinct products over one Supabase core.',
    architecture: {
      title: 'Native Client → Supabase realtime/PostGIS → Postgres',
      description: 'The native app reads and writes through one realtime core, with offline reconciliation at the edge.',
      components: [
        'Client: Expo SDK 52 + React Native + TypeScript; native map + list browse, offline-first search and booking drafts; one codebase for iOS and Android.',
        'Local store: MMKV for hot reads, SQLite for saved stays and draft bookings, with a sync queue that checks live availability before confirmation.',
        'Realtime + maps: Supabase WebSockets stream inventory; PostGIS powers viewport queries so the map and the list never disagree.',
        'Edge services: Supabase Edge Functions orchestrate booking, checkout sessions and host/owner admin flows.',
        'Database: PostgreSQL with PostGIS — stays, users, bookings, availability and reviews.'
      ]
    },
    keyDecisions: [
      {
        decision: 'The map is the interface, not a feature',
        rationale: 'Stays are inherently geographic. PostGIS viewport queries mean the list and the map render the same live inventory from the same query, instead of two views that drift.'
      },
      {
        decision: 'Offline drafts with hard availability checks',
        rationale: 'Searching on a bad connection should work, but confirming a booking must never. Drafts are local; confirmation re-checks realtime availability against bookings.'
      },
      {
        decision: 'Role-based surfaces as separate products',
        rationale: 'Guest, host and owner have genuinely different jobs — finding and booking stays, managing inventory and revenue, platform oversight — so each gets its own surface rather than role-gated widgets on one screen.'
      },
      {
        decision: 'AI assistant as a parallel search path',
        rationale: 'Natural-language stays search is an intent extractor feeding the same map + list query engine, so the assistant never gets a different answer than the map does.'
      }
    ],
    challenges: [
      {
        title: 'One inventory, two live surfaces',
        challenge: 'The map viewport and the result list are different queries — a stay filtered out of the list could still be sitting in the map frame.',
        solution: 'Both surfaces read from the same PostGIS viewport/service, and realtime subscriptions apply the same row-level filters, so the map and list cannot disagree.'
      },
      {
        title: 'Offline drafts meeting live availability',
        challenge: 'A guest drafts a 4-night booking offline, and three nights get taken before they reconnect.',
        solution: 'Confirmation is never local: on reconnect the draft is re-checked against live availability, and the guest is offered a clean alternative before any charge is created.'
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
