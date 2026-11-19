import { useState, type FormEvent } from 'react';

interface Props {
  onSubmit: (username: string) => void;
  loading: boolean;
  error: string | null;
}

export function SearchForm({ onSubmit, loading, error }: Props) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const clean = username.trim().replace(/^@/, '');
    if (clean) onSubmit(clean);
  };

  return (
    <main className="landing">
      <p className="eyebrow">GitHub</p>
      <h1 className="landing-title">
        Wrapped<span className="dot">.</span>
      </h1>
      <p className="landing-sub">
        Your coding story: languages, streaks, stars and the hours you really code.
      </p>

      <form className="search" onSubmit={handleSubmit}>
        <span className="search-at">@</span>
        <input
          aria-label="GitHub username"
          placeholder="your-github-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          spellCheck={false}
          autoCapitalize="off"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !username.trim()}>
          {loading ? <span className="spinner" aria-label="Loading" /> : 'Unwrap →'}
        </button>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <p className="hint">
        Try{' '}
        <button className="link" type="button" onClick={() => onSubmit('torvalds')}>
          torvalds
        </button>{' '}
        or{' '}
        <button className="link" type="button" onClick={() => onSubmit('gaearon')}>
          gaearon
        </button>
      </p>
    </main>
  );
}
