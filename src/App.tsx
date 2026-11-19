import { useCallback, useEffect, useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { Wrapped } from './components/Wrapped';
import { fetchGitHubData, GitHubError } from './lib/github';
import { computeStats } from './lib/stats';
import type { WrappedStats } from './types';

type State =
  | { status: 'idle'; error: string | null }
  | { status: 'loading' }
  | { status: 'ready'; stats: WrappedStats };

function usernameFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('u');
}

export default function App() {
  const [state, setState] = useState<State>({ status: 'idle', error: null });

  const load = useCallback(async (username: string, updateUrl = true) => {
    setState({ status: 'loading' });
    try {
      const data = await fetchGitHubData(username);
      setState({ status: 'ready', stats: computeStats(data) });
      // Put the username in the URL so the page is shareable: /?u=octocat
      if (updateUrl) window.history.pushState(null, '', `?u=${data.user.login}`);
    } catch (err) {
      const message = err instanceof GitHubError ? err.message : 'Something went wrong. Please try again.';
      setState({ status: 'idle', error: message });
    }
  }, []);

  const restart = useCallback(() => {
    window.history.pushState(null, '', window.location.pathname);
    setState({ status: 'idle', error: null });
  }, []);

  // Load from ?u= on first visit, and follow browser back/forward.
  useEffect(() => {
    const sync = () => {
      const u = usernameFromUrl();
      if (u) load(u, false);
      else setState({ status: 'idle', error: null });
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [load]);

  return (
    <div className="app">
      {state.status === 'ready' ? (
        <Wrapped key={state.stats.user.login} stats={state.stats} onRestart={restart} />
      ) : (
        <SearchForm
          onSubmit={load}
          loading={state.status === 'loading'}
          error={state.status === 'idle' ? state.error : null}
        />
      )}
    </div>
  );
}
