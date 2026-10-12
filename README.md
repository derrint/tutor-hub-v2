# TutorHub

Operational dashboard for **private tutoring**: schedule, students, monthly invoices (grouped by parent), finance summary, and monthly progress reports. **Phase 5** adds multiple isolated **practices** (`Tutor` rows) on one deployment, with **Google** sign-in users (`User` rows) and an **admin** role to switch between practices.

Built on the [TailAdmin](https://tailadmin.com) Next.js admin template, customized for this product.

**Product spec:** [`PRODUCT.md`](./PRODUCT.md)  
**What to build next:** [`ROADMAP.md`](./ROADMAP.md)  
**Contributor / AI conventions:** [`AGENTS.md`](./AGENTS.md) (`TEACHER` sign-in role vs **`Tutor`** practice model)

---

## Current status (Phase 5)

The app runs on **Neon Postgres** with **server actions** for roster, schedule, invoices, reports, and platform admin. Data is scoped by **`tutorId`** (active practice). **`src/lib/mock-data.ts`** is **seed/fixtures only** — fictional demo data, not production records.

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — today’s sessions, active students, collection summary |
| `/schedule` | Weekly schedule (FullCalendar, recurring slots, mark absent) |
| `/students` | Student list + CRUD (empty state when none) |
| `/parents` | Parent list + CRUD (WhatsApp / invoice grouping) |
| `/invoices` | Invoices per parent / month, mark paid, WhatsApp preview |
| `/reports` | Monthly report editor + on-demand PDF download |
| `/finance` | Billed / collected / unpaid totals (billing month picker) |
| `/settings` | Bank details, account holder (WhatsApp + PDF signature) — active **`Tutor`** |
| `/select-tutor` | **Admin only** — pick which practice to open after sign-in |
| `/admin/tutors` | **Admin only** — create/edit **`Tutor`** (practice + billing fields) |
| `/admin/users` | **Admin only** — create/edit **`User`** (email, `TEACHER` \| `ADMIN`, link to practice) |

- **Sign-in:** Google OAuth via Auth.js — only emails with a **`User`** row in Postgres.
- **Roles:** **`TEACHER`** → fixed `tutorId`; **`ADMIN`** → cookie `tutor-hub-active-tutor-id` + header switcher.
- **PWA:** Web manifest + home-screen icons + iOS splash (`public/pwa/`, `src/app/manifest.ts`; regenerate splashes with `pnpm pwa:splash`) — installable on phone; no offline service worker. Cold start uses `BrandedLaunchScreen` for fast **core** bootstrap; billing loads in a second `Suspense`. Route `loading.tsx` skeletons under `src/app/[locale]/(admin)/`.
- User-facing copy is **English** (`en-US` dates); **Rp** amounts and **WhatsApp** invoice text stay Indonesian-style per product rules.
- **Billing month:** `?month=YYYY-MM` on Invoices, Reports, Finance.

TailAdmin **demo app routes** were removed; reusable UI lives under `src/components/`.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Auth.js** (`next-auth` v5) — Google provider, DB **`User`** gate
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
- Google OAuth credentials
- Postgres with migrations applied and at least one **`User`** row for your Google email

### Environment

Copy `.env.example` to `.env.local` (or `.env`) and set:

| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | Session encryption (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_CLIENT_SECRET` | Google Cloud OAuth client |
| `DATABASE_URL` | Neon **pooler** URL |
| `DIRECT_URL` | Neon **direct** URL (migrations) |

Sign-in is **not** controlled by env email lists — add rows in **`User`** (see below).

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
pnpm db:seed           # local only: wipe + seed fixtures (destructive)
pnpm db:reset          # reset DB and re-seed (destructive)
```

**Production / shared Neon:** prefer **`pnpm db:migrate:deploy`** and add users via **`/admin/users`** (as admin) or a SQL migration — **do not** run **`pnpm db:seed`** on branches with real data.

Bootstrap reference emails and tutor ids: `src/lib/auth/bootstrap-users.ts` (kept in sync with Phase 5 migrations).

After schema changes, restart `pnpm dev` so the Prisma client reloads (see `src/lib/db/prisma.ts` fingerprint).

**Sanity check (multi-tutor):**

```bash
pnpm verify:tutor-isolation
```

### Adding tutors and sign-in users

1. Sign in as **`ADMIN`** (must exist in **`User`** with `role = ADMIN`).
2. **`/admin/tutors`** — create a **`Tutor`** (display name, optional slug, billing fields).
3. **`/admin/users`** — create a **`User`** with the Google email, role **`TEACHER`**, and linked practice; or **`ADMIN`** with no practice.
4. That person can sign in with Google once the row exists.

Teachers always see their linked practice. Admins choose a practice at **`/select-tutor`** and can switch from the header dropdown.

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
├── auth.ts                   # Auth.js (Google + User JWT/session)
├── proxy.ts                  # Auth gate + next-intl (Next.js 16)
├── app/[locale]/(admin)/     # TutorHub pages (+ admin/tutors, admin/users)
├── app/actions/              # roster, schedule, admin-tutors, admin-users, tutor-context, …
├── lib/db/                   # Prisma, bootstrap, platform admin loaders
├── lib/tutor-context/        # getActiveTutorId, assert-tutor-scope
├── lib/platform-admin/       # /admin route helpers
├── lib/reports/              # contentJson schema + PDF template
├── lib/invoices/             # Session derive, paid snapshots
├── lib/whatsapp/             # Combined parent monthly message
├── context/                  # Client state hydrated from Postgres
prisma/schema.prisma          # Tutor, User (TEACHER|ADMIN), scoped models
prisma/migrations/            # Includes phase5_multi_tutor, user_role TEACHER, …
```

---

## Deploy (Vercel + Neon)

1. Create a **Vercel** project linked to this repo; framework preset **Next.js**.
2. Environment variables: `AUTH_SECRET`, Google OAuth, `DATABASE_URL` (Neon **pooler**), `DIRECT_URL` (Neon **direct**). See [`.env.example`](.env.example).
3. Google Cloud **Authorized redirect URI:** `https://YOUR_DOMAIN/api/auth/callback/google`.
4. On each release with schema changes, run **`pnpm db:migrate:deploy`** against production (CLI or CI). Fix **P3015** by ensuring every folder under `prisma/migrations/` contains a `migration.sql` (delete empty migration dirs).
5. Ensure at least one **`ADMIN`** **`User`** exists (migration bootstrap or manual SQL) before first deploy sign-in.
6. **`pnpm build`** must pass locally before shipping.
7. **Production:** **Mark unpaid** is hidden on invoice cards (`NODE_ENV=production`). Rapot PDF: **`GET /api/reports/pdf`** (session required; route checks `auth()` internally).

One Vercel app serves all practices; isolation is **`tutorId`** in the database and server guards, not separate deployments.

**Manual QA (phone-width ~375px):** Sign in as teacher → Dashboard → Schedule → absent → Invoices → Reports → Settings. As admin: **`/select-tutor`** → switch practice in header → spot-check roster differs → **`/admin/users`** create test user (optional).

---

## Roadmap summary

1. **Phase 1** — Mock workflow + Google auth *(done)*  
2. **Phase 2** — Neon, seed, Postgres-backed pages *(done)*  
3. **Phase 3** — CRUD, billing correctness, reports + PDF, settings *(done)*  
4. **Phase 4** — Mobile polish, demo route removal, overdue hint, deploy docs *(done)*  
5. **Phase 5** — Multi-practice, `User`/`Tutor`, admin switcher + provisioning UI *(core done; 5.6 cleanup optional)*  

Details: [`ROADMAP.md`](./ROADMAP.md).

---

## Based on TailAdmin

This repo started from [TailAdmin’s free Next.js dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard). TutorHub-specific code and docs are part of this project.
