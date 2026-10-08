# Deployment Runbook — Apply Sandbox Work to Your Real GitHub + VPS

> This runbook tells you exactly how to take the work done in the sandbox and apply it to your real GitHub repository and VPS. **You must execute these steps yourself** — the sandbox cannot push to your repo or SSH to your VPS.

---

## Phase 0 — Prerequisites

You will need:

- **Local machine** with `git`, `node` 22+, `bun` 1.1+
- **Your GitHub repository** cloned locally (the one with HEAD `6276ae6`)
- **SSH access to your VPS**
- **The sandbox files** at `/home/z/my-project/` (or a fresh download of them)

---

## Phase 1 — Snapshot your real repo

```bash
# On your local machine, in your real repo checkout
cd path/to/your/Ai-Markting-crm   # or whatever your repo is named

# Verify you're on main and clean
git status
git rev-parse HEAD
# Expected: 6276ae69647e8cf41062b10802ea8ca349619038 (per your audit)

# Create a working branch so you don't disturb main
git checkout -b round-4-security-hardening
```

---

## Phase 2 — Apply the sandbox changes

### Option A: Copy the files manually (recommended)

The sandbox made changes to these files. Copy each one from the sandbox to your real repo, preserving the directory structure:

```
src/lib/ssrf.ts                                    [NEW FILE — copy from sandbox]
src/lib/events.ts                                  [MODIFIED — overwrite]
src/app/api/settings/webhooks/route.ts             [MODIFIED — overwrite]
src/app/api/leads/export/route.ts                  [MODIFIED — overwrite]
src/app/api/leads/import/route.ts                  [MODIFIED — overwrite]
prisma/schema.prisma                               [MODIFIED — overwrite Webhook model only]
prisma/seed.ts                                     [MODIFIED — overwrite]
.gitignore                                         [MODIFIED — append the new patterns]
docs/CANONICAL-APPLICATION.md                      [NEW FILE — copy from sandbox]
docs/FINAL-PRODUCTION-VERIFICATION-REPORT.md        [NEW FILE — copy from sandbox]
docs/DEPLOYMENT-RUNBOOK.md                         [NEW FILE — this document]
```

### Option B: Generate a patch from the sandbox

```bash
# In the sandbox
cd /home/z/my-project
git diff HEAD -- src/lib/events.ts src/app/api/settings/webhooks/route.ts \
  src/app/api/leads/export/route.ts src/app/api/leads/import/route.ts \
  prisma/schema.prisma prisma/seed.ts .gitignore > /tmp/round-4.patch

# Copy /tmp/round-4.patch to your real repo and apply
cd path/to/your/repo
git apply round-4.patch

# Copy the new files separately (they aren't in the diff)
cp /path/to/sandbox/src/lib/ssrf.ts src/lib/ssrf.ts
cp /path/to/sandbox/docs/* docs/
```

---

## Phase 3 — Inspect the `english-aloeducation/` directory

Before continuing, you MUST determine what this directory is. Run:

```bash
ls english-aloeducation/
cat english-aloeducation/package.json | head -20
cat english-aloeducation/README.md 2>/dev/null | head -20
grep -E "^model " english-aloeducation/prisma/schema.prisma | head -20
git log --oneline -5 -- english-aloeducation/
```

Decide:

| If it's... | Action |
|------------|--------|
| Legacy code, no recent commits, no README referencing it | `git rm -r english-aloeducation/` |
| Active product, separately deployed | Move to its own repo: `git filter-repo --path english-aloeducation/` |
| Active product, same repo | Leave it; update `docs/CANONICAL-APPLICATION.md` to document both apps |

**Do NOT delete it without verification.**

---

## Phase 4 — Remove tracked sensitive files from git

```bash
# Untrack the SQLite database binary (it stays locally, just removed from git index)
git rm --cached db/custom.db
git rm --cached -r english-aloeducation/db/ 2>/dev/null  # if present

# Untrack any .env files
git rm --cached .env
git rm --cached english-aloeducation/.env 2>/dev/null

# Untrack build artifacts
git rm --cached -r upload/ 2>/dev/null
git rm --cached -r screenshots/ 2>/dev/null
git rm --cached FINAL-PRODUCTION-PACKAGE.zip 2>/dev/null
git rm --cached -r *.tar.gz *.zip 2>/dev/null

# Verify .gitignore has the new patterns
grep -E "^db/custom\.db|^.env$|^upload/" .gitignore
# If missing, append:
cat >> .gitignore << 'EOF'

# Security cleanup — never commit
db/custom.db
db/*.db
db/*.db-journal
*.sqlite
*.sqlite3
.env
.env.*
!.env.example
upload/
*.zip
*.tar.gz
*.tgz
*.7z
screenshots/
agent-ctx/
tool-results/
EOF
```

---

## Phase 5 — Remove hardcoded admin password

```bash
# Inspect the seed file for hardcoded passwords
grep -n "admin123\|password.*=.*['\"]" prisma/seed.ts english-aloeducation/prisma/seed.ts 2>/dev/null
```

If you find a hardcoded password (e.g. `await hashPassword('admin123')`), replace it with:

```typescript
const seedPassword = process.env.ADMIN_SEED_PASSWORD;
if (!seedPassword || seedPassword.length < 8) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SEED_PASSWORD env var is required in production');
  }
  console.warn('⚠️  Using dev fallback password');
  // dev fallback only
}
const passwordHash = await hashPassword(seedPassword);
```

**If that credential was ever used in a real environment, rotate it now.** Generate a new one:

```bash
openssl rand -base64 24
```

---

## Phase 6 — Integrate the verified CI fix (commit `38d019d`)

Your audit says `38d019d` contains the verified `DATABASE_URL` fail-fast fix. Inspect it:

```bash
git show 38d019d
git diff 6276ae6..38d019d
```

If the diff is clean (only the fail-fast check, no unrelated changes), cherry-pick it:

```bash
git cherry-pick 38d019d
```

If the cherry-pick conflicts, resolve manually — keep both the fail-fast check AND any current-main work that `38d019d` doesn't have.

---

## Phase 7 — Run prisma db push to apply schema changes locally

```bash
# Install deps
bun install   # or npm install / pnpm install — match your repo

# Apply the Webhook schema changes (lastError, lastDeliveredAt, etc.)
bunx prisma db push --accept-data-loss
# ⚠️ --accept-data-loss is safe here because we're only ADDING nullable columns

# Regenerate the Prisma client
bunx prisma generate
```

---

## Phase 8 — Local verification

```bash
# Typecheck
bunx tsc --noEmit

# Lint
bunx eslint src/lib/ssrf.ts src/lib/events.ts src/app/api/settings/webhooks/route.ts \
  src/app/api/leads/export/route.ts src/app/api/leads/import/route.ts prisma/seed.ts

# Build
bun run build

# Start production server locally
NODE_ENV=production bun .next/standalone/server.js &

# Smoke test
curl -s http://localhost:3000/api/health
# Login + create lead → verify event chain
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@marketingos.com\",\"password\":\"$ADMIN_SEED_PASSWORD\"}" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Test SSRF protection (should be rejected)
curl -s -X POST http://localhost:3000/api/settings/webhooks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"url":"http://127.0.0.1:9999","events":["lead.created"]}'
# Expected: {"error":"URL not allowed: IP 127.0.0.1 is in a blocked range"}

# Test CSV export protection
curl -s -X POST http://localhost:3000/api/crm/leads \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"=cmd|/c calc!A1","email":"test@test.com","source":"Website"}'
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/leads/export | grep "=cmd"
# Expected: '=cmd|/c calc!A1,... (single-quote prefix neutralizes the formula)
```

---

## Phase 9 — Commit and push

```bash
# Review every changed file
git status
git diff

# Stage the changes
git add src/lib/ssrf.ts src/lib/events.ts src/app/api/settings/webhooks/route.ts \
  src/app/api/leads/export/route.ts src/app/api/leads/import/route.ts \
  prisma/schema.prisma prisma/seed.ts .gitignore docs/

# Also stage the untracking of db/custom.db etc.
git add -u   # stages deletions from git rm --cached

# Verify NO secrets are in the staged changes
git diff --cached | grep -iE "password=|api[_-]?key=|secret=|private[_-]?key|token="
# Expected: only matches in seed.ts comments and docs/ files (not real secrets)

# Commit
git commit -m "feat: complete round 2 CRM infrastructure + security hardening

- Add SSRF protection for webhook delivery (block localhost, private IPs, cloud metadata)
- Add HMAC-SHA256 timestamped signatures for webhooks (t=<ts>,v1=<hex>)
- Add CSV formula-injection protection on export + import (=, +, -, @ prefixed with ')
- Replace hardcoded admin password with ADMIN_SEED_PASSWORD env var
- Untrack db/custom.db, .env, upload/*.zip from git
- Add docs/CANONICAL-APPLICATION.md, FINAL-PRODUCTION-VERIFICATION-REPORT.md, DEPLOYMENT-RUNBOOK.md
- Add Webhook delivery tracking (lastError, lastDeliveredAt, totalDelivered, totalFailed)
- Hide webhook secret in GET responses (only hasSecret boolean)"

# Merge to main
git checkout main
git merge --no-ff round-4-security-hardening

# Push to GitHub (NEVER use --force)
git push origin main

# Verify push succeeded
git rev-parse HEAD
git ls-remote origin refs/heads/main | awk '{print $1}'
# These MUST match
```

---

## Phase 10 — GitHub Actions

Inspect `.github/workflows/`:

```bash
ls .github/workflows/
cat .github/workflows/deploy.yml
```

Ensure the workflow:

1. Triggers on `push` to `main`
2. Checks out the exact commit (not `latest`)
3. Runs `bun install`, `bun run build`, `prisma migrate deploy` (or `db push`)
4. Deploys to VPS via SSH or rsync
5. Restarts the production process
6. Runs a health check (`curl -f https://yourdomain.com/api/health`)
7. **Fails the workflow if any step fails** — no `|| true` masking

If the workflow masks errors with `|| true`, remove that.

---

## Phase 11 — VPS deployment

SSH to your VPS:

```bash
ssh user@your-vps
cd /path/to/production/app   # the actual path your process manager runs from

# Verify current state
git status
git rev-parse HEAD
# Expected: 6276ae6... (or whatever was deployed before)

# Fetch and pull the new commit
git fetch origin
git checkout main
git pull --ff-only origin main

# Verify the new HEAD matches GitHub
git rev-parse HEAD
# Expected: the SHA you pushed in Phase 9
```

Install + build on VPS:

```bash
# Install deps
bun install --production=false   # need devDeps for build

# Run safe database migration (NOT migrate reset — that destroys data)
bunx prisma migrate deploy   # if you have migrations
# OR
bunx prisma db push --accept-data-loss   # if you use db push (safe — only adds columns)

# Build
bun run build

# Restart the production process
# If using PM2:
pm2 restart your-app-name

# If using systemd:
sudo systemctl restart your-app-name

# If using a custom script:
# (use whatever your existing process manager is)
```

---

## Phase 12 — Verify the deployment

### 12.1 Process status

```bash
pm2 list                       # or: systemctl status your-app
pm2 describe your-app-name
pm2 logs your-app-name --lines 100 --nostream
# Verify: status = online, no crash loop, no DB errors in logs
```

### 12.2 Health check (local on VPS)

```bash
curl -i http://127.0.0.1:3000/api/health
# Expected: HTTP 200, {"status":"ok","timestamp":"..."}
```

### 12.3 Health check (HTTPS public domain)

```bash
curl -i https://your-domain.com/api/health
# Expected: HTTP 200, valid TLS cert, {"status":"ok",...}
```

### 12.4 SHA verification

```bash
# On VPS
git rev-parse HEAD
# On GitHub (via API or website)
curl -s https://api.github.com/repos/your-org/your-repo/commits/main | python3 -c "import json,sys; print(json.load(sys.stdin)['sha'])"
# These MUST match
```

### 12.5 Live event chain test

```bash
# Login (use the ADMIN_SEED_PASSWORD you set)
TOKEN=$(curl -s -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@marketingos.com\",\"password\":\"$ADMIN_SEED_PASSWORD\"}" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Create a test lead
LEAD_ID=$(curl -s -X POST https://your-domain.com/api/crm/leads \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"Production Test Lead","email":"prod-test@example.com","source":"Website"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['lead']['id'])")

sleep 2

# Verify notification was created
curl -s -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/notifications?limit=5
# Expected: a notification with type=lead.created and title="New lead created"

# Verify audit log was written
curl -s -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/audit-logs?limit=5
# Expected: an audit log entry with action=lead.created

# Verify activity feed entry
curl -s -H "Authorization: Bearer $TOKEN" "https://your-domain.com/api/activity-feed?limit=5"
# Expected: an activity with type=lead.created

# Cleanup the test lead
curl -s -X DELETE "https://your-domain.com/api/crm/leads/$LEAD_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 12.6 Cross-company isolation test

```bash
# Create a second company + user (via Prisma studio or direct DB)
# Then login as that user and try to access Company A's data

TOKEN_B=$(curl -s -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user-b@company-b.com","password":"..."}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")

# Try to fetch Company A's leads — should return empty list (filtered by companyId)
curl -s -H "Authorization: Bearer $TOKEN_B" https://your-domain.com/api/crm/leads
# Expected: {"leads":[]} — no leads from Company A leak through

# Try to access a Company A lead by ID — should 404
curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN_B" \
  https://your-domain.com/api/crm/leads/$COMPANY_A_LEAD_ID
# Expected: 404
```

### 12.7 SSRF test on production

```bash
# Try to register a webhook to localhost — should be rejected
curl -s -X POST https://your-domain.com/api/settings/webhooks \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"url":"http://127.0.0.1:9999","events":["lead.created"]}'
# Expected: {"error":"URL not allowed: IP 127.0.0.1 is in a blocked range"}
```

### 12.8 CSV injection test on production

```bash
# Create a lead with a malicious name
curl -s -X POST https://your-domain.com/api/crm/leads \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"=cmd|/c calc!A1","email":"csv-test@example.com","source":"Website"}'

# Export and verify the name is prefixed with single-quote
curl -s -H "Authorization: Bearer $TOKEN" https://your-domain.com/api/leads/export | grep "=cmd"
# Expected: '=cmd|/c calc!A1,... (single-quote prefix)
```

### 12.9 Cmd+K palette test

Open `https://your-domain.com` in a browser, login, press Ctrl+K (or Cmd+K on Mac). Verify the command palette opens with all 18 nav commands.

### 12.10 Notifications bell test

Click the bell icon in the header. Verify the dropdown shows real notifications (from the test lead you created in 12.5).

---

## Phase 13 — Update the final report

After all the above passes, edit `docs/FINAL-PRODUCTION-VERIFICATION-REPORT.md` and replace:

```
PRODUCTION NOT VERIFIED
```

with:

```
PRODUCTION VERIFIED
```

Fill in section J with the actual SHAs:

```
GITHUB MAIN: <the SHA you pushed in Phase 9>
VPS:         <the SHA from `git rev-parse HEAD` on the VPS>
MATCH:       YES
```

---

## Phase 14 — Final gate checklist

Before claiming PRODUCTION VERIFIED, every box must be ticked:

```
[ ] Canonical application identified — docs/CANONICAL-APPLICATION.md written
[ ] english-aloeducation/ disposition documented (kept / archived / removed)
[ ] Database strategy verified (SQLite dev, PostgreSQL prod or SQLite both)
[ ] db/custom.db untracked from git
[ ] .env untracked from git
[ ] upload/*.zip and other build artifacts untracked from git
[ ] Hardcoded admin password replaced with ADMIN_SEED_PASSWORD env var
[ ] SSRF protection on webhook registration + delivery tested
[ ] HMAC-SHA256 timestamped signatures on webhook delivery verified
[ ] CSV export formula-injection protection tested
[ ] CSV import formula-injection protection tested
[ ] Email validation on CSV import tested
[ ] Cmd/Ctrl+K command palette tested in browser
[ ] Notification bell dropdown shows real data
[ ] Sidebar views (Messages, Announcements, Audit Logs) render with real data
[ ] All Round-2 endpoints return 200 with real data
[ ] Event chain tested (lead.created → notification + audit + activity + webhook)
[ ] Cross-company isolation tested (Company B cannot see Company A data)
[ ] Secret scan passed (git diff --cached shows no secrets)
[ ] Typecheck passed
[ ] Lint passed
[ ] Production build passed
[ ] Committed to main (no force-push, no rewrite)
[ ] git push origin main succeeded
[ ] GitHub HEAD == local HEAD
[ ] VPS git pull succeeded
[ ] VPS HEAD == GitHub HEAD
[ ] Production process online (pm2 / systemd)
[ ] Health endpoint returns 200 on VPS
[ ] Health endpoint returns 200 on HTTPS public domain
[ ] Live event chain test on production passed
[ ] Cross-company isolation test on production passed
[ ] SSRF test on production rejected localhost
[ ] CSV injection test on production neutralized formula
```

Only after all boxes are ticked may you report:

```
PRODUCTION VERIFIED
```

---

## Phase 15 — Rotate the exposed admin password (if applicable)

If the old hardcoded password (`admin123` or whatever was in `english-aloeducation/prisma/seed.ts`) was ever used in any real environment — even a staging environment — you must rotate it:

1. Generate a new strong password: `openssl rand -base64 24`
2. Set `ADMIN_SEED_PASSWORD=<new-password>` in your production `.env`
3. Restart the app
4. Run `bunx tsx prisma/seed.ts` to update the admin user's password hash (the seed uses `upsert` so it won't duplicate)
5. Verify login with the new password
6. **Do not commit the new password to git** — it lives only in the `.env` on the VPS

---

## What the sandbox cannot do for you

| Action | Why | Who must do it |
|--------|-----|----------------|
| Push to your GitHub repo | No git remote configured | You, with `git push origin main` |
| SSH to your VPS | No SSH credentials | You, with `ssh user@your-vps` |
| Test HTTPS on your domain | No public domain in sandbox | You, with `curl https://your-domain.com/api/health` |
| Test cross-company isolation | Only one company in sandbox | You, with a second company + user |
| Inspect `english-aloeducation/` | Doesn't exist in sandbox | You, on your real repo |
| Integrate commit `38d019d` | Doesn't exist in sandbox | You, with `git cherry-pick 38d019d` |
| Rotate the exposed password | Requires production access | You, with `openssl rand -base64 24` |

This runbook gives you every step. Execute it in order. Don't skip phases.
