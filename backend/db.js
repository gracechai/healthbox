import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'healthbox.db');

let db;

export function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS people (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      relationship TEXT NOT NULL,
      color        TEXT NOT NULL DEFAULT '#6366f1',
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS emails (
      id           TEXT PRIMARY KEY,
      gmail_id     TEXT UNIQUE,
      subject      TEXT,
      from_address TEXT,
      date         TEXT,
      snippet      TEXT,
      body_text    TEXT,
      body_html    TEXT,
      processed    INTEGER DEFAULT 0,
      created_at   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id              TEXT PRIMARY KEY,
      person_id       TEXT,
      type            TEXT NOT NULL,
      title           TEXT NOT NULL,
      provider        TEXT,
      date            TEXT,
      notes           TEXT,
      source_email_id TEXT,
      created_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (person_id)       REFERENCES people(id),
      FOREIGN KEY (source_email_id) REFERENCES emails(id)
    );

    CREATE TABLE IF NOT EXISTS medications (
      id              TEXT PRIMARY KEY,
      person_id       TEXT,
      name            TEXT NOT NULL,
      dosage          TEXT,
      frequency       TEXT,
      source_email_id TEXT,
      active          INTEGER DEFAULT 1,
      created_at      TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (person_id)       REFERENCES people(id),
      FOREIGN KEY (source_email_id) REFERENCES emails(id)
    );

    CREATE INDEX IF NOT EXISTS idx_events_person ON events(person_id);
    CREATE INDEX IF NOT EXISTS idx_events_date   ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_type   ON events(type);
    CREATE INDEX IF NOT EXISTS idx_meds_person   ON medications(person_id);
  `);

  // Seed default people only on first run
  const row = db.prepare('SELECT COUNT(*) AS c FROM people').get();
  if (row.c === 0) {
    const ins = db.prepare(
      'INSERT INTO people (id, name, relationship, color) VALUES (?, ?, ?, ?)'
    );
    ins.run('self', 'Self', 'self',   '#6366f1');
    ins.run('mom',  'Mom',  'mother', '#ec4899');
    ins.run('dad',  'Dad',  'father', '#3b82f6');
  }
}
