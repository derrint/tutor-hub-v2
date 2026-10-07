# TutorHub

Operational dashboard for a **solo private tutor**: schedule, students, monthly invoices (grouped by parent), finance summary, and monthly progress reports. Built on the [TailAdmin](https://tailadmin.com) Next.js admin template, customized for this product.

**Product spec:** [`PRODUCT.md`](./PRODUCT.md)  
**What to build next:** [`ROADMAP.md`](./ROADMAP.md)  
**Contributor / AI conventions:** [`AGENTS.md`](./AGENTS.md)

---

## Current status (Phase 4 v1)

The app runs on **Neon Postgres** with **server actions** for roster, schedule, invoices, and reports. **`src/lib/mock-data.ts`** is used for **seed/fixtures only** — names, phone numbers, and bank details there are **fictional demo data**, not production records.

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — today’s sessions, active students, collection summary |
| `/schedule` | Weekly schedule (FullCalendar, recurring slots, mark absent) |
| `/students` | Student list + CRUD |
| `/parents` | Parent list + CRUD (WhatsApp / invoice grouping) |
| `/invoices` | Invoices per parent / month, mark paid, WhatsApp preview |
| `/reports` | Monthly report editor + on-demand PDF download |
| `/finance` | Billed / collected / unpaid totals (billing month picker) |
| `/settings` | **Settings** — bank details, account holder (WhatsApp + PDF signature) |

- **Sign-in:** Google OAuth via Auth.js — only emails in `AUTH_ALLOWED_EMAILS`.
- **PWA:** Web manifest + home-screen icons + iOS splash (`public/pwa/`, `src/app/manifest.ts`; regenerate splashes with `pnpm pwa:splash`) — installable on phone; no offline service worker. Cold start uses `BrandedLaunchScreen` while bootstrap loads; in-app route `loading.tsx` skeletons live under `src/app/[locale]/(admin)/`.
- User-facing copy is **English** (`en-US` dates); **Rp** amounts and **WhatsApp** invoice text stay Indonesian-style per product rules.
- **Billing month:** `?month=YYYY-MM` on Invoices, Reports, Finance.

TailAdmin **demo app routes** were removed; reusable UI lives under `src/components/`. Only TutorHub routes + sign-in remain in the App Router.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Auth.js** (`next-auth` v5) — Google provider, allowlist
- **Prisma** + **Neon PostgreSQL**
- **Tailwind CSS v4** (theme in `src/app/globals.css`)
- **next-intl** (locale `en`; copy in `src/messages/en.json`)
- **FullCalendar v7** on Schedule · **@react-pdf/renderer** for report PDFs
- **pnpm** 10.11.0

---

## Getting started

### Prerequisites

- Node.js **≥ 20.9**
- **pnpm** 10.11.0 — `corepack enable` if needed
- Google OAuth credentials and allowlisted emails for sign-in (see below)

### Environment

Copy `.env.example` to `.env.local` (or `.env`) and set:

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session encryption (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_CLIENT_SECRET` | Google Cloud OAuth client |
| `AUTH_ALLOWED_EMAILS` | Comma-separated Google emails allowed to sign in |
| `DATABASE_URL` | Neon **pooler** URL |
| `DIRECT_URL` | Neon **direct** URL (migrations) |

Google **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google` (and your production URL on deploy).

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should land on **Sign in** until Google auth succeeds.

### Database (Neon)

```bash
pnpm db:migrate        # local dev: create/apply migrations
pnpm db:migrate:deploy # production / CI: apply pending migrations only
pnpm db:seed           # seed from fixtures + generate sessions
pnpm db:reset          # reset DB and re-seed (destructive)
```

After schema changes, restart `pnpm dev` so the Prisma client reloads (see `src/lib/db/prisma.ts` fingerprint).

### Scripts

```bash
pnpm dev          # development server (Turbopack)
pnpm build        # prisma generate + production build
pnpm start        # run production build
pnpm lint         # ESLint
pnpm db:generate  # Prisma client only
```

---

## Project layout (TutorHub-relevant)

```
src/
├── auth.ts                   # Auth.js config (Google + allowlist)
├── proxy.ts                  # Auth gate + next-intl (Next.js 16)
├── app/[locale]/(admin)/     # TutorHub pages
├── app/api/auth/[...nextauth]/
├── app/api/reports/pdf/      # On-demand rapot PDF
├── app/actions/              # Server actions (roster, schedule, reports, profile, …)
├── lib/db/                   # Prisma client, admin bootstrap load
├── lib/reports/              # contentJson schema + PDF template
├── lib/invoices/             # Session derive, paid snapshots
├── lib/whatsapp/             # Combined parent monthly message
├── context/                  # Client state hydrated from Postgres
prisma/schema.prisma          # Postgres model (Neon)
prisma/seed.ts                # Seed + session generation
```

---

## Deploy (Vercel + Neon)

1. Create a **Vercel** project linked to this repo; framework preset **Next.js**.
2. Set environment variables (same as [`.env.example`](.env.example)): `AUTH_SECRET`, Google OAuth, `AUTH_ALLOWED_EMAILS`, `DATABASE_URL` (Neon **pooler**), `DIRECT_URL` (Neon **direct**).
3. Google Cloud **Authorized redirect URI:** `https://YOUR_DOMAIN/api/auth/callback/google`.
4. On each release that includes schema changes, run **`pnpm db:migrate:deploy`** against production (Vercel build hook, local CLI, or CI — not on every static deploy unless migrations pending).
5. **`pnpm build`** must pass locally before shipping.
6. **Production:** **Mark unpaid** is hidden on invoice cards (`NODE_ENV=production`). Rapot PDF download uses **`GET /api/reports/pdf`** (session required; auth middleware excludes `/api` — route checks `auth()` internally).

**Manual QA (phone-width ~375px):** Dashboard → Schedule (scroll time grid) → session absent → Invoices (stacked CTAs, overdue badge on past unpaid months) → Reports (Save / Download PDF) → user menu → Settings.

---

## Roadmap summary

1. **Phase 1** — Mock workflow + Google auth gate *(done)*  
2. **Phase 2** — Neon, seed, Postgres-backed pages *(done)*  
3. **Phase 3** — CRUD, billing correctness, reports + PDF, settings *(done)*  
4. **Phase 4** — Mobile polish, demo route removal, overdue hint, deploy docs *(done)*  

Details: [`ROADMAP.md`](./ROADMAP.md).

---

## Based on TailAdmin

This repo started from [TailAdmin’s free Next.js dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard). TutorHub-specific code and docs are part of this project.
