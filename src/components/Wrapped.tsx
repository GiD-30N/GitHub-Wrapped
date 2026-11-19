import { useMemo, useState } from 'react';
import type { WrappedStats } from '../types';
import { Story, type Slide } from './Story';
import {
  IntroSlide,
  LanguagesSlide,
  ReposSlide,
  RhythmSlide,
  StreakSlide,
  SummarySlide,
  TenureSlide,
  TopRepoSlide,
} from './Slides';

interface Props {
  stats: WrappedStats;
  onRestart: () => void;
}

export function Wrapped({ stats, onRestart }: Props) {
  const [index, setIndex] = useState(0);

  // Only include slides we actually have data for.
  const slides = useMemo(() => {
    const list: (Slide | false)[] = [
      { id: 'intro', background: 'linear-gradient(160deg,#1f1147,#6d28d9 60%,#db2777)', content: <IntroSlide stats={stats} /> },
      { id: 'tenure', background: 'linear-gradient(160deg,#052e2b,#0f766e 55%,#84cc16)', content: <TenureSlide stats={stats} /> },
      { id: 'repos', background: 'linear-gradient(160deg,#111827,#1d4ed8 55%,#06b6d4)', content: <ReposSlide stats={stats} /> },
      stats.languages.length > 0 && {
        id: 'langs', background: 'linear-gradient(160deg,#0b0b0f,#1e1b4b 50%,#312e81)', content: <LanguagesSlide stats={stats} />,
      },
      !!stats.topRepo && stats.topRepo.stargazers_count > 0 && {
        id: 'top-repo', background: 'linear-gradient(160deg,#3b0a0a,#b91c1c 55%,#f59e0b)', content: <TopRepoSlide stats={stats} />,
      },
      !!stats.rhythm && {
        id: 'rhythm', background: 'linear-gradient(160deg,#020617,#0c4a6e 55%,#7c3aed)', content: <RhythmSlide stats={stats} />,
      },
      stats.longestStreak > 0 && {
        id: 'streak', background: 'linear-gradient(160deg,#1c0a00,#c2410c 55%,#facc15)', content: <StreakSlide stats={stats} />,
      },
      {
        id: 'summary',
        background: 'linear-gradient(160deg,#0a0a0a,#18181b 50%,#3f3f46)',
        content: <SummarySlide stats={stats} onReplay={() => setIndex(0)} onRestart={onRestart} />,
      },
    ];
    return list.filter((s): s is Slide => s !== false);
  }, [stats, onRestart]);

  return <Story slides={slides} index={index} onIndexChange={setIndex} />;
}
