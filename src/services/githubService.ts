/**
 * Robust GitHub Data Service
 * 
 * Fetches real GitHub telemetry, profile, repositories, and historical contribution matrix.
 * Implements strict zero-fabrication rules: missing or unavailable data is never simulated.
 * Includes client-side session caching to prevent rate-limiting.
 */

export interface GitHubDayContribution {
  date: string;
  count: number;
  level: number; // 0, 1, 2, 3, 4
}

export interface GitHubUserProfile {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  profileUrl: string;
}

export interface LanguageStat {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GitHubDataResult {
  isAvailable: boolean;
  isLoading: boolean;
  error?: string;
  profile?: GitHubUserProfile;
  contributions: GitHubDayContribution[];
  availableYears: string[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
  totalStars: number;
  languages: LanguageStat[];
}

const CACHE_KEY_PREFIX = 'gh_data_cache_v3_';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  HTML: '#e34f26',
  CSS: '#1572b6',
  Python: '#3776ab',
  Shell: '#89e051',
  Vue: '#41b883',
  Go: '#00add8',
  Rust: '#dea584',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
};

export async function fetchGitHubTelemetry(username: string): Promise<GitHubDataResult> {
  const cacheKey = `${CACHE_KEY_PREFIX}${username}`;

  // Check cache first
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS && parsed.data) {
        return parsed.data;
      }
    }
  } catch {
    // SessionStorage may be restricted in some iframes
  }

  const todayStr = new Date().toISOString().split('T')[0];
  let profile: GitHubUserProfile | undefined = undefined;
  let rawContributions: GitHubDayContribution[] = [];
  let totalStars = 0;
  const languageCounts: Record<string, number> = {};

  // 1. Fetch Profile and Repos in parallel
  const profilePromise = fetch(`https://api.github.com/users/${username}`)
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json();
      return {
        login: data.login || username,
        name: data.name || username,
        avatarUrl: data.avatar_url || `https://github.com/${username}.png`,
        bio: data.bio || null,
        publicRepos: typeof data.public_repos === 'number' ? data.public_repos : 0,
        followers: typeof data.followers === 'number' ? data.followers : 0,
        following: typeof data.following === 'number' ? data.following : 0,
        createdAt: data.created_at || '',
        profileUrl: data.html_url || `https://github.com/${username}`,
      } as GitHubUserProfile;
    })
    .catch(() => null);

  const reposPromise = fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
    .then(async (res) => {
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    })
    .catch(() => []);

  // 2. Fetch Contributions
  const contributionsPromise = (async () => {
    try {
      // Primary: All years endpoint
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=all`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.contributions) && data.contributions.length > 0) {
          return data.contributions as GitHubDayContribution[];
        }
      }
    } catch {
      // Fallback
    }

    try {
      // Fallback: Last 1 year
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.contributions) && data.contributions.length > 0) {
          return data.contributions as GitHubDayContribution[];
        }
      }
    } catch {
      // Failed
    }

    return [];
  })();

  const [profileResult, reposResult, contribResult] = await Promise.all([
    profilePromise,
    reposPromise,
    contributionsPromise,
  ]);

  if (profileResult) {
    profile = profileResult;
  }

  // Aggregate Stars & Repo Languages from real repositories
  if (Array.isArray(reposResult) && reposResult.length > 0) {
    reposResult.forEach((repo: any) => {
      if (typeof repo.stargazers_count === 'number') {
        totalStars += repo.stargazers_count;
      }
      if (repo.language && typeof repo.language === 'string') {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });
  }

  // Compute Language Percentages
  const totalLangRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const languages: LanguageStat[] = totalLangRepos > 0
    ? Object.entries(languageCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / totalLangRepos) * 100),
          color: LANGUAGE_COLORS[name] || '#8b949e',
        }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Filter contributions strictly to valid historical dates <= today
  if (Array.isArray(contribResult) && contribResult.length > 0) {
    rawContributions = contribResult
      .filter((c) => c && typeof c.date === 'string' && c.date <= todayStr && typeof c.count === 'number')
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // If no contributions were returned, return graceful unavailable result without synthetic data
  if (rawContributions.length === 0) {
    const result: GitHubDataResult = {
      isAvailable: false,
      isLoading: false,
      profile,
      contributions: [],
      availableYears: [],
      totalContributions: 0,
      currentStreak: 0,
      longestStreak: 0,
      activeDaysCount: 0,
      totalStars,
      languages,
    };
    return result;
  }

  // Extract available years
  const yearSet = new Set<string>();
  rawContributions.forEach((day) => {
    const yr = day.date.substring(0, 4);
    if (yr) yearSet.add(yr);
  });
  const availableYears = Array.from(yearSet).sort((a, b) => b.localeCompare(a));

  // Compute Streaks and Totals strictly from real data
  let totalContributions = 0;
  let activeDaysCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let currentRunningStreak = 0;

  for (let i = 0; i < rawContributions.length; i++) {
    const day = rawContributions[i];
    totalContributions += day.count;
    if (day.count > 0) {
      activeDaysCount++;
      currentRunningStreak++;
      if (currentRunningStreak > longestStreak) {
        longestStreak = currentRunningStreak;
      }
    } else {
      currentRunningStreak = 0;
    }
  }

  // Calculate current active streak from the most recent day backwards
  for (let i = rawContributions.length - 1; i >= 0; i--) {
    const day = rawContributions[i];
    if (day.count > 0) {
      currentStreak++;
    } else {
      // If today is 0 commits yet, don't break immediately if yesterday had commits
      if (i === rawContributions.length - 1) {
        continue;
      }
      break;
    }
  }

  const result: GitHubDataResult = {
    isAvailable: true,
    isLoading: false,
    profile,
    contributions: rawContributions,
    availableYears,
    totalContributions,
    currentStreak,
    longestStreak,
    activeDaysCount,
    totalStars,
    languages,
  };

  // Cache valid result
  try {
    sessionStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), data: result })
    );
  } catch {
    // Ignore cache write error
  }

  return result;
}
