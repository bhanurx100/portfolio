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
  positioning: 'Full-Stack Software Engineer building web and mobile products with React, Next.js, TypeScript, React Native, Node.js, PostgreSQL, and MongoDB.',
  headline: 'Building practical full-stack products across web and mobile.',
  supporting: 'Product-focused engineering across responsive interfaces, reusable components, API-driven workflows, authentication, data flows, integrations, and maintainable application architecture.',
  availability: 'Available for Full-Stack & Frontend Engineering Roles',
  resumeUrl: 'https://drive.google.com/file/d/1_QJEOlaYzMeEGXA5AjewHac8izzQW0tA/view?usp=sharing',
};

export const projectsData: Record<string, ProjectData> = {
  splitfin: {
    id: 'splitfin',
    slug: 'splitfin',
    name: 'SplitFin – Personal Finance & Investment Platform',
    category: 'Personal Finance & Investment',
    type: 'React Native, Expo, Expo Router, TypeScript, PostgreSQL, Prisma, TanStack Query, Zod, Recharts',
    period: '2025',
    role: 'Product Engineer',
    tagline: 'A mobile-first finance platform for managing money, budgets, investments, and financial insights in one experience.',
    description: 'A personal finance and investment platform that brings accounts, transactions, categories, budgets, recurring expenses, cash flow, portfolio tracking, investment information, and analytics into a unified product experience. The product is designed around structured financial data and clear flows for tracking day-to-day money as well as investments.',
    highlightStat: {
      value: 'Unified finance',
      label: 'Accounts, transactions, budgets, investments and analytics in one product'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built the mobile-first product experience using React Native, Expo, Expo Router, and TypeScript, with product flows designed around mobile navigation and interaction patterns.',
      'Implemented financial workflows for accounts, transactions, categories, budgets, recurring expenses, and cash-flow views using structured application data.',
      'Built investment and portfolio workflows covering holdings, transaction history, market information, and investment-related views.',
      'Integrated financial-data capabilities for market information and investment workflows, including explicit handling for delayed, unavailable, and changing data states.',
      'Built interactive financial visualizations and analytics using Recharts for allocation, historical views, cash flow, and other product insights.',
      'Used PostgreSQL with Prisma for structured application data and TanStack Query for API-driven server state, mutations, caching, and synchronization.',
      'Used Zod for validation across structured application inputs and financial workflows.'
    ],
    techStack: [
      'React Native',
      'Expo',
      'Expo Router',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'TanStack Query',
      'Zod',
      'Recharts'
    ],
    githubUrl: '',
    liveUrl: 'https://splitfinai.vercel.app/',
    themeColor: '#10b981',
    accentColor: '#34d399',
    problem: 'Personal finance involves multiple types of information — accounts, transactions, budgets, recurring expenses, investments, and market information — that are often presented as disconnected experiences. SplitFin brings these workflows together so users can understand everyday spending and longer-term financial activity in one place.',
    solution: 'Built a unified finance experience around structured financial data, connecting account and transaction workflows with budgets, cash flow, portfolio tracking, investment information, and interactive analytics.',
    architecture: {
      title: 'Mobile Client → API Workflows → PostgreSQL',
      description: 'The application separates mobile presentation, API-driven server state, validation, and persistent financial data so individual product workflows remain maintainable.',
      components: [
        'Client: React Native + Expo + Expo Router + TypeScript for the mobile-first application experience.',
        'Server state: TanStack Query manages API data, mutations, caching, invalidation, loading states, and synchronization across screens.',
        'Validation: Zod provides structured validation for application inputs and data workflows.',
        'Data layer: PostgreSQL stores the core financial data, with Prisma providing the application data-access layer.',
        'Analytics: Recharts powers interactive financial charts and portfolio-oriented visualizations.'
      ]
    },
    keyDecisions: [
      {
        decision: 'Model finance workflows around structured data',
        rationale: 'Accounts, transactions, budgets, recurring expenses, and investments have relationships that need to remain consistent across multiple screens, so the product is built around a structured persistence model rather than isolated UI state.'
      },
      {
        decision: 'Use server-state management for API-driven screens',
        rationale: 'TanStack Query keeps fetching, mutations, caching, invalidation, and loading/error states consistent across connected product workflows.'
      },
      {
        decision: 'Keep financial validation explicit',
        rationale: 'Financial inputs need predictable validation and clear failure states, so Zod is used to validate structured application data at the boundary.'
      },
      {
        decision: 'Treat financial-data availability as part of the UI',
        rationale: 'Market and investment information can be delayed or unavailable, so the interface distinguishes available, delayed, empty, and unavailable states rather than presenting every value as guaranteed.'
      }
    ],
    challenges: [
      {
        title: 'Connecting different financial workflows',
        challenge: 'Accounts, transactions, budgets, recurring expenses, and investments all represent different parts of a user’s financial picture.',
        solution: 'Organized the product around shared financial data and reusable application flows so related views can present consistent information without duplicating business logic.'
      },
      {
        title: 'Presenting changing financial information clearly',
        challenge: 'Market and investment information can change independently of the rest of the user’s financial data.',
        solution: 'Designed the investment views to distinguish current, delayed, unavailable, and historical information so users can understand the state of the data being shown.'
      }
    ]
  },

  stayease: {
    id: 'stayease',
    slug: 'stayease',
    name: 'StayEase – Hotel Booking Platform',
    category: 'Hospitality & Hotel Booking',
    type: 'React, TypeScript, Node.js, Express.js, MongoDB, JWT, Stripe, Cloudinary, REST APIs',
    period: '2025',
    role: 'Product Engineer',
    tagline: 'A full-stack hotel discovery and booking platform covering search, properties, rooms, reservations, payments, and media.',
    description: 'A full-stack hospitality platform covering hotel discovery, property and room information, customer accounts, reservations, reviews, payments, and media management. The application combines a React frontend with Node.js and Express.js APIs, MongoDB persistence, JWT-based authentication, Stripe payments, and Cloudinary media workflows.',
    highlightStat: {
      value: 'Full-stack booking',
      label: 'Discovery, property details, reservations, payments and media workflows'
    },
    coreMetrics: [],
    benchmarks: [],
    capabilities: [
      'Built responsive hotel discovery and booking flows using React and TypeScript, including multi-field search and filtering, property views, room information, image galleries, and location-based exploration.',
      'Built REST APIs with Node.js and Express.js for hotels, rooms, bookings, users, reviews, and related application resources.',
      'Used MongoDB for application persistence and structured backend workflows across property, booking, user, and review data.',
      'Implemented JWT-based authentication and role-based authorization for customers, property owners, and administrators, including protected backend operations and resource-ownership checks.',
      'Integrated Stripe into the reservation workflow for payment processing and handled successful, failed, and incomplete payment states.',
      'Integrated Cloudinary for property and room image management and connected media workflows to the application.',
      'Built a hotel discovery chatbot using custom NLP intent handling and short session context to interpret common search preferences and guide users through hotel discovery.',
      'Implemented map and location features as part of the property discovery experience.'
    ],
    techStack: [
      'React',
      'TypeScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'JWT',
      'Stripe',
      'Cloudinary',
      'REST APIs'
    ],
    githubUrl: '',
    liveUrl: '',
    themeColor: '#3b82f6',
    accentColor: '#60a5fa',
    problem: 'Hotel booking involves more than displaying a list of properties. Users need to discover stays, compare property and room information, understand locations, move through reservations, and complete payments without losing context between these steps.',
    solution: 'Built the product as a connected discovery-to-booking experience, combining property and room views, search and filtering, location features, reservation workflows, authentication, payment processing, reviews, media management, and a lightweight conversational search experience.',
    architecture: {
      title: 'React Client → Express APIs → MongoDB',
      description: 'The application separates the React product experience from REST API workflows and MongoDB persistence, with authentication and external services integrated through the backend.',
      components: [
        'Client: React + TypeScript for responsive discovery, property, room, booking, account, and conversational search experiences.',
        'Backend: Node.js + Express.js REST APIs for hotels, rooms, bookings, users, reviews, and related resources.',
        'Authentication: JWT-based authentication with role-based authorization and server-side permission checks.',
        'Database: MongoDB for users, properties, rooms, bookings, reviews, and application data.',
        'External services: Stripe for payments and Cloudinary for property and room media.'
      ]
    },
    keyDecisions: [
      {
        decision: 'Keep booking workflows behind backend APIs',
        rationale: 'Reservations and payment-related operations need server-side validation and authorization rather than relying on client-side state alone.'
      },
      {
        decision: 'Separate authentication from UI access',
        rationale: 'Role-based UI behavior is backed by server-side authorization and resource-ownership checks so protected operations are enforced by the API.'
      },
      {
        decision: 'Use a unified property discovery flow',
        rationale: 'Search, filtering, property details, room information, images, and location features are connected so users can move from discovery to reservation without switching between disconnected product surfaces.'
      },
      {
        decision: 'Keep chatbot logic focused on hotel discovery',
        rationale: 'The conversational flow uses custom intent handling and short session context to assist discovery without replacing the core search and booking workflows.'
      }
    ],
    challenges: [
      {
        title: 'Connecting discovery with booking',
        challenge: 'Hotel discovery, property details, rooms, and reservations are separate workflows but need to feel like one continuous experience.',
        solution: 'Connected the React flows through shared API-driven data and consistent navigation from search results through property and room details into the reservation flow.'
      },
      {
        title: 'Protecting role-specific operations',
        challenge: 'Customers, property owners, and administrators have different permissions and access to application resources.',
        solution: 'Implemented JWT authentication with role-based authorization and backend resource checks for protected operations.'
      },
      {
        title: 'Handling external payment and media services',
        challenge: 'Booking workflows depend on external services whose operations can succeed, fail, or remain incomplete.',
        solution: 'Integrated Stripe and Cloudinary through dedicated application workflows and represented their outcomes explicitly in the product flow.'
      }
    ]
  }
};

export const experienceData: ExperienceItem[] = [
  {
    id: 'cynosure',
    role: 'Software Engineer',
    company: 'Cynosure Software Solutions Pvt Ltd',
    location: 'Bengaluru, India',
    period: 'Dec 2023 – Present',
    isCurrent: true,
    type: 'Full-time • Remote',
    summary: 'Full-Stack Software Engineer working across React, Next.js, TypeScript, Node.js, REST APIs, application data flows, and responsive product experiences.',
    points: [
      'Build and evolve product features using React, Next.js, and TypeScript, translating product requirements and redesigned experiences into reusable components, responsive interfaces, and maintainable application flows.',
      'Implement API-driven workflows with TanStack Query and REST services, managing server state, mutations, caching, invalidation, loading states, error handling, and synchronization across product surfaces.',
      'Build web and mobile experiences using React and React Native with Expo and Expo Router, adapting product workflows to platform-specific navigation, interaction patterns, and API-driven application state.',
      'Work with PostgreSQL and MongoDB-backed applications and connect persistence layers with frontend and backend workflows through Prisma and REST APIs.'
    ],
    technologies: [
      'React',
      'Next.js',
      'TypeScript',
      'TanStack Query',
      'Node.js',
      'Express.js',
      'REST APIs',
      'PostgreSQL',
      'MongoDB',
      'Prisma',
      'React Native',
      'Expo',
      'Expo Router'
    ]
  },
  {
    id: 'webbers',
    role: 'Web Development Intern',
    company: 'Webbers Labs Technologies',
    location: 'Hyderabad, India',
    period: 'May 2023 – Nov 2023',
    isCurrent: false,
    type: 'Internship',
    summary: 'Web development internship focused on frontend implementation and building practical web interfaces.',
    points: [
      'Contributed to web development tasks and frontend implementation as part of an engineering team.',
      'Worked on responsive interfaces and translated product requirements into functional web experiences.',
      'Worked with frontend application flows and integrated application data into user-facing screens.',
      'Collaborated on debugging, UI improvements, and incremental changes across web product workflows.'
    ],
    technologies: [
      'React',
      'JavaScript',
      'HTML',
      'CSS'
    ]
  }
];
