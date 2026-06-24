import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { getLocalDbPath } from './config';

let database: Database.Database | null = null;

function ensureSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      PK TEXT NOT NULL,
      SK TEXT NOT NULL,
      entityType TEXT NOT NULL,
      userId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER,
      PRIMARY KEY (PK, SK)
    );

    CREATE INDEX IF NOT EXISTS idx_items_user_sk ON items(userId, SK);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL DEFAULT '',
      emailVerified INTEGER NOT NULL DEFAULT 1,
      resetCode TEXT,
      resetCodeExpiresAt INTEGER,
      googleId TEXT,
      authProvider TEXT NOT NULL DEFAULT 'local',
      createdAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(userId);
  `);
}

export function getLocalDatabase(): Database.Database {
  if (database) return database;

  const dbPath = resolve(process.cwd(), getLocalDbPath());
  mkdirSync(dirname(dbPath), { recursive: true });

  database = new Database(dbPath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');
  ensureSchema(database);
  migrateUsersTable(database);

  return database;
}

function migrateUsersTable(db: Database.Database): void {
  const columns = db
    .prepare(`PRAGMA table_info(users)`)
    .all() as Array<{ name: string }>;
  const names = new Set(columns.map((column) => column.name));

  if (!names.has('googleId')) {
    db.exec(`ALTER TABLE users ADD COLUMN googleId TEXT`);
  }
  if (!names.has('authProvider')) {
    db.exec(
      `ALTER TABLE users ADD COLUMN authProvider TEXT NOT NULL DEFAULT 'local'`
    );
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
      ON users(googleId) WHERE googleId IS NOT NULL
  `);
}
