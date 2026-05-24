# CupCast

CupCast is a premium World Cup analytics MVP built on Next.js 15 App Router, React, TypeScript, Tailwind CSS, Recharts, Framer Motion, and Zustand.

It is intentionally database-free in Phase 1. The app now uses a pulled 2026 World Cup snapshot for the 48-team field and official schedule, then layers a local prediction engine and user overrides on top. The same service boundaries can later be swapped for PostgreSQL + Prisma or live sports APIs.

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Zustand

## Project Structure

```text
app/
components/
components/bracket/
components/charts/
components/ui/
data/
hooks/
lib/
lib/api/
lib/simulations/
lib/utils/
styles/
types/
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

4. Refresh the imported tournament snapshot later if you want to repull the schedule:

```bash
npm run sync:snapshot
```

## Available Pages

- `/` home dashboard
- `/matches` match slate
- `/matches/[matchId]` match detail view
- `/standings` group tables
- `/bracket` interactive knockout simulator
- `/predictions` tournament forecast lab

## Mock Data Files

- `data/teams.json`
- `data/matches.json`
- `data/groups.json`
- `data/events.json`
- `data/predictions.json`
- `data/knockout.json`

## Architecture Notes

- `scripts/sync-world-cup-snapshot.mjs` pulls the schedule snapshot once and materializes the JSON files used by the app.
- `lib/api/data-source.ts` is the clean handoff point between local snapshot files today and Prisma/live providers later.
- `lib/simulations/elo.ts` exposes the weighted match model and the per-match prediction breakdown used in the UI.
- `lib/simulations/groupStage.ts` simulates the actual 12-group tournament opening stage.
- `lib/simulations/bracket.ts` resolves best-third-place slots and advances the real 2026 knockout path.
- `lib/simulations/monteCarlo.ts` runs repeatable tournament simulations with adjustable model weights and manual winner overrides.
- API routes in `app/api/*` mirror the internal service layer so client fetching can be introduced later without changing domain logic.

## PostgreSQL + Prisma Upgrade Path

1. Add Prisma models for `Team`, `Match`, `MatchEvent`, `GroupStanding`, and `PredictionSnapshot`.
2. Replace the JSON import functions in `lib/api/data-source.ts` with Prisma queries.
3. Cache heavy simulation output in PostgreSQL or Redis once live schedules and user traffic arrive.
4. Persist bracket challenge entries, favorites, and notifications as user-scoped tables.

## Live Sports API Integration Suggestions

When you are ready to move past mock data:

1. Add provider adapters under `lib/api/providers/`.
2. Normalize live feeds into the existing TypeScript interfaces before they reach pages.
3. Ingest live events into the `MatchEvent` model and expose them through websockets or Server-Sent Events.
4. Cache raw feeds and derived simulations separately so expensive Monte Carlo runs are not repeated on every poll.
5. Introduce scheduled re-simulation jobs after lineups, goals, cards, or knockout confirmations.

## Future Optimization Ideas

- Stream critical dashboard sections independently with React suspense boundaries.
- Memoize simulation snapshots by standings state hash.
- Add edge caching for read-heavy API responses.
- Move client-side sim reruns into a web worker if iteration counts become much larger.
- Add image/logo CDN assets once official federation crest licensing is sorted.

## Deployment

This project is ready for Vercel or any Node-compatible platform.

```bash
npm run build
npm run start
```

Recommended production steps:

1. Deploy to Vercel for first-party Next.js support.
2. Add environment variables only when moving to live APIs or databases.
3. Keep the simulation engine server-side for canonical odds once multiplayer bracket pools are introduced.
