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
- [ ] **Paid months (prod lock)** — optional: hide **Mark unpaid** when `NODE_ENV=production` (deploy)
- [x] **Attendance keys** — date-scoped; finance/invoices filter by selected `period`

**Optional later (not blocking Phase 2):**

- [ ] **Compact month list** — e.g. last 12 rows: month label, total billed, unpaid count → tap opens that month in the picker (nice on desktop; secondary entry on phone)

### Access control (deploy gate)

- [x] **Auth.js** (NextAuth v5) — Google OAuth, email allowlist (`AUTH_ALLOWED_EMAILS`, two accounts)
- [x] **`src/proxy.ts`** — unauthenticated users → `/signin`; `/signup` disabled; API auth excluded from matcher
- [x] TutorHub sign-in UI + header **Sign out** (session from Google profile)

Configure before Vercel deploy: `AUTH_SECRET`, Google OAuth client, redirect URI `…/api/auth/callback/google`. See `.env.example`.

### Roster (pre–Phase 2 mock CRUD)

- [x] **Parents** page — salutation, honorific, WhatsApp (`RosterContext` + `localStorage`; aligns with `prisma` `Parent`)
- [x] **Students** — add / edit (parent picker); list reads live roster
- [x] Seed parents **p1–p5** for all mock students; invoice/WhatsApp use roster parent records

### Phase 1 — still open

- [x] Real parent **WhatsApp** numbers in mock (see WhatsApp section above)
- [x] **Exit criteria** validated on device (September 2026 + billing month picker; attendance → invoice → WhatsApp)
- [ ] **Paid months (prod lock)** — only if you want no **Mark unpaid** on Vercel (see edge case above)

---

## Phase 2 — Data layer

Goal: replace mock reads with real data on **Neon Postgres** (single-tutor; auth gate already in Phase 1).

- [ ] Provision **Neon** project; `DATABASE_URL` (pooled) + `DIRECT_URL` in `.env` / Vercel (see `.env.example`)
- [ ] `prisma migrate`, seed script aligned with current mock shapes
- [ ] Server-side data access (Server Components / server actions / small `lib/db` module — pick one pattern and stay consistent)
- [ ] **Session generation** from `ScheduleRule` (weekly recurrence)
- [ ] **Fee snapshot** on `Session` at creation; link billable sessions to `InvoiceItem` per schema
- [ ] Swap the six TutorHub pages from `mock-data.ts` imports to DB queries
- [ ] Query invoices / reports / finance **by billing month** (same `?month=` contract as Phase 1 navigation)
- [ ] Keep fabricated names in **seed only**; do not commit secrets

**Exit criteria:** App runs against Postgres locally; mock file unused for main routes (or kept for tests/fixtures only).

---

## Phase 3 — v1 CRUD & billing correctness

Goal: persistent operations the tutor actually needs. Per [`PRODUCT.md`](./PRODUCT.md) constraints.

### Murid & jadwal

- [ ] CRUD **Student** + **Parent** (siblings → one invoice per parent)
- [ ] **ACTIVE / INACTIVE:** deactivating stops future recurrence (rule end date), drops future sessions, keeps history
- [ ] **ScheduleRule:** add/edit weekly slot; **per-occurrence** edit/cancel only (no “this and following”)

### Tagihan & keuangan

- [ ] **Generate invoice** for calendar month from **ATTENDED** sessions only (`ABSENT` excluded) — *mock parity: Phase 1 derive-on-read*
- [ ] One invoice per parent per month; line per child; persist `UNPAID` / `PAID` only
- [ ] Keuangan totals derived from invoice status (not a full accounting system)

### Laporan

- [ ] Wait for **Montessori report template** from the tutor before locking UI fields
- [ ] Draft editor → `contentJson` + `DRAFT` / `PUBLISHED`; send flow similar to Tagihan when template exists
- [ ] Do not invent the final report form until real template arrives

**Exit criteria:** End-to-end month: teach → mark attendance → generate invoice → WhatsApp → mark paid; reports draft when template ready.

---

## Phase 4 — Polish & scope control

- [ ] Mobile pass: one-handed use, calendar scroll, sidebar drawer (layout uses `xl` for docked sidebar)
- [ ] Hide or remove unused **TailAdmin demo** routes from product builds if they confuse the tutor
- [ ] Optional: **overdue** as computed UI hint only (never persist `OVERDUE`)
- [ ] Update `PRODUCT.md` deferred bullets (DB, CRUD, calendar) to match shipped reality
- [ ] Deploy target (Vercel + managed Postgres, or self-host) — decide when Phase 2 is stable

---

## Explicitly deferred (v1)

Do not build unless requirements change:

- Multi-tutor / roles / sign-up beyond the two Google allowlist accounts
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
| Roster (parents/students mock CRUD) | `src/context/RosterContext.tsx`, `src/lib/roster/roster-store.ts` |
| Rupiah / invoice dates | `src/utils/format.ts` |
| WhatsApp templates | `src/lib/whatsapp/` |
| Invoice generation (mock) | `src/lib/invoices/` (`resolve-invoice-display.ts`), `src/context/InvoiceContext.tsx` |
| Billing month navigation | `src/lib/billing-period.ts`, `src/hooks/useBillingPeriod.ts`, `src/components/billing/` |
| Auth (Google allowlist) | `src/auth.ts`, `src/lib/auth/allowed-emails.ts`, `src/proxy.ts` |
| Agent / repo conventions | `AGENTS.md` |

**Suggested next sprint:** **Phase 2** — Neon Postgres, migrate/seed, swap pages off `mock-data.ts` (keep `?month=` billing contract).
