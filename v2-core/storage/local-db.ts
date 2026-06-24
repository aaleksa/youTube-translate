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
      name TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      passwordHash TEXT NOT NULL DEFAULT '',
      emailVerified INTEGER NOT NULL DEFAULT 1,
      resetCode TEXT,
      resetCodeExpiresAt INTEGER,
      googleId TEXT,
      authProvider TEXT NOT NULL DEFAULT 'local'
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(userId);

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      example TEXT NOT NULL DEFAULT '',
      videoId TEXT,
      createdAt INTEGER NOT NULL,
      meta TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(userId);
    CREATE INDEX IF NOT EXISTS idx_flashcards_user_video ON flashcards(userId, videoId);

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      timestamp REAL NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(userId);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_video ON bookmarks(userId, videoId);
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
  migrateFlashcardsFromItems(database);

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
  if (!names.has('name')) {
    db.exec(`ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''`);
  }
  if (!names.has('updatedAt')) {
    db.exec(`ALTER TABLE users ADD COLUMN updatedAt INTEGER`);
    db.exec(`UPDATE users SET updatedAt = createdAt WHERE updatedAt IS NULL`);
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
      ON users(googleId) WHERE googleId IS NOT NULL
  `);
}

function migrateFlashcardsFromItems(db: Database.Database): void {
  const legacyRows = db
    .prepare(
      `SELECT userId, SK, data, createdAt, updatedAt
       FROM items
       WHERE entityType = 'CARD' OR SK LIKE 'CARD#%'`
    )
    .all() as Array<{
    userId: string;
    SK: string;
    data: string;
    createdAt: number;
    updatedAt: number | null;
  }>;

  const insert = db.prepare(
    `INSERT OR IGNORE INTO flashcards (
      id, userId, word, translation, example, videoId, createdAt, meta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const row of legacyRows) {
    const extra = JSON.parse(row.data) as Record<string, unknown>;
    const id = String(extra.id ?? row.SK.replace(/^CARD#/, ''));
    const meta = {
      tags: extra.tags,
      deckIds: extra.deckIds,
      repetitions: extra.repetitions,
      ease: extra.ease,
      interval: extra.interval,
      nextReview: extra.nextReview,
      knownCount: extra.knownCount,
      unknownCount: extra.unknownCount,
      updatedAt: row.updatedAt ?? extra.updatedAt,
    };

    insert.run(
      id,
      row.userId,
      String(extra.word ?? ''),
      String(extra.translation ?? ''),
      String(extra.example ?? ''),
      extra.videoId ? String(extra.videoId) : null,
      row.createdAt,
      JSON.stringify(meta)
    );
  }
}
