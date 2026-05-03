# DECISIONS.md — Technical Decision Log

Every major technical decision made during Spendix development.
Written so any team member, judge, or future contributor understands why things are the way they are.

---

## Decision 1 — MySQL over MongoDB

Date: Project start

Chosen: MySQL with mysql2

Rejected: MongoDB with Mongoose

Why:
The core logic of Spendix is relational. Every meaningful query joins multiple tables —
unused seats requires joining saas_tools with usage_logs, offboarding risk requires
joining usage_logs with employees, overlap detection groups saas_tools by category.
These are three-table JOINs that are one SQL query each. In MongoDB they become
nested $lookup aggregation pipelines that are harder to write, harder to debug,
and offer no performance advantage at this scale (under 100,000 rows).
MySQL also enforces foreign key constraints which prevents orphaned records —
an important data integrity guarantee for financial data.

---

## Decision 2 — Groq over OpenAI

Date: Project start

Chosen: Groq API with llama3-70b-8192

Rejected: OpenAI GPT-4, Anthropic Claude API

Why:
Groq offers the fastest LLM inference available — responses in under 500ms vs
2-4 seconds for OpenAI GPT-4. For invoice parsing during a live demo, speed
is visible to the audience. Groq's free tier is also significantly more generous
than OpenAI's, removing cost as a concern during development and demos.
llama3-70b-8192 handles structured JSON extraction accurately enough for invoice
parsing with a well-written system prompt. If accuracy becomes an issue at
production scale, switching the model inside groqService.js is a one-line change.

---

## Decision 3 — node-cron over Bull/BullMQ

Date: Phase 4 — Renewal Management

Chosen: node-cron

Rejected: Bull, BullMQ, Agenda

Why:
Bull and BullMQ require Redis as a dependency, adding infrastructure complexity
that is unnecessary for a single daily cron job. node-cron runs in the same
Node.js process as Express, requires zero additional infrastructure, and is
sufficient for a job that runs once per day. If Spendix scales to thousands of
companies requiring real-time job queuing, migrating to BullMQ is straightforward.
For the current scope it is over-engineering.

---

## Decision 4 — JWT in httpOnly Cookie over localStorage

Date: Phase 1 — Auth

Chosen: JWT stored in httpOnly cookie

Rejected: JWT stored in localStorage, JWT stored in sessionStorage

Why:
Storing JWT in localStorage exposes it to XSS attacks — any injected JavaScript
can read localStorage and steal the token. httpOnly cookies are inaccessible to
JavaScript entirely, eliminating this attack vector. The trade-off is that
cookie-based auth requires CSRF protection in production, but for a same-origin
deployment this is straightforward to implement. Security takes priority over
implementation convenience for a product handling financial data.

---

## Decision 5 — Vite over Create React App

Date: Phase 1 — Frontend setup

Chosen: Vite 5

Rejected: Create React App

Why:
Create React App is officially unmaintained as of 2023. Vite offers significantly
faster hot module replacement during development and faster production builds.
The developer experience difference is material — Vite HMR updates in under
100ms vs CRA's 2-5 second rebuilds on a medium-size project. Vite is now the
industry standard starting point for React projects.

---

## Decision 6 — Tailwind CSS over CSS Modules or Styled Components

Date: Phase 1 — Frontend setup

Chosen: Tailwind CSS

Rejected: CSS Modules, Styled Components, plain CSS

Why:
With three team members working on frontend simultaneously, Tailwind's utility
classes enforce a shared design constraint without requiring coordination on
class naming or file organization. Styled Components adds a runtime overhead
and requires a learning curve. CSS Modules require context-switching between
JSX and CSS files. Tailwind keeps styles co-located with markup, making
component review in PRs straightforward — you see the style and the structure
together in one file.

---

## Decision 7 — All Groq Calls Centralized in groqService.js

Date: Phase 3 — Shadow IT

Chosen: Single groqService.js file for all AI calls

Rejected: Calling Groq directly in individual controllers

Why:
Groq API calls need consistent error handling, consistent model configuration,
and consistent JSON parsing logic. If we switch models or add retry logic,
one file changes instead of hunting through every controller. It also makes
it impossible for a team member to accidentally put the GROQ_API_KEY in
a client-side file — the service is server-side only and the key never
leaves that context.

---

## Decision 8 — Single Company Per Account for MVP

Date: Project start

Chosen: Single company per login session

Rejected: Multi-tenant with company switching

Why:
Multi-tenancy requires row-level security on every query, company-scoped
middleware, and significantly more complex auth logic. For an MVP targeting
one customer at a time, single-tenant keeps every query simple and eliminates
an entire class of security bugs (company A seeing company B's data).
The schema supports multi-tenancy (every table has company_id) so adding
a company-switching UI later is a frontend change, not a database migration.

---

## Decision 9 — 60 Day Inactivity Threshold for Unused Seats

Date: Phase 2 — License Waste

Chosen: 60 days since last login

Rejected: 30 days, 90 days

Why:
30 days catches people on leave, on a long project where a specific tool is
temporarily unused, or on vacation. This creates too many false positives
and erodes trust in the platform. 90 days is too conservative — a seat
unused for 3 months is clearly wasted. 60 days (approximately 2 months)
is the threshold used by Zylo and Zluri and aligns with standard SaaS
procurement guidance from Gartner. It is also configurable in a future
version via company settings.

---

## Decision 10 — Nodemailer over SendGrid or Resend

Date: Phase 4 — Renewal Alerts

Chosen: Nodemailer with SMTP

Rejected: SendGrid API, Resend API, AWS SES

Why:
SendGrid and Resend require API key registration, domain verification,
and DNS record setup — all unnecessary friction for a product in development.
Nodemailer with Gmail SMTP works immediately with just a Gmail account and
an app password. For production scale, swapping Nodemailer for SendGrid
is a change in alertService.js only — the rest of the system does not care
how the email is sent.
