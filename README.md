# TutorHub

Operational dashboard for a **solo private tutor**: schedule, students, monthly invoices (grouped by parent), finance summary, and monthly progress reports. Built on the [TailAdmin](https://tailadmin.com) Next.js admin template, customized for this product.

**Product spec:** [`PRODUCT.md`](./PRODUCT.md)  
**What to build next:** [`ROADMAP.md`](./ROADMAP.md)  
**Contributor / AI conventions:** [`AGENTS.md`](./AGENTS.md)

---

## Current status (Phase 1 mock)

The app runs on **mock data** with **client-side persistence** (attendance, invoice status). **Postgres (Neon)** is Phase 2 — not required for local UI work.

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — today’s sessions, active students, collection summary |
| `/schedule` | Weekly schedule (FullCalendar, recurring sessions, mark absent) |
| `/students` | Student list |
| `/invoices` | Invoices per parent / month (derive-on-read, WhatsApp preview) |
| `/reports` | Monthly report status per student (draft placeholder) |
| `/finance` | Billed / collected / unpaid totals (billing month picker) |

- **Sign-in:** Google OAuth via Auth.js — only emails listed in `AUTH_ALLOWED_EMAILS` (two accounts). Unauthenticated visitors are redirected to `/signin`.
- User-facing copy is **English** (`en-US` dates); **Rp** amounts and **WhatsApp** invoice text stay Indonesian-style per product rules.
- Names, fees, and dates in `src/lib/mock-data.ts` are **fabricated placeholders**, not real customer data.

TailAdmin **demo routes** may still exist on disk; they are auth-gated like the rest of the admin shell.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Auth.js** (`next-auth` v5) — Google provider, allowlist
- **Tailwind CSS v4** (theme in `src/app/globals.css`)
- **next-intl** (locale `en`; English copy in `src/messages/en.json`)
- **FullCalendar v7** on Schedule
- **Prisma** schema prepared; target host **Neon Postgres** (Phase 2)
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
| `AUTH_ALLOWED_EMAILS` | Two comma-separated Google emails allowed to sign in |

Google **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google` (and your production URL on Vercel).

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should land on **Sign in** until Google auth succeeds.

### Optional: Neon (Phase 2)

See [ROADMAP.md — Phase 2](./ROADMAP.md#phase-2--data-layer). Set `DATABASE_URL` (pooled) and `DIRECT_URL` when you connect Prisma to Neon.

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
├── auth.ts                   # Auth.js config (Google + allowlist)
├── proxy.ts                  # Auth gate + next-intl (Next.js 16)
├── app/[locale]/(admin)/     # TutorHub pages
├── app/api/auth/[...nextauth]/
├── lib/mock-data.ts          # Mock until Phase 2
├── lib/invoices/             # Schedule derive, resolve display
├── lib/whatsapp/             # Combined parent monthly message
├── context/                  # Attendance, Invoice mock state
prisma/schema.prisma          # Target model (Neon)
```

---

## Roadmap summary

1. **Phase 1** — Mock workflow (attendance, invoices, WhatsApp, billing month) + **Google auth gate**  
2. **Phase 2** — **Neon**, seed, replace mock reads  
3. **Phase 3** — CRUD, persisted billing, reports when template exists  
4. **Phase 4** — Polish, demo cleanup, deploy  

Details: [`ROADMAP.md`](./ROADMAP.md).

---

## Based on TailAdmin

This repo started from [TailAdmin’s free Next.js dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard). TutorHub-specific code and docs are part of this project.
