#!/usr/bin/env node
/**
 * SaaS License Recovery — Claude Hook: PostToolUse
 * Audits files after they are written and warns about convention violations.
 * Advisory only — always exits 0.
 *
 * Location: .claude/hooks/post-tool-use.js
 */

const input = JSON.parse(process.argv[2] || '{}');
const { tool_name, tool_input, tool_output } = input;

const filePath    = tool_input?.path    || '';
const fileContent = tool_input?.content || tool_input?.new_str || '';
const output      = tool_output?.output || '';
const exitCode    = tool_output?.exit_code ?? 0;

const rules = [
  {
    match: () =>
      /server\/routes\//.test(filePath) &&
      !/authMiddleware|verifyToken|requireAuth/.test(fileContent),
    message:
      'WARNING: New route file written without JWT middleware reference. ' +
      'Every protected route must use authMiddleware from server/middleware/auth.js.',
  },
  {
    match: () =>
      /server\/controllers\//.test(filePath) &&
      /SELECT|INSERT|UPDATE|DELETE/.test(fileContent) &&
      /\$\{|`.*\+/.test(fileContent),
    message:
      'WARNING: Possible string-concatenated SQL detected in controller. ' +
      'All queries must use parameterized inputs — use ? placeholders with mysql2.',
  },
  {
    match: () =>
      /client\/src\/(?!services).*\.jsx/.test(filePath) &&
      /fetch\(|axios\./.test(fileContent),
    message:
      'WARNING: Direct fetch or axios call inside a React component. ' +
      'Move all API calls to client/src/services/api.js and import from there.',
  },
  {
    match: () =>
      /client\/src\/.*\.jsx/.test(filePath) &&
      /GROQ_API_KEY|JWT_SECRET|DB_PASSWORD/.test(fileContent),
    message:
      'WARNING: Secret variable name found in a client-side file. ' +
      'These values must never reach the browser — check this immediately.',
  },
  {
    match: () =>
      /server\/.*\.js/.test(filePath) &&
      /new Groq\(|groq\.chat/.test(fileContent) &&
      !/server\/controllers\/invoice/.test(filePath),
    message:
      'WARNING: Groq API call found outside the invoice controller. ' +
      'All Groq calls should go through server/controllers/invoiceController.js.',
  },
  {
    match: () =>
      exitCode !== 0 &&
      /npm run build/.test(tool_input?.command || ''),
    message:
      'WARNING: Frontend build failed. ' +
      'Fix all build errors before considering the session complete.',
  },
];

for (const rule of rules) {
  try {
    if (rule.match()) {
      console.error(rule.message);
    }
  } catch (_) {}
}

process.exit(0);
