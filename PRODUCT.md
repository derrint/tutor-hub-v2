# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router, TypeScript) + Tailwind CSS v4 + shadcn/ui, with Prisma (PostgreSQL) planned as the data layer. Chosen directly by the user (not delegated) after an earlier attempt to design via Google Stitch was rejected as too complex; the user asked to build directly in code instead, applying design principles from the `emil-design-eng` and `apple-design` skills rather than a generated design tool.

## Users

Single primary user: a private tutor (the user's wife) who teaches Montessori-based material to young children individually. Her students span two education levels — TK (kindergarten) and SD (elementary school). She personally manages her own schedule, billing, and progress reporting for each student's parent. There is no other staff; this is explicitly a single-tutor operation (confirmed — no multi-tutor/multi-user support planned).

## Product Purpose

TutorHub replaces ad-hoc manual tracking (e.g. typing up WhatsApp messages by hand to compute monthly billing) with a lightweight operational dashboard for a solo private tutor: track which students are being taught, when sessions happen (including recurring weekly slots), which sessions were attended vs. absent (and therefore billable), generate monthly invoices grouped by parent with a per-child breakdown, and write monthly learning-progress reports per student. Success means the tutor can, in a few taps from her phone, mark attendance, generate an accurate invoice, and send it to a parent — without manually recalculating anything.

## Positioning

Internal-only operational tool for one tutor's private practice — not intended to be sold or offered to other tutors (confirmed). It is not a general-purpose tutoring/school-management SaaS; scope is deliberately narrow to this single tutor's real workflow (confirmed by the real WhatsApp invoice message she currently sends manually, which the invoice feature directly replicates).

## Operating Context

- The tutor works from her phone most of the time; the app must be comfortable to use one-handed during or between sessions (mobile-first, but also usable on desktop).
- Billing is currently done manually via WhatsApp text messages listing each child's attended dates and a total (see real example: "Untuk pembayaran les Arga, selama bulan September ini ada 6 kali pertemuan, yaitu: 2/9, 7/9, ... Biaya les Rp125.000/pertemuan, jadi totalnya Rp1.500.000"). The Tagihan (Invoice) feature must produce output that matches this real-world format: grouped by parent, one line per child with session count and subtotal, then a grand total, plus the tutor's bank account info.
- One parent can have multiple children enrolled (siblings), which is why invoices are grouped per parent rather than per child.
- Progress reports are monthly per student, following a Montessori-area structure (Practical Life, Sensorial, Language, Mathematics, Culture & Science), pending a final template the tutor's wife will provide from her existing practice.
- Currency is Indonesian Rupiah; primary language for user-facing copy is Indonesian (Bahasa Indonesia), while code identifiers (variables, models, fields) are kept in English per explicit request.

## Capabilities and Constraints

Confirmed decisions (from product discussion):

- **Single-tutor only.** No multi-user auth/roles planned for v1.
- **Recurring schedule**: weekly-repeating sessions are supported; edits/cancellations apply per individual occurrence only (no "this and following" / "all events" editing mode — deliberately simplified vs. Google Calendar).
- **Attendance & billing**: a session marked absent is excluded from that month's invoice total; this must be visually obvious (disabled/grey) wherever sessions are shown.
- **Student status**: `ACTIVE` / `INACTIVE`. Deactivating a student auto-stops their recurring schedule rule (sets an end date) and removes not-yet-occurred future sessions; past sessions remain untouched for billing/report history.
- **Invoice period**: calendar month (1st–end of month), not a custom date range.
- **Invoice status**: intentionally simple — `UNPAID` / `PAID` only. No stored "overdue" status (may be computed/derived in the UI later, but not persisted).
- **WhatsApp**: v1 uses `wa.me` deep links with a pre-filled message template (matching the real invoice/report message format) — no paid WhatsApp Business API integration.
- **Reports**: `DRAFT` / `PUBLISHED` status per student per month, conceptually similar to invoice send flow. Exact content template pending (Montessori-area structure proposed as a placeholder).
- Undecided / explicitly deferred: real database provisioning (currently mock data), CRUD forms for create/edit flows, the full weekly-grid calendar view for desktop (agenda/list view exists for now), and the final monthly report content template.

## Brand Commitments

Product name: "TutorHub" (confirmed as the working/final name — generic is acceptable, no specific studio brand name was chosen). No existing logo, tagline, or visual identity beyond the design tokens already established in `DESIGN.md` (single blue primary accent, TK = blue badge, SD = coral badge, emerald/amber/slate status semantics).

## Evidence on Hand

- Real WhatsApp invoice message text provided by the user (see Operating Context) — the only real production content available; all other names, amounts, and schedules currently in the app (`src/lib/mock-data.ts`) are fabricated placeholders for development and must not be treated as real user/business data.
- Reference UI screenshots (Dashboard, Jadwal/schedule, Tagihan/invoice list, Murid/student list, Keuangan/finance summary) were shared early in the project to illustrate the desired shape of each page; they came from an earlier, since-abandoned Google Stitch exploration and are a rough visual reference only, not a binding spec.
- No monthly report template exists yet; the tutor (user's wife) will provide her own format later.

## Product Principles

1. **Match the tutor's real workflow, not a generic SaaS.** Every feature (especially Tagihan) should mirror what she already does manually (e.g. the WhatsApp invoice format), not introduce unfamiliar concepts.
2. **Mobile-first, single codebase.** One responsive implementation adapts between a phone (bottom nav, agenda list) and desktop (sidebar, denser grid) — never two divergent builds.
3. **Billing correctness by construction.** Absence and student deactivation must always exclude the right sessions from billing automatically; this is core trust, not a nice-to-have.
4. **Keep v1 deliberately narrow.** Defer multi-tutor support, complex recurring-edit modes, WhatsApp Business API, and "overdue" invoice tracking until there's real evidence they're needed.
5. **Code in English, product copy in Indonesian.** Maintain this split consistently across the codebase and UI.

## Accessibility & Inclusion

No specific accessibility requirement beyond general mobile-friendliness was established (confirmed — nothing further to record).
