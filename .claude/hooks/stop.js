#!/usr/bin/env node
/**
 * SaaS License Recovery — Claude Hook: Stop
 * Prints a session-end checklist before Claude closes.
 * Advisory only — always exits 0.
 *
 * Location: .claude/hooks/stop.js
 */

console.error(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SESSION END CHECKLIST — SaaS License Recovery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [ ] cd client && npm run build — must complete with zero errors
  [ ] No .env file staged — run: git status and confirm .env is not listed
  [ ] Every new Express route has authMiddleware attached
  [ ] All SQL queries use ? parameterized placeholders — no string concatenation
  [ ] All React API calls go through client/src/services/api.js
  [ ] Groq API calls exist only in server/controllers/invoiceController.js
  [ ] If new env vars added — update .env.example with key name (no value)
  [ ] No console.log left in server/controllers/ files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

process.exit(0);
