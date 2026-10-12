# TutorHub — Roadmap

Living plan for **tutor-hub-v2** (TailAdmin Next.js shell). Product rules and constraints live in [`PRODUCT.md`](./PRODUCT.md). Setup and current status: [`README.md`](./README.md). Check items off as they ship.

---

## Milestone 0 — UI shell (done)

- [x] pnpm, Prisma **schema** + `prisma.config.ts` (no runtime DB)
- [x] Mock data in `src/lib/mock-data.ts` (fabricated placeholders only)
- [x] Six pages: Dashboard, Schedule, Students, Invoices, Reports, Finance
- [x] English UI copy, TutorHub nav, shared formatters (`src/utils/format.ts`)
- [x] Schedule: read-only FullCalendar, recurring sessions, detail modal, view dropdown (Year / Month / Week / Day)
- [x] Invoices: parent cards, `period` + `sessionDays`, invoice line layout
- [x] Create/edit actions present but **non-persistent** (no server actions / API yet)
- [x] **No** `wa.me` links in this milestone (by design)

---

## Phase 1 — Mock UX that matches real workflow

Goal: validate flows on **mock data** before Postgres. Still no `PrismaClient` in pages unless you explicitly choose to prototype server-side.

### WhatsApp — combined rapot + invoice (per parent)

- [x] Tutor **Profile** mock (`TUTOR_PROFILE`) + **Parent** mock (`PARENTS`: salutation, honorific, WhatsApp digits)
- [x] **Template blocks as data** — `src/lib/whatsapp/templates.ts` (greeting, rapot intro, per-child payment, fee/total, bank, closing)
- [x] **`buildParentMonthlyWhatsAppMessage`** — day list after “yaitu tanggal:” (`formatInvoiceSessionDays`), uniform vs mixed fees
- [x] **Invoices:** WhatsApp button → `wa.me` prefill; UI hint to attach rapot PDFs manually
- [x] Preview modal before WhatsApp + copy message to clipboard
- [x] Replace placeholder parent WhatsApp numbers with real values (`PARENTS` in mock; settings UI in Phase 3)

### Attendance (trust path)

- [x] Mark **absent** per session on Dashboard (today) and Schedule (session modal); default = billable (no “mark attended”)
- [x] **Visual distinction:** absent sessions dimmed + badge; stored in `localStorage` via `AttendanceContext`
- [x] Absent sessions **excluded** from unpaid invoice lines and WhatsApp (`resolveInvoiceForDisplay` / schedule derive)
- [x] Schedule **calendar** chips match dashboard (absent = dimmed / strikethrough)

### Invoice actions (still mock)

- [x] **Auto-list by month** — one card per parent with scheduled sessions (no **Create invoice** button; virtual shells + seed/`localStorage`)
- [x] **Unpaid derive-on-read** — lines from schedule + attendance live (`resolveInvoiceForDisplay`); per-card Regenerate removed
- [x] Mark invoice **paid / unpaid** in UI (mock toggle, `localStorage`)

**Exit criteria:** Tutor can tap through mark attendance → see invoice update → open WhatsApp with combined rapot+payment text, all without a database.

### Billing month navigation (Invoices · Reports · Finance)

*(Shipped in Phase 1 — keep `?month=` contract when moving to Postgres.)*

Goal: one **billing month** mental model — tutor thinks in calendar months, not an infinite mixed list.

- [x] Shared **billing period** — `useBillingPeriod` + URL `?month=YYYY-MM` + `sessionStorage` when switching sidebar routes (`src/lib/billing-period.ts`, `src/hooks/useBillingPeriod.ts`)
- [x] **Month control:** default calendar month; prev/next + `<input type="month">` (`BillingMonthNavigator`)
- [x] **Invoices:** filter by month; count · unpaid summary; cards appear when schedule has sessions
- [x] **Finance:** totals for selected month; unpaid link preserves `?month=`
- [x] **Reports:** header uses selected month (student list still mock until template)
- [x] **Dashboard:** finance card uses **calendar month** only (not billing URL)

**Edge cases (design once; ship with the month picker):**

- [x] **Empty month** — empty state when no scheduled sessions in month
- [x] **Future month** — preview copy; card actions disabled
- [x] **Paid invoice snapshot (mock)** — lines snapshotted on **Mark paid**; **Mark unpaid** clears snapshot; no per-card Regenerate
- [x] **Paid months (prod lock)** — hide **Mark unpaid** when `NODE_ENV=production` (deploy)
- [x] **Attendance keys** — date-scoped; finance/invoices filter by selected `period`

### Access control (deploy gate)

- [x] **Auth.js** (NextAuth v5) — Google OAuth, email allowlist (`AUTH_ALLOWED_EMAILS`, two accounts)
- [x] **`src/proxy.ts`** — unauthenticated users → `/signin`; `/signup` disabled; API auth excluded from matcher
- [x] TutorHub sign-in UI + header **Sign out** (session from Google profile)

Configure before Vercel deploy: `AUTH_SECRET`, Google OAuth client, redirect URI `…/api/auth/callback/google`. See `.env.example`.

### Roster (pre–Phase 2 mock CRUD)

- [x] **Parents** page — salutation, honorific, WhatsApp (`RosterContext` + `localStorage`; aligns with `prisma` `Parent`)
- [x] **Students** — add / edit (parent picker); list reads live roster
- [x] Seed parents **p1–p5** for all mock students; invoice/WhatsApp use roster parent records

### Schedule (pre–Phase 2 mock CRUD)

- [x] **Recurring weekly slots** — `ScheduleContext` + `localStorage` (`SEED_RECURRING_SESSIONS`); calendar reads live rules
- [x] **Add slot** — header button + Week/Day empty-slot select with prefilled time
- [x] **Remove weekly slot** — session detail modal + confirm (hard delete rule; per-date cancel still Phase 3)
- [x] **Invoices** — `listParentIdsWithScheduledSessions` / derive-on-read use persisted schedule (not static mock only)

### Phase 1 — still open

- [x] Real parent **WhatsApp** numbers in mock (see WhatsApp section above)
- [x] **Exit criteria** validated on device (September 2026 + billing month picker; attendance → invoice → WhatsApp)
- [x] **Paid months (prod lock)** — **Mark unpaid** hidden on production builds (see edge case above)

---

## Phase 2 — Data layer

Goal: replace mock reads with real data on **Neon Postgres** (single-tutor; auth gate already in Phase 1).

- [x] Provision **Neon** project; `DATABASE_URL` (pooled) + `DIRECT_URL` in `.env` / Vercel (see `.env.example`)
- [x] `prisma migrate`, seed script aligned with current mock shapes
- [x] Server-side data access (Server Components / server actions / small `lib/db` module — pick one pattern and stay consistent)
- [x] **Session generation** from `ScheduleRule` (weekly recurrence)
- [x] **Fee snapshot** on `Session` at creation; link billable sessions to `InvoiceItem` per schema
- [x] Swap the six TutorHub pages from `mock-data.ts` imports to DB queries
- [x] Query invoices / reports / finance **by billing month** (same `?month=` contract as Phase 1 navigation)
- [x] Keep fabricated names in **seed only**; do not commit secrets

**Exit criteria:** App runs against Postgres locally; mock file unused for main routes (or kept for tests/fixtures only).

---

## Phase 3 — v1 CRUD & billing correctness

Goal: persistent operations the tutor actually needs. Per [`PRODUCT.md`](./PRODUCT.md) constraints.

### Murid & jadwal

- [x] CRUD **Student** + **Parent** (siblings → one invoice per parent)
- [x] **ACTIVE / INACTIVE:** deactivating stops future recurrence (rule end date), drops future sessions, keeps history
- [x] **ScheduleRule:** add/edit weekly slot; per-date **mark absent** for billing (no “this and following”)

### Tagihan & keuangan

- [x] **Generate invoice** for calendar month from non-`ABSENT` sessions (`ABSENT` excluded) — derive-on-read + mark paid snapshot
- [x] One invoice per parent per month; line per child; persist `UNPAID` / `PAID` only
- [x] Keuangan totals derived from invoice status (session-derived previews; not mock schedule re-derive)

### Laporan

- [x] Wait for **Montessori report template** from the tutor before locking UI fields
- [x] Draft editor → `contentJson` v1 (can do / still learning / goals / photos / notes) + `DRAFT` / `PUBLISHED`
- [x] **PDF export** (approach B — `@react-pdf/renderer`, on-demand `/api/reports/pdf`; attach in WhatsApp from Invoices)
- [x] **Settings** (`/settings`) — bank + account holder for WhatsApp and PDF signature; save keeps `PUBLISHED` report status, **Re-download PDF** when content changed after last export

**Exit criteria:** End-to-end month: teach → mark attendance → invoice → WhatsApp → mark paid; reports save → download PDF → attach in WhatsApp.

**Phase 3 complete** — next: **Phase 4**.

---

## Phase 4 — Polish & scope control

- [x] Mobile pass: one-handed use, calendar time-grid height, sidebar drawer aligned to `xl` (1280px), stacked invoice/report modal CTAs
- [x] Remove unused **TailAdmin demo** app routes (`(ui-elements)`, `(others-pages)` demos); keep shared components
- [x] **Overdue** as computed UI hint on unpaid past calendar months (never persist `OVERDUE`)
- [x] Update `PRODUCT.md` / `README.md` to match shipped reality
- [x] Deploy target: **Vercel + Neon** documented in README (env, migrate deploy, OAuth redirect)

**Exit criteria:** Demo URLs (e.g. `/buttons`) 404; tutor flows usable at ~375px width; past-month unpaid shows **Overdue** badge; `pnpm build` passes; deploy checklist in README.

**Phase 4 complete.**

---

## Phase 5 — Multi-tutor platform (v2)

**Status:** Not started — design + migration plan below. v1 (Phases 0–4) stays the **solo-tutor** shipped baseline.

**Goal:** Multiple tutors, each with isolated schedule · roster · invoices · finance · reports · settings. Every tutor signs in with **Google** (Auth.js). One **admin** account can **select which tutor’s data** to view and operate on (server-enforced context, not UI-only).

**Naming (Phase 5):** Prisma model **`Tutor`** = one tutor’s practice (studio). FK **`tutorId`** on all business rows. Do not use `Tenant` / `TutorWorkspace` in schema or code.

**Non-goals for Phase 5** (still deferred — see bottom of doc):

- Public self-service sign-up / open registration
- Selling TutorHub as multi-tenant SaaS (billing, onboarding flows, marketing site)
- WhatsApp Business API
- Per-tutor custom domains

### Product rules

- **`Tutor`** (record) = one tutor’s practice (studio). All business data is scoped with **`tutorId`**.
- **`User` with role `TUTOR`** — Google account linked to exactly one **`Tutor`**; sees only that practice’s data.
- **`User` with role `ADMIN`** — after sign-in, picks **active tutor** from a list; all pages and actions run in that **`Tutor`** until switched.
- **Impersonation** is **context switch** (`activeTutorId` in session), with optional audit log — not shared passwords.
- Existing v1 behavior (WIB “today”, billing month, absent → exclude from invoice, paid snapshots) **unchanged per `Tutor`**.

### 5.1 — Data model & migration

- [x] Introduce **`Tutor`** — e.g. `id`, `displayName` / studio label, `slug?`, timestamps.
- [x] Introduce **`User`** — `email` (unique, from Google), `role` (`TUTOR` | `ADMIN`), optional `tutorId` (required for `TUTOR` role, null for `ADMIN`).
- [ ] Auth.js **`Account` / session** — link OAuth to `User` row (Prisma adapter or custom callback) — **deferred to 5.3**.
- [x] Add **`tutorId`** to tutor-owned models: `Profile`, `Parent`, `Student`, `Session`, `Invoice`, `MonthlyReport`, … (`ScheduleRule` scoped via `Student`).
- [x] Replace global uniques with **composite uniques per `tutorId`** where needed (`Invoice`, `MonthlyReport`, `Profile`).
- [x] **Migration script** (`20261012100000_phase5_multi_tutor`): attach **all existing rows** to **`tutor_1`** (UPDATE only — no deletes); insert bootstrap **`User`** rows.
- [x] Update `prisma/schema.prisma` header comment (no longer single-tutor-only).

**Dev Neon bootstrap (migration + env)**

| Email | Role | Tutor |
|-------|------|--------|
| `anasandin87@gmail.com` | TUTOR | `tutor_1` (inherits all pre-migration data) |
| `rint.cold@gmail.com` | TUTOR | `tutor_2` (empty practice + empty profile shell) |
| `lorensioderrint@gmail.com` | ADMIN | — (interim: app scopes to `tutor_1` until 5.4 picker) |

Constants: `src/lib/auth/bootstrap-users.ts`. Sign-in requires matching **`User`** rows (Phase 5.3).

**Operational notes**

- **Do not run `pnpm db:seed`** on a Neon branch that holds real data — seed wipes tables.
- **Do run** `pnpm db:migrate:deploy` (or `db:migrate`) once against the dev branch after pulling Phase 5.1.
- **`resolveTutorIdForRequest()`** wires main loaders/actions; full audit remains **5.2**.

**Exit criteria:** Schema migrates on Neon; seed creates ≥2 **`Tutor`** rows in dev; primary code paths filter by `tutorId`.

### 5.2 — Server tutor context & query scoping

- [x] **`getActiveTutorId()`** — TUTOR → own `tutorId`; ADMIN → HttpOnly cookie `tutor-hub-active-tutor-id` (validated), else `tutor_1`.
- [x] **`setActiveTutorIdAction`** / **`clearActiveTutorCookieAction`** — admin cookie + sign-out clears context (picker UI in 5.4).
- [x] **`assert*InTutor` guards** — roster, schedule, attendance, invoices, reports; PDF route scopes by active tutor.
- [x] **`loadAdminBootstrapCore` / billing** — scoped bootstrap + **`tutorContext`** (active id, role, admin tutor catalog).
- [x] **Attendance / absent** — occurrence keys unchanged; session updates include `tutorId`.
- [x] **`pnpm verify:tutor-isolation`** — DB partition sanity script (`scripts/verify-tutor-isolation.ts`).

**Exit criteria:** Solo tutor deploy works as today with one **`Tutor`**; second tutor’s data never appears in the first tutor’s UI.

### 5.3 — Auth & onboarding

- [x] Replace **`AUTH_ALLOWED_EMAILS`** with DB **`User`** gate (`isEmailInvitedForSignIn` in Auth.js `signIn`).
- [x] **Tutor role:** Google sign-in for email with pre-created **`User`** + **`Tutor`** (JWT/session carries `role`, `tutorId`).
- [x] **Admin role:** sign-in clears active-tutor cookie → **`/select-tutor`** until a practice is chosen.
- [x] Admin **switches tutor** via cookie (`setActiveTutorIdAction`); session carries identity, not active tutor.
- [x] Sign-out clears active tutor cookie (`clearActiveTutorCookieAction`).

**Exit criteria:** Two Google accounts → two isolated **`Tutor`** practices; admin account → picker → sees chosen tutor’s dashboard.

### 5.4 — Admin UI

- [ ] **Tutor switcher** in header (admin only) — list **`Tutor`** records, search/filter if many.
- [ ] Visual badge: “Viewing: {studio name}” so admin never confuses context.
- [ ] Optional: **`/admin/tutors`** — create **`Tutor`** + invite email (manual admin ops; no public signup).

**Exit criteria:** Admin can switch tutor without reload bugs; finance/schedule/invoices match selected **`Tutor`**.

### 5.5 — Docs, env, deploy

- [ ] Update **`PRODUCT.md`** — users, positioning, access model.
- [ ] Update **`README.md`** — seed admin + tutors, env vars (if any).
- [ ] **`.env.example`** — document admin bootstrap emails vs tutor users.
- [ ] Vercel: same app; single deployment for all tutors.

**Phase 5 exit criteria (overall):** Multiple tutors use one deployment; each sees only their practice; admin can switch context securely; v1 solo tutor data migrated; `pnpm build` passes; no cross-tutor data leak in spot-check audit.

### Technical notes (for implementers)

| Topic | Direction |
|-------|-----------|
| Auth | Keep **Auth.js + Google**; add `User` / role in DB |
| Allowlist | Transitional: env allowlist → auto-provision `User` on first login, then remove env |
| Profile | One **`Profile` per `Tutor`** (not single-row) |
| Bootstrap | Pass `tutorId` into all loaders; admin loads tutor catalog once |
| WIB / billing | No change to `tutor-calendar` / `?month=` — scope queries by `tutorId` |
| Quick ref (future) | `src/lib/tutor-context/` (active tutor + guards), extend `src/auth.ts` |

**Suggested implementation order:** 5.1 → 5.2 → 5.3 → 5.4 → 5.5 (do not build admin UI before server scoping).

---

## Explicitly deferred (v1 + beyond Phase 5 scope)

Do not build unless requirements change:

- **Public sign-up** and self-service tutor creation (Phase 5 uses admin-seeded / invited users only)
- **Multi-tenant SaaS** (subscriptions, tenant billing, marketing)
- WhatsApp Business API
- Recurring edit modes like Google Calendar (“all events”, “this and following”)
- Stored invoice **overdue** status
- Selling TutorHub as multi-tenant SaaS

---

## Quick reference

| Area | Code |
|------|------|
| Product spec | `PRODUCT.md` |
| Schema | `prisma/schema.prisma` |
| Mock (until Phase 2) | `src/lib/mock-data.ts` |
| Roster (parents/students) | `src/context/RosterContext.tsx`, `src/app/actions/roster.ts` |
| Schedule (recurring slots) | `src/context/ScheduleContext.tsx`, `src/app/actions/schedule.ts`, `src/lib/schedule/generate-sessions.ts` |
| DB access | `src/lib/db/prisma.ts`, `src/lib/db/load-admin-bootstrap.ts` |
| Rupiah / invoice dates | `src/utils/format.ts` |
| WhatsApp templates | `src/lib/whatsapp/` |
| Invoice generation (mock) | `src/lib/invoices/` (`resolve-invoice-display.ts`), `src/context/InvoiceContext.tsx` |
| Billing month navigation | `src/lib/billing-period.ts`, `src/hooks/useBillingPeriod.ts`, `src/components/billing/` |
| Auth (Google + DB users) | `src/auth.ts`, `src/lib/auth/sign-in-gate.ts`, `src/proxy.ts` |
| Active tutor context (Phase 5) | `src/lib/tutor-context/get-active-tutor-id.ts`, `assert-tutor-scope.ts`, `src/app/actions/tutor-context.ts` |
| Agent / repo conventions | `AGENTS.md` |

**Suggested next sprint:** Start **Phase 5.1** (schema + migration) **or** v1 maintenance (compact month list, report photo blob storage, datetime edge cases).

**Optional v1 backlog** (not Phase 5):

- [ ] **Compact month list** — last 12 billing months with totals → opens month in picker
- [ ] **Report photo blob storage** — durable uploads vs inline/base64 in `contentJson`
- [ ] **Display timezone** — greeting / `formatFullDate` explicitly WIB
- [ ] **Calendar slot prefill** — `parse-slot-select` uses WIB when reading FC dates
