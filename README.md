# GitHub Wrapped 🎁

A "Spotify Wrapped"-style recap for any GitHub user: top languages, stars, coding hours, streaks, and a shareable summary card.

Built with **React + TypeScript + Vite**, using the public GitHub REST API (no backend, no token).

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173 or link straight to a user: `/?u=octocat`.

## How it works

| File | What it does |
| --- | --- |
| `src/lib/github.ts` | Fetches user, repos and recent events. Handles 404 and rate-limit errors, and caches per username. |
| `src/lib/stats.ts` | Pure functions that turn raw API data into stats (languages, streak, peak hour...). |
| `src/components/Story.tsx` | Instagram-stories player: auto-advance, tap left/right, hold to pause, arrow keys. |
| `src/components/Slides.tsx` | One component per slide. |
| `src/components/Wrapped.tsx` | Picks which slides to show based on the data available. |
| `src/hooks/useCountUp.ts` | The animated number counter. |

## 🎯 Practice challenges

Work through these in order. Each one teaches something new.

1. **Make the archetype yours.** Rewrite `getArchetype()` in `src/lib/stats.ts` (instructions are in the comment).
2. **Pagination.** Users with more than 100 repos get undercounted. Follow the `Link` header to fetch every page in `github.ts`.
3. **Unit tests.** Add Vitest and test `longestStreak` and `topLanguages`. They're pure functions, so they're easy to test.
4. **Download the card as an image.** Use `html-to-image` to turn `.card` into a PNG people can attach to their post.
5. **New slide.** "Most active repo": the repo with the most events in `events`.
6. **Deploy it.** Push to GitHub and deploy on Vercel or Netlify. Then your share links work for everyone.
7. **Stretch:** add a GitHub token input (stored in `localStorage`) to lift the 60 requests/hour limit.

## Notes

- Activity stats (streak, peak hour) use GitHub's public events, which only cover roughly the last 90 days.
- Times are shown in the viewer's local timezone.
