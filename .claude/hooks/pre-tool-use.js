#!/usr/bin/env node
/**
 * SaaS License Recovery — Claude Hook: PreToolUse
 * Blocks dangerous commands and file writes before they execute.
 *
 * Location: .claude/hooks/pre-tool-use.js
 */

const input = JSON.parse(process.argv[2] || '{}');
const { tool_name, tool_input } = input;

const command     = tool_input?.command  || '';
const filePath    = tool_input?.path     || '';
const fileContent = tool_input?.content  || '';
const newStr      = tool_input?.new_str  || '';
const allContent  = fileContent + newStr;

const rules = [
  {
    match: () => /git add .env$|git add .env.local/.test(command),
    block: true,
    message:
      'BLOCKED: Attempted to stage .env file. ' +
      '.env is gitignored — never commit secrets. Use .env.example for key names only.',
  },
  {
    match: () =>
      /GROQ_API_KEY\s*=/.test(allContent) &&
      /client\/src/.test(filePath),
    block: true,
    message:
      'BLOCKED: GROQ_API_KEY found in a client-side file. ' +
      'This key must only exist in server/.env — never in client/src/.',
  },
  {
    match: () =>
      /JWT_SECRET\s*=/.test(allContent) &&
      /client\/src/.test(filePath),
    block: true,
    message:
      'BLOCKED: JWT_SECRET found in a client-side file. ' +
      'This secret must only exist in server/.env — never in client/src/.',
  },
  {
    match: () =>
      /DROP TABLE|DROP DATABASE|TRUNCATE/.test(command) &&
      !/localhost|127\.0\.0\.1/.test(command),
    block: true,
    message:
      'BLOCKED: Destructive database command detected on a non-local target. ' +
      'Only run DROP or TRUNCATE against localhost during development.',
  },
  {
    match: () =>
      /npm install (openai|@anthropic-ai|mongoose|sequelize|prisma)/.test(command),
    block: true,
    message:
      'BLOCKED: Attempted to install a disallowed package. ' +
      'Use groq-sdk for AI, mysql2 for database. No ORM or alternative AI SDK allowed.',
  },
  {
    match: () =>
      /mysql2\.createConnection\(|new Pool\(/.test(allContent) &&
      !/db\/connection\.js/.test(filePath),
    block: true,
    message:
      'BLOCKED: New database connection created outside server/db/connection.js. ' +
      'Import the singleton from server/db/connection.js instead.',
  },
  {
    match: () =>
      /rm -rf/.test(command) &&
      /server|client|\.claude/.test(command),
    block: true,
    message:
      'BLOCKED: rm -rf on a core project directory. ' +
      'This is irreversible — do not delete server/, client/, or .claude/.',
  },
];

let blocked = false;

for (const rule of rules) {
  try {
    if (rule.match()) {
      console.error(rule.message);
      if (rule.block) blocked = true;
    }
  } catch (_) {}
}

process.exit(blocked ? 1 : 0);
