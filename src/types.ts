// ---- Raw shapes returned by the GitHub REST API (only the fields we use) ----

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  pushed_at: string;
}

export interface GitHubEvent {
  type: string; // e.g. "PushEvent", "PullRequestEvent", "WatchEvent"
  created_at: string;
  repo: { name: string };
}

export interface GitHubData {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
}

// ---- The shape our UI consumes, after we crunch the raw data ----

export interface LanguageStat {
  name: string;
  repoCount: number;
  percent: number; // 0–100, share of repos that have a detected language
  color: string;
}

export interface ActivityRhythm {
  byWeekday: number[]; // 7 buckets, Sunday = 0
  byHour: number[]; // 24 buckets, local time
  busiestDay: string; // "Tuesday"
  peakHour: number; // 0–23
  timePersona: string; // "Night Owl", "Early Bird", ...
}

export interface WrappedStats {
  user: GitHubUser;
  yearsOnGitHub: number;
  joinedYear: number;
  ownRepoCount: number;
  totalStars: number;
  totalForks: number;
  topRepo: GitHubRepo | null;
  languages: LanguageStat[];
  rhythm: ActivityRhythm | null; // null when there's no recent public activity
  longestStreak: number; // consecutive active days in the recent activity window
  activeDays: number;
  eventCounts: { pushes: number; pullRequests: number; issues: number; starsGiven: number; total: number };
  archetype: string; // fun one-line title for the summary card
}
