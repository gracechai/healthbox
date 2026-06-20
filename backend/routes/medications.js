import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { person } = req.query;
  const params = [];
  let where = 'WHERE m.active = 1';

  if (person) { where += ' AND m.person_id = ?'; params.push(person); }

  const rows = db.prepare(`
    SELECT m.*, p.name AS person_name, p.color AS person_color
    FROM medications m
    LEFT JOIN people p ON m.person_id = p.id
    ${where}
    ORDER BY m.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.patch('/:id', (req, res) => {
  const db = getDb();
  const { person_id, active } = req.body;
  db.prepare(`
    UPDATE medications
    SET person_id = COALESCE(?, person_id),
        active    = COALESCE(?, active)
    WHERE id = ?
  `).run(person_id ?? null, active ?? null, req.params.id);
  res.json(db.prepare(`SELECT * FROM medications WHERE id = ?`).get(req.params.id));
});

export default router;
