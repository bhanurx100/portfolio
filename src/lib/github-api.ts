export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
  homepage?: string | null;
  fork: boolean;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  location: string | null;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: {
    name: string;
    url: string;
  };
  payload: {
    commits?: Array<{
      message: string;
      sha: string;
    }>;
    action?: string;
    ref_type?: string;
  };
}

export async function fetchGitHubUserData(username: string): Promise<{
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  languages: { name: string; percentage: number; color: string }[];
  totalStars: number;
  totalForks: number;
} | null> {
  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=30`),
      fetch(`https://api.github.com/users/${username}/events?per_page=30`),
    ]);

    if (!userRes.ok) {
      throw new Error(`GitHub API Error: ${userRes.status}`);
    }

    const user: GitHubUser = await userRes.json();
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];
    const events: GitHubEvent[] = eventsRes.ok ? await eventsRes.json() : [];

    // Filter out forks for own code highlights if possible, but keep all if few
    const ownRepos = repos.filter(r => !r.fork);
    const displayRepos = ownRepos.length >= 2 ? ownRepos : repos;

    // Calculate stars & forks
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);

    // Calculate language breakdown
    const langCounts: Record<string, number> = {};
    repos.forEach(r => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    const totalLang = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
    const langColorMap: Record<string, string> = {
      TypeScript: '#3178c6',
      JavaScript: '#f7df1e',
      HTML: '#e34c26',
      CSS: '#563d7c',
      Python: '#3572A5',
      Go: '#00ADD8',
      Rust: '#dea584',
      Shell: '#89e051',
      C: '#555555',
      'C++': '#f34b7d',
    };

    const languages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        percentage: Math.round((count / totalLang) * 100),
        color: langColorMap[name] || '#3b82f6',
      }));

    return {
      user,
      repos: displayRepos,
      events,
      languages,
      totalStars,
      totalForks,
    };
  } catch (error) {
    console.warn('GitHub API live data fetch error:', error);
    // Return null so the UI can honestly display that live data is unavailable rather than fabricating stats
    return null;
  }
}
