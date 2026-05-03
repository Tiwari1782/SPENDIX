# INFORMATION.md — Spendix Production Reference

Everything a developer needs to understand, build, and ship Spendix.
This file never gets deleted. Update it as the project evolves.

---

## 1. What Spendix Is

Spendix is a SaaS spend intelligence platform built for Indian companies with 100 to 2,000 employees. It solves five specific financial and security problems that every mid-size company has but no affordable tool addresses.

The five problems and what Spendix does about each:

- Unused licenses — seats purchased but sitting idle, costing money every month
- Shadow IT — tools bought on personal cards or by individual teams, invisible to IT
- Missed renewals — auto-renewals hitting without warning, tools cancelled too late
- Offboarding risk — ex-employees still holding active SaaS access after they leave
- Tool overlap — two or more tools doing the same job, both being paid for

---

## 2. Who It Is For

Primary buyer: IT manager, finance lead, or CTO at an Indian company with 100 to 2,000 employees.

They are currently managing SaaS subscriptions in a spreadsheet or not managing them at all. They have no single view of what tools they pay for, who uses them, and when contracts renew. They find out about a missed renewal after the auto-charge hits their card.

They cannot afford Zylo ($2,000/month), Zluri ($500+/month), or Torii ($1,000+/month). Spendix targets Rs. 3,000 to 8,000 per month — a price any funded startup or SME can justify.

---

## 3. Full Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | React | 18 | UI |
| Build tool | Vite | 5 | Fast dev server and build |
| Styling | Tailwind CSS | 3 | Utility-first design system |
| Routing | React Router | 6 | Client-side navigation |
| Backend | Node.js | 20 LTS | Runtime |
| Framework | Express | 4 | API server |
| Database | MySQL | 8 | Primary data store |
| DB driver | mysql2 | Latest | Parameterized queries, promise API |
| AI | Groq API | Latest | Invoice parsing, tool categorization |
| AI Model | llama3-70b-8192 | — | Always this model, never change |
| Auth | JWT | — | httpOnly cookie, 7 day expiry |
| Email | Nodemailer | Latest | Renewal alert emails via SMTP |
| Scheduler | node-cron | Latest | Daily renewal check at 8 AM |
| Password | bcryptjs | Latest | Hash admin passwords |

---

## 4. Repository Structure

```
spendix/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── SummaryCard.jsx
│   │   │   ├── ToolTable.jsx
│   │   │   ├── RenewalCard.jsx
│   │   │   ├── ShadowITTable.jsx
│   │   │   ├── OverlapCard.jsx
│   │   │   ├── OffboardingAlert.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Licenses.jsx
│   │   │   ├── ShadowIT.jsx
│   │   │   ├── Renewals.jsx
│   │   │   ├── Offboarding.jsx
│   │   │   ├── Overlaps.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js            ← ALL fetch calls live here only
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── toolController.js
│   │   ├── invoiceController.js
│   │   ├── employeeController.js
│   │   ├── renewalController.js
│   │   ├── shadowITController.js
│   │   ├── offboardingController.js
│   │   └── overlapController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── toolRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── renewalRoutes.js
│   │   ├── shadowITRoutes.js
│   │   ├── offboardingRoutes.js
│   │   └── overlapRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── groqService.js        ← ALL Groq calls live here only
│   │   └── alertService.js
│   ├── db/
│   │   ├── connection.js         ← singleton, import everywhere
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── cron/
│   │   └── renewalCron.js
│   └── index.js
│
├── .claude/
│   ├── hooks/
│   ├── skills/
│   ├── agents/
│   └── settings.json
│
├── .env
├── .env.example
├── CLAUDE.md
├── README.md
└── INFORMATION.md
```

---

## 5. Database Schema — All 7 Tables

```sql
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saas_tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  seats_purchased INT DEFAULT 0,
  monthly_cost_per_seat DECIMAL(10,2) DEFAULT 0,
  total_monthly_cost DECIMAL(10,2),
  billing_model ENUM('per_seat','flat_rate','usage_based') DEFAULT 'per_seat',
  renewal_date DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  contract_term_months INT,
  vendor_contact_email VARCHAR(255),
  is_shadow_it BOOLEAN DEFAULT FALSE,
  added_by ENUM('manual','invoice_parse') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at DATE,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE usage_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  tool_id INT NOT NULL,
  last_login DATE,
  login_count_last_30_days INT DEFAULT 0,
  has_license BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id),
  UNIQUE KEY unique_employee_tool (employee_id, tool_id)
);

CREATE TABLE parsed_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  raw_text TEXT,
  parsed_tool_name VARCHAR(255),
  parsed_amount DECIMAL(10,2),
  parsed_seats INT,
  parsed_renewal_date DATE,
  status ENUM('pending_review','added','ignored') DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE overlap_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category VARCHAR(100),
  tool_ids JSON,
  combined_monthly_cost DECIMAL(10,2),
  recommendation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE TABLE renewal_alerts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tool_id INT NOT NULL,
  alert_type ENUM('90_day','60_day','30_day') NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tool_id) REFERENCES saas_tools(id)
);
```

---

## 6. All Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=spendix

JWT_SECRET=
JWT_EXPIRES_IN=7d

GROQ_API_KEY=
GROQ_MODEL=llama3-70b-8192

ALERT_EMAIL_FROM=alerts@spendix.in
ALERT_EMAIL_TO=admin@yourcompany.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## 7. All API Endpoints

### Auth
```
POST   /api/auth/login              email + password → JWT cookie
POST   /api/auth/logout             clears cookie
GET    /api/auth/me                 returns current user from token
```

### Dashboard Summary
```
GET    /api/summary/:companyId      total_spend, total_waste, annual_savings, tools_count
```

### Tools and Licenses
```
GET    /api/tools/:companyId        all tools with waste calculation per tool
GET    /api/tools/:toolId/unused    employees inactive on this tool (>60 days)
POST   /api/tools                   add tool manually
PUT    /api/tools/:toolId           update tool details
DELETE /api/tools/:toolId           remove tool
```

### Shadow IT
```
GET    /api/shadow-it/:companyId          pending parsed invoices
POST   /api/shadow-it/parse              parse invoice text via Groq
PUT    /api/shadow-it/:invoiceId/add     approve and add to stack
PUT    /api/shadow-it/:invoiceId/ignore  mark as reviewed, ignore
```

### Renewals
```
GET    /api/renewals/:companyId           tools renewing in next 90 days
POST   /api/renewals/trigger-alerts       manually trigger renewal emails
```

### Employees
```
GET    /api/employees/:companyId              all employees
POST   /api/employees                         add employee
PUT    /api/employees/:id/deactivate          mark as departed
```

### Offboarding
```
GET    /api/offboarding/:companyId    ex-employees with active licenses
PUT    /api/offboarding/:id/resolve   mark all licenses revoked for employee
```

### Overlaps
```
GET    /api/overlaps/:companyId       AI-detected tool overlap groups
POST   /api/overlaps/detect           trigger Groq categorization + grouping
```

---

## 8. Business Logic Constants

These values are used in SQL queries and frontend display.
Never change them without updating every place they appear.

| Rule | Value | Used In |
|------|-------|---------|
| Inactive threshold | 60 days since last_login | toolController, Licenses page |
| Renewal alert — early | 90 days before renewal_date | renewalCron, Renewals page |
| Renewal alert — mid | 60 days before renewal_date | renewalCron, Renewals page |
| Renewal alert — urgent | 30 days before renewal_date | renewalCron, Renewals page |
| Waste per tool | unused_seats x monthly_cost_per_seat | toolController, Summary |
| Annual savings | monthly_waste x 12 | summaryController, Dashboard |
| Shadow IT flag | saas_tools.is_shadow_it = TRUE | shadowITController |
| Offboarding risk | is_active = FALSE AND has_license = TRUE | offboardingController |

---

## 9. Groq AI — Three Tasks

All three functions live in `server/services/groqService.js`.

### Task 1 — Invoice Parsing

Input: raw invoice text pasted by user
Output: `{ tool_name, amount, seats, renewal_date, billing_model }`
System prompt must say: return ONLY valid JSON, no preamble, no markdown

### Task 2 — Tool Categorization

Input: array of tool names
Output: `[{ tool_name, category }]`
Categories to use: Communication, Video Conferencing, Project Management,
Cloud Storage, Design, HR, CRM, Development, Security, Analytics, Other

### Task 3 — Overlap Recommendation

Input: category name + list of tool names in that group + combined cost
Output: one sentence plain-English recommendation
Example: "You are paying Rs. 45,000/month for both Zoom and Google Meet —
consolidating to Google Meet alone would save Rs. 22,000/month."

---

## 10. Renewal Alert System

Cron runs daily at 8:00 AM via node-cron in `server/cron/renewalCron.js`.

Logic per run:
1. Query all tools where renewal_date is between today and 90 days from now
2. For each tool check renewal_alerts table for what has already been sent
3. Send missing alerts (90_day, 60_day, 30_day) via alertService.js
4. Insert a record to renewal_alerts after each send to prevent duplicates

Email contains: tool name, renewal date, annual cost, auto-renewal status,
direct link to the Renewals page.

---

## 11. Git Branch Structure

| Branch | Owner | Owns |
|--------|-------|------|
| `main` | All | Production only, no direct commits |
| `dev/backend-core` | Member 1 | DB, auth, all controllers, all routes, Groq service, alert service, cron |
| `dev/frontend-core` | Member 2 | Vite setup, Tailwind, design system, AuthContext, Sidebar, TopBar, all shared components, Dashboard, Licenses |
| `dev/frontend-modules` | Member 3 | ShadowIT, Renewals, Offboarding, Overlaps, Settings pages |

Member 3 starts only after Member 2 pushes:
- `client/src/services/api.js` with base fetch functions
- `client/src/components/SummaryCard.jsx`
- `client/src/components/ToolTable.jsx`

---

## 12. Design System

### Colors

| Token | Hex | Use |
|-------|-----|-----|
| Navy | #0F172A | Sidebar bg, headings, table header |
| Indigo | #6366F1 | Buttons, active nav, links, focus |
| Emerald | #10B981 | Savings, healthy usage, success |
| Amber | #F59E0B | Renewal warnings, moderate waste |
| Red | #EF4444 | High waste, offboarding risk, urgent |
| Background | #F8FAFC | Page background |
| Surface | #FFFFFF | Cards, table rows |
| Border | #E2E8F0 | Card borders, table dividers |
| Text Primary | #0F172A | Main content text |
| Text Secondary | #64748B | Labels, metadata, subtitles |
| Text Muted | #94A3B8 | Sidebar nav labels (inactive) |

### Typography

Font: Inter (Google Fonts)

| Element | Size | Weight |
|---------|------|--------|
| Display number | 32px | Bold |
| Page title | 20px | Bold |
| Section title | 16px | SemiBold |
| Table header | 12px | Medium, uppercase |
| Body | 14px | Regular |
| Small/meta | 12px | Regular |
| Badge | 11px | Medium |

### Spacing

Content padding: 32px
Card internal padding: 24px
Table row height: 52px
Sidebar width: 240px
Top bar height: 64px

### Rules

- No gradients anywhere
- No box shadows heavier than `0 1px 3px rgba(0,0,0,0.08)`
- Border radius on cards: 12px
- Border radius on buttons: 8px
- Border radius on badges: 9999px (full pill)
- All currency in Indian format: Rs. X,XX,XXX
- All dates in DD MMM YYYY format
- Desktop only for v1 — no mobile breakpoints needed

---

## 13. Demo Seed Data

The seed produces a realistic demo for any presentation.

- Company: Spendix Demo Co
- Employees: 60 total, 12 marked inactive (departed)
- Tools: 8 tools across different categories
- Usage: ~35% idle rate across all usage logs
- Shadow IT: 3 tools discovered via invoice, pending review
- Renewals due: 2 tools renewing within 30 days
- Overlap groups: 2 detected (Video Conferencing, Project Management)
- Monthly waste shown: approximately Rs. 1,40,000
- Annual savings shown: approximately Rs. 16,80,000
- Offboarding risk: 3 ex-employees with 5 active licenses, Rs. 28,000/month

---

## 14. What The Demo Should Show (Presentation Flow)

1. Login with demo credentials, land on Dashboard
2. Point to Monthly Waste card — Rs. 1,40,000 every month, Rs. 16.8L per year
3. Click Licenses — show the table, click Salesforce row, show 12 idle employees
4. Go to Shadow IT — paste a sample invoice, show Groq parse it live in seconds
5. Go to Renewals — show Salesforce renewing in 23 days with the alert
6. Go to Offboarding — show 3 ex-employees still holding licenses
7. Go to Overlaps — show Zoom + Google Meet both being paid for
8. End on Dashboard — total annual savings number, CTA to connect their real stack

Total demo time: 4 to 6 minutes.

---

## 15. Production Checklist Before Shipping

- [ ] `cd client && npm run build` completes with zero errors
- [ ] All 5 module pages load with seeded data correctly
- [ ] Renewal alert email arrives when triggered manually
- [ ] Invoice parse returns correct JSON for 3 different invoice formats
- [ ] Deactivating an employee correctly flags in Offboarding page
- [ ] Overlap detection groups tools correctly by category
- [ ] No .env committed to git — verify with `git log --all -- .env`
- [ ] No secret keys in any file inside `client/src/`
- [ ] All SQL queries use `?` parameterized placeholders
- [ ] JWT cookie is httpOnly — verify in browser DevTools Application tab
- [ ] Error responses return consistent JSON format
- [ ] Empty states render correctly when a module has no data
- [ ] All currency formatted as Rs. X,XX,XXX (Indian number system)
- [ ] All dates formatted as DD MMM YYYY

---

## 16. Monetization Model

Tier 1 — Starter: Rs. 3,000/month — up to 20 tools, 200 employees
Tier 2 — Growth: Rs. 6,000/month — up to 75 tools, 1,000 employees
Tier 3 — Scale: Rs. 12,000/month — unlimited tools and employees

Alternative pricing: 20% of first-year savings identified.
A company saving Rs. 10 lakh pays Rs. 2 lakh — one client covers costs.

---

## 17. Competitive Positioning

| Feature | Spendix | Zylo | Zluri | Torii |
|---------|---------|------|-------|-------|
| License waste detection | Yes | Yes | Yes | Yes |
| Shadow IT discovery | Yes | Yes | Yes | Yes |
| Contract renewal alerts | Yes | Yes | Yes | Yes |
| Offboarding risk flags | Yes | Yes | Yes | Partial |
| Tool overlap detection | Yes | Yes | Partial | No |
| Priced for Indian SMEs | Yes | No | No | No |
| Groq-powered invoice parse | Yes | No | No | No |
| Hindi interface | Roadmap | No | No | No |
| Price per month | Rs. 3-12K | $2,000+ | $500+ | $1,000+ |
