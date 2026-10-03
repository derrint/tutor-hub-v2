# TutorHub

Operational dashboard for a **solo private tutor**: schedule, students, monthly invoices (grouped by parent), finance summary, and monthly progress reports. Built on the [TailAdmin](https://tailadmin.com) Next.js admin template, customized for this product.

**Product spec:** [`PRODUCT.md`](./PRODUCT.md)  
**What to build next:** [`ROADMAP.md`](./ROADMAP.md)  
**Contributor / AI conventions:** [`AGENTS.md`](./AGENTS.md)

---

## Current status (Milestone 0)

The app is a **working UI shell** with **mock data only** — no Postgres connection and no `PrismaClient` in pages.

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — today’s sessions, active students, collection summary |
| `/schedule` | Weekly schedule (FullCalendar, read-only recurring sessions) |
| `/students` | Student list |
| `/invoices` | Invoices per parent / month |
| `/reports` | Monthly report status per student (draft placeholder) |
| `/finance` | Billed / collected / unpaid totals |

- User-facing copy is **English** (`en-US` dates); **Rp** amounts and future **WhatsApp** invoice text stay Indonesian-style per product rules.
- **Add**, **Create invoice**, **Write draft**, etc. are visible but **not wired to persistence** yet.
- **WhatsApp `wa.me` links** are planned ([Phase 1](./ROADMAP.md#phase-1--mock-ux-that-matches-real-workflow)); not implemented in Milestone 0.
- Names, fees, and dates in `src/lib/mock-data.ts` are **fabricated placeholders**, not real customer data.

TailAdmin **demo routes** (ecommerce, UI element galleries, etc.) may still exist on disk; they are not part of TutorHub navigation.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** (theme in `src/app/globals.css`)
- **next-intl** (locale `en` in config; English product copy in `src/messages/en.json`)
- **Lucide** icons via `@/icons` (legacy TailAdmin names as aliases)
- **FullCalendar v7** on Schedule (read-only for TutorHub)
- **Prisma** schema + `prisma.config.ts` prepared; **database not required** to run the app today
- **pnpm** 10.11.0 (`packageManager` in `package.json`)

---

## Getting started

### Prerequisites

- Node.js **≥ 20.9**
- **pnpm** 10.11.0 — enable with `corepack enable` if needed

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The TutorHub sidebar lists the six product pages.

### Optional: database (later phases)

See [ROADMAP.md — Phase 2](./ROADMAP.md#phase-2--data-layer). Copy `.env.example` to `.env` and set `DATABASE_URL` when you provision Postgres — **not needed** for mock-only development.

### Scripts

```bash
pnpm dev      # development server (Turbopack)
pnpm build    # production build
pnpm start    # run production build
pnpm lint     # ESLint
```

---

## Project layout (TutorHub-relevant)

```
src/
├── app/[locale]/(admin)/     # TutorHub pages (dashboard + five feature routes)
├── components/               # Feature UI (dashboard, schedule, invoices, …)
├── lib/mock-data.ts          # Temporary data until Phase 2
├── layout/                   # AppSidebar, AppHeader
├── messages/en.json          # English UI strings (tutorHub.*)
├── utils/format.ts           # Rp, en-US dates, WhatsApp month names (id-ID)
prisma/schema.prisma          # Target data model (Profile, Student, Session, Invoice, …)
```

---

## Roadmap summary

1. **Phase 1** — WhatsApp message templates, attendance on mock, invoice preview  
2. **Phase 2** — Postgres, seed, replace mock reads  
3. **Phase 3** — CRUD, real invoice generation, reports (when Montessori template exists)  
4. **Phase 4** — Polish, demo cleanup, deploy  

Details and checklists: [`ROADMAP.md`](./ROADMAP.md).

---

## Based on TailAdmin

This repo started from [TailAdmin’s free Next.js dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard). The MIT license for the template portions applies where applicable; TutorHub-specific code and docs are part of this project.

For template changelog and upstream docs, see [tailadmin.com/docs](https://tailadmin.com/docs).
