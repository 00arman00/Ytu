# Canonical Application Decision

> **Honest scope note**: This document is produced from a **local sandbox** at `/home/z/my-project/`, not from your real GitHub repository. The audit facts you cited (`6276ae6`, `english-aloeducation/`, `db/custom.db` in git) describe your *actual* production repo, which I have no network access to. Apply the decisions documented here to your real repo using the runbook in `DEPLOYMENT-RUNBOOK.md`.

## Decision

**Canonical application**: The Next.js 16 + Prisma + SQLite CRM application located at the repository root (`/`).

**Reason**: This is the only application in the sandbox that actually contains the CRM domain models (Lead, Deal, Contact, Ticket, Campaign, Content, Subscription, CompanyUser, AuditLog, Notification, Message, Announcement, Activity, Webhook, ApiKey, etc.) and the only one wired to the production login flow (`admin@marketingos.com` → JWT → `verifyToken()` in `src/lib/auth.ts`).

## Path

```
/                              ← canonical application root
├── src/
│   ├── app/                   ← Next.js 16 App Router
│   │   ├── api/               ← 30+ API routes (CRM, Settings, Notifications, etc.)
│   │   ├── layout.tsx         ← root layout with ThemeProvider
│   │   └── page.tsx           ← main CRM dashboard shell + sidebar
│   ├── components/            ← shadcn/ui + custom views
│   │   ├── ui/                ← shadcn/ui primitives
│   │   ├── views/             ← CRM, Campaigns, Analytics, Team, Settings, etc.
│   │   ├── notifications-bell.tsx
│   │   └── command-palette.tsx
│   ├── hooks/                 ← use-api-query, use-auth, use-mobile, use-toast
│   ├── lib/                   ← auth, db, events, ssrf, enrichment, feed-parser
│   └── stores/                ← Zustand stores (app-store)
├── prisma/
│   ├── schema.prisma          ← 30+ models
│   ├── seed.ts                ← admin user + company + team members
│   ├── seed-crm.ts            ← 50 leads, 25 deals, 30 contacts, 15 tickets
│   ├── seed-tools.ts          ← 120 integration tools
│   ├── seed-workforce.ts      ← 2000 AI employees
│   ├── seed-ai-agents.ts      ← 9 AI agents
│   └── seed-engagement.ts     ← announcements + activities + notifications
├── package.json               ← bun + Next.js 16
├── next.config.ts             ← allowedDevOrigins, standalone output
├── .env                       ← DATABASE_URL, JWT_SECRET (NOT tracked)
├── .env.example
└── .gitignore
```

## Framework

- **Next.js 16.1.3** (App Router, Turbopack)
- **React 19.0.0**
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** (New York style)

## Database

- **Provider**: SQLite (via `@prisma/client`)
- **Development database**: `file:./db/custom.db` (local file, NOT tracked in git)
- **Production database**: SQLite on the VPS filesystem. For higher scale, swap `datasource db` in `prisma/schema.prisma` to `postgresql` and run `prisma migrate deploy` — Prisma abstracts this cleanly.
- **Migration strategy**: `prisma db push --accept-data-loss` for schema changes in development. Production should use `prisma migrate deploy` once migrations are checked in.

## Authentication

- **JWT** signed with `jose` library using `HS256`
- **Password hashing**: bcryptjs (12 rounds)
- **Secret**: `JWT_SECRET` environment variable (must be set in production — throws on startup if missing in `NODE_ENV=production`)
- **Token lifetime**: 7 days
- **Storage**: client-side `localStorage.mos_token`
- **Verification**: `verifyToken()` in `src/lib/auth.ts`, called by every protected API route
- **Roles**: 12 roles with hierarchy (`super_admin` → `viewer`)

## CRM routes (verified)

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/crm/leads` | List + create leads |
| GET/PATCH/DELETE | `/api/crm/leads/[id]` | Read + update + delete lead |
| POST | `/api/leads/[id]/enrich` | Auto-enrich lead from email domain |
| POST/GET | `/api/leads/enrich` | Lookup enrichment without saving |
| POST | `/api/leads/import` | Bulk CSV import |
| GET | `/api/leads/export` | CSV export with formula-injection protection |
| GET/POST | `/api/crm/deals` | List + create deals |
| PATCH/DELETE | `/api/crm/deals/[id]` | Update + delete (kanban DnD hits PATCH) |
| GET/POST | `/api/crm/contacts` | List + create contacts |
| PATCH/DELETE | `/api/crm/contacts/[id]` | Update + delete contact |
| GET/POST | `/api/crm/tickets` | List + create tickets |
| PATCH/DELETE | `/api/crm/tickets/[id]` | Update + delete ticket |
| GET/POST | `/api/notifications` | List + (POST creates) notifications |
| POST | `/api/notifications/read-all` | Mark all as read |
| POST | `/api/notifications/[id]/read` | Mark one as read |
| GET/POST | `/api/messages` | List threads + send message |
| GET | `/api/messages/[id]` | Fetch thread between me + other user |
| GET/POST | `/api/announcements` | List + create announcements |
| PATCH/DELETE | `/api/announcements/[id]` | Update + delete announcement |
| GET | `/api/audit-logs` | Paginated audit log (admin+) |
| GET | `/api/activity-feed` | Company-wide activity stream |
| GET/POST | `/api/users` | List + create users (admin+) |
| GET/POST | `/api/settings/company` | Company info + update |
| GET/POST | `/api/settings/webhooks` | List + create webhooks (SSRF-protected) |
| DELETE | `/api/settings/webhooks/[id]` | Delete webhook |
| GET/POST | `/api/settings/api-keys` | List + create API keys (bcrypt-hashed) |
| DELETE | `/api/settings/api-keys/[id]` | Revoke API key |
| GET | `/api/settings/sessions` | List user sessions |
| DELETE | `/api/settings/sessions/[id]` | Revoke session |
| POST | `/api/settings/security/password` | Change password (verify + rehash) |
| GET/POST | `/api/feeds/sources` | RSS feed sources |
| GET | `/api/feeds/items` | RSS feed items |
| POST | `/api/feeds/refresh` | Refresh feeds |
| POST | `/api/feeds/import` | Convert feed item → Content row |
| GET/POST | `/api/competitors` | Market intel competitors |
| GET/POST | `/api/keywords` | Tracked keywords |
| GET | `/api/market-intelligence` | Radar overview |
| POST | `/api/scraper` | Web scraper (firecrawl pattern) |
| POST | `/api/sms/send` | Send SMS (httpsms pattern) |
| GET | `/api/sms/messages` | List SMS messages |

## CRM UI (verified)

All accessible from the sidebar at `/`:

- **CEO Dashboard** — KPIs + revenue trend + lead funnel + deal pipeline
- **CRM** — Leads (table with inline status, search, filter, CSV import/export, enrich, SMS), Deals (kanban DnD), Contacts (cards), Tickets (list)
- **Campaigns** — Cards with metrics
- **Content** — Calendar + list
- **RSS Feeds** — Source sidebar + items list + import-to-content
- **Market Intel** — Competitors + keywords + opportunities
- **Analytics** — Real DB aggregations + 4 charts
- **Messages** — Chatwoot-style inbox (thread list + conversation view)
- **Announcements** — Cards + create/edit/delete
- **Audit Logs** — Paginated table with filters
- **Team** — Members + invitations + audit trail
- **Settings** — Company, Security, API (webhooks + API keys + sessions)
- **AI Agents** — Toggle agents on/off
- **Integrations** — 120 tools across 27 categories
- **AI Workforce** — 2000 employees + 54 departments

## Production entry point

```bash
# Development (auto-runs in sandbox)
bun run dev

# Production
bun run build              # prisma generate + next build + standalone output
NODE_ENV=production bun .next/standalone/server.js
```

## What the nested application is

**In this sandbox**: there is no nested application. The `english-aloeducation/` directory you cited does not exist here.

**In your real repo**: if you have an `english-aloeducation/` directory with its own `package.json` and `prisma/schema.prisma` containing models like `Account`, `Teacher`, `MockTest`, `Certificate`, `Voucher`, `Class` — that is a **separate application**, likely an English-language learning platform. It is **NOT the canonical CRM**.

## Disposition of the nested application

You must determine on your real repo which of these is true:

| Option | Action |
|--------|--------|
| (A) Legacy code, not in use | `git rm -r english-aloeducation/` — delete it |
| (B) Required English application, separately deployed | Move to its own repository (`git filter-repo --path english-aloeducation/`) |
| (C) Independent application, both products share one repo | Document both in `docs/CANONICAL-APPLICATION.md`, mark `english-aloeducation/` as out-of-scope for CRM work |
| (D) Duplicated implementation | Consolidate into the root app, delete the duplicate |
| (E) Required dependency | Keep as-is, document why |

**Do NOT delete it without verification.** The audit must be based on reading its `package.json`, `README`, and `prisma/schema.prisma`, plus asking the owner whether it's still in use.
