# DEMO-SCRIPT.md — Presentation Walkthrough

Total time: 5 minutes. Practice this until it is smooth.
One person drives the laptop. One person talks. Third person handles questions.

---

## Before the Demo Starts

- App is open and logged in at the Dashboard
- Seed data is loaded — verify Monthly Waste card shows Rs. 1,12,000
- Browser is zoomed to 90% so the full dashboard fits without scrolling
- Close all other browser tabs
- Terminal windows hidden

---

## Opening Line (15 seconds)

"Every company here pays for software. Most of them are paying for software
nobody uses. In India alone, mid-size companies waste crores every year on
idle SaaS licenses, tools they forgot to cancel, and software still assigned
to employees who left six months ago. We built Spendix to fix that."

---

## Step 1 — Dashboard (45 seconds)

Point to the Monthly Waste card.

"This company is wasting Rs. 1,12,000 every month. That is Rs. 13 lakh
every year just sitting idle. And that is just what we can see from licenses.
The real number is higher."

Point to the Tools Need Attention card.

"3 of their 8 tools need immediate action. Let me show you exactly what
that means."

---

## Step 2 — Licenses Page (60 seconds)

Click Licenses in the sidebar.

"Here is every tool they pay for, with exactly how many seats are purchased
versus how many people actually logged in in the last 60 days."

Point to the Salesforce row — 12 idle seats, Rs. 50,400 waste.

"Salesforce. 30 seats purchased. Only 18 people have logged in recently.
12 seats completely idle. That is Rs. 50,400 per month going to Salesforce
for nothing."

Click the Salesforce row to expand the idle employee list.

"And here are the exact 12 people. Their names, departments, and the last
time they logged in. The IT manager can send this list to Salesforce today
and downgrade the plan."

---

## Step 3 — Shadow IT (45 seconds)

Click Shadow IT in the sidebar.

"Now here is the problem nobody is talking about. Shadow IT. Tools that
individual teams bought on company cards or expense reports that IT has
no idea about."

Paste a sample invoice text into the input box. Hit Submit.

"We just forwarded an invoice from the expense inbox. Watch what happens."

Wait for Groq to parse it — typically 2 to 3 seconds.

"Groq AI read that invoice and extracted the tool name, the amount, the
seat count, and the renewal date. One click and it is added to the official
stack. This company just discovered Rs. 45,000 per month in tools they
were paying for invisibly."

---

## Step 4 — Renewals (30 seconds)

Click Renewals in the sidebar.

"Salesforce renews in 23 days. Auto-renewal is on. If nobody acts, Rs. 6 lakh
goes out the door for another year of a tool they are 40% underusing.
Spendix sent an email alert 90 days ago, 60 days ago, and again today.
There is no excuse to miss this."

---

## Step 5 — Offboarding (30 seconds)

Click Offboarding in the sidebar.

"This is the one that scares CISOs. Three employees left this company.
They are gone. HR deactivated their accounts. But their Salesforce login,
their Notion seat, their GitHub access — still active. Still billed.
Still a security risk. Spendix flagged all three the moment they were
marked as departed."

Click Resolve on one employee.

"One click. Access revoked, license freed."

---

## Step 6 — Overlaps (30 seconds)

Click Overlaps in the sidebar.

"Last one. This company is paying for Zoom and Google Meet simultaneously.
Both are video conferencing. Combined cost: Rs. 33,000 per month.
Spendix detected the overlap automatically using AI categorization and
is recommending consolidation to one platform."

---

## Closing (30 seconds)

Go back to Dashboard.

"In five minutes we found Rs. 13 lakh in annual waste, three security risks,
two tools heading to auto-renewal, and one category of duplicate spend.
This is one company. There are 63 million SMEs in India.
Zylo charges $2,000 a month for this. We charge Rs. 6,000.
That is Spendix."

---

## Likely Questions and Answers

Q: How do you get the usage data if you cannot connect to Google Workspace?
A: Companies can upload a CSV export from their SSO or manually enter usage data. Google Workspace API integration is in the roadmap and works with one OAuth approval from the company admin.

Q: What stops a company from just doing this in a spreadsheet?
A: A spreadsheet does not parse invoices, does not detect overlaps with AI, does not send renewal alerts automatically, and does not flag offboarding risk in real time. We also update continuously — a spreadsheet is a snapshot.

Q: How is this different from Zluri? They are Indian.
A: Zluri pivoted upmarket. Their minimum contract is for companies above 1,000 employees. We target 100 to 1,000 employees and price at Rs. 3,000 to 12,000 per month. Different customer entirely.

Q: Is the data secure?
A: All data is stored on the company's own database instance. We do not store their employee or financial data on our servers. JWT auth with httpOnly cookies. All queries parameterized.

Q: What is the business model?
A: Rs. 3,000 to 12,000 per month based on company size. Or 20% of first-year savings identified — a company saving Rs. 10 lakh pays us Rs. 2 lakh. The ROI conversation sells itself.
