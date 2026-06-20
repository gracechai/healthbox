import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = getDb();
  const people = db.prepare(`SELECT * FROM people ORDER BY relationship`).all();

  const withCounts = people.map((p) => {
    const { count } = db.prepare(`SELECT COUNT(*) AS count FROM events WHERE person_id = ?`).get(p.id);
    return { ...p, event_count: count };
  });

  res.json(withCounts);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, relationship, color = '#6366f1' } = req.body;
  if (!name || !relationship) return res.status(400).json({ error: 'name and relationship required' });

  const id = uuid();
  db.prepare(`INSERT INTO people (id, name, relationship, color) VALUES (?, ?, ?, ?)`).run(id, name, relationship, color);
  res.status(201).json(db.prepare(`SELECT * FROM people WHERE id = ?`).get(id));
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { name, color } = req.body;
  db.prepare(`UPDATE people SET name = COALESCE(?, name), color = COALESCE(?, color) WHERE id = ?`)
    .run(name ?? null, color ?? null, req.params.id);
  res.json(db.prepare(`SELECT * FROM people WHERE id = ?`).get(req.params.id));
});

export default router;
