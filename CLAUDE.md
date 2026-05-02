# Spendix — Claude Guide

## What This Project Is

Spendix is a SaaS spend intelligence platform for Indian mid-market companies.
It has five modules: license waste detection, shadow IT discovery, contract renewal management,
offboarding risk detection, and tool overlap detection.

Read full context: @README.md

---

## Commands

```bash
cd server && npm run dev        # backend on port 5000
cd client && npm run dev        # frontend on port 5173
cd client && npm run build      # production build
mysql -u root -p < server/db/schema.sql   # init DB
mysql -u root -p spendix < server/db/seed.sql  # seed demo data
```

---

## Stack — Hard Rules

- Node.js + Express backend only — no Next.js, no Fastify
- MySQL with `mysql2` package — no ORM, no Mongoose, no Prisma
- React 18 + Vite frontend — no Create React App
- Tailwind CSS for styling — no inline styles, no CSS modules
- Groq SDK for all AI — model is always `llama3-70b-8192`
- JWT in httpOnly cookie — not localStorage
- All Groq calls in `server/services/groqService.js` — nowhere else
- All fetch calls from React in `client/src/services/api.js` — never in components

---

## File Locations

| What | Where |
|------|-------|
| DB connection singleton | `server/db/connection.js` |
| All Groq calls | `server/services/groqService.js` |
| Renewal email logic | `server/services/alertService.js` |
| Daily cron job | `server/cron/renewalCron.js` |
| JWT middleware | `server/middleware/auth.js` |
| All API fetch functions | `client/src/services/api.js` |
| Auth state | `client/src/context/AuthContext.jsx` |

---

## The Five Modules — What Each Does

1. LICENSE WASTE — saas_tools joined with usage_logs, flag last_login > 60 days ago
2. SHADOW IT — parsed_invoices table, Groq parses raw invoice text, pending_review status
3. RENEWALS — saas_tools.renewal_date, cron sends email at 90/60/30 day marks
4. OFFBOARDING — usage_logs joined with employees where is_active = FALSE
5. OVERLAPS — Groq classifies each tool by category, groups same-category tools, shows combined cost

---

## Business Logic Constants — Never Change Without Discussion

- Inactive threshold: 60 days
- Renewal alert windows: 90, 60, 30 days
- Waste = unused_seats x monthly_cost_per_seat
- Annual savings = monthly_waste x 12
- Shadow IT = saas_tools.is_shadow_it = TRUE
- Offboarding risk = usage_logs.has_license = TRUE AND employees.is_active = FALSE

---

## Security Rules — Never Violate

- GROQ_API_KEY only in server/.env — never in client/
- JWT_SECRET only in server/.env — never in client/
- Never remove or bypass auth.js middleware on any route
- All SQL uses ? parameterized queries — zero string concatenation
- Never commit .env

---

## Design System

- Primary: #0F172A — text, sidebar background
- Accent: #6366F1 — buttons, active states, links
- Success: #10B981 — savings numbers, good metrics
- Warning: #F59E0B — renewal alerts, moderate risk
- Danger: #EF4444 — offboarding risk, critical alerts
- Background: #F8FAFC — page background
- Surface: #FFFFFF — cards
- Font: Inter from Google Fonts

---

## Subagents Available

| Task | Call |
|------|------|
| Check DB schema before writing SQL | `db-explorer` |
| Check if a route exists | `api-mapper` |
| Understand a React page before editing | `frontend-scout` |

## Skills Available

| Task | Load |
|------|------|
| Add a new backend resource | `add-api-resource` |
| Add a new React page | `add-react-page` |
| Add a new Groq AI task | `add-groq-task` |