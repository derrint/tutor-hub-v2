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

### WhatsApp & invoice copy

- [ ] Add tutor **Profile** mock (bank name, account number, account holder) for message footers
- [ ] Build **invoice message template** (Indonesian) using:
  - `formatInvoicePeriodLabel`, `formatInvoiceSessionDays`, `formatInvoiceSessionDaysForMessage`, `formatRupiah`
  - Per-child lines: name, session count, day list, fee per session, subtotal, grand total
- [ ] **Tagihan:** `wa.me` deep link on send/recreate (parent phone from mock Parent model shape)
- [ ] Optional: copy-to-clipboard or preview modal before opening WhatsApp

### Attendance (trust path)

- [ ] Mark sessions **Hadir / Absen** from Dashboard “Hari ini” and/or Jadwal (client mock state or lightweight store is fine)
- [ ] **Visual distinction:** absent/inactive vs attended (grey vs success — already partially styled; wire to interaction)
- [ ] Ensure absent sessions are **excluded** when previewing/generating invoice totals (even on mock)

### Invoice actions (still mock)

- [ ] “Buat Invoice” / “+ Invoice” opens preview or regenerates lines from **attended** sessions for the month
- [ ] Mark invoice **Lunas** in UI (mock toggle)

**Exit criteria:** Tutor can tap through mark attendance → see Tagihan update → open WhatsApp with correct text, all without a database.

---

## Phase 2 — Data layer

Goal: replace mock reads with real data; keep single-tutor, no auth unless you add a minimal gate later.

- [ ] Provision Postgres; `DATABASE_URL` in `.env` (see `.env.example`)
- [ ] `prisma migrate`, seed script aligned with current mock shapes
- [ ] Server-side data access (Server Components / server actions / small `lib/db` module — pick one pattern and stay consistent)
- [ ] **Session generation** from `ScheduleRule` (weekly recurrence)
- [ ] **Fee snapshot** on `Session` at creation; link billable sessions to `InvoiceItem` per schema
- [ ] Swap the six TutorHub pages from `mock-data.ts` imports to DB queries
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

- [ ] **Generate invoice** for calendar month from **ATTENDED** sessions only (`ABSENT` excluded)
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

- Multi-tutor / roles / full auth product
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
| Rupiah / invoice dates | `src/utils/format.ts` |
| Agent / repo conventions | `AGENTS.md` |

**Suggested next sprint:** complete **Phase 1** (WhatsApp template + attendance on mock) before touching Postgres.
