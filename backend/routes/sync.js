import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';
import { fetchEmails, isConnected } from '../services/gmail.js';
import { extractEventsFromEmail } from '../services/extractor.js';

const router = Router();

router.post('/', async (_req, res) => {
  if (!isConnected()) {
    return res.status(401).json({ error: 'Gmail not connected' });
  }

  const db = getDb();

  try {
    const rawEmails = await fetchEmails(100);

    const insertEmail = db.prepare(`
      INSERT OR IGNORE INTO emails (id, gmail_id, subject, from_address, date, snippet, body_text, body_html)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const checkEmail  = db.prepare(`SELECT id FROM emails WHERE gmail_id = ?`);
    const checkEvents = db.prepare(`SELECT id FROM events WHERE source_email_id = ?`);
    const insertEvent = db.prepare(`
      INSERT INTO events (id, person_id, type, title, provider, date, source_email_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMed = db.prepare(`
      INSERT INTO medications (id, person_id, name, dosage, source_email_id)
      VALUES (?, ?, ?, ?, ?)
    `);

    let newEmails = 0;
    let newEvents = 0;

    const syncAll = db.transaction(() => {
      for (const email of rawEmails) {
        // Skip already-processed emails
        const existing = checkEmail.get(email.gmail_id);
        if (existing) continue;

        const emailId = uuid();
        insertEmail.run(
          emailId, email.gmail_id, email.subject, email.from_address,
          email.date, email.snippet, email.body_text, email.body_html
        );
        newEmails++;

        // Skip extraction if events already exist for this gmail_id via a prior run
        if (existing) continue;

        const { events, medications } = extractEventsFromEmail({ ...email, id: emailId });

        for (const ev of events) {
          insertEvent.run(uuid(), ev.inferred_person_id, ev.type, ev.title, ev.provider, ev.date, emailId);
          newEvents++;
        }
        for (const med of medications) {
          insertMed.run(uuid(), null, med.name, med.dosage, emailId);
        }
      }
    });

    syncAll();

    res.json({ success: true, newEmails, newEvents });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
