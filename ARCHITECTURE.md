# BridgeIn — Solution Architecture

## What it does

BridgeIn is a confidential workplace reporting platform. Employees submit reports via a
private link — no account required. Managers review incoming reports through a protected
dashboard. Reporters choose to be anonymous or leave a contact email for follow-up.

---

## High-Level Diagram

```
                         ┌─────────────────────────────────────────────────────┐
                         │                   NEXT.JS 15 APP                    │
                         │                                                     │
  EMPLOYEE               │  /report/[token]          /api/reports (POST)       │
  (no account)           │  ┌──────────────┐         ┌──────────────────────┐  │
      │  1. opens link   │  │ Server       │         │ 1. validate token    │  │
      │─────────────────►│  │ Component    │         │ 2. create Report     │  │
      │                  │  │              │         │ 3. send email notif  │  │
      │  2. submits form │  │ validates    │         │    (non-blocking)    │  │
      │─────────────────►│  │ token, shows │         └──────────┬───────────┘  │
      │                  │  │ company name │                    │              │
      │  3. success ◄────│  └──────────────┘                    │              │
      │                  │                                      │              │
      │                  │  Middleware (/dashboard/*)           │              │
      │                  │  JWT check → redirect if unauthed    │              │
      │                  │                                      ▼              │
      │                  │  /dashboard          /api/reports (GET)             │
      │                  │  ┌──────────────┐    ┌──────────────────────────┐   │
  MANAGER                │  │ Server       │    │ filter by managerId      │   │
  (authenticated)        │  │ Components   │    │ (data segregation)       │   │
      │  4. views        │  │              │    └──────────────────────────┘   │
      │─────────────────►│  │ reads DB     │                                   │
      │  5. updates ─────│  │ directly     │    /api/reports/[id] (PATCH)      │
      │     status       │  │ (no API hop) │    ┌──────────────────────────┐   │
      │  6. manages ─────│  │              │    │ verify ownership before  │   │
      │     link         │  └──────────────┘    │ write (managerId check)  │   │
      │                  │                      └──────────────────────────┘   │
      │◄─────────────────│                                                     │
      │  email notif     │                 ┌──────────────────────────────┐    │
      │  (new report)    │                 │         Prisma ORM           │    │
                         │                 │  SQLite file (dev/local)     │    │
                         │                 │  PostgreSQL-ready (prod)     │    │
                         │                 └──────────────────────────────┘    │
                         │                                                     │
                         │                 ┌──────────────────────────────┐    │
                         │                 │        Nodemailer            │    │
                         │                 │  Ethereal auto-setup (dev)   │    │
                         │                 │  SMTP credentials (prod)     │    │
                         │                 └──────────────────────────────┘    │
                         └─────────────────────────────────────────────────────┘
```

---

## Data Model

Three tables with clear ownership:

```
Manager ──(1:1)── MagicLink ──(1:N)── Report
   │                   │
   │ id                │ token (nanoid, 24 chars — shared with employees)
   │ email             │ managerId (FK, unique)
   │ password (bcrypt) │
   │ name              └── Report
   │ companyName             id / title / description / category
                             isAnonymous
                             contactEmail (forced null if anonymous)
                             status: new → reviewing → resolved → closed
                             createdAt / updatedAt
```

Reports are associated with a `MagicLink`, not directly with a `Manager`. This means
regenerating the magic link creates a new token while leaving all historical reports intact.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Full-stack in one repo — Server Components for DB reads, Route Handlers for the API, Middleware for auth guards |
| **Language** | TypeScript (strict mode) | Type safety across client, server, and DB; catches data shape mismatches at compile time |
| **Auth** | NextAuth v5 — Credentials + JWT | No external OAuth dependency; stateless JWT works with edge middleware; `httpOnly` cookie |
| **Database** | SQLite (dev) via Prisma ORM | Zero infrastructure for local evaluation; one-line change to switch to PostgreSQL for production |
| **Validation** | Zod | Single schema reused for client-side form feedback and server-side API enforcement |
| **Forms** | react-hook-form + Zod resolver | Uncontrolled inputs (performant), schema-driven errors, consistent UX |
| **Email** | Nodemailer + Ethereal fallback | Auto-configures a disposable inbox in dev (no credentials needed); any SMTP in prod |
| **Styling** | Tailwind CSS + Radix UI primitives | Utility-first for speed; Radix provides accessible, unstyled Select, Switch, Dialog components |
| **Testing** | Vitest + Testing Library | Fast native ESM test runner; 16 unit tests covering all utility functions |
| **Token generation** | nanoid | URL-safe, cryptographically random 24-char tokens (~144 bits of entropy) |

---

## Security Design

| Concern | How it's handled |
|---|---|
| **Data segregation** | `GET /api/reports` filters by `managerId`. `PATCH /api/reports/[id]` verifies the report's MagicLink belongs to the session user before writing — Manager A cannot touch Manager B's data. |
| **Password storage** | bcrypt, 12 salt rounds |
| **Magic link tokens** | nanoid(24) — URL-safe, ~144 bits of entropy |
| **Anonymous reports** | `contactEmail` is set to `null` server-side on anonymous submissions regardless of what the client sends |
| **Route protection** | Middleware guards all `/dashboard/*` routes; Server Components also call `auth()` and redirect if no session |
| **Session tokens** | JWT signed with `AUTH_SECRET`, stored in an `httpOnly` cookie |

---

## Tradeoffs Made for the MVP

### 1. SQLite instead of PostgreSQL
**Chosen for:** zero setup — works on any machine without Docker or a cloud database account.
The schema uses only standard SQL features; switching to PostgreSQL for production is a
one-line change in `schema.prisma` (`provider = "sqlite"` → `provider = "postgresql"`).
**Tradeoff:** SQLite serialises writes and is not suitable for high concurrency. The database
is a single file that must be backed up manually.

### 2. JWT sessions instead of database sessions
**Chosen for:** no session table needed; stateless sessions work with edge middleware
without a DB round-trip on every request.
**Tradeoff:** sessions cannot be invalidated server-side. If a manager's account is
compromised, the JWT stays valid until natural expiry. A production system would add a
token blocklist or switch to database sessions.

### 3. One magic link per company (shared bearer token)
**Chosen for:** genuine anonymity — we issue one URL per company, not per employee. This
means we cannot link a submission to a specific person even if we wanted to.
**Tradeoff:** the link is a secret that travels through URLs (clipboard, browser history,
email). The Regenerate button immediately invalidates the old token, which is the main
mitigation. Report content is stored in plaintext — a higher-assurance version would
encrypt at rest.

### 4. Credentials-only auth (no OAuth / SSO)
**Chosen for:** no dependency on Google/GitHub during evaluation; full control over the
login flow.
**Tradeoff:** we own the full password lifecycle. There is no password-reset flow in the
MVP (it would require a verified email delivery step). Adding OAuth providers to NextAuth
is a one-file change if needed.

### 5. Email is fire-and-forget
**Chosen for:** a failing SMTP connection must never block a report submission — the
`sendNewReportNotification` call is intentionally not awaited.
**Tradeoff:** if the mail server is down, the notification is silently lost. A production
system would use a job queue (e.g., Inngest, BullMQ) with retries and dead-letter handling.

### 6. No rate limiting on the public endpoint
**Chosen for:** avoids introducing a Redis/KV dependency for the MVP.
**Tradeoff:** `POST /api/reports` can be spammed. Adding `@upstash/ratelimit` with a Vercel
KV store is a small addition when moving to production.

### 7. Single manager per company, no team roles
**Chosen for:** keeps the schema and auth logic minimal for the MVP scope.
**Tradeoff:** real compliance teams need multiple HR users, role-based access (viewer vs.
admin), and full audit logs. The `Manager` model can be extended with an `Organisation`
table and a roles relation without changing the report submission flow.

### 8. Simple 4-state workflow, no case notes
**Chosen for:** minimal DB schema and a clean UI for a first version.
**Tradeoff:** compliance workflows typically need an internal comment thread, timeline of
status changes, and case assignment. The `Report` model can gain a `CaseNote` relation
without breaking existing data.

---

## What's Not in the MVP

| Feature | Rationale |
|---|---|
| Multi-admin per company | Adds org/role complexity; out of MVP scope |
| Password reset | Needs reliable email delivery before it's trustworthy |
| File attachments | Storage complexity; not required to demonstrate the core flow |
| Real-time push (WebSocket/SSE) | Page navigation is sufficient for a low-volume reporting tool |
| Full audit log | Valuable for compliance; omitted to keep the schema focused |
| Rate limiting | Worth adding before production; no KV store included in the MVP |
