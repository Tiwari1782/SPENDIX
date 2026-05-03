## What This PR Does

<!-- One line description of what changed -->

## Module Affected

- [ ] Foundation / Auth
- [ ] License Waste Detection
- [ ] Shadow IT Discovery
- [ ] Renewal Management
- [ ] Offboarding Risk
- [ ] Tool Overlap Detection
- [ ] UI / Components
- [ ] Database / Schema
- [ ] Config / Docs

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Database change
- [ ] Config or documentation update

---

## Pre-Merge Checklist

### Backend
- [ ] All new routes have `authMiddleware` attached
- [ ] All SQL uses `?` parameterized placeholders — zero string concatenation
- [ ] All Groq calls are inside `server/services/groqService.js` only
- [ ] DB connection imported from `server/db/connection.js` — no new connections created
- [ ] Every async controller function has try/catch
- [ ] No `console.log` left in controller files
- [ ] No secret values hardcoded anywhere

### Frontend
- [ ] All API calls go through `client/src/services/api.js` — none inside components
- [ ] Every new page has a loading state
- [ ] Every new page has an error state
- [ ] No `GROQ_API_KEY`, `JWT_SECRET`, or `DB_PASSWORD` in any client file
- [ ] `cd client && npm run build` passes with zero errors

### General
- [ ] `.env` is not staged — verified with `git status`
- [ ] Branch is up to date with `main`
- [ ] Self-reviewed the diff before opening this PR

---

## Screenshots (if UI change)

<!-- Paste before/after screenshots here -->

## Notes for Reviewer

<!-- Anything the reviewer should know, edge cases, known issues -->
