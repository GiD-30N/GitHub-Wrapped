import type {
  ActivityRhythm,
  GitHubData,
  GitHubEvent,
  GitHubRepo,
  LanguageStat,
  WrappedStats,
} from '../types';
import { languageColor } from './languageColors';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 24 * 60 * 60 * 1000;

export function computeStats({ user, repos, events }: GitHubData): WrappedStats {
  const ownRepos = repos.filter((r) => !r.fork);
  const created = new Date(user.created_at);
  const languages = topLanguages(ownRepos, 5);
  const rhythm = activityRhythm(events);
  const days = activeDayNumbers(events);

  const stats: Omit<WrappedStats, 'archetype'> = {
    user,
    yearsOnGitHub: Math.max(0, Math.floor((Date.now() - created.getTime()) / (365.25 * DAY_MS))),
    joinedYear: created.getFullYear(),
    ownRepoCount: ownRepos.length,
    totalStars: sum(ownRepos.map((r) => r.stargazers_count)),
    totalForks: sum(ownRepos.map((r) => r.forks_count)),
    topRepo: mostStarred(ownRepos),
    languages,
    rhythm,
    longestStreak: longestStreak(days),
    activeDays: days.length,
    eventCounts: countEvents(events),
  };

  return { ...stats, archetype: getArchetype(stats) };
}

// ---------------------------------------------------------------------------

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

function mostStarred(repos: GitHubRepo[]): GitHubRepo | null {
  if (repos.length === 0) return null;
  return repos.reduce((best, r) => (r.stargazers_count > best.stargazers_count ? r : best));
}

/** Rank languages by how many of the user's own repos use them. */
export function topLanguages(repos: GitHubRepo[], limit: number): LanguageStat[] {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (!repo.language) continue;
    counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  const total = sum([...counts.values()]);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, repoCount]) => ({
      name,
      repoCount,
      percent: Math.round((repoCount / total) * 100),
      color: languageColor(name),
    }));
}

/** When does this person code? Bucket events by weekday and hour (viewer's local time). */
export function activityRhythm(events: GitHubEvent[]): ActivityRhythm | null {
  if (events.length === 0) return null;

  const byWeekday = Array<number>(7).fill(0);
  const byHour = Array<number>(24).fill(0);
  for (const e of events) {
    const d = new Date(e.created_at);
    byWeekday[d.getDay()]++;
    byHour[d.getHours()]++;
  }

  const peakHour = indexOfMax(byHour);
  return {
    byWeekday,
    byHour,
    busiestDay: WEEKDAYS[indexOfMax(byWeekday)],
    peakHour,
    timePersona: timePersona(peakHour),
  };
}

function indexOfMax(values: number[]): number {
  return values.reduce((best, v, i) => (v > values[best] ? i : best), 0);
}

function timePersona(hour: number): string {
  if (hour >= 5 && hour < 11) return 'Early Bird';
  if (hour >= 11 && hour < 17) return 'Daytime Grinder';
  if (hour >= 17 && hour < 22) return 'Evening Hacker';
  return 'Night Owl';
}

/** Unique local calendar days with activity, as sorted day numbers. */
function activeDayNumbers(events: GitHubEvent[]): number[] {
  const days = new Set<number>();
  for (const e of events) {
    const d = new Date(e.created_at);
    // Use local Y/M/D so "a day" matches the viewer's calendar, not UTC.
    days.add(Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS));
  }
  return [...days].sort((a, b) => a - b);
}

/** Longest run of consecutive day numbers, e.g. [1,2,3,7,8] → 3. */
export function longestStreak(sortedDays: number[]): number {
  let best = 0;
  let run = 0;
  for (let i = 0; i < sortedDays.length; i++) {
    run = i > 0 && sortedDays[i] === sortedDays[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
}

function countEvents(events: GitHubEvent[]): WrappedStats['eventCounts'] {
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    pushes: count('PushEvent'),
    pullRequests: count('PullRequestEvent'),
    issues: count('IssuesEvent'),
    starsGiven: count('WatchEvent'), // "WatchEvent" is GitHub's name for starring a repo
    total: events.length,
  };
}

/**
 * 🎯 YOUR TURN: make this more fun!
 *
 * This is the title shown big on the final share card, so it's the
 * part people will screenshot. Right now it's simple: "TypeScript Night Owl".
 * Ideas to try:
 *   - Special titles for big numbers ("Star Collector" if totalStars > 100)
 *   - A "Polyglot" title if languages.length >= 5
 *   - "Weekend Warrior" if busiestDay is Saturday or Sunday
 *   - Different wording for brand new accounts (yearsOnGitHub === 0)
 */
export function getArchetype(stats: Omit<WrappedStats, 'archetype'>): string {
  const lang = stats.languages[0]?.name ?? 'Code';
  const persona = stats.rhythm?.timePersona ?? 'Explorer';
  return `${lang} ${persona}`;
}
