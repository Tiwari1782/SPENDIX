#!/usr/bin/env node
/**
 * SaaS License Recovery — Claude Hook: Notification
 * Logs Claude notifications to console for developer visibility.
 * Advisory only — always exits 0.
 *
 * Location: .claude/hooks/notification.js
 */

const input = JSON.parse(process.argv[2] || '{}');
const title   = input.title   || '';
const message = input.message || '';

try {
  if (title || message) {
    console.error(`[Claude] ${title}: ${message}`);
  }
} catch (_) {}

process.exit(0);
