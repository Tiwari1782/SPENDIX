# Spendix Backend Server — Implementation Plan

Build the complete Express + MySQL + Groq API backend for the Spendix SaaS spend management platform with all five core modules.

## Scope

The request focuses on the **five core modules** for the MVP:
1. **License Waste Detection** — flag seats unused for 60+ days
2. **Shadow IT Discovery** — parse invoices via Groq AI
3. **Contract Renewal Management** — alerts at 90/60/30 days
4. **Offboarding Risk Detection** — ex-employee active licenses
5. **Tool Overlap Detection** — AI-categorized redundant tools

> [!IMPORTANT]
> The README describes 11 modules total, but the user explicitly scoped this to the five core modules plus auth, cron, and server wiring. Advanced modules (Spend Forecasting, Workflows, Contract Intelligence, Benchmarks, Integrations, RBAC) are **not** in scope for this build.

## Open Questions

> [!IMPORTANT]
> **Auth routes**: The API contracts define `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me`. Should I include a full `authController.js` + `authRoutes.js` for login/logout, or only the JWT verification middleware? The user's Agent 4 description says "JWT verification via httpOnly cookies" but doesn't explicitly request login/logout endpoints. **I will include them** since the frontend needs them and the API contracts define them.

> [!NOTE]
> **Offboarding resolve endpoint**: The API contracts define `PUT /api/offboarding/:employeeId/resolve` which revokes all licenses. The user's Agent 3 description doesn't mention it, but it's in the contracts. **I will include it** for completeness.

---

## Proposed Changes

### Agent 1 — Database Architecture

#### [NEW] [schema.sql](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/db/schema.sql)
- `CREATE DATABASE IF NOT EXISTS spendix`
- 7 core tables: `companies`, `platform_users`, `saas_tools`, `employees`, `usage_logs`, `parsed_invoices`, `overlap_groups`, `renewal_alerts`
- All FKs, enums, constraints, and indexes exactly per README schema
- Tables for advanced modules (spend_snapshots, forecasts, workflows, contracts, benchmarks, integrations) included in schema for future use but NOT seeded

#### [NEW] [seed.sql](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/db/seed.sql)
- 1 company: **Spendix Demo Co** (industry: Technology, range: 100-250)
- 1 platform user: **Arjun Kumar** (it_admin, password: `spendix123` bcrypt-hashed)
- **60 employees** — 48 active, 12 inactive (deactivated_at set to dates 30-90 days ago)
- **8 SaaS tools** with realistic Indian pricing:
  | Tool | Seats | Cost/Seat | Monthly Total |
  |------|-------|-----------|---------------|
  | Salesforce | 30 | ₹4,200 | ₹1,26,000 |
  | Zoom Business | 50 | ₹1,400 | ₹70,000 |
  | Slack Pro | 60 | ₹850 | ₹51,000 |
  | GitHub Team | 25 | ₹1,500 | ₹37,500 |
  | Notion | 40 | ₹700 | ₹28,000 |
  | Google Workspace | 60 | ₹750 | ₹45,000 |
  | Jira | 30 | ₹1,200 | ₹36,000 |
  | Asana | 20 | ₹900 | ₹18,000 |
- **Usage logs**: ~250 records, engineered so 35-40% of seats show last_login > 60 days ago → **~₹1,40,000 monthly waste**
- **3 shadow IT invoices** (pending_review): Canva Pro, Loom, Notion AI
- **2 renewal alerts** for tools renewing within 30 days
- **2 overlap groups**: Video Conferencing (Zoom + Google Meet), Project Management (Jira + Asana + Notion)

#### [NEW] [connection.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/db/connection.js)
- MySQL2 promise pool singleton
- Reads `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` from env
- Exports the pool for use across all controllers

---

### Agent 2 — Groq AI Service, Shadow IT, Overlaps

#### [NEW] [groqService.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/services/groqService.js)
- Uses `groq-sdk` package, model hardcoded to `llama3-70b-8192`
- `parseInvoice(rawText)` → `{ tool_name, amount, seats, renewal_date }`
- `categorizeToolName(toolName)` → category string (e.g., `"communication"`, `"project_management"`)
- `generateOverlapRecommendation(toolsInCategory)` → human-readable consolidation advice

#### [NEW] [invoiceController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/invoiceController.js)
- Imported by shadow IT routes for the parse endpoint

#### [NEW] [shadowITController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/shadowITController.js)
- `POST /api/shadow-it/parse` — calls `groqService.parseInvoice()`, inserts into `parsed_invoices`
- `GET /api/shadow-it/:companyId` — returns all invoices with `status = 'pending_review'`
- `PUT /api/shadow-it/:invoiceId/add` — creates a new `saas_tools` entry from parsed data, sets `is_shadow_it = TRUE`, updates invoice status to `'added'`
- `PUT /api/shadow-it/:invoiceId/ignore` — updates invoice status to `'ignored'`

#### [NEW] [shadowITRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/shadowITRoutes.js)

#### [NEW] [overlapController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/overlapController.js)
- `GET /api/overlaps/:companyId` — fetches all tools, calls `groqService.categorizeToolName()` for each, groups by category, computes `combined_monthly_cost`, calls `groqService.generateOverlapRecommendation()`, persists to `overlap_groups`, returns enriched result

#### [NEW] [overlapRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/overlapRoutes.js)

#### [NEW] [invoiceRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/invoiceRoutes.js)

---

### Agent 3 — Core Business Logic

#### [NEW] [toolController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/toolController.js)
- `GET /api/tools/:companyId` — joins `saas_tools` with `usage_logs`, computes `unused_seats` (last_login > 60 days), `monthly_waste = unused_seats × monthly_cost_per_seat`, `usage_percent`, `status` (healthy/moderate/high_waste)
- `GET /api/tools/:toolId/unused` — lists employees with last_login > 60 days for a specific tool
- `POST /api/tools` — insert new tool
- `PUT /api/tools/:toolId` — update tool fields

#### [NEW] [toolRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/toolRoutes.js)

#### [NEW] [employeeController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/employeeController.js)
- `GET /api/employees/:companyId` — list all employees
- `POST /api/employees` — add employee
- `PUT /api/employees/:employeeId/deactivate` — sets `is_active = FALSE`, `deactivated_at = CURDATE()`

#### [NEW] [employeeRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/employeeRoutes.js)

#### [NEW] [offboardingController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/offboardingController.js)
- `GET /api/offboarding/:companyId` — returns usage_logs where employee `is_active = FALSE` and `has_license = TRUE`, grouped by employee with tool details
- `GET /api/tools/:toolId/offboarding` — same but filtered to one tool
- `PUT /api/offboarding/:employeeId/resolve` — sets `has_license = FALSE` for all usage_logs of this employee

#### [NEW] [offboardingRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/offboardingRoutes.js)

#### [NEW] [renewalController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/renewalController.js)
- `GET /api/renewals/:companyId` — tools with `renewal_date` within next 90 days, sorted by urgency
- `POST /api/renewals/trigger-alerts` — manually triggers alertService

#### [NEW] [renewalRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/renewalRoutes.js)

#### [NEW] [summaryController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/summaryController.js)
- `GET /api/summary/:companyId` — aggregates:
  - `total_monthly_spend` = SUM of all tool costs
  - `total_monthly_waste` = SUM of waste across tools  
  - `annual_savings_potential` = monthly_waste × 12
  - `shadow_it_count` = COUNT of pending_review invoices
  - `offboarding_risk_count` = COUNT of active licenses on inactive employees
  - `upcoming_renewals` = COUNT of tools renewing within 30 days

#### [NEW] [summaryRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/summaryRoutes.js)

---

### Agent 4 — Infrastructure & Wiring

#### [NEW] [alertService.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/services/alertService.js)
- Nodemailer transporter with Gmail SMTP config from env
- `sendRenewalAlert(tool, alertType)` — sends email, checks `renewal_alerts` table to prevent duplicates, logs each successful send

#### [NEW] [renewalCron.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/cron/renewalCron.js)
- `node-cron` scheduled at `'0 8 * * *'` (daily 8:00 AM)
- Queries tools with `renewal_date` within 90 days
- Determines which alert tier (90/60/30 day) applies
- Calls `alertService.sendRenewalAlert()` for each

#### [NEW] [auth.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/middleware/auth.js)
- Reads JWT from `req.cookies.token`
- Verifies with `JWT_SECRET` from env
- Sets `req.user` with decoded payload
- Returns 401 if missing/invalid

#### [NEW] [authController.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/controllers/authController.js)
- `POST /api/auth/login` — validates email/password against `platform_users`, sets httpOnly cookie
- `POST /api/auth/logout` — clears cookie
- `GET /api/auth/me` — returns current user from JWT

#### [NEW] [authRoutes.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/routes/authRoutes.js)

#### [NEW] [errorHandler.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/middleware/errorHandler.js)
- Global Express error handler
- Returns `{ error: true, message, code }` format per API contracts

#### [NEW] [index.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/index.js)
- Loads dotenv
- Creates Express app
- Registers: `cookie-parser`, `cors`, `express.json()`
- Mounts all route files under `/api`
- Attaches `errorHandler` as last middleware
- Starts renewal cron on boot
- Listens on `process.env.PORT` (default 5000)

#### [NEW] [package.json](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/server/package.json)
- Dependencies: `express`, `mysql2`, `groq-sdk`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `nodemailer`, `node-cron`, `dotenv`
- DevDependencies: `nodemon`
- Scripts: `"dev": "nodemon index.js"`, `"start": "node index.js"`

#### [NEW] [.env.example](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/.env.example)
- All 15 keys specified in the user's request

---

## File Creation Order

```
server/
├── package.json                     # 1. Project manifest
├── db/
│   ├── connection.js                # 2. MySQL pool singleton
│   ├── schema.sql                   # 3. Full DB schema
│   └── seed.sql                     # 4. Demo data
├── services/
│   ├── groqService.js               # 5. All Groq AI calls
│   └── alertService.js              # 6. Email alert service
├── middleware/
│   ├── auth.js                      # 7. JWT verification
│   └── errorHandler.js              # 8. Global error handler
├── controllers/
│   ├── authController.js            # 9. Login/logout/me
│   ├── toolController.js            # 10. License waste logic
│   ├── employeeController.js        # 11. Employee CRUD
│   ├── offboardingController.js     # 12. Ex-employee flags
│   ├── renewalController.js         # 13. Renewal alerts
│   ├── summaryController.js         # 14. Dashboard aggregation
│   ├── shadowITController.js        # 15. Shadow IT detection
│   ├── invoiceController.js         # 16. Invoice parsing
│   └── overlapController.js         # 17. Tool overlap detection
├── routes/
│   ├── authRoutes.js                # 18. Auth routes
│   ├── toolRoutes.js                # 19. Tool routes
│   ├── employeeRoutes.js            # 20. Employee routes
│   ├── offboardingRoutes.js         # 21. Offboarding routes
│   ├── renewalRoutes.js             # 22. Renewal routes
│   ├── summaryRoutes.js             # 23. Summary routes
│   ├── shadowITRoutes.js            # 24. Shadow IT routes
│   ├── overlapRoutes.js             # 25. Overlap routes
│   └── invoiceRoutes.js             # 26. Invoice routes
├── cron/
│   └── renewalCron.js               # 27. Daily renewal job
└── index.js                         # 28. Server entry point

.env.example                         # 29. Environment template
```

---

## Verification Plan

### Automated Tests
1. `cd server && npm install` — verify all dependencies install without errors
2. `cd server && node -e "require('./index.js')"` — verify server boots without crashes (will fail DB connection without MySQL but should not throw syntax errors)
3. Verify all route files import correctly

### Manual Verification
1. Run `mysql -u root -p < server/db/schema.sql` → no errors
2. Run `mysql -u root -p spendix < server/db/seed.sql` → no errors
3. `cd server && npm run dev` → server starts on port 5000
4. Test key endpoints with curl/Postman:
   - `GET http://localhost:5000/api/summary/1`
   - `GET http://localhost:5000/api/tools/1`
   - `GET http://localhost:5000/api/renewals/1`
   - `GET http://localhost:5000/api/offboarding/1`
