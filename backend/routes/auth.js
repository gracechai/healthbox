import { Router } from 'express';
import { getAuthUrl, exchangeCode, saveTokens, clearTokens, isConnected } from '../services/gmail.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    connected: isConnected(),
    configured: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
  });
});

router.get('/gmail', (_req, res) => {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    return res.redirect(
      `${process.env.FRONTEND_URL}?auth_error=${encodeURIComponent('Gmail credentials not configured in .env')}`
    );
  }
  res.redirect(getAuthUrl());
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  const front = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (error) return res.redirect(`${front}?auth_error=${encodeURIComponent(error)}`);
  if (!code) return res.redirect(`${front}?auth_error=no_code`);

  try {
    const tokens = await exchangeCode(code);
    saveTokens(tokens);
    res.redirect(`${front}?auth_success=true`);
  } catch (err) {
    res.redirect(`${front}?auth_error=${encodeURIComponent(err.message)}`);
  }
});

router.post('/disconnect', (_req, res) => {
  clearTokens();
  res.json({ success: true });
});

export default router;
