# Quant Visualizer

Interactive mutual fund NAV (Net Asset Value) visualizer with rolling averages and CAGR analytics.

## What It Does

A full-stack web app that lets you explore historical mutual fund performance data. Select a fund, adjust the date range and rolling window, and instantly see NAV trends charted alongside a rolling average — plus a CAGR calculation for the selected period.

Key features:

- Fund selector dropdown populated from a PostgreSQL database
- Interactive date range slider (up to 10 years of history)
- Configurable rolling average window (7–180 days)
- CAGR (Compound Annual Growth Rate) analytics card
- Responsive line chart with custom tooltips
- Ghibli-inspired warm color theme with texture overlay
- URL-driven state via `nuqs` — shareable/bookmarkable views

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack, Server Components) |
| Language | TypeScript 5 |
| Database | PostgreSQL via Prisma ORM 6 |
| UI | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| Charts | Recharts 2 |
| URL State | nuqs 2 |
| Validation | Zod 3 |
| Fonts | Lato + Merriweather (Google Fonts) |
| Runtime | Bun (preferred) or Node.js |

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js 18+)
- PostgreSQL instance
- NAV data CSV file for the import script

## Getting Started

1. Clone and install:

```bash
git clone https://github.com/stabgan/quant-v1-trial.git
cd quant-v1-trial
bun install
```

2. Set up the database — create a `.env` file:

```
DATABASE_URL="postgresql://user:password@localhost:5432/quant_db"
```

3. Run Prisma migrations:

```bash
bunx prisma migrate deploy
bunx prisma generate
```

4. Import NAV data (expects a CSV at `../nav_data/combined_nav_data_*.csv`):

```bash
bun run scripts/import-data.ts
```

5. Start the dev server:

```bash
bun run dev
```

App runs at [http://localhost:3566](http://localhost:3566).

## Project Structure

```
app/            → Next.js App Router pages and layout
components/
  custom/       → Fund selector, date slider, chart, analytics display
  ui/           → shadcn/ui primitives (card, select, slider, etc.)
lib/
  actions.ts    → Server actions (data fetching)
  calculations.ts → Rolling average + CAGR math
  db.ts         → Prisma client singleton
  parsers.ts    → nuqs URL state parsers
  types.ts      → Shared TypeScript interfaces
prisma/         → Schema and migrations
scripts/        → CSV import + DB test utilities
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server on port 3566 (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint |

## Known Issues

- The CSV import script (`scripts/import-data.ts`) has a hardcoded relative path to the data file — you'll need to adjust it or place your CSV accordingly.
- Dark mode CSS variables are commented out in `globals.css` — dark theme is defined but not active.
- The `@prisma/client` is listed under `devDependencies` instead of `dependencies`, which will break production builds that don't install dev deps.
- `bun.lock` is committed but `package-lock.json` is not — mixing package managers may cause issues for npm/yarn users.
- No `.env.example` is provided, so the required `DATABASE_URL` variable isn't documented in the repo itself.
- The `searchParams` prop in `app/page.tsx` is awaited (`await searchParams`) which is the Next.js 15 pattern, but the type annotation doesn't reflect it being a Promise.

## License

No license specified.
