import type { WrappedStats } from '../types';
import { useCountUp } from '../hooks/useCountUp';

type P = { stats: WrappedStats };

const fmt = (n: number) => n.toLocaleString();
const hourLabel = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`;

export function IntroSlide({ stats }: P) {
  const { user } = stats;
  return (
    <>
      <img className="avatar pop" src={user.avatar_url} alt="" />
      <p className="kicker rise d1">Hey {user.name?.split(' ')[0] ?? `@${user.login}`} 👋</p>
      <h2 className="headline rise d2">
        Let's unwrap your <em>GitHub</em>.
      </h2>
      <p className="muted rise d3">Tap to skip · hold to pause</p>
    </>
  );
}

export function TenureSlide({ stats }: P) {
  const years = useCountUp(stats.yearsOnGitHub, 1000);
  const label = stats.yearsOnGitHub === 1 ? 'year' : 'years';
  return (
    <>
      <p className="kicker rise d1">You joined GitHub in {stats.joinedYear}.</p>
      {stats.yearsOnGitHub > 0 ? (
        <>
          <p className="huge rise d2">{years}</p>
          <h2 className="headline rise d3">{label} of shipping code.</h2>
        </>
      ) : (
        <h2 className="headline rise d2">Fresh account. Everyone starts somewhere. 🌱</h2>
      )}
      <p className="muted rise d4">
        {fmt(stats.user.followers)} followers · following {fmt(stats.user.following)}
      </p>
    </>
  );
}

export function ReposSlide({ stats }: P) {
  const repos = useCountUp(stats.ownRepoCount);
  const stars = useCountUp(stats.totalStars);
  return (
    <>
      <p className="kicker rise d1">You built</p>
      <p className="huge rise d2">{fmt(repos)}</p>
      <h2 className="headline rise d2">repositories</h2>
      <p className="kicker rise d3">and collected</p>
      <p className="big rise d4">⭐ {fmt(stars)}</p>
      <p className="muted rise d4">stars along the way</p>
    </>
  );
}

export function LanguagesSlide({ stats }: P) {
  const [top] = stats.languages;
  return (
    <>
      <p className="kicker rise d1">Your top language was</p>
      <h2 className="headline rise d2" style={{ color: top.color }}>
        {top.name}
      </h2>
      <ul className="bars">
        {stats.languages.map((lang, i) => (
          <li key={lang.name} className={`rise d${Math.min(i + 2, 6)}`}>
            <span className="bar-label">{lang.name}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${lang.percent}%`, background: lang.color, animationDelay: `${0.4 + i * 0.12}s` }}
              />
            </span>
            <span className="bar-value">{lang.percent}%</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function TopRepoSlide({ stats }: P) {
  const repo = stats.topRepo!;
  const stars = useCountUp(repo.stargazers_count);
  return (
    <>
      <p className="kicker rise d1">Your crowd favourite</p>
      <h2 className="headline mono rise d2">{repo.name}</h2>
      {repo.description && <p className="muted rise d3 clamp">{repo.description}</p>}
      <p className="big rise d4">⭐ {fmt(stars)}</p>
      <p className="muted rise d5">
        {repo.language ?? 'Mixed'} · {fmt(repo.forks_count)} forks
      </p>
    </>
  );
}

export function RhythmSlide({ stats }: P) {
  const rhythm = stats.rhythm!;
  const max = Math.max(...rhythm.byHour, 1);
  return (
    <>
      <p className="kicker rise d1">Lately, you code most around</p>
      <p className="huge rise d2">{hourLabel(rhythm.peakHour)}</p>
      <div className="hours rise d3" aria-hidden>
        {rhythm.byHour.map((v, h) => (
          <span
            key={h}
            className={h === rhythm.peakHour ? 'peak' : ''}
            style={{ height: `${8 + (v / max) * 92}%`, animationDelay: `${0.5 + h * 0.025}s` }}
          />
        ))}
      </div>
      <h2 className="headline rise d4">
        You're {/^[aeiou]/i.test(rhythm.timePersona) ? 'an' : 'a'} <em>{rhythm.timePersona}</em>.
      </h2>
      <p className="muted rise d5">Busiest day: {rhythm.busiestDay}s</p>
    </>
  );
}

export function StreakSlide({ stats }: P) {
  const streak = useCountUp(stats.longestStreak, 1200);
  const { pushes, pullRequests, issues } = stats.eventCounts;
  return (
    <>
      <p className="kicker rise d1">Your longest recent streak</p>
      <p className="huge rise d2">🔥 {streak}</p>
      <h2 className="headline rise d3">{stats.longestStreak === 1 ? 'day' : 'days in a row'}</h2>
      <div className="chips rise d4">
        <span>{fmt(pushes)} pushes</span>
        <span>{fmt(pullRequests)} PRs</span>
        <span>{fmt(issues)} issues</span>
      </div>
      <p className="muted rise d5">Based on your last ~90 days of public activity</p>
    </>
  );
}

interface SummaryProps extends P {
  onReplay: () => void;
  onRestart: () => void;
}

export function SummarySlide({ stats, onReplay, onRestart }: SummaryProps) {
  const { user } = stats;
  const shareUrl = `${window.location.origin}${window.location.pathname}?u=${user.login}`;
  const tweet = [
    `My GitHub Wrapped: I'm ${/^[aeiou]/i.test(stats.archetype) ? 'an' : 'a'} ${stats.archetype} 🧑‍💻`,
    '',
    `⭐ ${fmt(stats.totalStars)} stars`,
    stats.languages[0] && `💬 Top language: ${stats.languages[0].name}`,
    stats.longestStreak > 0 && `🔥 ${stats.longestStreak}-day streak`,
    '',
    'Get yours 👇',
  ]
    .filter((line) => line !== false && line !== undefined)
    .join('\n');
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(shareUrl)}`;

  const cells: [string, string][] = [
    ['Stars', fmt(stats.totalStars)],
    ['Repos', fmt(stats.ownRepoCount)],
    ['Top language', stats.languages[0]?.name ?? '—'],
    ['Streak', `${stats.longestStreak}d`],
    ['Peak hour', stats.rhythm ? hourLabel(stats.rhythm.peakHour) : '—'],
    ['Followers', fmt(user.followers)],
  ];

  return (
    <>
      <div className="card pop">
        <div className="card-head">
          <img src={user.avatar_url} alt="" />
          <div>
            <strong>{user.name ?? user.login}</strong>
            <span>@{user.login}</span>
          </div>
        </div>
        <p className="card-title">{stats.archetype}</p>
        <dl className="grid">
          {cells.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="card-foot">GitHub Wrapped</p>
      </div>

      <div className="actions rise d3">
        <a className="btn primary" href={intent} target="_blank" rel="noreferrer">
          Share on 𝕏
        </a>
        <button className="btn" onClick={onReplay}>
          Replay
        </button>
        <button className="btn" onClick={onRestart}>
          Try another
        </button>
      </div>
    </>
  );
}
