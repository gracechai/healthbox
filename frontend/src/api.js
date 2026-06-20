const BASE = '/api';

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(body || res.statusText);
  }
  return res.json();
}

export const api = {
  auth: {
    status:     ()     => req('/auth/status'),
    connect:    ()     => { window.location.href = '/api/auth/gmail'; },
    disconnect: ()     => req('/auth/disconnect', { method: 'POST' }),
  },
  sync: {
    run: () => req('/sync', { method: 'POST' }),
  },
  seed: {
    run: () => req('/seed', { method: 'POST' }),
  },
  people: {
    list:   ()           => req('/people'),
    create: (data)       => req('/people', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data)   => req(`/people/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  events: {
    list:   (params = {}) => req(`/events?${new URLSearchParams(params)}`),
    today:  (params = {}) => req(`/events/today?${new URLSearchParams(params)}`),
    search: (q, person)   => req(`/events/search?${new URLSearchParams({ q, ...(person ? { person } : {}) })}`),
    get:    (id)           => req(`/events/${id}`),
    update: (id, data)     => req(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  medications: {
    list:   (params = {}) => req(`/medications?${new URLSearchParams(params)}`),
    update: (id, data)    => req(`/medications/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  emails: {
    get: (id) => req(`/emails/${id}`),
  },
};
