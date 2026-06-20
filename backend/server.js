import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getDb } from './db.js';

import authRoutes        from './routes/auth.js';
import syncRoutes        from './routes/sync.js';
import eventsRoutes      from './routes/events.js';
import peopleRoutes      from './routes/people.js';
import medicationsRoutes from './routes/medications.js';
import emailsRoutes      from './routes/emails.js';
import seedRoutes        from './routes/seed.js';

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Init DB (creates tables + default people)
getDb();

app.use('/auth',        authRoutes);
app.use('/sync',        syncRoutes);
app.use('/events',      eventsRoutes);
app.use('/people',      peopleRoutes);
app.use('/medications', medicationsRoutes);
app.use('/emails',      emailsRoutes);
app.use('/seed',        seedRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🏥  Healthbox backend → http://localhost:${PORT}\n`);
});
