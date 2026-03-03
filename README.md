# BridgeIn

A whistleblowing platform built for EU Directive 2019/1937 compliance. Companies with 50+ employees are legally required to provide employees with a safe, internal reporting channel. BridgeIn makes this straightforward.

## What it does

- **Managers** sign up, get a unique magic link for their company, and manage incoming reports from a dashboard.
- **Employees** visit the magic link (no login required) and submit reports anonymously or with contact details.
- **Notifications** — managers receive an email whenever a new report is submitted. The dashboard also shows an unread badge for any new reports.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database | Prisma + SQLite |
| Auth | NextAuth.js v5 (JWT sessions, Credentials provider) |
| Passwords | bcryptjs (12 salt rounds) |
| Magic link tokens | nanoid (24-char URL-safe tokens) |
| Email | Nodemailer (Ethereal auto-setup in dev) |
| Testing | Vitest + Testing Library |

## Running locally

**Prerequisites:** Node 18+ and npm.

### 1. Clone and install

```bash
git clone <repo-url>
cd BridgeInChallenge
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret"   # generate with: openssl rand -base64 32 || node -e "console.log(require('crypto')randomBytes(32).toString('base64'))"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

# Email — leave empty to use Ethereal (no API key needed, preview URL logged to console)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

### 3. Create the database

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Try it out

1. Go to `/signup` and create a manager account.
2. In the dashboard, go to **Settings** to get your company's magic link.
3. Open the magic link in an incognito window — this is the employee-facing form.
4. Submit a report. Back in the dashboard, you'll see it appear.
5. Check the console — it will print an Ethereal email preview URL where you can see the notification email.

### 6. Run tests

```bash
npm test
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── login/page.tsx             # Manager sign in
│   ├── signup/page.tsx            # Manager registration
│   ├── dashboard/
│   │   ├── layout.tsx             # Auth guard + sidebar
│   │   ├── page.tsx               # Stats overview
│   │   ├── reports/page.tsx       # Report list with filters
│   │   └── settings/page.tsx      # Magic link management
│   ├── report/[token]/
│   │   └── page.tsx               # Employee report form (no auth)
│   └── api/
│       ├── auth/signup/route.ts
│       ├── auth/[...nextauth]/route.ts
│       ├── reports/route.ts        # GET (manager's) + POST (public)
│       ├── reports/[id]/route.ts   # PATCH status
│       └── magic-link/route.ts     # GET + POST (regenerate)
├── components/
│   ├── dashboard/                  # Sidebar, ReportCard, StatsCard, StatusBadge
│   └── ui/                         # Button, Input, Badge, Select, etc.
└── lib/
    ├── auth.ts                     # NextAuth config
    ├── db.ts                       # Prisma singleton
    ├── email.ts                    # Nodemailer notifications
    └── utils.ts                    # Helpers, formatters, status configs
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npx prisma studio` | Visual database browser |
| `npx prisma migrate dev` | Apply schema changes |

## Deployment notes

For production:
- Set `DATABASE_URL` to a Postgres connection string (update `prisma/schema.prisma` provider to `postgresql`)
- Set `AUTH_SECRET` to a strong random value
- Set `SMTP_*` variables to your email provider (Resend, SendGrid, or any SMTP)
- Run `npx prisma migrate deploy` before starting

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and tradeoffs.
