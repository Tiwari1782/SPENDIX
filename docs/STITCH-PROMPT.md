SPENDIX — GOOGLE STITCH UI PROMPT (PROFESSIONAL VERSION)
=========================================================

Design a production-grade B2B SaaS intelligence dashboard called SPENDIX.

Reference products for visual tone: Zylo (enterprise SaaS management),
Linear (issue tracker), Vercel dashboard, and Retool. The UI must feel
like a tool a CFO and a CTO would both trust with real financial data.
Data-dense, precise, zero decorative elements, zero gradients.


═══════════════════════════════════════════════
GLOBAL RULES — APPLY TO EVERY SCREEN
═══════════════════════════════════════════════

Font: Inter throughout. Import from Google Fonts.
No gradients anywhere on any element.
No shadows heavier than: 0 1px 3px rgba(0,0,0,0.08)
No border radius above 12px on cards, 8px on buttons, 9999px on badges.
Every currency value shown as: Rs. X,XX,XXX (Indian number system)
Every date shown as: DD MMM YYYY (example: 23 Jun 2025)
Desktop only. Minimum viewport 1280px. No mobile breakpoints.
Background page color: #F8FAFC
Card surface color: #FFFFFF
Primary border color: #E2E8F0 at 1px


═══════════════════════════════════════════════
COLOR SYSTEM
═══════════════════════════════════════════════

Navy       #0F172A   Sidebar background, primary headings, table headers
Indigo     #6366F1   Active states, primary buttons, links, focus rings
Emerald    #10B981   Savings figures, healthy usage, success states
Amber      #F59E0B   Renewal warnings, moderate risk, upcoming deadlines
Red        #EF4444   High waste, offboarding risk, urgent alerts
Background #F8FAFC   Page background
Surface    #FFFFFF   Cards, table rows, modals
Border     #E2E8F0   All borders
Text-1     #0F172A   Primary text
Text-2     #64748B   Secondary labels, metadata
Text-3     #94A3B8   Sidebar inactive nav labels, placeholders

Badge colors — pill shaped, 9999px radius, 11px Inter Medium:
  High Waste / Urgent:  background #FEF2F2, text #EF4444
  Moderate / Warning:   background #FFFBEB, text #F59E0B
  Healthy / Good:       background #ECFDF5, text #10B981
  Informational:        background #EEF2FF, text #6366F1


═══════════════════════════════════════════════
LAYOUT STRUCTURE
═══════════════════════════════════════════════

Fixed left sidebar: 240px wide, full viewport height, no scroll
Fixed top bar: spans main area only, 64px tall
Main content: scrollable, fills remaining width and height
No right sidebar. No bottom navigation.


═══════════════════════════════════════════════
SIDEBAR — DETAILED SPEC
═══════════════════════════════════════════════

Background: #0F172A
Width: 240px, fixed

LOGO SECTION (top, 72px tall, 20px padding):
  Left: a small square icon 28x28px with #6366F1 background,
        8px radius, white lightning bolt SVG inside
  Right of icon: "Spendix" in white, 16px, font-weight 700
  Below the wordmark: "SaaS Intelligence" in #64748B, 11px

NAVIGATION (starts 16px below logo section):
  Section label: "MAIN" in #475569, 10px, uppercase, letter-spacing 0.1em,
                 left padding 20px, margin-bottom 8px

  Nav items — 8 total in this order:
    1. Dashboard      (grid icon)
    2. Licenses       (key icon)
    3. Shadow IT      (eye-off icon)
    4. Renewals       (calendar icon)
    5. Offboarding    (user-x icon)
    6. Overlaps       (copy icon)
    7. Settings       (settings icon)

  Each nav item: full width, 44px tall, 12px border radius,
                 horizontal padding 12px, gap 12px between icon and label
  Icon: 18px, color matches label
  Inactive: label color #94A3B8, icon color #94A3B8, bg transparent
  Hover: bg #1E293B, label #CBD5E1, icon #CBD5E1
  ACTIVE (Dashboard is active): bg #6366F1, label white, icon white

  Divider 1px #1E293B, margin 12px 16px, after Settings item

  Bottom section below divider:
    "Help & Support" nav item same style as others, ghost/help-circle icon

BOTTOM USER SECTION (pinned to sidebar bottom, 20px padding):
  Separator line 1px #1E293B above this section
  Left: avatar circle 36px, bg #6366F1, white initials "AK", 13px bold
  Right of avatar:
    Top: "Arjun Kumar" white 13px font-weight 500
    Bottom: "IT Admin" #64748B 11px
  Far right: three-dots icon #475569


═══════════════════════════════════════════════
TOP BAR — DETAILED SPEC
═══════════════════════════════════════════════

Background: #FFFFFF
Height: 64px
Bottom border: 1px solid #E2E8F0
Left padding: 32px, right padding: 24px
Flex row, space-between, vertically centered

LEFT SIDE:
  Page title: "Dashboard" in #0F172A, 20px, font-weight 700
  Below title: breadcrumb "Spendix / Dashboard" in #94A3B8, 12px

RIGHT SIDE (flex row, gap 16px, aligned center):
  Search bar: 220px wide, 36px tall, bg #F1F5F9, border 1px #E2E8F0,
              8px radius, search icon left, placeholder "Search tools..."
              in #94A3B8 13px
  Bell icon: 20px, #64748B, with a small red dot badge (3 notifications)
  Divider: 1px #E2E8F0, height 24px
  Avatar: 36px circle, bg #6366F1, white initials "AK"
  Chevron-down icon: #64748B, 16px


═══════════════════════════════════════════════
DASHBOARD PAGE — DETAILED SPEC
═══════════════════════════════════════════════

Content area padding: 32px all sides
Background: #F8FAFC

── ROW 1: PAGE HEADER ──

Left: "Overview" in #0F172A 24px bold
      Below: "Last updated 2 minutes ago" in #94A3B8 12px with
             a green dot 6px indicating live
Right: Button "Export Report" — border 1px #E2E8F0, bg white,
       #0F172A text 14px, download icon left, 8px radius, 36px tall

── ROW 2: FOUR SUMMARY CARDS (equal width, gap 20px) ──

Each card:
  bg white, border 1px #E2E8F0, 12px radius, 24px padding
  Left accent bar: 3px wide, full card height, 12px left border radius only
  Card 1 accent: #6366F1 indigo
  Card 2 accent: #EF4444 red
  Card 3 accent: #10B981 emerald
  Card 4 accent: #F59E0B amber

  Top of card: label in #64748B, 11px, uppercase, letter-spacing 0.08em
  Below label: the big number, 32px, font-weight 800
  Below number: small context text in #94A3B8, 12px
  Bottom right corner: a small trend indicator arrow with % change

CARD 1 — Total Monthly Spend:
  Label: TOTAL MONTHLY SPEND
  Value: Rs. 3,40,000  color #0F172A
  Context: Across 8 active tools
  Trend: neutral gray arrow

CARD 2 — Monthly Waste:
  Label: MONTHLY WASTE
  Value: Rs. 1,12,000  color #EF4444
  Context: 32.9% of total spend
  Trend: red upward arrow (waste going up is bad)

CARD 3 — Annual Savings Potential:
  Label: ANNUAL SAVINGS POTENTIAL
  Value: Rs. 13,44,000  color #10B981
  Context: If actioned today
  Trend: green upward arrow

CARD 4 — Tools Need Attention:
  Label: TOOLS NEED ATTENTION
  Value: 3  color #F59E0B
  Context: Out of 8 tools tracked
  Trend: amber dot, no arrow

── ROW 3: TWO COLUMN LAYOUT (gap 24px) ──

LEFT COLUMN (65% width):

  Card: bg white, border 1px #E2E8F0, 12px radius, no padding on table itself

  Card header (24px padding top, left, right):
    Left: "License Waste by Tool" #0F172A 16px bold
    Right: "View All Licenses →" #6366F1 13px

  Table — flush to card edges:
    Header row: bg #0F172A, 48px tall, 12px horizontal padding
      Columns (left to right):
        Tool         — left aligned, 20% width
        Category     — left aligned, 15%
        Seats Paid   — center aligned, 12%
        Active Users — center aligned, 12%
        Idle Seats   — center aligned, 12%
        Monthly Waste— right aligned, 16%
        Status       — center aligned, 13%
      All header text: white, 11px, uppercase, letter-spacing 0.07em

    Data rows: 52px tall, 12px horizontal padding
      Alternate: white and #F8FAFC
      Bottom border each row: 1px #F1F5F9
      Hover: bg #F8FAFC transition 150ms

      ROW 1: Salesforce | CRM | 30 | 18 | 12 | Rs. 50,400 | red badge "High Waste"
        Tool cell: Salesforce logo favicon 16px + "Salesforce" text
      ROW 2: Zoom | Video | 50 | 42 | 8 | Rs. 11,200 | amber badge "Moderate"
        Tool cell: Zoom logo favicon 16px + "Zoom" text
      ROW 3: Notion | Productivity | 50 | 47 | 3 | Rs. 1,800 | green badge "Healthy"
      ROW 4: GitHub | Development | 40 | 38 | 2 | Rs. 3,400 | green badge "Healthy"
      ROW 5: Slack | Communication | 45 | 31 | 14 | Rs. 28,000 | red badge "High Waste"

      Monthly Waste column: colored by status
        High Waste rows: value in #EF4444
        Moderate rows: value in #F59E0B
        Healthy rows: value in #64748B

  Card footer (16px padding): "Showing 5 of 8 tools — View all licenses"
    link in #6366F1

RIGHT COLUMN (35% width):
  Two stacked cards with 24px gap

  CARD A — Upcoming Renewals:
    Header: "Upcoming Renewals" 16px bold #0F172A
    Subtext: "Next 90 days" #94A3B8 12px
    Body: 4 renewal items, each 56px tall with 1px #F1F5F9 divider below

    Each renewal item (horizontal, space-between):
      Left: tool favicon 16px + tool name 14px bold #0F172A
            below: renewal date 12px #64748B
      Right: countdown badge

      Item 1: Salesforce — 30 Jun 2025 — red pill "23 days"
      Item 2: Zoom — 15 Jul 2025 — amber pill "38 days"
      Item 3: Slack — 01 Aug 2025 — indigo pill "55 days"
      Item 4: GitHub — 20 Aug 2025 — indigo pill "74 days"

    Footer: "Manage all renewals →" in #6366F1 13px

  CARD B — Risk Summary:
    Header: "Active Risks" 16px bold #0F172A
    3 risk items stacked, each 48px, divider between

    Item 1: user-x icon in red circle 28px | "3 ex-employees" bold
            "still hold SaaS access" gray 12px below | "Rs. 28,000/mo" red right
    Item 2: eye-off icon in amber circle 28px | "3 shadow IT tools"
            "pending review" gray 12px | "Rs. 45,000/mo" amber right
    Item 3: copy icon in amber circle 28px | "2 overlap groups"
            "duplicate tools found" gray 12px | "Rs. 33,000/mo" amber right

    Footer button: "Review all risks →" full width, border 1px #EF4444,
                   text #EF4444, bg white, 8px radius, 36px tall

── ROW 4: FULL WIDTH ALERT BANNER ──

  bg #EEF2FF (very light indigo)
  border 1px #6366F1
  12px radius
  24px padding
  flex row, space-between, aligned center

  Left side (flex, gap 16px):
    Warning icon circle: 40px, bg #FEF3C7, amber warning triangle icon
    Text block:
      "3 ex-employees still hold active SaaS licenses" — #0F172A 14px bold
      "Revoking access could save Rs. 28,000/month and eliminate security risk"
      — #64748B 13px

  Right side:
    Button "Review Offboarding" — bg #6366F1, white text 14px,
           8px radius, 40px tall, 16px horizontal padding
           left: user-x icon white 16px


═══════════════════════════════════════════════
MICRO-INTERACTIONS AND STATES
═══════════════════════════════════════════════

All interactive elements transition at 150ms ease
Table rows: hover bg shift from white to #F8FAFC
Buttons: hover darkens bg by 8%
Nav items: hover bg #1E293B
Badge: no hover state — static display only
Cards: no hover state — static containers
Links: hover underline, color stays same


═══════════════════════════════════════════════
WHAT NOT TO DO — HARD CONSTRAINTS
═══════════════════════════════════════════════

No gradients on any element including buttons, cards, sidebar
No illustrations or decorative SVG art
No rounded corners above 12px
No box shadows above 0 1px 4px rgba(0,0,0,0.1)
No animations except 150ms transitions on hover
No bright or saturated background colors except badge pills
No centered-layout hero sections — this is a data app not a landing page
No dark mode — light theme only
No emoji in the UI
