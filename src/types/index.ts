export interface ProjectScreen {
  title: string;
  description: string;
  badge?: string;
}

export interface Challenge {
  title: string;
  challenge: string;
  solution: string;
}

export interface BenchmarkMetric {
  metric: string;
  before: string;
  after: string;
  improvement: string;
}

export interface CoreMetric {
  value: string;
  label: string;
  sub: string;
}

export interface ProjectData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  type: string;
  period: string;
  role: string;
  description: string;
  highlightStat?: { value: string; label: string };
  capabilities: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  themeColor: string;
  accentColor: string;
  problem: string;
  solution: string;
  architecture: {
    title: string;
    description: string;
    components: string[];
  };
  keyDecisions: {
    decision: string;
    rationale: string;
  }[];
  challenges: Challenge[];
  benchmarks?: BenchmarkMetric[];
  coreMetrics?: CoreMetric[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isCurrent: boolean;
  type: string;
  summary: string;
  points: string[];
  technologies: string[];
}

export interface GitHubStats {
  username: string;
  totalContributions: number;
  publicRepos: number;
  streak: number;
  topLanguages: { name: string; percentage: number; color: string }[];
  contributionsByMonth: { month: string; count: number }[];
  recentRepos: {
    name: string;
    description: string;
    language: string;
    stars: number;
    url: string;
  }[];
}
