/**
 * Robust GitHub Data Service
 *
 * Fetches real GitHub telemetry, profile, repositories, and historical contribution matrix.
 * Implements strict zero-fabrication rules: missing or unavailable data is never simulated.
 * Every count shown comes from a live GitHub API response — either the contributions
 * mirror or the official GitHub REST API (profile / repos / public events).
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
  /** Epoch ms of the successful network fetch backing this result. */
  fetchedAt: number;
}

const CACHE_KEY_PREFIX = 'gh_data_cache_v4_';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — the graph must track the current day

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

/** Local (device-timezone) YYYY-MM-DD — UTC date is wrong for IST around midnight. */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return localDateStr(dt);
}

function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Recent public activity straight from the official GitHub REST API.
 * Used ONLY to repair trailing / stale days (the contributions mirror can lag
 * behind real pushes). Only contribution-type events are counted — stars,
 * forks and follows never inflate the graph.
 */
async function fetchRecentEventCounts(username: string, todayStr: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, {
      cache: 'no-store',
    });
    if (!res.ok) return counts;
    const events = await res.json();
    if (!Array.isArray(events)) return counts;

    const cutoff = addDays(todayStr, -14);
    for (const ev of events) {
      if (!ev || typeof ev.created_at !== 'string') continue;
      const day = ev.created_at.slice(0, 10);
      if (day < cutoff || day > todayStr) continue;

      let n = 0;
      switch (ev.type) {
        case 'PushEvent':
          n = typeof ev.payload?.size === 'number' && ev.payload.size > 0
            ? ev.payload.size
            : Array.isArray(ev.payload?.commits) ? ev.payload.commits.length : 1;
          break;
        case 'PullRequestEvent':
        case 'PullRequestReviewEvent':
        case 'PullRequestReviewCommentEvent':
        case 'IssuesEvent':
        case 'IssueCommentEvent':
        case 'CommitCommentEvent':
          n = 1;
          break;
        default:
          continue; // WatchEvent, ForkEvent, CreateEvent, etc. are not contributions
      }
      counts.set(day, (counts.get(day) ?? 0) + n);
    }
  } catch {
    // Best effort — a failed patch must never break the whole telemetry load
  }
  return counts;
}

export async function fetchGitHubTelemetry(
  username: string,
  opts?: { forceRefresh?: boolean }
): Promise<GitHubDataResult> {
  const cacheKey = `${CACHE_KEY_PREFIX}${username}`;
  const forceRefresh = opts?.forceRefresh === true;

  // Check cache first (skipped on manual refresh so a refresh always hits the network)
  if (!forceRefresh) {
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
  }

  const todayStr = localDateStr(new Date());
  const bust = forceRefresh ? `&t=${Date.now()}` : '';
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

  // 2. Fetch Contributions (bypass HTTP cache so daily data is actually daily)
  const contributionsPromise = (async () => {
    try {
      // Primary: All years endpoint
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=all${bust}`, {
        cache: 'no-store',
      });
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
      const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last${bust}`, {
        cache: 'no-store',
      });
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

  // 3. Recent public events — repairs trailing days when the mirror lags real pushes
  const eventsPromise = fetchRecentEventCounts(username, todayStr);

  const [profileResult, reposResult, contribResult, eventCounts] = await Promise.all([
    profilePromise,
    reposPromise,
    contributionsPromise,
    eventsPromise,
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

  // Filter contributions strictly to valid historical dates <= today (local day).
  // Levels are recomputed globally so colors stay consistent across years —
  // the mirror's levels are year-relative quartiles and disagree with each other.
  const byDate = new Map<string, GitHubDayContribution>();
  if (Array.isArray(contribResult) && contribResult.length > 0) {
    for (const c of contribResult) {
      if (!c || typeof c.date !== 'string' || c.date > todayStr || typeof c.count !== 'number') continue;
      const existing = byDate.get(c.date);
      if (!existing || c.count > existing.count) {
        byDate.set(c.date, {
          date: c.date,
          count: c.count,
          level: levelForCount(c.count),
        });
      }
    }
  }

  // Patch recent days from live public events: the mirror can lag behind real
  // pushes, leaving the graph stuck on an old date. Only contribution-type
  // events are counted, only the last 14 days are eligible, and existing
  // non-zero mirror counts are never reduced — the patch only fills gaps.
  let upstreamMax = '';
  byDate.forEach((_, d) => {
    if (d > upstreamMax) upstreamMax = d;
  });
  eventCounts.forEach((count, day) => {
    const existing = byDate.get(day);
    if (!existing) {
      byDate.set(day, { date: day, count, level: levelForCount(count) });
    } else if (existing.count === 0 && day > addDays(todayStr, -14)) {
      existing.count = count;
      existing.level = levelForCount(count);
    }
  });

  // Backfill the full continuous range through TODAY so the timeline always
  // ends on the current date. Missing days are genuinely empty days (count 0),
  // never invented activity.
  if (byDate.size > 0) {
    let start = todayStr;
    byDate.forEach((_, d) => {
      if (d < start) start = d;
    });
    for (let d = start; ; d = addDays(d, 1)) {
      if (!byDate.has(d)) {
        byDate.set(d, { date: d, count: 0, level: 0 });
      }
      if (d >= todayStr) break;
    }
    rawContributions = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
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
      fetchedAt: Date.now(),
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
    fetchedAt: Date.now(),
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
