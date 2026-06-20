# HealthBox

Caregiver-first health coordination app that turns Gmail into a structured, searchable health record for families.

## What it does

Connects to Gmail, extracts healthcare-related emails, and organizes them into a timeline of events (appointments, labs, medications, visits) across multiple family members (Mom, Dad, Self). Every event links back to its source email.

**Not** a medical advisor — no diagnosis, interpretation, or health recommendations. Only extracts and organizes what's in the user's emails.

## Stack

- **Backend**: Node.js + Express + SQLite (`better-sqlite3`)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Auth**: Gmail OAuth2 via `googleapis`
- **DB**: `healthbox.db` (auto-created on first run)

## Project structure

```
healthbox/
├── backend/
│   ├── server.js          # Express app, port 3001
│   ├── db.js              # SQLite schema + default people seed
│   ├── routes/
│   │   ├── auth.js        # Gmail OAuth2 connect/disconnect
│   │   ├── sync.js        # Fetch + extract emails from Gmail
│   │   ├── events.js      # CRUD + today/search endpoints
│   │   ├── people.js      # People management
│   │   ├── medications.js # Medications
│   │   ├── emails.js      # Source email retrieval
│   │   └── seed.js        # Demo data (no Gmail required)
│   └── services/
│       ├── gmail.js       # Gmail API wrapper + token storage
│       └── extractor.js   # Regex-only email parser (no AI)
└── frontend/
    ├── index.html
    └── src/
        ├── App.jsx                      # Root state
        ├── api.js                       # API client (proxied via /api)
        └── components/
            ├── Layout.jsx               # 3-panel shell + header
            ├── PeopleSelector.jsx       # Left panel
            ├── TodayView.jsx            # Today + upcoming + medications
            ├── HistoryView.jsx          # Timeline grouped by month
            ├── SearchView.jsx           # Keyword search
            ├── EventCard.jsx            # Reusable event item
            ├── EventDetail.jsx          # Right panel — event + email
            └── EmailPreview.jsx         # Source email display
```

## Running locally

```bash
# Backend
cd backend
cp ../env.example .env   # add GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET
npm install
node server.js           # http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:5173
```

The frontend proxies `/api/*` → `http://localhost:3001` via Vite config.

## Environment variables (backend/.env)

```
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:3001/auth/callback
FRONTEND_URL=http://localhost:5173
PORT=3001
```

## Gmail setup

1. Create a project at Google Cloud Console
2. Enable the Gmail API
3. Create OAuth2 credentials (Web application)
4. Add `http://localhost:3001/auth/callback` as an authorized redirect URI
5. Copy Client ID + Secret into `backend/.env`

## Demo mode

Without Gmail credentials, click **Demo data** in the header to load 8 sample health events across 3 people (Self, Mom, Dad) + 3 medications.

## Data model

| Table | Purpose |
|---|---|
| `people` | Self, Mom, Dad (+ any added) |
| `emails` | Raw email metadata + body text |
| `events` | Extracted health events, linked to email |
| `medications` | Extracted medication mentions |
| `settings` | Gmail OAuth tokens |

## Event types

`appointment` · `lab` · `medication` · `visit` · `unstructured_event`

## Key constraints

- No medical advice, urgency scoring, or health interpretation
- Every event must link to a source email
- Person assignment can be manual if inference fails
- Extraction is pure regex — no AI, no external APIs
