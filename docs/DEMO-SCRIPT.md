# DEMO-SCRIPT.md — Presentation Walkthrough

Total time: 7 minutes. Practice this until it is smooth.
One person drives the laptop. One person talks. Third person handles questions.

---

## Before the Demo Starts

- App is open and logged in at the Dashboard as `it_admin`
- Seed data is loaded — verify Monthly Waste card shows Rs. 1,12,000
- Browser is zoomed to 90% so the full dashboard fits without scrolling
- Close all other browser tabs
- Terminal windows hidden
- Have a sample invoice text ready to paste in Step 3
- Have a sample PDF contract ready to upload in Step 6

---

## Opening Line (15 seconds)

"Every company here pays for software. Most of them are paying for software
nobody uses. In India alone, mid-size companies waste crores every year on
idle SaaS licenses, tools they forgot to cancel, and software still assigned
to employees who left six months ago. We built Spendix to fix that —
and then we went further."

---

## Step 1 — Dashboard (30 seconds)

Point to the Monthly Waste card.

"This company is wasting Rs. 1,12,000 every month. That is Rs. 13 lakh
every year sitting completely idle. There are also 7 overdue offboarding
tasks and 2 contracts expiring soon. Every number on this dashboard is
a problem the IT manager does not know about yet."

---

## Step 2 — Licenses Page (60 seconds)

Click Licenses in the sidebar.

"Here is every tool they pay for — purchased seats versus actual logins
in the last 60 days."

Point to the Salesforce row — 12 idle seats, Rs. 50,400 waste.

"Salesforce. 30 seats. 18 people logged in. 12 seats idle at Rs. 4,200 each.
That is Rs. 50,400 per month going to Salesforce for nothing."

Click the Salesforce row to expand the idle employee list.

"Names, departments, and last login dates. Send this to Salesforce today
and downgrade the plan."

---

## Step 3 — Shadow IT (45 seconds)

Click Shadow IT in the sidebar.

"Shadow IT. Tools that individual teams bought that IT has no record of.
Watch this."

Paste the sample invoice text into the input box. Hit Submit.

"Groq AI just read that invoice and extracted the tool name, amount, seat
count, and renewal date in under 3 seconds. One click and it is in the
official stack. This company had Rs. 45,000 per month in invisible tools."

---

## Step 4 — Renewals (30 seconds)

Click Renewals in the sidebar.

"Salesforce renews in 23 days. Auto-renewal is on. Rs. 6 lakh goes out
for another year of a tool they are 40% underusing. Spendix alerted
them at 90 days, 60 days, and again today. No excuse to miss it."

---

## Step 5 — Offboarding + Workflows (60 seconds)

Click Offboarding in the sidebar.

"Three employees left. Their Salesforce login, their Notion seat, their
GitHub access — still active. Still billed. Still a security risk."

Click into one ex-employee to show the workflow panel.

"But now watch what happens when you click Resolve. Spendix does not
just flag the problem — it generates a full deprovisioning task list
automatically using AI. Each task is assigned to the right person
by email. IT gets a checklist, not a problem."

Point to the task status tracker.

"Every step is tracked. Completed, pending, overdue. Full audit trail.
31% of companies have had ex-employees access live systems after leaving.
This closes that gap."

---

## Step 6 — Contract Intelligence (45 seconds)

Click Contracts in the sidebar.

"Now for something no other affordable tool does. Upload a vendor
contract PDF."

Upload the sample contract PDF.

"Groq AI just read that contract and extracted the auto-renewal clause,
the 30-day notice period, the 7.5% annual price escalation, and the
early termination penalty — in seconds. Every IT manager has signed
a contract they did not fully read. Spendix reads it for them."

---

## Step 7 — Benchmarks (30 seconds)

Click Benchmarks in the sidebar.

"This company is spending 50% more per employee on communication tools
than the median company their size in their industry. That is a data-backed
argument to consolidate or renegotiate. Zylo charges $2,000 a month partly
to provide this kind of benchmark data. We surface it from our own
customer base and include it in every plan."

---

## Step 8 — Overlaps (20 seconds)

Click Overlaps in the sidebar.

"Zoom and Google Meet. Both active. Combined Rs. 33,000 per month.
AI detected the overlap automatically. One recommendation, one action."

---

## Closing (30 seconds)

Go back to Dashboard.

"In seven minutes we found Rs. 13 lakh in annual waste, three security
risks, two imminent auto-renewals, a contract with a hidden price
escalation clause, and a benchmark that proves they are overpaying.
This is one company. There are 63 million SMEs in India.
Zylo charges $2,000 a month for this. We charge Rs. 6,000.
That is Spendix."

---

## Likely Questions and Answers

Q: How do you get the usage data if you cannot connect to Google Workspace?
A: Companies upload a CSV export from their SSO or enter data manually. Google Workspace OAuth integration is live — one admin approval and we pull real login data automatically.

Q: What stops a company from just doing this in a spreadsheet?
A: A spreadsheet does not parse invoices, does not AI-generate offboarding task lists, does not read contracts, does not send renewal alerts, and does not benchmark against peers. It is also a snapshot — Spendix updates continuously.

Q: How is this different from Zluri? They are Indian.
A: Zluri pivoted upmarket. Their minimum contract is for companies above 1,000 employees at $500+/month. We target 100 to 1,000 employees at Rs. 3,000 to 12,000 per month. Different customer entirely.

Q: Is the data secure?
A: All data is stored on the company's own database instance. JWT auth with httpOnly cookies. Integration credentials are AES-encrypted at rest. All queries are parameterized — no raw SQL anywhere.

Q: What is the business model?
A: Rs. 3,000 to 12,000 per month based on company size. Or 20% of first-year savings identified — a company saving Rs. 10 lakh pays us Rs. 2 lakh. The ROI conversation sells itself.

Q: The contract intelligence feature — what if the PDF is scanned?
A: V1 supports selectable-text PDFs only. Scanned contract OCR is on the roadmap. In practice, most vendor contracts are sent as selectable PDFs.

Q: How does benchmarking work with only a few customers?
A: We show benchmarks only when we have at least 5 companies in the same segment. Early customers see fewer benchmarks but we are transparent about sample size. The data gets better as the network grows — which is also a retention mechanic.
