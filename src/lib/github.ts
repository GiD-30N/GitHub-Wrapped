import type { GitHubData, GitHubEvent, GitHubRepo, GitHubUser } from '../types';

const API = 'https://api.github.com';

/** An error with a friendly, user-facing message. */
export class GitHubError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

async function getJSON<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
  } catch {
    throw new GitHubError("Couldn't reach GitHub. Check your connection.", 0);
  }

  if (res.ok) return res.json() as Promise<T>;

  if (res.status === 404) {
    throw new GitHubError("That user doesn't exist on GitHub.", 404);
  }
  // Unauthenticated requests are limited to 60/hour per IP.
  if (res.status === 403 || res.status === 429) {
    const reset = Number(res.headers.get('x-ratelimit-reset'));
    const when = reset
      ? `at ${new Date(reset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : 'in a bit';
    throw new GitHubError(`GitHub's hourly rate limit was hit. Try again ${when}.`, res.status);
  }
  throw new GitHubError(`GitHub returned an error (${res.status}).`, res.status);
}

/** Public events cover roughly the last 90 days, max 300 events, 100 per page. */
async function fetchEvents(login: string): Promise<GitHubEvent[]> {
  const all: GitHubEvent[] = [];
  for (let page = 1; page <= 3; page++) {
    const batch = await getJSON<GitHubEvent[]>(
      `/users/${login}/events/public?per_page=100&page=${page}`,
    );
    all.push(...batch);
    if (batch.length < 100) break; // no more pages
  }
  return all;
}

// Cache per username so "replay" or re-searching doesn't burn rate limit.
const cache = new Map<string, Promise<GitHubData>>();

export function fetchGitHubData(username: string): Promise<GitHubData> {
  const login = encodeURIComponent(username.trim().toLowerCase());
  const cached = cache.get(login);
  if (cached) return cached;

  const request = (async () => {
    // Fetch the user first: if they don't exist we fail fast with 1 request.
    const user = await getJSON<GitHubUser>(`/users/${login}`);
    const [repos, events] = await Promise.all([
      getJSON<GitHubRepo[]>(`/users/${login}/repos?per_page=100&sort=pushed&type=owner`),
      fetchEvents(login),
    ]);
    return { user, repos, events };
  })();

  cache.set(login, request);
  request.catch(() => cache.delete(login)); // don't cache failures
  return request;
}
