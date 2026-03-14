# Quant Visualizer

Interactive mutual fund NAV (Net Asset Value) visualizer with rolling averages and CAGR analytics.

## What It Does

A full-stack web app for exploring historical mutual fund performance. Select a fund, adjust the date range and rolling window, and instantly see NAV trends charted alongside a rolling average — plus CAGR for the selected period.

- Fund selector populated from PostgreSQL
- Interactive date range slider (up to 10 years)
- Configurable rolling average window (7–180 days)
- CAGR analytics card
- Responsive line chart with custom tooltips
- Ghibli-inspired warm color theme with texture overlay
- URL-driven state via `nuqs` — shareable/bookmarkable views

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| ⚡ Framework | Next.js 15 (App Router, Turbopack, Server Components) |
| 🔷 Language | TypeScript 5 |
| 🗄️ Database | PostgreSQL via Prisma ORM 6 |
| 🎨 UI | Tailwind CSS 4, shadcn/ui (Radix primitives) |
| 📊 Charts | Recharts 2 |
| 🔗 URL State | nuqs 2 |
| ✅ Validation | Zod 3 |
| 🔤 Fonts | Lato + Merriweather (Google Fonts) |
| 🚀 Runtime | Bun (preferred) or Node.js 18+ |

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

2. Set up the database — copy `.env.example` to `.env` and fill in your connection string:

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL
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
app/              → Next.js App Router pages, layout, and global styles
  generated/      → Prisma generated client (auto-generated, do not edit)
components/
  custom/         → Fund selector, date slider, chart, analytics display
  ui/             → shadcn/ui primitives (card, select, slider, etc.)
lib/
  actions.ts      → Server actions (data fetching)
  calculations.ts → Rolling average + CAGR math
  db.ts           → Prisma client singleton
  parsers.ts      → nuqs URL state parsers
  types.ts        → Shared TypeScript interfaces
prisma/           → Schema and migrations
scripts/          → CSV import + DB test utilities
```

## Database Schema

Three normalized tables:

- **Category** — fund categories
- **Fund** — scheme code, name, linked to category
- **NavEntry** — daily NAV values, linked to fund (indexed by fund+date)

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server on port 3566 (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint |
| `bun run scripts/import-data.ts` | Import NAV data from CSV |
| `bun run scripts/test-database.ts` | Test database connectivity |

## ⚠️ Known Issues

- The CSV import script has a hardcoded relative path to the data file — adjust it or place your CSV at `../nav_data/combined_nav_data_*.csv`.
- Dark mode CSS variables are defined but commented out — dark theme is not active.
- No automated tests beyond the unit tests in `lib/calculations.test.ts`.

## License

No license specified.
