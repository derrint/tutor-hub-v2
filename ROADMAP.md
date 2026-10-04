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
- [ ] Replace placeholder parent WhatsApp numbers with real values (seed / settings UI later)

### Attendance (trust path)

- [x] Mark **absent** per session on Dashboard (today) and Schedule (session modal); default = billable (no “mark attended”)
- [x] **Visual distinction:** absent sessions dimmed + badge; stored in `localStorage` via `AttendanceContext`
- [x] Absent sessions **excluded** from invoice card totals and WhatsApp prefill (`computeBillableInvoice`)

### Invoice actions (still mock)

- [x] **Create invoice** — adds missing parent invoices for the month from recurring schedule
- [x] **Regenerate** — rebuilds lines from schedule minus absences (`InvoiceContext` + `generateInvoiceForParent`)
- [x] Mark invoice **paid / unpaid** in UI (mock toggle, `localStorage`)

**Exit criteria:** Tutor can tap through mark attendance → see invoice update → open WhatsApp with combined rapot+payment text, all without a database.

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
| WhatsApp templates | `src/lib/whatsapp/` |
| Invoice generation (mock) | `src/lib/invoices/`, `src/context/InvoiceContext.tsx` |
| Agent / repo conventions | `AGENTS.md` |

**Suggested next sprint:** complete **Phase 1** (WhatsApp template + attendance on mock) before touching Postgres.
