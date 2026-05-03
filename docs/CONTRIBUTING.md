# Contributing to Spendix

## Branch Structure

| Branch | Owner | What Goes Here |
|--------|-------|---------------|
| `main` | All | Production only. Never commit directly. |
| `dev/backend-core` | Member 1 | DB, auth, all controllers, routes, Groq service, cron |
| `dev/frontend-core` | Member 2 | Vite setup, Tailwind, shared components, Dashboard, Licenses |
| `dev/frontend-modules` | Member 3 | ShadowIT, Renewals, Offboarding, Overlaps, Settings pages |

Never commit directly to `main`. All changes go through a PR.

---

## Starting Work

```bash
# Always pull latest before starting
git checkout dev/your-branch
git pull origin dev/your-branch

# Make your changes, then stage and commit
git add .
git commit -m "feat(module): what you did"
git push origin dev/your-branch
```

---

## Commit Message Format

```
type(scope): short description

Types:   feat | fix | chore | docs | style | refactor
Scope:   auth | tools | shadow-it | renewals | offboarding | overlaps | db | ui | config
```

Examples:
```
feat(tools): add unused seat calculation query
fix(renewals): prevent duplicate alert emails
chore(db): add seed data for overlap groups
docs(readme): update API route table
style(ui): fix Licenses table row hover color
```

---

## Before Opening a PR

Run these locally. If any fail, fix before opening the PR.

```bash
# Frontend build must pass
cd client && npm run build

# Verify .env is not staged
git status

# Check no secrets in client files
grep -r "GROQ_API_KEY" client/src/
grep -r "JWT_SECRET" client/src/
```

---

## PR Rules

- Every PR must fill out the pull_request_template.md checklist fully
- Every PR needs at least one other member to review before merging
- CI must be green before merging — no exceptions
- PRs to `main` must include a CHANGELOG.md entry

---

## Code Rules — Non Negotiable

- All SQL uses `?` parameterized placeholders — never template literals
- All Groq calls go in `server/services/groqService.js` only
- All fetch calls go in `client/src/services/api.js` only
- All routes must have `authMiddleware` from `server/middleware/auth.js`
- DB connection only from `server/db/connection.js` — never create a new one
- No `console.log` in controller files before merging
- No secrets in any file inside `client/src/`

---

## Merge to Main

Only merge to `main` when an entire phase is complete and tested end to end with the seed data. Partial features do not go to `main`.
