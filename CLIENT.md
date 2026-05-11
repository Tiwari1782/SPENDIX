# Spendix React Client — Full Implementation Plan

Build the complete production-grade React 18 + Vite client for Spendix with all 16 pages, 12 reusable components, auth system, and centralized API layer.

## Backend Status Assessment

The backend currently implements **5 core modules** with these live endpoints:

| Module | Endpoints Available |
|--------|-------------------|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| **Summary** | `GET /api/summary/:companyId` |
| **Tools/Licenses** | `GET /api/tools/:companyId`, `GET /api/tools/:toolId/unused`, `POST /api/tools`, `PUT /api/tools/:toolId` |
| **Shadow IT** | `GET /api/shadow-it/:companyId`, `POST /api/shadow-it/parse`, `PUT /api/shadow-it/:invoiceId/add`, `PUT /api/shadow-it/:invoiceId/ignore` |
| **Renewals** | `GET /api/renewals/:companyId`, `POST /api/renewals/trigger-alerts` |
| **Offboarding** | `GET /api/offboarding/:companyId`, `PUT /api/offboarding/:employeeId/resolve` |
| **Overlaps** | `GET /api/overlaps/:companyId`, `POST /api/overlaps/detect` |
| **Employees** | `GET /api/employees/:companyId`, `POST /api/employees`, `PUT /api/employees/:employeeId/deactivate` |

> [!IMPORTANT]
> **6 advanced modules have NO backend routes yet**: Forecast, Workflows, Contracts, Benchmarks, Integrations, and User Management (Settings). The DB schema tables exist but no controllers/routes. The frontend will call these endpoints and gracefully handle 404s until the backend is built. Each of these pages will show proper error/empty states. The `api.js` service layer will define all functions so backend implementation can follow seamlessly.

> [!WARNING]
> **Auth flow**: The backend uses `POST /api/auth/register` — this endpoint does NOT exist yet in authController.js. The CreateAccount.jsx signup flow requires this. The frontend will call it and show an error if it's not implemented. Similarly, company update and user invite endpoints are not yet built.

## Open Questions

> [!IMPORTANT]
> **Registration endpoint**: The user's request says POST to `/api/auth/register` on signup. This route doesn't exist in the backend. Should I:
> 1. Build the frontend to call `/api/auth/register` and let it 404 until backend implements it? ✅ **This is my plan**
> 2. Or should I also add the backend register route?

> [!NOTE]
> **Onboarding flow**: The onboarding wizard calls integration APIs and tool creation APIs. Integration APIs don't exist yet. The wizard will use existing `POST /api/tools` for manual tool addition and gracefully handle missing integration endpoints.

---

## Proposed Changes

### Phase 1 — Project Scaffold & Foundation (7 files)

#### [NEW] [package.json](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/package.json)
- Dependencies: `react`, `react-dom`, `react-router-dom`, `framer-motion`, `react-icons`, `react-type-animation`, `recharts`, `axios`
- DevDependencies: `@vitejs/plugin-react`, `tailwindcss`, `@tailwindcss/vite`, `vite`

#### [NEW] [vite.config.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/vite.config.js)
- Proxy `/api` → `http://localhost:5000`
- React plugin

#### [NEW] [tailwind.config.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/tailwind.config.js)
- Extended theme with all design tokens (colors, fonts, shadows, radii)

#### [NEW] [index.html](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/index.html)
- Inter font from Google Fonts, all meta tags, favicon reference

#### [NEW] [src/index.css](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/index.css)
- Tailwind directives + custom CSS variables for design tokens
- Global styles, scrollbar styling, custom utility classes

#### [NEW] [src/main.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/main.jsx)
- React 18 root with `BrowserRouter` + `AuthProvider`

#### [NEW] [src/App.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/App.jsx)
- Full route definitions for all 16 pages
- `PrivateRoute` wrapper redirecting to `/login` if unauthenticated
- `PublicRoute` wrapper redirecting `/` to `/dashboard` if authenticated
- Layout component wrapping Sidebar + TopBar for authenticated pages
- AnimatePresence for route transitions

---

### Phase 2 — Services & Context (2 files)

#### [NEW] [src/services/api.js](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/services/api.js)
- Axios instance with `/api` baseURL (proxied)
- Response interceptor: redirect to `/login` on 401
- **~50 exported functions** covering all endpoints from the README API reference:
  - Auth: `login`, `logout`, `getMe`, `register`
  - Summary: `getSummary`
  - Tools: `getTools`, `getUnusedSeats`, `addTool`, `updateTool`
  - Shadow IT: `getShadowIT`, `parseInvoice`, `addShadowITToStack`, `ignoreShadowIT`
  - Renewals: `getRenewals`, `triggerAlerts`
  - Offboarding: `getOffboarding`, `resolveOffboarding`
  - Overlaps: `getOverlaps`, `detectOverlaps`
  - Employees: `getEmployees`, `addEmployee`, `deactivateEmployee`
  - Forecast: `getForecasts`, `generateForecasts`, `addSnapshot`, `getToolHistory`
  - Workflows: `getWorkflows`, `getWorkflowTasks`, `triggerWorkflow`, `updateTask`, `getTemplates`, `createTemplate`
  - Contracts: `getContracts`, `getContract`, `uploadContract`, `deleteContract`
  - Benchmarks: `getBenchmarks`, `getBenchmarkCategories`
  - Users: `getUsers`, `inviteUser`, `updateUserRole`, `removeUser`
  - Integrations: `getIntegrations`, `connectIntegration`, `syncIntegration`, `getIntegrationLogs`, `disconnectIntegration`

#### [NEW] [src/context/AuthContext.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/context/AuthContext.jsx)
- `AuthProvider` wrapping entire app
- State: `user`, `companyId`, `loading`
- On mount: calls `GET /api/auth/me` to rehydrate
- Exposes: `login(email, password)`, `logout()`, `register(data)`, `isAuthenticated`
- JWT persisted in httpOnly cookie by backend (frontend just calls API)

---

### Phase 3 — Shared Components (12 files)

#### [NEW] [src/components/SpendixLoader.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/SpendixLoader.jsx)
- Hand-drawn SVG logo mark (stylized stacked bar chart in indigo)
- Framer Motion animated rotating arc ring
- Props: `size` (sm/md/lg), `fullPage` (centers with white overlay + "Loading Spendix..." text)

#### [NEW] [src/components/SkeletonLoader.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/SkeletonLoader.jsx)
- Named exports: `SkeletonCard`, `SkeletonTable`, `SkeletonRow`, `SkeletonChart`, `SkeletonBadge`, `SkeletonText`
- All using `animate-pulse` with `bg-slate-200`

#### [NEW] [src/components/Sidebar.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/Sidebar.jsx)
- Fixed 240px, collapsible to icons-only with Framer Motion width animation
- Navigation groups: Overview, Spend Management, Risk & Compliance, Intelligence, System
- Each item: React Icon + label + active indigo indicator
- User avatar + name + logout at bottom
- Collapse toggle button

#### [NEW] [src/components/TopBar.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/TopBar.jsx)
- 64px fixed height
- Left: current page title
- Right: global search input, notification bell with badge count (from renewals API), company switcher dropdown, user avatar dropdown with profile/logout

#### [NEW] [src/components/SummaryCard.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/SummaryCard.jsx)
- Props: `title`, `value`, `color`, `icon`, `prefix` (₹)
- White card with colored left border, large value + label
- Framer Motion entrance animation

#### [NEW] [src/components/ToolTable.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/ToolTable.jsx)
- Sortable columns, status badges, waste highlighting, usage progress bar
- Action buttons: Edit, View Unused

#### [NEW] [src/components/RenewalCard.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/RenewalCard.jsx)
- Urgency color-coded: red (<30), amber (30-60), green (>60)
- Countdown display, auto-renewal badge

#### [NEW] [src/components/ShadowITTable.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/ShadowITTable.jsx)
- Table with Add to Stack / Ignore action buttons
- Parsed amount display

#### [NEW] [src/components/OverlapCard.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/OverlapCard.jsx)
- Category name, overlapping tools list with costs, combined cost
- AI recommendation in highlighted box

#### [NEW] [src/components/OffboardingAlert.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/OffboardingAlert.jsx)
- Employee name, department, tool pill badges
- Monthly risk cost, resolve button with Framer Motion exit

#### [NEW] [src/components/ForecastChart.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/ForecastChart.jsx)
- Recharts AreaChart with historical + projected lines
- Dashed separator for forecast zone

#### [NEW] [src/components/WorkflowTracker.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/WorkflowTracker.jsx)
- Kanban card for workflow instances
- Task completion ratio, trigger type badge

#### [NEW] [src/components/BenchmarkWidget.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/BenchmarkWidget.jsx)
- Recharts horizontal BarChart comparing company vs industry benchmarks
- Color-coded: green (below median), amber (between median-p75), red (above p75)

#### [NEW] [src/components/ContractUpload.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/components/ContractUpload.jsx)
- Drag-and-drop PDF zone with dashed border
- File validation: PDF only, max 10MB
- Tool selector dropdown, upload button with SpendixLoader

---

### Phase 4 — Public Pages (3 files)

#### [NEW] [src/pages/Landing.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Landing.jsx)
- **Sticky navbar**: Spendix wordmark, nav links (Features, Pricing, Integrations, About), Log in ghost button, Start Free Trial indigo button
- **Hero**: react-type-animation cycling 4 headlines, subheadline, two CTAs, animated SVG dashboard mockup with rupee savings
- **Social proof**: "Trusted by 200+ Indian companies"
- **Problem section**: 3 animated stat cards with React Icons and Framer Motion whileInView
- **Features**: 2-column grid, 11 module cards with icons, staggered Framer Motion entrance
- **Integrations**: Google Workspace, Zoho Books, Razorpay, Slack, Jira logos
- **Pricing**: 3 tiers (Starter ₹4,999, Growth ₹12,999, Enterprise Custom) with feature lists
- **Testimonials**: 3 Indian company testimonial cards
- **Footer**: logo, links, "Made in India for Indian businesses"

#### [NEW] [src/pages/CreateAccount.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/CreateAccount.jsx)
- 3-step animated progress bar:
  - Step 1: Name, email, password with strength meter
  - Step 2: Company name, domain, industry dropdown, employee range dropdown
  - Step 3: Role selection (IT Admin, Finance Head, Operations) as cards
- POST to `/api/auth/register` → redirect to `/onboarding`
- SpendixLoader on submission

#### [NEW] [src/pages/Login.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Login.jsx)
- Centered card with Spendix logo, email/password, remember me, forgot password link
- POST to `/api/auth/login`, stores JWT in context, redirects to `/dashboard`
- Framer Motion card entrance, inline error messages

---

### Phase 5 — Onboarding (1 file)

#### [NEW] [src/pages/Onboarding.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Onboarding.jsx)
- 4-step wizard:
  - Step 1: Choose tool addition method (Google Workspace connect, CSV upload, manual)
  - Step 2: Tool addition form (multiple tools before proceeding)
  - Step 3: Invite team members with email/role
  - Step 4: "Spendix is ready" celebration with Framer Motion
- All steps POST to respective API endpoints

---

### Phase 6 — Core App Pages (12 files)

#### [NEW] [src/pages/Dashboard.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Dashboard.jsx)
- 6 SummaryCards from `GET /api/summary/:companyId`
- Top Wasteful Tools mini-table from `GET /api/tools/:companyId`
- Renewals This Month from `GET /api/renewals/:companyId`
- Recent Offboarding Risks from `GET /api/offboarding/:companyId`
- SkeletonCard placeholders while loading

#### [NEW] [src/pages/Licenses.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Licenses.jsx)
- Full ToolTable with column sorting, search/filter bar
- "Add Tool" slide-over drawer (Framer Motion) with full form → POST `/api/tools`
- "View Unused" modal showing employee-level data from `/api/tools/:toolId/unused`
- SkeletonTable while loading

#### [NEW] [src/pages/ShadowIT.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/ShadowIT.jsx)
- "Parse New Invoice" panel with textarea + "Parse with Groq AI" button → POST `/api/shadow-it/parse`
- SpendixLoader while parsing, preview card for parsed results
- ShadowITTable with Add/Ignore actions
- SkeletonTable while loading

#### [NEW] [src/pages/Renewals.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Renewals.jsx)
- 90-day calendar strip at top marking renewal dates
- Sortable table with color-coded urgency
- "Trigger All Alerts" button → POST `/api/renewals/trigger-alerts`
- SkeletonTable while loading

#### [NEW] [src/pages/Offboarding.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Offboarding.jsx)
- Risk summary banner with total ex-employee count
- Table with tool pill badges, monthly risk cost
- Department filter
- "Resolve" → PUT `/api/offboarding/:employeeId/resolve` with exit animation
- SkeletonTable while loading

#### [NEW] [src/pages/Overlaps.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Overlaps.jsx)
- OverlapCards with staggered Framer Motion
- "Re-run Overlap Detection" button
- SkeletonCard while loading

#### [NEW] [src/pages/Forecast.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Forecast.jsx)
- ForecastChart (Recharts AreaChart with historical + projected)
- Per-tool forecast table with confidence badges
- "Generate Forecasts" button with SpendixLoader
- Spend snapshot form → POST `/api/forecast/snapshot`
- SkeletonChart while loading

#### [NEW] [src/pages/Workflows.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Workflows.jsx)
- Kanban board: Pending, In Progress, Completed, Overdue columns
- Card click → slide-over drawer with task checkboxes
- "Trigger New Workflow" modal
- Templates tab
- SkeletonCard while loading

#### [NEW] [src/pages/Contracts.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Contracts.jsx)
- ContractUpload zone at top (PDF drag-drop + tool selector)
- Table of contracts with parse status
- "View Parsed Data" modal with full Groq summary + extracted fields
- SkeletonTable while loading

#### [NEW] [src/pages/Benchmarks.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Benchmarks.jsx)
- BenchmarkWidget cards per category
- Horizontal bar comparison (Recharts)
- "You are overpaying in N categories" banner
- "Insufficient data" placeholder for small sample sizes
- SkeletonChart while loading

#### [NEW] [src/pages/Integrations.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Integrations.jsx)
- 5 integration cards (Google Workspace, Zoho Books, Razorpay, Slack, Jira)
- Connection status badge, last synced, Connect/Sync/Disconnect buttons
- Connect modal with integration-specific fields
- Sync history logs collapsible section

#### [NEW] [src/pages/Settings.jsx](file:///c:/MERN%20STACK/9%20-%20COURSE%20PROJECTS/SPENDIX/client/src/pages/Settings.jsx)
- 3 tabs: Company, Team, Notifications
- Company: form to update company details
- Team: user table with role management, invite modal
- Notifications: renewal alert window toggles, delivery method, SMTP config

---

## File Creation Order (40 files total)

```
client/
├── package.json                          # 1
├── vite.config.js                        # 2
├── tailwind.config.js                    # 3
├── index.html                            # 4
├── public/
│   └── favicon.ico                       # 5
├── src/
│   ├── index.css                         # 6
│   ├── main.jsx                          # 7
│   ├── App.jsx                           # 8
│   ├── services/
│   │   └── api.js                        # 9
│   ├── context/
│   │   └── AuthContext.jsx               # 10
│   ├── components/
│   │   ├── SpendixLoader.jsx             # 11
│   │   ├── SkeletonLoader.jsx            # 12
│   │   ├── Sidebar.jsx                   # 13
│   │   ├── TopBar.jsx                    # 14
│   │   ├── SummaryCard.jsx               # 15
│   │   ├── ToolTable.jsx                 # 16
│   │   ├── RenewalCard.jsx               # 17
│   │   ├── ShadowITTable.jsx             # 18
│   │   ├── OverlapCard.jsx               # 19
│   │   ├── OffboardingAlert.jsx          # 20
│   │   ├── ForecastChart.jsx             # 21
│   │   ├── WorkflowTracker.jsx           # 22
│   │   ├── BenchmarkWidget.jsx           # 23
│   │   └── ContractUpload.jsx            # 24
│   └── pages/
│       ├── Landing.jsx                   # 25
│       ├── CreateAccount.jsx             # 26
│       ├── Login.jsx                     # 27
│       ├── Onboarding.jsx                # 28
│       ├── Dashboard.jsx                 # 29
│       ├── Licenses.jsx                  # 30
│       ├── ShadowIT.jsx                  # 31
│       ├── Renewals.jsx                  # 32
│       ├── Offboarding.jsx               # 33
│       ├── Overlaps.jsx                  # 34
│       ├── Forecast.jsx                  # 35
│       ├── Workflows.jsx                 # 36
│       ├── Contracts.jsx                 # 37
│       ├── Benchmarks.jsx                # 38
│       ├── Integrations.jsx              # 39
│       └── Settings.jsx                  # 40
```

---

## Design System Enforcement

Every component will follow these exact specifications:

| Token | Value |
|-------|-------|
| Primary | `#0F172A` |
| Accent | `#6366F1` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Background | `#F8FAFC` |
| Surface | `#FFFFFF` |
| Text Primary | `#0F172A` |
| Text Muted | `#64748B` |
| Border | `#E2E8F0` |
| Font | Inter (Google Fonts) |
| Card radius | `12px` |
| Input/button radius | `8px` |
| Sidebar width | `240px` fixed |
| TopBar height | `64px` fixed |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)` |

---

## Verification Plan

### Automated
1. `cd client && npm install` — all deps install
2. `cd client && npm run dev` — Vite builds, serves on port 5173
3. No console errors on page load

### Browser Testing
1. Landing page renders with all sections, type animation plays
2. `/login` → login with `arjun.kumar@spendixdemo.com` / `spendix123`
3. Redirects to `/dashboard` with 6 summary cards loading from API
4. Navigate to all 12 app pages via sidebar
5. Licenses page: add tool drawer works, view unused modal works
6. Shadow IT: paste invoice text → parse → preview → add to stack
7. Offboarding: resolve button removes row with animation
8. Sidebar collapse/expand animation works
9. All pages show skeleton loaders during fetch
10. Unauthenticated access to `/dashboard` redirects to `/login`
