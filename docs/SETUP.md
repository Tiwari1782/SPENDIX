# SETUP.md — Local Development Setup

Follow this exactly. Do not skip steps. Each step depends on the previous one.

---

## Prerequisites

Install these before starting. Check versions with the commands shown.

```bash
node --version     # must be 20 or above
npm --version      # must be 9 or above
mysql --version    # must be 8 or above
git --version      # any recent version
```

If Node is not installed: https://nodejs.org (download the LTS version)
If MySQL is not installed: https://dev.mysql.com/downloads/mysql/

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/spendix.git
cd spendix
```

---

## Step 2 — Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Now open `.env` and fill in these values:

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=spendix

JWT_SECRET=any_long_random_string_minimum_32_characters
JWT_EXPIRES_IN=7d

GROQ_API_KEY=get_this_from_console.groq.com
GROQ_MODEL=llama3-70b-8192

ALERT_EMAIL_FROM=alerts@spendix.in
ALERT_EMAIL_TO=your_email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
```

Getting a Groq API key:
1. Go to console.groq.com
2. Sign up for free
3. Go to API Keys
4. Create a new key and paste it into .env

Getting a Gmail app password (for email alerts):
1. Go to your Google Account settings
2. Search for App Passwords
3. Create one for Mail
4. Paste the 16-character password into SMTP_PASS

---

## Step 3 — Set Up the Database

```bash
# Log into MySQL
mysql -u root -p

# Inside MySQL shell, run:
CREATE DATABASE spendix;
EXIT;

# Back in terminal — run the schema
mysql -u root -p spendix < server/db/schema.sql

# Run the seed data (demo data for development)
mysql -u root -p spendix < server/db/seed.sql
```

Verify it worked:

```bash
mysql -u root -p spendix -e "SELECT COUNT(*) FROM employees;"
# Should return 60
```

---

## Step 4 — Install Dependencies

```bash
# Backend
cd server
npm install
cd ..

# Frontend
cd client
npm install
cd ..
```

---

## Step 5 — Start the Development Servers

Open two terminal windows.

Terminal 1 — Backend:
```bash
cd server
npm run dev
# Should show: Server running on port 5000
```

Terminal 2 — Frontend:
```bash
cd client
npm run dev
# Should show: Local: http://localhost:5173
```

---

## Step 6 — Open the App

Go to: http://localhost:5173

Login with the demo admin account:
- Email: admin@spendix.demo
- Password: spendix123

You should see the Dashboard with demo data loaded.

---

## Step 7 — Verify Everything Works

Check each of these:

```
Dashboard loads with 4 summary cards showing numbers
Licenses page shows the tool table with waste calculations
Shadow IT page shows the invoice paste area
Renewals page shows tools with upcoming renewal dates
Offboarding page shows ex-employees with active licenses
Overlaps page shows tool overlap groups
```

If any page is blank or shows an error, check the backend terminal for error messages.

---

## Common Problems and Fixes

Problem: Cannot connect to MySQL
Fix: Make sure MySQL is running. On Mac: `brew services start mysql`. On Windows: Start MySQL from Services.

Problem: Port 5000 already in use
Fix: Change PORT in .env to 5001, then restart the backend.

Problem: Groq API returning errors
Fix: Check your GROQ_API_KEY in .env. Make sure there are no spaces around the = sign.

Problem: Frontend shows blank page
Fix: Run `cd client && npm run build` to see if there are build errors. Fix them before running dev.

Problem: Seed data not showing
Fix: Run `mysql -u root -p spendix < server/db/seed.sql` again. Check the output for errors.

---

## Switching Branches

```bash
# Always commit or stash your work first
git status

# Switch to a branch
git checkout dev/backend-core
git checkout dev/frontend-core
git checkout dev/frontend-modules

# Pull latest before starting work
git pull origin dev/your-branch
```

---

## Building for Production

```bash
cd client && npm run build
# Output goes to client/dist/
# Serve this folder with Express or any static file server
```
