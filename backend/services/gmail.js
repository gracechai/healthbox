import { google } from 'googleapis';
import { getDb } from '../db.js';

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}

export function getAuthUrl() {
  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
  });
}

export async function exchangeCode(code) {
  const { tokens } = await createOAuthClient().getToken(code);
  return tokens;
}

export function saveTokens(tokens) {
  getDb()
    .prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('gmail_tokens', ?)`)
    .run(JSON.stringify(tokens));
}

export function loadTokens() {
  const row = getDb()
    .prepare(`SELECT value FROM settings WHERE key = 'gmail_tokens'`)
    .get();
  return row ? JSON.parse(row.value) : null;
}

export function clearTokens() {
  getDb().prepare(`DELETE FROM settings WHERE key = 'gmail_tokens'`).run();
}

export function isConnected() {
  return !!loadTokens();
}

async function getGmailClient() {
  const tokens = loadTokens();
  if (!tokens) throw new Error('Gmail not connected');

  const auth = createOAuthClient();
  auth.setCredentials(tokens);
  auth.on('tokens', (fresh) => saveTokens({ ...tokens, ...fresh }));

  return google.gmail({ version: 'v1', auth });
}

const SEARCH_QUERY = [
  'appointment', '"lab results"', '"test results"', '"blood work"',
  'reminder', 'doctor', 'clinic', 'hospital', 'prescription',
  'medication', 'imaging', 'mri', 'surgery', 'therapy', '"follow-up"',
  '"check-up"', 'wellness', 'dental', 'ophthalmology', 'cardiology',
].join(' OR ');

export async function fetchEmails(maxResults = 100) {
  const gmail = await getGmailClient();

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: SEARCH_QUERY,
    maxResults,
  });

  const messages = listRes.data.messages || [];
  const emails = [];

  for (const msg of messages) {
    const detail = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full',
    });

    const hdrs = detail.data.payload?.headers || [];
    const get = (name) => hdrs.find((h) => h.name === name)?.value || '';
    const { bodyText, bodyHtml } = extractBody(detail.data.payload);

    emails.push({
      gmail_id: msg.id,
      subject:      get('Subject'),
      from_address: get('From'),
      date:         new Date(get('Date') || Date.now()).toISOString(),
      snippet:      detail.data.snippet || '',
      body_text:    bodyText,
      body_html:    bodyHtml,
    });
  }

  return emails;
}

function extractBody(payload) {
  let bodyText = '';
  let bodyHtml = '';
  if (!payload) return { bodyText, bodyHtml };

  if (payload.body?.data) {
    const decoded = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    if (payload.mimeType === 'text/plain') bodyText = decoded;
    if (payload.mimeType === 'text/html')  bodyHtml = decoded;
  }

  for (const part of payload.parts || []) {
    const { bodyText: pt, bodyHtml: ph } = extractBody(part);
    bodyText += pt;
    bodyHtml += ph;
  }

  return { bodyText, bodyHtml };
}
