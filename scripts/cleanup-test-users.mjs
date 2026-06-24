#!/usr/bin/env node
import Database from 'better-sqlite3';
import { resolve } from 'node:path';

const dbPath = resolve(
  process.cwd(),
  process.env.LOCAL_DB_PATH ?? 'data/local.db'
);

const KEEP_EMAILS = new Set([
  'aboiko1281@gmail.com',
  'aleksa@gmail.com',
]);

const TEST_EMAIL_PATTERNS = [
  /@test\.local$/i,
  /@example\.com$/i,
  /@local\.test$/i,
  /^test@/i,
  /^test-/i,
  /^(iso|del|bm|bs|qr|st|vp|get|put)-/i,
];

function isTestEmail(email) {
  if (KEEP_EMAILS.has(email)) return false;
  return TEST_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

function deleteUserData(db, userId) {
  const tablesWithUserId = [
    'flashcards',
    'bookmarks',
    'quiz_results',
    'vocabulary_progress',
    'sentence_explanations',
    'selection_analyses',
    'user_settings',
    'user_subscriptions',
    'ai_usage',
    'refresh_tokens',
    'items',
  ];

  for (const table of tablesWithUserId) {
    db.prepare(`DELETE FROM ${table} WHERE userId = ?`).run(userId);
  }

  db.prepare(`DELETE FROM users WHERE id = ?`).run(userId);
}

function main() {
  const db = new Database(dbPath);
  const users = db
    .prepare(`SELECT id, email FROM users ORDER BY email`)
    .all();

  const toDelete = users.filter((user) => isTestEmail(user.email));

  if (toDelete.length === 0) {
    console.log('No test users to delete.');
    return;
  }

  const deleteMany = db.transaction((rows) => {
    for (const user of rows) {
      deleteUserData(db, user.id);
    }
  });

  deleteMany(toDelete);

  console.log(`Deleted ${toDelete.length} test user(s):`);
  for (const user of toDelete) {
    console.log(`  - ${user.email}`);
  }

  const remaining = db
    .prepare(`SELECT email FROM users ORDER BY email`)
    .all()
    .map((row) => row.email);
  console.log(`\nRemaining users (${remaining.length}):`);
  for (const email of remaining) {
    console.log(`  - ${email}`);
  }
}

main();
