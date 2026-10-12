# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

**TutorHub v2** is implemented on the **TailAdmin Pro / Next.js** admin shell (not the earlier shadcn prototype):

- **Next.js 16** App Router, **React 19**, **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **next-intl** — English user-facing copy (`en-US` dates); routing configured in `src/i18n/`
- **Lucide** (`lucide-react`) for icons; country flags remain custom SVGs
- **FullCalendar** for Schedule (recurring weekly slots + attendance)
- **Prisma** + **Neon PostgreSQL** — runtime data via **`src/lib/db/`** and server actions; **`src/lib/mock-data.ts`** is seed/fixtures only ([`ROADMAP.md`](./ROADMAP.md) Phase 2).

An earlier Google Stitch exploration was abandoned in favor of building directly in code.

## Users

**v1 (shipped):** Primary users are **private tutors** teaching Montessori-based material to young children (TK and SD). Each tutor manages schedule, billing, and progress reporting for their students’ parents.

**Phase 5 (shipped — [`ROADMAP.md`](./ROADMAP.md)):** One deployment hosts **multiple isolated practices**:

| Concept | Meaning |
|---------|---------|
| **`Tutor`** (DB model) | One practice / studio — all roster, schedule, invoices, and billing fields (`tutorId` on business rows). |
| **`User`** (DB model) | Google sign-in identity (`email` unique). |
| **`User.role = TEACHER`** | Person linked to exactly one **`Tutor`**; sees only that practice’s data. |
| **`User.role = ADMIN`** | Platform operator; picks **active tutor** via `/select-tutor` and the header switcher (HttpOnly cookie). |

Multiple **`User`** rows can share one **`Tutor`** (e.g. two teachers on the same practice). **Not** public self-service sign-up — admins provision **`Tutor`** and **`User`** rows (`/admin/tutors`, `/admin/users`) or migration SQL.

## Product Purpose

TutorHub replaces ad-hoc manual tracking (e.g. typing up WhatsApp messages by hand to compute monthly billing) with a lightweight operational dashboard for private tutoring: track which students are being taught, when sessions happen (including recurring weekly slots), which sessions were attended vs. absent (and therefore billable), generate monthly invoices grouped by parent with a per-child breakdown, and write monthly learning-progress reports per student. Success means the tutor can, in a few taps from her phone, mark attendance, generate an accurate invoice, and send it to a parent — without manually recalculating anything.

## Positioning

Operational tool for private tutor practice(s). **Phase 5** adds multiple isolated **`Tutor`** practices plus **admin** oversight on a **single** Vercel + Neon deployment. Still not a public multi-tenant SaaS product (no subscriptions, marketing site, or open registration). Scope stays narrow: WhatsApp invoice + rapot workflow, not generic school ERP.

## Operating Context

- The tutor works from a phone most of the time; the app must be comfortable to use one-handed during or between sessions (**mobile-first**, but also usable on desktop).
- **One WhatsApp per parent per month** combines **rapot** (PDF attached manually in WhatsApp) and **payment text** in a single message — not separate invoice-only and report-only sends. Canonical structure: time-of-day greeting + parent salutation → rapot intro (all children on that invoice) → per-child payment paragraph → fee/total → bank transfer block → closing. Implementation: `src/lib/whatsapp/` (`parentMonthlyWhatsAppTemplates` + `buildParentMonthlyWhatsAppMessage`).
- **Session dates in WhatsApp** use **sorted day-of-month list** after “yaitu tanggal:” (e.g. `2, 7, 9, 23, 29, 30`) — month is already in “selama bulan September ini”. On-screen invoice cards match (day list; month on card header). `formatInvoiceSessionDaysForMessage` remains available if a future template needs month repeated.
- **Template inputs (data, not hardcoded names):** **`Tutor`** billing fields (bank name, account number, holder); parent **salutation** (e.g. "Mama Adi dan Beni" for two siblings), **honorific** (e.g. "Ma", dot added in WhatsApp templates), **WhatsApp** digits for `wa.me`; per-child lines from invoice (`sessionCount`, `sessionDays`, fees); combined total. Greeting time (`Selamat pagi/siang/sore/malam`) is derived from send time.
- One parent can have multiple children enrolled (siblings), which is why invoices are grouped per parent rather than per child.
- Progress reports are monthly per student (Canva-style **MONTHLY REPORT** PDF: can do / still learning / goals on page 1; photos + notes + tutor signature on page 2). **Editing** is per student; **send** is per parent via the combined WhatsApp message on Invoices (rapot PDFs downloaded in-app, then attached manually in WhatsApp).
- Currency is Indonesian Rupiah (`Rp 1.500.000` with Indonesian-style grouping); UI copy and routes are English; **WhatsApp** invoice/report prefill remains Bahasa Indonesia. Code identifiers (variables, models, fields) stay in English.

## Current implementation (v1 + Phase 5)

Shipped in **tutor-hub-v2** (see [`ROADMAP.md`](./ROADMAP.md)):

- Core routes: Dashboard, Schedule, Students, **Parents**, Invoices, Reports, Finance, **Settings** (`/settings`) — English labels, **TutorHub** brand, admin sidebar (drawer below `xl`, docked sidebar from `xl` up).
- **Phase 5 admin:** `/admin/tutors`, `/admin/users` (create/edit practices and sign-in users); `/select-tutor` for admins after sign-in; header **tutor switcher** when viewing a practice.
- **Parents / Students:** CRUD via server actions; empty states when roster is empty; **INACTIVE** stops rules (`endDate`) and deletes future sessions; fee changes sync `Session.fee` in unpaid calendar months.
- **Schedule:** add/edit/remove weekly slots; mark absent per date on calendar; optimistic absent toggle.
- **Access:** **Auth.js** + **Google sign-in**; only emails with a **`User`** row in Postgres (`src/lib/auth/sign-in-gate.ts`).
- **Invoices:** auto-list per billing month; derive-on-read unpaid from materialized sessions (non-`ABSENT`); mark paid snapshots; **Mark unpaid** dev-only; **WhatsApp** preview + `wa.me`.
- **Billing month:** shared month picker + `?month=` on Invoices, Reports, Finance.
- **Finance / Dashboard:** totals from session-derived invoice previews (same as invoice cards).
- **Reports:** `MonthlyReport.contentJson` (v1: can do / still learning / goals / photos / notes); empty state when no active students; **Save** persists without clearing “PDF ready”; edits after export show **Re-download PDF** until exported again; **PDF on demand** (`/api/reports/pdf`, not stored); attach in WhatsApp manually.
- **Settings:** **`Tutor`** billing fields (bank, account holder, optional WhatsApp) at `/settings` — scoped to the active practice (teacher’s own practice or admin’s selected practice). Used in WhatsApp footers and rapot PDF signature name. Picker labels use `Tutor.displayName`.
- **Data:** **Neon Postgres**; `prisma/seed.ts` for **local dev only** (destructive wipe); production users/practices via migrate + admin UI; `mock-data.ts` for fixtures only.
- **Isolation:** Server actions and loaders scope by **`getActiveTutorId()`**; `pnpm verify:tutor-isolation` for partition checks.

## Capabilities and Constraints

Confirmed decisions (from product discussion):

- **Sign-in:** Google OAuth only. Access = pre-created **`User.email`** in the database (no env email allowlist in production path).
- **Roles:** **`TEACHER`** (one linked **`Tutor`**) vs **`ADMIN`** (switch active practice). Do not confuse **`User.role`** with the **`Tutor`** model name.
- **Recurring schedule**: weekly-repeating sessions are supported; edits/cancellations apply per individual occurrence only (no "this and following" / "all events" editing mode — deliberately simplified vs. Google Calendar).
- **Attendance & billing**: a session marked absent is excluded from that month's invoice total; this must be visually obvious (disabled/grey) wherever sessions are shown.
- **Student status**: `ACTIVE` / `INACTIVE`. Deactivating a student auto-stops their recurring schedule rule (sets an end date) and removes not-yet-occurred future sessions; past sessions remain untouched for billing/report history.
- **Invoice period**: calendar month (1st–end of month), not a custom date range.
- **Invoice status**: intentionally simple — `UNPAID` / `PAID` only. **Overdue** is a computed UI hint on unpaid invoices for past calendar months (not persisted).
- **WhatsApp**: v1 uses `wa.me` with **`buildParentMonthlyWhatsAppMessage`** (Indonesian template blocks in `src/lib/whatsapp/templates.ts`). PDF rapot is **not** attached by the app — tutor attaches in WhatsApp. No WhatsApp Business API.
- **Reports**: `DRAFT` / `PUBLISHED` per student per month (`PUBLISHED` = last successful PDF download). Send path is the **combined** parent message on Invoices, not a second WhatsApp button on Reports.

### Planned next (see ROADMAP)

- **Phase 5.6:** Remove deprecated allowlist helpers; minor doc/code cleanup.
- **Optional v1 backlog:** compact month list, report photo blob storage, datetime edge cases.
- **Still deferred:** public sign-up, multi-tenant SaaS billing, WhatsApp Business API, complex recurrence edit modes, persisted "overdue" status.

## Brand Commitments

Product name: **TutorHub** (confirmed). UI uses TailAdmin theme tokens: **brand** primary, **TK** → primary badge, **SD** → warning badge, status semantics (success / warning / dark) for paid, draft, absent/inactive, etc. Text wordmark in sidebar/header (no custom logo file required for v1).

## Evidence on Hand

- Real WhatsApp invoice message text provided by the user (see Operating Context) — the only real production content available; all other names, amounts, and schedules currently in the app (`src/lib/mock-data.ts`) are fabricated placeholders for development and must not be treated as real user/business data.
- Early Stitch screenshots informed page **shape** only; v2 UI follows TailAdmin layout and components.
- Monthly report **PDF layout** follows the tutor’s Canva reference (implemented in `src/lib/reports/pdf/`); copy is entered in the app per student per month.

## Product Principles

1. **Match the tutor's real workflow, not a generic SaaS.** Every feature (especially Invoices) should mirror what she already does manually (e.g. the WhatsApp invoice format), not introduce unfamiliar concepts.
2. **Mobile-first, single codebase.** One responsive app: collapsible sidebar / drawer on smaller viewports, denser layout on desktop — same routes and components, not separate mobile and desktop apps.
3. **Billing correctness by construction.** Absence and student deactivation must always exclude the right sessions from billing automatically; this is core trust, not a nice-to-have.
4. **Keep scope deliberately narrow.** Defer public sign-up, SaaS packaging, WhatsApp Business API, and complex recurring-edit modes until there's real evidence they're needed.
5. **English UI, Indonesian parent messaging.** Dashboard copy and routes in English; WhatsApp templates and Rp formatting follow her existing Bahasa invoice messages.

## Accessibility & Inclusion

No specific accessibility requirement beyond general mobile-friendliness was established (confirmed — nothing further to record).
