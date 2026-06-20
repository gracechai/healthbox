import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

router.get('/:id', (req, res) => {
  const email = getDb().prepare(`SELECT * FROM emails WHERE id = ?`).get(req.params.id);
  if (!email) return res.status(404).json({ error: 'Not found' });
  res.json(email);
});

export default router;
