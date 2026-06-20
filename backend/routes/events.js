import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

const EVENT_SELECT = `
  SELECT e.*, p.name AS person_name, p.color AS person_color
  FROM events e
  LEFT JOIN people p ON e.person_id = p.id
`;

router.get('/', (req, res) => {
  const db = getDb();
  const { person, type, limit = 100 } = req.query;
  const params = [];
  let where = 'WHERE 1=1';

  if (person) { where += ' AND e.person_id = ?'; params.push(person); }
  if (type)   { where += ' AND e.type = ?';      params.push(type); }

  params.push(parseInt(limit));
  const rows = db.prepare(`${EVENT_SELECT} ${where} ORDER BY e.date DESC, e.created_at DESC LIMIT ?`).all(...params);
  res.json(rows);
});

router.get('/today', (req, res) => {
  const db = getDb();
  const { person } = req.query;
  const today = new Date().toISOString().split('T')[0];
  const in30  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const personClause = person ? ' AND e.person_id = ?' : '';
  const pp = person ? [person] : [];

  const todayEvents = db.prepare(`${EVENT_SELECT} WHERE e.date = ?${personClause} ORDER BY e.created_at DESC`)
    .all(today, ...pp);

  const upcoming = db.prepare(`${EVENT_SELECT} WHERE e.date > ? AND e.date <= ?${personClause} ORDER BY e.date ASC LIMIT 15`)
    .all(today, in30, ...pp);

  const recent = db.prepare(`${EVENT_SELECT} WHERE (e.date < ? OR e.date IS NULL)${personClause} ORDER BY e.date DESC, e.created_at DESC LIMIT 5`)
    .all(today, ...pp);

  res.json({ today: todayEvents, upcoming, recent });
});

router.get('/search', (req, res) => {
  const db = getDb();
  const { q, person } = req.query;
  if (!q || q.trim() === '') return res.json([]);

  const like = `%${q}%`;
  const params = [like, like, like];
  let where = 'WHERE (e.title LIKE ? OR e.provider LIKE ? OR e.notes LIKE ?)';

  if (person) { where += ' AND e.person_id = ?'; params.push(person); }
  params.push(50);

  const rows = db.prepare(`${EVENT_SELECT} ${where} ORDER BY e.date DESC, e.created_at DESC LIMIT ?`).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const event = db.prepare(`${EVENT_SELECT} WHERE e.id = ?`).get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { person_id, type, title, provider, date, notes } = req.body;

  db.prepare(`
    UPDATE events SET
      person_id = COALESCE(?, person_id),
      type      = COALESCE(?, type),
      title     = COALESCE(?, title),
      provider  = COALESCE(?, provider),
      date      = COALESCE(?, date),
      notes     = COALESCE(?, notes)
    WHERE id = ?
  `).run(person_id ?? null, type ?? null, title ?? null, provider ?? null, date ?? null, notes ?? null, req.params.id);

  res.json(db.prepare(`${EVENT_SELECT} WHERE e.id = ?`).get(req.params.id));
});

export default router;
