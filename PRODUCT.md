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
- **FullCalendar** for Schedule (read-only recurring schedule in the current milestone)
- **Prisma** + **PostgreSQL** — schema and `prisma.config.ts` are in repo; **runtime DB is Phase 2** ([`ROADMAP.md`](./ROADMAP.md)). Pages today read **`src/lib/mock-data.ts` only**.

An earlier Google Stitch exploration was abandoned in favor of building directly in code.

## Users

Single primary user: a private tutor (the user's wife) who teaches Montessori-based material to young children individually. Her students span two education levels — TK (kindergarten) and SD (elementary school). She personally manages her own schedule, billing, and progress reporting for each student's parent. There is no other staff; this is explicitly a single-tutor operation (confirmed — no multi-tutor/multi-user support planned).

## Product Purpose

TutorHub replaces ad-hoc manual tracking (e.g. typing up WhatsApp messages by hand to compute monthly billing) with a lightweight operational dashboard for a solo private tutor: track which students are being taught, when sessions happen (including recurring weekly slots), which sessions were attended vs. absent (and therefore billable), generate monthly invoices grouped by parent with a per-child breakdown, and write monthly learning-progress reports per student. Success means the tutor can, in a few taps from her phone, mark attendance, generate an accurate invoice, and send it to a parent — without manually recalculating anything.

## Positioning

Internal-only operational tool for one tutor's private practice — not intended to be sold or offered to other tutors (confirmed). It is not a general-purpose tutoring/school-management SaaS; scope is deliberately narrow to this single tutor's real workflow (confirmed by the real WhatsApp invoice message she currently sends manually, which the invoice feature directly replicates).

## Operating Context

- The tutor works from her phone most of the time; the app must be comfortable to use one-handed during or between sessions (**mobile-first**, but also usable on desktop).
- **One WhatsApp per parent per month** combines **rapot** (PDF attached manually in WhatsApp) and **payment text** in a single message — not separate invoice-only and report-only sends. Canonical structure: time-of-day greeting + parent salutation → rapot intro (all children on that invoice) → per-child payment paragraph → fee/total → bank transfer block → closing. Real example captured in product discussion (Askara & Arga / September); code lives in `src/lib/whatsapp/` (`parentMonthlyWhatsAppTemplates` + `buildParentMonthlyWhatsAppMessage`).
- **Session dates in WhatsApp** use **sorted day-of-month list** after “yaitu tanggal:” (e.g. `2, 7, 9, 23, 29, 30`) — month is already in “selama bulan September ini”. On-screen invoice cards match (day list; month on card header). `formatInvoiceSessionDaysForMessage` remains available if a future template needs month repeated.
- **Template inputs (data, not hardcoded names):** tutor `Profile` (bank name, account number, holder); parent **salutation** (e.g. "Mama Askara dan Arga"), **honorific** (e.g. "Ma", dot added in WhatsApp templates), **WhatsApp** digits for `wa.me`; per-child lines from invoice (`sessionCount`, `sessionDays`, fees); combined total. Greeting time (`Selamat pagi/siang/sore/malam`) is derived from send time.
- One parent can have multiple children enrolled (siblings), which is why invoices are grouped per parent rather than per child.
- Progress reports are monthly per student (Montessori-area structure pending real template). **Editing** is per student; **send** is per parent via the combined WhatsApp message on Invoices (rapot PDFs attached in WhatsApp after the app opens the prefill).
- Currency is Indonesian Rupiah (`Rp 1.500.000` with Indonesian-style grouping); UI copy and routes are English; **WhatsApp** invoice/report prefill remains Bahasa Indonesia. Code identifiers (variables, models, fields) stay in English.

## Current implementation (Phase 1 mock)

Shipped in **tutor-hub-v2** (see [`ROADMAP.md`](./ROADMAP.md)):

- Seven routes: Dashboard, Schedule, Students, **Parents**, Invoices, Reports, Finance — English labels, **TutorHub** brand, admin sidebar (drawer below `xl`, docked sidebar from `xl` up).
- **Parents / Students:** mock CRUD in `localStorage` (`RosterContext`); WhatsApp fields on parent; schedule still seed-based until Phase 2.
- **Access:** **Auth.js** + **Google sign-in**; only emails in `AUTH_ALLOWED_EMAILS` (two accounts). All dashboard routes require login before Vercel deploy.
- **Schedule:** read-only calendar with recurring mock sessions, attendance (absent) on dashboard + schedule; session detail modal.
- **Invoices:** auto-list per billing month; derive-on-read unpaid lines; mark paid (mock `localStorage`); **WhatsApp** preview + `wa.me` prefill.
- **Billing month:** shared month picker + `?month=` on Invoices, Reports, Finance.
- **Finance / Dashboard:** totals from resolved invoices; dashboard finance card uses calendar month.
- **Reports:** draft/published placeholders; editor waits on Montessori template.
- **Data:** mock file + client persistence (attendance, invoice status); **Neon Postgres** planned Phase 2 (`.env.example`).

## Capabilities and Constraints

Confirmed decisions (from product discussion):

- **Single-tutor operation** with **two allowed Google logins** (tutor + partner) — no public sign-up, no roles product.
- **Recurring schedule**: weekly-repeating sessions are supported; edits/cancellations apply per individual occurrence only (no "this and following" / "all events" editing mode — deliberately simplified vs. Google Calendar).
- **Attendance & billing**: a session marked absent is excluded from that month's invoice total; this must be visually obvious (disabled/grey) wherever sessions are shown.
- **Student status**: `ACTIVE` / `INACTIVE`. Deactivating a student auto-stops their recurring schedule rule (sets an end date) and removes not-yet-occurred future sessions; past sessions remain untouched for billing/report history.
- **Invoice period**: calendar month (1st–end of month), not a custom date range.
- **Invoice status**: intentionally simple — `UNPAID` / `PAID` only. No stored "overdue" status (may be computed/derived in the UI later, but not persisted).
- **WhatsApp**: v1 uses `wa.me` with **`buildParentMonthlyWhatsAppMessage`** (Indonesian template blocks in `src/lib/whatsapp/templates.ts`). PDF rapot is **not** attached by the app — tutor attaches in WhatsApp. No WhatsApp Business API.
- **Reports**: `DRAFT` / `PUBLISHED` per student per month; PDF/content editor pending Montessori template. Send path is the **combined** parent message on Invoices, not a second WhatsApp button on Reports.

### Planned next (see ROADMAP)

- **Phase 1:** WhatsApp templates, attendance on mock, invoice preview actions.
- **Phase 2:** Postgres, seed, replace mock data.
- **Phase 3:** CRUD, invoice generation from attended sessions, report editor when template exists.
- **Still deferred:** multi-tutor, WhatsApp Business API, complex recurrence edit modes, persisted "overdue" status.

## Brand Commitments

Product name: **TutorHub** (confirmed). UI uses TailAdmin theme tokens: **brand** primary, **TK** → primary badge, **SD** → warning badge, status semantics (success / warning / dark) for paid, draft, absent/inactive, etc. Text wordmark in sidebar/header (no custom logo file required for v1).

## Evidence on Hand

- Real WhatsApp invoice message text provided by the user (see Operating Context) — the only real production content available; all other names, amounts, and schedules currently in the app (`src/lib/mock-data.ts`) are fabricated placeholders for development and must not be treated as real user/business data.
- Early Stitch screenshots informed page **shape** only; v2 UI follows TailAdmin layout and components.
- No monthly report template exists yet; the tutor (user's wife) will provide her own format later.

## Product Principles

1. **Match the tutor's real workflow, not a generic SaaS.** Every feature (especially Invoices) should mirror what she already does manually (e.g. the WhatsApp invoice format), not introduce unfamiliar concepts.
2. **Mobile-first, single codebase.** One responsive app: collapsible sidebar / drawer on smaller viewports, denser layout on desktop — same routes and components, not separate mobile and desktop apps.
3. **Billing correctness by construction.** Absence and student deactivation must always exclude the right sessions from billing automatically; this is core trust, not a nice-to-have.
4. **Keep v1 deliberately narrow.** Defer multi-tutor support, complex recurring-edit modes, WhatsApp Business API, and "overdue" invoice tracking until there's real evidence they're needed.
5. **English UI, Indonesian parent messaging.** Dashboard copy and routes in English; WhatsApp templates and Rp formatting follow her existing Bahasa invoice messages.

## Accessibility & Inclusion

No specific accessibility requirement beyond general mobile-friendliness was established (confirmed — nothing further to record).
