#!/usr/bin/env node
/**
 * SaaS License Recovery — Claude Hook: UserPromptSubmit
 * Blocks prompts that could expose secrets or break core security rules before they reach Claude.
 *
 * Location: .claude/hooks/user-prompt-submit.js
 */

const input = JSON.parse(process.argv[2] || '{}');
const prompt = (input.prompt || '').toLowerCase();

const rules = [
  {
    match: () =>
      /groq_api_key|jwt_secret|db_password/.test(prompt) &&
      /log|print|console|expose|send to client|return to frontend/.test(prompt),
    block: true,
    message:
      'BLOCKED: Prompt asks to log or expose a secret variable. ' +
      'GROQ_API_KEY, JWT_SECRET, and DB_PASSWORD must stay server-side only. Never log or return them.',
  },
  {
    match: () =>
      /remove.*auth|bypass.*auth|disable.*jwt|skip.*middleware|delete.*auth/.test(prompt),
    block: true,
    message:
      'BLOCKED: Prompt asks to remove or bypass authentication. ' +
      'JWT middleware in server/middleware/auth.js must stay on all protected routes.',
  },
  {
    match: () =>
      /openai|anthropic sdk|gpt-4|gpt-3|claude api direct/.test(prompt),
    block: false,
    message:
      'WARNING: This project uses Groq API only (llama3-70b-8192). ' +
      'Do not switch to OpenAI or Anthropic SDK — update your request to use Groq.',
  },
  {
    match: () =>
      /mongoose|sequelize|prisma|typeorm/.test(prompt),
    block: false,
    message:
      'WARNING: This project uses raw mysql2 queries only. ' +
      'Do not introduce an ORM — use parameterized mysql2 queries directly.',
  },
  {
    match: () =>
      /fetch\(|axios/.test(prompt) &&
      /component|jsx|tsx/.test(prompt) &&
      !/services\/api/.test(prompt),
    block: false,
    message:
      'WARNING: All API calls from React must go through client/src/services/api.js. ' +
      'Do not fetch directly inside a component.',
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
