# CHANGELOG.md

All notable changes to Spendix are documented here.
Format: [version] — date — description

---

## [Unreleased]

### In Progress
- Phase 2: New Modules — Spend Forecasting, Workflows, Contract Intelligence, Benchmarks, RBAC, Integrations

---

## [0.2.0] — 2025-06-08

### Added
- **Spend Forecasting module** — monthly spend snapshots per tool, Groq-powered 3-month projections, confidence levels, consumption-based billing tracking (API calls, GB, messages)
- **Provisioning Workflow module** — onboarding/offboarding task generation via Groq, workflow templates per department, task assignment to IT emails, overdue detection cron job
- **Contract Intelligence module** — PDF upload endpoint, Groq extraction of auto-renewal clauses, notice periods, price escalation, penalty terms, support SLA, full contract summary
- **Peer Benchmarking module** — anonymized spend-per-employee benchmarks by category, industry, and company size range, position indicator (below_median / above_p75)
- **Role-Based Access module** — platform_users table, four roles (it_admin, finance_viewer, dept_head, read_only), RBAC middleware on all routes
- **Integrations module** — Google Workspace, Zoho Books, Razorpay, Slack webhook, Jira task sync, integration_sync_logs table, encrypted credential storage
- `forecastCron.js` — weekly snapshot cron job running every Sunday at midnight
- `workflowCron.js` — daily overdue task detection and reminder cron job
- `forecastService.js`, `workflowService.js`, `contractParseService.js`, `benchmarkService.js`, `integrationService.js` added to server/services
- `ForecastChart.jsx`, `WorkflowTracker.jsx`, `BenchmarkWidget.jsx`, `ContractUpload.jsx` added to client/components
- Forecast, Workflows, Contracts, Benchmarks, Integrations pages added to client/pages
- `INTEGRATIONS.md` added to docs — full setup guide for all five integrations
- New environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SLACK_WEBHOOK_URL`, `SLACK_BOT_TOKEN`, `JIRA_BASE_URL`, `JIRA_API_TOKEN`, `JIRA_USER_EMAIL`, `CREDENTIALS_ENCRYPTION_KEY`

### Changed
- `companies` table — added `industry` and `employee_count_range` columns for benchmarking
- `saas_tools` table — added `owner_user_id` FK, `billing_model` extended with `consumption` value
- `employees` table — added `job_title` and `manager_email` columns
- `usage_logs` table — added `data_source` and `synced_at` columns
- Auth now references `platform_users` table instead of a single hardcoded admin
- `PUT /api/employees/:id/deactivate` now returns `workflow_instance_id` in response
- Summary endpoint now includes `pending_workflow_tasks` and `contracts_expiring_soon`
- Groq tasks expanded from 3 to 6 (added: spend forecast, contract parse, workflow generation)

### Database
- Added 10 new tables: `platform_users`, `spend_snapshots`, `spend_forecasts`, `workflow_templates`, `workflow_instances`, `workflow_tasks`, `contracts`, `benchmark_data`, `integrations`, `integration_sync_logs`
- Total table count: 17 (was 7)

---

## [0.1.0] — 2025-06-06

### Added
- Phase 1 foundation complete
- MySQL schema with 7 tables: `companies`, `saas_tools`, `employees`, `usage_logs`, `parsed_invoices`, `overlap_groups`, `renewal_alerts`
- JWT auth with httpOnly cookie, 7-day expiry, bcrypt password hashing
- Express server skeleton with all routes registered
- **License Waste Detection** — `GET /api/tools/:companyId` with unused seats and waste calculation
- **Shadow IT Discovery** — `POST /api/shadow-it/parse` using Groq invoice parsing
- **Contract Renewal Management** — `GET /api/renewals/:companyId` with urgency levels, `renewalCron.js` daily at 8 AM
- **Offboarding Risk Detection** — `GET /api/offboarding/:companyId` with active license flags
- **Tool Overlap Detection** — `POST /api/overlaps/detect` using Groq categorization
- `groqService.js` with 3 tasks: invoice parse, tool categorization, overlap recommendation
- `alertService.js` with Nodemailer renewal email
- Demo seed data: 60 employees, 8 tools, Rs. 1,40,000 monthly waste, 3 shadow IT tools
- React + Vite frontend shell with Tailwind CSS
- Dashboard, Licenses, ShadowIT, Renewals, Offboarding, Overlaps, Settings pages
- `AuthContext.jsx` and `api.js` service layer

---

## How to Update This File

When you merge a PR to main, add an entry here under the correct version.
Use these categories:

- Added — new features or files
- Changed — changes to existing functionality
- Fixed — bug fixes
- Removed — removed features or files
- Security — security-related changes
- Database — schema changes (always call out table additions or column changes)
