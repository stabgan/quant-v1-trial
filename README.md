# 📈 Quant Visualizer

Interactive mutual fund NAV (Net Asset Value) visualizer with rolling averages and CAGR analytics — built with Next.js 15, Prisma, and Recharts.

## 🧐 What It Does

A full-stack web app for exploring historical mutual fund performance. Select a fund, adjust the date range and rolling window, and instantly see NAV trends charted alongside a rolling average — plus a CAGR calculation for the selected period.

- Fund selector dropdown populated from PostgreSQL
- Interactive date range slider (up to 10 years of history)
- Configurable rolling average window (7–180 days)
- CAGR (Compound Annual Growth Rate) analytics card
- Responsive line chart with custom tooltips
- Ghibli-inspired warm color theme with texture overlay
- URL-driven state via `nuqs` — shareable and bookmarkable views

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ⚡ Framework | Next.js 15 (App Router, Turbopack, Server Components) |
| 🟦 Language | TypeScript 5 |
| 🗄️ Database | PostgreSQL via Prisma ORM 6 |
| 🎨 Styling | Tailwind CSS 4 + shadcn/ui (Radix primitives) |
| 📊 Charts | Recharts 2 |
| 🔗 URL State | nuqs 2 |
| ✅ Validation | Zod 3 |
| 🔤 Fonts | Lato + Merriweather (Google Fonts) |
| 🚀 Runtime | Bun (preferred) or Node.js 18+ |

---

## 📦 Dependencies

**Runtime**

| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router, SSR, Turbopack) |
| `react` / `react-dom` | UI library |
| `@prisma/client` | Database ORM client |
| `recharts` | Charting library |
| `nuqs` | Type-safe URL query state |
| `zod` | Schema validation (CSV import) |
| `date-fns` | Date utilities |
| `papaparse` | CSV parsing |
| `tailwind-merge` / `clsx` / `class-variance-authority` | Tailwind utility helpers |
| `@radix-ui/*` | Accessible UI primitives (select, slider, label) |
| `lucide-react` | Icon library |
| `tw-animate-css` | Tailwind animation utilities |

**Dev**

| Package | Purpose |
|---------|---------|
| `typescript` | Type checking |
| `tailwindcss` / `@tailwindcss/postcss` | CSS framework |
| `prisma` | Database migrations and schema management |
| `eslint` / `eslint-config-next` | Linting |
| `shadcn-ui` | Component generator CLI |

---

## 🏗️ Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- PostgreSQL instance
- NAV data CSV file for the import script

---

## 🚀 How to Run

1. **Clone and install**

```bash
git clone https://github.com/stabgan/quant-v1-trial.git
cd quant-v1-trial
bun install
```

2. **Configure environment** — copy the example and fill in your DB credentials:

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

3. **Run Prisma migrations and generate the client**

```bash
bunx prisma migrate deploy
bunx prisma generate
```

4. **Import NAV data** (expects a CSV at `../nav_data/combined_nav_data_*.csv` — adjust the path in `scripts/import-data.ts` if needed):

```bash
bun run scripts/import-data.ts
```

5. **Start the dev server**

```bash
bun run dev
```

App runs at [http://localhost:3566](http://localhost:3566).

---

## 📁 Project Structure

```
app/                → Next.js App Router pages and layout
components/
  custom/           → Fund selector, date slider, chart, analytics display
  ui/               → shadcn/ui primitives (card, select, slider, etc.)
lib/
  actions.ts        → Server actions (data fetching)
  calculations.ts   → Rolling average + CAGR math
  db.ts             → Prisma client singleton
  parsers.ts        → nuqs URL state parsers
  types.ts          → Shared TypeScript interfaces
  utils.ts          → Tailwind merge utility
prisma/             → Schema and migrations
scripts/            → CSV import + DB test utilities
```

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev server on port 3566 (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | ESLint |
| `bun run scripts/import-data.ts` | Import NAV data from CSV |
| `bun run scripts/test-database.ts` | Test database connectivity |

---

## ⚠️ Known Issues

- The CSV import script (`scripts/import-data.ts`) has a hardcoded relative path to the data file — adjust it or place your CSV accordingly.
- Dark mode CSS variables are commented out in `globals.css` — the dark theme is defined but not active.
- `bun.lock` is committed but `package-lock.json` is not — npm/yarn users should generate their own lockfile.
- The date range slider snaps to month boundaries (`startOfMonth` / `endOfMonth`), which may feel imprecise for short ranges.

---

## 📄 License

No license specified.
